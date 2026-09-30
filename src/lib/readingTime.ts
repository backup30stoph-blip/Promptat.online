/**
 * Calculates the estimated reading time for a given text content.
 * Average reading speed: 200 words per minute.
 * 
 * @param content The markdown or text content of the article.
 * @returns A formatted string e.g., "5 min read".
 */
export const calculateReadingTime = (content: string): string => {
  if (!content) return '1 min read';
  
  // Clean markdown syntax or extra spaces
  const cleanText = content
    .replace(/[#*`[\]()_]/g, ' ') // Replace formatting marks with spaces
    .trim();
    
  const wordCount = cleanText.split(/\s+/).filter(word => word.length > 0).length;
  const wordsPerMinute = 200;
  const minutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  
  return `${minutes} min read`;
};
