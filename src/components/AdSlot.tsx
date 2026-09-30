import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../services/supabase/client';
import { AdSlot as AdSlotType } from '../types';
import { Activity, XCircle, CheckCircle, Clock } from 'lucide-react';

interface AdSlotProps {
  placement: string;
  pageType?: string;
  className?: string;
}

function useSiteAdSettings() {
  const [settings, setSettings] = useState<any>(null);
  useEffect(() => {
    supabase
      .from('site_settings')
      .select('adsense_enabled, adsense_consent_required, adsense_publisher_id')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setSettings(data));
  }, []);
  return { data: settings };
}

function useAdSlots(placement: string, pageType: string = 'home') {
  const [slots, setSlots] = useState<AdSlotType[]>([]);
  useEffect(() => {
    supabase
      .from('ad_slots')
      .select('*')
      .eq('placement', placement)
      .eq('is_active', true)
      .order('position_index', { ascending: true })
      .then(({ data }) => {
        if (data) {
          setSlots(data.filter(s => s.page_types.includes('all') || s.page_types.includes(pageType)));
        }
      });
  }, [placement, pageType]);
  return { data: slots };
}

function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<string>('lg');
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      if (w < 640) setBreakpoint('xs');
      else if (w < 768) setBreakpoint('sm');
      else if (w < 1024) setBreakpoint('md');
      else if (w < 1280) setBreakpoint('lg');
      else setBreakpoint('xl');
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return breakpoint;
}

// Simple cookie-based consent for demonstration. In reality, you'd integrate with Funding Choices or a CMP.
function useAdConsent() {
  const [hasConsent, setHasConsent] = useState(false);
  useEffect(() => {
    // Check if consent cookie exists or rely on Google CMP
    const consentGiven = document.cookie.includes('ad_consent=true');
    setHasConsent(consentGiven);
  }, []);
  return hasConsent;
}

// Enforce max 3 active ad slots
let renderedAdsCount = 0;

