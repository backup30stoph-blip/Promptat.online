import React from 'react';
import { LanguageSelector, LanguageSelectorProps } from '../LanguageSelector';
import { LanguageCode } from '../../lib/i18n';

export interface LanguageSwitcherProps {
  currentLang?: LanguageCode;
  onLanguageChange?: (lang: LanguageCode) => void;
  className?: string;
  variant?: 'navbar' | 'footer' | 'compact' | 'floating' | 'card' | 'dropdown';
  showLabel?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = (props) => {
  return <LanguageSelector {...props} />;
};

export { LanguageSelector };
export default LanguageSelector;
