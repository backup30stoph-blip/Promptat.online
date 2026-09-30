-- ==============================================================================
-- DATABASE SCHEMA UPDATE: MULTILINGUAL TRANSLATION GROUPS, LANG, & CANONICALS
-- Links translated content types (Prompts, Skills, Videos, Blogs) using translation_group_id.
-- ==============================================================================

-- 1. Prompts Table Updates
ALTER TABLE public.prompts ADD COLUMN IF NOT EXISTS translation_group_id UUID DEFAULT gen_random_uuid();
ALTER TABLE public.prompts ADD COLUMN IF NOT EXISTS lang TEXT DEFAULT 'ar' CHECK (lang IN ('ar', 'en', 'fr', 'es', 'id'));
ALTER TABLE public.prompts ADD COLUMN IF NOT EXISTS canonical_url TEXT;

-- 2. Skills Table Updates
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS translation_group_id UUID DEFAULT gen_random_uuid();
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS lang TEXT DEFAULT 'ar' CHECK (lang IN ('ar', 'en', 'fr', 'es', 'id'));
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS canonical_url TEXT;

-- 3. Video Concepts Table Updates
ALTER TABLE public.video_concepts ADD COLUMN IF NOT EXISTS translation_group_id UUID DEFAULT gen_random_uuid();
ALTER TABLE public.video_concepts ADD COLUMN IF NOT EXISTS lang TEXT DEFAULT 'ar' CHECK (lang IN ('ar', 'en', 'fr', 'es', 'id'));
ALTER TABLE public.video_concepts ADD COLUMN IF NOT EXISTS canonical_url TEXT;

-- 4. Blogs Table Updates
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS translation_group_id UUID DEFAULT gen_random_uuid();
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS lang TEXT DEFAULT 'ar' CHECK (lang IN ('ar', 'en', 'fr', 'es', 'id'));
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS canonical_url TEXT;

-- Create Indexes for super-fast translated lookups and alternate lang matching
CREATE INDEX IF NOT EXISTS idx_prompts_translation_group ON public.prompts(translation_group_id, lang);
CREATE INDEX IF NOT EXISTS idx_skills_translation_group ON public.skills(translation_group_id, lang);
CREATE INDEX IF NOT EXISTS idx_video_concepts_translation_group ON public.video_concepts(translation_group_id, lang);
CREATE INDEX IF NOT EXISTS idx_blogs_translation_group ON public.blogs(translation_group_id, lang);