export const AdSlot: React.FC<AdSlotProps> = ({ placement, pageType = 'home', className = '' }) => {
  const { data: slots } = useAdSlots(placement, pageType);
  const { data: settings } = useSiteAdSettings();
  const hasConsent = useAdConsent();
  const breakpoint = useBreakpoint();
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [adStatus, setAdStatus] = useState<'waiting' | 'rendered' | 'blocked'>('waiting');

  useEffect(() => {
    setDebugMode(localStorage.getItem('adsense_debug_mode') === 'true');
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoad || !slots || slots.length === 0) return;
    const slot = slots[0];
    if (slot.raw_snippet) {
      setAdLoaded(true);
      setAdStatus('rendered');
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    // Track views
    const trackView = async () => {
      try {
        const { data } = await supabase.rpc('increment_ad_slot_metric', { slot_id: slot.id, metric_name: 'views' });
        if (data === null || data === undefined) {
          // Fallback if rpc is not created yet
          await supabase.from('ad_slots').update({ views: (slot.views || 0) + 1 }).eq('id', slot.id);
        }
      } catch (err) {
        console.warn('Could not track view:', err);
      }
    };

    const observer = new MutationObserver(() => {
      const ins = container.querySelector('ins.adsbygoogle');
      if (ins) {
        const status = ins.getAttribute('data-adsbygoogle-status');
        const ad_status = ins.getAttribute('data-ad-status');
        if (status === 'done' || ad_status === 'unfilled') {
          setAdLoaded(true);
          setAdStatus(ad_status === 'unfilled' ? 'blocked' : 'rendered');
          observer.disconnect();
          if (ad_status !== 'unfilled') trackView();
        }
      } else if (container.querySelector('iframe')) {
        setAdLoaded(true);
        setAdStatus('rendered');
        observer.disconnect();
        trackView();
      }
    });

    observer.observe(container, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-adsbygoogle-status', 'data-ad-status'] });

    // Track clicks using window blur
    const handleBlur = async () => {
      if (document.activeElement && container.contains(document.activeElement)) {
        try {
          await supabase.rpc('increment_ad_slot_metric', { slot_id: slot.id, metric_name: 'clicks' });
        } catch (err) {
          // Fallback
          await supabase.from('ad_slots').update({ clicks: (slot.clicks || 0) + 1 }).eq('id', slot.id);
        }
      }
    };
    window.addEventListener('blur', handleBlur);

    // Fallback in case observer fails to catch it or ads are blocked
    const fallbackTimeout = setTimeout(() => {
      if (!adLoaded) {
        setAdLoaded(true);
        setAdStatus('blocked');
      }
    }, 5000);

    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimeout);
      window.removeEventListener('blur', handleBlur);
    };
  }, [shouldLoad, slots, adLoaded]);

  useEffect(() => {
    if (shouldLoad && slots && slots.length > 0 && settings?.adsense_enabled && (!settings?.adsense_consent_required || hasConsent)) {
      if (renderedAdsCount >= 3) return; // Cap at 3 ads per page view
      
      const slot = slots[0];
      if (!slot.raw_snippet) {
        try {
          (window as any).adsbygoogle = (window as any).adsbygoogle || [];
          (window as any).adsbygoogle.push({});
          renderedAdsCount++;
        } catch (e) {
          console.error('AdSense push error:', e);
        }
      }
    }
  }, [shouldLoad, slots, settings, hasConsent]);

  // Reset count on navigation (in a real SPA you might bind this to a router event, 
  // but for simplicity we rely on the component mount logic, though this could overcount over time without reset).
  useEffect(() => {
    return () => {
      // Cleanup logic if needed
    };
  }, []);

  if (!settings?.adsense_enabled) return null;
  if (settings.adsense_consent_required && !hasConsent) return null;
  if (!slots?.length) return null;

  const slot = slots[0];
  if (
    (breakpoint === "xs" || breakpoint === "sm") && !slot.mobile_enabled ||
    breakpoint === "md" && !slot.tablet_enabled ||
    (breakpoint === "lg" || breakpoint === "xl") && !slot.desktop_enabled
  ) return null;

  // Max 3 ads cap (check before rendering)
  if (renderedAdsCount >= 3) return null;

  const fixedSize = slot.format === "fixed"
    ? slot.fixed_sizes?.[breakpoint === "xs" || breakpoint === "sm" ? "mobile" : breakpoint === "md" ? "tablet" : "desktop"]
    : null;

  return (
    <div
      ref={containerRef}
      className={`ad-slot-container my-4 relative rounded-xl overflow-hidden flex flex-col items-center justify-center bg-slate-50/50 border border-slate-100 ${className}`}
      style={fixedSize ? { minHeight: fixedSize.height, width: "100%" } : { minHeight: 250, width: "100%" }}
      data-ad-placement={placement}
    >
      {!adLoaded && !slot.raw_snippet && (
        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center space-y-3 bg-slate-50 text-slate-400 p-4">
          <div className="flex items-center space-x-2 opacity-50">
            <span className="h-4 w-4 rounded-full border-2 border-slate-300 border-t-slate-400 animate-spin" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Advertisement</span>
          </div>
          <div className="w-full max-w-[200px] h-2 rounded-full bg-slate-200/50 animate-pulse" />
          <div className="w-2/3 max-w-[200px] h-2 rounded-full bg-slate-200/50 animate-pulse" />
        </div>
      )}

      {debugMode && (
        <div className="absolute top-2 left-2 z-50 rounded bg-slate-900/90 text-white text-[10px] font-mono p-2 shadow-lg max-w-[200px] border border-slate-700/50 backdrop-blur-md">
          <div className="flex items-center gap-1.5 mb-1 text-slate-300 font-bold uppercase tracking-wider">
            <Activity className="h-3 w-3 text-indigo-400" />
            AdSlot Debug
          </div>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Status:</span>
              <span className={`font-bold ${adStatus === 'waiting' ? 'text-amber-400' : adStatus === 'rendered' ? 'text-emerald-400' : 'text-red-400'} flex items-center gap-1`}>
                {adStatus === 'waiting' && <Clock className="h-2.5 w-2.5" />}
                {adStatus === 'rendered' && <CheckCircle className="h-2.5 w-2.5" />}
                {adStatus === 'blocked' && <XCircle className="h-2.5 w-2.5" />}
                {adStatus}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">ID:</span>
              <span className="truncate">{slot.id.substring(0, 8)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Format:</span>
              <span>{slot.format}</span>
            </div>
          </div>
        </div>
      )}

      {shouldLoad && (
        <div className={`w-full z-10 transition-opacity duration-700 relative ${adLoaded || slot.raw_snippet ? 'opacity-100' : 'opacity-0'}`}>
          {slot.raw_snippet ? (
            <div dangerouslySetInnerHTML={{ __html: slot.raw_snippet }} />
          ) : (
            <ins
              className="adsbygoogle"
              style={{ display: "block", ...(fixedSize ? { width: fixedSize.width, height: fixedSize.height, margin: '0 auto' } : {}) }}
              data-ad-client={slot.ad_client}
              data-ad-slot={slot.ad_slot_id}
              data-ad-format={slot.format === "fixed" ? undefined : slot.format}
              data-full-width-responsive={slot.full_width_responsive ? "true" : undefined}
            />
          )}
        </div>
      )}
    </div>
  );
};
