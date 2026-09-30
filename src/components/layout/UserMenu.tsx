import React, { useState, useRef, useEffect } from 'react';
import { LogIn, LogOut, Shield, Bookmark, Settings, ChevronDown, X, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface UserMenuProps {
  onOpenAuth: () => void;
  onOpenBookmarks: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ onOpenAuth, onOpenBookmarks }) => {
  const { user, profile, isAdmin, logout, navigateTo, state, isRtl, t } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const bookmarkCount =
    state.bookmarks.prompts.length +
    state.bookmarks.skills.length +
    state.bookmarks.videos.length;

  if (!user) {
    return (
      <button
        type="button"
        onClick={onOpenAuth}
        className="flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 text-xs font-bold text-white transition-all cursor-pointer shadow-sm shrink-0"
        title={t('navSignIn', 'Sign In')}
        aria-label={t('navSignIn', 'Sign In')}
      >
        <LogIn className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline">{t('navSignIn', 'تسجيل الدخول')}</span>
      </button>
    );
  }

  const avatarUrl = profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
  const displayName = profile?.full_name || profile?.username || user.email?.split('@')[0] || 'User';

  return (
    <div className="relative inline-block shrink-0" ref={dropdownRef}>
      {/* Avatar Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-full p-0.5 sm:pe-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={displayName}
        aria-label={displayName}
      >
        <img
          src={avatarUrl}
          alt={displayName}
          className="h-8 w-8 rounded-full object-cover border border-white/40 shrink-0"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
          }}
        />
        <span className="text-xs font-bold truncate max-w-[80px] md:max-w-[100px] hidden md:inline">{displayName}</span>
        <ChevronDown className={`h-3.5 w-3.5 opacity-80 transition-transform duration-200 hidden sm:inline ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* MOBILE BOTTOM SHEET (<640px) */}
          <div className="sm:hidden fixed inset-0 z-[70]" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
              onClick={() => setIsOpen(false)}
            />

            {/* Bottom Sheet Modal */}
            <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl p-4 text-slate-800 pb-[max(1.25rem,env(safe-area-inset-bottom))] animate-in slide-in-from-bottom duration-200">
              {/* Drag handle */}
              <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-slate-300" />

              {/* User Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-10 w-10 rounded-full object-cover border border-slate-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-900 truncate">{displayName}</p>
                    <p className="text-xs text-slate-500 font-mono truncate" dir="ltr">{user.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Menu items list */}
              <div className="space-y-1 text-sm font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenBookmarks();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Bookmark className="h-5 w-5 text-[#e21833]" />
                    <span>{t('navSavedCollection', 'المجموعة المحفوظة')}</span>
                  </div>
                  {bookmarkCount > 0 && (
                    <span className="rounded-full bg-[#e21833] text-white text-xs font-black px-2 py-0.5">
                      {bookmarkCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    navigateTo('account-settings');
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  <Settings className="h-5 w-5 text-slate-400" />
                  <span>{t('accountSettings', 'إعدادات الحساب')}</span>
                </button>

                {/* SECRET ADMIN PANEL BUTTON (ONLY SHOWN IF USER IS ADMIN) */}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      navigateTo('admin');
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-50 text-[#e21833] font-black border border-red-200/60 cursor-pointer my-1"
                  >
                    <Shield className="h-5 w-5 text-[#e21833]" />
                    <span>{t('navAdminPanel', 'لوحة التحكم')}</span>
                  </button>
                )}

                <div className="my-2 border-t border-slate-100" />

                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-red-600 cursor-pointer"
                >
                  <LogOut className="h-5 w-5" />
                  <span>{t('navSignOut', 'تسجيل الخروج')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* DESKTOP & TABLET POPOVER (>=640px) */}
          {/* Collision-safe positioning: In RTL, aligned to left-0; in LTR, aligned to right-0 */}
          <div 
            className={`hidden sm:block absolute top-full mt-2 z-[60] w-[min(18rem,calc(100vw-24px))] max-h-[calc(100dvh-88px)] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl p-1.5 text-slate-800 animate-in fade-in slide-in-from-top-1 ${
              isRtl ? 'left-0 right-auto' : 'right-0 left-auto'
            }`}
            role="menu"
            aria-label="User Account Menu"
          >
            {/* Header */}
            <div className="px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-100/80 mb-1">
              <p className="text-xs font-black text-slate-900 truncate">{displayName}</p>
              <p className="text-[11px] text-slate-500 truncate font-mono mt-0.5" dir="ltr">{user.email}</p>
              {isAdmin && (
                <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-red-100 text-[#e21833] text-[9px] font-black uppercase tracking-wider">
                  <Shield className="h-3 w-3" />
                  <span>Admin</span>
                </span>
              )}
            </div>

            {/* Links */}
            <div className="py-0.5 text-xs font-bold space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenBookmarks();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Bookmark className="h-4 w-4 text-[#e21833]" />
                  <span>{t('navSavedCollection', 'المجموعة المحفوظة')}</span>
                </div>
                {bookmarkCount > 0 && (
                  <span className="rounded-full bg-[#e21833] text-white text-[10px] font-black px-1.5 py-0.2">
                    {bookmarkCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigateTo('account-settings');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
              >
                <Settings className="h-4 w-4 text-slate-400" />
                <span>{t('accountSettings', 'إعدادات الحساب')}</span>
              </button>

              {/* SECRET ADMIN PANEL BUTTON (ONLY SHOWN IF USER IS ADMIN) */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    navigateTo('admin');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-red-50 text-[#e21833] font-black hover:bg-red-100 transition-colors cursor-pointer my-0.5 border border-red-100"
                >
                  <Shield className="h-4 w-4 text-[#e21833]" />
                  <span>{t('navAdminPanel', 'لوحة التحكم')}</span>
                </button>
              )}

              <div className="my-1 border-t border-slate-100" />

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>{t('navSignOut', 'تسجيل الخروج')}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
