import { SupabaseClient } from '@supabase/supabase-js';

export interface SitemapConfig {
  siteUrl: string;
}

function formatDate(dateStr?: string | Date | null): string {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  try {
    return new Date(dateStr).toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * Dynamically generates a valid XML sitemap based on new clean plural URL paths.
 * Fetches all published content from Supabase.
 */
export async function generateSitemap(supabase: SupabaseClient, config: SitemapConfig = { siteUrl: 'https://promptat.online' }) {
  const siteUrl = config.siteUrl.replace(/\/+$/, '');
  const noindexSet = new Set<string>();
  const seoOverrides = new Map<string, { slug?: string; robots?: string; updated_at?: string }>();

  // 1. Fetch SEO metadata to identify noindex entries
  try {
    const { data: seoMetadata } = await supabase
      .from('seo_metadata')
      .select('entity_type, entity_id, slug, robots, updated_at');
    
    if (seoMetadata) {
      for (const row of seoMetadata) {
        const key = `${row.entity_type}:${row.entity_id}`;
        seoOverrides.set(key, {
          slug: row.slug,
          robots: row.robots,
          updated_at: row.updated_at
        });

        if (row.robots && row.robots.toLowerCase().includes('noindex')) {
          noindexSet.add(key);
        }
      }
    }
  } catch (err) {
    console.error('[GenerateSitemap] Error querying seo_metadata:', err);
  }

  const urls: string[] = [];

  // 2. Fetch pages (excluding index/home, search, admin, login)
  try {
    const { data: pages } = await supabase
      .from('site_pages')
      .select('id, slug, updated_at')
      .order('updated_at', { ascending: false });

    if (pages) {
      // Add home page
      urls.push(`  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${formatDate(pages[0]?.updated_at)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`);

      for (const p of pages) {
        const key = `page:${p.id}`;
        if (noindexSet.has(key)) continue;
        if (['index', 'home', 'search', 'admin', 'login'].includes(p.slug.toLowerCase())) continue;

        const override = seoOverrides.get(key);
        const slug = override?.slug || p.slug;
        const lastmod = override?.updated_at || p.updated_at;

        urls.push(`  <url>
    <loc>${siteUrl}/${escapeXml(slug)}</loc>
    <lastmod>${formatDate(lastmod)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
      }
    }
  } catch (err) {
    console.error('[GenerateSitemap] Error processing pages:', err);
  }

  // 3. Fetch prompts
  try {
    const { data: prompts } = await supabase
      .from('prompts')
      .select('id, slug, updated_at')
      .order('updated_at', { ascending: false });

    if (prompts) {
      for (const p of prompts) {
        const key = `prompt:${p.id}`;
        if (noindexSet.has(key)) continue;

        const override = seoOverrides.get(key);
        const slug = override?.slug || p.slug;
        const lastmod = override?.updated_at || p.updated_at;

        urls.push(`  <url>
    <loc>${siteUrl}/prompts/${escapeXml(slug)}</loc>
    <lastmod>${formatDate(lastmod)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`);
      }
    }
  } catch (err) {
    console.error('[GenerateSitemap] Error processing prompts:', err);
  }

  // 4. Fetch skills
  try {
    const { data: skills } = await supabase
      .from('skills')
      .select('id, slug, updated_at')
      .order('updated_at', { ascending: false });

    if (skills) {
      for (const s of skills) {
        const key = `skill:${s.id}`;
        if (noindexSet.has(key)) continue;

        const override = seoOverrides.get(key);
        const slug = override?.slug || s.slug;
        const lastmod = override?.updated_at || s.updated_at;

        urls.push(`  <url>
    <loc>${siteUrl}/skills/${escapeXml(slug)}</loc>
    <lastmod>${formatDate(lastmod)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
      }
    }
  } catch (err) {
    console.error('[GenerateSitemap] Error processing skills:', err);
  }

  // 5. Fetch videos
  try {
    const { data: videos } = await supabase
      .from('video_concepts')
      .select('id, slug, updated_at')
      .order('updated_at', { ascending: false });

    if (videos) {
      for (const v of videos) {
        const key = `video:${v.id}`;
        if (noindexSet.has(key)) continue;

        const override = seoOverrides.get(key);
        const slug = override?.slug || v.slug;
        const lastmod = override?.updated_at || v.updated_at;

        urls.push(`  <url>
    <loc>${siteUrl}/videos/${escapeXml(slug)}</loc>
    <lastmod>${formatDate(lastmod)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
      }
    }
  } catch (err) {
    console.error('[GenerateSitemap] Error processing videos:', err);
  }

  // 6. Fetch blog posts
  try {
    const { data: blogs } = await supabase
      .from('blogs')
      .select('id, slug, updated_at')
      .order('updated_at', { ascending: false });

    if (blogs) {
      for (const b of blogs) {
        const key = `blog:${b.id}`;
        if (noindexSet.has(key)) continue;

        const override = seoOverrides.get(key);
        const slug = override?.slug || b.slug;
        const lastmod = override?.updated_at || b.updated_at;

        urls.push(`  <url>
    <loc>${siteUrl}/blog/${escapeXml(slug)}</loc>
    <lastmod>${formatDate(lastmod)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
      }
    }
  } catch (err) {
    console.error('[GenerateSitemap] Error processing blogs:', err);
  }

  // Generate wrapped valid XML sitemap
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
}
