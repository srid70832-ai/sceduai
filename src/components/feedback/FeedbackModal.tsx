import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { FeedbackCategory, FeedbackPriority, HelpDeskFAQ, FeedbackItem } from '../../types';
import {
  X,
  Send,
  HelpCircle,
  MessageSquare,
  Sparkles,
  Paperclip,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Search,
  ExternalLink,
  Bot,
  User,
  MapPin,
  Clock,
  ShieldAlert,
  Loader2,
  Trash2,
  FileText,
  LifeBuoy
} from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
  onNavigate?: (path: string) => void;
  initialTab?: 'submit' | 'helpdesk' | 'my-tickets';
}

const CATEGORIES: FeedbackCategory[] = [
  'Bug / Technical Issue',
  'Course Issue',
  'Registration Issue',
  'Assignment Issue',
  'Attendance Issue',
  'Examination Issue',
  'AI / Chatbot Issue',
  'NPTEL Course Issue',
  'UI / Design Issue',
  'Suggestion',
  'Other'
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  currentPath,
  onNavigate,
  initialTab = 'submit'
}) => {
  const { user, student, teacher, admin } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'submit' | 'helpdesk' | 'my-tickets'>(initialTab);

  // Form State
  const [category, setCategory] = useState<FeedbackCategory>('Bug / Technical Issue');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<FeedbackPriority>('MEDIUM');
  const [attachmentUrl, setAttachmentUrl] = useState<string>('');
  const [attachmentName, setAttachmentName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedFeedback, setSubmittedFeedback] = useState<FeedbackItem | null>(null);

  // Help Desk State
  const [faqs, setFaqs] = useState<HelpDeskFAQ[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [isLoadingFaqs, setIsLoadingFaqs] = useState(false);

  // Quick My Tickets Preview
  const [myRecentTickets, setMyRecentTickets] = useState<FeedbackItem[]>([]);
  const [isLoadingMyTickets, setIsLoadingMyTickets] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSubmittedFeedback(null);
      loadFAQs();
      if (user) {
        loadMyRecentTickets();
      }
    }
  }, [isOpen, initialTab, user]);

  const loadFAQs = async () => {
    setIsLoadingFaqs(true);
    try {
      const data = await api.getHelpDeskFAQs();
      setFaqs(data || []);
    } catch {
      // Fallback
    } finally {
      setIsLoadingFaqs(false);
    }
  };

  const loadMyRecentTickets = async () => {
    setIsLoadingMyTickets(true);
    try {
      const data = await api.getMyFeedback();
      setMyRecentTickets(data || []);
    } catch {
      // ignore
    } finally {
      setIsLoadingMyTickets(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be under 5MB', 'error');
      return;
    }

    setAttachmentName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setAttachmentUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in to submit feedback or support requests.', 'error');
      return;
    }

    if (!subject.trim()) {
      showToast('Please enter a subject / short title.', 'error');
      return;
    }

    if (!description.trim()) {
      showToast('Please describe your issue or feedback in detail.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.submitFeedback({
        category,
        subject: subject.trim(),
        description: description.trim(),
        priority,
        attachment_url: attachmentUrl,
        page_url: currentPath || window.location.pathname
      });

      if (res && res.data) {
        setSubmittedFeedback(res.data);
        showToast('Feedback submitted successfully. Our team will review and resolve it.', 'success');
        // Reset form
        setSubject('');
        setDescription('');
        setCategory('Bug / Technical Issue');
        setPriority('MEDIUM');
        setAttachmentUrl('');
        setAttachmentName('');
        loadMyRecentTickets();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to submit feedback. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // User identifier helper
  const getIdentifier = () => {
    if (student?.roll_number) return `Roll: ${student.roll_number}`;
    if (teacher?.employee_code) return `Emp: ${teacher.employee_code}`;
    if (admin) return 'Administrator';
    return user?.email || 'Authenticated User';
  };

  const filteredFaqs = faqs.filter(
    (f) =>
      (f.question || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.answer || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.tags.some((t) => (t || "").toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-slate-50 to-indigo-500/5 dark:from-emerald-950/30 dark:via-slate-900 dark:to-indigo-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Feedback & Help Desk
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Live Support
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tell us about an issue, suggestion, or question.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 px-4 pt-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('submit');
              setSubmittedFeedback(null);
            }}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'submit'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Submit Feedback</span>
          </button>

          <button
            onClick={() => setActiveTab('helpdesk')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'helpdesk'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Help Desk & FAQs</span>
          </button>

          {user && (
            <button
              onClick={() => setActiveTab('my-tickets')}
              className={`pb-2.5 px-3 border-b-2 flex items-center gap-2 transition-all ${
                activeTab === 'my-tickets'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>My History</span>
              {myRecentTickets.length > 0 && (
                <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.2 rounded-full text-[10px]">
                  {myRecentTickets.length}
                </span>
              )}
            </button>
          )}

          {onNavigate && (
            <button
              onClick={() => {
                onClose();
                onNavigate('/student/ai-insights');
              }}
              className="ml-auto pb-2.5 px-3 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1.5"
            >
              <Bot className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask SC EDU AI</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'submit' && (
            <div>
              {submittedFeedback ? (
                /* Success Screen */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 text-center space-y-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl"
                >
                  <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Feedback submitted successfully.
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Thank you. Our team will review and resolve it.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 max-w-md mx-auto text-left shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Tracking Feedback ID:</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
                        {submittedFeedback.feedback_id}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      <span className="font-medium text-slate-700 dark:text-slate-300">Subject:</span> {submittedFeedback.subject}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      <span className="font-medium text-slate-700 dark:text-slate-300">Priority:</span>{' '}
                      <span className="font-semibold">{submittedFeedback.priority}</span> | Status:{' '}
                      <span className="font-semibold text-emerald-600">{submittedFeedback.status}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => setSubmittedFeedback(null)}
                      className="px-4 py-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      Submit Another Feedback
                    </button>
                    {onNavigate && user?.role === 'STUDENT' && (
                      <button
                        onClick={() => {
                          onClose();
                          onNavigate('/student/feedback');
                        }}
                        className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-colors"
                      >
                        View in "My Feedback"
                      </button>
                    )}
                    {onNavigate && user?.role === 'ADMIN' && (
                      <button
                        onClick={() => {
                          onClose();
                          onNavigate('/admin/feedback');
                        }}
                        className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-sm transition-colors"
                      >
                        Open Admin Feedback Panel
                      </button>
                    )}
                  </div>
                </motion.div>
              ) : (
                /* Submission Form */
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Context Banner: Auto-captured session metadata */}
                  {user ? (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold">{user.full_name}</span>
                        <span className="text-slate-400">({user.role})</span>
                        <span className="text-slate-400">•</span>
                        <span className="font-mono text-[11px] text-slate-500">{getIdentifier()}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        <MapPin className="w-3 h-3 text-emerald-500" />
                        <span className="truncate max-w-[180px]">{currentPath || '/'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>You must be signed in to submit feedback and track resolution.</span>
                    </div>
                  )}

                  {/* Feedback Type & Priority */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Feedback Type <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                        className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-hidden"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Priority Level
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as FeedbackPriority[]).map((p) => {
                          const isSelected = priority === p;
                          const getStyle = () => {
                            if (p === 'LOW') return isSelected ? 'bg-emerald-600 text-white border-emerald-600' : 'hover:bg-emerald-50 dark:hover:bg-emerald-950/50';
                            if (p === 'MEDIUM') return isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'hover:bg-indigo-50 dark:hover:bg-indigo-950/50';
                            if (p === 'HIGH') return isSelected ? 'bg-amber-600 text-white border-amber-600' : 'hover:bg-amber-50 dark:hover:bg-amber-950/50';
                            return isSelected ? 'bg-rose-600 text-white border-rose-600' : 'hover:bg-rose-50 dark:hover:bg-rose-950/50';
                          };
                          return (
                            <button
                              type="button"
                              key={p}
                              onClick={() => setPriority(p)}
                              className={`py-1.5 text-[10px] font-bold rounded-lg border transition-all text-center ${
                                isSelected
                                  ? getStyle()
                                  : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800'
                              }`}
                            >
                              {p}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Subject / Short Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="E.g., Course requirements not displaying after registration"
                      className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-hidden"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Description <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the issue or feedback in detail..."
                      className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-hidden resize-none"
                      required
                    />
                  </div>

                  {/* Optional File / Screenshot Attachment */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Optional Screenshot / File Attachment (Max 5MB)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*,.pdf,.doc,.docx,.txt"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 flex items-center gap-2 transition-colors"
                      >
                        <Paperclip className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{attachmentName ? 'Change File' : 'Attach Screenshot or Document'}</span>
                      </button>

                      {attachmentName && (
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                          <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="truncate max-w-[150px] font-medium">{attachmentName}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setAttachmentUrl('');
                              setAttachmentName('');
                            }}
                            className="text-rose-500 hover:text-rose-700 p-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                    <p className="text-[11px] text-slate-400">
                      Submissions are routed directly to Academic Staff & Admins.
                    </p>
                    <button
                      type="submit"
                      disabled={isSubmitting || !user}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Feedback</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeTab === 'helpdesk' && (
            <div className="space-y-4">
              {/* Search FAQs */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search common questions, NPTEL sync, attendance rules..."
                  className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-hidden"
                />
              </div>

              {/* FAQ Accordion */}
              <div className="space-y-2">
                {isLoadingFaqs ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-500" />
                    Loading Knowledge Base...
                  </div>
                ) : filteredFaqs.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    No FAQs matched your search term. You can switch to "Submit Feedback" to contact support.
                  </div>
                ) : (
                  filteredFaqs.map((faq) => {
                    const isExpanded = expandedFaq === faq.id;
                    return (
                      <div
                        key={faq.id}
                        className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-800/50"
                      >
                        <button
                          onClick={() => setExpandedFaq(isExpanded ? null : faq.id)}
                          className="w-full p-3 text-left flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              {faq.category}
                            </span>
                            <span>{faq.question}</span>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="p-3 pt-0 text-xs text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800/80 leading-relaxed">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Quick AI & Support Contacts card */}
              <div className="p-4 bg-gradient-to-br from-indigo-50/70 to-emerald-50/50 dark:from-indigo-950/30 dark:to-emerald-950/20 rounded-xl border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Have syllabus or subject doubts?</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Ask SC EDU AI in English, தமிழ் (Tamil), or Tanglish with voice recognition.
                  </p>
                </div>
                {onNavigate && (
                  <button
                    onClick={() => {
                      onClose();
                      onNavigate('/student/ai-insights');
                    }}
                    className="px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition-colors shrink-0"
                  >
                    Open SC EDU AI
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'my-tickets' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Recent feedback submitted from your account</span>
                {onNavigate && user?.role === 'STUDENT' && (
                  <button
                    onClick={() => {
                      onClose();
                      onNavigate('/student/feedback');
                    }}
                    className="text-emerald-600 hover:underline font-semibold"
                  >
                    View All in Dashboard →
                  </button>
                )}
              </div>

              {isLoadingMyTickets ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-500" />
                  Loading your tickets...
                </div>
              ) : myRecentTickets.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  You haven't submitted any feedback yet.
                </div>
              ) : (
                myRecentTickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800/60 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {t.feedback_id}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.status === 'Resolved'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : t.status === 'In Progress'
                            ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {t.subject}
                    </div>
                    {t.admin_response && (
                      <div className="p-2 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40 rounded-lg text-[11px] text-slate-700 dark:text-slate-300">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">Staff Response:</span>{' '}
                        {t.admin_response}
                      </div>
                    )}
                    <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                      <span>Category: {t.category}</span>
                      <span>{new Date(t.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
