import React, { createContext, useContext, useState, useEffect } from 'react';
import { AIPrompt, AISkill, VideoConcept, BlogArticle, UserCollection, AppState } from '../types';
import { supabase } from '../services/supabase/client';
import { LanguageCode, parseLanguagePath, buildLocalizedPath, updateDocumentLanguageAndSeo, SUPPORTED_LANGUAGES, t as i18nT, getLocalizedItem } from '../lib/i18n';
import { PROMPTS } from '../data/prompts';
import { SKILLS } from '../data/skills';
import { VIDEO_CONCEPTS as VIDEOS } from '../data/videos';
import { BLOGS } from '../data/blogs';

interface AppContextType {
  // Data State
  prompts: AIPrompt[];
  skills: AISkill[];
  videos: VideoConcept[];
  blogs: BlogArticle[];

  // i18n Language State & Translation Helpers
  currentLang: LanguageCode;
  switchLanguage: (lang: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
  isRtl: boolean;

  // State Setters for Optimistic Updates
  setPrompts: React.Dispatch<React.SetStateAction<AIPrompt[]>>;
  setSkills: React.Dispatch<React.SetStateAction<AISkill[]>>;
  setVideos: React.Dispatch<React.SetStateAction<VideoConcept[]>>;
  setBlogs: React.Dispatch<React.SetStateAction<BlogArticle[]>>;
  
  // App Interaction State
  state: AppState;
  darkMode: boolean;
  activeTab: string; // 'home' | 'prompts' | 'skills' | 'videos' | 'blog' | 'dashboard' | 'search'
  activeDetail: { type: 'prompt' | 'skill' | 'video' | 'blog' | 'profile'; slug: string } | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Navigation
  navigateTo: (tab: string, detail?: { type: 'prompt' | 'skill' | 'video' | 'blog' | 'profile'; slug: string } | null) => void;
  
  // Actions
  toggleDarkMode: () => void;
  toggleLike: (type: 'prompts' | 'skills' | 'videos' | 'blogs', id: string) => void;
  toggleBookmark: (type: 'prompts' | 'skills' | 'videos', id: string) => void;
  registerDownload: (type: 'prompts' | 'skills' | 'videos', id: string) => void;
  addToHistory: (type: 'prompt' | 'skill' | 'video' | 'blog', id: string) => void;
  
  // Collections
  createCollection: (title: string, description: string) => void;
  deleteCollection: (id: string) => void;
  toggleItemInCollection: (collectionId: string, type: 'prompts' | 'skills' | 'videos', itemId: string) => void;
  toggleCollectionVisibility: (id: string) => void;
  
  // Creator Submissions (dynamic addition to state + localStorage)
  submitPrompt: (prompt: Omit<AIPrompt, 'id' | 'downloads' | 'views' | 'likes' | 'created_at'>) => void;
  submitSkill: (skill: Omit<AISkill, 'id' | 'downloads' | 'views' | 'likes'>) => void;
  submitVideo: (video: Omit<VideoConcept, 'id' | 'downloads' | 'views' | 'likes'>) => void;
  
  // Search state
  globalSearchFilter: string;
  setGlobalSearchFilter: (tab: string) => void;

  // Notification Banner
  notification: { message: string; type: 'success' | 'info' | 'error' } | null;
  showNotification: (message: string, type?: 'success' | 'info' | 'error') => void;

  // Supabase Auth and Admin Settings
  user: any;
  profile: any;
  isAdmin: boolean;
  isAuthLoading: boolean;
  logout: () => Promise<void>;
  refreshData: () => Promise<void>;
  updateProfile: (profileData: { username?: string; full_name?: string; avatar_url?: string; bio?: string }) => Promise<boolean>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (isOpen: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_STATE = 'promptat_app_state';
const STORAGE_KEY_PROMPTS = 'promptat_custom_prompts';
const STORAGE_KEY_SKILLS = 'promptat_custom_skills';
const STORAGE_KEY_VIDEOS = 'promptat_custom_videos';
const STORAGE_KEY_DARK = 'promptat_dark_mode';

const defaultAppState: AppState = {
  bookmarks: { prompts: [], skills: [], videos: [] },
  likes: { prompts: [], skills: [], videos: [], blogs: [] },
  downloads: { prompts: [], skills: [], videos: [] },
  history: [],
  collections: []
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state permanently locked to light mode
  const [darkMode] = useState<boolean>(false);

  // i18n Language State
  const [currentLang, setCurrentLang] = useState<LanguageCode>(() => {
    try {
      if (typeof window !== 'undefined') {
        const { lang, hasLangPrefix } = parseLanguagePath(window.location.pathname);
        if (hasLangPrefix) return lang;
        const saved = (localStorage.getItem('promptat_lang') || localStorage.getItem('gemiprompts_lang')) as LanguageCode;
        if (saved && SUPPORTED_LANGUAGES[saved]) return saved;
        
        // Browser language detection logic
        const browserLang = (navigator.language || '').toLowerCase();
        if (browserLang.startsWith('ar')) return 'ar';
        if (browserLang.startsWith('es')) return 'es';
        if (browserLang.startsWith('fr')) return 'fr';
        if (browserLang.startsWith('id')) return 'id';
      }
    } catch {
      // fallback
    }
    return 'ar';
  });

  // Client Routing State
  const [activeTab, setActiveTab] = useState<string>('home');
  const [activeDetail, setActiveDetail] = useState<{ type: 'prompt' | 'skill' | 'video' | 'blog' | 'profile'; slug: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [globalSearchFilter, setGlobalSearchFilter] = useState<string>('all');

  // Dynamic Library State loaded from static assets + local custom additions
  const [prompts, setPrompts] = useState<AIPrompt[]>(PROMPTS);
  const [skills, setSkills] = useState<AISkill[]>(SKILLS);
  const [videos, setVideos] = useState<VideoConcept[]>(VIDEOS);
  const [blogs, setBlogs] = useState<BlogArticle[]>(BLOGS);

  // User State: Bookmarks, Custom Collections, Likes, etc.
  const [state, setState] = useState<AppState>(defaultAppState);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Supabase Auth state variables with localStorage session hydration
  const [user, setUser] = useState<any>(() => {
    try {
      const cached = localStorage.getItem('promptat_user') || localStorage.getItem('gemiprompts_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [profile, setProfile] = useState<any>(() => {
    try {
      const cached = localStorage.getItem('promptat_profile') || localStorage.getItem('gemiprompts_profile');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      const cached = localStorage.getItem('promptat_is_admin') || localStorage.getItem('gemiprompts_is_admin');
      return cached === 'true';
    } catch {
      return false;
    }
  });
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Sync auth state to local storage for instant page-load persistence
  useEffect(() => {
    if (user) {
      localStorage.setItem('promptat_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('promptat_user');
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      localStorage.setItem('promptat_profile', JSON.stringify(profile));
      localStorage.setItem('promptat_is_admin', profile.role === 'admin' ? 'true' : 'false');
    } else {
      localStorage.removeItem('promptat_profile');
      localStorage.removeItem('promptat_is_admin');
    }
  }, [profile]);

  // Sync dark mode class on document element - permanently disabled
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem(STORAGE_KEY_DARK);
  }, []);

  // Dynamically manage text-direction (LTR/RTL) by updating document body's dir attribute
  // based on the selected language, ensuring layout consistency for all locales.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const config = SUPPORTED_LANGUAGES[currentLang] || SUPPORTED_LANGUAGES.ar;
    const direction = config.dir || (currentLang === 'ar' ? 'rtl' : 'ltr');

    // Update document body's dir attribute
    if (document.body) {
      document.body.dir = direction;
      document.body.setAttribute('dir', direction);
      if (direction === 'rtl') {
        document.body.classList.add('rtl');
        document.body.classList.remove('ltr');
      } else {
        document.body.classList.add('ltr');
        document.body.classList.remove('rtl');
      }
    }

    // Update documentElement for complete DOM tree consistency
    if (document.documentElement) {
      document.documentElement.dir = direction;
      document.documentElement.setAttribute('dir', direction);
      document.documentElement.lang = config.code || currentLang;
    }
  }, [currentLang]);

  // Sync / Stayka-login check
  useEffect(() => {
    const pathname = window.location.pathname;
    
    if (pathname === '/stayka-login') {
      window.history.replaceState(null, '', '/login');
      setActiveTab('login');
      showNotification('Redirecting to secure login...', 'info');
    } else if (pathname === '/login') {
      setActiveTab('login');
    }
  }, []);

  // Fetch data dynamically from Supabase with safe local static fallbacks
  const refreshData = async () => {
    try {
      // 1. Fetch Prompts
      const { data: promptsDb, error: pErr } = await supabase
        .from('prompts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!pErr && promptsDb) {
        // Map database response to type safely
        const formattedPrompts: AIPrompt[] = promptsDb.map((p: any) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          description: p.description || '',
          prompt: p.prompt,
          negative_prompt: p.negative_prompt || undefined,
          model: p.model,
          category_id: p.category_id || '',
          thumbnail: p.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
          gallery: p.gallery || [],
          style: p.style || undefined,
          camera: p.camera || undefined,
          lighting: p.lighting || undefined,
          aspect_ratio: p.aspect_ratio || undefined,
          difficulty: p.difficulty as 'Beginner' | 'Intermediate' | 'Expert',
          downloads: p.downloads || 0,
          views: p.views || 0,
          likes: p.likes || 0,
          featured: p.featured || false,
          premium: p.premium || false,
          seed: p.seed || undefined,
          created_at: p.created_at
        }));
        
        setPrompts(formattedPrompts.length > 0 ? formattedPrompts : PROMPTS);
      } else {
        setPrompts(PROMPTS);
      }

      // 2. Fetch Skills
      const { data: skillsDb, error: sErr } = await supabase
        .from('skills')
        .select('*')
        .order('created_at', { ascending: false });

      if (!sErr && skillsDb && skillsDb.length > 0) {
        const formattedSkills: AISkill[] = skillsDb.map((s: any) => ({
          id: s.id,
          title: s.title,
          slug: s.slug,
          description: s.description || '',
          cover: s.cover || 'https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&w=800&q=80',
          category_id: s.category_id || '',
          markdown_file: s.markdown_file,
          zip_file: s.zip_file || undefined,
          pdf_file: s.pdf_file || undefined,
          json_file: s.json_file || undefined,
          downloads: s.downloads || 0,
          views: s.views || 0,
          likes: s.likes || 0,
          version: s.version || '1.0.0',
          difficulty: s.difficulty as 'Beginner' | 'Intermediate' | 'Expert',
          featured: s.featured || false,
          premium: s.premium || false,
          supported_ai: s.supported_ai || [],
          installation: s.installation || 'Copy instructions into setup files.',
          how_to_use: s.how_to_use || 'Incorporate inside agent directives.'
        }));

        setSkills(formattedSkills);
      } else {
        setSkills(SKILLS);
      }

      // 3. Fetch Video Concepts
      const { data: videosDb, error: vErr } = await supabase
        .from('video_concepts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!vErr && videosDb && videosDb.length > 0) {
        const formattedVideos: VideoConcept[] = videosDb.map((v: any) => ({
          id: v.id,
          title: v.title,
          slug: v.slug,
          cover: v.cover || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
          description: v.description || '',
          hook: v.hook || '',
          niche: v.niche || '',
          difficulty: v.difficulty as 'Easy' | 'Medium' | 'Hard',
          expected_rpm: parseFloat(v.expected_rpm) || 0,
          competition: v.competition as 'Low' | 'Medium' | 'High',
          virality_score: v.virality_score || 50,
          ai_tools_needed: v.ai_tools_needed || [],
          channel_blueprint: v.channel_blueprint || '',
          video_structure: v.video_structure || [],
          thumbnail_prompt: v.thumbnail_prompt || '',
          voice_prompt: v.voice_prompt || '',
          editing_prompt: v.editing_prompt || '',
          image_prompt: v.image_prompt || '',
          animation_prompt: v.animation_prompt || '',
          titles: v.titles || [],
          description_seo: v.description_seo || '',
          tags: v.tags || [],
          hashtags: v.hashtags || [],
          publishing_schedule: v.publishing_schedule || '',
          monetization: v.monetization || [],
          affiliate_ideas: v.affiliate_ideas || [],
          resources: v.resources || [],
          downloads: v.downloads || 0,
          views: v.views || 0,
          likes: v.likes || 0,
          featured: v.featured || false
        }));

        setVideos(formattedVideos);
      } else {
        setVideos(VIDEOS);
      }

      // 4. Fetch Blog Articles
      const { data: blogsDb, error: bErr } = await supabase
        .from('blogs')
        .select('*, author:profiles(*)')
        .order('published_at', { ascending: false });

      if (!bErr && blogsDb && blogsDb.length > 0) {
        const formattedBlogs: BlogArticle[] = blogsDb.map((b: any) => ({
          id: b.id,
          title: b.title,
          slug: b.slug,
          cover: b.cover || 'https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&w=800&q=80',
          excerpt: b.excerpt || '',
          content: b.content || '',
          category: b.category || 'General',
          author: {
            name: b.author?.full_name || b.author?.username || 'Promptat Admin',
            avatar: b.author?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            role: b.author?.role || 'Admin Author'
          },
          published_at: b.published_at,
          views: b.views || 0,
          likes: b.likes || 0,
          read_time: `${Math.max(1, Math.ceil((b.content || '').split(/\s+/).length / 200))} min read`
        }));
        setBlogs(formattedBlogs);
      } else {
        setBlogs(BLOGS);
      }
    } catch (e) {
      console.warn('Could not load data from Supabase:', e);
      setPrompts(PROMPTS);
      setSkills(SKILLS);
      setVideos(VIDEOS);
      setBlogs(BLOGS);
    }
  };

  // Sync Collections from Supabase
  const syncCollectionsFromDb = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_collections')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      const dbCollections: UserCollection[] = (data || []).map((col: any) => ({
        id: col.id,
        title: col.title,
        description: col.description || '',
        itemIds: col.item_ids || { prompts: [], skills: [], videos: [] },
        created_at: col.created_at,
        is_custom: true,
        is_public: col.is_public
      }));

      // Merge local with DB collections.
      // We prioritize DB collections. If local has a collection not in DB, we should upload it!
      const localStateStr = localStorage.getItem(STORAGE_KEY_STATE);
      let localStateCollections: UserCollection[] = [];
      if (localStateStr) {
        try {
          const parsed = JSON.parse(localStateStr);
          localStateCollections = parsed.collections || [];
        } catch (e) {
          console.error(e);
        }
      }

      const mergedCollections = [...dbCollections];
      const collectionsToUpload: UserCollection[] = [];

      for (const localCol of localStateCollections) {
        const existsInDb = dbCollections.some(dbCol => dbCol.id === localCol.id);
        if (!existsInDb) {
          const nextCol = { ...localCol, is_public: localCol.is_public ?? false };
          mergedCollections.push(nextCol);
          collectionsToUpload.push(nextCol);
        }
      }

      // Upload local-only collections to Supabase
      if (collectionsToUpload.length > 0) {
        const rows = collectionsToUpload.map(col => ({
          id: col.id,
          user_id: userId,
          title: col.title,
          description: col.description,
          is_public: col.is_public || false,
          item_ids: col.itemIds,
          created_at: col.created_at
        }));

        await supabase.from('user_collections').insert(rows);
      }

      setState(prev => {
        const nextState = {
          ...prev,
          collections: mergedCollections
        };
        localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(nextState));
        return nextState;
      });

    } catch (err) {
      console.error('Failed to sync collections from DB:', err);
    }
  };

  // Profile Fetcher
  const fetchProfile = async (uid: string, currentUserObj?: any) => {
    try {
      const activeUser = currentUserObj || user;
      const userEmail = activeUser?.email;
      const isDefaultAdmin = userEmail === 'backup30stoph@gmail.com';

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();

      if (!error && data) {
        let currentProfile = data;
        // Auto-promote the default admin to role 'admin' in Supabase DB if not already
        if (isDefaultAdmin && data.role !== 'admin') {
          console.log('[fetchProfile] Promoting default admin in database...');
          const { error: updateErr } = await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', uid);
          
          if (!updateErr) {
            currentProfile = { ...data, role: 'admin' };
          } else {
            console.warn('[fetchProfile] Admin promotion failed:', updateErr.message);
          }
        }
        setProfile(currentProfile);
        setIsAdmin(currentProfile.role === 'admin' || isDefaultAdmin);
      } else {
        // Fallback profile representation
        const fallbackProfile = {
          id: uid,
          username: userEmail?.split('@')[0] || 'creator',
          full_name: 'Promptat Admin',
          role: isDefaultAdmin ? 'admin' : 'user',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
        };
        setProfile(fallbackProfile);
        setIsAdmin(isDefaultAdmin);

        // Try to insert fallback profile into DB so it exists for policies and is correct
        if (activeUser) {
          console.log('[fetchProfile] Creating default profile in database...');
          const { error: insertErr } = await supabase
            .from('profiles')
            .insert([fallbackProfile]);
          if (insertErr) {
            console.warn('[fetchProfile] Could not auto-insert default profile:', insertErr.message);
          }
        }
      }

      // Sync collections from database for this user
      await syncCollectionsFromDb(uid);
    } catch (e) {
      console.error('Profile load error', e);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Update Profile
  const updateProfile = async (profileData: { username?: string; full_name?: string; avatar_url?: string; bio?: string }) => {
    if (!user) return false;
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);

      if (error) {
        console.error('Supabase update profile error', error);
        // Fallback local update
        setProfile(prev => prev ? { ...prev, ...profileData } : null);
        return true;
      }
      
      // Reload profile
      await fetchProfile(user.id, user);
      return true;
    } catch (e) {
      // Local fallback
      setProfile(prev => prev ? { ...prev, ...profileData } : null);
      return true;
    }
  };

  // Logout trigger
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
    showNotification('Logged out successfully!', 'info');
    navigateTo('home');
  };

  // Listen to Auth State
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id, session.user);
      } else {
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        setIsAuthLoading(false);
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id, session.user);
      } else {
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        setIsAuthLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Initial load
  useEffect(() => {
    // App State Loading
    const savedState = localStorage.getItem(STORAGE_KEY_STATE);
    if (savedState) {
      try {
        setState(JSON.parse(savedState));
      } catch (e) {
        console.error('Failed to parse saved state', e);
      }
    }

    refreshData();
  }, []);

  const parsePathAndRoute = (pathname: string) => {
    const { lang, basePath, hasLangPrefix } = parseLanguagePath(pathname);
    
    // Sync active language and document properties
    setCurrentLang(lang);
    if (typeof document !== 'undefined') {
      const config = SUPPORTED_LANGUAGES[lang] || SUPPORTED_LANGUAGES.en;
      const direction = config.dir || (lang === 'ar' ? 'rtl' : 'ltr');
      if (document.body) {
        document.body.dir = direction;
        document.body.setAttribute('dir', direction);
      }
      document.documentElement.lang = config.code;
      document.documentElement.dir = direction;
      document.documentElement.setAttribute('dir', direction);
    }

    const cleanPath = basePath.replace(/\/+$/, '') || '/'; // e.g. "/prompts/biophilic" or "/prompts" or "/"
    const parts = cleanPath.split('/').filter(Boolean); // e.g. ['prompts', 'biophilic']

    if (parts.length === 0) {
      setActiveTab('home');
      setActiveDetail(null);
      return;
    }

    if (parts[0] === 'auth' && parts[1] === 'callback') {
      setActiveTab('auth-callback');
      setActiveDetail(null);
      return;
    }

    if (parts[0] === 'account') {
      setActiveTab('account-settings');
      setActiveDetail(null);
      return;
    }

    if (parts[0] === 'u' && parts.length === 2) {
      setActiveTab('public-profile');
      setActiveDetail({ type: 'profile', slug: parts[1] });
      return;
    }

    if (parts[0] === 'adminato-login') {
      setActiveTab('adminato-login');
      setActiveDetail(null);
      return;
    }

    if (parts[0] === 'login' || parts[0] === 'stayka-login') {
      setActiveTab('login');
      setActiveDetail(null);
      return;
    }

    if (parts[0] === 'admin') {
      setActiveTab('admin');
      setActiveDetail(null);
      return;
    }

    if (parts[0] === 'search') {
      setActiveTab('search');
      setActiveDetail(null);
      return;
    }

    // Check detail views with plural paths
    if (parts.length === 2) {
      const parentTab = parts[0]; // e.g., 'prompts', 'skills', 'videos', 'blog'
      const slug = parts[1];

      if (parentTab === 'prompts' || parentTab === 'prompt') {
        setActiveTab('prompts');
        setActiveDetail({ type: 'prompt', slug });
      } else if (parentTab === 'skills' || parentTab === 'skill') {
        setActiveTab('skills');
        setActiveDetail({ type: 'skill', slug });
      } else if (parentTab === 'videos' || parentTab === 'video') {
        setActiveTab('videos');
        setActiveDetail({ type: 'video', slug });
      } else if (parentTab === 'blog') {
        setActiveTab('blog');
        setActiveDetail({ type: 'blog', slug });
      } else {
        // Fallback for custom routing
        setActiveTab(parentTab);
        setActiveDetail(null);
      }
    } else {
      // Just category level
      const tab = parts[0];
      if (tab === 'prompts' || tab === 'prompt') {
        setActiveTab('prompts');
      } else if (tab === 'skills' || tab === 'skill') {
        setActiveTab('skills');
      } else if (tab === 'videos' || tab === 'video') {
        setActiveTab('videos');
      } else if (tab === 'blog') {
        setActiveTab('blog');
      } else {
        setActiveTab(tab);
      }
      setActiveDetail(null);
    }
  };

  // Handle Clean BrowserRouter Paths on Mount, and support legacy Hash URL redirect shim
  useEffect(() => {
    const hash = window.location.hash;
    const pathname = window.location.pathname;

    if (hash && hash.length > 1) {
      const hashContent = hash.replace('#', ''); // e.g. "blog/some-slug" or "prompt/biophilic"
      const parts = hashContent.split('/');
      
      let cleanPath = '/';
      if (parts.length === 2) {
        let type = parts[0];
        const slug = parts[1];
        
        // Fix singular -> plural segments for legacy links
        if (type === 'prompt') type = 'prompts';
        else if (type === 'skill') type = 'skills';
        else if (type === 'video') type = 'videos';
        
        cleanPath = `/${type}/${slug}`;
      } else if (parts.length === 1) {
        let tab = parts[0];
        if (tab === 'prompt') tab = 'prompts';
        else if (tab === 'skill') tab = 'skills';
        else if (tab === 'video') tab = 'videos';
        else if (tab === 'stayka-login') tab = 'login';
        
        cleanPath = `/${tab}`;
      }

      // Replace history state with new clean plural path
      window.history.replaceState(null, '', cleanPath);
      // Clear hash to prevent loops
      window.location.hash = '';
      
      // Parse and sync state
      parsePathAndRoute(cleanPath);
      showNotification('Redirected from legacy link to clean URL', 'info');
    } else {
      // Direct load with clean path
      parsePathAndRoute(pathname);
    }

    // Listen to popstate for back/forward navigation
    const handlePopState = () => {
      parsePathAndRoute(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Save state helper
  const saveState = async (newState: AppState) => {
    setState(newState);
    localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(newState));

    if (user) {
      try {
        const collectionsToSync = newState.collections;
        const rows = collectionsToSync.map(col => ({
          id: col.id,
          user_id: user.id,
          title: col.title,
          description: col.description,
          is_public: col.is_public || false,
          item_ids: col.itemIds,
          created_at: col.created_at,
          updated_at: new Date().toISOString()
        }));

        if (rows.length > 0) {
          const { error } = await supabase
            .from('user_collections')
            .upsert(rows);
          if (error) {
            console.error('Error syncing collections to Supabase:', error);
          }
        }
      } catch (err) {
        console.error('Failed to sync state to Supabase:', err);
      }
    }
  };

  // Toast Notification Trigger
  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Language Switcher Controller
  const switchLanguage = (newLang: LanguageCode) => {
    setCurrentLang(newLang);
    localStorage.setItem('promptat_lang', newLang);
    const { basePath } = parseLanguagePath(window.location.pathname);
    const localizedPath = buildLocalizedPath(basePath, newLang);
    window.history.pushState(null, '', localizedPath);
    
    // Update HTML doc language and direction
    const config = SUPPORTED_LANGUAGES[newLang] || SUPPORTED_LANGUAGES.ar;
    const direction = config.dir || (newLang === 'ar' ? 'rtl' : 'ltr');
    if (document.body) {
      document.body.dir = direction;
      document.body.setAttribute('dir', direction);
    }
    document.documentElement.lang = config.code;
    document.documentElement.dir = direction;
    document.documentElement.setAttribute('dir', direction);

    updateDocumentLanguageAndSeo(
      newLang,
      basePath,
      document.title,
      'برومبتات أونلاين | Promptat Online - منصة النماذج والتعليمات الذكية'
    );
    showNotification(`Language switched to ${config.nativeName}`, 'info');
  };

  // Navigation controller using HTML5 History API (BrowserRouter style)
  const navigateTo = (tab: string, detail: { type: 'prompt' | 'skill' | 'video' | 'blog' | 'profile'; slug: string } | null = null) => {
    let basePath = '/';
    if (detail) {
      if (detail.type === 'profile') {
        basePath = `/u/${detail.slug}`;
        setActiveDetail(detail);
        setActiveTab('public-profile');
      } else {
        let pluralType = detail.type as string;
        if (detail.type === 'prompt') pluralType = 'prompts';
        else if (detail.type === 'skill') pluralType = 'skills';
        else if (detail.type === 'video') pluralType = 'videos';
        
        basePath = `/${pluralType}/${detail.slug}`;
        setActiveDetail(detail);
        setActiveTab(pluralType);
        // Track views incrementally
        incrementViews(detail.type, detail.slug);
        addToHistory(detail.type, detail.slug);
      }
    } else {
      if (tab !== 'home') {
        basePath = `/${tab}`;
      }
      setActiveTab(tab);
      setActiveDetail(null);
    }
    
    const localizedPath = buildLocalizedPath(basePath, currentLang);
    window.history.pushState(null, '', localizedPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleDarkMode = () => {
    // Permanently disabled
  };

  // Helper to increment view count locally
  const incrementViews = (type: 'prompt' | 'skill' | 'video' | 'blog', slug: string) => {
    if (type === 'prompt') {
      setPrompts(prev => prev.map(p => p.slug === slug ? { ...p, views: p.views + 1 } : p));
    } else if (type === 'skill') {
      setSkills(prev => prev.map(s => s.slug === slug ? { ...s, views: s.views + 1 } : s));
    } else if (type === 'video') {
      setVideos(prev => prev.map(v => v.slug === slug ? { ...v, views: v.views + 1 } : v));
    }
  };

  // Interaction: Like
  const toggleLike = (type: 'prompts' | 'skills' | 'videos' | 'blogs', id: string) => {
    const isLiked = state.likes[type].includes(id);
    const newList = isLiked
      ? state.likes[type].filter(item => item !== id)
      : [...state.likes[type], id];

    const newState = {
      ...state,
      likes: { ...state.likes, [type]: newList }
    };

    saveState(newState);

    // Adjust count in state
    const modifier = isLiked ? -1 : 1;
    if (type === 'prompts') {
      setPrompts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + modifier } : p));
    } else if (type === 'skills') {
      setSkills(prev => prev.map(s => s.id === id ? { ...s, likes: s.likes + modifier } : s));
    } else if (type === 'videos') {
      setVideos(prev => prev.map(v => v.id === id ? { ...v, likes: v.likes + modifier } : v));
    }

    showNotification(isLiked ? 'Removed from Liked list' : 'Added to Liked list!', 'success');
  };

  // Interaction: Bookmark
  const toggleBookmark = (type: 'prompts' | 'skills' | 'videos', id: string) => {
    const isBookmarked = state.bookmarks[type].includes(id);
    const newList = isBookmarked
      ? state.bookmarks[type].filter(item => item !== id)
      : [...state.bookmarks[type], id];

    const newState = {
      ...state,
      bookmarks: { ...state.bookmarks, [type]: newList }
    };

    saveState(newState);
    showNotification(isBookmarked ? 'Removed from bookmarks' : 'Added to Bookmarks!', 'success');
  };

  // Interaction: Download simulator
  const registerDownload = (type: 'prompts' | 'skills' | 'videos', id: string) => {
    const isDownloaded = state.downloads[type].includes(id);
    const newList = isDownloaded ? state.downloads[type] : [...state.downloads[type], id];

    const newState = {
      ...state,
      downloads: { ...state.downloads, [type]: newList }
    };

    saveState(newState);

    if (!isDownloaded) {
      if (type === 'prompts') {
        setPrompts(prev => prev.map(p => p.id === id ? { ...p, downloads: p.downloads + 1 } : p));
      } else if (type === 'skills') {
        setSkills(prev => prev.map(s => s.id === id ? { ...s, downloads: s.downloads + 1 } : s));
      } else if (type === 'videos') {
        setVideos(prev => prev.map(v => v.id === id ? { ...v, downloads: v.downloads + 1 } : v));
      }
    }
    showNotification('Download started successfully!', 'success');
  };

  // History Tracker
  const addToHistory = (type: 'prompt' | 'skill' | 'video' | 'blog', id: string) => {
    const item = { id, type, timestamp: new Date().toISOString() };
    const filteredHistory = state.history.filter(h => !(h.id === id && h.type === type));
    const newHistory = [item, ...filteredHistory].slice(0, 50); // limit to last 50 items

    saveState({
      ...state,
      history: newHistory
    });
  };

  // Collection: Create
  const createCollection = (title: string, description: string) => {
    const newCollection: UserCollection = {
      id: `col-${Date.now()}`,
      title,
      description,
      itemIds: { prompts: [], skills: [], videos: [] },
      created_at: new Date().toISOString(),
      is_custom: true,
      is_public: false
    };

    const newState = {
      ...state,
      collections: [...state.collections, newCollection]
    };

    saveState(newState);
    showNotification(`Collection "${title}" created!`, 'success');
  };

  // Collection: Delete
  const deleteCollection = async (id: string) => {
    const colToDelete = state.collections.find(c => c.id === id);
    if (!colToDelete) return;
    if (!colToDelete.is_custom) {
      showNotification('Cannot delete default collections.', 'error');
      return;
    }

    const newState = {
      ...state,
      collections: state.collections.filter(c => c.id !== id)
    };

    await saveState(newState);

    if (user) {
      try {
        await supabase
          .from('user_collections')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
      } catch (err) {
        console.error('Error deleting collection from database:', err);
      }
    }
    showNotification(`Collection deleted successfully.`, 'success');
  };

  // Collection: Add/Remove Item
  const toggleItemInCollection = (collectionId: string, type: 'prompts' | 'skills' | 'videos', itemId: string) => {
    const updatedCollections = state.collections.map(col => {
      if (col.id === collectionId) {
        const list = col.itemIds[type] || [];
        const exists = list.includes(itemId);
        const newList = exists 
          ? list.filter(id => id !== itemId)
          : [...list, itemId];
        
        return {
          ...col,
          itemIds: {
            ...col.itemIds,
            [type]: newList
          }
        };
      }
      return col;
    });

    const targetCol = state.collections.find(c => c.id === collectionId);
    const itemExists = targetCol?.itemIds[type].includes(itemId);

    saveState({
      ...state,
      collections: updatedCollections
    });

    showNotification(
      itemExists 
        ? 'Removed from collection' 
        : `Added to collection "${targetCol?.title}"!`, 
      'success'
    );
  };

  // Collection: Toggle Visibility
  const toggleCollectionVisibility = async (id: string) => {
    const targetCol = state.collections.find(c => c.id === id);
    if (!targetCol) return;

    const nextPublic = !targetCol.is_public;
    const updatedCollections = state.collections.map(col => {
      if (col.id === id) {
        return {
          ...col,
          is_public: nextPublic
        };
      }
      return col;
    });

    const newState = {
      ...state,
      collections: updatedCollections
    };

    await saveState(newState);

    showNotification(
      `Collection is now ${nextPublic ? 'Public' : 'Private'}!`,
      'success'
    );
  };

  // --- Dynamic Submissions via Supabase ---
  const submitPrompt = async (promptData: Omit<AIPrompt, 'id' | 'downloads' | 'views' | 'likes' | 'created_at'>) => {
    try {
      const { error } = await supabase.from('prompts').insert([promptData]);
      if (error) throw error;
      showNotification('Prompt successfully published to Creator Hub!', 'success');
      refreshData();
      navigateTo('prompts');
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || 'Error publishing prompt', 'error');
    }
  };

  const submitSkill = async (skillData: Omit<AISkill, 'id' | 'downloads' | 'views' | 'likes'>) => {
    try {
      const { error } = await supabase.from('skills').insert([skillData]);
      if (error) throw error;
      showNotification('Developer Skill successfully published to Creator Hub!', 'success');
      refreshData();
      navigateTo('skills');
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || 'Error publishing skill', 'error');
    }
  };

  const submitVideo = async (videoData: Omit<VideoConcept, 'id' | 'downloads' | 'views' | 'likes'>) => {
    try {
      const { error } = await supabase.from('video_concepts').insert([videoData]);
      if (error) throw error;
      showNotification('Viral Video Concept successfully published to Creator Hub!', 'success');
      refreshData();
      navigateTo('videos');
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || 'Error publishing video concept', 'error');
    }
  };

  // Enable Supabase Realtime Broadcast Subscriptions for instant synchronization
  useEffect(() => {
    console.log('[Realtime] Setting up database listeners...');
    
    const handleDbChange = (payload: any) => {
      console.log('[Realtime] Database change detected:', payload.eventType, 'on', payload.table);
      refreshData();
      
      // Dispatch a custom event to notify other mounted components (like Admin categories page)
      window.dispatchEvent(new CustomEvent('supabase-db-change', { detail: payload }));
    };

    const channels = [
      supabase
        .channel('public-prompts-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'prompts' }, handleDbChange)
        .subscribe(),

      supabase
        .channel('public-skills-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'skills' }, handleDbChange)
        .subscribe(),

      supabase
        .channel('public-video-concepts-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'video_concepts' }, handleDbChange)
        .subscribe(),

      supabase
        .channel('public-blogs-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'blogs' }, handleDbChange)
        .subscribe(),

      supabase
        .channel('public-categories-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, handleDbChange)
        .subscribe()
    ];

    return () => {
      console.log('[Realtime] Cleaning up database listeners...');
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, []);

  const setAuthModalOpenWithRedirect = (isOpen: boolean) => {
    if (isOpen) {
      const path = window.location.pathname;
      if (path && !path.includes('auth/callback') && !path.includes('login')) {
        localStorage.setItem('auth_return_to', path);
      }
    }
    setIsAuthModalOpen(isOpen);
  };

  return (
    <AppContext.Provider value={{
      prompts,
      skills,
      videos,
      blogs,
      setPrompts,
      setSkills,
      setVideos,
      setBlogs,
      currentLang,
      switchLanguage,
      t: (key: string, fallback?: string) => i18nT(key, currentLang, fallback),
      isRtl: currentLang === 'ar',
      state,
      darkMode,
      activeTab,
      activeDetail,
      searchQuery,
      setSearchQuery,
      navigateTo,
      toggleDarkMode,
      toggleLike,
      toggleBookmark,
      registerDownload,
      addToHistory,
      createCollection,
      deleteCollection,
      toggleItemInCollection,
      toggleCollectionVisibility,
      submitPrompt,
      submitSkill,
      submitVideo,
      globalSearchFilter,
      setGlobalSearchFilter,
      notification,
      showNotification,
      user,
      profile,
      isAdmin,
      isAuthLoading,
      logout,
      refreshData,
      updateProfile,
      isAuthModalOpen,
      setIsAuthModalOpen: setAuthModalOpenWithRedirect
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
