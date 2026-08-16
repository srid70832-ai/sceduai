import React, { useState } from 'react';
import { 
  FileCheck, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Send, 
  Download, 
  Sparkles, 
  Award,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { Assignment, AssignmentSubmission } from '../../types';
import { api } from '../../lib/api';
import { formatDate } from '../../lib/utils';

interface CourseAssignmentSubmissionProps {
  assignment: Assignment & { my_submission?: AssignmentSubmission };
  courseId: string;
  onSubmissionSuccess?: (submission: any, stats: any) => void;
  onOpenAITutorWithPrompt?: (prompt: string) => void;
}

export const CourseAssignmentSubmission: React.FC<CourseAssignmentSubmissionProps> = ({
  assignment,
  courseId,
  onSubmissionSuccess,
  onOpenAITutorWithPrompt
}) => {
  const existingSubmission = assignment.my_submission;
  const [submissionText, setSubmissionText] = useState<string>(existingSubmission?.submission_text || '');
  const [attachmentName, setAttachmentName] = useState<string>(existingSubmission?.attachment_name || '');
  const [attachmentUrl, setAttachmentUrl] = useState<string>(existingSubmission?.attachment_url || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const dueDate = new Date(assignment.due_date);
  const isOverdue = Date.now() > dueDate.getTime();
  const isSubmitted = existingSubmission?.status === 'SUBMITTED' || existingSubmission?.status === 'GRADED';
  const isGraded = existingSubmission?.status === 'GRADED';

  const handleFileUpload = (file: File) => {
    setAttachmentName(file.name);
    // Create object url simulation
    setAttachmentUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionText.trim() && !attachmentName) {
      alert('Please enter your written solution or attach a submission file.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.submitAssignmentWithLMS(assignment.id, {
        submission_text: submissionText,
        attachment_name: attachmentName || 'Solution_Submission.pdf',
        attachment_url: attachmentUrl || 'https://sample-files.edusense.internal/submissions/solution.pdf'
      });

      setSuccessMessage('Assignment submitted successfully! Your submission has been securely recorded.');
      if (onSubmissionSuccess) {
        onSubmissionSuccess(res.submission, res.completion_stats);
      }
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Assignment Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800/40">
                Graded Practical Assignment
              </span>
              {isGraded ? (
                <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Graded: {existingSubmission?.marks_obtained} / {assignment.max_marks || 100} Marks
                </span>
              ) : isSubmitted ? (
                <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold text-xs px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Submitted (Awaiting Faculty Review)
                </span>
              ) : isOverdue ? (
                <span className="bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold text-xs px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Past Deadline
                </span>
              ) : (
                <span className="bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold text-xs px-2.5 py-0.5 rounded-md">
                  Active Submission Window
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {assignment.title}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {assignment.description || 'Complete the algorithmic proofs, implementation benchmark, and submit your technical report according to institutional standards.'}
            </p>
          </div>

          {onOpenAITutorWithPrompt && (
            <button
              onClick={() => onOpenAITutorWithPrompt(`Explain the requirements and provide algorithmic hints for assignment: "${assignment.title}".`)}
              className="px-4 py-2.5 rounded-2xl bg-[#061c16] hover:bg-emerald-900 text-emerald-300 hover:text-white border border-emerald-700/60 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Ask AI Tutor for Hints</span>
            </button>
          )}
        </div>

        {/* Due date & points banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px] uppercase">Maximum Marks</span>
            <strong className="text-slate-900 dark:text-white text-sm">{assignment.max_marks || 100} Marks</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] uppercase">Submission Deadline</span>
            <strong className="text-slate-900 dark:text-white text-sm">{formatDate(assignment.due_date)}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] uppercase">Weight in Course</span>
            <strong className="text-slate-900 dark:text-white text-sm">25% of Total Grade</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] uppercase">Status</span>
            <strong className="text-emerald-600 dark:text-emerald-400 text-sm">
              {isGraded ? 'Graded' : isSubmitted ? 'Submitted' : 'Pending Action'}
            </strong>
          </div>
        </div>
      </div>

      {/* Faculty Feedback Card (If Graded) */}
      {isGraded && existingSubmission && (
        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-3xl border border-emerald-200 dark:border-emerald-800/60 p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Official Faculty Evaluation & Grade</span>
            </h3>
            <span className="font-mono font-extrabold text-sm text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900 px-3 py-1 rounded-xl border border-emerald-300">
              {existingSubmission.marks_obtained} / {assignment.max_marks || 100} ({Math.round(((existingSubmission.marks_obtained || 0) / (assignment.max_marks || 100)) * 100)}%)
            </span>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white/70 dark:bg-slate-900/70 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
            <strong>Professor's Feedback:</strong> {existingSubmission.feedback || 'Excellent submission adhering to the complete formal proof requirements and empirical runtime tests.'}
          </p>
        </div>
      )}

      {/* Submission Form Stage */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="space-y-1">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            {isSubmitted ? 'Your Submitted Work' : 'Submit Assignment Solution'}
          </h3>
          <p className="text-xs text-slate-500">
            Type your written explanation, code snippets, mathematical lemmas, and optionally attach your source files or PDF report.
          </p>
        </div>

        {/* Written Solution Box */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Written Technical Solution / Abstract
          </label>
          <textarea
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value)}
            disabled={isGraded}
            placeholder="Provide your algorithmic approach, code implementation details, time complexity analysis O(n), and empirical results..."
            rows={7}
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none resize-y font-mono leading-relaxed"
          />
        </div>

        {/* File Drag-and-Drop Area */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Submission Attachment (.PDF, .ZIP, .PY, .JAVA, .CPP)
          </label>

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                : 'border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/20'
            }`}
          >
            {attachmentName ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-6 h-6 text-emerald-500" />
                <div className="text-left">
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">{attachmentName}</span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Ready for submission</span>
                </div>
                {!isGraded && (
                  <button
                    type="button"
                    onClick={() => { setAttachmentName(''); setAttachmentUrl(''); }}
                    className="text-xs text-rose-500 hover:underline font-semibold ml-4 cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Drag and drop your file here, or{' '}
                  <label className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer">
                    browse files
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                </p>
                <p className="text-[10px] text-slate-400 uppercase">Max file size 25MB (PDF, ZIP, CODE)</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
          {successMessage && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold animate-pulse">
              ✓ {successMessage}
            </span>
          )}

          {!isGraded && (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer ml-auto disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Uploading & Submitting...' : isSubmitted ? 'Update Submission' : 'Submit Assignment'}</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
