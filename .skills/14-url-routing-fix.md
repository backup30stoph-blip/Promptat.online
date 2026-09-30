# Skill 14 — URL Routing Fix: Hash URLs → Clean Indexable Paths
## GemiPrompts.store — critical SEO fix, do this before further content growth

> Requires Skill 00, 06, 10, 13. **This is a blocking issue** — every
> other SEO skill file (05, 10, 13) assumes real, distinct, crawlable
> URLs per page. Hash routing silently defeats all of them at once.

---

## 1. Diagnosis — Why `/#blog/slug` Breaks SEO

Current structure:
```
/#login
/#prompts        /#prompt/hyper-realistic-studio-portrait-elder-explorer
/#skills         /#skill/extreme-full-stack-react-supabase-cursorrules
/#videos
/#blog           /#blog/build-optimize-custom-cursorrules-ai-coding
```

Two separate, compounding problems:

**(a) Everything after `#` never reaches the server.** The fragment is a
client-only concept. When Googlebot (or any crawler, or any server-side
redirect/rewrite rule) requests your site, it only ever sees `/` — the
`#blog/slug` part is invisible to anything except JavaScript running in a
browser tab. This means:
- Your `blogs`/`prompts`/`skills` detail pages are **not distinct URLs**
  to Google at all — they all collapse to the same document as the root.
- `seo_metadata.canonical_url`, per-page JSON-LD (Skill 05/10), and
  per-page sitemap entries (Skill 10 Section 3) are **structurally
  impossible** to serve correctly, no matter how well those tables are
  filled in — the server has nothing to key them on.
- Nothing in `sitemap-*.xml` can actually point crawlers to individual
  content, because there is no server-resolvable individual URL to list.

**(b) Naming inconsistency compounds it.** `/#prompt/` (singular) vs your
own library route `/prompts` (plural, per Skill 00 Section 3) and same
for `/skill/` vs `/skills`. Even after fixing (a), this mismatch would
confuse both internal linking consistency and any existing backlinks.

**Old-style `#!` "AJAX crawling scheme" support was deprecated by Google
years ago** — there is no fallback mechanism that makes this work today.
This isn't a minor optimization, it's the difference between the site
being indexable at all beyond the homepage.

---

## 2. Target URL Structure (final, matches Skill 00 Section 3 exactly)

```
/                       Home
/prompts                Prompts library
/prompts/:slug          Single prompt   ← was /#prompt/:slug
/skills                 Skills library
/skills/:slug           Single skill    ← was /#skill/:slug
/videos                 Video library
/videos/:slug           Single video
/blog                   Blog library
/blog/:slug             Single post     ← already plural-consistent, keep
/login                  Auth            ← was /#login (or use a modal
                                           per Skill 07, not a route, see
                                           Section 5)
/categories/:type/:slug
/search
/collections/:slug
/account/*
```

No further hash usage anywhere in primary navigation. Reserve `#` only
for genuine same-page anchors (e.g. `/blog/slug#section-2` jumping to a
heading within one already-loaded article) — that is a legitimate use of
fragments and is not affected by this fix.

---

## 3. The Fix — Switch Router Mode

```tsx
// WRONG (current) — HashRouter
import { HashRouter } from "react-router-dom";
<HashRouter>...</HashRouter>

// CORRECT — BrowserRouter, uses real History API paths
import { BrowserRouter } from "react-router-dom";
<BrowserRouter>...</BrowserRouter>
```

Route definitions change from `/prompt/:slug` → `/prompts/:slug` and
`/skill/:slug` → `/skills/:slug` at the same time (fix both issues in one
pass, not two separate deploys).

---

## 4. Server Configuration (required — BrowserRouter alone is not enough)

`BrowserRouter` needs the **server** to return `index.html` for any
unknown path, so a direct hit on `/prompts/some-slug` (not just
client-side navigation) actually loads the app instead of 404ing.

**Netlify** (`_redirects` or `netlify.toml`):
```
/*    /index.html   200
```

**Vercel** (`vercel.json`):
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

**Nginx:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

Without this, clean URLs work when clicked inside the app but 404 on
direct load/refresh/shared-link — which is exactly the scenario a
crawler or a shared social link hits every time. This step is not
optional.

---

## 5. Login: Route or Modal?

`/#login` as a route is itself a smell — an auth screen rarely needs to
be indexed or deep-linked as its own crawlable page. Per Skill 07, prefer
an **auth modal** triggered from context (not a standalone route) for the
default flow; if a dedicated `/login` path is kept for direct-link
convenience (e.g. email confirmation redirects), mark it `noindex` per
Skill 10 Section 4 — it should never appear in `sitemap.xml`.

---

## 6. Migrating Already-Shared/Indexed Hash URLs

This is the part people miss: **you cannot write a server-side 301 for a
hash fragment** — the server never receives it, so a `redirects` table
entry keyed on `old_url = '/#blog/some-slug'` will never trigger on the
server side no matter how correctly Skill 13's redirect logic is
implemented. If any `/#...` URLs have already been shared, backlinked, or
indexed, handle the transition client-side instead:

