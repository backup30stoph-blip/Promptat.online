# Skill 07 — User Account & Dashboard
## GemiPrompts.store — `/account/*`

> Requires Skill 00. Uses Supabase Auth + RLS. Phase 2 feature.

---

## 1. Purpose

Give every registered creator a personal control panel over what they've
saved, downloaded, liked, and viewed — the retention layer that turns
one-time visitors into repeat users.

## 2. Auth Flow

- Supabase Auth: email/password + Google + GitHub OAuth.
- Auth modal (not a full-page redirect) triggered from any gated action
  (Favorite, Download premium, Comment, Create collection).
- On first sign-up, create a row in `profiles` (id = auth.uid(), username,
  avatar_url, created_at) via a Postgres trigger, not client-side, so it
  can never be skipped.

## 3. Dashboard Tabs (`/account`)

```
/account/bookmarks    Saved prompts/skills/videos/blogs, filterable by type
/account/downloads    Download history: item, format, date, re-download link
/account/liked        Everything the user has liked, filterable by type
/account/history      Recently viewed items (last 50, auto-pruned)
/account/collections  User-created collections (see Skill 08)
/account/settings     Profile, avatar, email, password, delete account
```

- Each tab reuses the relevant card component from its content type
  (same principle as Skill 06) filtered by the user's interaction tables
  rather than building bespoke list UIs per tab.

## 4. Data Model for Interactions

Three lightweight junction tables (see Skill 09 for full DDL):
```
bookmarks   (user_id, content_type, content_id, created_at)
likes       (user_id, content_type, content_id, created_at)
downloads   (user_id, content_type, content_id, format, created_at)
view_history(user_id, content_type, content_id, viewed_at)
```
`content_type` is an enum (`prompt|skill|video|blog`) + `content_id` uuid —
polymorphic association pattern, avoids 4 separate bookmark tables.

## 5. RLS Rules (critical)

- Every interaction table: `select/insert/delete` only where `user_id =
  auth.uid()`.
- `profiles`: public read of username/avatar (needed for comment
  attribution), but `update` only by the owning user.
- Never expose another user's email or download history.

## 6. UX Details

- Bookmark/Like buttons are optimistic (update UI immediately, roll back
  on Supabase error) so the interaction feels instant.
- `view_history` writes are fire-and-forget (don't block page render),
  capped at 50 rows per user via a scheduled cleanup Edge Function.
- Empty states per tab should link back to the relevant library page
  ("No bookmarks yet — browse Prompts →").

## 7. Google AI Studio Build Prompt

```
Build User Account & Dashboard for GemiPrompts.store per Skill 07.
Implement Supabase Auth (email/password + Google + GitHub OAuth) with an
auth modal triggered from gated actions rather than full-page redirect.
On sign-up, create a `profiles` row via Postgres trigger.
Build /account with tabs: Bookmarks, Downloads, Liked, History,
Collections, Settings. Each tab (except Settings/Collections) reuses the
existing content-type card components, filtered by polymorphic junction
tables `bookmarks`, `likes`, `downloads`, `view_history`
(user_id, content_type, content_id, ...). Apply RLS so users only ever see
their own rows in these tables; `profiles` username/avatar public-read,
update-own-only. Make bookmark/like actions optimistic in the UI. Add
empty states linking back to the relevant library page. Wire everything to
the Skill 09 schema.
```

## 8. Acceptance Checklist

- [ ] Auth modal appears contextually, never a jarring full redirect
- [ ] `profiles` row always created via trigger, never missable client-side
- [ ] RLS verified: user A cannot query user B's bookmarks/downloads/history
- [ ] Optimistic like/bookmark UI rolls back correctly on failure
- [ ] History auto-prunes to last 50 entries
