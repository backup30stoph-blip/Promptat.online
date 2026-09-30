import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { supabase } from '../services/supabase/client';

export const ConsentBanner: React.FC = () => {
  const [show, setShow] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('adsense_enabled, adsense_consent_required')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setSettings(data));
  }, []);

  useEffect(() => {
    if (settings?.adsense_enabled && settings?.adsense_consent_required) {
      if (!document.cookie.includes('ad_consent=')) {
        setShow(true);
      }
    }
  }, [settings]);

  const handleConsent = (agreed: boolean) => {
    // Set cookie for 1 year
    document.cookie = `ad_consent=${agreed}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=strict`;
    setShow(false);
    
    if (agreed) {
      // Reload page to allow scripts to mount with new consent if necessary,
      // but React state will pick it up on re-render. Let's just force a reload for safety on ad networks.
      window.location.reload();
    }
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-slate-900 border-t border-slate-800 p-4 shadow-2xl animate-slide-up">
      <div className="mx-auto max-w-7xl px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-slate-800 p-2 hidden sm:block mt-1">
            <Shield className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="text-left text-slate-300 text-xs sm:text-sm leading-relaxed max-w-3xl">
            <strong className="text-white block mb-1">We respect your privacy</strong>
            We use cookies and similar technologies to personalize content, tailor and measure ads, and provide a better experience. 
            By clicking "Accept All", you agree to this as outlined in our Cookie Policy.
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
          <button
            onClick={() => handleConsent(false)}
            className="flex-1 md:flex-none rounded-lg bg-slate-800 px-5 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Reject Non-Essential
          </button>
          <button
            onClick={() => handleConsent(true)}
            className="flex-1 md:flex-none rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
};
