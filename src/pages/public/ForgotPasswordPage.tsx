import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import {
  KeyRound,
  Mail,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  X,
  XCircle,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Send
} from 'lucide-react';

interface ForgotPasswordPageProps {
  onNavigate: (path: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [step, setStep] = useState<'REQUEST' | 'RESET' | 'SUCCESS'>('REQUEST');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('Please enter your institutional email address.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.forgotPassword(email.trim());
      showToast(res.message || 'Password reset token generated.', 'success');
      if (res.reset_token) {
        setResetToken(res.reset_token);
      }
      setStep('RESET');
    } catch (err: any) {
      showToast(err.message || 'Failed to initiate password reset.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetToken.trim()) {
      showToast('Please provide the reset token.', 'error');
      return;
    }

    if (!isPasswordValid) {
      showToast('New password must satisfy all strength criteria.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
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
      setStep('SUCCESS');
    } catch (err: any) {
      showToast(err.message || 'Failed to update password.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6"
      >
        {/* Header */}
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
            {step === 'REQUEST' && 'Reset Account Password'}
            {step === 'RESET' && 'Set New Credentials'}
            {step === 'SUCCESS' && 'Password Reset Complete'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.35 }}
            className="text-xs text-slate-500 dark:text-slate-400"
          >
            {step === 'REQUEST' && 'Enter your university email to verify and receive a secure recovery code'}
            {step === 'RESET' && 'Verify your reset token and define a new secure password'}
            {step === 'SUCCESS' && 'Your institutional credentials have been updated securely'}
          </motion.p>
        </div>

        {/* Step 1: Request Token */}
        {step === 'REQUEST' && (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Institutional Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-forgot-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.name@student.edu"
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-8 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                {email && (
                  <button
                    type="button"
                    onClick={() => setEmail('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                    title="Clear email"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <motion.button
              id="btn-request-reset"
              type="submit"
              disabled={isLoading}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold py-3 rounded-xl shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {isLoading ? 'Verifying Account...' : 'Generate Reset Token'}
            </motion.button>

            <button
              type="button"
              onClick={() => onNavigate('/login')}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white pt-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </button>
          </form>
        )}

        {/* Step 2: Set New Password */}
        {step === 'RESET' && (
          <form onSubmit={handleSetNewPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Recovery Verification Token *
              </label>
              <div className="relative">
                <input
                  id="input-reset-token"
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="6-digit reset code"
                  className="w-full font-mono bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                {resetToken && (
                  <button
                    type="button"
                    onClick={() => setResetToken('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                    title="Clear token"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-reset-new-password"
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
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                      title="Clear password"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Confirm New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-reset-confirm-password"
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
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                      title="Clear confirm password"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
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

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                <div
                  className={`flex items-center gap-1.5 font-medium transition-colors ${
                    passwordCriteria.minLength ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {passwordCriteria.minLength ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />}
                  8+ Characters
                </div>
                <div
                  className={`flex items-center gap-1.5 font-medium transition-colors ${
                    passwordCriteria.hasUpper ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {passwordCriteria.hasUpper ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />}
                  Uppercase (A-Z)
                </div>
                <div
                  className={`flex items-center gap-1.5 font-medium transition-colors ${
                    passwordCriteria.hasLower ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {passwordCriteria.hasLower ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />}
                  Lowercase (a-z)
                </div>
                <div
                  className={`flex items-center gap-1.5 font-medium transition-colors ${
                    passwordCriteria.hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {passwordCriteria.hasNumber ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />}
                  Number (0-9)
                </div>
              </div>
            </div>

            <motion.button
              id="btn-confirm-reset"
              type="submit"
              disabled={isLoading || !isPasswordValid || !passwordsMatch}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold py-3 rounded-xl shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              {isLoading ? 'Updating Security...' : 'Save New Password & Complete'}
            </motion.button>
          </form>
        )}

        {/* Step 3: Success */}
        {step === 'SUCCESS' && (
          <div className="text-center py-4 space-y-5">
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800 shadow-sm">
              <CheckCircle2 className="w-8 h-8 animate-in zoom-in duration-300" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Credentials Successfully Updated</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You can now log in to the SC EduSense AI portal with your new password.
              </p>
            </div>
            <motion.button
              id="btn-goto-login"
              type="button"
              onClick={() => onNavigate('/login')}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-3 rounded-xl shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Return to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
