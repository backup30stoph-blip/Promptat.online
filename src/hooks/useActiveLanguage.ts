import { useState, useEffect } from 'react';
import { parseLanguagePath, LanguageCode } from '../lib/i18n';

/**
 * useActiveLanguage hook:
 * Extracts and provides the current language code directly from the current URL path,
 * reactive to any history push/pop state navigations.
 */
export function useActiveLanguage(): LanguageCode {
  const getUrlLang = (): LanguageCode => {
    if (typeof window !== 'undefined') {
      const parsed = parseLanguagePath(window.location.pathname);
      return parsed.lang;
    }
    return 'ar';
  };

  const [lang, setLang] = useState<LanguageCode>(getUrlLang());

  useEffect(() => {
    const handleLocationChange = () => {
      setLang(getUrlLang());
    };

    window.addEventListener('popstate', handleLocationChange);
    
    // Intercept client-side navigation changes to update language reactively
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      originalPushState.apply(this, args);
      handleLocationChange();
    };

    window.history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  return lang;
}
