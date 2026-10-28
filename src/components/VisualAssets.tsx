import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Briefcase,
  Building2,
  Car,
  ChevronLeft,
  ChevronRight,
  Cpu,
  CreditCard,
  Gamepad2,
  GraduationCap,
  HeartPulse,
  Landmark,
  Plane,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Truck,
} from 'lucide-react';
import { AppIconName, ApplicationItem } from '../types/platform';

export const LibyaAppsPolygonIcon: React.FC<{ className?: string }> = ({
  className = 'w-9 h-9',
}) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <div className="absolute inset-0 bg-[#00F0C6]/20 rounded-xl blur-[10px] transform scale-110 pointer-events-none" />
    <svg
      viewBox="0 0 1000 1000"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full relative z-10 drop-shadow-[0_0_12px_rgba(0,240,198,0.45)]"
      aria-hidden="true"
    >
      <polygon points="294,260 416,260 535,434 475,467" fill="#00F0C6" />
      <polygon points="650,255 774,255 638,434 535,434" fill="#00F0C6" />
      <polygon points="225,420 225,740 475,740 528,650 330,650 330,550" fill="#00F0C6" />
      <polygon points="432,630 530,630 602,530 535,434 482,515" fill="#00F0C6" />
    </svg>
  </div>
);

/**
 * Recognizable Real App Logos (Facebook, Instagram, Twitter, WhatsApp, Telegram, YouTube, LinkedIn, TikTok, Messenger)
 * encoded as crisp, self-contained SVG Data URLs so every application displays a real app logo image by default,
 * and can be replaced with any uploaded image file (PNG/JPG/SVG/WebP).
 */
