import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { api } from '../../lib/api';
import { Course, ClassItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  BookOpen, 
  User, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  ArrowLeft, 
  Plus, 
  Sparkles, 
  Layers, 
  Building, 
  Award, 
  GraduationCap, 
  FileText, 
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Users,
  Trash2,
  Check,
  ShieldCheck,
  Target
} from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { CourseAITutor } from '../../components/ai/CourseAITutor';

interface CourseDetailPageProps {
  courseId: string;
  onNavigate: (path: string) => void;
}

export const CourseDetailPage: React.FC<CourseDetailPageProps> = ({ courseId, onNavigate }) => {
  const { user, student } = useAuth();
  const { showToast } = useToast();
  
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEnrolling, setIsEnrolling] = useState<boolean>(false);
  const [isDropping, setIsDropping] = useState<boolean>(false);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  
  // Modals
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showDropModal, setShowDropModal] = useState<boolean>(false);

  // AI Tutor Slide-out State
  const [isAITutorOpen, setIsAITutorOpen] = useState<boolean>(false);
  const [aiTutorPrompt, setAiTutorPrompt] = useState<string | null>(null);

  const handleOpenAITutorWithPrompt = (prompt?: string) => {
    if (prompt) {
      setAiTutorPrompt(prompt);
    }
    setIsAITutorOpen(true);
  };

  const loadCourse = () => {
    setIsLoading(true);
    api.getCourse(courseId)
      .then((data) => {
        setCourse(data);
        if (data.classes && data.classes.length > 0) {
          setSelectedClassId(data.classes[0].id);
        }
      })
      .catch(() => setCourse(null))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const handleEnroll = async () => {
    if (!user) {
      showToast('Please sign in with your student credentials to register for this course.', 'info');
      onNavigate('/login');
      return;
    }

    if (user.role !== 'STUDENT') {
      showToast('Only authenticated student accounts can register for courses.', 'error');
      return;
    }

    setIsEnrolling(true);
    try {
      await api.enrollCourse(courseId, selectedClassId || undefined);
      showToast(`Successfully registered for ${course.code} - ${course.name}!`, 'success');
      setShowConfirmModal(false);
      loadCourse();
    } catch (err: any) {
      showToast(err.message || 'Enrollment transaction failed.', 'error');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleDrop = async () => {
    if (!course?.user_enrollment_id) return;

    setIsDropping(true);
    try {
      await api.dropEnrollment(course.user_enrollment_id);
      showToast(`Successfully dropped ${course.code} - ${course.name}.`, 'info');
      setShowDropModal(false);
      loadCourse();
    } catch (err: any) {
      showToast(err.message || 'Failed to drop course.', 'error');
    } finally {
      setIsDropping(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-400 animate-pulse space-y-4">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/3 mx-auto" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <EmptyState
          title="Course not found in catalog."
          description="The requested curricular course does not exist in the institutional database."
          actionText="Return to Catalog"
          onAction={() => onNavigate('/courses')}
        />
      </div>
    );
  }

  const derivedYear = course.academic_year || Math.ceil((course.semester || 1) / 2);
  const maxSeats = Number(course.max_seats) || 60;
  const enrolledCount = Number(course.enrolled_count) || 0;
  const availableSeats = course.available_seats !== undefined ? course.available_seats : Math.max(0, maxSeats - enrolledCount);
  const fillPercent = Math.min(100, Math.round((enrolledCount / maxSeats) * 100));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back Button */}
      <button
        onClick={() => onNavigate('/courses')}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Course Catalog
      </button>

      {/* Header Banner Card */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800/40">
                {course.code}
              </span>

              {course.is_nptel ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800/40">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  NPTEL / SWAYAM Certified
                </span>
              ) : (
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                  Year {derivedYear} • Semester {course.semester}
                </span>
              )}

              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg">
                {course.course_type || 'Core Theory'}
              </span>

              <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                {course.level || 'Undergraduate'} Level
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {course.name}
            </h1>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium flex-wrap">
              <Building className="w-3.5 h-3.5 text-indigo-500" />
              <span>Department of {course.department}</span>
              <span>•</span>
              <span>Academic Weightage: {course.credits} Credits</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {course.description || 'Comprehensive university curriculum designed for theoretical mastery and rigorous hands-on applications.'}
            </p>

            {course.prerequisites && course.prerequisites !== 'None' && (
              <div className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span><strong>Prerequisites:</strong> {course.prerequisites}</span>
              </div>
            )}
          </div>

          {/* Action Box / Capacity Gauge */}
          <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 min-w-[240px] space-y-4 shrink-0">
            <div className="text-center space-y-1">
              <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                {course.credits} Credits
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Academic Curriculum Weight
              </div>
            </div>

            {/* Seat Capacity Gauge */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Users className="w-3 h-3 text-indigo-500" />
                  {enrolledCount}/{maxSeats} Seats
                </span>
                <span className={`font-bold ${availableSeats > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
                  {availableSeats > 0 ? `${availableSeats} Free` : 'Waitlist'}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    fillPercent >= 100 ? 'bg-amber-500' : fillPercent >= 80 ? 'bg-indigo-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${fillPercent}%` }}
                />
              </div>
            </div>

            {/* Primary Action Button */}
            {course.is_enrolled ? (
              <div className="space-y-2 pt-1">
                <div className="w-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Currently Registered
                </div>

                <button
                  onClick={() => onNavigate(`/student/courses/${course.id}`)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  Go to Student Room <ExternalLink className="w-3 h-3" />
                </button>

                <button
                  onClick={() => handleOpenAITutorWithPrompt()}
                  className="w-full bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                  Ask Course AI Tutor
                </button>

                <button
                  onClick={() => setShowDropModal(true)}
                  className="w-full bg-red-50 dark:bg-red-950/30 hover:bg-red-100 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 text-xs font-semibold py-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Drop Course
                </button>
              </div>
            ) : user?.role === 'STUDENT' ? (
              <div className="space-y-2 pt-1">
                <button
                  id="btn-enroll-course-detail"
                  onClick={() => setShowConfirmModal(true)}
                  disabled={isEnrolling}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Register for Course
                </button>

                <button
                  onClick={() => handleOpenAITutorWithPrompt()}
                  className="w-full bg-[#061c16] hover:bg-[#0a2e24] text-emerald-300 hover:text-white border border-emerald-700/60 text-xs font-semibold py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Ask AI Tutor About Syllabus
                </button>
              </div>
            ) : !user ? (
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => onNavigate('/login')}
                  className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Sign In to Register
                </button>

                <button
                  onClick={() => handleOpenAITutorWithPrompt()}
                  className="w-full bg-[#061c16] hover:bg-[#0a2e24] text-emerald-300 hover:text-white border border-emerald-700/60 text-xs font-semibold py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Explore Syllabus with AI Tutor
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => onNavigate('/admin/courses')}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 rounded-xl transition-all cursor-pointer"
                >
                  Manage in Admin Portal
                </button>

                <button
                  onClick={() => handleOpenAITutorWithPrompt()}
                  className="w-full bg-[#061c16] hover:bg-[#0a2e24] text-emerald-300 hover:text-white border border-emerald-700/60 text-xs font-semibold py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Test Course AI Tutor
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* NPTEL / SWAYAM Certified Course Highlights */}
      {course.is_nptel && (
        <div className="bg-purple-50/60 dark:bg-purple-950/20 rounded-3xl border border-purple-200 dark:border-purple-900/40 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              NPTEL / SWAYAM Direct Academic Accreditation
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-purple-100 dark:border-purple-900/30">
              <span className="text-slate-400 block text-[11px]">Offering Institute</span>
              <strong className="text-slate-900 dark:text-white font-bold">{course.nptel_institute || 'IIT Madras / IIT Kharagpur'}</strong>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-purple-100 dark:border-purple-900/30">
              <span className="text-slate-400 block text-[11px]">Primary Instructor</span>
              <strong className="text-slate-900 dark:text-white font-bold">{course.nptel_instructor || 'National Subject Matter Expert'}</strong>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-purple-100 dark:border-purple-900/30">
              <span className="text-slate-400 block text-[11px]">Duration & Credits</span>
              <strong className="text-slate-900 dark:text-white font-bold">{course.nptel_duration || '12 Weeks'} • {course.credits} Credits</strong>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-purple-100 dark:border-purple-900/30">
              <span className="text-slate-400 block text-[11px]">National Exam Date</span>
              <strong className="text-slate-900 dark:text-white font-bold">{course.nptel_exam_date || 'April 2026'}</strong>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400">
            • Official certification credit transfer is fully mapped to the university grade transcripts upon submission of the verified score sheet.
          </p>
        </div>
      )}

      {/* Learning Outcomes */}
      {course.learning_outcomes && course.learning_outcomes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-500" />
            Course Learning Outcomes (CLOs)
          </h2>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-3 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {course.learning_outcomes.map((clo: string, i: number) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{clo}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Available Scheduled Sections (if not NPTEL) */}
      {!course.is_nptel && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-500" />
              Scheduled Class Sections ({course.classes?.length || 0})
            </h2>
            <span className="text-xs text-slate-500 font-medium">Select a section for your timetable</span>
          </div>

          {course.classes?.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-center text-xs text-slate-400">
              No class sections currently scheduled for this academic term.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {course.classes?.map((cls: any) => (
                <div
                  key={cls.id}
                  onClick={() => setSelectedClassId(cls.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    selectedClassId === cls.id
                      ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      Section {cls.section_name}
                    </span>
                    <span className="text-slate-400 font-medium">{cls.academic_term}</span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>Faculty: <strong className="text-slate-800 dark:text-slate-200">{cls.teacher?.profile?.full_name || 'Assigned Department Faculty'}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>Days: <strong className="text-slate-800 dark:text-slate-200">{cls.schedule_days}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>Time: <strong className="text-slate-800 dark:text-slate-200">{cls.schedule_time}</strong> (Room: {cls.room || 'Main Complex'})</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      Enrolled: {cls.enrolled_students_count || 0} / {cls.capacity || 60}
                    </span>
                    {selectedClassId === cls.id && (
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Selected
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Syllabus Units Breakdown with AI Tutor Integration */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              Complete Curricular Syllabus
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Official university course modules. Click any unit to clarify concepts with the AI Tutor.
            </p>
          </div>

          <button
            onClick={() => handleOpenAITutorWithPrompt("Summarize all syllabus units and explain how they connect together.")}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            AI Syllabus Overview
          </button>
        </div>

        {course.syllabus ? (
          <div className="space-y-3">
            {course.syllabus
              .split('\n')
              .filter((line: string) => line.trim().length > 0)
              .map((line: string, idx: number) => {
                const parts = line.split(':');
                const unitTitle = parts[0] || `Unit ${idx + 1}`;
                const unitDescription = parts.slice(1).join(':').trim();

                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-700/50 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/40 font-mono">
                          {unitTitle.trim()}
                        </span>
                      </div>
                      {unitDescription && (
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                          {unitDescription}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleOpenAITutorWithPrompt(`Explain ${line.trim()} in detail. Provide key concepts, formulas or code implementations, and sample exam questions.`)}
                      className="px-3.5 py-2 rounded-xl bg-[#061c16] hover:bg-emerald-900 text-emerald-300 hover:text-white border border-emerald-800/80 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors shadow-xs cursor-pointer group-hover:border-emerald-600"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      Ask AI Tutor
                    </button>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="text-xs text-slate-700 dark:text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
              Standard university curriculum units for {course.name}.
            </div>
          </div>
        )}
      </div>

      {/* Floating AI Tutor Trigger (Pinned Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          id="btn-floating-ai-tutor"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOpenAITutorWithPrompt()}
          className="px-4 py-3 bg-gradient-to-r from-[#061c16] via-[#092b22] to-emerald-900 text-white rounded-2xl shadow-xl shadow-emerald-950/40 border border-emerald-600/60 flex items-center gap-2.5 group cursor-pointer"
        >
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute -top-0.5 -right-0.5 opacity-75" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 relative" />
          </div>
          <Sparkles className="w-4 h-4 text-emerald-300 group-hover:rotate-12 transition-transform" />
          <div className="text-left">
            <div className="text-xs font-bold tracking-tight text-white flex items-center gap-1">
              AI Tutor
            </div>
            <div className="text-[10px] text-emerald-300/80 -mt-0.5 font-medium">
              Syllabus Assistant
            </div>
          </div>
        </motion.button>
      </div>

      {/* AI Tutor Slide-out Drawer */}
      <CourseAITutor
        course={course}
        isOpen={isAITutorOpen}
        onClose={() => setIsAITutorOpen(false)}
        initialPrompt={aiTutorPrompt}
        onClearInitialPrompt={() => setAiTutorPrompt(null)}
      />

      {/* Confirm Registration Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Academic Course Registration"
      >
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                {course.code}
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {course.credits} Credits
              </span>
            </div>

            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              {course.name}
            </h4>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Department: <strong>{course.department}</strong>
            </p>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
            <p>• Your student ledger and semester transcript will be immediately updated.</p>
            <p>• You can access all assignments, syllabus materials, and attendance tracking in your Student Portal.</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowConfirmModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleEnroll}
              disabled={isEnrolling}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isEnrolling ? 'Registering...' : 'Confirm Registration'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm Drop Modal */}
      <Modal
        isOpen={showDropModal}
        onClose={() => setShowDropModal(false)}
        title="Drop Course Registration"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Are you sure you want to drop <strong>{course.code} — {course.name}</strong>?
          </p>

          <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-900/40">
            Dropping this course will immediately release your seat to the waitlist and remove this course from your active semester schedule.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowDropModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              Keep Course
            </button>

            <button
              type="button"
              onClick={handleDrop}
              disabled={isDropping}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              {isDropping ? 'Dropping...' : 'Confirm Drop'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
