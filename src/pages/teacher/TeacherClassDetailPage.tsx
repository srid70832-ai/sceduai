import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Users, CalendarCheck, FileCheck, Award, Printer, Sparkles } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { ClassReportModal } from '../../components/reports/ClassReportModal';
import { EmptyState } from '../../components/common/EmptyState';

interface TeacherClassDetailPageProps {
  classId: string;
  onNavigate: (path: string) => void;
}

export const TeacherClassDetailPage: React.FC<TeacherClassDetailPageProps> = ({ classId, onNavigate }) => {
  const [classData, setClassData] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      api.getClass(classId).catch(() => null),
      api.getClassReport(classId).catch(() => null)
    ]).then(([cls, rep]) => {
      setClassData(cls);
      setReport(rep);
    }).finally(() => {
      setIsLoading(false);
    });
  }, [classId]);

  if (isLoading) {
    return <div className="py-12 text-center text-slate-400">Loading section roster and academic records...</div>;
  }

  if (!classData) {
    return <div className="py-12 text-center text-slate-400">Class section not found.</div>;
  }

  return (
    <div className="space-y-8">
      <button
        onClick={() => onNavigate('/teacher/classes')}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Assigned Sections
      </button>

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800/40">
              {classData.course?.code}
            </span>
            <span className="text-xs text-slate-400">Section {classData.section_name} • {classData.academic_term}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {classData.course?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Schedule: {classData.schedule_days} at {classData.schedule_time} • Room {classData.room || 'TBA'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate(`/teacher/attendance?classId=${classId}`)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all"
          >
            <CalendarCheck className="w-4 h-4" />
            Mark Attendance
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
          >
            <Printer className="w-4 h-4 text-indigo-500" />
            Class Academic Dossier
          </button>
        </div>
      </div>

      {/* Enrolled Students Roster Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" />
              Enrolled Student Roster ({report?.students?.length || 0})
            </h3>
            <p className="text-[11px] text-slate-400">Live academic performance metrics from database</p>
          </div>
        </div>

        {!report?.students || report.students.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">No students currently enrolled in this section.</p>
        ) : (
          <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                <tr>
                  <th className="p-3.5 font-semibold">Roll Number</th>
                  <th className="p-3.5 font-semibold">Student Name</th>
                  <th className="p-3.5 font-semibold">Attendance Rate</th>
                  <th className="p-3.5 font-semibold">Academic Score</th>
                  <th className="p-3.5 font-semibold">Risk Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {report.students.map((st: any) => (
                  <tr key={st.student_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 font-mono text-[11px] text-slate-400">{st.roll_number}</td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{st.full_name}</td>
                    <td className="p-3.5">
                      <span className={`font-semibold ${st.attendance_rate < 75 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {st.attendance_rate}%
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900 dark:text-white">
                      {st.academic_score}%
                    </td>
                    <td className="p-3.5">
                      <Badge riskLevel={st.risk_level}>{st.risk_level}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ClassReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        classId={classId}
      />
    </div>
  );
};
