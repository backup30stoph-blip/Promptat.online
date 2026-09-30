# Skill 11 — Storage, Media Upload & File Downloads
## GemiPrompts.store — aligned to `Full_SQL_SO9SKILL_V3`

> Requires Skill 00. This supersedes the storage section of Skill 09 —
> use the real table names from your uploaded schema: `media_library`,
> `prompts.thumbnail/gallery`, `skills.markdown_file/zip_file/pdf_file/
> json_file`, `video_concepts.cover`, `blogs.cover`, `seo_metadata`.

---

## 1. Storage Buckets

```
covers/       public read   — prompts.thumbnail, skills.cover,
                               video_concepts.cover, blogs.cover
gallery/      public read   — prompts.gallery[] (multiple images per prompt)
downloads/    signed-url    — skills.zip_file / pdf_file / json_file,
                               video_concepts ZIP/Canva bundles
                               (markdown_file for premium skills too —
                               free skills' markdown can be public)
avatars/      public read, owner-write — profiles.avatar_url
```

Rule: **never store a `downloads/` path directly in a public column** —
always resolve it to a short-lived signed URL at render time so premium
gating actually works (a public bucket path is a permanent bypass).

---

## 2. Profit-Max Image Upload Pipeline (Direct Client-Side Processing)

Instead of routing uploads through expensive, slow backend middleware or invoking remote server-side Edge Functions, the client-side application connects directly to the Supabase Storage SDK.

### The "Profit Max" client-side optimization pipeline:
1. **In-Browser Compression & Transcoding**: The client processes selected image files on an offscreen HTML5 `<canvas>`. It automatically transcodes large PNGs/JPEGs into optimized WebP formats (or optimized JPEGs at `0.82` quality), and resizes files exceeding a threshold (e.g., max-width of 1600px).
   - This reduces file sizes by **up to 90%** (e.g., a 6MB raw smartphone photo becomes a 180KB ultra-crisp web asset).
   - **Profit Max Impact**: Drastically minimizes Supabase storage usage, reduces client upload latency, and eliminates high CDN bandwidth egress costs.
2. **Zero-Cost Metadata Extraction**: The client reads the image's width and height, and renders the image onto a 1x1 pixel canvas to extract the **average dominant color** (expressed as a HEX code) before uploading.
3. **Direct Supabase Bucket Upload**: The client directly uploads the compressed Blob to the designated bucket using the client-side Supabase Storage SDK.
4. **Atomic Media Library Insertion**: Upon successful bucket upload, the client writes the complete entry to the `media_library` table, securing instant retrieval and cross-content reusability.

```sql
media_library (
  id, name, original_name, file_name, slug,
  caption, alt_text, title, description,
  mime_type, extension, width, height, size,
  storage_path, public_url, thumbnail_url,
  dominant_color, blurhash,
  uploaded_by, created_at
)
```

---

## 3. Client-Side Image Compression & Optimization Implementation

Here is the helper function to perform client-side canvas-based image compression and dominant color extraction:

```typescript
export interface CompressedAsset {
  blob: Blob;
  width: number;
  height: number;
  dominantColor: string;
}

/**
 * Compresses an image client-side to maximize bandwidth savings (Profit Max),
 * resizes it if it exceeds maximum bounds, and extracts dominant colors.
 */
export async function optimizeAndCompressImage(
  file: File, 
  maxWidth = 1600, 
  quality = 0.82
): Promise<CompressedAsset> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image'));
      return;
    }

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      // Calculate optimized dimensions
      let width = img.naturalWidth;
      let height = img.naturalHeight;
      
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to create canvas context'));
        return;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // Extract Dominant Color (1x1 average downscale)
      const colorCanvas = document.createElement('canvas');
      const colorCtx = colorCanvas.getContext('2d');
      let dominantColor = '#f1f5f9';
      if (colorCtx) {
        colorCanvas.width = 1;
        colorCanvas.height = 1;
        colorCtx.drawImage(canvas, 0, 0, 1, 1);
        const [r, g, b] = colorCtx.getImageData(0, 0, 1, 1).data;
        dominantColor = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
      }

      // Convert Canvas to Blob (WebP preferred, fallback to JPEG for universal support)
      const mimeType = file.type === 'image/gif' ? 'image/gif' : 'image/webp';
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image onto canvas'));
            return;
          }
          URL.revokeObjectURL(img.src);
          resolve({
            blob,
            width,
            height,
            dominantColor
          });
        },
        mimeType,
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image for optimization'));
    };
  });
}
```

---

## 4. Admin Upload Component (with live preview)

```
<MediaUploader />
  - Drag-and-drop zone + file picker
  - On file select: show local object-URL preview instantly (before upload completes)
  - Run the Client-Side Image Compression & Optimization Helper
  - Show upload progress bar per file
  - On upload success: replace local preview with the real optimized `thumbnail_url`
  - Inline Metadata Form:
      Alt text * (required, blocks save if empty)
      Title *
      Caption (optional)
      Description (optional)
  - Grid of already-uploaded media (Media Library browser) with search/filter by mime_type, so admins can reuse an existing image instead of re-uploading (avoid duplicate storage bloat).
  - "Insert" button attaches the chosen media_library row's public_url/id into the current content form field (thumbnail, cover, or gallery[]).
```

