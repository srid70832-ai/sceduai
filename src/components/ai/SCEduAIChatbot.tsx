import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Copy,
  Check,
  Download,
  Globe,
  Radio,
  User,
  Bot,
  Flame,
  BookOpen,
  Calendar,
  Compass,
  ArrowRight,
  HelpCircle,
  Headphones,
  CheckCircle2,
  X
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  detected_language?: string;
  suggested_followups?: string[];
}

type LanguageOption = 'auto' | 'en' | 'ta' | 'tanglish';

export const SCEduAIChatbot: React.FC = () => {
  const { user, student } = useAuth();
  const { showToast } = useToast();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('sc_edu_ai_messages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });

  const [inputMessage, setInputMessage] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>('auto');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState<boolean>(false);
  const [isVoiceModeActive, setIsVoiceModeActive] = useState<boolean>(false);
  const [speechTranscript, setSpeechTranscript] = useState<string>('');
  const [studentSummary, setStudentSummary] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Quick Action Chips
  const quickActions = [
    {
      title: 'Performance & Attendance',
      prompt: 'Analyze my academic standing, attendance rate, and course grades with strategic recommendations.',
      icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" />
    },
    {
      title: '7-Day Exam Study Plan',
      prompt: 'Create a tailored 7-day study timetable for my upcoming semester examinations.',
      icon: <Calendar className="w-3.5 h-3.5 text-indigo-500" />
    },
    {
      title: 'Target Weak Subjects',
      prompt: 'Identify the difficult concepts in my enrolled courses and explain them step-by-step.',
      icon: <Compass className="w-3.5 h-3.5 text-emerald-500" />
    },
    {
      title: 'தமிழ்: பாட விளக்கம்',
      prompt: 'வணக்கம் SC EDU AI! எனது பாடத்திட்டத்தின் முக்கிய சூத்திரங்கள் மற்றும் கருத்துக்களை தமிழில் விளக்குங்கள்.',
      icon: <Globe className="w-3.5 h-3.5 text-rose-500" />
    },
    {
      title: 'Tanglish: Revision Tips',
      prompt: 'SC EDU AI, enoda exams ku important topics revise panna Tanglish la best tips and plan kudunga.',
      icon: <BookOpen className="w-3.5 h-3.5 text-cyan-500" />
    }
  ];

  // Save messages to LocalStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('sc_edu_ai_messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Initial Welcome Message
  useEffect(() => {
    if (messages.length === 0) {
      const studentName = user?.full_name || 'Student';
      const welcome: ChatMessage = {
        id: 'welcome_init',
        role: 'model',
        content: `### 👋 Vanakkam & Welcome, **${studentName}**!\n\nI am **SC EDU AI**, your personalized **AI Academic Assistant** powered by **Gemini**.\n\nI have access to your verified academic records, registered courses, attendance rates, and assignment milestones to provide real-time guidance.\n\n#### 🌟 How I Can Help You:\n- 📖 **Concept & Syllabus Clarification**: Understand algorithms, engineering concepts, math, and code in plain English, **தமிழ் (Tamil)**, or **Tanglish**.\n- 📊 **Academic Diagnostics**: Instant feedback on your attendance compliance, test scores, and risk factors.\n- 📅 **Custom Study Timetables**: Structured daily revision plans crafted around your upcoming deadlines.\n- 🎙️ **Voice & Hands-Free Interaction**: Use speech input and voice playback anytime.\n\n*Select a starter prompt below or ask me anything to begin!*`,
        timestamp: new Date().toISOString(),
        detected_language: 'English',
        suggested_followups: [
          'Analyze my current attendance & performance',
          'Create a 7-day study plan for exams',
          'தமிழ்: பாடத்திட்டத்தின் அலகு 1-ஐ சுருக்கமாக கூறவும்'
        ]
      };
      setMessages([welcome]);
    }
  }, [user]);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, speechTranscript]);

  // Web Speech API: Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedLanguage === 'ta' ? 'ta-IN' : 'en-US';

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        const text = final || interim;
        setSpeechTranscript(text);
        if (final) {
          setInputMessage((prev) => (prev ? `${prev} ${final}` : final));
          setSpeechTranscript('');
          if (isVoiceModeActive) {
            handleSendMessage(final);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setSpeechTranscript((currentTranscript) => {
          if (currentTranscript) {
            setInputMessage((prev) => (prev ? `${prev} ${currentTranscript}` : currentTranscript));
          }
          return '';
        });
      };

      recognitionRef.current = recognition;
    }
  }, [selectedLanguage, isVoiceModeActive]);

  // Toggle Voice Input
  const toggleListening = () => {
    if (!recognitionRef.current) {
      showToast('Speech Recognition is not supported by this browser. Please use Chrome or Edge.', 'error');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = selectedLanguage === 'ta' ? 'ta-IN' : 'en-US';
        recognitionRef.current.start();
        setIsListening(true);
        showToast(`Listening in ${selectedLanguage === 'ta' ? 'Tamil (ta-IN)' : 'English/Tanglish (en-US)'}...`, 'info');
      } catch (err) {
        console.error(err);
      }
    }
  };

  // SpeechSynthesis Voice Output
  const speakMessage = (msgId: string, text: string, lang?: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      showToast('Speech synthesis not supported on this device.', 'error');
      return;
    }

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean text of markdown characters for natural speech
    const cleanText = text
      .replace(/[#*_`~[\]]/g, '')
      .replace(/\((http[s]?:\/\/[^\)]+)\)/g, '')
      .replace(/[\n\r]+/g, '. ');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick appropriate voice if available
    const voices = window.speechSynthesis.getVoices();
    if (lang === 'Tamil' || /[\u0B80-\u0BFF]/.test(text)) {
      const tamilVoice = voices.find((v) => v.lang.startsWith('ta'));
      if (tamilVoice) utterance.voice = tamilVoice;
    } else {
      const englishVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google')));
      if (englishVoice) utterance.voice = englishVoice;
    }

    utterance.onend = () => {
      setSpeakingMessageId(null);
      if (isVoiceModeActive) {
        // In voice mode, resume listening after speaking
        setTimeout(() => {
          if (!isListening) toggleListening();
        }, 500);
      }
    };
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Send Message
  const handleSendMessage = async (customPrompt?: string) => {
    const query = (customPrompt || inputMessage).trim();
    if (!query || isLoading) return;

    // Build user message
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString()
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build history for context
      const history = newMessages.slice(-8).map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await api.askSCEduAI({
        message: query,
        history,
        language: selectedLanguage
      });

      if (res && res.reply) {
        const assistantMsg: ChatMessage = {
          id: `ai_${Date.now()}`,
          role: 'model',
          content: res.reply,
          timestamp: new Date().toISOString(),
          detected_language: res.detected_language,
          suggested_followups: res.suggested_followups
        };

        setMessages((prev) => [...prev, assistantMsg]);
        if (res.student_summary) {
          setStudentSummary(res.student_summary);
        }

        // Auto speak if enabled or in voice mode
        if (autoSpeak || isVoiceModeActive) {
          speakMessage(assistantMsg.id, assistantMsg.content, assistantMsg.detected_language);
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Error communicating with SC EDU AI', 'error');
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'model',
        content: `⚠️ **Connection Notice**: I experienced a brief timeout connecting to the Gemini server. Please check your internet connection or try again in a moment.`,
        timestamp: new Date().toISOString(),
        suggested_followups: ['Try asking again', 'Analyze my academic standing']
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Copy Message to Clipboard
  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      showToast('Copied to clipboard', 'info');
    } catch {
      showToast('Failed to copy', 'error');
    }
  };

  // Clear Conversation
  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear your conversation with SC EDU AI?')) {
      localStorage.removeItem('sc_edu_ai_messages');
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setSpeakingMessageId(null);
      setMessages([]);
      showToast('Conversation cleared', 'info');
    }
  };

  // Export Conversation
  const handleExport = () => {
    const lines = messages.map((m) => {
      const sender = m.role === 'user' ? (user?.full_name || 'Student') : 'SC EDU AI';
      const time = new Date(m.timestamp).toLocaleString();
      return `[${time}] ${sender}:\n${m.content}\n${'-'.repeat(50)}\n`;
    });

    const header = `# SC EDU AI - Academic Assistant Chat Log\nStudent: ${user?.full_name || 'Alex Morgan'} (${student?.roll_number || 'N/A'})\nDepartment: ${student?.major || 'AI & DS'}\nExported: ${new Date().toLocaleString()}\n\n${'='.repeat(60)}\n\n`;
    const fullText = header + lines.join('\n');

    const blob = new Blob([fullText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SC_EDU_AI_Chat_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Chat history downloaded as Markdown file', 'success');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-all flex flex-col">
      {/* 1. Header Bar */}
      <div className="bg-linear-to-r from-indigo-900 via-slate-900 to-indigo-950 p-5 sm:p-6 text-white border-b border-indigo-800/40">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-linear-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-white/20">
                <Sparkles className="w-6 h-6 text-white animate-pulse" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  SC EDU AI
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                  Gemini Powered
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 font-medium">
                AI Academic Assistant • Multilingual Knowledge & Diagnostic Partner
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Language Selector */}
            <div className="flex items-center bg-white/10 rounded-xl p-1 border border-white/15 backdrop-blur-xs text-xs font-medium">
              <button
                onClick={() => setSelectedLanguage('auto')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedLanguage === 'auto'
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-indigo-200 hover:text-white'
                }`}
                title="Automatically detect spoken/typed language"
              >
                Auto Detect
              </button>
              <button
                onClick={() => setSelectedLanguage('en')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedLanguage === 'en'
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-indigo-200 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setSelectedLanguage('ta')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedLanguage === 'ta'
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-indigo-200 hover:text-white'
                }`}
              >
                தமிழ்
              </button>
              <button
                onClick={() => setSelectedLanguage('tanglish')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedLanguage === 'tanglish'
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-indigo-200 hover:text-white'
                }`}
              >
                Tanglish
              </button>
            </div>

            {/* Auto-Speak Toggle */}
            <button
              onClick={() => {
                setAutoSpeak(!autoSpeak);
                showToast(
                  !autoSpeak
                    ? 'Auto-Speak enabled: SC EDU AI will vocalize responses.'
                    : 'Auto-Speak disabled.',
                  'info'
                );
              }}
              className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
                autoSpeak
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-xs'
                  : 'bg-white/10 text-indigo-200 border-white/15 hover:text-white'
              }`}
              title="Toggle automatic speech synthesis"
            >
              {autoSpeak ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{autoSpeak ? 'Audio On' : 'Audio Off'}</span>
            </button>

            {/* Voice Mode Toggle */}
            <button
              onClick={() => {
                setIsVoiceModeActive(!isVoiceModeActive);
                if (!isVoiceModeActive && !isListening) {
                  toggleListening();
                }
              }}
              className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
                isVoiceModeActive
                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md animate-pulse'
                  : 'bg-white/10 text-indigo-200 border-white/15 hover:text-white'
              }`}
              title="Hands-free Voice Conversation Mode"
            >
              <Headphones className="w-4 h-4" />
              <span className="hidden sm:inline">Voice Mode</span>
            </button>

            {/* Export */}
            <button
              onClick={handleExport}
              disabled={messages.length === 0}
              className="p-2 rounded-xl bg-white/10 text-indigo-200 hover:text-white border border-white/15 transition-all disabled:opacity-40"
              title="Export Conversation Log"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Clear */}
            <button
              onClick={handleClear}
              className="p-2 rounded-xl bg-white/10 text-rose-300 hover:text-white hover:bg-rose-600/30 border border-white/15 transition-all"
              title="Clear Conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Student Context Bar */}
        <div className="mt-3 pt-3 border-t border-indigo-800/30 flex flex-wrap items-center justify-between gap-2 text-[11px] text-indigo-300">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <strong>{user?.full_name || 'Alex Morgan'}</strong> ({student?.roll_number || 'STU-2026'})
            </span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">{student?.major || 'Artificial Intelligence & Data Science'}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-indigo-950/80 border border-indigo-700/50 text-indigo-200 font-mono text-[10px]">
              Context-Aware: Real DB Records
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 font-mono text-[10px]">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Voice Mode Banner (Active when hands-free mode is on) */}
      {isVoiceModeActive && (
        <div className="bg-amber-500/10 dark:bg-amber-950/40 border-b border-amber-500/20 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <span className="w-3 h-3 bg-amber-500 rounded-full animate-ping absolute" />
              <span className="w-3 h-3 bg-amber-500 rounded-full relative" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900 dark:text-amber-300">
                Hands-Free Voice Conversation Mode Active
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                Speak naturally. SC EDU AI will listen, analyze, and speak responses aloud.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsVoiceModeActive(false)}
            className="text-xs px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-200 font-semibold"
          >
            Exit Voice Mode
          </button>
        </div>
      )}

      {/* 2. Messages Stream Container */}
      <div className="p-4 sm:p-6 space-y-6 max-h-[580px] min-h-[380px] overflow-y-auto bg-slate-50/50 dark:bg-slate-950/40">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isSpeaking = speakingMessageId === msg.id;

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {/* Assistant Avatar */}
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[78%] space-y-2`}>
                  {/* Message Bubble */}
                  <div
                    className={`p-4 sm:p-5 rounded-2xl text-xs sm:text-sm leading-relaxed transition-all shadow-xs ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200/90 dark:border-slate-800 rounded-tl-xs'
                    }`}
                  >
                    {!isUser && (
                      <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                            SC EDU AI
                          </span>
                          {msg.detected_language && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                              {msg.detected_language}
                            </span>
                          )}
                        </div>

                        {/* Speaking / Audio Indicator */}
                        {isSpeaking && (
                          <div className="flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-medium animate-pulse">
                            <span className="w-1.5 h-3 bg-indigo-500 rounded-full animate-bounce" />
                            <span className="w-1.5 h-4 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                            <span className="w-1.5 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                            <span className="ml-1">Speaking...</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Markdown Content */}
                    <div className={`prose prose-sm dark:prose-invert max-w-none break-words ${isUser ? 'text-white' : ''}`}>
                      <Markdown>{msg.content}</Markdown>
                    </div>

                    {/* Footer Controls for AI Message */}
                    {!isUser && (
                      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => speakMessage(msg.id, msg.content, msg.detected_language)}
                            className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                              isSpeaking ? 'text-indigo-600 font-bold bg-indigo-50 dark:bg-indigo-950/60' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                            title={isSpeaking ? 'Stop vocalization' : 'Listen with Speech Synthesis'}
                          >
                            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                            title="Copy response"
                          >
                            {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Suggested Follow-up Chips */}
                  {!isUser && msg.suggested_followups && msg.suggested_followups.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggested_followups.map((followup, fIdx) => (
                        <button
                          key={fIdx}
                          onClick={() => handleSendMessage(followup)}
                          disabled={isLoading}
                          className="text-[11px] font-medium px-3 py-1.5 rounded-xl bg-indigo-50/80 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/50 transition-all text-left flex items-center gap-1.5 shadow-2xs hover:shadow-xs disabled:opacity-50"
                        >
                          <ArrowRight className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span>{followup}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-xs mt-1 text-slate-700 dark:text-slate-300">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Live Listening Transcript Display */}
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-300"
          >
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-indigo-600 rounded-full animate-ping" />
              <Mic className="w-4 h-4 text-indigo-600 animate-pulse" />
            </div>
            <div className="flex-1 font-medium">
              {speechTranscript ? (
                <span>&ldquo;{speechTranscript}&rdquo;</span>
              ) : (
                <span>Listening for your question in {selectedLanguage === 'ta' ? 'Tamil' : 'English / Tanglish'}...</span>
              )}
            </div>
            <button
              onClick={toggleListening}
              className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 hover:underline"
            >
              Stop
            </button>
          </motion.div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-fit">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                SC EDU AI is processing your academic query...
              </p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse [animation-delay:0.4s]" />
                <span className="text-[10px] text-slate-400 ml-1">Analyzing curriculum & syllabus records</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Quick Action Chips Row */}
      <div className="px-4 sm:px-6 py-3 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 overflow-x-auto">
        <div className="flex items-center gap-2 whitespace-nowrap min-w-full">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 shrink-0">
            <Flame className="w-3 h-3 text-amber-500" />
            Quick Prompts:
          </span>

          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(action.prompt)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 text-xs font-medium border border-slate-200 dark:border-slate-700/60 transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              {action.icon}
              <span>{action.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Input Bar & Voice Controls */}
      <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end gap-2 sm:gap-3"
        >
          {/* Microphone Button - Perfectly Vertically Centered */}
          <button
            type="button"
            onClick={toggleListening}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl transition-all flex items-center justify-center shrink-0 ${
              isListening
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 animate-pulse ring-4 ring-rose-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600'
            }`}
            title={isListening ? 'Stop recording voice' : 'Speak using Voice Input (Tamil / English)'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input Area */}
          <div className="flex-1 relative flex items-center">
            <textarea
              ref={inputRef}
              rows={1}
              value={inputMessage}
              onChange={(e) => {
                setInputMessage(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                selectedLanguage === 'ta'
                  ? 'SC EDU AI-யிடம் உங்கள் சந்தேகங்களை கேளுங்கள் (Shift+Enter புதிய வரி)...'
                  : selectedLanguage === 'tanglish'
                  ? 'SC EDU AI kitta questions kelunga (e.g. Unit 1 tips solunga)...'
                  : 'Ask SC EDU AI anything regarding courses, syllabus, exam prep, or attendance...'
              }
              className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none min-h-[46px] max-h-[120px]"
            />
          </div>

          {/* Send Button - Perfectly Vertically Centered */}
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-md shadow-indigo-600/20 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center justify-center"
            title="Send prompt"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        <div className="flex items-center justify-between mt-2.5 px-1 text-[11px] text-slate-400">
          <span>Supported: English • தமிழ் (Tamil) • Tanglish • Voice I/O</span>
          <span className="hidden sm:inline">Press Enter to send, Shift+Enter for new line</span>
        </div>
      </div>
    </div>
  );
};
