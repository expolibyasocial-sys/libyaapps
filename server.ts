import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createSlug, loadDatabase, saveDatabase } from './src/server/db';
import {
  ApplicationItem,
  ApplicationType,
  PlatformOS,
  SubmissionRecord,
  SubmissionStatus,
} from './src/types/platform';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '5mb' }));

// Simple in-memory rate limiter per IP for public submission routes
const submissionRateWindow = new Map<string, { count: number; resetAt: number }>();
function rateLimitSubmissions(req: Request, res: Response, next: NextFunction) {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'local';
  const now = Date.now();
  const entry = submissionRateWindow.get(ip);
  if (!entry || entry.resetAt < now) {
    submissionRateWindow.set(ip, { count: 1, resetAt: now + 60_000 });
    return next();
  }
  if (entry.count >= 25) {
    return res.status(429).json({
      status: 'error',
      message: 'تم تجاوز الحد المسموح به من الطلبات المتتالية. يرجى الانتظار دقيقة والمحاولة مجدداً.',
    });
  }
  entry.count += 1;
  next();
}

function generateReferenceNumber(prefix = 'LA'): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}-${rand}`;
}

function nowFormatted(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

// ============================================================================
// SEO Routes: /robots.txt and /sitemap.xml
// ============================================================================
app.get('/robots.txt', (_req, res) => {
  res.type('text/plain').send(
    [
      'User-agent: *',
      'Allow: /',
      'Disallow: /admin',
      'Disallow: /api/v1/admin',
      'Sitemap: https://libyaapps.ly/sitemap.xml',
    ].join('\n')
  );
});

app.get('/sitemap.xml', (_req, res) => {
  const db = loadDatabase();
  const baseUrl = process.env.APP_URL || 'https://libyaapps.ly';
  const staticUrls = ['/', '/apps', '/news', '/companies', '/launchpad', '/expo', '/about', '/contact', '/submit'];

  const xmlItems = [
    ...staticUrls.map(
      (u) => `<url><loc>${baseUrl}${u}</loc><changefreq>daily</changefreq><priority>0.9</priority></url>`
    ),
    ...db.applications
      .filter((a) => a.published)
      .map(
        (a) =>
          `<url><loc>${baseUrl}/apps/${a.slug}</loc><lastmod>${a.updated_at}</lastmod><priority>0.8</priority></url>`
      ),
    ...db.companies
      .filter((c) => c.status === 'published')
      .map((c) => `<url><loc>${baseUrl}/companies/${c.slug}</loc><priority>0.8</priority></url>`),
    ...db.news
      .filter((n) => n.status === 'published')
      .map(
        (n) =>
          `<url><loc>${baseUrl}/news/${n.slug}</loc><lastmod>${n.published_at}</lastmod><priority>0.7</priority></url>`
      ),
  ];

  res
    .type('application/xml')
    .send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlItems.join(
        '\n'
      )}\n</urlset>`
    );
});

// ============================================================================
// Public API v1 Routes (/api/v1/*)
// ============================================================================

app.get('/api/v1/homepage', (_req, res) => {
  const db = loadDatabase();
  const publishedApps = db.applications.filter((a) => a.published);
  const publishedCompanies = db.companies.filter((c) => c.status === 'published');
  const publishedNews = db.news.filter((n) => n.status === 'published');

  const categoriesWithCounts = db.application_categories
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((cat) => ({
      ...cat,
      apps_count: publishedApps.filter((a) => a.category_id === cat.id).length,
    }));

  res.json({
    status: 'success',
    data: {
      settings: db.website_settings,
      statistics: {
        registered_applications: publishedApps.length,
        technology_companies: publishedCompanies.length,
        published_news_articles: publishedNews.length,
        application_categories: db.application_categories.length,
      },
      featured_applications: publishedApps.filter((a) => a.is_featured),
      categories: categoriesWithCounts,
      featured_news: publishedNews.filter((n) => n.is_featured).slice(0, 2),
      recent_news: publishedNews.slice(0, 5),
      ai_news: publishedNews.filter((n) => n.is_ai_spotlight || n.category_slug === 'artificial-intelligence'),
      ai_applications: publishedApps.filter((a) => a.category_slug === 'artificial-intelligence' || a.app_type === 'AI Tool'),
      featured_companies: publishedCompanies.filter((c) => c.is_featured),
      launchpad_events: db.launch_events,
      exhibition: db.exhibition_editions[0],
      sponsors: db.sponsors.filter((s) => s.approved),
      banners: db.advertisements.filter((b) => b.is_active),
    },
  });
});

app.get('/api/v1/categories', (_req, res) => {
  const db = loadDatabase();
  const publishedApps = db.applications.filter((a) => a.published);
  const appCategories = db.application_categories.map((cat) => ({
    ...cat,
    apps_count: publishedApps.filter((a) => a.category_id === cat.id).length,
  }));

  res.json({
    status: 'success',
    data: {
      application_categories: appCategories,
      news_categories: db.news_categories,
      cities: db.cities,
    },
  });
});

app.get('/api/v1/apps', (req, res) => {
  const db = loadDatabase();
  const {
    q = '',
    category = '',
    city = '',
    platform = '',
    app_type = '',
    status = '',
    featured = '',
    verified = '',
    sort = 'featured',
    page = '1',
    per_page = '12',
  } = req.query as Record<string, string>;

  let items = db.applications.filter((a) => a.published);

  if (q.trim()) {
    const query = q.trim().toLowerCase();
    items = items.filter(
      (a) =>
        a.name_ar.toLowerCase().includes(query) ||
        a.name_en.toLowerCase().includes(query) ||
        a.short_description_ar.toLowerCase().includes(query) ||
        a.company_name_ar.toLowerCase().includes(query)
    );
  }

  if (category) {
    items = items.filter((a) => a.category_slug === category || String(a.category_id) === category);
  }

  if (city) {
    items = items.filter((a) => a.city_name_ar === city || String(a.city_id) === city);
  }

  if (platform) {
    items = items.filter((a) => a.platforms.includes(platform as PlatformOS));
  }

  if (app_type) {
    items = items.filter((a) => a.app_type === app_type);
  }

  if (status) {
    items = items.filter((a) => a.status === status);
  }

  if (featured === 'true') {
    items = items.filter((a) => a.is_featured);
  }

  if (verified === 'true') {
    items = items.filter((a) => a.is_verified);
  }

  if (sort === 'newest') {
    items.sort((a, b) => b.launch_year - a.launch_year || b.id - a.id);
  } else if (sort === 'popular') {
    items.sort((a, b) => b.views_count - a.views_count);
  } else if (sort === 'alphabetical') {
    items.sort((a, b) => a.name_ar.localeCompare(b.name_ar, 'ar'));
  } else {
    items.sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || b.views_count - a.views_count);
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const perPageNum = Math.max(1, Math.min(50, parseInt(per_page, 10) || 12));
  const total = items.length;
  const paginated = items.slice((pageNum - 1) * perPageNum, pageNum * perPageNum);

  res.json({
    status: 'success',
    data: paginated,
    meta: {
      current_page: pageNum,
      per_page: perPageNum,
      total,
      last_page: Math.max(1, Math.ceil(total / perPageNum)),
    },
  });
});

