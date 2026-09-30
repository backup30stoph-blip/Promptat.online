# Skill 04 — Viral Video Concepts
## GemiPrompts.store — `/videos` and `/videos/:slug`

> Requires Skill 00. Data model reference: Skill 09, table `video_concepts`.
> **This is the flagship feature** — it should get the most polish, the
> richest detail pages, and the most cross-links of any section.

---

## 1. Purpose

Give faceless-channel creators a complete, ready-to-execute blueprint: not
just an idea, but the prompt, script, thumbnail, voice-over, SEO, and
monetization plan bundled together. This is what differentiates the site
from a plain prompt list — sell the *outcome* (a channel), not just an
asset.

## 2. Library Page (`/videos`)

### Example niches (seed categories)
Top 10 AI Apps, Luxury Resorts, Countries as..., Animals, Cars,
Architecture, Space, Mega Projects, Travel, History, Future Tech.

### Toolbar
```
Niche filter (list above)
Sort: Newest, Highest Virality Score, Highest Expected RPM, Lowest
      Competition
```

### Video Concept Card
```
Cover
Title
Hook (1-line, the actual video hook text)
Niche badge
Difficulty
Expected RPM ($ range)
Competition (Low/Medium/High badge)
Virality Score (0–100, shown as a small radial/bar indicator)
AI Tools Needed (icon row)
[Open →]
```

## 3. Single Video Concept Page (`/videos/:slug`)

```
Cover
Header: Title, Hook, Niche, Difficulty, Expected RPM, Competition,
        Virality Score, AI Tools Needed

Full Prompt              (the master generation prompt for the concept)
Channel Blueprint         (positioning, target audience, posting cadence)
Video Structure           (beat-by-beat outline w/ timestamps)
Thumbnail Prompt          (image-gen prompt, copy button, links to
                           /prompts if a matching prompt entry exists)
Voice Over Prompt         (TTS/script-voice instructions, copy button)
Editing Prompt            (pacing/cut instructions for editors or AI tools)
Image Prompt              (per-scene image prompts, copy button each)
Animation Prompt          (if applicable, e.g. Runway/Kling instructions)

SEO block:
  Titles (3–5 alt title suggestions)
  Description (ready-to-paste YouTube description)
  Tags
  Hashtags

Publishing Schedule       (suggested cadence, best days/times)
Monetization              (ad revenue notes, sponsorship angle)
Affiliate Ideas           (relevant affiliate programs for the niche)
Resources                 (external tool links, stock footage sources)

Downloads: [ZIP] [Markdown] [Canva Assets] [Thumbnail] [Voice Prompt]
           [Scripts] [JSON]
```

- Every "Prompt" sub-block (Thumbnail, Voice Over, Image, Animation) gets
  its own individual copy button — don't force users to copy the whole
  page to get one piece.
- Where a `Thumbnail Prompt` matches an existing row in `prompts`, render
  an inline "Use this prompt →" link instead of duplicating content
  (single source of truth, avoid content drift).

## 4. Virality Score & Expected RPM

- Stored as plain numeric columns (`virality_score int`, `expected_rpm_min
  numeric`, `expected_rpm_max numeric`), curated manually by editors
  (Phase 1) — do not fabricate a "real-time algorithm" claim in the UI;
  present them as editorial estimates, e.g. label as "Editorial Estimate"
  in a tooltip to avoid misleading monetization claims.

## 5. Cross-links

- Thumbnail Prompt → matching entry in `prompts`
- AI Tools Needed → matching entries in `skills`
- "How to use this blueprint" → matching Blog tutorial

## 6. SEO

- Title: `{Video Title} — Viral {Niche} Channel Blueprint | GemiPrompts.store`
- JSON-LD `HowTo` for the Video Structure / Channel Blueprint section
- Rich snippet potential for "Expected RPM" as a FAQ entry

## 7. Google AI Studio Build Prompt

```
Build the Viral Video Concepts section for GemiPrompts.store per Skill 04
— this is the flagship feature, give it the richest UI of any section.
Route /videos: niche filter (Top 10 AI Apps, Luxury Resorts, Countries as,
Animals, Cars, Architecture, Space, Mega Projects, Travel, History, Future
Tech), sort by newest/virality/RPM/competition, grid of VideoConceptCard
(cover, title, hook, niche badge, difficulty, expected RPM range,
competition badge, virality score radial indicator, AI tools icon row).
Route /videos/:slug: full header stats, then sequential sections each with
their own copy button — Full Prompt, Channel Blueprint, Video Structure
(timestamped outline), Thumbnail Prompt (cross-link to matching /prompts
entry if exists), Voice Over Prompt, Editing Prompt, per-scene Image
Prompts, Animation Prompt, SEO block (titles/description/tags/hashtags),
Publishing Schedule, Monetization notes, Affiliate Ideas, Resources links.
Downloads: ZIP, Markdown, Canva Assets, Thumbnail, Voice Prompt, Scripts,
JSON — via Supabase Storage signed URLs. Label RPM/Virality Score as
"Editorial Estimate" via tooltip. Wire to `video_concepts` table (Skill 09
schema).
```

## 8. Acceptance Checklist

- [ ] Every prompt sub-block has its own independent copy button
- [ ] Thumbnail Prompt cross-links to matching `/prompts` entry when one exists
- [ ] RPM/Virality labeled as editorial estimate (no unverifiable claims)
- [ ] All 7 download formats function via signed URLs
- [ ] AI Tools Needed row links out to matching `/skills` entries
