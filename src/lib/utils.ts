import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}

export function getRiskBadgeClass(risk?: string): string {
  switch (risk?.toLowerCase()) {
    case 'critical':
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';
    case 'high':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
    case 'medium':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20';
    case 'low':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
    default:
      return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20';
  }
}

export function getGradeBadgeClass(grade?: string): string {
  if (!grade) return 'bg-slate-100 text-slate-700';
  if (grade.startsWith('A')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800 border-blue-200';
  if (grade.startsWith('C')) return 'bg-amber-100 text-amber-800 border-amber-200';
  if (grade.startsWith('D')) return 'bg-orange-100 text-orange-800 border-orange-200';
  return 'bg-rose-100 text-rose-800 border-rose-200';
}