app.get('/api/v1/apps/:slug', (req, res) => {
  const db = loadDatabase();
  const appItem = db.applications.find((a) => a.slug === req.params.slug && a.published);
  if (!appItem) {
    return res.status(404).json({
      status: 'error',
      message: 'التطبيق المطلوب غير موجود في الدليل العام.',
    });
  }

  const company = db.companies.find((c) => c.id === appItem.company_id) || null;
  const relatedNews = db.news.filter(
    (n) =>
      n.status === 'published' &&
      (n.related_application_id === appItem.id || n.related_company_id === appItem.company_id)
  );
  const similarApps = db.applications
    .filter((a) => a.published && a.id !== appItem.id && a.category_id === appItem.category_id)
    .slice(0, 3);

  res.json({
    status: 'success',
    data: {
      application: appItem,
      company,
      related_news: relatedNews,
      similar_applications: similarApps,
    },
  });
});

app.get('/api/v1/companies', (req, res) => {
  const db = loadDatabase();
  const { q = '', city = '', featured = '' } = req.query as Record<string, string>;

  let companies = db.companies.filter((c) => c.status === 'published');
  if (q.trim()) {
    const query = q.trim().toLowerCase();
    companies = companies.filter(
      (c) =>
        c.name_ar.toLowerCase().includes(query) ||
        c.name_en.toLowerCase().includes(query) ||
        c.specialization_ar.toLowerCase().includes(query)
    );
  }
  if (city) {
    companies = companies.filter((c) => c.city_name_ar === city || String(c.city_id) === city);
  }
  if (featured === 'true') {
    companies = companies.filter((c) => c.is_featured);
  }

  const enriched = companies.map((company) => ({
    ...company,
    applications_count: db.applications.filter((a) => a.published && a.company_id === company.id).length,
    applications: db.applications.filter((a) => a.published && a.company_id === company.id),
  }));

  res.json({
    status: 'success',
    data: enriched,
  });
});

app.get('/api/v1/companies/:slug', (req, res) => {
  const db = loadDatabase();
  const company = db.companies.find((c) => c.slug === req.params.slug && c.status === 'published');
  if (!company) {
    return res.status(404).json({
      status: 'error',
      message: 'ملف الشركة غير موجود.',
    });
  }

  const companyApps = db.applications.filter((a) => a.published && a.company_id === company.id);
  const relatedNews = db.news.filter(
    (n) => n.status === 'published' && n.related_company_id === company.id
  );

  res.json({
    status: 'success',
    data: {
      company,
      applications: companyApps,
      related_news: relatedNews,
    },
  });
});

app.get('/api/v1/news', (req, res) => {
  const db = loadDatabase();
  const { q = '', category = '', ai_only = '' } = req.query as Record<string, string>;

  let articles = db.news.filter((n) => n.status === 'published');

  if (q.trim()) {
    const query = q.trim().toLowerCase();
    articles = articles.filter(
      (n) =>
        n.title_ar.toLowerCase().includes(query) ||
        n.summary_ar.toLowerCase().includes(query) ||
        n.category_name_ar.toLowerCase().includes(query)
    );
  }

  if (category) {
    articles = articles.filter((n) => n.category_slug === category || String(n.category_id) === category);
  }

  if (ai_only === 'true') {
    articles = articles.filter((n) => n.is_ai_spotlight || n.category_slug === 'artificial-intelligence');
  }

  const mostRead = db.news
    .filter((n) => n.status === 'published')
    .slice()
    .sort((a, b) => b.views_count - a.views_count)
    .slice(0, 4);

  res.json({
    status: 'success',
    data: {
      articles,
      most_read: mostRead,
      categories: db.news_categories,
    },
  });
});

app.get('/api/v1/news/:slug', (req, res) => {
  const db = loadDatabase();
  const article = db.news.find((n) => n.slug === req.params.slug && n.status === 'published');
  if (!article) {
    return res.status(404).json({
      status: 'error',
      message: 'المقال الإخباري غير موجود.',
    });
  }

  const relatedApplication = article.related_application_id
    ? db.applications.find((a) => a.id === article.related_application_id) || null
    : null;
  const relatedCompany = article.related_company_id
    ? db.companies.find((c) => c.id === article.related_company_id) || null
    : null;
  const relatedArticles = db.news
    .filter((n) => n.status === 'published' && n.id !== article.id)
    .slice(0, 3);

  res.json({
    status: 'success',
    data: {
      article,
      related_application: relatedApplication,
      related_company: relatedCompany,
      related_articles: relatedArticles,
    },
  });
});

app.get('/api/v1/launches', (_req, res) => {
  const db = loadDatabase();
  const enriched = db.launch_events.map((launch) => ({
    ...launch,
    application: db.applications.find((a) => a.id === launch.application_id) || null,
    company: db.companies.find((c) => c.id === launch.company_id) || null,
    related_news: db.news.filter(
      (n) => n.status === 'published' && n.related_application_id === launch.application_id
    ),
  }));

  res.json({
    status: 'success',
    data: enriched,
  });
});

app.get('/api/v1/exhibitions', (_req, res) => {
  const db = loadDatabase();
  const edition = db.exhibition_editions[0];
  const expoNews = db.news.filter(
    (n) => n.status === 'published' && (n.category_slug === 'expo-news' || n.related_exhibition_edition_id === edition.id)
  );

  res.json({
    status: 'success',
    data: {
      edition,
      exhibitors: db.exhibitors.filter((e) => e.approved),
      sponsors: db.sponsors.filter((s) => s.approved),
      news: expoNews,
    },
  });
});

