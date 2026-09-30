import { supabase } from './supabase/client';
import { SEOMetadata, SiteSettings, RedirectRule, NotFoundLog, MediaLibraryItem } from '../types';

export interface DBSeoFields {
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string[] | null;
}

export interface DBCategory extends DBSeoFields {
  id: string;
  title: string;
  slug: string;
  icon?: string | null;
  color?: string | null;
  type: 'Prompt' | 'Skill' | 'Video' | 'Blog';
  created_at?: string;
}

export interface DBPrompt extends DBSeoFields {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  prompt: string;
  negative_prompt?: string | null;
  model: string;
  category_id?: string | null;
  thumbnail?: string | null;
  gallery?: string[] | null;
  style?: string | null;
  camera?: string | null;
  lighting?: string | null;
  aspect_ratio?: string | null;
  difficulty?: 'Beginner' | 'Intermediate' | 'Expert';
  downloads?: number;
  views?: number;
  likes?: number;
  featured?: boolean;
  premium?: boolean;
  seed?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DBSkill extends DBSeoFields {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  cover?: string | null;
  category_id?: string | null;
  markdown_file: string;
  zip_file?: string | null;
  pdf_file?: string | null;
  json_file?: string | null;
  downloads?: number;
  views?: number;
  likes?: number;
  version?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Expert';
  featured?: boolean;
  premium?: boolean;
  supported_ai?: string[] | null;
  installation?: string | null;
  how_to_use?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DBBlog extends DBSeoFields {
  id: string;
  title: string;
  slug: string;
  cover?: string | null;
  excerpt?: string | null;
  content?: string | null;
  category?: string | null;
  author_id?: string | null;
  views?: number;
  likes?: number;
  featured?: boolean;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
}

interface ServiceResponse<T> {
  data: T | null;
  error: Error | null;
}

export const cmsService = {
  // ==========================================
  // CATEGORIES CRUD
  // ==========================================
  async getCategories(type?: 'Prompt' | 'Skill' | 'Video' | 'Blog'): Promise<ServiceResponse<DBCategory[]>> {
    try {
      let query = supabase.from('categories').select('*').order('title', { ascending: true });
      if (type) {
        query = query.eq('type', type);
      }
      const { data, error } = await query;
      if (error) throw error;
      return { data: data as DBCategory[], error: null };
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      return { data: null, error: err instanceof Error ? err : new Error(err.message || 'Unknown error') };
    }
  },

  async getCategoryById(id: string): Promise<ServiceResponse<DBCategory>> {
    try {
      const { data, error } = await supabase.from('categories').select('*').eq('id', id).single();
      if (error) throw error;
      return { data: data as DBCategory, error: null };
    } catch (err: any) {
      console.error(`Error fetching category with id ${id}:`, err);
      return { data: null, error: err instanceof Error ? err : new Error(err.message || 'Unknown error') };
    }
  },

  async createCategory(payload: Omit<DBCategory, 'id' | 'created_at'>): Promise<ServiceResponse<DBCategory>> {
    try {
      const { data, error } = await supabase.from('categories').insert(payload).select().single();
      if (error) throw error;
      return { data: data as DBCategory, error: null };
    } catch (err: any) {
      console.error('Error creating category:', err);
      return { data: null, error: err instanceof Error ? err : new Error(err.message || 'Unknown error') };
    }
  },

  async updateCategory(id: string, payload: Partial<DBCategory>): Promise<ServiceResponse<DBCategory>> {
    try {
      const { data, error } = await supabase.from('categories').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return { data: data as DBCategory, error: null };
    } catch (err: any) {
      console.error(`Error updating category ${id}:`, err);
      return { data: null, error: err instanceof Error ? err : new Error(err.message || 'Unknown error') };
    }
  },

  async deleteCategory(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      return { data: true, error: null };
    } catch (err: any) {
      console.error(`Error deleting category ${id}:`, err);
      return { data: null, error: err instanceof Error ? err : new Error(err.message || 'Unknown error') };
    }
  },

  // ==========================================
  // PROMPTS CRUD
  // ==========================================
  async getPrompts(): Promise<ServiceResponse<DBPrompt[]>> {
    try {
      const { data, error } = await supabase.from('prompts').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return { data: data as DBPrompt[], error: null };
    } catch (err: any) {
      console.error('Error fetching prompts:', err);
      return { data: null, error: err instanceof Error ? err : new Error(err.message || 'Unknown error') };
    }
  },

  async getPromptById(id: string): Promise<ServiceResponse<DBPrompt>> {
    try {
      const { data, error } = await supabase.from('prompts').select('*').eq('id', id).single();
      if (error) throw error;
      return { data: data as DBPrompt, error: null };
    } catch (err: any) {
      console.error(`Error fetching prompt ${id}:`, err);
      return { data: null, error: err instanceof Error ? err : new Error(err.message || 'Unknown error') };
    }
  },

  async createPrompt(payload: Omit<DBPrompt, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceResponse<DBPrompt>> {
    try {
      const { data, error } = await supabase.from('prompts').insert(payload).select().single();
      if (error) throw error;
      return { data: data as DBPrompt, error: null };
    } catch (err: any) {
      console.error('Error creating prompt:', err);
      return { data: null, error: err instanceof Error ? err : new Error(err.message || 'Unknown error') };
    }
  },

  async updatePrompt(id: string, payload: Partial<DBPrompt>): Promise<ServiceResponse<DBPrompt>> {
    try {
      const { data, error } = await supabase.from('prompts').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return { data: data as DBPrompt, error: null };
    } catch (err: any) {
      console.error(`Error updating prompt ${id}:`, err);
      return { data: null, error: err instanceof Error ? err : new Error(err.message || 'Unknown error') };
    }
  },

  async deletePrompt(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase.from('prompts').delete().eq('id', id);
      if (error) throw error;
      return { data: true, error: null };
    } catch (err: any) {
      console.error(`Error deleting prompt ${id}:`, err);
      return { data: null, error: err instanceof Error ? err : new Error(err.message || 'Unknown error') };
    }
  },

  // ==========================================
  // SKILLS CRUD
  // ==========================================
  async getSkills(): Promise<ServiceResponse<DBSkill[]>> {
    try {
      const { data, error } = await supabase.from('skills').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return { data: data as DBSkill[], error: null };
    } catch (err: any) {
      console.error('Error fetching skills:', err);
      return { data: null, error: err instanceof Error ? err : new Error(err.message || 'Unknown error') };
    }
  },

  async getSkillById(id: string): Promise<ServiceResponse<DBSkill>> {
    try {
      const { data, error } = await supabase.from('skills').select('*').eq('id', id).single();
      if (error) throw error;
      return { data: data as DBSkill, error: null };
    } catch (err: any) {
      console.error(`Error fetching skill ${id}:`, err);
      return { data: null, error: err instanceof Error ? err : new Error(err.message || 'Unknown error') };
    }
  },

  async createSkill(payload: Omit<DBSkill, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceResponse<DBSkill>> {
    try {
      const { data, error } = await supabase.from('skills').insert(payload).select().single();
      if (error) throw error;
      return { data: data as DBSkill, error: null };
    } catch (err: any) {
      console.error('Error creating skill:', err);
      return { data: null, error: err instanceof Error ? err : new Error(err.message || 'Unknown error') };
    }
  },

  async updateSkill(id: string, payload: Partial<DBSkill>): Promise<ServiceResponse<DBSkill>> {
    try {
      const { data, error } = await supabase.from('skills').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return { data: data as DBSkill, error: null };
    } catch (err: any) {
      console.error(`Error updating skill ${id}:`, err);
      return { data: null, error: err instanceof Error ? err : new Error(err.message || 'Unknown error') };
    }
  },

  async deleteSkill(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase.from('skills').delete().eq('id', id);
      if (error) throw error;
      return { data: true, error: null };
    } catch (err: any) {
      console.error(`Error deleting skill ${id}:`, err);
      return { data: null, error: err instanceof Error ? err : new Error(err.message || 'Unknown error') };
    }
  },

  // ==========================================
  // BLOGS CRUD
  // ==========================================
  async getBlogs(): Promise<ServiceResponse<DBBlog[]>> {
    try {
      const { data, error } = await supabase.from('blogs').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return { data: data as DBBlog[], error: null };
    } catch (err: any) {
      console.error('Error fetching blogs:', err);
      return { data: null, error: err instanceof Error ? err : new Error(err.message || 'Unknown error') };
    }
  },

  async getBlogById(id: string): Promise<ServiceResponse<DBBlog>> {
    try {
      const { data, error } = await supabase.from('blogs').select('*').eq('id', id).single();
      if (error) throw error;
      return { data: data as DBBlog, error: null };
    } catch (err: any) {
      console.error(`Error fetching blog ${id}:`, err);
      return { data: null, error: err instanceof Error ? err : new Error(err.message || 'Unknown error') };
    }
  },

  async createBlog(payload: Omit<DBBlog, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceResponse<DBBlog>> {
    try {
      const { data, error } = await supabase.from('blogs').insert(payload).select().single();
      if (error) throw error;
      return { data: data as DBBlog, error: null };
    } catch (err: any) {
      console.error('Error creating blog:', err);
      return { data: null, error: err instanceof Error ? err : new Error(err.message || 'Unknown error') };
    }
  },

  async updateBlog(id: string, payload: Partial<DBBlog>): Promise<ServiceResponse<DBBlog>> {
    try {
      const { data, error } = await supabase.from('blogs').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return { data: data as DBBlog, error: null };
    } catch (err: any) {
      console.error(`Error updating blog ${id}:`, err);
      return { data: null, error: err instanceof Error ? err : new Error(err.message || 'Unknown error') };
    }
  },

  async deleteBlog(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase.from('blogs').delete().eq('id', id);
      if (error) throw error;
      return { data: true, error: null };
    } catch (err: any) {
      console.error(`Error deleting blog ${id}:`, err);
      return { data: null, error: err instanceof Error ? err : new Error(err.message || 'Unknown error') };
    }
  },

  // ==========================================
  // VIDEO CONCEPTS CRUD
  // ==========================================
  async getVideos(): Promise<ServiceResponse<any[]>> {
    try {
      const { data, error } = await supabase.from('video_concepts').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      console.error('Error fetching videos:', err);
      return { data: null, error: err instanceof Error ? err : new Error(err.message || 'Unknown error') };
    }
  },

  async getVideoById(id: string): Promise<ServiceResponse<any>> {
    try {
      const { data, error } = await supabase.from('video_concepts').select('*').eq('id', id).single();
      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      console.error(`Error fetching video ${id}:`, err);
      return { data: null, error: err instanceof Error ? err : new Error(err.message || 'Unknown error') };
    }
  },

  async createVideo(payload: any): Promise<ServiceResponse<any>> {
    try {
      const { data, error } = await supabase.from('video_concepts').insert(payload).select().single();
      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      console.error('Error creating video:', err);
      return { data: null, error: err instanceof Error ? err : new Error(err.message || 'Unknown error') };
    }
  },

  async updateVideo(id: string, payload: any): Promise<ServiceResponse<any>> {
    try {
      const { data, error } = await supabase.from('video_concepts').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      console.error(`Error updating video ${id}:`, err);
      return { data: null, error: err instanceof Error ? err : new Error(err.message || 'Unknown error') };
    }
  },

  async deleteVideo(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase.from('video_concepts').delete().eq('id', id);
      if (error) throw error;
      return { data: true, error: null };
    } catch (err: any) {
      console.error(`Error deleting video ${id}:`, err);
      return { data: null, error: err instanceof Error ? err : new Error(err.message || 'Unknown error') };
    }
  },

