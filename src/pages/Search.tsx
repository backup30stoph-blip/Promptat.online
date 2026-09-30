import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { PromptCard } from '../components/cards/PromptCard';
import { SkillCard } from '../components/cards/SkillCard';
import { VideoCard } from '../components/cards/VideoCard';
import { BlogCard } from '../components/cards/BlogCard';
import { Search as SearchIcon, Sparkles, Cpu, Video, BookOpen, Layers, TrendingUp } from 'lucide-react';
import { supabase } from '../services/supabase/client';
import { getLocalizedItem } from '../lib/i18n';

export const Search: React.FC = () => {
  const { 
    prompts, 
    skills, 
    videos, 
    blogs, 
    searchQuery, 
    setSearchQuery,
    navigateTo,
    currentLang,
    t,
    isRtl
  } = useApp();

  const [activeSearchTab, setActiveSearchTab] = useState<'all' | 'prompts' | 'skills' | 'videos' | 'blogs'>('all');
  
  // Local state for debounced live typing
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dbKeywords, setDbKeywords] = useState<{ id: string; keyword: string; type: string }[]>([]);
  const [isFetchingKeywords, setIsFetchingKeywords] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync external search query updates (e.g. from homepage click)
  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  // Fetch trending keywords from database
  useEffect(() => {
    if (!localQuery.trim()) {
      setDbKeywords([]);
      return;
    }

    const fetchKeywords = async () => {
      setIsFetchingKeywords(true);
      try {
        const query = localQuery.trim();
        
        // Query categories
        const { data: catDb } = await supabase
          .from('categories')
          .select('id, title, type')
          .ilike('title', `%${query}%`)
          .limit(3);

        // Query prompts
        const { data: promptsDb } = await supabase
          .from('prompts')
          .select('id, title')
          .ilike('title', `%${query}%`)
          .limit(3);

        const results: { id: string; keyword: string; type: string }[] = [];

        if (catDb) {
          catDb.forEach((cat: any) => {
            results.push({
              id: cat.id,
              keyword: cat.title,
              type: `Category: ${cat.type}`
            });
          });
        }

        if (promptsDb) {
          promptsDb.forEach((p: any) => {
            results.push({
              id: p.id,
              keyword: p.title,
              type: 'Prompt Title'
            });
          });
        }

        setDbKeywords(results);
      } catch (err) {
        console.warn('Failed to fetch autocomplete tags from database:', err);
      } finally {
        setIsFetchingKeywords(false);
      }
    };

    const timer = setTimeout(() => {
      fetchKeywords();
    }, 200);

    return () => clearTimeout(timer);
  }, [localQuery]);

  // Debounced effect to update global search context
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [localQuery, setSearchQuery]);

  // Handle click outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter local/instant live suggestions
  const suggestedPrompts = useMemo(() => {
    if (!localQuery.trim()) return [];
    return prompts.filter(p => p.title.toLowerCase().includes(localQuery.toLowerCase())).slice(0, 4);
  }, [prompts, localQuery]);

  const suggestedSkills = useMemo(() => {
    if (!localQuery.trim()) return [];
    return skills.filter(s => s.title.toLowerCase().includes(localQuery.toLowerCase())).slice(0, 4);
  }, [skills, localQuery]);

  const suggestedBlogs = useMemo(() => {
    if (!localQuery.trim()) return [];
    return blogs.filter(b => b.title.toLowerCase().includes(localQuery.toLowerCase())).slice(0, 4);
  }, [blogs, localQuery]);

  const hasSuggestions = suggestedPrompts.length > 0 || suggestedSkills.length > 0 || suggestedBlogs.length > 0 || dbKeywords.length > 0 || isFetchingKeywords;

  // Multi-directory search matches (using global debounced query)
  const matchedPrompts = useMemo(() => {
    if (!searchQuery) return [];
    return prompts.filter(p => (
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.model.toLowerCase().includes(searchQuery.toLowerCase())
    ));
  }, [prompts, searchQuery]);

  const matchedSkills = useMemo(() => {
    if (!searchQuery) return [];
    return skills.filter(s => (
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.markdown_file.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.supported_ai.some(ai => ai.toLowerCase().includes(searchQuery.toLowerCase()))
    ));
  }, [skills, searchQuery]);

  const matchedVideos = useMemo(() => {
    if (!searchQuery) return [];
    return videos.filter(v => (
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.hook.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.niche.toLowerCase().includes(searchQuery.toLowerCase())
    ));
  }, [videos, searchQuery]);

  const matchedBlogs = useMemo(() => {
    if (!searchQuery) return [];
    return blogs.filter(b => (
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.content.toLowerCase().includes(searchQuery.toLowerCase())
    ));
  }, [blogs, searchQuery]);

  const totalMatches = 
    matchedPrompts.length + 
    matchedSkills.length + 
    matchedVideos.length + 
    matchedBlogs.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      
      {/* Title */}
      <div className="border-b border-slate-100 pb-5">
        <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 flex items-center space-x-3">
          <SearchIcon className="h-7 w-7 text-indigo-600" />
          <span>{t('navSearch', 'Global Hub Search')}</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {t('searchPlaceholder', 'Perform a multi-directory search across image prompts, technical developer rule files, video plans, and manuals.')}
        </p>
      </div>

      {/* Big Search Input & Debounced Suggestions */}
      <div className="relative max-w-3xl" ref={dropdownRef}>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <SearchIcon className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          value={localQuery}
          onChange={(e) => {
            setLocalQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder={t('searchEverything', 'Type here to search everything...')}
          className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-slate-950 placeholder-slate-400 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />

        {/* Dynamic suggestion dropdown */}
        {showDropdown && localQuery.trim() && (
          <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
            {hasSuggestions ? (
              <div className="p-3 space-y-4">
                
                {/* Database-driven autocomplete matches */}
                {(dbKeywords.length > 0 || isFetchingKeywords) && (
                  <div className="border-b border-slate-100 pb-3">
                    <h4 className="flex items-center space-x-1 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      <TrendingUp className="h-3 w-3 text-red-500 animate-pulse" />
                      <span>Trending Keywords (Database Sync)</span>
                    </h4>
                    <div className="mt-1 space-y-0.5">
                      {isFetchingKeywords && dbKeywords.length === 0 && (
                        <div className="px-3 py-2 text-xs text-slate-400 italic">
                          Searching database...
                        </div>
                      )}
                      {dbKeywords.map((kw, index) => (
                        <button
                          key={`${kw.id}-${index}`}
                          onClick={() => {
                            setLocalQuery(kw.keyword);
                            setSearchQuery(kw.keyword);
                            setShowDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-red-50 hover:text-[#e21833] transition-colors flex items-center justify-between"
                        >
                          <span className="truncate mr-4">{kw.keyword}</span>
                          <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest shrink-0 bg-slate-100 px-1.5 py-0.5 rounded">
                            {kw.type}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prompts group */}
                {suggestedPrompts.length > 0 && (
                  <div>
                    <h4 className="flex items-center space-x-1 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      <Sparkles className="h-3 w-3 text-indigo-500" />
                      <span>Suggested Prompts</span>
                    </h4>
                    <div className="mt-1 space-y-0.5">
                      {suggestedPrompts.map(p => (
                        <button
                          key={p.id}
                          onClick={() => {
                            navigateTo('prompts', { type: 'prompt', slug: p.slug });
                            setShowDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-900 transition-colors flex items-center justify-between"
                        >
                          <span className="truncate mr-4">{p.title}</span>
                          <span className="text-[9px] font-black uppercase text-indigo-500 tracking-widest shrink-0">Open Prompt</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills group */}
                {suggestedSkills.length > 0 && (
                  <div>
                    <h4 className="flex items-center space-x-1 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      <Cpu className="h-3 w-3 text-emerald-500" />
                      <span>Suggested Developer Skills</span>
                    </h4>
                    <div className="mt-1 space-y-0.5">
                      {suggestedSkills.map(s => (
                        <button
                          key={s.id}
                          onClick={() => {
                            navigateTo('skills', { type: 'skill', slug: s.slug });
                            setShowDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors flex items-center justify-between"
                        >
                          <span className="truncate mr-4">{s.title}</span>
                          <span className="text-[9px] font-black uppercase text-emerald-500 tracking-widest shrink-0">Open Skill</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Blogs group */}
                {suggestedBlogs.length > 0 && (
                  <div>
                    <h4 className="flex items-center space-x-1 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      <BookOpen className="h-3 w-3 text-rose-500" />
                      <span>Suggested Blog Posts</span>
                    </h4>
                    <div className="mt-1 space-y-0.5">
                      {suggestedBlogs.map(b => (
                        <button
                          key={b.id}
                          onClick={() => {
                            navigateTo('blog', { type: 'blog', slug: b.slug });
                            setShowDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-900 transition-colors flex items-center justify-between"
                        >
                          <span className="truncate mr-4">{b.title}</span>
                          <span className="text-[9px] font-black uppercase text-rose-500 tracking-widest shrink-0">Read Post</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 text-xs font-semibold">
                No real-time suggestions match your keyword. Type more to search everything...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Matches counts and filter row */}
      {searchQuery && (
        <div className="space-y-6">
          
          {/* Sub-tabs count selectors */}
          <div className="flex flex-wrap border-b border-slate-200">
            {[
              { id: 'all', label: t('filterAll', 'All Matches'), count: totalMatches, icon: Layers },
              { id: 'prompts', label: t('navPrompts', 'Prompts'), count: matchedPrompts.length, icon: Sparkles },
              { id: 'skills', label: t('navSkills', 'Developer Skills'), count: matchedSkills.length, icon: Cpu },
              { id: 'videos', label: t('navVideos', 'Videos'), count: matchedVideos.length, icon: Video },
              { id: 'blogs', label: t('navBlog', 'Blogs'), count: matchedBlogs.length, icon: BookOpen }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSearchTab(tab.id as any)}
                  className={`flex items-center space-x-1.5 border-b-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeSearchTab === tab.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* RENDERING SECTIONS BASED ON TAB */}
          <div className="space-y-12">
            
            {/* Prompts section */}
            {(activeSearchTab === 'all' || activeSearchTab === 'prompts') && matchedPrompts.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-display text-sm font-extrabold uppercase tracking-widest text-indigo-500">
                  Matching Prompts ({matchedPrompts.length})
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {matchedPrompts.map(p => (
                    <PromptCard key={p.id} prompt={p} />
                  ))}
                </div>
              </div>
            )}

            {/* Skills Section */}
            {(activeSearchTab === 'all' || activeSearchTab === 'skills') && matchedSkills.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-display text-sm font-extrabold uppercase tracking-widest text-emerald-500">
                  Matching Technical Skills ({matchedSkills.length})
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {matchedSkills.map(s => (
                    <SkillCard key={s.id} skill={s} />
                  ))}
                </div>
              </div>
            )}

            {/* Videos Section */}
            {(activeSearchTab === 'all' || activeSearchTab === 'videos') && matchedVideos.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-display text-sm font-extrabold uppercase tracking-widest text-rose-500">
                  Matching Video Blueprints ({matchedVideos.length})
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
                  {matchedVideos.map(v => (
                    <VideoCard key={v.id} video={v} />
                  ))}
                </div>
              </div>
            )}

            {/* Blogs Section */}
            {(activeSearchTab === 'all' || activeSearchTab === 'blogs') && matchedBlogs.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-display text-sm font-extrabold uppercase tracking-widest text-red-500">
                  Matching Blog Playbooks ({matchedBlogs.length})
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {matchedBlogs.map(b => (
                    <BlogCard key={b.id} article={b} />
                  ))}
                </div>
              </div>
            )}

            {/* No matches for selected filter */}
            {totalMatches === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 p-16 text-center">
                <SearchIcon className="mx-auto h-10 w-10 text-slate-400" />
                <h3 className="mt-4 text-sm font-bold text-slate-900">No query matches</h3>
                <p className="mt-1 text-xs text-slate-500">
                  لم نجد نتائج مطابقة في قاعدة بيانات برومبتات أونلاين لـ "{searchQuery}". جرب البحث بكلمات أخرى.
                </p>
              </div>
            )}

          </div>

        </div>
      )}

      {/* Default waiting state */}
      {!searchQuery && (
        <div className="rounded-2xl bg-slate-50 p-12 text-center">
          <p className="text-sm font-medium text-slate-500">
            Please type a keyword in the search box above to scan all hub directories dynamically.
          </p>
        </div>
      )}

    </div>
  );
};
