import { LanguageCode, buildLocalizedPath, generateHreflangs } from '../lib/i18n';

export interface SeoGeneratorParams {
  item: {
    id: string;
    title: string;
    slug: string;
    description?: string;
    excerpt?: string;
    cover?: string;
    thumbnail?: string;
    translation_group_id?: string;
  };
  contentType: 'prompt' | 'skill' | 'video' | 'blog';
  lang: LanguageCode;
  domain?: string;
}

export interface SeoMetadataOutput {
  title: string;
  description: string;
  canonicalUrl: string;
  hreflangs: Array<{ lang: string; url: string }>;
  ogImage: string;
}

/**
 * generateDynamicSeoMetadata:
 * Helper function that accepts item data, content type, and language, and dynamically computes
 * and outputs page title, meta description, canonical_url, and all hreflang alternates.
 */
export function generateDynamicSeoMetadata(params: SeoGeneratorParams): SeoMetadataOutput {
  const { item, contentType, lang, domain = 'https://promptat.online' } = params;

  // 1. Compute Route Namespace (e.g. prompts, skills, videos, blog)
  let pluralType = contentType as string;
  if (contentType === 'prompt') pluralType = 'prompts';
  else if (contentType === 'skill') pluralType = 'skills';
  else if (contentType === 'video') pluralType = 'videos';

  // 2. Compute dynamic title with strict branding
  const localizedBranding: Record<LanguageCode, string> = {
    ar: 'برومبتات أونلاين',
    en: 'Promptat Online',
    fr: 'Promptat Online',
    es: 'Promptat Online',
    id: 'Promptat Online'
  };

  const branding = localizedBranding[lang] || 'Promptat Online';
  const pageTitle = `${item.title} | ${branding}`;

  // 3. Compute dynamic meta description
  const rawDesc = item.description || item.excerpt || '';
  const metaDescription = rawDesc.length > 155 
    ? rawDesc.substring(0, 152) + '...' 
    : rawDesc || `High-fidelity ${contentType} blueprint and templates on ${branding}.`;

  // 4. Compute Dynamic Canonical URL
  const relativePath = `/${pluralType}/${item.slug}`;
  const canonicalUrl = `${domain}${buildLocalizedPath(relativePath, lang)}`;

  // 5. Generate Hreflang Alternates (Hreflang canonical tags)
  // Maps all available languages with translated slugs if possible
  const defaultLangs: LanguageCode[] = ['ar', 'en', 'es', 'fr', 'id'];
  
  // We can pass the translation mappings here
  const hreflangs = generateHreflangs(relativePath, domain, defaultLangs);

  // 6. Compute OpenGraph image
  const ogImage = item.cover || item.thumbnail || `${domain}/logo.png`;

  return {
    title: pageTitle,
    description: metaDescription,
    canonicalUrl,
    hreflangs,
    ogImage
  };
}
