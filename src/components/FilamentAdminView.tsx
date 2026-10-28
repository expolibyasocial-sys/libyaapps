import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  BarChart3,
  Building2,
  CheckCircle2,
  Edit3,
  FileUp,
  FolderKanban,
  Layers,
  Lock,
  Palette,
  Pin,
  Plus,
  RefreshCw,
  Rocket,
  Search,
  Settings,
  ShieldCheck,
  Smartphone,
  Trash2,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import {
  AdminRole,
  AdminRoleSlug,
  AdminUser,
  AppIconName,
  ApplicationCategory,
  ApplicationItem,
  ApplicationStatus,
  ApplicationType,
  AuditLogItem,
  City,
  Company,
  HomepageStatItem,
  LaunchEvent,
  PlatformOS,
  SponsorRecord,
  SubmissionRecord,
  SubmissionStatus,
  WebsiteSettings,
} from '../types/platform';
import {
  AppBrandLogo,
  INITIAL_BRAND_LOGOS,
  LibyaAppsPolygonIcon,
  getDefaultAppLogoUrl,
  resolveAppIconName,
} from './VisualAssets';

const DEFAULT_HOMEPAGE_STATS: HomepageStatItem[] = [
  {
    id: 'stat_apps',
    value: '+9',
    label_ar: 'تطبيق ليبي مسجل وموثق',
    subtitle_ar: 'شعارات وأيقونات مخصصة لكل تطبيق',
  },
  {
    id: 'stat_companies',
    value: '+6',
    label_ar: 'شركة تقنية ومطور',
    subtitle_ar: 'مؤسسات برمجية في المدن الليبية',
  },
  {
    id: 'stat_categories',
    value: '+12',
    label_ar: 'قطاع وتصنيف تقني',
    subtitle_ar: 'المالية، التوصيل، الصحة، والتعليم',
  },
  {
    id: 'stat_launches',
    value: '+3',
    label_ar: 'إصدار في منصة الإطلاق',
    subtitle_ar: 'تطبيقات جديدة وتحديثات كبرى',
  },
];

function formatPayloadEntryInEnglish(key: string, val: unknown): { key: string; value: string } {
  const rawVal = Array.isArray(val) ? val.join(', ') : String(val ?? '');
  if (key === 'category_name_ar' || key === 'category_name') {
    const mapArToEn: Record<string, string> = {
      'التجارة الإلكترونية': 'E-Commerce',
      'التقنية المالية والدفع الإلكتروني': 'Fintech & Digital Payments',
      'التوصيل والخدمات اللوجستية': 'Delivery & Logistics',
      'الصحة والطب الرقمي': 'Digital Health & Telemedicine',
      'التعليم والتدريب الإلكتروني': 'EdTech & E-Learning',
      'المواصلات والنقل الذكي': 'Smart Mobility & Transport',
      'الذكاء الاصطناعي والبيانات': 'AI & Data Solutions',
    };
    return {
      key: 'category_name',
      value: mapArToEn[rawVal] || rawVal,
    };
  }
  if (key === 'short_description_ar' || key === 'short_description') {
    const translated =
      rawVal.includes('منصة تجارة إلكترونية')
        ? 'An e-commerce marketplace connecting wholesale and retail merchants with consumers, featuring a guaranteed cash-on-delivery system.'
        : rawVal;
    return {
      key: 'short_description',
      value: translated,
    };
  }
  return { key, value: rawVal };
}

interface FilamentAdminViewProps {
  onDataMutated: () => void;
  onNavigatePublic: (route: string) => void;
}

type AdminTab =
  | 'overview'
  | 'applications'
  | 'submissions'
  | 'companies'
  | 'categories_launches'
  | 'settings_security';

