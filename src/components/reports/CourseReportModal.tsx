import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { EduSenseLogo } from '../common/EduSenseLogo';
import { Printer } from 'lucide-react';

interface CourseReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
}

export const CourseReportModal: React.FC<CourseReportModalProps> = ({ isOpen, onClose, courseId }) => {
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen && courseId) {
      setIsLoading(true);
      api.getCourseReport(courseId)
        .then((data) => setReport(data))
        .catch(() => setReport(null))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, courseId]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Curricular Course Summary Report"
      subtitle="Course structural overview & enrollment metrics"
      maxWidth="2xl"
    >
      {isLoading ? (
        <div className="py-12 text-center text-slate-400 animate-pulse">
          Generating course summary dossier...
        </div>
      ) : !report ? (
        <div className="py-8 text-center text-slate-400">
          Course record not found.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <EduSenseLogo size="sm" showTagline={true} />
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs print:hidden cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              {report.course?.code}
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {report.course?.name}
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{report.course?.description}</p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-white dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] text-slate-500 uppercase">Active Sections</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {report.classes?.length || 0}
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] text-slate-500 uppercase">Total Enrolled</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {report.total_enrolled || 0}
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] text-slate-500 uppercase">Credits</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {report.course?.credits || 3}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Syllabus Outline
            </h4>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed font-mono">
              {report.course?.syllabus || 'Standard university syllabus units.'}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex justify-between items-center">
            <span>Generated on: {formatDate(report.generated_at)}</span>
            <span>SC EduSense AI Course Dossier</span>
          </div>
        </div>
      )}
    </Modal>
  );
};
