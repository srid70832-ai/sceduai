import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { InstitutionalInquiry } from '../../types';
import { ACADEMIC_DEPARTMENTS } from '../../lib/departments';
import { KITLogo } from '../../components/common/KITLogo';
import {
  MapPin,
  Phone,
  Smartphone,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  HelpCircle,
  Clock,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';

interface ContactPageProps {
  onNavigate: (path: string) => void;
}

const INQUIRY_TYPES = [
  'Academic Support',
  'Course / Curriculum',
  'Faculty Support',
  'Student Support',
  'Technical Integration',
  'LMS Support',
  'Institutional Partnership',
  'Other'
] as const;

const INQUIRY_ROLES = [
  'Student',
  'Faculty',
  'Academic Coordinator',
  'Administrator',
  'Institution Representative'
] as const;

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Form State
  const [fullName, setFullName] = useState('');
  const [institutionalEmail, setInstitutionalEmail] = useState('');
  const [role, setRole] = useState<string>('Student');
  const [department, setDepartment] = useState('');
  const [subject, setSubject] = useState('');
  const [inquiryType, setInquiryType] = useState<string>('Academic Support');
  const [message, setMessage] = useState('');

  // UI / Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<InstitutionalInquiry | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Pre-fill fields if user is authenticated with REAL data
  useEffect(() => {
    if (user) {
      if (user.full_name) {
        setFullName(user.full_name);
      }
      if (user.email) {
        setInstitutionalEmail(user.email);
      }
      if (user.role === 'STUDENT') {
        setRole('Student');
      } else if (user.role === 'TEACHER') {
        setRole('Faculty');
      } else if (user.role === 'ADMIN') {
        setRole('Administrator');
      }
      if (user.department) {
        setDepartment(user.department);
      }
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);

    // Validation
    if (!fullName.trim()) {
      showToast('Please provide your full name.', 'error');
      return;
    }
    if (!institutionalEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(institutionalEmail.trim())) {
      showToast('Please provide a valid institutional email address.', 'error');
      return;
    }
    if (!role.trim()) {
      showToast('Please select your role.', 'error');
      return;
    }
    if (!department.trim()) {
      showToast('Please specify your department.', 'error');
      return;
    }
    if (!subject.trim()) {
      showToast('Please provide an inquiry subject.', 'error');
      return;
    }
    if (!inquiryType.trim()) {
      showToast('Please select an inquiry type.', 'error');
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      showToast('Please provide a detailed inquiry message (at least 10 characters).', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // REAL Database insertion via backend API
      const result = await api.createInquiry({
        full_name: fullName.trim(),
        institutional_email: institutionalEmail.trim().toLowerCase(),
        role: role.trim(),
        department: department.trim(),
        subject: subject.trim(),
        inquiry_type: inquiryType.trim(),
        message: message.trim()
      });

      setSubmissionSuccess(result);
      showToast('Your institutional inquiry has been securely submitted.', 'success');
    } catch (err: any) {
      console.error('Inquiry submission error:', err);
      setSubmissionError(err.message || 'Unable to submit your inquiry right now.');
      showToast('Unable to submit your inquiry. Please check your connection and try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmissionSuccess(null);
    setSubmissionError(null);
    setSubject('');
    setMessage('');
    // If not authenticated, clear the other fields too
    if (!user) {
      setFullName('');
      setInstitutionalEmail('');
      setRole('Student');
      setDepartment('');
      setInquiryType('Academic Support');
    }
  };

  const copyReferenceId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    showToast('Reference ID copied to clipboard.', 'info');
    setTimeout(() => setCopiedId(false), 3000);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-slate-50/70 dark:bg-slate-950/70">
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Page Header */}
        <motion.div
          id="contact-page-header"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-3xl mx-auto space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            <span>Institutional Relations &amp; Academic Support</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Academic Support &amp; Institutional Inquiries
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            Connect with university coordinators, academic registrars, and technical integration teams.
          </p>
        </motion.div>

        {/* Two-Column Desktop Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT COLUMN: Institutional Contact Information Card (5 Cols) */}
          <motion.div
            id="institutional-contact-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="lg:col-span-5 space-y-6"
          >
            {/* Primary Institutional Identity & Details Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
              
              {/* Institutional Crest Header */}
              <div className="pb-6 border-b border-slate-100 dark:border-slate-800/80 space-y-3">
                <KITLogo size="md" />
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/40 text-[10px] font-semibold text-amber-800 dark:text-amber-300">
                  <ShieldCheck className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>Approved by AICTE • NAAC 'A' Grade &amp; NBA Accredited</span>
                </div>
              </div>

              {/* Verified Contact Details Sections */}
              <div className="space-y-6 text-xs">

                {/* LOCATION */}
                <div className="flex items-start gap-3.5 group">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/50 group-hover:scale-105 transition-transform duration-200">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="space-y-1 text-left flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                      LOCATION
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      KIT-Kalaignarkarunanidhi Institute of Technology,<br />
                      Kannampalayam (Post),<br />
                      Coimbatore – 641 402,<br />
                      Tamil Nadu, India.
                    </p>
                    <a
                      href="https://maps.google.com/?q=KIT-Kalaignarkarunanidhi+Institute+of+Technology,+Kannampalayam,+Coimbatore+641402,+Tamil+Nadu,+India"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline pt-1 cursor-pointer"
                    >
                      <span>View on Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* TELEPHONE */}
                <div className="flex items-start gap-3.5 pt-4 border-t border-slate-100 dark:border-slate-800/80 group">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-100 dark:border-sky-900/50 group-hover:scale-105 transition-transform duration-200">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="space-y-1 text-left flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                      PHONE
                    </h3>
                    <div>
                      <a
                        href="tel:04222367890"
                        className="text-slate-800 dark:text-slate-200 font-semibold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-xs"
                      >
                        0422 236 7890
                      </a>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      Standard Institutional Reception &amp; Administrative EPABX
                    </p>
                  </div>
                </div>

                {/* MOBILE NUMBERS */}
                <div className="flex items-start gap-3.5 pt-4 border-t border-slate-100 dark:border-slate-800/80 group">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-900/50 group-hover:scale-105 transition-transform duration-200">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div className="space-y-2 text-left flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                      MOBILE
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold">
                      <a
                        href="tel:+919965590076"
                        className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 transition-all border border-slate-100 dark:border-slate-800"
                      >
                        <span>+91 99655 90076</span>
                      </a>
                      <a
                        href="tel:+919965590056"
                        className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 transition-all border border-slate-100 dark:border-slate-800"
                      >
                        <span>+91 99655 90056</span>
                      </a>
                      <a
                        href="tel:+919965590062"
                        className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 transition-all border border-slate-100 dark:border-slate-800"
                      >
                        <span>+91 99655 90062</span>
                      </a>
                      <a
                        href="tel:+919965590035"
                        className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 transition-all border border-slate-100 dark:border-slate-800"
                      >
                        <span>+91 99655 90035</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* EMAIL */}
                <div className="flex items-start gap-3.5 pt-4 border-t border-slate-100 dark:border-slate-800/80 group">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/50 group-hover:scale-105 transition-transform duration-200">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="space-y-1 text-left flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                      EMAIL
                    </h3>
                    <div>
                      <a
                        href="mailto:kitbce@gmail.com"
                        className="text-slate-800 dark:text-slate-200 font-semibold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-xs inline-flex items-center gap-1"
                      >
                        kitbce@gmail.com
                      </a>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      Official Institutional &amp; Academic Correspondence
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Quick Assistance Guarantee Card */}
            <div className="bg-gradient-to-br from-indigo-900/90 to-slate-900 rounded-3xl p-6 text-white space-y-3 shadow-sm border border-indigo-700/40">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>Academic Response Protocol</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Institutional inquiries logged via SC EduSense are synchronized directly with the designated department heads and registrar coordinators.
              </p>
              <div className="pt-2 flex items-center justify-between text-[11px] text-indigo-200 border-t border-indigo-800/60">
                <span>Direct Campus Office Hours</span>
                <span className="font-semibold text-white">Mon – Fri: 08:30 – 17:30 IST</span>
              </div>
            </div>

          </motion.div>

          {/* RIGHT COLUMN: Institutional Inquiry Form Card (7 Cols) */}
          <motion.div
            id="institutional-inquiry-form-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="lg:col-span-7"
          >
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-10 shadow-sm relative overflow-hidden">

              <AnimatePresence mode="wait">
                {/* 1. SUCCESS STATE (Displayed ONLY upon REAL Database Insertion) */}
                {submissionSuccess ? (
                  <motion.div
                    key="success-state"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35 }}
                    className="py-6 sm:py-10 space-y-6 text-center"
                  >
                    {/* Animated Checkmark Badge */}
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle2 className="w-9 h-9 animate-bounce" />
                    </div>

                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                        <Check className="w-3.5 h-3.5" />
                        <span>✓ Inquiry submitted successfully</span>
                      </div>
                      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Inquiry Received
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                        Your inquiry has been successfully submitted. An academic support representative will review your message and respond through your registered institutional email.
                      </p>
                    </div>

                    {/* Real Database Reference ID Container */}
                    <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 max-w-md mx-auto text-left space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Inquiry reference ID:
                        </span>
                        <button
                          type="button"
                          onClick={() => copyReferenceId(submissionSuccess.id)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                        >
                          {copiedId ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="font-mono text-xs text-slate-900 dark:text-white font-semibold bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 break-all select-all">
                        {submissionSuccess.id}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-800">
                        <div>
                          <span className="font-medium">Category: </span>
                          <span className="font-semibold text-slate-700 dark:text-slate-200">{submissionSuccess.inquiry_type}</span>
                        </div>
                        <div>
                          <span className="font-medium">Status: </span>
                          <span className="font-semibold text-amber-600 dark:text-amber-400">{submissionSuccess.status}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        type="button"
                        id="btn-send-another-inquiry"
                        onClick={handleResetForm}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm hover:shadow-indigo-500/25 transition-all cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Send another inquiry
                      </button>
                      <button
                        type="button"
                        onClick={() => onNavigate('/')}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                      >
                        Return to Home
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  /* 2. INQUIRY FORM STATE */
                  <motion.div
                    key="form-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {/* Form Title & Subtitle */}
                    <div className="space-y-1">
                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Institutional Inquiry Form
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Please fill in the required academic specifications. Submissions are verified and dispatched to departmental registrars.
                      </p>
                    </div>

                    {/* Logged in User Banner Notice */}
                    {user && (
                      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-indigo-900 dark:text-indigo-200 text-xs">
                        <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span>
                          Logged in as <strong className="font-semibold">{user.full_name}</strong> ({user.email}). Credentials pre-populated.
                        </span>
                      </div>
                    )}

                    {/* Submission Error Banner */}
                    {submissionError && (
                      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-200 text-xs">
                        <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                        <div className="space-y-1 flex-1">
                          <p className="font-bold">Unable to submit your inquiry right now.</p>
                          <p className="text-[11px] text-rose-700 dark:text-rose-300">
                            Please check your connection and try again.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSubmissionError(null)}
                          className="text-xs font-semibold underline text-rose-700 dark:text-rose-300 cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Row 1: Full Name & Institutional Email */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="input-inquiry-fullname"
                            className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
                          >
                            Full Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            id="input-inquiry-fullname"
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter your full name"
                            className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-2xs"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="input-inquiry-email"
                            className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
                          >
                            Institutional Email <span className="text-rose-500">*</span>
                          </label>
                          <input
                            id="input-inquiry-email"
                            type="email"
                            required
                            value={institutionalEmail}
                            onChange={(e) => setInstitutionalEmail(e.target.value)}
                            placeholder="name@university.edu"
                            className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-2xs"
                          />
                        </div>
                      </div>

                      {/* Row 2: Role & Department */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="select-inquiry-role"
                            className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
                          >
                            Role <span className="text-rose-500">*</span>
                          </label>
                          <select
                            id="select-inquiry-role"
                            required
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-2xs"
                          >
                            {INQUIRY_ROLES.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                          <p className="text-[10px] text-slate-400 mt-1">
                            Note: Role selection is for academic categorization only.
                          </p>
                        </div>

                        <div>
                          <label
                            htmlFor="input-inquiry-department"
                            className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
                          >
                            Department <span className="text-rose-500">*</span>
                          </label>
                          <input
                            id="input-inquiry-department"
                            type="text"
                            list="department-options"
                            required
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            placeholder="e.g. Artificial Intelligence and Data Science"
                            className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-2xs"
                          />
                          <datalist id="department-options">
                            {ACADEMIC_DEPARTMENTS.map((dept) => (
                              <option key={dept.id} value={dept.name} />
                            ))}
                          </datalist>
                        </div>
                      </div>

                      {/* Row 3: Inquiry Type & Subject */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="select-inquiry-type"
                            className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
                          >
                            Inquiry Type <span className="text-rose-500">*</span>
                          </label>
                          <select
                            id="select-inquiry-type"
                            required
                            value={inquiryType}
                            onChange={(e) => setInquiryType(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-2xs"
                          >
                            {INQUIRY_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="input-inquiry-subject"
                            className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
                          >
                            Subject <span className="text-rose-500">*</span>
                          </label>
                          <input
                            id="input-inquiry-subject"
                            type="text"
                            required
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Brief summary of inquiry"
                            className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-2xs"
                          />
                        </div>
                      </div>

                      {/* Row 4: Message */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label
                            htmlFor="textarea-inquiry-message"
                            className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                          >
                            Message <span className="text-rose-500">*</span>
                          </label>
                          <span className="text-[10px] text-slate-400">
                            {message.length} characters
                          </span>
                        </div>
                        <textarea
                          id="textarea-inquiry-message"
                          rows={5}
                          required
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Please provide full details of your institutional request, curriculum queries, LMS integration requirements, or academic support specifications..."
                          className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all shadow-2xs"
                        />
                      </div>

                      {/* Form Submission Actions */}
                      <div className="pt-2 space-y-2">
                        <motion.button
                          type="submit"
                          id="btn-submit-inquiry"
                          disabled={isSubmitting}
                          whileHover={{ y: isSubmitting ? 0 : -1 }}
                          whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-semibold py-3 rounded-xl shadow-sm hover:shadow-indigo-500/25 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Submitting Inquiry to Academic Registry...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Submit Institutional Inquiry</span>
                            </>
                          )}
                        </motion.button>

                        <p className="text-[11px] text-slate-400 text-center">
                          All submitted inquiries are archived with audit logging under SC EduSense Academic Services.
                        </p>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </motion.div>

        </div>

      </div>
    </div>
  );
};