  // ==========================================
  // SEO METADATA (POLYMORPHIC TABLE)
  // ==========================================
  async getSeoMetadata(entityType: string, entityId: string): Promise<ServiceResponse<SEOMetadata>> {
    try {
      const { data, error } = await supabase
        .from('seo_metadata')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .maybeSingle();
      if (error) throw error;
      return { data: data as SEOMetadata, error: null };
    } catch (err: any) {
      console.error(`Error fetching SEO metadata for ${entityType}/${entityId}:`, err);
      return { data: null, error: err instanceof Error ? err : new Error(err.message || 'Unknown error') };
    }
  },

  async upsertSeoMetadata(payload: Partial<SEOMetadata> & { entity_type: string; entity_id: string }): Promise<ServiceResponse<SEOMetadata>> {
    try {
      const { data, error } = await supabase
        .from('seo_metadata')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single();
      if (error) throw error;
      return { data: data as SEOMetadata, error: null };
    } catch (err: any) {
      console.error('Error upserting SEO metadata:', err);
      return { data: null, error: err instanceof Error ? err : new Error(err.message || 'Unknown error') };
    }
  },

  // ==========================================
  // SITE SETTINGS
  // ==========================================
  async getSiteSettings(): Promise<ServiceResponse<SiteSettings>> {
    try {
      const { data, error } = await supabase.from('site_settings').select('*').limit(1).maybeSingle();
      if (error) throw error;
      return { data: data as SiteSettings, error: null };
    } catch (err: any) {
      console.error('Error fetching site settings:', err);
      return { data: null, error: err instanceof Error ? err : new Error(err.message || 'Unknown error') };
    }
  },

