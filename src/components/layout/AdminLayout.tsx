import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Code, Video, BookOpen, Compass, Settings, User, FileSignature, 
  Image as ImageIcon, RefreshCw, ExternalLink, ShieldCheck, Menu, X, Globe, Languages
} from 'lucide-react';

export type AdminTab = 'prompts' | 'categories' | 'skills' | 'videos' | 'blogs' | 'pages' | 'media' | 'seo' | 'profile' | 'translations' | 'intl-seo';

interface AdminLayoutProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onSync: () => void;
  onExit: () => void;
  adminName: string;
  adminRole: string;
  syncLoading?: boolean;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab,
  onTabChange,
  onSync,
  onExit,
  adminName,
  adminRole,
  syncLoading = false,
  children
}) => {
  const [isLargeScreen, setIsLargeScreen] = useState(typeof window !== 'undefined' ? window.innerWidth > 840 : true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(isLargeScreen);

  useEffect(() => {
    const handleResize = () => {
      const large = window.innerWidth > 840;
      setIsLargeScreen(large);
      if (large) {
        setIsDrawerOpen(true);
      } else {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTabClick = (id: AdminTab) => {
    onTabChange(id);
    if (!isLargeScreen) {
      setIsDrawerOpen(false);
    }
  };

  const menuItems = [
    { id: 'prompts' as AdminTab, title: 'Image Prompts', icon: Sparkles, color: 'text-violet-500', bg: 'hover:bg-violet-50/50' },
    { id: 'categories' as AdminTab, title: 'Categories / Tax', icon: Compass, color: 'text-teal-500', bg: 'hover:bg-teal-50/50' },
    { id: 'skills' as AdminTab, title: 'Creator Skills', icon: Code, color: 'text-emerald-500', bg: 'hover:bg-emerald-50/50' },
    { id: 'videos' as AdminTab, title: 'AI Video Prompts', icon: Video, color: 'text-amber-500', bg: 'hover:bg-amber-50/50' },
    { id: 'blogs' as AdminTab, title: 'Blog Playbooks', icon: BookOpen, color: 'text-sky-500', bg: 'hover:bg-sky-50/50' },
    { id: 'pages' as AdminTab, title: 'Static Core Pages', icon: FileSignature, color: 'text-orange-500', bg: 'hover:bg-orange-50/50' },
    { id: 'media' as AdminTab, title: 'Media Manager', icon: ImageIcon, color: 'text-rose-500', bg: 'hover:bg-rose-50/50' },
    { id: 'translations' as AdminTab, title: 'Translation Matrix', icon: Languages, color: 'text-indigo-500', bg: 'hover:bg-indigo-50/50' },
    { id: 'intl-seo' as AdminTab, title: 'International SEO', icon: Globe, color: 'text-blue-500', bg: 'hover:bg-blue-50/50' },
    { id: 'seo' as AdminTab, title: 'Global Site SEO', icon: Settings, color: 'text-slate-500', bg: 'hover:bg-slate-50/50' },
    { id: 'profile' as AdminTab, title: 'My Admin Profile', icon: User, color: 'text-indigo-500', bg: 'hover:bg-indigo-50/50' }
  ];

  return (
    <div className="flex w-full h-full min-h-screen bg-[#fafafa]">
      
      {/* SCRIM BACKDROP (For Modal Mode) */}
      <div 
        id="md-scrim" 
        className={`fixed inset-0 bg-black/32 z-40 transition-opacity duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${!isLargeScreen && isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsDrawerOpen(false)}
        aria-hidden={!(!isLargeScreen && isDrawerOpen)}
      ></div>

      {/* NAVIGATION DRAWER CONTAINER */}
      <aside 
        id="admin-drawer" 
        role="navigation" 
        aria-label="Admin Dashboard Navigation"
        className={`
          flex flex-col shrink-0 p-3
          transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)]
          ${isLargeScreen 
            ? 'relative w-[360px] h-screen bg-[#F7F2FA] border-r border-[#CAC4D0] sticky top-0' 
            : 'fixed top-0 left-0 z-50 w-[360px] h-screen bg-[#ECE6F0] rounded-r-2xl shadow-lg'
          }
          ${!isLargeScreen && !isDrawerOpen ? 'translate-x-[-100%]' : 'translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 text-xl font-bold">
          <ShieldCheck className="h-6 w-6 text-emerald-600" />
          <h1 className="text-[#1D192B]">Admin Console</h1>
          {!isLargeScreen && (
            <button onClick={() => setIsDrawerOpen(false)} className="ml-auto text-[#49454F] hover:text-[#1D192B]">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Scrollable Nav Section */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-[2px]">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isTabActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`flex items-center h-[56px] px-4 rounded-full font-semibold transition-colors duration-150 w-full ${
                  isTabActive
                    ? 'bg-[#E8DEF8] text-[#1D192B]'
                    : `text-slate-600 font-medium ${item.bg}`
                }`}
              >
                <Icon className={`h-6 w-6 mr-3 ${isTabActive ? 'text-[#1D192B]' : item.color}`} />
                <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis text-left">{item.title}</span>
              </button>
            );
          })}

          <div className="h-[1px] bg-[#CAC4D0] my-2 mx-4 shrink-0"></div>
          <div className="px-4 pt-2 pb-2 text-sm font-medium text-[#49454F]">Management</div>

          <button
            onClick={onSync}
            disabled={syncLoading}
            className="flex items-center h-[56px] px-4 rounded-full font-medium text-slate-600 hover:bg-black/5 active:bg-black/10 transition-colors duration-150 w-full disabled:opacity-50"
          >
            <RefreshCw className={`h-6 w-6 mr-3 text-slate-600 ${syncLoading ? 'animate-spin' : ''}`} />
            <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis text-left">Sync Database</span>
          </button>
          
          <button
            onClick={onExit}
            className="flex items-center h-[56px] px-4 rounded-full font-medium text-slate-600 hover:bg-black/5 active:bg-black/10 transition-colors duration-150 w-full"
          >
            <ExternalLink className="h-6 w-6 mr-3 text-slate-600" />
            <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis text-left">Exit Corridor</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        
        {/* Top App Bar for mobile */}
        {!isLargeScreen && (
          <header className="sticky top-0 z-30 flex items-center h-16 px-4 bg-white border-b border-slate-200">
            <button onClick={() => setIsDrawerOpen(true)} className="p-2 -ml-2 text-slate-600 hover:text-slate-900" aria-expanded={isDrawerOpen}>
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="ml-2 text-lg font-bold text-slate-900 truncate">System Manager Panel</h2>
          </header>
        )}

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full">
          {/* Top Admin Header Banner from old code (now adapted) */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-red-50 border border-red-100 px-2 py-1 text-[10px] font-bold text-red-700 uppercase tracking-wider">
                  <ShieldCheck className="h-3 w-3" /> Secure Corridor
                </span>
                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  CMS Panel
                </span>
              </div>
              <h1 className="mt-2.5 font-display text-2xl font-black text-slate-900 leading-tight">
                System Manager Panel
              </h1>
              <p className="mt-1 text-xs text-slate-500 font-medium">
                Logged in as <span className="text-red-600 font-bold">{adminName}</span> ({adminRole})
              </p>
            </div>
            <div className="hidden md:flex flex-wrap gap-2">
              <button
                onClick={onSync}
                disabled={syncLoading}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm active:scale-98 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${syncLoading ? 'animate-spin' : ''}`} />
                <span>Sync Database</span>
              </button>
              <button
                onClick={onExit}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer shadow-sm active:scale-98 transition-all"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Exit Corridor</span>
              </button>
            </div>
          </div>
          
          {/* Workspace */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 md:p-8 shadow-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
