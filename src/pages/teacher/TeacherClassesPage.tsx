import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { ClassItem } from '../../types';
import { Users, Calendar, Clock, ArrowRight, CalendarCheck, Layers } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';

interface TeacherClassesPageProps {
  onNavigate: (path: string) => void;
}

export const TeacherClassesPage: React.FC<TeacherClassesPageProps> = ({ onNavigate }) => {
  const { teacher, loadDemoData } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (teacher) {
      setIsLoading(true);
      api.getClasses()
        .then((data) => setClasses(data))
        .catch(() => setClasses([]))
        .finally(() => setIsLoading(false));
    }
  }, [teacher]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Assigned Teaching Sections
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Section schedules, student enrollments, attendance rosters, and grading cohorts
          </p>
        </div>

        <button
          onClick={() => onNavigate('/teacher/attendance')}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all"
        >
          <CalendarCheck className="w-4 h-4" />
          Take Daily Attendance
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-56 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : classes.length === 0 ? (
        <EmptyState
          title="No class sections assigned."
          description="You currently have no course sections allocated to your instructor profile."
          secondaryActionText="Load Sample Academic Dataset"
          onSecondaryAction={loadDemoData}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {classes.map((cls) => (
            <div
              key={cls.id}
              onClick={() => onNavigate(`/teacher/classes/${cls.id}`)}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs hover:border-indigo-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800/40">
                    {cls.course?.code}
                  </span>
                  <span className="font-semibold text-slate-500 text-xs">
                    Section {cls.section_name} • {cls.academic_term}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {cls.course?.name}
                </h3>

                <div className="space-y-1.5 mt-4 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>Days: {cls.schedule_days}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>Time: {cls.schedule_time} (Room: {cls.room || 'TBA'})</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">
                  {cls.enrolled_students_count || 0} / {cls.capacity || 40} Students
                </span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  View Class Roster <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
