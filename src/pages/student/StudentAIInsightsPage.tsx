import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { AIStudentRecommendation } from '../../types';
import { AIRecommendationCard } from '../../components/ai/AIRecommendationCard';
import { SCEduAIChatbot } from '../../components/ai/SCEduAIChatbot';
import { Sparkles, Brain, Compass, BookOpen, Clock, Target, RefreshCw, MessageSquare } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface StudentAIInsightsPageProps {
  onNavigate: (path: string) => void;
}

export const StudentAIInsightsPage: React.FC<StudentAIInsightsPageProps> = ({ onNavigate }) => {
  const { student } = useAuth();
  const { showToast } = useToast();
  const [aiData, setAiData] = useState<AIStudentRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchAI = (force = false) => {
    if (!student) return;
    if (force) setIsRefreshing(true);
    else setIsLoading(true);

    api.getStudentAIRecommendations(student.id)
      .then((data) => {
        setAiData(data);
        if (force) showToast('AI Academic Diagnostic updated with latest database records.', 'success');
      })
      .catch((err) => {
        showToast(err.message || 'Failed to fetch AI insights', 'error');
      })
      .finally(() => {
        setIsLoading(false);
        setIsRefreshing(false);
      });
  };

  useEffect(() => {
    fetchAI();
  }, [student]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 px-3 py-1 rounded-full text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Gemini 3.7 Pro Cognitive Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Personalized Academic Intelligence & Diagnostics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time cognitive evaluation generated from your actual database submissions and attendance metrics.
          </p>
        </div>

        <button
          onClick={() => fetchAI(true)}
          disabled={isRefreshing || isLoading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Re-Evaluating...' : 'Re-Run Diagnostic Engine'}
        </button>
      </div>

      {/* Main AI Card */}
      <AIRecommendationCard data={aiData} isLoading={isLoading} onRefresh={() => fetchAI(true)} />

      {/* Expanded Study Schedule & Milestones if present */}
      {aiData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Actionable Milestones */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-500" />
              Prescribed Interventions & Next Steps
            </h3>

            <div className="space-y-3">
              {(((aiData as any).recommended_interventions || (aiData as any).recommended_actions || (aiData as any).recommendations || [])).map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40 text-xs flex items-start gap-3"
                >
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {typeof item === 'string' ? item : item.recommended_action || item.reason || JSON.stringify(item)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Strengths */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-500" />
              Demonstrated Subject Competencies
            </h3>

            <div className="space-y-3">
              {(((aiData as any).academic_strengths || (aiData as any).strong_subjects || (aiData as any).strengths || [])).map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-xs flex items-start gap-3"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {typeof item === 'string' ? item : item.course_name || JSON.stringify(item)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SC EDU AI Assistant Section */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 px-3 py-1 rounded-full text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
            <span>Interactive Academic Chat & Voice Assistant</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            SC EDU AI — AI Academic Assistant
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Chat or speak with SC EDU AI in English, தமிழ் (Tamil), or Tanglish for instant syllabus clarifications, study timetables, and academic guidance.
          </p>
        </div>

        <SCEduAIChatbot />
      </div>
    </div>
  );
};
