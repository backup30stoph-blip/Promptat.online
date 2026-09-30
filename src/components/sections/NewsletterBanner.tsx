import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Mail, CheckCircle2, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { z } from 'zod';
import confetti from 'canvas-confetti';
import { cmsService } from '../../services/cmsService';

const clientEmailSchema = z.string().trim().email('Please enter a valid email address.');

export const NewsletterBanner: React.FC = () => {
  const { showNotification, t } = useApp();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Debounced real-time validation
  useEffect(() => {
    if (email === '') {
      setValidationError(null);
      return;
    }

    const delayDebounce = setTimeout(() => {
      const result = clientEmailSchema.safeParse(email);
      if (!result.success) {
        setValidationError(result.error.issues[0].message);
      } else {
        setValidationError(null);
      }
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final check before submission
    const finalCheck = clientEmailSchema.safeParse(email);
    if (!finalCheck.success) {
      setValidationError(finalCheck.error.issues[0].message);
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const res = await cmsService.subscribeToNewsletter(email);
      setStatus('success');
      setMessage(res.message);
      showNotification(res.message, 'success');
      
      // Celebrate with premium dual-burst confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 90,
          origin: { y: 0.65 }
        });
      }, 250);

      setEmail('');
    } catch (err: any) {
      setStatus('error');
      const errorMsg = err.message || 'An unexpected error occurred. Please try again.';
      setMessage(errorMsg);
      showNotification(errorMsg, 'error');
    }
  };

  return (
    <section 
      id="newsletter-banner" 
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 my-10"
    >
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[#dce4ff] p-8 sm:p-12 md:p-16 shadow-lg shadow-indigo-100/50 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-12">
        
        {/* Left Visual Illustration Column */}
        <div className="w-full lg:w-1/2 flex items-center justify-center relative min-h-[260px] sm:min-h-[300px]">
          {/* Animated Floating Container */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="relative w-full max-w-[380px] h-[280px] flex items-center justify-center"
          >
            {/* Background 3D Clouds */}
            <div className="absolute top-12 left-4 w-28 h-12 bg-white/90 rounded-full blur-[0.5px] shadow-sm transform -rotate-3"></div>
            <div className="absolute bottom-10 right-2 w-36 h-14 bg-white/90 rounded-full blur-[0.5px] shadow-sm transform rotate-2"></div>
            <div className="absolute top-6 right-8 w-24 h-10 bg-white/80 rounded-full blur-[0.5px]"></div>
            <div className="absolute bottom-6 left-12 w-32 h-12 bg-white/85 rounded-full blur-[0.5px]"></div>

            {/* Sparkles / Floating elements */}
            <div className="absolute top-4 left-16 text-amber-400 font-bold text-lg animate-bounce duration-1000">✦</div>
            <div className="absolute top-16 right-16 text-pink-400 font-bold text-sm">✦</div>
            <div className="absolute bottom-8 left-20 text-purple-400 font-bold text-base">✦</div>
            <div className="absolute bottom-14 right-20 text-amber-400 font-bold text-sm">★</div>

            {/* Pink Checkmark Badge (Top Center) */}
            <motion.div 
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute top-6 left-1/2 -translate-x-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-lg shadow-pink-500/30 border-2 border-white"
            >
              <CheckCircle2 className="h-6 w-6 stroke-[2.5]" />
            </motion.div>

            {/* Gold Notification Bell (Left Front) */}
            <motion.div 
              animate={{ rotate: [-5, 5, -5], y: [0, -5, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
              className="absolute bottom-14 left-8 z-20 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-500 text-amber-950 shadow-lg shadow-amber-500/30 border-2 border-white/80"
            >
              <svg className="h-8 w-8 text-amber-900 fill-amber-300 drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
            </motion.div>

            {/* 3D Paper Airplane SVG Visual */}
            <svg className="w-64 h-64 sm:w-72 sm:h-72 drop-shadow-2xl z-10 transform -rotate-12 hover:scale-105 transition-transform duration-300" viewBox="0 0 200 200" fill="none">
              <defs>
                <linearGradient id="planeMain" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#8171ff" />
                  <stop offset="0.5" stopColor="#6c52ee" />
                  <stop offset="1" stopColor="#5135db" />
                </linearGradient>
                <linearGradient id="planeWingLeft" x1="40" y1="80" x2="120" y2="160" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6c52ee" />
                  <stop offset="1" stopColor="#452bbd" />
                </linearGradient>
                <linearGradient id="planeShadow" x1="50" y1="120" x2="150" y2="180" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3d25a0" />
                  <stop offset="1" stopColor="#2c187e" />
                </linearGradient>
              </defs>
              
              {/* Back Wing Fold Shadow */}
              <polygon points="40,110 170,50 110,150" fill="url(#planeShadow)" />
              {/* Bottom Body Fold */}
              <polygon points="70,120 170,50 110,150" fill="url(#planeWingLeft)" />
              {/* Main Top Wing */}
              <polygon points="20,80 180,40 100,160" fill="url(#planeMain)" />
              {/* Top Center Crease Highlight */}
              <polygon points="20,80 180,40 105,100" fill="#a495ff" opacity="0.6" />
            </svg>
          </motion.div>
        </div>

        {/* Right Form & Content Column */}
        <div className="w-full lg:w-1/2 flex flex-col items-start space-y-5">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {t('newsletterTitle', 'Subscribe to Our Newsletter!')}
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
            {t('newsletterDesc', 'Get premium custom-curated Midjourney seeds, Video Blueprints, .cursorrules code, and AI playbooks sent straight to your inbox every Friday.')}
          </p>

          {/* Form Container */}
          <div className="w-full max-w-md space-y-3.5 pt-2">
            {status === 'success' ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl bg-white p-6 shadow-md border border-emerald-100 space-y-2 text-center"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{t('subscribeSuccess', 'Subscription Confirmed!')}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {message || t('subscribeSuccess', 'Successfully subscribed! Check your inbox this Friday.')}
                </p>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="mt-2 text-xs font-semibold text-indigo-600 underline hover:text-indigo-800 cursor-pointer"
                >
                  {t('subscribeButton', 'Subscribe another email')}
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="w-full space-y-3">
                {/* White Email Input Pill */}
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-4 rtl:pl-0 rtl:pr-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === 'loading'}
                    placeholder={t('newsletterInputPlaceholder', 'Your email')}
                    className={`w-full rounded-full bg-white py-4 pl-12 pr-6 rtl:pl-6 rtl:pr-12 text-sm sm:text-base text-slate-800 placeholder-slate-400 border transition-all duration-150 shadow-sm focus:outline-none focus:ring-2 font-medium ${
                      validationError 
                        ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500' 
                        : 'border-transparent focus:ring-indigo-500/20'
                    }`}
                  />
                </div>

                {/* Validation Error Message */}
                {validationError && (
                  <p className="text-xs text-rose-600 font-semibold px-4 animate-fadeIn" role="alert">
                    {validationError}
                  </p>
                )}

                {/* Purple Pill Subscribe Button */}
                <button
                  type="submit"
                  disabled={status === 'loading' || !!validationError}
                  className="w-full rounded-full bg-[#6c5ce7] hover:bg-[#5a4bd6] active:bg-[#4d3ec4] text-white py-4 px-8 text-sm sm:text-base font-extrabold tracking-wider uppercase shadow-lg shadow-indigo-500/25 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6c5ce7] disabled:opacity-50 flex items-center justify-center space-x-2 rtl:space-x-reverse cursor-pointer"
                >
                  {status === 'loading' ? (
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <>
                      <span>{t('subscribeButton', 'SUBSCRIBE')}</span>
                      <Send className="h-4 w-4 rtl:rotate-180" />
                    </>
                  )}
                </button>

                {/* Backend Feedback Message */}
                {status === 'error' && (
                  <p className="text-xs text-rose-600 font-semibold px-4 animate-fadeIn">
                    {message}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};