export const INITIAL_BRAND_LOGOS: Record<string, { label: string; dataUrl: string }> = {
  facebook: {
    label: 'Facebook',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="28" fill="#1877F2"/><path d="M81.5 76.5l3.5-22.5H63.5V39.4c0-6.2 3-12.2 12.8-12.2H86V8.1S77.1 6.5 68.6 6.5c-17.8 0-29.4 10.8-29.4 30.3V54H19.5v22.5h19.7v53.5h24.3V76.5h18z" fill="#FFFFFF" transform="translate(0, -5) scale(0.95)"/></svg>`
    )}`,
  },
  instagram: {
    label: 'Instagram',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><radialGradient id="ig" cx="30%" cy="107%" r="150%"><stop offset="0%" stop-color="#fdf497"/><stop offset="5%" stop-color="#fdf497"/><stop offset="45%" stop-color="#fd5949"/><stop offset="60%" stop-color="#d6249f"/><stop offset="90%" stop-color="#285AEB"/></radialGradient></defs><rect width="120" height="120" rx="28" fill="url(#ig)"/><rect x="24" y="24" width="72" height="72" rx="20" fill="none" stroke="#FFFFFF" stroke-width="7"/><circle cx="60" cy="60" r="17" fill="none" stroke="#FFFFFF" stroke-width="7"/><circle cx="80" cy="40" r="4.8" fill="#FFFFFF"/></svg>`
    )}`,
  },
  twitter: {
    label: 'Twitter',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="28" fill="#1DA1F2"/><path d="M96.6 41.2c.05.78.05 1.56.05 2.35 0 24-18.27 51.68-51.68 51.68-10.29 0-19.86-2.99-27.91-8.16 1.46.17 2.86.22 4.37.22 8.51 0 16.34-2.86 22.56-7.73-7.95-.17-14.66-5.37-16.96-12.54 1.12.17 2.24.28 3.41.28 1.62 0 3.25-.22 4.76-.62-8.29-1.68-14.55-8.96-14.55-17.8v-.22c2.41 1.34 5.21 2.18 8.17 2.29-4.87-3.25-8.06-8.79-8.06-15.06 0-3.36.89-6.44 2.46-9.12 8.95 11.03 22.39 18.25 37.45 19.03-.28-1.34-.45-2.74-.45-4.14 0-9.96 8.06-18.08 18.08-18.08 5.21 0 9.91 2.18 13.21 5.71 4.09-.78 7.95-2.29 11.42-4.37-1.34 4.2-4.2 7.73-7.95 9.96 3.64-.39 7.16-1.4 10.41-2.8-.2 3.58-2.6 6.72-5.79 9.18z" fill="#FFFFFF"/></svg>`
    )}`,
  },
  whatsapp: {
    label: 'WhatsApp',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="28" fill="#25D366"/><path d="M60 22c-20.9 0-38 16.9-38 37.7 0 7.1 2 14 5.8 20L22 98l18.9-5.5c5.7 3.1 12.3 4.8 19.1 4.8 20.9 0 38-16.9 38-37.7S80.9 22 60 22z" fill="none" stroke="#FFFFFF" stroke-width="7" stroke-linejoin="round"/><path d="M48.5 44.5c-1.2-2.6-2.4-2.7-3.6-2.7-1 0-2.1 0-3.2 0s-2.9.4-4.4 2.1c-1.5 1.7-5.8 5.6-5.8 13.7s6 15.9 6.8 17c.8 1.1 11.6 18.5 28.6 25.2 14.1 5.6 17 4.5 20.1 4.2 3.1-.3 9.9-4 11.3-7.9 1.4-3.9 1.4-7.2 1-7.9-.4-.7-1.5-1.1-3.2-2s-9.9-4.9-11.5-5.4c-1.5-.6-2.7-.8-3.8.8-1.1 1.7-4.4 5.4-5.3 6.5-1 1.1-2 1.3-3.6.4-1.7-.8-7.1-2.6-13.5-8.3-5-4.4-8.4-9.9-9.4-11.6-1-1.7-.1-2.6.7-3.4.8-.7 1.7-2 2.5-2.9.8-1 1.1-1.7 1.7-2.8.6-1.1.3-2.1-.1-2.9-.4-.8-3.7-9.1-5.1-12.5z" fill="#FFFFFF" transform="translate(8, -6) scale(0.82)"/></svg>`
    )}`,
  },
  telegram: {
    label: 'Telegram',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="28" fill="#26A5E4"/><path d="M90.5 31.8L22.8 57.9c-4.6 1.8-4.5 4.4-.8 5.5l17.4 5.4 40.2-25.4c1.9-1.2 3.6-.5 2.2.8L49.2 73.6l-1.2 18.1c1.8 0 2.6-.8 3.6-1.8l8.7-8.4 18.1 13.4c3.3 1.8 5.7.9 6.5-3.1l11.8-55.6c1.2-4.8-1.8-7-6.2-4.4z" fill="#FFFFFF"/></svg>`
    )}`,
  },
  youtube: {
    label: 'YouTube',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="28" fill="#FF0000"/><polygon points="48,38 48,82 86,60" fill="#FFFFFF"/></svg>`
    )}`,
  },
  linkedin: {
    label: 'LinkedIn',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="28" fill="#0A66C2"/><circle cx="37" cy="36" r="8.5" fill="#FFFFFF"/><rect x="29.5" y="50" width="15" height="44" rx="2" fill="#FFFFFF"/><path d="M55 50h14.3v6c2-3.8 7.1-7.2 14.5-7.2 15.2 0 18.2 10 18.2 23V94H87V74.2c0-4.7-.1-10.8-6.6-10.8-6.6 0-7.6 5.1-7.6 10.4V94H55V50z" fill="#FFFFFF"/></svg>`
    )}`,
  },
  tiktok: {
    label: 'TikTok',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="28" fill="#090D16"/><path d="M84 44.5c-6.8 0-12.4-5.5-12.4-12.4V24H58.5v51.2c0 6.2-5 11.2-11.2 11.2s-11.2-5-11.2-11.2 5-11.2 11.2-11.2c1.2 0 2.3.2 3.4.6V51.1c-1.1-.2-2.2-.3-3.4-.3-13.4 0-24.3 10.9-24.3 24.3S33.9 99.4 47.3 99.4s24.3-10.9 24.3-24.3V50.2c4.4 3.2 9.8 5.1 15.7 5.1V44.5H84z" fill="#00F2FE" transform="translate(-2,-2)"/><path d="M84 44.5c-6.8 0-12.4-5.5-12.4-12.4V24H58.5v51.2c0 6.2-5 11.2-11.2 11.2s-11.2-5-11.2-11.2 5-11.2 11.2-11.2c1.2 0 2.3.2 3.4.6V51.1c-1.1-.2-2.2-.3-3.4-.3-13.4 0-24.3 10.9-24.3 24.3S33.9 99.4 47.3 99.4s24.3-10.9 24.3-24.3V50.2c4.4 3.2 9.8 5.1 15.7 5.1V44.5H84z" fill="#FE2C55" transform="translate(2,2)"/><path d="M84 44.5c-6.8 0-12.4-5.5-12.4-12.4V24H58.5v51.2c0 6.2-5 11.2-11.2 11.2s-11.2-5-11.2-11.2 5-11.2 11.2-11.2c1.2 0 2.3.2 3.4.6V51.1c-1.1-.2-2.2-.3-3.4-.3-13.4 0-24.3 10.9-24.3 24.3S33.9 99.4 47.3 99.4s24.3-10.9 24.3-24.3V50.2c4.4 3.2 9.8 5.1 15.7 5.1V44.5H84z" fill="#FFFFFF"/></svg>`
    )}`,
  },
  snapchat: {
    label: 'Snapchat',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="28" fill="#FFFC00"/><path d="M60 26c14.5 0 21 9.5 21 22.5 0 4.5-.8 8.2-.8 9.8 0 1.8 2.2 2.7 4.8 3.5 2.8.8 4.5 2 4.5 3.8 0 2.2-3 3.5-6.5 4.5-1 .3-1.8 1.2-1.5 2.5.8 3.5 4.8 9.2 12.5 11.5 1.5.5 2.2 1.8 1.5 3.2-1.8 3.2-7.8 4.8-12.5 5.5-1.5.2-2.2 1.5-2.8 3.2-.8 2.2-2.2 3.5-5.2 3.5-2.8 0-6.2-1.8-14.8-1.8s-12 1.8-14.8 1.8c-3 0-4.4-1.3-5.2-3.5-.6-1.7-1.3-3-2.8-3.2-4.7-.7-10.7-2.3-12.5-5.5-.7-1.4 0-2.7 1.5-3.2 7.7-2.3 11.7-8 12.5-11.5.3-1.3-.5-2.2-1.5-2.5-3.5-1-6.5-2.3-6.5-4.5 0-1.8 1.7-3 4.5-3.8 2.6-.8 4.8-1.7 4.8-3.5 0-1.6-.8-5.3-.8-9.8C39 35.5 45.5 26 60 26z" fill="#FFFFFF" stroke="#000000" stroke-width="4.5" stroke-linejoin="round"/></svg>`
    )}`,
  },
};

