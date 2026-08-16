import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Clock, 
  Award, 
  RotateCcw, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  AlertCircle,
  Check
} from 'lucide-react';
import { Quiz, QuizAttempt, QuizQuestion } from '../../types';
import { api } from '../../lib/api';

interface CourseQuizPlayerProps {
  courseId: string;
  quizId: string;
  onQuizCompleted?: (attempt: QuizAttempt, stats: any) => void;
  onOpenAITutorWithPrompt?: (prompt: string) => void;
}

export const CourseQuizPlayer: React.FC<CourseQuizPlayerProps> = ({
  courseId,
  quizId,
  onQuizCompleted,
  onOpenAITutorWithPrompt
}) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTakingQuiz, setIsTakingQuiz] = useState<boolean>(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, any>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastReview, setLastReview] = useState<any[] | null>(null);
  const [lastAttempt, setLastAttempt] = useState<QuizAttempt | null>(null);

  useEffect(() => {
    loadQuizData();
  }, [courseId, quizId]);

  const loadQuizData = async () => {
    setIsLoading(true);
    try {
      const data = await api.getQuiz(courseId, quizId);
      setQuiz(data.quiz);
      setAttempts(data.attempts || []);
      if (data.attempts && data.attempts.length > 0) {
        setLastAttempt(data.attempts[data.attempts.length - 1]);
      }
    } catch (err) {
      console.error('Failed to load quiz', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Timer countdown
  useEffect(() => {
    let timer: any = null;
    if (isTakingQuiz && timeLeftSeconds > 0) {
      timer = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTakingQuiz, timeLeftSeconds]);

  const startQuiz = () => {
    if (!quiz) return;
    setSelectedAnswers({});
    setCurrentQuestionIdx(0);
    setTimeLeftSeconds((quiz.time_limit_minutes || 15) * 60);
    setLastReview(null);
    setIsTakingQuiz(true);
  };

  const handleSelectOption = (questionId: string, optionIdx: number, isMulti: boolean) => {
    if (isMulti) {
      const currentList: number[] = selectedAnswers[questionId] || [];
      if (currentList.includes(optionIdx)) {
        setSelectedAnswers({
          ...selectedAnswers,
          [questionId]: currentList.filter((idx) => idx !== optionIdx)
        });
      } else {
        setSelectedAnswers({
          ...selectedAnswers,
          [questionId]: [...currentList, optionIdx]
        });
      }
    } else {
      setSelectedAnswers({
        ...selectedAnswers,
        [questionId]: optionIdx
      });
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const timeSpent = ((quiz.time_limit_minutes || 15) * 60) - timeLeftSeconds;
      const res = await api.submitQuiz(courseId, quizId, {
        answers: selectedAnswers,
        time_spent_seconds: Math.max(10, timeSpent)
      });

      setLastAttempt(res.attempt);
      setLastReview(res.review);
      setAttempts((prev) => [...prev, res.attempt]);
      setIsTakingQuiz(false);

      if (onQuizCompleted) {
        onQuizCompleted(res.attempt, res.completion_stats);
      }
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="py-12 text-center text-slate-400 text-xs">Loading assessment module...</div>;
  }

  if (!quiz) {
    return <div className="py-12 text-center text-slate-400 text-xs">Assessment not found.</div>;
  }

  const questions: QuizQuestion[] = quiz.questions || [];
  const currentQ = questions[currentQuestionIdx];
  const answeredCount = Object.keys(selectedAnswers).length;
  const bestScore = attempts.length > 0 ? Math.max(...attempts.map((a) => a.percentage)) : 0;
  const hasPassed = bestScore >= (quiz.passing_percentage || 60);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // 1. ACTIVE TAKING QUIZ VIEW
  if (isTakingQuiz && currentQ) {
    const isMulti = currentQ.question_type === 'MULTIPLE_CHOICE' && Array.isArray((currentQ as any).correct_answer_index);
    const studentAns = selectedAnswers[currentQ.id];

    return (
      <div className="space-y-6">
        {/* Quiz Progress & Timer Header */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              {quiz.title} • Question {currentQuestionIdx + 1} of {questions.length}
            </span>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              Online Curricular Evaluation
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {/* Countdown Badge */}
            <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 font-mono font-bold text-sm ${
              timeLeftSeconds < 120 ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
            }`}>
              <Clock className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span>{formatTimer(timeLeftSeconds)}</span>
            </div>

            <button
              onClick={handleSubmitQuiz}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Grading...' : 'Submit Assessment'}
            </button>
          </div>
        </div>

        {/* Question Stage Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800/40">
                {currentQ.points || 5} Points
              </span>
              {isMulti && (
                <span className="text-slate-500 text-xs font-medium">Select all that apply</span>
              )}
            </div>

            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
              {currentQ.question_text}
            </h2>
          </div>

          {/* Options Grid */}
          <div className="space-y-3 pt-2">
            {(currentQ.options || []).map((opt: string, optIdx: number) => {
              const isSelected = isMulti
                ? Array.isArray(studentAns) && studentAns.includes(optIdx)
                : studentAns === optIdx;

              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(currentQ.id, optIdx, isMulti)}
                  className={`w-full p-4 rounded-2xl border text-left text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                      isSelected
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}>
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="leading-relaxed">{opt}</span>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Question Navigation Controls */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setCurrentQuestionIdx((p) => Math.max(0, p - 1))}
              disabled={currentQuestionIdx === 0}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-30 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {/* Quick Question Jump Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {questions.map((q, idx) => {
                const isAns = selectedAnswers[q.id] !== undefined;
                const isCurrent = currentQuestionIdx === idx;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIdx(idx)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                        : isAns
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {currentQuestionIdx < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIdx((p) => Math.min(questions.length - 1, p + 1))}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Finish & Submit</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. QUIZ REVIEW & LANDING DASHBOARD
  return (
    <div className="space-y-6">
      {/* Quiz Banner Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800/40">
                Interactive Quiz Assessment
              </span>
              {hasPassed ? (
                <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Passed ({bestScore}%)
                </span>
              ) : (
                <span className="bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold text-xs px-2.5 py-0.5 rounded-md">
                  Passing Threshold: {quiz.passing_percentage || 60}%
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {quiz.title}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {quiz.description || 'Test your mastery of key concepts, algorithmic definitions, and theoretical proofs covered in this unit.'}
            </p>
          </div>

          {/* Start / Retake Action */}
          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={startQuiz}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              {attempts.length > 0 ? (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>Retake Assessment</span>
                </>
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  <span>Start Assessment ({questions.length} Questions)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Metadata stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px] uppercase">Questions</span>
            <strong className="text-slate-900 dark:text-white text-sm">{questions.length} Questions</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] uppercase">Time Limit</span>
            <strong className="text-slate-900 dark:text-white text-sm">{quiz.time_limit_minutes || 15} Minutes</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] uppercase">Attempts Taken</span>
            <strong className="text-slate-900 dark:text-white text-sm">{attempts.length} Attempts</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] uppercase">Highest Score</span>
            <strong className={`text-sm ${hasPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
              {bestScore}%
            </strong>
          </div>
        </div>
      </div>

      {/* Submission Review Stage (Shown right after submission or on latest attempt) */}
      {lastReview && lastReview.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Assessment Results Breakdown</span>
              </h3>
              <p className="text-xs text-slate-500">
                Detailed question-by-question review with comprehensive theoretical explanations.
              </p>
            </div>

            {onOpenAITutorWithPrompt && (
              <button
                onClick={() => onOpenAITutorWithPrompt(`I just finished the quiz "${quiz.title}". Review the questions I missed and help me understand the core theoretical proofs.`)}
                className="px-3.5 py-2 rounded-xl bg-[#061c16] hover:bg-emerald-900 text-emerald-300 hover:text-white border border-emerald-700/60 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ask AI Tutor to Clarify Mistakes</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            {lastReview.map((rev, idx) => (
              <div
                key={rev.question_id || idx}
                className={`p-5 rounded-2xl border ${
                  rev.is_correct
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                    : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                } space-y-3`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="font-bold text-xs text-slate-500">Question {idx + 1}</span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs leading-relaxed">
                      {rev.question_text}
                    </h4>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold shrink-0 ${
                    rev.is_correct
                      ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300'
                  }`}>
                    {rev.is_correct ? `+${rev.points_awarded} Pts` : '0 Pts'}
                  </span>
                </div>

                {/* Option feedback */}
                <div className="space-y-1.5 text-xs">
                  {(rev.options || []).map((opt: string, optIdx: number) => {
                    const isStudentChoice = Array.isArray(rev.student_answer)
                      ? rev.student_answer.includes(optIdx)
                      : rev.student_answer === optIdx;
                    const isActualCorrect = Array.isArray(rev.correct_answer)
                      ? rev.correct_answer.includes(optIdx)
                      : rev.correct_answer === optIdx;

                    let badgeClass = 'text-slate-600 dark:text-slate-400 bg-white/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700';
                    if (isActualCorrect) {
                      badgeClass = 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-400 text-emerald-900 dark:text-emerald-200 font-bold';
                    } else if (isStudentChoice && !isActualCorrect) {
                      badgeClass = 'bg-rose-100 dark:bg-rose-950/80 border-rose-400 text-rose-900 dark:text-rose-200 line-through';
                    }

                    return (
                      <div key={optIdx} className={`p-2.5 rounded-xl border flex items-center justify-between ${badgeClass}`}>
                        <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                        {isActualCorrect && <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">✓ Correct Answer</span>}
                        {isStudentChoice && !isActualCorrect && <span className="text-[10px] font-bold text-rose-600">✗ Your Choice</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {rev.explanation && (
                  <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                    <strong className="text-emerald-600 dark:text-emerald-400 block text-[11px] mb-0.5 uppercase tracking-wide">Explanation:</strong>
                    {rev.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attempt History Table */}
      {attempts.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Past Attempts History ({attempts.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <th className="pb-3 font-semibold">Attempt</th>
                  <th className="pb-3 font-semibold">Score</th>
                  <th className="pb-3 font-semibold">Percentage</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {attempts.map((att, idx) => (
                  <tr key={att.id || idx}>
                    <td className="py-3 font-bold text-slate-900 dark:text-white">Attempt #{att.attempt_number || idx + 1}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">{att.score} / {att.max_score} pts</td>
                    <td className="py-3 font-mono font-bold text-slate-900 dark:text-white">{att.percentage}%</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        att.passed
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                      }`}>
                        {att.passed ? 'PASSED' : 'BELOW PASSING'}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 text-[11px]">{new Date(att.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
