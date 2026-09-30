# Skill 02 — Image Prompts Library
## GemiPrompts.store — `/prompts` and `/prompts/:slug`

> Requires Skill 00. Data model reference: Skill 09, table `prompts`.

---

## 1. Purpose

Primary discovery surface for AI image-generation prompts (Midjourney,
Stable Diffusion, DALL·E, Flux, etc.). Must feel like a premium visual
catalog (Pinterest-grade), not a plain text list.

## 2. Library Page (`/prompts`)

### 2.1 Toolbar
```
Categories dropdown/pills (Architecture, Fantasy, Animals, Vehicles,
Luxury, Travel, Nature, Products, Food, Portrait, Logo, Icons, Thumbnails,
UI Design, Characters, Anime, 3D, Photography, Cinematic, Advertising)
Search input (debounced 300ms, hits /search edge function or local filter)
Filter: Model (Midjourney / SDXL / Flux / DALL·E / Other), Difficulty,
        Free/Premium
Sort: Newest, Most Liked, Most Downloaded, Most Viewed
```

### 2.2 Grid
- Masonry or fixed-aspect grid, responsive 2/3/4 columns.
- Infinite scroll via TanStack Query `useInfiniteQuery`, page size 24.
- Skeleton loaders matching card shape while fetching.

### 2.3 Prompt Card
```
Preview Image (lazy-loaded, blurhash placeholder)
Title
Model badge
Category badge
Difficulty badge (Beginner/Intermediate/Advanced)
Stats row: Downloads · Views · Likes
Actions: [Copy Prompt] [♥ Favorite] [Details →]
```
- Copy Prompt button copies raw prompt text to clipboard instantly (no
  navigation required) and shows a toast — this is the #1 conversion
  action, must work from the card, not only the detail page.

## 3. Single Prompt Page (`/prompts/:slug`)

```
Cover Image + Gallery (lightbox, keyboard nav)
Prompt (monospace block, copy button)
Negative Prompt (collapsible, copy button)
Parameters table: Camera, Lighting, Style, Aspect Ratio, Seed
Recommended Models (chips linking to a model-filtered library view)
Actions: [Copy] [Download .txt] [Download .md] [Favorite] [Share]
Related Prompts (same category, 4 cards)
Related Skills (skills tagged with this prompt's category — cross-link!)
```

- `Download .txt`/`Download .md` generate the file client-side from the
  fetched record (no need to pre-store static files) using a Blob +
  `URL.createObjectURL`.
- View count increments once per session (dedup via `sessionStorage` key
  or Edge Function + IP/user hash) — never increment on every re-render.
- Like/Favorite requires auth; unauthenticated click opens the auth modal,
  not a broken action.

## 4. Categories (fixed taxonomy, seed these rows first)

Architecture, Fantasy, Animals, Vehicles, Luxury, Travel, Nature, Products,
Food, Portrait, Logo, Icons, Thumbnails, UI Design, Characters, Anime, 3D,
Photography, Cinematic, Advertising.

## 5. SEO per prompt page

- Title: `{Prompt Title} — AI Prompt for {Model} | GemiPrompts.store`
- OG image = cover image
- JSON-LD `CreativeWork` with `about`, `keywords` = category + model
- Canonical URL, breadcrumb JSON-LD (`Home > Prompts > {Category} > {Title}`)

## 6. Google AI Studio Build Prompt

```
Build the Image Prompts Library for GemiPrompts.store per Skill 02.
Route /prompts: toolbar (category pills, search, filters for model/
difficulty/free-premium, sort dropdown), infinite-scroll masonry grid of
PromptCard (preview image, title, model badge, category badge, difficulty
badge, downloads/views/likes stats, Copy Prompt / Favorite / Details
actions — Copy must work directly from the card via clipboard API + toast).
Route /prompts/:slug: cover + gallery lightbox, prompt block with copy
button, collapsible negative prompt, parameters table (camera, lighting,
style, aspect ratio, seed), recommended model chips, download .txt/.md
buttons generated client-side, related prompts row, related skills row
(cross-link to /skills filtered by same category). Wire all data to the
`prompts` Supabase table (Skill 09 schema). Increment view count once per
session via Edge Function.
```

## 7. Acceptance Checklist

- [ ] Copy Prompt works from card AND detail page without navigation
- [ ] Infinite scroll doesn't refetch already-loaded pages
- [ ] Download files generated client-side, correct extension/content
- [ ] Related Skills block always renders (never empty without fallback)
- [ ] View increments exactly once per session