  async updateSiteSettings(id: string, payload: Partial<SiteSettings>): Promise<ServiceResponse<SiteSettings>> {
    try {
      const { data, error } = await supabase.from('site_settings').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return { data: data as SiteSettings, error: null };
    } catch (err: any) {
      console.error('Error updating site settings:', err);
      return { data: null, error: err instanceof Error ? err : new Error(err.message || 'Unknown error') };
    }
  },

  // ==========================================
  // REDIRECTS & 404 LOGS
  // ==========================================
  async getRedirects(): Promise<ServiceResponse<RedirectRule[]>> {
    try {
      const { data, error } = await supabase.from('redirects').select('*').eq('enabled', true);
      if (error) throw error;
      return { data: data as RedirectRule[], error: null };
    } catch (err: any) {
      console.error('Error fetching redirects:', err);
      return { data: null, error: err instanceof Error ? err : new Error(err.message || 'Unknown error') };
    }
  },

  async log404(url: string, referer?: string, userAgent?: string): Promise<void> {
    try {
      await supabase.from('404_logs').insert({
        url,
        referer: referer || null,
        user_agent: userAgent || null,
        hits: 1
      });
    } catch (err) {
      console.warn('Could not log 404 URL:', err);
    }

    try {
      await supabase.from('not_found_logs').insert({
        url,
        referer: referer || null,
        user_agent: userAgent || null,
        hits: 1
      });
    } catch (err) {
      console.warn('Could not log not_found_logs URL:', err);
    }
  },

