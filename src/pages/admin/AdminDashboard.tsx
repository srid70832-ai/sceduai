import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { StatCard } from '../../components/common/StatCard';
import { RiskDistributionChart } from '../../components/charts/RiskDistributionChart';
import { Users, GraduationCap, BookOpen, Layers, CalendarCheck, Sparkles, Plus } from 'lucide-react';
import { DashboardSkeleton } from '../../components/common/Skeleton';

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchStats = () => {
    setIsLoading(true);
    api.getAdminStats()
      .then((data) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const riskDistribution = stats?.risk_distribution || {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0
  };

  const hasAttendance = stats?.overall_attendance_rate !== undefined && stats?.overall_attendance_rate !== null && (stats?.total_students > 0 || stats?.overall_attendance_rate > 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-wrap items-center justify-between gap-6 transition-all">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/40">
              Institutional Administration & Governance
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Academic Operations Command
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time institution analytics, faculty assignments, course registries, and compliance oversight.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/admin/courses')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-4 h-4" />
            Add New Course
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          id="stat-admin-students"
          title="Enrolled Students"
          value={stats?.total_students || 0}
          subtitle="Registered in database"
          icon={<GraduationCap className="w-5 h-5" />}
          accentColor="emerald"
        />

        <StatCard
          id="stat-admin-teachers"
          title="Faculty Members"
          value={stats?.total_teachers || 0}
          subtitle="Academic instructors"
          icon={<Users className="w-5 h-5" />}
          accentColor="indigo"
        />

        <StatCard
          id="stat-admin-courses"
          title="Curricular Courses"
          value={stats?.total_courses || 0}
          subtitle={`${stats?.total_classes || 0} active sections`}
          icon={<BookOpen className="w-5 h-5" />}
          accentColor="sky"
        />

        <StatCard
          id="stat-admin-attendance"
          title="Campus Attendance"
          value={hasAttendance && (stats?.overall_attendance_rate > 0 || stats?.total_attendance_records > 0) ? `${stats?.overall_attendance_rate}%` : 'N/A'}
          subtitle={hasAttendance && (stats?.overall_attendance_rate > 0 || stats?.total_attendance_records > 0) ? "Cumulative average" : "No sessions logged yet"}
          icon={<CalendarCheck className="w-5 h-5" />}
          accentColor={!hasAttendance ? 'indigo' : (stats?.overall_attendance_rate || 0) < 75 ? 'rose' : 'emerald'}
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Academic Risk Profile Distribution
              </h3>
              <p className="text-[11px] text-slate-400">Classified by attendance & assessment thresholds</p>
            </div>
            <button
              onClick={() => onNavigate('/admin/attendance')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Risk Details →
            </button>
          </div>
          <RiskDistributionChart distribution={riskDistribution} height={240} />
        </div>

        {/* Quick Management Panels */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Institutional Administration Portals
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => onNavigate('/admin/students')}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 border border-slate-200 dark:border-slate-700/60 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xs flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">Student Directory</h4>
                <p className="text-[11px] text-slate-500">Manage enrollments & profiles</p>
              </div>
            </div>

            <div
              onClick={() => onNavigate('/admin/teachers')}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 border border-slate-200 dark:border-slate-700/60 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xs flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">Faculty Registry</h4>
                <p className="text-[11px] text-slate-500">Assign course instructors</p>
              </div>
            </div>

            <div
              onClick={() => onNavigate('/admin/courses')}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-sky-50/40 dark:hover:bg-sky-950/20 border border-slate-200 dark:border-slate-700/60 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xs flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">Course Catalog</h4>
                <p className="text-[11px] text-slate-500">Curricula & credits</p>
              </div>
            </div>

            <div
              onClick={() => onNavigate('/admin/classes')}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-purple-50/40 dark:hover:bg-purple-950/20 border border-slate-200 dark:border-slate-700/60 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xs flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">Section Scheduler</h4>
                <p className="text-[11px] text-slate-500">Timetable & capacity</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
