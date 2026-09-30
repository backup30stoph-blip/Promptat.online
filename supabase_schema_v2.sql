-- ==============================================================================
-- ARCHITECTURE V2: MULTILINGUAL CONTENT, SEO & ROUTING SCHEMA FOR SUPABASE
-- Fully idempotent migration script (Safe to run on new or existing databases)
-- ==============================================================================

-- 1. Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Languages Table
CREATE TABLE IF NOT EXISTS public.languages (
  code TEXT PRIMARY KEY, -- 'en', 'ar', 'fr', 'es', 'id'
  name TEXT NOT NULL,
  native_name TEXT NOT NULL,
  dir TEXT NOT NULL DEFAULT 'ltr' CHECK (dir IN ('ltr', 'rtl')),
  is_default BOOLEAN NOT NULL DEFAULT false,
  enabled BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  flag_emoji TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure columns exist if table was previously created with different schema
ALTER TABLE public.languages ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.languages ADD COLUMN IF NOT EXISTS native_name TEXT;
ALTER TABLE public.languages ADD COLUMN IF NOT EXISTS dir TEXT DEFAULT 'ltr';
ALTER TABLE public.languages ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;
ALTER TABLE public.languages ADD COLUMN IF NOT EXISTS enabled BOOLEAN DEFAULT true;
ALTER TABLE public.languages ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
ALTER TABLE public.languages ADD COLUMN IF NOT EXISTS flag_emoji TEXT;
ALTER TABLE public.languages ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- Seed core supported languages
INSERT INTO public.languages (code, name, native_name, dir, is_default, enabled, sort_order, flag_emoji)
VALUES
  ('ar', 'Arabic', 'العربية', 'rtl', true, true, 1, '🇸🇦'),
  ('en', 'English', 'English', 'ltr', false, true, 2, '🇺🇸'),
  ('fr', 'French', 'Français', 'ltr', false, true, 3, '🇫🇷'),
  ('es', 'Spanish', 'Español', 'ltr', false, true, 4, '🇪🇸'),
  ('id', 'Indonesian', 'Bahasa Indonesia', 'ltr', false, true, 5, '🇮🇩')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  native_name = EXCLUDED.native_name,
  dir = EXCLUDED.dir,
  is_default = EXCLUDED.is_default,
  enabled = EXCLUDED.enabled,
  sort_order = EXCLUDED.sort_order,
  flag_emoji = EXCLUDED.flag_emoji;

-- 3. Content Pages Entity Table (Unified Entity)
CREATE TABLE IF NOT EXISTS public.content_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_key TEXT NOT NULL UNIQUE, -- e.g. 'seo_title_generator', 'chatgpt-image-prompts', 'ai-news-article'
  content_type TEXT NOT NULL, -- 'tool', 'prompt', 'skill', 'video', 'blog', 'page', 'category'
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure columns exist on content_pages
ALTER TABLE public.content_pages ADD COLUMN IF NOT EXISTS content_key TEXT;
ALTER TABLE public.content_pages ADD COLUMN IF NOT EXISTS content_type TEXT;
ALTER TABLE public.content_pages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';
ALTER TABLE public.content_pages ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.content_pages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 4. Page Translations Table
CREATE TABLE IF NOT EXISTS public.page_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.content_pages(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL REFERENCES public.languages(code) ON DELETE CASCADE,
  route_namespace TEXT NOT NULL, -- 'tools', 'blog', 'prompts', 'skills', 'videos', 'categories', 'pages'
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  h1 TEXT,
  description TEXT,
  content JSONB DEFAULT '{}'::jsonb,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure columns exist on page_translations
ALTER TABLE public.page_translations ADD COLUMN IF NOT EXISTS page_id UUID REFERENCES public.content_pages(id) ON DELETE CASCADE;
ALTER TABLE public.page_translations ADD COLUMN IF NOT EXISTS language_code TEXT REFERENCES public.languages(code) ON DELETE CASCADE;
ALTER TABLE public.page_translations ADD COLUMN IF NOT EXISTS route_namespace TEXT;
ALTER TABLE public.page_translations ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.page_translations ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.page_translations ADD COLUMN IF NOT EXISTS h1 TEXT;
ALTER TABLE public.page_translations ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.page_translations ADD COLUMN IF NOT EXISTS content JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.page_translations ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT false;
ALTER TABLE public.page_translations ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.page_translations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Add constraints safely if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_page_language'
  ) THEN
    ALTER TABLE public.page_translations 
      ADD CONSTRAINT uq_page_language UNIQUE (page_id, language_code);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_route_slug_per_lang'
  ) THEN
    ALTER TABLE public.page_translations 
      ADD CONSTRAINT uq_route_slug_per_lang UNIQUE (language_code, route_namespace, slug);
  END IF;
