# Skill 00 — Project Master Plan
## GemiPrompts.store — AI Creator Hub

> Master build skill. Load this file FIRST in every Google AI Studio / Gemini
> session before working on any sub-section (01–11). It defines the shared
> vocabulary, stack, schema conventions and folder layout that every other
> skill file assumes.

---

## 1. What GemiPrompts.store Is

Not a "prompt store". It is an **AI Creator Hub**: a content platform that
merges four models people already understand:

| Inspiration | What we borrow |
|---|---|
| GitHub | Versioned, downloadable assets (skills, prompts) |
| Pinterest | Visual discovery, boards/collections, infinite scroll |
| Gumroad | Free/Premium downloads, files, monetization |
| Notion | Long-form structured pages (skill docs, blog docs) |

Every content type (Prompt, Skill, Video Concept, Blog Post) is
**cross-linked**: a Prompt recommends Skills, a Skill points to Blog
tutorials, a Video Concept bundles Prompts + Skills + assets. This internal
linking web is the core SEO and retention strategy — never build a content
type in isolation.

---

## 2. Tech Stack (do not deviate without reason)

```
Frontend
├── React 19 + Vite + TypeScript
├── TailwindCSS v4
├── shadcn/ui (Radix primitives)
├── React Router v6
├── TanStack Query (server state/caching)
├── React Hook Form + Zod (forms & validation)
├── Framer Motion (page/section transitions)
└── Lucide Icons

Backend — Supabase
├── Auth (email + OAuth: Google, GitHub)
├── Postgres (see Skill 09 for schema)
├── Storage (cover images, gallery, zip/md/pdf/json downloads)
├── Edge Functions (download counters, search, AI-assisted generation)
├── Realtime (live like/download counters, comments)
└── Row Level Security (RLS) on every table

CMS
└── Supabase Admin Dashboard (custom-built, see Skill 11)
```

Google AI Studio / Gemini note: when asking Gemini to scaffold code, always
paste this stack block verbatim into the prompt so it never substitutes
Next.js, Firebase, or Prisma.

---

## 3. Site Map

```
/                      Home
/prompts                Image Prompts library
/prompts/:slug          Single prompt
/skills                 Skills Library
/skills/:slug           Single skill
/videos                 Viral Video Concepts
/videos/:slug           Single video concept
/blog                   Blog
/blog/:slug             Single article
/categories/:type/:slug Category listing (prompt|skill|video|blog)
/search                 Global search
/collections            Public collections
/collections/:slug      Single collection
/account                User dashboard (bookmarks, downloads, likes, history)
/about
/contact
/admin/*                Admin CMS (Phase 3, gated by role)
```

---

## 4. Folder Structure

```text
src/
├── app/                      # router, providers, layout shell
├── pages/
│   ├── Home/
│   ├── Prompts/
│   ├── Skills/
│   ├── Videos/
│   ├── Blog/
│   ├── Categories/
│   ├── Search/
│   ├── Collections/
│   ├── Account/
│   └── Admin/
├── components/
│   ├── ui/                   # shadcn primitives
│   ├── cards/                # PromptCard, SkillCard, VideoCard, BlogCard
│   ├── layout/                # Header, Footer, Sidebar, MobileNav
│   ├── sections/              # Hero, Newsletter, TrendingRow, etc.
│   ├── forms/
│   └── shared/                # CopyButton, DownloadButton, LikeButton, Bookmark
├── hooks/                     # useBookmark, useDownloadCounter, useAuth
├── services/
│   ├── supabase/               # client.ts, storage.ts, auth.ts
│   ├── prompts/
│   ├── skills/
│   ├── blogs/
│   └── videos/
├── lib/                       # utils, formatters, seo helpers
├── types/                      # generated Supabase types + domain types
├── utils/
└── assets/
```

Every `services/<domain>/` folder exposes the same 4 functions so pages stay
consistent: `list()`, `getBySlug()`, `getRelated()`, `incrementView()`.

---

## 5. Global Design Tokens (used by every skill file)

- Dark mode default, light mode toggle, persisted via Supabase user prefs
  once authenticated, otherwise `localStorage`-free (use in-memory + cookie).
- Card radius: `rounded-2xl`, subtle border, hover-lift (`translate-y-1`,
  shadow).
- One accent color per content type for quick visual scanning:
  - Prompts → violet
  - Skills → emerald
  - Videos → amber
  - Blog → sky
- Typography: a display serif or bold grotesk for H1/H2, Inter (or similar)
  for body — avoid generic default Tailwind look, see `frontend-design`
  guidance if generating actual components.

---

## 6. Roadmap (build in this order)

**Phase 1 — MVP**
Home → Prompts library → Skills library (MD/ZIP downloads) → Video Concepts
→ Blog → Search → Categories → Supabase wiring.

**Phase 2 — Engagement**
Auth → Favorites/Bookmarks → Download history → Collections → Comments &
ratings → Related content widgets.

**Phase 3 — Scale**
Admin CMS → Rich Markdown editor → Prompt versioning → Scheduled publishing
→ Analytics dashboard → AI-assisted content generation (Gemini/OpenAI/Claude
API to draft new prompts/skills from admin panel).

---

## 7. Google AI Studio — Master System Prompt

Paste this once at the top of any Gemini Build session, then append the
specific section prompt from skill files 01–11:

```
You are building "GemiPrompts.store", an AI Creator Hub web app.
Stack: React 19, Vite, TypeScript, TailwindCSS v4, shadcn/ui, React Router,
TanStack Query, React Hook Form + Zod, Framer Motion, Lucide Icons, backed
by Supabase (Auth, Postgres, Storage, Edge Functions, Realtime, RLS).
Follow the folder structure and design tokens below exactly. Every content
type (prompts, skills, videos, blog) must render internal links to related
content of the other three types. Output production-ready TypeScript, no
placeholders, no TODO comments — implement fully or state a clear blocker.
[paste folder structure + tokens from Skill 00 section 4 & 5]
Now build: <insert Skill 0X task here>
```

---

## 8. Master Acceptance Checklist

- [ ] Stack matches Section 2 exactly, nothing substituted
- [ ] Folder structure matches Section 4
- [ ] Every page type cross-links to the other 3 content types
- [ ] Dark mode default + accent colors per content type applied
- [ ] RLS enabled on every Supabase table before any data is public
- [ ] SEO meta present on every route (see Skill 10)
