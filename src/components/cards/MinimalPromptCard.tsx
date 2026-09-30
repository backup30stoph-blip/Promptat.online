import React, { useState } from 'react';
import { AIPrompt } from '../../types';
import { useApp } from '../../context/AppContext';
import { CATEGORIES, getColorClasses } from '../../data/categories';
import { Copy, Eye, Download, Heart, Check, Layers } from 'lucide-react';
import { ImageWithPlaceholder } from '../ImageWithPlaceholder';
import { FavoriteButton } from '../FavoriteButton';
import { downloadPromptAsTxt } from '../../services/downloadService';
import { stripMarkdown } from '../../utils/textUtils';

interface MinimalPromptCardProps {
  prompt: AIPrompt;
}

export const MinimalPromptCard: React.FC<MinimalPromptCardProps> = ({ prompt }) => {
  const { 
    user,
    state, 
    toggleLike, 
    navigateTo, 
    showNotification 
  } = useApp();

  const [copied, setCopied] = useState(false);

  const category = CATEGORIES.find(c => c.id === prompt.category_id);
  const colorSchema = category ? getColorClasses(category.color) : getColorClasses('orange');
  const isLiked = state.likes.prompts.includes(prompt.id);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt.prompt);
    setCopied(true);
    showNotification('Prompt formula copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadPromptAsTxt(prompt);
    showNotification('TXT prompt blueprint downloaded.', 'info');
  };

  return (
    <div 
      onClick={() => navigateTo('prompts', { type: 'prompt', slug: prompt.slug })}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
      id={`minimal-prompt-card-${prompt.id}`}
    >
      {/* Visual Header Grid */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-slate-50 border border-slate-100 mb-3">
        <ImageWithPlaceholder
          src={prompt.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'}
          alt={prompt.title}
          aspectRatio="aspect-[16/10]"
          imgClassName="transition-transform duration-300 group-hover:scale-[1.02]"
        />
        
        {/* Absolute Badges */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1.5 z-10">
          {category && (
            <span className={`inline-flex items-center rounded bg-white/95 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-700 border border-slate-200/60 shadow-xs`}>
              {category.title}
            </span>
          )}
          <span className="inline-flex items-center rounded bg-slate-900/90 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-xs">
            {prompt.model}
          </span>
        </div>

        {/* Floating Quick Action Overlay */}
        <div className="absolute bottom-2 right-2 flex items-center space-x-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleDownload}
            className="flex h-7 w-7 items-center justify-center rounded bg-white/95 border border-slate-200 text-slate-500 shadow-xs hover:text-indigo-600 hover:bg-white active:scale-95 transition-all cursor-pointer"
            title="Download TXT"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
          <div className="bg-white/95 border border-slate-200 rounded shadow-xs hover:bg-white">
            <FavoriteButton
              itemType="prompt"
              itemId={prompt.id}
              userId={user?.id}
            />
          </div>
        </div>
      </div>

      {/* Primary Details Row */}
      <div className="flex flex-1 flex-col justify-between space-y-2.5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-sans text-xs sm:text-sm font-black text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
              {stripMarkdown(prompt.title)}
            </h4>
          </div>
          
          <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-500">
            {stripMarkdown(prompt.description)}
          </p>
        </div>

        {/* High-Density Copy Container */}
        <div className="space-y-2 pt-1">
          <div className="rounded-lg bg-slate-50 border border-slate-100 p-2 font-mono text-[9px] text-slate-600 line-clamp-1 select-all flex items-center justify-between gap-1.5">
            <span className="truncate flex-1">{prompt.prompt}</span>
            <button
              onClick={handleCopy}
              className="p-0.5 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer shrink-0"
              title="Copy prompt text"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>

          {/* Action Footer row */}
          <div className="flex items-center justify-between border-t border-slate-100/60 pt-2 text-[10px] text-slate-400 font-bold">
            <div className="flex items-center space-x-2.5">
              <span className="flex items-center space-x-0.5">
                <Download className="h-3 w-3 text-slate-400" />
                <span>{prompt.downloads}</span>
              </span>
              <span className="flex items-center space-x-0.5">
                <Eye className="h-3 w-3 text-slate-400" />
                <span>{prompt.views}</span>
              </span>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={handleCopy}
                className="inline-flex h-6 items-center space-x-1 rounded bg-slate-100 hover:bg-slate-200 px-2.5 text-[10px] text-slate-700 transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-600" />
                    <span className="text-emerald-600 font-bold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 text-slate-500" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike('prompts', prompt.id);
                }}
                className={`flex h-6 w-6 items-center justify-center rounded border transition-colors hover:bg-rose-50 hover:text-rose-600 ${
                  isLiked ? 'border-rose-100 bg-rose-50 text-rose-500' : 'border-slate-200 text-slate-400 bg-slate-50/50'
                }`}
              >
                <Heart className={`h-3 w-3 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
