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
  Send
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
  const { user, showNotification } = useApp();
  const [notifications, setNotifications] = useState<Notification[]>(loadLocalNotifications);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Check if browser is online or network request is safe
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
        // Intercept raw window.fetch or network drop errors before rethrowing
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
      // Gracefully fall back to local stored notifications without throwing
      const fallback = loadLocalNotifications();
      setNotifications(fallback);
    } finally {
      setLoading(false);
    }
  };

  // Poll notifications occasionally or fetch on load
  useEffect(() => {
    fetchNotifications();
    
    // Set up a unique real-time subscription for notifications table
    let channel: any = null;
    try {
      const channelId = `notifications-changes-${Math.random().toString(36).substring(2, 11)}`;
      channel = supabase
        .channel(channelId)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notifications' },
          () => {
            fetchNotifications();
          }
        )
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR') {
            console.warn('[NotificationsDropdown] Realtime channel offline, using local mode.');
          }
        });
    } catch (e) {
      console.warn('[NotificationsDropdown] Realtime subscription skipped:', e);
    }

    return () => {
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch {
          // ignore channel removal error
        }
      }
    };
  }, [user]);

  // Click outside close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Mark all as read
  const markAllAsRead = async () => {
    if (notifications.length === 0) return;
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      if (unreadIds.length === 0) return;

      // Update local state immediately
      const updated = notifications.map(n => ({ ...n, is_read: true }));
      setNotifications(updated);
      saveLocalNotifications(updated);

      // Attempt remote database update in background
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

  // Simulate periodic email summary dispatch
  const handleSimulateDispatch = async () => {
    setIsSimulating(true);
    try {
      let remoteSuccess = false;
      try {
        const { data, error } = await supabase.rpc('send_periodic_email_summary');
        if (!error && data) {
          const info = data as any;
          if (info?.status === 'success') {
            showNotification(
              `Newsletter dispatch simulation complete! Sent to ${info.subscribers_notified} subscriber(s).`,
              'success'
            );
            remoteSuccess = true;
            fetchNotifications();
          }
        }
      } catch {
        // remote RPC unavailable
      }

      if (!remoteSuccess) {
        // Create local simulated digest notification
        const simNotification: Notification = {
          id: `sim-${Date.now()}`,
          user_id: user?.id || null,
          title: 'Weekly Digest Dispatched (Simulation)',
          message: 'Dispatched automated weekly digest containing curated prompts and video playbooks to newsletter subscribers.',
          type: 'email_summary',
          is_read: false,
          created_at: new Date().toISOString(),
        };

        const updated = [simNotification, ...notifications.slice(0, 9)];
        setNotifications(updated);
        saveLocalNotifications(updated);
        showNotification('Newsletter dispatch simulated successfully! Check your inbox notifications.', 'success');
      }
    } catch (err: any) {
      console.warn('[NotificationsDropdown] Dispatch simulation fallback:', err);
      showNotification('Newsletter dispatch simulation completed.', 'info');
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
    <div className="relative" ref={dropdownRef} id="notifications-menu">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center rounded-lg p-2 text-white/90 hover:bg-white/10 hover:text-white transition-all cursor-pointer focus:outline-none"
        aria-label="View notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-400"></span>
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-2xl border border-slate-200 bg-white shadow-2xl z-50 overflow-hidden transform origin-top-right transition-all animate-in fade-in slide-in-from-top-1">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3">
            <div className="flex items-center space-x-2">
              <Inbox className="h-4 w-4 text-[#e21833]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Inbox Notifications
              </h3>
            </div>
            
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="inline-flex items-center space-x-1 text-[10px] font-bold text-[#e21833] hover:underline"
                >
                  <Check className="h-3 w-3" />
                  <span>Read All</span>
                </button>
              )}
              <button
                onClick={fetchNotifications}
                disabled={loading}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
                title="Refresh logs"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Quick Simulation Dispatch Action */}
          <div className="bg-indigo-50/50 border-b border-indigo-100/50 px-4 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5 text-indigo-950 font-semibold text-[10px]">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
              <span>Simulate Newsletter Email Digest</span>
            </div>
            <button
              onClick={handleSimulateDispatch}
              disabled={isSimulating}
              className="flex items-center space-x-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2 py-1 text-[9px] uppercase tracking-wider shadow-sm transition-all disabled:opacity-50 cursor-pointer shrink-0"
            >
              {isSimulating ? (
                <Loader2 className="h-2.5 w-2.5 animate-spin" />
              ) : (
                <Send className="h-2.5 w-2.5" />
              )}
              <span>Dispatch</span>
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {loading && notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Loading updates...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                <Inbox className="h-8 w-8 text-slate-300 stroke-1" />
                <p className="text-xs font-bold text-slate-800 mt-2">All caught up!</p>
                <p className="text-[10px] px-8 text-slate-400 text-center mt-1">
                  You don't have any notifications or simulated digests at the moment.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex gap-3 p-4 transition-colors ${
                    notification.is_read ? 'bg-white' : 'bg-rose-50/30 border-l-2 border-[#e21833]'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {notification.title}
                      </h4>
                      <span className="text-[9px] text-slate-400 font-semibold whitespace-nowrap">
                        {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-line">
                      {notification.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 bg-slate-50 text-center py-2">
            <span className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase">
              Showing last 10 activities
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
