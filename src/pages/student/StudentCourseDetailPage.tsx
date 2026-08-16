import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { 
  BookOpen, 
  ArrowLeft, 
  Calendar, 
  FileCheck, 
  Award, 
  User, 
  Clock, 
  Sparkles, 
  BrainCircuit, 
  GraduationCap, 
  CheckCircle2,
  PlayCircle,
  Lock,
  ChevronDown,
  ChevronRight,
  BarChart3,
  FileText,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
  Download,
  Flame,
  Globe,
  Layers,
  ArrowRight
} from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { CourseAITutor } from '../../components/ai/CourseAITutor';
import { CourseVideoPlayer } from '../../components/lms/CourseVideoPlayer';
import { CourseQuizPlayer } from '../../components/lms/CourseQuizPlayer';
import { CourseAssignmentSubmission } from '../../components/lms/CourseAssignmentSubmission';
import { CourseCertificateModal } from '../../components/lms/CourseCertificateModal';
import { NPTELCourseHub } from '../../components/lms/NPTELCourseHub';
import { ExternalCourseHub } from '../../components/lms/ExternalCourseHub';
import { CourseLearningDashboardData, CourseModule, CourseLesson } from '../../types';

interface StudentCourseDetailPageProps {
  courseId: string;
  onNavigate: (path: string) => void;
}

