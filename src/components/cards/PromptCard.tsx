import React from 'react';
import { AIPrompt } from '../../types';
import { useApp } from '../../context/AppContext';
import { CATEGORIES, getColorClasses } from '../../data/categories';
import { getLocalizedCategoryTitle, getLocalizedItem } from '../../lib/i18n';
import { Copy, Eye, Download, Heart, Check, FileText } from 'lucide-react';
import { ImageWithPlaceholder } from '../ImageWithPlaceholder';
import { FavoriteButton } from '../FavoriteButton';
import { downloadPromptAsTxt } from '../../services/downloadService';
import { stripMarkdown } from '../../utils/textUtils';

interface PromptCardProps {
  prompt: AIPrompt;
}

export const PromptCard: React.FC<PromptCardProps> = ({ prompt }) => {
  const { 
    user,
    state, 
    toggleLike, 
    navigateTo, 
    showNotification,
    currentLang,
    t
  } = useApp();

  const [copied, setCopied] = React.useState(false);

  const localizedPrompt = getLocalizedItem(prompt, currentLang);
  const category = CATEGORIES.find(c => c.id === prompt.category_id);
  const colorSchema = category ? getColorClasses(category.color) : getColorClasses('orange');

  const isLiked = state.likes.prompts.includes(prompt.id);
  const isBookmarked = state.bookmarks.prompts.includes(prompt.id);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt.prompt);
    setCopied(true);
    showNotification(t('promptCopied', 'Prompt copied to clipboard!'), 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadPromptAsTxt(prompt);
    showNotification(t('downloadTxt', 'Downloading prompt as TXT file...'), 'info');
  };

  return (
    <div 
      onClick={() => navigateTo('prompts', { type: 'prompt', slug: prompt.slug })}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-red-200 hover:shadow-md cursor-pointer"
      id={`prompt-card-${prompt.id}`}
    >
      
      {/* Thumbnail and badges */}
      <div className="relative aspect-4/3 overflow-hidden bg-slate-50">
        <ImageWithPlaceholder
          src={prompt.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'}
          alt={localizedPrompt.title}
          aspectRatio="aspect-4/3"
          imgClassName="transition-transform duration-500 group-hover:scale-103"
        />
        <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 flex flex-wrap gap-1.5 z-10">
          {category && (
            <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm border ${colorSchema.bg} ${colorSchema.text} ${colorSchema.border}`}>
              {getLocalizedCategoryTitle(category.slug, currentLang)}
            </span>
          )}
          {prompt.premium && (
            <span className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 shadow-sm">
              PRO
            </span>
          )}
        </div>

        {/* Floating actions */}
        <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 flex items-center space-x-1.5 rtl:space-x-reverse z-10 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={handleDownload}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 backdrop-blur-sm text-slate-700 shadow-sm transition-transform active:scale-95 hover:bg-white hover:text-red-600 cursor-pointer"
            title={t('downloadTxt', 'Download TXT file')}
          >
            <FileText className="h-4 w-4" />
          </button>
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white">
            <FavoriteButton
              itemType="prompt"
              itemId={prompt.id}
              userId={user?.id}
            />
          </div>
        </div>

        {/* Model Overlay */}
        <div className="absolute bottom-3 left-3 rtl:left-auto rtl:right-3 z-10">
          <span className="rounded bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase text-white backdrop-blur-xs">
            {prompt.model}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-sans text-sm font-bold text-slate-900 transition-colors group-hover:text-[#e21833] line-clamp-1">
          {stripMarkdown(localizedPrompt.title)}
        </h3>
        <p className="mt-1.5 line-clamp-2 flex-1 text-xs text-slate-500">
          {stripMarkdown(localizedPrompt.description)}
        </p>

        {/* Prompt Preview Snippet */}
        <div className="mt-3 rounded-lg bg-slate-50 border border-slate-100 p-2.5 flex items-center justify-between gap-2 group/snippet">
          <p className="line-clamp-1 font-mono text-[10px] text-slate-600 flex-1">
            {prompt.prompt}
          </p>
          <button
            onClick={handleCopy}
            className="flex items-center shrink-0 p-1 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer rounded hover:bg-slate-200/50"
            title={t('copyPrompt', 'Quick Copy Prompt Code')}
          >
            {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
          </button>
        </div>

        {/* Stats */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <div className="flex items-center space-x-3 rtl:space-x-reverse text-[11px] text-slate-400 font-semibold">
            <span className="flex items-center space-x-1 rtl:space-x-reverse">
              <Download className="h-3.5 w-3.5" />
              <span>{prompt.downloads}</span>
            </span>
            <span className="flex items-center space-x-1 rtl:space-x-reverse">
              <Eye className="h-3.5 w-3.5" />
              <span>{prompt.views}</span>
            </span>
          </div>

          <div className="flex items-center space-x-1 rtl:space-x-reverse">
            {/* Copy prompt button */}
            <button
              onClick={handleCopy}
              className="flex h-7 items-center space-x-1 rtl:space-x-reverse rounded-md bg-slate-100 px-2 text-[11px] font-bold text-slate-700 transition-colors hover:bg-slate-200 cursor-pointer"
              title={t('copyPrompt', 'Copy Prompt text')}
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-600" />
                  <span className="text-emerald-600 font-bold">{t('promptCopied', 'Copied')}</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>{t('copyPrompt', 'Copy')}</span>
                </>
              )}
            </button>

            {/* Like trigger */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLike('prompts', prompt.id);
              }}
              className={`flex h-7 w-7 items-center justify-center rounded-md border text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 ${
                isLiked ? 'border-rose-100 bg-rose-50 text-rose-500' : 'border-slate-200'
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${isLiked ? 'fill-rose-500' : ''}`} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
