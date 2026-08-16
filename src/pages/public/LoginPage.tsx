import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { EduSenseLogo, EduSenseEmblem } from '../../components/common/EduSenseLogo';
import {
  LogIn,
  User,
  Lock,
  Eye,
  EyeOff,
  X,
  ArrowRight,
  Shield,
  GraduationCap,
  Users,
  ShieldCheck
} from 'lucide-react';

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, isLoading } = useAuth();
  const { showToast } = useToast();
  const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'TEACHER' | 'ADMIN'>('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [hasError, setHasError] = useState(false);

  const getEmailPlaceholder = () => {
    switch (selectedRole) {
      case 'STUDENT':
        return 'student.roll@institution.edu';
      case 'TEACHER':
        return 'faculty.name@university.edu';
      case 'ADMIN':
        return 'admin.office@institution.edu';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasError(false);

    if (!email.trim()) {
      showToast('Please enter your institutional email address.', 'error');
      setHasError(true);
      return;
    }
    if (!password) {
      showToast('Please enter your password.', 'error');
      setHasError(true);
      return;
    }

    try {
      await login(email.trim(), password);
      onNavigate('/');
    } catch {
      setHasError(true);
      // Toast displayed in AuthContext
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={`bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6 ${
          hasError ? 'animate-subtle-shake' : ''
        }`}
      >
        {/* Brand Header */}
        <div className="text-center flex flex-col items-center space-y-2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="flex justify-center"
          >
            <EduSenseEmblem size={64} className="hover:scale-105 transition-transform duration-300 drop-shadow-sm" />
          </motion.div>
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.35 }}
              className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-1.5"
            >
              <span>Sign In to SC EduSense</span>
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent font-black">
                AI
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.35 }}
              className="text-xs text-slate-500 dark:text-slate-400 mt-1"
            >
              “Your Intelligence for Academic Success.”
            </motion.p>
          </div>
        </div>

        {/* Role Context Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-xs">
          <button
            type="button"
            onClick={() => setSelectedRole('STUDENT')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-semibold transition-all relative cursor-pointer ${
              selectedRole === 'STUDENT'
                ? 'text-emerald-700 dark:text-emerald-300'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {selectedRole === 'STUDENT' && (
              <motion.div
                layoutId="login-role-pill"
                className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl shadow-2xs border border-emerald-500/30"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" />
              Student
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole('TEACHER')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-semibold transition-all relative cursor-pointer ${
              selectedRole === 'TEACHER'
                ? 'text-indigo-700 dark:text-indigo-300'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {selectedRole === 'TEACHER' && (
              <motion.div
                layoutId="login-role-pill"
                className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl shadow-2xs border border-indigo-500/30"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              Faculty
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole('ADMIN')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-semibold transition-all relative cursor-pointer ${
              selectedRole === 'ADMIN'
                ? 'text-amber-700 dark:text-amber-300'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {selectedRole === 'ADMIN' && (
              <motion.div
                layoutId="login-role-pill"
                className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl shadow-2xs border border-amber-500/30"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
            </span>
          </button>
        </div>

        {/* Secure Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Institutional Email *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="input-login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={getEmailPlaceholder()}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-8 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              {email && (
                <button
                  type="button"
                  onClick={() => setEmail('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                  title="Clear email"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Password *
              </label>
              <button
                type="button"
                onClick={() => onNavigate('/forgot-password')}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="input-login-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-16 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {password && (
                  <button
                    type="button"
                    onClick={() => setPassword('')}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                    title="Clear password"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <motion.button
            id="btn-submit-login"
            type="submit"
            disabled={isLoading}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold py-3 rounded-xl shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            {isLoading ? 'Authenticating...' : `Sign In as ${selectedRole}`}
          </motion.button>
        </form>

        {/* Security / Institutional Note */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Institutional accounts are protected with role-based access controls and encrypted session verification.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
          Need an academic profile?{' '}
          <button
            onClick={() => onNavigate('/register')}
            className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
          >
            Register here
          </button>
        </div>
      </motion.div>
    </div>
  );
};
