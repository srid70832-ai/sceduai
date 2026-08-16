import React from 'react';
import { AITeacherInsight } from '../../types';
import { Sparkles, Brain, AlertTriangle, Users, BookOpen, CheckCircle, RefreshCw } from 'lucide-react';
import { Badge } from '../common/Badge';

interface AITeacherInsightCardProps {
  data: AITeacherInsight | null;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const AITeacherInsightCard: React.FC<AITeacherInsightCardProps> = ({ data, isLoading, onRefresh }) => {
  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-900/50" />
          <div className="space-y-2">
            <div className="h-4 w-48 bg-slate-800 rounded" />
            <div className="h-3 w-32 bg-slate-800/60 rounded" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-20 bg-slate-800/40 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const rawAny = data as any;
  const classOverview = rawAny.class_overview || rawAny.attendance_trend_summary || rawAny.strengths_summary || 'Class cohort analytics active.';
  
  const challengingTopics: string[] = rawAny.challenging_topics || rawAny.lowest_performing_topics || rawAny.weak_topics || [];
  
  const rawAttention = rawAny.at_risk_students || rawAny.students_requiring_attention || [];
  const atRiskStudents = Array.isArray(rawAttention) ? rawAttention.map((st: any) => ({
    name: st.name || st.student_name || 'Student',
    reason: st.reason || 'Attendance or submission alert',
    suggested_intervention: st.suggested_intervention || st.suggested_action || 'Review student progress',
    risk_level: st.risk_level || st.risk_factor || 'medium'
  })) : [];

  const rawInterventions = rawAny.pedagogical_interventions || rawAny.actionable_teaching_recommendations || rawAny.teaching_recommendations || [];
  const pedagogicalInterventions: string[] = Array.isArray(rawInterventions)
    ? rawInterventions.map((inv: any) => (typeof inv === 'string' ? inv : inv.recommendation || JSON.stringify(inv)))
    : [];

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-900/40 rounded-2xl p-6 shadow-lg relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-indigo-900/30">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">Faculty Class Intelligence</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase tracking-wider">
                Cohort Analytics
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated pedagogy recommendations and student risk flags
            </p>
          </div>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/60 px-3 py-1.5 rounded-lg border border-indigo-800/50 transition-colors flex items-center gap-1.5"
          >
            <Brain className="w-3.5 h-3.5" />
            Refresh Analysis
          </button>
        )}
      </div>

      {/* Overview & Topics */}
      <div className="mt-5 space-y-4">
        <div className="bg-slate-950/60 rounded-xl p-4 border border-indigo-900/30">
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-1">Class Health Summary</h4>
          <p className="text-xs text-slate-200 leading-relaxed">{classOverview}</p>
        </div>

        {/* Challenging Topics */}
        {challengingTopics.length > 0 && (
          <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4" />
              Challenging Topics Identified
            </h4>
            <div className="flex flex-wrap gap-2">
              {challengingTopics.map((t, idx) => (
                <span
                  key={idx}
                  className="text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2.5 py-1 rounded-lg"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* At Risk Students */}
        {atRiskStudents.length > 0 && (
          <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4" />
              Students Requiring Academic Intervention ({atRiskStudents.length})
            </h4>
            <div className="space-y-2">
              {atRiskStudents.map((st, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/80 rounded-xl p-3 border border-rose-900/20 flex flex-wrap items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <span className="font-bold text-white mr-2">{st.name}</span>
                    <span className="text-slate-400">{st.reason}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-rose-400 font-semibold">{st.suggested_intervention}</span>
                    <Badge variant="risk" riskLevel={st.risk_level} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pedagogical Interventions */}
        {pedagogicalInterventions.length > 0 && (
          <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4" />
              Suggested Classroom Interventions
            </h4>
            <ul className="space-y-2">
              {pedagogicalInterventions.map((inv, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-emerald-500 font-bold shrink-0">•</span>
                  <span>{inv}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
