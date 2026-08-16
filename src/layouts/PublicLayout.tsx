import React from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { AIBackground } from '../components/common/AIBackground';
import { PageTransition } from '../components/common/PageTransition';
import { GlobalFeedbackButton } from '../components/common/GlobalFeedbackButton';

interface PublicLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children, currentPath, onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors relative selection:bg-indigo-500 selection:text-white">
      <AIBackground />
      <Navbar currentPath={currentPath} onNavigate={onNavigate} />

      <main className="flex-1 relative z-10">
        <PageTransition pageKey={currentPath}>
          {children}
        </PageTransition>
      </main>

      <Footer onNavigate={onNavigate} />

      {/* Global Floating Feedback & Help Button */}
      <GlobalFeedbackButton currentPath={currentPath} onNavigate={onNavigate} />
    </div>
  );
};
