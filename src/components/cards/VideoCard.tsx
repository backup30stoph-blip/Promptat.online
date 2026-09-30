import React, { useState } from 'react';
import { VideoConcept } from '../../types';
import { useApp } from '../../context/AppContext';
import { getLocalizedItem, getLocalizedCategoryTitle } from '../../lib/i18n';
import { Film, Sparkles, Copy, Check, Video, Play, Camera, Flame } from 'lucide-react';
import { ImageWithPlaceholder } from '../ImageWithPlaceholder';
import { stripMarkdown } from '../../utils/textUtils';

interface VideoCardProps {
  video: VideoConcept;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const { navigateTo, currentLang, t, showNotification } = useApp();
  const [copied, setCopied] = useState(false);

  const localizedVideo = getLocalizedItem(video, currentLang);
  const primaryPrompt = video.animation_prompt || video.image_prompt || video.description;
  const primaryModel = video.ai_tools_needed?.[0] || 'Runway Gen-3';

  const handleCopyPrompt = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(primaryPrompt);
      setCopied(true);
      showNotification(t('copiedPrompt', 'تم نسخ برومبت الفيديو بنجاح!'), 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div 
      onClick={() => navigateTo('videos', { type: 'video', slug: video.slug })}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-red-300 hover:shadow-xl cursor-pointer"
      id={`video-card-${video.id}`}
    >
      {/* Video Preview Cover */}
      <div className="relative aspect-video overflow-hidden bg-slate-900">
        <ImageWithPlaceholder
          src={video.cover || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'}
          alt={localizedVideo.title}
          aspectRatio="aspect-video"
          imgClassName="transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
        />

        {/* Video AI Model Badge */}
        <div className="absolute top-3 start-3 z-10 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-lg bg-black/75 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm backdrop-blur-md border border-white/10">
            <Film className="h-3 w-3 text-red-400" />
            <span>{primaryModel}</span>
          </span>
        </div>

        {/* Play Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e21833]/90 text-white shadow-lg backdrop-blur-xs transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="h-5 w-5 fill-white ms-0.5" />
          </div>
        </div>

        {/* Motion & Aspect Ratio Badges */}
        <div className="absolute bottom-3 start-3 end-3 z-10 flex items-center justify-between pointer-events-none">
          <span className="rounded-md bg-slate-950/80 px-2 py-0.5 text-[10px] font-extrabold text-amber-300 backdrop-blur-xs flex items-center gap-1">
            <Camera className="h-3 w-3 text-amber-400" />
            <span>Cinematic Motion</span>
          </span>

          <span className="rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-bold text-slate-200 backdrop-blur-xs">
            16:9 • 4K 60fps
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-sans text-sm font-bold text-slate-900 transition-colors group-hover:text-[#e21833] line-clamp-1 mb-2">
          {stripMarkdown(localizedVideo.title)}
        </h3>

        {/* Video Prompt Snippet Box */}
        <div className="relative rounded-xl bg-slate-50 p-3 border border-slate-200/80 mb-3 group/box">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            <span className="flex items-center gap-1 text-[#e21833]">
              <Sparkles className="h-3 w-3" />
              <span>{t('videoPrompt', 'برومبت الفيديو')}</span>
            </span>
            <span>Motion: 5</span>
          </div>
          <p className="text-xs font-mono text-slate-700 line-clamp-2 leading-relaxed dir-ltr text-start">
            {primaryPrompt}
          </p>
        </div>

        {/* AI Tools & Tags */}
        <div className="mt-auto flex flex-wrap gap-1 mb-4">
          {video.ai_tools_needed.map((tool, idx) => (
            <span 
              key={idx} 
              className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-[9px] font-bold text-[#e21833]"
            >
              {tool}
            </span>
          ))}
        </div>

        {/* Bottom Actions: Copy Prompt & View Detail */}
        <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={handleCopyPrompt}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-600">{t('copied', 'تم النسخ!')}</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-500" />
                <span>{t('copyPrompt', 'نسخ البرومبت')}</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#e21833] py-2 text-xs font-bold text-white hover:bg-[#c8142b] transition-colors cursor-pointer shadow-xs"
          >
            <Video className="h-3.5 w-3.5" />
            <span>{t('viewPromptDetail', 'تفاصيل المشهد')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
