import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { EduSenseLogo } from './EduSenseLogo';
import {
  LayoutDashboard,
  BookOpen,
  CalendarCheck,
  FileCheck,
  Award,
  TrendingUp,
  Sparkles,
  Bell,
  User,
  Users,
  Layers,
  GraduationCap,
  FileSpreadsheet,
  Activity,
  LogOut,
  LifeBuoy
} from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate, isOpenMobile, onCloseMobile }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  interface NavItem {
    label: string;
    path: string;
    icon: React.ReactNode;
    badge?: string;
  }

  const studentNav: NavItem[] = [
    { label: 'Overview', path: '/student/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'My Courses', path: '/student/courses', icon: <BookOpen className="w-4 h-4" /> },
    { label: 'Assignments', path: '/student/assignments', icon: <FileCheck className="w-4 h-4" /> },
    { label: 'Attendance', path: '/student/attendance', icon: <CalendarCheck className="w-4 h-4" /> },
    { label: 'Examinations', path: '/student/exams', icon: <Award className="w-4 h-4" /> },
    { label: 'Results & Marks', path: '/student/results', icon: <Award className="w-4 h-4" /> },
    { label: 'Academic Progress', path: '/student/progress', icon: <TrendingUp className="w-4 h-4" /> },
    { label: 'AI Recommendations', path: '/student/ai-insights', icon: <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />, badge: 'AI' },
    { label: 'Feedback & Help', path: '/student/feedback', icon: <LifeBuoy className="w-4 h-4" /> },
    { label: 'Notifications', path: '/student/notifications', icon: <Bell className="w-4 h-4" /> },
    { label: 'My Profile', path: '/student/profile', icon: <User className="w-4 h-4" /> },
  ];

  const teacherNav: NavItem[] = [
    { label: 'Teacher Dashboard', path: '/teacher/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'My Courses', path: '/teacher/courses', icon: <BookOpen className="w-4 h-4" /> },
    { label: 'Class Sections', path: '/teacher/classes', icon: <Layers className="w-4 h-4" /> },
    { label: 'Attendance Tracker', path: '/teacher/attendance', icon: <CalendarCheck className="w-4 h-4" /> },
    { label: 'Assignments & Grading', path: '/teacher/assignments', icon: <FileCheck className="w-4 h-4" /> },
    { label: 'Examinations', path: '/teacher/examinations', icon: <Award className="w-4 h-4" /> },
    { label: 'Student Marks Entry', path: '/teacher/results', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { label: 'Enrolled Students', path: '/teacher/students', icon: <Users className="w-4 h-4" /> },
    { label: 'Class Analytics', path: '/teacher/analytics', icon: <TrendingUp className="w-4 h-4" /> },
    { label: 'AI Class Insights', path: '/teacher/ai-insights', icon: <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />, badge: 'AI' },
    { label: 'Help Desk & Feedback', path: '/teacher/feedback', icon: <LifeBuoy className="w-4 h-4" /> },
    { label: 'Teacher Profile', path: '/teacher/profile', icon: <User className="w-4 h-4" /> },
  ];

  const adminNav: NavItem[] = [
    { label: 'System Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Student Directory', path: '/admin/students', icon: <GraduationCap className="w-4 h-4" /> },
    { label: 'Faculty Directory', path: '/admin/teachers', icon: <Users className="w-4 h-4" /> },
    { label: 'Course Catalog', path: '/admin/courses', icon: <BookOpen className="w-4 h-4" /> },
    { label: 'Class Sections', path: '/admin/classes', icon: <Layers className="w-4 h-4" /> },
    { label: 'Assignments', path: '/admin/assignments', icon: <FileCheck className="w-4 h-4" /> },
    { label: 'Examinations', path: '/admin/examinations', icon: <Award className="w-4 h-4" /> },
    { label: 'Attendance Oversight', path: '/admin/attendance', icon: <CalendarCheck className="w-4 h-4" /> },
    { label: 'Results Central', path: '/admin/results', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { label: 'Academic Analytics', path: '/admin/analytics', icon: <TrendingUp className="w-4 h-4" /> },
    { label: 'AI Campus Insights', path: '/admin/ai-insights', icon: <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />, badge: 'AI' },
    { label: 'Feedback Management', path: '/admin/feedback', icon: <LifeBuoy className="w-4 h-4" /> },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: <Activity className="w-4 h-4" /> },
  ];

  const currentNav = user.role === 'ADMIN' ? adminNav : (user.role === 'TEACHER' ? teacherNav : studentNav);

  const getRoleBadge = () => {
    switch (user.role) {
      case 'ADMIN':
        return <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">ADMINISTRATOR</span>;
      case 'TEACHER':
        return <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">FACULTY INSTRUCTOR</span>;
      case 'STUDENT':
        return <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">ENROLLED STUDENT</span>;
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800">
          <div
            id="sidebar-brand-button"
            onClick={() => {
              onNavigate('/');
              onCloseMobile?.();
            }}
            className="cursor-pointer group"
          >
            <EduSenseLogo size="sm" isDark={true} accentVariant="emerald" showTagline={true} />
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-800/60 flex items-center justify-between">
            {getRoleBadge()}
          </div>
        </div>

        {/* User Card */}
        <div className="px-4 py-3 bg-slate-950/40 border-b border-slate-800/80 flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
            user.role === 'ADMIN'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : user.role === 'TEACHER'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}>
            {user.full_name ? user.full_name.charAt(0).toUpperCase() : (user.role === 'ADMIN' ? 'A' : user.role === 'TEACHER' ? 'F' : 'S')}
          </div>
          <div className="overflow-hidden flex-1">
            <div className="text-xs font-semibold text-white truncate">{user.full_name}</div>
            <div className="text-[11px] text-slate-400 truncate">{user.department || user.email}</div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          {currentNav.map((item) => {
            const isActive = currentPath === item.path || (item.path !== `/${user.role.toLowerCase()}/dashboard` && currentPath.startsWith(item.path));
            return (
              <button
                key={item.path}
                id={`sidebar-nav-${item.path.replace(/\//g, '-')}`}
                onClick={() => {
                  onNavigate(item.path);
                  onCloseMobile?.();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/25 translate-x-0.5'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 hover:translate-x-0.5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`transition-transform duration-150 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-3 border-t border-slate-800 space-y-1">
          <button
            id="sidebar-btn-public-site"
            onClick={() => {
              onNavigate('/');
              onCloseMobile?.();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span>Public Catalog</span>
          </button>

          <button
            id="sidebar-btn-logout"
            onClick={() => {
              logout();
              onNavigate('/login');
              onCloseMobile?.();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
