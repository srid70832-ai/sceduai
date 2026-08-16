export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface StudentOnboardingPreferences {
  department: string;
  study_year: '1st Year' | '2nd Year' | '3rd Year' | '4th Year' | string;
  academic_interests: string[];
  other_interest?: string;
  primary_academic_goal: 'Improve Marks' | 'Improve Attendance' | 'Improve Skills' | 'Placement Preparation' | 'All of these' | string;
  support_subject_ids: string[];
  support_subject_names?: string[];
  completed_at?: string;
}

export interface TeacherOnboardingPreferences {
  department: string;
  designation: string;
  specialization_interests: string[];
  pedagogical_goals: string[];
  student_support_priorities: string[];
  completed_at?: string;
}

export interface AdminOnboardingPreferences {
  institutional_focus: string[];
  oversight_priorities: string[];
  completed_at?: string;
}

export interface OnboardingData {
  role: UserRole;
  student_preferences?: StudentOnboardingPreferences;
  teacher_preferences?: TeacherOnboardingPreferences;
  admin_preferences?: AdminOnboardingPreferences;
  completed_at?: string;
}

export interface Profile {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  department?: string;
  date_of_birth?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say' | string;
  address?: string;
  onboarding_completed?: boolean;
  onboarding_data?: OnboardingData;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  profile_id: string;
  roll_number: string;
  enrollment_year: number;
  semester: number;
  department?: string;
  major?: string;
  degree_program?: string;
  study_year?: string;
  year?: number | string;
  section?: string;
  academic_year?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  academic_status: 'ACTIVE' | 'PROBATION' | 'SUSPENDED' | 'GRADUATED';
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface Teacher {
  id: string;
  profile_id: string;
  employee_code: string;
  department?: string;
  qualification?: string;
  specialization?: string;
  designation?: string;
  experience?: string;
  academic_year?: string;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface Administrator {
  id: string;
  profile_id: string;
  admin_level: string;
  created_at: string;
  profile?: Profile;
}

export type CourseType = 
  | 'Core Theory'
  | 'Integrated Theory & Lab'
  | 'Practical / Laboratory'
  | 'Professional Elective'
  | 'Open Elective'
  | 'Project / Seminar'
  | 'Mandatory Non-Credit'
  | string;

export interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  department: string;
  academic_year: number; // 1, 2, 3, 4
  semester: number; // 1 to 8
  credits: number;
  course_type: CourseType;
  level: 'Undergraduate' | 'Postgraduate' | 'Diploma' | 'Certificate' | string;
  prerequisites?: string;
  syllabus?: string;
  learning_outcomes?: string[] | string;
  assessment_pattern?: string;
  schedule_info?: string;
  max_seats?: number;
  available_seats?: number;
  registration_status?: 'OPEN' | 'FULL' | 'WAITLIST' | 'CLOSED';
  is_nptel?: boolean;
  nptel_course_id?: string;
  nptel_url?: string;
  nptel_institute?: string;
  nptel_instructor?: string;
  nptel_duration?: string;
  nptel_exam_date?: string;
  nptel_enrollment_end?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  created_by?: string;
  created_at: string;
  updated_at: string;
  classes_count?: number;
  enrolled_count?: number;
  primary_faculty?: string;
  sections_list?: string[];
  classes?: ClassItem[];
  assignments?: Assignment[];
  examinations?: Examination[];
  is_enrolled?: boolean;
  user_enrollment_id?: string;
  user_enrollment_status?: 'ENROLLED' | 'WAITLISTED' | 'DROPPED' | 'COMPLETED';
}

export interface ClassItem {
  id: string;
  course_id: string;
  teacher_id: string;
  section_name: string;
  academic_term: string;
  room?: string;
  schedule_days?: string;
  schedule_time?: string;
  capacity: number;
  created_at: string;
  updated_at: string;
  course?: Course;
  teacher?: Teacher;
  enrolled_students_count?: number;
}

export interface ClassStudent {
  id: string;
  class_id: string;
  student_id: string;
  enrolled_at: string;
  student?: Student;
}

export interface Enrollment {
  id: string;
  course_id: string;
  student_id: string;
  class_id?: string;
  status: 'ENROLLED' | 'WAITLISTED' | 'DROPPED' | 'COMPLETED';
  attendance_percentage?: number;
  assignment_progress?: number | {
    submitted: number;
    total: number;
    average_score?: number;
  };
  enrolled_at: string;
  dropped_at?: string;
  course?: Course;
  student?: Student;
}

export interface Assignment {
  id: string;
  course_id: string;
  class_id: string;
  teacher_id: string;
  title: string;
  description: string;
  due_date: string;
  maximum_marks: number;
  max_marks?: number;
  attachment_url?: string;
  created_at: string;
  updated_at: string;
  course?: Course;
  class?: ClassItem;
  teacher?: Teacher;
  submissions_count?: number;
  my_submission?: AssignmentSubmission;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  submission_text?: string;
  attachment_url?: string;
  attachment_name?: string;
  submitted_at: string;
  marks_obtained?: number;
  feedback?: string;
  evaluated_by?: string;
  evaluated_at?: string;
  status: 'SUBMITTED' | 'EVALUATED' | 'LATE' | 'RESUBMITTED' | 'GRADED';
  assignment?: Assignment;
  student?: Student;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export interface Examination {
  id: string;
  course_id: string;
  class_id?: string;
  teacher_id: string;
  name: string;
  exam_type: 'QUIZ' | 'MIDTERM' | 'FINAL' | 'PRACTICAL' | string;
  exam_date: string;
  start_time?: string;
  duration_minutes: number;
  maximum_marks: number;
  weightage_percent: number;
  created_at: string;
  updated_at: string;
  course?: Course;
  class?: ClassItem;
  teacher?: Teacher;
  results_count?: number;
  my_result?: ExamResult;
  results?: ExamResult[];
}

export interface ExamResult {
  id: string;
  examination_id: string;
  student_id: string;
  marks_obtained: number;
  grade?: string;
  remarks?: string;
  graded_by?: string;
  graded_at: string;
  examination?: Examination;
  student?: Student;
}

export interface AttendanceSession {
  id: string;
  class_id: string;
  teacher_id: string;
  session_date: string;
  session_topic?: string;
  created_at: string;
  class?: ClassItem;
  records_count?: number;
}

export interface AttendanceRecord {
  id: string;
  session_id: string;
  student_id: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string;
  created_at: string;
  session?: AttendanceSession;
  student?: Student;
}

export interface AcademicAnalyticsSummary {
  has_data: boolean;
  total_courses: number;
  total_classes: number;
  attendance_percentage: number;
  total_attendance_sessions: number;
  present_sessions: number;
  absent_sessions: number;
  late_sessions: number;
  total_classes_attended?: number;
  total_classes_conducted?: number;
  assignment_average: number;
  total_assignments: number;
  submitted_assignments: number;
  completed_assignments?: number;
  pending_assignments?: number;
  graded_assignments: number;
  exam_average: number;
  total_exams: number;
  completed_exams: number;
  overall_academic_score: number;
  academic_risk: 'low' | 'medium' | 'high' | 'critical' | 'none';
  weak_subjects: Array<{ course_name: string; course_code: string; score: number; reason: string }>;
  strong_subjects: Array<{ course_name: string; course_code: string; score: number }>;
  performance_trend: Array<{ month: string; score: number; attendance: number }>;
  subject_breakdowns?: Array<{
    course_id?: string;
    subject_code: string;
    subject_name: string;
    course_code?: string;
    course_name?: string;
    attendance_percentage: number;
    attendance_rate?: number;
    classes_attended?: number;
    total_classes?: number;
    average_marks: number;
    score?: number;
    overall_score?: number;
    risk: string;
  }>;
}

export interface AIStudentRecommendation {
  has_enough_data: boolean;
  message?: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  reasoning_summary: string;
  weak_subjects: string[];
  strong_subjects: string[];
  recommendations: Array<{
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    subject: string;
    reason: string;
    recommended_action: string;
    expected_improvement_area: string;
  }>;
}

export interface AITeacherInsight {
  has_enough_data: boolean;
  message?: string;
  class_id?: string;
  class_name?: string;
  students_requiring_attention: Array<{
    student_id: string;
    student_name: string;
    roll_number: string;
    reason: string;
    risk_factor: 'ATTENDANCE' | 'MARKS' | 'MISSING_ASSIGNMENTS' | 'COMBINED' | string;
    suggested_action: string;
  }>;
  at_risk_students?: Array<{
    student_id: string;
    student_name: string;
    roll_number: string;
    reason: string;
    risk_factor: string;
    suggested_action: string;
  }>;
  attendance_trend_summary: string;
  lowest_performing_topics: string[];
  weak_topics?: string[];
  strengths_summary: string;
  actionable_teaching_recommendations: string[];
  teaching_recommendations?: string[];
}

export interface NotificationItem {
  id: string;
  profile_id: string;
  title: string;
  message: string;
  type: 'INFO' | 'ASSIGNMENT' | 'EXAM' | 'ATTENDANCE' | 'AI_INSIGHT' | 'ALERT' | string;
  link_url?: string;
  is_read: boolean;
  created_at: string;
}

export type Notification = NotificationItem;

export interface AuditLogItem {
  id: string;
  profile_id?: string;
  user_email?: string;
  action: string;
  entity: string;
  entity_id?: string;
  details?: any;
  created_at: string;
}

export interface AdminAnalyticsData {
  total_students: number;
  total_teachers: number;
  total_courses: number;
  total_classes: number;
  total_assignments: number;
  total_exams: number;
  overall_attendance_rate: number;
  overall_assignment_avg: number;
  overall_exam_avg: number;
  risk_distribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  department_breakdown: Array<{
    department: string;
    students: number;
    teachers: number;
    courses: number;
    avg_score: number;
  }>;
  monthly_activity: Array<{
    month: string;
    attendance: number;
    submissions: number;
  }>;
}

export interface InstitutionalInquiry {
  id: string;
  user_id?: string | null;
  full_name: string;
  institutional_email: string;
  role: string;
  department: string;
  subject: string;
  inquiry_type: string;
  message: string;
  status: 'PENDING' | 'IN_REVIEW' | 'RESPONDED' | 'CLOSED';
  created_at: string;
  updated_at: string;
}

export interface CourseAITutorResponse {
  reply: string;
  suggested_followups: string[];
  referenced_units?: string[];
  source?: string;
  course_code?: string;
  course_name?: string;
}

export interface CourseAITutorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggested_followups?: string[];
  referenced_units?: string[];
}

export type LessonType = 'VIDEO' | 'READING' | 'QUIZ' | 'ASSIGNMENT' | 'PRACTICAL' | 'EXAM';

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  description?: string;
  duration_hours?: number;
  lessons?: CourseLesson[];
  completion_pct?: number;
  is_completed?: boolean;
}

