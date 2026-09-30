# Skill 17 — Social Login (Google, Facebook, GitHub) & User Profile Page
## GemiPrompts.store — Supabase Auth provider setup + `profiles` auto-creation

> Requires Skill 00, 07, 09. Extends Skill 07's Auth Flow with the exact
> external-console steps for each provider (matching the Supabase
> dashboard screens in your screenshots) plus a real profile page spec.

---

## 1. The One URL You'll Paste Everywhere

Every provider (Google, Facebook, GitHub) needs the **same Supabase
callback URL**, which Supabase already shows you (with a Copy button) on
the Facebook/GitHub provider screens in your screenshots:

```
https://<your-project-ref>.supabase.co/auth/v1/callback
```

This is the one piece of information that flows *from* Supabase *into*
each provider's developer console — every provider setup below starts by
copying this same URL from Supabase and pasting it into that provider's
"Redirect URI" / "Callback URL" field. Get this copied once before you
start on Google/Facebook/GitHub so you're not re-finding it three times.

---

## 2. Google — Field-by-Field (matches Image 1 & 4)

### 2.1 Get credentials from Google Cloud Console (external, do this first)
1. Go to Google Cloud Console → create/select a project.
2. **APIs & Services → OAuth consent screen**: set up the consent screen
   (app name, support email, scopes: `email`, `profile`, `openid`).
3. **APIs & Services → Credentials → Create Credentials → OAuth client
   ID** → Application type: **Web application**.
4. Under **Authorized redirect URIs**, paste the Supabase callback URL
   from Section 1.
5. Google now gives you a **Client ID** and **Client Secret** — copy both.

### 2.2 Fill in the Supabase dialog (Image 1 & 4)
| Field | What to put |
|---|---|
| **Enable Sign in with Google** | Toggle **ON** — nothing else works while this is off |
| **Client IDs** | Paste the Web Client ID from step 2.1. This field accepts a **comma-separated list** — only add more entries here if you later also support native Android/iOS sign-in with their own separate client IDs; for a standard web app, one Client ID is enough |
| **Client Secret (for OAuth)** | Paste the Client Secret from step 2.1 |
| **Skip nonce checks** | Leave **OFF**. Only turn this on if you implement native iOS Sign in with Apple/Google where the platform SDK doesn't give you access to the original nonce — not applicable to a standard web OAuth flow |
| **Allow users without an email** | Leave **OFF** — your `profiles`/`comments`/account features assume every user has an email; only enable if you have a specific reason to support providers that withhold it |

Click **Save**.

---

## 3. Facebook — Field-by-Field (matches Image 2)

### 3.1 Get credentials from Meta for Developers (external, do this first)
1. Go to developers.facebook.com → **My Apps → Create App** → choose
   "Consumer" or "Business" type.
2. Add the **Facebook Login** product to the app.
3. In Facebook Login → Settings, add the Supabase callback URL (Section
   1) to **Valid OAuth Redirect URIs**.
4. From **App Settings → Basic**, copy the **App ID** and **App Secret**.

### 3.2 Fill in the Supabase dialog (Image 2)
| Field | What to put |
|---|---|
| **Facebook enabled** | Toggle **ON** |
| **Facebook client ID** | Paste the **App ID** from step 3.1 |
| **Facebook secret** | Paste the **App Secret** from step 3.1 |
| **Allow users without an email** | Leave **OFF** for the same reason as Google above |
| **Callback URL (for OAuth)** | This is already filled in by Supabase — just click **Copy** and paste it into Facebook's Valid OAuth Redirect URIs field (step 3, above) — you don't type anything here yourself |

Click **Save**. Note: an app in Facebook's default "Development Mode"
only allows login for accounts you've added as testers/admins on the
Facebook app — submit for App Review (Basic permissions only needed:
`email`, `public_profile`) before opening sign-up to the public.

---

## 4. GitHub — Field-by-Field (matches Image 3)

### 4.1 Get credentials from GitHub (external, do this first)
1. GitHub → **Settings → Developer settings → OAuth Apps → New OAuth
   App**.
2. **Homepage URL**: `https://gemiprompts.store`
3. **Authorization callback URL**: paste the Supabase callback URL
   (Section 1).
4. Register the app → GitHub gives you a **Client ID** immediately, and
   a **Generate a new client secret** button for the secret.

### 4.2 Fill in the Supabase dialog (Image 3)
| Field | What to put |
|---|---|
| **GitHub enabled** | Toggle **ON** |
| **Client ID** | Paste from step 4.1 |
| **Client Secret** | Paste from step 4.1 |
| **Allow users without an email** | Leave **OFF** — note GitHub accounts *can* have a private/no public email; if you expect creators to sign up with GitHub and hide their email, you'll need to turn this on and handle a null email in your `profiles` logic (Section 6 handles this gracefully either way) |
| **Callback URL (for OAuth)** | Already filled by Supabase — Copy and paste into GitHub's Authorization callback URL field (step 3, above) |

Click **Save**.

---

## 5. Frontend — Trigger Each Provider's Login

```ts
// lib/auth.ts
import { supabase } from "./supabase/client";

export async function signInWithProvider(provider: "google" | "facebook" | "github") {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
}
```

- `redirectTo` points at a small `/auth/callback` route in **your own
  app** (not the Supabase callback URL from Section 1 — that one is
  Supabase-to-provider, this one is Supabase-back-to-your-app). That
  route just checks the session and redirects to `/account` or the page
  the user started from.
- Auth modal (per Skill 07) shows three buttons: **Continue with
  Google**, **Continue with Facebook**, **Continue with GitHub**, each
  calling `signInWithProvider(...)` — plus the existing email/password
  option.

---

