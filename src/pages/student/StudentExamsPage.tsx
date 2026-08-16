import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Examination } from '../../types';
import { Award, Clock, Calendar, BookOpen } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { EmptyState } from '../../components/common/EmptyState';

interface StudentExamsPageProps {
  onNavigate: (path: string) => void;
}

export const StudentExamsPage: React.FC<StudentExamsPageProps> = ({ onNavigate }) => {
  const { student, loadDemoData } = useAuth();
  const [exams, setExams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (student) {
      setIsLoading(true);
      api.getExaminations()
        .then((data) => setExams(data))
        .catch(() => setExams([]))
        .finally(() => setIsLoading(false));
    }
  }, [student]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Scheduled Examinations & Assessments
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Midterms, final assessments, laboratory evaluations, and weightages
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : exams.length === 0 ? (
        <EmptyState
          title="No examinations scheduled."
          description="There are currently no active examinations listed for your enrolled courses."
          secondaryActionText="Load Sample Academic Dataset"
          onSecondaryAction={loadDemoData}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800/40">
                  {exam.course?.code}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {exam.exam_type}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">
                  {exam.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{exam.course?.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Date: <strong>{formatDate(exam.exam_date)}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Time: <strong>{exam.start_time} ({exam.duration_minutes}m)</strong></span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-500">Maximum Marks: <strong>{exam.maximum_marks}</strong></span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">Weightage: {exam.weightage_percent}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
