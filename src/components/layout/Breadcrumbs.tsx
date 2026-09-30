import React from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronRight, Home as HomeIcon } from 'lucide-react';

export const Breadcrumbs: React.FC = () => {
  const { activeTab, activeDetail, prompts, skills, videos, blogs, navigateTo } = useApp();

  // Do not show breadcrumbs on the homepage
  if (activeTab === 'home') return null;

  // Map activeTab keys to professional display labels
  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'prompts':
        return 'Image Prompts';
      case 'skills':
        return 'Developer Skills';
      case 'videos':
        return 'Video Blueprints';
      case 'blog':
        return 'Blog & Guides';
      case 'search':
        return 'Search System';
      default:
        return tab.charAt(0).toUpperCase() + tab.slice(1);
    }
  };

  // Dynamically resolve full item titles for nested detail levels
  const getDetailTitle = () => {
    if (!activeDetail) return null;
    const { type, slug } = activeDetail;
    if (type === 'prompt') {
      return prompts.find(p => p.slug === slug)?.title || 'Prompt Blueprint';
    }
    if (type === 'skill') {
      return skills.find(s => s.slug === slug)?.title || 'Skill Blueprint';
    }
    if (type === 'video') {
      return videos.find(v => v.slug === slug)?.title || 'Video Blueprint';
    }
    if (type === 'blog') {
      return blogs.find(b => b.slug === slug)?.title || 'Blog Article';
    }
    return null;
  };

  const detailTitle = getDetailTitle();

  return (
    <div className="bg-white border-b border-slate-200/50">
      <nav 
        aria-label="Breadcrumb"
        className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 lg:px-8 flex items-center space-x-2 text-xs font-semibold text-slate-500"
      >
        {/* Home button */}
        <button
          onClick={() => navigateTo('home')}
          className="flex items-center space-x-1.5 text-slate-400 hover:text-[#e21833] transition-colors cursor-pointer"
        >
          <HomeIcon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Home</span>
        </button>

        <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />

        {/* Level 1 Category tab */}
        {detailTitle ? (
          <>
            <button
              onClick={() => navigateTo(activeTab)}
              className="text-slate-500 hover:text-[#e21833] transition-colors cursor-pointer capitalize"
            >
              {getTabLabel(activeTab)}
            </button>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
            <span className="text-slate-800 font-bold truncate max-w-[150px] sm:max-w-md">
              {detailTitle}
            </span>
          </>
        ) : (
          <span className="text-slate-800 font-bold capitalize">
            {getTabLabel(activeTab)}
          </span>
        )}
      </nav>
    </div>
  );
};
