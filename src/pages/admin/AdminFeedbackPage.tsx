import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { FeedbackItem, FeedbackStatus, FeedbackPriority, Teacher, Profile } from '../../types';
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
  UserCheck,
  FileText,
  Lock,
  Tag,
  AlertTriangle,
  Flame,
  ArrowUpDown,
  LifeBuoy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AdminFeedbackPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [stats, setStats] = useState<any>({
    total: 0,
    open: 0,
    in_review: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
    critical: 0
  });
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Selected for Drawer / Modal
  const [selectedTicket, setSelectedTicket] = useState<FeedbackItem | null>(null);

  // Action Form States in Drawer
  const [newStatus, setNewStatus] = useState<FeedbackStatus>('Open');
  const [newPriority, setNewPriority] = useState<FeedbackPriority>('MEDIUM');
  const [assignedTeacherId, setAssignedTeacherId] = useState<string>('');
  const [adminResponseText, setAdminResponseText] = useState<string>('');
  const [internalNoteText, setInternalNoteText] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSendingResponse, setIsSendingResponse] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);

  useEffect(() => {
    loadData();
  }, [categoryFilter, priorityFilter, statusFilter, sortBy]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [listRes, statsRes, teachersRes] = await Promise.all([
        api.getFeedbackList({
          category: categoryFilter,
          priority: priorityFilter,
          status: statusFilter,
          sort: sortBy
        }),
        api.getFeedbackStats(),
        api.getTeachers()
      ]);

      setFeedbacks(listRes || []);
      setStats(statsRes || {});
      setTeachers(teachersRes || []);

      if (selectedTicket) {
        const updated = (listRes || []).find((f) => f.id === selectedTicket.id || f.feedback_id === selectedTicket.feedback_id);
        if (updated) {
          setSelectedTicket(updated);
          setNewStatus(updated.status);
          setNewPriority(updated.priority);
          setAssignedTeacherId(updated.assigned_to || '');
        }
      }
    } catch (err: any) {
      showToast('Failed to load feedback dossiers.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTicket = (ticket: FeedbackItem) => {
    setSelectedTicket(ticket);
    setNewStatus(ticket.status);
    setNewPriority(ticket.priority);
    setAssignedTeacherId(ticket.assigned_to || '');
    setAdminResponseText('');
    setInternalNoteText('');
  };

  const handleUpdateStatusAndAssignment = async () => {
    if (!selectedTicket) return;
    setIsUpdating(true);
    try {
      const selectedTeacher = teachers.find((t) => t.id === assignedTeacherId || t.profile_id === assignedTeacherId);
      const assignedName = selectedTeacher?.profile?.full_name || (assignedTeacherId ? 'Faculty Member' : '');

      const updated = await api.updateFeedback(selectedTicket.id, {
        status: newStatus,
        priority: newPriority,
        assigned_to: assignedTeacherId,
        assigned_to_name: assignedName
      });

      setSelectedTicket(updated);
      showToast('Feedback ticket metadata updated successfully.', 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update ticket.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendAdminResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !adminResponseText.trim()) return;

    setIsSendingResponse(true);
    try {
      const updated = await api.respondFeedback(selectedTicket.id, {
        message: adminResponseText.trim(),
        status: newStatus
      });

      setSelectedTicket(updated);
      setAdminResponseText('');
      showToast('Official response published to user and notification sent.', 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to send response.', 'error');
    } finally {
      setIsSendingResponse(false);
    }
  };

  const handleAddInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !internalNoteText.trim()) return;

    setIsAddingNote(true);
    try {
      const updated = await api.addFeedbackInternalNote(selectedTicket.id, {
        note: internalNoteText.trim()
      });

      setSelectedTicket(updated);
      setInternalNoteText('');
      showToast('Internal confidential note recorded.', 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to record note.', 'error');
    } finally {
      setIsAddingNote(false);
    }
  };

  const filteredFeedbacks = feedbacks.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.feedback_id || "").toLowerCase().includes(q) ||
      item.user_name?.toLowerCase().includes(q) ||
      item.user_email?.toLowerCase().includes(q) ||
      (item.subject || "").toLowerCase().includes(q) ||
      (item.description || "").toLowerCase().includes(q) ||
      (item.category || "").toLowerCase().includes(q)
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
            {status}
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
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
            <Flame className="w-3 h-3" />
            CRITICAL
          </span>
        );
      case 'HIGH':
        return <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">HIGH</span>;
      case 'MEDIUM':
        return <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">MEDIUM</span>;
      default:
        return <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">LOW</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1 rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-1.5">
            <LifeBuoy className="w-3.5 h-3.5 text-emerald-500" />
            <span>Institutional Support & Help Desk Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Feedback & Help Desk Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review student and staff feedback, triage issues, assign tickets to faculty, and post official resolutions.
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors self-start sm:self-auto flex items-center gap-2 text-xs font-semibold"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Tickets</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.total || 0}</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">Open</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.open || 0}</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">In Review</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.in_review || 0}</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider">In Progress</div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{stats.in_progress || 0}</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">Resolved</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.resolved || 0}</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="text-[11px] font-bold text-rose-500 uppercase tracking-wider">Critical</div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{stats.critical || 0}</div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col lg:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Feedback ID, student name, email, or issue topic..."
            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 outline-hidden"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-hidden font-medium"
          >
            <option value="ALL">All Categories</option>
            <option value="Bug / Technical Issue">Bug / Technical</option>
            <option value="Course Issue">Course Issue</option>
            <option value="Registration Issue">Registration Issue</option>
            <option value="Assignment Issue">Assignment Issue</option>
            <option value="Attendance Issue">Attendance Issue</option>
            <option value="Examination Issue">Examination Issue</option>
            <option value="AI / Chatbot Issue">AI / Chatbot</option>
            <option value="NPTEL Course Issue">NPTEL Issue</option>
            <option value="Suggestion">Suggestion</option>
          </select>

          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-hidden font-medium"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-hidden font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Review">In Review</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-hidden font-medium"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Main Feedback List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
            Loading Feedback Queue...
          </div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            No feedback records matched the specified filter criteria.
          </div>
        ) : (
          filteredFeedbacks.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelectTicket(item)}
              className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 rounded-2xl shadow-xs cursor-pointer transition-all space-y-3 group"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
                    {item.feedback_id}
                  </span>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
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

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {item.subject}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {item.user_name} ({item.user_role})
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="font-mono text-[11px] text-slate-400">{item.user_email}</span>
                </div>

                <div className="flex items-center gap-3 font-medium">
                  {item.assigned_to_name ? (
                    <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded text-[11px]">
                      Assigned: {item.assigned_to_name}
                    </span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 text-[11px]">
                      Unassigned
                    </span>
                  )}
                  <span className="text-emerald-600 dark:text-emerald-400 group-hover:underline flex items-center gap-1">
                    <span>Manage & Triage</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Admin Triage & Management Drawer */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            >
              {/* Header */}
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

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                {/* User & Route Metadata */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-600 dark:text-slate-400">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">User</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{selectedTicket.user_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Role & Email</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{selectedTicket.user_role} • {selectedTicket.user_email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Trigger Page</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">{selectedTicket.page_url || '/'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Created</span>
                    <span>{new Date(selectedTicket.created_at).toLocaleString()}</span>
                  </div>
                </div>

                {/* Triage Controls (Status, Priority, Faculty Assignment) */}
                <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800/50 space-y-3">
                  <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Triage & Assignment Controls</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Ticket Status
                      </label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as FeedbackStatus)}
                        className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-900 dark:text-white outline-hidden"
                      >
                        <option value="Open">Open</option>
                        <option value="In Review">In Review</option>
                        <option value="Assigned">Assigned</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Priority
                      </label>
                      <select
                        value={newPriority}
                        onChange={(e) => setNewPriority(e.target.value as FeedbackPriority)}
                        className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-900 dark:text-white outline-hidden"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Assign to Faculty / Staff
                      </label>
                      <select
                        value={assignedTeacherId}
                        onChange={(e) => setAssignedTeacherId(e.target.value)}
                        className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-900 dark:text-white outline-hidden"
                      >
                        <option value="">Unassigned</option>
                        {teachers.map((t) => (
                          <option key={t.id} value={t.profile_id}>
                            {t.profile?.full_name} ({t.department || 'Faculty'})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleUpdateStatusAndAssignment}
                      disabled={isUpdating}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                    >
                      {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>Save Status & Assignment</span>
                    </button>
                  </div>
                </div>

                {/* Original Description */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>User Problem Description:</span>
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
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
                        <span>View Attachment Screenshot / File</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Internal Notes (Admin & Staff Only) */}
                <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800/50 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-300">
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Internal Confidential Notes (Staff & Admin Only)</span>
                    </div>
                    <span className="text-[10px] font-normal text-amber-700">Not visible to students</span>
                  </div>

                  <div className="space-y-2">
                    {(!selectedTicket.internal_notes || selectedTicket.internal_notes.length === 0) ? (
                      <p className="text-[11px] text-amber-700 dark:text-amber-400 italic">No internal notes yet.</p>
                    ) : (
                      selectedTicket.internal_notes.map((n) => (
                        <div key={n.id} className="p-2.5 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/60 rounded-lg text-xs space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span className="font-bold text-amber-700 dark:text-amber-400">{n.author_name} ({n.author_role})</span>
                            <span>{new Date(n.created_at).toLocaleString()}</span>
                          </div>
                          <p className="text-slate-800 dark:text-slate-200">{n.note}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleAddInternalNote} className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={internalNoteText}
                      onChange={(e) => setInternalNoteText(e.target.value)}
                      placeholder="Add an internal note (e.g., 'Checked db logs, syncing NPTEL certificate...')"
                      className="flex-1 text-xs bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white outline-hidden"
                    />
                    <button
                      type="submit"
                      disabled={isAddingNote || !internalNoteText.trim()}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs shrink-0"
                    >
                      {isAddingNote ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Add Note'}
                    </button>
                  </form>
                </div>

                {/* Public Response & Thread */}
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Official Public Responses (Visible to User)
                  </div>

                  <div className="space-y-2">
                    {selectedTicket.responses?.map((resp, i) => (
                      <div
                        key={resp.id || i}
                        className={`p-3 rounded-xl border text-xs space-y-1 ${
                          resp.sender_role === 'ADMIN' || resp.sender_role === 'TEACHER'
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {resp.sender_name} ({resp.sender_role})
                          </span>
                          <span>{new Date(resp.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{resp.message}</p>
                      </div>
                    ))}
                  </div>

                  {/* Reply Form */}
                  <form onSubmit={handleSendAdminResponse} className="pt-2 space-y-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Send Official Staff Response & Advance Status:
                    </label>
                    <textarea
                      rows={3}
                      value={adminResponseText}
                      onChange={(e) => setAdminResponseText(e.target.value)}
                      placeholder="Write your official response to the user. This will notify them immediately in their portal..."
                      className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 outline-hidden resize-none"
                      required
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500">Set status to:</span>
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value as FeedbackStatus)}
                          className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-900 dark:text-white outline-hidden font-medium"
                        >
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        disabled={isSendingResponse || !adminResponseText.trim()}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                      >
                        {isSendingResponse ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Publish Response & Notify User</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
