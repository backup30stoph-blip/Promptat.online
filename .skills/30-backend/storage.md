# Storage Buckets & Media Guidance
## GemiPrompts.store — Supabase Storage & Media Galleries

> Part of the 30-backend module. Outlines media buckets, compression ratios, and signed URL premium gates.

---

## 1. Bucket Schemas

All assets uploaded to the GemiPrompts platform are separated into four distinct buckets:

| Bucket Name | Access Level | Description |
|---|---|---|
| `covers/` | Public Read | Catalog card headers, blog cover banners, video thumbnails |
| `gallery/` | Public Read | Prompt search lightboxes, output render preview grids |
| `avatars/` | Public Read | Profile pictures, custom community user avatars |
| `downloads/` | Signed-URL Only | Markdown files, zip codes, project PDFs, schema configurations |

---

## 2. Premium Gates & Signed URLs

- Files stored under the `downloads/` bucket are strictly private. 
- The client must fetch transient signed URLs (`supabase.storage.from('downloads').createSignedUrl(path, 60)`) only after verifying payment authorization or account subscription credits.
- Do not expose permanent direct public URLs for premium files.

---

## 3. Image Optimization & CDNs

- **Transforms:** When querying cover images or thumbnails, append transform parameters to compress size payloads (e.g. format to WebP, restrict width limits: `width=400&height=400&resize=contain`).
- **Aspect Wrappers:** All images must have an aspect-ratio container wrapper rendering on load to eliminate visual shift layouts (CLS).
