# Skill 03 — Skills Library
## GemiPrompts.store — `/skills` and `/skills/:slug`

> Requires Skill 00. Data model reference: Skill 09, table `skills`.
> "Skills" here = downloadable AI-agent skill packages (Claude Skills,
> Cursor rules, custom instructions, etc.) — not to be confused with this
> document's own meta-use of the word "skill".

---

## 1. Purpose

Turn raw `.md` files into a structured, browsable, multi-format download
catalog — the GitHub-for-AI-instructions layer of the platform.

## 2. Library Page (`/skills`)

### Toolbar
```
Categories: Coding, SEO, Writing, Marketing, Video, Image, Automation,
Agents, Business, Ecommerce, UI Design, Database, React, PHP, Supabase,
Python
Filter: Supported AI (Claude, ChatGPT, Gemini, Cursor, Windsurf, Lovable,
Bolt, VSCode, AntiGravity), Difficulty, Free/Premium
Sort: Newest, Most Downloaded, Recently Updated
```

### Skill Card
```
Image
Title
Description (1–2 lines, truncated)
Category Badge
Downloads count
Updated date ("Updated 3 days ago")
Free / Premium badge
[Open →]
```

## 3. Single Skill Page (`/skills/:slug`)

```
Cover Image
Title, Category, Difficulty, Version (semver, e.g. v1.4.0)
Supported AI chips (Claude / ChatGPT / Gemini / Cursor / Windsurf /
  Lovable / Bolt / VSCode / AntiGravity) — only render chips that apply
Downloads: [Markdown] [TXT] [ZIP] [JSON] [PDF]
Content sections:
  Description
  Features (bullet list)
  Installation (step-by-step, code blocks per tool e.g. "drop into
    /mnt/skills/ for Claude" vs "paste into Cursor .cursorrules")
  How to Use
  Prompt (the actual skill content, syntax-highlighted, copy button)
  Examples (before/after or sample outputs)
  Files (list of included files in the ZIP with sizes)
  Updates (changelog, versioned)
```

- Every download format button triggers a Supabase Storage signed URL
  fetch, not a public permanent link — respects premium gating.
- Premium skills: if user hasn't purchased/unlocked, show a paywall/upsell
  card instead of the download buttons (stub Stripe/LemonSqueezy
  integration point — actual payment processor is out of scope for MVP,
  but the UI state must exist).

## 4. Version & Changelog

- `skills` table stores `version` (current) — full history lives in a
  child table `skill_versions` (skill_id, version, changelog, file refs,
  created_at). Detail page "Updates" tab lists these; each version can be
  downloaded independently (useful for reproducibility).

## 5. Cross-links

- "Related Prompts" strip: prompts sharing the same category.
- "Featured in Blog" strip: blog posts tagged with this skill's slug.
- "Used in Video Blueprint": video concepts listing this skill in their
  `AI Tools Needed`.

## 6. SEO

- Title: `{Skill Title} — {Category} Skill for {Primary AI} | GemiPrompts.store`
- JSON-LD `SoftwareSourceCode` or `HowTo` (Installation section maps well
  to `HowTo` steps).
- FAQ schema if the page includes an FAQ block (recommend adding one:
  "What AI tools support this skill?", "Is this free?").

## 7. Google AI Studio Build Prompt

```
Build the Skills Library for GemiPrompts.store per Skill 03.
Route /skills: toolbar with category pills (Coding, SEO, Writing,
Marketing, Video, Image, Automation, Agents, Business, Ecommerce, UI
Design, Database, React, PHP, Supabase, Python), Supported-AI filter chips
(Claude, ChatGPT, Gemini, Cursor, Windsurf, Lovable, Bolt, VSCode,
AntiGravity), difficulty + free/premium filters, sort dropdown, responsive
grid of SkillCard (image, title, truncated description, category badge,
downloads, updated date, free/premium badge, Open button).
Route /skills/:slug: cover, title/category/difficulty/version header,
supported-AI chips, 5 download buttons (Markdown/TXT/ZIP/JSON/PDF) using
Supabase Storage signed URLs, content sections (Description, Features,
Installation with per-tool code blocks, How to Use, syntax-highlighted
Prompt with copy button, Examples, Files list, Updates/changelog tab
pulling from `skill_versions` table). Show paywall UI state for locked
premium skills. Add Related Prompts / Featured in Blog / Used in Video
Blueprint cross-link rows. Wire to `skills` + `skill_versions` tables
(Skill 09 schema).
```

## 8. Acceptance Checklist

- [ ] All 5 download formats produce correct signed URLs, respecting
      premium gating
- [ ] Version history browsable and each version independently downloadable
- [ ] Supported AI chips only show tools the skill actually supports
- [ ] Three cross-link rows present and correctly filtered
- [ ] Installation steps render as `HowTo` structured data
