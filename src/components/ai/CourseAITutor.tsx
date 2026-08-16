import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { 
  Sparkles, 
  X, 
  Send, 
  RotateCcw, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  BookOpen, 
  GraduationCap, 
  Lightbulb, 
  CheckCircle2, 
  FileText, 
  MessageSquare,
  HelpCircle,
  BrainCircuit,
  CornerDownLeft,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Course, CourseAITutorMessage } from '../../types';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface CourseAITutorProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string | null;
  onClearInitialPrompt?: () => void;
}

export const CourseAITutor: React.FC<CourseAITutorProps> = ({
  course,
  isOpen,
  onClose,
  initialPrompt,
  onClearInitialPrompt
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<CourseAITutorMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isWide, setIsWide] = useState<boolean>(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Parse course syllabus units
  const syllabusUnits = React.useMemo(() => {
    if (!course.syllabus) return [];
    return course.syllabus
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0 && ((s || "").toLowerCase().startsWith('unit') || (s || "").toLowerCase().startsWith('module')));
  }, [course.syllabus]);

  // Initial welcome message per course
  useEffect(() => {
    if (course && messages.length === 0) {
      const welcomeMsg: CourseAITutorMessage = {
        id: 'welcome-message',
        role: 'assistant',
        content: `### 👋 Welcome to your **${course.code}** AI Tutor!\n\nI'm your dedicated syllabus companion for **${course.name}** (${course.department}).\n\nI can help you:\n* 📘 **Explain any Unit** or break down complex concepts with real-world examples\n* 🧮 **Clarify formulas, algorithms & code implementations**\n* 🎯 **Check prerequisites** and recommended foundational study pathways\n* 📝 **Generate self-assessment practice problems & exam tips**\n\n*Choose a topic below or type any question to start!*`,
        timestamp: new Date().toISOString(),
        suggested_followups: [
          `Break down Unit 1 key concepts & formulas`,
          `What are the most challenging topics in this syllabus?`,
          `Generate 3 practice quiz questions with solutions`,
          `What are the essential prerequisites for ${course.code}?`
        ],
        referenced_units: syllabusUnits.length > 0 ? [syllabusUnits[0].split(':')[0] || 'Unit 1'] : ['Unit 1']
      };
      setMessages([welcomeMsg]);
    }
  }, [course]);

  // Handle external initialPrompt passed from course page (e.g. clicking a unit's AI button)
  useEffect(() => {
    if (isOpen && initialPrompt) {
      handleSendMessage(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [isOpen, initialPrompt]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle SpeechSynthesis audio
  const handleToggleSpeech = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown symbols for cleaner speech
    const cleanText = text
      .replace(/[#*_`~[\]]/g, '')
      .replace(/\((http[s]?:\/\/[^\)]+)\)/g, '')
      .replace(/[\n\r]+/g, '. ');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Handle Copy to clipboard
  const handleCopyMessage = async (msgId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(msgId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch {
      // Fallback
    }
  };

  // Reset chat session
  const handleClearHistory = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }
    const welcomeMsg: CourseAITutorMessage = {
      id: `welcome-${Date.now()}`,
      role: 'assistant',
      content: `### 🔄 Session Reset\n\nReady for fresh queries on **${course.code}: ${course.name}**! How can I assist with your syllabus today?`,
      timestamp: new Date().toISOString(),
      suggested_followups: [
        `Explain Unit 1 in simple terms`,
        `What is the assessment pattern and weightage?`,
        `Give me 3 practice problems for this course`
      ]
    };
    setMessages([welcomeMsg]);
  };

  // Send message handler
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputValue).trim();
    if (!textToSend || isLoading) return;

    if (!customText) {
      setInputValue('');
    }

    const userMessage: CourseAITutorMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString()
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      // Format history for backend
      const formattedHistory = newHistory.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await api.askCourseAITutor(course.id, textToSend, formattedHistory);

      const aiMessage: CourseAITutorMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toISOString(),
        suggested_followups: res.suggested_followups || [],
        referenced_units: res.referenced_units || []
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err: any) {
      const errorMessage: CourseAITutorMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `### ⚠️ Notice\n\n${err.message || 'Unable to connect to AI Tutor at this moment. Please check your connectivity or try asking your question again.'}`,
        timestamp: new Date().toISOString(),
        suggested_followups: [
          `Summarize the complete Unit 1 to 5 syllabus`,
          `What are the prerequisites for this course?`
        ]
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Escape key listener to close drawer
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Slide-out Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className={`relative w-full ${
              isWide ? 'sm:max-w-2xl lg:max-w-4xl' : 'sm:max-w-lg lg:max-w-xl'
            } h-full bg-[#0a151b] border-l border-emerald-900/60 shadow-2xl flex flex-col z-10 text-slate-200 transition-all duration-300`}
          >
            {/* Header Bar */}
            <div className="px-5 py-4 bg-[#061c16] border-b border-emerald-900/60 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-950/40 shrink-0">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-sm tracking-tight truncate">
                      AI Course Tutor
                    </span>
                    <span className="text-[10px] uppercase font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                      {course.code}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200/70 truncate font-normal">
                    {course.name}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
                <button
                  id="btn-tutor-expand"
                  onClick={() => setIsWide(!isWide)}
                  title={isWide ? "Standard view" : "Expand view"}
                  className="p-1.5 hover:text-white hover:bg-emerald-900/40 rounded-lg transition-colors hidden sm:inline-flex cursor-pointer"
                >
                  {isWide ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                <button
                  id="btn-tutor-reset"
                  onClick={handleClearHistory}
                  title="Clear chat session"
                  className="p-1.5 hover:text-white hover:bg-emerald-900/40 rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  id="btn-tutor-close"
                  onClick={onClose}
                  title="Close tutor"
                  className="p-1.5 hover:text-white hover:bg-emerald-900/40 rounded-lg transition-colors cursor-pointer text-slate-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Context & Unit Filter Chips Bar */}
            <div className="px-4 py-2 bg-[#09221b]/80 border-b border-emerald-900/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 text-[11px]">
              <span className="text-emerald-400 font-semibold flex items-center gap-1 whitespace-nowrap pl-1 pr-1.5">
                <Sparkles className="w-3 h-3 animate-pulse" />
                <span>Quick Topics:</span>
              </span>

              {syllabusUnits.slice(0, 5).map((unit, idx) => {
                const shortLabel = unit.split(':')[0] || `Unit ${idx + 1}`;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(`Break down ${unit} in detail with key formulas, core concepts, and sample exam questions.`)}
                    className="px-2.5 py-1 rounded-full bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-800/60 text-emerald-200 hover:text-white whitespace-nowrap transition-colors cursor-pointer"
                  >
                    {shortLabel}
                  </button>
                );
              })}

              <button
                onClick={() => handleSendMessage(`What are the prerequisites and foundational study recommendations for ${course.code}?`)}
                className="px-2.5 py-1 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white whitespace-nowrap transition-colors cursor-pointer"
              >
                Prerequisites
              </button>

              <button
                onClick={() => handleSendMessage(`Generate 3 challenging practice questions from this course syllabus with complete step-by-step solutions.`)}
                className="px-2.5 py-1 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white whitespace-nowrap transition-colors cursor-pointer"
              >
                Practice Quiz
              </button>
            </div>

            {/* Chat Messages Scroll Container */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-6">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    {/* Message Header */}
                    <div className="flex items-center gap-2 mb-1.5 px-1 text-[11px] text-slate-400">
                      {isUser ? (
                        <>
                          <span className="font-semibold text-emerald-300">{user?.full_name || 'You'}</span>
                          <span>•</span>
                          <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="font-bold text-emerald-300">SC EduSense AI Tutor</span>
                          <span>•</span>
                          <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {msg.referenced_units && msg.referenced_units.length > 0 && (
                            <span className="bg-emerald-950 text-emerald-300 text-[10px] px-1.5 py-0.5 rounded border border-emerald-800/50">
                              {msg.referenced_units.join(', ')}
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {/* Bubble Content */}
                    <div
                      className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-4 sm:p-5 text-xs leading-relaxed ${
                        isUser
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md font-medium rounded-tr-xs'
                          : 'bg-[#0f2420]/90 border border-emerald-900/70 text-slate-100 shadow-lg rounded-tl-xs backdrop-blur-xs'
                      }`}
                    >
                      {isUser ? (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      ) : (
                        <div className="space-y-3 prose prose-invert max-w-none text-xs leading-relaxed">
                          <Markdown
                            components={{
                              h1: ({ ...props }) => <h1 className="text-base font-bold text-white border-b border-emerald-800/60 pb-1 mt-2 mb-2" {...props} />,
                              h2: ({ ...props }) => <h2 className="text-sm font-bold text-emerald-200 mt-3 mb-1.5 flex items-center gap-1.5" {...props} />,
                              h3: ({ ...props }) => <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wide mt-2 mb-1" {...props} />,
                              p: ({ ...props }) => <p className="mb-2 leading-relaxed text-slate-200" {...props} />,
                              ul: ({ ...props }) => <ul className="list-disc pl-4 space-y-1 mb-2 text-slate-200" {...props} />,
                              ol: ({ ...props }) => <ol className="list-decimal pl-4 space-y-1 mb-2 text-slate-200" {...props} />,
                              li: ({ ...props }) => <li className="text-slate-200" {...props} />,
                              strong: ({ ...props }) => <strong className="font-semibold text-emerald-200" {...props} />,
                              code: ({ ...props }) => (
                                <code className="bg-[#061c16] text-emerald-300 px-1.5 py-0.5 rounded text-[11px] font-mono border border-emerald-900/60" {...props} />
                              ),
                              pre: ({ ...props }) => (
                                <pre className="bg-[#051410] border border-emerald-900/80 p-3 rounded-xl overflow-x-auto text-[11px] font-mono text-emerald-200 my-2" {...props} />
                              ),
                              blockquote: ({ ...props }) => (
                                <blockquote className="border-l-2 border-emerald-500 pl-3 italic text-slate-300 my-2 bg-emerald-950/30 py-1 rounded-r" {...props} />
                              )
                            }}
                          >
                            {msg.content}
                          </Markdown>
                        </div>
                      )}

                      {/* AI Action Toolbar (Copy, Read Aloud) */}
                      {!isUser && (
                        <div className="mt-3 pt-3 border-t border-emerald-900/50 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="text-[10px] text-emerald-400/80 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Grounded in official syllabus
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleSpeech(msg.id, msg.content)}
                              title={speakingMessageId === msg.id ? "Stop voice readout" : "Listen to explanation"}
                              className={`p-1 rounded hover:bg-emerald-900/50 transition-colors cursor-pointer flex items-center gap-1 ${
                                speakingMessageId === msg.id ? 'text-emerald-300 font-bold animate-pulse' : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {speakingMessageId === msg.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                              <span className="text-[10px]">{speakingMessageId === msg.id ? 'Stop' : 'Listen'}</span>
                            </button>

                            <button
                              onClick={() => handleCopyMessage(msg.id, msg.content)}
                              title="Copy response"
                              className="p-1 rounded hover:bg-emerald-900/50 text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                            >
                              {copiedMessageId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              <span className="text-[10px]">{copiedMessageId === msg.id ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Follow-up Suggested Prompts */}
                    {!isUser && msg.suggested_followups && msg.suggested_followups.length > 0 && (
                      <div className="mt-3 space-y-1.5 w-full max-w-[92%] sm:max-w-[85%] pl-1">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/90 flex items-center gap-1">
                          <Lightbulb className="w-3 h-3" />
                          Suggested Follow-ups:
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {msg.suggested_followups.map((suggestion, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleSendMessage(suggestion)}
                              className="text-left text-[11px] text-slate-300 hover:text-white bg-slate-900/70 hover:bg-emerald-950/80 border border-slate-800 hover:border-emerald-700/60 rounded-xl px-3 py-2 transition-all duration-150 flex items-center justify-between group cursor-pointer"
                            >
                              <span className="pr-2">{suggestion}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0 transition-transform group-hover:translate-x-0.5" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {/* Loading Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3"
                >
                  <div className="bg-[#0f2420] border border-emerald-900/70 rounded-2xl rounded-tl-xs p-4 text-xs text-emerald-300 flex items-center gap-3 shadow-lg">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" />
                    </div>
                    <span className="text-[11px] text-slate-300 font-medium">
                      AI Tutor is analyzing course syllabus & generating pedagogical explanation...
                    </span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Box */}
            <div className="p-4 bg-[#061c16] border-t border-emerald-900/60 shrink-0 space-y-2">
              <div className="relative flex items-end gap-2 bg-[#09221b] border border-emerald-800/60 focus-within:border-emerald-500 rounded-2xl p-2 transition-colors">
                <textarea
                  id="input-ai-tutor-query"
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask anything about ${course.code} syllabus, formulas, or exams...`}
                  rows={2}
                  disabled={isLoading}
                  className="w-full bg-transparent text-xs text-white placeholder-slate-400 resize-none focus:outline-none px-2 py-1 leading-relaxed max-h-32 disabled:opacity-50"
                />

                <div className="flex items-center gap-1 pb-1">
                  <button
                    id="btn-ai-tutor-send"
                    onClick={() => handleSendMessage()}
                    disabled={!inputValue.trim() || isLoading}
                    className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white disabled:text-slate-600 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed shadow-md flex items-center justify-center shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-emerald-200/60 px-1">
                <span>Press <kbd className="bg-slate-800 text-slate-300 px-1 py-0.5 rounded font-mono">Enter</kbd> to send, <kbd className="bg-slate-800 text-slate-300 px-1 py-0.5 rounded font-mono">Shift+Enter</kbd> for newline</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" />
                  KIT Autonomous Curriculum
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
