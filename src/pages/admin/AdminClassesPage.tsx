import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ClassItem, Course, Teacher } from '../../types';
import { Layers, Plus, Users, CalendarCheck, Clock, Building, Eye } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { ClassReportModal } from '../../components/reports/ClassReportModal';
import { EmptyState } from '../../components/common/EmptyState';

interface AdminClassesPageProps {
  onNavigate: (path: string) => void;
}

export const AdminClassesPage: React.FC<AdminClassesPageProps> = ({ onNavigate }) => {
  const { loadDemoData } = useAuth();
  const { showToast } = useToast();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [courseId, setCourseId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [sectionName, setSectionName] = useState('A');
  const [academicTerm, setAcademicTerm] = useState('Fall 2026');
  const [scheduleDays, setScheduleDays] = useState('Mon, Wed, Fri');
  const [scheduleTime, setScheduleTime] = useState('10:00 AM - 11:30 AM');
  const [room, setRoom] = useState('Room 302, Turing Science Hall');
  const [capacity, setCapacity] = useState<number>(40);

  const fetchData = () => {
    setIsLoading(true);
    Promise.all([
      api.getClasses().catch(() => []),
      api.getCourses().catch(() => []),
      api.getTeachers().catch(() => [])
    ]).then(([clss, crss, tchs]) => {
      setClasses(clss);
      setCourses(crss);
      setTeachers(tchs);
      if (crss.length > 0) setCourseId(crss[0].id);
      if (tchs.length > 0) setTeacherId(tchs[0].id);
    }).finally(() => {
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !teacherId || !sectionName) {
      showToast('Please select course, instructor, and section name.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createClass({
        course_id: courseId,
        teacher_id: teacherId,
        section_name: sectionName,
        academic_term: academicTerm,
        schedule_days: scheduleDays,
        schedule_time: scheduleTime,
        room,
        capacity: Number(capacity) || 40
      });

      showToast(`Class section ${sectionName} created successfully!`, 'success');
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create section', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Academic Class Sections & Scheduling
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Section allocations, instructor assignments, timetable schedules, and classroom routing
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          Schedule Class Section
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : classes.length === 0 ? (
        <EmptyState
          title="No class sections scheduled."
          description="There are currently no active sections in the timetable."
          actionText="Schedule Section"
          onAction={() => setIsModalOpen(true)}
          secondaryActionText="Load Sample Academic Dataset"
          onSecondaryAction={loadDemoData}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800/40">
                    {cls.course?.code} - Section {cls.section_name}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">{cls.academic_term}</span>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">
                  {cls.course?.name}
                </h3>

                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
                  Instructor: {cls.teacher?.profile?.full_name || 'Faculty Member'}
                </p>

                <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{cls.schedule_days} • {cls.schedule_time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{cls.room || 'Room TBA'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Capacity: {cls.capacity} seats</span>
                <button
                  onClick={() => setSelectedClassId(cls.id)}
                  className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 hover:underline"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Section Dossier
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule New Class Section"
        maxWidth="xl"
      >
        <form onSubmit={handleCreateClass} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Curricular Course *
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Assigned Instructor *
              </label>
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.profile?.full_name} ({t.employee_code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Section Name *
              </label>
              <input
                type="text"
                required
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                placeholder="A"
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Academic Term
              </label>
              <input
                type="text"
                value={academicTerm}
                onChange={(e) => setAcademicTerm(e.target.value)}
                placeholder="Fall 2026"
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Capacity
              </label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Schedule Days
              </label>
              <input
                type="text"
                value={scheduleDays}
                onChange={(e) => setScheduleDays(e.target.value)}
                placeholder="Mon, Wed, Fri"
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Schedule Time
              </label>
              <input
                type="text"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                placeholder="10:00 AM - 11:30 AM"
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Classroom Location
            </label>
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="e.g. Science Block, Room 204"
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Scheduling...' : 'Confirm Section'}
            </button>
          </div>
        </form>
      </Modal>

      {selectedClassId && (
        <ClassReportModal
          isOpen={!!selectedClassId}
          onClose={() => setSelectedClassId(null)}
          classId={selectedClassId}
        />
      )}
    </div>
  );
};
