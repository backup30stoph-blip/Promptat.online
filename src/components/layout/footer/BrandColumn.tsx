import React from 'react';
import { Sparkles, Github, Rss } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const BrandColumn: React.FC = () => {
  const { t } = useApp();

  return (
    <div className="flex flex-col space-y-4">
      {/* Brand Logo & Wordmark */}
      <a 
        href="/" 
        className="inline-flex items-center space-x-2 rtl:space-x-reverse w-max"
        aria-label="Promptat Online Home"
      >
        <div 
          className="flex h-[30px] w-[30px] items-center justify-center rounded-md bg-[#E4433C] text-white"
          id="footer-logo-mark"
        >
          <Sparkles className="h-4.5 w-4.5" />
        </div>
        <span 
          className="font-sans text-lg font-bold tracking-tight text-[#0F172A]"
          id="footer-wordmark"
        >
          Promptat<span className="text-[#E4433C]">.online</span>
        </span>
      </a>

      {/* Tagline */}
      <p className="text-sm leading-relaxed text-[#64748B] max-w-sm md:max-w-none">
        {t('footerTagline', 'The premier AI Creator Hub. Reimagining prompt libraries as integrated systems: linking high-fidelity image prompts, downloadable developer skills, viral video blueprints, and complete SEO frameworks.')}
      </p>

      {/* Social and Feed Links */}
      <div className="flex items-center space-x-3 rtl:space-x-reverse pt-1">
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="rounded-lg p-2 text-[#94A3B8] hover:bg-slate-50 hover:text-[#1E293B] transition-colors"
          aria-label="GitHub Profile"
          id="footer-github-link"
        >
          <Github className="h-5 w-5" />
        </a>
        <a 
          href="/rss.xml" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="rounded-lg p-2 text-[#94A3B8] hover:bg-slate-50 hover:text-[#1E293B] transition-colors"
          aria-label="RSS Blog Feed"
          id="footer-rss-link"
        >
          <Rss className="h-5 w-5" />
        </a>
      </div>
    </div>
  );
};
