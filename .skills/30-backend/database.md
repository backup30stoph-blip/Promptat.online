# Skill 09 — Database Schema (Supabase / Postgres)
## GemiPrompts.store

> Requires Skill 00. This is the single source of truth for table shapes —
> every other skill file (01–08, 11) references tables defined here. If a
> field is needed elsewhere and missing here, add it here first.

---

## 1. Core Content Tables

### `prompts`
```sql
id              uuid primary key default gen_random_uuid()
title           text not null
slug            text unique not null
description     text
prompt          text not null
negative_prompt text
model           text            -- 'midjourney' | 'sdxl' | 'flux' | 'dalle' | 'other'
category_id     uuid references categories(id)
thumbnail       text            -- storage path
gallery         text[]          -- storage paths
style           text
camera          text
lighting        text
aspect_ratio    text
seed            text
difficulty      text            -- 'beginner' | 'intermediate' | 'advanced'
downloads       int default 0
views           int default 0
likes           int default 0
featured        boolean default false
premium         boolean default false
created_at      timestamptz default now()
updated_at      timestamptz default now()
```

### `skills`
```sql
id              uuid primary key default gen_random_uuid()
title           text not null
slug            text unique not null
description     text
cover           text
category_id     uuid references categories(id)
supported_ai    text[]          -- ['claude','chatgpt','gemini','cursor',...]
markdown_file   text            -- storage path
zip_file        text
pdf_file        text
json_file       text
downloads       int default 0
views           int default 0
version         text default '1.0.0'
difficulty      text
featured        boolean default false
premium         boolean default false
created_at      timestamptz default now()
updated_at      timestamptz default now()
```

### `skill_versions` (changelog / history — supports Skill 03)
```sql
id              uuid primary key default gen_random_uuid()
skill_id        uuid references skills(id) on delete cascade
version         text not null
changelog       text
markdown_file   text
zip_file        text
created_at      timestamptz default now()
```

### `video_concepts`
```sql
id                 uuid primary key default gen_random_uuid()
title              text not null
slug               text unique not null
cover              text
description        text
hook               text
niche              text
difficulty         text
expected_rpm_min   numeric
expected_rpm_max   numeric
competition         text        -- 'low' | 'medium' | 'high'
virality_score     int          -- 0-100, editorial estimate
ai_tools_needed    text[]
prompt             text         -- Full Prompt
channel_blueprint  text
video_structure    text
thumbnail_prompt   text
voice_prompt       text
editing_prompt     text
image_prompts      jsonb        -- array of {scene, prompt}
animation_prompt   text
seo_titles         text[]
seo_description    text
seo_tags           text[]
seo_hashtags       text[]
publishing_schedule text
monetization       text
affiliate_ideas    text
resources          jsonb
downloads          int default 0
featured           boolean default false
created_at         timestamptz default now()
updated_at         timestamptz default now()
```

### `blogs`
```sql
id                  uuid primary key default gen_random_uuid()
title               text not null
slug                text unique not null
cover               text
excerpt             text
content             text        -- sanitized markdown
category            text
author_id           uuid references profiles(id)
reading_time_minutes int
published           boolean default false
published_at        timestamptz
views               int default 0
featured            boolean default false
created_at          timestamptz default now()
updated_at          timestamptz default now()
```

### `categories` (polymorphic taxonomy, supports Skill 06)
```sql
id      uuid primary key default gen_random_uuid()
title   text not null
slug    text not null
icon    text
color   text
type    text not null     -- 'prompt' | 'skill' | 'video' | 'blog'
unique (slug, type)
```

## 2. User & Interaction Tables (supports Skills 07–08)

