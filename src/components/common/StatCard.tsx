import React from 'react';
import { AnimatedCounter } from './AnimatedCounter';

interface StatCardProps {
  id?: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky';
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor = 'indigo'
}) => {
  const getColorStyles = () => {
    switch (accentColor) {
      case 'emerald':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 group-hover:bg-emerald-500/15 group-hover:scale-105';
      case 'amber':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 group-hover:bg-amber-500/15 group-hover:scale-105';
      case 'rose':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 group-hover:bg-rose-500/15 group-hover:scale-105';
      case 'sky':
        return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20 group-hover:bg-sky-500/15 group-hover:scale-105';
      default:
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 group-hover:bg-indigo-500/15 group-hover:scale-105';
    }
  };

  return (
    <div
      id={id}
      className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1.5 tracking-tight flex items-baseline gap-1">
            <AnimatedCounter value={value} />
          </h3>
        </div>
        <div className={`p-3 rounded-xl border transition-all duration-200 ${getColorStyles()}`}>
          {icon}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800/80">
          {subtitle && (
            <span className="text-slate-500 dark:text-slate-400 truncate font-medium">
              {subtitle}
            </span>
          )}
          {trend && (
            <span
              className={`font-semibold flex items-center gap-0.5 ${
                trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
