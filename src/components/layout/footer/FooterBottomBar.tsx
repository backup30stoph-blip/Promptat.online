import React from 'react';
import { useApp } from '../../../context/AppContext';
import { LanguageSwitcher } from '../LanguageSwitcher';

export const FooterBottomBar: React.FC = () => {
  const { showNotification, currentLang, switchLanguage, t } = useApp();
  const year = new Date().getFullYear();

  const handleLegalClick = (e: React.MouseEvent<HTMLAnchorElement>, label: string) => {
    // Intercept with a polite notification for static policies, or allow default anchor routing
    e.preventDefault();
    showNotification(`${label} document is available and fully editable inside the Admin Panel static pages section.`, 'info');
  };

  return (
    <div className="w-full">
      {/* Thin top divider */}
      <hr className="border-slate-200 mt-10 mb-8" />
      
      {/* Copyright and Legal Links Row */}
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row text-xs text-[#64748B]">
        <div id="footer-copyright" className="select-none text-center sm:text-left rtl:sm:text-right">
          © {year} Promptat.online — {t('footerCopyright', 'جميع الحقوق محفوظة.')}
        </div>

        {/* Language Switcher in Footer */}
        <div>
          <LanguageSwitcher currentLang={currentLang} onLanguageChange={switchLanguage} variant="footer" />
        </div>
        
        {/* Policy Links */}
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <a 
            href="/privacy-policy" 
            onClick={(e) => handleLegalClick(e, t('footerPrivacy', 'Privacy Policy'))}
            className="hover:text-[#E4433C] transition-colors"
            id="footer-privacy-link"
            aria-label={t('footerPrivacy', 'Privacy Policy')}
          >
            {t('footerPrivacy', 'Privacy')}
          </a>
          <span className="select-none text-slate-300">·</span>
          <a 
            href="/terms-conditions" 
            onClick={(e) => handleLegalClick(e, t('footerTerms', 'Terms & Conditions'))}
            className="hover:text-[#E4433C] transition-colors"
            id="footer-terms-link"
            aria-label={t('footerTerms', 'Terms & Conditions')}
          >
            {t('footerTerms', 'Terms')}
          </a>
          <span className="select-none text-slate-300">·</span>
          <a 
            href="/sitemap.xml" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-[#E4433C] transition-colors"
            id="footer-sitemap-link"
            aria-label={t('footerSitemap', 'Sitemap Feed XML')}
          >
            {t('footerSitemap', 'Sitemap')}
          </a>
        </div>
      </div>
    </div>
  );
};