app.get('/api/v1/search', (req, res) => {
  const db = loadDatabase();
  const q = String(req.query.q || '').trim().toLowerCase();
  if (!q) {
    return res.json({
      status: 'success',
      data: { applications: [], companies: [], news: [], launches: [] },
    });
  }

  const applications = db.applications.filter(
    (a) =>
      a.published &&
      (a.name_ar.toLowerCase().includes(q) ||
        a.name_en.toLowerCase().includes(q) ||
        a.short_description_ar.toLowerCase().includes(q) ||
        a.category_name_ar.toLowerCase().includes(q))
  );

  const companies = db.companies.filter(
    (c) =>
      c.status === 'published' &&
      (c.name_ar.toLowerCase().includes(q) ||
        c.name_en.toLowerCase().includes(q) ||
        c.specialization_ar.toLowerCase().includes(q))
  );

  const news = db.news.filter(
    (n) =>
      n.status === 'published' &&
      (n.title_ar.toLowerCase().includes(q) || n.summary_ar.toLowerCase().includes(q))
  );

  const launches = db.launch_events.filter(
    (l) => l.title_ar.toLowerCase().includes(q) || l.summary_ar.toLowerCase().includes(q)
  );

  res.json({
    status: 'success',
    data: { applications, companies, news, launches },
  });
});

// ============================================================================
// Public Submission Routes (/api/v1/submissions/*)
// ============================================================================

app.post('/api/v1/submissions/apps', rateLimitSubmissions, (req, res) => {
  const {
    app_name_ar,
    app_name_en,
    company_name,
    category_id,
    city_name_ar,
    app_type,
    platforms,
    launch_year,
    short_description_ar,
    full_description_ar,
    website_url,
    android_url,
    ios_url,
    logo_url,
    icon_name,
    logo_color,
    logo_monogram,
    contact_name,
    contact_email,
    contact_phone,
    privacy_consent,
  } = req.body || {};

  const errors: Record<string, string> = {};
  if (!app_name_ar || String(app_name_ar).trim().length < 2) {
    errors.app_name_ar = 'يرجى إدخال اسم التطبيق باللغة العربية.';
  }
  if (!company_name || String(company_name).trim().length < 2) {
    errors.company_name = 'اسم الشركة المطورة للتطبيق حقل إلزامي.';
  }
  if (!category_id) {
    errors.category_id = 'يرجى اختيار تصنيف التطبيق.';
  }
  if (!short_description_ar || String(short_description_ar).trim().length < 15) {
    errors.short_description_ar = 'يرجى كتابة وصف مختصر للتطبيق لا يقل عن 15 حرفاً.';
  }
  if (!contact_name || String(contact_name).trim().length < 2) {
    errors.contact_name = 'يرجى إدخال اسم مسؤول التواصل.';
  }
  if (!contact_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(contact_email))) {
    errors.contact_email = 'يرجى إدخال بريد إلكتروني صحيح.';
  }
  if (!contact_phone || String(contact_phone).trim().length < 7) {
    errors.contact_phone = 'يرجى إدخال رقم هاتف للتواصل.';
  }
  if (!privacy_consent) {
    errors.privacy_consent = 'يجب الموافقة على سياسة الخصوصية وشروط النشر.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      status: 'validation_error',
      message: 'يرجى مراجعة الحقول المطلوبة وتصحيح الأخطاء.',
      errors,
    });
  }

  const db = loadDatabase();
  const categoryObj = db.application_categories.find((c) => c.id === Number(category_id));
  const refNumber = generateReferenceNumber('LA-APP');

  const newSub: SubmissionRecord = {
    id: db.submissions.length ? Math.max(...db.submissions.map((s) => s.id)) + 1 : 1,
    reference_number: refNumber,
    submission_type: 'app',
    submission_type_label_ar: 'طلب إضافة تطبيق',
    title_or_name: String(app_name_ar).trim(),
    company_name: String(company_name).trim(),
    contact_name: String(contact_name).trim(),
    contact_email: String(contact_email).trim(),
    contact_phone: String(contact_phone).trim(),
    city_name_ar: city_name_ar || 'طرابلس',
    payload: {
      app_name_en: app_name_en || app_name_ar,
      category_id: Number(category_id),
      category_name: categoryObj?.slug
        ? categoryObj.slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
        : 'Digital Services',
      app_type: app_type || 'B2C',
      platforms: Array.isArray(platforms) && platforms.length ? platforms : ['Android', 'iOS'],
      launch_year: Number(launch_year) || new Date().getFullYear(),
      short_description: short_description_ar,
      full_description: full_description_ar || short_description_ar,
      website_url: website_url || '',
      android_url: android_url || '',
      ios_url: ios_url || '',
      logo_url: logo_url || '',
    },
    status: 'new',
    created_at: nowFormatted(),
  };

  db.submissions.unshift(newSub);
  saveDatabase(db);

  res.status(201).json({
    status: 'success',
    message: 'تم استلام طلب تسجيل التطبيق بنجاح، وسيتم مراجعته من قبل إدارة المنصة عبر لوحة Filament.',
    reference_number: refNumber,
    data: newSub,
  });
});

app.post('/api/v1/submissions/news', rateLimitSubmissions, (req, res) => {
  const {
    title_ar,
    category_id,
    company_name,
    summary_ar,
    content_ar,
    contact_name,
    contact_email,
    contact_phone,
    privacy_consent,
  } = req.body || {};

  const errors: Record<string, string> = {};
  if (!title_ar || String(title_ar).trim().length < 5) {
    errors.title_ar = 'يرجى إدخال عنوان الخبر التقني.';
  }
  if (!summary_ar || String(summary_ar).trim().length < 15) {
    errors.summary_ar = 'يرجى إدخال ملخص واضح للخبر.';
  }
  if (!contact_name) errors.contact_name = 'يرجى إدخال اسم المرسل أو المحرر.';
  if (!contact_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(contact_email))) {
    errors.contact_email = 'يرجى إدخال بريد إلكتروني صحيح.';
  }
  if (!privacy_consent) {
    errors.privacy_consent = 'يجب الموافقة على سياسة النشر والتحرير.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      status: 'validation_error',
      message: 'يرجى استكمال الحقول المطلوبة.',
      errors,
    });
  }

  const db = loadDatabase();
  const refNumber = generateReferenceNumber('LA-NWS');
  const newSub: SubmissionRecord = {
    id: db.submissions.length ? Math.max(...db.submissions.map((s) => s.id)) + 1 : 1,
    reference_number: refNumber,
    submission_type: 'news',
    submission_type_label_ar: 'إرسال خبر أو بيان تقني',
    title_or_name: String(title_ar).trim(),
    company_name: String(company_name || 'جهة تقنية').trim(),
    contact_name: String(contact_name).trim(),
    contact_email: String(contact_email).trim(),
    contact_phone: String(contact_phone || 'غير مرفق').trim(),
    payload: {
      category_id: Number(category_id) || 1,
      summary_ar,
      content_ar: content_ar || summary_ar,
    },
    status: 'new',
    created_at: nowFormatted(),
  };

  db.submissions.unshift(newSub);
  saveDatabase(db);

  res.status(201).json({
    status: 'success',
    message: 'تم إرسال المادة الإخبارية إلى القسم التحريري للمراجعة.',
    reference_number: refNumber,
    data: newSub,
  });
});

