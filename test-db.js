import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xfqlffxpbginaxbrxnvm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_oEaGX5Y7HP0TRYS1gJD53A_VwmLuYvI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('ad_slots').select('*').limit(1);
  console.log(data, error);
}

check();
