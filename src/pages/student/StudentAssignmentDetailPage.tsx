import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../lib/utils';
import { ArrowLeft, Clock, FileCheck, Send, CheckCircle2, AlertCircle, Paperclip } from 'lucide-react';

interface StudentAssignmentDetailPageProps {
  assignmentId: string;
  onNavigate: (path: string) => void;
}

export const StudentAssignmentDetailPage: React.FC<StudentAssignmentDetailPageProps> = ({
  assignmentId,
  onNavigate
}) => {
  const { student } = useAuth();
  const { showToast } = useToast();
  const [assignment, setAssignment] = useState<any>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchAssignment = () => {
    setIsLoading(true);
    api.getAssignment(assignmentId)
      .then((data) => {
        setAssignment(data);
        if (data.my_submission) {
          setSubmissionText(data.my_submission.submission_text || '');
          setAttachmentUrl(data.my_submission.attachment_url || '');
        }
      })
      .catch(() => setAssignment(null))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchAssignment();
  }, [assignmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionText && !attachmentUrl) {
      showToast('Please provide your solution text or an attachment link.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.submitAssignment({
        assignment_id: assignmentId,
        submission_text: submissionText,
        attachment_url: attachmentUrl || undefined
      });
      showToast('Assignment submitted successfully!', 'success');
      fetchAssignment();
    } catch (err: any) {
      showToast(err.message || 'Submission failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="py-12 text-center text-slate-400">Loading assignment details...</div>;
  }

  if (!assignment) {
    return <div className="py-12 text-center text-slate-400">Assignment not found.</div>;
  }

  const mySub = assignment.my_submission;
  const isLate = new Date() > new Date(assignment.due_date);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button
        onClick={() => onNavigate('/student/assignments')}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Assignments
      </button>

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800/40">
              {assignment.course?.code}
            </span>
            <span className="text-xs text-slate-400">{assignment.class?.section_name || 'Section A'}</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Due: {formatDate(assignment.due_date)}
            </span>
            <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
              {assignment.maximum_marks} Marks
            </span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {assignment.title}
        </h1>

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Assignment Prompt & Requirements
          </h4>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50 font-sans">
            {assignment.description || 'No detailed instructions provided.'}
          </p>
        </div>
      </div>

      {/* Evaluation Feedback if Available */}
      {mySub && mySub.status === 'EVALUATED' && (
        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-3xl border border-emerald-500/30 p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              Graded by Faculty Instructor
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {mySub.marks_obtained} / {assignment.maximum_marks} Marks
            </div>
          </div>

          {mySub.feedback && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Faculty Evaluator Feedback:
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-4 rounded-xl border border-emerald-500/20">
                {mySub.feedback}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Student Submission Form */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
          {mySub ? 'Your Submitted Work' : 'Submit Solution'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Solution Text / Code Snippet
            </label>
            <textarea
              rows={6}
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder="Paste your assignment answer, algorithm explanation, or analytical results..."
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-xs text-slate-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Attachment URL / Repository Link (Optional)
            </label>
            <div className="relative">
              <Paperclip className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                placeholder="https://github.com/student/assignment-repo"
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-400">
              {mySub && `Last submitted on ${formatDate(mySub.submitted_at)}`}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-md transition-all"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Submitting...' : mySub ? 'Update Submission' : 'Submit Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
