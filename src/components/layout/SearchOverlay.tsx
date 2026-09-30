import React, { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ open, onClose }) => {
  const { searchQuery, setSearchQuery, navigateTo, t } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onClose();
      navigateTo('search');
    }
  };

  return (
    <div className="fixed inset-0 z-[70] lg:hidden animate-in fade-in duration-150" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" 
        onClick={onClose} 
      />

      {/* Top Search Sheet */}
      <div className="relative bg-white border-b border-slate-200 shadow-2xl p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="mx-auto max-w-2xl">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPromptSkillGuide', 'Find a prompt, skill, guide...')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-10 rtl:pr-4 rtl:pl-10 text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none focus:border-[#e21833] focus:ring-2 focus:ring-red-100 shadow-inner"
              />
              <button 
                type="submit" 
                className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 flex items-center pr-3.5 rtl:pl-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label={t('nav.search', 'Search')}
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer shrink-0"
              aria-label={t('nav.closeMenu', 'Close')}
            >
              <X className="h-5 w-5" />
            </button>
          </form>

          {/* Quick Search Suggestions */}
          <div className="mt-3 flex items-center gap-2 overflow-x-auto whitespace-nowrap text-xs text-slate-500 py-1">
            <span className="font-bold text-slate-400">{t('trending', 'الشائع:')}</span>
            {['Midjourney v6', 'SEO Claude', 'Faceless Video', 'Prompt Architecture'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSearchQuery(tag);
                  onClose();
                  navigateTo('search');
                }}
                className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium text-slate-700 hover:bg-red-50 hover:text-[#e21833] transition-colors cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
