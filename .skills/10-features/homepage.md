# Skill 01 — Homepage
## GemiPrompts.store

> Requires Skill 00 loaded first (stack, folders, tokens).

---

## 1. Purpose

Convert a first-time visitor in under 5 seconds: show what the site is
(Prompts + Skills + Video Concepts + Blog), prove it's active (fresh
content, real numbers), and route them into the funnel that matches their
intent.

## 2. Page Structure (top → bottom)

```
<Header />               sticky, search bar, nav: Prompts / Skills / Videos / Blog
<Hero />
<QuickStats />           e.g. "1,200+ Prompts · 300+ Skills · 150+ Blueprints"
<LatestImagePrompts />    horizontal scroll / grid, 8 items
<PopularSkills />         grid, 6 items
<TrendingVideoIdeas />    grid, 6 items, shows "Virality Score" badge
<NewestBlogPosts />       grid, 3 items
<PopularCategories />     icon chips, clickable, per content type tabs
<Newsletter />            email capture → Supabase table `newsletter_subscribers`
<Footer />
```

## 3. Hero Component

```
Headline: "Discover Premium AI Prompts"
Subhead:  "Download Skills. Build Viral Channels. Learn AI Content Creation."
CTAs: [Browse Prompts] [Download Skills] [Explore Video Ideas]
Background: animated gradient or subtle particle canvas (Framer Motion),
respects prefers-reduced-motion.
```

Each CTA routes to `/prompts`, `/skills`, `/videos` respectively — no dead
links, no "coming soon".

## 4. Data Fetching

- All homepage sections use TanStack Query with a shared `staleTime` of 60s
  and Supabase Realtime subscription is NOT used here (too many rows); use
  polling/query invalidation on navigation instead.
- Each section queries only what it needs, ordered:
  - Latest Prompts → `order by created_at desc limit 8`
  - Popular Skills → `order by downloads desc limit 6`
  - Trending Videos → `order by virality_score desc limit 6`
  - Newest Blog → `order by published_at desc limit 3`
- `QuickStats` uses a single Postgres view `homepage_stats` (counts per
  table) refreshed via a scheduled Edge Function every 10 min, not a live
  `count(*)` on every page load.

## 5. Newsletter Section

- Form: email only, Zod-validated.
- On submit → insert into `newsletter_subscribers` (unique email
  constraint), show inline success state, no page redirect.
- Rate-limit via Edge Function (max 1 submission per IP per minute) to
  block bot spam.

## 6. SEO

- `<title>`: "GemiPrompts.store — AI Creator Hub for Prompts, Skills & Viral Video Concepts"
- Meta description under 160 chars summarizing the 4 pillars.
- JSON-LD: `WebSite` + `SearchAction` (site search box), `Organization`.
- All CTA links are real `<a>`/`<Link>` (not JS-only onClick) for
  crawlability.

## 7. Google AI Studio Build Prompt

```
Build the GemiPrompts.store Homepage per Skill 01.
Sections top-to-bottom: Header, Hero (headline "Discover Premium AI
Prompts", subhead "Download Skills. Build Viral Channels. Learn AI Content
Creation.", 3 CTA buttons routing to /prompts /skills /videos), QuickStats
bar, LatestImagePrompts (8-card grid, violet accent), PopularSkills
(6-card grid, emerald accent), TrendingVideoIdeas (6-card grid, amber
accent, show Virality Score badge), NewestBlogPosts (3-card grid, sky
accent), PopularCategories (icon chip row per content type), Newsletter
capture form, Footer.
Use TanStack Query hooks per section, Framer Motion entrance animations
staggered per card, dark mode default. Implement full TypeScript, no
placeholder data — wire to Supabase tables from Skill 09.
```

## 8. Acceptance Checklist

- [ ] Hero CTAs route correctly, no placeholder `#` links
- [ ] Each content section pulls live Supabase data, correctly ordered
- [ ] Newsletter form validates + rate-limits + shows success state
- [ ] JSON-LD present and validates in Google Rich Results Test
- [ ] Cards use correct per-type accent color
