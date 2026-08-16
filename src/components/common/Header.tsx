import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { NotificationItem } from '../../types';
import { Bell, Menu, Sparkles, Check, ExternalLink, User } from 'lucide-react';
import { formatDate } from '../../lib/utils';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  title: string;
  subtitle?: string;
  onNavigate?: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar, title, subtitle, onNavigate }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      const notifs = Array.isArray(data) ? data : [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n) => !n.is_read).length);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => (prev || []).map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.is_read) {
      try {
        await api.markNotificationRead(notif.id);
        setNotifications((prev) => (prev || []).map((n) => (n.id === notif.id ? { ...n, is_read: true } : n)));
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // ignore
      }
    }
    if (notif.link_url && onNavigate) {
      onNavigate(notif.link_url);
      setShowNotifications(false);
    }
  };

  return (
    <header className="bg-[#061c16] border-b border-emerald-900/60 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-3">
        <button
          id="btn-mobile-sidebar-toggle"
          onClick={onToggleMobileSidebar}
          className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-900/40 rounded-lg lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs text-emerald-200/80 mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button
            id="btn-notifications-dropdown"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-900/40 relative transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#061c16]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="font-semibold text-sm text-white flex items-center gap-2">
                  <span>Academic Alerts</span>
                  {unreadCount > 0 && (
                    <span className="text-[11px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded-full font-bold">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-emerald-400 hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto mt-2 space-y-2 divide-y divide-slate-800/80">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No notifications at this time.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`pt-2.5 cursor-pointer rounded-lg p-2 transition-colors ${
                        n.is_read
                          ? 'opacity-70 hover:opacity-100 hover:bg-slate-800/60'
                          : 'bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-800/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                          {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                          {n.title}
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">{formatDate(n.created_at)}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User quick pill */}
        {user && (
          <div 
            onClick={() => onNavigate?.(`/${(user.role || "").toLowerCase()}/profile`)}
            className="flex items-center gap-2.5 pl-3 border-l border-emerald-900/60 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-900/80 border border-emerald-700/50 flex items-center justify-center text-emerald-200 font-bold text-xs">
              {user.full_name.charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-white leading-tight">{user.full_name}</div>
              <div className="text-[10px] text-emerald-300 uppercase font-medium">{user.role}</div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
