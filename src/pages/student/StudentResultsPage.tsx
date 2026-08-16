import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Badge } from '../../components/common/Badge';
import { formatDate } from '../../lib/utils';
import { Award, Printer, Download, Sparkles, TrendingUp } from 'lucide-react';
import { StudentReportModal } from '../../components/reports/StudentReportModal';
import { EmptyState } from '../../components/common/EmptyState';

interface StudentResultsPageProps {
  onNavigate: (path: string) => void;
}

export const StudentResultsPage: React.FC<StudentResultsPageProps> = ({ onNavigate }) => {
  const { student, loadDemoData } = useAuth();
  const [report, setReport] = useState<any>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (student) {
      setIsLoading(true);
      api.getStudentReport(student.id)
        .then((data) => setReport(data))
        .catch(() => setReport(null))
        .finally(() => setIsLoading(false));
    }
  }, [student]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Academic Grades & Examination Marks
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Official marks evaluated by faculty and verified against grading thresholds
          </p>
        </div>

        {student && (
          <button
            onClick={() => setShowTranscript(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all"
          >
            <Printer className="w-4 h-4" />
            Official Academic Dossier
          </button>
        )}
      </div>

      {/* GPA / Standing Summary */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-wrap items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Cumulative Standing
          </span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            {report?.analytics?.overall_academic_score || 0}%
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Calculated across coursework submissions & formal examinations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge riskLevel={report?.analytics?.academic_risk}>
            {report?.analytics?.academic_risk} Risk Profile
          </Badge>
        </div>
      </div>

      {/* Exam Results Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
          <Award className="w-4 h-4 text-indigo-500" />
          Examination Score Records
        </h3>

        {isLoading ? (
          <div className="py-8 text-center text-slate-400">Loading grade results...</div>
        ) : !report?.exam_results || report.exam_results.length === 0 ? (
          <EmptyState
            title="No examination results recorded."
            description="Grades will appear here once your instructors evaluate examination answer sheets."
            secondaryActionText="Load Sample Academic Dataset"
            onSecondaryAction={loadDemoData}
          />
        ) : (
          <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                <tr>
                  <th className="p-3.5 font-semibold">Exam Title</th>
                  <th className="p-3.5 font-semibold">Marks Obtained</th>
                  <th className="p-3.5 font-semibold">Letter Grade</th>
                  <th className="p-3.5 font-semibold">Grading Date</th>
                  <th className="p-3.5 font-semibold">Faculty Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {report.exam_results.map((res: any) => (
                  <tr key={res.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{res.exam?.name}</td>
                    <td className="p-3.5 font-semibold text-slate-900 dark:text-white">
                      {res.marks_obtained} / {res.exam?.maximum_marks}
                    </td>
                    <td className="p-3.5">
                      <Badge grade={res.grade} />
                    </td>
                    <td className="p-3.5 text-slate-400">{formatDate(res.graded_at)}</td>
                    <td className="p-3.5 text-slate-500 max-w-xs truncate">{res.remarks || 'Standard evaluation'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {student && (
        <StudentReportModal
          isOpen={showTranscript}
          onClose={() => setShowTranscript(false)}
          studentId={student.id}
        />
      )}
    </div>
  );
};
