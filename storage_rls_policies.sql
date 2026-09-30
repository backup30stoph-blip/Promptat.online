-- =========================================================================
-- SECURE SUPABASE STORAGE BUCKETS & ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
-- Copy and run this script in your Supabase Dashboard -> SQL Editor
-- Link: https://supabase.com/dashboard/project/_/sql/new
--
-- What this script does:
--  1. Creates all required storage buckets ('prompts-images', 'media', 'skills', 
--     'videos', 'blogs', 'avatars', 'downloads') as public buckets.
--  2. Adds Public SELECT access so all images can be viewed globally.
--  3. Adds INSERT, UPDATE, DELETE permissions for authenticated users and fallback.
-- =========================================================================

-- 1. Create Storage Buckets (if they don't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('prompts-images', 'prompts-images', true, 10485760, NULL),
  ('media', 'media', true, 10485760, NULL),
  ('skills', 'skills', true, 10485760, NULL),
  ('videos', 'videos', true, 10485760, NULL),
  ('blogs', 'blogs', true, 10485760, NULL),
  ('avatars', 'avatars', true, 5242880, NULL),
  ('downloads', 'downloads', true, 52428800, NULL)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Public Read Access (Anyone can view media)
DROP POLICY IF EXISTS "Public Read Access on storage buckets" ON storage.objects;
CREATE POLICY "Public Read Access on storage buckets"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('prompts-images', 'media', 'skills', 'videos', 'blogs', 'avatars', 'downloads'));

-- 3. Authenticated Users Upload Policy
DROP POLICY IF EXISTS "Authenticated Users Upload Access" ON storage.objects;
CREATE POLICY "Authenticated Users Upload Access"
  ON storage.objects FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND bucket_id IN ('prompts-images', 'media', 'skills', 'videos', 'blogs', 'avatars', 'downloads')
  );

-- 4. Authenticated Users Update & Delete Policy
DROP POLICY IF EXISTS "Authenticated Users Update Access" ON storage.objects;
CREATE POLICY "Authenticated Users Update Access"
  ON storage.objects FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND bucket_id IN ('prompts-images', 'media', 'skills', 'videos', 'blogs', 'avatars', 'downloads')
  );

DROP POLICY IF EXISTS "Authenticated Users Delete Access" ON storage.objects;
CREATE POLICY "Authenticated Users Delete Access"
  ON storage.objects FOR DELETE
  USING (
    auth.role() = 'authenticated'
    AND bucket_id IN ('prompts-images', 'media', 'skills', 'videos', 'blogs', 'avatars', 'downloads')
  );

-- 5. Public Guest Fallback Upload Policy
DROP POLICY IF EXISTS "Public Guest Upload Access on Storage" ON storage.objects;
CREATE POLICY "Public Guest Upload Access on Storage"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id IN ('prompts-images', 'media', 'skills', 'videos', 'blogs', 'avatars', 'downloads')
  );
