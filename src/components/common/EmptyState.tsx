import React from 'react';
import { Inbox, Plus, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  id?: string;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  id,
  icon,
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction
}) => {
  return (
    <div
      id={id}
      className="bg-white dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto shadow-xs transition-all duration-300"
    >
      <div className="w-16 h-16 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 ring-8 ring-indigo-50/30 dark:ring-indigo-950/20 animate-float">
        {icon || <Inbox className="w-8 h-8" />}
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">{title}</h3>
      {description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-md leading-relaxed">
          {description}
        </p>
      )}

      {(actionText || secondaryActionText) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {actionText && onAction && (
            <button
              onClick={onAction}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-98"
            >
              <Plus className="w-4 h-4" />
              {actionText}
            </button>
          )}
          {secondaryActionText && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-98"
            >
              <Sparkles className="w-4 h-4 text-indigo-500" />
              {secondaryActionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