END $$;

-- 5. Page SEO Metadata Table
CREATE TABLE IF NOT EXISTS public.page_seo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_translation_id UUID NOT NULL REFERENCES public.page_translations(id) ON DELETE CASCADE UNIQUE,
  canonical_url TEXT,
  robots TEXT NOT NULL DEFAULT 'index, follow',
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image TEXT,
  schema_type TEXT DEFAULT 'WebApplication',
  json_ld JSONB DEFAULT '{}'::jsonb,
  focus_keyword TEXT,
  secondary_keywords TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure columns exist on page_seo
ALTER TABLE public.page_seo ADD COLUMN IF NOT EXISTS page_translation_id UUID REFERENCES public.page_translations(id) ON DELETE CASCADE;
ALTER TABLE public.page_seo ADD COLUMN IF NOT EXISTS canonical_url TEXT;
ALTER TABLE public.page_seo ADD COLUMN IF NOT EXISTS robots TEXT DEFAULT 'index, follow';
ALTER TABLE public.page_seo ADD COLUMN IF NOT EXISTS og_title TEXT;
ALTER TABLE public.page_seo ADD COLUMN IF NOT EXISTS og_description TEXT;
ALTER TABLE public.page_seo ADD COLUMN IF NOT EXISTS og_image TEXT;
ALTER TABLE public.page_seo ADD COLUMN IF NOT EXISTS twitter_title TEXT;
ALTER TABLE public.page_seo ADD COLUMN IF NOT EXISTS twitter_description TEXT;
ALTER TABLE public.page_seo ADD COLUMN IF NOT EXISTS twitter_image TEXT;
ALTER TABLE public.page_seo ADD COLUMN IF NOT EXISTS schema_type TEXT DEFAULT 'WebApplication';
ALTER TABLE public.page_seo ADD COLUMN IF NOT EXISTS json_ld JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.page_seo ADD COLUMN IF NOT EXISTS focus_keyword TEXT;
ALTER TABLE public.page_seo ADD COLUMN IF NOT EXISTS secondary_keywords TEXT[];
ALTER TABLE public.page_seo ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.page_seo ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 6. Route Translations Table (Dynamic Navbar & Route Segments)
CREATE TABLE IF NOT EXISTS public.route_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_key TEXT NOT NULL, -- 'home', 'prompts', 'skills', 'videos', 'blog', 'tools'
  route_namespace TEXT NOT NULL, -- 'tools', 'blog', 'prompts', 'skills', 'videos'
  language_code TEXT NOT NULL REFERENCES public.languages(code) ON DELETE CASCADE,
  path_segment TEXT NOT NULL, -- Fixed latin segment as per Architecture v2: 'prompts', 'skills', 'blog', 'videos', 'tools'
  label TEXT NOT NULL, -- Localized label: 'أوامر الصور', 'Image Prompts', 'Prompts d''images'
  icon TEXT,
  is_nav BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure columns exist on route_translations
ALTER TABLE public.route_translations ADD COLUMN IF NOT EXISTS route_key TEXT;
ALTER TABLE public.route_translations ADD COLUMN IF NOT EXISTS route_namespace TEXT;
ALTER TABLE public.route_translations ADD COLUMN IF NOT EXISTS language_code TEXT REFERENCES public.languages(code) ON DELETE CASCADE;
ALTER TABLE public.route_translations ADD COLUMN IF NOT EXISTS path_segment TEXT;
ALTER TABLE public.route_translations ADD COLUMN IF NOT EXISTS label TEXT;
ALTER TABLE public.route_translations ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE public.route_translations ADD COLUMN IF NOT EXISTS is_nav BOOLEAN DEFAULT true;
ALTER TABLE public.route_translations ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
ALTER TABLE public.route_translations ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_route_key_lang'
  ) THEN
    ALTER TABLE public.route_translations 
      ADD CONSTRAINT uq_route_key_lang UNIQUE (route_key, language_code);
  END IF;