app.post('/api/v1/submissions/exhibitors', rateLimitSubmissions, (req, res) => {
  const {
    company_name,
    application_name,
    contact_name,
    contact_phone,
    contact_email,
    participation_type,
    requested_space,
    marketing_requirements,
    notes,
    privacy_consent,
  } = req.body || {};

  const errors: Record<string, string> = {};
  if (!company_name) errors.company_name = 'يرجى إدخال اسم الشركة العارضة.';
  if (!application_name) errors.application_name = 'يرجى إدخال اسم التطبيق أو المنتج التقني.';
  if (!contact_name) errors.contact_name = 'يرجى إدخال اسم مسؤول التواصل.';
  if (!contact_phone) errors.contact_phone = 'يرجى إدخال رقم الهاتف.';
  if (!contact_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(contact_email))) {
    errors.contact_email = 'يرجى إدخال بريد إلكتروني صحيح.';
  }
  if (!privacy_consent) errors.privacy_consent = 'يجب الموافقة على شروط المشاركة في المعرض.';

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      status: 'validation_error',
      message: 'يرجى التحقق من بيانات تسجيل العارض.',
      errors,
    });
  }

  const db = loadDatabase();
  const refNumber = generateReferenceNumber('LA-EXP');
  const newSub: SubmissionRecord = {
    id: db.submissions.length ? Math.max(...db.submissions.map((s) => s.id)) + 1 : 1,
    reference_number: refNumber,
    submission_type: 'exhibitor',
    submission_type_label_ar: 'تسجيل عارض في المعرض',
    title_or_name: `جناح ${application_name}`,
    company_name: String(company_name).trim(),
    contact_name: String(contact_name).trim(),
    contact_email: String(contact_email).trim(),
    contact_phone: String(contact_phone).trim(),
    payload: {
      application_name,
      participation_type: participation_type || 'جناح عارض قياسي',
      requested_space: requested_space || '12 متر مربع',
      marketing_requirements: marketing_requirements || '',
      notes: notes || '',
    },
    status: 'new',
    created_at: nowFormatted(),
  };

  db.submissions.unshift(newSub);
  saveDatabase(db);

  res.status(201).json({
    status: 'success',
    message: 'تم تسجيل طلب المشاركة كعارض في معرض ليبيا للتطبيقات بنجاح.',
    reference_number: refNumber,
    data: newSub,
  });
});

app.post('/api/v1/submissions/sponsors', rateLimitSubmissions, (req, res) => {
  const {
    company_name,
    sector,
    contact_name,
    contact_phone,
    contact_email,
    sponsorship_type,
    approximate_budget,
    notes,
    privacy_consent,
  } = req.body || {};

  const errors: Record<string, string> = {};
  if (!company_name) errors.company_name = 'يرجى إدخال اسم المؤسسة أو الشركة الراعية.';
  if (!sector) errors.sector = 'يرجى تحديد قطاع العمل.';
  if (!contact_name) errors.contact_name = 'يرجى إدخال اسم الشخص المسؤول.';
  if (!contact_phone) errors.contact_phone = 'يرجى إدخال رقم الهاتف.';
  if (!contact_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(contact_email))) {
    errors.contact_email = 'يرجى إدخال بريد إلكتروني صحيح.';
  }
  if (!privacy_consent) errors.privacy_consent = 'يجب الموافقة على سياسة الخصوصية.';

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      status: 'validation_error',
      message: 'يرجى مراجعة بيانات طلب الرعاية.',
      errors,
    });
  }

  const db = loadDatabase();
  const refNumber = generateReferenceNumber('LA-SPN');
  const newSub: SubmissionRecord = {
    id: db.submissions.length ? Math.max(...db.submissions.map((s) => s.id)) + 1 : 1,
    reference_number: refNumber,
    submission_type: 'sponsor',
    submission_type_label_ar: 'طلب رعاية رسمية',
    title_or_name: `رعاية (${sponsorship_type || 'رسمية'}) — ${company_name}`,
    company_name: String(company_name).trim(),
    contact_name: String(contact_name).trim(),
    contact_email: String(contact_email).trim(),
    contact_phone: String(contact_phone).trim(),
    payload: {
      sector,
      sponsorship_type: sponsorship_type || 'الراعي الذهبي',
      approximate_budget: approximate_budget || 'غير محدد',
      notes: notes || '',
    },
    status: 'new',
    created_at: nowFormatted(),
  };

  db.submissions.unshift(newSub);
  saveDatabase(db);

  res.status(201).json({
    status: 'success',
    message: 'تم استلام طلب الرعاية الرسمية، وسيتواصل معكم مدير الرعايات والشراكات.',
    reference_number: refNumber,
    data: newSub,
  });
});

app.post('/api/v1/submissions/visitors', rateLimitSubmissions, (req, res) => {
  const { full_name, organization, role_title, email, phone, city_name_ar, interests, privacy_consent } =
    req.body || {};

  const errors: Record<string, string> = {};
  if (!full_name) errors.full_name = 'يرجى إدخال الاسم الكامل.';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
    errors.email = 'يرجى إدخال بريد إلكتروني صحيح.';
  }
  if (!phone) errors.phone = 'يرجى إدخال رقم الهاتف.';
  if (!privacy_consent) errors.privacy_consent = 'يرجى الموافقة على سياسة الخصوصية.';

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      status: 'validation_error',
      message: 'يرجى استكمال بيانات تسجيل الزائر.',
      errors,
    });
  }

  const db = loadDatabase();
  const refNumber = generateReferenceNumber('LA-VIS');
  const newSub: SubmissionRecord = {
    id: db.submissions.length ? Math.max(...db.submissions.map((s) => s.id)) + 1 : 1,
    reference_number: refNumber,
    submission_type: 'visitor',
    submission_type_label_ar: 'تسجيل زائر للمعرض',
    title_or_name: `بطاقة زائر — ${full_name}`,
    company_name: String(organization || 'زائر مستقل').trim(),
    contact_name: String(full_name).trim(),
    contact_email: String(email).trim(),
    contact_phone: String(phone).trim(),
    city_name_ar: city_name_ar || 'طرابلس',
    payload: {
      role_title: role_title || 'مهتم بالتقنية',
      interests: interests || 'المعرض العام ومنصة الإطلاق',
    },
    status: 'new',
    created_at: nowFormatted(),
  };

  db.submissions.unshift(newSub);
  saveDatabase(db);

  res.status(201).json({
    status: 'success',
    message: 'تم تسجيلكم في قائمة زوار معرض ليبيا للتطبيقات بنجاح.',
    reference_number: refNumber,
    data: newSub,
  });
});

