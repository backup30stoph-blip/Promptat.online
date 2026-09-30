# Skill 13 — SEO Slug Strategy & URL Optimization
## GemiPrompts.store — ranking-optimized slugs across all content types

> Requires Skill 00 and Skill 10 (SEO). Aligned to `Full_SQL_SO9SKILL_V3`:
> `seo_metadata` (focus_keyword, secondary_keywords, slug, canonical_url),
> `redirects` (old_url, new_url, type, hits), `404_logs`. A slug is not a
> cosmetic detail — it's a ranking signal, a click-through-rate driver in
> the SERP, and a permanent contract with every backlink you'll ever earn.
> Treat slug decisions as final before publish.

---

## 1. Why Slugs Matter for Ranking (the actual mechanism)

- Google uses URL path words as a (minor but real) relevance signal,
  and — more importantly — **users and other sites use the slug as the
  visible trust/relevance cue** in search results and when linking.
- Keyword-bearing slugs increase SERP click-through rate even at equal
  ranking position, because the URL fragment shown under the blue link
  visually confirms relevance.
- Slug **changes after indexing** cost you: a changed URL is treated as a
  new document until Google recrawls and consolidates signals via a 301 —
  every unmanaged slug change is a temporary (sometimes permanent) ranking
  reset. This is why Section 6 (immutability + redirects) is not optional.

---

## 2. Universal Slug Construction Rules

Applied by a single shared `generateSlug()` utility — every content type
calls the same function, never a one-off per form:

```
1. Lowercase everything
2. Transliterate non-ASCII characters (é → e, ü → u, etc.)
3. Replace all whitespace and underscores with a single hyphen
4. Strip all characters except a-z, 0-9, hyphen
5. Collapse multiple consecutive hyphens into one
6. Trim leading/trailing hyphens
7. Remove low-value stop words ONLY when the slug exceeds the target
   length (Section 3) — do not strip them by default, as "how-to-use"
   reads better and matches query patterns better than "use"
8. Cap at the max length for the content type (Section 3), cutting at a
   word boundary, never mid-word
9. Check uniqueness against the table's slug column; if taken, do NOT
   append a numeric suffix like `-2` (that dilutes exact-match keyword
   value) — instead append a short, meaningful differentiator drawn from
   the content itself (model name, category, or version), e.g.
   `dark-fantasy-castle` and `dark-fantasy-castle-midjourney` rather than
   `dark-fantasy-castle-2`
```

Stop words to strip only under length pressure: `a, an, the, of, for, to,
in, on, and, with, your`. Never strip words that are themselves part of
the target query pattern (e.g. keep "how to" in tutorial slugs — "how-to"
constructions match real search queries and should usually stay whole).

---

## 3. Slug Templates & Length Targets Per Content Type

Target 3–6 meaningful words, **50–60 characters max** (matches typical
SERP display width and keeps the full slug visible in search results).

| Content type | Pattern | Example |
|---|---|---|
| Prompt | `{subject}-{style/medium}-{model}` | `cyberpunk-city-neon-midjourney` |
| Skill | `{tool-or-outcome}-{ai-platform}-skill` | `seo-blog-writer-claude-skill` |
| Video Concept | `{niche}-{format}-video-blueprint` | `luxury-resorts-top-10-video-blueprint` |
| Blog | `{primary-keyword-phrase}` (question or how-to form when the query is a question) | `how-to-write-midjourney-prompts` |
| Category | `{category-name}` (kept short, this is a hub page) | `architecture`, `prompt-engineering` |
| Collection | `{theme}-collection` | `luxury-collection`, `best-midjourney-prompts` |

Rules that apply across all rows above:
- **Front-load the primary keyword.** Google and users both weight the
  first 1–2 words of a slug more heavily; don't bury `midjourney` at
  position 5 if it's the primary search term.
