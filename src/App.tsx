import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  Building2,
  Check,
  ChevronLeft,
  Copy,
  Globe,
  Mail,
  MapPin,
  Menu,
  Phone,
  Pin,
  Rocket,
  Search,
  Share2,
  Smartphone,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import {
  AdvertisementBanner,
  ApplicationCategory,
  ApplicationItem,
  City,
  Company,
  LaunchEvent,
  NewsCategory,
  PlatformOS,
  SponsorRecord,
  WebsiteSettings,
} from './types/platform';
import {
  AppBrandLogo,
  AppIconVector,
  AppScreenshotArtwork,
  HeroInteractiveBackdrop,
  InteractiveImageSlideshow,
  LibyaAppsPolygonIcon,
  SocialPlatformIcon,
  resolveAppIconName,
} from './components/VisualAssets';
import { SeoHead } from './components/SeoHead';
import { FilamentAdminView } from './components/FilamentAdminView';
import {
  PublicSubmissionView,
  SubmissionFormTab,
} from './components/PublicSubmissionView';
import { ArchitectureView } from './components/ArchitectureView';
import {
  PrivacyPolicyModal,
  QuickAppRegistrationModal,
} from './components/InteractiveModals';

interface HomepagePayload {
  settings: WebsiteSettings;
  statistics: {
    registered_applications: number;
    technology_companies: number;
    published_news_articles: number;
    application_categories: number;
  };
  featured_applications: ApplicationItem[];
  categories: ApplicationCategory[];
  featured_companies: Company[];
  launchpad_events: LaunchEvent[];
  sponsors: SponsorRecord[];
  banners: AdvertisementBanner[];
}

