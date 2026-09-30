import { useEffect } from 'react';
import { useApp } from '../context/AppContext';

export const useKeyboardShortcuts = () => {
  const { navigateTo, showNotification } = useApp();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore shortcuts if the user is typing in an input field or textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.tagName === 'SELECT'
      ) {
        return;
      }

      const key = event.key.toLowerCase();
      
      switch (key) {
        case 'h':
          event.preventDefault();
          navigateTo('home');
          showNotification('Navigated to Home (Shortcut: H)', 'info');
          break;
        case 'p':
          event.preventDefault();
          navigateTo('prompts');
          showNotification('Navigated to Prompts (Shortcut: P)', 'info');
          break;
        case 's':
          event.preventDefault();
          navigateTo('skills');
          showNotification('Navigated to Developer Skills (Shortcut: S)', 'info');
          break;
        case 'v':
          event.preventDefault();
          navigateTo('videos');
          showNotification('Navigated to Video Blueprints (Shortcut: V)', 'info');
          break;
        case 'b':
          event.preventDefault();
          navigateTo('blog');
          showNotification('Navigated to Blog & Guides (Shortcut: B)', 'info');
          break;

        case 'f':
        case '/':
          event.preventDefault();
          navigateTo('search');
          showNotification('Opened Search (Shortcut: F or /)', 'info');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigateTo, showNotification]);
};