export const StudentCourseDetailPage: React.FC<StudentCourseDetailPageProps> = ({ courseId, onNavigate }) => {
  const { user, student } = useAuth();
  const [dashboardData, setDashboardData] = useState<CourseLearningDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Active view states
  const [activeTab, setActiveTab] = useState<'curriculum' | 'analytics' | 'assignments' | 'quizzes' | 'nptel' | 'feedback'>('curriculum');
  const [activeLesson, setActiveLesson] = useState<CourseLesson | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  // Certificate Modal
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);

  // AI Tutor State
  const [isAITutorOpen, setIsAITutorOpen] = useState<boolean>(false);
  const [aiTutorPrompt, setAiTutorPrompt] = useState<string | null>(null);

  const loadDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getCourseLearningDashboard(courseId);
      setDashboardData(res);

      // Expand all modules by default
      const expMap: Record<string, boolean> = {};
      (res.modules || []).forEach((m: CourseModule) => {
        expMap[m.id] = true;
      });
      setExpandedModules(expMap);

      // If activeLesson not set, pick last accessed or first lesson
      if (!activeLesson && res.last_accessed_lesson) {
        setActiveLesson(res.last_accessed_lesson);
      }
    } catch (err: any) {
      console.error('Failed to load LMS dashboard', err);
      setError(err.message || 'Failed to load course room.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [courseId]);

  const handleOpenAITutorWithPrompt = (prompt?: string) => {
    if (prompt) setAiTutorPrompt(prompt);
    setIsAITutorOpen(true);
  };

  const handleLessonSelect = (lesson: CourseLesson) => {
    if (lesson.is_locked) {
      alert('Please complete preceding module lessons to unlock this topic.');
      return;
    }
    setActiveLesson(lesson);
  };

  const handleProgressUpdate = async (data: any) => {
    if (!activeLesson) return;
    try {
      const res = await api.updateLessonProgress(courseId, activeLesson.id, data);
      // Refresh completion stats in state
      if (dashboardData) {
        setDashboardData({
          ...dashboardData,
          completion_stats: res.completion_stats
        });
      }
    } catch (err) {
      console.error('Progress update error', err);
    }
  };

  const handleNextLesson = () => {
    if (!dashboardData || !activeLesson) return;
    const allLessons: CourseLesson[] = [];
    dashboardData.modules.forEach((m) => {
      if (m.lessons) allLessons.push(...m.lessons);
    });

    const currentIndex = allLessons.findIndex((l) => l.id === activeLesson.id);
    if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      setActiveLesson(nextLesson);
    }
  };

  const toggleModuleExpand = (moduleId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-mono">Initializing LMS Course Room & Syncing Progress...</p>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <p className="text-xs text-rose-500 font-semibold">{error || 'Course not found.'}</p>
        <button
          onClick={() => onNavigate('/student/courses')}
          className="px-4 py-2 bg-slate-800 text-white text-xs rounded-xl hover:bg-slate-700 transition-colors"
        >
          Return to My Courses
        </button>
      </div>
    );
  }

  const { course, completion_stats, modules, nptel_tracking, external_tracking, upcoming_deadlines, recent_grades, faculty_feedback } = dashboardData;
  const isCompleted = completion_stats.is_completed || completion_stats.overall_progress >= 100;
  const studentName = user?.full_name || 'Alex Johnson';
  const rollNumber = student?.roll_number || '2024-CS-0104';

  return (
    <div className="space-y-8 pb-16">
      {/* Top Back & Mode Toggle Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <button
          onClick={() => onNavigate('/student/courses')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Registered Courses
        </button>

        <div className="flex items-center gap-2">
          {isCompleted && (
            <button
              onClick={() => setShowCertificateModal(true)}
              className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:brightness-110 transition-all cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>View Verified Certificate</span>
            </button>
          )}

          <button
            onClick={() => handleOpenAITutorWithPrompt()}
            className="px-3.5 py-2 rounded-2xl bg-[#061c16] hover:bg-emerald-900 text-emerald-300 hover:text-white border border-emerald-700/60 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Launch AI Course Tutor</span>
          </button>
        </div>
      </div>

      {/* Main Course Learning Dashboard Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800/40">
                {course.code}
              </span>
              <span className="text-xs font-medium text-slate-500">{course.department}</span>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/40">
                {isCompleted ? '✓ Course Completed' : 'Active Enrolled Course'}
              </span>
              {course.is_nptel && (
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/40">
                  NPTEL / SWAYAM
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {course.name}
            </h1>

            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
              {course.description || 'Comprehensive university curriculum designed for theoretical mastery, mathematical proofs, and rigorous hands-on laboratory implementations.'}
            </p>
          </div>

          {/* Quick Resume Action */}
          <div className="shrink-0 flex flex-col items-end gap-2">
            <button
              onClick={() => {
                if (dashboardData.last_accessed_lesson) {
                  setActiveLesson(dashboardData.last_accessed_lesson);
                } else if (modules[0]?.lessons?.[0]) {
                  setActiveLesson(modules[0].lessons[0]);
                }
                setActiveTab('curriculum');
              }}
              className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Continue Learning</span>
            </button>
            {dashboardData.last_accessed_lesson && (
              <span className="text-[11px] text-slate-500 truncate max-w-xs">
                Resume: {dashboardData.last_accessed_lesson.title}
              </span>
            )}
          </div>
        </div>

        {/* Weighted Progress Bar & Requirement Met Bar */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-4">
          <div className="flex items-center justify-between text-xs flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              <span className="font-bold text-slate-900 dark:text-white">
                Comprehensive Curricular Progress
              </span>
              <span className="text-slate-500 font-mono">
                ({completion_stats.requirements_met_count} / {completion_stats.total_requirements_count} criteria satisfied)
              </span>
            </div>

            <div className="font-mono font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
              {completion_stats.overall_progress}% Overall Completion
            </div>
          </div>

          {/* Composite Visual Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${Math.min(100, completion_stats.overall_progress)}%` }}
              className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
            />
          </div>

          {/* Weighted Metric Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-[11px]">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 block font-medium">Video Lectures (30%)</span>
              <strong className="text-slate-900 dark:text-white font-bold block">
                {completion_stats.videos.watched_count} / {completion_stats.videos.total_count} Watched ({completion_stats.videos.percentage}%)
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 block font-medium">Assignments (25%)</span>
              <strong className="text-slate-900 dark:text-white font-bold block">
                {completion_stats.assignments.completed} / {completion_stats.assignments.total} ({completion_stats.assignments.average_score}% Avg)
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 block font-medium">Quizzes & Tests (15%)</span>
              <strong className="text-slate-900 dark:text-white font-bold block">
                {completion_stats.quizzes.completed} / {completion_stats.quizzes.total} ({completion_stats.quizzes.average_score}% Avg)
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 block font-medium">Practicals (10%)</span>
              <strong className="text-slate-900 dark:text-white font-bold block">
                {completion_stats.practicals.completed} / {completion_stats.practicals.total} ({completion_stats.practicals.percentage}%)
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 block font-medium">Final Exam (20%)</span>
              <strong className="text-slate-900 dark:text-white font-bold block">
                {completion_stats.exams.completed} / {completion_stats.exams.total} ({completion_stats.exams.average_score} Marks)
              </strong>
            </div>
          </div>
        </div>

        {/* Metadata info grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px] uppercase">Credits</span>
            <strong className="text-slate-900 dark:text-white text-sm">{course.credits} Credits</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] uppercase">Semester</span>
            <strong className="text-slate-900 dark:text-white text-sm">Semester {course.semester}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] uppercase">Course Type</span>
            <strong className="text-slate-900 dark:text-white text-sm">{course.course_type}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] uppercase">Total Units</span>
            <strong className="text-slate-900 dark:text-white text-sm">{modules.length} Modules</strong>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        {[
          { id: 'curriculum', label: 'Curriculum & Learning Path', icon: BookOpen },
          { id: 'assignments', label: `Assignments (${course.assignments?.length || 0})`, icon: FileCheck },
          { id: 'quizzes', label: 'Quizzes & Assessments', icon: Award },
          ...(course.is_nptel ? [{ id: 'nptel', label: 'NPTEL / SWAYAM Hub', icon: Globe }] : []),
          ...(course.course_type === 'Elective' && !course.is_nptel ? [{ id: 'external', label: 'External Course Sync', icon: Globe }] : []),
          { id: 'feedback', label: 'Faculty Feedback & Support', icon: MessageSquare }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: CURRICULUM & INTERACTIVE LEARNING PATH */}
      {activeTab === 'curriculum' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left / Top Syllabus Navigation Panel */}
          <div className="lg:col-span-4 space-y-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-500" />
                <span>Course Units & Topics</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)} Lessons
              </span>
            </div>

            <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
              {modules.map((mod, modIdx) => {
                const isExpanded = expandedModules[mod.id] !== false;
                const lessons = mod.lessons || [];
                const completedInMod = lessons.filter((l) => l.status === 'COMPLETED').length;

                return (
                  <div key={mod.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {/* Module Accordion Header */}
                    <button
                      onClick={() => toggleModuleExpand(mod.id)}
                      className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-left transition-colors cursor-pointer"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-mono text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                            Unit {modIdx + 1}
                          </span>
                          <span className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[180px]">
                            {mod.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {completedInMod} / {lessons.length} Completed ({mod.duration_hours || 8} hrs)
                        </span>
                      </div>

                      {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </button>

                    {/* Lessons list */}
                    {isExpanded && (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                        {lessons.map((lesson) => {
                          const isActive = activeLesson?.id === lesson.id;
                          const isLessonDone = lesson.status === 'COMPLETED';
                          const isLocked = lesson.is_locked;

                          return (
                            <button
                              key={lesson.id}
                              onClick={() => handleLessonSelect(lesson)}
                              className={`w-full p-3 flex items-center justify-between text-left text-xs transition-colors cursor-pointer ${
                                isActive
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold border-l-4 border-emerald-500'
                                  : isLocked
                                  ? 'opacity-50 cursor-not-allowed hover:bg-transparent text-slate-400'
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                {isLessonDone ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                ) : isLocked ? (
                                  <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                                ) : (
                                  <PlayCircle className="w-4 h-4 text-slate-400 shrink-0" />
                                )}
                                <div className="space-y-0.5">
                                  <span className="line-clamp-1">{lesson.title}</span>
                                  <span className="text-[10px] text-slate-400 font-mono block">
                                    {lesson.lesson_type} • {lesson.duration_minutes || 30} mins
                                  </span>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Main Lesson Stage Area */}
          <div className="lg:col-span-8">
            {activeLesson ? (
              <div>
                {activeLesson.lesson_type === 'VIDEO' && (
                  <CourseVideoPlayer
                    lesson={activeLesson}
                    courseId={courseId}
                    onProgressUpdate={handleProgressUpdate}
                    onNextLesson={handleNextLesson}
                    onOpenAITutorWithPrompt={handleOpenAITutorWithPrompt}
                  />
                )}

                {activeLesson.lesson_type === 'QUIZ' && activeLesson.quiz_id && (
                  <CourseQuizPlayer
                    courseId={courseId}
                    quizId={activeLesson.quiz_id}
                    onQuizCompleted={(att, stats) => {
                      if (dashboardData) {
                        setDashboardData({ ...dashboardData, completion_stats: stats });
                      }
                    }}
                    onOpenAITutorWithPrompt={handleOpenAITutorWithPrompt}
                  />
                )}

                {activeLesson.lesson_type === 'ASSIGNMENT' && activeLesson.assignment_id && (
                  <CourseAssignmentSubmission
                    assignment={activeLesson.assignment || { id: activeLesson.assignment_id, title: activeLesson.title, due_date: '2026-03-25' } as any}
                    courseId={courseId}
                    onSubmissionSuccess={(sub, stats) => {
                      if (dashboardData) {
                        setDashboardData({ ...dashboardData, completion_stats: stats });
                      }
                    }}
                    onOpenAITutorWithPrompt={handleOpenAITutorWithPrompt}
                  />
                )}

                {activeLesson.lesson_type === 'READING' && (
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs space-y-6">
                    <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase font-mono">
                          Conceptual Reading & Theoretical Proofs
                        </span>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                          {activeLesson.title}
                        </h2>
                      </div>

                      <button
                        onClick={() => handleProgressUpdate({ completed: true })}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark Reading Completed</span>
                      </button>
                    </div>

                    <div className="prose dark:prose-invert max-w-none text-xs leading-relaxed space-y-4 text-slate-700 dark:text-slate-300">
                      <p>
                        {activeLesson.reading_content || activeLesson.description || 'Review foundational theoretical lemmas, mathematical induction proofs, and asymptotic runtime boundaries.'}
                      </p>
                      
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 font-mono text-xs text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-800">
                        {`// Core Asymptotic Complexity Definition\nT(n) = 2T(n/2) + O(n) => By Master Theorem Case 2 => T(n) = O(n log n)`}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4">
                <BookOpen className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Select a Lesson to Begin Learning
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Click on any topic from the curriculum sidebar on the left to launch video lectures, reading materials, or interactive assessments.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-500" />
              <span>Published Course Assignments ({course.assignments?.length || 0})</span>
            </h3>

            {(!course.assignments || course.assignments.length === 0) ? (
              <p className="text-xs text-slate-400 py-4">No assignments published for this course yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.assignments.map((asg: any) => (
                  <div
                    key={asg.id}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{asg.title}</h4>
                        <p className="text-[11px] text-slate-500">Due: {formatDate(asg.due_date)}</p>
                      </div>
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-md">
                        {asg.max_marks || 100} Marks
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {asg.description || 'Implement practical algorithmic benchmarks and submit code.'}
                    </p>

                    <button
                      onClick={() => onNavigate(`/student/assignments/${asg.id}`)}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Open & Submit Assignment</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: QUIZZES */}
      {activeTab === 'quizzes' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-500" />
              <span>Unit Quizzes & Assessments</span>
            </h3>

            <div className="space-y-3">
              {modules.map((m) => {
                const quizLessons = (m.lessons || []).filter((l) => l.lesson_type === 'QUIZ' && l.quiz_id);
                if (quizLessons.length === 0) return null;

                return (
                  <div key={m.id} className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase font-mono">{m.title}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {quizLessons.map((ql) => (
                        <div
                          key={ql.id}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs"
                        >
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-900 dark:text-white block">{ql.title}</span>
                            <span className="text-[11px] text-slate-500 font-mono">15 Mins • 5 Questions</span>
                          </div>

                          <button
                            onClick={() => {
                              setActiveLesson(ql);
                              setActiveTab('curriculum');
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
                          >
                            Take Quiz
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: NPTEL HUB (If applicable) */}
      {activeTab === 'nptel' && course.is_nptel && (
        <NPTELCourseHub
          course={course}
          nptelTracking={nptel_tracking}
          onUpdate={(updated) => setDashboardData({ ...dashboardData, nptel_tracking: updated })}
        />
      )}

      {/* Tab 5: FACULTY FEEDBACK & SUPPORT */}
      {activeTab === 'feedback' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              <span>Official Faculty Comments & Feedback</span>
            </h3>

            {(!faculty_feedback || faculty_feedback.length === 0) ? (
              <p className="text-xs text-slate-400 py-4">No direct instructor remarks yet.</p>
            ) : (
              <div className="space-y-3">
                {faculty_feedback.map((fb) => (
                  <div key={fb.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">{fb.faculty_name}</span>
                      <span className="text-[11px] text-slate-400">{formatDate(fb.date)}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">
                      "{fb.message}"
                    </p>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold block">
                      Item: {fb.item_name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating AI Tutor Launcher */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          id="btn-student-floating-ai-tutor"
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

      {/* Verified Certificate Modal */}
      {showCertificateModal && (
        <CourseCertificateModal
          course={course}
          studentName={studentName}
          rollNumber={rollNumber}
          completionPercentage={completion_stats.overall_progress}
          onClose={() => setShowCertificateModal(false)}
        />
      )}
    </div>
  );
};
