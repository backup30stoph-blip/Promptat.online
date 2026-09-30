import { supabase } from '../services/supabase/client';

export function transliterate(str: string): string {
  const map: Record<string, string> = {
    'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a', 'æ': 'ae', 'ç': 'c',
    'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e', 'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',
    'ð': 'd', 'ñ': 'n', 'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o', 'ø': 'o',
    'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u', 'ý': 'y', 'þ': 'b', 'ÿ': 'y'
  };
  return str.split('').map(c => map[c] || c).join('');
}

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
  let input = text;
  
  // Normalize contentType for matching
  let type = contentType.toLowerCase().trim();
  if (type === 'prompts') type = 'prompt';
  if (type === 'skills') type = 'skill';
  if (type === 'video_concepts' || type === 'video_concept' || type === 'video') type = 'video';
  if (type === 'blogs') type = 'blog';
  if (type === 'categories') type = 'category';
  if (type === 'collections') type = 'collection';

  // Apply Section 3 Content-Type Patterns
  if (type === 'prompt') {
    const subject = text;
    const style = options?.style || '';
    const model = options?.model || '';
    // Pattern: {subject}-{style/medium}-{model} (spaces will be hyphenated)
    input = `${subject} ${style} ${model}`;
  } else if (type === 'skill') {
    const tool = text;
    const aiPlatform = options?.aiPlatform || '';
    // Pattern: {tool-or-outcome}-{ai-platform}-skill
    input = `${tool} ${aiPlatform} skill`;
  } else if (type === 'video') {
    const niche = text;
    const format = options?.format || '';
    // Pattern: {niche}-{format}-video-blueprint
    input = `${niche} ${format} video blueprint`;
  } else if (type === 'collection') {
    const theme = text;
    // Pattern: {theme}-collection
    input = `${theme} collection`;
  } else if (type === 'category') {
    // Pattern: {category-name} (kept short)
    input = text;
  } else {
    input = text;
  }

  // 1. Lowercase and transliterate
  let slug = transliterate(input.toLowerCase());
  
  // 3. Replace all whitespace, underscores, and slashes/backslashes with hyphens
  slug = slug.replace(/[\s_/\\]+/g, '-');
  
  // 4. Strip all characters except a-z, 0-9, hyphen
  slug = slug.replace(/[^a-z0-9-]/g, '');
  
  // 5. Collapse multiple consecutive hyphens into one
  slug = slug.replace(/-+/g, '-');
  
  // 6. Trim leading/trailing hyphens
  slug = slug.replace(/(^-|-$)/g, '');

  // Never encode the content type redundantly with the URL path (e.g. no -prompt or -prompts)
  if (type === 'prompt') {
    slug = slug.replace(/-prompts?$/, '');
  }

  // 7. Remove stop words only when length exceeds 55 characters
  if (slug.length > 55) {
    const stopWords = ['a', 'an', 'the', 'of', 'for', 'to', 'in', 'on', 'and', 'with', 'your'];
    const words = slug.split('-');
    
    // Check if the word itself is important, do not strip if it is how-to
    const filteredWords = words.filter((w, idx) => {
      // Don't strip "to" if it's preceded by "how" to keep "how-to" phrases intact
      if (w === 'to' && idx > 0 && words[idx - 1] === 'how') {
        return true;
      }
      return !stopWords.includes(w);
    });
    
    // Prevent empty slug if everything gets stripped
    const activeWords = filteredWords.length > 0 ? filteredWords : words;
    const filteredSlug = activeWords.join('-');
    
    if (filteredSlug.length <= 55) {
      slug = filteredSlug;
    } else {
      // 8. Cap at 55 max, cutting at a word boundary
      let tempSlug = '';
      for (const word of activeWords) {
        if ((tempSlug + (tempSlug ? '-' : '') + word).length <= 55) {
          tempSlug += (tempSlug ? '-' : '') + word;
        } else {
          break;
        }
      }
      slug = tempSlug || activeWords[0].substring(0, 55).replace(/-+$/, '');
    }
  }

  // Ensure no generic / empty or only hyphens slugs
  if (!slug || slug === 'untitled' || slug === 'new' || /^[0-9-]+$/.test(slug)) {
    slug = 'optimized-resource';
  }

  return slug;
}

export async function isSlugTaken(slug: string, tableName: string, excludeId?: string): Promise<boolean> {
  try {
    let query = supabase.from(tableName).select('id').eq('slug', slug);
    if (excludeId) {
      query = query.neq('id', excludeId);
    }
    const { data, error } = await query.limit(1).maybeSingle();
    if (error) return false;
    return !!data;
  } catch (err) {
    console.error('Error checking if slug is taken:', err);
    return false;
  }
}

