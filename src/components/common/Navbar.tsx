import React from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, LogIn, LayoutDashboard, LogOut, ArrowRight, Layers, HelpCircle, Mail } from 'lucide-react';
import { EduSenseLogo } from './EduSenseLogo';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  const { user, logout } = useAuth();

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'STUDENT':
        return '/student/dashboard';
      case 'TEACHER':
        return '/teacher/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
      default:
        return '/login';
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Courses', path: '/courses' },
    { label: 'Institutional Inquiries', path: '/contact' },
  ];

  return (
    <motion.header
      id="main-public-navbar"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[#061c16]/95 backdrop-blur-md sticky top-0 z-40 border-b border-emerald-900/60 shadow-xs transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <motion.div
          id="brand-logo-btn"
          onClick={() => onNavigate('/')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="cursor-pointer group py-1"
        >
          <EduSenseLogo size="sm" isDark={true} showTagline={true} />
        </motion.div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-emerald-100/80">
          {navLinks.map((link) => {
            const isActive =
              link.path === '/'
                ? currentPath === '/'
                : currentPath.startsWith(link.path);

            return (
              <button
                key={link.path}
                id={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => onNavigate(link.path)}
                className={`relative px-4 py-2 rounded-xl transition-all duration-200 hover:text-white ${
                  isActive
                    ? 'text-white font-bold'
                    : 'text-emerald-100/80'
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="active-navbar-indicator"
                    className="absolute inset-0 bg-emerald-800/40 rounded-xl -z-10 border border-emerald-600/30"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Auth CTA Buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <motion.button
                id="nav-btn-dashboard"
                onClick={() => onNavigate(getDashboardPath())}
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:shadow-emerald-900/40 transition-all duration-200"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Go to</span> {user.role} Dashboard
              </motion.button>
              <motion.button
                id="nav-btn-logout"
                onClick={logout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Logout"
                className="p-2 text-emerald-300/70 hover:text-rose-400 rounded-xl hover:bg-rose-950/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <motion.button
                id="nav-btn-login"
                onClick={() => onNavigate('/login')}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-1.5 text-emerald-100 hover:text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl hover:bg-emerald-900/40 border border-emerald-800/40 transition-all duration-150"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </motion.button>
              <motion.button
                id="nav-btn-register"
                onClick={() => onNavigate('/register')}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:shadow-emerald-900/40 transition-all duration-200"
              >
                Get Started
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
};
