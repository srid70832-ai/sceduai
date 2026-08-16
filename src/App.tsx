import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { CoursesPage } from './pages/public/CoursesPage';
import { CourseDetailPage } from './pages/public/CourseDetailPage';
import { ContactPage } from './pages/public/ContactPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/public/ResetPasswordPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentCoursesPage } from './pages/student/StudentCoursesPage';
import { StudentCourseDetailPage } from './pages/student/StudentCourseDetailPage';
import { StudentAssignmentsPage } from './pages/student/StudentAssignmentsPage';
import { StudentAssignmentDetailPage } from './pages/student/StudentAssignmentDetailPage';
import { StudentAttendancePage } from './pages/student/StudentAttendancePage';
import { StudentExamsPage } from './pages/student/StudentExamsPage';
import { StudentResultsPage } from './pages/student/StudentResultsPage';
import { StudentProgressPage } from './pages/student/StudentProgressPage';
import { StudentAIInsightsPage } from './pages/student/StudentAIInsightsPage';
import { StudentNotificationsPage } from './pages/student/StudentNotificationsPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { StudentFeedbackPage } from './pages/student/StudentFeedbackPage';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { TeacherClassesPage } from './pages/teacher/TeacherClassesPage';
import { TeacherClassDetailPage } from './pages/teacher/TeacherClassDetailPage';
import { TeacherAttendancePage } from './pages/teacher/TeacherAttendancePage';
import { TeacherAssignmentsPage } from './pages/teacher/TeacherAssignmentsPage';
import { TeacherGradeSubmissionsPage } from './pages/teacher/TeacherGradeSubmissionsPage';
import { TeacherExamsPage } from './pages/teacher/TeacherExamsPage';
import { TeacherStudentAnalyticsPage } from './pages/teacher/TeacherStudentAnalyticsPage';
import { TeacherAIInsightsPage } from './pages/teacher/TeacherAIInsightsPage';
import { TeacherNotificationsPage } from './pages/teacher/TeacherNotificationsPage';
import { TeacherProfilePage } from './pages/teacher/TeacherProfilePage';
import { TeacherFeedbackPage } from './pages/teacher/TeacherFeedbackPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminStudentsPage } from './pages/admin/AdminStudentsPage';
import { AdminTeachersPage } from './pages/admin/AdminTeachersPage';
import { AdminCoursesPage } from './pages/admin/AdminCoursesPage';
import { AdminClassesPage } from './pages/admin/AdminClassesPage';
import { AdminAttendanceOverviewPage } from './pages/admin/AdminAttendanceOverviewPage';
import { AdminExamsOverviewPage } from './pages/admin/AdminExamsOverviewPage';
import { AdminAIAnalyticsPage } from './pages/admin/AdminAIAnalyticsPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminFeedbackPage } from './pages/admin/AdminFeedbackPage';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';

