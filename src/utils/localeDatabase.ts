import { LanguageCode } from '../lib/i18n';

/**
 * databaseLocaleFilter:
 * Utility function to filter/remap Supabase query rows (or a single row) based on the active locale.
 * It ensures that standard keys (title, description, excerpt, content, hook, niche, etc.) are strictly remapped
 * to their locale-specific DB columns (e.g., title_en, title_ar, etc.) and deletes all other locale columns
 * to guarantee that UI components only receive fields matching the active language context.
 */
export function databaseLocaleFilter<T extends Record<string, any>>(
  data: T | T[],
  lang: LanguageCode
): any {
  if (!data) return data;

  const processRow = (row: any) => {
    const cleaned = { ...row };

    // Standard translation keys to map
    const translatableKeys = ['title', 'description', 'desc', 'excerpt', 'content', 'hook', 'niche', 'installation', 'how_to_use', 'channel_blueprint'];

    for (const key of translatableKeys) {
      const localizedCol = `${key}_${lang}`;
      if (localizedCol in cleaned) {
        cleaned[key] = cleaned[localizedCol] !== null && cleaned[localizedCol] !== undefined
          ? cleaned[localizedCol]
          : cleaned[key];
      }

      // Cleanup all language specific columns to keep payload clean and isolated
      const languages: LanguageCode[] = ['ar', 'en', 'es', 'fr', 'id'];
      for (const l of languages) {
        delete cleaned[`${key}_${l}`];
      }
    }

    return cleaned;
  };

  if (Array.isArray(data)) {
    return data.map(processRow);
  }

  return processRow(data);
}