export interface LessonProgress {
  id: string;
  student_id: string;
  course_id: string;
  module_id: string;
  lesson_id: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  video_watched_seconds: number;
  video_duration_seconds: number;
  video_completion_pct: number;
  notes?: string;
  completed_at?: string;
  last_accessed_at?: string;
}

export interface QuizQuestion {
  id: string;
  question_text: string;
  question_type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'MULTI_SELECT';
  options: string[];
  correct_answer_index: number | number[];
  explanation: string;
  points: number;
}

export interface Quiz {
  id: string;
  course_id: string;
  module_id?: string;
  lesson_id?: string;
  title: string;
  description?: string;
  time_limit_minutes: number;
  passing_percentage: number;
  max_attempts: number;
  questions: QuizQuestion[];
  total_points: number;
  attempts_count?: number;
  highest_score?: number;
  my_latest_attempt?: QuizAttempt;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  student_id: string;
  course_id: string;
  attempt_number: number;
  answers: Record<string, number | number[]>;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  time_spent_seconds: number;
  feedback?: string;
  created_at: string;
}

export interface CourseLesson {
  id: string;
  course_id: string;
  module_id: string;
  title: string;
  lesson_type: LessonType;
  order_index: number;
  duration_minutes: number;
  description?: string;
  learning_objectives?: string[];
  video_url?: string;
  video_thumbnail?: string;
  cover_image_url?: string;
  video_duration_seconds?: number;
  reading_content?: string;
  resource_urls?: Array<{ title: string; url: string; type: string }>;
  resources?: Array<{ id: string; title: string; type: string; url: string; size_label?: string }>;
  timestamps?: Array<{ time_seconds: number; title: string }>;
  assignment_id?: string;
  assignment?: Assignment;
  quiz_id?: string;
  quiz?: Quiz;
  is_mandatory?: boolean;
  min_video_completion_pct?: number;
  progress?: LessonProgress;
  is_locked?: boolean;
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface CourseCompletionCriteria {
  video_weight: number;
  assignment_weight: number;
  quiz_weight: number;
  practical_weight: number;
  exam_weight: number;
  min_attendance_pct?: number;
  min_assignment_score?: number;
  min_quiz_score?: number;
  min_total_pct?: number;
}

export interface CourseLearningDashboardData {
  course: Course;
  enrollment: Enrollment;
  modules: CourseModule[];
  completion_stats: {
    overall_progress: number;
    is_completed: boolean;
    completed_at?: string;
    certificate_issued?: boolean;
    certificate_id?: string;
    videos: { total: number; completed: number; percentage: number; weight: number; watched_count?: number; total_count?: number };
    assignments: { total: number; completed: number; average_score: number; percentage: number; weight: number };
    quizzes: { total: number; completed: number; average_score: number; percentage: number; weight: number };
    practicals: { total: number; completed: number; percentage: number; weight: number };
    exams: { total: number; completed: number; score: number; percentage: number; weight: number; average_score?: number };
    requirements_met: boolean;
    requirements_met_count?: number;
    total_requirements_count?: number;
    missing_requirements?: string[];
  };
  upcoming_deadlines: Array<{
    id: string;
    title: string;
    type: 'ASSIGNMENT' | 'QUIZ' | 'EXAM' | 'NPTEL';
    due_date: string;
    course_name: string;
    course_code: string;
    action_url: string;
    days_left: number;
  }>;
  recent_grades: Array<{
    title: string;
    type: string;
    marks_obtained: number;
    max_marks: number;
    percentage: number;
    graded_at: string;
    feedback?: string;
  }>;
  faculty_feedback: Array<{
    id: string;
    faculty_name: string;
    faculty_avatar?: string;
    date: string;
    message: string;
    item_name: string;
  }>;
  nptel_tracking?: NPTELTrackingRecord;
  external_tracking?: ExternalCourseRecord;
  last_accessed_lesson?: CourseLesson;
}

export type NPTELCourseTracking = NPTELTrackingRecord;
export type ExternalCourseTracking = ExternalCourseRecord;

export interface NPTELTrackingRecord {
  id: string;
  student_id: string;
  course_id: string;
  nptel_course_id?: string;
  registration_status: 'REGISTERED' | 'EXAM_REGISTERED' | 'COMPLETED' | 'DROPPED';
  weekly_assignments: Array<{
    week_number: number;
    title: string;
    submitted: boolean;
    score: number;
    max_score: number;
    deadline: string;
  }>;
  exam_date?: string;
  exam_city?: string;
  hall_ticket_number?: string;
  final_score?: number;
  certificate_status: 'PENDING' | 'ELIGIBLE' | 'ELITE' | 'ELITE_GOLD' | 'ELITE_SILVER' | 'FAILED';
  certificate_url?: string;
  verified_by_staff?: boolean;
  staff_notes?: string;
  updated_at: string;
}

export interface ExternalCourseRecord {
  id: string;
  student_id: string;
  course_id: string;
  provider_name: string;
  external_course_id?: string;
  external_url: string;
  progress_pct: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED' | 'REJECTED';
  certificate_url?: string;
  verification_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  verified_by?: string;
  verified_at?: string;
  verification_notes?: string;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  profile_id: string;
  user_name: string;
  user_email: string;
  user_role: UserRole;
  category: 'Course Content' | 'Assignment / Submission' | 'Quiz / Grading' | 'NPTEL Verification' | 'Technical Bug' | 'General Academic';
  subject: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  responses: Array<{
    id: string;
    sender_name: string;
    sender_role: string;
    message: string;
    created_at: string;
    is_ai?: boolean;
  }>;
  created_at: string;
  updated_at: string;
}

export type FeedbackCategory =
  | 'Bug / Technical Issue'
  | 'Course Issue'
  | 'Registration Issue'
  | 'Assignment Issue'
  | 'Attendance Issue'
  | 'Examination Issue'
  | 'AI / Chatbot Issue'
  | 'NPTEL Course Issue'
  | 'UI / Design Issue'
  | 'Suggestion'
  | 'Other';

export type FeedbackPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type FeedbackStatus =
  | 'Open'
  | 'In Review'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Closed'
  | 'Rejected';

export interface FeedbackResponse {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: UserRole | string;
  message: string;
  created_at: string;
  is_ai?: boolean;
}

export interface FeedbackInternalNote {
  id: string;
  author_id: string;
  author_name: string;
  author_role: UserRole | string;
  note: string;
  created_at: string;
}

export interface FeedbackItem {
  id: string;
  feedback_id: string; // e.g. FDB-2026-0001
  profile_id: string;
  user_id?: string;
  user_name: string;
  user_email: string;
  user_role: UserRole;
  category: FeedbackCategory;
  subject: string;
  description: string;
  priority: FeedbackPriority;
  attachment_url?: string;
  page_url?: string;
  status: FeedbackStatus;
  admin_response?: string;
  assigned_to?: string; // profile_id of assigned staff
  assigned_to_name?: string;
  internal_notes?: FeedbackInternalNote[];
  responses?: FeedbackResponse[];
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface HelpDeskFAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  tags: string[];
}

export interface AppFeedback {
  id: string;
  profile_id: string;
  user_name: string;
  user_email: string;
  user_role: UserRole;
  category: 'Course Quality' | 'Platform Usability' | 'AI Assistant' | 'Faculty / Teaching' | 'Suggestion';
  rating: number;
  message: string;
  attachment_url?: string;
  created_at: string;
}

export interface CourseMonitoringStaffData {
  course: Course;
  total_enrolled: number;
  active_students: number;
  completed_students: number;
  at_risk_students: number;
  average_progress: number;
  average_assignment_score: number;
  average_quiz_score: number;
  average_attendance: number;
  pending_submissions_count: number;
  students: Array<{
    student_id: string;
    profile_id: string;
    name: string;
    roll_number: string;
    avatar_url?: string;
    progress_percentage: number;
    assignments_completed: number;
    assignments_total: number;
    assignment_avg_score: number;
    quizzes_completed: number;
    quizzes_total: number;
    quiz_avg_score: number;
    attendance_rate: number;
    status: 'On Track' | 'At Risk' | 'Completed' | 'Lagging';
    last_active: string;
    is_nptel?: boolean;
    nptel_status?: string;
  }>;
}

export interface AuthState {
  user: Profile | null;
  student?: Student | null;
  teacher?: Teacher | null;
  admin?: Administrator | null;
  token: string | null;
  isLoading: boolean;
}
