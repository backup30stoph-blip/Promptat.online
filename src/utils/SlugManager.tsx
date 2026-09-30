import React from 'react';
import { 
  generateSlug as libGenerateSlug, 
  checkKeywordCannibalization as libCheckKeywordCannibalization, 
  isSlugTaken,
  getUniqueSlug as libGetUniqueSlug
} from '../lib/slug';

/**
 * Generates a standard content slug based on title, content type, and metadata parameters.
 */
export function generateSlug(
  text: string,
  contentType: string,
  options?: {
    model?: string;
    style?: string;
    aiPlatform?: string;
    niche?: string;
    format?: string;
    theme?: string;
  }
): string {
  return libGenerateSlug(text, contentType, options);
}

/**
 * Validates in real-time whether the SEO focus keyword is a substring of the URL slug.
 */
export function validateKeywordInSlug(keyword: string, slug: string): boolean {
  if (!keyword || !slug) return false;
  const normKeyword = keyword.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normSlug = slug.toLowerCase().replace(/[^a-z0-9]/g, '');
  return normSlug.includes(normKeyword);
}

/**
 * Checks for keyword cannibalization with other pages in the SEO metadata table.
 */
export async function checkKeywordCannibalization(
  keyword: string,
  entityType: string,
  excludeEntityId?: string
) {
  return libCheckKeywordCannibalization(keyword, entityType, excludeEntityId);
}

/**
 * Enforces the immutability and uniqueness contract of slugs.
 * Checks if a slug is already taken in the target table, preventing duplicates.
 */
export async function enforceSlugImmutability(
  slug: string,
  tableName: string,
  excludeId?: string
): Promise<{ allowed: boolean; reason?: string }> {
  if (!slug || slug.trim() === '') {
    return { allowed: false, reason: 'Slug cannot be empty' };
  }
  const taken = await isSlugTaken(slug, tableName, excludeId);
  if (taken) {
    return {
      allowed: false,
      reason: `The slug "${slug}" is already in use by another active resource in the database. Slugs must be immutable and unique.`
    };
  }
  return { allowed: true };
}

interface ValidatorProps {
  keyword: string;
  slug: string;
  placeholderSlug?: string;
}

/**
 * Visual Indicator component for Admin forms to validate SEO keyword presence in real-time.
 */
export const SlugKeywordValidator: React.FC<ValidatorProps> = ({ keyword, slug, placeholderSlug }) => {
  const activeSlug = slug || placeholderSlug || '';
  
  if (!keyword || keyword.trim() === '') {
    return (
      <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-300"></span>
        <span>Live Validation: Enter a focus keyword below.</span>
      </div>
    );
  }

  const isValid = validateKeywordInSlug(keyword, activeSlug);

  if (isValid) {
    return (
      <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-wide animate-pulse-once">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
        <span>SEO Valid: "{keyword}" found in URL slug ✓</span>
      </div>
    );
  } else {
    return (
      <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-rose-600 uppercase tracking-wide">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping"></span>
        <span>SEO Error: Focus Keyword must be part of the URL slug ✗</span>
      </div>
    );
  }
};
