# Skill 06 — Categories & Global Search
## GemiPrompts.store — `/categories/:type/:slug` and `/search`

> Requires Skill 00. Data model reference: Skill 09, table `categories`.

---

## 1. Categories Model

A single polymorphic `categories` table (see Skill 09) with a `type`
column (`prompt | skill | video | blog`) lets one taxonomy engine serve all
four content types while still allowing type-specific category lists
(e.g. "Architecture" for prompts, "Coding" for skills).

## 2. Category Listing Page (`/categories/:type/:slug`)

```
Header: category icon, color, title, item count
Sub-filter: same filter bar as the parent library page for that type
Grid: reuses PromptCard/SkillCard/VideoCard/BlogCard depending on `:type`
Pagination or infinite scroll (match parent library's pattern)
"Explore other categories" chip row at the bottom (encourages further
  browsing → session duration)
```

- Do not build a separate component per type here — this page is a thin
  wrapper that filters the existing library page's data hook by
  `category_slug` and renders the existing card component. Avoids
  duplicated logic.

## 3. Global Search (`/search`)

### Behavior
- Single input, debounced 300ms, searches across all 4 tables
  simultaneously via a Postgres full-text search function
  (`search_all(query text)`) exposed as a Supabase RPC / Edge Function.
- Results grouped by type in tabs: **All / Prompts / Skills / Videos /
  Blog / Categories** — "All" shows top 3 of each type; a type tab shows
  full paginated results for that type only.
- Empty state: show trending/popular content per type instead of a blank
  page (never show "no results" with nothing else to do).
- Recent searches stored client-side (in-memory/session, NOT
  localStorage per environment constraints if built as an artifact; for
  the real deployed app, browser localStorage is fine outside the
  artifact sandbox).

### Search Ranking
- Use Postgres `tsvector`/`tsquery` with weighted columns: title (A),
  description/excerpt (B), tags/category (C).
- Boost by `downloads`/`views` as a secondary sort for tied relevance.

## 4. SEO

- `/search` itself should be `noindex` (avoid infinite thin-content pages
  from query strings) but `/categories/:type/:slug` pages ARE indexable
  and should have full meta:
  - Title: `{Category} {Type} — GemiPrompts.store`
  - JSON-LD `CollectionPage` with `ItemList` of the top items shown

## 5. Google AI Studio Build Prompt

```
Build Categories & Global Search for GemiPrompts.store per Skill 06.
Route /categories/:type/:slug: header with icon/color/title/count, reuse
the parent section's filter bar and card component (Prompt/Skill/Video/
Blog depending on :type) rather than duplicating grid logic, paginated or
infinite-scroll list matching the parent library's pattern, bottom chip
row linking to other categories of the same type.
Route /search: single debounced input, tabbed results (All/Prompts/
Skills/Videos/Blog/Categories), "All" tab shows top 3 per type, individual
tabs show full paginated results, empty state shows trending content per
type instead of blank. Implement a Postgres full-text search RPC
`search_all(query text)` with weighted columns (title > description >
tags), secondary sort by downloads/views. Mark /search noindex, mark
/categories/:type/:slug indexable with CollectionPage JSON-LD. Wire to
`categories` table (Skill 09 schema).
```

## 6. Acceptance Checklist

- [ ] One category page component serves all 4 content types
- [ ] Search returns cross-type grouped results in under ~300ms perceived
- [ ] Empty search state never shows a dead end
- [ ] `/search` is noindex; category pages are indexable with correct schema
