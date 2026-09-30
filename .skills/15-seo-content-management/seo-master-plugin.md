# Unified SEO & Content Management Master Plugin
## GemiPrompts.store — Always Load

> **CRITICAL AGENT DIRECTIVE**: This skill is **ALWAYS LOADED**. Every content page, administration panel, database schema, or upload component created by the AI must comply with this skill.

---

## 1. Database Schema Specifications

### `seo_metadata` Table
Defines polymorphic SEO records mapped to any core content entity:
```sql
create table if not exists public.seo_metadata (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('prompt', 'blog', 'skill', 'video', 'category', 'collection')),
  entity_id uuid not null,
  seo_title text not null check (length(seo_title) <= 60),
  meta_description text not null check (length(meta_description) <= 160),
  focus_keyword text not null,
  secondary_keywords text[] default '{}',
  slug text not null,
  canonical_url text not null,
  robots text default 'index, follow',
  schema_type text default 'Article',
  og_title text,
  og_description text,
  og_image text,
  twitter_title text,
  twitter_description text,
  twitter_image text,
  json_ld jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (entity_type, entity_id),
  unique (entity_type, slug)
);
```

### `media_library` Table
Centralized table to manage reusable, optimized digital assets:
```sql
create table if not exists public.media_library (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  original_name text not null,
  file_name text not null,
  slug text unique not null,
  caption text,
  alt_text text not null,
  title text not null,
  description text,
  mime_type text not null,
  extension text not null,
  width int,
  height int,
  size int not null,
  storage_path text not null,
  public_url text not null,
  thumbnail_url text,
  dominant_color text,
  blurhash text,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);
```

---

## 2. Media Folders & Supabase Storage Buckets

### Storage Buckets
The application partitions media into the following Supabase buckets:
* `prompts-images` — Midjourney/Flux.1 generation galleries
* `blogs` — Articles cover art and inline illustrations
* `skills` — Software/Instruction manual assets, downloads
* `videos` — Social virality storyboards and thumbnails
* `categories` — Category cards and icons
* `downloads` — Safe ZIP, PDF, or text files (premium gated)
* `media` — Shared assets, logos, and general layouts

### Media Folder Layout inside `media` bucket:
```text
media/
├── prompts/
├── blogs/
├── skills/
├── videos/
├── categories/
└── downloads/
    ├── images/
    ├── txt/
    ├── md/
    ├── zip/
    └── pdf/
```

---

## 3. Upload Workflows & Image SEO

### Supported Methods
* **Drag & Drop**: Seamless drag onto the workspace area with visual highlight state.
* **Browse**: Standard OS file selector.
* **Paste URL**: Input a remote public URL to download and ingest into Supabase.
* **Upload Multiple / Bulk**: Process multiple files in a single batch sequence.
* **Clipboard Paste**: Paste images directly from keyboard clipboard (`Ctrl+V` / `Cmd+V`).

### Accepted Formats
* **Images**: `jpg`, `jpeg`, `png`, `webp`, `gif`, `svg`, `avif`
* **Documents / Archives**: `txt`, `md`, `zip`, `pdf`

### Automated Image SEO Transformer
Every uploaded image must pass through a normalization process that optimizes metadata and naming:
* **Original File Name**: `IMG_000234.jpg`
* **Transformed SEO File Name**: `luxury-desert-cobra-resort-saudi-arabia.jpg`
* **Alt Text Generation**: Sentence describing the visual elements.
* **Title/Caption**: Human-readable uppercase title derived from file name.

---

## 4. Google & Social Search Previews

### Google Search Preview Card (Desktop & Mobile)
Accurately replicates the modern SERP presentation:
* **Desktop Layout**: Gray breadcrumbs + bold blue Title (max 60 chars) + Meta description (max 160 chars).
* **Mobile Layout**: Domain name/favicon row + Title (larger font-size) + snippet.
* **Dark Mode Preview**: Toggleable view simulating search behavior in night mode.

### Social Preview Cards
Simulates how links render on messaging channels:
* **Facebook / LinkedIn**: Wide large image card (1.91:1) with bold title and domain.
* **Twitter / X Card**: Large image card with text overlay or summary details.
* **Discord / Slack**: Compact visual rich-embed with vertical highlight bar.

---

## 5. Agent Validation Checklist
Before any item (Prompt, Blog, Skill, Video, Category) is finalized or marked "published", the agent must execute the following automated validation protocol:

1. **SEO Title Length**: Must be present and under 60 characters.
2. **Meta Description Length**: Must be present and between 110–160 characters.
3. **Alt Text Exists**: Every visual image associated must have meaningful descriptive Alt text.
4. **Slug Unique**: Slugs must be checked against existing routes/rows to prevent collisons.
5. **Canonical URL Exists**: Valid format matching the site domain (`https://gemiprompts.store/...`).
6. **OpenGraph and Twitter Meta**: Filled out completely.
7. **JSON-LD Schema Generated**: Rich structured schemas mapping to page types (e.g. `HowTo`, `Article`).
8. **Internal Linking Minimums**: Meets cross-linking requirements (e.g., Blog has 2 links, video has 1 skill + 1 prompt).
9. **Sitemap Registry Updated**: Content triggers a background entry update for crawlers.
10. **File Optimization**: Media filenames optimized for hyphenated lower-case keywords.
