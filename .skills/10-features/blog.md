# Skill 05 — Blog System
## GemiPrompts.store — `/blog` and `/blog/:slug`

> Requires Skill 00. Data model reference: Skill 09, table `blogs`.

---

## 1. Purpose

The connective tissue of the SEO strategy: long-tail keyword capture and
the natural-language explainer for how to use Prompts/Skills/Video
Concepts together. Every other section's cross-link content is fed by the
blog.

## 2. Categories

Prompt Engineering, ChatGPT, Gemini, Claude, Cursor, SEO, AI Images, Video
Creation, Automation, Tutorials, News, Guides.

## 3. Library Page (`/blog`)

```
Category filter tabs
Featured post (large hero card, most recent "featured" flag)
Grid of BlogCard: cover, title, excerpt, category badge, author, read
  time, published date
Pagination (not infinite scroll — better for blog SEO/crawl budget)
```

## 4. Single Article Page (`/blog/:slug`)

```
Hero (cover image, title, author, published date, read time, category)
TOC (auto-generated from H2/H3 headings, sticky on desktop)
Article body (rendered from stored Markdown/rich content, sanitized)
Examples (embedded prompt/skill preview cards inline where referenced)
Downloads (if the article bundles a resource file)
Related Prompts (auto-matched by shared category/tags)
Related Skills (auto-matched by shared category/tags)
Comments (auth required to post, nested replies, moderation flag)
Share (native Web Share API + copy-link fallback)
```

- Reading time computed client-side or at publish-time from word count
  (≈200 wpm), stored as `reading_time_minutes` to avoid recomputation.
- Content sanitization: store as Markdown, render with a strict allow-list
  sanitizer (no raw HTML injection) before displaying.
- Inline "Examples" are NOT copy-pasted content — they render the actual
  live PromptCard/SkillCard component referencing the real Supabase row by
  id, so if that prompt is updated, the blog post reflects it automatically.

## 5. Comments

- `comments` table: `id, blog_id, user_id, parent_id (nullable), body,
  created_at, is_flagged, is_deleted`.
- Nested one level deep only (reply-to-reply collapses into same thread)
  to avoid runaway UI complexity in MVP.
- Simple flag button → sets `is_flagged`, hidden pending admin review, not
  auto-deleted.

## 6. SEO (blog is the highest-leverage SEO surface)

- Title: `{Post Title} | GemiPrompts.store Blog`
- JSON-LD `Article` (`headline`, `datePublished`, `dateModified`, `author`,
  `image`)
- Breadcrumb JSON-LD: `Home > Blog > {Category} > {Title}`
- FAQ schema when the article has a Q&A section
- Auto-generate `sitemap-blog.xml` from published posts (updated_at drives
  `lastmod`)
- Internal linking rule: every article must link to at least 2 Prompts/
  Skills/Videos and 1 other blog post — enforce this as an editorial
  checklist in the Admin CMS (Skill 11), not just a suggestion.

## 7. Google AI Studio Build Prompt

```
Build the Blog system for GemiPrompts.store per Skill 05.
Route /blog: category tabs (Prompt Engineering, ChatGPT, Gemini, Claude,
Cursor, SEO, AI Images, Video Creation, Automation, Tutorials, News,
Guides), featured post hero, paginated grid of BlogCard (cover, title,
excerpt, category, author, read time, date).
Route /blog/:slug: hero header, sticky auto-generated TOC from headings,
sanitized Markdown-rendered article body, inline live PromptCard/SkillCard
components where the article references specific prompts/skills by id,
downloads section if applicable, Related Prompts + Related Skills rows
(auto-matched by category), one-level-deep nested comments (auth required
to post, flag button for moderation), share buttons (Web Share API +
copy-link fallback). Wire to `blogs` and `comments` tables (Skill 09
schema). Generate Article + Breadcrumb JSON-LD per post.
```

## 8. Acceptance Checklist

- [ ] TOC auto-generates and scrolls correctly on click
- [ ] Content sanitized, no raw HTML injection possible
- [ ] Inline example cards pull live data, not static copies
- [ ] Comments: post, nested reply, flag all function; auth-gated posting
- [ ] Article JSON-LD validates; sitemap includes all published posts