- Gallery fields (`prompts.gallery`) use a **multi-select** version of the same picker — reorderable thumbnail strip, drag to reorder, click to remove.
- Cover/thumbnail fields use a **single-select** version with a bigger preview and a "Replace" action.

---

## 5. Front-End Image Display

### Card thumbnails (grids on `/prompts`, `/skills`, `/videos`, `/blog`)
```tsx
<ImageWithPlaceholder
  src={thumbnail_url ?? public_url}
  dominantColor={dominant_color}
  alt={alt_text}
  width={width}
  height={height}
  loading="lazy"
/>
```
- Render the fallback `dominant_color` as a solid background or light gradient box **before** the real image loads — this completely eliminates layout shift (CLS) and gives a Pinterest-style progressive reveal.
- Always pass explicit `width`/`height` from `media_library` so the browser reserves space immediately.

### Cover images (skills/videos/blogs)
- Single hero image, same placeholder pattern, `object-cover` with a fixed aspect ratio container (e.g. 16:9) so cards stay grid-aligned regardless of the source image's native ratio.

---

## 6. Downloadable Files (txt / md / zip / pdf / json)

### Client-generated (no storage needed)
- **TXT / MD for Prompts**: generated on the fly from the `prompts` row (`prompt`, `negative_prompt`, `parameters`) using a Blob + `URL.createObjectURL()` — never pre-stored, always reflects the latest edited content.

### Storage-backed (pre-uploaded by admin)
- **Skills**: `markdown_file`, `zip_file`, `pdf_file`, `json_file` are real files uploaded once via the admin skill-editor, stored in `downloads/`, referenced by storage path in the `skills` row.
- **Video Concepts**: ZIP bundles, Canva asset links, script files — same pattern, stored in `downloads/`.

### Serving downloads (gating logic)
```
1. User clicks a download button.
2. Client calls secure download handler / API route or Supabase RPC function.
3. Check entitlement: If skills.premium = true -> verify user entitlement (purchase/unlock record) before issuing a signed URL; if false -> issue signed URL immediately (short TTL, e.g. 5 min, enough for download).
4. Log the event into `downloads_log` (see Skill 09) and increment the content row's `downloads` counter atomically.
5. Client redirects browser to the signed URL.
```
- Never expose a public, permanent URL to a `downloads/` bucket object in the API response for premium content — only ever a time-limited signed URL, generated per-request.

---

## 7. RLS for Storage

```sql
-- covers/ + gallery/ + avatars/: public read
create policy "public read covers" on storage.objects
  for select using (bucket_id = 'covers');

-- downloads/: no public select policy at all — access is exclusively
-- via signed URLs minted server-side or via security rules checked RPC functions.

-- uploads (covers/gallery/avatars/downloads): admin or owning user only
create policy "admin write" on storage.objects
  for insert with check (
    bucket_id in ('covers','gallery','downloads')
    and exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
create policy "owner write avatar" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
```

---

## 8. Google AI Studio Build Prompt

```
Implement Storage, Media Upload & Downloads for GemiPrompts.store per Skill 11, using the exact schema from Full_SQL_SO9SKILL_V3: media_library table (name, original_name, file_name, slug, caption, alt_text, title, description, mime_type, extension, width, height, size, storage_path, public_url, thumbnail_url, dominant_color, blurhash, uploaded_by).
Buckets: covers (public read), gallery (public read), downloads (signed-url only, no public select policy), avatars (public read, owner-write).

In-browser compression:
Build a client-side image compression and processing script using HTML5 Canvas that automatically transcodes oversized images to WebP/optimized JPEG (max width 1600px, quality 0.82) to maximize storage and egress bandwidth savings ('Profit Max' model). Extract average dominant hex color and resolution (width/height) entirely on the client before upload to save server costs.

Build a MediaUploader admin component: drag-and-drop with instant local object-URL preview, per-file compression and upload status, uploading directly to the connected Supabase storage bucket from the front-end, then writing metadata straight to the media_library table. Require alt_text and title before an asset can be attached to content. Add a reusable Media Library browser (search/filter by mime_type) so admins can reuse existing uploads.

Build an ImageWithPlaceholder component used on every card and detail page: renders dominant_color as a visual loading placeholder with explicit width/height to prevent layout shift, lazy loading.

Implement downloads: prompts TXT/MD generated client-side via Blob from the live row data; skills/video_concepts files (markdown_file, zip_file, pdf_file, json_file) served only via a get-download-url utility checking premium entitlement and returning short-TTL signed URLs. Apply RLS policies from Skill 11.
```

---

## 9. Acceptance Checklist

- [ ] Every uploaded image is compressed and optimized on the client-side before upload to save hosting bandwidth ("Profit Max").
- [ ] Width, height, and dominant hex color are extracted on the client-side via canvas rendering and saved to the `media_library` database table.
- [ ] Admin sees an instant local preview on file select, before upload finishes.
- [ ] `alt_text` and `title` are enforced as required before attach.
- [ ] All front-end images use `dominant_color` placeholders with explicit width/height (zero CLS).
- [ ] `downloads/` bucket has no public select policy — only signed URLs, minted per-request, TTL-limited.
- [ ] Premium skill/video downloads verify entitlement before signing.
- [ ] Every download increments the correct counter and logs to `downloads_log`.
- [ ] Prompt TXT/MD downloads always reflect the current row content (never a stale pre-generated file).