export default function App() {
  const [route, setRoute] = useState<string>(() => {
    const p = window.location.pathname;
    return p && p !== '/index.html' ? p : '/';
  });
  const [submissionInitialTab, setSubmissionInitialTab] =
    useState<SubmissionFormTab>('app');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedShareUrl, setCopiedShareUrl] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Interactive Modals & Hero State
  const [heroSlide, setHeroSlide] = useState(0);
  const [homeCategoryFilter, setHomeCategoryFilter] = useState<string>('all');
  const [quickAppModalOpen, setQuickAppModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);

  // Global & Homepage data
  const [homepageData, setHomepageData] = useState<HomepagePayload | null>(null);
  const [allCategories, setAllCategories] = useState<ApplicationCategory[]>([]);
  const [allNewsCategories, setAllNewsCategories] = useState<NewsCategory[]>([]);
  const [allCities, setAllCities] = useState<City[]>([]);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Global Search Bar State
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [globalSearchResults, setGlobalSearchResults] = useState<{
    applications: ApplicationItem[];
    companies: Company[];
  } | null>(null);

  // Directory (/apps) state
  const [appsList, setAppsList] = useState<ApplicationItem[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appFilters, setAppFilters] = useState({
    q: '',
    category: '',
    city: '',
    platform: '',
    app_type: '',
    status: '',
    featured: false,
    verified: false,
    sort: 'featured',
  });

  // App Details (/apps/:slug) state
  const [activeAppDetail, setActiveAppDetail] = useState<{
    application: ApplicationItem;
    company: Company | null;
    similar_applications: ApplicationItem[];
  } | null>(null);

  // Companies (/companies & /companies/:slug) state
  const [companiesList, setCompaniesList] = useState<Company[]>([]);
  const [companyFilters, setCompanyFilters] = useState({
    q: '',
    city: '',
    verified: false,
  });
  const [activeCompanyDetail, setActiveCompanyDetail] = useState<{
    company: Company;
    applications: ApplicationItem[];
  } | null>(null);

  // Launchpad (/launchpad) state
  const [launchesList, setLaunchesList] = useState<LaunchEvent[]>([]);
  const [launchTypeFilter, setLaunchTypeFilter] = useState('');

  const navigate = (newRoute: string, tab?: SubmissionFormTab) => {
    if (tab) {
      setSubmissionInitialTab(tab);
    }
    window.history.pushState({}, '', newRoute);
    setRoute(newRoute);
    setMobileMenuOpen(false);
    setGlobalSearchResults(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const onPopState = () => {
      setRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Load Homepage & Taxonomies
  useEffect(() => {
    async function loadInitial() {
      try {
        const res = await fetch('/api/v1/homepage');
        const json = await res.json();
        if (json.status === 'success') {
          setHomepageData(json.data);
          setAllCategories(json.data.categories || []);
        }
        const adminRes = await fetch('/api/v1/admin/overview');
        const adminJson = await adminRes.json();
        if (adminJson.status === 'success') {
          setAllCities(adminJson.data.cities || []);
          setAllNewsCategories(adminJson.data.news_categories || []);
        }
      } catch (e) {
        console.error('Error loading homepage data', e);
      }
    }
    loadInitial();
  }, [refreshCounter]);

  // Global Instant Search
  useEffect(() => {
    const q = globalSearchQuery.trim();
    if (q.length < 2) {
      setGlobalSearchResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/v1/search?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        if (json.status === 'success') {
          setGlobalSearchResults({
            applications: json.data.applications || [],
            companies: json.data.companies || [],
          });
        }
      } catch (e) {
        console.error(e);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [globalSearchQuery]);

  // Load Apps Directory when on /apps
  useEffect(() => {
    if (route !== '/apps') return;
    async function fetchApps() {
      setAppsLoading(true);
      try {
        const params = new URLSearchParams();
        if (appFilters.q) params.set('q', appFilters.q);
        if (appFilters.category) params.set('category', appFilters.category);
        if (appFilters.city) params.set('city', appFilters.city);
        if (appFilters.platform) params.set('platform', appFilters.platform);
        if (appFilters.app_type) params.set('app_type', appFilters.app_type);
        if (appFilters.status) params.set('status', appFilters.status);
        if (appFilters.featured) params.set('featured', 'true');
        if (appFilters.verified) params.set('verified', 'true');
        if (appFilters.sort) params.set('sort', appFilters.sort);

        const res = await fetch(`/api/v1/apps?${params.toString()}`);
        const json = await res.json();
        if (json.status === 'success') {
          setAppsList(json.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setAppsLoading(false);
      }
    }
    fetchApps();
  }, [route, appFilters, refreshCounter]);

  // Load Single App Details when on /apps/:slug
  useEffect(() => {
    if (!route.startsWith('/apps/')) return;
    const slug = route.replace('/apps/', '');
    async function fetchAppDetail() {
      try {
        const res = await fetch(`/api/v1/apps/${encodeURIComponent(slug)}`);
        const json = await res.json();
        if (json.status === 'success') {
          setActiveAppDetail(json.data);
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchAppDetail();
  }, [route, refreshCounter]);

  // Load Companies Directory when on /companies
  useEffect(() => {
    if (route !== '/companies') return;
    async function fetchCompanies() {
      try {
        const params = new URLSearchParams();
        if (companyFilters.q) params.set('q', companyFilters.q);
        if (companyFilters.city) params.set('city', companyFilters.city);
        if (companyFilters.verified) params.set('verified', 'true');
        const res = await fetch(`/api/v1/companies?${params.toString()}`);
        const json = await res.json();
        if (json.status === 'success') {
          setCompaniesList(json.data);
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchCompanies();
  }, [route, companyFilters, refreshCounter]);

  // Load Single Company when on /companies/:slug
  useEffect(() => {
    if (!route.startsWith('/companies/')) return;
    const slug = route.replace('/companies/', '');
    async function fetchCompanyDetail() {
      try {
        const res = await fetch(`/api/v1/companies/${encodeURIComponent(slug)}`);
        const json = await res.json();
        if (json.status === 'success') {
          setActiveCompanyDetail(json.data);
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchCompanyDetail();
  }, [route, refreshCounter]);

  // Load Launchpad when on /launchpad
  useEffect(() => {
    if (route !== '/launchpad') return;
    async function fetchLaunches() {
      try {
        const params = new URLSearchParams();
        if (launchTypeFilter) params.set('type', launchTypeFilter);
        const res = await fetch(`/api/v1/launches?${params.toString()}`);
        const json = await res.json();
        if (json.status === 'success') {
          setLaunchesList(json.data);
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchLaunches();
  }, [route, launchTypeFilter, refreshCounter]);

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShareUrl(true);
    setTimeout(() => setCopiedShareUrl(false), 2000);
  };

  const handleCopyOfficialEmail = () => {
    navigator.clipboard.writeText(
      homepageData?.settings.contact_email || 'info@libyaapps.ly'
    );
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  // Dedicated Filament RTL Admin View
  if (route === '/admin') {
    return (
      <>
        <SeoHead
          title="لوحة التحكم Filament RTL | LIBYA APPS"
          description="لوحة الإدارة المركزية لمنصة التطبيقات الليبية."
          path="/admin"
        />
        <FilamentAdminView
          onDataMutated={() => setRefreshCounter((c) => c + 1)}
          onNavigatePublic={(r) => navigate(r)}
        />
      </>
    );
  }

  // Streamlined Global Navigation (Removed Tech News & Exhibition pages per user request)
  const navLinks = [
    { label: 'الرئيسية', path: '/' },
    { label: 'دليل التطبيقات', path: '/apps' },
    { label: 'الشركات والمطورون', path: '/companies' },
    { label: 'منصة الإطلاق', path: '/launchpad' },
    { label: 'من نحن', path: '/about' },
    { label: 'تواصل معنا', path: '/contact' },
  ];

  // Filter homepage featured apps by category
  const filteredHomeApps =
    homepageData?.featured_applications.filter((app) =>
      homeCategoryFilter === 'all' ? true : app.category_slug === homeCategoryFilter
    ) || [];

  return (
    <div
      className="min-h-screen flex flex-col elegant-dark-bg text-white relative"
      dir="rtl"
    >
      {/* Ambient Background Dot Grid */}
      <div className="fixed inset-0 elegant-dot-grid opacity-[0.14] pointer-events-none z-0" />

      {/* =====================================================================
          GLOBAL STICKY NAVIGATION HEADER
         ===================================================================== */}
      <header className="sticky top-0 z-40 bg-[#020807]/85 backdrop-blur-md border-b border-[#002D28]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-3 text-right cursor-pointer shrink-0 group"
          >
            <LibyaAppsPolygonIcon className="w-10 h-10 transition-transform duration-300 group-hover:scale-105" />
            <div>
              <div className="font-brand font-extrabold text-base sm:text-lg tracking-wider text-white leading-none">
                LIBYA <span className="text-[#00F0C6]">APPS</span>
              </div>
              <div className="text-xs text-[#A8B7B3] font-medium mt-1">
                منصة التطبيقات الليبية
              </div>
            </div>
          </button>

          {/* Zone 2: Clean Streamlined Navigation Links */}
          <nav
            aria-label="القائمة الرئيسية"
            className="hidden lg:flex items-center gap-1 xl:gap-1.5"
          >
            {navLinks.map((item) => {
              const isActive =
                item.path === '/'
                  ? route === '/'
                  : route === item.path || route.startsWith(`${item.path}/`);
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`px-3.5 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'text-[#00F0C6] bg-[#002D28]/90 border border-[#00483F]'
                      : 'text-[#A8B7B3] hover:text-white hover:bg-[#03110E]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action CTA ("أضف تطبيقك") + Admin Shortcut */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#A8B7B3] hover:text-[#00F0C6] bg-[#03110E] hover:bg-[#002D28] border border-[#002D28] hover:border-[#00483F] transition-colors cursor-pointer"
            >
              <span>لوحة التحكم</span>
            </button>

            <button
              type="button"
              onClick={() => setQuickAppModalOpen(true)}
              className="px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#00F0C6] hover:bg-[#39FFDB] text-[#020807] transition-all cursor-pointer shadow-[0_0_20px_rgba(0,240,198,0.28)]"
            >
              أضف تطبيقك
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="القائمة"
              className="lg:hidden p-2 rounded-xl border border-[#002D28] bg-[#03110E] text-white cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#03110E] border-t border-[#002D28] px-4 py-4 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`text-right px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
                    route === item.path
                      ? 'bg-[#002D28] text-[#00F0C6] border border-[#00483F]'
                      : 'bg-[#020807] text-[#A8B7B3]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="pt-2 border-t border-[#002D28] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="flex-1 py-2.5 text-center rounded-xl text-xs font-bold bg-[#002D28] text-white border border-[#00483F] cursor-pointer"
              >
                لوحة التحكم المتقدمة
              </button>
              <button
                type="button"
                onClick={() => navigate('/architecture')}
                className="flex-1 py-2.5 text-center rounded-xl text-xs font-semibold bg-[#020807] text-[#00F0C6] border border-[#002D28] cursor-pointer"
              >
                المعمارية والكود
              </button>
            </div>
          </div>
        )}
      </header>

      {/* =====================================================================
          MAIN PUBLIC ROUTES
         ===================================================================== */}
      <main className="flex-1 relative z-10">
        {/* -------------------------------------------------------------------
            1. HOMEPAGE (/) — Clean, Uncluttered, Animated with Framer Motion + Slideshow
           ------------------------------------------------------------------- */}
        {route === '/' && homepageData && (
          <>
            <SeoHead
              title={homepageData.settings.seo_default_title}
              description={homepageData.settings.seo_default_description}
              path="/"
            />

            {/* HERO SECTION WITH FRAMER MOTION ENTRANCE ANIMATIONS */}
            <section className="relative overflow-hidden border-b border-[#002D28] pt-12 pb-16 sm:pt-16 sm:pb-20">
              <HeroInteractiveBackdrop
                activeSlide={heroSlide}
                onSelectSlide={(idx) => setHeroSlide(idx)}
              />

              <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                <div className="max-w-3xl mx-auto text-center space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#00F0C6]"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#00F0C6] animate-pulse" />
                    <span>البوابة الوطنية للتطبيقات الذكية والشركات التقنية في ليبيا</span>
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 26 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }}
                    className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold leading-[1.16] text-white"
                  >
                    اكتشف عالم{' '}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00F0C6] via-[#39FFDB] to-[#38BDF8] glow-mint-drop">
                      التطبيقات الليبية
                    </span>
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.2, ease: 'easeOut' }}
                    className="text-base sm:text-lg text-[#A8B7B3] leading-relaxed max-w-2xl mx-auto"
                  >
                    الدليل التفاعلي الموثق للتطبيقات الليبية والشركات المطورة لها، مع هوية بصرية وشعارات مخصصة لكل تطبيق ومنصة إطلاق للإصدارات الجديدة.
                  </motion.p>

                  {/* Animated Global Search Bar */}
                  <motion.div
                    initial={{ opacity: 0, y: 24, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.55, delay: 0.3, ease: 'easeOut' }}
                    className="relative max-w-2xl mx-auto text-right"
                  >
                    <div className="flex items-center bg-[#03110E]/95 rounded-2xl p-2 border border-[#00483F] focus-within:border-[#00F0C6] shadow-[0_10px_35px_rgba(0,0,0,0.55)] transition-colors">
                      <Search className="w-5 h-5 text-[#00F0C6] mr-3 shrink-0" />
                      <input
                        type="text"
                        value={globalSearchQuery}
                        onChange={(e) => setGlobalSearchQuery(e.target.value)}
                        placeholder="ابحث عن تطبيق ليبي، شركة مطورة، أو قطاع تقني..."
                        className="w-full px-3 py-2.5 text-sm text-white bg-transparent focus:outline-none placeholder:text-[#6B7C77]"
                      />
                      {globalSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setGlobalSearchQuery('')}
                          className="p-1.5 text-[#A8B7B3] hover:text-white cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setAppFilters((prev) => ({ ...prev, q: globalSearchQuery }));
                          navigate('/apps');
                        }}
                        className="px-5 py-2.5 bg-[#00F0C6] hover:bg-[#39FFDB] text-[#020807] text-xs font-bold rounded-xl shrink-0 transition-all cursor-pointer"
                      >
                        بحث
                      </button>
                    </div>

                    {/* Instant Search Dropdown */}
                    {globalSearchResults && (
                      <div className="absolute left-0 right-0 top-full mt-2 bg-[#03110E] text-white rounded-2xl shadow-2xl border border-[#00483F] p-4 z-50 space-y-4 max-h-96 overflow-y-auto">
                        {globalSearchResults.applications.length === 0 &&
                        globalSearchResults.companies.length === 0 ? (
                          <div className="text-xs text-[#A8B7B3] py-3 text-center">
                            لا توجد نتائج مطابقة لـ «{globalSearchQuery}»
                          </div>
                        ) : (
                          <>
                            {globalSearchResults.applications.length > 0 && (
                              <div>
                                <div className="text-xs font-bold text-[#00F0C6] mb-2">
                                  التطبيقات ({globalSearchResults.applications.length})
                                </div>
                                <div className="space-y-1.5">
                                  {globalSearchResults.applications.map((app) => (
                                    <button
                                      key={app.id}
                                      type="button"
                                      onClick={() => navigate(`/apps/${app.slug}`)}
                                      className="w-full text-right p-2.5 rounded-xl hover:bg-[#002D28] flex items-center justify-between gap-3 cursor-pointer"
                                    >
                                      <div className="flex items-center gap-3">
                                        <AppBrandLogo app={app} size="sm" />
                                        <div>
                                          <div className="text-xs font-bold text-white">
                                            {app.name_ar}
                                          </div>
                                          <div className="text-[11px] text-[#A8B7B3]">
                                            {app.category_name_ar} · {app.company_name_ar}
                                          </div>
                                        </div>
                                      </div>
                                      <ArrowLeft className="w-4 h-4 text-[#00F0C6]" />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {globalSearchResults.companies.length > 0 && (
                              <div>
                                <div className="text-xs font-bold text-[#00F0C6] mb-2">
                                  الشركات المطورة ({globalSearchResults.companies.length})
                                </div>
                                <div className="space-y-1">
                                  {globalSearchResults.companies.map((c) => (
                                    <button
                                      key={c.id}
                                      type="button"
                                      onClick={() => navigate(`/companies/${c.slug}`)}
                                      className="w-full text-right p-2 rounded-xl hover:bg-[#002D28] flex items-center justify-between cursor-pointer"
                                    >
                                      <span className="text-xs font-bold text-white">
                                        {c.name_ar}
                                      </span>
                                      <span className="text-[11px] text-[#A8B7B3]">
                                        {c.city_name_ar}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </motion.div>

                  {/* Hero Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.4, ease: 'easeOut' }}
                    className="flex flex-wrap items-center justify-center gap-3.5 pt-2"
                  >
                    <button
                      type="button"
                      onClick={() => navigate('/apps')}
                      className="px-7 py-3.5 bg-[#00F0C6] hover:bg-[#39FFDB] text-[#020807] font-bold text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-[0_10px_28px_rgba(0,240,198,0.22)]"
                    >
                      <span>استكشف دليل التطبيقات</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickAppModalOpen(true)}
                      className="px-6 py-3.5 bg-[#03110E] hover:bg-[#002D28] text-white font-semibold text-sm rounded-xl border border-[#00483F] hover:border-[#00F0C6]/60 transition-all cursor-pointer"
                    >
                      أضف تطبيقك
                    </button>
                  </motion.div>
                </div>

                {/* INTERACTIVE IMAGE SLIDESHOW (سلايد شو للصور التفاعلي) */}
                <motion.div
                  initial={{ opacity: 0, y: 36 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: 0.48, ease: 'easeOut' }}
                  className="mt-12"
                >
                  <InteractiveImageSlideshow
                    onNavigate={(targetRoute, catSlug) => {
                      if (catSlug) {
                        setAppFilters((prev) => ({ ...prev, category: catSlug }));
                      }
                      navigate(targetRoute);
                    }}
                  />
                </motion.div>
              </div>
            </section>

            {/* PLATFORM LIVE STATISTICS BAR (Controlled from Admin Dashboard) */}
            <section className="bg-[#03110E]/90 border-b border-[#002D28]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
                {(homepageData.settings.homepage_stats &&
                homepageData.settings.homepage_stats.length > 0
                  ? homepageData.settings.homepage_stats
                  : [
                      {
                        id: 'stat_apps',
                        value: `+${homepageData.statistics.registered_applications}`,
                        label_ar: 'تطبيق ليبي مسجل وموثق',
                        subtitle_ar: 'شعارات وأيقونات مخصصة لكل تطبيق',
                      },
                      {
                        id: 'stat_companies',
                        value: `+${homepageData.statistics.technology_companies}`,
                        label_ar: 'شركة تقنية ومطور',
                        subtitle_ar: 'مؤسسات برمجية في المدن الليبية',
                      },
                      {
                        id: 'stat_categories',
                        value: `+${homepageData.statistics.application_categories}`,
                        label_ar: 'قطاع وتصنيف تقني',
                        subtitle_ar: 'المالية، التوصيل، الصحة، والتعليم',
                      },
                      {
                        id: 'stat_launchpad',
                        value: `+${homepageData.launchpad_events.length}`,
                        label_ar: 'إصدار في منصة الإطلاق',
                        subtitle_ar: 'تطبيقات جديدة وتحديثات كبرى',
                      },
                    ]
                ).map((stat, idx) => (
                  <motion.div
                    key={stat.id || idx}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                    className="border-r-2 border-[#00F0C6] pr-4 space-y-1"
                  >
                    <div
                      dir="ltr"
                      className="text-3xl sm:text-4xl font-display font-bold text-white font-mono-num text-right"
                    >
                      {stat.value}
                    </div>
                    <div className="text-sm font-bold text-[#00F0C6]">
                      {stat.label_ar}
                    </div>
                    <div className="text-xs text-[#A8B7B3]">{stat.subtitle_ar}</div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* PINNED HOMEPAGE APPLICATIONS SHOWCASE (Controlled from Admin Dashboard) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-8 relative">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00F0C6]">
                    <Pin className="w-3.5 h-3.5" />
                    <span>التطبيقات المثبتة في الواجهة · يتم التحكم بها من لوحة التحكم</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
                    التطبيقات الليبية المثبتة في الواجهة
                  </h2>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => navigate('/admin')}
                    className="text-xs font-semibold text-[#A8B7B3] hover:text-[#00F0C6] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Pin className="w-3.5 h-3.5 text-[#00F0C6]" />
                    <span>إدارة التثبيت من لوحة التحكم</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/apps')}
                    className="text-xs sm:text-sm font-bold text-[#00F0C6] hover:text-[#39FFDB] flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>عرض الدليل الكامل ({homepageData.statistics.registered_applications})</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Interactive Category Filter Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <button
                  type="button"
                  onClick={() => setHomeCategoryFilter('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer border ${
                    homeCategoryFilter === 'all'
                      ? 'bg-[#00F0C6] text-[#020807] border-[#00F0C6] shadow-[0_0_15px_rgba(0,240,198,0.25)]'
                      : 'bg-[#03110E] text-[#A8B7B3] hover:text-white border-[#002D28]'
                  }`}
                >
                  جميع التطبيقات المثبتة ({homepageData.featured_applications.length})
                </button>
                {homepageData.categories.slice(0, 7).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setHomeCategoryFilter(cat.slug)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer border ${
                      homeCategoryFilter === cat.slug
                        ? 'bg-[#00F0C6] text-[#020807] border-[#00F0C6] shadow-[0_0_15px_rgba(0,240,198,0.25)]'
                        : 'bg-[#03110E] text-[#A8B7B3] hover:text-white border-[#002D28]'
                    }`}
                  >
                    {cat.name_ar}
                  </button>
                ))}
              </div>

              {/* Animated Applications Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredHomeApps.map((app, index) => (
                    <motion.article
                      layout
                      key={app.id}
                      initial={{ opacity: 0, y: 26 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      viewport={{ once: true, margin: '-30px' }}
                      transition={{ duration: 0.4, delay: index * 0.06 }}
                      whileHover={{ y: -6 }}
                      className="bg-[#03110E] rounded-2xl border border-[#002D28] hover:border-[#00F0C6]/60 transition-colors p-6 flex flex-col justify-between space-y-5 group shadow-lg"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3.5">
                            <AppBrandLogo app={app} size="lg" />
                            <div>
                              <h3 className="font-display font-bold text-lg text-white group-hover:text-[#00F0C6] transition-colors">
                                {app.name_ar}
                              </h3>
                              <div className="text-xs text-[#A8B7B3] mt-0.5">
                                {app.category_name_ar} · {app.city_name_ar}
                              </div>
                              <div className="text-[11px] text-[#00F0C6] font-medium mt-0.5">
                                {app.company_name_ar}
                              </div>
                            </div>
                          </div>
                          <span
                            title="تطبيق مثبت في الواجهة الرئيسية"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#002D28]/80 border border-[#00483F] text-[10px] font-bold text-[#00F0C6] shrink-0"
                          >
                            <Pin className="w-3 h-3" />
                            <span>مثبت</span>
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm text-[#A8B7B3] leading-relaxed line-clamp-2">
                          {app.short_description_ar}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-[#002D28] flex items-center justify-between gap-2">
                        <div className="text-xs font-mono-num text-[#A8B7B3]">
                          {app.platforms.join(' · ')}
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate(`/apps/${app.slug}`)}
                          className="text-xs font-bold text-[#00F0C6] group-hover:text-[#39FFDB] flex items-center gap-1 cursor-pointer"
                        >
                          <span>تفاصيل التطبيق</span>
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </div>
            </section>

            {/* BROWSE BY APPLICATION CATEGORIES (With Subtle Background Image Layer) */}
            <section className="relative overflow-hidden bg-[#03110E]/80 border-y border-[#002D28] py-16">
              <img
                src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1800&q=80"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover opacity-[0.08] pointer-events-none select-none"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#020807]/90 via-[#03110E]/85 to-[#020807]/90 pointer-events-none" />
              <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 relative z-10">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-[#00F0C6]">
                      التصنيفات القطاعية المعتمدة
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
                      تصفح التطبيقات حسب القطاع
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {homepageData.categories.map((cat, idx) => {
                    const iconName = resolveAppIconName({
                      id: cat.id,
                      category_slug: cat.slug,
                    });
                    return (
                      <motion.button
                        key={cat.id}
                        type="button"
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.35, delay: idx * 0.04 }}
                        whileHover={{ y: -4 }}
                        onClick={() => {
                          setAppFilters((prev) => ({ ...prev, category: cat.slug }));
                          navigate('/apps');
                        }}
                        className="text-right bg-[#020807] rounded-2xl p-5 border border-[#002D28] hover:border-[#00F0C6] transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-xl bg-[#002D28] border border-[#00483F] flex items-center justify-center text-[#00F0C6] group-hover:scale-110 transition-transform">
                            <AppIconVector iconName={iconName} className="w-5 h-5" />
                          </div>
                          <span className="font-mono-num text-xs font-bold text-[#00F0C6]">
                            {cat.apps_count || 0} تطبيق
                          </span>
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-sm sm:text-base text-white group-hover:text-[#00F0C6] transition-colors">
                            {cat.name_ar}
                          </h3>
                          <p className="text-xs text-[#A8B7B3] line-clamp-1 mt-1">
                            {cat.description_ar}
                          </p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* CONCISE SPOTLIGHT: FEATURED COMPANIES & APPLICATION LAUNCHPAD */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Featured Companies */}
              <div className="lg:col-span-7 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#00F0C6]">الشركات والمطورون</div>
                    <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
                      شركات تقنية ليبية رائدة
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/companies')}
                    className="text-xs font-bold text-[#00F0C6] hover:text-[#39FFDB] cursor-pointer"
                  >
                    كل الشركات ←
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {homepageData.featured_companies.slice(0, 4).map((comp, idx) => (
                    <motion.div
                      key={comp.id}
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: idx * 0.06 }}
                      onClick={() => navigate(`/companies/${comp.slug}`)}
                      className="bg-[#03110E] rounded-2xl border border-[#002D28] hover:border-[#00F0C6]/50 p-5 space-y-2.5 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#00F0C6]">
                          {comp.city_name_ar}
                        </span>
                        <span className="font-mono-num text-xs text-[#A8B7B3]">
                          تأسست {comp.established_year}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-base text-white">
                        {comp.name_ar}
                      </h3>
                      <p className="text-xs text-[#A8B7B3] line-clamp-2">
                        {comp.specialization_ar}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Application Launchpad */}
              <div className="lg:col-span-5 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#00F0C6]">منصة الإطلاق</div>
                    <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
                      أحدث الإصدارات والتحديثات
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/launchpad')}
                    className="text-xs font-bold text-[#00F0C6] hover:text-[#39FFDB] cursor-pointer"
                  >
                    منصة الإطلاق ←
                  </button>
                </div>

                <div className="space-y-3.5">
                  {homepageData.launchpad_events.slice(0, 3).map((ev, idx) => (
                    <motion.div
                      key={ev.id}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: idx * 0.08 }}
                      onClick={() => navigate(`/apps/${ev.application_slug}`)}
                      className="bg-[#03110E] rounded-2xl border border-[#002D28] hover:border-[#00F0C6]/50 p-4 space-y-1.5 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#00F0C6]">
                          {ev.launch_type_label_ar}
                        </span>
                        <span className="font-mono-num text-[#A8B7B3]">
                          {ev.version_tag} · {ev.launch_date}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-sm text-white">
                        {ev.title_ar}
                      </h3>
                      <p className="text-xs text-[#A8B7B3] line-clamp-1">{ev.summary_ar}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* -------------------------------------------------------------------
            2. APPLICATIONS DIRECTORY (/apps) — Animated Cards + Custom Logos & Icons
           ------------------------------------------------------------------- */}
        {route === '/apps' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
            <SeoHead
              title="دليل التطبيقات الليبية | LIBYA APPS"
              description="تصفح وابحث في الدليل الشامل للتطبيقات الليبية الموثقة مع شعاراتها وأيقوناتها حسب القطاع، المدينة، ونظام التشغيل."
              path="/apps"
            />

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-wrap items-end justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="text-xs font-bold text-[#00F0C6]">
                  الدليل الوطني الموحد · شعارات رسمية لكل تطبيق
                </div>
                <h1 className="text-2xl sm:text-4xl font-display font-bold text-white">
                  دليل التطبيقات الليبية
                </h1>
                <p className="text-sm sm:text-base text-[#A8B7B3] max-w-3xl">
                  استكشف التطبيقات الرقمية الليبية الموثقة وشعاراتها الرسمية حسب القطاع، المدينة، ونظام التشغيل.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setQuickAppModalOpen(true)}
                className="px-5 py-3 rounded-xl bg-[#00F0C6] hover:bg-[#39FFDB] text-[#020807] font-bold text-xs sm:text-sm cursor-pointer shadow-[0_0_20px_rgba(0,240,198,0.25)]"
              >
                أضف تطبيقك
              </button>
            </motion.div>

            {/* Filter Panel */}
            <div className="bg-[#03110E] rounded-2xl border border-[#00483F] p-5 space-y-4 shadow-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="lg:col-span-2 relative">
                  <Search className="w-4 h-4 text-[#00F0C6] absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={appFilters.q}
                    onChange={(e) => setAppFilters({ ...appFilters, q: e.target.value })}
                    placeholder="ابحث باسم التطبيق، الخدمة، أو الشركة المطورة..."
                    className="w-full pr-10 pl-3 py-2.5 text-xs sm:text-sm rounded-xl bg-[#020807] border border-[#002D28] text-white placeholder:text-[#6B7C77] focus:outline-none focus:border-[#00F0C6]"
                  />
                </div>

                <select
                  value={appFilters.category}
                  onChange={(e) =>
                    setAppFilters({ ...appFilters, category: e.target.value })
                  }
                  className="px-3 py-2.5 text-xs sm:text-sm rounded-xl bg-[#020807] border border-[#002D28] text-white focus:outline-none focus:border-[#00F0C6]"
                >
                  <option value="">جميع التصنيفات ({allCategories.length})</option>
                  {allCategories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name_ar}
                    </option>
                  ))}
                </select>

                <select
                  value={appFilters.city}
                  onChange={(e) => setAppFilters({ ...appFilters, city: e.target.value })}
                  className="px-3 py-2.5 text-xs sm:text-sm rounded-xl bg-[#020807] border border-[#002D28] text-white focus:outline-none focus:border-[#00F0C6]"
                >
                  <option value="">جميع المدن الليبية</option>
                  {allCities.map((c) => (
                    <option key={c.id} value={c.name_ar}>
                      {c.name_ar}
                    </option>
                  ))}
                </select>

                <select
                  value={appFilters.platform}
                  onChange={(e) =>
                    setAppFilters({ ...appFilters, platform: e.target.value })
                  }
                  className="px-3 py-2.5 text-xs sm:text-sm rounded-xl bg-[#020807] border border-[#002D28] text-white focus:outline-none focus:border-[#00F0C6]"
                >
                  <option value="">كل أنظمة التشغيل</option>
                  <option value="Android">Android</option>
                  <option value="iOS">iOS</option>
                  <option value="Web">Web</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#002D28]">
                <div className="flex flex-wrap items-center gap-4">
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-[#A8B7B3] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={appFilters.verified}
                      onChange={(e) =>
                        setAppFilters({ ...appFilters, verified: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#00F0C6]"
                    />
                    <span>التطبيقات الموثقة فقط</span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-[#A8B7B3] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={appFilters.featured}
                      onChange={(e) =>
                        setAppFilters({ ...appFilters, featured: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#00F0C6]"
                    />
                    <span>المختارة (Featured)</span>
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#A8B7B3]">الترتيب:</span>
                  <select
                    value={appFilters.sort}
                    onChange={(e) => setAppFilters({ ...appFilters, sort: e.target.value })}
                    className="px-3 py-1.5 text-xs rounded-xl bg-[#020807] border border-[#002D28] text-white focus:outline-none focus:border-[#00F0C6]"
                  >
                    <option value="featured">الأبرز أولاً</option>
                    <option value="newest">الأحدث إطلاقاً</option>
                    <option value="alphabetical">أبجدياً (أ - ي)</option>
                  </select>

                  {(appFilters.q ||
                    appFilters.category ||
                    appFilters.city ||
                    appFilters.platform ||
                    appFilters.verified ||
                    appFilters.featured) && (
                    <button
                      type="button"
                      onClick={() =>
                        setAppFilters({
                          q: '',
                          category: '',
                          city: '',
                          platform: '',
                          app_type: '',
                          status: '',
                          featured: false,
                          verified: false,
                          sort: 'featured',
                        })
                      }
                      className="text-xs font-semibold text-red-400 hover:underline cursor-pointer"
                    >
                      إعادة ضبط الفلاتر
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Results Grid with Framer Motion Staggered Entrance */}
            {appsLoading ? (
              <div className="py-16 text-center text-sm text-[#A8B7B3]">
                جاري تحميل التطبيقات من قاعدة البيانات...
              </div>
            ) : appsList.length === 0 ? (
              <div className="bg-[#03110E] rounded-2xl border border-[#002D28] p-12 text-center space-y-3">
                <div className="text-base font-bold text-white">
                  لا توجد تطبيقات مطابقة لمعايير التصفية الحالية
                </div>
                <p className="text-xs text-[#A8B7B3]">
                  جرب تغيير التصنيف أو البحث بكلمة مفتاحية أخرى.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {appsList.map((app, index) => (
                    <motion.article
                      layout
                      key={app.id}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.38, delay: index * 0.05 }}
                      whileHover={{ y: -6 }}
                      className="bg-[#03110E] rounded-2xl border border-[#002D28] hover:border-[#00F0C6]/60 transition-colors p-6 flex flex-col justify-between space-y-5 group shadow-lg"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-4">
                            <AppBrandLogo app={app} size="lg" />
                            <div>
                              <div className="flex items-center gap-2">
                                <h2 className="font-display font-bold text-lg text-white group-hover:text-[#00F0C6] transition-colors">
                                  {app.name_ar}
                                </h2>
                              </div>
                              <div className="text-xs text-[#A8B7B3] mt-0.5">
                                {app.category_name_ar} · {app.city_name_ar}
                              </div>
                              <div className="text-[11px] text-[#00F0C6] font-semibold mt-0.5">
                                {app.is_verified ? 'موثق رسمياً' : app.status_label_ar} ·{' '}
                                {app.app_type}
                              </div>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-[#A8B7B3] leading-relaxed line-clamp-2">
                          {app.short_description_ar}
                        </p>

                        <div className="text-xs text-[#A8B7B3]">
                          المطور:{' '}
                          <button
                            type="button"
                            onClick={() => navigate(`/companies/${app.company_slug}`)}
                            className="font-semibold text-white hover:text-[#00F0C6] underline cursor-pointer"
                          >
                            {app.company_name_ar}
                          </button>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#002D28] flex items-center justify-between">
                        <div className="text-xs font-mono-num text-[#A8B7B3]">
                          {app.platforms.join(' · ')}
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate(`/apps/${app.slug}`)}
                          className="text-xs font-bold text-[#00F0C6] group-hover:text-[#39FFDB] flex items-center gap-1 cursor-pointer"
                        >
                          <span>عرض صفحة التطبيق</span>
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------------
            3. APPLICATION DETAILS PAGE (/apps/:slug)
           ------------------------------------------------------------------- */}
        {route.startsWith('/apps/') && activeAppDetail && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
            <SeoHead
              title={`${activeAppDetail.application.name_ar} (${activeAppDetail.application.name_en}) | LIBYA APPS`}
              description={activeAppDetail.application.short_description_ar}
              path={`/apps/${activeAppDetail.application.slug}`}
            />

            <div className="flex items-center gap-2 text-xs text-[#A8B7B3]">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="hover:text-[#00F0C6] cursor-pointer"
              >
                الرئيسية
              </button>
              <span>/</span>
              <button
                type="button"
                onClick={() => navigate('/apps')}
                className="hover:text-[#00F0C6] cursor-pointer"
              >
                دليل التطبيقات
              </button>
              <span>/</span>
              <span className="text-white font-semibold">
                {activeAppDetail.application.name_ar}
              </span>
            </div>

            {/* App Header Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#03110E] rounded-2xl border border-[#00483F] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-2xl"
            >
              <div className="flex items-start gap-5">
                <AppBrandLogo app={activeAppDetail.application} size="xl" />
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#A8B7B3]">
                    <span className="font-bold text-[#00F0C6]">
                      {activeAppDetail.application.category_name_ar}
                    </span>
                    <span>·</span>
                    <span>{activeAppDetail.application.city_name_ar}</span>
                    <span>·</span>
                    <span className="font-mono-num">
                      تأسس {activeAppDetail.application.launch_year}
                    </span>
                    <span>·</span>
                    <span className="text-white font-semibold">
                      {activeAppDetail.application.status_label_ar}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
                    {activeAppDetail.application.name_ar}{' '}
                    <span className="text-base font-normal text-[#A8B7B3] font-mono-num">
                      ({activeAppDetail.application.name_en})
                    </span>
                  </h1>

                  <p className="text-sm sm:text-base text-[#A8B7B3] max-w-2xl">
                    {activeAppDetail.application.short_description_ar}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {activeAppDetail.application.website_url && (
                  <a
                    href={activeAppDetail.application.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 text-xs font-bold bg-[#00F0C6] hover:bg-[#39FFDB] text-[#020807] rounded-xl flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,198,0.2)]"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>الموقع الرسمي</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="px-3.5 py-2.5 text-xs font-semibold bg-[#020807] hover:bg-[#002D28] text-white border border-[#002D28] rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedShareUrl ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#00F0C6]" />
                      <span>تم نسخ الرابط</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>مشاركة</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Main Content & Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                <div className="bg-[#03110E] rounded-2xl border border-[#002D28] p-6 sm:p-8 space-y-4">
                  <h2 className="text-lg font-display font-bold text-white">
                    نبذة تفصيلية عن التطبيق
                  </h2>
                  <p className="text-sm sm:text-base text-[#A8B7B3] leading-relaxed">
                    {activeAppDetail.application.full_description_ar}
                  </p>

                  <div className="pt-4 border-t border-[#002D28] space-y-3">
                    <h3 className="text-base font-display font-bold text-white">
                      المميزات والخصائص الرئيسية
                    </h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeAppDetail.application.main_features_ar.map((feat, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2.5 text-xs sm:text-sm text-white bg-[#020807] p-3.5 rounded-xl border border-[#002D28]"
                        >
                          <Check className="w-4 h-4 text-[#00F0C6] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* UI Preview Gallery */}
                {activeAppDetail.application.media.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-display font-bold text-white">
                      معاينة واجهات التطبيق
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {activeAppDetail.application.media.map((m) => (
                        <AppScreenshotArtwork
                          key={m.id}
                          title={m.title_ar}
                          caption={m.caption_ar}
                          accentColor={activeAppDetail.application.logo_color}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Developer Company Sidebar */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-[#03110E] rounded-2xl border border-[#002D28] p-6 space-y-4">
                  <div className="text-xs font-bold text-[#00F0C6]">الشركة المطورة</div>
                  <h3 className="text-lg font-display font-bold text-white">
                    {activeAppDetail.application.company_name_ar}
                  </h3>
                  {activeAppDetail.company && (
                    <>
                      <p className="text-xs text-[#A8B7B3] leading-relaxed">
                        {activeAppDetail.company.description_ar}
                      </p>
                      <div className="text-xs text-[#A8B7B3] space-y-1.5 pt-2 border-t border-[#002D28]">
                        <div>المدينة: {activeAppDetail.company.city_name_ar}</div>
                        <div>التخصص: {activeAppDetail.company.specialization_ar}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/companies/${activeAppDetail.company!.slug}`)
                        }
                        className="w-full py-2.5 text-xs font-bold bg-[#002D28] hover:bg-[#00483F] text-[#00F0C6] border border-[#00483F] rounded-xl transition-colors cursor-pointer"
                      >
                        عرض ملف الشركة الكامل
                      </button>
                    </>
                  )}
                </div>

                <div className="bg-[#03110E] rounded-2xl border border-[#002D28] p-6 space-y-3">
                  <div className="text-xs font-bold text-white">المعلومات التقنية</div>
                  <div className="text-xs text-[#A8B7B3] space-y-2">
                    <div className="flex justify-between">
                      <span>الأنظمة المدعومة:</span>
                      <span className="font-mono-num font-semibold text-white">
                        {activeAppDetail.application.platforms.join(' / ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>نموذج العمل:</span>
                      <span className="font-mono-num font-semibold text-white">
                        {activeAppDetail.application.app_type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>تاريخ التحديث:</span>
                      <span className="font-mono-num text-white">
                        {activeAppDetail.application.updated_at}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            4. COMPANIES & DEVELOPERS DIRECTORY (/companies)
           ------------------------------------------------------------------- */}
        {route === '/companies' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
            <SeoHead
              title="دليل الشركات التقنية والمطورين في ليبيا | LIBYA APPS"
              description="قاعدة بيانات الشركات الليبية المطورة للتطبيقات والبرمجيات وحلول التحول الرقمي."
              path="/companies"
            />

            <div className="space-y-2">
              <div className="text-xs font-bold text-[#00F0C6]">
                قاعدة بيانات المؤسسات البرمجية والاستوديوهات التقنية
              </div>
              <h1 className="text-2xl sm:text-4xl font-display font-bold text-white">
                الشركات التقنية والمطورون
              </h1>
              <p className="text-sm sm:text-base text-[#A8B7B3] max-w-3xl">
                تعرف على الشركات الليبية المطورة للتطبيقات، تخصصاتها الهندسية، ومشاريعها الرقمية المنشورة في الدليل.
              </p>
            </div>

            <div className="bg-[#03110E] rounded-2xl border border-[#00483F] p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                type="text"
                value={companyFilters.q}
                onChange={(e) => setCompanyFilters({ ...companyFilters, q: e.target.value })}
                placeholder="ابحث باسم الشركة أو مجال التخصص..."
                className="px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-[#020807] border border-[#002D28] text-white placeholder:text-[#6B7C77] focus:outline-none focus:border-[#00F0C6]"
              />
              <select
                value={companyFilters.city}
                onChange={(e) =>
                  setCompanyFilters({ ...companyFilters, city: e.target.value })
                }
                className="px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-[#020807] border border-[#002D28] text-white focus:outline-none focus:border-[#00F0C6]"
              >
                <option value="">جميع المدن الليبية</option>
                {allCities.map((c) => (
                  <option key={c.id} value={c.name_ar}>
                    {c.name_ar}
                  </option>
                ))}
              </select>
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#A8B7B3] px-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={companyFilters.verified}
                  onChange={(e) =>
                    setCompanyFilters({ ...companyFilters, verified: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#00F0C6]"
                />
                <span>الشركات الموثقة رسمياً فقط</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companiesList.map((comp, idx) => (
                <motion.article
                  key={comp.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.05 }}
                  whileHover={{ y: -5 }}
                  onClick={() => navigate(`/companies/${comp.slug}`)}
                  className="bg-[#03110E] rounded-2xl border border-[#002D28] hover:border-[#00F0C6]/60 transition-all p-6 flex flex-col justify-between space-y-4 cursor-pointer group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-[#A8B7B3]">
                      <span className="font-bold text-[#00F0C6]">{comp.city_name_ar}</span>
                      <span className="font-mono-num">تأسست {comp.established_year}</span>
                    </div>
                    <h2 className="font-display font-bold text-lg text-white group-hover:text-[#00F0C6] transition-colors">
                      {comp.name_ar}
                    </h2>
                    <div className="text-xs font-semibold text-white/90">
                      {comp.specialization_ar}
                    </div>
                    <p className="text-xs sm:text-sm text-[#A8B7B3] leading-relaxed line-clamp-3">
                      {comp.description_ar}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#002D28] flex items-center justify-between text-xs">
                    <span className="text-[#A8B7B3]">
                      {comp.is_verified ? 'شركة موثقة' : 'شركة مسجلة'}
                    </span>
                    <span className="font-bold text-[#00F0C6] flex items-center gap-1">
                      <span>ملف الشركة وتطبيقاتها</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            5. SINGLE COMPANY PROFILE (/companies/:slug)
           ------------------------------------------------------------------- */}
        {route.startsWith('/companies/') && activeCompanyDetail && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
            <SeoHead
              title={`${activeCompanyDetail.company.name_ar} | الشركات الليبية — LIBYA APPS`}
              description={activeCompanyDetail.company.description_ar}
              path={`/companies/${activeCompanyDetail.company.slug}`}
            />

            <div className="bg-[#03110E] rounded-2xl border border-[#00483F] p-6 sm:p-8 space-y-4 shadow-2xl">
              <div className="text-xs text-[#00F0C6] font-bold">
                {activeCompanyDetail.company.city_name_ar} · تأسست عام{' '}
                {activeCompanyDetail.company.established_year} ·{' '}
                {activeCompanyDetail.company.specialization_ar}
              </div>
              <h1 className="text-2xl sm:text-4xl font-display font-bold text-white">
                {activeCompanyDetail.company.name_ar}{' '}
                <span className="text-base font-normal text-[#A8B7B3] font-mono-num">
                  ({activeCompanyDetail.company.name_en})
                </span>
              </h1>
              <p className="text-sm sm:text-base text-[#A8B7B3] max-w-3xl leading-relaxed">
                {activeCompanyDetail.company.description_ar}
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-[#A8B7B3]">
                <span>البريد: {activeCompanyDetail.company.email}</span>
                <span>·</span>
                <span dir="ltr">{activeCompanyDetail.company.phone}</span>
                {activeCompanyDetail.company.website_url && (
                  <>
                    <span>·</span>
                    <a
                      href={activeCompanyDetail.company.website_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#00F0C6] font-bold hover:underline"
                    >
                      الموقع الإلكتروني الرسمي
                    </a>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white">
                التطبيقات المطورة بواسطة {activeCompanyDetail.company.name_ar} (
                {activeCompanyDetail.applications.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeCompanyDetail.applications.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => navigate(`/apps/${app.slug}`)}
                    className="bg-[#03110E] rounded-2xl border border-[#002D28] hover:border-[#00F0C6]/60 p-6 space-y-3 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      <AppBrandLogo app={app} size="md" />
                      <div>
                        <h3 className="font-display font-bold text-base text-white">
                          {app.name_ar}
                        </h3>
                        <div className="text-xs text-[#00F0C6]">{app.category_name_ar}</div>
                      </div>
                    </div>
                    <p className="text-xs text-[#A8B7B3] line-clamp-2">
                      {app.short_description_ar}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            6. APPLICATION LAUNCHPAD (/launchpad)
           ------------------------------------------------------------------- */}
        {route === '/launchpad' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
            <SeoHead
              title="منصة إطلاق التطبيقات الليبية (Launchpad) | LIBYA APPS"
              description="تابع أحدث التطبيقات الليبية المطلقة حديثاً، الإصدارات القادمة، والتحديثات التقنية الكبرى."
              path="/launchpad"
            />

            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="text-xs font-bold text-[#00F0C6]">
                  بوابة الإطلاق الوطنية للتطبيقات والمنتجات الرقمية الجديدة
                </div>
                <h1 className="text-2xl sm:text-4xl font-display font-bold text-white">
                  منصة الإطلاق (Application Launchpad)
                </h1>
                <p className="text-sm sm:text-base text-[#A8B7B3] max-w-2xl">
                  مساحة مخصصة للإعلان عن التطبيقات الليبية الجديدة، الإصدارات التجريبية (Beta)، والتحديثات الكبرى.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuickAppModalOpen(true)}
                className="px-5 py-3 text-xs font-bold bg-[#00F0C6] hover:bg-[#39FFDB] text-[#020807] rounded-xl transition-all cursor-pointer shadow-[0_0_20px_rgba(0,240,198,0.2)]"
              >
                سجل تطبيقك للإطلاق القادم
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[
                { key: '', label: 'جميع الإطلاقات' },
                { key: 'new_release', label: 'تطبيقات أطلقت حديثاً' },
                { key: 'upcoming_app', label: 'تطبيقات قادمة قريباً' },
                { key: 'major_update', label: 'تحديثات كبرى' },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setLaunchTypeFilter(t.key)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    launchTypeFilter === t.key
                      ? 'bg-[#00F0C6] text-[#020807] font-bold'
                      : 'bg-[#03110E] text-[#A8B7B3] border border-[#002D28] hover:border-[#00483F]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {launchesList.map((ev, idx) => (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.38, delay: idx * 0.06 }}
                  className="bg-[#03110E] rounded-2xl border border-[#002D28] hover:border-[#00483F] p-6 sm:p-8 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-[#A8B7B3]">
                      <span className="font-bold text-[#00F0C6]">
                        {ev.launch_type_label_ar}
                      </span>
                      <span className="font-mono-num">
                        {ev.version_tag} · {ev.launch_date}
                      </span>
                    </div>
                    <h2 className="text-xl font-display font-bold text-white">
                      {ev.title_ar}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#A8B7B3] leading-relaxed">
                      {ev.summary_ar}
                    </p>
                    <ul className="space-y-1.5 pt-2">
                      {ev.highlights_ar.map((h, i) => (
                        <li
                          key={i}
                          className="text-xs text-white flex items-center gap-2"
                        >
                          <Check className="w-3.5 h-3.5 text-[#00F0C6] shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-[#002D28] flex items-center justify-between text-xs">
                    <span className="text-[#A8B7B3]">
                      الشركة المطورة:{' '}
                      <strong className="text-white">{ev.company_name_ar}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate(`/apps/${ev.application_slug}`)}
                      className="font-bold text-[#00F0C6] hover:text-[#39FFDB] flex items-center gap-1 cursor-pointer"
                    >
                      <span>صفحة التطبيق</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            7. PUBLIC SUBMISSIONS & CONTACT (/submit & /contact)
           ------------------------------------------------------------------- */}
        {(route === '/submit' || route === '/contact') && (
          <>
            <SeoHead
              title={
                route === '/contact'
                  ? 'تواصل معنا | LIBYA APPS'
                  : 'أضف تطبيقك في الدليل | LIBYA APPS'
              }
              description="بوابة إرسال وتوثيق التطبيقات الليبية وطلبات الشراكة والتواصل المباشر."
              path={route}
            />
            <PublicSubmissionView
              initialTab={route === '/contact' ? 'contact' : submissionInitialTab}
              categories={allCategories}
              newsCategories={allNewsCategories}
              cities={allCities}
              onSubmissionSuccess={() => setRefreshCounter((c) => c + 1)}
              onOpenAdminReview={() => navigate('/admin')}
            />
          </>
        )}

        {/* -------------------------------------------------------------------
            8. ABOUT LIBYA APPS (/about)
           ------------------------------------------------------------------- */}
        {route === '/about' && homepageData && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
            <SeoHead
              title="من نحن | LIBYA APPS — منصة التطبيقات الليبية"
              description={homepageData.settings.about_mission_ar}
              path="/about"
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#03110E] rounded-3xl border border-[#00483F] p-8 sm:p-12 space-y-6 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <LibyaAppsPolygonIcon className="w-10 h-10" />
                <div className="text-xs font-bold text-[#00F0C6]">
                  عن المنصة الوطنية للتطبيقات الليبية
                </div>
              </div>
              <h1 className="text-2xl sm:text-4xl font-display font-bold text-white">
                LIBYA APPS — المرجع الرقمي للتطبيقات والشركات التقنية في ليبيا
              </h1>
              <p className="text-sm sm:text-base text-[#A8B7B3] leading-relaxed">
                {homepageData.settings.about_mission_ar}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="bg-[#020807] rounded-2xl p-6 border border-[#002D28] space-y-2">
                  <h2 className="text-base font-display font-bold text-[#00F0C6]">
                    رؤيتنا الاستراتيجية
                  </h2>
                  <p className="text-xs sm:text-sm text-[#A8B7B3] leading-relaxed">
                    {homepageData.settings.about_vision_ar}
                  </p>
                </div>
                <div className="bg-[#020807] rounded-2xl p-6 border border-[#002D28] space-y-2">
                  <h2 className="text-base font-display font-bold text-white">
                    ركائز المنصة الأساسية
                  </h2>
                  <ul className="text-xs sm:text-sm text-[#A8B7B3] space-y-1.5">
                    <li>• توثيق وفهرسة التطبيقات الليبية مع شعاراتها وأيقوناتها الخاصة.</li>
                    <li>• إبراز الشركات المطورة وفرق الهندسة البرمجية في كافة المدن.</li>
                    <li>• دعم إطلاق التطبيقات الجديدة عبر منصة الإطلاق الوطنية.</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            9. ARCHITECTURE & SOURCE CODE INSPECTOR (/architecture)
           ------------------------------------------------------------------- */}
        {route === '/architecture' && (
          <>
            <SeoHead
              title="المعمارية الهندسية والكود المصدري | LIBYA APPS"
              description="توثيق معمارية Next.js App Router + Laravel 11 + Filament v3 RTL + MySQL 8."
              path="/architecture"
            />
            <ArchitectureView onNavigate={(r) => navigate(r)} />
          </>
        )}
      </main>

      {/* =====================================================================
          STRUCTURED FOOTER (Controlled via Admin Dashboard)
         ===================================================================== */}
      <footer className="bg-[#020807] text-[#A8B7B3] border-t border-[#002D28] mt-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <LibyaAppsPolygonIcon className="w-9 h-9" />
              <div>
                <div className="font-brand font-extrabold text-white text-base tracking-wider">
                  LIBYA <span className="text-[#00F0C6]">APPS</span>
                </div>
                <div className="text-xs text-[#A8B7B3]">
                  {homepageData?.settings.platform_name_ar || 'منصة التطبيقات الليبية'}
                </div>
              </div>
            </div>
            <p className="text-xs text-[#A8B7B3] leading-relaxed max-w-sm">
              {homepageData?.settings.footer_description_ar ||
                'المنصة الوطنية لتوثيق واستعراض التطبيقات الليبية والشركات التقنية المطورة لها ومنصة إطلاق المنتجات الرقمية.'}
            </p>

            {/* Social Media Icons Controlled in Admin */}
            <div className="pt-1 space-y-2.5">
              <div className="text-[11px] font-bold text-white">
                تابعنا على منصات التواصل الاجتماعي
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                {homepageData?.settings.social_links?.facebook && (
                  <a
                    href={homepageData.settings.social_links.facebook}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook"
                    title="Facebook"
                    className="w-10 h-10 rounded-xl bg-[#03110E] hover:bg-[#002D28] border border-[#002D28] hover:border-[#00F0C6] text-white hover:text-[#00F0C6] flex items-center justify-center transition-all hover:-translate-y-0.5 shadow-sm"
                  >
                    <SocialPlatformIcon platform="facebook" className="w-4 h-4" />
                  </a>
                )}
                {homepageData?.settings.social_links?.instagram && (
                  <a
                    href={homepageData.settings.social_links.instagram}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    title="Instagram"
                    className="w-10 h-10 rounded-xl bg-[#03110E] hover:bg-[#002D28] border border-[#002D28] hover:border-[#00F0C6] text-white hover:text-[#00F0C6] flex items-center justify-center transition-all hover:-translate-y-0.5 shadow-sm"
                  >
                    <SocialPlatformIcon platform="instagram" className="w-4 h-4" />
                  </a>
                )}
                {homepageData?.settings.social_links?.x && (
                  <a
                    href={homepageData.settings.social_links.x}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="X (Twitter)"
                    title="X (Twitter)"
                    className="w-10 h-10 rounded-xl bg-[#03110E] hover:bg-[#002D28] border border-[#002D28] hover:border-[#00F0C6] text-white hover:text-[#00F0C6] flex items-center justify-center transition-all hover:-translate-y-0.5 shadow-sm"
                  >
                    <SocialPlatformIcon platform="x" className="w-4 h-4" />
                  </a>
                )}
                {homepageData?.settings.social_links?.linkedin && (
                  <a
                    href={homepageData.settings.social_links.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="LinkedIn"
                    title="LinkedIn"
                    className="w-10 h-10 rounded-xl bg-[#03110E] hover:bg-[#002D28] border border-[#002D28] hover:border-[#00F0C6] text-white hover:text-[#00F0C6] flex items-center justify-center transition-all hover:-translate-y-0.5 shadow-sm"
                  >
                    <SocialPlatformIcon platform="linkedin" className="w-4 h-4" />
                  </a>
                )}
                {homepageData?.settings.social_links?.youtube && (
                  <a
                    href={homepageData.settings.social_links.youtube}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="YouTube"
                    title="YouTube"
                    className="w-10 h-10 rounded-xl bg-[#03110E] hover:bg-[#002D28] border border-[#002D28] hover:border-[#00F0C6] text-white hover:text-[#00F0C6] flex items-center justify-center transition-all hover:-translate-y-0.5 shadow-sm"
                  >
                    <SocialPlatformIcon platform="youtube" className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-2.5 text-xs">
            <div className="font-bold text-white mb-2">أقسام المنصة</div>
            <button
              type="button"
              onClick={() => navigate('/apps')}
              className="block hover:text-[#00F0C6] cursor-pointer"
            >
              دليل التطبيقات الليبية
            </button>
            <button
              type="button"
              onClick={() => navigate('/companies')}
              className="block hover:text-[#00F0C6] cursor-pointer"
            >
              الشركات والمطورون
            </button>
            <button
              type="button"
              onClick={() => navigate('/launchpad')}
              className="block hover:text-[#00F0C6] cursor-pointer"
            >
              منصة إطلاق التطبيقات
            </button>
            <button
              type="button"
              onClick={() => navigate('/about')}
              className="block hover:text-[#00F0C6] cursor-pointer"
            >
              من نحن
            </button>
          </div>

          <div className="lg:col-span-2 space-y-2.5 text-xs">
            <div className="font-bold text-white mb-2">الإدارة والخدمات</div>
            <button
              type="button"
              onClick={() => setQuickAppModalOpen(true)}
              className="block hover:text-[#00F0C6] cursor-pointer"
            >
              أضف تطبيقك
            </button>
            <button
              type="button"
              onClick={() => navigate('/submit', 'sponsor')}
              className="block hover:text-[#00F0C6] cursor-pointer"
            >
              الرعاية والشراكات
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="block text-[#00F0C6] font-semibold hover:underline cursor-pointer"
            >
              لوحة التحكم المتقدمة
            </button>
            <button
              type="button"
              onClick={() => setPrivacyModalOpen(true)}
              className="block hover:text-[#00F0C6] cursor-pointer"
            >
              سياسة الخصوصية
            </button>
          </div>

          <div className="lg:col-span-3 space-y-2.5 text-xs">
            <div className="font-bold text-white mb-2">التواصل الرسمي</div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#00F0C6] shrink-0" />
              <span>{homepageData?.settings.headquarters_ar || 'طرابلس، ليبيا'}</span>
            </div>

            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#00F0C6] shrink-0" />
              <span dir="ltr" className="font-mono-num text-white">
                {homepageData?.settings.contact_email || 'info@libyaapps.ly'}
              </span>
              <button
                type="button"
                onClick={handleCopyOfficialEmail}
                className="px-2 py-0.5 rounded bg-[#002D28] text-[#00F0C6] text-[10px] hover:bg-[#00483F] cursor-pointer flex items-center gap-1"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>تم النسخ</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>نسخ</span>
                  </>
                )}
              </button>
            </div>

            {homepageData?.settings.contact_phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#00F0C6] shrink-0" />
                <span dir="ltr" className="font-mono-num text-white">
                  {homepageData.settings.contact_phone}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-[#002D28] py-5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4 text-xs text-[#A8B7B3]">
            <div>
              {homepageData?.settings.footer_copyright_ar ||
                `جميع الحقوق محفوظة © ${new Date().getFullYear()} منصة التطبيقات الليبية — LIBYA APPS.`}
            </div>
            <div className="flex items-center gap-2">
              {(
                [
                  ['facebook', homepageData?.settings.social_links?.facebook],
                  ['instagram', homepageData?.settings.social_links?.instagram],
                  ['x', homepageData?.settings.social_links?.x],
                  ['linkedin', homepageData?.settings.social_links?.linkedin],
                  ['youtube', homepageData?.settings.social_links?.youtube],
                ] as const
              ).map(([platform, url]) =>
                url ? (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={platform}
                    className="w-8 h-8 rounded-lg bg-[#03110E] hover:bg-[#002D28] border border-[#002D28] hover:border-[#00F0C6] text-[#A8B7B3] hover:text-[#00F0C6] flex items-center justify-center transition-colors"
                  >
                    <SocialPlatformIcon platform={platform} className="w-3.5 h-3.5" />
                  </a>
                ) : null
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* =====================================================================
          INTERACTIVE MODALS
         ===================================================================== */}
      <QuickAppRegistrationModal
        isOpen={quickAppModalOpen}
        onClose={() => setQuickAppModalOpen(false)}
        categories={allCategories}
        cities={allCities}
        onSuccess={() => setRefreshCounter((c) => c + 1)}
        onOpenAdmin={() => navigate('/admin')}
      />

      <PrivacyPolicyModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
      />
    </div>
  );
}