app.post('/api/v1/submissions/contact', rateLimitSubmissions, (req, res) => {
  const { subject, organization, contact_name, contact_email, contact_phone, message, privacy_consent } =
    req.body || {};

  const errors: Record<string, string> = {};
  if (!subject) errors.subject = 'يرجى تحديد موضوع الرسالة.';
  if (!contact_name) errors.contact_name = 'يرجى إدخال الاسم.';
  if (!contact_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(contact_email))) {
    errors.contact_email = 'يرجى إدخال بريد إلكتروني صحيح.';
  }
  if (!message || String(message).trim().length < 10) {
    errors.message = 'يرجى كتابة نص الرسالة بشكل واضح.';
  }
  if (!privacy_consent) errors.privacy_consent = 'يرجى الموافقة على سياسة الخصوصية.';

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      status: 'validation_error',
      message: 'يرجى مراجعة الحقول المطلوبة.',
      errors,
    });
  }

  const db = loadDatabase();
  const refNumber = generateReferenceNumber('LA-MSG');
  const newSub: SubmissionRecord = {
    id: db.submissions.length ? Math.max(...db.submissions.map((s) => s.id)) + 1 : 1,
    reference_number: refNumber,
    submission_type: 'contact',
    submission_type_label_ar: 'رسالة تواصل مباشر',
    title_or_name: String(subject).trim(),
    company_name: String(organization || 'مراسلة عامة').trim(),
    contact_name: String(contact_name).trim(),
    contact_email: String(contact_email).trim(),
    contact_phone: String(contact_phone || '').trim(),
    payload: { message },
    status: 'new',
    created_at: nowFormatted(),
  };

  db.submissions.unshift(newSub);
  saveDatabase(db);

  res.status(201).json({
    status: 'success',
    message: 'تم استلام رسالتكم بنجاح، وسيتواصل معكم الفريق المختص قريباً.',
    reference_number: refNumber,
    data: newSub,
  });
});

// ============================================================================
// Filament Administration API Routes (/api/v1/admin/*)
// ============================================================================

app.get('/api/v1/admin/overview', (_req, res) => {
  const db = loadDatabase();
  res.json({
    status: 'success',
    data: {
      metrics: {
        total_applications: db.applications.length,
        published_applications: db.applications.filter((a) => a.published).length,
        pending_submissions: db.submissions.filter(
          (s) => s.status === 'new' || s.status === 'under_review'
        ).length,
        published_news: db.news.filter((n) => n.status === 'published').length,
        registered_companies: db.companies.length,
        exhibition_requests: db.submissions.filter(
          (s) => s.submission_type === 'exhibitor' || s.submission_type === 'visitor'
        ).length,
        sponsorship_requests: db.submissions.filter((s) => s.submission_type === 'sponsor').length,
      },
      roles: db.roles,
      users: db.users,
      applications: db.applications,
      companies: db.companies,
      news: db.news,
      launches: db.launch_events,
      submissions: db.submissions,
      exhibitors: db.exhibitors,
      sponsors: db.sponsors,
      advertisements: db.advertisements,
      website_settings: db.website_settings,
      audit_logs: db.audit_logs,
      categories: db.application_categories,
      news_categories: db.news_categories,
      cities: db.cities,
    },
  });
});

