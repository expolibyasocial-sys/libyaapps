<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * LIBYA APPS — Complete Normalized MySQL 8+ Relational Schema
     * Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
     */
    public function up(): void
    {
        // 1. Roles & Permissions (RBAC for 7 Required Filament Roles)
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 64)->unique(); // super_admin, content_manager, news_editor, apps_manager, companies_manager, exhibition_manager, sponsorship_manager
            $table->string('name_ar', 120);
            $table->string('name_en', 120);
            $table->json('permissions');
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('role_id')->nullable()->constrained('roles')->nullOnDelete();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamp('last_login_at')->nullable();
        });

        // 2. Cities
        Schema::create('cities', function (Blueprint $table) {
            $table->id();
            $table->string('name_ar', 100)->unique();
            $table->string('slug', 100)->unique();
            $table->string('region', 100)->nullable();
            $table->timestamps();
        });

        // 3. Application Categories
        Schema::create('application_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name_ar', 120);
            $table->string('slug', 120)->unique();
            $table->text('description_ar')->nullable();
            $table->string('icon_name', 60)->default('Grid');
            $table->unsignedSmallInteger('sort_order')->default(0)->index();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        // 4. Companies & Developers (Normalized — One Company -> Many Applications)
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('name_ar', 180)->unique();
            $table->string('name_en', 180)->nullable();
            $table->string('slug', 190)->unique();
            $table->string('logo_path')->nullable();
            $table->text('description_ar');
            $table->foreignId('city_id')->constrained('cities')->restrictOnDelete();
            $table->string('specialization_ar', 180);
            $table->unsignedSmallInteger('established_year')->nullable();
            $table->string('email', 150)->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('website_url', 255)->nullable();
            $table->json('social_links')->nullable();
            $table->boolean('is_featured')->default(false)->index();
            $table->boolean('is_verified')->default(false)->index();
            $table->boolean('exhibition_participating')->default(false)->index();
            $table->enum('sponsorship_tier', ['none', 'strategic', 'platinum', 'gold', 'media_partner'])->default('none')->index();
            $table->enum('status', ['published', 'draft', 'archived'])->default('published')->index();
            $table->timestamps();
        });

        // 5. Applications
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->string('name_ar', 180);
            $table->string('name_en', 180)->nullable();
            $table->string('slug', 190)->unique();
            $table->foreignId('category_id')->constrained('application_categories')->restrictOnDelete();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('city_id')->constrained('cities')->restrictOnDelete();
            $table->unsignedSmallInteger('launch_year')->index();
            $table->enum('status', ['active', 'beta', 'upcoming', 'archived'])->default('active')->index();
            $table->enum('app_type', ['B2C', 'B2B', 'Marketplace', 'SaaS', 'Fintech', 'GovTech', 'AI Tool'])->default('B2C')->index();
            $table->string('short_description_ar', 320);
            $table->longText('full_description_ar');
            $table->json('main_features_ar');
            $table->text('target_users_ar')->nullable();
            $table->json('platforms'); // ["Android", "iOS", "Web"]
            $table->string('logo_path')->nullable();
            $table->string('website_url', 255)->nullable();
            $table->string('android_url', 255)->nullable();
            $table->string('ios_url', 255)->nullable();
            $table->boolean('is_featured')->default(false)->index();
            $table->boolean('is_verified')->default(false)->index();
            $table->boolean('published')->default(false)->index();
            $table->unsignedBigInteger('views_count')->default(0);
            $table->timestamps();

            $table->index(['published', 'is_featured']);
            $table->index(['category_id', 'published']);
        });

        // 6. Application Media (Screenshots & Intro Videos)
        Schema::create('application_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('applications')->cascadeOnDelete();
            $table->enum('type', ['screenshot', 'video'])->default('screenshot');
            $table->string('file_path')->nullable();
            $table->string('video_url')->nullable();
            $table->string('title_ar', 180)->nullable();
            $table->string('caption_ar', 255)->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        // 7. Exhibitions & Exhibition Editions
        Schema::create('exhibitions', function (Blueprint $table) {
            $table->id();
            $table->string('title_ar', 180);
            $table->string('slug', 180)->unique();
            $table->text('description_ar');
            $table->timestamps();
        });

        Schema::create('exhibition_editions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exhibition_id')->constrained('exhibitions')->cascadeOnDelete();
            $table->string('edition_label_ar', 150);
            $table->string('slug', 180)->unique();
            $table->text('overview_ar');
            $table->string('date_announcement_status_ar', 255);
            $table->string('location_announcement_status_ar', 255);
            $table->boolean('registration_open')->default(true);
            $table->timestamps();
        });

        // 8. News Categories, Authors, and News Articles
        Schema::create('news_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name_ar', 120);
            $table->string('slug', 120)->unique();
            $table->timestamps();
        });

        Schema::create('news_authors', function (Blueprint $table) {
            $table->id();
            $table->string('name_ar', 120);
            $table->string('role_ar', 150);
            $table->text('bio_ar')->nullable();
            $table->string('avatar_path')->nullable();
            $table->timestamps();
        });

        Schema::create('news', function (Blueprint $table) {
            $table->id();
            $table->string('title_ar', 240);
            $table->string('slug', 250)->unique();
            $table->foreignId('category_id')->constrained('news_categories')->restrictOnDelete();
            $table->foreignId('author_id')->constrained('news_authors')->restrictOnDelete();
            $table->foreignId('related_application_id')->nullable()->constrained('applications')->nullOnDelete();
            $table->foreignId('related_company_id')->nullable()->constrained('companies')->nullOnDelete();
            $table->foreignId('related_exhibition_edition_id')->nullable()->constrained('exhibition_editions')->nullOnDelete();
            $table->string('cover_image_path')->nullable();
            $table->unsignedSmallInteger('reading_time_minutes')->default(4);
            $table->text('summary_ar');
            $table->longText('content_ar');
            $table->boolean('is_featured')->default(false)->index();
            $table->boolean('is_ai_spotlight')->default(false)->index();
            $table->enum('status', ['published', 'scheduled', 'draft', 'archived'])->default('draft')->index();
            $table->timestamp('published_at')->nullable()->index();
            $table->unsignedBigInteger('views_count')->default(0);
            $table->timestamps();
        });

        // 9. Launch Events (Launchpad)
        Schema::create('launch_events', function (Blueprint $table) {
            $table->id();
            $table->string('title_ar', 200);
            $table->string('slug', 210)->unique();
            $table->foreignId('application_id')->constrained('applications')->cascadeOnDelete();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->enum('launch_type', ['new_release', 'upcoming_app', 'major_update'])->index();
            $table->date('launch_date')->index();
            $table->string('version_tag', 40)->nullable();
            $table->text('summary_ar');
            $table->json('highlights_ar')->nullable();
            $table->enum('package_tier', ['standard', 'featured_launch', 'national_spotlight'])->default('standard');
            $table->boolean('is_featured')->default(false)->index();
            $table->timestamps();
        });

        // 10. Exhibitors, Sponsors, Workshops, Event Programs, Visitor Registrations
        Schema::create('exhibitors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exhibition_edition_id')->constrained('exhibition_editions')->cascadeOnDelete();
            $table->foreignId('company_id')->nullable()->constrained('companies')->nullOnDelete();
            $table->string('company_name', 180);
            $table->string('application_name', 180);
            $table->string('contact_person', 150);
            $table->string('phone', 50);
            $table->string('email', 150);
            $table->string('participation_type', 120);
            $table->string('requested_space', 120)->nullable();
            $table->text('marketing_requirements')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('approved')->default(false)->index();
            $table->timestamps();
        });

        Schema::create('sponsors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exhibition_edition_id')->nullable()->constrained('exhibition_editions')->nullOnDelete();
            $table->string('company_name', 180);
            $table->string('sector', 150);
            $table->string('contact_person', 150);
            $table->string('phone', 50);
            $table->string('email', 150);
            $table->enum('tier_slug', ['strategic', 'platinum', 'gold', 'media_partner'])->default('gold');
            $table->string('approximate_budget', 120)->nullable();
            $table->string('website_url', 255)->nullable();
            $table->string('logo_path')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('approved')->default(false)->index();
            $table->timestamps();
        });

        Schema::create('workshops', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exhibition_edition_id')->constrained('exhibition_editions')->cascadeOnDelete();
            $table->string('title_ar', 200);
            $table->string('instructor_ar', 150);
            $table->string('target_audience_ar', 180);
            $table->json('topics_ar');
            $table->timestamps();
        });

        Schema::create('event_programs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exhibition_edition_id')->constrained('exhibition_editions')->cascadeOnDelete();
            $table->string('track_ar', 150);
            $table->string('title_ar', 220);
            $table->string('speaker_ar', 180);
            $table->string('session_type_ar', 100);
            $table->string('duration_ar', 60);
            $table->timestamps();
        });

        Schema::create('visitor_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exhibition_edition_id')->constrained('exhibition_editions')->cascadeOnDelete();
            $table->string('reference_number', 40)->unique();
            $table->string('full_name', 150);
            $table->string('organization', 180)->nullable();
            $table->string('email', 150);
            $table->string('phone', 50);
            $table->string('city_name_ar', 100)->nullable();
            $table->timestamps();
        });

        // 11. Unified Submissions Queue (Reviewed via Filament)
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->string('reference_number', 40)->unique();
            $table->enum('submission_type', ['app', 'news', 'exhibitor', 'sponsor', 'visitor', 'contact'])->index();
            $table->string('title_or_name', 220);
            $table->string('company_name', 180); // Required for app, exhibitor, sponsor
            $table->string('contact_name', 150);
            $table->string('contact_email', 150);
            $table->string('contact_phone', 50);
            $table->json('payload');
            $table->enum('status', ['new', 'under_review', 'approved', 'rejected', 'archived'])->default('new')->index();
            $table->text('admin_notes')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });

        // 12. Advertisements, Website Settings, Contact Messages, Audit Logs
        Schema::create('advertisements', function (Blueprint $table) {
            $table->id();
            $table->string('placement', 80)->index();
            $table->string('title_ar', 200);
            $table->string('subtitle_ar', 255)->nullable();
            $table->string('sponsor_name_ar', 150);
            $table->string('cta_label_ar', 80);
            $table->string('cta_route', 255);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        Schema::create('website_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key', 100)->unique();
            $table->json('value');
            $table->timestamps();
        });

        Schema::create('contact_messages', function (Blueprint $table) {
            $table->id();
            $table->string('reference_number', 40)->unique();
            $table->string('subject', 200);
            $table->string('contact_name', 150);
            $table->string('contact_email', 150);
            $table->string('contact_phone', 50)->nullable();
            $table->text('message');
            $table->enum('status', ['new', 'under_review', 'archived'])->default('new');
            $table->timestamps();
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('actor_name', 150);
            $table->string('actor_role_ar', 120);
            $table->string('action_type', 80)->index();
            $table->string('entity_type', 80);
            $table->string('entity_label', 200);
            $table->text('details_ar')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('contact_messages');
        Schema::dropIfExists('website_settings');
        Schema::dropIfExists('advertisements');
        Schema::dropIfExists('submissions');
        Schema::dropIfExists('visitor_registrations');
        Schema::dropIfExists('event_programs');
        Schema::dropIfExists('workshops');
        Schema::dropIfExists('sponsors');
        Schema::dropIfExists('exhibitors');
        Schema::dropIfExists('launch_events');
        Schema::dropIfExists('news');
        Schema::dropIfExists('news_authors');
        Schema::dropIfExists('news_categories');
        Schema::dropIfExists('exhibition_editions');
        Schema::dropIfExists('exhibitions');
        Schema::dropIfExists('application_media');
        Schema::dropIfExists('applications');
        Schema::dropIfExists('companies');
        Schema::dropIfExists('application_categories');
        Schema::dropIfExists('cities');
        Schema::dropIfExists('roles');
    }
};
