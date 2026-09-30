import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../services/supabase/client';
import { 
  Bell, 
  Check, 
  Mail, 
  Sparkles, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Loader2, 
  RefreshCw, 
  Inbox,
  Send,
  X
} from 'lucide-react';

interface Notification {
  id: string;
  user_id: string | null;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'newsletter' | 'email_summary';
  is_read: boolean;
  created_at: string;
}

const STORAGE_KEY_NOTIFICATIONS = 'promptat_notifications_v1';

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: 'welcome-01',
    user_id: null,
    title: 'مرحباً بك في برومبتات أونلاين!',
    message: 'استكشف أحدث المخططات، وأوامر الصور، والمهارات التعليمية المعتمدة.',
    type: 'info',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'digest-01',
    user_id: null,
    title: 'Trending Playbooks Live',
    message: 'New high-yield prompts for Gemini 1.5 Pro and Midjourney v6 have been indexed.',
    type: 'newsletter',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
];

const loadLocalNotifications = (): Notification[] => {
  try {
    const cached = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore json parse errors
  }
  return DEFAULT_NOTIFICATIONS;
};

const saveLocalNotifications = (items: Notification[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(items));
  } catch {
    // ignore storage quota errors
  }
};

export const NotificationsDropdown: React.FC = () => {
  const { user, isRtl, showNotification } = useApp();
  const [notifications, setNotifications] = useState<Notification[]>(loadLocalNotifications);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (user) {
        query = query.or(`user_id.eq.${user.id},user_id.is.null`);
      } else {
        query = query.is('user_id', null);
      }

      const response = await Promise.resolve(query).catch((fetchErr) => {
        return { data: null, error: fetchErr };
      });

      const { data, error } = response || {};
      if (error) {
        const fallback = loadLocalNotifications();
        setNotifications(fallback);
        return;
      }
      
      if (data && data.length > 0) {
        setNotifications(data);
        saveLocalNotifications(data);
      } else {
        const fallback = loadLocalNotifications();
        setNotifications(fallback);
      }
    } catch {
      const fallback = loadLocalNotifications();
      setNotifications(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  // Click outside close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllAsRead = async () => {
    if (notifications.length === 0) return;
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      if (unreadIds.length === 0) return;

      const updated = notifications.map(n => ({ ...n, is_read: true }));
      setNotifications(updated);
      saveLocalNotifications(updated);

      try {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .in('id', unreadIds);
      } catch (dbErr) {
        console.warn('[NotificationsDropdown] Remote read sync skipped:', dbErr);
      }

      showNotification('All notifications marked as read', 'success');
    } catch (err: any) {
      console.warn('[NotificationsDropdown] Mark read error:', err);
    }
  };

  const handleSimulateDispatch = async () => {
    setIsSimulating(true);
    try {
      const simNotification: Notification = {
        id: `sim-${Date.now()}`,
        user_id: user?.id || null,
        title: 'Weekly Digest Dispatched (Simulation)',
        message: 'Dispatched automated weekly digest containing curated prompts and video playbooks.',
        type: 'email_summary',
        is_read: false,
        created_at: new Date().toISOString(),
      };

      const updated = [simNotification, ...notifications.slice(0, 9)];
      setNotifications(updated);
      saveLocalNotifications(updated);
      showNotification('Newsletter dispatch simulated successfully!', 'success');
    } finally {
      setIsSimulating(false);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'newsletter':
      case 'email_summary':
        return <Mail className="h-4 w-4 text-indigo-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative shrink-0" ref={dropdownRef} id="notifications-menu">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center rounded-xl h-9 w-9 bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer focus:outline-none border border-white/20 shrink-0"
        aria-label="View notifications"
        aria-expanded={isOpen}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 rtl:-left-1 rtl:right-auto flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-white text-[#e21833] text-[9px] font-black items-center justify-center">
              {unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <>
          {/* MOBILE BOTTOM SHEET (<640px) */}
          <div className="sm:hidden fixed inset-0 z-[70]" role="dialog" aria-modal="true">
            <div 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl p-4 text-slate-800 pb-[max(1.25rem,env(safe-area-inset-bottom))] animate-in slide-in-from-bottom duration-200">
              <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-slate-300" />
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
                <div className="flex items-center gap-2">
                  <Inbox className="h-5 w-5 text-[#e21833]" />
                  <h3 className="text-sm font-black uppercase text-slate-900">
                    Notifications ({unreadCount})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile Notifications list */}
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className={`py-3 flex gap-3 ${n.is_read ? 'opacity-80' : 'font-bold'}`}>
                    <div className="mt-0.5 shrink-0">{getNotificationIcon(n.type)}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-900 font-bold leading-tight">{n.title}</p>
                      <p className="text-[11px] text-slate-600 mt-0.5">{n.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DESKTOP POPOVER (>=640px) */}
          {/* Collision-safe: in RTL, aligns to left-0; in LTR, aligns to right-0 */}
          <div 
            className={`hidden sm:block absolute top-full mt-2 z-[60] w-[min(22rem,calc(100vw-24px))] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 ${
              isRtl ? 'left-0 right-auto' : 'right-0 left-auto'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3">
              <div className="flex items-center gap-2">
                <Inbox className="h-4 w-4 text-[#e21833]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Notifications
                </h3>
              </div>
              
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-[#e21833] hover:underline"
                  >
                    <Check className="h-3 w-3" />
                    <span>Read All</span>
                  </button>
                )}
                <button
                  onClick={fetchNotifications}
                  disabled={loading}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-50"
                  title="Refresh"
                >
                  <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-slate-400">
                  <Inbox className="h-8 w-8 mx-auto text-slate-300 stroke-1" />
                  <p className="text-xs font-bold text-slate-800 mt-2">All caught up!</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex gap-3 p-3.5 transition-colors ${
                      notification.is_read ? 'bg-white' : 'bg-rose-50/30'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-0.5 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 leading-snug truncate">
                          {notification.title}
                        </h4>
                        <span className="text-[9px] text-slate-400 font-semibold shrink-0">
                          {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
