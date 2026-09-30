import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase/client';

export const AdSenseScript: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('adsense_enabled, adsense_consent_required, adsense_publisher_id')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setSettings(data));
  }, []);

  useEffect(() => {
    const consentGiven = document.cookie.includes('ad_consent=true');
    setHasConsent(consentGiven);
  }, []);

  useEffect(() => {
    if (settings?.adsense_enabled && (!settings.adsense_consent_required || hasConsent) && settings.adsense_publisher_id) {
      // Check if script already exists
      if (document.querySelector('script[src*="adsbygoogle.js"]')) return;

      const script = document.createElement('script');
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${settings.adsense_publisher_id}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      
      // Defer loading slightly to allow LCP to render
      const timer = setTimeout(() => {
        document.head.appendChild(script);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [settings, hasConsent]);

  return null;
};
