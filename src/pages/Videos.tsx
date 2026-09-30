import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { VideoConcept } from '../types';
import { VideoCard } from '../components/cards/VideoCard';
import { ShareControl } from '../components/ShareControl';
import { ScrollProgressBar } from '../components/ScrollProgressBar';
import { Skeleton } from '../components/Skeleton';
import { CommentsSection } from '../components/CommentsSection';
import { RelatedContent } from '../components/RelatedContent';
import { PageNotFound } from './PageNotFound';
import { 
  ArrowLeft, Download, Flame, ListOrdered, Clipboard, Search, 
  Megaphone, Coins, Layers, FileText 
} from 'lucide-react';
import { useSeoMetadata } from '../hooks/useSeoMetadata';
import { AdSlot } from '../components/AdSlot';
import { getLocalizedItem } from '../lib/i18n';

export const Videos: React.FC = () => {
  const { 
    videos, 
    activeDetail, 
    navigateTo, 
    state, 
    showNotification,
    searchQuery,
    setSearchQuery,
    currentLang,
    t,
    isRtl
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'production' | 'seo' | 'monetization'>('production');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedNiche, setSelectedNiche] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 550);
    return () => clearTimeout(timer);
  }, [selectedDifficulty, selectedNiche, searchQuery, activeDetail]);

  // Determine active video detail for dynamic SEO metadata injection
  const currentVideoForSeo = useMemo(() => {
    if (activeDetail && activeDetail.type === 'video') {
      return videos.find(v => v.slug === activeDetail.slug);
    }
    return null;
  }, [activeDetail, videos]);

  const seoOptions = useMemo(() => {
    if (currentVideoForSeo) {
      return {
        entityType: 'video' as const,
        entityId: currentVideoForSeo.id,
        title: `${currentVideoForSeo.title} | Promptat Online Faceless Video Blueprint`,
        description: currentVideoForSeo.description,
        robots: 'index, follow'
      };
    }

    return {
      title: 'فيديوهات ومخططات صناعة المحتوى | Promptat Online',
      description: 'Acquire cash cow video architectures, visual templates, high retention script templates, and automated faceless channel models.',
      robots: 'index, follow'
    };
  }, [currentVideoForSeo]);

  useSeoMetadata(seoOptions);

  // Filter videos
  const filteredVideos = React.useMemo(() => {
    return videos.filter(v => {
      const matchSearch = searchQuery ? (
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.niche.toLowerCase().includes(searchQuery.toLowerCase())
      ) : true;

      const matchDiff = selectedDifficulty === 'all' ? true : v.difficulty === selectedDifficulty;
      
      const matchNiche = selectedNiche === 'all' ? true : (
        selectedNiche === 'trivia' ? v.niche.toLowerCase().includes('trivia') :
        selectedNiche === 'luxury' ? v.niche.toLowerCase().includes('luxury') :
        v.niche.toLowerCase().includes('tech')
      );

      return matchSearch && matchDiff && matchNiche;
    });
  }, [videos, searchQuery, selectedDifficulty, selectedNiche]);

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    showNotification('Copied blueprint section!', 'success');
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Video Concept assets mock downloads
  const downloadVideoAssets = (video: VideoConcept, type: 'zip' | 'canva' | 'script' | 'json') => {
    let content = `Promptat.online - Premium Creator Asset\n\nVideo Project: ${video.title}\nFormat Package: ${type.toUpperCase()}\n\nIncludes voice over parameters, thumbnail templates, overlay coordinates, and full script assets.`;
    let fileName = `${video.slug}_video_asset.${type === 'canva' ? 'url' : type === 'script' ? 'txt' : type}`;

    if (type === 'canva') {
      content = `[InternetShortcut]\nURL=https://canva.com/design/promptat-thumbnail-template\n`;
    } else if (type === 'json') {
      content = JSON.stringify(video, null, 2);
    }

    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // DETAIL VIEW
  if (activeDetail && activeDetail.type === 'video') {
    const rawVideo = videos.find(v => v.slug === activeDetail.slug);
    if (!rawVideo) {
      return <PageNotFound type="video" slug={activeDetail.slug} />;
    }
    const currentVideo = getLocalizedItem(rawVideo, currentLang);

    const relatedList = videos.filter(v => v.id !== currentVideo.id).slice(0, 2);

    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ScrollProgressBar />
        
        {/* Back Link */}
        <button 
          onClick={() => navigateTo('videos')}
          className="group flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 mb-6 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span>{t('backToVideos', 'Back to Video Concepts')}</span>
        </button>

        {/* Video Hero Block */}
        <div className="relative rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Visual Cover left (5 columns) */}
            <div className="relative lg:col-span-5 aspect-video lg:aspect-auto min-h-[250px] bg-slate-950">
              <img 
                src={currentVideo.cover || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'} 
                alt={currentVideo.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
              
              {/* Overlay quick stats */}
              <div className="absolute bottom-6 left-6 right-6 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-lg bg-red-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                    {currentVideo.virality_score}% {t('viralityScore', 'virality')}
                  </span>
                  <span className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    {t('rpmEstimate', 'Est. RPM')}: ${currentVideo.expected_rpm.toFixed(2)}
                  </span>
                </div>
                <h1 className="font-display text-lg sm:text-2xl font-black text-white leading-tight">
                  {currentVideo.title}
                </h1>
              </div>
            </div>

            {/* General brief right (7 columns) */}
            <div className="lg:col-span-7 p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#e21833]">
                    {t('niche', 'Channel Niche')}
                  </span>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {currentVideo.description}
                  </p>
                </div>
                <div className="shrink-0 pt-1">
                  <ShareControl
                    contentType="video"
                    contentId={currentVideo.id}
                    slug={currentVideo.slug}
                    title={currentVideo.title}
                    thumbnail={currentVideo.cover}
                  />
                </div>
              </div>

              {/* Hook text block */}
              <div className="rounded-2xl border-l-4 border-red-500 bg-slate-50 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wide text-red-500 block mb-1">
                  {t('hook', 'Video Hook (First 3 seconds)')}
                </span>
                <p className="text-xs sm:text-sm italic font-medium text-slate-800 leading-relaxed">
                  "{currentVideo.hook}"
                </p>
              </div>

              {/* Key indicators table */}
              <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-5 text-center">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">{t('filterDifficulty', 'Difficulty')}</span>
                  <span className="font-bold text-sm text-slate-800">{currentVideo.difficulty === 'Easy' ? t('beginner') : currentVideo.difficulty === 'Medium' ? t('intermediate') : t('expert')}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">{t('competition', 'Competition')}</span>
                  <span className="font-bold text-sm text-slate-800">{currentVideo.competition}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">{t('sortViews', 'Views Analyzed')}</span>
                  <span className="font-bold text-sm text-slate-800">12.5M+</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* INTERACTIVE BLUEPRINT TABS */}
        <div className="mt-8 space-y-6">
          
          {/* Sub-tabs header */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveSubTab('production')}
              className={`border-b-2 px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeSubTab === 'production'
                  ? 'border-[#e21833] text-[#e21833]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Layers className="h-4.5 w-4.5" />
                <span>{t('channelBlueprint', 'Production Pipeline')}</span>
              </div>
            </button>

            <button
              onClick={() => setActiveSubTab('seo')}
              className={`border-b-2 px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeSubTab === 'seo'
                  ? 'border-[#e21833] text-[#e21833]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Megaphone className="h-4.5 w-4.5" />
                <span>SEO & Titles</span>
              </div>
            </button>

            <button
              onClick={() => setActiveSubTab('monetization')}
              className={`border-b-2 px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeSubTab === 'monetization'
                  ? 'border-[#e21833] text-[#e21833]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Coins className="h-4.5 w-4.5" />
                <span>{t('monetization', 'Monetization & Downloads')}</span>
              </div>
            </button>
          </div>

          <div className="my-6">
            <AdSlot placement="video-detail-mid-content" pageType="video" />
          </div>

          {/* TAB 1: PRODUCTION PIPELINE */}
          {activeSubTab === 'production' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Video Structure & Narrative Left (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Channel blueprint */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                  <h3 className="font-display text-base font-bold text-slate-900">
                    Channel Expansion Strategy
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {currentVideo.channel_blueprint}
                  </p>
                </div>

                {/* Video structure */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                  <h3 className="font-display text-base font-bold text-slate-900 flex items-center space-x-2">
                    <ListOrdered className="h-5 w-5 text-red-500" />
                    <span>Storyboards & Scene Timeline</span>
                  </h3>
                  <div className="space-y-3">
                    {currentVideo.video_structure.map((scene, i) => (
                      <div key={i} className="flex items-start space-x-3 text-xs sm:text-sm">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-red-50 font-mono text-[10px] font-black text-red-600">
                          {i + 1}
                        </span>
                        <p className="text-slate-600">{scene}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Prompts specs Right (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Voice Over parameter modifier */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      ElevenLabs Narration Settings
                    </span>
                    <button
                      onClick={() => handleCopy(currentVideo.voice_prompt, 'voice')}
                      className="text-xs font-bold text-red-600 hover:text-red-500"
                    >
                      {copiedText === 'voice' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3.5">
                    <p className="font-mono text-xs text-slate-700">
                      {currentVideo.voice_prompt}
                    </p>
                  </div>
                </div>

                {/* Visual Image Prompts generator */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Midjourney Generation Prompt
                    </span>
                    <button
                      onClick={() => handleCopy(currentVideo.image_prompt, 'image')}
                      className="text-xs font-bold text-red-600 hover:text-red-500"
                    >
                      {copiedText === 'image' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3.5">
                    <p className="font-mono text-xs text-slate-700">
                      {currentVideo.image_prompt}
                    </p>
                  </div>
                </div>

                {/* Animation modifiers */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Leonardo AI Motion Settings
                    </span>
                    <button
                      onClick={() => handleCopy(currentVideo.animation_prompt, 'animation')}
                      className="text-xs font-bold text-red-600 hover:text-red-500"
                    >
                      {copiedText === 'animation' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3.5">
                    <p className="font-mono text-xs text-slate-700">
                      {currentVideo.animation_prompt}
                    </p>
                  </div>
                </div>

                {/* CapCut Editing Prompt */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Video Editing Formula
                    </span>
                    <button
                      onClick={() => handleCopy(currentVideo.editing_prompt, 'editing')}
                      className="text-xs font-bold text-red-600 hover:text-red-500"
                    >
                      {copiedText === 'editing' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3.5">
                    <p className="font-mono text-xs text-slate-700">
                      {currentVideo.editing_prompt}
                    </p>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: SEO CONFIGURATION */}
          {activeSubTab === 'seo' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Titles and Descriptions Left (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Title suggestions */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                  <h3 className="font-display text-base font-bold text-slate-900 flex items-center space-x-2">
                    <Clipboard className="h-5 w-5 text-red-500" />
                    <span>High CTR Video Titles (A/B Tested)</span>
                  </h3>
                  
                  <div className="space-y-2.5">
                    {currentVideo.titles.map((title, i) => (
                      <div key={i} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                        <span className="text-xs sm:text-sm font-semibold text-slate-800">{title}</span>
                        <button
                          onClick={() => handleCopy(title, `title-${i}`)}
                          className="text-[10px] font-bold text-red-600 hover:text-red-500"
                        >
                          {copiedText === `title-${i}` ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SEO Descriptions */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-display text-base font-bold text-slate-900 flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-red-500" />
                      <span>Optimized Description Blueprint</span>
                    </h3>
                    <button
                      onClick={() => handleCopy(currentVideo.description_seo, 'seo-desc')}
                      className="text-xs font-bold text-red-600 hover:text-red-500"
                    >
                      {copiedText === 'seo-desc' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {currentVideo.description_seo}
                  </p>
                </div>
              </div>

              {/* Hashtags and Tag lists Right (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Suggested Tags */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      Channel SEO Keywords / Tags
                    </h3>
                    <button
                      onClick={() => handleCopy(currentVideo.tags.join(', '), 'seo-tags')}
                      className="text-xs font-bold text-red-600 hover:text-red-500"
                    >
                      Copy All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {currentVideo.tags.map((tag, i) => (
                      <span key={i} className="rounded-md border border-slate-150 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hashtags */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      Social Hashtags
                    </h3>
                    <button
                      onClick={() => handleCopy(currentVideo.hashtags.join(' '), 'seo-hash')}
                      className="text-xs font-bold text-red-600 hover:text-red-500"
                    >
                      Copy All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {currentVideo.hashtags.map((hash, i) => (
                      <span key={i} className="rounded-md bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-600">
                        {hash}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Schedule info */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Publishing Schedule Calendar
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {currentVideo.publishing_schedule}
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: MONETIZATION & DOWNLOADS */}
          {activeSubTab === 'monetization' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Affiliate and products Left (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Monetization streams */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                  <h3 className="font-display text-base font-bold text-slate-900 flex items-center space-x-2">
                    <Coins className="h-5 w-5 text-emerald-500" />
                    <span>Monetization Blueprint</span>
                  </h3>
                  <div className="space-y-3">
                    {currentVideo.monetization.map((m, i) => (
                      <div key={i} className="flex items-start space-x-3 text-xs sm:text-sm">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 font-bold text-emerald-600">
                          $
                        </span>
                        <p className="text-slate-600 font-medium">{m}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Affiliate program recommendations */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                  <h3 className="font-display text-base font-bold text-slate-900">
                    Integrated Affiliate Partners
                  </h3>
                  <div className="space-y-2.5">
                    {currentVideo.affiliate_ideas.map((aff, i) => (
                      <p key={i} className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        • {aff}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Downloads Right (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Downloader box */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                  <h3 className="font-display text-sm font-extrabold uppercase tracking-wide text-slate-800">
                    Download Campaign Assets
                  </h3>

                  <div className="space-y-2.5">
                    {/* Canva asset */}
                    <button
                      onClick={() => downloadVideoAssets(currentVideo, 'canva')}
                      className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <span className="flex items-center space-x-2">
                        <Layers className="h-4 w-4 text-[#e21833]" />
                        <span>Canva Thumbnail Templates</span>
                      </span>
                      <Download className="h-4 w-4 text-slate-400" />
                    </button>

                    {/* Scripts Document */}
                    <button
                      onClick={() => downloadVideoAssets(currentVideo, 'script')}
                      className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <span className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-[#e21833]" />
                        <span>Full Narrative Scripts Document</span>
                      </span>
                      <Download className="h-4 w-4 text-slate-400" />
                    </button>

                    {/* ZIP package */}
                    <button
                      onClick={() => downloadVideoAssets(currentVideo, 'zip')}
                      className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <span className="flex items-center space-x-2">
                        <Layers className="h-4 w-4 text-red-500" />
                        <span>Download Campaign .ZIP Package</span>
                      </span>
                      <Download className="h-4 w-4 text-slate-400" />
                    </button>
                  </div>
                </div>

                {/* Additional Resources list */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Ancillary Resources
                  </h3>
                  <div className="space-y-1.5">
                    {currentVideo.resources.map((res, i) => (
                      <span key={i} className="text-xs text-slate-600 block font-medium">
                        ✓ {res}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Polymorphic Discussion Board for Viral Videos */}
        <div className="mt-12 pt-10 border-t border-slate-150 max-w-4xl">
          <CommentsSection
            contentType="video"
            contentId={currentVideo.id}
          />
        </div>

        {/* Related Content Widget */}
        <RelatedContent
          type="video"
          currentId={currentVideo.id}
          niche={currentVideo.niche}
          tags={currentVideo.tags}
        />

      </div>
    );
  }

  // Render CATALOG
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      
      {/* Title block */}
      <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900">
            {t('navVideos', 'Viral Video Concepts Library')}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {t('trendingVideosDesc', 'Full narrative blueprints, thumbnail prompts, ElevenLabs setups, and SEO structures designed to achieve massive views.')}
          </p>
        </div>

        <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600">
          {filteredVideos.length} / {videos.length} {t('navVideos', 'Videos')}
        </span>
      </div>

      {/* Search and difficulty filter */}
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
            placeholder={t('searchPlaceholder', 'Search keywords, niches or titles...')}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition-all focus:border-[#e21833]"
          />
        </div>

        {/* Niche selector */}
        <div className="md:col-span-4">
          <select
            value={selectedNiche}
            onChange={(e) => setSelectedNiche(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-800 outline-none"
          >
            <option value="all">{t('footerPopularNiches', 'All Niches')}</option>
            <option value="trivia">Geography & Trivia</option>
            <option value="luxury">Luxury & Travel</option>
            <option value="tech">AI Tools & Tech</option>
          </select>
        </div>

        {/* Difficulty */}
        <div className="md:col-span-3">
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-800 outline-none"
          >
            <option value="all">{t('filterAll', 'All Difficulties')}</option>
            <option value="Easy">{t('beginner', 'Easy')}</option>
            <option value="Medium">{t('intermediate', 'Medium')}</option>
            <option value="Hard">{t('expert', 'Hard')}</option>
          </select>
        </div>

      </div>

      {/* Catalog listing */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
          <Skeleton variant="card" count={4} />
        </div>
      ) : filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {filteredVideos.map((v, index) => (
            <React.Fragment key={v.id}>
              <VideoCard video={v} />
              {index > 0 && (index + 1) % 4 === 0 && (
                <div className="col-span-1 sm:col-span-2">
                  <AdSlot placement="in-feed-videos" pageType="video" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 p-16 text-center">
          <Flame className="mx-auto h-10 w-10 text-slate-400" />
          <h3 className="mt-4 text-sm font-bold text-slate-900">{t('noResultsFound', 'No video blueprints found')}</h3>
          <p className="mt-1 text-xs text-slate-500">
            {t('noResultsDesc', 'Adjust your search terms or filter setups to explore other trending short-form topics.')}
          </p>
        </div>
      )}

    </div>
  );
};
