import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { AcademicAnalyticsSummary, AIStudentRecommendation, Assignment } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { AttendanceChart } from '../../components/charts/AttendanceChart';
import { PerformanceChart } from '../../components/charts/PerformanceChart';
import { AIRecommendationCard } from '../../components/ai/AIRecommendationCard';
import { EmptyState } from '../../components/common/EmptyState';
import { DashboardSkeleton } from '../../components/common/Skeleton';
import { formatDate } from '../../lib/utils';
import { BookOpen, CalendarCheck, FileCheck, Award, Sparkles, Clock, AlertCircle } from 'lucide-react';

interface StudentDashboardProps {
  onNavigate: (path: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { student, user } = useAuth();
  const [analytics, setAnalytics] = useState<AcademicAnalyticsSummary | null>(null);
  const [aiData, setAiData] = useState<AIStudentRecommendation | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  useEffect(() => {
    if (student) {
      setIsLoading(true);
      Promise.all([
        api.getStudentAnalytics(student.id).catch(() => null),
        api.getAssignments().catch(() => [])
      ]).then(([analyticsRes, assignmentsRes]) => {
        setAnalytics(analyticsRes);
        setAssignments(assignmentsRes);
      }).finally(() => {
        setIsLoading(false);
      });

      // Fetch AI
      setAiLoading(true);
      api.getStudentAIRecommendations(student.id)
        .then((ai) => setAiData(ai))
        .catch(() => null)
        .finally(() => setAiLoading(false));
    }
  }, [student]);

  const refreshAI = () => {
    if (student) {
      setAiLoading(true);
      api.getStudentAIRecommendations(student.id)
        .then((ai) => setAiData(ai))
        .catch(() => null)
        .finally(() => setAiLoading(false));
    }
  };

  if (!student) {
    return (
      <EmptyState
        title="Student record not active."
        description="Please sign in with a registered student account to view academic analytics."
        actionText="Sign In"
        onAction={() => onNavigate('/login')}
      />
    );
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const hasAttendanceRecords = (analytics?.total_attendance_sessions || 0) > 0;
  const hasAcademicScore = (analytics?.has_data && (analytics?.completed_exams || 0) + (analytics?.graded_assignments || 0) > 0);

  // Generate chart data for attendance
  const attendanceChartData = analytics?.subject_breakdowns?.map((sub) => ({
    name: sub.course_code,
    rate: sub.attendance_rate,
    present: Math.round((sub.attendance_rate / 100) * 12),
    absent: Math.round(((100 - sub.attendance_rate) / 100) * 12)
  })) || [];

  // Generate chart data for scores
  const scoreChartData = analytics?.subject_breakdowns?.map((sub) => ({
    name: sub.course_code,
    score: sub.overall_score,
    classAverage: 78
  })) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-wrap items-center justify-between gap-6 transition-all">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
              Active Student Record • Roll: {student.roll_number}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {student.major || student.department} • Semester {student.semester} • Synchronized with institutional records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/student/ai-insights')}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-500/20 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            AI Study Diagnostic
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          id="stat-attendance-rate"
          title="Attendance Rate"
          value={hasAttendanceRecords ? `${analytics?.attendance_percentage}%` : 'N/A'}
          subtitle={
            hasAttendanceRecords
              ? `${analytics?.present_sessions || 0} of ${analytics?.total_attendance_sessions || 0} sessions`
              : 'No attendance marked yet'
          }
          icon={<CalendarCheck className="w-5 h-5" />}
          accentColor={
            !hasAttendanceRecords
              ? 'sky'
              : (analytics?.attendance_percentage || 0) < 75
              ? 'rose'
              : (analytics?.attendance_percentage || 0) < 85
              ? 'amber'
              : 'emerald'
          }
          trend={
            hasAttendanceRecords
              ? {
                  value: (analytics?.attendance_percentage || 0) >= 75 ? 'Eligible for Exams' : 'Low Attendance Alert',
                  isPositive: (analytics?.attendance_percentage || 0) >= 75
                }
              : undefined
          }
        />

        <StatCard
          id="stat-academic-standing"
          title="Overall Standing"
          value={hasAcademicScore ? `${analytics?.overall_academic_score}%` : 'N/A'}
          subtitle={hasAcademicScore ? 'Assignments + Examinations' : 'No graded evaluations yet'}
          icon={<Award className="w-5 h-5" />}
          accentColor={hasAcademicScore ? 'indigo' : 'sky'}
          trend={
            analytics?.has_data && analytics?.academic_risk && analytics.academic_risk !== 'none'
              ? {
                  value: `Risk: ${analytics.academic_risk.toUpperCase()}`,
                  isPositive: analytics.academic_risk === 'low'
                }
              : undefined
          }
        />

        <StatCard
          id="stat-assignments-progress"
          title="Assignments"
          value={`${analytics?.submitted_assignments || 0} / ${analytics?.total_assignments || 0}`}
          subtitle={`${Math.max(0, (analytics?.total_assignments || 0) - (analytics?.submitted_assignments || 0))} pending submission`}
          icon={<FileCheck className="w-5 h-5" />}
          accentColor="sky"
        />

        <StatCard
          id="stat-enrolled-courses"
          title="Enrolled Courses"
          value={analytics?.total_courses || 0}
          subtitle="Active curriculum registrations"
          icon={<BookOpen className="w-5 h-5" />}
          accentColor="emerald"
        />
      </div>

      {/* AI Recommendation Engine Box */}
      <AIRecommendationCard data={aiData} isLoading={aiLoading} onRefresh={refreshAI} />

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance by Course */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Attendance by Course</h3>
              <p className="text-[11px] text-slate-400">Attendance percentages across enrolled courses</p>
            </div>
            <button
              onClick={() => onNavigate('/student/attendance')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Full Log →
            </button>
          </div>
          {attendanceChartData.length > 0 ? (
            <AttendanceChart data={attendanceChartData} type="area" height={220} />
          ) : (
            <div className="h-[220px] flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
              <CalendarCheck className="w-8 h-8 opacity-40 text-slate-400" />
              <span>No attendance logs recorded for enrolled courses yet.</span>
            </div>
          )}
        </div>

        {/* Academic Performance by Course */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Academic Performance by Course</h3>
              <p className="text-[11px] text-slate-400">Weighted scores vs class benchmark</p>
            </div>
            <button
              onClick={() => onNavigate('/student/results')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              View Marks →
            </button>
          </div>
          {scoreChartData.length > 0 ? (
            <PerformanceChart data={scoreChartData} height={220} />
          ) : (
            <div className="h-[220px] flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
              <Award className="w-8 h-8 opacity-40 text-slate-400" />
              <span>No graded assessment marks published yet.</span>
            </div>
          )}
        </div>
      </div>

      {/* Active Assignments & Next Deadlines */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Upcoming Academic Deadlines</h3>
            <p className="text-[11px] text-slate-400">Assignments & examinations requiring action</p>
          </div>
          <button
            onClick={() => onNavigate('/student/assignments')}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
          >
            All Assignments ({assignments.length}) →
          </button>
        </div>

        {assignments.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No assignments currently pending in database.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {assignments.slice(0, 4).map((asg) => (
              <div
                key={asg.id}
                onClick={() => onNavigate(`/student/assignments/${asg.id}`)}
                className="py-3.5 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-xl cursor-pointer transition-all duration-150 hover:translate-x-1"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{asg.title}</h4>
                    <p className="text-[11px] text-slate-500">
                      {asg.course?.code} • Max {asg.maximum_marks} marks
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="text-right">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" />
                      Due: {formatDate(asg.due_date)}
                    </div>
                  </div>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                    Submit →
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
