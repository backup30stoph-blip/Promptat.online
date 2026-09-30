import React, { useState } from 'react';
import { Languages, X, ArrowRight } from 'lucide-react';
import { SUPPORTED_LANGUAGES, LanguageCode, t } from '../../lib/i18n';

interface TranslationAvailableBannerProps {
  currentLang: LanguageCode;
  suggestedLang: LanguageCode;
  onSwitchLanguage: (lang: LanguageCode) => void;
}

export const TranslationAvailableBanner: React.FC<TranslationAvailableBannerProps> = () => {
  return null;
};
