import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { Course } from '../../types';
import {
  Sparkles,
  GraduationCap,
  BookOpen,
  Target,
  Brain,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  School,
  Briefcase,
  Layers,
  Award,
  Compass,
  Laptop,
  Database as DbIcon,
  Shield,
  Cloud,
  Check,
  AlertCircle,
  X
} from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
  isEditing?: boolean;
  onClose?: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete,
  isEditing = false,
  onClose
}) => {
  const { user, student, teacher, saveOnboarding } = useAuth();
  const { showToast } = useToast();

  const isStudent = user?.role === 'STUDENT';
  const isTeacher = user?.role === 'TEACHER';
  const isAdmin = user?.role === 'ADMIN';

  const totalSteps = isStudent ? 5 : isTeacher ? 5 : 2;
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Departments from database
  const [departments, setDepartments] = useState<Array<{ id: string; name: string; shortCode: string; category?: string }>>([]);
  const [isLoadingDepts, setIsLoadingDepts] = useState<boolean>(true);

  // Student actual enrolled courses from DB
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState<boolean>(true);

  // Student State
  const existingStudentPrefs = user?.onboarding_data?.student_preferences;
  const [studentDept, setStudentDept] = useState<string>(existingStudentPrefs?.department || user?.department || '');
  const [studyYear, setStudyYear] = useState<string>(existingStudentPrefs?.study_year || '1st Year');
  const [academicInterests, setAcademicInterests] = useState<string[]>(
    existingStudentPrefs?.academic_interests || ['AI & Machine Learning']
  );
  const [otherInterest, setOtherInterest] = useState<string>(existingStudentPrefs?.other_interest || '');
  const [academicGoal, setAcademicGoal] = useState<string>(
    existingStudentPrefs?.primary_academic_goal || 'All of these'
  );
  const [supportCourseIds, setSupportCourseIds] = useState<string[]>(
    existingStudentPrefs?.support_subject_ids || []
  );

  // Teacher State
  const existingTeacherPrefs = user?.onboarding_data?.teacher_preferences;
  const [teacherDept, setTeacherDept] = useState<string>(existingTeacherPrefs?.department || user?.department || '');
  const [teacherDesignation, setTeacherDesignation] = useState<string>(
    existingTeacherPrefs?.designation || teacher?.designation || 'Associate Professor'
  );
  const [teacherSpecializations, setTeacherSpecializations] = useState<string[]>(
    existingTeacherPrefs?.specialization_interests || ['AI & Machine Learning', 'Data Science']
  );
  const [teacherGoals, setTeacherGoals] = useState<string[]>(
    existingTeacherPrefs?.pedagogical_goals || ['Improve Student Retention & Mastery']
  );
  const [teacherSupportPriorities, setTeacherSupportPriorities] = useState<string[]>(
    existingTeacherPrefs?.student_support_priorities || ['Identify At-Risk Students Early']
  );

  // Admin State
  const existingAdminPrefs = user?.onboarding_data?.admin_preferences;
  const [adminFocus, setAdminFocus] = useState<string[]>(
    existingAdminPrefs?.institutional_focus || ['Curricular Compliance & Accreditation', 'AI Diagnostics']
  );

  // Fetch authentic database departments & enrolled courses
  useEffect(() => {
    setIsLoadingDepts(true);
    api.getDepartments()
      .then((data) => {
        setDepartments(data);
        if (!studentDept && data.length > 0) {
          setStudentDept(data[0].name);
        }
        if (!teacherDept && data.length > 0) {
          setTeacherDept(data[0].name);
        }
      })
      .catch(() => {
        // Fallback default department list if API unavailable
        setDepartments([
          { id: 'ai-ds', name: 'Artificial Intelligence and Data Science', shortCode: 'AI & DS' },
          { id: 'cse', name: 'Computer Science and Engineering', shortCode: 'CSE' },
          { id: 'it', name: 'Information Technology', shortCode: 'IT' },
          { id: 'ece', name: 'Electronics and Communication Engineering', shortCode: 'ECE' },
          { id: 'eee', name: 'Electrical and Electronics Engineering', shortCode: 'EEE' },
          { id: 'me', name: 'Mechanical Engineering', shortCode: 'ME' },
          { id: 'ce', name: 'Civil Engineering', shortCode: 'CE' },
          { id: 'bme', name: 'Biomedical Engineering', shortCode: 'BME' }
        ]);
      })
      .finally(() => setIsLoadingDepts(false));

    if (isStudent) {
      setIsLoadingCourses(true);
      api.getMyCourses()
        .then((courses) => {
          setEnrolledCourses(courses);
        })
        .catch(() => {
          setEnrolledCourses([]);
        })
        .finally(() => setIsLoadingCourses(false));
    }
  }, [isStudent]);

  const toggleInterest = (item: string) => {
    if (academicInterests.includes(item)) {
      if (academicInterests.length > 1) {
        setAcademicInterests(academicInterests.filter((i) => i !== item));
      }
    } else {
      setAcademicInterests([...academicInterests, item]);
    }
  };

  const toggleTeacherSpec = (item: string) => {
    if (teacherSpecializations.includes(item)) {
      if (teacherSpecializations.length > 1) {
        setTeacherSpecializations(teacherSpecializations.filter((i) => i !== item));
      }
    } else {
      setTeacherSpecializations([...teacherSpecializations, item]);
    }
  };

  const toggleTeacherGoal = (item: string) => {
    if (teacherGoals.includes(item)) {
      if (teacherGoals.length > 1) {
        setTeacherGoals(teacherGoals.filter((i) => i !== item));
      }
    } else {
      setTeacherGoals([...teacherGoals, item]);
    }
  };

  const toggleTeacherPriority = (item: string) => {
    if (teacherSupportPriorities.includes(item)) {
      if (teacherSupportPriorities.length > 1) {
        setTeacherSupportPriorities(teacherSupportPriorities.filter((i) => i !== item));
      }
    } else {
      setTeacherSupportPriorities([...teacherSupportPriorities, item]);
    }
  };

  const toggleSupportCourse = (courseId: string) => {
    if (supportCourseIds.includes(courseId)) {
      setSupportCourseIds(supportCourseIds.filter((id) => id !== courseId));
    } else {
      setSupportCourseIds([...supportCourseIds, courseId]);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (isStudent) {
        await saveOnboarding({
          department: studentDept,
          study_year: studyYear,
          academic_interests: academicInterests,
          other_interest: academicInterests.includes('Other') ? otherInterest : '',
          primary_academic_goal: academicGoal,
          support_subject_ids: supportCourseIds
        });
      } else if (isTeacher) {
        await saveOnboarding({
          department: teacherDept,
          designation: teacherDesignation,
          specialization_interests: teacherSpecializations,
          pedagogical_goals: teacherGoals,
          student_support_priorities: teacherSupportPriorities
        });
      } else {
        await saveOnboarding({
          institutional_focus: adminFocus,
          oversight_priorities: ['Cross-Department Attendance Integrity', 'Curricular Alignment']
        });
      }

      onComplete();
    } catch (err: any) {
      showToast(err.message || 'Failed to save onboarding answers.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pre-defined Student Options
  const yearOptions = [
    { label: '1st Year', description: 'Freshman • Semester 1 & 2', badge: 'Foundational Core' },
    { label: '2nd Year', description: 'Sophomore • Semester 3 & 4', badge: 'Intermediate Engineering' },
    { label: '3rd Year', description: 'Junior • Semester 5 & 6', badge: 'Advanced Electives' },
    { label: '4th Year', description: 'Senior • Semester 7 & 8', badge: 'Capstone & Placement' }
  ];

  const interestOptions = [
    { label: 'AI & Machine Learning', icon: Brain, color: 'text-indigo-400' },
    { label: 'Data Science', icon: DbIcon, color: 'text-cyan-400' },
    { label: 'Web Development', icon: Laptop, color: 'text-emerald-400' },
    { label: 'Cyber Security', icon: Shield, color: 'text-amber-400' },
    { label: 'Cloud Computing', icon: Cloud, color: 'text-purple-400' },
    { label: 'Other', icon: Compass, color: 'text-pink-400' }
  ];

  const goalOptions = [
    {
      id: 'Improve Marks',
      title: 'Improve Marks',
      subtitle: 'Target GPA growth, exam score optimization, and assignment mastery',
      badge: 'Academic Score'
    },
    {
      id: 'Improve Attendance',
      title: 'Improve Attendance',
      subtitle: 'Classroom session compliance, lecture punctuality, and streak tracking',
      badge: 'Attendance 75%+'
    },
    {
      id: 'Improve Skills',
      title: 'Improve Skills',
      subtitle: 'Hands-on laboratory proficiency, coding mastery, and practical projects',
      badge: 'Technical Competency'
    },
    {
      id: 'Placement Preparation',
      title: 'Placement Preparation',
      subtitle: 'Campus interview readiness, problem-solving, and resume portfolio building',
      badge: 'Career Placement'
    },
    {
      id: 'All of these',
      title: 'All of these',
      subtitle: 'Comprehensive holistic focus on marks, attendance, skills, and placement',
      badge: 'Holistic Excellence'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-indigo-900/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto text-slate-100">
        
        {/* Subtle Ambient Glow Background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Top Header Bar */}
        <div className="relative px-6 sm:px-8 pt-6 pb-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">
                  SC EduSense AI
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {isStudent ? 'Student Setup' : isTeacher ? 'Faculty Setup' : 'Institutional Setup'}
                </span>
              </div>
              <h2 className="text-sm font-semibold text-slate-200">
                {isEditing ? 'Update Academic Preferences' : 'Personalize Your Academic Experience'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
              Step {currentStep} of {totalSteps}
            </span>
            {isEditing && onClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Visual Progress Indicator */}
        <div className="w-full bg-slate-800/60 h-1.5 flex">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const stepNum = index + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;
            return (
              <div
                key={stepNum}
                onClick={() => {
                  if (stepNum < currentStep) setCurrentStep(stepNum);
                }}
                className={`h-full flex-1 transition-all duration-300 cursor-pointer ${
                  isCompleted
                    ? 'bg-emerald-500'
                    : isCurrent
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-xs'
                    : 'bg-slate-800'
                }`}
                title={`Step ${stepNum}`}
              />
            );
          })}
        </div>

        {/* Step Content Area with Transitions */}
        <div className="relative px-6 sm:px-8 py-6 flex-1 min-h-[380px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="space-y-6 flex-1"
            >
              {/* ================================================================ */}
              {/* STUDENT ONBOARDING STEPS (1-5) */}
              {/* ================================================================ */}
              {isStudent && (
                <>
                  {/* Step 1: Department */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Question 1 of 5</span>
                        <h3 className="text-xl font-bold text-white mt-1">What is your academic department?</h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Select your primary engineering discipline loaded directly from the university registry.
                        </p>
                      </div>

                      {isLoadingDepts ? (
                        <div className="py-12 flex flex-col items-center justify-center space-y-3">
                          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                          <p className="text-xs text-slate-400">Loading departments from database...</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[260px] overflow-y-auto pr-1">
                          {departments.map((dept) => {
                            const isSelected = studentDept === dept.name;
                            return (
                              <button
                                key={dept.id || dept.shortCode}
                                type="button"
                                onClick={() => setStudentDept(dept.name)}
                                className={`text-left p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                                  isSelected
                                    ? 'bg-indigo-950/60 border-indigo-500 text-white ring-2 ring-indigo-500/30'
                                    : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                                }`}
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                      {dept.shortCode}
                                    </span>
                                  </div>
                                  <p className="text-xs font-semibold leading-snug">{dept.name}</p>
                                </div>
                                <div
                                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border mt-0.5 ${
                                    isSelected
                                      ? 'bg-indigo-600 border-indigo-500 text-white'
                                      : 'border-slate-600 text-transparent'
                                  }`}
                                >
                                  <Check className="w-3 h-3" />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 2: Year of Study */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Question 2 of 5</span>
                        <h3 className="text-xl font-bold text-white mt-1">Which year are you studying?</h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Helps the academic intelligence engine align syllabus difficulty and milestone roadmaps.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {yearOptions.map((opt) => {
                          const isSelected = studyYear === opt.label;
                          return (
                            <button
                              key={opt.label}
                              type="button"
                              onClick={() => setStudyYear(opt.label)}
                              className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                                isSelected
                                  ? 'bg-indigo-950/60 border-indigo-500 text-white ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-950/40'
                                  : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                                  <GraduationCap className="w-4 h-4" />
                                </div>
                                <div
                                  className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                                    isSelected
                                      ? 'bg-indigo-600 border-indigo-500 text-white'
                                      : 'border-slate-600 text-transparent'
                                  }`}
                                >
                                  <Check className="w-3 h-3" />
                                </div>
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-white">{opt.label}</h4>
                                <p className="text-xs text-slate-400 mt-0.5">{opt.description}</p>
                              </div>
                              <span className="text-[10px] font-semibold text-indigo-300 self-start bg-indigo-900/40 px-2 py-0.5 rounded-md border border-indigo-700/40">
                                {opt.badge}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Academic Interests */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Question 3 of 5</span>
                        <h3 className="text-xl font-bold text-white mt-1">What are your academic interests?</h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Select one or more topics to personalize AI course guidance, projects, and research electives.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {interestOptions.map((opt) => {
                          const isSelected = academicInterests.includes(opt.label);
                          const IconComp = opt.icon;
                          return (
                            <button
                              key={opt.label}
                              type="button"
                              onClick={() => toggleInterest(opt.label)}
                              className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 ${
                                isSelected
                                  ? 'bg-indigo-950/60 border-indigo-500 text-white ring-2 ring-indigo-500/30'
                                  : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <IconComp className={`w-5 h-5 ${opt.color}`} />
                                <div
                                  className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                                    isSelected
                                      ? 'bg-indigo-600 border-indigo-500 text-white'
                                      : 'border-slate-600 text-transparent'
                                  }`}
                                >
                                  <Check className="w-3 h-3" />
                                </div>
                              </div>
                              <span className="text-xs font-bold leading-tight">{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {academicInterests.includes('Other') && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Specify other interest or domain:
                          </label>
                          <input
                            type="text"
                            value={otherInterest}
                            onChange={(e) => setOtherInterest(e.target.value)}
                            placeholder="e.g., Quantum Computing, Robotics, Embedded Systems"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 4: Primary Academic Goal */}
                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Question 4 of 5</span>
                        <h3 className="text-xl font-bold text-white mt-1">What is your primary academic goal?</h3>
                        <p className="text-xs text-slate-400 mt-1">
                          EduSense AI will prioritize your weekly alerts, diagnostic advice, and milestones accordingly.
                        </p>
                      </div>

                      <div className="space-y-2.5 max-h-[270px] overflow-y-auto pr-1">
                        {goalOptions.map((goal) => {
                          const isSelected = academicGoal === goal.id;
                          return (
                            <button
                              key={goal.id}
                              type="button"
                              onClick={() => setAcademicGoal(goal.id)}
                              className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                                isSelected
                                  ? 'bg-indigo-950/60 border-indigo-500 text-white ring-2 ring-indigo-500/30'
                                  : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-white">{goal.title}</span>
                                  <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-900/40 px-2 py-0.5 rounded-md border border-indigo-700/40">
                                    {goal.badge}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 leading-tight">{goal.subtitle}</p>
                              </div>
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                                  isSelected
                                    ? 'bg-indigo-600 border-indigo-500 text-white'
                                    : 'border-slate-600 text-transparent'
                                }`}
                              >
                                <Check className="w-3 h-3" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Step 5: Support Subjects (Authentic DB Enrolled Courses Only) */}
                  {currentStep === 5 && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Question 5 of 5</span>
                        <h3 className="text-xl font-bold text-white mt-1">Which subjects do you need more support with?</h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Showing only courses currently registered in your academic ledger. AI will deliver targeted problem sets and office hour recommendations.
                        </p>
                      </div>

                      {isLoadingCourses ? (
                        <div className="py-12 flex flex-col items-center justify-center space-y-3">
                          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                          <p className="text-xs text-slate-400">Loading your enrolled courses from database...</p>
                        </div>
                      ) : enrolledCourses.length === 0 ? (
                        <div className="bg-slate-800/40 border border-slate-700/70 rounded-2xl p-6 text-center space-y-3">
                          <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto border border-slate-700">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-white">No active course enrollments yet</h4>
                            <p className="text-xs text-slate-400 max-w-md mx-auto">
                              Your student account does not have course enrollments recorded in the ledger yet. You can complete setup now, and select support subjects anytime from your Profile after enrolling.
                            </p>
                          </div>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Ready to proceed to Dashboard
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                          {enrolledCourses.map((course) => {
                            const isSelected = supportCourseIds.includes(course.id);
                            return (
                              <button
                                key={course.id}
                                type="button"
                                onClick={() => toggleSupportCourse(course.id)}
                                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                                  isSelected
                                    ? 'bg-indigo-950/60 border-indigo-500 text-white ring-2 ring-indigo-500/30'
                                    : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                                }`}
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                      {course.code}
                                    </span>
                                    <span className="text-xs font-bold text-white">{course.name}</span>
                                  </div>
                                  <p className="text-[11px] text-slate-400">
                                    {course.credits} Credits • {course.course_type || 'Core Theory'} • Semester {course.semester}
                                  </p>
                                </div>
                                <div
                                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                                    isSelected
                                      ? 'bg-indigo-600 border-indigo-500 text-white'
                                      : 'border-slate-600 text-transparent'
                                  }`}
                                >
                                  <Check className="w-3 h-3" />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* ================================================================ */}
              {/* TEACHER / FACULTY ONBOARDING STEPS (1-5) */}
              {/* ================================================================ */}
              {isTeacher && (
                <>
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Faculty Step 1 of 5</span>
                        <h3 className="text-xl font-bold text-white mt-1">What is your primary teaching department?</h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Select the academic department you are affiliated with.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[260px] overflow-y-auto pr-1">
                        {departments.map((dept) => {
                          const isSelected = teacherDept === dept.name;
                          return (
                            <button
                              key={dept.id || dept.shortCode}
                              type="button"
                              onClick={() => setTeacherDept(dept.name)}
                              className={`text-left p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                                isSelected
                                  ? 'bg-indigo-950/60 border-indigo-500 text-white ring-2 ring-indigo-500/30'
                                  : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                  {dept.shortCode}
                                </span>
                                <p className="text-xs font-semibold leading-snug">{dept.name}</p>
                              </div>
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                                  isSelected
                                    ? 'bg-indigo-600 border-indigo-500 text-white'
                                    : 'border-slate-600 text-transparent'
                                }`}
                              >
                                <Check className="w-3 h-3" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Faculty Step 2 of 5</span>
                        <h3 className="text-xl font-bold text-white mt-1">What is your academic designation?</h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Configure your role signature for course dossiers, syllabus publishing, and grading logs.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {[
                          { title: 'Professor', desc: 'Departmental Chair & Senior Research Mentor' },
                          { title: 'Associate Professor', desc: 'Curriculum Coordinator & Faculty Mentor' },
                          { title: 'Assistant Professor', desc: 'Core Lecturer & Laboratory In-charge' },
                          { title: 'Lecturer', desc: 'Classroom Instructor & Teaching Associate' }
                        ].map((des) => {
                          const isSelected = teacherDesignation === des.title;
                          return (
                            <button
                              key={des.title}
                              type="button"
                              onClick={() => setTeacherDesignation(des.title)}
                              className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-2 ${
                                isSelected
                                  ? 'bg-indigo-950/60 border-indigo-500 text-white ring-2 ring-indigo-500/30'
                                  : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-white">{des.title}</span>
                                <div
                                  className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                                    isSelected
                                      ? 'bg-indigo-600 border-indigo-500 text-white'
                                      : 'border-slate-600 text-transparent'
                                  }`}
                                >
                                  <Check className="w-3 h-3" />
                                </div>
                              </div>
                              <p className="text-xs text-slate-400">{des.desc}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Faculty Step 3 of 5</span>
                        <h3 className="text-xl font-bold text-white mt-1">Primary Teaching & Research Domains</h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Select your core domains to customize AI syllabus suggestions and student project mentorship matching.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                          'AI & Machine Learning',
                          'Data Science & Analytics',
                          'Software Engineering',
                          'Cyber Security & Cryptography',
                          'Cloud & Distributed Systems',
                          'IoT & Embedded Hardware'
                        ].map((spec) => {
                          const isSelected = teacherSpecializations.includes(spec);
                          return (
                            <button
                              key={spec}
                              type="button"
                              onClick={() => toggleTeacherSpec(spec)}
                              className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 ${
                                isSelected
                                  ? 'bg-indigo-950/60 border-indigo-500 text-white ring-2 ring-indigo-500/30'
                                  : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              <span className="text-xs font-bold leading-tight">{spec}</span>
                              <div
                                className={`w-4 h-4 rounded-md flex items-center justify-center border self-end ${
                                  isSelected
                                    ? 'bg-indigo-600 border-indigo-500 text-white'
                                    : 'border-slate-600 text-transparent'
                                }`}
                              >
                                <Check className="w-3 h-3" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Faculty Step 4 of 5</span>
                        <h3 className="text-xl font-bold text-white mt-1">What are your primary pedagogical goals?</h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Select the teaching outcomes you want EduSense AI to assist you in tracking.
                        </p>
                      </div>

                      <div className="space-y-2.5">
                        {[
                          { title: 'Improve Student Retention & Concept Mastery', desc: 'Identify struggling students early and automate diagnostic insights' },
                          { title: 'Curricular Innovation & Hands-on Labs', desc: 'Modernize coursework with real-world industry benchmarks' },
                          { title: 'Placement & Research Mentorship', desc: 'Guide senior capstone projects and research publications' },
                          { title: 'Streamlined Assessment & Rapid Feedback', desc: 'Automate grading metrics and rubric-based evaluations' }
                        ].map((g) => {
                          const isSelected = teacherGoals.includes(g.title);
                          return (
                            <button
                              key={g.title}
                              type="button"
                              onClick={() => toggleTeacherGoal(g.title)}
                              className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                                isSelected
                                  ? 'bg-indigo-950/60 border-indigo-500 text-white ring-2 ring-indigo-500/30'
                                  : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              <div className="space-y-0.5">
                                <h4 className="text-xs font-bold text-white">{g.title}</h4>
                                <p className="text-[11px] text-slate-400">{g.desc}</p>
                              </div>
                              <div
                                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                                  isSelected
                                    ? 'bg-indigo-600 border-indigo-500 text-white'
                                    : 'border-slate-600 text-transparent'
                                }`}
                              >
                                <Check className="w-3 h-3" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {currentStep === 5 && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Faculty Step 5 of 5</span>
                        <h3 className="text-xl font-bold text-white mt-1">Student Support & AI Alert Priorities</h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Configure which automated academic alerts you want prominently highlighted on your faculty portal.
                        </p>
                      </div>

                      <div className="space-y-2.5">
                        {[
                          { title: 'Identify At-Risk Students Early', desc: 'Flag students with attendance below 75% or consecutive failing marks' },
                          { title: 'Automated Assignment & Exam Diagnostics', desc: 'Generate class-wide weak topic summaries after submissions' },
                          { title: 'Punctuality & Attendance Integrity', desc: 'Real-time session attendance monitoring and debarment alerts' }
                        ].map((p) => {
                          const isSelected = teacherSupportPriorities.includes(p.title);
                          return (
                            <button
                              key={p.title}
                              type="button"
                              onClick={() => toggleTeacherPriority(p.title)}
                              className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                                isSelected
                                  ? 'bg-indigo-950/60 border-indigo-500 text-white ring-2 ring-indigo-500/30'
                                  : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              <div className="space-y-0.5">
                                <h4 className="text-xs font-bold text-white">{p.title}</h4>
                                <p className="text-[11px] text-slate-400">{p.desc}</p>
                              </div>
                              <div
                                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                                  isSelected
                                    ? 'bg-indigo-600 border-indigo-500 text-white'
                                    : 'border-slate-600 text-transparent'
                                }`}
                              >
                                <Check className="w-3 h-3" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ================================================================ */}
              {/* ADMIN ONBOARDING (Institutional Priorities) */}
              {/* ================================================================ */}
              {isAdmin && (
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Institutional Oversight</span>
                    <h3 className="text-xl font-bold text-white mt-1">Institutional Governance Priorities</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Configure overarching academic monitoring parameters across all university engineering departments.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      'Curricular Compliance & Accreditation',
                      'Cross-Department Attendance Integrity (75% Minimum)',
                      'Continuous Assessment & Examination Governance',
                      'AI Academic Risk Early Warning System'
                    ].map((item) => {
                      const isSelected = adminFocus.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            if (adminFocus.includes(item)) {
                              if (adminFocus.length > 1) setAdminFocus(adminFocus.filter((i) => i !== item));
                            } else {
                              setAdminFocus([...adminFocus, item]);
                            }
                          }}
                          className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                            isSelected
                              ? 'bg-indigo-950/60 border-indigo-500 text-white ring-2 ring-indigo-500/30'
                              : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span className="text-xs font-bold">{item}</span>
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                              isSelected
                                ? 'bg-indigo-600 border-indigo-500 text-white'
                                : 'border-slate-600 text-transparent'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Bottom Action Controls */}
          <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                currentStep === 1
                  ? 'border-slate-800 text-slate-600 cursor-not-allowed opacity-40'
                  : 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="flex items-center gap-2">
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleFinalSubmit}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-bold px-7 py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving Preferences...
                    </>
                  ) : (
                    <>
                      Continue to Dashboard →
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
