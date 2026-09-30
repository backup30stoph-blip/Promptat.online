import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Cpu, Video, ArrowRight, Search, Play, Trophy } from 'lucide-react';

export const Hero: React.FC = () => {
  const { navigateTo, searchQuery, setSearchQuery, t, isRtl } = useApp();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo('search');
  };

  const trendingSearches = [
    { label: t('heroTitleGemini', 'Gemini Image Prompts'), tab: 'prompts', query: 'Gemini' },
    { label: 'Nano Banana', tab: 'prompts', query: 'Banana' },
    { label: t('heroTitleClaude', 'Claude SEO Skills'), tab: 'skills', query: 'SEO' },
    { label: t('heroTitleVideos', 'Viral Video Concepts'), tab: 'videos', query: 'Video' }
  ];

  return (
    <div className="relative overflow-hidden bg-slate-50/70 py-16 md:py-24 border-b border-slate-100">
      {/* Background radial highlight */}
      <div className="absolute inset-x-0 top-0 -z-10 flex justify-center overflow-hidden pointer-events-none">
        <div className="flex w-[1080px] justify-end">
          <div className="h-[400px] w-[600px] flex-none rounded-full bg-red-500/5 blur-[120px]"></div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-3.5 py-1 text-xs font-bold tracking-wide text-[#e21833] shadow-sm">
            <Trophy className="h-3.5 w-3.5 shrink-0" />
            <span>{t('heroBadge', 'The Premier Promptat Online Hub')}</span>
          </div>

          {/* Display Headings */}
          <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.1]">
            <span>{t('heroTitleGemini', 'Gemini Image Prompts')}</span>
            <span>, </span>
            <span className="text-[#e21833]">{t('heroTitleClaude', 'Claude SEO Skills')}</span>
            <span>{t('heroTitleAnd', ' & ')}</span>
            <span className="text-red-500">{t('heroTitleVideos', 'Viral Video Concepts')}</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
            {t('heroSubtitle', 'From Gemini image prompts and Nano Banana prompts to Claude SEO skills for writing content and full viral video concepts — every asset is paired with professional instructions, scripts, and automation pipelines, ready to copy and build with today.')}
          </p>

          {/* Interactive Search Bar */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="mx-auto max-w-2xl relative rounded-full bg-white border border-slate-200 p-2 shadow-sm transition-all focus-within:border-[#e21833] focus-within:ring-2 focus-within:ring-red-100"
          >
            <div className="flex items-center">
              <div className="pl-3 rtl:pl-0 rtl:pr-3 text-slate-400">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('heroSearchPlaceholder', "What are you building? Try 'Nano Banana prompts', 'Claude SEO skills', 'Viral video concepts'...")}
                className="w-full bg-transparent border-0 outline-none px-3 text-slate-800 placeholder-slate-400 text-sm"
              />
              <button 
                type="submit"
                className="rounded-full bg-[#e21833] hover:bg-[#c21124] text-white px-6 py-2.5 text-xs font-bold tracking-wide shadow-sm transition-all whitespace-nowrap cursor-pointer"
              >
                {t('heroSearchButton', 'Search everything')}
              </button>
            </div>
          </form>

          {/* Trending keywords links */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs pt-1.5">
            <span className="font-semibold text-slate-400">{t('trending', 'Trending:')}</span>
            {trendingSearches.map((kw, i) => (
              <button
                key={i}
                onClick={() => {
                  setSearchQuery(kw.query);
                  navigateTo(kw.tab);
                }}
                className="rounded-full bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1 font-semibold text-slate-600 transition-colors cursor-pointer"
              >
                {kw.label}
              </button>
            ))}
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row pt-4">
            <button
              onClick={() => navigateTo('prompts')}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#e21833] hover:bg-[#c21124] text-white px-7 py-3.5 text-sm font-bold shadow-md shadow-red-100 transition-all sm:w-auto cursor-pointer"
            >
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>{t('browsePrompts', 'Browse Gemini Image Prompts')}</span>
              <ArrowRight className={`h-4 w-4 shrink-0 ${isRtl ? 'rotate-180' : ''}`} />
            </button>

            <button
              onClick={() => navigateTo('skills')}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 px-7 py-3.5 text-sm font-bold shadow-sm transition-all sm:w-auto cursor-pointer"
            >
              <Cpu className="h-4 w-4 text-[#e21833] shrink-0" />
              <span>{t('downloadSkills', 'Download Claude SEO Skills')}</span>
            </button>

            <button
              onClick={() => navigateTo('videos')}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 px-7 py-3.5 text-sm font-bold shadow-sm transition-all sm:w-auto cursor-pointer"
            >
              <Video className="h-4 w-4 text-red-500 shrink-0" />
              <span>{t('exploreVideos', 'Explore Viral Video Concepts')}</span>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
