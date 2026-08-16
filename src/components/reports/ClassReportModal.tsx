import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { Badge } from '../common/Badge';
import { EduSenseLogo } from '../common/EduSenseLogo';
import { Printer } from 'lucide-react';

interface ClassReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
}

export const ClassReportModal: React.FC<ClassReportModalProps> = ({ isOpen, onClose, classId }) => {
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen && classId) {
      setIsLoading(true);
      api.getClassReport(classId)
        .then((data) => setReport(data))
        .catch(() => setReport(null))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, classId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Class Cohort Performance Report"
      subtitle="Comprehensive section-level academic analytics"
      maxWidth="3xl"
    >
      {isLoading ? (
        <div className="py-12 text-center text-slate-400 animate-pulse">
          Generating class section audit report...
        </div>
      ) : !report ? (
        <div className="py-8 text-center text-slate-400">
          No records found for this class section.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <EduSenseLogo size="sm" showTagline={true} />
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs print:hidden cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                {report.course?.code}
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {report.course?.name} - {report.class?.section_name}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Faculty Instructor: <strong>{report.teacher?.profile?.full_name || 'Assigned Faculty'}</strong>
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">Enrolled Students</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {report.student_count || 0}
              </div>
            </div>
          </div>

          {/* Student Roster Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Student Roster & Risk Breakdown
            </h4>
            {report.students?.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No students currently enrolled in this section.</p>
            ) : (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                    <tr>
                      <th className="p-2.5 font-semibold">Roll No</th>
                      <th className="p-2.5 font-semibold">Student Name</th>
                      <th className="p-2.5 font-semibold">Attendance</th>
                      <th className="p-2.5 font-semibold">Academic Score</th>
                      <th className="p-2.5 font-semibold">Risk Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {report.students?.map((st: any) => (
                      <tr key={st.student_id}>
                        <td className="p-2.5 font-medium text-slate-900 dark:text-white">{st.roll_number}</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-300">{st.full_name}</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-300">{st.attendance_percentage}%</td>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-white">{st.overall_score}%</td>
                        <td className="p-2.5">
                          <Badge riskLevel={st.risk_level} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex justify-between items-center">
            <span>Generated on: {formatDate(report.generated_at)}</span>
            <span>SC EduSense AI Class Report</span>
          </div>
        </div>
      )}
    </Modal>
  );
};
