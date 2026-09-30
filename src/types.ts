export interface Category {
  id: string;
  title: string;
  slug: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind class color representation
  type: 'Prompt' | 'Skill' | 'Video' | 'Blog';
}

export interface AIPrompt {
  id: string;
  title: string;
  slug: string;
  description: string;
  prompt: string;
  negative_prompt?: string;
  model: string; // e.g., Midjourney v6, Stable Diffusion 3, Flux.1, DALL-E 3
  category_id: string;
  thumbnail: string;
  gallery: string[];
  style?: string;
  camera?: string;
  lighting?: string;
  aspect_ratio?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Expert';
  downloads: number;
  views: number;
  likes: number;
  featured: boolean;
  premium: boolean;
  seed?: string;
  created_at: string;
}

export interface AISkill {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover: string;
  category_id: string;
  markdown_file: string; // copyable code content
  zip_file?: string;
  pdf_file?: string;
  json_file?: string;
  downloads: number;
  views: number;
  likes: number;
  version: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Expert';
  featured: boolean;
  premium: boolean;
  supported_ai: string[]; // e.g., ['Claude', 'Gemini', 'Cursor', 'AntiGravity']
  installation: string;
  how_to_use: string;
}

export interface VideoConcept {
  id: string;
  title: string;
  slug: string;
  cover: string;
  description: string;
  hook: string;
  niche: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  expected_rpm: number; // e.g., 4.50
  competition: 'Low' | 'Medium' | 'High';
  virality_score: number; // 1-100 scale
  ai_tools_needed: string[];
  
  // Blueprints
  channel_blueprint: string;
  video_structure: string[]; // parts
  thumbnail_prompt: string;
  voice_prompt: string;
  editing_prompt: string;
  image_prompt: string;
  animation_prompt: string;
  
  // SEO
  titles: string[];
  description_seo: string;
  tags: string[];
  hashtags: string[];
  publishing_schedule: string;
  
  // Monetization
  monetization: string[];
  affiliate_ideas: string[];
  resources: string[];
  
  downloads: number;
  views: number;
  likes: number;
  featured: boolean;
}

export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  cover: string;
  excerpt: string;
  description?: string;
  content: string; // Markdown supported
  category: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  published_at: string;
  views: number;
  likes: number;
  read_time: string; // e.g., "5 min read"
  related_prompts?: string[]; // Prompt IDs
  related_skills?: string[]; // Skill IDs
}

export interface UserCollection {
  id: string;
  title: string;
  description: string;
  itemIds: {
    prompts: string[];
    skills: string[];
    videos: string[];
  };
  created_at: string;
  is_custom: boolean;
  is_public?: boolean;
}

export interface AppState {
  bookmarks: {
    prompts: string[];
    skills: string[];
    videos: string[];
  };
  likes: {
    prompts: string[];
    skills: string[];
    videos: string[];
    blogs: string[];
  };
  downloads: {
    prompts: string[];
    skills: string[];
    videos: string[];
  };
  history: {
    id: string;
    type: 'prompt' | 'skill' | 'video' | 'blog';
    timestamp: string;
  }[];
  collections: UserCollection[];
}

export interface SEOMetadata {
  id: string;
  entity_type: 'prompt' | 'blog' | 'skill' | 'video' | 'category' | 'page';
  entity_id: string;
  prompt_id?: string;
  blog_id?: string;
  skill_id?: string;
  video_concept_id?: string;
  category_id?: string;
  seo_title: string;
  meta_description: string;
  title?: string;
  description?: string;
  focus_keyword: string;
  secondary_keywords?: string[];
  slug: string;
  canonical_url: string;
  robots?: string;
  schema_type?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  json_ld?: any;
  created_at?: string;
  updated_at?: string;
}

export interface SiteSettings {
  id?: string;
  site_name: string;
  site_url: string;
  favicon?: string;
  logo?: string;
  default_title: string;
  default_description: string;
  default_image?: string;
  robots?: string;
  head_code?: string;
  footer_code?: string;
  analytics_enabled?: boolean;
  analytics_id?: string;
  gtm_enabled?: boolean;
  gtm_id?: string;
  google_verification?: string;
  bing_verification?: string;
  indexing_enabled?: boolean;
  auto_sitemap?: boolean;
  robots_content?: string;
  adsense_enabled?: boolean;
  adsense_publisher_id?: string;
  adsense_auto_ads?: boolean;
  adsense_consent_required?: boolean;
}