// Review, Approve & Publish Submission Workflow
app.post('/api/v1/admin/submissions/:id/review', (req, res) => {
  const db = loadDatabase();
  const subId = Number(req.params.id);
  const { status, admin_notes, actor_name = 'م. عبدالرحمن السنوسي', actor_role_ar = 'المدير العام للنظام' } =
    req.body || {};

  const submission = db.submissions.find((s) => s.id === subId);
  if (!submission) {
    return res.status(404).json({ status: 'error', message: 'الطلب غير موجود.' });
  }

  const prevStatus = submission.status;
  submission.status = (status as SubmissionStatus) || submission.status;
  if (typeof admin_notes === 'string') {
    submission.admin_notes = admin_notes;
  }
  submission.reviewed_by = actor_name;
  submission.reviewed_at = nowFormatted();

  // If approved and was not previously approved, automatically publish into the relational tables!
  let publishedEntityInfo = '';
  if (submission.status === 'approved' && prevStatus !== 'approved') {
    if (submission.submission_type === 'app') {
      let company = db.companies.find(
        (c) => c.name_ar.trim() === submission.company_name.trim()
      );
      if (!company) {
        const newCompanyId = db.companies.length ? Math.max(...db.companies.map((c) => c.id)) + 1 : 1;
        company = {
          id: newCompanyId,
          name_ar: submission.company_name,
          name_en: submission.company_name,
          slug: `${createSlug(submission.company_name)}-${newCompanyId}`,
          logo_svg_type: 'shield-grid',
          logo_color: '#00F0C6',
          description_ar: `شركة مطورة لتطبيق ${submission.title_or_name} مسجلة عبر منصة التطبيقات الليبية.`,
          city_id: 1,
          city_name_ar: submission.city_name_ar || 'طرابلس',
          specialization_ar: submission.payload.category_name_ar || 'تطوير البرمجيات والتطبيقات',
          established_year: new Date().getFullYear(),
          email: submission.contact_email,
          phone: submission.contact_phone,
          website_url: submission.payload.website_url || 'https://libyaapps.ly',
          social_links: {},
          is_featured: false,
          is_verified: true,
          exhibition_participating: false,
          sponsorship_tier: 'none',
          status: 'published',
          created_at: new Date().toISOString().slice(0, 10),
        };
        db.companies.push(company);
      }

      const categoryObj =
        db.application_categories.find((c) => c.id === Number(submission.payload.category_id)) ||
        db.application_categories[0];

      const newAppId = db.applications.length ? Math.max(...db.applications.map((a) => a.id)) + 1 : 1;
      const newApp: ApplicationItem = {
        id: newAppId,
        name_ar: submission.title_or_name,
        name_en: submission.payload.app_name_en || submission.title_or_name,
        slug: `${createSlug(submission.payload.app_name_en || submission.title_or_name)}-${newAppId}`,
        category_id: categoryObj.id,
        category_name_ar: categoryObj.name_ar,
        category_slug: categoryObj.slug,
        company_id: company.id,
        company_name_ar: company.name_ar,
        company_slug: company.slug,
        city_id: 1,
        city_name_ar: submission.city_name_ar || 'طرابلس',
        launch_year: Number(submission.payload.launch_year) || new Date().getFullYear(),
        status: 'active',
        status_label_ar: 'نشط ومعتمد',
        app_type: (submission.payload.app_type as ApplicationType) || 'B2C',
        short_description_ar:
          submission.payload.short_description_ar || submission.payload.short_description || '',
        full_description_ar:
          submission.payload.full_description_ar ||
          submission.payload.full_description ||
          submission.payload.short_description_ar ||
          submission.payload.short_description ||
          '',
        main_features_ar: [
          'واجهة عربية متكاملة وسريعة الاستجابة',
          'معتمد وموثق عبر دليل منصة التطبيقات الليبية LIBYA APPS',
        ],
        target_users_ar: 'المستخدمون والمؤسسات في السوق الليبي.',
        platforms: (submission.payload.platforms as PlatformOS[]) || ['Android', 'iOS'],
        website_url: submission.payload.website_url || '',
        android_url: submission.payload.android_url || '',
        ios_url: submission.payload.ios_url || '',
        is_featured: true,
        is_verified: true,
        published: true,
        logo_color: submission.payload.logo_color || '#00F0C6',
        logo_monogram: submission.payload.logo_monogram || submission.title_or_name.slice(0, 4),
        logo_url: submission.payload.logo_url || '',
        icon_name: submission.payload.icon_name || 'smartphone',
        media: [],
        views_count: 1,
        created_at: new Date().toISOString().slice(0, 10),
        updated_at: new Date().toISOString().slice(0, 10),
      };

      db.applications.unshift(newApp);
      publishedEntityInfo = `تم نشر التطبيق «${newApp.name_ar}» وإدراجه فوراً في الدليل العام.`;
    } else if (submission.submission_type === 'sponsor') {
      db.sponsors.push({
        id: db.sponsors.length + 1,
        company_name: submission.company_name,
        sector_ar: submission.payload.sector || 'شريك استراتيجي',
        tier_ar: submission.payload.sponsorship_type || 'الراعي الذهبي',
        tier_slug: 'gold',
        website_url: 'https://libyaapps.ly',
        approved: true,
      });
      publishedEntityInfo = `تم اعتماد الراعي الرسمي «${submission.company_name}» في قائمة الرعاة.`;
    }
  }

  db.audit_logs.unshift({
    id: db.audit_logs.length + 1,
    actor_name,
    actor_role_ar,
    action_type: `SUBMISSION_${submission.status.toUpperCase()}`,
    entity_type: 'Submission',
    entity_label: `${submission.reference_number} — ${submission.title_or_name}`,
    details_ar:
      publishedEntityInfo ||
      `تحديث حالة الطلب (${submission.reference_number}) إلى ${submission.status}.`,
    ip_address: '102.213.180.14',
    created_at: nowFormatted(),
  });

  saveDatabase(db);

  res.json({
    status: 'success',
    message: publishedEntityInfo || 'تم تحديث حالة الطلب وحفظ الملاحظات الإدارية بنجاح.',
    data: submission,
  });
});

// Admin Application CRUD & Toggle
app.patch('/api/v1/admin/apps/:id', (req, res) => {
  const db = loadDatabase();
  const appId = Number(req.params.id);
  const appItem = db.applications.find((a) => a.id === appId);
  if (!appItem) {
    return res.status(404).json({ status: 'error', message: 'التطبيق غير موجود.' });
  }

  const {
    is_featured,
    is_verified,
    published,
    name_ar,
    name_en,
    category_id,
    company_id,
    city_id,
    app_type,
    platforms,
    short_description_ar,
    full_description_ar,
    website_url,
    android_url,
    ios_url,
    logo_url,
    icon_name,
    logo_color,
    logo_monogram,
    status,
  } = req.body || {};

  if (typeof is_featured === 'boolean') appItem.is_featured = is_featured;
  if (typeof is_verified === 'boolean') appItem.is_verified = is_verified;
  if (typeof published === 'boolean') appItem.published = published;
  if (typeof name_ar === 'string' && name_ar.trim()) appItem.name_ar = name_ar.trim();
  if (typeof name_en === 'string' && name_en.trim()) appItem.name_en = name_en.trim();
  if (category_id) {
    const cat = db.application_categories.find((c) => c.id === Number(category_id));
    if (cat) {
      appItem.category_id = cat.id;
      appItem.category_name_ar = cat.name_ar;
      appItem.category_slug = cat.slug;
    }
  }
  if (company_id) {
    const comp = db.companies.find((c) => c.id === Number(company_id));
    if (comp) {
      appItem.company_id = comp.id;
      appItem.company_name_ar = comp.name_ar;
      appItem.company_slug = comp.slug;
    }
  }
  if (city_id) {
    const cityObj = db.cities.find((c) => c.id === Number(city_id));
    if (cityObj) {
      appItem.city_id = cityObj.id;
      appItem.city_name_ar = cityObj.name_ar;
    }
  }
  if (typeof app_type === 'string' && app_type) appItem.app_type = app_type as ApplicationType;
  if (Array.isArray(platforms) && platforms.length > 0) appItem.platforms = platforms as PlatformOS[];
  if (typeof short_description_ar === 'string' && short_description_ar.trim()) {
    appItem.short_description_ar = short_description_ar.trim();
  }
  if (typeof full_description_ar === 'string' && full_description_ar.trim()) {
    appItem.full_description_ar = full_description_ar.trim();
  }
  if (typeof website_url === 'string') appItem.website_url = website_url.trim();
  if (typeof android_url === 'string') appItem.android_url = android_url.trim();
  if (typeof ios_url === 'string') appItem.ios_url = ios_url.trim();
  if (typeof logo_url === 'string') appItem.logo_url = logo_url;
  if (typeof icon_name === 'string') appItem.icon_name = icon_name as any;
  if (typeof logo_color === 'string' && logo_color) appItem.logo_color = logo_color;
  if (typeof logo_monogram === 'string' && logo_monogram) appItem.logo_monogram = logo_monogram;

  if (typeof status === 'string') {
    appItem.status = status as any;
    appItem.status_label_ar =
      status === 'active'
        ? 'نشط ومعتمد'
        : status === 'beta'
        ? 'إصدار تجريبي (Beta)'
        : status === 'upcoming'
        ? 'قريباً'
        : 'مؤرشف';
  }
  appItem.updated_at = new Date().toISOString().slice(0, 10);

  db.audit_logs.unshift({
    id: db.audit_logs.length + 1,
    actor_name: 'م. عبدالرحمن السنوسي',
    actor_role_ar: 'المدير العام للنظام',
    action_type: 'UPDATE_APPLICATION',
    entity_type: 'Application',
    entity_label: appItem.name_ar,
    details_ar: `تحديث بيانات وهوية التطبيق (${appItem.name_ar}) — نشر: ${appItem.published ? 'نعم' : 'لا'}، مميز: ${
      appItem.is_featured ? 'نعم' : 'لا'
    }، موثق: ${appItem.is_verified ? 'نعم' : 'لا'}.`,
    ip_address: '102.213.180.14',
    created_at: nowFormatted(),
  });

  saveDatabase(db);
  res.json({ status: 'success', data: appItem });
});

