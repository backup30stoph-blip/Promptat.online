/**
 * Helper utility to dynamically update document title and SEO/Social meta tags
 * based on the content currently being viewed.
 */
interface SeoOptions {
  title: string;
  description: string;
  robots?: string;
  canonicalUrl?: string;
  image?: string;
  type?: 'website' | 'article' | 'profile';
}

export function updateSeoMetadata(options: SeoOptions) {
  const {
    title,
    description,
    robots = 'index, follow',
    canonicalUrl = typeof window !== 'undefined' ? window.location.href : '',
    image = '/logo.png',
    type = 'website',
  } = options;

  if (typeof document === 'undefined') return;

  // 1. Title
  document.title = title;

  // Helper to set or create meta tags
  const setMetaTag = (selector: string, attrName: string, attrVal: string, content: string) => {
    let element = document.querySelector(selector);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attrName, attrVal);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  // 2. Standard Meta Tags
  setMetaTag('meta[name="description"]', 'name', 'description', description);
  setMetaTag('meta[name="robots"]', 'name', 'robots', robots);

  // 3. OpenGraph Social Meta Tags
  setMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
  setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
  setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
  setMetaTag('meta[property="og:image"]', 'property', 'og:image', image);
  setMetaTag('meta[property="og:type"]', 'property', 'og:type', type);

  // 4. Twitter Card Social Meta Tags
  setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);
  setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
  setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', image);
  setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');

  // 5. Canonical Link
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', canonicalUrl);
}
