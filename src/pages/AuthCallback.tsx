import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../services/supabase/client';
import { Loader2 } from 'lucide-react';

export const AuthCallback: React.FC = () => {
  const { refreshData, navigateTo, showNotification } = useApp();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Wait for session to resolve
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session) {
          showNotification('Successfully authenticated!', 'success');
          // Refresh global user state
          await refreshData();
          
          // Redirect to return-to path, or default to account-settings
          const returnTo = localStorage.getItem('auth_return_to') || 'account';
          localStorage.removeItem('auth_return_to');
          navigateTo(returnTo);
        } else {
          // Fallback or retry after a short delay
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            showNotification('Successfully authenticated!', 'success');
            await refreshData();
            const returnTo = localStorage.getItem('auth_return_to') || 'account';
            localStorage.removeItem('auth_return_to');
            navigateTo(returnTo);
          } else {
            // Wait 1.5 seconds in case of slow redirect resolution
            setTimeout(async () => {
              const { data: { session: retrySession } } = await supabase.auth.getSession();
              if (retrySession) {
                showNotification('Successfully authenticated!', 'success');
                await refreshData();
                const returnTo = localStorage.getItem('auth_return_to') || 'account';
                localStorage.removeItem('auth_return_to');
                navigateTo(returnTo);
              } else {
                showNotification('Could not resolve session. Please log in.', 'error');
                navigateTo('login');
              }
            }, 1500);
          }
        }
      } catch (err: any) {
        console.error('[AuthCallback] Error in callback:', err);
        showNotification(err.message || 'Authentication error', 'error');
        navigateTo('login');
      }
    };

    handleAuthCallback();
  }, [refreshData, navigateTo, showNotification]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-4">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
        <h2 className="font-display text-xl font-bold text-slate-900">Completing Secure Handshake</h2>
        <p className="text-xs text-slate-500">
          Syncing with authorization providers and validating secure credentials. Please do not close this window.
        </p>
      </div>
    </div>
  );
};