// Admin Delete Application
app.delete('/api/v1/admin/apps/:id', (req, res) => {
  const db = loadDatabase();
  const appId = Number(req.params.id);
  const idx = db.applications.findIndex((a) => a.id === appId);
  if (idx === -1) {
    return res.status(404).json({ status: 'error', message: 'التطبيق غير موجود.' });
  }
  const removed = db.applications[idx];
  db.applications.splice(idx, 1);

  db.audit_logs.unshift({
    id: db.audit_logs.length + 1,
    actor_name: 'م. عبدالرحمن السنوسي',
    actor_role_ar: 'المدير العام للنظام',
    action_type: 'DELETE_APPLICATION',
    entity_type: 'Application',
    entity_label: removed.name_ar,
    details_ar: `حذف التطبيق «${removed.name_ar}» من الدليل العام.`,
    ip_address: '102.213.180.14',
    created_at: nowFormatted(),
  });

  saveDatabase(db);
  res.json({ status: 'success', message: `تم حذف التطبيق «${removed.name_ar}» بنجاح.` });
});

// Admin Create Application directly in Filament
app.post('/api/v1/admin/apps', (req, res) => {
  const db = loadDatabase();
  const {
    name_ar,
    name_en,
    category_id,
    company_id,
    city_id,
    app_type,
    platforms,
    short_description_ar,
    full_description_ar,
    website_url,
    android_url,
    ios_url,
    logo_url,
    icon_name,
    logo_color,
    logo_monogram,
    is_featured,
    is_verified,
  } = req.body || {};

  if (!name_ar || !short_description_ar) {
    return res.status(422).json({
      status: 'error',
      message: 'اسم التطبيق والوصف المختصر حقول مطلوبة.',
    });
  }

  const category =
    db.application_categories.find((c) => c.id === Number(category_id)) || db.application_categories[0];
  const company = db.companies.find((c) => c.id === Number(company_id)) || db.companies[0];
  const city = db.cities.find((c) => c.id === Number(city_id)) || db.cities[0];

  const newId = db.applications.length ? Math.max(...db.applications.map((a) => a.id)) + 1 : 1;
  const newApp: ApplicationItem = {
    id: newId,
    name_ar: String(name_ar).trim(),
    name_en: String(name_en || name_ar).trim(),
    slug: `${createSlug(name_en || name_ar)}-${newId}`,
    category_id: category.id,
    category_name_ar: category.name_ar,
    category_slug: category.slug,
    company_id: company.id,
    company_name_ar: company.name_ar,
    company_slug: company.slug,
    city_id: city.id,
    city_name_ar: city.name_ar,
    launch_year: new Date().getFullYear(),
    status: 'active',
    status_label_ar: 'نشط ومعتمد',
    app_type: (app_type as ApplicationType) || 'B2C',
    short_description_ar: String(short_description_ar).trim(),
    full_description_ar: String(full_description_ar || short_description_ar).trim(),
    main_features_ar: [
      'مسجل وموثق عبر لوحة تحكم Filament لمنصة التطبيقات الليبية',
      'دعم فني وتحديثات مستمرة للمستخدمين في السوق الليبي',
    ],
    target_users_ar: 'المستخدمون والشركات في ليبيا.',
    platforms: Array.isArray(platforms) && platforms.length ? platforms : ['Android', 'iOS', 'Web'],
    website_url: website_url || '',
    android_url: android_url || '',
    ios_url: ios_url || '',
    is_featured: Boolean(is_featured),
    is_verified: Boolean(is_verified ?? true),
    published: true,
    logo_color: logo_color || '#00F0C6',
    logo_monogram: logo_monogram || String(name_ar).trim().slice(0, 4),
    logo_url: logo_url || '',
    icon_name: icon_name || 'smartphone',
    media: [],
    views_count: 1,
    created_at: new Date().toISOString().slice(0, 10),
    updated_at: new Date().toISOString().slice(0, 10),
  };

  db.applications.unshift(newApp);
  db.audit_logs.unshift({
    id: db.audit_logs.length + 1,
    actor_name: 'م. عبدالرحمن السنوسي',
    actor_role_ar: 'المدير العام للنظام',
    action_type: 'CREATE_APPLICATION',
    entity_type: 'Application',
    entity_label: newApp.name_ar,
    details_ar: `إضافة ونشر تطبيق جديد مباشرة من لوحة التحكم Filament.`,
    ip_address: '102.213.180.14',
    created_at: nowFormatted(),
  });

  saveDatabase(db);
  res.status(201).json({ status: 'success', data: newApp });
});

