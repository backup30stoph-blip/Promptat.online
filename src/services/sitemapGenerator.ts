import { SupabaseClient } from '@supabase/supabase-js';

export interface SitemapResult {
  [filename: string]: string;
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
 * Core dynamic sitemap generator.
 * Queries Supabase database tables to build compliant XML sitemaps.
 */
export async function generateAllSitemaps(supabase: SupabaseClient): Promise<SitemapResult> {
  const result: SitemapResult = {};

  // 1. Fetch site settings to get root URL
  let siteUrl = 'https://promptat.online';
  try {
    const { data: settings } = await supabase
      .from('site_settings')
      .select('site_url')
      .eq('id', '00000000-0000-0000-0000-000000000000')
      .maybeSingle();
    
    if (settings?.site_url) {
      siteUrl = settings.site_url.replace(/\/+$/, ''); // Strip trailing slashes
    }
  } catch (err) {
    console.error('[SitemapGenerator] Error loading site settings url:', err);
  }

  // 2. Fetch SEO metadata to identify noindex entries
  const noindexSet = new Set<string>();
  const seoOverrides = new Map<string, { slug?: string; robots?: string; updated_at?: string }>();
  
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
    console.error('[SitemapGenerator] Error querying seo_metadata:', err);
  }

  // 3. Query all content tables
  // 3.1 Pages (site_pages)
  let pagesXml = '';
  let pagesLastmod = '';
  try {
    const { data: pages } = await supabase
      .from('site_pages')
      .select('id, slug, updated_at')
      .order('updated_at', { ascending: false });
    
    if (pages) {
      const urls: string[] = [];
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

        // Skip home slug or admin/search
        if (['index', 'home', 'search', 'admin'].includes(p.slug.toLowerCase())) continue;

        const override = seoOverrides.get(key);
        const slug = override?.slug || p.slug;
        const lastmod = override?.updated_at || p.updated_at;

        if (!pagesLastmod || (lastmod && lastmod > pagesLastmod)) {
          pagesLastmod = lastmod;
        }

        urls.push(`  <url>
    <loc>${siteUrl}/${escapeXml(slug)}</loc>
    <lastmod>${formatDate(lastmod)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
      }
      pagesXml = urls.join('\n');
    }
  } catch (err) {
    console.error('[SitemapGenerator] Error generating pages sitemap:', err);
  }

  // Global images registry for separate images.xml
  const globalImgUrls: string[] = [];

  // 3.2 Blogs (blogs)
  let blogsXml = '';
  let blogsLastmod = '';
  try {
    const { data: blogs } = await supabase
      .from('blogs')
      .select('id, slug, title, cover, updated_at')
      .order('updated_at', { ascending: false });
    
    if (blogs) {
      const urls: string[] = [];
      for (const b of blogs) {
        const key = `blog:${b.id}`;
        if (noindexSet.has(key)) continue;

        const override = seoOverrides.get(key);
        const slug = override?.slug || b.slug;
        const lastmod = override?.updated_at || b.updated_at;

        if (!blogsLastmod || (lastmod && lastmod > blogsLastmod)) {
          blogsLastmod = lastmod;
        }

        let blogEntry = `  <url>
    <loc>${siteUrl}/blog/${escapeXml(slug)}</loc>
    <lastmod>${formatDate(lastmod)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>`;

        if (b.cover) {
          blogEntry += `\n    <image:image>
      <image:loc>${escapeXml(b.cover)}</image:loc>
      <image:title>${escapeXml(b.title || '')}</image:title>
    </image:image>`;

          globalImgUrls.push(`  <url>
    <loc>${siteUrl}/blog/${escapeXml(slug)}</loc>
    <image:image>
      <image:loc>${escapeXml(b.cover)}</image:loc>
      <image:title>${escapeXml(b.title || '')}</image:title>
    </image:image>
  </url>`);
        }

        blogEntry += `\n  </url>`;
        urls.push(blogEntry);
      }
      blogsXml = urls.join('\n');
    }
  } catch (err) {
    console.error('[SitemapGenerator] Error generating blogs sitemap:', err);
  }

  // 3.3 Prompts (prompts)
  let promptsXml = '';
  let promptsLastmod = '';
  let imagesXml = '';
  try {
    const { data: prompts } = await supabase
      .from('prompts')
      .select('id, slug, title, thumbnail, updated_at')
      .order('updated_at', { ascending: false });
    
    if (prompts) {
      const urls: string[] = [];

      for (const p of prompts) {
        const key = `prompt:${p.id}`;
        if (noindexSet.has(key)) continue;

        const override = seoOverrides.get(key);
        const slug = override?.slug || p.slug;
        const lastmod = override?.updated_at || p.updated_at;

        if (!promptsLastmod || (lastmod && lastmod > promptsLastmod)) {
          promptsLastmod = lastmod;
        }

        // Standard sitemap entry
        let promptEntry = `  <url>
    <loc>${siteUrl}/prompts/${escapeXml(slug)}</loc>
    <lastmod>${formatDate(lastmod)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>`;

        // If sitemap requests image inclusion and prompt has a thumbnail
        if (p.thumbnail) {
          promptEntry += `\n    <image:image>
      <image:loc>${escapeXml(p.thumbnail)}</image:loc>
      <image:title>${escapeXml(p.title)}</image:title>
    </image:image>`;

          // For separate images.xml sitemap
          globalImgUrls.push(`  <url>
    <loc>${siteUrl}/prompts/${escapeXml(slug)}</loc>
    <image:image>
      <image:loc>${escapeXml(p.thumbnail)}</image:loc>
      <image:title>${escapeXml(p.title)}</image:title>
    </image:image>
  </url>`);
        }

        promptEntry += `\n  </url>`;
        urls.push(promptEntry);
      }
      promptsXml = urls.join('\n');
    }
  } catch (err) {
    console.error('[SitemapGenerator] Error generating prompts sitemap:', err);
  }

  // 3.4 Skills (skills)
  let skillsXml = '';
  let skillsLastmod = '';
  try {
    const { data: skills } = await supabase
      .from('skills')
      .select('id, slug, title, cover, updated_at')
      .order('updated_at', { ascending: false });
    
    if (skills) {
      const urls: string[] = [];
      for (const s of skills) {
        const key = `skill:${s.id}`;
        if (noindexSet.has(key)) continue;

        const override = seoOverrides.get(key);
        const slug = override?.slug || s.slug;
        const lastmod = override?.updated_at || s.updated_at;

        if (!skillsLastmod || (lastmod && lastmod > skillsLastmod)) {
          skillsLastmod = lastmod;
        }

        let skillEntry = `  <url>
    <loc>${siteUrl}/skills/${escapeXml(slug)}</loc>
    <lastmod>${formatDate(lastmod)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>`;

        if (s.cover) {
          skillEntry += `\n    <image:image>
      <image:loc>${escapeXml(s.cover)}</image:loc>
      <image:title>${escapeXml(s.title || '')}</image:title>
    </image:image>`;

          globalImgUrls.push(`  <url>
    <loc>${siteUrl}/skills/${escapeXml(slug)}</loc>
    <image:image>
      <image:loc>${escapeXml(s.cover)}</image:loc>
      <image:title>${escapeXml(s.title || '')}</image:title>
    </image:image>
  </url>`);
        }

        skillEntry += `\n  </url>`;
        urls.push(skillEntry);
      }
      skillsXml = urls.join('\n');
    }
  } catch (err) {
    console.error('[SitemapGenerator] Error generating skills sitemap:', err);
  }

  imagesXml = globalImgUrls.join('\n');

  // 3.5 Video Concepts (video_concepts)
  let videosXml = '';
  let videosLastmod = '';
  try {
    const { data: videos } = await supabase
      .from('video_concepts')
      .select('id, slug, updated_at')
      .order('updated_at', { ascending: false });
    
    if (videos) {
      const urls: string[] = [];
      for (const v of videos) {
        const key = `video:${v.id}`;
        if (noindexSet.has(key)) continue;

        const override = seoOverrides.get(key);
        const slug = override?.slug || v.slug;
        const lastmod = override?.updated_at || v.updated_at;

        if (!videosLastmod || (lastmod && lastmod > videosLastmod)) {
          videosLastmod = lastmod;
        }

        urls.push(`  <url>
    <loc>${siteUrl}/videos/${escapeXml(slug)}</loc>
    <lastmod>${formatDate(lastmod)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
      }
      videosXml = urls.join('\n');
    }
  } catch (err) {
    console.error('[SitemapGenerator] Error generating videos sitemap:', err);
  }

  // 3.6 Categories (categories)
  let categoriesXml = '';
  let categoriesLastmod = '';
  try {
    const { data: categories } = await supabase
      .from('categories')
      .select('id, slug, type, created_at')
      .order('created_at', { ascending: false });
    
    if (categories) {
      const urls: string[] = [];
      for (const cat of categories) {
        const key = `category:${cat.id}`;
        if (noindexSet.has(key)) continue;

        const override = seoOverrides.get(key);
        const slug = override?.slug || cat.slug;
        const lastmod = override?.updated_at || cat.created_at;

        if (!categoriesLastmod || (lastmod && lastmod > categoriesLastmod)) {
          categoriesLastmod = lastmod;
        }

        urls.push(`  <url>
    <loc>${siteUrl}/categories/${escapeXml(cat.type.toLowerCase())}/${escapeXml(slug)}</loc>
    <lastmod>${formatDate(lastmod)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`);
      }
      categoriesXml = urls.join('\n');
    }
  } catch (err) {
    console.error('[SitemapGenerator] Error generating categories sitemap:', err);
  }

  // 4. Generate wrapped XML content for each child sitemap
  const header = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">`;
  const footer = `</urlset>`;

  result['pages.xml'] = `${header}\n${pagesXml || `  <url><loc>${siteUrl}/</loc><priority>1.0</priority></url>`}\n${footer}`;
  result['blogs.xml'] = `${header}\n${blogsXml || `  <!-- No blog entries -->`}\n${footer}`;
  result['prompts.xml'] = `${header}\n${promptsXml || `  <!-- No prompt entries -->`}\n${footer}`;
  result['skills.xml'] = `${header}\n${skillsXml || `  <!-- No skill entries -->`}\n${footer}`;
  result['videos.xml'] = `${header}\n${videosXml || `  <!-- No video concepts -->`}\n${footer}`;
  result['categories.xml'] = `${header}\n${categoriesXml || `  <!-- No category entries -->`}\n${footer}`;
  result['images.xml'] = `${header}\n${imagesXml || `  <!-- No image entries -->`}\n${footer}`;

  // Duplicate for sitemap-* formats to be 100% compliant with both styles
  result['sitemap-pages.xml'] = result['pages.xml'];
  result['sitemap-blog.xml'] = result['blogs.xml'];
  result['sitemap-prompts.xml'] = result['prompts.xml'];
  result['sitemap-skills.xml'] = result['skills.xml'];
  result['sitemap-videos.xml'] = result['videos.xml'];
  result['sitemap-categories.xml'] = result['categories.xml'];

  // 5. Generate Master sitemap.xml Sitemap Index File
  const indexHeader = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
  const indexFooter = `</sitemapindex>`;

  const defaultDate = formatDate(new Date());
  
  result['sitemap.xml'] = `${indexHeader}
  <sitemap>
    <loc>${siteUrl}/pages.xml</loc>
    <lastmod>${formatDate(pagesLastmod || defaultDate)}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${siteUrl}/prompts.xml</loc>
    <lastmod>${formatDate(promptsLastmod || defaultDate)}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${siteUrl}/skills.xml</loc>
    <lastmod>${formatDate(skillsLastmod || defaultDate)}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${siteUrl}/videos.xml</loc>
    <lastmod>${formatDate(videosLastmod || defaultDate)}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${siteUrl}/blogs.xml</loc>
    <lastmod>${formatDate(blogsLastmod || defaultDate)}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${siteUrl}/categories.xml</loc>
    <lastmod>${formatDate(categoriesLastmod || defaultDate)}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${siteUrl}/images.xml</loc>
    <lastmod>${formatDate(promptsLastmod || defaultDate)}</lastmod>
  </sitemap>
${indexFooter}`;

  return result;
}
