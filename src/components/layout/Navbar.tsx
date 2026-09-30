import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../hooks/useI18n';
import { Sparkles, Search, Cpu, BookOpen, Menu, Bookmark, Home as HomeIcon, Zap, Film, Flame, Newspaper } from 'lucide-react';
import { UserProfileModal } from '../UserProfileModal';
import { AuthModal } from '../AuthModal';
import { NotificationsDropdown } from './NotificationsDropdown';
import { LanguageSelector } from './LanguageSelector';
import { UserMenu } from './UserMenu';
import { MobileDrawer } from './MobileDrawer';
import { getNavigation } from '../../lib/i18n';

const ICON_MAP = {
  Home: HomeIcon,
  Sparkles: Sparkles,
  Cpu: Cpu,
  Film: Film,
  BookOpen: BookOpen,
  Zap: Zap,
  Newspaper: Newspaper,
};

export const Navbar: React.FC = () => {
  const { 
    activeTab, 
    navigateTo, 
    searchQuery, 
    setSearchQuery,
    state,
    user,
    switchLanguage,
  } = useApp();

  const { lang, t } = useI18n();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const dynamicNavItems = getNavigation(lang);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigateTo('search');
    }
  };

  const bookmarkCount = 
    state.bookmarks.prompts.length + 
    state.bookmarks.skills.length + 
    state.bookmarks.videos.length;

  return (
    <nav className="sticky top-0 z-50 w-full flex flex-col shadow-sm select-none">
      {/* Primary Top Bar: Vibrant Brand Red */}
      <div className="w-full bg-[#e21833] text-white">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-2.5 sm:gap-3">
            
            {/* Toggle Hamburger Button (Visible on ALL viewports below 1024px) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden rounded-xl p-2 text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              aria-label={t('navOpenMenu', lang)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-drawer"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* 1. Brand Logo */}
            <div 
              onClick={() => navigateTo('home')} 
              className="flex cursor-pointer items-center gap-1.5 shrink-0"
              id="nav-logo"
            >
              <span className="font-sans text-lg sm:text-xl font-black tracking-tight text-white uppercase">
                Promptat<span className="text-red-200">.online</span>
              </span>
            </div>

            {/* 2. Desktop/Tablet Search Input (flex-1 min-w-0 max-w-xl) */}
            <form 
              onSubmit={handleSearchSubmit} 
              className="relative hidden sm:block flex-1 min-w-0 max-w-xl"
            >
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchPromptSkillGuide', lang)}
                  className="w-full rounded-xl border-0 bg-white py-2 pl-3 pr-10 rtl:pr-3 rtl:pl-10 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-red-300 shadow-inner"
                />
                <button type="submit" className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 flex items-center pr-3 rtl:pl-3 text-slate-400 hover:text-slate-600 cursor-pointer">
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </form>

            {/* 3. Action Controls Cluster */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 ms-auto">

              {/* AI News Quick Direct Action */}
              <button
                type="button"
                onClick={() => navigateTo('news')}
                className={`hidden md:flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'news'
                    ? 'bg-white text-[#e21833] shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
                title={t('navNews', lang)}
                aria-label={t('navNews', lang)}
              >
                <Newspaper className={`h-4 w-4 ${activeTab === 'news' ? 'text-[#e21833]' : 'text-red-100'}`} />
                <span>{t('navNews', lang)}</span>
                <span className="relative flex h-2 w-2 ms-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                </span>
              </button>

              {/* Compact Language Selector (Globe + Flag + Code) */}
              <div className="hidden sm:inline-block">
                <LanguageSelector currentLang={lang} onLanguageChange={switchLanguage} variant="navbar" />
              </div>

              {/* Saved Collection Icon Button */}
              <button
                type="button"
                onClick={() => setProfileModalOpen(true)}
                className="relative flex items-center justify-center h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/20 shrink-0"
                title={t('navSavedCollection', lang)}
                aria-label={t('navSavedCollection', lang)}
              >
                <Bookmark className="h-4 w-4 text-red-200" />
                {bookmarkCount > 0 && (
                  <span className="absolute -top-1 -right-1 rtl:-left-1 rtl:right-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-white text-[#e21833] text-[9px] font-black px-1 shadow-sm">
                    {bookmarkCount}
                  </span>
                )}
              </button>

              {/* Bell Notifications (Logged in users only) */}
              {user && <NotificationsDropdown />}

              {/* User Profile Avatar / Sign In Menu */}
              <UserMenu 
                onOpenAuth={() => setAuthModalOpen(true)} 
                onOpenBookmarks={() => setProfileModalOpen(true)} 
              />

            </div>

          </div>
        </div>
      </div>

      {/* Secondary Bar: Desktop Row 2 Categories (Hidden below 1024px) */}
      <div className="w-full bg-white border-b border-slate-200 py-1.5 shadow-2xs hidden lg:block">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 overflow-x-auto whitespace-nowrap scrollbar-none py-1">
            
            {/* Category Links */}
            <div className="flex items-center gap-2">
              {dynamicNavItems.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = ICON_MAP[item.iconName] || HomeIcon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigateTo(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-red-50 text-[#e21833]' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-[#e21833]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                    {item.id === 'news' && (
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        isActive ? 'bg-[#e21833] text-white' : 'bg-red-100 text-[#e21833]'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-[#e21833]'} animate-pulse`} />
                        {t('navNewsBadge', lang)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-2 border-l rtl:border-r rtl:border-l-0 border-slate-200 pl-3 rtl:pr-3 shrink-0">
              <button 
                type="button"
                onClick={() => navigateTo('prompts')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                <span>{t('navLatest', lang)}</span>
              </button>
              <button 
                type="button"
                onClick={() => navigateTo('skills')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Flame className="h-3.5 w-3.5 text-rose-500" />
                <span>{t('navPopular', lang)}</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Responsive Mobile Drawer (<1024px) */}
      <MobileDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenBookmarks={() => setProfileModalOpen(true)}
      />

      {/* Profile & Bookmarks Modal */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </nav>
  );
};

