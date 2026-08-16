import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  FileCheck, 
  Building2, 
  Calendar, 
  UploadCloud, 
  ShieldCheck, 
  AlertCircle,
  FileText,
  Save
} from 'lucide-react';
import { Course, NPTELCourseTracking } from '../../types';
import { api } from '../../lib/api';

interface NPTELCourseHubProps {
  course: Course;
  nptelTracking?: NPTELCourseTracking | null;
  onUpdate?: (data: any) => void;
}

export const NPTELCourseHub: React.FC<NPTELCourseHubProps> = ({
  course,
  nptelTracking,
  onUpdate
}) => {
  const [hallTicket, setHallTicket] = useState<string>(nptelTracking?.hall_ticket_number || '');
  const [examCity, setExamCity] = useState<string>(nptelTracking?.exam_city || 'Chennai');
  const [examDate, setExamDate] = useState<string>(nptelTracking?.exam_date || '2026-04-26');
  const [finalScore, setFinalScore] = useState<number>(nptelTracking?.final_score || 0);
  const [certificateUrl, setCertificateUrl] = useState<string>(nptelTracking?.certificate_url || '');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const assignments = nptelTracking?.weekly_assignments || [
    { week_number: 1, title: 'Week 1: Introduction to Data Structures & Complexity', submitted: true, score: 95, max_score: 100, deadline: '2026-03-08' },
    { week_number: 2, title: 'Week 2: Greedy Algorithms & Dynamic Programming', submitted: true, score: 90, max_score: 100, deadline: '2026-03-15' },
    { week_number: 3, title: 'Week 3: Graph Traversal, BFS, DFS & Shortest Paths', submitted: true, score: 88, max_score: 100, deadline: '2026-03-22' },
    { week_number: 4, title: 'Week 4: Advanced Flow Networks & NP-Completeness', submitted: false, score: 0, max_score: 100, deadline: '2026-03-29' }
  ];

  const submittedCount = assignments.filter((a) => a.submitted).length;
  const avgScore = submittedCount > 0 ? Math.round(assignments.filter((a) => a.submitted).reduce((sum, a) => sum + (a.score || 0), 0) / submittedCount) : 0;

  const handleSaveTracking = async () => {
    setIsSaving(true);
    try {
      const updated = await api.updateNPTELTracking(course.id, {
        hall_ticket_number: hallTicket,
        exam_city: examCity,
        exam_date: examDate,
        final_score: finalScore,
        certificate_url: certificateUrl,
        certificate_status: certificateUrl ? 'SUBMITTED_FOR_VERIFICATION' : 'PENDING'
      });
      if (onUpdate) onUpdate(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* NPTEL Official Header Banner */}
      <div className="bg-gradient-to-r from-[#041a14] via-[#093529] to-[#041a14] rounded-3xl border border-emerald-700/60 p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500 text-white font-mono font-bold text-xs px-2.5 py-0.5 rounded-md">
                NPTEL / SWAYAM
              </span>
              <span className="text-emerald-300 font-mono text-xs">
                Course ID: {course.nptel_course_id || 'noc24-cs101'}
              </span>
              {nptelTracking?.verified_by_staff ? (
                <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/50 font-bold text-xs px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Staff Verified
                </span>
              ) : (
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/50 font-bold text-xs px-2.5 py-0.5 rounded-md">
                  Active NPTEL Session
                </span>
              )}
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight">
              {course.name} (NPTEL Proctored Elective)
            </h1>

            <p className="text-xs text-slate-300 leading-relaxed">
              Offered in partnership with IIT Madras / National Programme on Technology Enhanced Learning (NPTEL). Proctored examination score and weekly assignment matrix count towards institutional degree credits.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <a
              href="https://swayam.gov.in/nc_details/NPTEL"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <span>SWAYAM Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* NPTEL Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-emerald-800/80 text-xs">
          <div>
            <span className="text-emerald-300/80 block text-[11px] uppercase">Weekly Assignments</span>
            <strong className="text-white text-sm">{submittedCount} / {assignments.length} Submitted</strong>
          </div>
          <div>
            <span className="text-emerald-300/80 block text-[11px] uppercase">Assignment Average</span>
            <strong className="text-white text-sm">{avgScore}% Score</strong>
          </div>
          <div>
            <span className="text-emerald-300/80 block text-[11px] uppercase">Proctored Exam Date</span>
            <strong className="text-white text-sm">{examDate}</strong>
          </div>
          <div>
            <span className="text-emerald-300/80 block text-[11px] uppercase">Exam Hall Ticket</span>
            <strong className="text-emerald-200 text-sm font-mono">{hallTicket || 'Pending Allotment'}</strong>
          </div>
        </div>
      </div>

      {/* Weekly Assignments Matrix */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-500" />
              <span>NPTEL Weekly Assignment Submissions & Scoring Matrix</span>
            </h3>
            <p className="text-xs text-slate-500">
              The best 3 out of 4 assignments contribute 25% to the final NPTEL composite score.
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {assignments.map((asg) => (
            <div
              key={asg.week_number}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded font-mono text-[11px]">
                    Week {asg.week_number}
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-white">{asg.title}</h4>
                </div>
                <p className="text-[11px] text-slate-500">Deadline: {asg.deadline}</p>
              </div>

              <div className="flex items-center gap-3">
                {asg.submitted ? (
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold font-mono text-xs">
                    Score: {asg.score} / {asg.max_score} pts
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-bold text-xs">
                    Pending Submission
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Proctored Exam & Hall Ticket Details */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-500" />
          <span>Proctored Final Exam Center & Verification</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Hall Ticket Number</label>
            <input
              type="text"
              value={hallTicket}
              onChange={(e) => setHallTicket(e.target.value)}
              placeholder="e.g. NPTEL24CS101S1982"
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Exam City Center</label>
            <input
              type="text"
              value={examCity}
              onChange={(e) => setExamCity(e.target.value)}
              placeholder="e.g. Chennai, Tamil Nadu"
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Final Score Percentage</label>
            <input
              type="number"
              min={0}
              max={100}
              value={finalScore}
              onChange={(e) => setFinalScore(Number(e.target.value))}
              placeholder="e.g. 91"
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            NPTEL E-Certificate PDF Verification URL
          </label>
          <input
            type="url"
            value={certificateUrl}
            onChange={(e) => setCertificateUrl(e.target.value)}
            placeholder="https://nptel.ac.in/noc/Ecertificate/?q=NPTEL24CS101..."
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          {savedSuccess && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold animate-pulse">
              ✓ NPTEL tracking data saved successfully
            </span>
          )}
          <button
            onClick={handleSaveTracking}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ml-auto disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save NPTEL Details'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