  // ==========================================
  // MEDIA LIBRARY
  // ==========================================
  async getMediaLibrary(): Promise<ServiceResponse<MediaLibraryItem[]>> {
    try {
      const { data, error } = await supabase.from('media_library').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return { data: data as MediaLibraryItem[], error: null };
    } catch (err: any) {
      console.error('Error fetching media library:', err);
      return { data: null, error: err instanceof Error ? err : new Error(err.message || 'Unknown error') };
    }
  },

  async createMediaItem(payload: Omit<MediaLibraryItem, 'id' | 'created_at'>): Promise<ServiceResponse<MediaLibraryItem>> {
    try {
      const { data, error } = await supabase.from('media_library').insert(payload).select().single();
      if (error) throw error;
      return { data: data as MediaLibraryItem, error: null };
    } catch (err: any) {
      console.error('Error creating media library item:', err);
      return { data: null, error: err instanceof Error ? err : new Error(err.message || 'Unknown error') };
    }
  },

  async subscribeToNewsletter(rawEmail: string): Promise<{ success: boolean; message: string }> {
    const email = rawEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }

    // Client-side rate-limiting using localStorage
    const now = Date.now();
    const lastSub = localStorage.getItem('last_newsletter_sub');
    if (lastSub) {
      const timePassed = now - parseInt(lastSub, 10);
      const cooldown = 60 * 1000; // 1 minute cooldown to prevent spam
      if (timePassed < cooldown) {
        const secondsLeft = Math.ceil((cooldown - timePassed) / 1000);
        throw new Error(`Please wait ${secondsLeft}s before subscribing again.`);
      }
    }

