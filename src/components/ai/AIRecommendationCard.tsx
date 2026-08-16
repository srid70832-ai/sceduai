import React from 'react';
import { AIStudentRecommendation } from '../../types';
import { Sparkles, Brain, CheckCircle2, AlertTriangle, Lightbulb, Compass, Calendar, ArrowRight } from 'lucide-react';
import { Badge } from '../common/Badge';

interface AIRecommendationCardProps {
  data: AIStudentRecommendation | null;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const AIRecommendationCard: React.FC<AIRecommendationCardProps> = ({ data, isLoading, onRefresh }) => {
  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-900/50" />
          <div className="space-y-2">
            <div className="h-4 w-40 bg-slate-800 rounded" />
            <div className="h-3 w-28 bg-slate-800/60 rounded" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-16 bg-slate-800/40 rounded-xl" />
          <div className="h-16 bg-slate-800/40 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const rawAny = data as any;
  const riskLevel = rawAny.academic_risk || rawAny.risk_level || 'low';
  const summary = rawAny.summary || rawAny.reasoning_summary || rawAny.reasoning || 'Personalized performance diagnostics active.';
  const strengthsList: string[] = rawAny.strengths || rawAny.strong_subjects || rawAny.academic_strengths || [];
  const weaknessesList: string[] = rawAny.weaknesses || rawAny.weak_subjects || rawAny.academic_weaknesses || [];
  
  const rawActions = rawAny.recommended_actions || rawAny.recommendations || rawAny.recommended_interventions || [];
  const actionsList: string[] = Array.isArray(rawActions)
    ? rawActions.map((act: any) => (typeof act === 'string' ? act : act.recommended_action || act.description || JSON.stringify(act)))
    : [];

  const milestonesList: string[] = Array.isArray(rawAny.next_milestones) ? rawAny.next_milestones : [];
  const studySchedule: string = rawAny.suggested_study_schedule || '';

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-900/40 rounded-2xl p-6 shadow-lg relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-indigo-900/30">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">AI Academic Intelligence Engine</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase tracking-wider">
                Gemini 3.7 Pro
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Personalized performance diagnostics & learning path
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge riskLevel={riskLevel}>
            {riskLevel.toUpperCase()} Risk
          </Badge>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/60 px-3 py-1.5 rounded-lg border border-indigo-800/50 transition-colors flex items-center gap-1.5"
            >
              <Brain className="w-3.5 h-3.5" />
              Re-analyze
            </button>
          )}
        </div>
      </div>

      {/* Performance Summary */}
      <div className="mt-5 bg-slate-950/60 rounded-xl p-4 border border-indigo-900/30">
        <div className="flex items-start gap-3">
          <Brain className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">Diagnostic Summary</h4>
            <p className="text-xs text-slate-200 mt-1 leading-relaxed">{summary}</p>
          </div>
        </div>
      </div>

      {/* Strengths & Focus Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Strengths */}
        <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4" />
            Identified Academic Strengths
          </h4>
          <ul className="space-y-2">
            {strengthsList.length === 0 ? (
              <li className="text-xs text-slate-400">Steady engagement with ongoing coursework.</li>
            ) : (
              strengthsList.map((st, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-emerald-500 font-bold shrink-0">•</span>
                  <span>{st}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Focus Areas */}
        <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4" />
            Priority Improvement Areas
          </h4>
          <ul className="space-y-2">
            {weaknessesList.length === 0 ? (
              <li className="text-xs text-slate-400">No critical subject weaknesses detected.</li>
            ) : (
              weaknessesList.map((w, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-amber-500 font-bold shrink-0">•</span>
                  <span>{w}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Recommended Actions */}
      {actionsList.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-indigo-400" />
            Tailored Action Plan
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {actionsList.map((act, i) => (
              <div
                key={i}
                className="bg-slate-950/60 rounded-xl p-3.5 border border-indigo-900/30 flex items-start gap-3"
              >
                <span className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">{act}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Study Schedule & Next Milestones */}
      {(studySchedule || milestonesList.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-indigo-900/30">
          {studySchedule && (
            <div>
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Suggested Weekly Schedule
              </h5>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                {studySchedule}
              </p>
            </div>
          )}

          {milestonesList.length > 0 && (
            <div>
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
                Target Milestones
              </h5>
              <div className="space-y-1.5">
                {milestonesList.map((m, idx) => (
                  <div key={idx} className="text-xs text-slate-300 flex items-center gap-2 bg-slate-950/40 px-3 py-2 rounded-xl border border-slate-800">
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
