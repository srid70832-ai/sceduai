import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { FeedbackItem, FeedbackStatus } from '../../types';
import { FeedbackModal } from '../../components/feedback/FeedbackModal';
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  FileText,
  Paperclip,
  Send,
  Loader2,
  ChevronRight,
  User,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StudentFeedbackPageProps {
  onNavigate: (path: string) => void;
}

export const StudentFeedbackPage: React.FC<StudentFeedbackPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedTicket, setSelectedTicket] = useState<FeedbackItem | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Student follow-up reply state
  const [replyMessage, setReplyMessage] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  useEffect(() => {
    loadMyFeedback();
  }, []);

  const loadMyFeedback = async () => {
    setIsLoading(true);
    try {
      const data = await api.getMyFeedback();
      setFeedbacks(data || []);
      // If a ticket is currently open, refresh its data
      if (selectedTicket) {
        const updated = (data || []).find((f) => f.id === selectedTicket.id || f.feedback_id === selectedTicket.feedback_id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (err: any) {
      showToast('Failed to load your feedback history.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    setIsSendingReply(true);
    try {
      const updated = await api.respondFeedback(selectedTicket.id, {
        message: replyMessage.trim()
      });
      setSelectedTicket(updated);
      setReplyMessage('');
      showToast('Your message has been sent to the academic support team.', 'success');
      loadMyFeedback();
    } catch (err: any) {
      showToast(err.message || 'Failed to send reply.', 'error');
    } finally {
      setIsSendingReply(false);
    }
  };

  const filteredFeedbacks = feedbacks.filter((item) => {
    const matchesSearch =
      item.feedback_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: FeedbackStatus) => {
    switch (status) {
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Resolved
          </span>
        );
      case 'In Progress':
      case 'Assigned':
        return (
          <span className="inline-flex items-center gap-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-indigo-500" />
            In Progress
          </span>
        );
      case 'In Review':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-amber-500" />
            In Review
          </span>
        );
      case 'Closed':
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
            Closed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-blue-500" />
            Open
          </span>
        );
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'CRITICAL':
        return <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">CRITICAL</span>;
      case 'HIGH':
        return <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">HIGH</span>;
      case 'MEDIUM':
        return <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">MEDIUM</span>;
      default:
        return <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">LOW</span>;
    }
  };

  const stats = {
    total: feedbacks.length,
    open: feedbacks.filter((f) => f.status === 'Open' || f.status === 'In Review').length,
    inProgress: feedbacks.filter((f) => f.status === 'In Progress' || f.status === 'Assigned').length,
    resolved: feedbacks.filter((f) => f.status === 'Resolved').length
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1 rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
            <span>Academic Help Desk & Issue Resolution</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            My Feedback & Help Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track real-time status and staff responses for your questions, registration bugs, and academic queries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadMyFeedback}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Feedback</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Submitted</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="text-xs font-semibold text-amber-600 dark:text-amber-400">Open / In Review</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.open}</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">In Progress</div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{stats.inProgress}</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Resolved</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.resolved}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Feedback ID (e.g. FDB-2026-0001), subject, category..."
            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-hidden w-full sm:w-auto font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Review">In Review</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Feedback Items List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
            Loading your feedback dossier...
          </div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="p-12 text-center space-y-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Feedback Records Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              You have not submitted any feedback matching your search filters. Click below to raise a question or report an issue.
            </p>
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Submit Feedback</span>
            </button>
          </div>
        ) : (
          filteredFeedbacks.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.15 }}
              onClick={() => setSelectedTicket(item)}
              className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 rounded-2xl shadow-xs cursor-pointer transition-all space-y-3 group"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
                    {item.feedback_id}
                  </span>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                    {item.category}
                  </span>
                  {getPriorityBadge(item.priority)}
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(item.status)}
                  <span className="text-[11px] text-slate-400">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {item.subject}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
                  {item.description}
                </p>
              </div>

              {/* Staff Response Snippet */}
              {item.admin_response ? (
                <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl text-xs flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-emerald-800 dark:text-emerald-300">
                      Staff Response {item.assigned_to_name ? `(${item.assigned_to_name})` : ''}:
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 mt-0.5 line-clamp-2">
                      {item.admin_response}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                  <span>Awaiting review from Academic Support team</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold group-hover:underline flex items-center gap-1">
                    <span>View Ticket Thread</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Ticket Detail & Thread Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      {selectedTicket.feedback_id}
                    </span>
                    {getStatusBadge(selectedTicket.status)}
                    {getPriorityBadge(selectedTicket.priority)}
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {selectedTicket.subject}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {/* Meta details */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs grid grid-cols-2 sm:grid-cols-3 gap-3 text-slate-600 dark:text-slate-400">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{selectedTicket.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Submitted Date</span>
                    <span className="font-medium">{new Date(selectedTicket.created_at).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Staff</span>
                    <span className="font-medium text-slate-900 dark:text-white">{selectedTicket.assigned_to_name || 'Academic Support Desk'}</span>
                  </div>
                </div>

                {/* Initial Description */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Your Initial Report:</span>
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {selectedTicket.description}
                  </p>
                  {selectedTicket.attachment_url && (
                    <div className="pt-2">
                      <a
                        href={selectedTicket.attachment_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 hover:underline"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>View Attachment</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Conversation Thread */}
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Official Responses & Thread
                  </div>

                  {(!selectedTicket.responses || selectedTicket.responses.length <= 1) && !selectedTicket.admin_response && (
                    <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      Ticket is open in queue. An academic coordinator will review and reply shortly.
                    </div>
                  )}

                  {selectedTicket.responses?.slice(1).map((msg) => {
                    const isStaff = msg.sender_role === 'ADMIN' || msg.sender_role === 'TEACHER';
                    return (
                      <div
                        key={msg.id}
                        className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                          isStaff
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
                            : 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/50 ml-4'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {msg.sender_name}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {msg.sender_role}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(msg.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                          {msg.message}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Input Form */}
                {selectedTicket.status !== 'Closed' && (
                  <form onSubmit={handleSendFollowUp} className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Add a follow-up reply or clarification:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Type your reply here..."
                        className="flex-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                      />
                      <button
                        type="submit"
                        disabled={isSendingReply || !replyMessage.trim()}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 shrink-0"
                      >
                        {isSendingReply ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Reply</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Feedback Submission Modal */}
      <FeedbackModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        currentPath="/student/feedback"
        onNavigate={onNavigate}
        initialTab="submit"
      />
    </div>
  );
};
