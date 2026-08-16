import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  Download, 
  Clock, 
  Layers,
  FileText,
  Save,
  MessageSquare
} from 'lucide-react';
import { CourseLesson, LessonProgress } from '../../types';

interface CourseVideoPlayerProps {
  lesson: CourseLesson & { progress?: LessonProgress };
  courseId: string;
  onProgressUpdate: (data: {
    video_watched_seconds: number;
    video_duration_seconds: number;
    completed?: boolean;
    notes?: string;
  }) => void;
  onNextLesson?: () => void;
  onOpenAITutorWithPrompt?: (prompt: string) => void;
}

export const CourseVideoPlayer: React.FC<CourseVideoPlayerProps> = ({
  lesson,
  courseId,
  onProgressUpdate,
  onNextLesson,
  onOpenAITutorWithPrompt
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(lesson.progress?.video_watched_seconds || 0);
  const [duration, setDuration] = useState<number>(lesson.video_duration_seconds || 1800);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [volume, setVolume] = useState<number>(0.9);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>(lesson.progress?.notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState<boolean>(false);
  const [notesSavedSuccess, setNotesSavedSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'objectives' | 'resources' | 'notes'>('overview');

  // Video source fallback
  const videoSource = lesson.video_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  const watchedSeconds = lesson.progress?.video_watched_seconds || 0;
  const isCompleted = lesson.progress?.status === 'COMPLETED' || (duration > 0 && (watchedSeconds / duration) >= 0.8);
  const completionPct = duration > 0 ? Math.min(100, Math.round(((currentTime || watchedSeconds) / duration) * 100)) : 0;

  // Sync initial time
  useEffect(() => {
    if (videoRef.current && lesson.progress?.video_watched_seconds) {
      // Don't auto-seek to end if completed
      if (lesson.progress.video_watched_seconds < duration - 5) {
        videoRef.current.currentTime = lesson.progress.video_watched_seconds;
      }
    }
  }, [lesson.id]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = Math.floor(videoRef.current.currentTime);
    setCurrentTime(current);

    // Periodically update progress every 10 seconds
    if (current > 0 && current % 10 === 0 && current > watchedSeconds) {
      onProgressUpdate({
        video_watched_seconds: current,
        video_duration_seconds: duration,
        completed: duration > 0 && (current / duration) >= 0.8
      });
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const vidDuration = Math.floor(videoRef.current.duration) || lesson.video_duration_seconds || 1800;
      setDuration(vidDuration);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      onProgressUpdate({
        video_watched_seconds: Math.floor(videoRef.current.currentTime),
        video_duration_seconds: duration
      });
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
      videoRef.current.volume = volume || 0.8;
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const container = document.getElementById(`video-container-${lesson.id}`);
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleMarkCompleted = () => {
    onProgressUpdate({
      video_watched_seconds: duration,
      video_duration_seconds: duration,
      completed: true,
      notes
    });
  };

  const handleSaveNotes = () => {
    setIsSavingNotes(true);
    onProgressUpdate({
      video_watched_seconds: currentTime,
      video_duration_seconds: duration,
      notes
    });
    setTimeout(() => {
      setIsSavingNotes(false);
      setNotesSavedSuccess(true);
      setTimeout(() => setNotesSavedSuccess(false), 3000);
    }, 400);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6">
      {/* Video Container Stage */}
      <div 
        id={`video-container-${lesson.id}`}
        className="relative bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 group"
      >
        <video
          ref={videoRef}
          src={videoSource}
          poster={lesson.cover_image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80'}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => {
            setIsPlaying(false);
            handleMarkCompleted();
          }}
          className="w-full aspect-video object-cover cursor-pointer"
          onClick={togglePlay}
        />

        {/* Video Overlay Info Header */}
        <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-600 text-white font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-md">
              LESSON {lesson.order_index}
            </span>
            <span className="text-white font-semibold text-xs drop-shadow-sm truncate max-w-md">
              {lesson.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isCompleted ? (
              <span className="bg-emerald-500/90 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Completed
              </span>
            ) : (
              <span className="bg-slate-800/80 text-emerald-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                {completionPct}% Watched
              </span>
            )}
          </div>
        </div>

        {/* Big Center Play/Pause button on Hover or Paused */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-emerald-500/90 hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
          >
            <Play className="w-7 h-7 fill-current ml-1" />
          </button>
        )}

        {/* Custom Video Controls Bar */}
        <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-95 group-hover:opacity-100 transition-opacity space-y-2">
          {/* Progress Slider */}
          <div className="relative flex items-center group/scrubber">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:h-2 transition-all"
            />
          </div>

          <div className="flex items-center justify-between text-white text-xs pt-1">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="hover:text-emerald-400 transition-colors cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              </button>

              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
                  }
                }}
                className="hover:text-emerald-400 transition-colors cursor-pointer"
                title="Rewind 10s"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
                  }
                }}
                className="hover:text-emerald-400 transition-colors cursor-pointer"
                title="Forward 10s"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              {/* Time display */}
              <div className="font-mono text-[11px] text-slate-300">
                <span>{formatTime(currentTime)}</span>
                <span className="mx-1 text-slate-500">/</span>
                <span>{formatTime(duration)}</span>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-1.5 group/vol ml-2">
                <button onClick={toggleMute} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-14 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400 opacity-70 group-hover/vol:opacity-100 transition-opacity"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Speed dropdown buttons */}
              <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700">
                {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => handleSpeedChange(spd)}
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                      playbackSpeed === spd ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
                    } transition-colors cursor-pointer`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="hover:text-emerald-400 transition-colors cursor-pointer p-1"
                title="Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar Below Player */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {isCompleted ? (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-2 rounded-2xl border border-emerald-200 dark:border-emerald-800/40">
              <CheckCircle2 className="w-4 h-4" />
              <span>Lesson Completed (Progress Verified)</span>
            </div>
          ) : (
            <button
              onClick={handleMarkCompleted}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark as Completed & Unlock Next</span>
            </button>
          )}

          {onOpenAITutorWithPrompt && (
            <button
              onClick={() => onOpenAITutorWithPrompt(`Explain key concepts from lesson: "${lesson.title}". Provide detailed breakdown and potential exam questions.`)}
              className="px-4 py-2.5 rounded-2xl bg-[#061c16] hover:bg-emerald-900 text-emerald-300 hover:text-white border border-emerald-700/60 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Ask AI Tutor About This Lesson</span>
            </button>
          )}
        </div>

        {onNextLesson && (
          <button
            onClick={onNextLesson}
            className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <span>Next Lesson</span>
            <span>→</span>
          </button>
        )}
      </div>

      {/* Lesson Details & Supplementary Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
          {[
            { id: 'overview', label: 'Lesson Overview', icon: BookOpen },
            { id: 'objectives', label: 'Learning Objectives', icon: Layers },
            { id: 'resources', label: 'Slides & Downloads', icon: Download },
            { id: 'notes', label: 'My Personal Notes', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {lesson.title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {lesson.description || 'This module lecture covers essential engineering methodologies, architectural paradigms, algorithmic complexities, and rigorous mathematical proofs for standard and high-throughput systems.'}
            </p>

            {lesson.timestamps && lesson.timestamps.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Key Lecture Timestamps</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {lesson.timestamps.map((ts, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (videoRef.current) {
                          const targetTime = (ts as any).seconds ?? ts.time_seconds ?? 0;
                          videoRef.current.currentTime = targetTime;
                          if (!isPlaying) togglePlay();
                        }
                      }}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs text-left transition-colors cursor-pointer group"
                    >
                      <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                        {(ts as any).label || ts.title}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-md">
                        {formatTime((ts as any).seconds ?? ts.time_seconds ?? 0)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'objectives' && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Measurable Curricular Outcomes
            </h4>
            <div className="space-y-2.5">
              {(lesson.learning_objectives || [
                'Understand core theoretical principles and foundational lemmas.',
                'Analyze performance, computational complexity, and system constraints.',
                'Implement concrete industrial solutions and verify correctness through unit tests.'
              ]).map((obj, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <span className="leading-relaxed">{obj}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Downloadable Lecture Materials & Slides
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(lesson.resources && lesson.resources.length > 0 ? lesson.resources : [
                { title: 'Lecture Slide Deck (PDF)', type: 'PDF', file_size: '4.2 MB', url: '#' },
                { title: 'Source Code & Implementation Notebook', type: 'ZIP', file_size: '1.8 MB', url: '#' },
                { title: 'Official Reference Readings & Bibliography', type: 'DOCX', file_size: '850 KB', url: '#' }
              ]).map((res, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <h5 className="font-bold text-slate-900 dark:text-white">{res.title}</h5>
                    <p className="text-[11px] text-slate-500 font-mono">{res.type} • {res.file_size || '2.0 MB'}</p>
                  </div>
                  <button
                    onClick={() => alert(`Downloading ${res.title}...`)}
                    className="p-2 rounded-xl bg-white dark:bg-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-200 hover:text-emerald-600 border border-slate-200 dark:border-slate-600 transition-colors cursor-pointer"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                <span>My Synchronized Lesson Notes</span>
              </h4>
              {notesSavedSuccess && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold animate-pulse">
                  ✓ Notes auto-saved to cloud
                </span>
              )}
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write down personal notes, key takeaways, formulas, code thoughts, or questions to ask the professor..."
              rows={5}
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none resize-y font-sans leading-relaxed"
            />
            <div className="flex justify-end">
              <button
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingNotes ? 'Saving...' : 'Save Notes'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
