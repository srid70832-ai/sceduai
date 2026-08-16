import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { ClassItem, Assignment, AITeacherInsight } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { AITeacherInsightCard } from '../../components/ai/AITeacherInsightCard';
import { Users, BookOpen, CalendarCheck, FileCheck, Sparkles } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';
import { DashboardSkeleton } from '../../components/common/Skeleton';

interface TeacherDashboardProps {
  onNavigate: (path: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigate }) => {
  const { teacher, user } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [aiData, setAiData] = useState<AITeacherInsight | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  useEffect(() => {
    if (teacher) {
      setIsLoading(true);
      Promise.all([
        api.getClasses().catch(() => []),
        api.getAssignments().catch(() => [])
      ]).then(([clsRes, asgRes]) => {
        setClasses(clsRes);
        setAssignments(asgRes);

        // Fetch AI for first class if available
        if (clsRes.length > 0) {
          setAiLoading(true);
          api.getClassAIInsights(clsRes[0].id)
            .then((ai) => setAiData(ai))
            .catch(() => null)
            .finally(() => setAiLoading(false));
        }
      }).finally(() => {
        setIsLoading(false);
      });
    }
  }, [teacher]);

  const refreshAI = () => {
    if (classes.length > 0) {
      setAiLoading(true);
      api.getClassAIInsights(classes[0].id)
        .then((ai) => setAiData(ai))
        .catch(() => null)
        .finally(() => setAiLoading(false));
    }
  };

  const totalStudents = classes.reduce((sum, c) => sum + (c.enrolled_students_count || 0), 0);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-wrap items-center justify-between gap-6 transition-all">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800/40">
              Faculty Profile • Code: {teacher?.employee_code || 'FAC-01'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Welcome, Professor {user?.full_name}!
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {teacher?.department || user?.department} • Teaching Dashboard & Academic Record Management
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/teacher/attendance')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            <CalendarCheck className="w-4 h-4" />
            Mark Today's Attendance
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          id="stat-assigned-classes"
          title="Assigned Sections"
          value={classes.length}
          subtitle="Active academic sections"
          icon={<BookOpen className="w-5 h-5" />}
          accentColor="indigo"
        />

        <StatCard
          id="stat-total-students"
          title="Total Students Taught"
          value={totalStudents}
          subtitle="Enrolled across sections"
          icon={<Users className="w-5 h-5" />}
          accentColor="emerald"
        />

        <StatCard
          id="stat-active-assignments"
          title="Active Courseworks"
          value={assignments.length}
          subtitle="Assignments published"
          icon={<FileCheck className="w-5 h-5" />}
          accentColor="sky"
        />

        <StatCard
          id="stat-risk-alerts"
          title="At-Risk Alerts"
          value={aiData?.students_requiring_attention?.length || aiData?.at_risk_students?.length || 0}
          subtitle="Requiring intervention"
          icon={<Sparkles className="w-5 h-5" />}
          accentColor={(aiData?.students_requiring_attention?.length || aiData?.at_risk_students?.length) ? 'rose' : 'emerald'}
        />
      </div>

      {/* AI Cohort Insight Card */}
      <AITeacherInsightCard data={aiData} isLoading={aiLoading} onRefresh={refreshAI} />

      {/* Assigned Sections Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Assigned Class Sections</h3>
            <p className="text-[11px] text-slate-400">Manage schedules, attendance, and student rosters</p>
          </div>
          <button
            onClick={() => onNavigate('/teacher/classes')}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
          >
            All Sections ({classes.length}) →
          </button>
        </div>

        {classes.length === 0 ? (
          <EmptyState
            title="No assigned classes."
            description="You have not been assigned any class sections in the current academic term."
            actionText="View Department Classes"
            onAction={() => onNavigate('/teacher/classes')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classes.map((cls) => (
              <div
                key={cls.id}
                onClick={() => onNavigate(`/teacher/classes/${cls.id}`)}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 border border-slate-200 dark:border-slate-700/60 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {cls.course?.code}
                    </span>
                    <span className="text-slate-400 font-medium">Section {cls.section_name}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {cls.course?.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {cls.schedule_days} • {cls.schedule_time} (Room: {cls.room || 'TBA'})
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">
                    {cls.enrolled_students_count || 0} / {cls.capacity || 40} Students Enrolled
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                    Manage Section →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