```sql
profiles     (id uuid primary key references auth.users(id), username text
              unique, avatar_url text, role text default 'user',
              created_at timestamptz default now())

bookmarks    (user_id uuid references profiles(id), content_type text,
              content_id uuid, created_at timestamptz default now(),
              primary key (user_id, content_type, content_id))

likes        (user_id uuid references profiles(id), content_type text,
              content_id uuid, created_at timestamptz default now(),
              primary key (user_id, content_type, content_id))

downloads_log(id uuid primary key default gen_random_uuid(), user_id uuid
              references profiles(id), content_type text, content_id uuid,
              format text, created_at timestamptz default now())

view_history (user_id uuid references profiles(id), content_type text,
              content_id uuid, viewed_at timestamptz default now())

comments     (id uuid primary key default gen_random_uuid(), blog_id uuid
              references blogs(id), user_id uuid references profiles(id),
              parent_id uuid references comments(id), body text,
              created_at timestamptz default now(), is_flagged boolean
              default false, is_deleted boolean default false)

collections       (id uuid primary key default gen_random_uuid(),
                    owner_id uuid references profiles(id), title text,
                    slug text unique, description text, cover_image text,
                    is_public boolean default true, is_editorial boolean
                    default false, created_at timestamptz default now())

collection_items  (collection_id uuid references collections(id) on
                    delete cascade, content_type text, content_id uuid,
                    position int, added_at timestamptz default now(),
                    primary key (collection_id, content_type, content_id))

newsletter_subscribers (id uuid primary key default gen_random_uuid(),
                    email text unique not null, subscribed_at timestamptz
                    default now())
```

## 3. Row Level Security — Standard Pattern

Apply to every user-interaction table:
```sql
alter table bookmarks enable row level security;
create policy "own rows only" on bookmarks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```
Content tables (`prompts`, `skills`, `video_concepts`, `blogs`,
`categories`) — public read, write restricted to `role = 'admin'`:
```sql
alter table prompts enable row level security;
create policy "public read" on prompts for select using (true);
create policy "admin write" on prompts for all
  using (exists (select 1 from profiles where id = auth.uid()
                 and role = 'admin'));
```

## 4. Indexes (minimum required for performance)

```sql
create index on prompts (category_id);
create index on prompts using gin (to_tsvector('english', title || ' ' || coalesce(description,'')));
create index on skills (category_id);
create index on video_concepts (niche);
create index on blogs (category);
create index on bookmarks (user_id);
create index on view_history (user_id, viewed_at desc);
```

## 5. Views / Materialized Views

```sql
create materialized view homepage_stats as
select
  (select count(*) from prompts) as total_prompts,
  (select count(*) from skills) as total_skills,
  (select count(*) from video_concepts) as total_videos,
  (select count(*) from blogs where published) as total_blogs;
-- refresh via scheduled Edge Function every 10 minutes
```

## 6. Storage Buckets

```
covers/        public read, admin write   (thumbnails, cover images)
gallery/       public read, admin write
downloads/     signed-url only            (md/zip/pdf/json/txt files —
                                            gate premium content here)
avatars/       public read, owner write
```

## 7. Google AI Studio Build Prompt

```
Set up the Supabase backend for GemiPrompts.store per Skill 09.
Create all tables exactly as specified: prompts, skills, skill_versions,
video_concepts, blogs, categories (polymorphic, unique slug+type),
profiles, bookmarks, likes, downloads_log, view_history, comments,
collections, collection_items, newsletter_subscribers. Use uuid primary
keys with gen_random_uuid(). Enable RLS on every table: content tables get
public-read/admin-write policies; user-interaction tables get
owner-only policies checked against auth.uid(). Add the specified indexes
including a GIN full-text index on prompts. Create the homepage_stats
materialized view and a scheduled Edge Function to refresh it every 10
minutes. Create storage buckets: covers (public read), gallery (public
read), downloads (signed-url only, for premium gating), avatars (public
read, owner write). Generate TypeScript types from this schema for the
frontend `types/` folder.
```

## 8. Acceptance Checklist

- [ ] Every table has RLS enabled — no public table is writable by anon
- [ ] `downloads` storage bucket is NOT publicly listable/readable
- [ ] Full-text search index exists and is used by Skill 06's `search_all`
- [ ] `homepage_stats` view refreshes on schedule, not on every request
- [ ] Generated TS types match this schema exactly (regenerate on any change)
