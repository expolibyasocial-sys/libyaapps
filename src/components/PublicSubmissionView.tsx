import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, FileUp } from 'lucide-react';
import { ApplicationCategory, City, NewsCategory, PlatformOS } from '../types/platform';
import { AppBrandLogo } from './VisualAssets';

export type SubmissionFormTab = 'app' | 'sponsor' | 'contact';

interface PublicSubmissionViewProps {
  initialTab?: SubmissionFormTab;
  categories: ApplicationCategory[];
  newsCategories?: NewsCategory[];
  cities: City[];
  onSubmissionSuccess: () => void;
  onOpenAdminReview: () => void;
}

export const PublicSubmissionView: React.FC<PublicSubmissionViewProps> = ({
  initialTab = 'app',
  categories,
  cities,
  onSubmissionSuccess,
  onOpenAdminReview,
}) => {
  const [activeTab, setActiveTab] = useState<SubmissionFormTab>(initialTab);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{
    reference_number: string;
    message: string;
    title: string;
  } | null>(null);

  const [appForm, setAppForm] = useState({
    app_name_ar: '',
    app_name_en: '',
    company_name: '',
    category_id: categories[0]?.id || 3,
    city_name_ar: 'طرابلس',
    app_type: 'B2C',
    platforms: ['Android', 'iOS'] as PlatformOS[],
    launch_year: 2026,
    short_description_ar: '',
    full_description_ar: '',
    website_url: '',
    android_url: '',
    ios_url: '',
    logo_file_name: '',
    logo_url: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    privacy_consent: false,
  });

  const [sponsorForm, setSponsorForm] = useState({
    company_name: '',
    sector: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    sponsorship_type: 'الراعي الاستراتيجي',
    approximate_budget: '',
    notes: '',
    privacy_consent: false,
  });

  const [contactForm, setContactForm] = useState({
    subject: '',
    organization: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    message: '',
    privacy_consent: false,
  });

  const tabs: { id: SubmissionFormTab; label: string; desc: string }[] = [
    {
      id: 'app',
      label: 'أضف تطبيقك',
      desc: 'سجل تطبيقك وشعاره الخاص في الدليل الموحد',
    },
    {
      id: 'sponsor',
      label: 'الرعاية والشراكات',
      desc: 'فرص الرعاية الاستراتيجية والإعلان في المنصة',
    },
    {
      id: 'contact',
      label: 'تواصل معنا',
      desc: 'الاستفسارات العامة والتعاون التقني',
    },
  ];

  const togglePlatform = (os: PlatformOS) => {
    setAppForm((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(os)
        ? prev.platforms.filter((p) => p !== os)
        : [...prev.platforms, os],
    }));
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAppForm((prev) => ({
          ...prev,
          logo_file_name: f.name,
          logo_url: reader.result as string,
        }));
      }
    };
    reader.readAsDataURL(f);
  };

  const submitEndpoint = async (endpoint: string, payload: Record<string, any>, title: string) => {
    setSubmitting(true);
    setErrors({});
    setGeneralError(null);
    setConfirmation(null);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok) {
        if (json.errors) {
          setErrors(json.errors);
        }
        setGeneralError(json.message || 'يرجى التحقق من الحقول المطلوبة.');
        return;
      }

      setConfirmation({
        reference_number: json.reference_number,
        message: json.message,
        title,
      });
      onSubmissionSuccess();
    } catch (err) {
      setGeneralError('تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-3.5 py-2.5 text-sm rounded-xl bg-[#020807] border border-[#002D28] text-white placeholder:text-[#6B7C77] focus:outline-none focus:border-[#00F0C6]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto px-4 sm:px-6 py-10 text-white"
      dir="rtl"
    >
      <div className="mb-8 space-y-2">
        <div className="text-xs text-[#00F0C6] font-semibold">
          بوابة التسجيل والإرسال الموحدة · متصلة بقاعدة البيانات ولوحة التحكم
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
          أضف تطبيقك وتواصل مع منصة التطبيقات الليبية
        </h1>
        <p className="text-sm sm:text-base text-[#A8B7B3] max-w-3xl">
          جميع الطلبات تخضع للتحقق وتُحفظ مباشرة في قاعدة البيانات مع إصدار رقم مرجعي فوري للمتابعة والاعتماد.
        </p>
      </div>

      {/* Form Type Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setErrors({});
                setGeneralError(null);
                setConfirmation(null);
              }}
              className={`text-right p-4 rounded-xl border transition-all cursor-pointer ${
                active
                  ? 'bg-[#002D28] text-white border-[#00F0C6] shadow-[0_0_20px_rgba(0,240,198,0.16)]'
                  : 'bg-[#03110E] text-white border-[#002D28] hover:border-[#00483F]'
              }`}
            >
              <div className={`text-sm font-bold ${active ? 'text-[#00F0C6]' : 'text-white'}`}>
                {tab.label}
              </div>
              <div className="text-xs mt-1 text-[#A8B7B3]">{tab.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Confirmation State */}
      {confirmation && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 bg-[#03110E] border-2 border-[#00F0C6] rounded-2xl p-6 sm:p-8 space-y-4 shadow-[0_0_30px_rgba(0,240,198,0.12)]"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-7 h-7 text-[#00F0C6] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-xs font-semibold text-[#00F0C6]">
                تم استلام وحفظ الطلب في قاعدة البيانات بنجاح
              </div>
              <h2 className="text-xl font-display font-bold text-white">{confirmation.title}</h2>
              <p className="text-sm text-[#A8B7B3]">{confirmation.message}</p>
            </div>
          </div>

          <div className="bg-[#020807] rounded-xl p-4 border border-[#002D28] flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs text-[#A8B7B3]">رقم المتابعة المرجعي (Reference Number)</div>
              <div className="text-lg font-mono-num font-bold text-[#00F0C6] mt-0.5">
                {confirmation.reference_number}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onOpenAdminReview}
                className="px-5 py-2.5 text-xs font-bold bg-[#00F0C6] hover:bg-[#39FFDB] text-[#020807] rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,198,0.2)]"
              >
                مراجعة واعتماد الطلب الآن في لوحة التحكم
              </button>
              <button
                type="button"
                onClick={() => setConfirmation(null)}
                className="px-4 py-2.5 text-xs font-semibold bg-[#002D28] text-white border border-[#00483F] rounded-xl cursor-pointer"
              >
                إرسال طلب آخر
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {generalError && (
        <div className="mb-6 bg-red-950/60 border border-red-500/40 text-red-200 rounded-xl p-4 text-xs sm:text-sm font-medium">
          {generalError}
        </div>
      )}

      {/* 1. Application Submission Form */}
      {activeTab === 'app' && !confirmation && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitEndpoint(
              '/api/v1/submissions/apps',
              appForm,
              `طلب إدراج تطبيق: ${appForm.app_name_ar}`
            );
          }}
          className="bg-[#03110E] rounded-2xl border border-[#00483F] p-6 sm:p-8 space-y-6 shadow-2xl"
        >
          <div className="border-b border-[#002D28] pb-4">
            <h2 className="text-lg font-display font-bold text-white">أضف تطبيقك</h2>
            <p className="text-xs text-[#A8B7B3] mt-1">
              الحقول المعلمة بـ (*) إلزامية، مع إمكانية رفع شعار التطبيق الخاص بك ليظهر في الدليل.
            </p>
          </div>

          {/* Clean App Logo Upload Box */}
          <div className="p-4 rounded-2xl bg-[#020807] border border-[#002D28] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {appForm.logo_url ? (
                <AppBrandLogo
                  app={{
                    id: 1,
                    name_ar: appForm.app_name_ar || 'App',
                    logo_color: '#00F0C6',
                    logo_monogram: 'APP',
                    logo_url: appForm.logo_url,
                    category_slug: 'fintech',
                    is_verified: true,
                  }}
                  size="md"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-[#002D28] border border-[#00483F] flex items-center justify-center text-[#00F0C6]">
                  <FileUp className="w-6 h-6" />
                </div>
              )}
              <div>
                <div className="text-sm font-bold text-white">شعار التطبيق</div>
                <div className="text-xs text-[#A8B7B3]">
                  {appForm.logo_file_name || 'قم برفع صورة شعار التطبيق (PNG, JPG, SVG)'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="px-4 py-2.5 text-xs font-bold bg-[#002D28] hover:bg-[#00483F] border border-[#00483F] text-[#00F0C6] rounded-xl cursor-pointer flex items-center gap-2 transition-colors">
                <FileUp className="w-4 h-4" />
                <span>رفع شعار التطبيق</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoFileChange}
                />
              </label>
              {appForm.logo_url && (
                <button
                  type="button"
                  onClick={() => setAppForm({ ...appForm, logo_url: '', logo_file_name: '' })}
                  className="px-3 py-2.5 text-xs bg-red-950/60 border border-red-500/30 text-red-200 rounded-xl cursor-pointer"
                >
                  حذف الصورة
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-[#A8B7B3] mb-1.5">
                اسم التطبيق (بالعربية) <span className="text-[#00F0C6]">*</span>
              </label>
              <input
                type="text"
                value={appForm.app_name_ar}
                onChange={(e) => setAppForm({ ...appForm, app_name_ar: e.target.value })}
                placeholder="مثال: دينار باي للدفع الرقمي"
                className={inputClass}
              />
              {errors.app_name_ar && (
                <p className="text-xs text-red-400 mt-1">{errors.app_name_ar}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A8B7B3] mb-1.5">
                اسم التطبيق (بالإنجليزية)
              </label>
              <input
                type="text"
                dir="ltr"
                value={appForm.app_name_en}
                onChange={(e) => setAppForm({ ...appForm, app_name_en: e.target.value })}
                placeholder="DinarPay"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A8B7B3] mb-1.5">
                اسم الشركة المطورة أو المالك <span className="text-[#00F0C6]">*</span>
              </label>
              <input
                type="text"
                value={appForm.company_name}
                onChange={(e) => setAppForm({ ...appForm, company_name: e.target.value })}
                placeholder="اسم الشركة التقنية المطورة"
                className={inputClass}
              />
              {errors.company_name && (
                <p className="text-xs text-red-400 mt-1">{errors.company_name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A8B7B3] mb-1.5">
                التصنيف الرئيسي <span className="text-[#00F0C6]">*</span>
              </label>
              <select
                value={appForm.category_id}
                onChange={(e) => setAppForm({ ...appForm, category_id: Number(e.target.value) })}
                className={inputClass}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-[#020807]">
                    {cat.name_ar}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A8B7B3] mb-1.5">
                المدينة الليبية
              </label>
              <select
                value={appForm.city_name_ar}
                onChange={(e) => setAppForm({ ...appForm, city_name_ar: e.target.value })}
                className={inputClass}
              >
                {cities.map((c) => (
                  <option key={c.id} value={c.name_ar} className="bg-[#020807]">
                    {c.name_ar}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A8B7B3] mb-1.5">
                الأنظمة المدعومة
              </label>
              <div className="flex items-center gap-2 pt-1">
                {(['Android', 'iOS', 'Web'] as PlatformOS[]).map((os) => {
                  const selected = appForm.platforms.includes(os);
                  return (
                    <button
                      key={os}
                      type="button"
                      onClick={() => togglePlatform(os)}
                      className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        selected
                          ? 'bg-[#002D28] text-[#00F0C6] border-[#00F0C6]'
                          : 'bg-[#020807] text-[#A8B7B3] border-[#002D28]'
                      }`}
                    >
                      {os}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A8B7B3] mb-1.5">
              الوصف المختصر للتطبيق <span className="text-[#00F0C6]">*</span>
            </label>
            <input
              type="text"
              value={appForm.short_description_ar}
              onChange={(e) => setAppForm({ ...appForm, short_description_ar: e.target.value })}
              placeholder="جملة تعريفية توضح القيمة الأساسية للتطبيق (15 حرفاً على الأقل)"
              className={inputClass}
            />
            {errors.short_description_ar && (
              <p className="text-xs text-red-400 mt-1">{errors.short_description_ar}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A8B7B3] mb-1.5">
              الوصف التفصيلي والمميزات
            </label>
            <textarea
              rows={3}
              value={appForm.full_description_ar}
              onChange={(e) => setAppForm({ ...appForm, full_description_ar: e.target.value })}
              placeholder="اشرح خدمات التطبيق، الفئة المستهدفة، وأهم المزايا التقنية..."
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#A8B7B3] mb-1.5">
                الموقع الرسمي (Website)
              </label>
              <input
                type="url"
                dir="ltr"
                value={appForm.website_url}
                onChange={(e) => setAppForm({ ...appForm, website_url: e.target.value })}
                placeholder="https://example.ly"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#A8B7B3] mb-1.5">
                رابط Google Play
              </label>
              <input
                type="url"
                dir="ltr"
                value={appForm.android_url}
                onChange={(e) => setAppForm({ ...appForm, android_url: e.target.value })}
                placeholder="https://play.google.com/..."
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#A8B7B3] mb-1.5">
                رابط Apple App Store
              </label>
              <input
                type="url"
                dir="ltr"
                value={appForm.ios_url}
                onChange={(e) => setAppForm({ ...appForm, ios_url: e.target.value })}
                placeholder="https://apps.apple.com/..."
                className={inputClass}
              />
            </div>
          </div>

          {/* Contact Person */}
          <div className="pt-4 border-t border-[#002D28] grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#A8B7B3] mb-1.5">
                اسم مسؤول التواصل <span className="text-[#00F0C6]">*</span>
              </label>
              <input
                type="text"
                value={appForm.contact_name}
                onChange={(e) => setAppForm({ ...appForm, contact_name: e.target.value })}
                placeholder="الاسم الكامل"
                className={inputClass}
              />
              {errors.contact_name && (
                <p className="text-xs text-red-400 mt-1">{errors.contact_name}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#A8B7B3] mb-1.5">
                البريد الإلكتروني الرسمي <span className="text-[#00F0C6]">*</span>
              </label>
              <input
                type="email"
                dir="ltr"
                value={appForm.contact_email}
                onChange={(e) => setAppForm({ ...appForm, contact_email: e.target.value })}
                placeholder="contact@company.ly"
                className={inputClass}
              />
              {errors.contact_email && (
                <p className="text-xs text-red-400 mt-1">{errors.contact_email}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#A8B7B3] mb-1.5">
                رقم الهاتف <span className="text-[#00F0C6]">*</span>
              </label>
              <input
                type="tel"
                dir="ltr"
                value={appForm.contact_phone}
                onChange={(e) => setAppForm({ ...appForm, contact_phone: e.target.value })}
                placeholder="+218 91 000 0000"
                className={inputClass}
              />
              {errors.contact_phone && (
                <p className="text-xs text-red-400 mt-1">{errors.contact_phone}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2.5 pt-2">
            <input
              id="app-consent"
              type="checkbox"
              checked={appForm.privacy_consent}
              onChange={(e) => setAppForm({ ...appForm, privacy_consent: e.target.checked })}
              className="mt-1 w-4 h-4 accent-[#00F0C6]"
            />
            <label htmlFor="app-consent" className="text-xs text-[#A8B7B3]">
              أقر بصحة البيانات المرفقة وبملكية الشركة المطورة للتطبيق، وأوافق على سياسة الخصوصية وشروط النشر في منصة LIBYA APPS.
            </label>
          </div>
          {errors.privacy_consent && (
            <p className="text-xs text-red-400">{errors.privacy_consent}</p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 text-sm font-bold bg-[#00F0C6] hover:bg-[#39FFDB] text-[#020807] rounded-xl transition-all cursor-pointer disabled:opacity-50 shadow-[0_0_20px_rgba(0,240,198,0.25)]"
            >
              {submitting ? 'جاري إرسال الطلب...' : 'أضف تطبيقك'}
            </button>
          </div>
        </form>
      )}

      {/* 2. Sponsor Registration Form */}
      {activeTab === 'sponsor' && !confirmation && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitEndpoint(
              '/api/v1/submissions/sponsors',
              sponsorForm,
              `طلب رعاية رسمية: ${sponsorForm.company_name}`
            );
          }}
          className="bg-[#03110E] rounded-2xl border border-[#00483F] p-6 sm:p-8 space-y-6 shadow-2xl"
        >
          <div className="border-b border-[#002D28] pb-4">
            <h2 className="text-lg font-display font-bold text-white">
              نموذج الرعاية والشراكة الاستراتيجية
            </h2>
            <p className="text-xs text-[#A8B7B3] mt-1">
              مخصص للمصارف، شركات الاتصالات، والمؤسسات الراغبة في الرعاية الرسمية أو المساحات الإعلانية في المنصة.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-[#A8B7B3] mb-1.5">
                اسم الشركة أو المؤسسة الراعية <span className="text-[#00F0C6]">*</span>
              </label>
              <input
                type="text"
                value={sponsorForm.company_name}
                onChange={(e) => setSponsorForm({ ...sponsorForm, company_name: e.target.value })}
                className={inputClass}
              />
              {errors.company_name && (
                <p className="text-xs text-red-400 mt-1">{errors.company_name}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#A8B7B3] mb-1.5">
                قطاع العمل <span className="text-[#00F0C6]">*</span>
              </label>
              <input
                type="text"
                value={sponsorForm.sector}
                onChange={(e) => setSponsorForm({ ...sponsorForm, sector: e.target.value })}
                placeholder="مثال: قطاع المصارف والمدفوعات / الاتصالات"
                className={inputClass}
              />
              {errors.sector && <p className="text-xs text-red-400 mt-1">{errors.sector}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#A8B7B3] mb-1.5">
                فئة الرعاية المطلوبة
              </label>
              <select
                value={sponsorForm.sponsorship_type}
                onChange={(e) =>
                  setSponsorForm({ ...sponsorForm, sponsorship_type: e.target.value })
                }
                className={inputClass}
              >
                <option value="الراعي الاستراتيجي" className="bg-[#020807]">
                  الراعي الاستراتيجي (Strategic Sponsor)
                </option>
                <option value="الراعي البلاتيني" className="bg-[#020807]">
                  الراعي البلاتيني (Platinum Sponsor)
                </option>
                <option value="الراعي الذهبي" className="bg-[#020807]">
                  الراعي الذهبي (Gold Sponsor)
                </option>
                <option value="رعاية المساحات الإعلانية في الدليل" className="bg-[#020807]">
                  رعاية المساحات الإعلانية في الدليل
                </option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#A8B7B3] mb-1.5">
                الميزانية التقديرية المرصودة
              </label>
              <input
                type="text"
                value={sponsorForm.approximate_budget}
                onChange={(e) =>
                  setSponsorForm({ ...sponsorForm, approximate_budget: e.target.value })
                }
                placeholder="اختياري"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#A8B7B3] mb-1.5">
                اسم الشخص المسؤول <span className="text-[#00F0C6]">*</span>
              </label>
              <input
                type="text"
                value={sponsorForm.contact_name}
                onChange={(e) => setSponsorForm({ ...sponsorForm, contact_name: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#A8B7B3] mb-1.5">
                رقم الهاتف <span className="text-[#00F0C6]">*</span>
              </label>
              <input
                type="tel"
                dir="ltr"
                value={sponsorForm.contact_phone}
                onChange={(e) => setSponsorForm({ ...sponsorForm, contact_phone: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#A8B7B3] mb-1.5">
                البريد الإلكتروني الرسمي <span className="text-[#00F0C6]">*</span>
              </label>
              <input
                type="email"
                dir="ltr"
                value={sponsorForm.contact_email}
                onChange={(e) => setSponsorForm({ ...sponsorForm, contact_email: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <input
              id="spn-consent"
              type="checkbox"
              checked={sponsorForm.privacy_consent}
              onChange={(e) =>
                setSponsorForm({ ...sponsorForm, privacy_consent: e.target.checked })
              }
              className="mt-1 w-4 h-4 accent-[#00F0C6]"
            />
            <label htmlFor="spn-consent" className="text-xs text-[#A8B7B3]">
              أوافق على سياسة الخصوصية والتواصل المباشر من إدارة الشراكات في منصة LIBYA APPS.
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 text-sm font-bold bg-[#00F0C6] hover:bg-[#39FFDB] text-[#020807] rounded-xl transition-all cursor-pointer shadow-[0_0_20px_rgba(0,240,198,0.25)]"
          >
            {submitting ? 'جاري الإرسال...' : 'إرسال طلب الرعاية الرسمية'}
          </button>
        </form>
      )}

      {/* 3. Direct Contact Form */}
      {activeTab === 'contact' && !confirmation && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitEndpoint(
              '/api/v1/submissions/contact',
              contactForm,
              `رسالة تواصل: ${contactForm.subject}`
            );
          }}
          className="bg-[#03110E] rounded-2xl border border-[#00483F] p-6 sm:p-8 space-y-6 shadow-2xl"
        >
          <div className="border-b border-[#002D28] pb-4">
            <h2 className="text-lg font-display font-bold text-white">نموذج التواصل المباشر</h2>
            <p className="text-xs text-[#A8B7B3] mt-1">
              للاستفسارات العامة، مقترحات التطوير، أو طلبات التعاون الإعلامي والمؤسسي.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-[#A8B7B3] mb-1.5">
                موضوع الرسالة <span className="text-[#00F0C6]">*</span>
              </label>
              <input
                type="text"
                value={contactForm.subject}
                onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                className={inputClass}
              />
              {errors.subject && <p className="text-xs text-red-400 mt-1">{errors.subject}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#A8B7B3] mb-1.5">
                الجهة أو المؤسسة
              </label>
              <input
                type="text"
                value={contactForm.organization}
                onChange={(e) => setContactForm({ ...contactForm, organization: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#A8B7B3] mb-1.5">
                الاسم الكامل <span className="text-[#00F0C6]">*</span>
              </label>
              <input
                type="text"
                value={contactForm.contact_name}
                onChange={(e) => setContactForm({ ...contactForm, contact_name: e.target.value })}
                className={inputClass}
              />
              {errors.contact_name && (
                <p className="text-xs text-red-400 mt-1">{errors.contact_name}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#A8B7B3] mb-1.5">
                البريد الإلكتروني <span className="text-[#00F0C6]">*</span>
              </label>
              <input
                type="email"
                dir="ltr"
                value={contactForm.contact_email}
                onChange={(e) => setContactForm({ ...contactForm, contact_email: e.target.value })}
                className={inputClass}
              />
              {errors.contact_email && (
                <p className="text-xs text-red-400 mt-1">{errors.contact_email}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A8B7B3] mb-1.5">
              نص الرسالة <span className="text-[#00F0C6]">*</span>
            </label>
            <textarea
              rows={4}
              value={contactForm.message}
              onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
              className={inputClass}
            />
            {errors.message && <p className="text-xs text-red-400 mt-1">{errors.message}</p>}
          </div>

          <div className="flex items-start gap-2.5">
            <input
              id="cnt-consent"
              type="checkbox"
              checked={contactForm.privacy_consent}
              onChange={(e) =>
                setContactForm({ ...contactForm, privacy_consent: e.target.checked })
              }
              className="mt-1 w-4 h-4 accent-[#00F0C6]"
            />
            <label htmlFor="cnt-consent" className="text-xs text-[#A8B7B3]">
              أوافق على سياسة الخصوصية.
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 text-sm font-bold bg-[#00F0C6] hover:bg-[#39FFDB] text-[#020807] rounded-xl transition-all cursor-pointer shadow-[0_0_20px_rgba(0,240,198,0.25)]"
          >
            {submitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}
          </button>
        </form>
      )}
    </motion.div>
  );
};
