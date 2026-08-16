import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Badge } from '../../components/common/Badge';
import { Search, User, Eye, Sparkles, Filter, FileSpreadsheet } from 'lucide-react';
import { StudentReportModal } from '../../components/reports/StudentReportModal';
import { EmptyState } from '../../components/common/EmptyState';

interface TeacherStudentAnalyticsPageProps {
  onNavigate: (path: string) => void;
}

export const TeacherStudentAnalyticsPage: React.FC<TeacherStudentAnalyticsPageProps> = ({ onNavigate }) => {
  const { teacher, loadDemoData } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (teacher) {
      setIsLoading(true);
      api.getClasses()
        .then(async (clss) => {
          setClasses(clss);
          const allStudents: any[] = [];
          for (const cls of clss) {
            const report = await api.getClassReport(cls.id).catch(() => null);
            if (report?.students) {
              report.students.forEach((st: any) => {
                if (!allStudents.some((s) => s.student_id === st.student_id)) {
                  allStudents.push({ ...st, className: `${cls.course?.code} - ${cls.section_name}` });
                }
              });
            }
          }
          setStudents(allStudents);
        })
        .catch(() => setStudents([]))
        .finally(() => setIsLoading(false));
    }
  }, [teacher]);

  const filtered = students.filter((st) => {
    const matchSearch =
      st.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      st.roll_number?.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Student Academic Diagnostics & Risk Roster
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Monitor at-risk students, view attendance trends, and inspect full individual academic dossiers
        </p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3 shadow-xs">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name or roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
          Enrolled Cohort ({filtered.length} Students)
        </h3>

        {isLoading ? (
          <div className="py-12 text-center text-slate-400">Loading student diagnostics...</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No students found."
            description="There are currently no students matching your search criteria."
            secondaryActionText="Load Sample Academic Dataset"
            onSecondaryAction={loadDemoData}
          />
        ) : (
          <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                <tr>
                  <th className="p-3.5 font-semibold">Roll Number</th>
                  <th className="p-3.5 font-semibold">Student Name</th>
                  <th className="p-3.5 font-semibold">Enrolled Section</th>
                  <th className="p-3.5 font-semibold">Attendance Rate</th>
                  <th className="p-3.5 font-semibold">Academic Score</th>
                  <th className="p-3.5 font-semibold">Risk Classification</th>
                  <th className="p-3.5 font-semibold text-right">Academic Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((st) => (
                  <tr key={st.student_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 font-mono text-[11px] text-slate-400">{st.roll_number}</td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{st.full_name}</td>
                    <td className="p-3.5 text-slate-500">{st.className}</td>
                    <td className="p-3.5">
                      <span className={`font-bold ${st.attendance_rate < 75 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {st.attendance_rate}%
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900 dark:text-white">
                      {st.academic_score}%
                    </td>
                    <td className="p-3.5">
                      <Badge riskLevel={st.risk_level}>{st.risk_level}</Badge>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedStudentId(st.student_id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Dossier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedStudentId && (
        <StudentReportModal
          isOpen={!!selectedStudentId}
          onClose={() => setSelectedStudentId(null)}
          studentId={selectedStudentId}
        />
      )}
    </div>
  );
};
