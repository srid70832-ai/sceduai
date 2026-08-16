import React, { useState } from 'react';
import { Sidebar } from '../components/common/Sidebar';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { PageTransition } from '../components/common/PageTransition';
import { GlobalFeedbackButton } from '../components/common/GlobalFeedbackButton';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
  title?: string;
  subtitle?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  currentPath,
  onNavigate,
  title,
  subtitle
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentPath={currentPath}
          onNavigate={onNavigate}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
          <Header
            title={title}
            subtitle={subtitle}
            onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            onNavigate={onNavigate}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto space-y-8">
            <PageTransition pageKey={currentPath}>
              {children}
            </PageTransition>
          </main>

          <Footer onNavigate={onNavigate} />
        </div>
      </div>

      {/* Global Floating Feedback & Help Button */}
      <GlobalFeedbackButton currentPath={currentPath} onNavigate={onNavigate} />
    </div>
  );
};