export async function getUniqueSlug(
  baseSlug: string,
  tableName: string,
  excludeId?: string,
  differentiator?: string
): Promise<string> {
  const taken = await isSlugTaken(baseSlug, tableName, excludeId);
  if (!taken) return baseSlug;

  // Collision! Append a short, meaningful differentiator instead of a numeric suffix
  if (differentiator) {
    const cleanDiff = differentiator.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/(^-|-$)/g, '');
    if (cleanDiff && !baseSlug.endsWith(cleanDiff)) {
      const diffSlug = `${baseSlug}-${cleanDiff}`.substring(0, 55).replace(/-+$/, '');
      const takenDiff = await isSlugTaken(diffSlug, tableName, excludeId);
      if (!takenDiff) return diffSlug;
    }
  }

  // Meaningful differentiator list per table type to completely avoid numeric suffix
  const tableDiffs: Record<string, string[]> = {
    prompts: ['creative', 'stylized', 'realistic', 'v2', 'master', 'concept'],
    skills: ['guide', 'blueprint', 'expert', 'v2', 'advanced', 'integration'],
    blogs: ['insights', 'article', 'resource', 'trends', 'updates'],
    categories: ['hub', 'topics', 'group', 'collection'],
    video_concepts: ['blueprint', 'shorts', 'concept', 'v2', 'blueprint-pro'],
    collections: ['pack', 'bundle', 'selection', 'library']
  };

  const cleanTableName = tableName.toLowerCase().trim();
  const diffList = tableDiffs[cleanTableName] || ['v2', 'updated', 'pro', 'master', 'optimized'];

  for (const diff of diffList) {
    const testSlug = `${baseSlug}-${diff}`.substring(0, 55).replace(/-+$/, '');
    const isTaken = await isSlugTaken(testSlug, tableName, excludeId);
    if (!isTaken) return testSlug;
  }

  // If all specific differentiators are taken, do a compound word fallback (no bare numbers)
  const compoundDiffs = ['elite-edition', 'premium-formula', 'ultimate-resource', 'original-pack'];
  for (const compound of compoundDiffs) {
    const testSlug = `${baseSlug}-${compound}`.substring(0, 55).replace(/-+$/, '');
    const isTaken = await isSlugTaken(testSlug, tableName, excludeId);
    if (!isTaken) return testSlug;
  }

  // Absolute fallback to avoid blocking
  const randomStr = Math.random().toString(36).substring(2, 6);
  return `${baseSlug}-${randomStr}`.substring(0, 55).replace(/-+$/, '');
}

/**
 * Creates or updates a 301 redirect rule and collapses any existing redirect chain.
 */
export async function createRedirect(oldUrl: string, newUrl: string, notes?: string): Promise<void> {
  if (!oldUrl || !newUrl || oldUrl === newUrl) return;

  // Find the ultimate target URL of the redirect (collapsing chains if there's A -> B -> C)
  let ultimateDestination = newUrl;
  const visited = new Set<string>();
  visited.add(oldUrl);
  visited.add(newUrl);

  while (true) {
    const { data: nextHop, error } = await supabase
      .from('redirects')
      .select('new_url')
      .eq('old_url', ultimateDestination)
      .maybeSingle();

    if (error || !nextHop || visited.has(nextHop.new_url)) {
      break;
    }
    ultimateDestination = nextHop.new_url;
    visited.add(ultimateDestination);
  }

  // Collapse incoming redirect chains (e.g., A -> oldUrl is updated to A -> ultimateDestination)
  const { data: pointingToOld, error: fetchError } = await supabase
    .from('redirects')
    .select('id, old_url')
    .eq('new_url', oldUrl);

  if (!fetchError && pointingToOld && pointingToOld.length > 0) {
    for (const row of pointingToOld) {
      if (row.old_url !== ultimateDestination) {
        await supabase
          .from('redirects')
          .update({
            new_url: ultimateDestination,
            notes: `${notes || ''} (Chain collapsed)`
          })
          .eq('id', row.id);
      }
    }
  }

  // Create or update the redirect rule for the renamed asset
  const { data: existingRedirect } = await supabase
    .from('redirects')
    .select('id')
    .eq('old_url', oldUrl)
    .maybeSingle();

  if (existingRedirect) {
    await supabase
      .from('redirects')
      .update({
        new_url: ultimateDestination,
        notes: notes || 'Slug renamed'
      })
      .eq('id', existingRedirect.id);
  } else {
    await supabase
      .from('redirects')
      .insert({
        old_url: oldUrl,
        new_url: ultimateDestination,
        notes: notes || 'Slug renamed',
        hits: 0
      });
  }
}

/**
 * Checks if the focus keyword is already being used by another published page.
 * Returns { cannibalized: boolean, conflictingSlug?: string }
 */
export async function checkKeywordCannibalization(
  keyword: string,
  entityType: string,
  excludeEntityId?: string
): Promise<{ cannibalized: boolean; conflictingSlug?: string }> {
  if (!keyword || keyword.trim() === '') {
    return { cannibalized: false };
  }

  try {
    const { data, error } = await supabase
      .from('seo_metadata')
      .select('slug, entity_id, entity_type')
      .eq('focus_keyword', keyword.trim());

    if (error || !data || data.length === 0) {
      return { cannibalized: false };
    }

    // Filter out the current editing record
    const conflicts = data.filter(row => {
      if (excludeEntityId && row.entity_id === excludeEntityId && row.entity_type === entityType) {
        return false;
      }
      return true;
    });

    if (conflicts.length > 0) {
      return {
        cannibalized: true,
        conflictingSlug: conflicts[0].slug
      };
    }
  } catch (err) {
    console.error('Error checking cannibalization:', err);
  }

  return { cannibalized: false };
}
