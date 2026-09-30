import { supabase } from './supabase/client';
import { generateLanguageSlug, buildLocalizedPath, LanguageCode } from '../lib/i18n';

export interface AddTranslationParams {
  originalItemId: string;
  contentType: 'image_prompt' | 'video_prompt' | 'skill' | 'blog';
  newLang: LanguageCode;
  translatedTitle: string;
  translatedDescription?: string;
  translatedContent?: string; // e.g. markdown for skill, article content for blog
  additionalFields?: Record<string, any>;
}

export const translationCmsService = {
  /**
   * handleAddTranslation:
   * Provides the backend/CMS function logic to handle "Add Translation" actions.
   * When creating a translation for an existing item:
   * 1. Fetches the original item to inherit its translation_group_id (creating one if it didn't exist).
   * 2. Generates the language-specific URL slug.
   * 3. Computes the corresponding absolute canonical_url.
   * 4. Inserts the new localized item into the database.
   */
  async handleAddTranslation(params: AddTranslationParams) {
    const {
      originalItemId,
      contentType,
      newLang,
      translatedTitle,
      translatedDescription = '',
      translatedContent = '',
      additionalFields = {}
    } = params;

    // Determine corresponding table name based on content_type
    let tableName = '';
    let pluralType = '';
    if (contentType === 'image_prompt') {
      tableName = 'prompts';
      pluralType = 'prompts';
    } else if (contentType === 'skill') {
      tableName = 'skills';
      pluralType = 'skills';
    } else if (contentType === 'video_prompt') {
      tableName = 'video_concepts';
      pluralType = 'videos';
    } else if (contentType === 'blog') {
      tableName = 'blogs';
      pluralType = 'blog';
    } else {
      throw new Error(`Invalid content type: ${contentType}`);
    }

    // 1. Fetch original item to get translation_group_id
    const { data: originalItem, error: fetchError } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', originalItemId)
      .single();

    if (fetchError || !originalItem) {
      throw new Error(`Failed to fetch original item: ${fetchError?.message || 'Item not found'}`);
    }

    // Inherit or generate translation_group_id
    let translationGroupId = originalItem.translation_group_id;
    if (!translationGroupId) {
      translationGroupId = originalItem.id; // Use primary key as group id if not set
      // Update original item to have this group ID
      await supabase
        .from(tableName)
        .update({ translation_group_id: translationGroupId })
        .eq('id', originalItemId);
    }

    // 2. Generate localized slug
    const generatedSlug = generateLanguageSlug(translatedTitle, newLang);

    // 3. Compute absolute canonical URL
    const domain = 'https://promptat.online';
    const relativePath = `/${pluralType}/${generatedSlug}`;
    const absoluteCanonicalUrl = `${domain}${buildLocalizedPath(relativePath, newLang)}`;

    // Prepare translation payload inheriting non-translatable fields
    const translationPayload = {
      ...originalItem,
      id: undefined, // Let db generate a new UUID
      title: translatedTitle,
      slug: generatedSlug,
      lang: newLang,
      translation_group_id: translationGroupId,
      canonical_url: absoluteCanonicalUrl,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Override or assign translatable description / content fields
    if (contentType === 'image_prompt') {
      translationPayload.description = translatedDescription;
    } else if (contentType === 'skill') {
      translationPayload.description = translatedDescription;
      translationPayload.markdown_file = translatedContent;
    } else if (contentType === 'video_prompt') {
      translationPayload.description = translatedDescription;
    } else if (contentType === 'blog') {
      translationPayload.excerpt = translatedDescription;
      translationPayload.content = translatedContent;
    }

    // Merge any other custom inputs
    Object.assign(translationPayload, additionalFields);

    // Delete unnecessary primary key to avoid insertion conflicts
    delete translationPayload.id;

    // 4. Insert translation version row into the database
    const { data: insertedData, error: insertError } = await supabase
      .from(tableName)
      .insert([translationPayload])
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to create translation: ${insertError.message}`);
    }

    return {
      success: true,
      translationGroupId,
      insertedItem: insertedData,
      slug: generatedSlug,
      canonicalUrl: absoluteCanonicalUrl
    };
  }
};
