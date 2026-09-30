/**
 * Text and Markdown Sanitization Utilities
 * Ensures summary cards, descriptions, and excerpts never display raw markdown syntax
 */

export function stripMarkdown(markdown: string | undefined | null): string {
  if (!markdown) return '';
  return markdown
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove headers (# Header, ## Header, ### Header)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold and italic (***text***, **text**, *text*, ___text___, __text__, _text_)
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Remove strikethrough
    .replace(/~~(.*?)~~/g, '$1')
    // Remove images ![alt](url)
    .replace(/!\[(.*?)\]\(.*?\)/g, '')
    // Remove links [text](url) -> text
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    // Remove blockquotes (> quote)
    .replace(/^\s*>\s+/gm, '')
    // Remove unordered list markers (- item, * item, + item)
    .replace(/^\s*[-*+]\s+/gm, '')
    // Remove ordered list markers (1. item, 2. item)
    .replace(/^\s*\d+\.\s+/gm, '')
    // Remove horizontal rules
    .replace(/^[-*_]{3,}\s*$/gm, '')
    // Replace multiple newlines with single space
    .replace(/\n+/g, ' ')
    // Collapse extra whitespaces
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Truncates text cleanly at word boundaries
 */
export function truncateClean(text: string, maxLength: number = 160): string {
  const clean = stripMarkdown(text);
  if (clean.length <= maxLength) return clean;
  const sub = clean.substring(0, maxLength);
  const lastSpace = sub.lastIndexOf(' ');
  return (lastSpace > 0 ? sub.substring(0, lastSpace) : sub) + '...';
}

/**
 * Checks if a string predominantly contains Arabic characters
 */
export function isArabicText(text: string): boolean {
  if (!text) return false;
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicRegex.test(text);
}
