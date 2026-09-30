import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUPPORTED_LANGUAGES, LanguageCode } from '../lib/i18n';

export interface LanguageSelectorProps {
  currentLang?: LanguageCode;
  onLanguageChange?: (lang: LanguageCode) => void;
  className?: string;
  variant?: 'navbar' | 'footer' | 'compact' | 'floating' | 'card' | 'dropdown';
  showLabel?: boolean;
}

/**
 * Persistent Language Selector component that enables users to manually
 * select from all supported locales, updating global state in AppContext.
 */
export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLang: propCurrentLang,
  onLanguageChange: propOnLanguageChange,
  className = '',
  variant = 'navbar',
  showLabel = false,
}) => {
  const appContext = useApp();
  const currentLang = propCurrentLang || appContext.currentLang;
  const onLanguageChange = propOnLanguageChange || appContext.switchLanguage;

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelect = (lang: LanguageCode) => {
    onLanguageChange(lang);
    setIsOpen(false);
  };

  const activeConfig = SUPPORTED_LANGUAGES[currentLang] || SUPPORTED_LANGUAGES.ar;

  // Render variant styles
  const getButtonClasses = () => {
    switch (variant) {
      case 'footer':
        return 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 px-3 py-2 text-xs shadow-sm';
      case 'compact':
        return 'p-2 text-slate-700 hover:bg-slate-100 rounded-lg text-xs border border-slate-200';
      case 'floating':
        return 'bg-white text-slate-800 hover:bg-slate-50 border border-slate-200/80 px-3.5 py-2 text-xs shadow-lg backdrop-blur-md';
      case 'card':
        return 'w-full justify-between bg-white text-slate-800 hover:bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs shadow-sm';
      case 'dropdown':
        return 'w-full justify-between bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 px-3 py-2 text-xs';
      case 'navbar':
      default:
        return 'bg-white/10 text-white hover:bg-white/20 border border-white/20 px-3 py-1.5 text-xs shadow-sm';
    }
  };

  return (
    <div 
      className={`relative inline-block text-left ${variant === 'card' ? 'w-full' : ''} ${className}`} 
      ref={dropdownRef}
      id="persistent-language-selector"
    >
      {showLabel && (
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          {appContext.t('selectLanguage', 'Select Language / اختر اللغة')}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-xl transition-all cursor-pointer font-semibold select-none ${getButtonClasses()}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Current language: ${activeConfig.nativeName}. Click to change language.`}
      >
        <Globe className={`h-4 w-4 shrink-0 ${variant === 'navbar' ? 'text-white/80' : 'text-slate-500'}`} />
        <span className="font-bold flex items-center gap-1.5">
          <span className="text-sm leading-none">{activeConfig.flag}</span>
          <span>{activeConfig.nativeName}</span>
        </span>
        <ChevronDown className={`h-3.5 w-3.5 opacity-70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className={`absolute ${variant === 'footer' ? 'bottom-full mb-2' : 'top-full mt-2'} ${appContext.isRtl ? 'left-0' : 'right-0'} w-56 rounded-2xl border border-slate-200 bg-white shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-1 py-1`}
          role="listbox"
          aria-label="Supported Languages"
        >
          <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-500">
            <span>Choose Language</span>
            <span className="text-slate-400 font-normal">5 Locales</span>
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
            {Object.values(SUPPORTED_LANGUAGES).map((lang) => {
              const isSelected = lang.code === currentLang;
              return (
                <button
                  key={lang.code}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-left rtl:text-right transition-colors cursor-pointer ${
                    isSelected 
                      ? 'bg-red-50/70 text-[#e21833] font-black' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg leading-none" role="img" aria-label={lang.name}>
                      {lang.flag}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900 leading-tight">
                        {lang.nativeName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium leading-tight">
                        {lang.name} {lang.dir === 'rtl' ? '• RTL' : ''}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-[#e21833]">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
