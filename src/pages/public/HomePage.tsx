import React, { useState, useEffect } from 'react';
import { motion, type Variants } from 'motion/react';
import { api } from '../../lib/api';
import { Course } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { EduSenseEmblem, EduSenseLogo } from '../../components/common/EduSenseLogo';
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  CalendarCheck,
  Users,
  Brain,
  TrendingUp,
  Award,
  Layers,
  CheckCircle2,
  Orbit,
  Cpu,
  BarChart3
} from 'lucide-react';
import { AnimatedCounter } from '../../components/common/AnimatedCounter';
import { CardSkeleton } from '../../components/common/Skeleton';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

const FULL_HERO_PHRASE = 'Academic Success.';

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Typewriter effect state for hero headline
  const [typedText, setTypedText] = useState(FULL_HERO_PHRASE);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingIndex, setTypingIndex] = useState(FULL_HERO_PHRASE.length);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mediaQuery.matches) {
        setTypedText(FULL_HERO_PHRASE);
        return;
      }
    }

    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      // Typing phase: 80ms per character
      if (typingIndex < FULL_HERO_PHRASE.length) {
        timer = setTimeout(() => {
          setTypedText(FULL_HERO_PHRASE.slice(0, typingIndex + 1));
          setTypingIndex((prev) => prev + 1);
        }, 80);
      } else {
        // Hold complete phrase for ~2000ms
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2000);
      }
    } else {
      // Deleting phase: ~45ms per character
      if (typingIndex > 0) {
        timer = setTimeout(() => {
          setTypedText(FULL_HERO_PHRASE.slice(0, typingIndex - 1));
          setTypingIndex((prev) => prev - 1);
        }, 45);
      } else {
        // Pause briefly (~500ms) before typing again in loop
        timer = setTimeout(() => {
          setIsDeleting(false);
        }, 500);
      }
    }

    return () => clearTimeout(timer);
  }, [typingIndex, isDeleting]);

  // Smooth cursor blink interval
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    Promise.all([
      api.getCourses().catch(() => []),
      api.getAdminStats().catch(() => null),
    ])
      .then(([coursesData, statsData]) => {
        setCourses(coursesData);
        setStats(statsData);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: 'easeOut',
      },
    },
  };

  const getPortalTarget = (rolePath: string) => {
    if (!user) return '/login';
    return `/${user.role.toLowerCase()}/dashboard`;
  };

  return (
    <div className="space-y-20 py-8 relative">
      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto space-y-7"
        >
          {/* Official SC EduSense AI Logo & Emblem Showcase */}
          <motion.div variants={itemVariants} className="flex flex-col items-center justify-center">
            <div className="relative group cursor-pointer" onClick={() => onNavigate('/')}>
              <div className="p-3 bg-white/90 dark:bg-slate-900/90 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl shadow-indigo-500/10 backdrop-blur-md group-hover:scale-105 group-hover:shadow-indigo-500/20 transition-all duration-300">
                <EduSenseEmblem size={84} className="group-hover:rotate-1 transition-transform duration-300 drop-shadow-md" />
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-3 rounded-full border border-indigo-400/25 border-dashed pointer-events-none"
              />
            </div>
          </motion.div>

          {/* AI Badge */}
          <motion.div variants={itemVariants} className="flex justify-center">
            <div className="inline-flex items-center gap-2 bg-indigo-50/90 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800/60 px-4 py-1.5 rounded-full text-xs font-semibold text-indigo-700 dark:text-indigo-300 shadow-2xs backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
              <span>AI-Powered Academic Intelligence & LMS</span>
            </div>
          </motion.div>

          {/* Main Headline with Smooth Typewriter Effect */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]"
          >
            Your Intelligence for <br />
            <span className="inline-block relative min-h-[1.2em]">
              <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 bg-clip-text text-transparent">
                {typedText}
              </span>
              <span
                aria-hidden="true"
                className={`inline-block w-[3px] sm:w-[4px] h-[0.78em] bg-indigo-600 dark:bg-indigo-400 align-baseline ml-1 rounded-xs transition-opacity duration-150 ${
                  showCursor ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto"
          >
            SC EduSense AI unifies curriculum management, real-time attendance auditing, assignment evaluations, and Gemini-powered pedagogical diagnostics in one secure university platform.
          </motion.p>

          {/* Action CTAs */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {user ? (
              <motion.button
                id="hero-btn-dashboard"
                onClick={() => onNavigate(`/${user.role.toLowerCase()}/dashboard`)}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-7 py-3.5 rounded-2xl shadow-lg shadow-indigo-500/25 transition-all text-sm cursor-pointer"
              >
                Access {user.role} Dashboard
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <>
                <motion.button
                  id="hero-btn-get-started"
                  onClick={() => onNavigate('/register')}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-7 py-3.5 rounded-2xl shadow-lg shadow-indigo-500/25 transition-all text-sm cursor-pointer"
                >
                  Create Academic Profile
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
                <motion.button
                  id="hero-btn-browse-courses"
                  onClick={() => onNavigate('/courses')}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 font-semibold px-6 py-3.5 rounded-2xl transition-all text-sm shadow-2xs cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  Explore Course Catalog
                </motion.button>
              </>
            )}
          </motion.div>

          {/* Academic Role Portals Preview */}
          <motion.div variants={itemVariants} className="pt-8">
            <div className="max-w-4xl mx-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs rounded-3xl border border-slate-200/90 dark:border-slate-800/90 p-6 sm:p-8 shadow-xs">
              <div className="text-center mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Institutional Portals & Roles
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Unified role-based access for students, faculty educators, and academic administrators
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                {/* Student Card */}
                <motion.div
                  whileHover={{ y: -3, scale: 1.01 }}
                  onClick={() => onNavigate(getPortalTarget('/student/dashboard'))}
                  className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 hover:border-emerald-500 cursor-pointer transition-all duration-200 shadow-2xs group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Student Portal</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Syllabi, coursework submissions, attendance logs, exam scorecards, and AI study plans.
                  </p>
                  <div className="mt-4 flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 gap-1">
                    <span>{user ? 'Enter Student View' : 'Student Access'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>

                {/* Faculty Card */}
                <motion.div
                  whileHover={{ y: -3, scale: 1.01 }}
                  onClick={() => onNavigate(getPortalTarget('/teacher/dashboard'))}
                  className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/40 hover:border-indigo-500 cursor-pointer transition-all duration-200 shadow-2xs group"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Faculty Portal</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Class sections, daily attendance recording, assignment grading, and cohort diagnostics.
                  </p>
                  <div className="mt-4 flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 gap-1">
                    <span>{user ? 'Enter Faculty View' : 'Faculty Access'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>

                {/* Admin Card */}
                <motion.div
                  whileHover={{ y: -3, scale: 1.01 }}
                  onClick={() => onNavigate(getPortalTarget('/admin/dashboard'))}
                  className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 hover:border-amber-500 cursor-pointer transition-all duration-200 shadow-2xs group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Admin Portal</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Campus metrics, instructor allocations, course registries, audit logs, and governance.
                  </p>
                  <div className="mt-4 flex items-center text-xs font-semibold text-amber-600 dark:text-amber-400 gap-1">
                    <span>{user ? 'Enter Admin View' : 'Admin Access'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Live Academic Database Metrics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Curricular Courses</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {stats?.total_courses !== undefined ? <AnimatedCounter value={stats.total_courses} /> : '—'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Active in university catalog</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Enrolled Students</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {stats?.total_students !== undefined ? <AnimatedCounter value={stats.total_students} /> : '—'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Registered academic profiles</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.16 }}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Faculty Members</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {stats?.total_teachers !== undefined ? <AnimatedCounter value={stats.total_teachers} /> : '—'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Teaching faculty roster</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.24 }}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Class Sections</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {stats?.total_classes !== undefined ? <AnimatedCounter value={stats.total_classes} /> : '—'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Scheduled academic sections</p>
          </motion.div>
        </div>
      </section>

      {/* Featured Courses from DB */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Curricular Catalog
            </span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
              Active University Courses
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/courses')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 group cursor-pointer"
          >
            <span>View all courses ({courses.length})</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-500 mx-auto mb-3 animate-float">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">No courses available yet.</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Courses created by administrators will be displayed dynamically here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.slice(0, 3).map((c, idx) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                whileHover={{ y: -3 }}
                onClick={() => onNavigate(`/courses/${c.id}`)}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-xs hover:border-indigo-500/50 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800/40">
                      {c.code}
                    </span>
                    <span className="text-slate-400 font-medium">{c.credits} Credits</span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {c.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {c.description || 'Comprehensive curriculum with hands-on lab sessions.'}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                  <span>{c.department}</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    View Syllabus →
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Platform Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Engineered for Academic Precision
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Every feature connects directly to validated academic business logic and audit records
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -3 }}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-3">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Attendance Oversight</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Session-by-session attendance tracking with threshold alerts (&lt;75% attendance triggers automatic risk flags).
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.08 }}
            whileHover={{ y: -3 }}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Weighted Marks Engine</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Assignments and exam scores calculated dynamically with credit weighting, grading scales (A+, A, B, C, D, F).
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.16 }}
            whileHover={{ y: -3 }}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-3">
              <Brain className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Gemini AI Diagnostics</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Direct integration with Gemini 3.7 Pro for personalized study schedules and classroom pedagogical adjustments.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.24 }}
            whileHover={{ y: -3 }}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Role-Based Access & Audit</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Strict isolation between student, faculty, and administrator capabilities with immutable activity logs.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
