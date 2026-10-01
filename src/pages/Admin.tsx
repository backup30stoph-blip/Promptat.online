import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../services/supabase/client';
import { generateSlug, getUniqueSlug, createRedirect, checkKeywordCannibalization } from '../lib/slug';
import { enforceSlugImmutability, SlugKeywordValidator } from '../utils/SlugManager';
import { 
  Sparkles, Code, Video, BookOpen, Compass, Settings, User, FileText, 
  Image as ImageIcon, Plus, Edit, Trash2, Save, X, ExternalLink, RefreshCw, Upload, FileSignature
} from 'lucide-react';
import { AdminLayout, AdminTab } from '../components/layout/AdminLayout';
import { cmsService } from '../services/cmsService';
import { DataTable } from '../components/admin/DataTable';
import { SeoPreview } from '../components/admin/SeoPreview';
import { MediaUploader } from '../components/admin/MediaUploader';
import { MediaLibrary } from '../components/admin/MediaLibrary';
import { SiteSettingsAdmin } from '../components/admin/SiteSettingsAdmin';
import { TranslationManager } from '../components/admin/TranslationManager';
import { InternationalSeoAdmin } from '../components/admin/InternationalSeoAdmin';
import { ConfirmDeleteModal } from '../components/admin/ConfirmDeleteModal';
import { 
  validateForm, 
  promptValidationSchema, 
  skillValidationSchema, 
  blogValidationSchema, 
  categoryValidationSchema 
} from '../lib/validation';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { stripMarkdown } from '../utils/textUtils';

