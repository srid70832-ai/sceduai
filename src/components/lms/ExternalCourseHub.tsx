import React, { useState } from 'react';
import { 
  Award, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  UploadCloud, 
  Save,
  Globe
} from 'lucide-react';
import { Course, ExternalCourseTracking } from '../../types';
import { api } from '../../lib/api';

interface ExternalCourseHubProps {
  course: Course;
  externalTracking?: ExternalCourseTracking | null;
  onUpdate?: (data: any) => void;
}

export const ExternalCourseHub: React.FC<ExternalCourseHubProps> = ({
  course,
  externalTracking,
  onUpdate
}) => {
  const [provider, setProvider] = useState<string>(externalTracking?.provider_name || 'Coursera');
  const [externalUrl, setExternalUrl] = useState<string>(externalTracking?.external_url || '');
  const [progressPct, setProgressPct] = useState<number>(externalTracking?.progress_pct || 75);
  const [certificateUrl, setCertificateUrl] = useState<string>(externalTracking?.certificate_url || '');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const isVerified = externalTracking?.verification_status === 'APPROVED';

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await api.updateExternalCourseTracking(course.id, {
        provider_name: provider,
        external_url: externalUrl,
        progress_pct: progressPct,
        certificate_url: certificateUrl
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
      {/* Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800/40">
                External Accredited Courseware
              </span>
              {isVerified ? (
                <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs px-2.5 py-0.5 rounded-md flex items-center gap-1 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> Credits Approved & Transferred
                </span>
              ) : (
                <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-xs px-2.5 py-0.5 rounded-md">
                  In Progress / Verification Window
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {course.name}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Synchronize external online coursework from accredited providers (Coursera, edX, HarvardX, AWS Academy, Google Cloud). Submit verified certificate links to obtain university degree credit equivalency.
            </p>
          </div>

          {externalUrl && (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Open External Course</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Progress & Certificate Submission Form */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
        <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-500" />
          <span>External Course Credentials & Academic Sync</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Provider Platform</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Coursera">Coursera</option>
              <option value="edX">edX</option>
              <option value="Udemy">Udemy Business</option>
              <option value="AWS Academy">AWS Academy</option>
              <option value="Google Cloud Skills">Google Cloud Skills Boost</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">External Course Web URL</label>
            <input
              type="url"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://coursera.org/learn/algorithms-part1"
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Progress Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-slate-700 dark:text-slate-300">External Progress</label>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{progressPct}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={progressPct}
            onChange={(e) => setProgressPct(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        {/* Certificate URL */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Verified Digital Certificate URL / Verification Link
          </label>
          <input
            type="url"
            value={certificateUrl}
            onChange={(e) => setCertificateUrl(e.target.value)}
            placeholder="https://coursera.org/verify/AB81920J"
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="pt-2 flex items-center justify-between">
          {savedSuccess && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold animate-pulse">
              ✓ External coursework records synchronized
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ml-auto disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Sync External Progress'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