```tsx
// Runs once, in the app shell, before router mounts.
// Detects a legacy hash URL and rewrites it to the new clean path.
useEffect(() => {
  const hash = window.location.hash; // e.g. "#blog/some-slug"
  if (hash && hash.length > 1) {
    const cleanPath = "/" + hash.slice(1); // "#blog/x" -> "/blog/x"
    // also fix singular->plural legacy segments
    const fixed = cleanPath
      .replace(/^\/prompt\//, "/prompts/")
      .replace(/^\/skill\//, "/skills/")
      .replace(/^\/login$/, "/login");
    window.history.replaceState(null, "", fixed);
    navigate(fixed, { replace: true });
  }
}, []);
```

This gets a *user's* browser onto the correct URL, but it does **not**
pass link equity to Googlebot the way a real 301 would, because Googlebot
generally does not execute this kind of client redirect the same way a
browser does. Practical consequence: since these hash URLs were very
likely never actually indexed as distinct pages in the first place (per
Section 1a, Google had nothing to index), there is effectively nothing to
"lose" in ranking terms — the priority is simply making sure any existing
shared links (social posts, DMs, backlinks someone already pasted) land
users on the correct working page rather than a broken one. Log any hash
URL hits (extend `404_logs`-style tracking to also capture legacy hash
hits) for a few weeks post-migration to confirm traffic has moved over,
then the client-redirect shim can be removed.

---

## 7. Update Everything That Referenced the Old Pattern

- [ ] All internal `<Link>`/`navigate()` calls across every component
      (Skills 01–08) use the new plural, hash-free paths
- [ ] `seo_metadata.canonical_url` regenerated for all existing rows to
      the new clean format
- [ ] `sitemap-*.xml` generator (Skill 10 Section 3) emits clean paths
- [ ] Any hardcoded share/copy-link buttons (Skill 02/04's `[Share]`
      action) build URLs from the new path structure
- [ ] `robots.txt` and any `noindex` rules (Skill 10 Section 4) reference
      real paths (`/account/`, `/search`, `/login`) — these rules were
      previously meaningless against hash routes since crawlers only ever
      saw `/`
- [ ] Analytics/event tracking (Skill 10 Section 8) keys page-view events
      on the real path, not the fragment

---

## 8. Verification

1. Direct-load test: paste `https://gemiprompts.store/prompts/some-slug`
   straight into a fresh browser tab (not clicked from within the app) —
   must render the correct page, not a 404 or the homepage.
2. `curl -I https://gemiprompts.store/skills/some-slug` — must return
   `200`, not `404`, and importantly must NOT redirect to `/`.
3. Google Search Console → URL Inspection on a handful of `/prompts/:slug`
   and `/blog/:slug` URLs post-deploy → request indexing.
4. Confirm `view-source:` on a direct load shows the prerendered/SSR
   content (per Skill 10 Section 1) at the correct path, not an empty
   shell requiring JS execution to reveal content.
5. Re-run the sitemap and confirm every URL listed 200s directly (no
   fragments, no 404s, no redirect chains — ties back to Skill 13
   Section 6's "no chain longer than 1 hop" rule).

---

## 9. Google AI Studio Build Prompt

```
Fix GemiPrompts.store's routing per Skill 14: currently using HashRouter
with URLs like /#blog/slug, /#prompt/slug, /#skill/slug, /#login — this
breaks SEO because content after # never reaches the server and cannot
be individually crawled/indexed/sitemapped.
Switch from HashRouter to BrowserRouter. Rename routes to plural,
consistent paths: /prompts/:slug (was /prompt/:slug), /skills/:slug (was
/skill/:slug), /videos/:slug, /blog/:slug — matching the library routes
/prompts, /skills, /videos, /blog exactly. Replace /#login with either an
auth modal (preferred, per Skill 07) or a noindex /login route.
Add SPA fallback server config so any direct path load returns index.html
with a 200 (not a 404) — include the correct rewrite rule for whatever
host this deploys to (Vercel rewrites / Netlify _redirects / Nginx
try_files).
Add a one-time client-side legacy-hash-redirect shim that detects any
incoming #blog/, #prompt/, #skill/ hash and rewrites it via
history.replaceState + router navigate to the new clean plural path,
so any already-shared old links still resolve correctly for real users
(note: this does not transfer SEO ranking signal via true 301, since
servers cannot see hash fragments — it is purely for user-facing link
continuity).
Update every internal Link/navigate call, seo_metadata.canonical_url
values, the sitemap generator, share/copy-link buttons, and robots.txt
noindex rules to use the new clean paths. Verify with direct curl -I
requests on several /prompts/:slug and /skills/:slug URLs confirming a
200 status with no redirect.
```

---

## 10. Acceptance Checklist

- [ ] `HashRouter` fully removed, `BrowserRouter` in place
- [ ] `/prompt/` and `/skill/` (singular) no longer exist anywhere in the
      codebase — all routes/links use plural
- [ ] Direct URL load (fresh tab, no client-side nav) works for every
      route type, confirmed via `curl -I` returning `200`
- [ ] SPA fallback rewrite configured on the actual hosting platform
- [ ] Legacy hash URLs redirect users to the correct new page client-side
- [ ] `canonical_url`, sitemap entries, share links all use clean paths —
      zero remaining `#` usage except genuine in-page anchors
- [ ] Google Search Console successfully inspects and indexes a sample
      of the new clean URLs post-deploy
- [ ] `/login` (if kept as a route) is `noindex` and excluded from the
      sitemap
