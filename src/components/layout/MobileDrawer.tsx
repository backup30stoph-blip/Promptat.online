import React, { useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../hooks/useI18n';
import { 
  X, Search, Home as HomeIcon, Sparkles, Cpu, Film, BookOpen, 
  Bookmark, Zap, Flame, Globe, Settings, Shield, LogOut, LogIn, Check, Newspaper 
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, getNavigation } from '../../lib/i18n';

const ICON_MAP = {
  Home: HomeIcon,
  Sparkles: Sparkles,
  Cpu: Cpu,
  Film: Film,
  BookOpen: BookOpen,
  Zap: Zap,
  Newspaper: Newspaper,
};

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
  onOpenBookmarks: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  open,
  onClose,
  onOpenAuth,
  onOpenBookmarks,
}) => {
  const { 
    activeTab, 
    navigateTo, 
    searchQuery, 
    setSearchQuery, 
    state, 
    user, 
    profile, 
    isAdmin, 
    logout, 
    switchLanguage, 
  } = useApp();

  const { lang, t } = useI18n();

  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Lock body scroll and handle Esc key
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      // Focus close button on open
      setTimeout(() => closeButtonRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const dynamicNavItems = getNavigation(lang);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onClose();
      navigateTo('search');
    }
  };

  const bookmarkCount = 
    state.bookmarks.prompts.length + 
    state.bookmarks.skills.length + 
    state.bookmarks.videos.length;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in" 
        onClick={onClose} 
      />

      {/* Drawer Panel */}
      <aside 
        id="mobile-drawer"
        className="absolute inset-y-0 start-0 flex h-[100dvh] w-[min(88vw,360px)] flex-col bg-white text-slate-800 shadow-2xl transition-transform duration-200 animate-in slide-in-from-start"
      >
        {/* Drawer Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-4 bg-[#e21833] text-white">
          <div 
            onClick={() => { onClose(); navigateTo('home'); }} 
            className="flex cursor-pointer items-center gap-1.5 select-none"
          >
            <span className="font-sans text-lg font-black tracking-tight uppercase">
              Promptat<span className="text-red-200">.online</span>
            </span>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label={t('navCloseMenu', lang)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Drawer Body */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-5">
          {/* Mobile Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPromptSkillGuide', lang)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-3 pr-9 rtl:pr-3 rtl:pl-9 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-red-200 shadow-inner"
            />
            <button type="submit" className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 flex items-center pr-3 rtl:pl-3 text-slate-400">
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* Section Navigation Links */}
          <nav aria-label={t('navPrimary', lang)} className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 mb-1.5">
              {t('navSections', lang)}
            </p>
            {dynamicNavItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = ICON_MAP[item.iconName] || HomeIcon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    navigateTo(item.id);
                    onClose();
                  }}
                  className={`flex w-full items-center gap-3 py-2.5 px-3 rounded-xl text-xs font-bold transition-colors ${
                    isActive 
                      ? 'bg-red-50 text-[#e21833]' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-[#e21833]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.id === 'news' && (
                    <span className={`ms-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      isActive ? 'bg-[#e21833] text-white' : 'bg-red-100 text-[#e21833]'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-[#e21833]'} animate-pulse`} />
                      {t('navNewsBadge', lang)}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Browse Group (Quick Filters & Bookmarks) */}
          <div className="pt-3 border-t border-slate-100 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 mb-1.5">
              {t('navBrowseGroup', lang)}
            </p>
            <button
              type="button"
              onClick={() => {
                navigateTo('prompts');
                onClose();
              }}
              className="flex w-full items-center gap-3 py-2 px-3 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <Zap className="h-4 w-4 text-amber-500" />
              <span>{t('navLatest', lang)}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                navigateTo('skills');
                onClose();
              }}
              className="flex w-full items-center gap-3 py-2 px-3 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <Flame className="h-4 w-4 text-rose-500" />
              <span>{t('navPopular', lang)}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenBookmarks();
              }}
              className="flex w-full items-center justify-between py-2 px-3 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Bookmark className="h-4 w-4 text-[#e21833]" />
                <span>{t('navSavedCollection', lang)}</span>
              </div>
              {bookmarkCount > 0 && (
                <span className="rounded-full bg-[#e21833] text-white text-[10px] font-black px-2 py-0.5">
                  {bookmarkCount}
                </span>
              )}
            </button>
          </div>

          {/* Language Selection List */}
          <div className="pt-3 border-t border-slate-100 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 mb-1.5 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-slate-400" />
              <span>{t('selectLanguage', lang)}</span>
            </p>
            <div className="space-y-0.5">
              {Object.values(SUPPORTED_LANGUAGES).map((l) => {
                const isSelected = l.code === lang;
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      switchLanguage(l.code);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      isSelected ? 'bg-red-50 text-[#e21833]' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base leading-none">{l.flag}</span>
                      <span>{l.nativeName} ({l.name})</span>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-[#e21833]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sticky Drawer Footer */}
        <div className="shrink-0 border-t border-slate-100 p-4 bg-slate-50 space-y-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200">
                <img
                  src={profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt={profile?.full_name || 'User'}
                  className="h-8 w-8 rounded-full object-cover shrink-0"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-slate-900 truncate">{profile?.full_name || user.email?.split('@')[0]}</p>
                  <p className="text-[10px] text-slate-500 font-mono truncate">{user.email}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigateTo('account-settings');
                }}
                className="w-full flex items-center gap-2.5 py-2 px-3 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
              >
                <Settings className="h-4 w-4 text-slate-400" />
                <span>{t('accountSettings', lang)}</span>
              </button>

              {/* SECRET ADMIN PANEL BUTTON (ONLY SHOWN IF USER IS ADMIN) */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigateTo('admin');
                  }}
                  className="w-full flex items-center gap-2.5 py-2 px-3 rounded-xl text-xs font-bold text-[#e21833] bg-red-100/70 border border-red-200 hover:bg-red-100 cursor-pointer"
                >
                  <Shield className="h-4 w-4 text-[#e21833]" />
                  <span>{t('navAdminPanel', lang)}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onClose();
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>{t('navSignOut', lang)}</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-[#e21833] text-white hover:bg-red-700 transition-colors shadow-md cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              <span>{t('navSignIn', lang)}</span>
            </button>
          )}
        </div>
      </aside>
    </div>
  );
};
