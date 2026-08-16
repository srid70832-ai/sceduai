import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 transform animate-in fade-in slide-in-from-bottom-3 ${
              toast.type === 'success'
                ? 'bg-slate-900/95 dark:bg-slate-900/95 text-slate-100 border-emerald-500/40 ring-1 ring-emerald-500/20'
                : toast.type === 'error'
                ? 'bg-slate-900/95 dark:bg-slate-900/95 text-slate-100 border-rose-500/40 ring-1 ring-rose-500/20 animate-subtle-shake'
                : 'bg-slate-900/95 dark:bg-slate-900/95 text-slate-100 border-indigo-500/40 ring-1 ring-indigo-500/20'
            }`}
          >
            {toast.type === 'success' && (
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
            )}
            {toast.type === 'error' && (
              <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4 text-rose-400" />
              </div>
            )}
            {toast.type === 'info' && (
              <div className="w-6 h-6 rounded-full bg-sky-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Info className="w-4 h-4 text-sky-400" />
              </div>
            )}
            <div className="flex-1 text-xs font-semibold leading-relaxed pt-0.5">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
