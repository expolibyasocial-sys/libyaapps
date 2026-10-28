<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\ApplicationCategory;
use App\Models\City;
use App\Models\Role;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LibyaAppsWorkflowTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Verifies the complete 7-step LIBYA APPS end-to-end workflow:
     * 1. User submits an application (with required company_name).
     * 2. Laravel validates the data.
     * 3. MySQL stores the submission with status 'new'.
     * 4. Administrator reviews the request in Filament.
     * 5. Administrator approves and publishes it (deduplicating company).
     * 6. Next.js /api/v1/apps displays the application in the public directory.
     * 7. Later changes in Filament are reflected immediately on the website.
     */
    public function test_complete_application_submission_and_filament_approval_workflow(): void
    {
        City::create(['name_ar' => 'طرابلس', 'slug' => 'tripoli', 'region' => 'المنطقة الغربية']);
        $category = ApplicationCategory::create([
            'name_ar' => 'الخدمات المالية',
            'slug' => 'fintech',
            'sort_order' => 1,
        ]);

        // Step 1 & 2: Public submission with validation check (company_name required)
        $invalidResponse = $this->postJson('/api/v1/submissions/apps', [
            'app_name_ar' => 'تطبيق تجريبي',
            // missing company_name
        ]);
        $invalidResponse->assertStatus(422);

        $validResponse = $this->postJson('/api/v1/submissions/apps', [
            'app_name_ar' => 'تداول باي — TadawulPay',
            'app_name_en' => 'TadawulPay',
            'company_name' => 'شركة أمان للتقنية المالية',
            'category_id' => $category->id,
            'city_name_ar' => 'طرابلس',
            'app_type' => 'Fintech',
            'platforms' => ['Android', 'iOS'],
            'launch_year' => 2026,
            'short_description_ar' => 'محفظة دفع رقمية ليبية لتسوية المدفوعات التجارية الفورية.',
            'contact_name' => 'م. سالم الكوني',
            'contact_email' => 'salem@amanfintech.ly',
            'contact_phone' => '+218910001122',
            'privacy_consent' => true,
        ]);

        // Step 3: Stored in MySQL with status 'new'
        $validResponse->assertStatus(201)->assertJsonStructure(['reference_number']);
        $this->assertDatabaseHas('submissions', [
            'title_or_name' => 'تداول باي — TadawulPay',
            'company_name' => 'شركة أمان للتقنية المالية',
            'status' => 'new',
        ]);

        // Step 4 & 5: Admin reviews and approves in Filament
        $role = Role::create([
            'slug' => 'super_admin',
            'name_ar' => 'المدير العام للنظام',
            'name_en' => 'Super Administrator',
            'permissions' => ['*'],
        ]);
        $admin = User::factory()->create(['role_id' => $role->id, 'is_active' => true]);
        $submission = Submission::firstOrFail();

        $this->actingAs($admin)
            ->postJson("/api/v1/admin/submissions/{$submission->id}/review", [
                'status' => 'approved',
                'admin_notes' => 'تم التحقق من الشركة والتطبيق واعتمادهما للنشر.',
            ])
            ->assertStatus(200);

        // Step 6: Public directory endpoint returns the newly published application
        $directoryResponse = $this->getJson('/api/v1/apps?q=تداول');
        $directoryResponse->assertStatus(200)
            ->assertJsonFragment(['name_ar' => 'تداول باي — TadawulPay']);

        // Step 7: Later Filament edits reflect immediately
        $publishedApp = Application::where('name_ar', 'تداول باي — TadawulPay')->firstOrFail();
        $this->actingAs($admin)
            ->patchJson("/api/v1/admin/apps/{$publishedApp->id}", [
                'name_ar' => 'تداول باي برو — TadawulPay Pro',
            ])
            ->assertStatus(200);

        $this->getJson("/api/v1/apps/{$publishedApp->slug}")
            ->assertStatus(200)
            ->assertJsonFragment(['name_ar' => 'تداول باي برو — TadawulPay Pro']);
    }
}
