import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/categories';
import { SkillCard } from '../components/cards/SkillCard';
import { ShareControl } from '../components/ShareControl';
import { CommentsSection } from '../components/CommentsSection';
import { Skeleton } from '../components/Skeleton';
import { AISkill } from '../types';
import { PageNotFound } from './PageNotFound';
import { 
  ArrowLeft, Copy, Check, Download, Layers, Terminal, FileCode, CheckCircle2,
  Heart, Search 
} from 'lucide-react';
import { useSeoMetadata } from '../hooks/useSeoMetadata';
import { RelatedContent } from '../components/RelatedContent';
import { ScrollProgressBar } from '../components/ScrollProgressBar';
import { AdSlot } from '../components/AdSlot';
import { getLocalizedItem, getLocalizedCategoryTitle } from '../lib/i18n';

export const Skills: React.FC = () => {
  const { 
    skills, 
    activeDetail, 
    navigateTo, 
    state, 
    toggleLike, 
    registerDownload, 
    showNotification,
    searchQuery,
    setSearchQuery,
    currentLang,
    t,
    isRtl
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAI, setSelectedAI] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('downloads');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Determine active skill for single-item SEO fetch
  const currentSkillForSeo = useMemo(() => {
    if (activeDetail && activeDetail.type === 'skill') {
      return skills.find(s => s.slug === activeDetail.slug);
    }
    return null;
  }, [activeDetail, skills]);

  const seoOptions = useMemo(() => {
    if (currentSkillForSeo) {
      return {
        entityType: 'skill' as const,
        entityId: currentSkillForSeo.id,
        title: `${currentSkillForSeo.title} | Promptat Online Workflows`,
        description: currentSkillForSeo.description,
        robots: 'index, follow'
      };
    }

    return {
      title: 'مهارات ومخططات الذكاء الاصطناعي | Promptat Online',
      description: 'Explore full-stack cursorrules, premium coding workflows, agent rules, and automation systems for pro creators.',
      robots: 'index, follow'
    };
  }, [currentSkillForSeo]);

  useSeoMetadata(seoOptions);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 550);
    return () => clearTimeout(timer);
  }, [selectedCategory, selectedAI, sortBy, searchQuery, activeDetail]);

  const skillCategories = useMemo(() => CATEGORIES.filter(c => c.type === 'Skill'), []);

  // Filter skills
  const filteredSkills = useMemo(() => {
    return skills.filter(s => {
      const matchSearch = searchQuery ? (
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.markdown_file.toLowerCase().includes(searchQuery.toLowerCase())
      ) : true;

      const catObj = CATEGORIES.find(c => c.id === s.category_id);
      const matchCat = selectedCategory === 'all' ? true : catObj?.slug === selectedCategory;
      
      const matchAI = selectedAI === 'all' ? true : (
        s.supported_ai.some(ai => ai.toLowerCase() === selectedAI.toLowerCase())
      );

      return matchSearch && matchCat && matchAI;
    }).sort((a, b) => {
      if (sortBy === 'popularity' || sortBy === 'likes') return b.likes - a.likes;
      if (sortBy === 'newest') return b.id.localeCompare(a.id); // Or latest
      if (sortBy === 'most_discussed') return (b.views + b.likes * 2) - (a.views + a.likes * 2);
      if (sortBy === 'downloads') return b.downloads - a.downloads;
      return b.likes - a.likes;
    });
  }, [skills, searchQuery, selectedCategory, selectedAI, sortBy]);

  // Copy trigger
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    showNotification('Code snippet copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  // Dynamic skill mock files download
  const downloadSkillFile = (skill: AISkill, format: 'zip' | 'md' | 'json' | 'pdf') => {
    let content = '';
    let fileName = `${skill.slug}_asset.${format}`;

    if (format === 'md') {
      content = `# ${skill.title}\n\n${skill.description}\n\n## Instructions\n${skill.how_to_use}\n\n## Content Prompt / Code\n\`\`\`text\n${skill.markdown_file}\n\`\`\``;
    } else if (format === 'json') {
      content = JSON.stringify({
        id: skill.id,
        title: skill.title,
        version: skill.version,
        difficulty: skill.difficulty,
        supported_ai: skill.supported_ai,
        prompt: skill.markdown_file
      }, null, 2);
    } else {
      // Binary mock download files
      content = `Promptat.online premium payload package representing: ${skill.title} (Version: ${skill.version}). Build code: PROMPTAT-${skill.id}`;
    }

    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    registerDownload('skills', skill.id);
  };

  // DETAIL VIEW
  if (activeDetail && activeDetail.type === 'skill') {
    const rawSkill = skills.find(s => s.slug === activeDetail.slug);
    if (!rawSkill) {
      return <PageNotFound type="skill" slug={activeDetail.slug} />;
    }
    const currentSkill = getLocalizedItem(rawSkill, currentLang);

    const categoryObj = CATEGORIES.find(c => c.id === currentSkill.category_id);
    const relatedList = skills.filter(s => s.category_id === currentSkill.category_id && s.id !== currentSkill.id).slice(0, 3);
    const isLiked = state.likes.skills.includes(currentSkill.id);

    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ScrollProgressBar />
        
        {/* Back Link */}
        <button 
          onClick={() => navigateTo('skills')}
          className="group flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 mb-6 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span>{t('backToSkills', 'Back to Developer Skills')}</span>
        </button>

        {/* Header Hero card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="absolute inset-y-0 right-0 -z-10 w-1/3 bg-radial from-red-500/10 to-transparent blur-3xl"></div>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              <div className="flex flex-wrap gap-2">
                {categoryObj && (
                  <span className="rounded-lg bg-red-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#e21833]">
                    {getLocalizedCategoryTitle(categoryObj.slug, currentLang)}
                  </span>
                )}
                <span className="rounded-lg bg-red-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#e21833]">
                  {currentSkill.version}
                </span>
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-700">
                  {t('filterDifficulty', 'Difficulty')}: {currentSkill.difficulty === 'Beginner' ? t('beginner') : currentSkill.difficulty === 'Intermediate' ? t('intermediate') : t('expert')}
                </span>
              </div>

              <h1 className="font-display text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
                {currentSkill.title}
              </h1>

              <p className="text-sm sm:text-base text-slate-500">
                {currentSkill.description}
              </p>

              {/* Supported Tech list */}
              <div className="flex items-center space-x-2 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t('supportedAi', 'Verified Compatible Systems')}:
                </span>
                <div className="flex flex-wrap gap-1">
                  {currentSkill.supported_ai.map((ai, index) => (
                    <span 
                      key={index}
                      className="rounded bg-slate-100 text-[10px] font-bold px-2 py-0.5 text-slate-700"
                    >
                      {ai}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Like, Share and general stats */}
            <div className="flex flex-row lg:flex-col items-center justify-start lg:items-end gap-3 shrink-0">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleLike('skills', currentSkill.id)}
                  className={`flex items-center space-x-1.5 rounded-xl border px-5 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                    isLiked 
                      ? 'border-rose-100 bg-rose-50 text-rose-600' 
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{isLiked ? t('sortLikes', 'Saved') : t('sortLikes', 'Like Skill')}</span>
                </button>

                <ShareControl
                  contentType="skill"
                  contentId={currentSkill.id}
                  slug={currentSkill.slug}
                  title={currentSkill.title}
                  thumbnail={currentSkill.cover}
                />
              </div>
              
              <div className="flex items-center space-x-3 text-xs text-slate-400 sm:px-2">
                <span>{currentSkill.downloads} {t('sortDownloads', 'downloads')}</span>
                <span>•</span>
                <span>{currentSkill.views} {t('sortViews', 'views')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Manual Grid Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10">
          
          {/* Guide panels (5 columns) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Installation Guide */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-3.5">
              <div className="flex items-center space-x-2 text-[#e21833]">
                <Terminal className="h-5 w-5" />
                <h3 className="font-display text-sm font-extrabold uppercase tracking-wide">
                  {t('installation', 'Installation Manual')}
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {currentSkill.installation}
              </p>
            </div>

            <AdSlot placement="skill-detail-below-content" pageType="skill" />

            {/* How to Use */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-3.5">
              <div className="flex items-center space-x-2 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
                <h3 className="font-display text-sm font-extrabold uppercase tracking-wide">
                  {t('howToUse', 'Execution Guide')}
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {currentSkill.how_to_use}
              </p>
            </div>

            {/* Downloader Packages */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
              <h3 className="font-display text-sm font-extrabold uppercase tracking-wide text-slate-800">
                {t('downloadBlueprint', 'Download Workspace Packages')}
              </h3>
              
              <div className="space-y-2">
                {/* Markdown download */}
                <button
                  onClick={() => downloadSkillFile(currentSkill, 'md')}
                  className="flex w-full items-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <span className="flex items-center space-x-2">
                    <FileCode className="h-4 w-4 text-emerald-500" />
                    <span>Download .MD Blueprint</span>
                  </span>
                  <Download className="h-4 w-4 text-slate-400 ml-auto" />
                </button>

                {/* ZIP package */}
                <button
                  onClick={() => downloadSkillFile(currentSkill, 'zip')}
                  className="flex w-full items-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <span className="flex items-center space-x-2">
                    <Layers className="h-4 w-4 text-red-500" />
                    <span>{t('downloadZip', 'Download full .ZIP Package')}</span>
                  </span>
                  <Download className="h-4 w-4 text-slate-400 ml-auto" />
                </button>

                {/* JSON export */}
                <button
                  onClick={() => downloadSkillFile(currentSkill, 'json')}
                  className="flex w-full items-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <span className="flex items-center space-x-2">
                    <Terminal className="h-4 w-4 text-[#e21833]" />
                    <span>{t('downloadJson', 'Download configuration .JSON')}</span>
                  </span>
                  <Download className="h-4 w-4 text-slate-400 ml-auto" />
                </button>
              </div>
            </div>

          </div>

          {/* Code Viewer Panel (7 columns) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {t('parameters', 'Instruction Code Payload')}
              </span>
              <button
                onClick={() => handleCopyCode(currentSkill.markdown_file)}
                className="flex items-center space-x-1 text-xs font-bold text-[#e21833] hover:text-[#c21124] cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-500 font-semibold">{t('promptCopied', 'Copied!')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>{t('copyPrompt', 'Copy Instructions Code')}</span>
                  </>
                )}
              </button>
            </div>

            {/* Rich Code Pre block */}
            <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 overflow-x-auto shadow-lg">
              <pre className="font-mono text-[11px] leading-relaxed text-slate-300 whitespace-pre-wrap select-all">
                {currentSkill.markdown_file}
              </pre>
            </div>
          </div>

        </div>

        {/* Polymorphic Discussion Board for Skills */}
        <div className="mt-12 pt-10 border-t border-slate-150 max-w-4xl">
          <CommentsSection
            contentType="skill"
            contentId={currentSkill.id}
          />
        </div>

        {/* Related Content Widget */}
        <RelatedContent
          type="skill"
          currentId={currentSkill.id}
          categoryId={currentSkill.category_id}
        />

      </div>
    );
  }

  // Render CATALOG
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header Info */}
      <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900">
            {t('navSkills', 'Creator & Developer Skills Library')}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {t('devSkillsDesc', 'System level prompt configurations, IDE rule manuals, and server-side automation packages.')}
          </p>
        </div>

        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600">
          {filteredSkills.length} / {skills.length} {t('navSkills', 'Skills')}
        </span>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Search */}
        <div className="relative md:col-span-5">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder', 'Search programming files or prompt tags...')}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition-all focus:border-[#e21833]"
          />
        </div>

        {/* Supporting System select */}
        <div className="md:col-span-4">
          <select
            value={selectedAI}
            onChange={(e) => setSelectedAI(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-800 outline-none"
          >
            <option value="all">{t('filterAll', 'All AI Systems')}</option>
            <option value="cursor">Cursor rules</option>
            <option value="claude">Claude</option>
            <option value="gemini">Gemini</option>
            <option value="chatgpt">ChatGPT</option>
            <option value="antigravity">AntiGravity</option>
          </select>
        </div>

        {/* Sort selector */}
        <div className="md:col-span-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-800 outline-none font-medium"
          >
            <option value="popularity">{t('sortLikes', 'Popularity')}</option>
            <option value="newest">{t('sortDate', 'Newest')}</option>
            <option value="most_discussed">{t('comments', 'Most Discussed')}</option>
            <option value="downloads">{t('sortDownloads', 'Utility (Downloads)')}</option>
          </select>
        </div>

      </div>

      {/* Quick Sort Tabs & Category Pills roll */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        {/* Quick Sort Tabs */}
        <div className="flex items-center space-x-1.5 shrink-0 bg-slate-100/70 p-1 rounded-xl border border-slate-200/60">
          <button
            onClick={() => setSortBy('popularity')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              sortBy === 'popularity' || sortBy === 'likes'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🔥 {t('sortLikes', 'Popularity')}
          </button>
          <button
            onClick={() => setSortBy('newest')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              sortBy === 'newest'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ✨ {t('sortDate', 'Newest')}
          </button>
          <button
            onClick={() => setSortBy('most_discussed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              sortBy === 'most_discussed'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            💬 {t('comments', 'Most Discussed')}
          </button>
        </div>

        {/* Category Pills roll */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto max-w-full">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all border shrink-0 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#e21833] text-white border-[#e21833]'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t('filterAll', 'All Skills')}
          </button>
        {skillCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.slug)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer ${
              selectedCategory === cat.slug
                ? 'bg-[#e21833] text-white border-[#e21833]'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {getLocalizedCategoryTitle(cat.slug, currentLang)}
          </button>
        ))}
        </div>
      </div>

      {/* Grid listing */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton variant="skill-card" count={6} />
        </div>
      ) : filteredSkills.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSkills.map((s, index) => (
            <React.Fragment key={s.id}>
              <SkillCard skill={s} />
              {index > 0 && (index + 1) % 6 === 0 && (
                <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                  <AdSlot placement="in-feed-skills" pageType="skill" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 p-16 text-center">
          <Terminal className="mx-auto h-10 w-10 text-slate-400" />
          <h3 className="mt-4 text-sm font-bold text-slate-900">{t('noResultsFound', 'No developer skills found')}</h3>
          <p className="mt-1 text-xs text-slate-500">
            {t('noResultsDesc', "We couldn't locate any instruction blueprints matching your filters. Try selecting a different category.")}
          </p>
        </div>
      )}

    </div>
  );
};
