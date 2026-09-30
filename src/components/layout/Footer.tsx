import React from 'react';
import { useApp } from '../../context/AppContext';
import { getLocalizedCategoryTitle } from '../../lib/i18n';
import { BrandColumn } from './footer/BrandColumn';
import { FooterLinkColumn, FooterLink } from './footer/FooterLinkColumn';
import { NewsletterColumn } from './footer/NewsletterColumn';
import { FooterBottomBar } from './footer/FooterBottomBar';

export const Footer: React.FC = () => {
  const { t, currentLang } = useApp();

  // Navigation Links configuration
  const hubLinks: FooterLink[] = [
    { label: t('navPrompts', 'Prompts'), href: '/prompts' },
    { label: t('navSkills', 'Skills'), href: '/skills' },
    { label: t('navVideos', 'Video Blueprints'), href: '/videos' },
    { label: t('navBlog', 'Blog'), href: '/blog' }
  ];

  const nicheLinks: FooterLink[] = [
    { label: getLocalizedCategoryTitle('architecture', currentLang), href: '/categories/prompt/architecture' },
    { label: getLocalizedCategoryTitle('fantasy', currentLang), href: '/categories/prompt/fantasy' },
    { label: getLocalizedCategoryTitle('coding', currentLang), href: '/categories/skill/coding' },
    { label: getLocalizedCategoryTitle('seo-strategy', currentLang), href: '/categories/skill/seo-strategy' },
    { label: getLocalizedCategoryTitle('faceless', currentLang), href: '/categories/video/faceless-video' }
  ];

  const perksLinks: FooterLink[] = [
    { label: t('myCollectionTitle', 'Collections'), href: '/collections' },
    { label: t('downloadBlueprint', 'Submit Blueprint'), href: '/contact', variant: 'cta' },
    { label: t('navSavedCollection', 'Saved Prompts'), href: '/account/bookmarks' }
  ];

  const dirTitle = t('footerDirectories', 'HUB DIRECTORIES');
  const nicheTitle = t('footerPopularNiches', 'POPULAR NICHES');
  const perksTitle = t('footerCreatorPerks', 'CREATOR PERKS');

  return (
    <footer className="mt-auto border-t border-slate-200 bg-[#fdfdfd] py-12" id="main-footer">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Responsive Grid Structure per Breakpoints */}
        
        {/* 1. LG+ Breakpoint (Full 5-column layout) */}
        <div className="hidden lg:grid grid-cols-[1.6fr_1fr_1fr_1fr_1.4fr] gap-10">
          <BrandColumn />
          <FooterLinkColumn title={dirTitle} links={hubLinks} />
          <FooterLinkColumn title={nicheTitle} links={nicheLinks} />
          <FooterLinkColumn title={perksTitle} links={perksLinks} />
          <NewsletterColumn />
        </div>

        {/* 2. MD Breakpoint (2-column layout: Brand+Newsletter stacked, links sub-grid) */}
        <div className="hidden md:grid lg:hidden grid-cols-2 gap-10">
          <div className="space-y-10">
            <BrandColumn />
            <NewsletterColumn />
          </div>
          <div className="grid grid-cols-3 gap-6">
            <FooterLinkColumn title={dirTitle} links={hubLinks} />
            <FooterLinkColumn title={nicheTitle} links={nicheLinks} />
            <FooterLinkColumn title={perksTitle} links={perksLinks} />
          </div>
        </div>

        {/* 3. XS-SM Breakpoint (Single stacked column with newsletter promoted higher) */}
        <div className="grid grid-cols-1 gap-10 md:hidden">
          <BrandColumn />
          <NewsletterColumn />
          
          <div className="pt-2">
            <FooterLinkColumn title={dirTitle} links={hubLinks} />
          </div>
          <div className="pt-2">
            <FooterLinkColumn title={nicheTitle} links={nicheLinks} />
          </div>
          <div className="pt-2">
            <FooterLinkColumn title={perksTitle} links={perksLinks} />
          </div>
        </div>

        {/* Unified Bottom Bar */}
        <FooterBottomBar />

      </div>
    </footer>
  );
};
