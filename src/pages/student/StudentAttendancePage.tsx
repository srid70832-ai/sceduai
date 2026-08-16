import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { AcademicAnalyticsSummary } from '../../types';
import { CalendarCheck, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { EmptyState } from '../../components/common/EmptyState';

interface StudentAttendancePageProps {
  onNavigate: (path: string) => void;
}

export const StudentAttendancePage: React.FC<StudentAttendancePageProps> = ({ onNavigate }) => {
  const { student, loadDemoData } = useAuth();
  const [analytics, setAnalytics] = useState<AcademicAnalyticsSummary | null>(null);
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (student) {
      setIsLoading(true);
      Promise.all([
        api.getStudentAnalytics(student.id).catch(() => null),
        api.getStudentReport(student.id).catch(() => null)
      ]).then(([a, r]) => {
        setAnalytics(a);
        setReport(r);
      }).finally(() => {
        setIsLoading(false);
      });
    }
  }, [student]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-3 h-3" /> Present
          </span>
        );
      case 'ABSENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" /> Absent
          </span>
        );
      case 'LATE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" /> Late
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            Excused
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Attendance Record & Examination Eligibility
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Session-by-session logs calculated against the mandatory 75% institutional attendance threshold
        </p>
      </div>

      {/* Threshold Status Card */}
      <div className={`p-6 rounded-3xl border flex flex-wrap items-center justify-between gap-4 ${
        (analytics?.attendance_percentage || 0) < 75
          ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-500/30'
          : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${
            (analytics?.attendance_percentage || 0) < 75
              ? 'bg-rose-600 text-white'
              : 'bg-emerald-600 text-white'
          }`}>
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {(analytics?.attendance_percentage || 0) >= 75
                ? 'Examination Attendance Cleared'
                : 'Warning: Low Attendance Threshold (<75%)'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Cumulative presence: {analytics?.total_classes_attended || 0} of {analytics?.total_classes_conducted || 0} sessions conducted.
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {analytics?.attendance_percentage || 0}%
          </div>
          <div className="text-[11px] text-slate-500 font-medium">Cumulative Attendance</div>
        </div>
      </div>

      {/* Course Breakdown Cards */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Course-Level Attendance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analytics?.subject_breakdowns?.map((sub) => (
            <div
              key={sub.course_id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">
                  {sub.course_code}
                </span>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{sub.course_name}</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Attended: {sub.classes_attended} / {sub.total_classes} sessions
                </p>
              </div>

              <div className="text-right">
                <div className={`text-xl font-bold ${sub.attendance_rate < 75 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {sub.attendance_rate}%
                </div>
                <div className="w-24 bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${sub.attendance_rate < 75 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{ width: `${sub.attendance_rate}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Session Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Session-by-Session Audit Logs</h3>

        {!report?.attendance_records || report.attendance_records.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No attendance records logged in database yet.
          </p>
        ) : (
          <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                <tr>
                  <th className="p-3 font-semibold">Record ID</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold">Remarks / Instructor Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {report.attendance_records.map((rec: any) => (
                  <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 font-mono text-[11px] text-slate-400">{rec.id}</td>
                    <td className="p-3">{getStatusBadge(rec.status)}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{rec.remarks || 'Regular lecture session'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