const DEFAULT_LOGO_KEYS = [
  'facebook',
  'instagram',
  'twitter',
  'whatsapp',
  'telegram',
  'youtube',
  'linkedin',
  'tiktok',
  'snapchat',
];

export function getDefaultAppLogoUrl(appId: number): string {
  const key = DEFAULT_LOGO_KEYS[(Math.max(1, appId) - 1) % DEFAULT_LOGO_KEYS.length];
  return INITIAL_BRAND_LOGOS[key].dataUrl;
}

export function resolveAppIconName(
  app: Pick<ApplicationItem, 'icon_name' | 'category_slug' | 'id'>
): AppIconName {
  if (app.icon_name) return app.icon_name;
  const slug = app.category_slug || '';
  if (slug.includes('fintech')) return 'wallet';
  if (slug.includes('delivery')) return 'delivery';
  if (slug.includes('ecommerce')) return 'shopping';
  if (slug.includes('health')) return 'health';
  if (slug.includes('education')) return 'education';
  if (slug.includes('transport')) return 'transport';
  if (slug.includes('artificial-intelligence')) return 'ai';
  if (slug.includes('real-estate')) return 'realestate';
  if (slug.includes('b2b')) return 'business';
  if (slug.includes('govtech')) return 'gov';
  if (slug.includes('travel')) return 'travel';
  if (slug.includes('entertainment')) return 'entertainment';
  return 'smartphone';
}

