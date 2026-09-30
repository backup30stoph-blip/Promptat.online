import { supabase } from './supabase/client';

/**
 * Pure helper function to generate a clean, SEO-friendly, URL-safe base slug from any text.
 */
export function generateSlug(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/&/g, '-and-')         // Replace ampersand with 'and'
    .replace(/[^\w\-]+/g, '')       // Remove all non-word characters except hyphens
    .replace(/\-\-+/g, '-')         // Replace multiple hyphens with a single hyphen
    .replace(/^-+/, '')             // Trim leading hyphens
    .replace(/-+$/, '');            // Trim trailing hyphens
}

/**
 * Service to handle slug-related database queries and guarantee uniqueness.
 */
export const slugService = {
  /**
   * Generates a clean base slug and checks against existing Supabase database entries.
   * If a conflict is found, it appends a sequential numeric suffix (-1, -2, etc.) until unique.
   * 
   * @param title The input text (usually the title or name of the entity)
   * @param table The Supabase table name to check for duplicate slugs
   * @param column The column name (defaults to 'slug')
   * @param excludeId Optional UUID to exclude (useful when editing an existing item to keep its own slug)
   */
  async generateUniqueSlug(
    title: string,
    table: 'prompts' | 'skills' | 'blogs' | 'categories' | 'video_concepts' | 'seo_metadata' | 'media_library' = 'seo_metadata',
    column: string = 'slug',
    excludeId?: string
  ): Promise<string> {
    const baseSlug = generateSlug(title);
    if (!baseSlug) return 'untitled';

    let currentSlug = baseSlug;
    let isUnique = false;
    let counter = 0;

    while (!isUnique) {
      let query = supabase
        .from(table)
        .select('id')
        .eq(column, currentSlug);

      // If we are updating an item, exclude its current row so we don't collide with ourselves
      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) {
        console.error(`[slugService] Error checking slug uniqueness in ${table}:`, error);
        // Fallback to breaking the loop to avoid infinite loops on error
        break;
      }

      if (!data || data.length === 0) {
        isUnique = true;
      } else {
        counter++;
        currentSlug = `${baseSlug}-${counter}`;
      }
    }

    return currentSlug;
  }
};
