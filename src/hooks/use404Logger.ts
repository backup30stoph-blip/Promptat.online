import { useEffect, useRef } from 'react';
import { cmsService } from '../services/cmsService';

/**
 * Hook to log invalid/missing content paths to Supabase tracking tables.
 * Triggers record creation when a component determines a resource/route is invalid.
 */
export function use404Logger(isInvalid: boolean, path: string, type: string = 'general') {
  // Use a ref to prevent double logging within the same component mount lifecycle
  const loggedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isInvalid || !path) return;
    
    // Skip if we already logged this exact path in this render cycle
    if (loggedRef.current === path) return;

    const record404 = async () => {
      loggedRef.current = path;
      const referrer = document.referrer || window.location.href;
      const userAgent = navigator.userAgent;

      try {
        console.log(`[use404Logger] Missing content tracked: ${path} [Type: ${type}]`);
        await cmsService.log404(path, referrer, userAgent);
      } catch (err) {
        console.error('[use404Logger] Failed logging missing content:', err);
      }
    };

    record404();
  }, [isInvalid, path, type]);
}
