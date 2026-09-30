-- ==============================================================================
-- SUPABASE LINTER SECURITY FIXES (Solves all 12 database warnings)
-- ==============================================================================
-- Run this script in Supabase Dashboard -> SQL Editor (New Query)
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. Fix Mutable Search Paths (Pins search_path to prevent hijacking)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  -- handle_new_user
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
    ALTER FUNCTION public.handle_new_user() SET search_path = public, auth, pg_temp;
  END IF;

  -- force_lowercase_email
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'force_lowercase_email') THEN
    ALTER FUNCTION public.force_lowercase_email() SET search_path = public, auth, pg_temp;
  END IF;

  -- delete_own_user_auth
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'delete_own_user_auth') THEN
    ALTER FUNCTION public.delete_own_user_auth() SET search_path = public, auth, pg_temp;
  END IF;

  -- send_periodic_email_summary
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'send_periodic_email_summary') THEN
    ALTER FUNCTION public.send_periodic_email_summary() SET search_path = public, auth, pg_temp;
  END IF;

  -- is_admin
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
    ALTER FUNCTION public.is_admin() SET search_path = public, auth, pg_temp;
  END IF;
END $$;


-- ------------------------------------------------------------------------------
-- 2. Revoke Unintended SECURITY DEFINER RPC Execution from Public/Anon
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  -- Internal email function: ONLY service_role (background jobs / Edge Functions)
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'send_periodic_email_summary') THEN
    REVOKE ALL ON FUNCTION public.send_periodic_email_summary() FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.send_periodic_email_summary() TO service_role;
  END IF;

  -- User self-deletion: ONLY signed-in authenticated users
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'delete_own_user_auth') THEN
    REVOKE ALL ON FUNCTION public.delete_own_user_auth() FROM PUBLIC, anon;
    GRANT EXECUTE ON FUNCTION public.delete_own_user_auth() TO authenticated;
  END IF;

  -- is_admin check: ONLY signed-in authenticated users
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
    REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
    GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
  END IF;

  -- Trigger functions: Revoke direct execution via RPC
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
    REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'force_lowercase_email') THEN
    REVOKE ALL ON FUNCTION public.force_lowercase_email() FROM PUBLIC, anon, authenticated;
  END IF;
END $$;


-- ------------------------------------------------------------------------------
-- 3. Fix Overly Permissive UPDATE Policies on Comments Table
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comments') THEN
    
    -- Owner edit policy
    DROP POLICY IF EXISTS "owner can edit own comment" ON public.comments;
    CREATE POLICY "owner can edit own comment"
    ON public.comments
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

    -- Owner or Admin soft-delete policy
    DROP POLICY IF EXISTS "owner or admin can soft-delete" ON public.comments;
    CREATE POLICY "owner or admin can soft-delete"
    ON public.comments
    FOR UPDATE
    TO authenticated
    USING (
      auth.uid() = user_id 
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
    WITH CHECK (
      auth.uid() = user_id 
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

  END IF;
END $$;


-- ------------------------------------------------------------------------------
-- 4. Fix Newsletter Subscribers INSERT Policy (Validates email input format)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'newsletter_subscribers') THEN
    
    DROP POLICY IF EXISTS "Allow public newsletter inserts" ON public.newsletter_subscribers;
    CREATE POLICY "Allow public newsletter inserts"
    ON public.newsletter_subscribers
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (
      email IS NOT NULL 
      AND length(trim(email)) > 3
      AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    );

  END IF;
END $$;

COMMIT;
