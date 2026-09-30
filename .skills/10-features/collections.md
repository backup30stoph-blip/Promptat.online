# Skill 08 — Collections
## GemiPrompts.store — `/collections` and `/collections/:slug`

> Requires Skill 00 and Skill 07 (auth). Phase 2 feature.

---

## 1. Purpose

The Pinterest-style "board" layer: users (and editors) curate mixed sets
of prompts/skills/videos/blogs around a theme. Editorial collections
double as landing pages for SEO ("Best Midjourney Prompts", "Luxury
Collection"); user collections drive UGC and return visits.

## 2. Data Model

```
collections        (id, owner_id, title, slug, description, cover_image,
                     is_public, is_editorial, created_at)
collection_items    (collection_id, content_type, content_id, position,
                     added_at)
```
- `is_editorial` flag distinguishes site-curated collections (shown on
  homepage/nav) from user-created ones (shown only on the owner's profile
  and `/collections` public directory if `is_public = true`).
- `position` (integer) allows drag-to-reorder within a collection.

## 3. Public Directory (`/collections`)

```
Editorial collections first (featured row)
Then public user collections, paginated, sorted by item count / recency
Filter: editorial only vs community
```

## 4. Single Collection Page (`/collections/:slug`)

```
Cover, Title, Description, Owner (avatar + name, or "GemiPrompts.store
  Editorial" badge), item count, follower/like count
Mixed grid: renders the correct card component per item's content_type
[Add to my collection] button (auth required) if viewer ≠ owner
Drag handles + reorder + remove (owner only)
```

## 5. Creating/Editing a Collection

- "New Collection" available from any card's overflow menu ("Save to
  collection…") — creates the collection inline via a modal without
  leaving the current page (critical for low-friction curation).
- Cover image: auto-generated from the first added item if the user
  doesn't upload one.

## 6. Seed Editorial Collections (launch content)

Best Midjourney Prompts, Luxury Collection, Architecture Collection,
YouTube Collection, Facebook Collection, TikTok Collection.

## 7. RLS

- `collections`: public read where `is_public = true OR is_editorial =
  true`; write/delete only by `owner_id = auth.uid()` (editorial rows
  writable only by admin role, see Skill 11).
- `collection_items`: same ownership check joined through `collection_id`.

## 8. SEO (editorial collections only)

- Title: `{Collection Title} — Curated {Type Mix} | GemiPrompts.store`
- JSON-LD `ItemList` / `CollectionPage`
- User collections default `noindex` unless promoted to editorial, to
  avoid thin/duplicate UGC pages diluting crawl budget.

## 9. Google AI Studio Build Prompt

```
Build Collections for GemiPrompts.store per Skill 08.
Data model: `collections` (owner_id, title, slug, description,
cover_image, is_public, is_editorial) and `collection_items`
(collection_id, content_type, content_id, position). Route /collections:
featured editorial row, then paginated public community collections,
filter toggle editorial/community. Route /collections/:slug: cover,
title, description, owner badge (or "Editorial" badge), mixed grid
rendering the correct existing card component per item's content_type,
drag-to-reorder + remove for owner, "Add to my collection" button for
non-owners (auth-gated). Add a "Save to collection…" action to the
overflow menu of every existing card type across the site, opening an
inline modal to add-to-existing or create-new collection without leaving
the page. Apply RLS: public read for public/editorial, write only by
owner. Editorial collections get full SEO meta + ItemList JSON-LD; user
collections default noindex.
```

## 10. Acceptance Checklist

- [ ] "Save to collection" reachable from every card type site-wide
- [ ] Drag-to-reorder persists `position` correctly
- [ ] RLS prevents non-owners from editing/deleting others' collections
- [ ] Editorial collections indexed with correct schema; user ones noindex
- [ ] Seed editorial collections present at launch
