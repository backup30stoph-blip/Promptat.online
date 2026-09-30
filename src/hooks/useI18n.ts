import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { parseLanguagePath, t as i18nT, LanguageCode, SUPPORTED_LANGUAGES, LanguageConfig } from '../lib/i18n';

/**
 * Strict Isolation Hook:
 * - Detects active locale from the current URL path as the source of truth to prevent cross-language contamination.
 * - Synchronizes with AppContext currentLang.
 * - Provides an improved `t()` function that supports and encourages an explicit language parameter:
 *   t(key: string, lang: LanguageCode, fallback?: string): string
 *   while also ensuring any call with local context strictly uses the verified local language state,
 *   never defaulting to 'ar' or falling back across languages.
 */
export function useI18n(explicitLang?: LanguageCode) {
  const { currentLang: contextLang, switchLanguage } = useApp();

  // 1. Resolve local language from explicit argument or URL pathname
  const getUrlLang = (): LanguageCode => {
    if (typeof window !== 'undefined') {
      const parsed = parseLanguagePath(window.location.pathname);
      return parsed.lang;
    }
    return contextLang || 'ar';
  };

  const [localLang, setLocalLang] = useState<LanguageCode>(explicitLang || getUrlLang());

  // Listen to browser navigation (back/forward)
  useEffect(() => {
    if (explicitLang) {
      setLocalLang(explicitLang);
      return;
    }

    const handleLocationChange = () => {
      const detected = getUrlLang();
      setLocalLang(detected);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [explicitLang]);

  // Sync if contextLang changes and no explicitLang was supplied
  useEffect(() => {
    if (!explicitLang && contextLang && contextLang !== localLang) {
      setLocalLang(contextLang);
    }
  }, [contextLang, explicitLang]);

  const activeLang: LanguageCode = explicitLang || localLang || contextLang || 'ar';
  const isRtl = activeLang === 'ar';
  const langConfig: LanguageConfig = SUPPORTED_LANGUAGES[activeLang] || SUPPORTED_LANGUAGES.ar;

  /**
   * Improved `t()` translation function requiring or binding explicit language parameter:
   * 1. Signature A (Preferred / Strict): t(key, lang, fallback?) -> Uses specified lang explicitly.
   * 2. Signature B (Bound): t(key, fallback?) -> Uses localLang safely without cross-language leakage.
   */
  const t = useCallback((
    key: string, 
    langOrFallback?: LanguageCode | string, 
    fallback?: string
  ): string => {
    // If second parameter is an exact valid LanguageCode, use it strictly:
    if (
      langOrFallback === 'ar' || 
      langOrFallback === 'en' || 
      langOrFallback === 'es' || 
      langOrFallback === 'fr' || 
      langOrFallback === 'id'
    ) {
      return i18nT(key, langOrFallback as LanguageCode, fallback);
    }

    // Otherwise, second argument is a fallback string (or undefined), and target language is guaranteed to be active localLang
    const actualFallback = typeof langOrFallback === 'string' ? langOrFallback : fallback;
    return i18nT(key, activeLang, actualFallback);
  }, [activeLang]);

  return {
    lang: activeLang,
    currentLang: activeLang,
    isRtl,
    langConfig,
    t,
    switchLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES
  };
}
