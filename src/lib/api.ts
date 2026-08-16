import {
  Profile,
  Student,
  Teacher,
  Administrator,
  Course,
  ClassItem,
  Enrollment,
  Assignment,
  AssignmentSubmission,
  Examination,
  ExamResult,
  AttendanceSession,
  AcademicAnalyticsSummary,
  AIStudentRecommendation,
  AITeacherInsight,
  NotificationItem,
  AuditLogItem,
  AdminAnalyticsData,
  InstitutionalInquiry,
  CourseAITutorResponse,
  FeedbackItem,
  HelpDeskFAQ
} from '../types';

const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('edusense_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  let json;
  const text = await response.text();
  try {
    json = JSON.parse(text);
  } catch (e) {
    if (!response.ok) {
      throw new Error(text || `HTTP Error ${response.status}`);
    }
    throw new Error('Invalid JSON response from server');
  }

  if (!response.ok || !json.success) {
    throw new Error(json.error?.message || 'API request failed');
  }

  return json.data as T;
}

export const api = {
  // Auth
  register: (data: any) => request<{ user: Profile; student?: Student; teacher?: Teacher; token: string }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => request<{ user: Profile; student?: Student; teacher?: Teacher; admin?: Administrator; token: string }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  forgotPassword: (email: string) => request<{ message: string; reset_token: string; email: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (data: { email: string; reset_token: string; new_password: string }) => request<{ message: string }>('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request<{ user: Profile; student?: Student; teacher?: Teacher; admin?: Administrator; token: string }>('/auth/me'),
  quickSwitch: (role: string) => request<{ user: Profile; student?: Student; teacher?: Teacher; admin?: Administrator; token: string }>('/auth/quick-switch', { method: 'POST', body: JSON.stringify({ role }) }),
  seedDemoData: () => request<{ message: string; admin: string; teacher: string; student: string }>('/auth/seed-demo', { method: 'POST' }),
  resetDatabase: () => request<{ message: string }>('/auth/reset-db', { method: 'POST' }),

  // Courses & Departments
  getDepartments: () => request<Array<{ id: string; name: string; shortCode: string; category?: string; description?: string }>>('/departments'),
  createDepartment: (data: { name: string; shortCode: string; category?: string; description?: string }) => request<any>('/departments', { method: 'POST', body: JSON.stringify(data) }),
  getCourses: (params?: { 
    search?: string; 
    department?: string; 
    academic_year?: number | string;
    semester?: number | string;
    level?: string; 
    course_type?: string;
    credits?: number | string;
    faculty_id?: string;
    section?: string;
    status?: string;
    is_nptel?: boolean | string;
  }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.department) q.set('department', params.department);
    if (params?.academic_year) q.set('academic_year', String(params.academic_year));
    if (params?.semester) q.set('semester', String(params.semester));
    if (params?.level) q.set('level', params.level);
    if (params?.course_type) q.set('course_type', params.course_type);
    if (params?.credits) q.set('credits', String(params.credits));
    if (params?.faculty_id) q.set('faculty_id', params.faculty_id);
    if (params?.section) q.set('section', params.section);
    if (params?.status) q.set('status', params.status);
    if (params?.is_nptel !== undefined) q.set('is_nptel', String(params.is_nptel));
    return request<Course[]>(`/courses?${q.toString()}`);
  },
  getCourse: (id: string) => request<Course & { 
    classes: ClassItem[]; 
    assignments: Assignment[]; 
    examinations: Examination[]; 
    is_enrolled?: boolean;
    user_enrollment_id?: string;
    user_enrollment_status?: 'ENROLLED' | 'WAITLISTED' | 'DROPPED' | 'COMPLETED';
    student_attendance_rate?: number | null;
  }>(`/courses/${id}`),
  createCourse: (data: Partial<Course> & { initial_section?: string; initial_teacher_id?: string }) => request<Course>('/courses', { method: 'POST', body: JSON.stringify(data) }),
  updateCourse: (id: string, data: Partial<Course>) => request<Course>(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCourse: (id: string) => request<{ message: string }>(`/courses/${id}`, { method: 'DELETE' }),

  // Classes
  getClasses: (params?: { teacher_id?: string; course_id?: string }) => {
    const q = new URLSearchParams();
    if (params?.teacher_id) q.set('teacher_id', params.teacher_id);
    if (params?.course_id) q.set('course_id', params.course_id);
    return request<ClassItem[]>(`/classes?${q.toString()}`);
  },
  getClass: (id: string) => request<ClassItem & { students: any[]; assignments: Assignment[]; attendance_sessions: AttendanceSession[] }>(`/classes/${id}`),
  createClass: (data: any) => request<ClassItem>('/classes', { method: 'POST', body: JSON.stringify(data) }),
  enrollStudentInClass: (classId: string, student_id: string) => request<any>(`/classes/${classId}/students`, { method: 'POST', body: JSON.stringify({ student_id }) }),
  removeStudentFromClass: (classId: string, studentId: string) => request<any>(`/classes/${classId}/students/${studentId}`, { method: 'DELETE' }),

  // Enrollments & Registrations
  getEnrollments: (params?: { course_id?: string; student_id?: string; department?: string; status?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.course_id) q.set('course_id', params.course_id);
    if (params?.student_id) q.set('student_id', params.student_id);
    if (params?.department) q.set('department', params.department);
    if (params?.status) q.set('status', params.status);
    if (params?.search) q.set('search', params.search);
    const qs = q.toString();
    return request<Enrollment[]>(`/enrollments${qs ? '?' + qs : ''}`);
  },
  enrollCourse: (course_id: string, class_id?: string) => request<Enrollment>('/enrollments', { method: 'POST', body: JSON.stringify({ course_id, class_id }) }),
  dropEnrollment: (enrollment_id: string, reason?: string) => request<{ message: string; enrollment: Enrollment }>(`/enrollments/${enrollment_id}/drop`, { method: 'POST', body: JSON.stringify({ reason }) }),
  getRegistrationAudit: () => request<AuditLogItem[]>('/registrations/audit'),

  // Assignments
  getAssignments: (params?: { class_id?: string; course_id?: string }) => {
    const q = new URLSearchParams();
    if (params?.class_id) q.set('class_id', params.class_id);
    if (params?.course_id) q.set('course_id', params.course_id);
    return request<Assignment[]>(`/assignments?${q.toString()}`);
  },
  getAssignment: (id: string) => request<Assignment & { submissions: AssignmentSubmission[] }>(`/assignments/${id}`),
  getAssignmentSubmissions: async (assignmentId: string) => {
    const asg = await request<Assignment & { submissions: AssignmentSubmission[] }>(`/assignments/${assignmentId}`);
    return asg.submissions || [];
  },
  createAssignment: (data: any) => request<Assignment>('/assignments', { method: 'POST', body: JSON.stringify(data) }),
  submitAssignment: (data: { assignment_id: string; submission_text?: string; attachment_url?: string }) => request<AssignmentSubmission>('/submissions', { method: 'POST', body: JSON.stringify(data) }),
  evaluateSubmission: (id: string, data: { marks_obtained: number; feedback?: string }) => request<AssignmentSubmission>(`/submissions/${id}/evaluate`, { method: 'PUT', body: JSON.stringify(data) }),
  gradeSubmission: (id: string, data: { marks_obtained: number; feedback?: string }) => request<AssignmentSubmission>(`/submissions/${id}/evaluate`, { method: 'PUT', body: JSON.stringify(data) }),

  // Attendance
  getAttendanceSessions: (class_id?: string) => {
    const q = class_id ? `?class_id=${class_id}` : '';
    return request<AttendanceSession[]>(`/attendance/sessions${q}`);
  },
  getAttendanceSession: (id: string) => request<AttendanceSession & { records: any[] }>(`/attendance/sessions/${id}`),
  recordAttendance: (data: { class_id: string; session_date: string; session_topic?: string; records: Array<{ student_id: string; status: string; remarks?: string }> }) => request<AttendanceSession>('/attendance/sessions', { method: 'POST', body: JSON.stringify(data) }),
  recordBatchAttendance: (data: { class_id: string; date?: string; session_date?: string; session_topic?: string; records: Array<{ student_id: string; status: string; remarks?: string }> }) => request<AttendanceSession>('/attendance/sessions', { method: 'POST', body: JSON.stringify({ class_id: data.class_id, session_date: data.session_date || data.date || new Date().toISOString(), session_topic: data.session_topic || 'Class Session', records: data.records }) }),

  // Examinations
  getExaminations: (params?: { course_id?: string; class_id?: string }) => {
    const q = new URLSearchParams();
    if (params?.course_id) q.set('course_id', params.course_id);
    if (params?.class_id) q.set('class_id', params.class_id);
    return request<Examination[]>(`/examinations?${q.toString()}`);
  },
  getExamination: (id: string) => request<Examination & { results: ExamResult[] }>(`/examinations/${id}`),
  createExamination: (data: any) => request<Examination>('/examinations', { method: 'POST', body: JSON.stringify(data) }),
  recordExamResultsBulk: (examination_id: string, results: Array<{ student_id: string; marks_obtained: number; grade?: string; remarks?: string }>) => request<{ message: string }>('/exam-results/bulk', { method: 'POST', body: JSON.stringify({ examination_id, results }) }),
  gradeExam: (examination_id: string, result: { student_id: string; marks_obtained: number; grade?: string; remarks?: string }) => request<{ message: string }>('/exam-results/bulk', { method: 'POST', body: JSON.stringify({ examination_id, results: [result] }) }),

  // Analytics
  getStudentAnalytics: (studentId: string) => request<AcademicAnalyticsSummary>(`/analytics/student/${studentId}`),
  getTeacherAnalytics: (teacherId: string) => request<any>(`/analytics/teacher/${teacherId}`),
  getAdminAnalytics: () => request<AdminAnalyticsData>('/analytics/admin'),
  getAdminStats: () => request<any>('/analytics/admin'),

  // AI Intelligence
  getStudentAIRecommendations: (studentId: string) => request<AIStudentRecommendation>(`/ai/student-recommendations/${studentId}`),
  getTeacherClassInsights: (classId: string) => request<AITeacherInsight>(`/ai/teacher-insights/${classId}`),
  getClassAIInsights: (classId: string) => request<AITeacherInsight>(`/ai/teacher-insights/${classId}`),
  askCourseAITutor: (courseId: string, message: string, history?: Array<{ role: 'user' | 'assistant'; content: string }>) =>
    request<CourseAITutorResponse>(`/ai/course-tutor/${courseId}`, {
      method: 'POST',
      body: JSON.stringify({ message, history })
    }),

  // Reports
  getStudentReport: (studentId: string) => request<any>(`/reports/student/${studentId}`),
  getClassReport: (classId: string) => request<any>(`/reports/class/${classId}`),
  getCourseReport: (courseId: string) => request<any>(`/reports/course/${courseId}`),

  // Notifications
  getNotifications: () => request<NotificationItem[]>('/notifications'),
  markNotificationRead: (id: string) => request<NotificationItem>(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request<{ message: string }>('/notifications/read-all', { method: 'PUT' }),

  // Audit Logs
  getAuditLogs: () => request<AuditLogItem[]>('/audit-logs'),

  // Users & Profile
  getStudents: () => request<Student[]>('/users/students'),
  getTeachers: () => request<Teacher[]>('/users/teachers'),
  createStudent: (data: any) => request<Student>('/users/students', { method: 'POST', body: JSON.stringify(data) }),
  createTeacher: (data: any) => request<Teacher>('/users/teachers', { method: 'POST', body: JSON.stringify(data) }),
  updateProfile: (data: any) => request<{ user: Profile; student?: Student; teacher?: Teacher }>('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
  saveOnboarding: (data: any) => request<{ user: Profile; student?: Student; teacher?: Teacher; admin?: Administrator }>('/users/onboarding', { method: 'POST', body: JSON.stringify(data) }),
  getMyCourses: () => request<Course[]>('/student/my-courses'),

  // Institutional Inquiries
  createInquiry: (data: {
    full_name: string;
    institutional_email: string;
    role: string;
    department: string;
    subject: string;
    inquiry_type: string;
    message: string;
  }) => request<InstitutionalInquiry>('/inquiries', { method: 'POST', body: JSON.stringify(data) }),
  getInquiries: () => request<InstitutionalInquiry[]>('/inquiries'),
  getInquiry: (id: string) => request<InstitutionalInquiry>(`/inquiries/${id}`),

  // ----------------------------------------------------
  // COMPLETE LMS & COURSE LEARNING ENGINE
  // ----------------------------------------------------
  getCourseLearningDashboard: (courseId: string, studentId?: string) => {
    const q = studentId ? `?student_id=${studentId}` : '';
    return request<any>(`/courses/${courseId}/learn${q}`);
  },
  updateLessonProgress: (courseId: string, lessonId: string, data: {
    video_watched_seconds?: number;
    video_duration_seconds?: number;
    completed?: boolean;
    notes?: string;
  }) => request<any>(`/courses/${courseId}/lessons/${lessonId}/progress`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getQuiz: (courseId: string, quizId: string) => request<any>(`/courses/${courseId}/quizzes/${quizId}`),
  submitQuiz: (courseId: string, quizId: string, data: {
    answers: Record<string, any>;
    time_spent_seconds?: number;
  }) => request<any>(`/courses/${courseId}/quizzes/${quizId}/submit`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  submitAssignmentWithLMS: (assignmentId: string, data: {
    submission_text?: string;
    attachment_url?: string;
    attachment_name?: string;
  }) => request<any>(`/assignments/${assignmentId}/submit`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // NPTEL & External Hubs
  getNPTELTracking: (courseId: string, studentId?: string) => {
    const q = studentId ? `?student_id=${studentId}` : '';
    return request<any>(`/courses/${courseId}/nptel${q}`);
  },
  updateNPTELTracking: (courseId: string, data: any) => request<any>(`/courses/${courseId}/nptel`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getExternalCourseTracking: (courseId: string) => request<any>(`/courses/${courseId}/external`),
  updateExternalCourseTracking: (courseId: string, data: any) => request<any>(`/courses/${courseId}/external`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Faculty & Staff LMS Monitoring
  getCourseMonitoring: (courseId: string) => request<any>(`/teacher/courses/${courseId}/monitoring`),
  gradeLMSSubmission: (submissionId: string, data: { marks_obtained: number; feedback: string; status?: string }) =>
    request<any>(`/teacher/submissions/${submissionId}/grade`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  verifyExternalCertificate: (id: string, data: { verification_status: string; notes?: string }) =>
    request<any>(`/teacher/external-courses/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  addCourseModule: (courseId: string, data: any) => request<any>(`/courses/${courseId}/modules`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  addCourseLesson: (courseId: string, data: any) => request<any>(`/courses/${courseId}/lessons`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateCompletionCriteria: (courseId: string, data: any) => request<any>(`/courses/${courseId}/completion-rules`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Admin Global LMS Analytics
  getAdminCourseAnalytics: (params?: { department?: string; academic_year?: string; semester?: string; course_type?: string }) => {
    const q = new URLSearchParams();
    if (params?.department) q.set('department', params.department);
    if (params?.academic_year) q.set('academic_year', params.academic_year);
    if (params?.semester) q.set('semester', params.semester);
    if (params?.course_type) q.set('course_type', params.course_type);
    return request<any>(`/admin/course-analytics?${q.toString()}`);
  },

  // AI Recommendations & Interactive Tutor
  getAIAcademicRecommendations: () => request<any>('/ai/course-recommendations', { method: 'POST' }),
  askAICourseTutorAdvanced: (data: {
    course_id: string;
    module_id?: string;
    lesson_id?: string;
    message: string;
    history?: any[];
    language?: string;
  }) => request<any>('/ai/course-tutor', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  askSCEduAI: (data: {
    message: string;
    history?: { role: 'user' | 'model'; content: string }[];
    language?: 'auto' | 'en' | 'ta' | 'tanglish';
  }) => request<{
    reply: string;
    detected_language: string;
    suggested_followups: string[];
    student_summary?: {
      name: string;
      roll_number: string;
      department: string;
      attendance_percentage: number;
      overall_score: number;
      enrolled_courses_count: number;
      risk_level: string;
    };
  }>('/ai/sc-edu-ai', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Help Desk & Feedback System
  getSupportTickets: () => request<any[]>('/support/tickets'),
  createSupportTicket: (data: { category: string; subject: string; description: string; priority?: string }) =>
    request<any>('/support/tickets', { method: 'POST', body: JSON.stringify(data) }),
  replySupportTicket: (ticketId: string, data: { message: string; status?: string }) =>
    request<any>(`/support/tickets/${ticketId}/reply`, { method: 'POST', body: JSON.stringify(data) }),

  // Global Feedback & Help Desk
  getHelpDeskFAQs: () => request<HelpDeskFAQ[]>('/helpdesk/faqs'),
  getFeedbackStats: () =>
    request<{
      total: number;
      open: number;
      in_review: number;
      in_progress: number;
      resolved: number;
      closed: number;
      critical: number;
      category_counts: Record<string, number>;
    }>('/feedback/stats'),
  getMyFeedback: () => request<FeedbackItem[]>('/feedback/my'),
  getFeedbackList: (params?: {
    category?: string;
    priority?: string;
    status?: string;
    search?: string;
    sort?: string;
    assigned_to?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.category) q.set('category', params.category);
    if (params?.priority) q.set('priority', params.priority);
    if (params?.status) q.set('status', params.status);
    if (params?.search) q.set('search', params.search);
    if (params?.sort) q.set('sort', params.sort);
    if (params?.assigned_to) q.set('assigned_to', params.assigned_to);
    const queryString = q.toString();
    return request<FeedbackItem[]>(`/feedback${queryString ? `?${queryString}` : ''}`);
  },
  getFeedbackById: (id: string) => request<FeedbackItem>(`/feedback/${id}`),
  submitFeedback: (data: {
    category: string;
    subject: string;
    description: string;
    priority: string;
    attachment_url?: string;
    page_url?: string;
  }) =>
    request<{ success: boolean; data: FeedbackItem; message: string }>('/feedback', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateFeedback: (
    id: string,
    data: {
      status?: string;
      priority?: string;
      assigned_to?: string;
      assigned_to_name?: string;
      admin_response?: string;
    }
  ) =>
    request<FeedbackItem>(`/feedback/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
  respondFeedback: (id: string, data: { message: string; status?: string }) =>
    request<FeedbackItem>(`/feedback/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  addFeedbackInternalNote: (id: string, data: { note: string }) =>
    request<FeedbackItem>(`/feedback/${id}/internal-note`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Student Profile Update
  updateStudentProfile: (data: any) => request<any>('/students/profile', { method: 'PUT', body: JSON.stringify(data) })
};
