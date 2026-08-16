import React from 'react';
import { cn, getGradeBadgeClass, getRiskBadgeClass } from '../../lib/utils';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'risk' | 'grade';
  riskLevel?: string;
  grade?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  riskLevel,
  grade,
  className
}) => {
  if (variant === 'risk' && riskLevel) {
    return (
      <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider', getRiskBadgeClass(riskLevel), className)}>
        {riskLevel}
      </span>
    );
  }

  if (variant === 'grade' && grade) {
    return (
      <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border', getGradeBadgeClass(grade), className)}>
        {grade}
      </span>
    );
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
      case 'warning':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
      case 'danger':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';
      case 'info':
        return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        getVariantStyles(),
        className
      )}
    >
      {children}
    </span>
  );
};