export const AppIconVector: React.FC<{
  iconName: AppIconName;
  className?: string;
}> = ({ iconName, className = 'w-6 h-6' }) => {
  switch (iconName) {
    case 'wallet':
      return <CreditCard className={className} />;
    case 'delivery':
      return <Truck className={className} />;
    case 'shopping':
      return <ShoppingBag className={className} />;
    case 'health':
      return <HeartPulse className={className} />;
    case 'education':
      return <GraduationCap className={className} />;
    case 'transport':
      return <Car className={className} />;
    case 'ai':
      return <Cpu className={className} />;
    case 'realestate':
      return <Building2 className={className} />;
    case 'business':
      return <Briefcase className={className} />;
    case 'gov':
      return <Landmark className={className} />;
    case 'travel':
      return <Plane className={className} />;
    case 'entertainment':
      return <Gamepad2 className={className} />;
    default:
      return <Smartphone className={className} />;
  }
};

/**
 * AppBrandLogo: Renders the application's actual uploaded logo image (or recognizable brand logo image)
 * without any AI/abstract vector icon overlays.
 */
export const AppBrandLogo: React.FC<{
  app: Pick<
    ApplicationItem,
    | 'id'
    | 'name_ar'
    | 'logo_color'
    | 'logo_monogram'
    | 'logo_url'
    | 'icon_name'
    | 'category_slug'
    | 'is_verified'
  >;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({ app, size = 'md' }) => {
  const [imgFailed, setImgFailed] = useState(false);

  const sizeClass = {
    sm: 'w-11 h-11 rounded-xl',
    md: 'w-14 h-14 rounded-2xl',
    lg: 'w-16 h-16 rounded-2xl',
    xl: 'w-20 h-20 rounded-2xl',
  }[size];

  const resolvedSrc =
    app.logo_url && app.logo_url.trim() && !imgFailed
      ? app.logo_url
      : getDefaultAppLogoUrl(app.id || 1);

  return (
    <div
      className={`relative inline-flex shrink-0 ${sizeClass} overflow-hidden bg-[#020807] border border-white/15 shadow-md select-none`}
    >
      <img
        src={resolvedSrc}
        alt={app.name_ar}
        onError={() => setImgFailed(true)}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export interface SlideshowSlideItem {
  id: number;
  badge_ar: string;
  title_ar: string;
  subtitle_ar: string;
  category_slug: string;
  accent_color: string;
  stats_label: string;
  stats_value: string;
  visual_type: 'fintech' | 'delivery' | 'ecommerce' | 'ai' | 'launchpad';
  bg_image_url: string;
  cta_label: string;
  cta_route: string;
}

export const DEFAULT_SLIDESHOW_SLIDES: SlideshowSlideItem[] = [
  {
    id: 1,
    badge_ar: 'المدفوعات الرقمية والتقنية المالية',
    title_ar: 'الجيل الجديد من المحافظ الرقمية والخدمات المصرفية في ليبيا',
    subtitle_ar:
      'اكتشف تطبيقات الدفع الفوري عبر رمز الاستجابة السريعة (QR)، إدارة البطاقات المحلية والدولية، وحلول التحويل المالي الموثقة.',
    category_slug: 'fintech',
    accent_color: '#00F0C6',
    stats_label: 'تطبيقات مالية موثقة',
    stats_value: '+95% توافق مصرفي',
    visual_type: 'fintech',
    bg_image_url:
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1600&q=80',
    cta_label: 'استعرض تطبيقات الخدمات المالية',
    cta_route: '/apps',
  },
  {
    id: 2,
    badge_ar: 'الخدمات اللوجستية والتوصيل الفوري',
    title_ar: 'شبكات التوصيل الذكي وتغطية المدن الليبية لحظة بلحظة',
    subtitle_ar:
      'منصات توصيل الطلبات، المطاعم، الصيدليات، والشحن السريع بين طرابلس وبنغازي ومصراتة وسبها بواجهات خرائط تفاعلية.',
    category_slug: 'delivery-orders',
    accent_color: '#38BDF8',
    stats_label: 'التغطية الجغرافية',
    stats_value: '8+ مدن رئيسية',
    visual_type: 'delivery',
    bg_image_url:
      'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&w=1600&q=80',
    cta_label: 'تصفح تطبيقات التوصيل والطلبات',
    cta_route: '/apps',
  },
  {
    id: 3,
    badge_ar: 'التجارة الإلكترونية والأسواق الرقمية',
    title_ar: 'متاجر إلكترونية متكاملة تربط التجار بالمستهلكين في كافة المناطق',
    subtitle_ar:
      'تطبيقات تسوق حديثة تدعم الدفع عند الاستلام والدفع الإلكتروني مع أنظمة تتبع الشحنات وإدارة المخزون السحابي.',
    category_slug: 'ecommerce',
    accent_color: '#10B981',
    stats_label: 'نمو المتاجر الرقمية',
    stats_value: 'Android · iOS · Web',
    visual_type: 'ecommerce',
    bg_image_url:
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1600&q=80',
    cta_label: 'اكتشف تطبيقات التجارة الإلكترونية',
    cta_route: '/apps',
  },
  {
    id: 4,
    badge_ar: 'الذكاء الاصطناعي والخدمات السحابية',
    title_ar: 'حلول الذكاء الاصطناعي وأنظمة إدارة المؤسسات والشركات',
    subtitle_ar:
      'أدوات ذكية لمعالجة البيانات باللغة العربية، أتمتة خدمة العملاء، وأنظمة المحاسبة والموارد البشرية المصممة للسوق الليبي.',
    category_slug: 'artificial-intelligence',
    accent_color: '#8B5CF6',
    stats_label: 'تقنيات الجيل القادم',
    stats_value: 'AI & SaaS Cloud',
    visual_type: 'ai',
    bg_image_url:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80',
    cta_label: 'استكشف تطبيقات الذكاء الاصطناعي',
    cta_route: '/apps',
  },
];

export const InteractiveImageSlideshow: React.FC<{
  onNavigate: (route: string, categorySlug?: string) => void;
}> = ({ onNavigate }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slides = DEFAULT_SLIDESHOW_SLIDES;

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 5200);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const currentSlide = slides[activeIndex];

  const handleNext = () => setActiveIndex((prev) => (prev + 1) % slides.length);
  const handlePrev = () => setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div
      className="relative rounded-3xl bg-[#03110E] border border-[#00483F] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.65)]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Full-Bleed Animated Background Image Slideshow Layer */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentSlide.id}
            src={currentSlide.bg_image_url}
            alt={currentSlide.badge_ar}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 0.26, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: 'easeOut' }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-l from-[#020807]/95 via-[#03110E]/85 to-[#020807]/70" />
      </div>

      <div
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-[110px] opacity-25 pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: currentSlide.accent_color }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px] sm:min-h-[420px] relative z-10">
        <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.38, ease: 'easeOut' }}
              className="space-y-4"
            >
              <div
                className="inline-flex items-center gap-2 text-xs font-bold tracking-wide"
                style={{ color: currentSlide.accent_color }}
              >
                <Sparkles className="w-4 h-4" />
                <span>{currentSlide.badge_ar}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white leading-snug">
                {currentSlide.title_ar}
              </h2>

              <p className="text-sm sm:text-base text-[#A8B7B3] leading-relaxed">
                {currentSlide.subtitle_ar}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onNavigate(currentSlide.cta_route, currentSlide.category_slug)}
                  className="px-5 py-3 rounded-xl font-bold text-xs sm:text-sm text-[#020807] transition-all cursor-pointer shadow-lg hover:brightness-110"
                  style={{ backgroundColor: currentSlide.accent_color }}
                >
                  {currentSlide.cta_label}
                </button>

                <div className="px-4 py-2 rounded-xl bg-[#020807]/90 border border-[#002D28]">
                  <div className="text-[11px] text-[#A8B7B3]">{currentSlide.stats_label}</div>
                  <div className="text-xs font-bold font-mono-num text-white">
                    {currentSlide.stats_value}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="pt-8 mt-6 border-t border-[#002D28] flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="الشريحة السابقة"
                className="w-9 h-9 rounded-xl bg-[#020807] hover:bg-[#002D28] border border-[#00483F] text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="الشريحة التالية"
                className="w-9 h-9 rounded-xl bg-[#020807] hover:bg-[#002D28] border border-[#00483F] text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono-num text-[#A8B7B3] mr-2">
                0{activeIndex + 1} / 0{slides.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  aria-label={s.badge_ar}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === activeIndex ? 'w-8' : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                  style={
                    idx === activeIndex
                      ? {
                          backgroundColor: currentSlide.accent_color,
                          boxShadow: `0 0 12px ${currentSlide.accent_color}`,
                        }
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 relative bg-[#020807]/65 border-t lg:border-t-0 lg:border-r border-[#002D28] overflow-hidden flex items-center justify-center p-6 sm:p-8 min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0, scale: 0.94, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.96, x: 20 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="relative w-full h-full flex items-center justify-center"
            >
              <SlideArtworkCanvas slide={currentSlide} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 border-t border-[#002D28] bg-[#020807]/90">
        {slides.map((s, idx) => {
          const isCurrent = idx === activeIndex;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`p-3.5 text-right border-l border-[#002D28] last:border-l-0 transition-all cursor-pointer flex items-center gap-3 ${
                isCurrent ? 'bg-[#002D28]/70' : 'hover:bg-[#03110E]'
              }`}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border overflow-hidden relative"
                style={{
                  borderColor: isCurrent ? s.accent_color : '#00483F',
                  backgroundColor: isCurrent ? `${s.accent_color}20` : '#03110E',
                  color: s.accent_color,
                }}
              >
                <img
                  src={s.bg_image_url}
                  alt={s.badge_ar}
                  className="absolute inset-0 w-full h-full object-cover opacity-45"
                />
                <span className="relative z-10">
                  <AppIconVector
                    iconName={
                      s.visual_type === 'fintech'
                        ? 'wallet'
                        : s.visual_type === 'delivery'
                        ? 'delivery'
                        : s.visual_type === 'ecommerce'
                        ? 'shopping'
                        : 'ai'
                    }
                    className="w-4 h-4"
                  />
                </span>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{s.badge_ar}</div>
                <div className="text-[11px] text-[#A8B7B3] truncate">{s.stats_value}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const SlideArtworkCanvas: React.FC<{ slide: SlideshowSlideItem }> = ({ slide }) => {
  const accent = slide.accent_color;
  return (
    <div className="relative w-full max-w-md rounded-2xl bg-[#03110E] border border-[#00483F] p-4 shadow-2xl overflow-hidden">
      {/* Real High-Res Background Image inside Slide Preview Card */}
      <div className="relative w-full h-60 rounded-xl overflow-hidden border border-[#002D28] bg-[#020807]">
        <img
          src={slide.bg_image_url}
          alt={slide.badge_ar}
          className="absolute inset-0 w-full h-full object-cover opacity-65 transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020807] via-[#020807]/45 to-transparent" />

        {/* Overlay HUD Vector Badge */}
        <svg
          viewBox="0 0 420 260"
          className="relative z-10 w-full h-full"
          aria-hidden="true"
        >
          {slide.visual_type === 'fintech' && (
            <g>
              <rect
                x="24"
                y="135"
                width="210"
                height="98"
                rx="14"
                fill="#03110E"
                fillOpacity="0.88"
                stroke={accent}
                strokeWidth="1.5"
              />
              <rect x="42" y="152" width="32" height="22" rx="4" fill={accent} />
              <line x1="42" y1="192" x2="170" y2="192" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
              <line x1="42" y1="210" x2="120" y2="210" stroke="#A8B7B3" strokeWidth="3" strokeLinecap="round" />
              <circle cx="195" cy="205" r="11" fill={accent} fillOpacity="0.45" />
              <circle cx="206" cy="205" r="11" fill={accent} fillOpacity="0.85" />
            </g>
          )}

          {slide.visual_type === 'delivery' && (
            <g>
              <path
                d="M 45 210 Q 145 100 240 155 T 370 75"
                fill="none"
                stroke={accent}
                strokeWidth="3.5"
                strokeDasharray="7 5"
              />
              <circle cx="45" cy="210" r="8" fill="#FFFFFF" />
              <circle cx="240" cy="155" r="10" fill={accent} />
              <circle cx="370" cy="75" r="14" fill={accent} fillOpacity="0.35" />
              <circle cx="370" cy="75" r="7" fill={accent} />
            </g>
          )}

          {slide.visual_type === 'ecommerce' && (
            <g>
              <rect
                x="24"
                y="145"
                width="180"
                height="88"
                rx="14"
                fill="#03110E"
                fillOpacity="0.88"
                stroke={accent}
                strokeWidth="1.5"
              />
              <line x1="44" y1="172" x2="155" y2="172" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
              <rect x="44" y="192" width="90" height="22" rx="6" fill={accent} />
            </g>
          )}

          {(slide.visual_type === 'ai' || slide.visual_type === 'launchpad') && (
            <g>
              <circle cx="210" cy="130" r="40" fill="#03110E" fillOpacity="0.82" stroke={accent} strokeWidth="2" />
              <circle cx="210" cy="130" r="15" fill={accent} />
              <line x1="170" y1="130" x2="95" y2="180" stroke={accent} strokeWidth="2" />
              <circle cx="90" cy="184" r="9" fill={accent} />
              <line x1="250" y1="130" x2="325" y2="85" stroke={accent} strokeWidth="2" />
              <circle cx="330" cy="82" r="9" fill="#38BDF8" />
            </g>
          )}
        </svg>
      </div>

      <div className="mt-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full animate-pulse"
            style={{ backgroundColor: accent }}
          />
          <span className="font-bold text-white">{slide.badge_ar}</span>
        </div>
        <span className="font-mono-num text-[#A8B7B3]">LIBYA APPS SHOWCASE</span>
      </div>
    </div>
  );
};

export const HeroInteractiveBackdrop: React.FC<{
  activeSlide: number;
  onSelectSlide: (idx: number) => void;
}> = ({ activeSlide, onSelectSlide }) => {
  const slides = [
    {
      id: 0,
      label: 'منظومة التطبيقات الذكية والمدفوعات الرقمية',
      accent: '#00F0C6',
      secondary: '#00483F',
      image_url:
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1920&q=80',
    },
    {
      id: 1,
      label: 'الشركات البرمجية والابتكار التقني في ليبيا',
      accent: '#38BDF8',
      secondary: '#002D28',
      image_url:
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80',
    },
    {
      id: 2,
      label: 'التجارة الإلكترونية والخدمات اللوجستية الذكية',
      accent: '#10B981',
      secondary: '#00483F',
      image_url:
        'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1920&q=80',
    },
    {
      id: 3,
      label: 'منصة إطلاق التطبيقات والمنتجات الرقمية الجديدة',
      accent: '#8B5CF6',
      secondary: '#002D28',
      image_url:
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1920&q=80',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      onSelectSlide((activeSlide + 1) % slides.length);
    }, 5200);
    return () => clearInterval(timer);
  }, [activeSlide, onSelectSlide, slides.length]);

  return (
    <div className="absolute inset-0 overflow-hidden select-none z-0">
      {/* Rotating Full-Screen Background Image Slideshow */}
      {slides.map((s, idx) => {
        const isCurrent = idx === activeSlide;
        return (
          <div
            key={s.id}
            className={`absolute inset-0 transition-all duration-1000 ease-out pointer-events-none ${
              isCurrent ? 'opacity-40 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            <img
              src={s.image_url}
              alt={s.label}
              className="w-full h-full object-cover"
            />
            <svg
              viewBox="0 0 1440 800"
              className="absolute inset-0 w-full h-full object-cover"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <radialGradient id={`heroGlow-${s.id}`} cx="50%" cy="25%" r="65%">
                  <stop offset="0%" stopColor={s.accent} stopOpacity="0.28" />
                  <stop offset="55%" stopColor={s.secondary} stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#020807" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="1440" height="800" fill={`url(#heroGlow-${s.id})`} />
            </svg>
          </div>
        );
      })}

      {/* Dark Emerald-Teal Atmospheric Gradient Overlays for High Contrast Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020807]/80 via-[#020807]/65 to-[#020807] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#020807_90%)] pointer-events-none" />

      {/* Interactive Background Slideshow Indicator Bar at Top-Left of Hero */}
      <div className="hidden sm:flex items-center gap-2 absolute top-5 left-6 z-20 bg-[#03110E]/80 backdrop-blur-md border border-[#00483F] px-3 py-1.5 rounded-full">
        <span className="text-[11px] text-[#A8B7B3] ml-1">
          {slides[activeSlide]?.label}
        </span>
        {slides.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelectSlide(idx)}
            title={s.label}
            className={`h-2 rounded-full transition-all cursor-pointer ${
              idx === activeSlide
                ? 'w-6 bg-[#00F0C6] shadow-[0_0_8px_#00F0C6]'
                : 'w-2 bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export const SocialPlatformIcon: React.FC<{
  platform: 'facebook' | 'instagram' | 'x' | 'linkedin' | 'youtube';
  className?: string;
}> = ({ platform, className = 'w-5 h-5' }) => {
  switch (platform) {
    case 'facebook':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      );
    case 'x':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
      );
    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
  }
};

export const AppScreenshotArtwork: React.FC<{
  title: string;
  caption: string;
  accentColor: string;
}> = ({ title, caption, accentColor }) => {
  return (
    <div className="rounded-xl bg-[#03110E] border border-[#002D28] hover:border-[#00483F] transition-colors overflow-hidden flex flex-col justify-between p-5 h-60">
      <div className="flex items-center justify-between border-b border-[#002D28] pb-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00483F]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#00F0C6]/50" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#00F0C6]" />
        </div>
        <span className="font-mono-num text-[11px] text-[#00F0C6]">UI PREVIEW</span>
      </div>

      <div className="my-auto py-3 grid grid-cols-3 gap-3 items-center">
        <div
          className="col-span-1 h-24 rounded-lg flex flex-col items-center justify-center p-2 text-white border border-white/10"
          style={{ backgroundColor: accentColor || '#00483F' }}
        >
          <div className="w-8 h-1.5 bg-white/40 rounded mb-2" />
          <div className="w-12 h-3 bg-white/90 rounded" />
        </div>
        <div className="col-span-2 space-y-2 bg-[#020807] p-3 rounded-lg border border-[#002D28]">
          <div className="h-2.5 w-3/4 bg-[#00483F] rounded" />
          <div className="h-2 w-1/2 bg-[#002D28] rounded" />
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="h-6 bg-[#00F0C6]/15 rounded border border-[#00F0C6]/30" />
            <div className="h-6 bg-[#002D28] rounded" />
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-[#002D28]">
        <div className="text-xs font-bold text-white">{title}</div>
        <div className="text-[11px] text-[#A8B7B3] truncate mt-0.5">{caption}</div>
      </div>
    </div>
  );
};
