import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import {
  Lock,
  Eye,
  EyeOff,
  X,
  CheckCircle2,
  XCircle,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface ResetPasswordPageProps {
  onNavigate: (path: string) => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [email, setEmail] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('email') || '';
  });
  const [resetToken, setResetToken] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('token') || '';
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Live password validation
  const passwordCriteria = useMemo(() => {
    return {
      minLength: newPassword.length >= 8,
      hasUpper: /[A-Z]/.test(newPassword),
      hasLower: /[a-z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
    };
  }, [newPassword]);

  const isPasswordValid =
    passwordCriteria.minLength &&
    passwordCriteria.hasUpper &&
    passwordCriteria.hasLower &&
    passwordCriteria.hasNumber;

  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      showToast('Please enter your institutional email address.', 'error');
      return;
    }

    if (!resetToken.trim()) {
      showToast('Please enter your verification reset token.', 'error');
      return;
    }

    if (!isPasswordValid) {
      showToast('Password must satisfy all security criteria (8+ chars, uppercase, lowercase, number).', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match. Please verify confirmation.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.resetPassword({
        email: email.trim(),
        reset_token: resetToken.trim(),
        new_password: newPassword,
      });
      showToast(res.message || 'Password updated successfully.', 'success');
      setIsSuccess(true);
    } catch (err: any) {
      showToast(err.message || 'Unable to update password. Please check token or request a new reset link.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6"
      >
        {/* Animated Brand Header */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-sky-500 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-500/20"
          >
            <KeyRound className="w-6 h-6" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.35 }}
            className="text-xl font-bold text-slate-900 dark:text-white tracking-tight"
          >
            {isSuccess ? 'Password Reset Complete' : 'Set New Secure Password'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.35 }}
            className="text-xs text-slate-500 dark:text-slate-400"
          >
            {isSuccess
              ? 'Your password has been updated successfully.'
              : 'Enter your verification token and define new academic credentials'}
          </motion.p>
        </div>

        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="text-center py-4 space-y-5"
          >
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800 shadow-sm">
              <CheckCircle2 className="w-8 h-8 animate-in zoom-in duration-300" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Password updated successfully.
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You may now sign in using your new password.
              </p>
            </div>

            <motion.button
              id="btn-return-login"
              type="button"
              onClick={() => onNavigate('/login')}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-3 rounded-xl shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
            >
              <span>Return to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Institutional Email *
              </label>
              <div className="relative">
                <input
                  id="input-reset-page-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.name@student.edu"
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                {email && (
                  <button
                    type="button"
                    onClick={() => setEmail('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    title="Clear email"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Token Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Reset Verification Code / Token *
              </label>
              <div className="relative">
                <input
                  id="input-reset-page-token"
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="e.g. 6-digit recovery code"
                  className="w-full font-mono bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                {resetToken && (
                  <button
                    type="button"
                    onClick={() => setResetToken('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    title="Clear token"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-reset-page-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-16 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {newPassword && (
                    <button
                      type="button"
                      onClick={() => setNewPassword('')}
                      className="text-slate-400 hover:text-slate-600 p-1"
                      title="Clear field"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Confirm New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-reset-page-confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-16 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {confirmPassword && (
                    <button
                      type="button"
                      onClick={() => setConfirmPassword('')}
                      className="text-slate-400 hover:text-slate-600 p-1"
                      title="Clear field"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {confirmPassword && (
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

            {/* Live Strength Criteria */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Password Strength Requirements
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

              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div
                  className={`flex items-center gap-1.5 font-medium transition-all ${
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
                  At least 8 characters
                </div>

                <div
                  className={`flex items-center gap-1.5 font-medium transition-all ${
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
                  Uppercase letter
                </div>

                <div
                  className={`flex items-center gap-1.5 font-medium transition-all ${
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
                  Lowercase letter
                </div>

                <div
                  className={`flex items-center gap-1.5 font-medium transition-all ${
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
                  Number
                </div>
              </div>
            </div>

            <motion.button
              id="btn-submit-reset-password"
              type="submit"
              disabled={isLoading || !isPasswordValid || !passwordsMatch || !email || !resetToken}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold py-3 rounded-xl shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              {isLoading ? 'Updating Password...' : 'Update Password & Complete'}
            </motion.button>

            <button
              type="button"
              onClick={() => onNavigate('/login')}
              className="w-full text-center text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 pt-2 transition-colors cursor-pointer"
            >
              Return to Sign In
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
