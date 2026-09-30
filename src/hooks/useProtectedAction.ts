import { useApp } from '../context/AppContext';

interface ProtectedActionOptions {
  message?: string;
  type?: 'info' | 'error' | 'success';
}

export function useProtectedAction() {
  const { user, setIsAuthModalOpen, showNotification } = useApp();

  /**
   * Wraps an action and ensures the user is logged in.
   * If logged in, runs the action. If not, opens the global auth modal
   * and displays an optional notice message.
   * 
   * @param action Callback to run if authenticated
   * @param options Customize the authentication notice message
   * @returns boolean representing whether the user was already authenticated
   */
  const ensureAuth = (
    action: () => void,
    options?: ProtectedActionOptions
  ): boolean => {
    if (user) {
      action();
      return true;
    }

    const message = options?.message || 'Please authenticate to perform this action.';
    const type = options?.type || 'info';
    
    showNotification(message, type);
    setIsAuthModalOpen(true);
    return false;
  };

  return {
    ensureAuth,
    isAuthenticated: !!user,
  };
}
