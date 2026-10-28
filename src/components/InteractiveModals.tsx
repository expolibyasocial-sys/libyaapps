import React, { useState } from 'react';
import { CheckCircle2, FileUp, ShieldCheck, X } from 'lucide-react';
import { ApplicationCategory, City, PlatformOS } from '../types/platform';
import { AppBrandLogo, LibyaAppsPolygonIcon } from './VisualAssets';

export const PrivacyPolicyModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020807]/85 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      dir="rtl"
    >
      <div className="relative w-full max-w-2xl bg-[#03110E] border border-[#00483F] rounded-2xl shadow-2xl p-6 md:p-8 max-h-[85vh] overflow-y-auto text-white">
        <div className="flex items-center justify-between pb-4 border-b border-[#002D28] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#002D28] border border-[#00483F] flex items-center justify-center text-[#00F0C6]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                سياسة الخصوصية وحماية البيانات
              </h3>
              <p className="text-xs text-[#A8B7B3]">منصة LIBYA APPS — منصة التطبيقات الليبية</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#A8B7B3] hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm text-[#A8B7B3] leading-relaxed">
          <p>
            نحن في منصة <strong className="text-white">LIBYA APPS</strong> نلتزم بأعلى معايير الخصوصية والأمان فيما يتعلق بالبيانات والمعلومات المقدمة من المطورين والشركات التقنية وأصحاب التطبيقات.
          </p>
          <h4 className="text-base font-bold text-white pt-2">1. جمع واستخدام البيانات</h4>
          <p>
            يتم جمع المعلومات المرسلة عبر نماذج التسجيل حصرياً لأغراض توثيق التطبيقات وإدراجها ضمن الدليل الموحد والتواصل مع أصحاب المشاريع والشركات للتحقق من الصلاحيات والتفاصيل التقنية.
          </p>
          <h4 className="text-base font-bold text-white pt-2">
            2. عدم مشاركة البيانات الحساسة
          </h4>
          <p>
            لا يتم بيع أو مشاركة بيانات الاتصال الخاصة بك لأي أطراف تجارية ثالثة. المعلومات العامة فقط (مثل اسم التطبيق، التصنيف، الشعار، الروابط العامة) هي ما يتم عرضه في الدليل العام بعد الموافقة عبر لوحة التحكم.
          </p>
          <h4 className="text-base font-bold text-white pt-2">3. الأمان وحماية النماذج</h4>
          <p>
            تتم معالجة جميع الطلبات عبر بروتوكولات تشفير آمنة وبنية تحتية محمية ضد الهجمات الإلكترونية والرسائل المزعجة.
          </p>
          <h4 className="text-base font-bold text-white pt-2">4. التواصل والاستفسارات</h4>
          <p>
            لأي استفسارات حول بياناتك أو طلب تعديلها أو حذفها، يمكنك التواصل مباشرة عبر البريد الإلكتروني الرسمي:{' '}
            <a
              href="mailto:Info@libyaapps.ly"
              dir="ltr"
              className="text-[#00F0C6] underline"
            >
              Info@libyaapps.ly
            </a>
          </p>
        </div>

        <div className="mt-8 pt-4 border-t border-[#002D28] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#00F0C6] text-[#020807] font-bold text-xs hover:bg-[#39FFDB] transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,198,0.2)]"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export const QuickAppRegistrationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  categories: ApplicationCategory[];
  cities: City[];
  onSuccess: () => void;
  onOpenAdmin: () => void;
}> = ({ isOpen, onClose, categories, cities, onSuccess, onOpenAdmin }) => {
  const [step, setStep] = useState<'app' | 'company'>('app');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [refNumber, setRefNumber] = useState<string | null>(null);

  const [form, setForm] = useState({
    app_name_ar: '',
    app_name_en: '',
    category_id: categories[0]?.id || 3,
    city_name_ar: 'طرابلس',
    app_type: 'B2C',
    platforms: ['Android', 'iOS'] as PlatformOS[],
    short_description_ar: '',
    website_url: '',
    android_url: '',
    ios_url: '',
    logo_file_name: '',
    logo_url: '',
    company_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    privacy_consent: true,
  });

  if (!isOpen) return null;

  const toggleOS = (os: PlatformOS) => {
    setForm((prev) => ({
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
        setForm((prev) => ({
          ...prev,
          logo_file_name: f.name,
          logo_url: reader.result as string,
        }));
      }
    };
    reader.readAsDataURL(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/v1/submissions/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        const firstErr = json.errors ? Object.values(json.errors)[0] : null;
        setErrorMsg(String(firstErr || json.message || 'يرجى التحقق من الحقول المطلوبة.'));
      } else {
        setRefNumber(json.reference_number);
        onSuccess();
      }
    } catch (err) {
      setErrorMsg('تعذر الاتصال بالخادم.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full bg-[#020807] border border-[#002D28] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-[#6B7C77] focus:outline-none focus:border-[#00F0C6]';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020807]/85 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      dir="rtl"
    >
      <div className="relative w-full max-w-2xl bg-[#03110E] border border-[#00483F] rounded-2xl shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto text-white">
        <div className="flex items-center justify-between pb-4 border-b border-[#002D28] mb-5">
          <div className="flex items-center gap-3">
            <LibyaAppsPolygonIcon className="w-9 h-9" />
            <div>
              <h3 className="text-lg font-bold text-white">أضف تطبيقك</h3>
              <p className="text-xs text-[#A8B7B3]">
                خطوتان سريعتان لتوثيق التطبيق والشركة المطورة في الدليل الموحد
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#A8B7B3] hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {refNumber ? (
          <div className="py-6 space-y-5 text-center">
            <CheckCircle2 className="w-12 h-12 text-[#00F0C6] mx-auto" />
            <div className="space-y-2">
              <h4 className="text-xl font-bold text-white">
                تم استلام طلب تسجيل التطبيق بنجاح!
              </h4>
              <p className="text-sm text-[#A8B7B3]">
                رقم المتابعة المرجعي في قاعدة البيانات:{' '}
                <strong className="font-mono-num text-[#00F0C6]">{refNumber}</strong>
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdmin();
                }}
                className="px-6 py-2.5 rounded-xl bg-[#00F0C6] hover:bg-[#39FFDB] text-[#020807] font-bold text-xs cursor-pointer"
              >
                اعتماد ونشر التطبيق الآن في لوحة التحكم
              </button>
              <button
                type="button"
                onClick={() => {
                  setRefNumber(null);
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-[#002D28] text-white text-xs cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Step Indicator */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#020807] border border-[#002D28] rounded-xl">
              <button
                type="button"
                onClick={() => setStep('app')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  step === 'app'
                    ? 'bg-[#00F0C6] text-[#020807]'
                    : 'text-[#A8B7B3] hover:text-white'
                }`}
              >
                1. معلومات التطبيق
              </button>
              <button
                type="button"
                onClick={() => setStep('company')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  step === 'company'
                    ? 'bg-[#00F0C6] text-[#020807]'
                    : 'text-[#A8B7B3] hover:text-white'
                }`}
              >
                2. الشركة المطورة والتواصل
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-200">
                {errorMsg}
              </div>
            )}

            {step === 'app' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#A8B7B3] mb-1">
                      اسم التطبيق (بالعربية) <span className="text-[#00F0C6]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.app_name_ar}
                      onChange={(e) => setForm({ ...form, app_name_ar: e.target.value })}
                      placeholder="مثال: دينار باي"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#A8B7B3] mb-1">
                      التصنيف الرئيسي <span className="text-[#00F0C6]">*</span>
                    </label>
                    <select
                      value={form.category_id}
                      onChange={(e) =>
                        setForm({ ...form, category_id: Number(e.target.value) })
                      }
                      className={inputClass}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id} className="bg-[#020807]">
                          {c.name_ar}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Clean Logo File Upload */}
                <div className="p-3.5 rounded-xl bg-[#020807] border border-[#002D28] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {form.logo_url ? (
                      <AppBrandLogo
                        app={{
                          id: 1,
                          name_ar: form.app_name_ar || 'App',
                          logo_color: '#00F0C6',
                          logo_monogram: 'APP',
                          logo_url: form.logo_url,
                          category_slug: 'fintech',
                          is_verified: true,
                        }}
                        size="sm"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-[#002D28] flex items-center justify-center text-[#00F0C6]">
                        <FileUp className="w-4 h-4" />
                      </div>
                    )}
                    <div className="text-xs text-[#A8B7B3]">
                      {form.logo_file_name || 'شعار التطبيق (PNG, JPG, SVG)'}
                    </div>
                  </div>

                  <label className="px-3.5 py-2 text-xs font-bold bg-[#002D28] hover:bg-[#00483F] text-[#00F0C6] rounded-xl cursor-pointer flex items-center gap-1.5 shrink-0">
                    <FileUp className="w-3.5 h-3.5" />
                    <span>رفع الشعار</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoFileChange}
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A8B7B3] mb-1">
                    وصف مختصر للتطبيق <span className="text-[#00F0C6]">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={form.short_description_ar}
                    onChange={(e) =>
                      setForm({ ...form, short_description_ar: e.target.value })
                    }
                    placeholder="اكتب نبذة مختصرة لا تقل عن 15 حرفاً حول خدمات التطبيق..."
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A8B7B3] mb-1.5">
                    أنظمة التشغيل المدعومة
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['Android', 'iOS', 'Web'] as PlatformOS[]).map((os) => (
                      <button
                        key={os}
                        type="button"
                        onClick={() => toggleOS(os)}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          form.platforms.includes(os)
                            ? 'bg-[#002D28] text-[#00F0C6] border-[#00F0C6]'
                            : 'bg-[#020807] text-[#A8B7B3] border-[#002D28]'
                        }`}
                      >
                        {os}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('company')}
                    className="px-6 py-2.5 rounded-xl bg-[#00F0C6] hover:bg-[#39FFDB] text-[#020807] font-bold text-xs cursor-pointer"
                  >
                    التالي: بيانات الشركة المطورة ←
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#A8B7B3] mb-1">
                      اسم الشركة المطورة أو المؤسسة <span className="text-[#00F0C6]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.company_name}
                      onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                      placeholder="اسم الشركة التقنية المطورة"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#A8B7B3] mb-1">
                      المدينة
                    </label>
                    <select
                      value={form.city_name_ar}
                      onChange={(e) => setForm({ ...form, city_name_ar: e.target.value })}
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
                    <label className="block text-xs font-semibold text-[#A8B7B3] mb-1">
                      اسم مسؤول التواصل <span className="text-[#00F0C6]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.contact_name}
                      onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                      placeholder="الاسم الكامل"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#A8B7B3] mb-1">
                      رقم الهاتف <span className="text-[#00F0C6]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      dir="ltr"
                      value={form.contact_phone}
                      onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                      placeholder="+218 91 000 0000"
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#A8B7B3] mb-1">
                      البريد الإلكتروني الرسمي <span className="text-[#00F0C6]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      dir="ltr"
                      value={form.contact_email}
                      onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                      placeholder="contact@company.ly"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#002D28]">
                  <button
                    type="button"
                    onClick={() => setStep('app')}
                    className="px-4 py-2 text-xs text-[#A8B7B3] hover:text-white cursor-pointer"
                  >
                    → العودة لبيانات التطبيق
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-[#00F0C6] hover:bg-[#39FFDB] text-[#020807] font-bold text-xs cursor-pointer shadow-[0_0_20px_rgba(0,240,198,0.25)]"
                  >
                    {submitting ? 'جاري الإرسال...' : 'إرسال طلب التوثيق'}
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