END $$;

-- Seed Route Translations
INSERT INTO public.route_translations (route_key, route_namespace, language_code, path_segment, label, icon, is_nav, sort_order)
VALUES
  -- Arabic
  ('home', 'pages', 'ar', '', 'الرئيسية', 'Home', true, 1),
  ('prompts', 'prompts', 'ar', 'prompts', 'أوامر الصور', 'Sparkles', true, 2),
  ('skills', 'skills', 'ar', 'skills', 'مهارات المبدعين', 'Cpu', true, 3),
  ('videos', 'videos', 'ar', 'videos', 'فيديوهات بدون وجه', 'Film', true, 4),
  ('blog', 'blog', 'ar', 'blog', 'مدونة الذكاء الاصطناعي', 'BookOpen', true, 5),
  ('tools', 'tools', 'ar', 'tools', 'أدوات الذكاء الاصطناعي', 'Zap', true, 6),
  -- English
  ('home', 'pages', 'en', '', 'Home', 'Home', true, 1),
  ('prompts', 'prompts', 'en', 'prompts', 'Image Prompts', 'Sparkles', true, 2),
  ('skills', 'skills', 'en', 'skills', 'Creator Skills', 'Cpu', true, 3),
  ('videos', 'videos', 'en', 'videos', 'Faceless Videos', 'Film', true, 4),
  ('blog', 'blog', 'en', 'blog', 'AI Blog', 'BookOpen', true, 5),
  ('tools', 'tools', 'en', 'tools', 'AI Tools', 'Zap', true, 6),
  -- French
  ('home', 'pages', 'fr', '', 'Accueil', 'Home', true, 1),
  ('prompts', 'prompts', 'fr', 'prompts', 'Prompts Images', 'Sparkles', true, 2),
  ('skills', 'skills', 'fr', 'skills', 'Compétences Créateurs', 'Cpu', true, 3),
  ('videos', 'videos', 'fr', 'videos', 'Vidéos Sans Visage', 'Film', true, 4),
  ('blog', 'blog', 'fr', 'blog', 'Blog IA', 'BookOpen', true, 5),
  ('tools', 'tools', 'fr', 'tools', 'Outils IA', 'Zap', true, 6),
  -- Spanish
  ('home', 'pages', 'es', '', 'Inicio', 'Home', true, 1),
  ('prompts', 'prompts', 'es', 'prompts', 'Prompts de Imágenes', 'Sparkles', true, 2),
  ('skills', 'skills', 'es', 'skills', 'Habilidades IA', 'Cpu', true, 3),
  ('videos', 'videos', 'es', 'videos', 'Videos Sin Rostro', 'Film', true, 4),
  ('blog', 'blog', 'es', 'blog', 'Blog de IA', 'BookOpen', true, 5),
  ('tools', 'tools', 'es', 'tools', 'Herramientas IA', 'Zap', true, 6),
  -- Indonesian
  ('home', 'pages', 'id', '', 'Beranda', 'Home', true, 1),
  ('prompts', 'prompts', 'id', 'prompts', 'Prompt Gambar', 'Sparkles', true, 2),
  ('skills', 'skills', 'id', 'skills', 'Keahlian Kreator', 'Cpu', true, 3),
  ('videos', 'videos', 'id', 'videos', 'Video Tanpa Wajah', 'Film', true, 4),
  ('blog', 'blog', 'id', 'blog', 'Blog AI', 'BookOpen', true, 5),
  ('tools', 'tools', 'id', 'tools', 'Alat AI', 'Zap', true, 6)
ON CONFLICT (route_key, language_code) DO UPDATE SET
  path_segment = EXCLUDED.path_segment,
  label = EXCLUDED.label,
  icon = EXCLUDED.icon,
  is_nav = EXCLUDED.is_nav,
  sort_order = EXCLUDED.sort_order;

-- 7. URL Redirects Table
CREATE TABLE IF NOT EXISTS public.redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  old_url TEXT NOT NULL UNIQUE,
  new_url TEXT NOT NULL,
  hits INT NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used TIMESTAMPTZ
);

