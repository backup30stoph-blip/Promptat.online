import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown, X } from 'lucide-react';
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
 * Persistent Language Selector component with collision-safe positioning
 * and mobile bottom sheet support.
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

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (lang: LanguageCode) => {
    onLanguageChange(lang);
    setIsOpen(false);
  };

  const activeConfig = SUPPORTED_LANGUAGES[currentLang] || SUPPORTED_LANGUAGES.ar;

  // Render button styles per variant
  const getButtonClasses = () => {
    switch (variant) {
      case 'footer':
        return 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 px-3 py-2 text-xs shadow-sm';
      case 'compact':
        return 'p-2 text-slate-700 hover:bg-slate-100 rounded-xl text-xs border border-slate-200';
      case 'floating':
        return 'bg-white text-slate-800 hover:bg-slate-50 border border-slate-200/80 px-3.5 py-2 text-xs shadow-lg backdrop-blur-md';
      case 'card':
        return 'w-full justify-between bg-white text-slate-800 hover:bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs shadow-sm';
      case 'dropdown':
        return 'w-full justify-between bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 px-3 py-2 text-xs';
      case 'navbar':
      default:
        return 'bg-white/10 text-white hover:bg-white/20 border border-white/20 px-2.5 py-1.5 text-xs shadow-sm';
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
        className={`flex items-center gap-1.5 rounded-xl transition-all cursor-pointer font-semibold select-none ${getButtonClasses()}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Language: ${activeConfig.nativeName}`}
      >
        <Globe className={`h-4 w-4 shrink-0 ${variant === 'navbar' ? 'text-white/90' : 'text-slate-500'}`} />
        <span className="font-bold uppercase tracking-wider text-xs">
          {activeConfig.code}
        </span>
        <ChevronDown className={`h-3 w-3 opacity-70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* MOBILE BOTTOM SHEET FOR NAVBAR (<640px) */}
          {variant === 'navbar' && (
            <div className="sm:hidden fixed inset-0 z-[70]" role="dialog" aria-modal="true">
              <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl p-4 text-slate-800 pb-[max(1.25rem,env(safe-area-inset-bottom))] animate-in slide-in-from-bottom duration-200">
                <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-slate-300" />
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-[#e21833]" />
                    <span>اختر اللغة / Select Language</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {Object.values(SUPPORTED_LANGUAGES).map((lang) => {
                    const isSelected = lang.code === currentLang;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleSelect(lang.code)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-colors ${
                          isSelected ? 'bg-red-50 text-[#e21833]' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl leading-none">{lang.flag}</span>
                          <div className="text-start">
                            <p className="font-bold text-slate-900">{lang.nativeName}</p>
                            <p className="text-[10px] text-slate-400 font-normal">{lang.name}</p>
                          </div>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-[#e21833]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* DESKTOP POPOVER (>=640px OR FOOTER) */}
          {/* Collision-safe positioning */}
          <div 
            className={`${variant === 'navbar' ? 'hidden sm:block' : ''} absolute ${
              variant === 'footer' ? 'bottom-full mb-2' : 'top-full mt-2'
            } ${
              appContext.isRtl ? 'left-0 right-auto' : 'right-0 left-auto'
            } w-[min(16rem,calc(100vw-24px))] rounded-2xl border border-slate-200 bg-white shadow-2xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-1 py-1`}
            role="listbox"
            aria-label="Supported Languages"
          >
            <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-500">
              <span>Select Language</span>
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
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-start transition-colors cursor-pointer ${
                      isSelected 
                        ? 'bg-red-50 text-[#e21833] font-black' 
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base leading-none" role="img" aria-label={lang.name}>
                        {lang.flag}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900 leading-tight">
                          {lang.nativeName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium leading-tight">
                          {lang.name}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-[#e21833]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;
