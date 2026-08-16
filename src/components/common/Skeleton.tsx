import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
}) => {
  const roundedClass =
    variant === 'circular'
      ? 'rounded-full'
      : variant === 'text'
      ? 'rounded-md h-4'
      : 'rounded-xl';

  return (
    <div
      className={`bg-slate-200 dark:bg-slate-800 relative overflow-hidden animate-pulse ${roundedClass} ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer dark:animate-shimmer" />
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Stat cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="w-24 h-4" variant="text" />
              <Skeleton className="w-10 h-10 rounded-xl" />
            </div>
            <Skeleton className="w-16 h-8" />
            <Skeleton className="w-32 h-3" variant="text" />
          </div>
        ))}
      </div>

      {/* Main charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <Skeleton className="w-48 h-5" variant="text" />
          <Skeleton className="w-full h-64 rounded-2xl" />
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <Skeleton className="w-36 h-5" variant="text" />
          <Skeleton className="w-full h-64 rounded-2xl" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <Skeleton className="w-40 h-5" variant="text" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="w-full h-12 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-in fade-in">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <Skeleton className="w-36 h-5" variant="text" />
        <Skeleton className="w-24 h-8 rounded-xl" />
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="w-full h-12 rounded-xl" />
        ))}
      </div>
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 animate-in fade-in">
      <div className="flex items-center justify-between">
        <Skeleton className="w-16 h-5 rounded-md" />
        <Skeleton className="w-20 h-4" variant="text" />
      </div>
      <Skeleton className="w-3/4 h-6" variant="text" />
      <Skeleton className="w-full h-12" />
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <Skeleton className="w-24 h-4" variant="text" />
        <Skeleton className="w-20 h-4" variant="text" />
      </div>
    </div>
  );
};
