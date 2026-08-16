import React, { useState } from 'react';
import { FeedbackModal } from '../feedback/FeedbackModal';
import { MessageSquare, LifeBuoy, Sparkles, HelpCircle, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GlobalFeedbackButtonProps {
  currentPath: string;
  onNavigate?: (path: string) => void;
}

export const GlobalFeedbackButton: React.FC<GlobalFeedbackButtonProps> = ({ currentPath, onNavigate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialTab, setInitialTab] = useState<'submit' | 'helpdesk' | 'my-tickets'>('submit');
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const handleOpenModal = (tab: 'submit' | 'helpdesk' | 'my-tickets' = 'submit') => {
    setInitialTab(tab);
    setIsModalOpen(true);
    setShowQuickMenu(false);
  };

  return (
    <>
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end group/btn">
        {/* Quick Menu Popover (on hover or click) */}
        <AnimatePresence>
          {showQuickMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="mb-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 w-56 space-y-1 text-xs backdrop-blur-md"
            >
              <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  SC EduSense Support
                </span>
              </div>

              <button
                onClick={() => handleOpenModal('submit')}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Submit Feedback</span>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </button>

              <button
                onClick={() => handleOpenModal('helpdesk')}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Help Desk & FAQs</span>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </button>

              {onNavigate && (
                <button
                  onClick={() => {
                    setShowQuickMenu(false);
                    onNavigate('/student/ai-insights');
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 font-semibold transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Ask SC EDU AI</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-indigo-400" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Button with Tooltip */}
        <div className="flex items-center gap-2">
          {/* Tooltip Label */}
          <span className="hidden sm:inline-block opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 bg-slate-900/90 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-md border border-slate-700 pointer-events-none whitespace-nowrap">
            Feedback & Help
          </span>

          <button
            id="global-floating-feedback-button"
            title="Feedback & Help"
            onClick={() => handleOpenModal('submit')}
            onContextMenu={(e) => {
              e.preventDefault();
              setShowQuickMenu(!showQuickMenu);
            }}
            className="h-11 px-3 sm:px-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-full shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:shadow-emerald-600/40 border border-emerald-400/40 flex items-center gap-2 transition-all duration-200 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
          >
            <LifeBuoy className="w-5 h-5 animate-pulse" />
            <span className="hidden sm:inline text-xs font-bold tracking-tight">Help</span>
          </button>
        </div>
      </div>

      {/* Main Feedback Modal */}
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentPath={currentPath}
        onNavigate={onNavigate}
        initialTab={initialTab}
      />
    </>
  );
};
