import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { FeedbackItem, FeedbackStatus, FeedbackPriority } from '../../types';
import {
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  User,
  Paperclip,
  Send,
  Loader2,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  FileText,
  Lock,
  LifeBuoy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const TeacherFeedbackPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [filterView, setFilterView] = useState<'all' | 'assigned_to_me'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal / Drawer
  const [selectedTicket, setSelectedTicket] = useState<FeedbackItem | null>(null);
  const [responseText, setResponseText] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [updateStatus, setUpdateStatus] = useState<FeedbackStatus>('In Progress');
  const [isSending, setIsSending] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);

  useEffect(() => {
    loadFeedback();
  }, [filterView, statusFilter]);

  const loadFeedback = async () => {
    setIsLoading(true);
    try {
      const data = await api.getFeedbackList({
        assigned_to: filterView === 'assigned_to_me' ? 'me' : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined
      });
      setFeedbacks(data || []);

      if (selectedTicket) {
        const updated = (data || []).find((f) => f.id === selectedTicket.id || f.feedback_id === selectedTicket.feedback_id);
        if (updated) setSelectedTicket(updated);
      }
    } catch {
      showToast('Failed to load feedback dossiers.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !responseText.trim()) return;

    setIsSending(true);
    try {
      const updated = await api.respondFeedback(selectedTicket.id, {
        message: responseText.trim(),
        status: updateStatus
      });
      setSelectedTicket(updated);
      setResponseText('');
      showToast('Response sent to student.', 'success');
      loadFeedback();
    } catch (err: any) {
      showToast(err.message || 'Failed to send response.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleAddInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !internalNote.trim()) return;

    setIsAddingNote(true);
    try {
      const updated = await api.addFeedbackInternalNote(selectedTicket.id, {
        note: internalNote.trim()
      });
      setSelectedTicket(updated);
      setInternalNote('');
      showToast('Internal note saved.', 'success');
      loadFeedback();
    } catch (err: any) {
      showToast(err.message || 'Failed to add note.', 'error');
    } finally {
      setIsAddingNote(false);
    }
  };

  const filteredFeedbacks = feedbacks.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.feedback_id.toLowerCase().includes(q) ||
      item.user_name.toLowerCase().includes(q) ||
      item.subject.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
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
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1 rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-1.5">
            <LifeBuoy className="w-3.5 h-3.5 text-emerald-500" />
            <span>Faculty Academic Support & Queries</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Academic Help Desk & Student Queries
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Resolve student doubts, course issues, attendance appeals, and registration inquiries.
          </p>
        </div>

        <button
          onClick={loadFeedback}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 text-xs font-semibold self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tabs and Filter Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Toggle Scope */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setFilterView('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterView === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Inquiries ({feedbacks.length})
          </button>
          <button
            onClick={() => setFilterView('assigned_to_me')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterView === 'assigned_to_me'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Assigned to Me
          </button>
        </div>

        {/* Search and Status */}
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search feedback..."
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-900 dark:text-white outline-hidden"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-hidden font-medium"
          >
            <option value="ALL">All Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Feedbacks Grid / List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
            Loading Help Desk Queue...
          </div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            No feedback records in this queue.
          </div>
        ) : (
          filteredFeedbacks.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setSelectedTicket(item);
                setUpdateStatus(item.status);
                setResponseText('');
                setInternalNote('');
              }}
              className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 rounded-2xl shadow-xs cursor-pointer transition-all space-y-3 group"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
                    {item.feedback_id}
                  </span>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                    {item.category}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-600 border border-amber-200">
                    {item.priority}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(item.status)}
                  <span className="text-[11px] text-slate-400">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                  {item.subject}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 mt-0.5">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{item.user_name}</span>
                  <span className="text-slate-400 font-mono text-[11px]">({item.user_email})</span>
                </div>

                <span className="text-emerald-600 dark:text-emerald-400 font-medium group-hover:underline flex items-center gap-1">
                  <span>Respond & Review</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Teacher Resolution Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200">
                      {selectedTicket.feedback_id}
                    </span>
                    {getStatusBadge(selectedTicket.status)}
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {selectedTicket.subject}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
                {/* User & Query info */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedTicket.user_name}</span>
                    <span className="text-slate-400 ml-2 font-mono">({selectedTicket.user_email})</span>
                  </div>
                  <span className="text-slate-400">{new Date(selectedTicket.created_at).toLocaleString()}</span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-bold text-slate-700 dark:text-slate-300">Student Issue Description:</div>
                  <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {selectedTicket.description}
                  </p>
                  {selectedTicket.attachment_url && (
                    <a
                      href={selectedTicket.attachment_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-emerald-600 hover:underline pt-1"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>View Student Attachment</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Conversation Thread */}
                {selectedTicket.responses && selectedTicket.responses.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                      Message History
                    </div>
                    {selectedTicket.responses.map((resp, idx) => (
                      <div
                        key={resp.id || idx}
                        className={`p-3 rounded-xl border ${
                          resp.sender_role === 'TEACHER' || resp.sender_role === 'ADMIN'
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200'
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-200'
                        }`}
                      >
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {resp.sender_name} ({resp.sender_role})
                          </span>
                          <span>{new Date(resp.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 mt-1">{resp.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Teacher Reply Form */}
                <form onSubmit={handleSendResponse} className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Faculty Response to Student:
                    </label>
                    <textarea
                      rows={3}
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Write instructions, clarification, or resolution for the student..."
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white outline-hidden resize-none"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Update Status:</span>
                      <select
                        value={updateStatus}
                        onChange={(e) => setUpdateStatus(e.target.value as FeedbackStatus)}
                        className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 outline-hidden"
                      >
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={isSending || !responseText.trim()}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-1.5"
                    >
                      {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>Send Response</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
