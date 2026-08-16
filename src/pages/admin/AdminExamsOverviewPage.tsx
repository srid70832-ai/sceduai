import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Examination } from '../../types';
import { Award, Calendar, Clock, BookOpen, Layers } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { EmptyState } from '../../components/common/EmptyState';

interface AdminExamsOverviewPageProps {
  onNavigate: (path: string) => void;
}

export const AdminExamsOverviewPage: React.FC<AdminExamsOverviewPageProps> = ({ onNavigate }) => {
  const { loadDemoData } = useAuth();
  const [exams, setExams] = useState<Examination[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    api.getExaminations()
      .then((data) => setExams(data))
      .catch(() => setExams([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Campus Examination Master Schedule
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Master timetable for midterm, practical, and final comprehensive examinations
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : exams.length === 0 ? (
        <EmptyState
          title="No scheduled examinations found."
          description="Faculty have not scheduled university examinations yet."
          secondaryActionText="Load Sample Academic Dataset"
          onSecondaryAction={loadDemoData}
        />
      ) : (
        <div className="space-y-4">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                  <Award className="w-6 h-6" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">
                      {exam.course?.code}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">• {exam.course?.name}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight mt-0.5">
                    {exam.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(exam.exam_date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {exam.start_time} ({exam.duration_minutes} mins)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-right">
                  <span className="text-slate-400 block text-[11px]">Maximum Marks</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{exam.maximum_marks}</span>
                </div>
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800/40 text-right">
                  <span className="text-indigo-500 block text-[11px]">Weightage</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">{exam.weightage_percent}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
