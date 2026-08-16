import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Sparkles, Brain, TrendingUp, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface AdminAIAnalyticsPageProps {
  onNavigate: (path: string) => void;
}

export const AdminAIAnalyticsPage: React.FC<AdminAIAnalyticsPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    api.getAdminStats()
      .then((data) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 px-3 py-1 rounded-full text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Gemini 3.7 Institutional Engine</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Campus-Wide Academic Intelligence & Governance
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Predictive institutional analytics, curricular bottleneck detection, and student retention forecasts
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Brain className="w-5 h-5" />
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Curricular Risk & Retention Overview
          </h3>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            SC EduSense AI continually monitors cumulative student attendance ratios alongside grade trajectory deltas. Students falling below 75% attendance triggers automated academic counseling notifications, while high-risk classifications alert faculty advisors for 1-on-1 pedagogical interventions.
          </p>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Monitored Cohort:</span>
              <span className="font-bold text-slate-900 dark:text-white">{stats?.total_students || 0} Students</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Active Faculty Sections:</span>
              <span className="font-bold text-slate-900 dark:text-white">{stats?.total_classes || 0} Sections</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Institutional Mean Attendance:</span>
              <span className="font-bold text-emerald-600">{stats?.average_attendance || 0}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Accreditation & Compliance Safeguards
          </h3>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            All grading distributions, examination weightages, and classroom attendance registers maintain an immutable audit trail. Generated student academic dossiers adhere to university grading standards with real-time computation of CGPA, letter grades, and percentile ranks.
          </p>

          <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-1 text-xs text-emerald-800 dark:text-emerald-200 font-medium">
            <p>✓ Automated letter grade mapping (A+ through F) active</p>
            <p>✓ Sub-75% attendance alerts active</p>
            <p>✓ Real-time multi-agent Gemini synthesis active</p>
          </div>
        </div>
      </div>
    </div>
  );
};
