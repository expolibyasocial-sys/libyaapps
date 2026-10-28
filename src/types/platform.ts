export type PlatformOS = 'Android' | 'iOS' | 'Web';

export type ApplicationType =
  | 'B2C'
  | 'B2B'
  | 'Marketplace'
  | 'SaaS'
  | 'Fintech'
  | 'GovTech'
  | 'AI Tool';

export type ApplicationStatus = 'active' | 'beta' | 'upcoming' | 'archived';

export type SubmissionStatus =
  | 'new'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'archived';

export type AdminRoleSlug =
  | 'super_admin'
  | 'content_manager'
  | 'news_editor'
  | 'apps_manager'
  | 'companies_manager'
  | 'exhibition_manager'
  | 'sponsorship_manager';

export interface AdminRole {
  id: number;
  slug: AdminRoleSlug;
  name_ar: string;
  name_en: string;
  permissions: string[];
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role_slug: AdminRoleSlug;
  role_name_ar: string;
  is_active: boolean;
  last_login_at: string;
}

export interface City {
  id: number;
  name_ar: string;
  slug: string;
  region: string;
}

export interface ApplicationCategory {
  id: number;
  name_ar: string;
  slug: string;
  description_ar: string;
  icon_name: string;
  sort_order: number;
  apps_count?: number;
}

export interface Company {
  id: number;
  name_ar: string;
  name_en: string;
  slug: string;
  logo_svg_type: string;
  logo_color: string;
  description_ar: string;
  city_id: number;
  city_name_ar: string;
  specialization_ar: string;
  established_year: number;
  email: string;
  phone: string;
  website_url: string;
  social_links: {
    linkedin?: string;
    x?: string;
    facebook?: string;
    github?: string;
  };
  is_featured: boolean;
  is_verified: boolean;
  exhibition_participating: boolean;
  sponsorship_tier: 'none' | 'strategic' | 'platinum' | 'gold' | 'media_partner';
  status: 'published' | 'draft' | 'archived';
  created_at: string;
}

export interface ApplicationMedia {
  id: number;
  application_id: number;
  type: 'screenshot' | 'video';
  title_ar: string;
  caption_ar: string;
  preview_theme: string;
  video_url?: string;
}

export type AppIconName =
  | 'wallet'
  | 'shopping'
  | 'health'
  | 'delivery'
  | 'education'
  | 'transport'
  | 'ai'
  | 'realestate'
  | 'business'
  | 'gov'
  | 'travel'
  | 'entertainment'
  | 'smartphone';

