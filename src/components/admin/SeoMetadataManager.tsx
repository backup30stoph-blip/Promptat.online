import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase/client';
import { SEOMetadata } from '../../types';
import { SeoPreview } from './SeoPreview';
import { 
  FileText, Search, Filter, Edit3, CheckCircle2, AlertCircle, 
  RefreshCw, Globe, ArrowRight, Sparkles, Code, Video, BookOpen, Compass, Tag
} from 'lucide-react';

interface UnifiedSeoItem {
  id: string;
  title: string;
  slug: string;
  type: 'page' | 'prompt' | 'blog' | 'skill' | 'video' | 'category';
  existingMeta?: SEOMetadata;
}

export const SeoMetadataManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [allItems, setAllItems] = useState<UnifiedSeoItem[]>([]);
  const [seoMetaList, setSeoMetaList] = useState<SEOMetadata[]>([]);
  
  // Selection and filter states
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [optimizationFilter, setOptimizationFilter] = useState<'all' | 'configured' | 'missing' | 'warnings'>('all');
  const [selectedItem, setSelectedItem] = useState<UnifiedSeoItem | null>(null);

  // Form states
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [focusKeyword, setFocusKeyword] = useState('');
  const [ogTitle, setOgTitle] = useState('');
  const [ogDescription, setOgDescription] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [robots, setRobots] = useState('index, follow');
  const [canonicalUrl, setCanonicalUrl] = useState('');

  // Notification messages
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load all data from Supabase
  const loadSeoData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      // 1. Fetch existing SEO metadata rows
      const { data: metaData, error: metaError } = await supabase
        .from('seo_metadata')
        .select('*');

      if (metaError) throw metaError;
      const metadata = metaData as SEOMetadata[] || [];
      setSeoMetaList(metadata);

      // 2. Fetch parallel entities
      const [
        { data: pagesData },
        { data: promptsData },
        { data: blogsData },
        { data: skillsData },
        { data: videosData },
        { data: categoriesData }
      ] = await Promise.all([
        supabase.from('site_pages').select('id, title, slug'),
        supabase.from('prompts').select('id, title, slug, thumbnail_url'),
        supabase.from('blogs').select('id, title, slug, cover_image'),
        supabase.from('skills').select('id, title, slug, cover_image'),
        supabase.from('video_concepts').select('id, title, slug, cover_image'),
        supabase.from('categories').select('id, title, slug')
      ]);

      const unified: UnifiedSeoItem[] = [];

      // Add Static Pages
      if (pagesData) {
        pagesData.forEach(p => {
          unified.push({
            id: p.id,
            title: p.title,
            slug: p.slug,
            type: 'page',
            existingMeta: metadata.find(m => m.entity_type === 'page' && m.entity_id === p.id)
          });
        });
      }

      // Add Image Prompts
      if (promptsData) {
        promptsData.forEach(p => {
          unified.push({
            id: p.id,
            title: p.title,
            slug: p.slug,
            type: 'prompt',
            existingMeta: metadata.find(m => m.entity_type === 'prompt' && m.entity_id === p.id)
          });
        });
      }

      // Add Blog Playbooks
      if (blogsData) {
        blogsData.forEach(p => {
          unified.push({
            id: p.id,
            title: p.title,
            slug: p.slug,
            type: 'blog',
            existingMeta: metadata.find(m => m.entity_type === 'blog' && m.entity_id === p.id)
          });
        });
      }

      // Add Creator Skills
      if (skillsData) {
        skillsData.forEach(p => {
          unified.push({
            id: p.id,
            title: p.title,
            slug: p.slug,
            type: 'skill',
            existingMeta: metadata.find(m => m.entity_type === 'skill' && m.entity_id === p.id)
          });
        });
      }

      // Add Videos
      if (videosData) {
        videosData.forEach(p => {
          unified.push({
            id: p.id,
            title: p.title,
            slug: p.slug,
            type: 'video',
            existingMeta: metadata.find(m => m.entity_type === 'video' && m.entity_id === p.id)
          });
        });
      }

      // Add Categories
      if (categoriesData) {
        categoriesData.forEach(p => {
          unified.push({
            id: p.id,
            title: p.title,
            slug: p.slug,
            type: 'category',
            existingMeta: metadata.find(m => m.entity_type === 'category' && m.entity_id === p.id)
          });
        });
      }

      setAllItems(unified);

    } catch (err: any) {
      console.error('Error loading SEO metadata console:', err);
      setErrorMsg(err.message || 'Failed to populate SEO metadata tables.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeoData();
  }, []);

  // Update form values when selected item changes
  useEffect(() => {
    if (selectedItem) {
      const meta = selectedItem.existingMeta;
      setSeoTitle(meta?.seo_title || selectedItem.title || '');
      setMetaDescription(meta?.meta_description || '');
      setFocusKeyword(meta?.focus_keyword || '');
      setOgTitle(meta?.og_title || meta?.seo_title || selectedItem.title || '');
      setOgDescription(meta?.og_description || meta?.meta_description || '');
      setOgImage(meta?.og_image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80');
      setRobots(meta?.robots || 'index, follow');
      setCanonicalUrl(meta?.canonical_url || `https://gemiprompts.store/${selectedItem.type}/${selectedItem.slug}`);
    } else {
      setSeoTitle('');
      setMetaDescription('');
      setFocusKeyword('');
      setOgTitle('');
      setOgDescription('');
      setOgImage('');
      setRobots('index, follow');
      setCanonicalUrl('');
    }
  }, [selectedItem]);

  const triggerNotify = (text: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') {
      setSuccessMsg(text);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(text);
      setTimeout(() => setErrorMsg(null), 5000);
    }
  };

  // Save SEO changes to Supabase
  const handleSaveSeo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      setSaveLoading(true);
      setErrorMsg(null);

      const payload: any = {
        entity_type: selectedItem.type,
        entity_id: selectedItem.id,
        seo_title: seoTitle.trim(),
        meta_description: metaDescription.trim(),
        focus_keyword: focusKeyword.trim(),
        og_title: ogTitle.trim() || seoTitle.trim(),
        og_description: ogDescription.trim() || metaDescription.trim(),
        og_image: ogImage.trim(),
        slug: selectedItem.slug,
        canonical_url: canonicalUrl.trim(),
        robots: robots,
        updated_at: new Date().toISOString()
      };

      // Set explicit polymorphic relation columns
      if (selectedItem.type === 'prompt') payload.prompt_id = selectedItem.id;
      if (selectedItem.type === 'blog') payload.blog_id = selectedItem.id;
      if (selectedItem.type === 'skill') payload.skill_id = selectedItem.id;
      if (selectedItem.type === 'video') payload.video_concept_id = selectedItem.id;
      if (selectedItem.type === 'category') payload.category_id = selectedItem.id;

      // Upsert in database
      const { data, error } = await supabase
        .from('seo_metadata')
        .upsert(payload, { onConflict: 'entity_type,entity_id' })
        .select()
        .single();

      if (error) throw error;

      triggerNotify(`SEO Meta Tags synchronized successfully for "${selectedItem.title}"!`);

      // Refresh data locally
      setSeoMetaList(prev => {
        const index = prev.findIndex(m => m.entity_type === selectedItem.type && m.entity_id === selectedItem.id);
        if (index > -1) {
          const next = [...prev];
          next[index] = data as SEOMetadata;
          return next;
        } else {
          return [...prev, data as SEOMetadata];
        }
      });

      setAllItems(prev => prev.map(item => {
        if (item.type === selectedItem.type && item.id === selectedItem.id) {
          return {
            ...item,
            existingMeta: data as SEOMetadata
          };
        }
        return item;
      }));

      // Update active selection to reflect newly saved meta
      setSelectedItem(prev => prev ? { ...prev, existingMeta: data as SEOMetadata } : null);

    } catch (err: any) {
      console.error('Error saving SEO tags:', err);
      triggerNotify(err.message || 'Failed to save custom SEO tags.', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  // Render proper icon for entity types
  const getIcon = (type: string) => {
    switch (type) {
      case 'page': return FileText;
      case 'prompt': return Sparkles;
      case 'skill': return Code;
      case 'video': return Video;
      case 'blog': return BookOpen;
      case 'category': return Compass;
      default: return Tag;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'page': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'prompt': return 'bg-violet-50 text-violet-700 border-violet-100';
      case 'skill': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'video': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'blog': return 'bg-sky-50 text-sky-700 border-sky-100';
      case 'category': return 'bg-teal-50 text-teal-700 border-teal-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  // Filter logic
  const filteredItems = allItems.filter(item => {
    // 1. Type selection
    if (selectedType !== 'all' && item.type !== selectedType) return false;

    // 2. Search query matching
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchSlug = item.slug?.toLowerCase().includes(q);
      if (!matchTitle && !matchSlug) return false;
    }

    // 3. Optimization scoring state filters
    if (optimizationFilter !== 'all') {
      const isConfigured = !!item.existingMeta;
      if (optimizationFilter === 'configured' && !isConfigured) return false;
      if (optimizationFilter === 'missing' && isConfigured) return false;
      if (optimizationFilter === 'warnings') {
        if (!isConfigured) return false;
        // Check if has warnings (e.g., description length outside 110-160, or title length outside 15-60)
        const titleLen = item.existingMeta?.seo_title?.length || 0;
        const descLen = item.existingMeta?.meta_description?.length || 0;
        const hasWarning = titleLen < 15 || titleLen > 60 || descLen < 110 || descLen > 160 || !item.existingMeta?.focus_keyword;
        if (!hasWarning) return false;
      }
    }

    return true;
  });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 text-left animate-slide-in">
      
      {/* LEFT SIDEBAR: LIST OF PAGES / ITEMS */}
      <div className="xl:col-span-5 space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-4">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-[#10b981]" />
                <span>Page-Specific SEO Hub</span>
              </h4>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                Select pages or entities to manage meta tags.
              </p>
            </div>
            <button 
              onClick={loadSeoData} 
              disabled={loading}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-all cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Quick Stats overview */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-2">
              <span className="text-[8px] font-black text-slate-400 uppercase block">Total Items</span>
              <span className="text-sm font-black text-slate-800 mt-0.5 block">{allItems.length}</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2">
              <span className="text-[8px] font-black text-emerald-700 uppercase block">Custom Config</span>
              <span className="text-sm font-black text-emerald-800 mt-0.5 block">{seoMetaList.length}</span>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-2">
              <span className="text-[8px] font-black text-amber-700 uppercase block">Missing Meta</span>
              <span className="text-sm font-black text-amber-800 mt-0.5 block">
                {allItems.length - seoMetaList.length}
              </span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="space-y-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search slug or page title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-1.5 text-xs focus:ring-1 focus:ring-[#10b981] outline-hidden"
              />
            </div>

            {/* Type Filter Buttons Scrollable row */}
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
              {[
                { id: 'all', title: 'All' },
                { id: 'page', title: 'Static Pages' },
                { id: 'prompt', title: 'Prompts' },
                { id: 'skill', title: 'Skills' },
                { id: 'blog', title: 'Blogs' },
                { id: 'video', title: 'Videos' },
                { id: 'category', title: 'Categories' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border whitespace-nowrap cursor-pointer transition-all ${
                    selectedType === t.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {t.title}
                </button>
              ))}
            </div>

            {/* Optimization State Select Filter */}
            <div className="flex items-center justify-between text-[10px] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-600">
              <span className="flex items-center gap-1">
                <Filter className="h-3 w-3" />
                <span>SEO Optimization filter:</span>
              </span>
              <select
                value={optimizationFilter}
                onChange={(e) => setOptimizationFilter(e.target.value as any)}
                className="bg-transparent border-none py-0 pl-1 pr-6 font-black uppercase tracking-wider text-slate-800 outline-hidden focus:ring-0 cursor-pointer"
              >
                <option value="all">All Items</option>
                <option value="configured">Configured Tags</option>
                <option value="missing">Missing Tags</option>
                <option value="warnings">Has SEO Warnings</option>
              </select>
            </div>
          </div>

          {/* List display */}
          <div className="max-h-128 overflow-y-auto divide-y divide-slate-100 pr-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                <RefreshCw className="h-6 w-6 animate-spin text-[#10b981]" />
                <span className="text-xs font-semibold">Loading CMS Catalog...</span>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs font-medium">
                No items match your selected filters.
              </div>
            ) : (
              filteredItems.map(item => {
                const ItemIcon = getIcon(item.type);
                const isSelected = selectedItem?.type === item.type && selectedItem?.id === item.id;
                const hasMeta = !!item.existingMeta;

                // Validate warnings
                let hasWarnings = false;
                if (hasMeta) {
                  const titleLen = item.existingMeta?.seo_title?.length || 0;
                  const descLen = item.existingMeta?.meta_description?.length || 0;
                  hasWarnings = titleLen < 15 || titleLen > 60 || descLen < 110 || descLen > 160 || !item.existingMeta?.focus_keyword;
                }

                return (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => setSelectedItem(item)}
                    className={`flex w-full items-center justify-between p-3 transition-all rounded-lg text-left cursor-pointer border ${
                      isSelected 
                        ? 'bg-slate-50 border-slate-300' 
                        : 'bg-white border-transparent hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500 shrink-0 mt-0.5">
                        <ItemIcon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-slate-800 truncate leading-snug">{item.title}</h5>
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5 truncate">
                          /{item.type === 'page' ? '' : `${item.type}/`}{item.slug}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 pl-2">
                      <span className={`inline-flex rounded-full border px-1.5 py-0.5 text-[8px] font-black uppercase ${getBadgeColor(item.type)}`}>
                        {item.type === 'page' ? 'Core Page' : item.type}
                      </span>
                      {hasMeta ? (
                        hasWarnings ? (
                          <div className="h-2 w-2 rounded-full bg-amber-400" title="Configured with warnings" />
                        ) : (
                          <span title="SEO fully optimized">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          </span>
                        )
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-slate-200" title="No custom SEO tags configured yet" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

        </div>
      </div>

      {/* RIGHT WORKSPACE: DYNAMIC FORM EDITOR & PREVIEW */}
      <div className="xl:col-span-7">
        {selectedItem ? (
          <div className="space-y-6">
            
            {/* Action status panels */}
            {errorMsg && (
              <div className="rounded-xl bg-red-50 border border-red-100 p-3.5 flex items-start gap-2.5 text-xs font-bold text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3.5 flex items-start gap-2.5 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Editor Block */}
            <form onSubmit={handleSaveSeo} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Edit3 className="h-4 w-4 text-[#10b981]" />
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Edit SEO Meta tags: <span className="text-[#10b981]">{selectedItem.title}</span>
                  </h3>
                </div>
                <button 
                  type="button" 
                  onClick={() => setSelectedItem(null)} 
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-wider"
                >
                  Close
                </button>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left text-xs font-semibold">
                
                {/* SEO Title Tag */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-400 uppercase">
                      SEO Header Title tag
                    </label>
                    <span className={`text-[9px] font-bold ${
                      seoTitle.length < 15 || seoTitle.length > 60 ? 'text-amber-500 font-black' : 'text-emerald-600'
                    }`}>
                      {seoTitle.length}/60 chars
                    </span>
                  </div>
                  <input
                    required
                    type="text"
                    maxLength={60}
                    placeholder="Enter meta title tag..."
                    value={seoTitle}
                    onChange={(e) => {
                      setSeoTitle(e.target.value);
                      if (ogTitle === seoTitle || !ogTitle) {
                        setOgTitle(e.target.value);
                      }
                    }}
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#10b981] outline-hidden"
                  />
                  <p className="text-[9px] text-slate-400 leading-none">Ideal: 15–60 characters. Appears as the link in search results.</p>
                </div>

                {/* Focus Keyword */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">
                    Focus SEO Keyword
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g., gemini image prompts, advanced coding"
                    value={focusKeyword}
                    onChange={(e) => setFocusKeyword(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#10b981] outline-hidden"
                  />
                  <p className="text-[9px] text-slate-400 leading-none">Primary search term used to score the metadata performance.</p>
                </div>

                {/* Meta Description */}
                <div className="md:col-span-2 space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-400 uppercase">
                      Search Snippet Meta Description
                    </label>
                    <span className={`text-[9px] font-bold ${
                      metaDescription.length < 110 || metaDescription.length > 160 ? 'text-amber-500 font-black' : 'text-emerald-600'
                    }`}>
                      {metaDescription.length}/160 chars
                    </span>
                  </div>
                  <textarea
                    required
                    rows={2}
                    maxLength={160}
                    placeholder="Enter short meta description to entice click-through-rates..."
                    value={metaDescription}
                    onChange={(e) => {
                      setMetaDescription(e.target.value);
                      if (ogDescription === metaDescription || !ogDescription) {
                        setOgDescription(e.target.value);
                      }
                    }}
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#10b981] outline-hidden leading-relaxed"
                  />
                  <p className="text-[9px] text-slate-400 leading-none">Ideal: 110–160 characters. Summarizes page contents for user SERP snippet views.</p>
                </div>

                {/* OpenGraph Image */}
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">
                    Social og:image cover (URL)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={ogImage}
                      onChange={(e) => setOgImage(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#10b981] outline-hidden"
                    />
                  </div>
                  <p className="text-[9px] text-slate-400 leading-none">Used as preview cover when shared on WhatsApp, Twitter, Slack, and Facebook.</p>
                </div>

                {/* Robots options */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">
                    Search Crawler Directives (Robots)
                  </label>
                  <select
                    value={robots}
                    onChange={(e) => setRobots(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#10b981] outline-hidden cursor-pointer bg-white"
                  >
                    <option value="index, follow">Index, Follow (Standard SEO)</option>
                    <option value="noindex, follow">Noindex, Follow (Recommended for intermediate filters)</option>
                    <option value="index, nofollow">Index, Nofollow (Niche index check)</option>
                    <option value="noindex, nofollow">Noindex, Nofollow (Hidden from all search engines)</option>
                  </select>
                </div>

                {/* Canonical URL overrides */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">
                    Canonical Page URL Path
                  </label>
                  <input
                    type="text"
                    placeholder="https://gemiprompts.store/..."
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#10b981] outline-hidden"
                  />
                </div>

              </div>

              {/* Advanced OpenGraph Overrides */}
              <details className="text-left text-xs font-semibold space-y-3 group border border-slate-100 rounded-lg p-2 bg-slate-50/50">
                <summary className="text-[10px] font-black text-slate-500 uppercase cursor-pointer select-none outline-hidden flex items-center justify-between">
                  <span>Show Advanced OpenGraph social overrides</span>
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                
                <div className="space-y-3 mt-3 animate-fade-in text-xs font-semibold">
                  {/* Social og:title */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Social Title Override</label>
                    <input
                      type="text"
                      placeholder="Enter Social Title Override..."
                      value={ogTitle}
                      onChange={(e) => setOgTitle(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#10b981] bg-white outline-hidden"
                    />
                  </div>

                  {/* Social og:description */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Social Description Override</label>
                    <textarea
                      rows={2}
                      placeholder="Enter Social Description Override..."
                      value={ogDescription}
                      onChange={(e) => setOgDescription(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#10b981] bg-white outline-hidden leading-relaxed"
                    />
                  </div>
                </div>
              </details>

              {/* SAVE / UPDATE BUTTON */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer active:scale-98 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2 text-xs cursor-pointer active:scale-98 transition-all flex items-center gap-1.5 shadow-sm shadow-[#10b981]/10 border border-slate-900"
                >
                  {saveLoading ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Synchronizing...</span>
                    </>
                  ) : (
                    <>
                      <span>Save SEO Settings</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>

            </form>

            {/* REAL-TIME LIVE SEO SIMULATOR PREVIEW */}
            <SeoPreview
              title={seoTitle || selectedItem.title}
              description={metaDescription || 'No description entered. Google will automatically summarize page text...'}
              slug={selectedItem.slug}
              type={selectedItem.type}
              image={ogImage}
              keywords={focusKeyword}
            />

          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white py-16 text-center text-slate-400 space-y-2 flex flex-col items-center justify-center min-h-[500px]">
            <div className="p-3.5 bg-slate-50 text-slate-400 rounded-full border border-slate-100 mb-2">
              <Globe className="h-8 w-8 text-slate-300" />
            </div>
            <h4 className="text-sm font-black text-slate-700 uppercase tracking-wider">
              No Selection Active
            </h4>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Select an item or page from the list on the left to review its SEO quality, view interactive SERP/Social previews, and edit tags in real time.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
