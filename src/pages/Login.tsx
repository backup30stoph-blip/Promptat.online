import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../services/supabase/client';
import { Mail, Lock, ShieldAlert, ArrowRight, UserPlus, LogIn, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const { user, isAdmin, isAuthLoading, navigateTo, showNotification, t } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // If user is already logged in, redirect them once authentication verification completes
  useEffect(() => {
    if (user && !isAuthLoading) {
      if (isAdmin) {
        navigateTo('admin');
        showNotification('Welcome back, Admin!', 'success');
      } else {
        navigateTo('prompts');
        showNotification('Logged in successfully!', 'success');
      }
    }
  }, [user, isAdmin, isAuthLoading, navigateTo, showNotification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        // Sign Up with Supabase
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          }
        });

        if (error) throw error;

        showNotification('Registration successful! Please check your email for confirmation.', 'success');
        setIsSignUp(false);
      } else {
        // Sign In with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        showNotification('Welcome back!', 'success');
      }
    } catch (err: any) {
      console.error('Authentication error', err);
      showNotification(err.message || 'Authentication failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Demo bypass mode for development/sandbox preview before SQL is executed
  const handleBypass = () => {
    // Quick admin simulation for testing UI in container sandbox
    showNotification('Bypassing Auth for preview mode as Admin...', 'info');
    navigateTo('admin');
  };

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <Lock className="h-6 w-6 text-[#e21833]" />
          </div>
          <h2 className="mt-6 font-display text-2xl font-black text-slate-900 tracking-tight">
            {isSignUp ? t('registerAccount', 'Create your Creator Account') : t('loginTitle', 'Secure Admin & Creator Login')}
          </h2>
          <p className="mt-2 text-xs font-semibold text-slate-500 uppercase tracking-widest">
            {isSignUp ? 'Promptat Online Creator Hub' : 'Promptat Online Secure Access'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md">
            <div>
              <label htmlFor="email-address" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                {t('email', 'Email Address')}
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                {t('password', 'Password')}
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs font-bold text-slate-600 hover:text-[#e21833] flex items-center gap-1 cursor-pointer"
            >
              {isSignUp ? (
                <>
                  <LogIn className="h-3.5 w-3.5" />
                  <span>{t('navSignIn', 'Sign In')}</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>{t('register', 'Create Account')}</span>
                </>
              )}
            </button>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-xl bg-[#e21833] py-3.5 px-4 text-sm font-bold text-white hover:bg-[#c21124] focus:outline-none focus:ring-2 focus:ring-[#e21833] focus:ring-offset-2 disabled:opacity-75 transition-all cursor-pointer shadow-md"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-1.5">
                  {isSignUp ? t('registerAccount', 'Create Account') : t('navSignIn', 'Sign In')}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-6">
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ShieldAlert className="h-5 w-5 text-amber-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  Admin Corridor Notice
                </h3>
                <div className="mt-1 text-xs text-amber-700 leading-relaxed">
                  Sign up with email <strong className="font-semibold text-amber-900">backup30stoph@gmail.com</strong>.
                  The SQL triggers will automatically authorize you as Owner/Admin.
                </div>
                <button
                  onClick={handleBypass}
                  className="mt-3 inline-flex items-center rounded bg-amber-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-amber-700 focus:outline-none cursor-pointer"
                >
                  Bypass Auth (Dev Sandbox Demo)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
