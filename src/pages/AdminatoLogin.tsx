import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../services/supabase/client';
import { Lock, Mail, ShieldAlert, Loader2, Shield } from 'lucide-react';

export const AdminatoLogin: React.FC = () => {
  const { user, isAdmin, isAuthLoading, navigateTo, showNotification, refreshData } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // If user is already authenticated as Admin, redirect immediately to Admin dashboard
  useEffect(() => {
    if (user && isAdmin && !isAuthLoading) {
      navigateTo('admin');
    }
  }, [user, isAdmin, isAuthLoading, navigateTo]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
      return;
    }

    setLoading(true);
    try {
      // 1. Authenticate credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error || !data.user) {
        throw new Error('بيانات الدخول غير صحيحة');
      }

      // 2. Security Check: Verify Role in profiles table
      const { data: profile, error: profError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      // Check if user possesses Admin privileges (or default admin email fallback)
      const isUserAdmin = profile?.role === 'admin' || data.user.email === 'backup30stoph@gmail.com';

      if (!isUserAdmin) {
        // Immediately log out non-admin users to prevent session elevation
        await supabase.auth.signOut();
        throw new Error('بيانات الدخول غير صحيحة');
      }

      // Refresh global app data
      await refreshData();
      showNotification('تم تسجيل دخول الأدمن بنجاح', 'success');
      navigateTo('admin');

    } catch (err: any) {
      console.warn('[AdminatoLogin] Authentication failed');
      // Generic non-descript error message for security (prevents account enumeration)
      showNotification('بيانات الدخول غير صحيحة', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-[#e21833] shadow-inner">
            <Shield className="h-7 w-7" />
          </div>
          <h2 className="mt-6 font-display text-2xl font-black text-slate-900 tracking-tight">
            لوحة الإدارة المشفرة
          </h2>
          <p className="mt-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            Promptat Online Administration
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleAdminLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                البريد الإلكتروني للإدارة
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@promptat.online"
                  className="w-full rounded-xl border border-slate-200 py-2.5 pr-10 pl-3 text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none focus:border-[#e21833] focus:ring-2 focus:ring-red-100"
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                كلمة المرور
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="admin-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-slate-200 py-2.5 pr-10 pl-3 text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none focus:border-[#e21833] focus:ring-2 focus:ring-red-100"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#e21833] py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-red-700 transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>جاري التحقق من الصلاحيات...</span>
              </>
            ) : (
              <span>دخول الأدمن</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
