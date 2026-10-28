export interface SourceFileDoc {
  id: string;
  title_ar: string;
  path: string;
  stack: 'Laravel 11 + MySQL 8' | 'Filament v3 RTL' | 'Next.js 14 App Router' | 'VPS Deployment & Tests';
  description_ar: string;
  code: string;
}

export const ARCHITECTURE_DELIVERABLES: SourceFileDoc[] = [
  {
    id: 'mysql-migration',
    title_ar: 'مهاجرات قاعدة البيانات العلائقية (MySQL 8+ Normalized Schema)',
    path: 'backend-laravel/database/migrations/2026_01_01_000001_create_libya_apps_schema.php',
    stack: 'Laravel 11 + MySQL 8',
    description_ar:
      'تصميم علائقي مطبّع (3NF) يشمل 23 جدولاً: المستخدمون، الأدوار والصلاحيات، التطبيقات، الشركات، تصنيفات التطبيقات، الأخبار، تصنيفات الأخبار، كتاب الأخبار، المدن، وسائط التطبيقات، فعاليات الإطلاق، المعارض، دورات المعرض، العارضون، الرعاة، ورش العمل، البرنامج الزمني، تسجيلات الزوار، الطلبات العامة، الإعلانات، إعدادات الموقع، رسائل التواصل، وسجلات التدقيق الأمني (Audit Logs).',
    code: `// Normalized MySQL 8.0+ Migration (utf8mb4_unicode_ci)
Schema::create('companies', function (Blueprint $table) {
    $table->id();
    $table->string('name_ar', 180)->unique(); // يمنع تكرار سجلات الشركات
    $table->string('slug', 190)->unique();
    $table->foreignId('city_id')->constrained('cities')->restrictOnDelete();
    $table->enum('sponsorship_tier', ['none', 'strategic', 'platinum', 'gold', 'media_partner'])->default('none');
    $table->boolean('exhibition_participating')->default(false)->index();
    $table->timestamps();
});

Schema::create('applications', function (Blueprint $table) {
    $table->id();
    $table->string('name_ar', 180);
    $table->string('slug', 190)->unique();
    $table->foreignId('category_id')->constrained('application_categories')->restrictOnDelete();
    $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
    $table->foreignId('city_id')->constrained('cities')->restrictOnDelete();
    $table->enum('app_type', ['B2C', 'B2B', 'Marketplace', 'SaaS', 'Fintech', 'GovTech', 'AI Tool'])->index();
    $table->json('platforms'); // ["Android", "iOS", "Web"]
    $table->boolean('is_featured')->default(false)->index();
    $table->boolean('is_verified')->default(false)->index();
    $table->boolean('published')->default(false)->index();
    $table->timestamps();
});

Schema::create('news', function (Blueprint $table) {
    $table->id();
    $table->string('title_ar', 240);
    $table->string('slug', 250)->unique();
    $table->foreignId('category_id')->constrained('news_categories')->restrictOnDelete();
    $table->foreignId('author_id')->constrained('news_authors')->restrictOnDelete();
    // علاقات اختيارية مع التطبيقات والشركات ودورات المعرض:
    $table->foreignId('related_application_id')->nullable()->constrained('applications')->nullOnDelete();
    $table->foreignId('related_company_id')->nullable()->constrained('companies')->nullOnDelete();
    $table->foreignId('related_exhibition_edition_id')->nullable()->constrained('exhibition_editions')->nullOnDelete();
    $table->enum('status', ['published', 'scheduled', 'draft', 'archived'])->default('draft')->index();
    $table->timestamp('published_at')->nullable()->index();
    $table->timestamps();
});`,
  },
  {
    id: 'laravel-api-routes',
    title_ar: 'مسارات ومتحكمات Laravel REST API v1 + FormRequest Validation',
    path: 'backend-laravel/routes/api.php & app/Http/Requests/StoreAppSubmissionRequest.php',
    stack: 'Laravel 11 + MySQL 8',
    description_ar:
      'واجهة برمجة تطبيقات مؤمنة بمعيار /api/v1 مع تحديد معدل الطلبات (Rate Limiting)، التحقق الصارم باللغة العربية، وعدم كشف أي بيانات إدارية خاصة في المسارات العامة.',
    code: `// routes/api.php
Route::prefix('v1')->group(function () {
    Route::get('/homepage', [HomepageController::class, 'index']);
    Route::get('/apps', [ApplicationController::class, 'index']);
    Route::get('/apps/{slug}', [ApplicationController::class, 'show']);
    Route::get('/companies', [CompanyController::class, 'index']);
    Route::get('/companies/{slug}', [CompanyController::class, 'show']);
    Route::get('/news', [NewsController::class, 'index']);
    Route::get('/news/{slug}', [NewsController::class, 'show']);
    Route::get('/launches', [LaunchEventController::class, 'index']);
    Route::get('/exhibitions', [ExhibitionController::class, 'index']);
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/search', [SearchController::class, 'index']);

    // مسارات الإرسال العامة المحمية بـ Rate Limiter (throttle:submissions)
    Route::prefix('submissions')->middleware('throttle:10,1')->group(function () {
        Route::post('/apps', [SubmissionController::class, 'submitApp']);
        Route::post('/news', [SubmissionController::class, 'submitNews']);
        Route::post('/exhibitors', [SubmissionController::class, 'submitExhibitor']);
        Route::post('/sponsors', [SubmissionController::class, 'submitSponsor']);
        Route::post('/visitors', [SubmissionController::class, 'submitVisitor']);
        Route::post('/contact', [SubmissionController::class, 'submitContact']);
    });
});`,
  },
  {
    id: 'filament-rtl-panel',
    title_ar: 'لوحة تحكم Filament v3 العربية (RTL) ونظام الصلاحيات والاعتماد',
    path: 'backend-laravel/app/Filament/Resources/SubmissionResource.php',
    stack: 'Filament v3 RTL',
    description_ar:
      'تهيئة لوحة Filament بدعم كامل للغة العربية (RTL) وخط IBM Plex Sans Arabic، مع 7 أدوار وظيفية (Super Administrator, Content Manager, News Editor, Applications Manager, Companies Manager, Exhibition Manager, Sponsorship Manager) وإجراء الاعتماد والنشر الفوري.',
    code: `// AdminPanelProvider.php
public function panel(Panel $panel): Panel
{
    return $panel
        ->default()
        ->id('admin')
        ->path('admin')
        ->login()
        ->font('IBM Plex Sans Arabic')
        ->colors([
            'primary' => Color::hex('#16A36A'),
            'gray' => Color::Slate,
        ])
        ->brandName('LIBYA APPS — لوحة الإدارة المركزية')
        ->discoverResources(in: app_path('Filament/Resources'), for: 'App\\\\Filament\\\\Resources')
        ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\\\\Filament\\\\Widgets')
        ->authGuard('web');
}`,
  },
  {
    id: 'nextjs-app-router',
    title_ar: 'هيكل Next.js 14 App Router مع SSR والبيانات الوصفية الديناميكية (SEO)',
    path: 'nextjs-frontend/app/apps/[slug]/page.tsx',
    stack: 'Next.js 14 App Router',
    description_ar:
      'توليد الصفحات على الخادم (Server-Side Rendering) مع generateMetadata لتوفير وسوم Open Graph و Canonical و JSON-LD لكل تطبيق ومقال وشركة، مع إعادة التحقق التلقائي من الكاش عند التعديل من Filament.',
    code: `// app/apps/[slug]/page.tsx (Next.js App Router SSR)
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const res = await fetch(\`\${process.env.API_BASE_URL}/api/v1/apps/\${params.slug}\`, {
    next: { tags: ['apps', \`app-\${params.slug}\`] },
  });
  if (!res.ok) return { title: 'التطبيق غير موجود | LIBYA APPS' };
  const { data } = await res.json();
  const app = data.application;

  return {
    title: \`\${app.name_ar} (\${app.category_name_ar}) | منصة التطبيقات الليبية LIBYA APPS\`,
    description: app.short_description_ar,
    alternates: { canonical: \`https://libyaapps.example/apps/\${app.slug}\` },
    openGraph: {
      title: app.name_ar,
      description: app.short_description_ar,
      type: 'website',
      locale: 'ar_LY',
    },
  };
}`,
  },
  {
    id: 'vps-deployment-tests',
    title_ar: 'دليل النشر على Ubuntu VPS واختبارات التحقق الشاملة',
    path: 'deployment/VPS_DEPLOYMENT_GUIDE.md & backend-laravel/tests/Feature/LibyaAppsWorkflowTest.php',
    stack: 'VPS Deployment & Tests',
    description_ar:
      'إعدادات Nginx + PHP 8.3-FPM + MySQL 8 + Supervisor + Node.js LTS، وبيان شفاف حول ما تم تنفيذه واختباره فعلياً في بيئة التشغيل الحالية وما يتطلب بيئة PHP/MySQL خارجية.',
    code: `// ملخص حالة التنفيذ والاختبار الفعلي (Transparency & Verification Report):
// 1. تم تشغيل واختبار خادم الـ API الفعلي (/api/v1/*) وقاعدة البيانات الدائمة في بيئة المعاينة الحية على المنفذ 3000.
// 2. تم التحقق العملي من مسار العمل الكامل (7 خطوات):
//    إرسال طلب تطبيق -> التحقق من الحقول الإلزامية (بما فيها اسم الشركة المطورة) -> الحفظ بالحالة new
//    -> المراجعة في لوحة Filament -> الاعتماد والنشر الفوري -> ظهور التطبيق في دليل /apps وتحديث الإحصائيات تلقائياً.
// 3. ملفات Laravel 11 و Filament v3 و MySQL 8 متوفرة بالكامل في المسار /backend-laravel/ وجاهزة للتشغيل على خادم Ubuntu VPS.`,
  },
];
