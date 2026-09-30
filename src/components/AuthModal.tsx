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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.35 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Title / Header */}
            <div className="text-center mb-6 mt-2">
              <h2 className="font-display text-2xl font-black text-slate-900 tracking-tight">
                {isSignUp ? t('registerAccount', 'Create Creator Account') : t('loginTitle', 'Creator Authorization')}
              </h2>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-500 mt-1">
                {isSignUp ? t('registerSub', 'انضم إلى منصة برومبتات أونلاين') : t('loginSub', 'تسجيل الدخول إلى حسابك')}
              </p>
            </div>

            {/* Tab selection */}
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 mb-6">
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
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {t('username', 'Username')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. prompt_wizard"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.trim())}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {t('fullName', 'Full Name')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t('email', 'Email Address')}
                </label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.trim())}
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t('password', 'Password')}
                </label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 text-xs shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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

            <div className="relative my-4">
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
                className="flex w-full items-center justify-center space-x-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <i className="fa-brands fa-google text-slate-500 text-sm"></i>
                <span>Continue with Google</span>
              </button>
              <button
                type="button"
                onClick={() => handleOAuth('facebook')}
                disabled={loading}
                className="flex w-full items-center justify-center space-x-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <i className="fa-brands fa-facebook-f text-[#1877F2] text-sm"></i>
                <span>Continue with Facebook</span>
              </button>
              <button
                type="button"
                onClick={() => handleOAuth('github')}
                disabled={loading}
                className="flex w-full items-center justify-center space-x-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <i className="fa-brands fa-github text-slate-900 text-sm"></i>
                <span>Continue with GitHub</span>
              </button>
            </div>

            <p className="mt-4 text-center text-[10px] text-slate-400 leading-relaxed">
              By authorizing, you gain instant access to interactive prompt utilities, advanced creator profiles, bookmark boards, and real-time comment capabilities.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