export interface RedirectRule {
  id: string;
  old_url: string;
  new_url: string;
  type: 301 | 302 | 307 | 308;
  hits: number;
  enabled: boolean;
  notes?: string;
  created_at?: string;
  last_used?: string;
}

export interface NotFoundLog {
  id: string;
  url: string;
  referer?: string;
  user_agent?: string;
  hits: number;
  first_seen?: string;
  last_seen?: string;
  resolved: boolean;
  redirect_to?: string;
}

export interface MediaLibraryItem {
  id: string;
  name: string;
  original_name: string;
  file_name: string;
  slug: string;
  caption?: string;
  alt_text: string;
  title: string;
  description?: string;
  mime_type: string;
  extension: string;
  width?: number;
  height?: number;
  size: number;
  storage_path: string;
  public_url: string;
  thumbnail_url?: string;
  dominant_color?: string;
  blurhash?: string;
  uploaded_by?: string;
  created_at?: string;
}

export interface AdSlot {
  id: string;
  name: string;
  placement: string;
  page_types: string[];
  ad_client: string;
  ad_slot_id: string;
  format: 'auto' | 'fluid' | 'in-article' | 'in-feed' | 'fixed';
  fixed_sizes?: {
    mobile?: { width: number; height: number };
    tablet?: { width: number; height: number };
    desktop?: { width: number; height: number };
  };
  full_width_responsive: boolean;
  desktop_enabled: boolean;
  tablet_enabled: boolean;
  mobile_enabled: boolean;
  position_index: number;
  is_active: boolean;
  raw_snippet?: string;
  views?: number;
  clicks?: number;
  created_at?: string;
  updated_at?: string;
}

// ----------------------------------------------------
// ARCHITECTURE V2: CONTENT & LOCALIZATION DATA MODEL
// ----------------------------------------------------

export type ContentStatus = 'draft' | 'published' | 'archived';
export type RouteNamespace = 'tools' | 'blog' | 'prompts' | 'skills' | 'videos' | 'categories' | 'pages';

export interface LanguageEntity {
  code: string; // e.g. 'en', 'ar', 'fr', 'es', 'id'
  name: string; // 'English'
  native_name: string; // 'العربية'
  dir: 'ltr' | 'rtl';
  is_default: boolean;
  enabled: boolean;
  sort_order: number;
  flag_emoji?: string;
}

export interface ContentPage {
  id: string;
  content_key: string; // e.g. 'seo_title_generator', 'chatgpt-image-prompts', 'ai-news-article'
  content_type: 'tool' | 'prompt' | 'skill' | 'video' | 'blog' | 'page' | 'category';
  status: ContentStatus;
  created_at: string;
  updated_at: string;
}

export interface PageTranslation {
  id: string;
  page_id: string;
  language_code: string;
  route_namespace: RouteNamespace;
  slug: string;
  title: string;
  h1?: string;
  description?: string;
  content?: Record<string, any>;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface PageSeo {
  id: string;
  page_translation_id: string;
  canonical_url: string;
  robots: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  schema_type?: string;
  json_ld?: Record<string, any>;
  focus_keyword?: string;
  secondary_keywords?: string[];
  created_at: string;
  updated_at: string;
}

export interface RouteTranslation {
  id: string;
  route_key: string; // 'prompts', 'skills', 'videos', 'blog', 'tools'
  route_namespace: RouteNamespace;
  language_code: string;
  path_segment: string; // e.g. 'prompts', 'skills', 'blog', 'tools' (fixed Latin segment as per v2)
  label: string; // e.g. 'أوامر الصور', 'Image Prompts', 'Prompts d\'images'
  icon?: string;
  is_nav: boolean;
  sort_order: number;
}

export interface DynamicNavItem {
  key: string;
  label: string;
  href: string;
  icon?: string;
  isActive?: boolean;
}

