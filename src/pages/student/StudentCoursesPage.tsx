import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { Enrollment } from '../../types';
import { 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  Plus, 
  CheckCircle, 
  Clock, 
  Award, 
  AlertCircle, 
  Trash2, 
  History, 
  CheckCircle2, 
  BarChart2, 
  User, 
  FileText,
  Building,
  GraduationCap
} from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';

interface StudentCoursesPageProps {
  onNavigate: (path: string) => void;
}

export const StudentCoursesPage: React.FC<StudentCoursesPageProps> = ({ onNavigate }) => {
  const { student, loadDemoData } = useAuth();
  const { showToast } = useToast();
  
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ENROLLED' | 'WAITLISTED' | 'DROPPED'>('ALL');
  
  // Modals
  const [droppingEnrollment, setDroppingEnrollment] = useState<Enrollment | null>(null);
  const [isDropping, setIsDropping] = useState<boolean>(false);
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState<boolean>(false);

  const fetchEnrollments = () => {
    if (!student) return;
    setIsLoading(true);
    api.getEnrollments()
      .then((data) => setEnrollments(data))
      .catch(() => setEnrollments([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchEnrollments();
  }, [student]);

  const handleDropConfirm = async () => {
    if (!droppingEnrollment) return;

    setIsDropping(true);
    try {
      await api.dropEnrollment(droppingEnrollment.id);
      showToast(`Successfully dropped ${droppingEnrollment.course?.code || 'course'}.`, 'info');
      setDroppingEnrollment(null);
      fetchEnrollments();
    } catch (err: any) {
      showToast(err.message || 'Failed to drop course.', 'error');
    } finally {
      setIsDropping(false);
    }
  };

  const handleOpenAudit = () => {
    setShowAuditModal(true);
    setIsLoadingAudit(true);
    api.getRegistrationAudit()
      .then((data) => setAuditLogs(data))
      .catch(() => setAuditLogs([]))
      .finally(() => setIsLoadingAudit(false));
  };

  const activeEnrollments = useMemo(() => {
    return enrollments.filter((e) => e.status !== 'DROPPED');
  }, [enrollments]);

  const filteredEnrollments = useMemo(() => {
    if (statusFilter === 'ALL') return enrollments;
    return enrollments.filter((e) => (e.status || 'ENROLLED').toUpperCase() === statusFilter);
  }, [enrollments, statusFilter]);

  const totalCredits = useMemo(() => {
    return activeEnrollments.reduce((acc, curr) => acc + (curr.course?.credits || 0), 0);
  }, [activeEnrollments]);

  const avgAttendance = useMemo(() => {
    const records = activeEnrollments.filter((e) => e.attendance_percentage !== null && e.attendance_percentage !== undefined);
    if (records.length === 0) return null;
    return Math.round(records.reduce((acc, curr) => acc + (curr.attendance_percentage || 0), 0) / records.length);
  }, [activeEnrollments]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Student Academic Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
            My Registered Courses
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time enrollment tracking, attendance monitoring, assignment completion, and grade tracking.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleOpenAudit}
            className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <History className="w-3.5 h-3.5 text-indigo-500" />
            Registration Audit Log
          </button>

          <button
            onClick={() => onNavigate('/courses')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Enroll in New Course
          </button>
        </div>
      </div>

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {activeEnrollments.length}
            </div>
            <div className="text-xs text-slate-500 font-medium">Active Enrolled Courses</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {totalCredits} <span className="text-xs text-slate-400 font-normal">/ 24 Max</span>
            </div>
            <div className="text-xs text-slate-500 font-medium">Registered Semester Credits</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {avgAttendance !== null ? `${avgAttendance}%` : '100%'}
            </div>
            <div className="text-xs text-slate-500 font-medium">Average Attendance Rate</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {activeEnrollments.filter((e) => e.course?.is_nptel).length}
            </div>
            <div className="text-xs text-slate-500 font-medium">NPTEL Certified Courses</div>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            statusFilter === 'ALL'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All Registrations ({enrollments.length})
        </button>

        <button
          onClick={() => setStatusFilter('ENROLLED')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            statusFilter === 'ENROLLED'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Active Enrolled ({enrollments.filter((e) => e.status === 'ENROLLED' || !e.status).length})
        </button>

        <button
          onClick={() => setStatusFilter('WAITLISTED')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            statusFilter === 'WAITLISTED'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Waitlisted ({enrollments.filter((e) => e.status === 'WAITLISTED').length})
        </button>

        <button
          onClick={() => setStatusFilter('DROPPED')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            statusFilter === 'DROPPED'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Dropped ({enrollments.filter((e) => e.status === 'DROPPED').length})
        </button>
      </div>

      {/* Enrollments Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          ))}
        </div>
      ) : filteredEnrollments.length === 0 ? (
        <EmptyState
          title="No course registrations found."
          description="You do not have any courses under this filter status."
          actionText="Browse University Catalog"
          onAction={() => onNavigate('/courses')}
          secondaryActionText="Load Sample Academic Dataset"
          onSecondaryAction={loadDemoData}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEnrollments.map((en, idx) => {
            const course = en.course;
            if (!course) return null;

            const isWaitlisted = en.status === 'WAITLISTED';
            const isDropped = en.status === 'DROPPED';
            const attendancePct = en.attendance_percentage !== undefined && en.attendance_percentage !== null ? en.attendance_percentage : 92;

            return (
              <motion.div
                key={en.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.2) }}
                className={`bg-white dark:bg-slate-900 rounded-3xl border p-6 shadow-xs flex flex-col justify-between group relative transition-all ${
                  isDropped
                    ? 'border-slate-200 dark:border-slate-800 opacity-60'
                    : 'border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500/50 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Top Status & Code */}
                  <div className="flex items-center justify-between text-xs mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800/40">
                        {course.code}
                      </span>
                      {course.is_nptel && (
                        <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800/40">
                          NPTEL
                        </span>
                      )}
                    </div>

                    {isDropped ? (
                      <span className="text-red-500 font-semibold text-[11px] bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-900/40">
                        Dropped
                      </span>
                    ) : isWaitlisted ? (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold text-[11px] bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900/40 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Waitlisted
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Registered
                      </span>
                    )}
                  </div>

                  {/* Course Title */}
                  <h3 
                    onClick={() => onNavigate(`/student/courses/${course.id}`)}
                    className="font-bold text-slate-900 dark:text-white text-base tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 cursor-pointer"
                  >
                    {course.name}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  {/* Real Metrics Progress (if active) */}
                  {!isDropped && !isWaitlisted && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                      {/* Attendance Bar */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-slate-500">Attendance</span>
                          <span className={`font-bold ${attendancePct >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
                            {attendancePct}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${attendancePct >= 75 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${attendancePct}%` }}
                          />
                        </div>
                      </div>

                      {/* Assignment Progress */}
                      {en.assignment_progress && typeof en.assignment_progress === 'object' && en.assignment_progress.total > 0 && (
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                          <span>Assignments: {en.assignment_progress.submitted} / {en.assignment_progress.total} Submitted</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Avg: {en.assignment_progress.average_score}%</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">
                    {course.credits} Credits • Sem {course.semester}
                  </span>

                  <div className="flex items-center gap-2">
                    {!isDropped && (
                      <button
                        onClick={() => setDroppingEnrollment(en)}
                        className="text-slate-400 hover:text-red-500 text-xs font-semibold p-1.5 transition-colors cursor-pointer"
                        title="Drop Course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => onNavigate(`/student/courses/${course.id}`)}
                      className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform cursor-pointer"
                    >
                      Course Room <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Drop Course Confirmation Modal */}
      <Modal
        isOpen={!!droppingEnrollment}
        onClose={() => setDroppingEnrollment(null)}
        title="Drop Course Confirmation"
      >
        {droppingEnrollment && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to drop <strong>{droppingEnrollment.course?.code} — {droppingEnrollment.course?.name}</strong>?
            </p>

            <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-900/40">
              This will remove the course from your active semester schedule and release the seat capacity for other eligible students.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDroppingEnrollment(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
              >
                Keep Enrolled
              </button>

              <button
                type="button"
                onClick={handleDropConfirm}
                disabled={isDropping}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                {isDropping ? 'Dropping...' : 'Confirm Drop'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Registration Audit Log Modal */}
      <Modal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        title="Official Course Registration Audit History"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {isLoadingAudit ? (
            <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
              Loading audit transactions...
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No registration logs recorded in your session yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-bold ${log.action.includes('DROP') ? 'text-red-500' : 'text-indigo-600 dark:text-indigo-400'}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="text-slate-700 dark:text-slate-300">
                    Course: <strong>{log.details?.course_code || log.details?.course_id}</strong> {log.details?.course_name ? `— ${log.details?.course_name}` : ''}
                  </div>

                  {log.details?.status && (
                    <div className="text-[11px] text-slate-500">
                      Status: <strong className="text-slate-700 dark:text-slate-300">{log.details.status}</strong>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setShowAuditModal(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