// Admin Company CRUD
app.post('/api/v1/admin/companies', (req, res) => {
  const db = loadDatabase();
  const {
    name_ar,
    name_en,
    city_id,
    specialization_ar,
    established_year,
    description_ar,
    email,
    phone,
    website_url,
    is_featured,
    is_verified,
  } = req.body || {};

  if (!name_ar || !specialization_ar) {
    return res.status(422).json({ status: 'error', message: 'اسم الشركة والتخصص حقول مطلوبة.' });
  }

  const city = db.cities.find((c) => c.id === Number(city_id)) || db.cities[0];
  const newId = db.companies.length ? Math.max(...db.companies.map((c) => c.id)) + 1 : 1;

  const newCompany = {
    id: newId,
    name_ar: String(name_ar).trim(),
    name_en: String(name_en || name_ar).trim(),
    slug: `${createSlug(name_en || name_ar)}-${newId}`,
    logo_svg_type: 'shield-grid',
    logo_color: '#00F0C6',
    description_ar: String(description_ar || specialization_ar).trim(),
    city_id: city.id,
    city_name_ar: city.name_ar,
    specialization_ar: String(specialization_ar).trim(),
    established_year: Number(established_year) || 2024,
    email: String(email || 'info@libyaapps.ly').trim(),
    phone: String(phone || '+218 91 000 0000').trim(),
    website_url: String(website_url || 'https://libyaapps.ly').trim(),
    social_links: {},
    is_featured: Boolean(is_featured),
    is_verified: Boolean(is_verified ?? true),
    exhibition_participating: false,
    sponsorship_tier: 'none' as const,
    status: 'published' as const,
    created_at: new Date().toISOString().slice(0, 10),
  };

  db.companies.unshift(newCompany);
  db.audit_logs.unshift({
    id: db.audit_logs.length + 1,
    actor_name: 'م. عبدالرحمن السنوسي',
    actor_role_ar: 'المدير العام للنظام',
    action_type: 'CREATE_COMPANY',
    entity_type: 'Company',
    entity_label: newCompany.name_ar,
    details_ar: `إضافة شركة تقنية جديدة «${newCompany.name_ar}» إلى قاعدة البيانات.`,
    ip_address: '102.213.180.14',
    created_at: nowFormatted(),
  });

  saveDatabase(db);
  res.status(201).json({ status: 'success', data: newCompany });
});

app.patch('/api/v1/admin/companies/:id', (req, res) => {
  const db = loadDatabase();
  const compId = Number(req.params.id);
  const comp = db.companies.find((c) => c.id === compId);
  if (!comp) {
    return res.status(404).json({ status: 'error', message: 'الشركة غير موجودة.' });
  }

  const { is_featured, is_verified, name_ar, specialization_ar, description_ar, website_url, email, phone } =
    req.body || {};
  if (typeof is_featured === 'boolean') comp.is_featured = is_featured;
  if (typeof is_verified === 'boolean') comp.is_verified = is_verified;
  if (typeof name_ar === 'string' && name_ar.trim()) comp.name_ar = name_ar.trim();
  if (typeof specialization_ar === 'string' && specialization_ar.trim()) {
    comp.specialization_ar = specialization_ar.trim();
  }
  if (typeof description_ar === 'string' && description_ar.trim()) {
    comp.description_ar = description_ar.trim();
  }
  if (typeof website_url === 'string') comp.website_url = website_url.trim();
  if (typeof email === 'string') comp.email = email.trim();
  if (typeof phone === 'string') comp.phone = phone.trim();

  saveDatabase(db);
  res.json({ status: 'success', data: comp });
});

app.delete('/api/v1/admin/companies/:id', (req, res) => {
  const db = loadDatabase();
  const compId = Number(req.params.id);
  const idx = db.companies.findIndex((c) => c.id === compId);
  if (idx === -1) {
    return res.status(404).json({ status: 'error', message: 'الشركة غير موجودة.' });
  }
  const removed = db.companies[idx];
  db.companies.splice(idx, 1);
  saveDatabase(db);
  res.json({ status: 'success', message: `تم حذف الشركة «${removed.name_ar}» بنجاح.` });
});

// Admin Launchpad Events CRUD
app.post('/api/v1/admin/launches', (req, res) => {
  const db = loadDatabase();
  const { title_ar, application_id, launch_type, version_tag, launch_date, summary_ar } = req.body || {};
  if (!title_ar || !summary_ar) {
    return res.status(422).json({ status: 'error', message: 'عنوان الإطلاق والملخص مطلوبان.' });
  }

  const appObj = db.applications.find((a) => a.id === Number(application_id)) || db.applications[0];
  const newId = db.launch_events.length ? Math.max(...db.launch_events.map((l) => l.id)) + 1 : 1;

  const newLaunch = {
    id: newId,
    title_ar: String(title_ar).trim(),
    slug: `launch-${newId}-${Date.now()}`,
    application_id: appObj.id,
    application_name_ar: appObj.name_ar,
    application_slug: appObj.slug,
    company_id: appObj.company_id,
    company_name_ar: appObj.company_name_ar,
    company_slug: appObj.company_slug,
    launch_type: (launch_type || 'new_release') as 'new_release' | 'upcoming_app' | 'major_update',
    launch_type_label_ar:
      launch_type === 'upcoming_app'
        ? 'تطبيق قادم قريباً'
        : launch_type === 'major_update'
        ? 'تحديث رئيسي'
        : 'إطلاق رسمي جديد',
    launch_date: launch_date || new Date().toISOString().slice(0, 10),
    version_tag: version_tag || 'v1.0.0',
    summary_ar: String(summary_ar).trim(),
    highlights_ar: ['متاح للمعاينة عبر منصة الإطلاق الوطنية LIBYA APPS'],
    package_tier: 'featured_launch' as const,
    is_featured: true,
  };

  db.launch_events.unshift(newLaunch);
  saveDatabase(db);
  res.status(201).json({ status: 'success', data: newLaunch });
});

app.delete('/api/v1/admin/launches/:id', (req, res) => {
  const db = loadDatabase();
  const id = Number(req.params.id);
  const idx = db.launch_events.findIndex((l) => l.id === id);
  if (idx !== -1) {
    db.launch_events.splice(idx, 1);
    saveDatabase(db);
  }
  res.json({ status: 'success' });
});

// Admin Website Settings Update
app.patch('/api/v1/admin/settings', (req, res) => {
  const db = loadDatabase();
  const updates = req.body || {};
  db.website_settings = {
    ...db.website_settings,
    ...updates,
  };
  db.audit_logs.unshift({
    id: db.audit_logs.length + 1,
    actor_name: 'م. عبدالرحمن السنوسي',
    actor_role_ar: 'المدير العام للنظام',
    action_type: 'UPDATE_SETTINGS',
    entity_type: 'WebsiteSettings',
    entity_label: 'إعدادات المنصة والصفحة الرئيسية',
    details_ar: 'تحديث محتوى الصفحة الرئيسية وإعدادات SEO والتواصل.',
    ip_address: '102.213.180.14',
    created_at: nowFormatted(),
  });
  saveDatabase(db);
  res.json({ status: 'success', data: db.website_settings });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LIBYA APPS Full-Stack Platform listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
