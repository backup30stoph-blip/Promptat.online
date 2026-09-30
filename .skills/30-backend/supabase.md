# Supabase Integration Client
## GemiPrompts.store — Supabase Connection Client

> Part of the 30-backend module. Defines client instantiations and type configurations.

---

## 1. Client Initialization (Lazy Pattern)

To ensure the application does not crash if Supabase credentials are missing during module load time, the Supabase client must be initialized lazily or guarded:

```ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase'; // auto-generated

let supabaseInstance: any = null;

export function getSupabase() {
  if (!supabaseInstance) {
    const url = import.meta.env.VITE_SUPABASE_URL || '';
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    
    if (!url || !anonKey) {
      console.warn('Supabase URL or Anon Key is missing. Operating in local state fallback.');
    }
    
    supabaseInstance = createClient<Database>(url, anonKey);
  }
  return supabaseInstance;
}
```

---

## 2. Realtime Subscriptions

- While Supabase supports live database event streams, avoid connecting global realtime subscriptions to active catalog lists containing thousands of items.
- Utilize TanStack Query polling intervals or query invalidation upon page navigation transitions to maintain list freshness instead.

---

## 3. Row Level Security Policies (RLS)

- Ensure all client interactions respect Postgres RLS filters. Any insert or update query on polymorphic junction tables (`bookmarks`, `likes`, `comments`) must append current user token filters seamlessly.
- Never fetch raw emails, passwords, or transaction records from other profiles.
