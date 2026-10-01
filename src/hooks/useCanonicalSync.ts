import { useEffect } from 'react';
import { useActiveLanguage } from './useActiveLanguage';
import { parseLanguagePath, buildLocalizedPath, generateHreflangs, LanguageCode } from '../lib/i18n';

/**
 * useCanonicalSync Hook:
 * Dynamically injects & updates the meta link 'canonical' and link 'hreflang' tags
 * into the document head when switching languages or navigating pages.
 * Ensures search engines identify correct localized variations for crawl indexation.
 */
export function useCanonicalSync(translatedSlugs?: Partial<Record<LanguageCode, string>>) {
  const activeLang = useActiveLanguage();
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const baseSiteUrl = 'https://promptat.online';
    const { basePath } = parseLanguagePath(pathname);
    
    // 1. Resolve localized canonical URL path
    const localizedPath = buildLocalizedPath(basePath, activeLang);
    const fullCanonicalUrl = `${baseSiteUrl}${localizedPath}`;

    // 2. Set/Update Canonical Link Tag
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', fullCanonicalUrl);

    // 3. Set/Update Multi-lingual Hreflang Link Tags
    // First, remove existing hreflang tags to prevent duplicate accumulation
    const oldHreflangs = document.querySelectorAll('link[rel="alternate"][hreflang]');
    oldHreflangs.forEach(el => el.remove());

    // Generate fresh hreflangs
    const hreflangEntries = generateHreflangs(basePath, baseSiteUrl, ['ar', 'en', 'es', 'fr', 'id'], translatedSlugs);
    
    hreflangEntries.forEach(entry => {
      const linkEl = document.createElement('link');
      linkEl.setAttribute('rel', 'alternate');
      linkEl.setAttribute('hreflang', entry.lang);
      linkEl.setAttribute('href', entry.url);
      document.head.appendChild(linkEl);
    });

  }, [activeLang, pathname, translatedSlugs]);
}