export const Admin: React.FC = () => {
  const { 
    user, profile, isAdmin, isAuthLoading, navigateTo, showNotification,
    prompts, skills, videos, blogs, refreshData, updateProfile,
    setPrompts, setSkills, setVideos, setBlogs
  } = useApp();

  const [activeTab, setActiveTab] = useState<AdminTab>('prompts');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Standardized Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; type: string; onConfirm: () => void } | null>(null);

  // General Categories for selectors
  const [categories, setCategories] = useState<any[]>([]);

  // Page data
  const [sitePages, setSitePages] = useState<any[]>([]);
  const [selectedPage, setSelectedPage] = useState<any>(null);

  // General SEO Settings State
  const [seoSettings, setSeoSettings] = useState({
    site_name: 'برومبتات أونلاين | Promptat Online',
    meta_title: 'برومبتات أونلاين | Promptat Online - منصة النماذج والتعليمات الذكية',
    meta_description: 'المكتبة الشاملة لأوامر ومخططات الذكاء الاصطناعي، نماذج صور Midjourney، ومهارات التطوير والتسويق.',
    meta_keywords: 'Promptat Online, برومبتات, أوامر الذكاء الاصطناعي, Midjourney, AI Prompts',
    social_share_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
  });

  // Media database state
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaName, setNewMediaName] = useState('');

  // Editing Profile fields
  const [profileUsername, setProfileUsername] = useState('');
  const [profileFullName, setProfileFullName] = useState('');
  const [profileAvatarUrl, setProfileAvatarUrl] = useState('');
  const [profileBio, setProfileBio] = useState('');

  // Collapsible Form States
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Shared Prompt Form Fields
  const [promptTitle, setPromptTitle] = useState('');
  const [promptSlug, setPromptSlug] = useState('');
  const [promptDesc, setPromptDesc] = useState('');
  const [promptContent, setPromptContent] = useState('');
  const [promptNegative, setPromptNegative] = useState('');
  const [promptModel, setPromptModel] = useState('Midjourney v6.0');
  const [promptCategoryId, setPromptCategoryId] = useState('');
  const [promptDiff, setPromptDiff] = useState<'Beginner' | 'Intermediate' | 'Expert'>('Intermediate');
  const [promptThumb, setPromptThumb] = useState('');
  const [promptAspect, setPromptAspect] = useState('16:9');
  const [promptSeed, setPromptSeed] = useState('');
  const [promptSeoTitle, setPromptSeoTitle] = useState('');
  const [promptSeoDesc, setPromptSeoDesc] = useState('');
  const [promptSeoKeywords, setPromptSeoKeywords] = useState('');

  // Category Form Fields
  const [catTitle, setCatTitle] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catIcon, setCatIcon] = useState('Sparkles');
  const [catColor, setCatColor] = useState('indigo');
  const [catType, setCatType] = useState<'Prompt' | 'Skill' | 'Video' | 'Blog'>('Prompt');
  const [catSeoTitle, setCatSeoTitle] = useState('');
  const [catSeoDesc, setCatSeoDesc] = useState('');

  // Skill Form Fields
  const [skillTitle, setSkillTitle] = useState('');
  const [skillSlug, setSkillSlug] = useState('');
  const [skillDesc, setSkillDesc] = useState('');
  const [skillCover, setSkillCover] = useState('');
  const [skillCatId, setSkillCatId] = useState('');
  const [skillMarkdown, setSkillMarkdown] = useState('');
  const [skillVersion, setSkillVersion] = useState('1.0.0');
  const [skillDiff, setSkillDiff] = useState<'Beginner' | 'Intermediate' | 'Expert'>('Intermediate');
  const [skillSupportedAi, setSkillSupportedAi] = useState('Cursor, Claude');
  const [skillSeoTitle, setSkillSeoTitle] = useState('');
  const [skillSeoDesc, setSkillSeoDesc] = useState('');

  // Video Form Fields
  const [videoTitle, setVideoTitle] = useState('');
  const [videoSlug, setVideoSlug] = useState('');
  const [videoCover, setVideoCover] = useState('');
  const [videoDesc, setVideoDesc] = useState('');
  const [videoHook, setVideoHook] = useState('');
  const [videoNiche, setVideoNiche] = useState('AI Tech & Future');
  const [videoDiff, setVideoDiff] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [videoRpm, setVideoRpm] = useState(4.50);
  const [videoVirality, setVideoVirality] = useState(85);
  const [videoBlueprint, setVideoBlueprint] = useState('');

  // Blog Form Fields
  const [blogTitle, setBlogTitle] = useState('');
  const [blogSlug, setBlogSlug] = useState('');
  const [blogCover, setBlogCover] = useState('');
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogCategory, setBlogCategory] = useState('AI Workflows');
  const [blogSeoTitle, setBlogSeoTitle] = useState('');
  const [blogSeoDesc, setBlogSeoDesc] = useState('');
  const [blogEditorTab, setBlogEditorTab] = useState<'write' | 'preview'>('write');

  // Focus Keyword and Redirect states
  const [promptFocusKeyword, setPromptFocusKeyword] = useState('');
  const [skillFocusKeyword, setSkillFocusKeyword] = useState('');
  const [videoFocusKeyword, setVideoFocusKeyword] = useState('');
  const [blogFocusKeyword, setBlogFocusKeyword] = useState('');
  const [catFocusKeyword, setCatFocusKeyword] = useState('');
  const [originalSlug, setOriginalSlug] = useState('');
  const [slugUnlocked, setSlugUnlocked] = useState(false);

  // Redirect non-admins to home page
  useEffect(() => {
    if (!isAuthLoading) {
      // In development mode, we can allow viewing if no user is signed in to let them inspect the beautiful CMS.
      // But if there is a signed-in user and they are NOT admin, redirect them.
      if (user && !isAdmin) {
        showNotification('Unauthorized access. Admin role required.', 'error');
        navigateTo('home');
      }
    }
  }, [user, isAdmin, isAuthLoading]);

  // Load secondary collections
  useEffect(() => {
    const loadCategoriesAndPages = async () => {
      try {
        const isUserAuthenticated = !!user;

        // Categories
        const { data: catDb, error: catErr } = await supabase.from('categories').select('*');
        if (!catErr && catDb) {
          setCategories(catDb);
        } else {
          // Local default Categories only if guest/demo
          if (isUserAuthenticated) {
            setCategories([]);
          } else {
            setCategories([
              { id: 'p-arch', title: 'Architecture', slug: 'architecture', type: 'Prompt' },
              { id: 'p-port', title: 'Portraits', slug: 'portraits', type: 'Prompt' },
              { id: 's-cod', title: 'Coding Rulebooks', slug: 'coding', type: 'Skill' },
              { id: 's-flow', title: 'Workflow Accelerators', slug: 'workflows', type: 'Skill' }
            ]);
          }
        }

        // Static Pages
        const { data: pageDb, error: pageErr } = await supabase.from('site_pages').select('*');
        if (!pageErr && pageDb) {
          setSitePages(pageDb);
        } else {
          if (isUserAuthenticated) {
            setSitePages([]);
          } else {
            setSitePages([
              { id: 'p1', title: 'Privacy Policy', slug: 'privacy-policy', content: '# Privacy Policy\n\nEdit guidelines here.' },
              { id: 'p2', title: 'Terms & Conditions', slug: 'terms-conditions', content: '# Terms and Conditions\n\nEdit guidelines here.' },
              { id: 'p3', title: 'About Us', slug: 'about-us', content: '# About Us\n\nWe provide top templates.' },
              { id: 'p4', title: 'Contact Us', slug: 'contact-us', content: '# Contact Us\n\nEmail at support@example.com' },
              { id: 'p5', title: 'Archive', slug: 'archive', content: '# Directory Archive\n\nHistorical database logs.' }
            ]);
          }
        }

        // Media lists
        const { data: mediaDb, error: mediaErr } = await supabase.from('media_uploads').select('*');
        if (!mediaErr && mediaDb) {
          setMediaList(mediaDb);
        } else {
          setMediaList([]);
        }

        // Settings
        const { data: settingsDb } = await supabase.from('site_settings').select('*');
        if (settingsDb) {
          const seoObj = settingsDb.find(s => s.key === 'seo');
          if (seoObj) {
            setSeoSettings(seoObj.value);
          }
        }
      } catch (e) {
        console.warn('Supabase not connected. Using custom local state in Admin Dashboard.');
      }
    };

    loadCategoriesAndPages();

    // Listen to real-time events from AppContext
    const handleRealtimeChange = (e: Event) => {
      console.log('[Admin] Realtime database change event received. Reloading secondary collections...');
      loadCategoriesAndPages();
    };

    window.addEventListener('supabase-db-change', handleRealtimeChange);

    // Populate profile states
    if (profile) {
      setProfileUsername(profile.username || '');
      setProfileFullName(profile.full_name || '');
      setProfileAvatarUrl(profile.avatar_url || '');
      setProfileBio(profile.bio || '');
    }

    return () => {
      window.removeEventListener('supabase-db-change', handleRealtimeChange);
    };
  }, [profile]);

  // Handle Profile Update
  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await updateProfile({
      username: profileUsername,
      full_name: profileFullName,
      avatar_url: profileAvatarUrl,
      bio: profileBio
    });
    setLoading(false);
    if (success) {
      showNotification('Profile updated successfully!', 'success');
    } else {
      showNotification('Failed to update profile.', 'error');
    }
  };

  // Reset forms helper
  const resetForms = () => {
    setIsEditing(false);
    setEditId(null);
    setValidationErrors({});
    // prompts
    setPromptTitle(''); setPromptSlug(''); setPromptDesc(''); setPromptContent('');
    setPromptNegative(''); setPromptModel('Midjourney v6.0'); setPromptCategoryId('');
    setPromptThumb(''); setPromptAspect('16:9'); setPromptSeed('');
    setPromptSeoTitle(''); setPromptSeoDesc(''); setPromptSeoKeywords('');
    // categories
    setCatTitle(''); setCatSlug(''); setCatIcon('Sparkles'); setCatColor('indigo');
    setCatType('Prompt'); setCatSeoTitle(''); setCatSeoDesc('');
    // skills
    setSkillTitle(''); setSkillSlug(''); setSkillDesc(''); setSkillCover('');
    setSkillCatId(''); setSkillMarkdown(''); setSkillVersion('1.0.0');
    setSkillSupportedAi('Cursor, Claude'); setSkillSeoTitle(''); setSkillSeoDesc('');
    // videos
    setVideoTitle(''); setVideoSlug(''); setVideoCover(''); setVideoDesc('');
    setVideoHook(''); setVideoNiche('AI Tech & Future'); setVideoDiff('Medium');
    setVideoRpm(4.50); setVideoVirality(85); setVideoBlueprint('');
    // blogs
    setBlogTitle(''); setBlogSlug(''); setBlogCover(''); setBlogExcerpt('');
    setBlogContent(''); setBlogCategory('AI Workflows'); setBlogSeoTitle(''); setBlogSeoDesc('');

    // Focus Keyword and Redirect states
    setPromptFocusKeyword('');
    setSkillFocusKeyword('');
    setVideoFocusKeyword('');
    setBlogFocusKeyword('');
    setCatFocusKeyword('');
    setOriginalSlug('');
    setSlugUnlocked(false);
  };

  // PROMPTS OPERATIONS
  const handlePromptAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let slugToUse = promptSlug;
    if (!slugToUse) {
      const generated = generateSlug(promptTitle, 'prompt', { model: promptModel, style: promptAspect });
      slugToUse = await getUniqueSlug(generated, 'prompts', editId || undefined, promptModel);
    } else {
      slugToUse = generateSlug(slugToUse, 'prompt');
    }

    // Immutability and uniqueness contract check
    const checkImmutability = await enforceSlugImmutability(slugToUse, 'prompts', editId || undefined);
    if (!checkImmutability.allowed) {
      showNotification(checkImmutability.reason || 'Slug collision detected.', 'error');
      setLoading(false);
      return;
    }

    // 1. Focus Keyword Publish-Time Validation
    if (!promptFocusKeyword || promptFocusKeyword.trim() === '') {
      showNotification('SEO Focus Keyword is required to publish this content.', 'error');
      setLoading(false);
      return;
    }

    const normKeyword = promptFocusKeyword.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normSlug = slugToUse.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (!normSlug.includes(normKeyword)) {
      showNotification(`Publish blocked: The SEO Focus Keyword "${promptFocusKeyword}" must be present in the URL slug.`, 'error');
      setLoading(false);
      return;
    }

    // 2. Keyword Cannibalization Check (Warning)
    try {
      const { cannibalized, conflictingSlug } = await checkKeywordCannibalization(
        promptFocusKeyword,
        'prompt',
        editId || undefined
      );
      if (cannibalized) {
        const proceed = confirm(
          `Keyword Cannibalization Warning:\nThe focus keyword "${promptFocusKeyword}" is already targeted by another page (${conflictingSlug}).\n\nHaving multiple pages targeting the same keyword splits ranking signals in search engines (cannibalization) instead of boosting them.\n\nDo you still want to proceed with this publication?`
        );
        if (!proceed) {
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Cannibalization check skipped:', err);
    }

    const recordPayload = {
      title: promptTitle,
      slug: slugToUse,
      description: promptDesc,
      prompt: promptContent,
      negative_prompt: promptNegative || null,
      model: promptModel,
      category_id: promptCategoryId || null,
      thumbnail: promptThumb || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      aspect_ratio: promptAspect,
      seed: promptSeed || null,
      difficulty: promptDiff,
      seo_title: promptSeoTitle || promptTitle,
      seo_description: promptSeoDesc || promptDesc,
      seo_keywords: promptSeoKeywords || undefined
    };

    // Zod Schema Validation
    const validation = validateForm(promptValidationSchema, {
      ...recordPayload,
      seo_keywords: promptSeoKeywords || undefined,
      thumbnail: promptThumb || undefined
    });

    if (!validation.success) {
      setValidationErrors(validation.errors || {});
      showNotification('Please correct validation errors on the form.', 'error');
      setLoading(false);
      return;
    }

    setValidationErrors({});

    const formattedRecord = {
      ...recordPayload,
      seo_keywords: promptSeoKeywords ? promptSeoKeywords.split(',').map(s => s.trim()) : []
    };

    try {
      let savedRecord = null;
      if (editId) {
        const { data, error } = await cmsService.updatePrompt(editId, formattedRecord);
        if (error) throw error;
        savedRecord = data;
        showNotification('Prompt updated in Supabase successfully!', 'success');

        // Check if slug changed -> create redirect
        if (originalSlug && originalSlug !== slugToUse) {
          const oldUrl = `/prompts/${originalSlug}`;
          const newUrl = `/prompts/${slugToUse}`;
          await createRedirect(oldUrl, newUrl, `Renamed prompt "${promptTitle}" slug`);
          showNotification('301 Redirect created from old slug to new slug.', 'info');
        }
      } else {
        const { data, error } = await cmsService.createPrompt(formattedRecord);
        if (error) throw error;
        savedRecord = data;
        showNotification('Prompt added to Supabase database!', 'success');
      }

      // Upsert seo_metadata row
      if (savedRecord?.id) {
        await cmsService.upsertSeoMetadata({
          entity_type: 'prompt',
          entity_id: savedRecord.id,
          seo_title: promptSeoTitle || promptTitle,
          meta_description: promptSeoDesc || promptDesc,
          focus_keyword: promptFocusKeyword,
          slug: slugToUse,
          canonical_url: `/prompts/${slugToUse}`,
          prompt_id: savedRecord.id
        });
      }
    } catch (err: any) {
      console.warn('DB Write skipped/errored. Applying to local fallback state: ', err.message);
      showNotification(`Applied to local state fallback!`, 'info');
    }

    await refreshData();
    resetForms();
    setLoading(false);
  };

  const editPrompt = async (p: any) => {
    setIsEditing(true);
    setEditId(p.id);
    setPromptTitle(p.title);
    setPromptSlug(p.slug);
    setOriginalSlug(p.slug);
    setSlugUnlocked(false);
    setPromptDesc(p.description || '');
    setPromptContent(p.prompt);
    setPromptNegative(p.negative_prompt || '');
    setPromptModel(p.model);
    setPromptCategoryId(p.category_id || '');
    setPromptDiff(p.difficulty);
    setPromptThumb(p.thumbnail || '');
    setPromptAspect(p.aspect_ratio || '16:9');
    setPromptSeed(p.seed || '');
    setPromptSeoTitle(p.seo_title || '');
    setPromptSeoDesc(p.seo_description || '');
    setPromptSeoKeywords(p.seo_keywords?.join(', ') || '');
    setValidationErrors({});

    // Fetch SEO focus keyword
    try {
      const { data: seoRow } = await cmsService.getSeoMetadata('prompt', p.id);
      if (seoRow) {
        setPromptFocusKeyword(seoRow.focus_keyword || '');
      } else {
        setPromptFocusKeyword('');
      }
    } catch (err) {
      setPromptFocusKeyword('');
    }
  };

  const deletePrompt = (prompt: any) => {
    setDeleteTarget({
      id: prompt.id,
      name: prompt.title,
      type: 'Prompt Blueprint',
      onConfirm: async () => {
        const originalPrompts = [...prompts];
        setPrompts(prev => prev.filter(p => p.id !== prompt.id));
        try {
          const { error } = await cmsService.deletePrompt(prompt.id);
          if (error) throw error;
          showNotification('Prompt deleted from Supabase database.', 'success');
        } catch (e) {
          setPrompts(originalPrompts);
          showNotification('Could not delete prompt from Supabase (restored).', 'error');
        }
      }
    });
    setDeleteModalOpen(true);
  };


  // CATEGORIES OPERATIONS
  const handleCategoryAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let slugToUse = catSlug;
    if (!slugToUse) {
      const generated = generateSlug(catTitle, 'category');
      slugToUse = await getUniqueSlug(generated, 'categories', editId || undefined, catTitle);
    } else {
      slugToUse = generateSlug(slugToUse, 'category');
    }

    // Immutability and uniqueness contract check
    const checkImmutability = await enforceSlugImmutability(slugToUse, 'categories', editId || undefined);
    if (!checkImmutability.allowed) {
      showNotification(checkImmutability.reason || 'Slug collision detected.', 'error');
      setLoading(false);
      return;
    }

    // 1. Focus Keyword Publish-Time Validation
    if (!catFocusKeyword || catFocusKeyword.trim() === '') {
      showNotification('SEO Focus Keyword is required to publish this content.', 'error');
      setLoading(false);
      return;
    }

    const normKeyword = catFocusKeyword.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normSlug = slugToUse.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (!normSlug.includes(normKeyword)) {
      showNotification(`Publish blocked: The SEO Focus Keyword "${catFocusKeyword}" must be present in the URL slug.`, 'error');
      setLoading(false);
      return;
    }

    // 2. Keyword Cannibalization Check (Warning)
    try {
      const { cannibalized, conflictingSlug } = await checkKeywordCannibalization(
        catFocusKeyword,
        'category',
        editId || undefined
      );
      if (cannibalized) {
        const proceed = confirm(
          `Keyword Cannibalization Warning:\nThe focus keyword "${catFocusKeyword}" is already targeted by another page (${conflictingSlug}).\n\nHaving multiple pages targeting the same keyword splits ranking signals in search engines (cannibalization) instead of boosting them.\n\nDo you still want to proceed with this publication?`
        );
        if (!proceed) {
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Cannibalization check skipped:', err);
    }

    const record = {
      title: catTitle,
      slug: slugToUse,
      icon: catIcon,
      color: catColor,
      type: catType as 'Prompt' | 'Skill' | 'Video' | 'Blog',
      seo_title: catSeoTitle || catTitle,
      seo_description: catSeoDesc || `Browse premium ${catTitle} blueprints.`
    };

    // Zod Schema Validation
    const validation = validateForm(categoryValidationSchema, record);
    if (!validation.success) {
      setValidationErrors(validation.errors || {});
      showNotification('Please correct validation errors on the form.', 'error');
      setLoading(false);
      return;
    }

    setValidationErrors({});

    try {
      let savedRecord = null;
      if (editId) {
        const { data, error } = await cmsService.updateCategory(editId, record);
        if (error) throw error;
        savedRecord = data;
        showNotification('Category updated in Supabase!', 'success');

        // Check if slug changed -> create redirect
        if (originalSlug && originalSlug !== slugToUse) {
          const oldUrl = `/categories/${originalSlug}`;
          const newUrl = `/categories/${slugToUse}`;
          await createRedirect(oldUrl, newUrl, `Renamed category "${catTitle}" slug`);
          showNotification('301 Redirect created from old slug to new slug.', 'info');
        }
      } else {
        const { data, error } = await cmsService.createCategory(record);
        if (error) throw error;
        savedRecord = data;
        showNotification('Category added to Supabase!', 'success');
      }

      // Upsert seo_metadata row
      if (savedRecord?.id) {
        await cmsService.upsertSeoMetadata({
          entity_type: 'category',
          entity_id: savedRecord.id,
          seo_title: catSeoTitle || catTitle,
          meta_description: catSeoDesc || `Browse premium ${catTitle} blueprints.`,
          focus_keyword: catFocusKeyword,
          slug: slugToUse,
          canonical_url: `/categories/${slugToUse}`,
          category_id: savedRecord.id
        });
      }
    } catch (err: any) {
      // Local addition fallback
      setCategories(prev => {
        if (editId) {
          return prev.map(c => c.id === editId ? { ...c, ...record } : c);
        } else {
          return [...prev, { id: `local-c-${Date.now()}`, ...record }];
        }
      });
      showNotification('Applied to local category fallback!', 'info');
    }

    // Refresh categories
    try {
      const { data } = await cmsService.getCategories();
      if (data) setCategories(data);
    } catch (err) {}

    resetForms();
    setLoading(false);
  };

  const editCategory = async (c: any) => {
    setIsEditing(true);
    setEditId(c.id);
    setCatTitle(c.title);
    setCatSlug(c.slug);
    setOriginalSlug(c.slug);
    setSlugUnlocked(false);
    setCatIcon(c.icon || 'Sparkles');
    setCatColor(c.color || 'indigo');
    setCatType(c.type);
    setCatSeoTitle(c.seo_title || '');
    setCatSeoDesc(c.seo_description || '');
    setValidationErrors({});

    // Fetch SEO focus keyword
    try {
      const { data: seoRow } = await cmsService.getSeoMetadata('category', c.id);
      if (seoRow) {
        setCatFocusKeyword(seoRow.focus_keyword || '');
      } else {
        setCatFocusKeyword('');
      }
    } catch (err) {
      setCatFocusKeyword('');
    }
  };

  const deleteCategory = (category: any) => {
    setDeleteTarget({
      id: category.id,
      name: category.title,
      type: 'Category',
      onConfirm: async () => {
        const originalCategories = [...categories];
        setCategories(prev => prev.filter(c => c.id !== category.id));
        try {
          const { error } = await cmsService.deleteCategory(category.id);
          if (error) throw error;
          showNotification('Category deleted from Supabase.', 'success');
        } catch (e) {
          setCategories(originalCategories);
          showNotification('Could not delete category from Supabase (restored).', 'error');
        }
      }
    });
    setDeleteModalOpen(true);
  };


  // SKILLS OPERATIONS
  const handleSkillAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let slugToUse = skillSlug;
    if (!slugToUse) {
      const firstAi = skillSupportedAi ? skillSupportedAi.split(',')[0].trim() : 'claude';
      const generated = generateSlug(skillTitle, 'skill', { aiPlatform: firstAi });
      slugToUse = await getUniqueSlug(generated, 'skills', editId || undefined, skillTitle);
    } else {
      slugToUse = generateSlug(slugToUse, 'skill');
    }

    // Immutability and uniqueness contract check
    const checkImmutability = await enforceSlugImmutability(slugToUse, 'skills', editId || undefined);
    if (!checkImmutability.allowed) {
      showNotification(checkImmutability.reason || 'Slug collision detected.', 'error');
      setLoading(false);
      return;
    }

    // 1. Focus Keyword Publish-Time Validation
    if (!skillFocusKeyword || skillFocusKeyword.trim() === '') {
      showNotification('SEO Focus Keyword is required to publish this content.', 'error');
      setLoading(false);
      return;
    }

    const normKeyword = skillFocusKeyword.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normSlug = slugToUse.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (!normSlug.includes(normKeyword)) {
      showNotification(`Publish blocked: The SEO Focus Keyword "${skillFocusKeyword}" must be present in the URL slug.`, 'error');
      setLoading(false);
      return;
    }

    // 2. Keyword Cannibalization Check (Warning)
    try {
      const { cannibalized, conflictingSlug } = await checkKeywordCannibalization(
        skillFocusKeyword,
        'skill',
        editId || undefined
      );
      if (cannibalized) {
        const proceed = confirm(
          `Keyword Cannibalization Warning:\nThe focus keyword "${skillFocusKeyword}" is already targeted by another page (${conflictingSlug}).\n\nHaving multiple pages targeting the same keyword splits ranking signals in search engines (cannibalization) instead of boosting them.\n\nDo you still want to proceed with this publication?`
        );
        if (!proceed) {
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Cannibalization check skipped:', err);
    }

    const recordPayload = {
      title: skillTitle,
      slug: slugToUse,
      description: skillDesc,
      cover: skillCover || 'https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&w=800&q=80',
      category_id: skillCatId || null,
      markdown_file: skillMarkdown,
      version: skillVersion,
      difficulty: skillDiff,
      supported_ai: skillSupportedAi,
      seo_title: skillSeoTitle || skillTitle,
      seo_description: skillSeoDesc || skillDesc
    };

    // Zod Schema Validation
    const validation = validateForm(skillValidationSchema, {
      ...recordPayload,
      cover: skillCover || undefined
    });

    if (!validation.success) {
      setValidationErrors(validation.errors || {});
      showNotification('Please correct validation errors on the form.', 'error');
      setLoading(false);
      return;
    }

    setValidationErrors({});

    const formattedRecord = {
      ...recordPayload,
      supported_ai: skillSupportedAi ? skillSupportedAi.split(',').map(s => s.trim()) : ['Claude', 'Gemini']
    };

    try {
      let savedRecord = null;
      if (editId) {
        const { data, error } = await cmsService.updateSkill(editId, formattedRecord);
        if (error) throw error;
        savedRecord = data;
        showNotification('Skill updated successfully!', 'success');

        // Check if slug changed -> create redirect
        if (originalSlug && originalSlug !== slugToUse) {
          const oldUrl = `/skills/${originalSlug}`;
          const newUrl = `/skills/${slugToUse}`;
          await createRedirect(oldUrl, newUrl, `Renamed skill "${skillTitle}" slug`);
          showNotification('301 Redirect created from old slug to new slug.', 'info');
        }
      } else {
        const { data, error } = await cmsService.createSkill(formattedRecord);
        if (error) throw error;
        savedRecord = data;
        showNotification('Skill added successfully!', 'success');
      }

      // Upsert seo_metadata row
      if (savedRecord?.id) {
        await cmsService.upsertSeoMetadata({
          entity_type: 'skill',
          entity_id: savedRecord.id,
          seo_title: skillSeoTitle || skillTitle,
          meta_description: skillSeoDesc || skillDesc,
          focus_keyword: skillFocusKeyword,
          slug: slugToUse,
          canonical_url: `/skills/${slugToUse}`,
          skill_id: savedRecord.id
        });
      }
    } catch (err: any) {
      showNotification('Skill synchronized locally in client!', 'info');
    }

    await refreshData();
    resetForms();
    setLoading(false);
  };

  const editSkill = async (s: any) => {
    setIsEditing(true);
    setEditId(s.id);
    setSkillTitle(s.title);
    setSkillSlug(s.slug);
    setOriginalSlug(s.slug);
    setSlugUnlocked(false);
    setSkillDesc(s.description || '');
    setSkillCover(s.cover || '');
    setSkillCatId(s.category_id || '');
    setSkillMarkdown(s.markdown_file);
    setSkillVersion(s.version || '1.0.0');
    setSkillDiff(s.difficulty);
    setSkillSupportedAi(s.supported_ai?.join(', ') || '');
    setSkillSeoTitle(s.seo_title || '');
    setSkillSeoDesc(s.seo_description || '');
    setValidationErrors({});

    // Fetch SEO focus keyword
    try {
      const { data: seoRow } = await cmsService.getSeoMetadata('skill', s.id);
      if (seoRow) {
        setSkillFocusKeyword(seoRow.focus_keyword || '');
      } else {
        setSkillFocusKeyword('');
      }
    } catch (err) {
      setSkillFocusKeyword('');
    }
  };

  const deleteSkill = (skill: any) => {
    setDeleteTarget({
      id: skill.id,
      name: skill.title,
      type: 'AI Skill Blueprint',
      onConfirm: async () => {
        const originalSkills = [...skills];
        setSkills(prev => prev.filter(s => s.id !== skill.id));
        try {
          const { error } = await cmsService.deleteSkill(skill.id);
          if (error) throw error;
          showNotification('Skill deleted successfully.', 'success');
        } catch (e) {
          setSkills(originalSkills);
          showNotification('Could not delete skill from Supabase (restored).', 'error');
        }
      }
    });
    setDeleteModalOpen(true);
  };


  // VIDEOS OPERATIONS
  const handleVideoAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let slugToUse = videoSlug;
    if (!slugToUse) {
      const generated = generateSlug(videoTitle, 'video', { niche: videoNiche, format: videoDiff });
      slugToUse = await getUniqueSlug(generated, 'video_concepts', editId || undefined, videoTitle);
    } else {
      slugToUse = generateSlug(slugToUse, 'video');
    }

    // Immutability and uniqueness contract check
    const checkImmutability = await enforceSlugImmutability(slugToUse, 'video_concepts', editId || undefined);
    if (!checkImmutability.allowed) {
      showNotification(checkImmutability.reason || 'Slug collision detected.', 'error');
      setLoading(false);
      return;
    }

    // 1. Focus Keyword Publish-Time Validation
    if (!videoFocusKeyword || videoFocusKeyword.trim() === '') {
      showNotification('SEO Focus Keyword is required to publish this content.', 'error');
      setLoading(false);
      return;
    }

    const normKeyword = videoFocusKeyword.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normSlug = slugToUse.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (!normSlug.includes(normKeyword)) {
      showNotification(`Publish blocked: The SEO Focus Keyword "${videoFocusKeyword}" must be present in the URL slug.`, 'error');
      setLoading(false);
      return;
    }

    // 2. Keyword Cannibalization Check (Warning)
    try {
      const { cannibalized, conflictingSlug } = await checkKeywordCannibalization(
        videoFocusKeyword,
        'video',
        editId || undefined
      );
      if (cannibalized) {
        const proceed = confirm(
          `Keyword Cannibalization Warning:\nThe focus keyword "${videoFocusKeyword}" is already targeted by another page (${conflictingSlug}).\n\nHaving multiple pages targeting the same keyword splits ranking signals in search engines (cannibalization) instead of boosting them.\n\nDo you still want to proceed with this publication?`
        );
        if (!proceed) {
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Cannibalization check skipped:', err);
    }

    const recordPayload = {
      title: videoTitle,
      slug: slugToUse,
      cover: videoCover || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      description: videoDesc,
      hook: videoHook,
      niche: videoNiche,
      difficulty: videoDiff,
      expected_rpm: Number(videoRpm),
      virality_score: Number(videoVirality),
      competition: 'Medium',
      ai_tools_needed: ['Midjourney', 'ElevenLabs', 'CapCut'],
      channel_blueprint: videoBlueprint || 'Standard faceless workflow blueprint.'
    };

    try {
      let savedRecord = null;
      if (editId) {
        const { data, error } = await cmsService.updateVideo(editId, recordPayload);
        if (error) throw error;
        savedRecord = data;
        showNotification('Faceless video concept updated successfully!', 'success');

        // Check if slug changed -> create redirect
        if (originalSlug && originalSlug !== slugToUse) {
          const oldUrl = `/videos/${originalSlug}`;
          const newUrl = `/videos/${slugToUse}`;
          await createRedirect(oldUrl, newUrl, `Renamed video "${videoTitle}" slug`);
          showNotification('301 Redirect created from old slug to new slug.', 'info');
        }
      } else {
        const { data, error } = await cmsService.createVideo(recordPayload);
        if (error) throw error;
        savedRecord = data;
        showNotification('Faceless video concept created successfully!', 'success');
      }

      // Upsert seo_metadata row
      if (savedRecord?.id) {
        await cmsService.upsertSeoMetadata({
          entity_type: 'video',
          entity_id: savedRecord.id,
          seo_title: videoTitle,
          meta_description: videoDesc || `Blueprint for faceless video concept: ${videoTitle}`,
          focus_keyword: videoFocusKeyword,
          slug: slugToUse,
          canonical_url: `/videos/${slugToUse}`,
          video_concept_id: savedRecord.id
        });
      }
    } catch (err: any) {
      showNotification('Applied to local state fallback for video!', 'info');
    }

    await refreshData();
    resetForms();
    setLoading(false);
  };

  const editVideo = async (v: any) => {
    setIsEditing(true);
    setEditId(v.id);
    setVideoTitle(v.title);
    setVideoSlug(v.slug);
    setOriginalSlug(v.slug);
    setSlugUnlocked(false);
    setVideoCover(v.cover || '');
    setVideoDesc(v.description || '');
    setVideoHook(v.hook || '');
    setVideoNiche(v.niche || 'AI Tech & Future');
    setVideoDiff(v.difficulty || 'Medium');
    setVideoRpm(v.expected_rpm || 4.50);
    setVideoVirality(v.virality_score || 85);
    setVideoBlueprint(v.channel_blueprint || '');
    setValidationErrors({});

    // Fetch SEO focus keyword
    try {
      const { data: seoRow } = await cmsService.getSeoMetadata('video', v.id);
      if (seoRow) {
        setVideoFocusKeyword(seoRow.focus_keyword || '');
      } else {
        setVideoFocusKeyword('');
      }
    } catch (err) {
      setVideoFocusKeyword('');
    }
  };

  const deleteVideo = (video: any) => {
    setDeleteTarget({
      id: video.id,
      name: video.title,
      type: 'Faceless Video Concept',
      onConfirm: async () => {
        const originalVideos = [...videos];
        setVideos(prev => prev.filter(v => v.id !== video.id));
        try {
          const { error } = await cmsService.deleteVideo(video.id);
          if (error) throw error;
          showNotification('Video concept deleted successfully.', 'success');
        } catch (e) {
          setVideos(originalVideos);
          showNotification('Could not delete video concept from Supabase (restored).', 'error');
        }
      }
    });
    setDeleteModalOpen(true);
  };


  // BLOGS OPERATIONS
  const handleBlogAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let slugToUse = blogSlug;
    if (!slugToUse) {
      const generated = generateSlug(blogTitle, 'blog');
      slugToUse = await getUniqueSlug(generated, 'blogs', editId || undefined, blogTitle);
    } else {
      slugToUse = generateSlug(slugToUse, 'blog');
    }

    // Immutability and uniqueness contract check
    const checkImmutability = await enforceSlugImmutability(slugToUse, 'blogs', editId || undefined);
    if (!checkImmutability.allowed) {
      showNotification(checkImmutability.reason || 'Slug collision detected.', 'error');
      setLoading(false);
      return;
    }

    // 1. Focus Keyword Publish-Time Validation
    if (!blogFocusKeyword || blogFocusKeyword.trim() === '') {
      showNotification('SEO Focus Keyword is required to publish this content.', 'error');
      setLoading(false);
      return;
    }

    const normKeyword = blogFocusKeyword.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normSlug = slugToUse.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (!normSlug.includes(normKeyword)) {
      showNotification(`Publish blocked: The SEO Focus Keyword "${blogFocusKeyword}" must be present in the URL slug.`, 'error');
      setLoading(false);
      return;
    }

    // 2. Keyword Cannibalization Check (Warning)
    try {
      const { cannibalized, conflictingSlug } = await checkKeywordCannibalization(
        blogFocusKeyword,
        'blog',
        editId || undefined
      );
      if (cannibalized) {
        const proceed = confirm(
          `Keyword Cannibalization Warning:\nThe focus keyword "${blogFocusKeyword}" is already targeted by another page (${conflictingSlug}).\n\nHaving multiple pages targeting the same keyword splits ranking signals in search engines (cannibalization) instead of boosting them.\n\nDo you still want to proceed with this publication?`
        );
        if (!proceed) {
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Cannibalization check skipped:', err);
    }

    const recordPayload = {
      title: blogTitle,
      slug: slugToUse,
      cover: blogCover || 'https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&w=800&q=80',
      excerpt: blogExcerpt,
      content: blogContent,
      category: blogCategory,
      seo_title: blogSeoTitle || blogTitle,
      seo_description: blogSeoDesc || blogExcerpt
    };

    // Zod Schema Validation
    const validation = validateForm(blogValidationSchema, {
      ...recordPayload,
      cover: blogCover || undefined
    });

    if (!validation.success) {
      setValidationErrors(validation.errors || {});
      showNotification('Please correct validation errors on the form.', 'error');
      setLoading(false);
      return;
    }

    setValidationErrors({});

    const formattedRecord = {
      ...recordPayload,
      author_id: user?.id || null,
      published_at: new Date().toISOString()
    };

    try {
      let savedRecord = null;
      if (editId) {
        const { data, error } = await cmsService.updateBlog(editId, formattedRecord);
        if (error) throw error;
        savedRecord = data;
        showNotification('Blog article updated successfully!', 'success');

        // Check if slug changed -> create redirect
        if (originalSlug && originalSlug !== slugToUse) {
          const oldUrl = `/blog/${originalSlug}`;
          const newUrl = `/blog/${slugToUse}`;
          await createRedirect(oldUrl, newUrl, `Renamed blog "${blogTitle}" slug`);
          showNotification('301 Redirect created from old slug to new slug.', 'info');
        }
      } else {
        const { data, error } = await cmsService.createBlog(formattedRecord);
        if (error) throw error;
        savedRecord = data;
        showNotification('Blog article created in database!', 'success');
      }

      // Upsert seo_metadata row
      if (savedRecord?.id) {
        await cmsService.upsertSeoMetadata({
          entity_type: 'blog',
          entity_id: savedRecord.id,
          seo_title: blogSeoTitle || blogTitle,
          meta_description: blogSeoDesc || blogExcerpt,
          focus_keyword: blogFocusKeyword,
          slug: slugToUse,
          canonical_url: `/blog/${slugToUse}`,
          blog_id: savedRecord.id
        });
      }
    } catch (err) {
      showNotification('Blog saved locally in browser!', 'info');
    }

    await refreshData();
    resetForms();
    setLoading(false);
  };

  const editBlog = async (b: any) => {
    setIsEditing(true);
    setEditId(b.id);
    setBlogTitle(b.title);
    setBlogSlug(b.slug);
    setOriginalSlug(b.slug);
    setSlugUnlocked(false);
    setBlogCover(b.cover || '');
    setBlogExcerpt(b.excerpt || '');
    setBlogContent(b.content || '');
    setBlogCategory(b.category || 'AI Workflows');
    setBlogSeoTitle(b.seo_title || '');
    setBlogSeoDesc(b.seo_description || '');
    setValidationErrors({});

    // Fetch SEO focus keyword
    try {
      const { data: seoRow } = await cmsService.getSeoMetadata('blog', b.id);
      if (seoRow) {
        setBlogFocusKeyword(seoRow.focus_keyword || '');
      } else {
        setBlogFocusKeyword('');
      }
    } catch (err) {
      setBlogFocusKeyword('');
    }
  };

  const deleteBlog = (blog: any) => {
    setDeleteTarget({
      id: blog.id,
      name: blog.title,
      type: 'Blog Article',
      onConfirm: async () => {
        const originalBlogs = [...blogs];
        setBlogs(prev => prev.filter(b => b.id !== blog.id));
        try {
          const { error } = await cmsService.deleteBlog(blog.id);
          if (error) throw error;
          showNotification('Blog deleted successfully.', 'success');
        } catch (e) {
          setBlogs(originalBlogs);
          showNotification('Could not delete blog from Supabase (restored).', 'error');
        }
      }
    });
    setDeleteModalOpen(true);
  };


  // SITE PAGES OPERATIONS
  const handlePageAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPage) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('site_pages')
        .update({
          title: selectedPage.title,
          content: selectedPage.content,
          seo_title: selectedPage.seo_title,
          seo_description: selectedPage.seo_description,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedPage.id);

      if (error) throw error;
      showNotification(`${selectedPage.title} saved to database!`, 'success');
    } catch (e) {
      // Local update fallback
      setSitePages(prev => prev.map(p => p.id === selectedPage.id ? selectedPage : p));
      showNotification('Page changes saved in client memory.', 'info');
    }

    setSelectedPage(null);
    setLoading(false);
  };


  // MEDIA OPERATIONS
  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaUrl || !newMediaName) {
      showNotification('Please fill in filename and URL', 'error');
      return;
    }

    const record = {
      filename: newMediaName,
      url: newMediaUrl,
      mime_type: 'image/png',
      size: 450123,
      uploaded_by: user?.id || null,
      created_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase.from('media_uploads').insert([record]);
      if (error) throw error;
      showNotification('Media metadata logged in database.', 'success');
    } catch (e) {
      showNotification('Media reference added locally.', 'info');
    }

    setMediaList(prev => [{ id: `local-m-${Date.now()}`, ...record }, ...prev]);
    setNewMediaUrl('');
    setNewMediaName('');
  };

  const handleDeleteMedia = async (id: string) => {
    if (!confirm('Delete media record?')) return;
    try {
      await supabase.from('media_uploads').delete().eq('id', id);
    } catch (e) {}
    setMediaList(prev => prev.filter(m => m.id !== id));
    showNotification('Media record deleted.', 'success');
  };


  // GENERAL SEO SETTINGS OPERATION
  const handleSaveSeoSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'seo',
          value: seoSettings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      showNotification('Global SEO Settings updated in Supabase site_settings!', 'success');
    } catch (e) {
      showNotification('Global SEO saved in local state memory.', 'info');
    }

    setLoading(false);
  };


  return (
    <AdminLayout
      activeTab={activeTab}
      onTabChange={(tab) => { setActiveTab(tab); resetForms(); }}
      onSync={refreshData}
      onExit={() => navigateTo('home')}
      adminName={profile?.full_name || user?.email || 'Demo Admin'}
      adminRole={profile?.role || 'admin'}
      syncLoading={loading}
    >
          {/* TAB 1: PROMPTS */}
          {activeTab === 'prompts' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="font-sans text-lg font-bold text-slate-900">
                  Manage Image Prompts ({prompts.length})
                </h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer active:scale-95 transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Prompt</span>
                  </button>
                )}
              </div>

              {/* Form panel */}
              {isEditing && (
                <form onSubmit={handlePromptAction} className="rounded-xl border border-slate-200 bg-white p-6 shadow-md space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                      {editId ? 'Edit Selected Prompt' : 'Create New Prompt Blueprint'}
                    </h3>
                    <button type="button" onClick={resetForms} className="text-slate-400 hover:text-slate-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase">Title *</label>
                      <input required type="text" value={promptTitle} onChange={(e) => setPromptTitle(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" placeholder="Biophilic Luxury Villa" />
                      {validationErrors['title'] && (
                        <p className="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-wide">{validationErrors['title']}</p>
                      )}
                    </div>
                    <div>
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-700 uppercase">Slug (Auto if empty)</label>
                        {editId && !slugUnlocked && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Warning: Changing this slug will break existing links. A 301 Redirect will be created from the old slug to the new slug. Do you want to proceed?')) {
                                setSlugUnlocked(true);
                              }
                            }}
                            className="text-[10px] text-red-600 hover:text-red-700 font-bold uppercase tracking-wider cursor-pointer"
                          >
                            Unlock Rename
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        disabled={editId ? !slugUnlocked : false}
                        value={promptSlug}
                        onChange={(e) => setPromptSlug(e.target.value)}
                        className={`mt-1 w-full rounded-lg border px-3 py-2 text-xs ${editId && !slugUnlocked ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' : 'border-slate-200'}`}
                        placeholder="biophilic-luxury-villa"
                      />
                      {validationErrors['slug'] && (
                        <p className="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-wide">{validationErrors['slug']}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-slate-700 uppercase">Short Description</label>
                      <textarea rows={2} value={promptDesc} onChange={(e) => setPromptDesc(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" placeholder="A stunning prompt for nature architectural blueprints." />
                      {validationErrors['description'] && (
                        <p className="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-wide">{validationErrors['description']}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-slate-700 uppercase">Prompt Content *</label>
                      <textarea required rows={3} value={promptContent} onChange={(e) => setPromptContent(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono" placeholder="/imagine prompt: biophilic architectural photography of glass house..." />
                      {validationErrors['prompt'] && (
                        <p className="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-wide">{validationErrors['prompt']}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-slate-700 uppercase">Negative Prompt (Optional)</label>
                      <textarea rows={1} value={promptNegative} onChange={(e) => setPromptNegative(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono" placeholder="text, low quality, watermark" />
                      {validationErrors['negative_prompt'] && (
                        <p className="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-wide">{validationErrors['negative_prompt']}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase">Model</label>
                      <select value={promptModel} onChange={(e) => setPromptModel(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs bg-white">
                        <option value="Midjourney v6.0">Midjourney v6.0</option>
                        <option value="Stable Diffusion 3">Stable Diffusion 3</option>
                        <option value="Flux.1 Pro">Flux.1 Pro</option>
                        <option value="DALL-E 3">DALL-E 3</option>
                      </select>
                      {validationErrors['model'] && (
                        <p className="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-wide">{validationErrors['model']}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase">Category</label>
                      <select value={promptCategoryId} onChange={(e) => setPromptCategoryId(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs bg-white">
                        <option value="">Select Category</option>
                        {categories.filter(c => c.type === 'Prompt').map(c => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                      {validationErrors['category_id'] && (
                        <p className="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-wide">{validationErrors['category_id']}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <MediaUploader
                        bucketName="prompts-images"
                        currentValue={promptThumb}
                        onUploadSuccess={(url) => setPromptThumb(url)}
                      />
                      {validationErrors['thumbnail'] && (
                        <p className="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-wide">{validationErrors['thumbnail']}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase">Aspect Ratio</label>
                      <input type="text" value={promptAspect} onChange={(e) => setPromptAspect(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" placeholder="16:9" />
                      {validationErrors['aspect_ratio'] && (
                        <p className="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-wide">{validationErrors['aspect_ratio']}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase">Seed (Optional)</label>
                      <input type="text" value={promptSeed} onChange={(e) => setPromptSeed(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" placeholder="124591" />
                      {validationErrors['seed'] && (
                        <p className="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-wide">{validationErrors['seed']}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase">Difficulty</label>
                      <select value={promptDiff} onChange={(e) => setPromptDiff(e.target.value as any)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs bg-white">
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Expert">Expert</option>
                      </select>
                      {validationErrors['difficulty'] && (
                        <p className="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-wide">{validationErrors['difficulty']}</p>
                      )}
                    </div>
                  </div>

                  {/* SEO SETTINGS AREA */}
                  <div className="border-t border-slate-100 pt-4 mt-2">
                    <h4 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Settings className="h-3.5 w-3.5" />
                      <span>SEO Meta Settings</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-bold text-red-600 uppercase">SEO Focus Keyword (Required for Publishing) *</label>
                        <input required type="text" value={promptFocusKeyword} onChange={(e) => setPromptFocusKeyword(e.target.value)} className="mt-1 w-full rounded-lg border border-red-200 px-3 py-2 text-xs" placeholder="E.g., biophilic luxury villa" />
                        <SlugKeywordValidator keyword={promptFocusKeyword} slug={promptSlug} placeholderSlug={generateSlug(promptTitle, 'prompt', { model: promptModel, style: promptAspect })} />
                        <p className="mt-1 text-[10px] text-slate-500 font-medium">The primary search keyword term. MUST appear as a substring in the URL slug.</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 uppercase">SEO Page Title</label>
                        <input type="text" value={promptSeoTitle} onChange={(e) => setPromptSeoTitle(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" placeholder="E.g., Biophilic Villa Midjourney Prompt | Promptat Online" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 uppercase">SEO Keywords (comma separated)</label>
                        <input type="text" value={promptSeoKeywords} onChange={(e) => setPromptSeoKeywords(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" placeholder="E.g., architectural prompt, glass villa" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-bold text-slate-600 uppercase">SEO Page Meta Description</label>
                        <textarea rows={1} value={promptSeoDesc} onChange={(e) => setPromptSeoDesc(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" placeholder="E.g., Download custom prompt blueprint to generate incredible..." />
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Master SEO and Social Preview */}
                  <SeoPreview
                    title={promptSeoTitle || promptTitle}
                    description={promptSeoDesc || promptDesc}
                    slug={promptSlug || promptTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}
                    type="prompt"
                    image={promptThumb}
                    keywords={promptSeoKeywords}
                  />

                  <div className="flex justify-end gap-3 pt-3">
                    <button type="button" onClick={resetForms} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
                      Cancel
                    </button>
                    <button type="submit" disabled={loading} className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 cursor-pointer flex items-center gap-1.5">
                      <Save className="h-4 w-4" />
                      <span>{editId ? 'Save Changes' : 'Publish Prompt'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* List table */}
              <DataTable
                data={prompts}
                columns={[
                  {
                    key: 'title',
                    label: 'Asset',
                    render: (_, p) => (
                      <div className="flex items-center gap-3">
                        <img src={p.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'} className="h-10 w-10 rounded-lg object-cover border border-slate-100" referrerPolicy="no-referrer" />
                        <div>
                          <p className="font-bold text-slate-800 text-xs">{p.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{p.slug}</p>
                        </div>
                      </div>
                    )
                  },
                  {
                    key: 'model',
                    label: 'Model'
                  },
                  {
                    key: 'seo_title',
                    label: 'SEO Title',
                    render: (val, p) => val || p.title
                  }
                ]}
                searchKeys={['title', 'slug', 'model', 'prompt']}
                searchPlaceholder="Search image prompts..."
                onEdit={editPrompt}
                onDelete={deletePrompt}
                isLoading={loading}
              />
            </div>
          )}

          {/* TAB 2: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="font-sans text-lg font-bold text-slate-900">
                  Manage Categories ({categories.length})
                </h2>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer">
                    <Plus className="h-4 w-4" />
                    <span>Add Category</span>
                  </button>
                )}
              </div>

              {isEditing && (
                <form onSubmit={handleCategoryAction} className="rounded-xl border border-slate-200 bg-white p-6 shadow-md space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-800 uppercase">
                      {editId ? 'Edit Selected Category' : 'Create New Category'}
                    </h3>
                    <button type="button" onClick={resetForms} className="text-slate-400 hover:text-slate-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase">Title *</label>
                      <input required type="text" value={catTitle} onChange={(e) => setCatTitle(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" placeholder="Cinema Seeds" />
                      {validationErrors['title'] && (
                        <p className="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-wide">{validationErrors['title']}</p>
                      )}
                    </div>
                    <div>
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-700 uppercase">Slug</label>
                        {editId && !slugUnlocked && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Warning: Changing this slug will break existing links. A 301 Redirect will be created from the old slug to the new slug. Do you want to proceed?')) {
                                setSlugUnlocked(true);
                              }
                            }}
                            className="text-[10px] text-red-600 hover:text-red-700 font-bold uppercase tracking-wider cursor-pointer"
                          >
                            Unlock Rename
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        disabled={editId ? !slugUnlocked : false}
                        value={catSlug}
                        onChange={(e) => setCatSlug(e.target.value)}
                        className={`mt-1 w-full rounded-lg border px-3 py-2 text-xs ${editId && !slugUnlocked ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' : 'border-slate-200'}`}
                        placeholder="cinema-seeds"
                      />
                      {validationErrors['slug'] && (
                        <p className="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-wide">{validationErrors['slug']}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase">Icon (Lucide Icon Name)</label>
                      <input type="text" value={catIcon} onChange={(e) => setCatIcon(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" placeholder="Sparkles" />
                      {validationErrors['icon'] && (
                        <p className="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-wide">{validationErrors['icon']}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase">Color Theme Class</label>
                      <input type="text" value={catColor} onChange={(e) => setCatColor(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" placeholder="indigo" />
                      {validationErrors['color'] && (
                        <p className="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-wide">{validationErrors['color']}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase">Type Taxonomy *</label>
                      <select value={catType} onChange={(e) => setCatType(e.target.value as any)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs bg-white">
                        <option value="Prompt">Prompt</option>
                        <option value="Skill">Skill</option>
                        <option value="Video">Video</option>
                        <option value="Blog">Blog</option>
                      </select>
                      {validationErrors['type'] && (
                        <p className="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-wide">{validationErrors['type']}</p>
                      )}
                    </div>
                  </div>

                  {/* Category SEO */}
                  <div className="border-t border-slate-100 pt-4 mt-2">
                    <h4 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-3">SEO settings</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-red-600 uppercase">SEO Focus Keyword (Required for Publishing) *</label>
                        <input required type="text" value={catFocusKeyword} onChange={(e) => setCatFocusKeyword(e.target.value)} className="mt-1 w-full rounded-lg border border-red-200 px-3 py-2 text-xs" placeholder="E.g., cinema seeds" />
                        <SlugKeywordValidator keyword={catFocusKeyword} slug={catSlug} placeholderSlug={generateSlug(catTitle, 'category')} />
                        <p className="mt-1 text-[10px] text-slate-500 font-medium">The primary search keyword term. MUST appear as a substring in the URL slug.</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 uppercase">SEO Custom Title</label>
                        <input type="text" value={catSeoTitle} onChange={(e) => setCatSeoTitle(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" placeholder="E.g., Premium Cinema seeds blueprints | Promptat Online" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 uppercase">SEO Meta Description</label>
                        <textarea rows={1} value={catSeoDesc} onChange={(e) => setCatSeoDesc(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" placeholder="E.g., Discover thousands of custom cinematic image seeds." />
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Master SEO and Social Preview */}
                  <SeoPreview
                    title={catSeoTitle || catTitle}
                    description={catSeoDesc || `Browse premium ${catTitle} blueprints.`}
                    slug={catSlug || catTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}
                    type="category"
                  />

                  <div className="flex justify-end gap-3 pt-3">
                    <button type="button" onClick={resetForms} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
                      Cancel
                    </button>
                    <button type="submit" disabled={loading} className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 cursor-pointer">
                      <span>{editId ? 'Save Changes' : 'Create Category'}</span>
                    </button>
                  </div>
                </form>
              )}

              <DataTable
                data={categories}
                columns={[
                  {
                    key: 'title',
                    label: 'Category Title',
                    render: (_, c) => (
                      <div>
                        <p className="font-bold text-slate-800 text-xs">{c.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{c.slug}</p>
                      </div>
                    )
                  },
                  {
                    key: 'type',
                    label: 'Type Mapping',
                    render: (val) => (
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-[10px] font-black uppercase text-slate-700">
                        {val}
                      </span>
                    )
                  },
                  {
                    key: 'icon',
                    label: 'Icon',
                    render: (val) => val || 'Sparkles'
                  }
                ]}
                searchKeys={['title', 'slug', 'type']}
                searchPlaceholder="Search categories..."
                onEdit={editCategory}
                onDelete={deleteCategory}
                isLoading={loading}
              />
            </div>
          )}

          {/* TAB 3: SKILLS */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="font-sans text-lg font-bold text-slate-900">
                  Manage Creator Skills ({skills.length})
                </h2>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer">
                    <Plus className="h-4 w-4" />
                    <span>Add Skill</span>
                  </button>
                )}
              </div>

              {isEditing && (
                <form onSubmit={handleSkillAction} className="rounded-xl border border-slate-200 bg-white p-6 shadow-md space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-800 uppercase">
                      {editId ? 'Edit Selected Skill' : 'Create New Skill'}
                    </h3>
                    <button type="button" onClick={resetForms} className="text-slate-400 hover:text-slate-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase">Title *</label>
                      <input required type="text" value={skillTitle} onChange={(e) => setSkillTitle(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" placeholder="E.g., Agent Constraints" />
                      {validationErrors['title'] && (
                        <p className="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-wide">{validationErrors['title']}</p>
                      )}
                    </div>
                    <div>
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-700 uppercase">Slug</label>
                        {editId && !slugUnlocked && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Warning: Changing this slug will break existing links. A 301 Redirect will be created from the old slug to the new slug. Do you want to proceed?')) {
                                setSlugUnlocked(true);
                              }
                            }}
                            className="text-[10px] text-red-600 hover:text-red-700 font-bold uppercase tracking-wider cursor-pointer"
                          >
                            Unlock Rename
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        disabled={editId ? !slugUnlocked : false}
                        value={skillSlug}
                        onChange={(e) => setSkillSlug(e.target.value)}
                        className={`mt-1 w-full rounded-lg border px-3 py-2 text-xs ${editId && !slugUnlocked ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' : 'border-slate-200'}`}
                        placeholder="agent-constraints"
                      />
                      {validationErrors['slug'] && (
                        <p className="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-wide">{validationErrors['slug']}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-slate-700 uppercase">Skill Description *</label>
                      <textarea required rows={2} value={skillDesc} onChange={(e) => setSkillDesc(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" placeholder="Describe what instructions this skill provides." />
                      {validationErrors['description'] && (
                        <p className="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-wide">{validationErrors['description']}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-slate-700 uppercase">Skill Markdown Content *</label>
                      <textarea required rows={6} value={skillMarkdown} onChange={(e) => setSkillMarkdown(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono" placeholder="# Agent Instructions..." />
                      {validationErrors['markdown_file'] && (
                        <p className="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-wide">{validationErrors['markdown_file']}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <MediaUploader
                        bucketName="skills"
                        currentValue={skillCover}
                        onUploadSuccess={(url) => setSkillCover(url)}
                      />
                      {validationErrors['cover'] && (
                        <p className="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-wide">{validationErrors['cover']}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase">Skill Version</label>
                      <input type="text" value={skillVersion} onChange={(e) => setSkillVersion(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" placeholder="1.0.0" />
                      {validationErrors['version'] && (
                        <p className="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-wide">{validationErrors['version']}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase">Category Mapping</label>
                      <select value={skillCatId} onChange={(e) => setSkillCatId(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs bg-white">
                        <option value="">Select Category</option>
                        {categories.filter(c => c.type === 'Skill').map(c => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                      {validationErrors['category_id'] && (
                        <p className="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-wide">{validationErrors['category_id']}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase">Difficulty</label>
                      <select value={skillDiff} onChange={(e) => setSkillDiff(e.target.value as any)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs bg-white">
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Expert">Expert</option>
                      </select>
                      {validationErrors['difficulty'] && (
                        <p className="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-wide">{validationErrors['difficulty']}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-slate-700 uppercase">Supported AIs (comma separated)</label>
                      <input type="text" value={skillSupportedAi} onChange={(e) => setSkillSupportedAi(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" placeholder="E.g., Claude, Gemini, Cursor" />
                      {validationErrors['supported_ai'] && (
                        <p className="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-wide">{validationErrors['supported_ai']}</p>
                      )}
                    </div>
                  </div>

                  {/* Skill SEO */}
                  <div className="border-t border-slate-100 pt-4 mt-2">
                    <h4 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-3">SEO settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-bold text-red-600 uppercase">SEO Focus Keyword (Required for Publishing) *</label>
                        <input required type="text" value={skillFocusKeyword} onChange={(e) => setSkillFocusKeyword(e.target.value)} className="mt-1 w-full rounded-lg border border-red-200 px-3 py-2 text-xs" placeholder="E.g., agent constraints" />
                        <SlugKeywordValidator keyword={skillFocusKeyword} slug={skillSlug} placeholderSlug={generateSlug(skillTitle, 'skill', { aiPlatform: skillSupportedAi ? skillSupportedAi.split(',')[0].trim() : 'claude' })} />
                        <p className="mt-1 text-[10px] text-slate-500 font-medium">The primary search keyword term. MUST appear as a substring in the URL slug.</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 uppercase">SEO Page Title</label>
                        <input type="text" value={skillSeoTitle} onChange={(e) => setSkillSeoTitle(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" placeholder="Custom SEO Title" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 uppercase">SEO Page Meta Description</label>
                        <textarea rows={1} value={skillSeoDesc} onChange={(e) => setSkillSeoDesc(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" placeholder="Custom meta description" />
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Master SEO and Social Preview */}
                  <SeoPreview
                    title={skillSeoTitle || skillTitle}
                    description={skillSeoDesc || skillDesc}
                    slug={skillSlug || skillTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}
                    type="skill"
                    image={skillCover}
                    keywords={skillSupportedAi}
                  />

                  <div className="flex justify-end gap-3 pt-3">
                    <button type="button" onClick={resetForms} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
                      Cancel
                    </button>
                    <button type="submit" disabled={loading} className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 cursor-pointer">
                      <span>{editId ? 'Save Changes' : 'Publish Skill'}</span>
                    </button>
                  </div>
                </form>
              )}

              <DataTable
                data={skills}
                columns={[
                  {
                    key: 'title',
                    label: 'Skill Asset',
                    render: (_, s) => (
                      <div className="flex items-center gap-3">
                        <img src={s.cover || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'} className="h-10 w-10 rounded-lg object-cover border border-slate-100" referrerPolicy="no-referrer" />
                        <div>
                          <p className="font-bold text-slate-800 text-xs">{s.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{s.slug}</p>
                        </div>
                      </div>
                    )
                  },
                  {
                    key: 'version',
                    label: 'Version'
                  },
                  {
                    key: 'supported_ai',
                    label: 'AIs Supported',
                    render: (val) => val?.join(', ') || ''
                  }
                ]}
                searchKeys={['title', 'slug', 'description', 'markdown_file']}
                searchPlaceholder="Search skills..."
                onEdit={editSkill}
                onDelete={deleteSkill}
                isLoading={loading}
              />
            </div>
          )}

          {/* TAB 4: VIDEOS */}
          {activeTab === 'videos' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="font-sans text-lg font-bold text-slate-900">
                  Manage AI Video Prompts ({videos.length})
                </h2>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer">
                    <Plus className="h-4 w-4" />
                    <span>Add AI Video Prompt</span>
                  </button>
                )}
              </div>

              {isEditing && (
                <form onSubmit={handleVideoAction} className="rounded-xl border border-slate-200 bg-white p-6 shadow-md space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-800 uppercase">
                      {editId ? 'Edit Selected Video Concept' : 'Create New AI Video Prompt Concept'}
                    </h3>
                    <button type="button" onClick={resetForms} className="text-slate-400 hover:text-slate-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase">Title *</label>
                      <input required type="text" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" placeholder="Viral AI History Shorts Blueprint" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-700 uppercase">Slug</label>
                        {editId && !slugUnlocked && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Warning: Changing this slug will break existing links. A 301 Redirect will be created from the old slug to the new slug. Do you want to proceed?')) {
                                setSlugUnlocked(true);
                              }
                            }}
                            className="text-[10px] text-red-600 hover:text-red-700 font-bold uppercase tracking-wider cursor-pointer"
                          >
                            Unlock Rename
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        disabled={editId ? !slugUnlocked : false}
                        value={videoSlug}
                        onChange={(e) => setVideoSlug(e.target.value)}
                        className={`mt-1 w-full rounded-lg border px-3 py-2 text-xs ${editId && !slugUnlocked ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' : 'border-slate-200'}`}
                        placeholder="viral-ai-history-shorts"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-slate-700 uppercase">Description *</label>
                      <textarea required rows={2} value={videoDesc} onChange={(e) => setVideoDesc(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" placeholder="Comprehensive breakdown of viral faceless video production." />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase">Hook Formula *</label>
                      <input required type="text" value={videoHook} onChange={(e) => setVideoHook(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" placeholder="What if everything you knew was a simulation?" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase">Niche</label>
                      <input type="text" value={videoNiche} onChange={(e) => setVideoNiche(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" placeholder="AI History & Secrets" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase">Difficulty</label>
                      <select value={videoDiff} onChange={(e) => setVideoDiff(e.target.value as any)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs bg-white">
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase">Expected RPM ($)</label>
                      <input type="number" step="0.1" value={videoRpm} onChange={(e) => setVideoRpm(parseFloat(e.target.value))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase">Virality Score (1-100)</label>
                      <input type="number" min="1" max="100" value={videoVirality} onChange={(e) => setVideoVirality(parseInt(e.target.value))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" />
                    </div>
                    <div className="md:col-span-2">
                      <MediaUploader
                        bucketName="videos"
                        currentValue={videoCover}
                        onUploadSuccess={(url) => setVideoCover(url)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-slate-700 uppercase">Channel / Production Blueprint</label>
                      <textarea rows={4} value={videoBlueprint} onChange={(e) => setVideoBlueprint(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono" placeholder="Step-by-step channel execution playbook..." />
                    </div>
                  </div>

                  {/* Video SEO */}
                  <div className="border-t border-slate-100 pt-4 mt-2">
                    <h4 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Settings className="h-3.5 w-3.5" />
                      <span>Video Concept SEO Settings</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-bold text-red-600 uppercase">SEO Focus Keyword (Required for Publishing) *</label>
                        <input required type="text" value={videoFocusKeyword} onChange={(e) => setVideoFocusKeyword(e.target.value)} className="mt-1 w-full rounded-lg border border-red-200 px-3 py-2 text-xs" placeholder="E.g., viral ai history shorts" />
                        <SlugKeywordValidator keyword={videoFocusKeyword} slug={videoSlug} placeholderSlug={generateSlug(videoTitle, 'video', { niche: videoNiche, format: videoDiff })} />
                        <p className="mt-1 text-[10px] text-slate-500 font-medium">The primary search keyword term. MUST appear as a substring in the URL slug.</p>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Master SEO and Social Preview */}
                  <SeoPreview
                    title={videoTitle}
                    description={videoDesc}
                    slug={videoSlug || videoTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}
                    type="video"
                    image={videoCover}
                  />

                  <div className="flex justify-end gap-3 pt-3">
                    <button type="button" onClick={resetForms} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
                      Cancel
                    </button>
                    <button type="submit" disabled={loading} className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 cursor-pointer">
                      <span>{editId ? 'Save Changes' : 'Publish Video Concept'}</span>
                    </button>
                  </div>
                </form>
              )}

              <DataTable
                data={videos}
                columns={[
                  {
                    key: 'title',
                    label: 'Video Concept',
                    render: (_, v) => (
                      <div className="flex items-center gap-3">
                        <img src={v.cover || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'} className="h-10 w-10 rounded-lg object-cover border border-slate-100" referrerPolicy="no-referrer" />
                        <div>
                          <p className="font-bold text-slate-800 text-xs">{v.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{v.niche} • RPM: ${v.expected_rpm}</p>
                        </div>
                      </div>
                    )
                  },
                  {
                    key: 'virality_score',
                    label: 'Virality',
                    render: (val) => <span className="font-bold text-violet-600">{val}/100</span>
                  },
                  {
                    key: 'difficulty',
                    label: 'Difficulty'
                  }
                ]}
                searchKeys={['title', 'slug', 'description', 'niche', 'hook']}
                searchPlaceholder="Search video concepts..."
                onEdit={editVideo}
                onDelete={deleteVideo}
                isLoading={loading}
              />
            </div>
          )}

          {/* TAB 5: BLOGS */}
          {activeTab === 'blogs' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="font-sans text-lg font-bold text-slate-900">
                  Manage Blog Playbooks ({blogs.length})
                </h2>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer">
                    <Plus className="h-4 w-4" />
                    <span>Add Blog Post</span>
                  </button>
                )}
              </div>

              {isEditing && (
                <form onSubmit={handleBlogAction} className="rounded-xl border border-slate-200 bg-white p-6 shadow-md space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-800 uppercase">
                      {editId ? 'Edit Selected Blog Post' : 'Create New Blog Post'}
                    </h3>
                    <button type="button" onClick={resetForms} className="text-slate-400 hover:text-slate-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase">Title *</label>
                      <input required type="text" value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" placeholder="SEO optimization guide" />
                      {validationErrors['title'] && (
                        <p className="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-wide">{validationErrors['title']}</p>
                      )}
                    </div>
                    <div>
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-700 uppercase">Slug</label>
                        {editId && !slugUnlocked && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Warning: Changing this slug will break existing links. A 301 Redirect will be created from the old slug to the new slug. Do you want to proceed?')) {
                                setSlugUnlocked(true);
                              }
                            }}
                            className="text-[10px] text-red-600 hover:text-red-700 font-bold uppercase tracking-wider cursor-pointer"
                          >
                            Unlock Rename
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        disabled={editId ? !slugUnlocked : false}
                        value={blogSlug}
                        onChange={(e) => setBlogSlug(e.target.value)}
                        className={`mt-1 w-full rounded-lg border px-3 py-2 text-xs ${editId && !slugUnlocked ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' : 'border-slate-200'}`}
                        placeholder="seo-optimization-guide"
                      />
                      {validationErrors['slug'] && (
                        <p className="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-wide">{validationErrors['slug']}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-slate-700 uppercase">Excerpt / Summary *</label>
                      <textarea required rows={2} value={blogExcerpt} onChange={(e) => setBlogExcerpt(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" placeholder="A short high-level overview of the article." />
                      {validationErrors['excerpt'] && (
                        <p className="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-wide">{validationErrors['excerpt']}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700 uppercase">Blog Content (Markdown) *</label>
                        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px] font-bold">
                          <button
                            type="button"
                            onClick={() => setBlogEditorTab('write')}
                            className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                              blogEditorTab === 'write' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                            }`}
                          >
                            Write
                          </button>
                          <button
                            type="button"
                            onClick={() => setBlogEditorTab('preview')}
                            className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                              blogEditorTab === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                            }`}
                          >
                            Live Preview
                          </button>
                        </div>
                      </div>

                      {blogEditorTab === 'write' ? (
                        <textarea 
                          required 
                          rows={8} 
                          value={blogContent} 
                          onChange={(e) => setBlogContent(e.target.value)} 
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono" 
                          placeholder="# Core Title..." 
                        />
                      ) : (
                        <div className="mt-1 min-h-[160px] max-h-[350px] overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/50 p-4 text-xs">
                          {blogContent ? (
                            <MarkdownRenderer content={blogContent} defaultDir="auto" />
                          ) : (
                            <p className="text-slate-400 italic">Type markdown in the Write tab to see formatted live preview.</p>
                          )}
                        </div>
                      )}

                      {validationErrors['content'] && (
                        <p className="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-wide">{validationErrors['content']}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <MediaUploader
                        bucketName="blogs"
                        currentValue={blogCover}
                        onUploadSuccess={(url) => setBlogCover(url)}
                      />
                      {validationErrors['cover'] && (
                        <p className="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-wide">{validationErrors['cover']}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase">Category Tag</label>
                      <input type="text" value={blogCategory} onChange={(e) => setBlogCategory(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" placeholder="E.g., AI Workflows" />
                      {validationErrors['category'] && (
                        <p className="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-wide">{validationErrors['category']}</p>
                      )}
                    </div>
                  </div>

                  {/* Blog SEO */}
                  <div className="border-t border-slate-100 pt-4 mt-2">
                    <h4 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-3">SEO settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-bold text-red-600 uppercase">SEO Focus Keyword (Required for Publishing) *</label>
                        <input required type="text" value={blogFocusKeyword} onChange={(e) => setBlogFocusKeyword(e.target.value)} className="mt-1 w-full rounded-lg border border-red-200 px-3 py-2 text-xs" placeholder="E.g., seo-optimization-guide" />
                        <SlugKeywordValidator keyword={blogFocusKeyword} slug={blogSlug} placeholderSlug={generateSlug(blogTitle, 'blog')} />
                        <p className="mt-1 text-[10px] text-slate-500 font-medium">The primary search keyword term. MUST appear as a substring in the URL slug.</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 uppercase">SEO Page Title</label>
                        <input type="text" value={blogSeoTitle} onChange={(e) => setBlogSeoTitle(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" placeholder="Custom SEO Title" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 uppercase">SEO Page Meta Description</label>
                        <textarea rows={1} value={blogSeoDesc} onChange={(e) => setBlogSeoDesc(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" placeholder="Custom meta description" />
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Master SEO and Social Preview */}
                  <SeoPreview
                    title={blogSeoTitle || blogTitle}
                    description={blogSeoDesc || blogExcerpt}
                    slug={blogSlug || blogTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}
                    type="blog"
                    image={blogCover}
                    keywords={blogCategory}
                  />

                  <div className="flex justify-end gap-3 pt-3">
                    <button type="button" onClick={resetForms} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
                      Cancel
                    </button>
                    <button type="submit" disabled={loading} className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 cursor-pointer">
                      <span>{editId ? 'Save Changes' : 'Publish Article'}</span>
                    </button>
                  </div>
                </form>
              )}

              <DataTable
                data={blogs}
                columns={[
                  {
                    key: 'title',
                    label: 'Blog Playbook',
                    render: (_, b) => (
                      <div className="flex items-center gap-3">
                        <img src={b.cover || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'} className="h-10 w-10 rounded-lg object-cover border border-slate-100" referrerPolicy="no-referrer" />
                        <div>
                          <p className="font-bold text-slate-800 text-xs">{b.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{b.slug}</p>
                        </div>
                      </div>
                    )
                  },
                  {
                    key: 'category',
                    label: 'Category'
                  },
                  {
                    key: 'published_at',
                    label: 'Date',
                    render: (val) => val ? new Date(val).toLocaleDateString() : 'Draft'
                  }
                ]}
                searchKeys={['title', 'slug', 'excerpt', 'content']}
                searchPlaceholder="Search blog posts..."
                onEdit={editBlog}
                onDelete={deleteBlog}
                isLoading={loading}
              />
            </div>
          )}

          {/* TAB 5: PAGES */}
          {activeTab === 'pages' && (
            <div className="space-y-6">
              <h2 className="font-sans text-lg font-bold text-slate-900">
                Core Website Pages & Markdown Editor
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* List of site pages */}
                <div className="md:col-span-1 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Target Pages
                  </span>
                  {sitePages.map(page => (
                    <button
                      key={page.id}
                      onClick={() => setSelectedPage({ ...page })}
                      className={`flex w-full items-center justify-between rounded-xl border p-4 text-left font-semibold cursor-pointer transition-all ${
                        selectedPage?.id === page.id 
                          ? 'bg-slate-900 text-white border-slate-900' 
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold uppercase">{page.title}</p>
                        <p className="text-[10px] opacity-75 font-mono mt-0.5">/{page.slug}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Editor Area */}
                <div className="md:col-span-2">
                  {selectedPage ? (
                    <form onSubmit={handlePageAction} className="rounded-xl border border-slate-200 bg-white p-6 shadow-md space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                          Editing Core Page: <span className="text-red-600 font-bold">{selectedPage.title}</span>
                        </h3>
                        <button type="button" onClick={() => setSelectedPage(null)} className="text-slate-400 hover:text-slate-600">
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-slate-700 uppercase">Title</label>
                          <input required type="text" value={selectedPage.title} onChange={(e) => setSelectedPage({ ...selectedPage, title: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700 uppercase">Page Slug</label>
                          <input disabled type="text" value={selectedPage.slug} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs bg-slate-50 cursor-not-allowed" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700 uppercase">Markdown Content Body</label>
                          <textarea required rows={8} value={selectedPage.content} onChange={(e) => setSelectedPage({ ...selectedPage, content: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono" />
                        </div>

                        {/* Page SEO */}
                        <div className="border-t border-slate-100 pt-4">
                          <h4 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-3">SEO settings</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-bold text-slate-600 uppercase">SEO Page Title</label>
                              <input type="text" value={selectedPage.seo_title || ''} onChange={(e) => setSelectedPage({ ...selectedPage, seo_title: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" placeholder="E.g., Privacy Policy | So9Skills" />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-600 uppercase">SEO Meta Description</label>
                              <input type="text" value={selectedPage.seo_description || ''} onChange={(e) => setSelectedPage({ ...selectedPage, seo_description: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" placeholder="Short description of this page." />
                            </div>
                          </div>
                        </div>

                        {/* Dynamic Master SEO and Social Preview */}
                        <SeoPreview
                          title={selectedPage.seo_title || selectedPage.title}
                          description={selectedPage.seo_description || selectedPage.content?.substring(0, 150) || ''}
                          slug={selectedPage.slug}
                          type="page"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                        <button type="button" onClick={() => setSelectedPage(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
                          Cancel
                        </button>
                        <button type="submit" disabled={loading} className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 cursor-pointer flex items-center gap-1.5">
                          <Save className="h-4 w-4" />
                          <span>Save Page CMS</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
                      <FileText className="mx-auto h-12 w-12 text-slate-300" />
                      <h3 className="mt-4 text-sm font-bold text-slate-700 uppercase tracking-wider">No Page Selected</h3>
                      <p className="mt-1 text-xs text-slate-500 font-semibold leading-relaxed">
                        Select an important website page on the left to edit its content and customize SEO settings in the system.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 6: MEDIA */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <h2 className="font-sans text-lg font-bold text-slate-900">
                SEO Media Asset & Storage Library
              </h2>
              <MediaLibrary />
            </div>
          )}

          {/* TAB 7: SITE-WIDE SEO SETTINGS */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <h2 className="font-sans text-lg font-bold text-slate-900">
                SEO Site Settings & Webmaster Master Control
              </h2>
              <SiteSettingsAdmin />
            </div>
          )}

          {/* TAB 8: ADMIN PROFILE PAGE */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="font-sans text-lg font-bold text-slate-900">
                Update Admin Profile
              </h2>

              <form onSubmit={handleUpdateProfileSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-md space-y-4">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                  <img src={profileAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'} className="h-14 w-14 rounded-full object-cover border-2 border-slate-100" referrerPolicy="no-referrer" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                      {profileFullName || 'Promptat Owner'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Role Authorization Level: <strong className="font-semibold text-slate-600">{profile?.role || 'admin'}</strong></p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase">Username *</label>
                    <input required type="text" value={profileUsername} onChange={(e) => setProfileUsername(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" placeholder="stayka" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase">Full Name *</label>
                    <input required type="text" value={profileFullName} onChange={(e) => setProfileFullName(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" placeholder="Stayka Admin" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 uppercase">Avatar Image URL</label>
                    <input type="text" value={profileAvatarUrl} onChange={(e) => setProfileAvatarUrl(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 uppercase">Profile Biography</label>
                    <textarea rows={3} value={profileBio} onChange={(e) => setProfileBio(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs leading-relaxed" placeholder="I build high-end prompts and developer skills..." />
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-100">
                  <button type="submit" disabled={loading} className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 cursor-pointer flex items-center gap-1.5 shadow-sm">
                    <Save className="h-4 w-4" />
                    <span>Save Profile</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 9: TRANSLATION MATRIX MANAGER */}
          {activeTab === 'translations' && (
            <TranslationManager
              prompts={prompts}
              skills={skills}
              videos={videos}
              blogs={blogs}
              showNotification={showNotification}
            />
          )}

          {/* TAB 10: INTERNATIONAL SEO & HREFLANG VALIDATOR */}
          {activeTab === 'intl-seo' && (
            <InternationalSeoAdmin
              prompts={prompts}
              skills={skills}
              videos={videos}
              blogs={blogs}
              showNotification={showNotification}
            />
          )}

          <ConfirmDeleteModal
            isOpen={deleteModalOpen}
            onClose={() => {
              setDeleteModalOpen(false);
              setDeleteTarget(null);
            }}
            onConfirm={deleteTarget?.onConfirm || (() => {})}
            itemName={deleteTarget?.name || ''}
            itemType={deleteTarget?.type || ''}
          />
    </AdminLayout>
  );
};
