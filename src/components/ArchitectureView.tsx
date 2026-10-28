import React, { useState } from 'react';
import { CheckCircle2, Copy, Server } from 'lucide-react';
import { ARCHITECTURE_DELIVERABLES } from '../architecture/sourceCodeData';

export const ArchitectureView: React.FC<{ onNavigate: (route: string) => void }> = ({
  onNavigate,
}) => {
  const [selectedDocId, setSelectedDocId] = useState(ARCHITECTURE_DELIVERABLES[0].id);
  const [copied, setCopied] = useState(false);

  const activeDoc =
    ARCHITECTURE_DELIVERABLES.find((d) => d.id === selectedDocId) || ARCHITECTURE_DELIVERABLES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeDoc.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10 text-white" dir="rtl">
      <div className="bg-[#03110E] rounded-2xl p-8 border border-[#00483F] space-y-4 shadow-2xl">
        <div className="text-xs text-[#00F0C6] font-semibold">
          توثيق المعمارية الهندسية · الكود المصدري الكامل · حالة الاختبار والتشغيل
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
          المعمارية الشاملة لمنصة LIBYA APPS (Next.js + Laravel 11 + Filament v3 + MySQL 8)
        </h1>
        <p className="text-sm sm:text-base text-[#A8B7B3] max-w-3xl leading-relaxed">
          يجمع هذا القسم بين نظام المعاينة الحية الكامل المتصل بواجهة{' '}
          <code className="font-mono-num text-[#00F0C6]">/api/v1</code> وقاعدة البيانات العلائقية، وبين ملفات الكود المصدري الإنتاجي لـ Laravel 11 و Filament v3 و MySQL 8.0 ودليل النشر على Ubuntu VPS.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('/submit')}
            className="px-5 py-2.5 text-xs font-bold bg-[#00F0C6] hover:bg-[#39FFDB] text-[#020807] rounded-xl transition-all cursor-pointer"
          >
            تجربة إرسال تطبيق (الخطوة 1 من مسار التحقق)
          </button>
          <button
            onClick={() => onNavigate('/admin')}
            className="px-5 py-2.5 text-xs font-bold bg-[#002D28] hover:bg-[#00483F] text-white border border-[#00483F] rounded-xl transition-colors cursor-pointer"
          >
            فتح لوحة التحكم Filament RTL للاعتماد والنشر
          </button>
        </div>
      </div>

      {/* Transparency & Verification Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#03110E] rounded-2xl border border-[#002D28] p-6 space-y-3">
          <div className="flex items-center gap-2 text-[#00F0C6] font-bold text-base">
            <CheckCircle2 className="w-5 h-5" />
            <span>ما تم تشغيله واختباره فعلياً في بيئة المعاينة الحالية (المنفذ 3000)</span>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-[#A8B7B3] leading-relaxed">
            <li>
              • جميع مسارات REST API القياسية (<code className="font-mono-num text-white">/api/v1/apps</code>,{' '}
              <code className="font-mono-num text-white">/api/v1/companies</code>,{' '}
              <code className="font-mono-num text-white">/api/v1/news</code>,{' '}
              <code className="font-mono-num text-white">/api/v1/launches</code>,{' '}
              <code className="font-mono-num text-white">/api/v1/exhibitions</code>,{' '}
              <code className="font-mono-num text-white">/api/v1/homepage</code>,{' '}
              <code className="font-mono-num text-white">/api/v1/search</code>).
            </li>
            <li>
              • جميع مسارات الإرسال الـ 6 (<code className="font-mono-num text-white">POST /api/v1/submissions/*</code>) مع التحقق الإلزامي من اسم الشركة المطورة ورسائل الخطأ العربية وتوليد الأرقام المرجعية.
            </li>
            <li>
              • دورة العمل الكاملة من 7 خطوات: إرسال تطبيق ← التحقق ← الحفظ في قاعدة البيانات ← المراجعة في لوحة الإدارة العربية (RTL) ← الاعتماد والنشر الفوري ← ظهور التطبيق في دليل{' '}
              <code className="font-mono-num text-white">/apps</code> وتحديث عدادات الصفحة الرئيسية تلقائياً.
            </li>
            <li>
              • خريطة الموقع الديناميكية <code className="font-mono-num text-white">/sitemap.xml</code> وملف{' '}
              <code className="font-mono-num text-white">/robots.txt</code> والبيانات المهيكلة JSON-LD.
            </li>
          </ul>
        </div>

        <div className="bg-[#03110E] rounded-2xl border border-[#002D28] p-6 space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Server className="w-5 h-5 text-[#00F0C6]" />
            <span>ما تم توليده كملفات مصدرية ويتطلب خادم PHP/MySQL خارجي للتنفيذ</span>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-[#A8B7B3] leading-relaxed">
            <li>
              • نظراً لأن بيئة حاوية المعاينة الحالية تعمل بنواة Node.js ولا تتضمن مفسر PHP-FPM أو خادم MySQL 8.0 محلي، فقد تم توليد الكود المصدري الفعلي لمشروع Laravel 11 + Filament v3 في المجلد{' '}
              <code className="font-mono-num text-white">/backend-laravel/</code>.
            </li>
            <li>
              • يشمل ذلك ملف الهجرة الكامل لـ 23 جدولاً علائقياً، ومورد Filament{' '}
              <code className="font-mono-num text-white">SubmissionResource.php</code>، واختبارات{' '}
              <code className="font-mono-num text-white">LibyaAppsWorkflowTest.php</code>، ودليل النشر الإنتاجي{' '}
              <code className="font-mono-num text-white">/deployment/VPS_DEPLOYMENT_GUIDE.md</code>.
            </li>
            <li>
              • لم يتم تشغيل أوامر <code className="font-mono-num text-white">php artisan test</code> داخل الحاوية لعدم توفر ثنائيات PHP/MySQL في بيئة الساندبوكس، وهي جاهزة للتنفيذ الفوري على خادم Ubuntu LTS VPS.
            </li>
          </ul>
        </div>
      </div>

      {/* Interactive Code & Architecture Browser */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-2">
          {ARCHITECTURE_DELIVERABLES.map((doc) => (
            <button
              key={doc.id}
              onClick={() => setSelectedDocId(doc.id)}
              className={`w-full text-right p-4 rounded-xl border transition-all cursor-pointer ${
                selectedDocId === doc.id
                  ? 'bg-[#002D28] text-white border-[#00F0C6] shadow-[0_0_20px_rgba(0,240,198,0.15)]'
                  : 'bg-[#03110E] text-[#A8B7B3] border-[#002D28] hover:border-[#00483F] hover:text-white'
              }`}
            >
              <div className="text-[11px] font-mono-num text-[#00F0C6]">{doc.stack}</div>
              <div className="font-bold text-sm mt-1 text-white">{doc.title_ar}</div>
              <div className="text-[11px] font-mono-num text-[#6B7C77] mt-1 truncate">
                {doc.path}
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-8 bg-[#03110E] rounded-2xl border border-[#002D28] overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#002D28] flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-white text-base">{activeDoc.title_ar}</h2>
              <p className="text-xs text-[#A8B7B3] mt-1">{activeDoc.description_ar}</p>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-[#002D28] hover:bg-[#00483F] text-[#00F0C6] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'تم النسخ' : 'نسخ الكود'}</span>
            </button>
          </div>
          <pre
            dir="ltr"
            className="p-5 bg-[#020807] text-slate-100 text-xs font-mono-num overflow-x-auto leading-relaxed flex-1"
          >
            <code>{activeDoc.code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
