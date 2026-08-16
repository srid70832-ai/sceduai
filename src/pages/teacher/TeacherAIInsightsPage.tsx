import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { ClassItem, AITeacherInsight } from '../../types';
import { AITeacherInsightCard } from '../../components/ai/AITeacherInsightCard';
import { Sparkles, Brain, BookOpen, AlertTriangle, RefreshCw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface TeacherAIInsightsPageProps {
  onNavigate: (path: string) => void;
}

export const TeacherAIInsightsPage: React.FC<TeacherAIInsightsPageProps> = ({ onNavigate }) => {
  const { teacher } = useAuth();
  const { showToast } = useToast();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [aiData, setAiData] = useState<AITeacherInsight | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    if (teacher) {
      setIsLoading(true);
      api.getClasses()
        .then((clss) => {
          setClasses(clss);
          if (clss.length > 0) {
            setSelectedClassId(clss[0].id);
          }
        })
        .catch(() => setClasses([]))
        .finally(() => setIsLoading(false));
    }
  }, [teacher]);

  const fetchAI = (classId: string, force = false) => {
    if (!classId) return;
    if (force) setIsRefreshing(true);
    else setIsLoading(true);

    api.getClassAIInsights(classId)
      .then((data) => {
        setAiData(data);
        if (force) showToast('AI Pedagogical Diagnostics refreshed.', 'success');
      })
      .catch((err) => {
        showToast(err.message || 'Failed to fetch AI diagnostics', 'error');
      })
      .finally(() => {
        setIsLoading(false);
        setIsRefreshing(false);
      });
  };

  useEffect(() => {
    if (selectedClassId) {
      fetchAI(selectedClassId);
    }
  }, [selectedClassId]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 px-3 py-1 rounded-full text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Gemini 3.7 Pro Faculty Assistant</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Academic Cohort Intelligence & Pedagogical Advice
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time cohort diagnostics synthesized from class attendance logs, submission scores, and risk trends.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-hidden"
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.course?.code} - Section {cls.section_name}
              </option>
            ))}
          </select>

          <button
            onClick={() => fetchAI(selectedClassId, true)}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Analyzing...' : 'Re-Run Diagnostic'}
          </button>
        </div>
      </div>

      {/* Main AI Card */}
      <AITeacherInsightCard
        data={aiData}
        isLoading={isLoading}
        onRefresh={() => fetchAI(selectedClassId, true)}
      />

      {/* Additional Pedagogical Cards */}
      {aiData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-500" />
              Cohort Curriculum Interventions
            </h3>

            <div className="space-y-3">
              {((aiData as any).teaching_recommendations || (aiData as any).actionable_teaching_recommendations || (aiData as any).pedagogical_interventions || []).map((rec: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40 text-xs flex items-start gap-3"
                >
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {typeof rec === 'string' ? rec : rec.recommendation || JSON.stringify(rec)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Identified Conceptual Weak Topics
            </h3>

            <div className="space-y-3">
              {((aiData as any).weak_topics || (aiData as any).lowest_performing_topics || (aiData as any).challenging_topics || []).map((topic: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 text-xs flex items-start gap-3"
                >
                  <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    !
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {typeof topic === 'string' ? topic : topic.topic || JSON.stringify(topic)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
