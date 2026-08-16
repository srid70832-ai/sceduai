-- SC EduSense AI PostgreSQL Database Schema Migration
-- Migration: 20260816000000_sc_edusense_schema.sql
-- "Your Intelligence for Academic Success."

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL CHECK (role IN ('ADMIN', 'TEACHER', 'STUDENT')),
    department TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    roll_number TEXT UNIQUE NOT NULL,
    enrollment_year INT NOT NULL,
    semester INT DEFAULT 1,
    major TEXT,
    academic_status TEXT DEFAULT 'ACTIVE' CHECK (academic_status IN ('ACTIVE', 'PROBATION', 'SUSPENDED', 'GRADUATED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TEACHERS TABLE
CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    employee_code TEXT UNIQUE NOT NULL,
    qualification TEXT,
    specialization TEXT,
    designation TEXT DEFAULT 'Lecturer',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ADMINISTRATORS TABLE
CREATE TABLE IF NOT EXISTS administrators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    admin_level TEXT DEFAULT 'SUPER_ADMIN',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. COURSES TABLE
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    department TEXT NOT NULL,
    credits INT NOT NULL DEFAULT 3,
    semester INT NOT NULL DEFAULT 1,
    level TEXT DEFAULT 'Undergraduate' CHECK (level IN ('Undergraduate', 'Postgraduate', 'Diploma', 'Certificate')),
    syllabus TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CLASSES TABLE
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    section_name TEXT NOT NULL,
    academic_term TEXT NOT NULL,
    room TEXT,
    schedule_days TEXT, -- e.g. "Mon, Wed, Fri"
    schedule_time TEXT, -- e.g. "10:00 AM - 11:30 AM"
    capacity INT DEFAULT 40,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id, section_name, academic_term)
);

-- 7. CLASS_STUDENTS (Class Roster)
CREATE TABLE IF NOT EXISTS class_students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, student_id)
);

-- 8. ENROLLMENTS TABLE (Course level)
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'ENROLLED' CHECK (status IN ('ENROLLED', 'DROPPED', 'COMPLETED')),
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id, student_id)
);

-- 9. ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ NOT NULL,
    maximum_marks NUMERIC(5,2) NOT NULL DEFAULT 100.00,
    attachment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ASSIGNMENT_SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    submission_text TEXT,
    attachment_url TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    marks_obtained NUMERIC(5,2),
    feedback TEXT,
    evaluated_by UUID REFERENCES teachers(id) ON DELETE SET NULL,
    evaluated_at TIMESTAMPTZ,
    status TEXT DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'EVALUATED', 'LATE', 'RESUBMITTED')),
    UNIQUE(assignment_id, student_id)
);

-- 11. EXAMINATIONS TABLE
CREATE TABLE IF NOT EXISTS examinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    exam_type TEXT DEFAULT 'MIDTERM' CHECK (exam_type IN ('QUIZ', 'MIDTERM', 'FINAL', 'PRACTICAL')),
    exam_date DATE NOT NULL,
    start_time TEXT,
    duration_minutes INT DEFAULT 90,
    maximum_marks NUMERIC(5,2) NOT NULL DEFAULT 100.00,
    weightage_percent NUMERIC(5,2) DEFAULT 30.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. EXAM_RESULTS TABLE
CREATE TABLE IF NOT EXISTS exam_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    examination_id UUID NOT NULL REFERENCES examinations(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    marks_obtained NUMERIC(5,2) NOT NULL CHECK (marks_obtained >= 0),
    grade TEXT,
    remarks TEXT,
    graded_by UUID REFERENCES teachers(id) ON DELETE SET NULL,
    graded_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(examination_id, student_id)
);

-- 13. ATTENDANCE_SESSIONS TABLE
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    session_topic TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, session_date)
);

-- 14. ATTENDANCE_RECORDS TABLE
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED')),
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, student_id)
);

-- 15. ACADEMIC_INSIGHTS TABLE
CREATE TABLE IF NOT EXISTS academic_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC(10,2),
    summary TEXT NOT NULL,
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. AI_RECOMMENDATIONS TABLE
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    weak_subjects JSONB DEFAULT '[]'::jsonb,
    strong_subjects JSONB DEFAULT '[]'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    reasoning_summary TEXT NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'INFO' CHECK (type IN ('INFO', 'ASSIGNMENT', 'EXAM', 'ATTENDANCE', 'AI_INSIGHT', 'ALERT')),
    link_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. AUDIT_LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    user_email TEXT,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_classes_course ON classes(course_id);
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_class ON assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_student ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_class ON attendance_sessions(class_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_student ON exam_results(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_profile ON notifications(profile_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_time ON audit_logs(created_at DESC);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE examinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
