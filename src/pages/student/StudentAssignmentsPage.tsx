import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Assignment } from '../../types';
import { FileCheck, Clock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDate } from '../../lib/utils';

interface StudentAssignmentsPageProps {
  onNavigate: (path: string) => void;
}

export const StudentAssignmentsPage: React.FC<StudentAssignmentsPageProps> = ({ onNavigate }) => {
  const { student, loadDemoData } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'SUBMITTED' | 'EVALUATED'>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (student) {
      setIsLoading(true);
      api.getAssignments()
        .then((data) => setAssignments(data))
        .catch(() => setAssignments([]))
        .finally(() => setIsLoading(false));
    }
  }, [student]);

  const filtered = assignments.filter((a) => {
    if (filter === 'PENDING') return !a.my_submission;
    if (filter === 'SUBMITTED') return a.my_submission && a.my_submission.status !== 'EVALUATED';
    if (filter === 'EVALUATED') return a.my_submission && a.my_submission.status === 'EVALUATED';
    return true;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Assignments & Coursework
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Submit coursework, track evaluation feedback, and review deadlines
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          {(['ALL', 'PENDING', 'SUBMITTED', 'EVALUATED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === tab
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No assignments found."
          description={`There are currently no assignments matching the "${filter.toLowerCase()}" filter.`}
          secondaryActionText="Load Sample Academic Dataset"
          onSecondaryAction={loadDemoData}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((asg) => {
            const isLate = new Date() > new Date(asg.due_date);
            const mySub = asg.my_submission;

            return (
              <div
                key={asg.id}
                onClick={() => onNavigate(`/student/assignments/${asg.id}`)}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-indigo-500/50 hover:shadow-md transition-all cursor-pointer flex flex-wrap items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    mySub?.status === 'EVALUATED'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : mySub
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : isLate
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                  }`}>
                    <FileCheck className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                        {asg.course?.code}
                      </span>
                      <span className="text-xs text-slate-400">• {asg.class?.section_name || 'Section A'}</span>
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight mt-0.5">
                      {asg.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-1 mt-1 max-w-md">
                      {asg.description || 'Assignment problem set.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right">
                    <div className="text-slate-400 text-[11px]">Due: {formatDate(asg.due_date)}</div>
                    <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                      Max {asg.maximum_marks} marks
                    </div>
                  </div>

                  <div>
                    {mySub?.status === 'EVALUATED' ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 text-xs">
                        {mySub.marks_obtained} / {asg.maximum_marks} Marks
                      </span>
                    ) : mySub ? (
                      <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/20 text-xs">
                        Submitted
                      </span>
                    ) : isLate ? (
                      <span className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold border border-rose-500/20 text-xs">
                        Past Due
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-xs">
                        Submit Now
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
