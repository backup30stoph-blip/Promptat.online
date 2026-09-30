import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isAdmin, isAuthLoading, navigateTo, showNotification } = useApp();

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        showNotification('Please authenticate to access the admin system.', 'error');
        navigateTo('login');
      } else if (!isAdmin) {
        showNotification('Access Denied. You do not have administrator permissions.', 'error');
        navigateTo('home');
      }
    }
  }, [user, isAdmin, isAuthLoading, navigateTo, showNotification]);

  if (isAuthLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-red-600" />
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 animate-pulse">
          Validating Security Session...
        </p>
      </div>
    );
  }

  // Double safety guard
  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
        <div className="rounded-full bg-red-100 p-4 text-red-600 mb-4 animate-bounce">
          <ShieldAlert className="h-12 w-12" />
        </div>
        <h2 className="font-display text-xl font-black text-slate-900 leading-tight">
          Secure System Boundary
        </h2>
        <p className="mt-2 text-sm text-slate-500 max-w-sm font-medium">
          Your active session does not possess the credentials required to enter this system corridor.
        </p>
        <button
          onClick={() => navigateTo('login')}
          className="mt-6 rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-all active:scale-95 cursor-pointer shadow-md"
        >
          Authenticate Role
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
