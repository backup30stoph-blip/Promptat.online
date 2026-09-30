import React from 'react';
import { useApp } from '../context/AppContext';
import { AlertCircle, ArrowLeft, Home as HomeIcon } from 'lucide-react';
import { use404Logger } from '../hooks/use404Logger';

interface PageNotFoundProps {
  type?: 'prompt' | 'skill' | 'video' | 'blog' | 'general';
  slug?: string;
}

export const PageNotFound: React.FC<PageNotFoundProps> = ({ type = 'general', slug }) => {
  const { navigateTo } = useApp();

  const url = window.location.hash || window.location.pathname || '/';
  let targetUrl = url;
  if (type !== 'general' && slug) {
    let pluralType = type as string;
    if (type === 'prompt') pluralType = 'prompts';
    else if (type === 'skill') pluralType = 'skills';
    else if (type === 'video') pluralType = 'videos';
    
    targetUrl = `/${pluralType}/${slug}`;
  }

  // Use unified use404Logger hook
  use404Logger(true, targetUrl, type);

  const getErrorMessage = () => {
    switch (type) {
      case 'prompt':
        return `The AI prompt blueprint with the identifier "${slug}" could not be found. It may have been renamed, moved, or deleted.`;
      case 'skill':
        return `The developer skill blueprint "${slug}" is not currently available in our library.`;
      case 'video':
        return `The viral video concept blueprint "${slug}" was not found.`;
      case 'blog':
        return `The blog article "${slug}" could not be retrieved.`;
      default:
        return 'The requested page or route does not exist on this site.';
    }
  };

  const getBackLabel = () => {
    switch (type) {
      case 'prompt':
        return 'Back to Prompts';
      case 'skill':
        return 'Back to Skills';
      case 'video':
        return 'Back to Videos';
      case 'blog':
        return 'Back to Blogs';
      default:
        return 'Go back home';
    }
  };

  const handleBackNavigation = () => {
    if (type === 'prompt') navigateTo('prompts');
    else if (type === 'skill') navigateTo('skills');
    else if (type === 'video') navigateTo('videos');
    else if (type === 'blog') navigateTo('blog');
    else navigateTo('home');
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-6 border border-rose-100">
        <AlertCircle className="h-6 w-6" />
      </div>
      
      <span className="text-[11px] font-black uppercase tracking-widest text-rose-500 block mb-2">
        404 Resource Not Found
      </span>
      
      <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-4">
        Looking for something?
      </h1>
      
      <p className="text-sm text-slate-500 leading-relaxed mb-8">
        {getErrorMessage()}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={handleBackNavigation}
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{getBackLabel()}</span>
        </button>

        <button
          onClick={() => navigateTo('home')}
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <HomeIcon className="h-4 w-4" />
          <span>Go to Home</span>
        </button>
      </div>
    </div>
  );
};
