import React from 'react';
import { VideoConcept } from '../../types';
import { useApp } from '../../context/AppContext';
import { getLocalizedItem, getLocalizedCategoryTitle } from '../../lib/i18n';
import { Flame, TrendingUp, Award } from 'lucide-react';
import { ImageWithPlaceholder } from '../ImageWithPlaceholder';

interface VideoCardProps {
  video: VideoConcept;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const { navigateTo, currentLang, t } = useApp();

  const localizedVideo = getLocalizedItem(video, currentLang);
  const localizedDifficulty = t(video.difficulty.toLowerCase(), video.difficulty);

  return (
    <div 
      onClick={() => navigateTo('videos', { type: 'video', slug: video.slug })}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-red-200 hover:shadow-md cursor-pointer"
      id={`video-card-${video.id}`}
    >
      
      {/* Cover Image */}
      <div className="relative aspect-video overflow-hidden bg-slate-50">
        <ImageWithPlaceholder
          src={video.cover || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'}
          alt={localizedVideo.title}
          aspectRatio="aspect-video"
          imgClassName="transition-transform duration-500 group-hover:scale-103"
        />

        {/* Niche overlay */}
        <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 z-10">
          <span className="inline-flex items-center rounded-md bg-[#e21833] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            {getLocalizedCategoryTitle(video.niche, currentLang)}
          </span>
        </div>

        {/* Virality score badge */}
        <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 z-10 flex items-center space-x-1 rtl:space-x-reverse rounded-md bg-red-600 px-2.5 py-1 text-[10px] font-black text-white shadow-sm">
          <Flame className="h-3.5 w-3.5 fill-white" />
          <span>{video.virality_score}% VIRAL</span>
        </div>

        {/* RPM indicator */}
        <div className="absolute bottom-3 left-3 rtl:left-auto rtl:right-3 z-10">
          <span className="rounded bg-slate-950/75 px-2 py-0.5 text-[10px] font-extrabold text-emerald-400 backdrop-blur-xs">
            {t('rpmEstimate', 'Est. RPM')}: ${video.expected_rpm.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        
        {/* Difficulty & Competition */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
          <span className="flex items-center">
            <Award className="mr-1 rtl:mr-0 rtl:ml-1 h-3.5 w-3.5 text-[#e21833]" />
            {t('filterDifficulty', 'Difficulty')}: <span className="ml-1 rtl:ml-0 rtl:mr-1 text-slate-700">{localizedDifficulty}</span>
          </span>
          <span>•</span>
          <span>
            {t('competition', 'Competition')}: <span className="text-slate-700">{video.competition}</span>
          </span>
        </div>

        <h3 className="font-sans text-sm font-bold text-slate-900 transition-colors group-hover:text-[#e21833] line-clamp-1">
          {localizedVideo.title}
        </h3>

        {/* Hook Teaser */}
        <p className="mt-2 text-xs italic text-slate-500 border-l-2 rtl:border-l-0 rtl:border-r-2 border-red-500 pl-2.5 rtl:pl-0 rtl:pr-2.5 line-clamp-2">
          "{video.hook}"
        </p>

        {/* Tools required preview */}
        <div className="mt-4 flex flex-wrap gap-1">
          {video.ai_tools_needed.slice(0, 3).map((tool, idx) => (
            <span 
              key={idx} 
              className="inline-flex items-center rounded bg-red-50 px-2 py-0.5 text-[9px] font-bold text-[#e21833]"
            >
              {tool}
            </span>
          ))}
          {video.ai_tools_needed.length > 3 && (
            <span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">
              +{video.ai_tools_needed.length - 3}
            </span>
          )}
        </div>

        {/* Access trigger button */}
        <div className="mt-5 border-t border-slate-100 pt-3">
          <button
            className="flex w-full items-center justify-center space-x-2 rtl:space-x-reverse rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-800 transition-colors hover:bg-[#e21833] hover:text-white cursor-pointer"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>{t('viewDetails', 'Open Blueprints & Scripts')}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
