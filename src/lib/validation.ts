import { z } from 'zod';

// Helper for slugs
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const slugSchema = z.string()
  .min(1, 'Slug is required')
  .regex(slugRegex, 'Slug must contain only lowercase letters, numbers, and hyphens (no trailing/leading hyphens)');

// URL validator that allows empty string or valid URL
const urlSchema = z.string().refine((val) => {
  if (!val) return true;
  try {
    new URL(val);
    return true;
  } catch {
    return val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://');
  }
}, {
  message: 'Must be a valid URL or local asset path'
});

// ==========================================
// 1. PROMPT VALIDATION SCHEMA
// ==========================================
export const promptValidationSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long').max(100, 'Title cannot exceed 100 characters'),
  slug: z.string().optional().or(slugSchema),
  description: z.string().min(5, 'Description must be at least 5 characters long').max(1000, 'Description cannot exceed 1000 characters'),
  prompt: z.string().min(10, 'Prompt text must be at least 10 characters long'),
  negative_prompt: z.string().optional().nullable(),
  model: z.string().min(1, 'AI Model selection is required'),
  category_id: z.string().uuid('Please select a valid category').or(z.string().length(0)).optional().nullable(),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Expert']),
  thumbnail: z.string().optional().or(urlSchema),
  aspect_ratio: z.string().optional(),
  seed: z.string().optional().nullable(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  seo_keywords: z.string().optional()
});

export type PromptFormInput = z.infer<typeof promptValidationSchema>;

// ==========================================
// 2. SKILL VALIDATION SCHEMA
// ==========================================
export const skillValidationSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long').max(100, 'Title cannot exceed 100 characters'),
  slug: z.string().optional().or(slugSchema),
  description: z.string().min(5, 'Description must be at least 5 characters long').max(1000, 'Description cannot exceed 1000 characters'),
  cover: z.string().optional().or(urlSchema),
  category_id: z.string().uuid('Please select a valid category').or(z.string().length(0)).optional().nullable(),
  markdown_file: z.string().min(10, 'Creator skill content must contain at least 10 characters of markdown/code'),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must follow SemVer format (e.g. 1.0.0)'),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Expert']),
  supported_ai: z.string().min(1, 'At least one supported AI engine is required (e.g., Cursor, Claude)'),
  seo_title: z.string().optional(),
  seo_description: z.string().optional()
});

export type SkillFormInput = z.infer<typeof skillValidationSchema>;

// ==========================================
// 3. BLOG VALIDATION SCHEMA
// ==========================================
export const blogValidationSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long').max(150, 'Title cannot exceed 150 characters'),
  slug: z.string().optional().or(slugSchema),
  cover: z.string().optional().or(urlSchema),
  excerpt: z.string().min(5, 'Excerpt must be at least 5 characters long').max(300, 'Excerpt cannot exceed 300 characters'),
  content: z.string().min(10, 'Blog body content must be at least 10 characters long'),
  category: z.string().min(1, 'Category selection is required'),
  seo_title: z.string().optional(),
  seo_description: z.string().optional()
});

export type BlogFormInput = z.infer<typeof blogValidationSchema>;

// ==========================================
// 4. CATEGORY VALIDATION SCHEMA
// ==========================================
export const categoryValidationSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters long').max(50, 'Title cannot exceed 50 characters'),
  slug: slugSchema,
  icon: z.string().min(1, 'Icon name is required (e.g. Sparkles, Code)'),
  color: z.string().min(1, 'Color design class is required'),
  type: z.enum(['Prompt', 'Skill', 'Video', 'Blog']),
  seo_title: z.string().optional(),
  seo_description: z.string().optional()
});

export type CategoryFormInput = z.infer<typeof categoryValidationSchema>;

// ==========================================
// VALIDATION HELPER FUNCTION
// ==========================================
export function validateForm<T>(schema: z.ZodSchema<T>, data: any): {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
} {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string> = {};
  result.error.issues.forEach((err) => {
    const fieldName = err.path.join('.');
    errors[fieldName] = err.message;
  });
  
  return { success: false, errors };
}
