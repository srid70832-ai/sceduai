import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Notification } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Bell, Check, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { EmptyState } from '../../components/common/EmptyState';

interface StudentNotificationsPageProps {
  onNavigate: (path: string) => void;
}

export const StudentNotificationsPage: React.FC<StudentNotificationsPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchNotifs = () => {
    setIsLoading(true);
    api.getNotifications()
      .then((data) => setNotifications(data))
      .catch(() => setNotifications([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      showToast('Notification marked as read.', 'success');
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Academic Notifications & Alerts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            System notices, attendance risk warnings, and assignment grading alerts
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          title="All caught up!"
          description="You have no notifications or alerts at this time."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                n.is_read
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80'
                  : 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/60 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs shrink-0 mt-0.5 ${
                  n.type === 'ATTENDANCE_WARNING'
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    : n.type === 'AI_ALERT'
                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                    : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                }`}>
                  <Bell className="w-4 h-4" />
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {n.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {n.message}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-2 block flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(n.created_at)}
                  </span>
                </div>
              </div>

              {!n.is_read && (
                <button
                  onClick={() => handleMarkAsRead(n.id)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline shrink-0 flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
