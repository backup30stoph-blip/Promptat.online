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
  ArrowLeft, Copy, Check, Sparkles, Film, Video, Camera, 
  Layers, Sliders, Play, Zap, Flame, Download, Eye, Heart, Bookmark
} from 'lucide-react';
import { useSeoMetadata } from '../hooks/useSeoMetadata';
import { AdSlot } from '../components/AdSlot';
import { getLocalizedItem, useI18n } from '../lib/i18n';

export const Videos: React.FC = () => {
  const { 
    videos, 
    activeDetail, 
    navigateTo, 
    state, 
    showNotification,
    searchQuery,
    setSearchQuery,
    toggleBookmark,
    toggleLike
  } = useApp();

  const { lang, isRtl, t } = useI18n();

  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [selectedMotion, setSelectedMotion] = useState<string>('all');
  const [selectedAspect, setSelectedAspect] = useState<string>('all');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Customizer interactive state
  const [customMotion, setCustomMotion] = useState<number>(5);
  const [customAspect, setCustomAspect] = useState<string>('16:9');
  const [customCamera, setCustomCamera] = useState<string>('Cinematic Zoom-In');

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedModel, selectedMotion, selectedAspect, searchQuery, activeDetail]);

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
        title: `${currentVideoForSeo.title} | برومبتات الفيديو بالذكاء الاصطناعي`,
        description: currentVideoForSeo.description,
        robots: 'index, follow'
      };
    }

    return {
      title: lang === 'ar'
        ? 'برومبتات الفيديو بالذكاء الاصطناعي وأوامر سينمائية | Promptat Online'
        : 'AI Video Prompts, Camera Motion & Generator Blueprints | Promptat Online',
      description: lang === 'ar'
        ? 'مكتبة برومبتات الفيديو الاحترافية لتوليد مشاهد سينمائية عبر Runway Gen-3, OpenAI Sora, Kling AI, Luma Dream Machine, و Pika Labs مع تحكم كامل بالكاميرا.'
        : 'Discover cinematic AI video prompts, camera movements, motion settings, and generator templates for Runway Gen-3, OpenAI Sora, Kling AI, and Luma Dream Machine.',
      robots: 'index, follow'
    };
  }, [currentVideoForSeo, lang]);

  useSeoMetadata(seoOptions);

  // Filter video prompts
  const filteredVideos = useMemo(() => {
    return videos.filter(v => {
      const matchSearch = searchQuery ? (
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.animation_prompt && v.animation_prompt.toLowerCase().includes(searchQuery.toLowerCase())) ||
        v.ai_tools_needed.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      ) : true;

      const matchModel = selectedModel === 'all' ? true : v.ai_tools_needed.some(tool => tool.toLowerCase().includes(selectedModel.toLowerCase()));
      const matchMotion = selectedMotion === 'all' ? true : (
        selectedMotion === 'high' ? v.virality_score > 90 :
        selectedMotion === 'medium' ? (v.virality_score >= 80 && v.virality_score <= 90) :
        v.virality_score < 80
      );

      return matchSearch && matchModel && matchMotion;
    });
  }, [videos, searchQuery, selectedModel, selectedMotion]);

  const handleCopy = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedSection(label);
      showNotification(t('copiedPromptSuccess', lang), 'success');
      setTimeout(() => setCopiedSection(null), 2000);
    }
  };

  // ----------------------------------------------------
  // SINGLE VIDEO DETAIL VIEW
  // ----------------------------------------------------
  if (activeDetail && activeDetail.type === 'video') {
    const video = videos.find(v => v.slug === activeDetail.slug);

    if (!video) {
      return <PageNotFound type="general" />;
    }

    const localized = getLocalizedItem(video, lang);
    const isBookmarked = state.bookmarks.videos.includes(video.id);
    const isLiked = state.likes.videos.includes(video.id);

    const compiledPrompt = `${video.animation_prompt || video.image_prompt} --ar ${customAspect} --motion ${customMotion} --camera ${customCamera.toLowerCase().replace(/ /g, '-')}`;

    return (
      <div className="min-h-screen bg-slate-50 pb-20 pt-6">
        <ScrollProgressBar />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          
          {/* Back Navigation */}
          <button
            type="button"
            onClick={() => navigateTo('videos')}
            className="mb-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-700 border border-slate-200 shadow-2xs hover:bg-slate-50 cursor-pointer"
          >
            <ArrowLeft className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
            <span>{t('backToVideoPrompts', lang)}</span>
          </button>

          {/* Main Hero Card */}
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl mb-8">
            
            {/* Visual Header Banner */}
            <div className="relative aspect-video max-h-[460px] w-full bg-slate-950 overflow-hidden">
              <img
                src={video.cover}
                alt={localized.title}
                className="h-full w-full object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              {/* Badges Over Cover */}
              <div className="absolute top-4 start-4 flex flex-wrap gap-2">
                <span className="rounded-xl bg-[#e21833] px-3 py-1 text-xs font-black text-white shadow-md">
                  {video.ai_tools_needed[0] || 'Runway Gen-3'}
                </span>
                <span className="rounded-xl bg-black/60 px-3 py-1 text-xs font-bold text-amber-300 backdrop-blur-md">
                  Cinematic Camera Motion
                </span>
              </div>

              {/* Title & Actions inside cover bottom */}
              <div className="absolute bottom-6 start-6 end-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="max-w-2xl text-white">
                  <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight">
                    {localized.title}
                  </h1>
                  <p className="mt-2 text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
                    {localized.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleLike('videos', video.id)}
                    className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                      isLiked ? 'bg-rose-500 text-white shadow-md' : 'bg-white/20 text-white backdrop-blur-md hover:bg-white/30'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? 'fill-white' : ''}`} />
                    <span>{video.likes + (isLiked ? 1 : 0)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleBookmark('videos', video.id)}
                    className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                      isBookmarked ? 'bg-amber-500 text-white shadow-md' : 'bg-white/20 text-white backdrop-blur-md hover:bg-white/30'
                    }`}
                  >
                    <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-white' : ''}`} />
                    <span>{isBookmarked ? t('saved', lang) : t('save', lang)}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Prompt Builder & Parameters Workbench */}
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Ready-to-use Prompt Box */}
              <div className="rounded-2xl border-2 border-red-100 bg-red-50/40 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#e21833]" />
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                      {t('primaryVideoPrompt', lang)}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(compiledPrompt, 'main_prompt')}
                    className="flex items-center gap-1.5 rounded-xl bg-[#e21833] hover:bg-[#c8142b] px-4 py-2 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
                  >
                    {copiedSection === 'main_prompt' ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>{t('copied', lang)}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>{t('copyFullPrompt', lang)}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="rounded-xl bg-slate-900 p-4 text-xs font-mono text-emerald-300 leading-relaxed dir-ltr text-start shadow-inner select-all">
                  {compiledPrompt}
                </div>
              </div>

              {/* Interactive Video Generator Tuning Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                
                {/* Motion Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{t('motionIntensity', lang)}</span>
                    <span className="text-[#e21833] font-mono">{customMotion}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={customMotion}
                    onChange={(e) => setCustomMotion(Number(e.target.value))}
                    className="w-full accent-[#e21833] cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400">{t('motionHint', lang)}</p>
                </div>

                {/* Aspect Ratio */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {t('aspectRatio', lang)}
                  </label>
                  <select
                    value={customAspect}
                    onChange={(e) => setCustomAspect(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-200"
                  >
                    <option value="16:9">16:9 (Landscape / YouTube)</option>
                    <option value="9:16">9:16 (Vertical / Shorts & Reels)</option>
                    <option value="1:1">1:1 (Square / Feed)</option>
                    <option value="2.35:1">2.35:1 (Ultra-Wide Cinematic)</option>
                  </select>
                </div>

                {/* Camera Path */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {t('cameraMovement', lang)}
                  </label>
                  <select
                    value={customCamera}
                    onChange={(e) => setCustomCamera(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-200"
                  >
                    <option value="Cinematic Zoom-In">Cinematic Zoom-In</option>
                    <option value="Slow Pan Right">Slow Pan Right</option>
                    <option value="Slow Pan Left">Slow Pan Left</option>
                    <option value="FPV Drone Flythrough">FPV Drone Flythrough</option>
                    <option value="360 Orbit Shot">360 Orbit Shot</option>
                    <option value="Dolly Zoom Vertigo">Dolly Zoom Vertigo</option>
                    <option value="Static Hyper-Lapse">Static Hyper-Lapse</option>
                  </select>
                </div>

              </div>

              {/* Supported Tools & Negative Prompts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                {/* Tools Grid */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Video className="h-4 w-4 text-[#e21833]" />
                    <span>{t('supportedGenerators', lang)}</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {video.ai_tools_needed.map((tool, idx) => (
                      <span
                        key={idx}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-2xs"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Shot Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-[#e21833]" />
                    <span>{t('shotDetails', lang)}</span>
                  </h4>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="font-semibold text-slate-400">{t('resolution', lang)}:</span>
                      <span className="font-bold text-slate-800">4K Ultra HD 60fps</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="font-semibold text-slate-400">{t('lighting', lang)}:</span>
                      <span className="font-bold text-slate-800">Volumetric Studio Cinematic</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Comments and Related Prompts */}
          <CommentsSection contentType="video" contentId={video.id} />
          
          <div className="mt-12">
            <RelatedContent type="video" currentId={video.id} />
          </div>

        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIDEO PROMPTS CATALOG / GRID VIEW
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-[#e21833] p-6 sm:p-10 text-white shadow-xl mb-8">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-red-200 border border-white/15 backdrop-blur-xs mb-4">
              <Film className="h-4 w-4 text-red-400" />
              <span>{lang === 'ar' ? 'مكتبة برومبتات الفيديو السينمائية' : 'Cinematic Video Generation Prompts'}</span>
            </div>
            
            <h1 className="font-display text-2xl sm:text-4xl font-black tracking-tight text-white mb-3">
              {lang === 'ar' ? 'برومبتات الفيديو بالذكاء الاصطناعي' : 'AI Video Prompts & Motion Blueprints'}
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-2xl">
              {lang === 'ar'
                ? 'أوامر احترافية ومخططات سينمائية جاهزة لتوليد فيديوهات فائقة الواقعية عبر Runway Gen-3, OpenAI Sora, Kling AI, Luma Dream Machine, و Pika Labs مع تحكم دقيق بحركة الكاميرا والإضاءة.'
                : 'Curated prompts, motion vectors, and cinematic scene descriptors engineered for Runway Gen-3, Sora, Kling 1.5, and Luma Dream Machine with granular camera control.'}
            </p>
          </div>

          <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-red-500/20 blur-3xl pointer-events-none" />
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
          
          {/* AI Generator Model Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {[
              { id: 'all', label: t('allModels', lang) },
              { id: 'runway', label: 'Runway Gen-3' },
              { id: 'kling', label: 'Kling AI' },
              { id: 'sora', label: 'OpenAI Sora' },
              { id: 'luma', label: 'Luma Dream' },
              { id: 'pika', label: 'Pika Labs' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedModel(m.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedModel === m.id
                    ? 'bg-[#e21833] text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchVideoPromptsPlaceholder', lang)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 ps-10 pe-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#e21833] focus:ring-1 focus:ring-[#e21833] focus:outline-none shadow-xs"
            />
            <Film className="absolute start-3.5 top-3 h-4 w-4 text-slate-400" />
          </div>

        </div>

        {/* Video Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <Skeleton key={n} variant="card" className="h-80" />
            ))}
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <Video className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">
              {t('noVideoPromptsFound', lang)}
            </h3>
            <p className="text-xs text-slate-500">
              {t('noVideoPromptsFoundDesc', lang)}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}

        {/* Ad Placement */}
        <div className="mt-12">
          <AdSlot placement="video_prompts_bottom" className="my-4" />
        </div>

      </div>
    </div>
  );
};
