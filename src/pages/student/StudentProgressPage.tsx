import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { AcademicAnalyticsSummary } from '../../types';
import { PerformanceChart } from '../../components/charts/PerformanceChart';
import { AttendanceChart } from '../../components/charts/AttendanceChart';
import { TrendingUp, BookOpen, CalendarCheck, Award, Sparkles } from 'lucide-react';

interface StudentProgressPageProps {
  onNavigate: (path: string) => void;
}

export const StudentProgressPage: React.FC<StudentProgressPageProps> = ({ onNavigate }) => {
  const { student } = useAuth();
  const [analytics, setAnalytics] = useState<AcademicAnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (student) {
      setIsLoading(true);
      api.getStudentAnalytics(student.id)
        .then((data) => setAnalytics(data))
        .catch(() => setAnalytics(null))
        .finally(() => setIsLoading(false));
    }
  }, [student]);

  const scoreChartData = analytics?.subject_breakdowns?.map((sub) => ({
    name: sub.course_code,
    score: sub.overall_score,
    classAverage: 75
  })) || [];

  const attendanceChartData = analytics?.subject_breakdowns?.map((sub) => ({
    name: sub.course_code,
    rate: sub.attendance_rate,
    present: Math.round((sub.attendance_rate / 100) * 10),
    absent: Math.round(((100 - sub.attendance_rate) / 100) * 10)
  })) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Academic Progress & Performance Metrics
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          In-depth comparative subject analytics and cumulative semester metrics
        </p>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium uppercase">Weighted Standing</span>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {analytics?.overall_academic_score || 0}%
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Calculated combining coursework assignments (40%) and formal assessments (60%).
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium uppercase">Cumulative Attendance</span>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {analytics?.attendance_percentage || 0}%
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {analytics?.total_classes_attended || 0} sessions attended across {analytics?.total_classes_conducted || 0} scheduled sessions.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium uppercase">Completion Velocity</span>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {analytics?.completed_assignments || 0} Tasks
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {analytics?.pending_assignments || 0} assignments pending submission deadline.
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">
            Subject Performance vs University Average
          </h3>
          <PerformanceChart data={scoreChartData} height={240} />
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">
            Course Attendance Distribution
          </h3>
          <AttendanceChart data={attendanceChartData} type="area" height={240} />
        </div>
      </div>
    </div>
  );
};