export interface ApplicationItem {
  id: number;
  name_ar: string;
  name_en: string;
  slug: string;
  category_id: number;
  category_name_ar: string;
  category_slug: string;
  company_id: number;
  company_name_ar: string;
  company_slug: string;
  city_id: number;
  city_name_ar: string;
  launch_year: number;
  status: ApplicationStatus;
  status_label_ar: string;
  app_type: ApplicationType;
  short_description_ar: string;
  full_description_ar: string;
  main_features_ar: string[];
  target_users_ar: string;
  platforms: PlatformOS[];
  website_url?: string;
  android_url?: string;
  ios_url?: string;
  is_featured: boolean;
  is_verified: boolean;
  published: boolean;
  logo_color: string;
  logo_monogram: string;
  logo_url?: string;
  icon_name?: AppIconName;
  media: ApplicationMedia[];
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface NewsCategory {
  id: number;
  name_ar: string;
  slug: string;
}

export interface NewsAuthor {
  id: number;
  name_ar: string;
  role_ar: string;
  bio_ar: string;
}

export interface NewsArticle {
  id: number;
  title_ar: string;
  slug: string;
  category_id: number;
  category_name_ar: string;
  category_slug: string;
  author_id: number;
  author_name_ar: string;
  author_role_ar: string;
  published_at: string;
  reading_time_minutes: number;
  summary_ar: string;
  content_paragraphs_ar: string[];
  key_takeaways_ar: string[];
  cover_theme: 'fintech' | 'ai' | 'expo' | 'cyber' | 'govtech' | 'startup';
  is_featured: boolean;
  is_ai_spotlight: boolean;
  views_count: number;
  related_application_id?: number;
  related_company_id?: number;
  related_exhibition_edition_id?: number;
  status: 'published' | 'scheduled' | 'draft' | 'archived';
}

export interface LaunchEvent {
  id: number;
  title_ar: string;
  slug: string;
  application_id: number;
  application_name_ar: string;
  application_slug: string;
  company_id: number;
  company_name_ar: string;
  company_slug: string;
  launch_type: 'new_release' | 'upcoming_app' | 'major_update';
  launch_type_label_ar: string;
  launch_date: string;
  version_tag: string;
  summary_ar: string;
  highlights_ar: string[];
  package_tier: 'standard' | 'featured_launch' | 'national_spotlight';
  is_featured: boolean;
}

export interface ExhibitionEdition {
  id: number;
  title_ar: string;
  edition_label_ar: string;
  slug: string;
  tagline_ar: string;
  overview_ar: string;
  date_announcement_status_ar: string;
  location_announcement_status_ar: string;
  registration_open: boolean;
  pillars_ar: {
    title: string;
    description: string;
  }[];
  schedule_sessions: {
    id: number;
    track_ar: string;
    title_ar: string;
    speaker_ar: string;
    speaker_role_ar: string;
    session_type_ar: string;
    duration_ar: string;
  }[];
  workshops: {
    id: number;
    title_ar: string;
    instructor_ar: string;
    target_audience_ar: string;
    topics_ar: string[];
  }[];
  faqs: {
    question_ar: string;
    answer_ar: string;
  }[];
}

export interface ExhibitorRecord {
  id: number;
  company_name: string;
  application_name: string;
  sector_ar: string;
  participation_type_ar: string;
  booth_zone_ar: string;
  approved: boolean;
}

export interface SponsorRecord {
  id: number;
  company_name: string;
  sector_ar: string;
  tier_ar: string;
  tier_slug: 'strategic' | 'platinum' | 'gold' | 'media_partner';
  website_url: string;
  approved: boolean;
}

export interface SubmissionRecord {
  id: number;
  reference_number: string;
  submission_type:
    | 'app'
    | 'news'
    | 'exhibitor'
    | 'sponsor'
    | 'visitor'
    | 'contact';
  submission_type_label_ar: string;
  title_or_name: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  city_name_ar?: string;
  payload: Record<string, any>;
  status: SubmissionStatus;
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface AdvertisementBanner {
  id: number;
  placement: 'homepage_top' | 'directory_spotlight' | 'news_inline';
  title_ar: string;
  subtitle_ar: string;
  sponsor_name_ar: string;
  cta_label_ar: string;
  cta_route: string;
  is_active: boolean;
}

export interface HomepageStatItem {
  id: string;
  value: string;
  label_ar: string;
  subtitle_ar: string;
}

export interface WebsiteSettings {
  platform_name_ar: string;
  platform_name_en: string;
  hero_heading_ar: string;
  hero_description_ar: string;
  about_mission_ar: string;
  about_vision_ar: string;
  contact_email: string;
  contact_phone: string;
  headquarters_ar: string;
  footer_description_ar?: string;
  footer_copyright_ar?: string;
  homepage_stats?: HomepageStatItem[];
  social_links: {
    facebook: string;
    instagram?: string;
    x: string;
    linkedin: string;
    youtube: string;
  };
  seo_default_title: string;
  seo_default_description: string;
}

export interface AuditLogItem {
  id: number;
  actor_name: string;
  actor_role_ar: string;
  action_type: string;
  entity_type: string;
  entity_label: string;
  details_ar: string;
  ip_address: string;
  created_at: string;
}
