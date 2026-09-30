---
name: site-settings
description: Master skill governing enterprise Site Settings, SEO Search Engines, Analytics, GTM, Robots, Sitemaps, and Redirect management.
always_load: true
---

# Site Settings & Search Engine Management Master Skill

This skill governs global site behavior, verification meta injections, search engine listings, tag manager execution, redirects, sitemaps, robots.txt, performance audits, and webmaster configurations.

## Core Directives

1. **Always Load**: This skill applies globally. Any change in routes, slugs, or database structures requires validating SEO, site configuration, and sitemaps.
2. **Metadata Optimization**: Enforce tight character caps (Titles <= 60 chars, Meta Descriptions <= 160 chars) to prevent search console truncation.
3. **Database Syncing**: Always ensure the `public.site_settings` table, `public.redirects` table, and `public.404_logs` table are fully functional and secure.
4. **No Placeholders**: Render fully interactive, responsive components. Use proper light-theme styling matching professional SaaS dashboard structures.
