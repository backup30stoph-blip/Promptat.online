import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Bell, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { cmsService } from '../services/cmsService';

export const NewsletterPopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Check if user has already dismissed or subscribed
    const isDismissed = localStorage.getItem('newsletter_popup_dismissed') === 'true';
    const isSubscribed = localStorage.getItem('newsletter_subscribed') === 'true';

    if (isDismissed || isSubscribed) {
      return;
    }

    // Trigger popup after 30 seconds (30000ms)
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('newsletter_popup_dismissed', 'true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await cmsService.subscribeToNewsletter(email);
      if (res.success) {
        setStatus('success');
        localStorage.setItem('newsletter_subscribed', 'true');
        // Close after a brief delay on success
        setTimeout(() => {
          setIsOpen(false);
        }, 3000);
      } else {
        setStatus('error');
        setErrorMessage(res.message || 'Something went wrong. Please try again.');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="newsletter-popup-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <motion.div
            id="newsletter-popup-card"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-8 shadow-2xl border border-slate-100"
          >
            {/* Background Accent Gradients */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 h-40 w-40 rounded-full bg-red-500/10 blur-2xl" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-40 w-40 rounded-full bg-indigo-500/10 blur-2xl" />

            {/* Close Button */}
            <button
              id="newsletter-popup-close-btn"
              onClick={handleClose}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Success State */}
            {status === 'success' ? (
              <div className="flex flex-col items-center text-center py-6">
                <div className="rounded-full bg-emerald-50 p-3 mb-4">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600 animate-bounce" />
                </div>
                <h3 className="font-display text-xl font-black text-slate-900">
                  Welcome to the Club!
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  لقد اشتركت بنجاح في نشرة برومبتات أونلاين البريدية. ستصلك أحدث الأوامر والمخططات مباشرة في بريدك.
                </p>
              </div>
            ) : (
              /* Subscription Form State */
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e21833]/10 text-[#e21833]">
                    <Bell className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-black uppercase tracking-wider text-[#e21833]">Newsletter</span>
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    </div>
                    <h3 className="font-display text-lg font-black text-slate-900">
                      Stay Ahead of the AI Curve
                    </h3>
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  Join creators, engineers, and researchers who receive weekly curated prompt blueprints, dev techniques, and trending viral video frameworks.
                </p>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      id="newsletter-popup-email-input"
                      type="email"
                      required
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={status === 'submitting'}
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-hidden transition-all placeholder:text-slate-400 focus:border-[#e21833] focus:ring-2 focus:ring-[#e21833]/10 disabled:bg-slate-50"
                    />
                  </div>

                  {status === 'error' && (
                    <div className="flex items-center space-x-2 text-xs font-bold text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <button
                    id="newsletter-popup-submit-btn"
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full rounded-xl bg-[#e21833] hover:bg-[#c11429] active:bg-[#a01021] text-white font-bold text-sm py-3 px-4 shadow-md transition-colors cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === 'submitting' ? (
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <span>Get Elite Blueprints</span>
                        <Sparkles className="h-4 w-4 fill-white" />
                      </>
                    )}
                  </button>
                </form>

                <p className="text-center text-[10px] text-slate-400">
                  Zero spam. Unsubscribe anytime in one click.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
