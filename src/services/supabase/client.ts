import { createClient } from '@supabase/supabase-js';

const meta = import.meta as any;
const SUPABASE_URL = (meta.env && meta.env.VITE_SUPABASE_URL) || 'https://xfqlffxpbginaxbrxnvm.supabase.co';
const SUPABASE_ANON_KEY = (meta.env && meta.env.VITE_SUPABASE_ANON_KEY) || 'sb_publishable_oEaGX5Y7HP0TRYS1gJD53A_VwmLuYvI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) return null;
    return data.session;
  } catch (err) {
    console.warn('Failed to get session gracefully (offline/demo mode):', err);
    return null;
  }
}