export const FilamentAdminView: React.FC<FilamentAdminViewProps> = ({
  onDataMutated,
  onNavigatePublic,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [activeRole, setActiveRole] = useState<AdminRoleSlug>('super_admin');
  const [loading, setLoading] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const [metrics, setMetrics] = useState({
    total_applications: 0,
    published_applications: 0,
    pending_submissions: 0,
    published_news: 0,
    registered_companies: 0,
    exhibition_requests: 0,
    sponsorship_requests: 0,
  });

  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [launches, setLaunches] = useState<LaunchEvent[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [sponsors, setSponsors] = useState<SponsorRecord[]>([]);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [categories, setCategories] = useState<ApplicationCategory[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  // Filters & Search inside Admin
  const [appSearch, setAppSearch] = useState('');
  const [appCatFilter, setAppCatFilter] = useState<string>('all');
  const [appStatusFilter, setAppStatusFilter] = useState<string>('all');
  const [submissionFilter, setSubmissionFilter] = useState<string>('all');
  const [companySearch, setCompanySearch] = useState('');
  const [auditSearch, setAuditSearch] = useState('');
  const [notesDraft, setNotesDraft] = useState<Record<number, string>>({});

  // Full Create / Edit Application Modal State
  const [appModalOpen, setAppModalOpen] = useState(false);
  const [editingAppId, setEditingAppId] = useState<number | null>(null);
  const [appFormDraft, setAppFormDraft] = useState({
    name_ar: '',
    name_en: '',
    category_id: 3,
    company_id: 1,
    city_id: 1,
    app_type: 'Fintech' as ApplicationType,
    status: 'active' as ApplicationStatus,
    platforms: ['Android', 'iOS'] as PlatformOS[],
    short_description_ar: '',
    full_description_ar: '',
    website_url: '',
    android_url: '',
    ios_url: '',
    logo_url: '',
    icon_name: 'wallet' as AppIconName,
    logo_color: '#00F0C6',
    logo_monogram: '',
    is_featured: true,
    is_verified: true,
    published: true,
  });

  // Create Company Modal State
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [companyDraft, setCompanyDraft] = useState({
    name_ar: '',
    name_en: '',
    city_id: 1,
    specialization_ar: '',
    established_year: 2024,
    description_ar: '',
    email: '',
    phone: '',
    website_url: '',
    is_featured: true,
    is_verified: true,
  });

  // Create Launchpad Release State
  const [launchDraft, setLaunchDraft] = useState({
    title_ar: '',
    application_id: 1,
    launch_type: 'new_release',
    version_tag: 'v2.0.0',
    launch_date: '2026-11-01',
    summary_ar: '',
  });

  const fetchAdminOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/overview');
      const json = await res.json();
      if (json.status === 'success') {
        setMetrics(json.data.metrics);
        setRoles(json.data.roles);
        setUsers(json.data.users);
        setApplications(json.data.applications);
        setCompanies(json.data.companies);
        setLaunches(json.data.launches || []);
        setSubmissions(json.data.submissions);
        setSponsors(json.data.sponsors);
        setSettings(json.data.website_settings);
        setAuditLogs(json.data.audit_logs);
        setCategories(json.data.categories);
        setCities(json.data.cities);
      }
    } catch (e) {
      console.error('Failed to fetch admin overview', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminOverview();
  }, []);

  const currentRoleObj = roles.find((r) => r.slug === activeRole);

  const canAccessModule = (moduleKey: AdminTab): boolean => {
    if (activeRole === 'super_admin' || activeRole === 'content_manager') return true;
    if (activeRole === 'apps_manager')
      return ['overview', 'applications', 'submissions', 'categories_launches'].includes(moduleKey);
    if (activeRole === 'companies_manager')
      return ['overview', 'companies', 'submissions'].includes(moduleKey);
    if (activeRole === 'sponsorship_manager')
      return ['overview', 'submissions'].includes(moduleKey);
    return true;
  };

  const notify = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  const openCreateAppModal = () => {
    setEditingAppId(null);
    setAppFormDraft({
      name_ar: '',
      name_en: '',
      category_id: categories[0]?.id || 3,
      company_id: companies[0]?.id || 1,
      city_id: cities[0]?.id || 1,
      app_type: 'Fintech',
      status: 'active',
      platforms: ['Android', 'iOS'],
      short_description_ar: '',
      full_description_ar: '',
      website_url: '',
      android_url: '',
      ios_url: '',
      logo_url: getDefaultAppLogoUrl(applications.length + 1),
      icon_name: 'wallet',
      logo_color: '#00F0C6',
      logo_monogram: '',
      is_featured: true,
      is_verified: true,
      published: true,
    });
    setAppModalOpen(true);
  };

  const openEditAppModal = (app: ApplicationItem) => {
    setEditingAppId(app.id);
    setAppFormDraft({
      name_ar: app.name_ar,
      name_en: app.name_en,
      category_id: app.category_id,
      company_id: app.company_id,
      city_id: app.city_id,
      app_type: app.app_type,
      status: app.status,
      platforms: app.platforms || ['Android', 'iOS'],
      short_description_ar: app.short_description_ar,
      full_description_ar: app.full_description_ar || app.short_description_ar,
      website_url: app.website_url || '',
      android_url: app.android_url || '',
      ios_url: app.ios_url || '',
      logo_url: app.logo_url || '',
      icon_name: resolveAppIconName(app),
      logo_color: app.logo_color || '#00F0C6',
      logo_monogram: app.logo_monogram || app.name_ar.slice(0, 4),
      is_featured: app.is_featured,
      is_verified: app.is_verified,
      published: app.published,
    });
    setAppModalOpen(true);
  };

  const handleAppLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAppFormDraft((prev) => ({ ...prev, logo_url: reader.result as string }));
      }
    };
    reader.readAsDataURL(f);
  };

  const toggleDraftPlatform = (os: PlatformOS) => {
    setAppFormDraft((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(os)
        ? prev.platforms.filter((p) => p !== os)
        : [...prev.platforms, os],
    }));
  };

  const handleSaveApplicationModal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAppId) {
        const res = await fetch(`/api/v1/admin/apps/${editingAppId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(appFormDraft),
        });
        if (res.ok) {
          notify(`تم حفظ التعديلات وتحديث شعار وأيقونة التطبيق «${appFormDraft.name_ar}» بنجاح.`);
          setAppModalOpen(false);
          await fetchAdminOverview();
          onDataMutated();
        }
      } else {
        const res = await fetch('/api/v1/admin/apps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(appFormDraft),
        });
        if (res.ok) {
          notify(`تمت إضافة التطبيق الجديد «${appFormDraft.name_ar}» ونشره في الدليل العام.`);
          setAppModalOpen(false);
          await fetchAdminOverview();
          onDataMutated();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteApplication = async (app: ApplicationItem) => {
    try {
      const res = await fetch(`/api/v1/admin/apps/${app.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        notify(`تم حذف التطبيق «${app.name_ar}» من الدليل.`);
        await fetchAdminOverview();
        onDataMutated();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewSubmission = async (id: number, status: SubmissionStatus) => {
    try {
      const res = await fetch(`/api/v1/admin/submissions/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          admin_notes: notesDraft[id],
          actor_name: currentRoleObj?.name_ar || 'مدير النظام',
          actor_role_ar: currentRoleObj?.name_ar || 'المدير العام للنظام',
        }),
      });
      const json = await res.json();
      if (res.ok) {
        notify(json.message || 'تم تحديث حالة الطلب بنجاح.');
        await fetchAdminOverview();
        onDataMutated();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleApplicationField = async (
    appId: number,
    field: 'published' | 'is_featured' | 'is_verified',
    value: boolean
  ) => {
    try {
      const res = await fetch(`/api/v1/admin/apps/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      if (res.ok) {
        notify('تم تحديث حالة التطبيق في قاعدة البيانات وإعادة تحديث الدليل العام.');
        await fetchAdminOverview();
        onDataMutated();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/admin/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyDraft),
      });
      if (res.ok) {
        notify(`تمت إضافة الشركة «${companyDraft.name_ar}» بنجاح.`);
        setCompanyModalOpen(false);
        setCompanyDraft({
          name_ar: '',
          name_en: '',
          city_id: 1,
          specialization_ar: '',
          established_year: 2024,
          description_ar: '',
          email: '',
          phone: '',
          website_url: '',
          is_featured: true,
          is_verified: true,
        });
        await fetchAdminOverview();
        onDataMutated();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleCompanyField = async (
    compId: number,
    field: 'is_verified' | 'is_featured',
    value: boolean
  ) => {
    try {
      const res = await fetch(`/api/v1/admin/companies/${compId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      if (res.ok) {
        notify('تم تحديث حالة الشركة في قاعدة البيانات.');
        await fetchAdminOverview();
        onDataMutated();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCompany = async (comp: Company) => {
    try {
      const res = await fetch(`/api/v1/admin/companies/${comp.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        notify(`تم حذف الشركة «${comp.name_ar}».`);
        await fetchAdminOverview();
        onDataMutated();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/admin/launches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(launchDraft),
      });
      if (res.ok) {
        notify(`تم إدراج إطلاق «${launchDraft.title_ar}» في منصة الإطلاق.`);
        setLaunchDraft({
          title_ar: '',
          application_id: applications[0]?.id || 1,
          launch_type: 'new_release',
          version_tag: 'v2.0.0',
          launch_date: '2026-11-01',
          summary_ar: '',
        });
        await fetchAdminOverview();
        onDataMutated();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLaunch = async (id: number) => {
    await fetch(`/api/v1/admin/launches/${id}`, { method: 'DELETE' });
    notify('تم حذف سجل الإطلاق.');
    await fetchAdminOverview();
    onDataMutated();
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      const res = await fetch('/api/v1/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        notify('تم حفظ إعدادات المنصة ومحتوى الصفحة الرئيسية وSEO بنجاح.');
        await fetchAdminOverview();
        onDataMutated();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered lists
  const filteredApps = applications.filter((a) => {
    if (appCatFilter !== 'all' && String(a.category_id) !== appCatFilter) return false;
    if (appStatusFilter !== 'all' && a.status !== appStatusFilter) return false;
    if (appSearch.trim()) {
      const q = appSearch.trim().toLowerCase();
      return (
        a.name_ar.toLowerCase().includes(q) ||
        a.name_en.toLowerCase().includes(q) ||
        a.company_name_ar.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredSubmissions = submissions.filter((s) =>
    submissionFilter === 'all' ? true : s.status === submissionFilter
  );

  const filteredCompanies = companies.filter((c) => {
    if (!companySearch.trim()) return true;
    const q = companySearch.trim().toLowerCase();
    return (
      c.name_ar.toLowerCase().includes(q) ||
      c.name_en.toLowerCase().includes(q) ||
      c.specialization_ar.toLowerCase().includes(q)
    );
  });

  const filteredAuditLogs = auditLogs.filter((l) => {
    if (!auditSearch.trim()) return true;
    const q = auditSearch.trim().toLowerCase();
    return (
      l.entity_label.toLowerCase().includes(q) ||
      l.details_ar.toLowerCase().includes(q) ||
      l.actor_name.toLowerCase().includes(q)
    );
  });

  // Analytics calculations
  const totalViews = applications.reduce((acc, a) => acc + (a.views_count || 0), 0);
  const verifiedAppsCount = applications.filter((a) => a.is_verified).length;
  const androidCount = applications.filter((a) => a.platforms.includes('Android')).length;
  const iosCount = applications.filter((a) => a.platforms.includes('iOS')).length;
  const webCount = applications.filter((a) => a.platforms.includes('Web')).length;

  const inputClass =
    'w-full px-3.5 py-2.5 text-sm rounded-xl bg-[#020807] border border-[#002D28] text-white placeholder:text-[#6B7C77] focus:outline-none focus:border-[#00F0C6]';

  return (
    <div className="min-h-screen elegant-dark-bg text-white" dir="rtl">
      {/* Top Filament RTL Bar */}
      <div className="bg-[#020807]/95 backdrop-blur-md text-white border-b border-[#00483F] px-4 sm:px-8 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <LibyaAppsPolygonIcon className="w-10 h-10" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-base sm:text-lg text-white">
                  لوحة الإدارة المتقدمة — LIBYA APPS
                </span>
                <span className="text-[11px] font-mono-num text-[#00F0C6] bg-[#002D28] px-2.5 py-0.5 rounded-md border border-[#00483F]">
                  Filament v3 RTL Suite
                </span>
              </div>
              <p className="text-xs text-[#A8B7B3]">
                تحكم كامل بالتطبيقات، الشعارات والأيقونات، الشركات، الطلبات، الإطلاقات، والتحليلات التنفيذية
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Role-Based Access Control Switcher */}
            <div className="flex items-center gap-2 bg-[#03110E] border border-[#00483F] rounded-xl px-3 py-1.5">
              <Lock className="w-3.5 h-3.5 text-[#00F0C6]" />
              <span className="text-xs text-[#A8B7B3]">الدور النشط:</span>
              <select
                value={activeRole}
                onChange={(e) => setActiveRole(e.target.value as AdminRoleSlug)}
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.slug} className="bg-[#020807] text-white">
                    {r.name_ar}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={openCreateAppModal}
              className="px-3.5 py-2 text-xs font-bold bg-[#00F0C6] hover:bg-[#39FFDB] text-[#020807] rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,198,0.2)]"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة تطبيق وشعار</span>
            </button>

            <button
              type="button"
              onClick={fetchAdminOverview}
              className="px-3 py-2 text-xs font-medium bg-[#03110E] hover:bg-[#002D28] border border-[#00483F] rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#00F0C6] ${loading ? 'animate-spin' : ''}`} />
              <span>تحديث</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigatePublic('/')}
              className="px-3.5 py-2 text-xs font-bold bg-[#002D28] hover:bg-[#00483F] text-white border border-[#00483F] rounded-xl transition-colors cursor-pointer"
            >
              العودة للموقع العام
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3 space-y-2">
          {[
            {
              key: 'overview' as AdminTab,
              label: 'المؤشرات والتحليلات التنفيذية',
              sub: 'إحصائيات شاملة وتوزيع المدن والقطاعات',
              icon: BarChart3,
            },
            {
              key: 'applications' as AdminTab,
              label: 'إدارة التطبيقات والشعارات',
              sub: `${applications.length} تطبيق · تعديل الشعار والأيقونة`,
              icon: Smartphone,
            },
            {
              key: 'submissions' as AdminTab,
              label: 'مركز مراجعة الطلبات',
              sub: `${metrics.pending_submissions} طلب بانتظار الاعتماد`,
              icon: FolderKanban,
              badge: metrics.pending_submissions,
            },
            {
              key: 'companies' as AdminTab,
              label: 'إدارة الشركات والمطورين',
              sub: `${companies.length} شركة تقنية مسجلة`,
              icon: Building2,
            },
            {
              key: 'categories_launches' as AdminTab,
              label: 'التصنيفات ومنصة الإطلاق',
              sub: `${categories.length} تصنيف · ${launches.length} إطلاق`,
              icon: Rocket,
            },
            {
              key: 'settings_security' as AdminTab,
              label: 'الإعدادات، الصلاحيات والتدقيق',
              sub: 'SEO · RBAC · Audit Trail',
              icon: Settings,
            },
          ].map((item) => {
            const Icon = item.icon;
            const allowed = canAccessModule(item.key);
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                disabled={!allowed}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-right transition-all cursor-pointer border ${
                  !allowed
                    ? 'opacity-40 cursor-not-allowed bg-[#03110E]/40 border-[#002D28] text-[#A8B7B3]'
                    : isActive
                    ? 'bg-[#002D28] border-[#00F0C6] text-white shadow-[0_0_20px_rgba(0,240,198,0.14)]'
                    : 'bg-[#03110E] hover:bg-[#002D28]/60 text-[#A8B7B3] hover:text-white border-[#002D28]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-[#00F0C6] text-[#020807]' : 'bg-[#020807] text-[#00F0C6]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold truncate">{item.label}</div>
                    <div className="text-[11px] text-[#A8B7B3] truncate mt-0.5">{item.sub}</div>
                  </div>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="font-mono-num text-xs font-bold px-2 py-0.5 rounded-lg bg-[#00F0C6] text-[#020807] shrink-0">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Active Role Permissions Summary Card */}
          <div className="mt-6 bg-[#03110E] rounded-2xl border border-[#002D28] p-4 space-y-2">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#00F0C6]" />
              <span>صلاحيات الدور الحالي (Sanctum RBAC)</span>
            </div>
            <p className="text-xs text-[#A8B7B3] leading-relaxed">
              الدور الفعال: <strong className="text-white">{currentRoleObj?.name_ar}</strong>
            </p>
            <div className="text-[11px] font-mono-num text-[#00F0C6] pt-1 border-t border-[#002D28]">
              الصلاحيات: {currentRoleObj?.permissions.join(' · ')}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-9 space-y-6">
          {feedbackMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#002D28] border border-[#00F0C6] text-white px-4 py-3.5 rounded-xl flex items-center justify-between text-xs sm:text-sm font-medium shadow-lg"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00F0C6] shrink-0" />
                <span>{feedbackMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackMessage(null)}
                className="text-xs text-[#00F0C6] underline cursor-pointer"
              >
                إغلاق
              </button>
            </motion.div>
          )}

          {/* TAB 1: EXECUTIVE ANALYTICS & OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 6 Detailed KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    label: 'إجمالي التطبيقات المسجلة',
                    value: metrics.total_applications,
                    sub: `${metrics.published_applications} تطبيق منشور في الدليل العام`,
                    accent: '#00F0C6',
                  },
                  {
                    label: 'التطبيقات الموثقة رسمياً',
                    value: verifiedAppsCount,
                    sub: `نسبة التوثيق ${
                      metrics.total_applications
                        ? Math.round((verifiedAppsCount / metrics.total_applications) * 100)
                        : 100
                    }% من الدليل`,
                    accent: '#38BDF8',
                  },
                  {
                    label: 'طلبات بانتظار المراجعة',
                    value: metrics.pending_submissions,
                    sub: 'طلبات إضافة تطبيقات ورعايات وتواصل',
                    accent: '#F59E0B',
                  },
                  {
                    label: 'الشركات التقنية والمطورون',
                    value: metrics.registered_companies,
                    sub: `${companies.filter((c) => c.is_verified).length} شركة موثقة في قاعدة البيانات`,
                    accent: '#10B981',
                  },
                  {
                    label: 'إطلاقات منصة الإطلاق',
                    value: launches.length,
                    sub: 'إصدارات جديدة وتحديثات رئيسية',
                    accent: '#8B5CF6',
                  },
                  {
                    label: 'إجمالي مشاهدات التطبيقات',
                    value: totalViews.toLocaleString('en-US'),
                    sub: 'تفاعل الزوار مع بطاقات التطبيقات',
                    accent: '#EC4899',
                  },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className="bg-[#03110E] rounded-2xl border border-[#002D28] hover:border-[#00483F] p-5 space-y-2 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#A8B7B3] font-medium">{stat.label}</span>
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: stat.accent }}
                      />
                    </div>
                    <div
                      className="text-3xl font-display font-bold font-mono-num"
                      style={{ color: stat.accent }}
                    >
                      {stat.value}
                    </div>
                    <div className="text-[11px] text-[#A8B7B3]">{stat.sub}</div>
                  </div>
                ))}
              </div>

              {/* Pinned Homepage Applications Quick Control Panel */}
              <div className="bg-[#03110E] rounded-2xl border border-[#00483F] p-6 space-y-4 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#002D28] pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#002D28] border border-[#00F0C6]/50 flex items-center justify-center text-[#00F0C6]">
                      <Pin className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-sm sm:text-base text-white">
                        التحكم في التطبيقات المثبتة في الواجهة الرئيسية
                      </h3>
                      <p className="text-xs text-[#A8B7B3]">
                        حدد التطبيقات التي ترغب في تثبيتها لتظهر مباشرة في الواجهة الرئيسية للموقع ({applications.filter((a) => a.is_featured && a.published).length} تطبيق مثبت حالياً)
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('applications')}
                    className="text-xs font-bold text-[#00F0C6] hover:underline cursor-pointer"
                  >
                    إدارة جميع التطبيقات ←
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {applications.map((app) => {
                    const isPinned = Boolean(app.is_featured);
                    return (
                      <div
                        key={app.id}
                        className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                          isPinned
                            ? 'bg-[#002D28]/65 border-[#00F0C6] shadow-[0_0_18px_rgba(0,240,198,0.12)]'
                            : 'bg-[#020807] border-[#002D28] hover:border-[#00483F]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <AppBrandLogo app={app} size="sm" />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate">
                              {app.name_ar}
                            </div>
                            <div className="text-[11px] text-[#A8B7B3] truncate">
                              {app.category_name_ar}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleToggleApplicationField(app.id, 'is_featured', !isPinned)
                          }
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                            isPinned
                              ? 'bg-[#00F0C6] text-[#020807]'
                              : 'bg-[#03110E] hover:bg-[#002D28] text-[#A8B7B3] hover:text-white border border-[#002D28]'
                          }`}
                        >
                          <Pin className="w-3 h-3" />
                          <span>{isPinned ? 'مثبت في الواجهة' : 'تثبيت في الواجهة'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Category Breakdown & City Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Distribution */}
                <div className="bg-[#03110E] rounded-2xl border border-[#002D28] p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#002D28] pb-3">
                    <h3 className="font-display font-bold text-sm sm:text-base text-white">
                      توزيع التطبيقات حسب القطاعات
                    </h3>
                    <span className="text-xs font-mono-num text-[#00F0C6]">
                      {categories.length} قطاع تقني
                    </span>
                  </div>
                  <div className="space-y-3 max-h-72 overflow-y-auto pl-1">
                    {categories.map((cat) => {
                      const count = applications.filter((a) => a.category_id === cat.id).length;
                      const pct = applications.length
                        ? Math.round((count / applications.length) * 100)
                        : 0;
                      return (
                        <div key={cat.id} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-white">{cat.name_ar}</span>
                            <span className="font-mono-num text-[#A8B7B3]">
                              {count} تطبيق ({pct}%)
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-[#020807] overflow-hidden border border-[#002D28]">
                            <div
                              className="h-full bg-[#00F0C6] rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* City Distribution & OS Coverage */}
                <div className="space-y-6">
                  <div className="bg-[#03110E] rounded-2xl border border-[#002D28] p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-[#002D28] pb-3">
                      <h3 className="font-display font-bold text-sm sm:text-base text-white">
                        تغطية أنظمة التشغيل في الدليل
                      </h3>
                      <span className="text-xs font-mono-num text-[#00F0C6]">OS Coverage</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { os: 'Android', count: androidCount, color: '#00F0C6' },
                        { os: 'iOS', count: iosCount, color: '#38BDF8' },
                        { os: 'Web', count: webCount, color: '#10B981' },
                      ].map((item) => (
                        <div
                          key={item.os}
                          className="p-3.5 rounded-xl bg-[#020807] border border-[#002D28] text-center space-y-1"
                        >
                          <div className="font-mono-num text-xs font-bold text-[#A8B7B3]">
                            {item.os}
                          </div>
                          <div
                            className="font-mono-num text-2xl font-bold"
                            style={{ color: item.color }}
                          >
                            {item.count}
                          </div>
                          <div className="text-[11px] text-[#A8B7B3]">تطبيق داعم</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#03110E] rounded-2xl border border-[#002D28] p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-[#002D28] pb-3">
                      <h3 className="font-display font-bold text-sm sm:text-base text-white">
                        التوزيع الجغرافي حسب المدن الليبية
                      </h3>
                      <span className="text-xs font-mono-num text-[#00F0C6]">
                        {cities.length} مدن
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {cities.map((city) => {
                        const appCount = applications.filter(
                          (a) => a.city_name_ar === city.name_ar
                        ).length;
                        return (
                          <div
                            key={city.id}
                            className="p-3 rounded-xl bg-[#020807] border border-[#002D28] flex flex-col justify-between"
                          >
                            <div className="text-xs font-bold text-white">{city.name_ar}</div>
                            <div className="text-xs font-mono-num text-[#00F0C6] mt-1">
                              {appCount} تطبيق
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pending Submissions Quick Table */}
              <div className="bg-[#03110E] rounded-2xl border border-[#002D28] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-display font-bold text-white">
                      أحدث الطلبات المرسلة (سير العمل والاعتماد المباشر)
                    </h2>
                    <p className="text-xs text-[#A8B7B3]">
                      اعتمد طلبات التطبيقات ليتم نشرها بشعارها وأيقونتها مباشرة في الدليل العام
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('submissions')}
                    className="text-xs font-bold text-[#00F0C6] hover:underline cursor-pointer"
                  >
                    فتح مركز الطلبات الكامل ←
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-[#002D28] text-[#A8B7B3]">
                        <th className="py-2.5 font-semibold">الرقم المرجعي</th>
                        <th className="py-2.5 font-semibold">النوع</th>
                        <th className="py-2.5 font-semibold">اسم التطبيق / الطلب</th>
                        <th className="py-2.5 font-semibold">الشركة</th>
                        <th className="py-2.5 font-semibold">الحالة</th>
                        <th className="py-2.5 font-semibold">إجراء فوري</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#002D28]">
                      {submissions.slice(0, 5).map((sub) => (
                        <tr key={sub.id} className="hover:bg-[#002D28]/30">
                          <td className="py-3 font-mono-num text-xs font-semibold text-[#00F0C6]">
                            {sub.reference_number}
                          </td>
                          <td className="py-3 text-[#A8B7B3]">{sub.submission_type_label_ar}</td>
                          <td className="py-3 font-bold text-white">{sub.title_or_name}</td>
                          <td className="py-3 text-[#A8B7B3]">{sub.company_name}</td>
                          <td className="py-3">
                            <span
                              className={`text-xs font-bold ${
                                sub.status === 'approved'
                                  ? 'text-[#00F0C6]'
                                  : sub.status === 'rejected'
                                  ? 'text-red-400'
                                  : 'text-amber-300'
                              }`}
                            >
                              {sub.status === 'new'
                                ? 'جديد'
                                : sub.status === 'under_review'
                                ? 'قيد المراجعة'
                                : sub.status === 'approved'
                                ? 'معتمد ومنشور'
                                : 'مرفوض'}
                            </span>
                          </td>
                          <td className="py-3">
                            {sub.status !== 'approved' ? (
                              <button
                                type="button"
                                onClick={() => handleReviewSubmission(sub.id, 'approved')}
                                className="px-3 py-1.5 text-xs font-bold bg-[#00F0C6] hover:bg-[#39FFDB] text-[#020807] rounded-lg transition-colors cursor-pointer"
                              >
                                اعتماد ونشر
                              </button>
                            ) : (
                              <span className="text-xs text-[#A8B7B3]">تم الاعتماد</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ADVANCED APPLICATIONS & LOGO/ICON MANAGEMENT */}
          {activeTab === 'applications' && (
            <div className="bg-[#03110E] rounded-2xl border border-[#002D28] p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#002D28] pb-4">
                <div>
                  <h2 className="text-lg font-display font-bold text-white">
                    إدارة دليل التطبيقات والشعارات والأيقونات ({filteredApps.length} من{' '}
                    {applications.length})
                  </h2>
                  <p className="text-xs text-[#A8B7B3]">
                    تحكم كامل ببيانات كل تطبيق، حالة النشر والتوثيق، وتخصيص الشعار والأيقونة واللون المميز
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openCreateAppModal}
                  className="px-4 py-2.5 text-xs font-bold bg-[#00F0C6] hover:bg-[#39FFDB] text-[#020807] rounded-xl flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(0,240,198,0.2)]"
                >
                  <Plus className="w-4 h-4" />
                  <span>أضف تطبيقك</span>
                </button>
              </div>

              {/* Search & Filter Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#A8B7B3] absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={appSearch}
                    onChange={(e) => setAppSearch(e.target.value)}
                    placeholder="ابحث باسم التطبيق أو الشركة..."
                    className="w-full pr-10 pl-3.5 py-2 text-xs rounded-xl bg-[#020807] border border-[#002D28] text-white focus:outline-none focus:border-[#00F0C6]"
                  />
                </div>

                <select
                  value={appCatFilter}
                  onChange={(e) => setAppCatFilter(e.target.value)}
                  className="px-3.5 py-2 text-xs rounded-xl bg-[#020807] border border-[#002D28] text-white focus:outline-none focus:border-[#00F0C6]"
                >
                  <option value="all">جميع التصنيفات ({categories.length})</option>
                  {categories.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name_ar}
                    </option>
                  ))}
                </select>

                <select
                  value={appStatusFilter}
                  onChange={(e) => setAppStatusFilter(e.target.value)}
                  className="px-3.5 py-2 text-xs rounded-xl bg-[#020807] border border-[#002D28] text-white focus:outline-none focus:border-[#00F0C6]"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="active">نشط ومعتمد</option>
                  <option value="beta">إصدار تجريبي (Beta)</option>
                  <option value="upcoming">قريباً</option>
                  <option value="archived">مؤرشف</option>
                </select>
              </div>

              {/* Rich Applications List */}
              <div className="space-y-3">
                {filteredApps.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-2xl bg-[#020807] border border-[#002D28] hover:border-[#00483F] transition-all flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <AppBrandLogo app={app} size="md" />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-sm sm:text-base text-white">
                            {app.name_ar}
                          </span>
                          <span className="font-mono-num text-xs text-[#A8B7B3]">
                            ({app.name_en})
                          </span>
                          <span className="text-[11px] text-[#00F0C6] font-semibold">
                            · {app.category_name_ar}
                          </span>
                        </div>
                        <div className="text-xs text-[#A8B7B3] mt-0.5">
                          الشركة: <strong className="text-white">{app.company_name_ar}</strong> ·{' '}
                          {app.city_name_ar} · الأنظمة: {app.platforms.join(' / ')}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* Quick Pin to Homepage Button */}
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleApplicationField(app.id, 'is_featured', !app.is_featured)
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                          app.is_featured
                            ? 'bg-[#00F0C6] text-[#020807] border-[#00F0C6] shadow-[0_0_14px_rgba(0,240,198,0.25)]'
                            : 'bg-[#03110E] hover:bg-[#002D28] text-[#A8B7B3] hover:text-white border-[#002D28]'
                        }`}
                      >
                        <Pin className="w-3.5 h-3.5" />
                        <span>
                          {app.is_featured ? 'مثبت في الواجهة الرئيسية ✓' : 'تثبيت في الواجهة'}
                        </span>
                      </button>

                      {/* Quick Status Toggles */}
                      <label className="inline-flex items-center gap-1.5 text-xs text-[#A8B7B3] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={app.published}
                          onChange={(e) =>
                            handleToggleApplicationField(app.id, 'published', e.target.checked)
                          }
                          className="w-4 h-4 accent-[#00F0C6]"
                        />
                        <span>منشور</span>
                      </label>

                      <label className="inline-flex items-center gap-1.5 text-xs text-[#A8B7B3] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={app.is_verified}
                          onChange={(e) =>
                            handleToggleApplicationField(app.id, 'is_verified', e.target.checked)
                          }
                          className="w-4 h-4 accent-[#00F0C6]"
                        />
                        <span>موثق</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => openEditAppModal(app)}
                        className="px-3 py-1.5 rounded-xl bg-[#002D28] hover:bg-[#00483F] border border-[#00483F] text-xs font-bold text-[#00F0C6] flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>تعديل التطبيق والشعار</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteApplication(app)}
                        title="حذف التطبيق"
                        className="p-2 rounded-xl bg-red-950/50 hover:bg-red-900/70 border border-red-500/30 text-red-300 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DETAILED SUBMISSIONS WORKFLOW */}
          {activeTab === 'submissions' && (
            <div className="bg-[#03110E] rounded-2xl border border-[#002D28] p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#002D28] pb-4">
                <div>
                  <h2 className="text-lg font-display font-bold text-white">
                    مركز مراجعة واعتماد الطلبات ({submissions.length})
                  </h2>
                  <p className="text-xs text-[#A8B7B3]">
                    عند اعتماد طلب تطبيق، يتم إنشاء سجل التطبيق وشعاره وأيقونته وربطه بالشركة المطورة تلقائياً
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { key: 'all', label: 'الكل' },
                    { key: 'new', label: 'جديد' },
                    { key: 'under_review', label: 'قيد المراجعة' },
                    { key: 'approved', label: 'معتمد ومنشور' },
                    { key: 'rejected', label: 'مرفوض' },
                  ].map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setSubmissionFilter(f.key)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        submissionFilter === f.key
                          ? 'bg-[#00F0C6] text-[#020807]'
                          : 'bg-[#020807] text-[#A8B7B3] hover:text-white border border-[#002D28]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {filteredSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="border border-[#002D28] rounded-2xl p-5 bg-[#020807] space-y-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {sub.submission_type === 'app' && (
                          <AppBrandLogo
                            app={{
                              id: sub.id,
                              name_ar: sub.title_or_name,
                              logo_color: sub.payload?.logo_color || '#00F0C6',
                              logo_monogram:
                                sub.payload?.logo_monogram || sub.title_or_name.slice(0, 4),
                              logo_url: sub.payload?.logo_url || '',
                              icon_name: sub.payload?.icon_name || 'smartphone',
                              category_slug: 'fintech',
                              is_verified: true,
                            }}
                            size="md"
                          />
                        )}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-[#A8B7B3]">
                            <span className="font-mono-num font-bold text-[#00F0C6]">
                              {sub.reference_number}
                            </span>
                            <span>·</span>
                            <span className="font-semibold text-white">
                              {sub.submission_type_label_ar}
                            </span>
                            <span>·</span>
                            <span className="font-mono-num">{sub.created_at}</span>
                          </div>
                          <h3 className="text-base font-display font-bold text-white">
                            {sub.title_or_name}
                          </h3>
                          <div className="text-xs text-[#A8B7B3]">
                            الشركة المطورة / الجهة:{' '}
                            <strong className="text-white">{sub.company_name}</strong> · المسؤول:{' '}
                            {sub.contact_name} ({sub.contact_email} · {sub.contact_phone})
                          </div>
                        </div>
                      </div>

                      <div className="text-xs font-bold">
                        {sub.status === 'new' && (
                          <span className="text-amber-300">حالة الطلب: جديد</span>
                        )}
                        {sub.status === 'under_review' && (
                          <span className="text-sky-300">حالة الطلب: قيد المراجعة</span>
                        )}
                        {sub.status === 'approved' && (
                          <span className="text-[#00F0C6]">حالة الطلب: معتمد ومنشور</span>
                        )}
                        {sub.status === 'rejected' && (
                          <span className="text-red-400">حالة الطلب: مرفوض</span>
                        )}
                      </div>
                    </div>

                    <div
                      dir="ltr"
                      className="bg-[#03110E] rounded-xl p-3.5 border border-[#002D28] text-xs text-[#A8B7B3] space-y-1.5 text-left font-mono-num"
                    >
                      {Object.entries(sub.payload)
                        .filter(
                          ([k]) =>
                            k !== 'logo_url' &&
                            k !== 'icon_name' &&
                            k !== 'logo_color' &&
                            k !== 'logo_monogram' &&
                            k !== 'full_description_ar' &&
                            k !== 'full_description'
                        )
                        .map(([k, v]) => {
                          const formatted = formatPayloadEntryInEnglish(k, v);
                          return (
                            <div key={k} className="flex flex-wrap gap-1.5">
                              <span className="text-[#6B7C77]">{formatted.key}:</span>
                              <span className="text-white font-medium">{formatted.value}</span>
                            </div>
                          );
                        })}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <input
                        type="text"
                        placeholder="أضف ملاحظات المراجعة الإدارية (تُحفظ في سجل الطلب)..."
                        value={notesDraft[sub.id] ?? sub.admin_notes ?? ''}
                        onChange={(e) =>
                          setNotesDraft({ ...notesDraft, [sub.id]: e.target.value })
                        }
                        className="flex-1 min-w-[240px] px-3.5 py-2 text-xs rounded-xl bg-[#03110E] border border-[#002D28] text-white focus:outline-none focus:border-[#00F0C6]"
                      />

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleReviewSubmission(sub.id, 'under_review')}
                          className="px-3 py-2 text-xs font-semibold bg-[#03110E] hover:bg-[#002D28] text-white border border-[#00483F] rounded-xl cursor-pointer"
                        >
                          قيد المراجعة
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReviewSubmission(sub.id, 'approved')}
                          className="px-4 py-2 text-xs font-bold bg-[#00F0C6] hover:bg-[#39FFDB] text-[#020807] rounded-xl flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>اعتماد ونشر فوري</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReviewSubmission(sub.id, 'rejected')}
                          className="px-3 py-2 text-xs font-semibold bg-red-950/60 hover:bg-red-900/60 text-red-200 border border-red-500/30 rounded-xl flex items-center gap-1 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>رفض</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: COMPANIES & DEVELOPERS CRUD */}
          {activeTab === 'companies' && (
            <div className="bg-[#03110E] rounded-2xl border border-[#002D28] p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#002D28] pb-4">
                <div>
                  <h2 className="text-lg font-display font-bold text-white">
                    إدارة الشركات التقنية والمطورين ({companies.length})
                  </h2>
                  <p className="text-xs text-[#A8B7B3]">
                    إضافة وتوثيق الشركات الليبية المطورة للتطبيقات والأنظمة الرقمية
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCompanyModalOpen(true)}
                  className="px-4 py-2.5 text-xs font-bold bg-[#00F0C6] hover:bg-[#39FFDB] text-[#020807] rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة شركة تقنية جديدة</span>
                </button>
              </div>

              <div className="relative max-w-md">
                <Search className="w-4 h-4 text-[#A8B7B3] absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={companySearch}
                  onChange={(e) => setCompanySearch(e.target.value)}
                  placeholder="ابحث باسم الشركة أو التخصص..."
                  className="w-full pr-10 pl-3.5 py-2 text-xs rounded-xl bg-[#020807] border border-[#002D28] text-white focus:outline-none focus:border-[#00F0C6]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCompanies.map((c) => {
                  const companyApps = applications.filter((a) => a.company_id === c.id);
                  return (
                    <div
                      key={c.id}
                      className="p-5 rounded-2xl border border-[#002D28] bg-[#020807] space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-display font-bold text-base text-white">
                              {c.name_ar}
                            </h3>
                            <p className="text-xs text-[#A8B7B3]">
                              {c.city_name_ar} · تأسست {c.established_year} · {c.specialization_ar}
                            </p>
                          </div>
                          <span className="font-mono-num text-xs text-[#00F0C6] bg-[#002D28] px-2.5 py-1 rounded-lg">
                            {companyApps.length} تطبيقات
                          </span>
                        </div>
                        <p className="text-xs text-[#A8B7B3] line-clamp-2 leading-relaxed">
                          {c.description_ar}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#002D28] flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <label className="inline-flex items-center gap-1.5 text-xs text-[#A8B7B3] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={c.is_verified}
                              onChange={(e) =>
                                handleToggleCompanyField(c.id, 'is_verified', e.target.checked)
                              }
                              className="w-4 h-4 accent-[#00F0C6]"
                            />
                            <span>شركة موثقة</span>
                          </label>
                          <label className="inline-flex items-center gap-1.5 text-xs text-[#A8B7B3] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={c.is_featured}
                              onChange={(e) =>
                                handleToggleCompanyField(c.id, 'is_featured', e.target.checked)
                              }
                              className="w-4 h-4 accent-[#00F0C6]"
                            />
                            <span>مميزة</span>
                          </label>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteCompany(c)}
                          className="p-1.5 rounded-lg bg-red-950/50 text-red-300 hover:bg-red-900/70 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: CATEGORIES & LAUNCHPAD MANAGEMENT */}
          {activeTab === 'categories_launches' && (
            <div className="space-y-6">
              {/* Launchpad Manager */}
              <div className="bg-[#03110E] rounded-2xl border border-[#002D28] p-6 space-y-5">
                <div className="border-b border-[#002D28] pb-3">
                  <h2 className="text-lg font-display font-bold text-white">
                    إدارة منصة إطلاق التطبيقات (Launchpad Releases)
                  </h2>
                  <p className="text-xs text-[#A8B7B3]">
                    إضافة وإدارة الإصدارات الجديدة والتحديثات الكبرى للتطبيقات الليبية
                  </p>
                </div>

                <form
                  onSubmit={handleCreateLaunch}
                  className="p-4 rounded-xl bg-[#020807] border border-[#00483F] grid grid-cols-1 sm:grid-cols-3 gap-3"
                >
                  <input
                    type="text"
                    required
                    value={launchDraft.title_ar}
                    onChange={(e) =>
                      setLaunchDraft({ ...launchDraft, title_ar: e.target.value })
                    }
                    placeholder="عنوان الإطلاق (مثال: إطلاق سداد 4.0)"
                    className={inputClass}
                  />
                  <select
                    value={launchDraft.application_id}
                    onChange={(e) =>
                      setLaunchDraft({
                        ...launchDraft,
                        application_id: Number(e.target.value),
                      })
                    }
                    className={inputClass}
                  >
                    {applications.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name_ar}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={launchDraft.version_tag}
                    onChange={(e) =>
                      setLaunchDraft({ ...launchDraft, version_tag: e.target.value })
                    }
                    placeholder="رقم الإصدار (v2.1.0)"
                    dir="ltr"
                    className={inputClass}
                  />
                  <input
                    type="text"
                    required
                    value={launchDraft.summary_ar}
                    onChange={(e) =>
                      setLaunchDraft({ ...launchDraft, summary_ar: e.target.value })
                    }
                    placeholder="ملخص مزايا الإصدار الجديد..."
                    className={`sm:col-span-2 ${inputClass}`}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 text-xs font-bold bg-[#00F0C6] hover:bg-[#39FFDB] text-[#020807] rounded-xl cursor-pointer"
                  >
                    + نشر في منصة الإطلاق
                  </button>
                </form>

                <div className="space-y-3">
                  {launches.map((l) => (
                    <div
                      key={l.id}
                      className="p-4 rounded-xl bg-[#020807] border border-[#002D28] flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="text-xs text-[#00F0C6] font-semibold">
                          {l.launch_type_label_ar} · <span className="font-mono-num">{l.version_tag}</span> ·{' '}
                          <span className="font-mono-num">{l.launch_date}</span>
                        </div>
                        <div className="text-sm font-bold text-white mt-0.5">{l.title_ar}</div>
                        <div className="text-xs text-[#A8B7B3] mt-0.5">{l.summary_ar}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteLaunch(l.id)}
                        className="p-2 rounded-lg bg-red-950/50 text-red-300 hover:bg-red-900/70 cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categories Overview */}
              <div className="bg-[#03110E] rounded-2xl border border-[#002D28] p-6 space-y-4">
                <h2 className="text-lg font-display font-bold text-white">
                  التصنيفات المعتمدة في الدليل ({categories.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map((cat) => {
                    const count = applications.filter((a) => a.category_id === cat.id).length;
                    return (
                      <div
                        key={cat.id}
                        className="p-4 rounded-xl bg-[#020807] border border-[#002D28] space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-white">{cat.name_ar}</span>
                          <span className="font-mono-num text-xs text-[#00F0C6]">{count} تطبيق</span>
                        </div>
                        <p className="text-xs text-[#A8B7B3] line-clamp-2">{cat.description_ar}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SETTINGS, HOMEPAGE STATS, FOOTER, CONTACT, SOCIAL LINKS & AUDIT LOGS */}
          {activeTab === 'settings_security' && (
            <div className="space-y-6">
              {settings && (
                <form
                  onSubmit={handleSaveSettings}
                  className="bg-[#03110E] rounded-2xl border border-[#002D28] p-6 space-y-6"
                >
                  <div className="border-b border-[#002D28] pb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-display font-bold text-white">
                        إعدادات الواجهة الرئيسية، الإحصائيات الأربع، الفوتر، والتواصل الاجتماعي
                      </h2>
                      <p className="text-xs text-[#A8B7B3]">
                        تحكم كامل بإحصائيات الصفحة الرئيسية وفوتر الموقع ومعلومات التواصل وصفحات التواصل الاجتماعي
                      </p>
                    </div>
                    <button
                      type="submit"
                      className="px-6 py-2.5 text-xs font-bold bg-[#00F0C6] hover:bg-[#39FFDB] text-[#020807] rounded-xl transition-colors cursor-pointer shadow-[0_0_15px_rgba(0,240,198,0.2)]"
                    >
                      حفظ وتطبيق جميع الإعدادات
                    </button>
                  </div>

                  {/* 1. Control over the 4 Homepage Statistics */}
                  <div className="p-5 rounded-2xl bg-[#020807] border border-[#00483F] space-y-4">
                    <div>
                      <h3 className="text-sm font-display font-bold text-[#00F0C6]">
                        التحكم في إحصائيات الواجهة الرئيسية (الأرقام والعناوين الأربعة)
                      </h3>
                      <p className="text-xs text-[#A8B7B3]">
                        عدل القيم (+9، +6، +12، +3) والعناوين والوصف الفرعي ليتم تحديثها مباشرة في الصفحة الرئيسية
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(settings.homepage_stats && settings.homepage_stats.length > 0
                        ? settings.homepage_stats
                        : DEFAULT_HOMEPAGE_STATS
                      ).map((stat, idx) => (
                        <div
                          key={stat.id || idx}
                          className="p-4 rounded-xl bg-[#03110E] border border-[#002D28] space-y-3"
                        >
                          <div className="flex items-center justify-between text-xs font-bold text-[#00F0C6]">
                            <span>البطاقة الإحصائية #{idx + 1}</span>
                            <span dir="ltr" className="font-mono-num text-white">
                              {stat.value}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <div>
                              <label className="block text-[11px] text-[#A8B7B3] mb-1">
                                الرقم (مثال: +9)
                              </label>
                              <input
                                type="text"
                                dir="ltr"
                                value={stat.value}
                                onChange={(e) => {
                                  const currentStats = [
                                    ...(settings.homepage_stats &&
                                    settings.homepage_stats.length > 0
                                      ? settings.homepage_stats
                                      : DEFAULT_HOMEPAGE_STATS),
                                  ];
                                  currentStats[idx] = {
                                    ...currentStats[idx],
                                    value: e.target.value,
                                  };
                                  setSettings({ ...settings, homepage_stats: currentStats });
                                }}
                                className={inputClass}
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-[11px] text-[#A8B7B3] mb-1">
                                العنوان الرئيسي
                              </label>
                              <input
                                type="text"
                                value={stat.label_ar}
                                onChange={(e) => {
                                  const currentStats = [
                                    ...(settings.homepage_stats &&
                                    settings.homepage_stats.length > 0
                                      ? settings.homepage_stats
                                      : DEFAULT_HOMEPAGE_STATS),
                                  ];
                                  currentStats[idx] = {
                                    ...currentStats[idx],
                                    label_ar: e.target.value,
                                  };
                                  setSettings({ ...settings, homepage_stats: currentStats });
                                }}
                                className={inputClass}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] text-[#A8B7B3] mb-1">
                              الوصف الفرعي تحت الإحصائية
                            </label>
                            <input
                              type="text"
                              value={stat.subtitle_ar}
                              onChange={(e) => {
                                const currentStats = [
                                  ...(settings.homepage_stats &&
                                  settings.homepage_stats.length > 0
                                    ? settings.homepage_stats
                                    : DEFAULT_HOMEPAGE_STATS),
                                ];
                                currentStats[idx] = {
                                  ...currentStats[idx],
                                  subtitle_ar: e.target.value,
                                };
                                setSettings({ ...settings, homepage_stats: currentStats });
                              }}
                              className={inputClass}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. Hero & SEO Texts */}
                  <div className="p-5 rounded-2xl bg-[#020807] border border-[#002D28] space-y-4">
                    <h3 className="text-sm font-display font-bold text-[#00F0C6]">
                      نصوص الواجهة الرئيسية ومحركات البحث (SEO)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#A8B7B3] mb-1">
                          العنوان الرئيسي في الواجهة (Hero Heading)
                        </label>
                        <input
                          type="text"
                          value={settings.hero_heading_ar}
                          onChange={(e) =>
                            setSettings({ ...settings, hero_heading_ar: e.target.value })
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#A8B7B3] mb-1">
                          عنوان SEO الافتراضي
                        </label>
                        <input
                          type="text"
                          value={settings.seo_default_title}
                          onChange={(e) =>
                            setSettings({ ...settings, seo_default_title: e.target.value })
                          }
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#A8B7B3] mb-1">
                        الوصف التعريفي في الواجهة الرئيسية
                      </label>
                      <textarea
                        rows={2}
                        value={settings.hero_description_ar}
                        onChange={(e) =>
                          setSettings({ ...settings, hero_description_ar: e.target.value })
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* 3. Footer & Contact Information Control */}
                  <div className="p-5 rounded-2xl bg-[#020807] border border-[#00483F] space-y-4">
                    <div>
                      <h3 className="text-sm font-display font-bold text-[#00F0C6]">
                        التحكم في فوتر الموقع ومعلومات التواصل الرسمية
                      </h3>
                      <p className="text-xs text-[#A8B7B3]">
                        تعديل النبذة التعريفية في الفوتر، حقوق النشر، البريد الإلكتروني، رقم الهاتف، والمقر الرئيسي
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#A8B7B3] mb-1">
                          البريد الإلكتروني الرسمي
                        </label>
                        <input
                          type="email"
                          dir="ltr"
                          value={settings.contact_email}
                          onChange={(e) =>
                            setSettings({ ...settings, contact_email: e.target.value })
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#A8B7B3] mb-1">
                          رقم الهاتف الرسمي
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          value={settings.contact_phone}
                          onChange={(e) =>
                            setSettings({ ...settings, contact_phone: e.target.value })
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#A8B7B3] mb-1">
                          العنوان / المقر الرئيسي
                        </label>
                        <input
                          type="text"
                          value={settings.headquarters_ar}
                          onChange={(e) =>
                            setSettings({ ...settings, headquarters_ar: e.target.value })
                          }
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#A8B7B3] mb-1">
                          النبذة التعريفية في فوتر الموقع
                        </label>
                        <textarea
                          rows={2}
                          value={
                            settings.footer_description_ar ??
                            'المنصة الوطنية لتوثيق واستعراض التطبيقات الليبية والشركات التقنية المطورة لها ومنصة إطلاق المنتجات الرقمية.'
                          }
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              footer_description_ar: e.target.value,
                            })
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#A8B7B3] mb-1">
                          نص حقوق النشر أسفل الفوتر (Copyright)
                        </label>
                        <textarea
                          rows={2}
                          value={
                            settings.footer_copyright_ar ??
                            'جميع الحقوق محفوظة © 2026 منصة التطبيقات الليبية — LIBYA APPS.'
                          }
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              footer_copyright_ar: e.target.value,
                            })
                          }
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. Social Media Pages Control */}
                  <div className="p-5 rounded-2xl bg-[#020807] border border-[#00483F] space-y-4">
                    <div>
                      <h3 className="text-sm font-display font-bold text-[#00F0C6]">
                        روابط صفحات مواقع التواصل الاجتماعي
                      </h3>
                      <p className="text-xs text-[#A8B7B3]">
                        تظهر هذه الروابط في فوتر الموقع الرسمي للزوار
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#A8B7B3] mb-1">
                          صفحة فيسبوك (Facebook)
                        </label>
                        <input
                          type="url"
                          dir="ltr"
                          value={settings.social_links?.facebook || ''}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              social_links: {
                                ...settings.social_links,
                                facebook: e.target.value,
                              },
                            })
                          }
                          placeholder="https://facebook.com/..."
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#A8B7B3] mb-1">
                          صفحة انستقرام (Instagram)
                        </label>
                        <input
                          type="url"
                          dir="ltr"
                          value={settings.social_links?.instagram || ''}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              social_links: {
                                ...settings.social_links,
                                instagram: e.target.value,
                              },
                            })
                          }
                          placeholder="https://instagram.com/..."
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#A8B7B3] mb-1">
                          منصة إكس / تويتر (X / Twitter)
                        </label>
                        <input
                          type="url"
                          dir="ltr"
                          value={settings.social_links?.x || ''}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              social_links: {
                                ...settings.social_links,
                                x: e.target.value,
                              },
                            })
                          }
                          placeholder="https://x.com/..."
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#A8B7B3] mb-1">
                          صفحة لينكدإن (LinkedIn)
                        </label>
                        <input
                          type="url"
                          dir="ltr"
                          value={settings.social_links?.linkedin || ''}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              social_links: {
                                ...settings.social_links,
                                linkedin: e.target.value,
                              },
                            })
                          }
                          placeholder="https://linkedin.com/company/..."
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#A8B7B3] mb-1">
                          قناة يوتيوب (YouTube)
                        </label>
                        <input
                          type="url"
                          dir="ltr"
                          value={settings.social_links?.youtube || ''}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              social_links: {
                                ...settings.social_links,
                                youtube: e.target.value,
                              },
                            })
                          }
                          placeholder="https://youtube.com/@..."
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 text-xs font-bold bg-[#00F0C6] hover:bg-[#39FFDB] text-[#020807] rounded-xl transition-colors cursor-pointer"
                  >
                    حفظ وتطبيق الإعدادات
                  </button>
                </form>
              )}

              {/* Audit Logs */}
              <div className="bg-[#03110E] rounded-2xl border border-[#002D28] p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-display font-bold text-white">
                    سجل التدقيق الأمني والعمليات (Audit Logs)
                  </h2>
                  <input
                    type="text"
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    placeholder="ابحث في سجل العمليات..."
                    className="px-3.5 py-1.5 text-xs rounded-xl bg-[#020807] border border-[#002D28] text-white"
                  />
                </div>
                <div className="space-y-2.5 max-h-96 overflow-y-auto">
                  {filteredAuditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-xl bg-[#020807] border border-[#002D28] flex flex-wrap items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-white">
                          {log.entity_label} —{' '}
                          <span className="font-mono-num text-[#00F0C6]">{log.action_type}</span>
                        </div>
                        <div className="text-[#A8B7B3]">{log.details_ar}</div>
                      </div>
                      <div className="text-left text-[#A8B7B3] font-mono-num">
                        <div>
                          {log.actor_name} ({log.actor_role_ar})
                        </div>
                        <div>
                          {log.created_at} · IP: {log.ip_address}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: FULL APPLICATION & LOGO/ICON EDITOR */}
      {appModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020807]/85 backdrop-blur-md"
          onClick={(e) => {
            if (e.target === e.currentTarget) setAppModalOpen(false);
          }}
          dir="rtl"
        >
          <div className="relative w-full max-w-3xl bg-[#03110E] border border-[#00483F] rounded-2xl shadow-2xl p-6 md:p-8 max-h-[92vh] overflow-y-auto text-white">
            <div className="flex items-center justify-between pb-4 border-b border-[#002D28] mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#002D28] border border-[#00483F] flex items-center justify-center text-[#00F0C6]">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingAppId
                      ? `تعديل التطبيق وتخصيص الشعار والأيقونة — ${appFormDraft.name_ar}`
                      : 'إضافة تطبيق جديد مع تخصيص الشعار والأيقونة'}
                  </h3>
                  <p className="text-xs text-[#A8B7B3]">
                    تحكم كامل بهوية التطبيق البصرية، الشعار، الأيقونة، الروابط، والتفاصيل
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAppModalOpen(false)}
                className="p-2 text-[#A8B7B3] hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveApplicationModal} className="space-y-5">
              {/* Application Logo Upload & Brand Logo Picker */}
              <div className="p-5 rounded-2xl bg-[#020807] border border-[#00483F] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#002D28] pb-4">
                  <div className="flex items-center gap-4">
                    <AppBrandLogo
                      app={{
                        id: editingAppId || 1,
                        name_ar: appFormDraft.name_ar || 'تطبيق جديد',
                        logo_color: appFormDraft.logo_color,
                        logo_monogram:
                          appFormDraft.logo_monogram ||
                          (appFormDraft.name_ar || 'APP').slice(0, 4),
                        logo_url: appFormDraft.logo_url,
                        icon_name: appFormDraft.icon_name,
                        category_slug: 'fintech',
                        is_verified: appFormDraft.is_verified,
                      }}
                      size="lg"
                    />
                    <div>
                      <div className="text-xs font-bold text-[#00F0C6]">
                        شعار التطبيق المرفوع
                      </div>
                      <div className="text-base font-bold text-white mt-0.5">
                        {appFormDraft.name_ar || 'اسم التطبيق'}
                      </div>
                      <div className="text-xs text-[#A8B7B3]">
                        يظهر الشعار المرفوع مباشرة أمام التطبيق في الصفحة الرئيسية ودليل التطبيقات
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="px-4 py-2 text-xs font-bold bg-[#002D28] hover:bg-[#00483F] border border-[#00483F] text-[#00F0C6] rounded-xl cursor-pointer flex items-center gap-1.5">
                      <FileUp className="w-4 h-4" />
                      <span>رفع صورة شعار خاص</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAppLogoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Recognizable Brand Logos Quick Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#A8B7B3]">
                    أو اختر من شعارات التطبيقات الجاهزة (Facebook, Instagram, Twitter, WhatsApp, ...):
                  </label>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {Object.entries(INITIAL_BRAND_LOGOS).map(([key, item]) => {
                      const active = appFormDraft.logo_url === item.dataUrl;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() =>
                            setAppFormDraft({ ...appFormDraft, logo_url: item.dataUrl })
                          }
                          className={`px-3 py-2 rounded-xl border text-xs flex items-center gap-2 transition-all cursor-pointer ${
                            active
                              ? 'bg-[#002D28] border-[#00F0C6] text-white'
                              : 'bg-[#03110E] border-[#002D28] text-[#A8B7B3] hover:text-white'
                          }`}
                        >
                          <img
                            src={item.dataUrl}
                            alt={item.label}
                            className="w-6 h-6 rounded-lg object-cover"
                          />
                          <span className="font-semibold text-[11px]">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A8B7B3] mb-1">
                    أو الصق رابط مباشر لصورة الشعار (URL)
                  </label>
                  <input
                    type="url"
                    dir="ltr"
                    value={appFormDraft.logo_url.startsWith('data:') ? '' : appFormDraft.logo_url}
                    onChange={(e) =>
                      setAppFormDraft({ ...appFormDraft, logo_url: e.target.value })
                    }
                    placeholder="https://example.ly/logo.png"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Core Application Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A8B7B3] mb-1">
                    اسم التطبيق (بالعربية) *
                  </label>
                  <input
                    type="text"
                    required
                    value={appFormDraft.name_ar}
                    onChange={(e) =>
                      setAppFormDraft({ ...appFormDraft, name_ar: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A8B7B3] mb-1">
                    الاسم بالإنجليزية
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={appFormDraft.name_en}
                    onChange={(e) =>
                      setAppFormDraft({ ...appFormDraft, name_en: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A8B7B3] mb-1">
                    التصنيف
                  </label>
                  <select
                    value={appFormDraft.category_id}
                    onChange={(e) =>
                      setAppFormDraft({
                        ...appFormDraft,
                        category_id: Number(e.target.value),
                      })
                    }
                    className={inputClass}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name_ar}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A8B7B3] mb-1">
                    الشركة المطورة
                  </label>
                  <select
                    value={appFormDraft.company_id}
                    onChange={(e) =>
                      setAppFormDraft({
                        ...appFormDraft,
                        company_id: Number(e.target.value),
                      })
                    }
                    className={inputClass}
                  >
                    {companies.map((comp) => (
                      <option key={comp.id} value={comp.id}>
                        {comp.name_ar}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A8B7B3] mb-1">
                    المدينة
                  </label>
                  <select
                    value={appFormDraft.city_id}
                    onChange={(e) =>
                      setAppFormDraft({ ...appFormDraft, city_id: Number(e.target.value) })
                    }
                    className={inputClass}
                  >
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name_ar}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A8B7B3] mb-1">
                    حالة التطبيق
                  </label>
                  <select
                    value={appFormDraft.status}
                    onChange={(e) =>
                      setAppFormDraft({
                        ...appFormDraft,
                        status: e.target.value as ApplicationStatus,
                      })
                    }
                    className={inputClass}
                  >
                    <option value="active">نشط ومعتمد</option>
                    <option value="beta">إصدار تجريبي (Beta)</option>
                    <option value="upcoming">قريباً</option>
                    <option value="archived">مؤرشف</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A8B7B3] mb-1">
                  الوصف المختصر *
                </label>
                <input
                  type="text"
                  required
                  value={appFormDraft.short_description_ar}
                  onChange={(e) =>
                    setAppFormDraft({
                      ...appFormDraft,
                      short_description_ar: e.target.value,
                    })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A8B7B3] mb-1">
                  الوصف التفصيلي
                </label>
                <textarea
                  rows={2}
                  value={appFormDraft.full_description_ar}
                  onChange={(e) =>
                    setAppFormDraft({
                      ...appFormDraft,
                      full_description_ar: e.target.value,
                    })
                  }
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A8B7B3] mb-1">
                    الموقع الرسمي
                  </label>
                  <input
                    type="url"
                    dir="ltr"
                    value={appFormDraft.website_url}
                    onChange={(e) =>
                      setAppFormDraft({ ...appFormDraft, website_url: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A8B7B3] mb-1">
                    رابط Google Play
                  </label>
                  <input
                    type="url"
                    dir="ltr"
                    value={appFormDraft.android_url}
                    onChange={(e) =>
                      setAppFormDraft({ ...appFormDraft, android_url: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A8B7B3] mb-1">
                    رابط App Store
                  </label>
                  <input
                    type="url"
                    dir="ltr"
                    value={appFormDraft.ios_url}
                    onChange={(e) =>
                      setAppFormDraft({ ...appFormDraft, ios_url: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 p-3.5 rounded-xl bg-[#020807] border border-[#002D28]">
                <label className="inline-flex items-center gap-2 text-xs font-bold text-[#00F0C6] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={appFormDraft.is_featured}
                    onChange={(e) =>
                      setAppFormDraft({ ...appFormDraft, is_featured: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#00F0C6]"
                  />
                  <span>تثبيت التطبيق في الواجهة الرئيسية للموقع</span>
                </label>

                <label className="inline-flex items-center gap-2 text-xs text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={appFormDraft.published}
                    onChange={(e) =>
                      setAppFormDraft({ ...appFormDraft, published: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#00F0C6]"
                  />
                  <span>منشور في الدليل العام</span>
                </label>

                <label className="inline-flex items-center gap-2 text-xs text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={appFormDraft.is_verified}
                    onChange={(e) =>
                      setAppFormDraft({ ...appFormDraft, is_verified: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#00F0C6]"
                  />
                  <span>تطبيق موثق رسمياً</span>
                </label>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#002D28]">
                <div className="flex items-center gap-2">
                  {(['Android', 'iOS', 'Web'] as PlatformOS[]).map((os) => (
                    <button
                      key={os}
                      type="button"
                      onClick={() => toggleDraftPlatform(os)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                        appFormDraft.platforms.includes(os)
                          ? 'bg-[#002D28] text-[#00F0C6] border-[#00F0C6]'
                          : 'bg-[#020807] text-[#A8B7B3] border-[#002D28]'
                      }`}
                    >
                      {os}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setAppModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-[#002D28] text-xs font-semibold text-white cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#00F0C6] hover:bg-[#39FFDB] text-[#020807] font-bold text-xs cursor-pointer shadow-[0_0_20px_rgba(0,240,198,0.25)]"
                  >
                    {editingAppId ? 'حفظ التعديلات والشعار' : 'إضافة ونشر التطبيق'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE COMPANY */}
      {companyModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020807]/85 backdrop-blur-md"
          onClick={(e) => {
            if (e.target === e.currentTarget) setCompanyModalOpen(false);
          }}
          dir="rtl"
        >
          <div className="relative w-full max-w-xl bg-[#03110E] border border-[#00483F] rounded-2xl shadow-2xl p-6 md:p-8 text-white">
            <div className="flex items-center justify-between pb-4 border-b border-[#002D28] mb-5">
              <h3 className="text-lg font-bold text-white">إضافة شركة تقنية جديدة</h3>
              <button
                type="button"
                onClick={() => setCompanyModalOpen(false)}
                className="p-2 text-[#A8B7B3] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCompany} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A8B7B3] mb-1">
                    اسم الشركة (بالعربية) *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyDraft.name_ar}
                    onChange={(e) =>
                      setCompanyDraft({ ...companyDraft, name_ar: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A8B7B3] mb-1">
                    الاسم بالإنجليزية
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={companyDraft.name_en}
                    onChange={(e) =>
                      setCompanyDraft({ ...companyDraft, name_en: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A8B7B3] mb-1">
                    التخصص التقني *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyDraft.specialization_ar}
                    onChange={(e) =>
                      setCompanyDraft({ ...companyDraft, specialization_ar: e.target.value })
                    }
                    placeholder="مثال: تطوير تطبيقات الهواتف والمدفوعات"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A8B7B3] mb-1">
                    المدينة
                  </label>
                  <select
                    value={companyDraft.city_id}
                    onChange={(e) =>
                      setCompanyDraft({ ...companyDraft, city_id: Number(e.target.value) })
                    }
                    className={inputClass}
                  >
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name_ar}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A8B7B3] mb-1">
                  نبذة عن الشركة
                </label>
                <textarea
                  rows={2}
                  value={companyDraft.description_ar}
                  onChange={(e) =>
                    setCompanyDraft({ ...companyDraft, description_ar: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#002D28]">
                <button
                  type="button"
                  onClick={() => setCompanyModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#002D28] text-xs text-white cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#00F0C6] text-[#020807] font-bold text-xs cursor-pointer"
                >
                  حفظ وإدراج الشركة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