## 6. Auto-Create `profiles` on First Sign-In (any provider)

Different providers populate different metadata keys on
`auth.users.raw_user_meta_data` — the trigger must check all of them.

```sql
create or replace function public.handle_new_user()
returns trigger as $$
declare
  meta jsonb := new.raw_user_meta_data;
begin
  insert into public.profiles (id, username, full_name, avatar_url, role, created_at, updated_at)
  values (
    new.id,
    -- username: prefer GitHub's user_name, else derive from email, else id
    coalesce(
      meta->>'user_name',
      split_part(new.email, '@', 1),
      new.id::text
    ),
    -- full_name: Google/Facebook use 'full_name' or 'name'
    coalesce(meta->>'full_name', meta->>'name'),
    -- avatar_url: consistent key across Google/Facebook/GitHub via Supabase
    meta->>'avatar_url',
    'user',
    now(),
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

- `on conflict (id) do nothing` makes this safe to re-run and safe
  against any race condition on repeated sign-ins.
- `username` uniqueness: if `split_part(email,'@',1)` collides with an
  existing username, insert will fail on the `profiles.username unique`
  constraint — wrap in a small retry loop appending a short suffix, or
  relax to nullable-username-then-prompt-to-set-one on first profile
  visit (simpler for MVP — let the user pick a unique username the first
  time they open `/account/settings` rather than solving collisions in
  the trigger).
- Handles the GitHub-no-public-email case (Section 4.2) gracefully:
  `new.email` may be null, `split_part` on null returns null, final
  fallback is the user's own `id` — never a hard trigger failure.

---

## 7. Profile Page

### 7.1 Own account view — `/account/settings`
```
Avatar (from profiles.avatar_url, editable via Skill 11 uploader)
Username (editable, uniqueness-checked live)
Full name (editable)
Bio (editable, short textarea)
Connected provider badge(s): Google / Facebook / GitHub — read from
  auth.users identities (multiple providers can be linked to one account)
Email (read-only display, from auth.users.email — may show "Not
  provided" if the provider withheld it)
[Save Changes]
[Delete Account] (destructive, confirm dialog)
```

### 7.2 Public profile view — `/u/:username` (optional but recommended)
```
Avatar, username, full_name, bio
"Joined {month year}"
Public collections owned by this user (Skill 08, where is_public = true)
Comments/activity feed — optional, skip for MVP if scope-constrained
```
- Public profile `select` policy: username/avatar_url/full_name/bio are
  public-read (needed for comment attribution site-wide per Skill 07
  Section 5); never expose `email` on this route.

---

## 8. Security Notes

- **Client Secrets never touch the frontend** — they live only in the
  Supabase dashboard provider config (server-side), never in your React
  code, `.env` files committed to git, or any client-visible bundle.
- Rotate a Client Secret immediately if it's ever accidentally committed
  or pasted somewhere public — regenerate from the same provider console
  and update only in Supabase.
- Leave **"Skip nonce checks"** and **"Allow users without an email"**
  off by default site-wide (per Sections 2–4) unless you have a specific,
  named reason — both reduce security guarantees Supabase otherwise
  gives you for free.
- Facebook apps in Development Mode (Section 3.2 note) will silently
  fail login for real users until App Review is complete — test this
  early, it's the most common "why doesn't Facebook login work" surprise.

---

## 9. Google AI Studio Build Prompt

```
Implement social login (Google, Facebook, GitHub) and a user profile
system for GemiPrompts.store per Skill 17.

Add three "Continue with {Provider}" buttons to the existing auth modal
(Skill 07), each calling supabase.auth.signInWithOAuth({ provider,
options: { redirectTo: `${window.location.origin}/auth/callback` }}).
Build a minimal /auth/callback route that waits for the session to
resolve then redirects to /account (or back to the page the user started
on, tracked via a stored return-to path).

Create a Postgres trigger `handle_new_user` on `auth.users` (after
insert) that upserts a `profiles` row, deriving username from
raw_user_meta_data->>'user_name' (GitHub) falling back to the email
local-part falling back to the user's id, full_name from 'full_name' or
'name', avatar_url from 'avatar_url' — using `on conflict (id) do
nothing` for safety, and never failing on a null email (GitHub users can
withhold their email).

Build /account/settings: editable avatar (via the existing Skill 11
uploader), username (live uniqueness check), full_name, bio, a
read-only connected-provider badge row (read from the user's linked
identities), read-only email display (showing "Not provided" if null),
Save Changes, and a destructive Delete Account flow with confirmation.

Build an optional public profile route /u/:username showing avatar,
username, full_name, bio, join date, and the user's public collections
(Skill 08) — never expose email on this public route. Apply RLS so
username/avatar_url/full_name/bio are public-read but email remains
private to the owning user only.
```

---

## 10. Acceptance Checklist

- [ ] Same Supabase callback URL correctly pasted into Google, Facebook,
      and GitHub's respective redirect/callback fields
- [ ] All three providers toggled **enabled** in Supabase only after
      their Client ID/Secret are filled in (not before)
- [ ] "Skip nonce checks" and "Allow users without an email" left off
      unless a specific documented reason exists to enable either
- [ ] Signing in with each of the three providers creates exactly one
      `profiles` row, no duplicates, no trigger failures on a null email
- [ ] Username collisions handled without a hard failure (retry suffix
      or first-login prompt-to-set-username)
- [ ] `/account/settings` lets a user edit avatar/username/full_name/bio
      and shows which provider(s) they signed in with
- [ ] Public `/u/:username` never exposes email
- [ ] Facebook app moved out of Development Mode (App Review submitted)
      before public launch, or explicitly documented as a known
      launch-blocker
- [ ] No Client Secret appears anywhere in frontend code or committed
      files
