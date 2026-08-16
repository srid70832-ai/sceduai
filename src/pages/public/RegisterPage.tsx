import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { EduSenseEmblem, EduSenseLogo } from '../../components/common/EduSenseLogo';
import {
  UserPlus,
  User,
  Mail,
  Lock,
  Building,
  GraduationCap,
  Users,
  Eye,
  EyeOff,
  X,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ShieldCheck,
  Hash,
  BadgeAlert
} from 'lucide-react';
import { ACADEMIC_DEPARTMENTS, DEPARTMENT_CATEGORIES, DEFAULT_DEPARTMENT } from '../../lib/departments';

interface RegisterPageProps {
  onNavigate: (path: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register, isLoading } = useAuth();
  const { showToast } = useToast();

  const [role, setRole] = useState<'STUDENT' | 'TEACHER'>('STUDENT');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    department: DEFAULT_DEPARTMENT,
    roll_number: '',
    employee_code: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Live password validation criteria
  const passwordCriteria = useMemo(() => {
    const pwd = formData.password;
    return {
      minLength: pwd.length >= 8,
      hasUpper: /[A-Z]/.test(pwd),
      hasLower: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
    };
  }, [formData.password]);

  const isPasswordValid =
    passwordCriteria.minLength &&
    passwordCriteria.hasUpper &&
    passwordCriteria.hasLower &&
    passwordCriteria.hasNumber;

  const passwordsMatch =
    formData.confirm_password.length > 0 &&
    formData.password === formData.confirm_password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.full_name.trim()) {
      showToast('Please enter your full legal or institutional name.', 'error');
      return;
    }

    if (!formData.email.trim()) {
      showToast('Please enter a valid institutional email address.', 'error');
      return;
    }

    if (role === 'STUDENT' && !formData.roll_number.trim()) {
      showToast('Student Roll Number / University ID is required.', 'error');
      return;
    }

    if (role === 'TEACHER' && !formData.employee_code.trim()) {
      showToast('Faculty Employee Code / Staff ID is required.', 'error');
      return;
    }

    if (!isPasswordValid) {
      showToast('Password must satisfy all security requirements (8+ chars, uppercase, lowercase, number).', 'error');
      return;
    }

    if (formData.password !== formData.confirm_password) {
      showToast('Passwords do not match. Please verify your confirmation password.', 'error');
      return;
    }

    try {
      await register({
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role,
        department: formData.department,
        roll_number: role === 'STUDENT' ? formData.roll_number.trim() : undefined,
        employee_code: role === 'TEACHER' ? formData.employee_code.trim() : undefined,
        major: formData.department,
      });
      onNavigate(`/${role.toLowerCase()}/dashboard`);
    } catch {
      // Error handled by AuthContext
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 sm:py-14">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6"
      >
        <div className="text-center flex flex-col items-center space-y-2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="flex justify-center"
          >
            <EduSenseEmblem size={60} className="hover:scale-105 transition-transform duration-300 drop-shadow-sm" />
          </motion.div>
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.35 }}
              className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight"
            >
              Create Academic Profile
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.35 }}
              className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1"
            >
              Join the SC EduSense AI university intelligence ecosystem
            </motion.p>
          </div>
        </div>

        {/* Role Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Select Your Academic Role *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              id="btn-role-student"
              type="button"
              onClick={() => setRole('STUDENT')}
              className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                role === 'STUDENT'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Student Registration
            </button>

            <button
              id="btn-role-teacher"
              type="button"
              onClick={() => setRole('TEACHER')}
              className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                role === 'TEACHER'
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <Users className="w-4 h-4" />
              Faculty Instructor
            </button>
          </div>

          <div className="mt-2.5 p-2.5 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/30 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-normal">
              <strong>Admin Access Policy:</strong> Administrator privileges cannot be publicly registered and must be provisioned internally by university institutional governance.
            </p>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Full Legal Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-register-name"
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder={role === 'STUDENT' ? 'e.g. Maya Lin' : 'e.g. Dr. Rajesh Kumar'}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-8 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                {formData.full_name && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, full_name: '' })}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                    title="Clear name"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Institutional Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-register-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={role === 'STUDENT' ? 'maya.lin@student.edu' : 'rajesh.kumar@faculty.edu'}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-8 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                {formData.email && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, email: '' })}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                    title="Clear email"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Academic Department *
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="select-register-dept"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
                >
                  {DEPARTMENT_CATEGORIES.map((cat) => (
                    <optgroup key={cat} label={cat}>
                      {ACADEMIC_DEPARTMENTS.filter((d) => d.category === cat).map((dept) => (
                        <option key={dept.id} value={dept.name}>
                          {dept.name} ({dept.shortCode})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                {role === 'STUDENT' ? 'Student Roll Number *' : 'Faculty Employee Code *'}
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-register-code"
                  type="text"
                  required
                  value={role === 'STUDENT' ? formData.roll_number : formData.employee_code}
                  onChange={(e) =>
                    role === 'STUDENT'
                      ? setFormData({ ...formData, roll_number: e.target.value })
                      : setFormData({ ...formData, employee_code: e.target.value })
                  }
                  placeholder={role === 'STUDENT' ? 'e.g. 711525BAD157' : 'e.g. FAC-AIDS-108'}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-8 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                {((role === 'STUDENT' && formData.roll_number) || (role === 'TEACHER' && formData.employee_code)) && (
                  <button
                    type="button"
                    onClick={() =>
                      role === 'STUDENT'
                        ? setFormData({ ...formData, roll_number: '' })
                        : setFormData({ ...formData, employee_code: '' })
                    }
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                    title="Clear field"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Password and Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-register-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-16 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {formData.password && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, password: '' })}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-register-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-16 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {formData.confirm_password && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, confirm_password: '' })}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {formData.confirm_password && (
                <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                  {passwordsMatch ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                    </span>
                  ) : (
                    <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Passwords do not match
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Real-time Password Strength Criteria */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Password Security Requirements
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                  isPasswordValid
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {isPasswordValid ? 'Strong' : 'Incomplete'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div
                className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${
                  passwordCriteria.minLength
                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {passwordCriteria.minLength ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 animate-in zoom-in duration-200" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                )}
                8+ Characters
              </div>

              <div
                className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${
                  passwordCriteria.hasUpper
                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {passwordCriteria.hasUpper ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 animate-in zoom-in duration-200" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                )}
                Uppercase (A-Z)
              </div>

              <div
                className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${
                  passwordCriteria.hasLower
                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {passwordCriteria.hasLower ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 animate-in zoom-in duration-200" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                )}
                Lowercase (a-z)
              </div>

              <div
                className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${
                  passwordCriteria.hasNumber
                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {passwordCriteria.hasNumber ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 animate-in zoom-in duration-200" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                )}
                Number (0-9)
              </div>
            </div>
          </div>

          <motion.button
            id="btn-submit-register"
            type="submit"
            disabled={isLoading || !isPasswordValid || !passwordsMatch}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold py-3 rounded-xl shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            {isLoading ? 'Registering Account...' : 'Register & Enter Academic Portal'}
          </motion.button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
          Already have an academic account?{' '}
          <button
            onClick={() => onNavigate('/login')}
            className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
          >
            Sign in here
          </button>
        </div>
      </motion.div>
    </div>
  );
};
