import React from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { EduSenseLogo } from './EduSenseLogo';
import {
  Sparkles,
  MapPin,
  Mail,
  Phone,
  ArrowUpRight,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  HelpCircle,
  Cpu
} from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  const getStudentPortalPath = () => {
    if (!user) return '/login';
    if (user.role === 'STUDENT') return '/student/dashboard';
    return `/${user.role.toLowerCase()}/dashboard`;
  };

  const getTeacherPortalPath = () => {
    if (!user) return '/login';
    if (user.role === 'TEACHER') return '/teacher/dashboard';
    return `/${user.role.toLowerCase()}/dashboard`;
  };

  const getAcademicProgressPath = () => {
    if (!user) return '/login';
    if (user.role === 'STUDENT') return '/student/progress';
    if (user.role === 'TEACHER') return '/teacher/student-analytics';
    return '/admin/analytics';
  };

  const getAIInsightsPath = () => {
    if (!user) return '/login';
    if (user.role === 'STUDENT') return '/student/ai-insights';
    if (user.role === 'TEACHER') return '/teacher/ai-insights';
    return '/admin/ai-analytics';
  };

  return (
    <footer
      id="main-sc-edusense-footer"
      className="relative bg-[#061c16] text-slate-400 overflow-hidden border-t border-emerald-900/80 z-10 transition-colors"
    >
      {/* Top Animated Shimmer Border Light Effect */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent pointer-events-none" />
      <motion.div
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="absolute top-0 left-0 w-1/3 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent blur-[1px] pointer-events-none"
      />

      {/* Subtle Background Glow Elements & Noise Grid */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-950/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(#064e3b_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none -z-10" />

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        
        {/* Brand Bar & Top Tier */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10 border-b border-emerald-900/60 items-start">
          
          {/* Brand Info & Tagline (5 Cols on Large screens) */}
          <div className="lg:col-span-5 space-y-4 text-left">
            <motion.div
              onClick={() => onNavigate('/')}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="cursor-pointer inline-block group"
            >
              <div className="relative">
                <EduSenseLogo size="sm" isDark={true} showTagline={true} />
                {/* Subtle Brand Glow on Hover */}
                <div className="absolute -inset-2 rounded-2xl bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-colors duration-300 pointer-events-none -z-10" />
              </div>
            </motion.div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-[11px] font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>AI-Powered Academic Intelligence &amp; LMS</span>
            </div>

            <p className="text-xs text-slate-400 font-normal leading-relaxed max-w-md">
              Comprehensive university operating system orchestrating syllabus delivery, real-time biometric attendance, exam analytics, and diagnostic intelligence.
            </p>
          </div>

          {/* Institutional Highlight (4 Cols) */}
          <div className="lg:col-span-4 bg-slate-950/70 border border-emerald-900/70 rounded-2xl p-4 sm:p-5 space-y-2.5 backdrop-blur-xs">
            <div className="flex items-center gap-2 text-white font-bold text-xs">
              <GraduationCap className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="tracking-tight">KIT – Kalaignarkarunanidhi Institute of Technology</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
              Kannampalayam (Post), Coimbatore – 641 402, Tamil Nadu, India.
            </p>
            <div className="pt-1.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] border-t border-emerald-900/60 text-slate-300">
              <a
                href="mailto:kitbce@gmail.com"
                className="inline-flex items-center gap-1 hover:text-emerald-400 transition-colors font-medium cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>kitbce@gmail.com</span>
              </a>
              <a
                href="tel:04222367890"
                className="inline-flex items-center gap-1 hover:text-emerald-400 transition-colors font-medium cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>0422 236 7890</span>
              </a>
            </div>
          </div>

          {/* Developed by SC TECH (3 Cols) */}
          <div className="lg:col-span-3 flex items-center lg:justify-end">
            <div className="bg-slate-950/70 border border-emerald-900/70 rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 backdrop-blur-xs hover:border-emerald-800 transition-all duration-200 inline-flex items-center gap-2 whitespace-nowrap shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                DEVELOPED BY <span className="text-emerald-400 font-extrabold">SC TECH</span>
              </span>
              <motion.span
                animate={{
                  scale: [1, 1.22, 1, 1.14, 1]
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="inline-block text-sm text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)] select-none"
                title="Crafted with passion for academic intelligence"
              >
                ❤️
              </motion.span>
            </div>
          </div>

        </div>

        {/* 4-Column Navigation Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-10 border-b border-slate-800/80 text-left">
          
          {/* Col 1: PLATFORM */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              PLATFORM
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/')}
                  className="text-slate-400 hover:text-white transition-colors duration-200 inline-flex items-center gap-1 cursor-pointer group"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">Home</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/courses')}
                  className="text-slate-400 hover:text-white transition-colors duration-200 inline-flex items-center gap-1 cursor-pointer group"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">Course Catalog</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/contact')}
                  className="text-slate-400 hover:text-white transition-colors duration-200 inline-flex items-center gap-1 cursor-pointer group"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">Institutional Inquiries</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 2: ACADEMIC */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              ACADEMIC
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate(getStudentPortalPath())}
                  className="text-slate-400 hover:text-white transition-colors duration-200 inline-flex items-center gap-1 cursor-pointer group"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">Student Portal</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate(getTeacherPortalPath())}
                  className="text-slate-400 hover:text-white transition-colors duration-200 inline-flex items-center gap-1 cursor-pointer group"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">Faculty Portal</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate(getAcademicProgressPath())}
                  className="text-slate-400 hover:text-white transition-colors duration-200 inline-flex items-center gap-1 cursor-pointer group"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">Academic Progress</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate(getAIInsightsPath())}
                  className="text-slate-400 hover:text-white transition-colors duration-200 inline-flex items-center gap-1 cursor-pointer group"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">AI Recommendations</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: SUPPORT */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              SUPPORT
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/contact')}
                  className="text-slate-400 hover:text-white transition-colors duration-200 inline-flex items-center gap-1 cursor-pointer group"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">Institutional Support</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/contact')}
                  className="text-slate-400 hover:text-white transition-colors duration-200 inline-flex items-center gap-1 cursor-pointer group"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">Contact</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/contact')}
                  className="text-slate-400 hover:text-white transition-colors duration-200 inline-flex items-center gap-1 cursor-pointer group"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">Help &amp; Guidance</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: INSTITUTIONAL */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              INSTITUTION
            </h3>
            <div className="space-y-2 text-xs text-slate-400">
              <p className="font-semibold text-slate-200">
                KIT-Kalaignarkarunanidhi Institute of Technology
              </p>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Kannampalayam (Post),<br />
                Coimbatore – 641 402,<br />
                Tamil Nadu, India.
              </p>
              <div className="space-y-1 pt-1 text-[11px]">
                <div>
                  <span className="text-slate-500">Email: </span>
                  <a href="mailto:kitbce@gmail.com" className="text-slate-300 hover:text-indigo-400 transition-colors">
                    kitbce@gmail.com
                  </a>
                </div>
                <div>
                  <span className="text-slate-500">Phone: </span>
                  <a href="tel:04222367890" className="text-slate-300 hover:text-indigo-400 transition-colors">
                    0422 236 7890
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Platform Meta */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 text-center md:text-left">
          
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <span className="font-bold text-slate-300">SC EduSense AI</span>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span>© 2026 SC EduSense AI. All rights reserved.</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 text-[11px] text-slate-400">
            <span className="italic font-medium text-slate-400">“Your Intelligence for Academic Success.”</span>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span className="text-slate-500">Academic Intelligence &amp; Learning Management Platform</span>
          </div>

        </div>

      </div>
    </footer>
  );
};
