import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, CheckCircle2, Clock, User, Save, FileCheck, ExternalLink } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { EmptyState } from '../../components/common/EmptyState';

interface TeacherGradeSubmissionsPageProps {
  assignmentId: string;
  onNavigate: (path: string) => void;
}

export const TeacherGradeSubmissionsPage: React.FC<TeacherGradeSubmissionsPageProps> = ({
  assignmentId,
  onNavigate
}) => {
  const { showToast } = useToast();
  const [assignment, setAssignment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [marksInput, setMarksInput] = useState<number>(0);
  const [feedbackInput, setFeedbackInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGrading, setIsGrading] = useState<boolean>(false);

  const fetchData = () => {
    setIsLoading(true);
    Promise.all([
      api.getAssignment(assignmentId).catch(() => null),
      api.getAssignmentSubmissions(assignmentId).catch(() => [])
    ]).then(([asg, subs]) => {
      setAssignment(asg);
      setSubmissions(subs);
      if (subs.length > 0 && !selectedSub) {
        setSelectedSub(subs[0]);
        setMarksInput(subs[0].marks_obtained ?? 0);
        setFeedbackInput(subs[0].feedback ?? '');
      }
    }).finally(() => {
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, [assignmentId]);

  const handleSelectSubmission = (sub: any) => {
    setSelectedSub(sub);
    setMarksInput(sub.marks_obtained ?? 0);
    setFeedbackInput(sub.feedback ?? '');
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    if (marksInput < 0 || marksInput > (assignment?.maximum_marks || 100)) {
      showToast(`Marks must be between 0 and ${assignment?.maximum_marks}`, 'error');
      return;
    }

    setIsGrading(true);
    try {
      await api.gradeSubmission(selectedSub.id, {
        marks_obtained: Number(marksInput),
        feedback: feedbackInput
      });

      showToast('Submission graded and marks saved in database!', 'success');
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Grading failed', 'error');
    } finally {
      setIsGrading(false);
    }
  };

  if (isLoading) {
    return <div className="py-12 text-center text-slate-400">Loading student submissions...</div>;
  }

  if (!assignment) {
    return <div className="py-12 text-center text-slate-400">Assignment not found.</div>;
  }

  return (
    <div className="space-y-8">
      <button
        onClick={() => onNavigate('/teacher/assignments')}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Assignments
      </button>

      {/* Assignment Summary Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800/40">
                {assignment.course?.code}
              </span>
              <span className="text-xs text-slate-400">Section {assignment.class?.section_name || 'A'}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {assignment.title}
            </h1>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-right">
            <div className="text-slate-400">Due: {formatDate(assignment.due_date)}</div>
            <div className="font-bold text-slate-900 dark:text-white mt-0.5">
              Maximum Marks: {assignment.maximum_marks}
            </div>
          </div>
        </div>
      </div>

      {submissions.length === 0 ? (
        <EmptyState
          title="No student submissions yet."
          description="Enrolled students have not submitted coursework solutions for this assignment."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submission List Column */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider px-2 py-1">
              Submissions ({submissions.length})
            </h3>

            <div className="space-y-1.5">
              {submissions.map((sub) => {
                const isSelected = selectedSub?.id === sub.id;
                const isGraded = sub.status === 'EVALUATED';

                return (
                  <div
                    key={sub.id}
                    onClick={() => handleSelectSubmission(sub)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20'
                        : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {sub.student?.profile?.full_name || 'Enrolled Student'}
                      </span>
                      <span className="text-[11px] text-slate-400">{sub.student?.roll_number}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] mt-2">
                      <span className="text-slate-400">{formatDate(sub.submitted_at)}</span>
                      {isGraded ? (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {sub.marks_obtained} / {assignment.maximum_marks} Marks
                        </span>
                      ) : (
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                          Pending Grade
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submission Details & Grading Form Column */}
          {selectedSub && (
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {selectedSub.student?.profile?.full_name}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Roll: {selectedSub.student?.roll_number} • Submitted on {formatDate(selectedSub.submitted_at)}
                  </p>
                </div>

                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  selectedSub.status === 'EVALUATED'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                }`}>
                  {selectedSub.status === 'EVALUATED' ? 'Graded' : 'Awaiting Grading'}
                </span>
              </div>

              {/* Student's Answer */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Submitted Answer Content
                </h4>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {selectedSub.submission_text || 'No textual content attached.'}
                </div>

                {selectedSub.attachment_url && (
                  <div className="mt-3">
                    <a
                      href={selectedSub.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Student Attachment / Repository: {selectedSub.attachment_url}
                    </a>
                  </div>
                )}
              </div>

              {/* Grading Form */}
              <form onSubmit={handleSaveGrade} className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Marks Awarded (Max: {assignment.maximum_marks}) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={assignment.maximum_marks}
                    value={marksInput}
                    onChange={(e) => setMarksInput(Number(e.target.value))}
                    className="w-full sm:w-48 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Instructor Pedagogical Feedback
                  </label>
                  <textarea
                    rows={3}
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    placeholder="Provide constructive feedback, correct approaches, and areas for improvement..."
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isGrading}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isGrading ? 'Saving Grade...' : 'Save & Publish Evaluation'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