- **Never encode the content type redundantly with the URL path.** The
  route `/prompts/:slug` already tells Google this is a prompt — don't
  waste slug characters on the word "prompt" itself unless it's part of
  a natural query (e.g. a Skill's slug legitimately ending `-skill` is
  fine because "claude skill" is itself a real search term; "cyberpunk-
  city-prompt" wastes a word `/prompts/` already conveys).
- **No stop-word-only slugs, no generic slugs.** Reject `image-1`,
  `untitled`, `new-prompt`, `blog-post-42` at the validation layer before
  they ever reach `seo_metadata.slug`.

---

## 4. Tying Slugs to `seo_metadata` (keyword alignment)

Every content row's slug must be **derived from the same keyword research**
that populates its `seo_metadata` row — these are not independent fields
filled in separately by different people:

```
seo_metadata.focus_keyword        → drives the slug's core phrase
seo_metadata.secondary_keywords[]  → inform title/H1 variation, NOT
                                      crammed into the slug itself
seo_metadata.slug                 → must contain the focus_keyword
                                      (or a very close variant) verbatim
seo_metadata.seo_title            → should also front-load the same
                                      focus_keyword (slug/title/H1
                                      alignment is a documented ranking
                                      pattern — the three should visibly
                                      agree)
seo_metadata.canonical_url        → built from the final slug, absolute
                                      URL, always
```

Validation rule to enforce in the admin content editor: **block publish**
if `focus_keyword` (normalized) does not appear as a substring of `slug`.
This single check prevents the most common real-world SEO miss — great
keyword research that never made it into the URL.

---

## 5. Keyword Research Workflow (before a slug is ever typed)

For every new Prompt/Skill/Video/Blog, before creating the row:
```
1. Identify the primary query the content should rank for
   (e.g. "cyberpunk city midjourney prompt")
2. Check search intent match — is this informational (→ Blog),
   transactional/download (→ Skill/Prompt), or navigational (→ Category)?
   Mismatched intent-to-content-type is a common reason otherwise
   well-optimized pages fail to rank.
3. Pick ONE primary focus_keyword per page — never target the same
   primary keyword across two different content rows (see Section 7,
   cannibalization)
4. Derive the slug per Section 3's template for that content type
5. Populate seo_metadata: focus_keyword, secondary_keywords (2-5 related
   terms/synonyms), seo_title, meta_description — all referencing the
   same focus_keyword
```

---

## 6. Slug Immutability & the Redirect Contract

Once a slug is published and indexed, treat it as **permanent**. If a
change is genuinely required (typo fix, rebrand, category restructure):

```sql
-- on any slug change, BEFORE updating the content row:
insert into redirects (old_url, new_url, type, enabled)
values ('/prompts/old-slug', '/prompts/new-slug', 301, true);
```

- Always `301` (permanent) for intentional renames — this passes the
  vast majority of the old URL's accumulated ranking signal to the new
  one. Never use `302` for a permanent slug change (302 signals "temporary"
  and Google may not consolidate ranking signals).
- Chain-check: if `old-slug` already had a prior redirect pointing to it,
  update the chain to point directly from the oldest URL to the newest
  target — never leave a redirect chain longer than 1 hop (each hop adds
  crawl budget cost and dilutes signal slightly).
- The `redirects.hits` counter is your evidence: if an old slug still
  gets meaningful hits/backlinks months later, that's a signal the new
  slug should incorporate the old one's proven keyword rather than
  discard it entirely.
- Admin UI must physically block a slug-change save unless the redirect
  row is created in the same transaction — never allow a silent slug
  edit that orphans the old URL.

---

## 7. Cannibalization & Duplicate-Intent Prevention

- Before publishing, search existing `seo_metadata.focus_keyword` values
  for an exact or near-exact match. Two pages competing for the same
  query split ranking signal and rarely both rank — Google will pick one
  and may pick neither reliably.
- If two pieces of content genuinely serve the same query, merge them
  (redirect the weaker one to the stronger one via Section 6's process)
  rather than let both live indexed.
- Category pages (hub) and individual content pages (spoke) targeting
  related-but-distinct keyword variants is fine and intended — e.g.
  `/categories/architecture` targets "architecture ai prompts" (broad)
  while `/prompts/gothic-cathedral-interior-midjourney` targets a long-tail
  variant. This hub/spoke structure is the goal, not a conflict.

---

## 8. Programmatic / Templated Slugs (categories × filters)

If you generate combination pages (e.g. category × model, like
"architecture prompts for midjourney"), each combination MUST have:
- A genuinely distinct primary keyword and enough unique content
  (not just a filtered list with a templated H1) to avoid being treated
  as thin/duplicate content
- Its own `seo_metadata` row, not a generated-on-the-fly meta tag
- A clear internal link from the parent category page

Per Skill 10 Section 5: **filtered views via query string are never
separately indexed** — only true programmatic landing pages with their
own slug and unique supporting content qualify for this pattern. Don't
mass-generate thin category×category pages just because the URL pattern
is easy to template; each one needs to earn its place with real content.

---

## 9. Monitoring & Feedback Loop

- `404_logs`: any URL hit with no match gets logged (`url`, `referer`,
  `hits`, `resolved`). Review weekly — a spike on one dead URL usually
  means an external backlink exists; add a targeted redirect (Section 6)
  rather than leaving it 404.
- `redirects.hits`: review monthly to confirm old URLs are actually
  fading in traffic as the new slug accumulates its own signal (expect
  a multi-month transition, not instant).
- Track focus_keyword ranking position externally (Google Search
  Console) and correlate with slug/title/H1 alignment — pages that drift
  in ranking are often ones where the on-page elements have diverged
  from each other over subsequent edits.

---

## 10. Google AI Studio Build Prompt

```
Implement the SEO Slug Strategy for GemiPrompts.store per Skill 13, using
the seo_metadata and redirects tables from Full_SQL_SO9SKILL_V3.
Build a shared generateSlug(text, contentType) utility used by every
content form (prompts, skills, video_concepts, blogs, categories,
collections): lowercase, transliterate, hyphenate, strip invalid chars,
collapse hyphens, trim, strip stop words only when over the max length,
cap at 50-60 chars cut at a word boundary, and on collision append a
meaningful differentiator (model/category/version) instead of a numeric
suffix. Enforce content-type slug templates from Skill 13 Section 3
(front-loaded primary keyword, no redundant content-type words).
Add a publish-time validator that blocks saving unless
seo_metadata.focus_keyword (normalized) appears as a substring of
seo_metadata.slug, and warns if the same focus_keyword is already used
on another published row (cannibalization check).
Make slugs immutable after first publish in the admin UI unless the user
explicitly confirms a rename; on confirmed rename, require a 301 redirect
row to be created in the same transaction (old_url → new_url), and
auto-detect + collapse existing redirect chains to a single hop.
Add an admin dashboard view surfacing 404_logs sorted by hits (for
missing-redirect detection) and redirects sorted by hits (for tracking
old-URL traffic decay). Build category/model combination landing pages
only where unique supporting content exists per page, each with its own
seo_metadata row — never index bare filtered query-string views.
```

---

## 11. Acceptance Checklist

- [ ] Every content type uses the same shared `generateSlug()` function
- [ ] No slug is a generic/stop-word-only placeholder (validated at save)
- [ ] `focus_keyword` verified as a substring of `slug` before publish
- [ ] No two published rows share an identical `focus_keyword`
  (cannibalization check active)
- [ ] Slug edits after first publish require a 301 redirect in the same
      transaction — no orphaned old URLs
- [ ] No redirect chain exceeds 1 hop
- [ ] `404_logs` reviewed on a schedule; recurring hits converted to
      redirects
- [ ] Programmatic combination pages have unique content + their own
      `seo_metadata` row, never a bare filtered URL
- [ ] Slug, `seo_title`, and on-page H1 visibly agree on the same
      primary keyword for every published page
