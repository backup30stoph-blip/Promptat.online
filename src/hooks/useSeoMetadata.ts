import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase/client';
import { SEOMetadata } from '../types';
import { updateSeoMetadata } from '../utils/seo';

export interface SeoMetadataOptions {
  title?: string;
  description?: string;
  robots?: string;
  entityType?: 'prompt' | 'skill' | 'video' | 'blog' | 'page' | 'category';
  entityId?: string;
}

/**
 * Hook to automatically inject canonical_url tags and update page metadata.
 * Always sets the canonical URL using the full clean URL path.
 */
export function useSeoMetadata(options: SeoMetadataOptions = {}) {
  const [dbMeta, setDbMeta] = useState<SEOMetadata | null>(null);
  const pathname = window.location.pathname;

  // 1. Fetch from Supabase seo_metadata table if entity details are provided
  useEffect(() => {
    if (!options.entityType || !options.entityId) {
      setDbMeta(null);
      return;
    }

    let isMounted = true;
    const fetchMetadata = async () => {
      try {
        const { data, error } = await supabase
          .from('seo_metadata')
          .select('*')
          .eq('entity_type', options.entityType)
          .eq('entity_id', options.entityId)
          .maybeSingle();

        if (error) {
          console.warn('[useSeoMetadata] Error fetching SEO metadata:', error.message);
          return;
        }

        if (isMounted && data) {
          setDbMeta(data as SEOMetadata);
        }
      } catch (err) {
        console.warn('[useSeoMetadata] Error fetching SEO metadata:', err);
      }
    };

    fetchMetadata();
    return () => {
      isMounted = false;
    };
  }, [options.entityType, options.entityId]);

  // 2. Automatically inject & sync metadata and canonical tags
  useEffect(() => {
    // Generate final title, description, and robots content
    const titleVal = dbMeta?.seo_title || dbMeta?.title || options.title || 'برومبتات أونلاين | Promptat Online - منصة النماذج والتعليمات الذكية';
    const descVal = dbMeta?.meta_description || dbMeta?.description || options.description || 'المكتبة الشاملة لأوامر ومخططات الذكاء الاصطناعي، نماذج صور Midjourney، ومهارات التطوير والتسويق الرقمي.';
    const robotsVal = dbMeta?.robots || options.robots || 'index, follow';
    const imageVal = dbMeta?.og_image || '/logo.png';
    
    // Canonical URL derived from current clean pathname
    const baseSiteUrl = 'https://promptat.online';
    const canonicalUrl = dbMeta?.canonical_url || `${baseSiteUrl}${pathname}`;

    // Call dynamic helper function to update document tags
    updateSeoMetadata({
      title: titleVal,
      description: descVal,
      robots: robotsVal,
      canonicalUrl: canonicalUrl,
      image: imageVal,
    });
  }, [options.title, options.description, options.robots, dbMeta, pathname]);
}
