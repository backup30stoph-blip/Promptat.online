import { useState } from 'react';
import { supabase } from '../services/supabase/client';

export interface SeoValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const useSeoValidation = () => {
  const [validating, setValidating] = useState(false);

  /**
   * Performs client-side validation checks on title lengths, meta descriptions,
   * and slug uniqueness against the 'seo_metadata' table.
   */
  const validateSeo = async (
    title: string,
    description: string,
    slug: string,
    entityType: 'prompt' | 'blog' | 'skill' | 'video' | 'category' | 'page',
    entityId?: string
  ): Promise<SeoValidationResult> => {
    setValidating(true);
    const errors: Record<string, string> = {};

    // 1. Length checks conforming to public.seo_metadata DB check constraints
    if (!title || title.trim() === '') {
      errors.seo_title = 'SEO Title is required.';
    } else if (title.trim().length > 60) {
      errors.seo_title = `SEO Title length (${title.trim().length}) exceeds maximum limit of 60 characters.`;
    }

    if (!description || description.trim() === '') {
      errors.meta_description = 'Meta Description is required.';
    } else if (description.trim().length > 160) {
      errors.meta_description = `Meta Description length (${description.trim().length}) exceeds maximum limit of 160 characters.`;
    }

    if (!slug || slug.trim() === '') {
      errors.slug = 'URL Slug is required.';
    } else if (!/^[a-z0-9-_/]+$/.test(slug.trim())) {
      errors.slug = 'Slug format is invalid. Use lowercase letters, numbers, hyphens, and slashes.';
    }

    // 2. Uniqueness check against the 'seo_metadata' table
    if (slug && slug.trim() && !errors.slug) {
      try {
        let query = supabase
          .from('seo_metadata')
          .select('id, entity_id, entity_type')
          .eq('entity_type', entityType)
          .eq('slug', slug.trim());

        if (entityId) {
          query = query.neq('entity_id', entityId);
        }

        const { data, error } = await query;

        if (error) {
          console.warn('uniqueness validation query error:', error.message);
        } else if (data && data.length > 0) {
          errors.slug = `The slug "${slug.trim()}" is already registered by another ${entityType}. Slugs must be unique.`;
        }
      } catch (err: any) {
        console.error('uniqueness lookup error:', err);
      }
    }

    setValidating(false);
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  return {
    validateSeo,
    validating
  };
};
