# Authentication System Guidance
## GemiPrompts.store — Supabase Auth & Account Profiles

> Part of the 30-backend module. Outlines user logins, registrations, and account profile schemas.

---

## 1. User Auth Methods

GemiPrompts.store uses standard **Supabase Auth** services:
- **Provider Methods:** Email/Password credentials + OAuth providers (Google and GitHub).
- **Session Persistence:** Authenticated session states are managed using secure HTTP-only cookies or client local state handles.

---

## 2. Profile Creation Trigger

To guarantee that every authenticated user has an entry in the `profiles` database table, the following Postgres database trigger is configured at schema launch (no client-side code should ever manually generate profile rows):

```sql
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    'user'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

## 3. Auth Guards & Popups

- **Action Guards:** Interactive, unauthenticated actions (e.g., leaving comments, liking a card, downloading premium templates) must prompt the global auth modal trigger instead of hard-redirecting the page viewport.
- **Route Protection:** Protect dashboard routes (`/account/*`) via client-side route checks. If session is empty, redirect user back to Home with an active alert banner.