-- Ensure columns exist if table was previously created in Supabase
ALTER TABLE public.redirects ADD COLUMN IF NOT EXISTS old_url TEXT;
ALTER TABLE public.redirects ADD COLUMN IF NOT EXISTS new_url TEXT;
ALTER TABLE public.redirects ADD COLUMN IF NOT EXISTS hits INT DEFAULT 0;
ALTER TABLE public.redirects ADD COLUMN IF NOT EXISTS enabled BOOLEAN DEFAULT true;
ALTER TABLE public.redirects ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.redirects ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.redirects ADD COLUMN IF NOT EXISTS last_used TIMESTAMPTZ;

-- Seed classic migration redirects (status_code removed to match table schema)
INSERT INTO public.redirects (old_url, new_url, enabled, notes)
VALUES
  ('/image-prompts', '/ar/prompts', true, 'Migration from legacy un-localized route'),
  ('/creator-skills', '/ar/skills', true, 'Migration from legacy un-localized route'),
  ('/faceless-videos', '/ar/videos', true, 'Migration from legacy un-localized route'),
  ('/ai-blog', '/ar/blog', true, 'Migration from legacy un-localized route')
ON CONFLICT (old_url) DO NOTHING;

-- ------------------------------------------------------------------------------
-- INDEXES FOR ULTRA-FAST RESOLUTION
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_page_translations_lookup 
  ON public.page_translations (language_code, route_namespace, slug);

CREATE INDEX IF NOT EXISTS idx_page_translations_page_id 
  ON public.page_translations (page_id);

CREATE INDEX IF NOT EXISTS idx_page_translations_published 
  ON public.page_translations (published);

CREATE INDEX IF NOT EXISTS idx_content_pages_status 
  ON public.content_pages (status);

CREATE INDEX IF NOT EXISTS idx_route_translations_lang 
  ON public.route_translations (language_code, is_nav);

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_seo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;

-- Helper function to check if caller is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Languages Policies
DROP POLICY IF EXISTS "Public read enabled languages" ON public.languages;
CREATE POLICY "Public read enabled languages" ON public.languages
  FOR SELECT USING (enabled = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin write languages" ON public.languages;
CREATE POLICY "Admin write languages" ON public.languages
  FOR ALL USING (public.is_admin());

-- Content Pages Policies
DROP POLICY IF EXISTS "Public read published content pages" ON public.content_pages;
CREATE POLICY "Public read published content pages" ON public.content_pages
  FOR SELECT USING (status = 'published' OR public.is_admin());

DROP POLICY IF EXISTS "Admin write content pages" ON public.content_pages;
CREATE POLICY "Admin write content pages" ON public.content_pages
  FOR ALL USING (public.is_admin());

-- Page Translations Policies
DROP POLICY IF EXISTS "Public read published page translations" ON public.page_translations;
CREATE POLICY "Public read published page translations" ON public.page_translations
  FOR SELECT USING (
    (published = true AND EXISTS (
      SELECT 1 FROM public.content_pages cp 
      WHERE cp.id = page_translations.page_id AND cp.status = 'published'
    )) OR public.is_admin()
  );

DROP POLICY IF EXISTS "Admin write page translations" ON public.page_translations;
CREATE POLICY "Admin write page translations" ON public.page_translations
  FOR ALL USING (public.is_admin());

-- Page SEO Policies
DROP POLICY IF EXISTS "Public read page seo" ON public.page_seo;
CREATE POLICY "Public read page seo" ON public.page_seo
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.page_translations pt
      JOIN public.content_pages cp ON cp.id = pt.page_id
      WHERE pt.id = page_seo.page_translation_id
        AND pt.published = true
        AND cp.status = 'published'
    ) OR public.is_admin()
  );

DROP POLICY IF EXISTS "Admin write page seo" ON public.page_seo;
CREATE POLICY "Admin write page seo" ON public.page_seo
  FOR ALL USING (public.is_admin());

-- Route Translations Policies
DROP POLICY IF EXISTS "Public read route translations" ON public.route_translations;
CREATE POLICY "Public read route translations" ON public.route_translations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin write route translations" ON public.route_translations;
CREATE POLICY "Admin write route translations" ON public.route_translations
  FOR ALL USING (public.is_admin());

-- Redirects Policies
DROP POLICY IF EXISTS "Public read enabled redirects" ON public.redirects;
CREATE POLICY "Public read enabled redirects" ON public.redirects
  FOR SELECT USING (enabled = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin write redirects" ON public.redirects;
CREATE POLICY "Admin write redirects" ON public.redirects
  FOR ALL USING (public.is_admin());
