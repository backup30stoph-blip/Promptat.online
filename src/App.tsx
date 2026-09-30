import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Breadcrumbs } from './components/layout/Breadcrumbs';
import { BackToTop } from './components/layout/BackToTop';
import { Home } from './pages/Home';
import { Prompts } from './pages/Prompts';
import { Skills } from './pages/Skills';
import { Videos } from './pages/Videos';
import { Blog } from './pages/Blog';
import { News } from './pages/News';
import { Search } from './pages/Search';
import { Login } from './pages/Login';
import { Admin } from './pages/Admin';
import { PageNotFound } from './pages/PageNotFound';
import { AuthCallback } from './pages/AuthCallback';
import { AccountSettings } from './pages/AccountSettings';
import { PublicProfile } from './pages/PublicProfile';
import { AdminatoLogin } from './pages/AdminatoLogin';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Bell, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { NewsletterPopup } from './components/NewsletterPopup';
import { AdSenseScript } from './components/AdSenseScript';
import { AdSlot } from './components/AdSlot';
import { ConsentBanner } from './components/ConsentBanner';
import { AdBlockDetection } from './components/AdBlockDetection';
import { AuthModal } from './components/AuthModal';
import { TranslationAvailableBanner } from './components/layout/TranslationAvailableBanner';
import { updateDocumentLanguageAndSeo, getPageSeoMetadata } from './lib/i18n';

const AppContent: React.FC = () => {
  const { 
    activeTab, 
    activeDetail, 
    notification, 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    currentLang, 
    switchLanguage 
  } = useApp();
  
  // Activate global keyboard shortcuts
  useKeyboardShortcuts();

  // Dynamically update document title and meta description tags based on the current active language and active tab
  useEffect(() => {
    // When not on an item detail view (detail views set specific granular SEO titles via useSeoMetadata),
    // update global document title, meta description, and social/hreflang tags
    if (!activeDetail) {
      const seoData = getPageSeoMetadata(activeTab, currentLang);
      const basePath = activeTab === 'home' ? '/' : `/${activeTab}`;
      const isIndexable = activeTab !== 'admin' && activeTab !== 'login' && activeTab !== 'auth-callback' && activeTab !== 'account-settings';

      updateDocumentLanguageAndSeo(
        currentLang,
        basePath,
        seoData.title,
        seoData.description,
        isIndexable
      );
    }
  }, [currentLang, activeTab, activeDetail]);

  // Route selector
  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <Home />;
      case 'prompts':
        return <Prompts />;
      case 'skills':
        return <Skills />;
      case 'videos':
        return <Videos />;
      case 'blog':
        return <Blog />;
      case 'news':
        return <News />;
      case 'search':
        return <Search />;
      case 'login':
        return <PageNotFound type="general" />;
      case 'adminato-login':
        return <AdminatoLogin />;
      case 'auth-callback':
        return <AuthCallback />;
      case 'account-settings':
        return <AccountSettings />;
      case 'public-profile':
        return <PublicProfile />;
      case 'admin':
        return (
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        );
      default:
        return <PageNotFound type="general" />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 transition-colors duration-200">
      
      {/* Dynamic Notification Banner */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xl animate-slide-in">
          <div className="flex items-start space-x-3">
            {notification.type === 'success' && (
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            )}
            {notification.type === 'error' && (
              <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
            )}
            {notification.type === 'info' && (
              <Info className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                Promptat Online Message
              </span>
              <p className="text-xs font-semibold text-slate-700 mt-1 leading-relaxed">
                {notification.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top sticky navbar */}
      {activeTab !== 'admin' && (
        <>
          <Navbar />
        </>
      )}

      {/* Breadcrumbs for SEO and navigation */}
      {activeTab !== 'admin' && <Breadcrumbs />}

      {/* Primary view content area */}
      {/* Global AdSense Script Injection */}
      <AdSenseScript />

      <main className="flex-1">
        {renderPage()}
      </main>

      {/* Global AdSense Footer Placement */}
      {activeTab !== 'admin' && <AdSlot placement="footer-above" pageType="all" />}

      {/* Static directory maps footer */}
      {activeTab !== 'admin' && <Footer />}

      {/* Floating Back to Top Button */}
      {activeTab !== 'admin' && <BackToTop />}

      {/* Delayed Newsletter Engagement Popup */}
      <NewsletterPopup />

      {/* Global Auth Modal portal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Global Ad Consent Banner */}
      <ConsentBanner />
      <AdBlockDetection />

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