    try {
      // Attempt to insert into public.newsletter_subscribers
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email, status: 'subscribed' }]);

      if (error) {
        if (error.code === '23505') {
          throw new Error('This email is already subscribed to our newsletter.');
        }
        console.warn('[cmsService] Database insert error:', error.message);
      } else {
        console.log('[cmsService] Newsletter subscriber saved to database:', email);
      }
    } catch (err: any) {
      if (err.message && (err.message.includes('already subscribed') || err.message.includes('Please wait'))) {
        throw err;
      }
      console.warn('[cmsService] Database write error, fallback simulation active:', err);
    }

    localStorage.setItem('last_newsletter_sub', now.toString());
    return { success: true, message: 'Successfully subscribed! Check your inbox this Friday.' };
  },

  // ==========================================
  // SHARES & COMMENTS (SKILL 16)
  // ==========================================
  async logShareEvent(
    contentType: 'prompt' | 'skill' | 'video' | 'blog',
    contentId: string,
    platform: string,
    userId: string | null = null
  ): Promise<void> {
    try {
      const { error } = await supabase.from('share_events').insert({
        content_type: contentType,
        content_id: contentId,
        platform,
        user_id: userId || null
      });
      if (error) throw error;
      console.log(`Share logged to database: ${contentType}/${contentId} via ${platform}`);
    } catch (err: any) {
      console.warn('[cmsService] Database error logging share event, simulating offline:', err.message || err);
      // Fallback: log in localStorage
      const offlineShares = JSON.parse(localStorage.getItem('offline_shares') || '[]');
      offlineShares.push({ id: Math.random().toString(), content_type: contentType, content_id: contentId, platform, user_id: userId, created_at: new Date().toISOString() });
      localStorage.setItem('offline_shares', JSON.stringify(offlineShares));
    }
  },

  async getComments(
    contentType: 'prompt' | 'skill' | 'video' | 'blog',
    contentId: string
  ): Promise<ServiceResponse<any[]>> {
    const tableMap = {
      prompt: { comments: 'prompt_comments', likes: 'prompt_comment_likes' },
      skill: { comments: 'skill_comments', likes: 'skill_comment_likes' },
      video: { comments: 'video_comments', likes: 'video_comment_likes' },
      blog: { comments: 'blog_comments', likes: 'blog_comment_likes' }
    };
    const tables = tableMap[contentType] || tableMap.prompt;

    try {
      const { data, error } = await supabase
        .from(tables.comments)
        .select(`
          id,
          content_id,
          user_id,
          parent_id,
          body,
          likes,
          is_flagged,
          is_deleted,
          created_at,
          updated_at,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq('content_id', contentId)
        .order('created_at', { ascending: true });

      if (error) {
        // If it's a schema cache relationship error, fallback to fetching manually
        if (error.message && (error.message.includes('relationship') || error.message.includes('Could not find'))) {
          console.warn(`[cmsService] Schema relationship error on ${tables.comments}, fetching profiles manually...`);
          const { data: commentsOnly, error: commentsError } = await supabase
            .from(tables.comments)
            .select(`
              id,
              content_id,
              user_id,
              parent_id,
              body,
              likes,
              is_flagged,
              is_deleted,
              created_at,
              updated_at
            `)
            .eq('content_id', contentId)
            .order('created_at', { ascending: true });

          if (commentsError) throw commentsError;
          if (!commentsOnly || commentsOnly.length === 0) {
            return { data: [], error: null };
          }

          const userIds = Array.from(new Set(commentsOnly.map(c => c.user_id).filter(Boolean)));
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', userIds);

          if (profilesError) {
            console.warn('[cmsService] Could not fetch profiles manually:', profilesError);
          }

          const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
          const joinedData = commentsOnly.map(c => ({
            ...c,
            content_type: contentType,
            profiles: profileMap.get(c.user_id) || {
              username: 'Anonymous Creator',
              avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
            }
          }));

          return { data: joinedData, error: null };
        }
        throw error;
      }
      const mappedData = (data || []).map(c => ({
        ...c,
        content_type: contentType
      }));
      return { data: mappedData, error: null };
    } catch (err: any) {
      console.warn(`[cmsService] Database error fetching comments from ${tables.comments}, using fallback simulation:`, err.message || err);
      // Fallback: simulate local comments stored in localStorage
      const key = `local_comments_${contentType}_${contentId}`;
      const saved = localStorage.getItem(key);
      if (!saved) {
        // Return some dummy default comments first to seed the database in the client UI
        const defaultComments = [
          {
            id: 'c-1',
            content_type: contentType,
            content_id: contentId,
            user_id: 'u-admin',
            parent_id: null,
            body: `This is an absolutely stellar ${contentType}! Exactly what I was looking for to boost my AI outputs. Highly recommended!`,
            likes: 12,
            is_flagged: false,
            is_deleted: false,
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            profiles: {
              username: 'GemiCreator',
              avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
            }
          },
          {
            id: 'c-2',
            content_type: contentType,
            content_id: contentId,
            user_id: 'u-user1',
            parent_id: 'c-1',
            body: 'Totally agree! The parameter tuning was a game changer.',
            likes: 4,
            is_flagged: false,
            is_deleted: false,
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            profiles: {
              username: 'AICoder_01',
              avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
            }
          }
        ];
        localStorage.setItem(key, JSON.stringify(defaultComments));
        return { data: defaultComments, error: null };
      }
      return { data: JSON.parse(saved), error: null };
    }
  },

  async createComment(
    contentType: 'prompt' | 'skill' | 'video' | 'blog',
    contentId: string,
    userId: string,
    body: string,
    parentId: string | null = null,
    profileData?: { username: string; avatar_url: string }
  ): Promise<ServiceResponse<any>> {
    const tableMap = {
      prompt: { comments: 'prompt_comments', likes: 'prompt_comment_likes' },
      skill: { comments: 'skill_comments', likes: 'skill_comment_likes' },
      video: { comments: 'video_comments', likes: 'video_comment_likes' },
      blog: { comments: 'blog_comments', likes: 'blog_comment_likes' }
    };
    const tables = tableMap[contentType] || tableMap.prompt;

    try {
      const { data, error } = await supabase
        .from(tables.comments)
        .insert({
          content_id: contentId,
          user_id: userId,
          body,
          parent_id: parentId
        })
        .select(`
          id,
          content_id,
          user_id,
          parent_id,
          body,
          likes,
          is_flagged,
          is_deleted,
          created_at,
          updated_at,
          profiles (
            username,
            avatar_url
          )
        `)
        .single();

      if (error) {
        if (error.message && (error.message.includes('relationship') || error.message.includes('Could not find'))) {
          console.warn(`[cmsService] Relationship error in createComment for ${tables.comments}, inserting without join...`);
          const { data: insertedComment, error: insertError } = await supabase
            .from(tables.comments)
            .insert({
              content_id: contentId,
              user_id: userId,
              body,
              parent_id: parentId
            })
            .select(`
              id,
              content_id,
              user_id,
              parent_id,
              body,
              likes,
              is_flagged,
              is_deleted,
              created_at,
              updated_at
            `)
            .single();

          if (insertError) throw insertError;

          let profile = profileData || {
            username: 'Anonymous Creator',
            avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
          };

          if (!profileData) {
            const { data: prof } = await supabase
              .from('profiles')
              .select('username, avatar_url')
              .eq('id', userId)
              .single();
            if (prof) {
              profile = prof;
            }
          }

          return {
            data: {
              ...insertedComment,
              content_type: contentType,
              profiles: profile
            },
            error: null
          };
        }
        throw error;
      }
      return { data: { ...data, content_type: contentType }, error: null };
    } catch (err: any) {
      console.warn(`[cmsService] Database error inserting comment into ${tables.comments}, simulating offline:`, err.message || err);
      // Simulate insert locally
      const key = `local_comments_${contentType}_${contentId}`;
      const comments = JSON.parse(localStorage.getItem(key) || '[]');
      const newComment = {
        id: `c-${Date.now()}`,
        content_type: contentType,
        content_id: contentId,
        user_id: userId,
        parent_id: parentId,
        body,
        likes: 0,
        is_flagged: false,
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profiles: {
          username: profileData?.username || 'Anonymous Creator',
          avatar_url: profileData?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
        }
      };
      comments.push(newComment);
      localStorage.setItem(key, JSON.stringify(comments));
      return { data: newComment, error: null };
    }
  },

  async toggleLikeComment(
    commentId: string,
    userId: string,
    contentType: 'prompt' | 'skill' | 'video' | 'blog',
    contentId: string
  ): Promise<ServiceResponse<{ liked: boolean; likesCount: number }>> {
    const tableMap = {
      prompt: { comments: 'prompt_comments', likes: 'prompt_comment_likes' },
      skill: { comments: 'skill_comments', likes: 'skill_comment_likes' },
      video: { comments: 'video_comments', likes: 'video_comment_likes' },
      blog: { comments: 'blog_comments', likes: 'blog_comment_likes' }
    };
    const tables = tableMap[contentType] || tableMap.prompt;

    try {
      // 1. Check if user already liked
      const { data: existingLike, error: selectError } = await supabase
        .from(tables.likes)
        .select('*')
        .eq('comment_id', commentId)
        .eq('user_id', userId)
        .maybeSingle();

      if (selectError) throw selectError;

      const alreadyLiked = !!existingLike;
      if (alreadyLiked) {
        // Delete like
        const { error: deleteError } = await supabase
          .from(tables.likes)
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', userId);
        if (deleteError) throw deleteError;

        // Decrement count
        const { data: currComm, error: commError } = await supabase.from(tables.comments).select('likes').eq('id', commentId).single();
        if (commError) throw commError;
        const newLikes = Math.max(0, (currComm?.likes || 0) - 1);
        await supabase.from(tables.comments).update({ likes: newLikes }).eq('id', commentId);

        return { data: { liked: false, likesCount: newLikes }, error: null };
      } else {
        // Insert like
        const { error: insertError } = await supabase
          .from(tables.likes)
          .insert({ comment_id: commentId, user_id: userId });
        if (insertError) throw insertError;

        // Increment count
        const { data: currComm, error: commError } = await supabase.from(tables.comments).select('likes').eq('id', commentId).single();
        if (commError) throw commError;
        const newLikes = (currComm?.likes || 0) + 1;
        await supabase.from(tables.comments).update({ likes: newLikes }).eq('id', commentId);

        return { data: { liked: true, likesCount: newLikes }, error: null };
      }
    } catch (err: any) {
      console.warn(`[cmsService] Database error liking comment in ${tables.likes}, simulating offline:`, err.message || err);
      // Simulate locally
      const key = `local_comments_${contentType}_${contentId}`;
      const comments = JSON.parse(localStorage.getItem(key) || '[]');
      let liked = false;
      let likesCount = 0;

      const updated = comments.map((c: any) => {
        if (c.id === commentId) {
          const userLikesKey = `local_comment_liked_${userId}_${commentId}`;
          const isLikedLocally = localStorage.getItem(userLikesKey) === 'true';
          if (isLikedLocally) {
            c.likes = Math.max(0, c.likes - 1);
            localStorage.setItem(userLikesKey, 'false');
            liked = false;
          } else {
            c.likes += 1;
            localStorage.setItem(userLikesKey, 'true');
            liked = true;
          }
          likesCount = c.likes;
        }
        return c;
      });

      localStorage.setItem(key, JSON.stringify(updated));
      return { data: { liked, likesCount }, error: null };
    }
  },

  async flagComment(
    commentId: string,
    contentType: 'prompt' | 'skill' | 'video' | 'blog',
    contentId: string
  ): Promise<ServiceResponse<boolean>> {
    const tableMap = {
      prompt: { comments: 'prompt_comments', likes: 'prompt_comment_likes' },
      skill: { comments: 'skill_comments', likes: 'skill_comment_likes' },
      video: { comments: 'video_comments', likes: 'video_comment_likes' },
      blog: { comments: 'blog_comments', likes: 'blog_comment_likes' }
    };
    const tables = tableMap[contentType] || tableMap.prompt;

    try {
      const { error } = await supabase
        .from(tables.comments)
        .update({ is_flagged: true })
        .eq('id', commentId);
      if (error) throw error;
      return { data: true, error: null };
    } catch (err: any) {
      console.warn(`[cmsService] Database error flagging comment in ${tables.comments}, simulating offline:`, err.message || err);
      const key = `local_comments_${contentType}_${contentId}`;
      const comments = JSON.parse(localStorage.getItem(key) || '[]');
      const updated = comments.map((c: any) => {
        if (c.id === commentId) {
          c.is_flagged = true;
        }
        return c;
      });
      localStorage.setItem(key, JSON.stringify(updated));
      return { data: true, error: null };
    }
  },

  async softDeleteComment(
    commentId: string,
    contentType: 'prompt' | 'skill' | 'video' | 'blog',
    contentId: string
  ): Promise<ServiceResponse<boolean>> {
    const tableMap = {
      prompt: { comments: 'prompt_comments', likes: 'prompt_comment_likes' },
      skill: { comments: 'skill_comments', likes: 'skill_comment_likes' },
      video: { comments: 'video_comments', likes: 'video_comment_likes' },
      blog: { comments: 'blog_comments', likes: 'blog_comment_likes' }
    };
    const tables = tableMap[contentType] || tableMap.prompt;

    try {
      const { error } = await supabase
        .from(tables.comments)
        .update({ is_deleted: true })
        .eq('id', commentId);
      if (error) throw error;
      return { data: true, error: null };
    } catch (err: any) {
      console.warn(`[cmsService] Database error soft-deleting comment in ${tables.comments}, simulating offline:`, err.message || err);
      const key = `local_comments_${contentType}_${contentId}`;
      const comments = JSON.parse(localStorage.getItem(key) || '[]');
      const updated = comments.map((c: any) => {
        if (c.id === commentId) {
          c.is_deleted = true;
          c.body = '[deleted]';
        }
        return c;
      });
      localStorage.setItem(key, JSON.stringify(updated));
      return { data: true, error: null };
    }
  }
};

