import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Settings, Database, RefreshCw, Sparkles, Shield, Server } from 'lucide-react';

interface AdminSettingsPageProps {
  onNavigate: (path: string) => void;
}

export const AdminSettingsPage: React.FC<AdminSettingsPageProps> = ({ onNavigate }) => {
  const { loadDemoData } = useAuth();
  const { showToast } = useToast();
  const [isResetting, setIsResetting] = useState(false);

  const handleReloadDemo = async () => {
    setIsResetting(true);
    try {
      await loadDemoData();
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          System Parameters & Institutional Configuration
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Database seeding, AI model configurations, and academic rules
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Database Control */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>

          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Academic Database Seeding Engine
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Reload or re-seed the full multi-tier academic dataset with authenticated students, faculty members, real courses, class sections, assignments, attendance logs, and exam marks.
          </p>

          <button
            onClick={handleReloadDemo}
            disabled={isResetting}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
            {isResetting ? 'Populating Database...' : 'Seed Sample Academic Dataset'}
          </button>
        </div>

        {/* AI & Analytics Engine */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Server className="w-5 h-5" />
          </div>

          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            AI Engine Diagnostics
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Gemini Model:</span>
              <span className="font-bold text-slate-900 dark:text-white">gemini-2.5-flash / pro</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Execution Runtime:</span>
              <span className="font-bold text-slate-900 dark:text-white">Full-Stack Server Backend</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Attendance Threshold:</span>
              <span className="font-bold text-rose-600">75.0% (Mandatory)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Grading Scale:</span>
              <span className="font-bold text-slate-900 dark:text-white">A+ (90+) to F (&lt;50)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
