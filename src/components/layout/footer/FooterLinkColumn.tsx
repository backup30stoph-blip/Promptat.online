import React from 'react';
import { useApp } from '../../../context/AppContext';

export interface FooterLink {
  label: string;
  href: string;
  variant?: 'default' | 'cta';
}

export interface FooterLinkColumnProps {
  title: string;
  links: FooterLink[];
}

export const FooterLinkColumn: React.FC<FooterLinkColumnProps> = ({ title, links }) => {
  const { navigateTo, setSearchQuery, showNotification } = useApp();

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, link: FooterLink) => {
    // Intercept clicks for internal SPA navigation
    if (link.href.startsWith('/')) {
      e.preventDefault();
      
      const path = link.href;

      if (path === '/prompts') {
        setSearchQuery('');
        navigateTo('prompts');
      } else if (path === '/skills') {
        setSearchQuery('');
        navigateTo('skills');
      } else if (path === '/videos') {
        setSearchQuery('');
        navigateTo('videos');
      } else if (path === '/blog') {
        navigateTo('blog');
      } else if (path === '/collections') {
        setSearchQuery('');
        navigateTo('prompts');
      } else if (path === '/account/bookmarks') {
        showNotification('Bookmarks can be viewed on the navbar indicators or prompt cards.', 'info');
      } else if (path === '/contact') {
        showNotification('Submit Blueprint flow is coming soon as a pro creator portal! (Known Gap)', 'info');
      } else if (path.startsWith('/categories/')) {
        const parts = path.split('/');
        const type = parts[2]; // 'prompt' or 'skill' or 'video'
        const slug = parts[3]; // 'architecture', 'fantasy', 'coding', 'seo-strategy', 'faceless-video'
        
        let displayTitle = '';
        if (slug === 'architecture') displayTitle = 'Architecture';
        else if (slug === 'fantasy') displayTitle = 'Fantasy';
        else if (slug === 'coding') displayTitle = 'Coding';
        else if (slug === 'seo-strategy') displayTitle = 'SEO Strategy';
        else if (slug === 'faceless-video') displayTitle = 'Faceless Video';

        setSearchQuery(displayTitle);

        if (type === 'prompt') {
          navigateTo('prompts');
        } else if (type === 'skill') {
          navigateTo('skills');
        } else if (type === 'video') {
          navigateTo('videos');
        }
      } else {
        // Fallback for static routes
        window.location.href = path;
      }
    }
  };

  return (
    <div className="flex flex-col space-y-3">
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#7C8798] select-none">
        {title}
      </h3>
      <ul className="space-y-2.5">
        {links.map((link, idx) => {
          const isCta = link.variant === 'cta';
          return (
            <li key={idx}>
              <a
                href={link.href}
                onClick={(e) => handleLinkClick(e, link)}
                className={`text-sm transition-colors duration-150 block ${
                  isCta 
                    ? 'text-[#E4433C] hover:text-[#c21124] font-semibold' 
                    : 'text-[#1E293B] hover:text-[#E4433C]'
                }`}
                aria-label={link.label}
              >
                {link.label}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
