import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, X, Loader2, UserPlus, LogIn } from 'lucide-react';
import { supabase } from '../services/supabase/client';
import { useApp } from '../context/AppContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { showNotification, refreshData, t } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOAuth = async (provider: 'google' | 'facebook' | 'github') => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error(`[AuthModal] ${provider} login error:`, err);
      showNotification(err.message || `${provider} login failed. Please try again.`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        // Sign Up with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              username: username || email.split('@')[0],
              full_name: fullName || 'Creator Guest'
            }
          }
        });

        if (error) throw error;

        // Auto-create profile record as a fallback in case the database trigger hasn't fired yet
        if (data.user) {
          try {
            await supabase.from('profiles').insert([{
              id: data.user.id,
              username: username || email.split('@')[0],
              full_name: fullName || 'Creator Guest',
              role: 'user',
              avatar_url: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?auto=format&fit=crop&w=150&q=80`
            }]);
          } catch (profileErr) {
            console.warn('[AuthModal] Profile write handled or already exists:', profileErr);
          }
        }

        showNotification('Registration successful! Check your email or log in directly.', 'success');
        setIsSignUp(false);
      } else {
        // Sign In with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        showNotification('Logged in successfully!', 'success');
        if (onSuccess) onSuccess();
        onClose();
        // Wait briefly for triggers, then refresh global states
        setTimeout(() => refreshData(), 500);
      }
    } catch (err: any) {
      console.error('[AuthModal] Authentication error:', err);
      showNotification(err.message || 'Authentication failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto">
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Container: Centered on screen, max-height bounded */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative w-full max-w-md max-h-[85vh] flex flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl my-auto z-10 overflow-hidden"
          >
            {/* Header with Close Button */}
            <div className="relative px-6 pt-6 pb-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 end-4 rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="text-center mt-1">
                <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {isSignUp ? t('registerAccount', 'Create Creator Account') : t('loginTitle', 'Creator Authorization')}
                </h2>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#e21833] mt-1">
                  {isSignUp ? t('registerSub', 'انضم إلى منصة برومبتات أونلاين') : t('loginSub', 'تسجيل الدخول إلى حسابك')}
                </p>
              </div>
            </div>

            {/* Inner Content Wrapper: overflow-y-auto and max-h-[85vh] for full accessibility */}
            <div className="overflow-y-auto max-h-[85vh] overscroll-contain px-6 pb-6 pt-2 space-y-4">
              {/* Tab selection */}
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    !isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t('navSignIn', 'Sign In')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t('register', 'Register')}
                </button>
              </div>

              {/* Authentication Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {isSignUp && (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        {t('username', 'Username')}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. prompt_wizard"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.trim())}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:border-[#e21833] focus:ring-1 focus:ring-[#e21833] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        {t('fullName', 'Full Name')}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Jane Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:border-[#e21833] focus:ring-1 focus:ring-[#e21833] focus:outline-none"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    {t('email', 'Email Address')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute start-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.trim())}
                      className="w-full rounded-xl border border-slate-200 ps-10 pe-4 py-2.5 text-xs text-slate-800 focus:border-[#e21833] focus:ring-1 focus:ring-[#e21833] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    {t('password', 'Password')}
                  </label>
                  <div className="relative">
                    <Lock className="absolute start-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 ps-10 pe-4 py-2.5 text-xs text-slate-800 focus:border-[#e21833] focus:ring-1 focus:ring-[#e21833] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#e21833] hover:bg-[#c8142b] text-white font-bold py-3 text-xs shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : isSignUp ? (
                    <>
                      <UserPlus className="h-4 w-4" />
                      <span>{t('registerAccount', 'Create Creator Account')}</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" />
                      <span>{t('navSignIn', 'Sign In')}</span>
                    </>
                  )}
                </button>
              </form>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-wider">
                  <span className="bg-white px-2 text-slate-400">or continue with</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleOAuth('google')}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <i className="fa-brands fa-google text-slate-500 text-sm"></i>
                  <span>Continue with Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuth('facebook')}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <i className="fa-brands fa-facebook-f text-[#1877F2] text-sm"></i>
                  <span>Continue with Facebook</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuth('github')}
                  disabled={loading}
                  style={{ backgroundColor: '#333333', color: '#ffffff' }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-800 hover:bg-neutral-800 py-2.5 text-xs font-bold shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <i className="fa-brands fa-github text-white text-sm"></i>
                  <span>Continue with GitHub</span>
                </button>
              </div>

              <p className="pt-2 text-center text-[10px] text-slate-400 leading-relaxed">
                By authorizing, you gain instant access to interactive prompt utilities, advanced creator profiles, bookmark boards, and real-time comment capabilities.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
