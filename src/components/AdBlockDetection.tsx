import React, { useState, useEffect } from 'react';
import { ShieldAlert, Heart, X } from 'lucide-react';
import { supabase } from '../services/supabase/client';

export const AdBlockDetection: React.FC = () => {
  const [isAdBlockEnabled, setIsAdBlockEnabled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [adsenseEnabled, setAdsenseEnabled] = useState(false);

  useEffect(() => {
    // Check if adsense is globally enabled
    supabase
      .from('site_settings')
      .select('adsense_enabled')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.adsense_enabled) {
          setAdsenseEnabled(true);
        }
      });
  }, []);

  useEffect(() => {
    if (!adsenseEnabled) return;

    // Check if adblock is enabled by attempting to load a script or check for window.adsbygoogle
    const checkAdBlock = () => {
      // 1. Check if the ad script is blocked from loading
      if (typeof window !== 'undefined') {
        const hasAdsByGoogle = (window as any).adsbygoogle !== undefined;
        
        // 2. Try injecting a bait element
        const bait = document.createElement('div');
        bait.innerHTML = '&nbsp;';
        bait.className = 'adsbox';
        bait.style.position = 'absolute';
        bait.style.top = '-9999px';
        document.body.appendChild(bait);

        setTimeout(() => {
          if (bait.offsetHeight === 0 || !hasAdsByGoogle) {
            setIsAdBlockEnabled(true);
          }
          document.body.removeChild(bait);
        }, 1500); // Wait a bit for the script to load
      }
    };

    // Delay check to let scripts load
    const timeout = setTimeout(checkAdBlock, 3000);
    return () => clearTimeout(timeout);
  }, [adsenseEnabled]);

  if (!isAdBlockEnabled || dismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] max-w-sm w-full animate-slide-up">
      <div className="bg-slate-900 rounded-2xl shadow-2xl p-5 border border-slate-800 text-slate-300 relative overflow-hidden">
        
        <div className="absolute -top-10 -right-10 text-slate-800 opacity-20 pointer-events-none">
          <Heart className="w-32 h-32" />
        </div>

        <button 
          onClick={() => setDismissed(true)}
          className="absolute top-3 right-3 text-slate-500 hover:text-white transition-colors"
          title="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4 relative z-10">
          <div className="bg-slate-800 p-2.5 rounded-xl shrink-0 mt-0.5">
            <ShieldAlert className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-1">It looks like you're using an ad blocker</h4>
            <p className="text-xs leading-relaxed text-slate-400 mb-4">
              We rely on ads to keep our tools free and maintain our servers. Please consider supporting us by disabling your ad blocker or adding this site to your whitelist.
            </p>
            <button 
              onClick={() => setDismissed(true)}
              className="text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors w-full"
            >
              I've disabled it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
