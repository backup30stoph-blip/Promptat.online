import React, { useState } from 'react';
import { Languages, X, ArrowRight } from 'lucide-react';
import { SUPPORTED_LANGUAGES, LanguageCode, t } from '../../lib/i18n';

interface TranslationAvailableBannerProps {
  currentLang: LanguageCode;
  suggestedLang: LanguageCode;
  onSwitchLanguage: (lang: LanguageCode) => void;
}

export const TranslationAvailableBanner: React.FC<TranslationAvailableBannerProps> = ({
  currentLang,
  suggestedLang,
  onSwitchLanguage
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || currentLang === suggestedLang) return null;

  const targetConfig = SUPPORTED_LANGUAGES[suggestedLang];
  if (!targetConfig) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white px-4 py-2.5 shadow-md flex items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2.5 font-medium truncate">
        <Languages className="h-4 w-4 text-indigo-400 shrink-0" />
        <span className="truncate">
          {t('translationAvailableIn', currentLang, 'This page is also available in')}{' '}
          <strong className="text-indigo-200 font-bold">{targetConfig.nativeName} ({targetConfig.name})</strong>.
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onSwitchLanguage(suggestedLang)}
          className="flex items-center gap-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1 text-xs shadow-sm transition-all cursor-pointer"
        >
          <span>{t('switchTo', currentLang, 'Switch to')} {targetConfig.nativeName}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer"
          title={t('dismiss', currentLang, 'Dismiss notification')}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