function Router() {
  const { user, role, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.hash ? window.location.hash.replace('#', '') : '/';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || '/';
      setCurrentPath(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
          Initializing SC EduSense AI Platform...
        </p>
      </div>
    );
  }

  // Parse path & params
  const [basePathAndQuery] = currentPath.split('?');
  const [pathname] = basePathAndQuery.split('?');

  // Match Course Detail: /courses/:id or /student/courses/:id
  const publicCourseMatch = pathname.match(/^\/courses\/([^/]+)$/);
  const studentCourseMatch = pathname.match(/^\/student\/courses\/([^/]+)$/);
  const studentAssignmentMatch = pathname.match(/^\/student\/assignments\/([^/]+)$/);
  const teacherClassMatch = pathname.match(/^\/teacher\/classes\/([^/]+)$/);
  const teacherGradeMatch = pathname.match(/^\/teacher\/assignments\/([^/]+)\/grade$/);

  // Authenticated Protected Views
  const isStudentRoute = pathname.startsWith('/student');
  const isTeacherRoute = pathname.startsWith('/teacher');
  const isAdminRoute = pathname.startsWith('/admin');

  // Redirect to Login if unauthorized
  if ((isStudentRoute || isTeacherRoute || isAdminRoute) && !user) {
    return (
      <PublicLayout currentPath="/login" onNavigate={navigate}>
        <LoginPage onNavigate={navigate} />
      </PublicLayout>
    );
  }

  // Intercept first-time authenticated users who have not completed onboarding questionnaire
  if (user && user.onboarding_completed === false && (isStudentRoute || isTeacherRoute || isAdminRoute)) {
    return (
      <OnboardingFlow
        onComplete={() => {
          if (isStudentRoute) navigate(pathname.startsWith('/student') ? pathname : '/student/dashboard');
          else if (isTeacherRoute) navigate(pathname.startsWith('/teacher') ? pathname : '/teacher/dashboard');
          else navigate(pathname.startsWith('/admin') ? pathname : '/admin/dashboard');
        }}
      />
    );
  }

  // Student Views
  if (isStudentRoute) {
    return (
      <DashboardLayout currentPath={pathname} onNavigate={navigate}>
        {studentCourseMatch ? (
          <StudentCourseDetailPage courseId={studentCourseMatch[1]} onNavigate={navigate} />
        ) : studentAssignmentMatch ? (
          <StudentAssignmentDetailPage assignmentId={studentAssignmentMatch[1]} onNavigate={navigate} />
        ) : pathname === '/student/courses' ? (
          <StudentCoursesPage onNavigate={navigate} />
        ) : pathname === '/student/assignments' ? (
          <StudentAssignmentsPage onNavigate={navigate} />
        ) : pathname === '/student/attendance' ? (
          <StudentAttendancePage onNavigate={navigate} />
        ) : pathname === '/student/exams' ? (
          <StudentExamsPage onNavigate={navigate} />
        ) : pathname === '/student/results' ? (
          <StudentResultsPage onNavigate={navigate} />
        ) : pathname === '/student/progress' ? (
          <StudentProgressPage onNavigate={navigate} />
        ) : pathname === '/student/ai-insights' ? (
          <StudentAIInsightsPage onNavigate={navigate} />
        ) : pathname === '/student/feedback' ? (
          <StudentFeedbackPage onNavigate={navigate} />
        ) : pathname === '/student/notifications' ? (
          <StudentNotificationsPage onNavigate={navigate} />
        ) : pathname === '/student/profile' ? (
          <StudentProfilePage onNavigate={navigate} />
        ) : (
          <StudentDashboard onNavigate={navigate} />
        )}
      </DashboardLayout>
    );
  }

  // Teacher Views
  if (isTeacherRoute) {
    return (
      <DashboardLayout currentPath={pathname} onNavigate={navigate}>
        {teacherClassMatch ? (
          <TeacherClassDetailPage classId={teacherClassMatch[1]} onNavigate={navigate} />
        ) : teacherGradeMatch ? (
          <TeacherGradeSubmissionsPage assignmentId={teacherGradeMatch[1]} onNavigate={navigate} />
        ) : pathname === '/teacher/classes' ? (
          <TeacherClassesPage onNavigate={navigate} />
        ) : pathname === '/teacher/attendance' ? (
          <TeacherAttendancePage onNavigate={navigate} />
        ) : pathname === '/teacher/assignments' ? (
          <TeacherAssignmentsPage onNavigate={navigate} />
        ) : pathname === '/teacher/exams' ? (
          <TeacherExamsPage onNavigate={navigate} />
        ) : pathname === '/teacher/students' ? (
          <TeacherStudentAnalyticsPage onNavigate={navigate} />
        ) : pathname === '/teacher/ai-insights' ? (
          <TeacherAIInsightsPage onNavigate={navigate} />
        ) : pathname === '/teacher/feedback' ? (
          <TeacherFeedbackPage />
        ) : pathname === '/teacher/notifications' ? (
          <TeacherNotificationsPage onNavigate={navigate} />
        ) : pathname === '/teacher/profile' ? (
          <TeacherProfilePage onNavigate={navigate} />
        ) : (
          <TeacherDashboard onNavigate={navigate} />
        )}
      </DashboardLayout>
    );
  }

  // Admin Views
  if (isAdminRoute) {
    return (
      <DashboardLayout currentPath={pathname} onNavigate={navigate}>
        {pathname === '/admin/students' ? (
          <AdminStudentsPage onNavigate={navigate} />
        ) : pathname === '/admin/teachers' ? (
          <AdminTeachersPage onNavigate={navigate} />
        ) : pathname === '/admin/courses' ? (
          <AdminCoursesPage onNavigate={navigate} />
        ) : pathname === '/admin/classes' ? (
          <AdminClassesPage onNavigate={navigate} />
        ) : pathname === '/admin/attendance' ? (
          <AdminAttendanceOverviewPage onNavigate={navigate} />
        ) : pathname === '/admin/exams' ? (
          <AdminExamsOverviewPage onNavigate={navigate} />
        ) : pathname === '/admin/ai-analytics' ? (
          <AdminAIAnalyticsPage onNavigate={navigate} />
        ) : pathname === '/admin/feedback' ? (
          <AdminFeedbackPage />
        ) : pathname === '/admin/audit-logs' ? (
          <AdminAuditLogsPage onNavigate={navigate} />
        ) : pathname === '/admin/settings' ? (
          <AdminSettingsPage onNavigate={navigate} />
        ) : (
          <AdminDashboard onNavigate={navigate} />
        )}
      </DashboardLayout>
    );
  }

  // Public Views
  return (
    <PublicLayout currentPath={pathname} onNavigate={navigate}>
      {publicCourseMatch ? (
        <CourseDetailPage courseId={publicCourseMatch[1]} onNavigate={navigate} />
      ) : pathname === '/courses' ? (
        <CoursesPage onNavigate={navigate} />
      ) : pathname === '/contact' ? (
        <ContactPage onNavigate={navigate} />
      ) : pathname === '/login' ? (
        <LoginPage onNavigate={navigate} />
      ) : pathname === '/register' ? (
        <RegisterPage onNavigate={navigate} />
      ) : pathname === '/forgot-password' ? (
        <ForgotPasswordPage onNavigate={navigate} />
      ) : pathname === '/reset-password' ? (
        <ResetPasswordPage onNavigate={navigate} />
      ) : (
        <HomePage onNavigate={navigate} />
      )}
    </PublicLayout>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </ToastProvider>
  );
}
