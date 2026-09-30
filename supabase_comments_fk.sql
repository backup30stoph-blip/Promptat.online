-- =========================================================================
-- OPTIONAL: SUPABASE COMMENTS FOREIGN KEY RELATIONSHIPS
-- =========================================================================
-- Copy and run this script in Supabase Dashboard -> SQL Editor
-- Link: https://supabase.com/dashboard/project/_/sql/new
--
-- This links user_id in comments tables directly to public.profiles.id
-- so Supabase PostgREST can perform automatic joins.
-- =========================================================================

-- 1. Create prompt_comments table if missing and add foreign key
CREATE TABLE IF NOT EXISTS public.prompt_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.prompt_comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  likes INT DEFAULT 0,
  is_flagged BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create skill_comments table
CREATE TABLE IF NOT EXISTS public.skill_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.skill_comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  likes INT DEFAULT 0,
  is_flagged BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create video_comments table
CREATE TABLE IF NOT EXISTS public.video_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.video_comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  likes INT DEFAULT 0,
  is_flagged BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create blog_comments table
CREATE TABLE IF NOT EXISTS public.blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.blog_comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  likes INT DEFAULT 0,
  is_flagged BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.prompt_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- Allow Public Read Access for Comments
DROP POLICY IF EXISTS "Public Read Comments" ON public.prompt_comments;
CREATE POLICY "Public Read Comments" ON public.prompt_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Skill Comments" ON public.skill_comments;
CREATE POLICY "Public Read Skill Comments" ON public.skill_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Video Comments" ON public.video_comments;
CREATE POLICY "Public Read Video Comments" ON public.video_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Blog Comments" ON public.blog_comments;
CREATE POLICY "Public Read Blog Comments" ON public.blog_comments FOR SELECT USING (true);

-- Allow Authenticated Users Insert Comments
DROP POLICY IF EXISTS "Auth Insert Comments" ON public.prompt_comments;
CREATE POLICY "Auth Insert Comments" ON public.prompt_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth Insert Skill Comments" ON public.skill_comments;
CREATE POLICY "Auth Insert Skill Comments" ON public.skill_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth Insert Video Comments" ON public.video_comments;
CREATE POLICY "Auth Insert Video Comments" ON public.video_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth Insert Blog Comments" ON public.blog_comments;
CREATE POLICY "Auth Insert Blog Comments" ON public.blog_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
