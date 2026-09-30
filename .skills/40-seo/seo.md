# Skill 10 — SEO & Technical Requirements
## GemiPrompts.store — site-wide & Admin Technical SEO

> Requires Skill 00. This handles site-wide search engine optimization, polymorphic metadata lookup, dynamic sitemap management, custom redirects, and 404 dead link tracking.

---

## 1. Polymorphic Metadata Table (`seo_metadata`)

Instead of hardcoding SEO titles and descriptions directly on each individual content table (prompts, skills, videos, blogs), all metadata is stored in a centralized polymorphic `seo_metadata` table.

### Schema
```sql
seo_metadata (
  id uuid primary key default gen_random_uuid(),
  entity_type varchar not null, -- 'Prompt', 'Skill', 'Video', 'Blog', 'Category', 'Collection', 'Page'
  entity_id uuid not null,      -- Foreign key pointing to the corresponding entity row
  title varchar(60) not null,   -- Custom SEO Title
  description varchar(160),     -- Custom SEO Description
  keywords varchar[],           -- Focused target keywords/tags
  og_title varchar,             -- OpenGraph Title override
  og_description varchar,       -- OpenGraph Description override
  og_image varchar,             -- Social preview cover image URL
  canonical_url varchar,        -- Canonical override link
  robots varchar,               -- Indexing overrides (e.g. 'noindex, follow')
  json_ld jsonb,                -- Extended schema markup payload
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Unique constraint ensuring one SEO config per entity
create unique index seo_metadata_entity_idx on seo_metadata (entity_type, entity_id);
```

---

## 2. Dynamic SEO Tag Resolution

On any content page route (e.g., `/prompts/:slug`, `/skills/:slug`), the front-end performs a concurrent lookup for the target entity and its corresponding `seo_metadata` record.

### Metadata Fallback Strategy:
1. **Direct Match**: Use the custom values defined in the `seo_metadata` row (title, description, keywords, og_image).
2. **Contextual Fallback**: If no `seo_metadata` record is configured, fall back to the entity's direct properties:
   - `Title` -> `entity.title` + `site_settings.title_suffix`
   - `Description` -> `entity.description` (truncated to 155 characters)
   - `og:image` -> `entity.thumbnail` or `entity.cover`
3. **Global Fallback**: Fall back to global configuration values retrieved from `site_settings`.

```tsx
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { cmsService } from '../../services/cmsService';
import { SEOMetadata } from '../../types';

interface SeoHeaderProps {
  entityType: 'Prompt' | 'Skill' | 'Video' | 'Blog' | 'Category' | 'Collection' | 'Page';
  entityId: string;
  defaultTitle: string;
  defaultDescription?: string;
  defaultImage?: string;
}

export const SeoHeader: React.FC<SeoHeaderProps> = ({
  entityType,
  entityId,
  defaultTitle,
  defaultDescription = '',
  defaultImage = ''
}) => {
  const [meta, setMeta] = useState<SEOMetadata | null>(null);

  useEffect(() => {
    async function loadMeta() {
      const { data } = await cmsService.getSeoMetadata(entityType, entityId);
      if (data) setMeta(data);
    }
    if (entityId) {
      loadMeta();
    }
  }, [entityType, entityId]);

  const finalTitle = meta?.title || `${defaultTitle} | GemiPrompts`;
  const finalDesc = meta?.description || defaultDescription.substring(0, 155);
  const finalImage = meta?.og_image || defaultImage;

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDesc} />
      {meta?.canonical_url && <link rel="canonical" href={meta.canonical_url} />}
      
      {/* OpenGraph Tags */}
      <meta property="og:title" content={meta?.og_title || finalTitle} />
      <meta property="og:description" content={meta?.og_description || finalDesc} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:type" content="website" />
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta?.og_title || finalTitle} />
      <meta name="twitter:description" content={meta?.og_description || finalDesc} />
      <meta name="twitter:image" content={finalImage} />

      {/* JSON-LD Schema Markup Injection */}
      {meta?.json_ld && (
        <script type="application/ld+json">
          {JSON.stringify(meta.json_ld)}
        </script>
      )}
    </Helmet>
  );
};
```

---

## 3. Global Site Settings (`site_settings`)

Global parameters, analytics tracking IDs, and fallback metadata are stored in the single-row `site_settings` configuration table.

```sql
site_settings (
  id uuid primary key default gen_random_uuid(),
  site_name varchar not null default 'GemiPrompts.store',
  title_suffix varchar not null default ' | Premium AI Assets',
  global_description varchar(160) not null,
  robots_txt text not null,
  google_tag_manager_id varchar,
  analytics_config jsonb, -- Custom telemetry preferences
  created_at timestamp default now()
);
```

### Site Settings Integration Rules:
- **Header Injection**: Inject the Google Tag Manager tracking tag only if `google_tag_manager_id` is defined and valid.
- **Dynamic robots.txt**: An API route `/robots.txt` queries and outputs the exact content of `site_settings.robots_txt` on requests.

---

## 4. Redirect Engine (`redirects`)

To avoid broken SEO links and crawl errors when moving or modifying assets, the site maintains a dynamic Redirect Engine matching pattern rules.

```sql
redirects (
  id uuid primary key default gen_random_uuid(),
  from_path varchar not null unique,   -- Relative path to intercept (e.g. '/flux-prompts')
  to_path varchar not null,            -- Destination path (e.g. '/prompts/flux-generator')
  status_code integer default 301,    -- 301 (Permanent) or 302 (Temporary)
  enabled boolean default true,
  created_at timestamp default now()
);
```

### Matching Algorithm (React Route Guard or Middleware):
- Before loading any client route, the router checks against active `redirects`.
- If a match is found, perform a `window.location.replace()` or client redirect to `to_path` immediately.

---

## 5. 404 Dead Link Tracker (`404_logs`)

To capture internal dead links, bad search crawls, and broken referrals, the application registers missing route actions dynamically.

```sql
404_logs (
  id uuid primary key default gen_random_uuid(),
  url varchar not null,
  referer varchar,
  user_agent varchar,
  hits integer default 1,
  last_occurred_at timestamp default now()
);
```

### Gating & Logging:
- When a client hits an unmapped route or content that does not exist, trigger the `cmsService.log404` action.
- The DB increments `hits` or inserts a new row with the respective `referer` and `user_agent`.
- Admins inspect these inside the Technical SEO dashboard to set up appropriate rules in the `redirects` table.

---

## 6. Sitemaps Generation

Sitemaps are compiled dynamically from current database content.

```
/sitemap.xml           Sitemap Index
/sitemap-prompts.xml   Dynamic URLs for Prompts
/sitemap-skills.xml    Dynamic URLs for Skills
/sitemap-videos.xml    Dynamic URLs for Video Concepts
/sitemap-blog.xml      Dynamic URLs for Blog Articles
```

- Each child sitemap resolves URLs by appending active, published slugs and assigns the `lastmod` attribute using `updated_at`.
- Canonical logic uses `rel=canonical` to point back to the base unfiltered lists for any list-views that contain active filtering queries (`?model=flux`).

---

## 7. Acceptance Checklist

- [ ] All SEO metadata resolves dynamically from the central `seo_metadata` table using polymorphic ids.
- [ ] Direct fallbacks to entity-specific descriptors are robustly handled if an SEO record is missing.
- [ ] Title tags automatically append the custom `site_settings.title_suffix`.
- [ ] Active redirects are evaluated on router initialization to redirect users and bots.
- [ ] 404 pages automatically trigger logging entries into `404_logs` with referrer information.
- [ ] Sitemaps include up-to-date links based on actual published slugs and current database timestamps.
