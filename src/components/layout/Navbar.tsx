import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Search, Layout, Cpu, BookOpen, Menu, X, PlusCircle, Bookmark, Heart, Home as HomeIcon, Zap, UploadCloud, User, Film, Flame, Shield, LogOut } from 'lucide-react';
import { UserProfileModal } from '../UserProfileModal';
import { AuthModal } from '../AuthModal';
import { NotificationsDropdown } from './NotificationsDropdown';
import { LanguageSwitcher } from './LanguageSwitcher';
import { LanguageCode } from '../../lib/i18n';

export const Navbar: React.FC = () => {
  const { 
    activeTab, 
    navigateTo, 
    searchQuery, 
    setSearchQuery,
    state,
    user,
    isAdmin,
    logout,
    currentLang,
    switchLanguage,
    t
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const navItems = [
    { id: 'home', label: t('navHome', 'Home'), icon: HomeIcon },
    { id: 'prompts', label: t('navPrompts', 'AI Prompts'), icon: Sparkles },
    { id: 'skills', label: t('navSkills', 'Skills Library'), icon: Cpu },
    { id: 'videos', label: t('navVideos', 'Video Blueprints'), icon: Film },
    { id: 'blog', label: t('navBlog', 'Blogs & Guides'), icon: BookOpen },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo('search');
  };

  const bookmarkCount = 
    state.bookmarks.prompts.length + 
    state.bookmarks.skills.length + 
    state.bookmarks.videos.length;

  return (
    <nav className="sticky top-0 z-50 w-full flex flex-col shadow-sm">
      {/* Primary Top Bar: Vibrant Brand Red */}
      <div className="w-full bg-[#e21833] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-15 items-center justify-between gap-4">
            
            {/* Logo */}
            <div 
              onClick={() => navigateTo('home')} 
              className="flex cursor-pointer items-center space-x-2 shrink-0 select-none rtl:space-x-reverse"
              id="nav-logo"
            >
              <span className="font-sans text-xl font-black tracking-tight text-white uppercase">
                Promptat<span className="text-red-200">.online</span>
              </span>
            </div>

            {/* Desktop Center Search Bar (Matches Mockup) */}
            <form 
              onSubmit={handleSearchSubmit} 
              className="relative hidden max-w-sm flex-1 sm:block md:max-w-md"
            >
              <div className="relative">
                <input
                   type="text"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder={t('searchPromptSkillGuide', 'Find a prompt, skill, guide...')}
                   className="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 rtl:pr-3 rtl:pl-10 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-red-300"
                />
                <button type="submit" className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 flex items-center pr-3 rtl:pl-3 text-slate-400 hover:text-slate-600">
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </form>

              {/* Top Right Quick Navigation Buttons */}
              <div className="hidden items-center space-x-4 rtl:space-x-reverse md:flex text-xs font-semibold">
                <button 
                  onClick={() => navigateTo('prompts')}
                  className="flex items-center space-x-1.5 rtl:space-x-reverse text-white/90 hover:text-white transition-colors cursor-pointer"
                >
                  <Zap className="h-4 w-4 shrink-0" />
                  <span>{t('navLatest', 'Latest')}</span>
                </button>
                <button 
                  onClick={() => navigateTo('skills')}
                  className="flex items-center space-x-1.5 rtl:space-x-reverse text-white/90 hover:text-white transition-colors cursor-pointer"
                >
                  <Flame className="h-4 w-4 shrink-0" />
                  <span>{t('navPopular', 'Popular')}</span>
                </button>

                <button
                  onClick={() => setProfileModalOpen(true)}
                  className="flex items-center space-x-1.5 rtl:space-x-reverse rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-1.5 transition-colors cursor-pointer border border-white/20"
                  title="View Saved Bookmarks & Personal Collection"
                >
                  <Bookmark className="h-4 w-4 text-red-200 shrink-0" />
                  <span>{t('navSavedCollection', 'Saved Collection')}</span>
                  {bookmarkCount > 0 && (
                    <span className="ml-1 rtl:mr-1 rounded-full bg-white text-[#e21833] text-[10px] font-black px-1.5 py-0.2">
                      {bookmarkCount}
                    </span>
                  )}
                </button>

                <LanguageSwitcher currentLang={currentLang} onLanguageChange={switchLanguage} variant="navbar" />

                <NotificationsDropdown />

                <button 
                  onClick={() => navigateTo('admin')}
                  className="rounded-md bg-white text-[#e21833] font-black px-3 py-1.5 transition-colors hover:bg-slate-50 cursor-pointer shadow-md flex items-center space-x-1.5 rtl:space-x-reverse"
                >
                  <Shield className="h-4 w-4" />
                  <span>{t('navAdminPanel', 'Admin Panel')}</span>
                </button>

                {user && (
                  <button 
                    onClick={logout}
                    className="flex items-center space-x-1.5 rtl:space-x-reverse text-white/90 hover:text-white transition-colors cursor-pointer font-bold"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t('navSignOut', 'Sign Out')}</span>
                  </button>
                )}
              </div>

              {/* Mobile Actions Menu Trigger */}
              <div className="flex items-center space-x-2 rtl:space-x-reverse md:hidden">
                <NotificationsDropdown />
                <button
                  onClick={() => navigateTo('admin')}
                  className="rounded-lg bg-white/20 px-2.5 py-1 text-xs font-black text-white hover:bg-white/30"
                >
                  {t('adminConsole', 'Admin')}
                </button>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="rounded-lg p-1.5 text-white hover:bg-white/10"
                >
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>

          </div>
        </div>
      </div>

      {/* Secondary Bar: Clean White Menu with Red Accents (Desktop Centered, Hidden on Mobile/Tablet) */}
      <div className="w-full bg-white border-b border-slate-200 py-2.5 hidden lg:block">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            {/* Nav Items Row */}
            <div className="flex items-center gap-x-8">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateTo(item.id)}
                    className={`flex items-center space-x-2 rtl:space-x-reverse text-xs font-bold tracking-tight uppercase transition-all py-1 cursor-pointer ${
                      isActive 
                        ? 'text-[#e21833]' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-[#e21833]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer (Displayed on Mobile / Tablet toggle) */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white p-4 lg:hidden">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder', 'Search prompts, skills...')}
              className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-3 pr-9 rtl:pr-3 rtl:pl-9 text-xs text-slate-800 outline-none"
            />
            <button type="submit" className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 flex items-center pr-3 rtl:pl-3 text-slate-400">
              <Search className="h-4 w-4 text-slate-400" />
            </button>
          </form>

          {/* Mobile Nav Links */}
          <div className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigateTo(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex w-full items-center space-x-3 rtl:space-x-reverse py-2.5 px-3 rounded-md text-xs font-bold uppercase ${
                    isActive 
                      ? 'bg-red-50 text-[#e21833]' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-[#e21833]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pt-2">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 px-3">
                {t('selectLanguage', 'Select Language')}
              </div>
              <div className="px-3">
                <LanguageSwitcher currentLang={currentLang} onLanguageChange={switchLanguage} variant="footer" className="w-full" />
              </div>
            </div>

            <button
              onClick={() => {
                setProfileModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="flex w-full items-center justify-between py-2.5 px-3 rounded-md text-xs font-bold uppercase bg-slate-100 text-slate-800 mt-2 cursor-pointer"
            >
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Bookmark className="h-5 w-5 text-[#e21833]" />
                <span>{t('navSavedCollection', 'Saved Collection')}</span>
              </div>
              {bookmarkCount > 0 && (
                <span className="rounded-full bg-[#e21833] text-white text-[10px] font-black px-2 py-0.5">
                  {bookmarkCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                navigateTo('admin');
                setMobileMenuOpen(false);
              }}
              className="flex w-full items-center py-2.5 px-3 rounded-md text-xs font-bold uppercase bg-red-600 text-white mt-2 cursor-pointer space-x-3 rtl:space-x-reverse"
            >
              <Shield className="h-5 w-5 text-white" />
              <span>{t('navAdminPanel', 'Admin Panel')}</span>
            </button>
          </div>
        </div>
      )}

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
