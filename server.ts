import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import { generateAllSitemaps } from './src/services/sitemapGenerator';

// Initialize Supabase Client
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://xfqlffxpbginaxbrxnvm.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_oEaGX5Y7HP0TRYS1gJD53A_VwmLuYvI';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 1. Serving dynamic robots.txt from public.site_settings
  app.get('/robots.txt', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('robots_content')
        .eq('id', '00000000-0000-0000-0000-000000000000')
        .single();

      if (error || !data) {
        throw new Error(error?.message || 'No configurations found');
      }

      res.type('text/plain');
      res.send(data.robots_content || 'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /account/\nDisallow: /search\nDisallow: /login\nSitemap: https://promptat.online/sitemap.xml');
    } catch (err: any) {
      console.error('robots.txt dynamic server error:', err.message);
      res.type('text/plain');
      res.send('User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /account/\nDisallow: /search\nDisallow: /login\nSitemap: https://promptat.online/sitemap.xml');
    }
  });

  // 1b. Serve dynamic rss.xml feed of blog posts
  app.get('/rss.xml', async (req, res) => {
    try {
      const { data: blogs, error } = await supabase
        .from('blogs')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(20);

      if (error) {
        throw error;
      }

      let rssItems = '';
      if (blogs && blogs.length > 0) {
        rssItems = blogs.map(blog => {
          const pubDate = new Date(blog.published_at || blog.created_at).toUTCString();
          const link = `https://promptat.online/blog/${blog.slug}`;
          const cleanExcerpt = (blog.excerpt || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
          const cleanTitle = (blog.title || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
          return `
    <item>
      <title>${cleanTitle}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <description>${cleanExcerpt}</description>
      <pubDate>${pubDate}</pubDate>
    </item>`;
        }).join('');
      }

      const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Promptat Online Blog Feed</title>
  <link>https://promptat.online</link>
  <description>برومبتات أونلاين - المكتبة الشاملة لأوامر ومخططات الذكاء الاصطناعي العربية والعالمية.</description>
  <language>ar</language>
  <atom:link href="https://promptat.online/rss.xml" rel="self" type="application/rss+xml" />
  ${rssItems}
</channel>
</rss>`;

      res.type('application/xml');
      res.send(rssXml);
    } catch (err: any) {
      console.error('Error generating rss.xml:', err.message);
      res.status(500).send('Internal Server Error');
    }
  });

  // 2. Redirection Engine Middleware
  app.use(async (req, res, next) => {
    // Ignore assets, static, API routes, or hot reloads
    const pathName = req.path;
    if (
      pathName.startsWith('/api') ||
      pathName.includes('.') ||
      pathName.startsWith('/@vite') ||
      pathName.startsWith('/src') ||
      pathName.startsWith('/node_modules')
    ) {
      return next();
    }

    try {
      // Query active redirects where old_url equals the current path
      const { data: redirect, error } = await supabase
        .from('redirects')
        .select('*')
        .eq('old_url', pathName)
        .eq('enabled', true)
        .limit(1)
        .maybeSingle();

      if (redirect && !error) {
        // Increment hits and last_used in background
        supabase
          .from('redirects')
          .update({
            hits: (redirect.hits || 0) + 1,
            last_used: new Date().toISOString()
          })
          .eq('id', redirect.id)
          .then(({ error: updateErr }) => {
            if (updateErr) console.error('Failed to increment redirect hits:', updateErr.message);
          });

        const code = Number(redirect.type) || 301;
        return res.redirect(code, redirect.new_url);
      }
    } catch (err: any) {
      console.error('Redirection lookup failed:', err.message);
    }
    next();
  });

  // 3. API endpoints
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Dynamic Sitemap XML Serving Routes
  const sitemapFiles = [
    'sitemap.xml',
    'pages.xml',
    'blogs.xml',
    'prompts.xml',
    'skills.xml',
    'videos.xml',
    'categories.xml',
    'images.xml',
    'sitemap-pages.xml',
    'sitemap-blog.xml',
    'sitemap-prompts.xml',
    'sitemap-skills.xml',
    'sitemap-videos.xml',
    'sitemap-categories.xml'
  ];

  sitemapFiles.forEach(file => {
    app.get(`/${file}`, async (req, res) => {
      try {
        const sitemaps = await generateAllSitemaps(supabase);
        const xml = sitemaps[file];
        if (xml) {
          res.type('application/xml');
          return res.send(xml);
        }
        res.status(404).send('Not Found');
      } catch (err: any) {
        console.error(`Error serving sitemap ${file}:`, err.message);
        res.status(500).send('Internal Server Error');
      }
    });
  });

  // Sitemap manual trigger generator & filesystem exporter endpoint
  app.post('/api/sitemap/generate', async (req, res) => {
    try {
      const sitemaps = await generateAllSitemaps(supabase);
      
      // Ensure the public directory exists
      const publicPath = path.join(process.cwd(), 'public');
      if (!fs.existsSync(publicPath)) {
        fs.mkdirSync(publicPath, { recursive: true });
      }

      // Write sitemaps to public directory
      for (const [filename, xml] of Object.entries(sitemaps)) {
        fs.writeFileSync(path.join(publicPath, filename), xml, 'utf8');
      }

      // If dist directory exists (compiled production environment), write them there as well so they serve statically instantly
      const distPath = path.join(process.cwd(), 'dist');
      if (fs.existsSync(distPath)) {
        for (const [filename, xml] of Object.entries(sitemaps)) {
          try {
            fs.writeFileSync(path.join(distPath, filename), xml, 'utf8');
          } catch (writeErr: any) {
            console.warn(`Could not write to dist file ${filename}:`, writeErr.message);
          }
        }
      }

      res.json({ success: true, message: 'Sitemaps successfully regenerated and exported to public directory!' });
    } catch (err: any) {
      console.error('Error generating sitemaps:', err.message);
      res.status(500).json({ error: err.message || 'Failed to generate sitemaps.' });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
  }

  // SPA fallback for valid frontend routes (so they return 200 OK instead of triggering 404 logs)
  const validRoutePrefixes = [
    '/prompts',
    '/skills',
    '/videos',
    '/blog',
    '/search',
    '/login',
    '/admin',
    '/categories',
    '/collections',
    '/auth',
    '/account',
    '/u'
  ];

  app.get(['/', ...validRoutePrefixes.map(p => `${p}*`)], (req, res, next) => {
    // Exclude API, static assets, and other system routes
    const pathName = req.path;
    if (
      pathName.startsWith('/api') ||
      pathName.includes('.') ||
      pathName.startsWith('/@vite') ||
      pathName.startsWith('/src') ||
      pathName.startsWith('/node_modules')
    ) {
      return next();
    }

    if (process.env.NODE_ENV !== 'production') {
      // In development, let Vite middleware handle it (which serves index.html with 200 OK)
      return next();
    } else {
      // In production, serve the compiled index.html with a 200 status
      const distPath = path.join(process.cwd(), 'dist');
      return res.sendFile(path.join(distPath, 'index.html'));
    }
  });

  // 4. Custom 404 Telemetry Logging
  // This executes if no router, static asset, or Vite page handles the route
  app.use(async (req, res, next) => {
    const url = req.originalUrl || req.url;

    // Ignore asset files or hot reloads
    if (
      url.includes('.') ||
      url.startsWith('/@vite') ||
      url.startsWith('/src') ||
      url.startsWith('/api') ||
      url.startsWith('/node_modules')
    ) {
      return res.status(404).send('Not Found');
    }

    try {
      const referer = req.headers.referer || req.headers.referrer || 'Direct';
      const userAgent = req.headers['user-agent'] || 'Unknown';

      // Check if URL is already logged in 404_logs and not_found_logs
      const { data: existingLog, error: fetchErr } = await supabase
        .from('404_logs')
        .select('*')
        .eq('url', url)
        .limit(1)
        .maybeSingle();

      if (existingLog && !fetchErr) {
        // Update hits in 404_logs
        await supabase
          .from('404_logs')
          .update({
            hits: (existingLog.hits || 0) + 1,
            last_seen: new Date().toISOString(),
            referer: referer as string,
            user_agent: userAgent as string
          })
          .eq('id', existingLog.id);
      } else {
        // Create new log entry in 404_logs
        await supabase
          .from('404_logs')
          .insert({
            url,
            referer: referer as string,
            user_agent: userAgent as string,
            hits: 1,
            last_seen: new Date().toISOString()
          });
      }

      // Sync to the new not_found_logs table
      try {
        const { data: existingNf, error: nfFetchErr } = await supabase
          .from('not_found_logs')
          .select('*')
          .eq('url', url)
          .limit(1)
          .maybeSingle();

        if (existingNf && !nfFetchErr) {
          await supabase
            .from('not_found_logs')
            .update({
              hits: (existingNf.hits || 0) + 1,
              last_seen: new Date().toISOString(),
              referer: referer as string,
              user_agent: userAgent as string
            })
            .eq('id', existingNf.id);
        } else {
          await supabase
            .from('not_found_logs')
            .insert({
              url,
              referer: referer as string,
              user_agent: userAgent as string,
              hits: 1,
              last_seen: new Date().toISOString()
            });
        }
      } catch (nfErr: any) {
        console.warn('Silent fallback for not_found_logs insert:', nfErr.message);
      }
    } catch (err: any) {
      console.error('Error recording 404 log:', err.message);
    }

    // Serve index.html so the React Router handles rendering of missing routes client-side
    if (process.env.NODE_ENV !== 'production') {
      return res.status(404).send(`404 - Not Found. Recorded URL: ${url}`);
    } else {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    }
  });

  // Automated background sitemap generation scheduler
  async function triggerAutomatedSitemap() {
    try {
      const { data: settings } = await supabase
        .from('site_settings')
        .select('auto_sitemap')
        .limit(1)
        .maybeSingle();

      const isEnabled = settings ? settings.auto_sitemap : true;
      if (!isEnabled) {
        console.log('[Sitemap Automation] Auto-generation is currently disabled in site_settings.');
        return;
      }

      console.log('[Sitemap Automation] Initiating periodic automated sitemap generation...');
      const sitemaps = await generateAllSitemaps(supabase);
      
      const publicPath = path.join(process.cwd(), 'public');
      if (!fs.existsSync(publicPath)) {
        fs.mkdirSync(publicPath, { recursive: true });
      }

      for (const [filename, xml] of Object.entries(sitemaps)) {
        fs.writeFileSync(path.join(publicPath, filename), xml, 'utf8');
      }

      const distPath = path.join(process.cwd(), 'dist');
      if (fs.existsSync(distPath)) {
        for (const [filename, xml] of Object.entries(sitemaps)) {
          try {
            fs.writeFileSync(path.join(distPath, filename), xml, 'utf8');
          } catch (e: any) {
            // Safe to ignore if dist is clean
          }
        }
      }
      console.log('[Sitemap Automation] Periodically generated sitemaps synchronized successfully.');
    } catch (err: any) {
      console.error('[Sitemap Automation] Background generator encountered an error:', err.message);
    }
  }

  // Trigger initial background generation on boot, then every 12 hours
  setTimeout(() => {
    triggerAutomatedSitemap();
  }, 5000);

  setInterval(() => {
    triggerAutomatedSitemap();
  }, 12 * 60 * 60 * 1000);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://localhost:${PORT} [ENV: ${process.env.NODE_ENV || 'development'}]`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
