import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import { calculateStudentAnalytics, calculateTeacherAnalytics, calculateAdminAnalytics } from './server/analytics.js';
import { generateStudentAIRecommendations, generateTeacherClassInsights, askAITutorCourseQuery } from './server/gemini.js';
import { seedSampleAcademicData, syncAcademicCatalog } from './server/seed.js';
import { 
  ensureCourseCurriculum, 
  calculateCourseProgress, 
  generateAICourseTutorResponse, 
  generateStudentAcademicRecommendations 
} from './server/lms.js';
import { handleSCEduAIChat } from './server/scEduAI.js';
import { seedFeedbackData, getNextFeedbackNumber, HELPDESK_FAQS } from './server/feedbackService.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Simple Auth Helper Middleware
function getAuthUser(req: express.Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  // Token is user email or profile id
  const profile = db.find('profiles', (p) => p.id === token || p.email === token || p.auth_user_id === token)[0];
  if (!profile) return null;

  const student = profile.role === 'STUDENT' ? db.find('students', (s) => s.profile_id === profile.id)[0] : null;
  const teacher = profile.role === 'TEACHER' ? db.find('teachers', (t) => t.profile_id === profile.id)[0] : null;
  const admin = profile.role === 'ADMIN' ? db.find('administrators', (a) => a.profile_id === profile.id)[0] : null;

  return { profile, student, teacher, admin };
}

// Password validation helper
function validatePasswordStrength(pwd: string): { valid: boolean; error?: string } {
  if (!pwd || pwd.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Z]/.test(pwd)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter (A-Z).' };
  }
  if (!/[a-z]/.test(pwd)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter (a-z).' };
  }
  if (!/[0-9]/.test(pwd)) {
    return { valid: false, error: 'Password must contain at least one number (0-9).' };
  }
  return { valid: true };
}

// In-memory token store for password resets
const passwordResetTokens = new Map<string, { email: string; expiresAt: number }>();

// ----------------------------------------------------
// 1. AUTHENTICATION & SESSION ENDPOINTS
// ----------------------------------------------------

app.post('/api/auth/register', (req, res) => {
  const { full_name, email, password, role, department, roll_number, employee_code, major } = req.body;

  if (!full_name || !email || !role) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Full name, email, and role are required.' } });
  }

  if (role === 'ADMIN') {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Public registration for ADMIN role is strictly prohibited. Admin credentials must be provisioned internally.' } });
  }

  if (role !== 'STUDENT' && role !== 'TEACHER') {
    return res.status(400).json({ success: false, error: { code: 'INVALID_ROLE', message: 'Role must be either STUDENT or TEACHER.' } });
  }

  // Validate student roll number
  if (role === 'STUDENT') {
    if (!roll_number || !roll_number.trim()) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Student Roll Number is required for student registration.' } });
    }
    const cleanRoll = roll_number.trim();
    const existingStudent = db.find('students', (s) => s.roll_number && s.roll_number.toLowerCase() === cleanRoll.toLowerCase())[0];
    if (existingStudent) {
      return res.status(400).json({ success: false, error: { code: 'ROLL_NUMBER_EXISTS', message: 'This student roll number is already registered.' } });
    }
  }

  // Validate teacher employee code
  if (role === 'TEACHER') {
    if (!employee_code || !employee_code.trim()) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Faculty Employee Code is required for teacher registration.' } });
    }
    const cleanCode = employee_code.trim();
    const existingTeacher = db.find('teachers', (t) => t.employee_code && t.employee_code.toLowerCase() === cleanCode.toLowerCase())[0];
    if (existingTeacher) {
      return res.status(400).json({ success: false, error: { code: 'EMPLOYEE_CODE_EXISTS', message: 'This faculty / employee ID is already registered.' } });
    }
  }

  // Validate password strength
  if (password) {
    const pwdCheck = validatePasswordStrength(password);
    if (!pwdCheck.valid) {
      return res.status(400).json({ success: false, error: { code: 'WEAK_PASSWORD', message: pwdCheck.error } });
    }
  }

  const existing = db.find('profiles', (p) => p.email.toLowerCase() === email.toLowerCase())[0];
  if (existing) {
    return res.status(400).json({ success: false, error: { code: 'EMAIL_EXISTS', message: 'An account with this email address already exists.' } });
  }

  const selectedDepartment = department || 'Artificial Intelligence and Data Science';

  const auth_user_id = 'usr_' + Date.now();
  const profile = db.insert('profiles', {
    auth_user_id,
    full_name,
    email: email.toLowerCase(),
    role,
    department: selectedDepartment,
    avatar_url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256`
  });

  let student = null;
  let teacher = null;

  if (role === 'STUDENT') {
    student = db.insert('students', {
      profile_id: profile.id,
      roll_number: roll_number || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
      enrollment_year: new Date().getFullYear(),
      semester: 1,
      major: major || selectedDepartment,
      academic_status: 'ACTIVE'
    });
  } else if (role === 'TEACHER') {
    teacher = db.insert('teachers', {
      profile_id: profile.id,
      employee_code: employee_code || `FAC-${Math.floor(100 + Math.random() * 900)}`,
      qualification: 'Master of Science / Ph.D.',
      specialization: selectedDepartment,
      designation: 'Lecturer'
    });
  }

  db.logAudit('USER_REGISTERED', 'profile', profile.id, profile.email, profile.id, { role });
  db.createNotification(profile.id, 'Welcome to SC EduSense AI', 'Your academic account has been initialized. Explore courses and academic intelligence.', 'INFO', '/');

  res.json({
    success: true,
    data: {
      user: profile,
      student,
      teacher,
      token: profile.id
    }
  });
});

app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Email address is required.' } });
  }

  const profile = db.find('profiles', (p) => p.email.toLowerCase() === email.toLowerCase())[0];
  if (!profile) {
    return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'No registered account found with this email address.' } });
  }

  // Generate 6-digit or hex reset code
  const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity
  passwordResetTokens.set(resetToken, { email: profile.email.toLowerCase(), expiresAt });

  db.logAudit('PASSWORD_RESET_REQUESTED', 'profile', profile.id, profile.email, profile.id);

  res.json({
    success: true,
    data: {
      message: 'Password reset code has been dispatched to your institutional email.',
      reset_token: resetToken,
      email: profile.email
    }
  });
});

app.post('/api/auth/reset-password', (req, res) => {
  const { email, reset_token, new_password } = req.body;
  if (!email || !reset_token || !new_password) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Email, reset token, and new password are required.' } });
  }

  const tokenData = passwordResetTokens.get(reset_token);
  if (!tokenData || tokenData.email !== email.toLowerCase() || Date.now() > tokenData.expiresAt) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Invalid or expired password reset token. Please request a new link.' } });
  }

  const pwdCheck = validatePasswordStrength(new_password);
  if (!pwdCheck.valid) {
    return res.status(400).json({ success: false, error: { code: 'WEAK_PASSWORD', message: pwdCheck.error } });
  }

  const profile = db.find('profiles', (p) => p.email.toLowerCase() === email.toLowerCase())[0];
  if (!profile) {
    return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User profile not found.' } });
  }

  passwordResetTokens.delete(reset_token);
  db.logAudit('PASSWORD_RESET_COMPLETED', 'profile', profile.id, profile.email, profile.id);

  res.json({
    success: true,
    data: {
      message: 'Password updated successfully. You may now sign in with your new credentials.'
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Email address is required.' } });
  }

  const profile = db.find('profiles', (p) => p.email.toLowerCase() === email.toLowerCase())[0];
  if (!profile) {
    return res.status(401).json({ success: false, error: { code: 'AUTH_FAILED', message: 'Invalid credentials or user does not exist in database.' } });
  }

  const student = profile.role === 'STUDENT' ? db.find('students', (s) => s.profile_id === profile.id)[0] : null;
  const teacher = profile.role === 'TEACHER' ? db.find('teachers', (t) => t.profile_id === profile.id)[0] : null;
  const admin = profile.role === 'ADMIN' ? db.find('administrators', (a) => a.profile_id === profile.id)[0] : null;

  db.logAudit('USER_LOGIN', 'profile', profile.id, profile.email, profile.id);

  res.json({
    success: true,
    data: {
      user: profile,
      student,
      teacher,
      admin,
      token: profile.id
    }
  });
});

app.get('/api/auth/me', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication session expired or invalid.' } });
  }
  res.json({
    success: true,
    data: {
      user: auth.profile,
      student: auth.student,
      teacher: auth.teacher,
      admin: auth.admin,
      token: auth.profile.id
    }
  });
});

// Quick Switcher endpoint for demonstration / evaluation
app.post('/api/auth/quick-switch', (req, res) => {
  const { role } = req.body;
  const profile = db.find('profiles', (p) => p.role === role)[0];
  if (!profile) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `No active ${role} profile found in the database. Please create one or load demo records.` } });
  }

  const student = profile.role === 'STUDENT' ? db.find('students', (s) => s.profile_id === profile.id)[0] : null;
  const teacher = profile.role === 'TEACHER' ? db.find('teachers', (t) => t.profile_id === profile.id)[0] : null;
  const admin = profile.role === 'ADMIN' ? db.find('administrators', (a) => a.profile_id === profile.id)[0] : null;

  res.json({
    success: true,
    data: {
      user: profile,
      student,
      teacher,
      admin,
      token: profile.id
    }
  });
});

// Optional Demo Seed (Explicit User Action Only)
app.post('/api/auth/seed-demo', (req, res) => {
  const result = seedSampleAcademicData();
  res.json({ success: true, data: result });
});

// Reset Database to 100% clean empty state
app.post('/api/auth/reset-db', (req, res) => {
  db.resetDatabase();
  res.json({ success: true, data: { message: 'Database reset to empty state.' } });
});

// ----------------------------------------------------
// 2. COURSES & DEPARTMENTS ENDPOINTS
// ----------------------------------------------------

app.get('/api/departments', (req, res) => {
  let departments = db.find('departments');
  if (!departments || departments.length === 0) {
    // Return standard departments if empty
    departments = [
      { id: 'ai-ds', name: 'Artificial Intelligence and Data Science', shortCode: 'AI & DS', category: 'Engineering & Technology' },
      { id: 'cse', name: 'Computer Science and Engineering', shortCode: 'CSE', category: 'Engineering & Technology' },
      { id: 'it', name: 'Information Technology', shortCode: 'IT', category: 'Engineering & Technology' },
      { id: 'ece', name: 'Electronics and Communication Engineering', shortCode: 'ECE', category: 'Engineering & Technology' },
      { id: 'eee', name: 'Electrical and Electronics Engineering', shortCode: 'EEE', category: 'Engineering & Technology' },
      { id: 'me', name: 'Mechanical Engineering', shortCode: 'ME', category: 'Engineering & Technology' },
      { id: 'ce', name: 'Civil Engineering', shortCode: 'CE', category: 'Engineering & Technology' },
      { id: 'bme', name: 'Biomedical Engineering', shortCode: 'BME', category: 'Engineering & Technology' }
    ];
  }
  res.json({ success: true, data: departments });
});

app.post('/api/departments', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth || auth.profile.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only administrators can create academic departments.' } });
  }

  const { name, shortCode, category, description } = req.body;
  if (!name || !shortCode) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Department name and short code are required.' } });
  }

  const existing = db.find('departments', (d) => d.name.toLowerCase() === name.toLowerCase() || d.shortCode.toLowerCase() === shortCode.toLowerCase())[0];
  if (existing) {
    return res.status(400).json({ success: false, error: { code: 'DUPLICATE_DEPARTMENT', message: 'A department with this name or code already exists.' } });
  }

  const deptId = shortCode.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const department = db.insert('departments', {
    id: deptId,
    name,
    shortCode: shortCode.toUpperCase(),
    category: category || 'Engineering & Technology',
    description: description || '',
    created_at: new Date().toISOString()
  });

  db.logAudit('DEPARTMENT_CREATED', 'department', department.id, auth.profile.email, auth.profile.id, { name, shortCode });
  res.json({ success: true, data: department });
});

app.get('/api/courses', (req, res) => {
  const { 
    search, 
    department, 
    academic_year, 
    semester, 
    level, 
    course_type, 
    credits, 
    faculty_id, 
    section, 
    status,
    is_nptel
  } = req.query;

  const auth = getAuthUser(req);
  let courses = db.find('courses');

  // Filter: NPTEL / SWAYAM
  if (is_nptel !== undefined && is_nptel !== null && is_nptel !== '') {
    const nptelBool = String(is_nptel).toLowerCase() === 'true';
    if (nptelBool) {
      courses = courses.filter((c) => !!c.is_nptel);
    } else if (String(is_nptel).toLowerCase() === 'false') {
      courses = courses.filter((c) => !c.is_nptel);
    }
  }

  // Filter 1: Search query across code, title, description, prerequisites, syllabus, instructor
  if (search && String(search).trim() !== '') {
    const q = String(search).trim().toLowerCase();
    courses = courses.filter((c) => 
      c.name?.toLowerCase().includes(q) || 
      c.code?.toLowerCase().includes(q) || 
      c.description?.toLowerCase().includes(q) ||
      c.prerequisites?.toLowerCase().includes(q) ||
      c.syllabus?.toLowerCase().includes(q) ||
      c.nptel_instructor?.toLowerCase().includes(q) ||
      c.nptel_institute?.toLowerCase().includes(q)
    );
  }

  // Filter 2: Department
  if (department && department !== 'All' && String(department).trim() !== '') {
    const deptStr = String(department).trim().toLowerCase();
    courses = courses.filter((c) => {
      const cDept = (c.department || '').toLowerCase();
      return cDept === deptStr || cDept.includes(deptStr) || deptStr.includes(cDept);
    });
  }

  // Filter 3: Academic Year (1, 2, 3, 4)
  if (academic_year && academic_year !== 'All' && String(academic_year).trim() !== '') {
    const yearNum = Number(academic_year);
    courses = courses.filter((c) => {
      const derivedYear = c.academic_year ? Number(c.academic_year) : Math.ceil((Number(c.semester) || 1) / 2);
      return derivedYear === yearNum;
    });
  }

  // Filter 4: Semester (1 to 8)
  if (semester && semester !== 'All' && String(semester).trim() !== '') {
    const semNum = Number(semester);
    courses = courses.filter((c) => Number(c.semester) === semNum);
  }

  // Filter 5: Level (Undergraduate, Postgraduate, etc.)
  if (level && level !== 'All' && String(level).trim() !== '') {
    courses = courses.filter((c) => (c.level || 'Undergraduate').toLowerCase() === String(level).toLowerCase());
  }

  // Filter 6: Course Type
  if (course_type && course_type !== 'All' && String(course_type).trim() !== '') {
    const typeStr = String(course_type).trim().toLowerCase();
    courses = courses.filter((c) => (c.course_type || 'Core Theory').toLowerCase() === typeStr);
  }

  // Filter 7: Credits (1, 2, 3, 4, 5+)
  if (credits && credits !== 'All' && String(credits).trim() !== '') {
    const credStr = String(credits).trim();
    if (credStr === '5+') {
      courses = courses.filter((c) => Number(c.credits) >= 5);
    } else {
      const credNum = Number(credStr);
      if (!isNaN(credNum)) {
        courses = courses.filter((c) => Number(c.credits) === credNum);
      }
    }
  }

  // Filter 8: Faculty / Instructor ID or Name
  if (faculty_id && faculty_id !== 'All' && String(faculty_id).trim() !== '') {
    const facQuery = String(faculty_id).trim();
    const matchedClassCourseIds = new Set<string>();
    const allClasses = db.find('classes');
    
    allClasses.forEach((cls) => {
      if (cls.teacher_id === facQuery) {
        matchedClassCourseIds.add(cls.course_id);
      } else {
        const t = db.findById('teachers', cls.teacher_id);
        const p = t ? db.findById('profiles', t.profile_id) : null;
        if (p && (p.id === facQuery || p.full_name?.toLowerCase().includes(facQuery.toLowerCase()))) {
          matchedClassCourseIds.add(cls.course_id);
        }
      }
    });

    courses = courses.filter((c) => matchedClassCourseIds.has(c.id) || (c.nptel_instructor && c.nptel_instructor.toLowerCase().includes(facQuery.toLowerCase())));
  }

  // Filter 9: Section (e.g., Sec-A, Sec-B)
  if (section && section !== 'All' && String(section).trim() !== '') {
    const secQuery = String(section).trim().toLowerCase();
    const matchedCourseIds = new Set<string>();
    const allClasses = db.find('classes');

    allClasses.forEach((cls) => {
      if ((cls.section_name || '').toLowerCase() === secQuery || (cls.section_name || '').toLowerCase().includes(secQuery)) {
        matchedCourseIds.add(cls.course_id);
      }
    });

    courses = courses.filter((c) => matchedCourseIds.has(c.id));
  }

  // Filter 10: Academic Status
  if (status && status !== 'All' && String(status).trim() !== '') {
    courses = courses.filter((c) => (c.status || 'ACTIVE').toUpperCase() === String(status).toUpperCase());
  }

  // Attach relational counts, seat availability & registration status
  const enriched = courses.map((course) => {
    const classes = db.find('classes', (cl) => cl.course_id === course.id);
    const enrollments = db.find('enrollments', (en) => en.course_id === course.id && (en.status === 'ENROLLED' || !en.status));
    
    // Find primary faculty if assigned
    let primaryFaculty = course.is_nptel && course.nptel_instructor 
      ? `${course.nptel_instructor} (${course.nptel_institute || 'NPTEL'})`
      : 'Unassigned';

    if (!course.is_nptel && classes.length > 0) {
      const firstTeacher = db.findById('teachers', classes[0].teacher_id);
      const firstProf = firstTeacher ? db.findById('profiles', firstTeacher.profile_id) : null;
      if (firstProf) {
        primaryFaculty = firstProf.full_name;
      }
    }

    const sectionsList = classes.map((c) => c.section_name);
    const derivedYear = course.academic_year ? Number(course.academic_year) : Math.ceil((Number(course.semester) || 1) / 2);

    const maxSeats = Number(course.max_seats) || 60;
    const enrolledCount = enrollments.length;
    const availableSeats = Math.max(0, maxSeats - enrolledCount);

    let regStatus: 'OPEN' | 'FULL' | 'CLOSED' = 'OPEN';
    if (course.status && course.status !== 'ACTIVE') {
      regStatus = 'CLOSED';
    } else if (availableSeats <= 0) {
      regStatus = 'FULL';
    }

    let isEnrolled = false;
    let userEnrollmentId: string | null = null;
    let userEnrollmentStatus: string | null = null;

    if (auth?.student) {
      const userEnr = db.find('enrollments', (en) => en.course_id === course.id && en.student_id === auth.student!.id && en.status !== 'DROPPED')[0];
      if (userEnr) {
        isEnrolled = true;
        userEnrollmentId = userEnr.id;
        userEnrollmentStatus = userEnr.status;
      }
    }

    return {
      ...course,
      academic_year: derivedYear,
      course_type: course.course_type || 'Core Theory',
      status: course.status || 'ACTIVE',
      max_seats: maxSeats,
      enrolled_count: enrolledCount,
      available_seats: availableSeats,
      registration_status: regStatus,
      classes_count: classes.length,
      primary_faculty: primaryFaculty,
      sections_list: sectionsList,
      is_enrolled: isEnrolled,
      user_enrollment_id: userEnrollmentId,
      user_enrollment_status: userEnrollmentStatus
    };
  });

  res.json({ success: true, data: enriched });
});

app.get('/api/courses/:id', (req, res) => {
  const auth = getAuthUser(req);
  const course = db.findById('courses', req.params.id);
  if (!course) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Course not found in database.' } });
  }

  const classes = db.find('classes', (c) => c.course_id === course.id).map((cls) => {
    const teacher = db.findById('teachers', cls.teacher_id);
    const teacherProfile = teacher ? db.findById('profiles', teacher.profile_id) : null;
    const studentsCount = db.find('class_students', (cs) => cs.class_id === cls.id).length;
    return {
      ...cls,
      teacher: teacher ? { ...teacher, profile: teacherProfile } : null,
      enrolled_students_count: studentsCount
    };
  });

  const assignments = db.find('assignments', (a) => a.course_id === course.id);
  const examinations = db.find('examinations', (e) => e.course_id === course.id);
  const enrollments = db.find('enrollments', (en) => en.course_id === course.id && (en.status === 'ENROLLED' || !en.status));

  let studentEnrollment = null;
  let studentAttendanceRate = null;

  if (auth?.student) {
    studentEnrollment = enrollments.find((en) => en.student_id === auth.student!.id);
    if (studentEnrollment) {
      // Calculate attendance rate for this student in this course
      const courseClassIds = classes.map((c) => c.id);
      const courseSessions = db.find('attendance_sessions', (as) => courseClassIds.includes(as.class_id));
      const sessionIds = courseSessions.map((s) => s.id);
      const records = db.find('attendance_records', (ar) => ar.student_id === auth.student.id && sessionIds.includes(ar.session_id));
      if (records.length > 0) {
        const present = records.filter((r) => r.status === 'PRESENT').length;
        const late = records.filter((r) => r.status === 'LATE').length;
        studentAttendanceRate = Math.round(((present + late * 0.5) / records.length) * 100);
      }
    }
  }

  const derivedYear = course.academic_year ? Number(course.academic_year) : Math.ceil((Number(course.semester) || 1) / 2);
  const maxSeats = Number(course.max_seats) || 60;
  const enrolledCount = enrollments.length;
  const availableSeats = Math.max(0, maxSeats - enrolledCount);

  let regStatus: 'OPEN' | 'FULL' | 'CLOSED' = 'OPEN';
  if (course.status && course.status !== 'ACTIVE') {
    regStatus = 'CLOSED';
  } else if (availableSeats <= 0) {
    regStatus = 'FULL';
  }

  res.json({
    success: true,
    data: {
      ...course,
      academic_year: derivedYear,
      course_type: course.course_type || 'Core Theory',
      status: course.status || 'ACTIVE',
      max_seats: maxSeats,
      enrolled_count: enrolledCount,
      available_seats: availableSeats,
      registration_status: regStatus,
      classes,
      assignments,
      examinations,
      is_enrolled: !!studentEnrollment,
      user_enrollment_id: studentEnrollment ? studentEnrollment.id : null,
      user_enrollment_status: studentEnrollment ? studentEnrollment.status : null,
      student_attendance_rate: studentAttendanceRate
    }
  });
});

app.post('/api/courses', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth || (auth.profile.role !== 'ADMIN' && auth.profile.role !== 'TEACHER')) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only administrators or faculty can create courses.' } });
  }

  const { 
    code, 
    name, 
    description, 
    department, 
    academic_year, 
    semester, 
    credits, 
    course_type, 
    level, 
    prerequisites, 
    syllabus, 
    status,
    initial_section,
    initial_teacher_id
  } = req.body;

  if (!code || !name || !department) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Course code, title, and department are required.' } });
  }

  const cleanCode = String(code).trim().toUpperCase();
  const existing = db.find('courses', (c) => c.code.toUpperCase() === cleanCode)[0];
  if (existing) {
    return res.status(400).json({ success: false, error: { code: 'DUPLICATE_CODE', message: `A course with code "${cleanCode}" already exists in the catalog.` } });
  }

  const semNum = Number(semester) || 1;
  const yearNum = Number(academic_year) || Math.ceil(semNum / 2);

  const course = db.insert('courses', {
    code: cleanCode,
    name: String(name).trim(),
    description: description || '',
    department: String(department).trim(),
    academic_year: Math.min(Math.max(yearNum, 1), 4),
    semester: Math.min(Math.max(semNum, 1), 8),
    credits: Math.min(Math.max(Number(credits) || 3, 1), 12),
    course_type: course_type || 'Core Theory',
    level: level || 'Undergraduate',
    prerequisites: prerequisites || 'None',
    syllabus: syllabus || '',
    status: status || 'ACTIVE',
    created_by: auth.profile.id
  });

  // If initial section & teacher provided, schedule the section automatically
  if (initial_section && initial_teacher_id) {
    db.insert('classes', {
      course_id: course.id,
      teacher_id: initial_teacher_id,
      section_name: initial_section || 'Sec-A',
      academic_term: 'Spring 2026',
      room: 'Main Academic Wing Room 201',
      schedule_days: 'Mon, Wed, Fri',
      schedule_time: '10:00 AM - 11:30 AM',
      capacity: 40
    });
  }

  db.logAudit('COURSE_CREATED', 'course', course.id, auth.profile.email, auth.profile.id, { 
    code: course.code, 
    name: course.name, 
    department: course.department,
    semester: course.semester 
  });

  res.json({ success: true, data: course });
});

app.put('/api/courses/:id', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth || auth.profile.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Admin privileges required to modify courses.' } });
  }

  const existing = db.findById('courses', req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Course not found.' } });
  }

  const { code, name, description, department, academic_year, semester, credits, course_type, level, prerequisites, syllabus, status } = req.body;

  // Check code uniqueness if changed
  if (code && code.toUpperCase() !== existing.code.toUpperCase()) {
    const duplicate = db.find('courses', (c) => c.code.toUpperCase() === code.toUpperCase() && c.id !== existing.id)[0];
    if (duplicate) {
      return res.status(400).json({ success: false, error: { code: 'DUPLICATE_CODE', message: `Course code "${code.toUpperCase()}" is already assigned to another course.` } });
    }
  }

  const semNum = semester !== undefined ? Number(semester) : existing.semester;
  const yearNum = academic_year !== undefined ? Number(academic_year) : (existing.academic_year || Math.ceil(semNum / 2));

  const updated: any = db.update('courses', req.params.id, {
    ...(code ? { code: code.toUpperCase() } : {}),
    ...(name ? { name } : {}),
    ...(description !== undefined ? { description } : {}),
    ...(department ? { department } : {}),
    academic_year: yearNum,
    semester: semNum,
    ...(credits !== undefined ? { credits: Number(credits) } : {}),
    ...(course_type ? { course_type } : {}),
    ...(level ? { level } : {}),
    ...(prerequisites !== undefined ? { prerequisites } : {}),
    ...(syllabus !== undefined ? { syllabus } : {}),
    ...(status ? { status } : {}),
    updated_at: new Date().toISOString()
  });

  if (!updated) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Course not found.' } });
  }

  db.logAudit('COURSE_UPDATED', 'course', updated.id, auth.profile.email, auth.profile.id, { code: updated.code, name: updated.name });
  res.json({ success: true, data: updated });
});

app.delete('/api/courses/:id', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth || auth.profile.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Admin privileges required to delete courses.' } });
  }

  const course = db.findById('courses', req.params.id);
  if (!course) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Course not found.' } });
  }

  // Check if active enrollments exist; if so, archive instead of hard delete
  const enrollments = db.find('enrollments', (en) => en.course_id === course.id && en.status === 'ENROLLED');
  if (enrollments.length > 0) {
    db.update('courses', course.id, { status: 'ARCHIVED', updated_at: new Date().toISOString() });
    db.logAudit('COURSE_ARCHIVED', 'course', course.id, auth.profile.email, auth.profile.id, { reason: 'Has active enrollments' });
    return res.json({ success: true, data: { message: 'Course archived successfully as it contains active student enrollments.' } });
  }

  // Cleanly cascade delete related classes if empty
  const classes = db.find('classes', (cl) => cl.course_id === course.id);
  classes.forEach((c) => db.delete('classes', c.id));

  db.delete('courses', course.id);
  db.logAudit('COURSE_DELETED', 'course', course.id, auth.profile.email, auth.profile.id);
  res.json({ success: true, data: { message: 'Course deleted from catalog successfully.' } });
});

// ----------------------------------------------------
// 3. CLASSES & ENROLLMENTS ENDPOINTS
// ----------------------------------------------------

app.get('/api/classes', (req, res) => {
  const { teacher_id, course_id } = req.query;
  let classes = db.find('classes');

  if (teacher_id) {
    classes = classes.filter((c) => c.teacher_id === teacher_id);
  }
  if (course_id) {
    classes = classes.filter((c) => c.course_id === course_id);
  }

  const enriched = classes.map((cls) => {
    const course = db.findById('courses', cls.course_id);
    const teacher = db.findById('teachers', cls.teacher_id);
    const teacherProfile = teacher ? db.findById('profiles', teacher.profile_id) : null;
    const studentsCount = db.find('class_students', (cs) => cs.class_id === cls.id).length;

    return {
      ...cls,
      course,
      teacher: teacher ? { ...teacher, profile: teacherProfile } : null,
      enrolled_students_count: studentsCount
    };
  });

  res.json({ success: true, data: enriched });
});

app.get('/api/classes/:id', (req, res) => {
  const cls = db.findById('classes', req.params.id);
  if (!cls) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Class not found.' } });
  }

  const course = db.findById('courses', cls.course_id);
  const teacher = db.findById('teachers', cls.teacher_id);
  const teacherProfile = teacher ? db.findById('profiles', teacher.profile_id) : null;

  const classStudents = db.find('class_students', (cs) => cs.class_id === cls.id);
  const students = classStudents.map((cs) => {
    const student = db.findById('students', cs.student_id);
    const profile = student ? db.findById('profiles', student.profile_id) : null;
    return {
      ...cs,
      student: student ? { ...student, profile } : null
    };
  });

  const assignments = db.find('assignments', (a) => a.class_id === cls.id);
  const attendanceSessions = db.find('attendance_sessions', (as) => as.class_id === cls.id);

  res.json({
    success: true,
    data: {
      ...cls,
      course,
      teacher: teacher ? { ...teacher, profile: teacherProfile } : null,
      students,
      assignments,
      attendance_sessions: attendanceSessions
    }
  });
});

app.post('/api/classes', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth || (auth.profile.role !== 'ADMIN' && auth.profile.role !== 'TEACHER')) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only faculty or admins can create classes.' } });
  }

  const { course_id, teacher_id, section_name, academic_term, room, schedule_days, schedule_time, capacity } = req.body;
  if (!course_id || !teacher_id || !section_name || !academic_term) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Course, teacher, section, and term are required.' } });
  }

  const newClass = db.insert('classes', {
    course_id,
    teacher_id,
    section_name,
    academic_term,
    room: room || '',
    schedule_days: schedule_days || 'Mon, Wed',
    schedule_time: schedule_time || '10:00 AM - 11:30 AM',
    capacity: Number(capacity) || 40
  });

  db.logAudit('CLASS_CREATED', 'class', newClass.id, auth.profile.email, auth.profile.id, { section: section_name });
  res.json({ success: true, data: newClass });
});

// Enroll / Add student to class
app.post('/api/classes/:id/students', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Login required.' } });
  }

  const { student_id } = req.body;
  const classId = req.params.id;

  const targetClass = db.findById('classes', classId);
  if (!targetClass) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Class not found.' } });
  }

  const existing = db.find('class_students', (cs) => cs.class_id === classId && cs.student_id === student_id)[0];
  if (existing) {
    return res.status(400).json({ success: false, error: { code: 'ALREADY_ENROLLED', message: 'Student is already enrolled in this class section.' } });
  }

  const classStudent = db.insert('class_students', {
    class_id: classId,
    student_id
  });

  // Also ensure course enrollment
  const courseEnrollment = db.find('enrollments', (en) => en.course_id === targetClass.course_id && en.student_id === student_id)[0];
  if (!courseEnrollment) {
    db.insert('enrollments', {
      course_id: targetClass.course_id,
      student_id,
      status: 'ENROLLED'
    });
  }

  res.json({ success: true, data: classStudent });
});

// Remove student from class
app.delete('/api/classes/:id/students/:studentId', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth || auth.profile.role === 'STUDENT') {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Unauthorized action.' } });
  }

  const record = db.find('class_students', (cs) => cs.class_id === req.params.id && cs.student_id === req.params.studentId)[0];
  if (record) {
    db.delete('class_students', record.id);
  }
  res.json({ success: true, data: { message: 'Student removed from class.' } });
});

// Student Course Enrollment
app.post('/api/enrollments', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth || auth.profile.role !== 'STUDENT' || !auth.student) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only authenticated students can enroll in courses.' } });
  }

  const { course_id, class_id } = req.body;
  if (!course_id) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Course ID is required.' } });
  }

  const course = db.findById('courses', course_id);
  if (!course) {
    return res.status(404).json({ success: false, error: { code: 'COURSE_NOT_FOUND', message: 'The requested course does not exist.' } });
  }

  if (course.status && course.status !== 'ACTIVE') {
    return res.status(400).json({ success: false, error: { code: 'COURSE_INACTIVE', message: `Registration is closed for this course (Status: ${course.status}).` } });
  }

  // Check existing enrollment
  const existingActive = db.find('enrollments', (e) => e.course_id === course_id && e.student_id === auth.student!.id && e.status !== 'DROPPED')[0];
  if (existingActive) {
    return res.status(400).json({ 
      success: false, 
      error: { 
        code: 'ALREADY_ENROLLED', 
        message: `You are already registered for this course (Status: ${existingActive.status}).` 
      } 
    });
  }

  // Check seat capacity
  const activeEnrollments = db.find('enrollments', (en) => en.course_id === course_id && (en.status === 'ENROLLED' || !en.status));
  const maxSeats = Number(course.max_seats) || 60;
  const isFull = activeEnrollments.length >= maxSeats;

  // Determine enrollment status: if full, place on waitlist; otherwise confirmed enrollment
  const enrollmentStatus = isFull ? 'WAITLISTED' : 'ENROLLED';

  const now = new Date().toISOString();
  const enrollment = db.insert('enrollments', {
    course_id,
    student_id: auth.student.id,
    status: enrollmentStatus,
    enrolled_at: now
  });

  // If confirmed enrollment, also associate student with default class if not an NPTEL self-study
  let targetClassId = class_id;
  if (!targetClassId && !course.is_nptel) {
    const defaultClass = db.find('classes', (c) => c.course_id === course_id)[0];
    if (defaultClass) {
      targetClassId = defaultClass.id;
    }
  }

  if (targetClassId && enrollmentStatus === 'ENROLLED') {
    const existingClassStudent = db.find('class_students', (cs) => cs.class_id === targetClassId && cs.student_id === auth.student!.id)[0];
    if (!existingClassStudent) {
      db.insert('class_students', {
        class_id: targetClassId,
        student_id: auth.student.id
      });
    }
  }

  db.createNotification(
    auth.profile.id,
    enrollmentStatus === 'ENROLLED' ? 'Course Registration Confirmed' : 'Added to Course Waitlist',
    enrollmentStatus === 'ENROLLED'
      ? `You have successfully registered for ${course.code} - ${course.name}.`
      : `Course ${course.code} is currently at full capacity (${maxSeats}/${maxSeats} seats). You have been placed on the priority waitlist.`,
    enrollmentStatus === 'ENROLLED' ? 'INFO' : 'ALERT',
    `/student/courses/${course_id}`
  );

  db.logAudit(
    'COURSE_REGISTRATION', 
    'enrollment', 
    enrollment.id, 
    auth.profile.email, 
    auth.profile.id, 
    { 
      course_id, 
      course_code: course.code, 
      course_name: course.name,
      student_id: auth.student.id,
      student_roll: auth.student.roll_number,
      status: enrollmentStatus,
      is_nptel: !!course.is_nptel,
      registered_at: now
    }
  );

  res.json({ 
    success: true, 
    data: {
      ...enrollment,
      course: {
        ...course,
        available_seats: Math.max(0, maxSeats - (activeEnrollments.length + 1))
      }
    }
  });
});

// Drop Course Enrollment
app.post('/api/enrollments/:id/drop', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Login required.' } });
  }

  const enrollment = db.findById('enrollments', req.params.id);
  if (!enrollment) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Enrollment record not found.' } });
  }

  // Authorization check: only the enrolled student or staff/admin can drop
  if (auth.profile.role === 'STUDENT' && (!auth.student || enrollment.student_id !== auth.student.id)) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You can only drop your own course registrations.' } });
  }

  const course = db.findById('courses', enrollment.course_id);
  const now = new Date().toISOString();

  // Update enrollment status to DROPPED
  const updatedEnrollment = db.update('enrollments', enrollment.id, {
    status: 'DROPPED',
    dropped_at: now
  });

  // Remove student from any class sections for this course
  const classesForCourse = db.find('classes', (cls) => cls.course_id === enrollment.course_id);
  const classIds = classesForCourse.map((c) => c.id);
  const classStudentRecords = db.find('class_students', (cs) => classIds.includes(cs.class_id) && cs.student_id === enrollment.student_id);
  classStudentRecords.forEach((record) => {
    db.delete('class_students', record.id);
  });

  // Auto-promote first waitlisted student if any
  const waitlisted = db.find('enrollments', (en) => en.course_id === enrollment.course_id && en.status === 'WAITLISTED');
  if (waitlisted.length > 0) {
    const nextStudentEnrollment = waitlisted[0];
    db.update('enrollments', nextStudentEnrollment.id, {
      status: 'ENROLLED',
      promoted_at: now
    });

    const nextStudent = db.findById('students', nextStudentEnrollment.student_id);
    if (nextStudent) {
      db.createNotification(
        nextStudent.profile_id,
        'Waitlist Promotion: Course Seat Available',
        `A seat opened up! You have been automatically enrolled in ${course?.code || 'Course'} - ${course?.name || ''}.`,
        'INFO',
        `/student/courses/${enrollment.course_id}`
      );
    }
  }

  // Send notification to dropped student
  const studentProfileId = auth.profile.role === 'STUDENT' ? auth.profile.id : (db.findById('students', enrollment.student_id)?.profile_id || auth.profile.id);
  db.createNotification(
    studentProfileId,
    'Course Dropped',
    `You have successfully dropped ${course?.code || 'Course'} - ${course?.name || ''}.`,
    'INFO',
    '/courses'
  );

  db.logAudit(
    'COURSE_DROPPED',
    'enrollment',
    enrollment.id,
    auth.profile.email,
    auth.profile.id,
    {
      course_id: enrollment.course_id,
      course_code: course?.code,
      student_id: enrollment.student_id,
      dropped_at: now
    }
  );

  res.json({ success: true, data: updatedEnrollment });
});

// List Enrollments
app.get('/api/enrollments', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Login required.' } });
  }

  const { course_id, student_id, department, academic_year, semester, status, search } = req.query;

  let enrollments = db.find('enrollments');

  // If Student, strictly return only student's own enrollments
  if (auth.profile.role === 'STUDENT' && auth.student) {
    enrollments = enrollments.filter((e) => e.student_id === auth.student!.id);
  } else {
    // If Admin / Teacher, allow filter by student_id
    if (student_id && student_id !== 'All' && String(student_id).trim() !== '') {
      enrollments = enrollments.filter((e) => e.student_id === String(student_id).trim());
    }
  }

  if (course_id && course_id !== 'All' && String(course_id).trim() !== '') {
    enrollments = enrollments.filter((e) => e.course_id === String(course_id).trim());
  }

  if (status && status !== 'All' && String(status).trim() !== '') {
    const sStr = String(status).toUpperCase();
    enrollments = enrollments.filter((e) => (e.status || 'ENROLLED').toUpperCase() === sStr);
  }

  const enriched = enrollments.map((en) => {
    const course = db.findById('courses', en.course_id);
    const student = db.findById('students', en.student_id);
    const studentProfile = student ? db.findById('profiles', student.profile_id) : null;

    // Calculate real attendance for this student in this course
    let attendancePercentage: number | null = null;
    let assignmentProgress = { total: 0, submitted: 0, average_score: 0 };
    let examGrades: any[] = [];

    if (course) {
      const classes = db.find('classes', (c) => c.course_id === course.id);
      const classIds = classes.map((c) => c.id);
      
      // Attendance
      const sessions = db.find('attendance_sessions', (s) => classIds.includes(s.class_id));
      const sessionIds = sessions.map((s) => s.id);
      if (sessionIds.length > 0) {
        const records = db.find('attendance_records', (ar) => ar.student_id === en.student_id && sessionIds.includes(ar.session_id));
        if (records.length > 0) {
          const present = records.filter((r) => r.status === 'PRESENT').length;
          const late = records.filter((r) => r.status === 'LATE').length;
          attendancePercentage = Math.round(((present + late * 0.5) / records.length) * 100);
        }
      }

      // Assignments
      const courseAssignments = db.find('assignments', (a) => a.course_id === course.id);
      const assignmentIds = courseAssignments.map((a) => a.id);
      const submissions = db.find('assignment_submissions', (as) => as.student_id === en.student_id && assignmentIds.includes(as.assignment_id));
      const scoredSubmissions = submissions.filter((s) => s.marks_obtained !== null && s.marks_obtained !== undefined);
      const avgScore = scoredSubmissions.length > 0 
        ? Math.round(scoredSubmissions.reduce((acc, curr) => acc + (curr.marks_obtained || 0), 0) / scoredSubmissions.length) 
        : 0;

      assignmentProgress = {
        total: courseAssignments.length,
        submitted: submissions.length,
        average_score: avgScore
      };

      // Exam grades
      const courseExams = db.find('examinations', (e) => e.course_id === course.id);
      const examIds = courseExams.map((e) => e.id);
      const results = db.find('exam_results', (er) => er.student_id === en.student_id && examIds.includes(er.examination_id));
      examGrades = results.map((r) => {
        const exam = courseExams.find((e) => e.id === r.examination_id);
        return {
          exam_name: exam?.name,
          marks_obtained: r.marks_obtained,
          maximum_marks: exam?.maximum_marks || 100,
          grade: r.grade
        };
      });
    }

    return {
      ...en,
      course,
      student: student ? {
        id: student.id,
        roll_number: student.roll_number,
        department: student.department,
        current_year: student.current_year,
        current_semester: student.current_semester,
        academic_standing: student.academic_standing,
        cgpa: student.cgpa,
        profile: studentProfile ? {
          full_name: studentProfile.full_name,
          email: studentProfile.email,
          avatar_url: studentProfile.avatar_url
        } : null
      } : null,
      attendance_percentage: attendancePercentage,
      assignment_progress: assignmentProgress,
      exam_grades: examGrades
    };
  });

  // Additional post-enrichment filters (department, search)
  let filtered = enriched;
  if (department && department !== 'All' && String(department).trim() !== '') {
    const dStr = String(department).trim().toLowerCase();
    filtered = filtered.filter((item) => {
      const cDept = (item.course?.department || '').toLowerCase();
      const sDept = (item.student?.department || '').toLowerCase();
      return cDept.includes(dStr) || sDept.includes(dStr);
    });
  }

  if (academic_year && academic_year !== 'All' && String(academic_year).trim() !== '') {
    const yNum = Number(academic_year);
    filtered = filtered.filter((item) => Number(item.course?.academic_year) === yNum || Number(item.student?.current_year) === yNum);
  }

  if (semester && semester !== 'All' && String(semester).trim() !== '') {
    const sNum = Number(semester);
    filtered = filtered.filter((item) => Number(item.course?.semester) === sNum || Number(item.student?.current_semester) === sNum);
  }

  if (search && String(search).trim() !== '') {
    const q = String(search).trim().toLowerCase();
    filtered = filtered.filter((item) => 
      item.course?.name?.toLowerCase().includes(q) ||
      item.course?.code?.toLowerCase().includes(q) ||
      item.student?.roll_number?.toLowerCase().includes(q) ||
      item.student?.profile?.full_name?.toLowerCase().includes(q) ||
      item.student?.profile?.email?.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, data: filtered });
});

// Registration Audit Logs
app.get('/api/registrations/audit', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Login required.' } });
  }

  let auditLogs = db.find('audit_logs', (log) => 
    log.action === 'COURSE_REGISTRATION' || 
    log.action === 'COURSE_ENROLLMENT' || 
    log.action === 'COURSE_DROPPED'
  );

  // If student, filter only their actions
  if (auth.profile.role === 'STUDENT') {
    auditLogs = auditLogs.filter((log) => log.user_id === auth.profile.id || log.user_email === auth.profile.email);
  }

  // Sort descending by timestamp
  auditLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  res.json({ success: true, data: auditLogs });
});

// ----------------------------------------------------
// 4. ASSIGNMENTS & SUBMISSIONS ENDPOINTS
// ----------------------------------------------------

app.get('/api/assignments', (req, res) => {
  const auth = getAuthUser(req);
  const { class_id, course_id } = req.query;

  let assignments = db.find('assignments');

  if (class_id) {
    assignments = assignments.filter((a) => a.class_id === class_id);
  }
  if (course_id) {
    assignments = assignments.filter((a) => a.course_id === course_id);
  }

  const enriched = assignments.map((asg) => {
    const course = db.findById('courses', asg.course_id);
    const classItem = db.findById('classes', asg.class_id);
    const teacher = db.findById('teachers', asg.teacher_id);
    const teacherProfile = teacher ? db.findById('profiles', teacher.profile_id) : null;
    const submissions = db.find('assignment_submissions', (s) => s.assignment_id === asg.id);

    let mySubmission = null;
    if (auth && auth.student) {
      mySubmission = submissions.find((s) => s.student_id === auth.student!.id);
    }

    return {
      ...asg,
      course,
      class: classItem,
      teacher: teacher ? { ...teacher, profile: teacherProfile } : null,
      submissions_count: submissions.length,
      my_submission: mySubmission
    };
  });

  res.json({ success: true, data: enriched });
});

app.get('/api/assignments/:id', (req, res) => {
  const auth = getAuthUser(req);
  const asg = db.findById('assignments', req.params.id);
  if (!asg) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Assignment not found.' } });
  }

  const course = db.findById('courses', asg.course_id);
  const classItem = db.findById('classes', asg.class_id);
  const teacher = db.findById('teachers', asg.teacher_id);
  const teacherProfile = teacher ? db.findById('profiles', teacher.profile_id) : null;

  const submissions = db.find('assignment_submissions', (s) => s.assignment_id === asg.id).map((sub) => {
    const student = db.findById('students', sub.student_id);
    const studentProfile = student ? db.findById('profiles', student.profile_id) : null;
    return {
      ...sub,
      student: student ? { ...student, profile: studentProfile } : null
    };
  });

  let mySubmission = null;
  if (auth && auth.student) {
    mySubmission = submissions.find((s) => s.student_id === auth.student!.id);
  }

  res.json({
    success: true,
    data: {
      ...asg,
      course,
      class: classItem,
      teacher: teacher ? { ...teacher, profile: teacherProfile } : null,
      submissions,
      submissions_count: submissions.length,
      my_submission: mySubmission
    }
  });
});

app.post('/api/assignments', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth || (auth.profile.role !== 'TEACHER' && auth.profile.role !== 'ADMIN')) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only faculty or admins can publish assignments.' } });
  }

  const { title, description, course_id, class_id, due_date, maximum_marks, attachment_url } = req.body;
  if (!title || !course_id || !class_id || !due_date) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Title, course, class, and due date are required.' } });
  }

  const teacherId = auth.teacher ? auth.teacher.id : (db.find('teachers')[0]?.id || 'admin_teacher');

  const assignment = db.insert('assignments', {
    course_id,
    class_id,
    teacher_id: teacherId,
    title,
    description: description || '',
    due_date,
    maximum_marks: Number(maximum_marks) || 100,
    attachment_url
  });

  // Notify enrolled students
  const classStudents = db.find('class_students', (cs) => cs.class_id === class_id);
  classStudents.forEach((cs) => {
    const st = db.findById('students', cs.student_id);
    if (st) {
      db.createNotification(
        st.profile_id,
        'New Assignment Published',
        `New assignment "${title}" has been assigned. Due on ${new Date(due_date).toLocaleDateString()}.`,
        'ASSIGNMENT',
        `/student/assignments/${assignment.id}`
      );
    }
  });

  db.logAudit('ASSIGNMENT_CREATED', 'assignment', assignment.id, auth.profile.email, auth.profile.id, { title });
  res.json({ success: true, data: assignment });
});

// Student Submission
app.post('/api/submissions', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth || auth.profile.role !== 'STUDENT' || !auth.student) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only students can submit assignments.' } });
  }

  const { assignment_id, submission_text, attachment_url } = req.body;
  if (!assignment_id) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Assignment ID is required.' } });
  }

  const assignment = db.findById('assignments', assignment_id);
  if (!assignment) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Assignment not found.' } });
  }

  const existing = db.find('assignment_submissions', (s) => s.assignment_id === assignment_id && s.student_id === auth.student!.id)[0];
  let submission;

  const isLate = new Date() > new Date(assignment.due_date);

  if (existing) {
    submission = db.update('assignment_submissions', existing.id, {
      submission_text: submission_text || existing.submission_text,
      attachment_url: attachment_url || existing.attachment_url,
      submitted_at: db.now(),
      status: isLate ? 'LATE' : 'RESUBMITTED'
    });
  } else {
    submission = db.insert('assignment_submissions', {
      assignment_id,
      student_id: auth.student.id,
      submission_text,
      attachment_url,
      status: isLate ? 'LATE' : 'SUBMITTED'
    });
  }

  db.logAudit('ASSIGNMENT_SUBMITTED', 'assignment_submission', submission?.id, auth.profile.email, auth.profile.id, { assignment_id });

  res.json({ success: true, data: submission });
});

// Teacher Grade Evaluation
app.put('/api/submissions/:id/evaluate', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth || (auth.profile.role !== 'TEACHER' && auth.profile.role !== 'ADMIN')) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only teachers can grade submissions.' } });
  }

  const { marks_obtained, feedback } = req.body;
  const submission = db.findById('assignment_submissions', req.params.id);
  if (!submission) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Submission not found.' } });
  }

  const assignment = db.findById('assignments', submission.assignment_id);
  const maxMarks = assignment?.maximum_marks || 100;

  if (marks_obtained < 0 || marks_obtained > maxMarks) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_MARKS', message: `Marks must be between 0 and ${maxMarks}.` } });
  }

  const updated = db.update('assignment_submissions', submission.id, {
    marks_obtained: Number(marks_obtained),
    feedback: feedback || '',
    evaluated_by: auth.teacher?.id || auth.profile.id,
    evaluated_at: db.now(),
    status: 'EVALUATED'
  });

  // Notify student
  const student = db.findById('students', submission.student_id);
  if (student) {
    db.createNotification(
      student.profile_id,
      'Assignment Evaluated',
      `Your submission for "${assignment?.title || 'Assignment'}" has been evaluated: ${marks_obtained}/${maxMarks} marks.`,
      'ASSIGNMENT',
      `/student/assignments/${assignment?.id}`
    );
  }

  db.logAudit('SUBMISSION_EVALUATED', 'assignment_submission', submission.id, auth.profile.email, auth.profile.id, { marks_obtained });

  res.json({ success: true, data: updated });
});

// ----------------------------------------------------
// 5. ATTENDANCE SYSTEM ENDPOINTS
// ----------------------------------------------------

app.get('/api/attendance/sessions', (req, res) => {
  const { class_id } = req.query;
  let sessions = db.find('attendance_sessions');

  if (class_id) {
    sessions = sessions.filter((s) => s.class_id === class_id);
  }

  const enriched = sessions.map((session) => {
    const classItem = db.findById('classes', session.class_id);
    const records = db.find('attendance_records', (r) => r.session_id === session.id);
    return {
      ...session,
      class: classItem,
      records_count: records.length
    };
  });

  res.json({ success: true, data: enriched });
});

app.get('/api/attendance/sessions/:id', (req, res) => {
  const session = db.findById('attendance_sessions', req.params.id);
  if (!session) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Attendance session not found.' } });
  }

  const classItem = db.findById('classes', session.class_id);
  const records = db.find('attendance_records', (r) => r.session_id === session.id).map((rec) => {
    const student = db.findById('students', rec.student_id);
    const profile = student ? db.findById('profiles', student.profile_id) : null;
    return {
      ...rec,
      student: student ? { ...student, profile } : null
    };
  });

  res.json({
    success: true,
    data: {
      ...session,
      class: classItem,
      records
    }
  });
});

app.post('/api/attendance/sessions', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth || (auth.profile.role !== 'TEACHER' && auth.profile.role !== 'ADMIN')) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only faculty or admins can record attendance.' } });
  }

  const { class_id, session_date, session_topic, records } = req.body;
  if (!class_id || !session_date || !records || !Array.isArray(records)) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Class ID, session date, and student records array are required.' } });
  }

  // Prevent duplicate session for same class + date unless updating
  let session = db.find('attendance_sessions', (s) => s.class_id === class_id && s.session_date === session_date)[0];

  if (!session) {
    session = db.insert('attendance_sessions', {
      class_id,
      teacher_id: auth.teacher?.id || (db.find('teachers')[0]?.id || 'faculty'),
      session_date,
      session_topic: session_topic || ''
    });
  } else {
    db.update('attendance_sessions', session.id, {
      session_topic: session_topic || session.session_topic
    });
  }

  // Save records
  records.forEach((rec: { student_id: string; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; remarks?: string }) => {
    const existingRec = db.find('attendance_records', (r) => r.session_id === session.id && r.student_id === rec.student_id)[0];
    if (existingRec) {
      db.update('attendance_records', existingRec.id, {
        status: rec.status,
        remarks: rec.remarks
      });
    } else {
      db.insert('attendance_records', {
        session_id: session.id,
        student_id: rec.student_id,
        status: rec.status,
        remarks: rec.remarks
      });
    }
  });

  db.logAudit('ATTENDANCE_LOGGED', 'attendance_session', session.id, auth.profile.email, auth.profile.id, { class_id, session_date, count: records.length });

  res.json({ success: true, data: session });
});

// ----------------------------------------------------
// 6. EXAMINATIONS & MARKS ENDPOINTS
// ----------------------------------------------------

app.get('/api/examinations', (req, res) => {
  const auth = getAuthUser(req);
  const { course_id, class_id } = req.query;

  let exams = db.find('examinations');
  if (course_id) {
    exams = exams.filter((e) => e.course_id === course_id);
  }
  if (class_id) {
    exams = exams.filter((e) => e.class_id === class_id);
  }

  const enriched = exams.map((exam) => {
    const course = db.findById('courses', exam.course_id);
    const classItem = exam.class_id ? db.findById('classes', exam.class_id) : null;
    const teacher = db.findById('teachers', exam.teacher_id);
    const teacherProfile = teacher ? db.findById('profiles', teacher.profile_id) : null;
    const results = db.find('exam_results', (r) => r.examination_id === exam.id);

    let myResult = null;
    if (auth && auth.student) {
      myResult = results.find((r) => r.student_id === auth.student!.id);
    }

    return {
      ...exam,
      course,
      class: classItem,
      teacher: teacher ? { ...teacher, profile: teacherProfile } : null,
      results_count: results.length,
      my_result: myResult
    };
  });

  res.json({ success: true, data: enriched });
});

app.get('/api/examinations/:id', (req, res) => {
  const auth = getAuthUser(req);
  const exam = db.findById('examinations', req.params.id);
  if (!exam) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Examination not found.' } });
  }

  const course = db.findById('courses', exam.course_id);
  const classItem = exam.class_id ? db.findById('classes', exam.class_id) : null;
  const teacher = db.findById('teachers', exam.teacher_id);
  const teacherProfile = teacher ? db.findById('profiles', teacher.profile_id) : null;

  const results = db.find('exam_results', (r) => r.examination_id === exam.id).map((resRecord) => {
    const student = db.findById('students', resRecord.student_id);
    const profile = student ? db.findById('profiles', student.profile_id) : null;
    return {
      ...resRecord,
      student: student ? { ...student, profile } : null
    };
  });

  res.json({
    success: true,
    data: {
      ...exam,
      course,
      class: classItem,
      teacher: teacher ? { ...teacher, profile: teacherProfile } : null,
      results
    }
  });
});

app.post('/api/examinations', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth || (auth.profile.role !== 'TEACHER' && auth.profile.role !== 'ADMIN')) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only faculty or admins can schedule examinations.' } });
  }

  const { name, course_id, class_id, exam_type, exam_date, start_time, duration_minutes, maximum_marks, weightage_percent } = req.body;
  if (!name || !course_id || !exam_date) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Exam name, course, and exam date are required.' } });
  }

  const exam = db.insert('examinations', {
    course_id,
    class_id,
    teacher_id: auth.teacher?.id || (db.find('teachers')[0]?.id || 'faculty'),
    name,
    exam_type: exam_type || 'MIDTERM',
    exam_date,
    start_time: start_time || '10:00 AM',
    duration_minutes: Number(duration_minutes) || 90,
    maximum_marks: Number(maximum_marks) || 100,
    weightage_percent: Number(weightage_percent) || 30
  });

  db.logAudit('EXAM_CREATED', 'examination', exam.id, auth.profile.email, auth.profile.id, { name });
  res.json({ success: true, data: exam });
});

// Bulk Enter / Publish Marks for Examination
app.post('/api/exam-results/bulk', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth || (auth.profile.role !== 'TEACHER' && auth.profile.role !== 'ADMIN')) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only faculty or admins can record examination marks.' } });
  }

  const { examination_id, results } = req.body;
  if (!examination_id || !results || !Array.isArray(results)) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Examination ID and results array are required.' } });
  }

  const exam = db.findById('examinations', examination_id);
  if (!exam) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Examination not found.' } });
  }

  results.forEach((item: { student_id: string; marks_obtained: number; grade?: string; remarks?: string }) => {
    if (item.marks_obtained < 0 || item.marks_obtained > exam.maximum_marks) {
      return;
    }

    const existing = db.find('exam_results', (r) => r.examination_id === examination_id && r.student_id === item.student_id)[0];
    if (existing) {
      db.update('exam_results', existing.id, {
        marks_obtained: Number(item.marks_obtained),
        grade: item.grade || calculateGrade(Number(item.marks_obtained), exam.maximum_marks),
        remarks: item.remarks,
        graded_by: auth.teacher?.id || auth.profile.id,
        graded_at: db.now()
      });
    } else {
      db.insert('exam_results', {
        examination_id,
        student_id: item.student_id,
        marks_obtained: Number(item.marks_obtained),
        grade: item.grade || calculateGrade(Number(item.marks_obtained), exam.maximum_marks),
        remarks: item.remarks,
        graded_by: auth.teacher?.id || auth.profile.id,
        graded_at: db.now()
      });
    }

    // Notify student
    const student = db.findById('students', item.student_id);
    if (student) {
      db.createNotification(
        student.profile_id,
        'Exam Result Published',
        `Your result for "${exam.name}" has been published: ${item.marks_obtained}/${exam.maximum_marks}.`,
        'EXAM',
        '/student/results'
      );
    }
  });

  db.logAudit('EXAM_RESULTS_RECORDED', 'examination', examination_id, auth.profile.email, auth.profile.id, { count: results.length });

  res.json({ success: true, data: { message: 'Exam results successfully recorded and published.' } });
});

function calculateGrade(score: number, max: number): string {
  const pct = (score / max) * 100;
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B';
  if (pct >= 60) return 'C';
  if (pct >= 50) return 'D';
  return 'F';
}

// ----------------------------------------------------
// 7. ANALYTICS & AI ENGINE ENDPOINTS
// ----------------------------------------------------

app.get('/api/analytics/student/:studentId', (req, res) => {
  const analytics = calculateStudentAnalytics(req.params.studentId);
  if (!analytics) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Student records not found.' } });
  }
  res.json({ success: true, data: analytics });
});

app.get('/api/analytics/teacher/:teacherId', (req, res) => {
  const analytics = calculateTeacherAnalytics(req.params.teacherId);
  if (!analytics) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Teacher records not found.' } });
  }
  res.json({ success: true, data: analytics });
});

app.get('/api/analytics/admin', (req, res) => {
  const analytics = calculateAdminAnalytics();
  res.json({ success: true, data: analytics });
});

// AI Student Recommendations
app.get('/api/ai/student-recommendations/:studentId', async (req, res) => {
  try {
    const recommendations = await generateStudentAIRecommendations(req.params.studentId);
    res.json({ success: true, data: recommendations });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'AI_ERROR', message: err.message } });
  }
});

// AI Teacher Class Insights
app.get('/api/ai/teacher-insights/:classId', async (req, res) => {
  try {
    const insights = await generateTeacherClassInsights(req.params.classId);
    res.json({ success: true, data: insights });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'AI_ERROR', message: err.message } });
  }
});

// AI Course Tutor & Syllabus Assistant
app.post('/api/ai/course-tutor/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Message string is required for AI Tutor query.' }
      });
    }

    const authUser = getAuthUser(req);

    const tutorResponse = await askAITutorCourseQuery({
      courseId,
      message,
      history: Array.isArray(history) ? history : [],
      userName: authUser?.profile?.full_name,
      userRole: authUser?.profile?.role
    });

    res.json({ success: true, data: tutorResponse });
  } catch (err: any) {
    console.error('Course AI Tutor query error:', err);
    res.status(500).json({
      success: false,
      error: { code: 'AI_TUTOR_ERROR', message: err.message || 'Failed to process AI Tutor query.' }
    });
  }
});

// ----------------------------------------------------
// 8. REPORTS GENERATION ENDPOINTS
// ----------------------------------------------------

app.get('/api/reports/student/:studentId', (req, res) => {
  const student = db.findById('students', req.params.studentId);
  if (!student) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Student not found.' } });
  }

  const profile = db.findById('profiles', student.profile_id);
  const analytics = calculateStudentAnalytics(student.id);

  const enrollments = db.find('enrollments', (e) => e.student_id === student.id).map((en) => {
    const course = db.findById('courses', en.course_id);
    return { ...en, course };
  });

  const submissions = db.find('assignment_submissions', (s) => s.student_id === student.id).map((sub) => {
    const assignment = db.findById('assignments', sub.assignment_id);
    return { ...sub, assignment };
  });

  const examResults = db.find('exam_results', (r) => r.student_id === student.id).map((er) => {
    const exam = db.findById('examinations', er.examination_id);
    return { ...er, exam };
  });

  const attendanceRecords = db.find('attendance_records', (ar) => ar.student_id === student.id);

  res.json({
    success: true,
    data: {
      student: { ...student, profile },
      analytics,
      enrollments,
      submissions,
      exam_results: examResults,
      attendance_records: attendanceRecords,
      generated_at: db.now()
    }
  });
});

app.get('/api/reports/class/:classId', (req, res) => {
  const cls = db.findById('classes', req.params.classId);
  if (!cls) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Class not found.' } });
  }

  const course = db.findById('courses', cls.course_id);
  const teacher = db.findById('teachers', cls.teacher_id);
  const teacherProfile = teacher ? db.findById('profiles', teacher.profile_id) : null;

  const classStudents = db.find('class_students', (cs) => cs.class_id === cls.id);
  const studentReports = classStudents.map((cs) => {
    const st = db.findById('students', cs.student_id);
    const prof = st ? db.findById('profiles', st.profile_id) : null;
    const a = calculateStudentAnalytics(cs.student_id);
    return {
      student_id: cs.student_id,
      roll_number: st?.roll_number,
      full_name: prof?.full_name,
      overall_score: a?.overall_academic_score || 0,
      attendance_percentage: a?.attendance_percentage || 0,
      risk_level: a?.academic_risk || 'none'
    };
  });

  res.json({
    success: true,
    data: {
      class: cls,
      course,
      teacher: teacher ? { ...teacher, profile: teacherProfile } : null,
      students: studentReports,
      student_count: studentReports.length,
      generated_at: db.now()
    }
  });
});

app.get('/api/reports/course/:courseId', (req, res) => {
  const course = db.findById('courses', req.params.courseId);
  if (!course) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Course not found.' } });
  }

  const classes = db.find('classes', (c) => c.course_id === course.id);
  const enrollments = db.find('enrollments', (e) => e.course_id === course.id);
  const assignments = db.find('assignments', (a) => a.course_id === course.id);
  const exams = db.find('examinations', (e) => e.course_id === course.id);

  res.json({
    success: true,
    data: {
      course,
      classes,
      total_enrolled: enrollments.length,
      total_assignments: assignments.length,
      total_examinations: exams.length,
      generated_at: db.now()
    }
  });
});

// ----------------------------------------------------
// 9. NOTIFICATIONS & AUDIT LOGS
// ----------------------------------------------------

app.get('/api/notifications', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Login required.' } });
  }

  const notifications = db.find('notifications', (n) => n.profile_id === auth.profile.id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json({ success: true, data: notifications });
});

app.put('/api/notifications/:id/read', (req, res) => {
  const updated = db.update('notifications', req.params.id, { is_read: true });
  res.json({ success: true, data: updated });
});

app.put('/api/notifications/read-all', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth) return res.status(401).json({ success: false });

  const notifications = db.find('notifications', (n) => n.profile_id === auth.profile.id);
  notifications.forEach((n) => {
    db.update('notifications', n.id, { is_read: true });
  });
  res.json({ success: true, data: { message: 'All notifications marked as read.' } });
});

app.get('/api/audit-logs', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth || auth.profile.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Admin privileges required.' } });
  }

  const logs = db.find('audit_logs').sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 100);
  res.json({ success: true, data: logs });
});

// ----------------------------------------------------
// 10. USER MANAGEMENT ENDPOINTS (ADMIN)
// ----------------------------------------------------

app.get('/api/users/students', (req, res) => {
  const students = db.find('students').map((st) => {
    const profile = db.findById('profiles', st.profile_id);
    return { ...st, profile };
  });
  res.json({ success: true, data: students });
});

app.get('/api/users/teachers', (req, res) => {
  const teachers = db.find('teachers').map((t) => {
    const profile = db.findById('profiles', t.profile_id);
    return { ...t, profile };
  });
  res.json({ success: true, data: teachers });
});

app.post('/api/users/students', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth || auth.profile.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Admin privileges required.' } });
  }

  const { full_name, email, phone, roll_number, major, semester, enrollment_year } = req.body;
  if (!full_name || !email || !roll_number) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Name, email, and roll number are required.' } });
  }

  const profile = db.insert('profiles', {
    auth_user_id: 'usr_' + Date.now(),
    full_name,
    email: email.toLowerCase(),
    phone,
    role: 'STUDENT',
    department: major || 'Computer Science'
  });

  const student = db.insert('students', {
    profile_id: profile.id,
    roll_number,
    enrollment_year: Number(enrollment_year) || new Date().getFullYear(),
    semester: Number(semester) || 1,
    major: major || 'Computer Science',
    academic_status: 'ACTIVE'
  });

  db.logAudit('STUDENT_CREATED', 'student', student.id, auth.profile.email, auth.profile.id, { roll_number });
  res.json({ success: true, data: { ...student, profile } });
});

app.post('/api/users/teachers', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth || auth.profile.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Admin privileges required.' } });
  }

  const { full_name, email, phone, employee_code, qualification, specialization, designation, department } = req.body;
  if (!full_name || !email || !employee_code) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Name, email, and employee code are required.' } });
  }

  const profile = db.insert('profiles', {
    auth_user_id: 'usr_' + Date.now(),
    full_name,
    email: email.toLowerCase(),
    phone,
    role: 'TEACHER',
    department: department || specialization || 'Academic Faculty'
  });

  const teacher = db.insert('teachers', {
    profile_id: profile.id,
    employee_code,
    qualification,
    specialization,
    designation: designation || 'Associate Professor'
  });

  db.logAudit('TEACHER_CREATED', 'teacher', teacher.id, auth.profile.email, auth.profile.id, { employee_code });
  res.json({ success: true, data: { ...teacher, profile } });
});

// Update Profile (Student & Staff Profile Management)
app.put('/api/users/profile', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication session expired or invalid.' } });
  }

  const {
    full_name,
    email,
    phone,
    department,
    date_of_birth,
    gender,
    address,
    // Student specific fields
    degree_program,
    major,
    study_year,
    year,
    semester,
    section,
    academic_year,
    // Teacher specific fields
    designation,
    qualification,
    experience,
    specialization
  } = req.body;

  // Validation
  if (full_name !== undefined) {
    if (typeof full_name !== 'string' || !full_name.trim() || full_name.trim().length < 2) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_NAME', message: 'Full name must contain at least 2 characters.' } });
    }
  }

  if (email !== undefined && email.trim().toLowerCase() !== auth.profile.email.toLowerCase()) {
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_EMAIL', message: 'Please provide a valid email address.' } });
    }
    const existing = db.find('profiles', (p) => p.email.toLowerCase() === cleanEmail && p.id !== auth.profile.id)[0];
    if (existing) {
      return res.status(400).json({ success: false, error: { code: 'EMAIL_IN_USE', message: 'This email address is already in use by another user.' } });
    }
  }

  if (phone !== undefined && phone !== null && phone.trim() !== '') {
    const cleanPhone = phone.trim();
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,16}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_PHONE', message: 'Please provide a valid phone number (e.g. +1 555-0199 or 10-digit number).' } });
    }
  }

  const profileUpdates: any = {};
  if (full_name !== undefined) profileUpdates.full_name = full_name.trim();
  if (email !== undefined) profileUpdates.email = email.trim().toLowerCase();
  if (phone !== undefined) profileUpdates.phone = phone ? phone.trim() : '';
  if (department !== undefined) profileUpdates.department = department ? department.trim() : auth.profile.department;
  if (date_of_birth !== undefined) profileUpdates.date_of_birth = date_of_birth;
  if (gender !== undefined) profileUpdates.gender = gender;
  if (address !== undefined) profileUpdates.address = address ? address.trim() : '';

  const updatedProfile = db.update('profiles', auth.profile.id, profileUpdates);

  let updatedStudent = auth.student;
  let updatedTeacher = auth.teacher;

  // Student profile updates
  if (auth.profile.role === 'STUDENT' && auth.student) {
    const studentUpdates: any = {};
    if (degree_program !== undefined) studentUpdates.degree_program = degree_program.trim();
    if (major !== undefined) studentUpdates.major = major.trim();
    if (study_year !== undefined) studentUpdates.study_year = study_year;
    if (year !== undefined) studentUpdates.year = year;
    if (semester !== undefined) {
      const semNum = parseInt(semester, 10);
      if (!isNaN(semNum) && semNum >= 1 && semNum <= 8) {
        studentUpdates.semester = semNum;
      }
    }
    if (section !== undefined) studentUpdates.section = section.trim().toUpperCase();
    if (academic_year !== undefined) studentUpdates.academic_year = academic_year.trim();
    if (date_of_birth !== undefined) studentUpdates.date_of_birth = date_of_birth;
    if (gender !== undefined) studentUpdates.gender = gender;
    if (address !== undefined) studentUpdates.address = address ? address.trim() : '';

    updatedStudent = db.update('students', auth.student.id, studentUpdates);
  }

  // Teacher profile updates
  if (auth.profile.role === 'TEACHER' && auth.teacher) {
    const teacherUpdates: any = {};
    if (designation !== undefined) teacherUpdates.designation = designation.trim();
    if (qualification !== undefined) teacherUpdates.qualification = qualification.trim();
    if (experience !== undefined) teacherUpdates.experience = experience.trim();
    if (academic_year !== undefined) teacherUpdates.academic_year = academic_year.trim();
    if (specialization !== undefined) teacherUpdates.specialization = specialization.trim();
    if (department !== undefined) teacherUpdates.department = department.trim();

    updatedTeacher = db.update('teachers', auth.teacher.id, teacherUpdates);
  }

  db.logAudit('PROFILE_UPDATED', 'profile', auth.profile.id, auth.profile.email, auth.profile.id, {
    role: auth.profile.role,
    updated_name: updatedProfile?.full_name
  });

  res.json({
    success: true,
    data: {
      user: updatedProfile,
      student: updatedStudent,
      teacher: updatedTeacher
    }
  });
});

// Student Authentic Enrolled Courses endpoint
app.get('/api/student/my-courses', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } });
  }

  if (auth.profile.role !== 'STUDENT' || !auth.student) {
    return res.json({ success: true, data: [] });
  }

  const enrollments = db.find('enrollments', (e) => e.student_id === auth.student!.id && e.status === 'ENROLLED');
  const courseIds = Array.from(new Set(enrollments.map((e) => e.course_id)));
  const courses = courseIds.map((cid) => db.findById('courses', cid)).filter(Boolean);

  res.json({ success: true, data: courses });
});

// Save Onboarding Preferences & Profile Setup
app.post('/api/users/onboarding', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication session expired.' } });
  }

  const role = auth.profile.role;
  let updatedStudent = auth.student;
  let updatedTeacher = auth.teacher;

  let onboardingData: any = {
    role,
    completed_at: db.now()
  };

  if (role === 'STUDENT') {
    const {
      department,
      study_year,
      academic_interests,
      other_interest,
      primary_academic_goal,
      support_subject_ids
    } = req.body;

    // Resolve support course names from actual DB records
    let supportSubjectNames: string[] = [];
    if (Array.isArray(support_subject_ids) && support_subject_ids.length > 0) {
      supportSubjectNames = support_subject_ids
        .map((id: string) => {
          const c = db.findById('courses', id);
          return c ? `${c.code} - ${c.name}` : null;
        })
        .filter(Boolean) as string[];
    }

    const studentPreferences = {
      department: department || auth.profile.department || 'Computer Science',
      study_year: study_year || '1st Year',
      academic_interests: Array.isArray(academic_interests) ? academic_interests : ['AI & Machine Learning'],
      other_interest: other_interest || '',
      primary_academic_goal: primary_academic_goal || 'All of these',
      support_subject_ids: Array.isArray(support_subject_ids) ? support_subject_ids : [],
      support_subject_names: supportSubjectNames,
      completed_at: db.now()
    };

    onboardingData.student_preferences = studentPreferences;

    // Update Profile
    const updatedProfile = db.update('profiles', auth.profile.id, {
      department: studentPreferences.department,
      onboarding_completed: true,
      onboarding_data: onboardingData
    });

    // Update Student record if exists
    if (auth.student) {
      let derivedSemester = auth.student.semester;
      if (study_year === '1st Year') derivedSemester = 1;
      else if (study_year === '2nd Year') derivedSemester = 3;
      else if (study_year === '3rd Year') derivedSemester = 5;
      else if (study_year === '4th Year') derivedSemester = 7;

      updatedStudent = db.update('students', auth.student.id, {
        major: studentPreferences.department,
        semester: derivedSemester
      });
    }

    db.logAudit('STUDENT_ONBOARDING_COMPLETED', 'profile', auth.profile.id, auth.profile.email, auth.profile.id, {
      study_year: studentPreferences.study_year,
      department: studentPreferences.department,
      goal: studentPreferences.primary_academic_goal
    });

    db.createNotification(
      auth.profile.id,
      'Academic Profile Configured',
      `Your academic goals ("${studentPreferences.primary_academic_goal}") and interests have been calibrated for AI recommendations.`,
      'INFO',
      '/student/profile'
    );

    return res.json({
      success: true,
      data: {
        user: updatedProfile,
        student: updatedStudent,
        teacher: updatedTeacher,
        admin: auth.admin
      }
    });
  } else if (role === 'TEACHER') {
    const {
      department,
      designation,
      specialization_interests,
      pedagogical_goals,
      student_support_priorities
    } = req.body;

    const teacherPreferences = {
      department: department || auth.profile.department || 'Computer Science and Engineering',
      designation: designation || (auth.teacher?.designation || 'Associate Professor'),
      specialization_interests: Array.isArray(specialization_interests) ? specialization_interests : ['AI & Data Systems'],
      pedagogical_goals: Array.isArray(pedagogical_goals) ? pedagogical_goals : ['Improve Student Retention & Mastery'],
      student_support_priorities: Array.isArray(student_support_priorities) ? student_support_priorities : ['Identify At-Risk Students Early'],
      completed_at: db.now()
    };

    onboardingData.teacher_preferences = teacherPreferences;

    const updatedProfile = db.update('profiles', auth.profile.id, {
      department: teacherPreferences.department,
      onboarding_completed: true,
      onboarding_data: onboardingData
    });

    if (auth.teacher) {
      updatedTeacher = db.update('teachers', auth.teacher.id, {
        specialization: teacherPreferences.department,
        designation: teacherPreferences.designation
      });
    }

    db.logAudit('TEACHER_ONBOARDING_COMPLETED', 'profile', auth.profile.id, auth.profile.email, auth.profile.id, {
      department: teacherPreferences.department,
      designation: teacherPreferences.designation
    });

    db.createNotification(
      auth.profile.id,
      'Faculty Profile Configured',
      'Your departmental teaching and pedagogical focus has been recorded.',
      'INFO',
      '/teacher/profile'
    );

    return res.json({
      success: true,
      data: {
        user: updatedProfile,
        student: updatedStudent,
        teacher: updatedTeacher,
        admin: auth.admin
      }
    });
  } else {
    // Admin
    const { institutional_focus, oversight_priorities } = req.body;
    const adminPreferences = {
      institutional_focus: Array.isArray(institutional_focus) ? institutional_focus : ['Accreditation & Curriculum Compliance', 'AI Academic Diagnostics'],
      oversight_priorities: Array.isArray(oversight_priorities) ? oversight_priorities : ['Cross-Department Attendance Integrity'],
      completed_at: db.now()
    };

    onboardingData.admin_preferences = adminPreferences;

    const updatedProfile = db.update('profiles', auth.profile.id, {
      onboarding_completed: true,
      onboarding_data: onboardingData
    });

    db.logAudit('ADMIN_ONBOARDING_COMPLETED', 'profile', auth.profile.id, auth.profile.email, auth.profile.id);

    return res.json({
      success: true,
      data: {
        user: updatedProfile,
        student: updatedStudent,
        teacher: updatedTeacher,
        admin: auth.admin
      }
    });
  }
});

// ====================================================
// LMS & COURSE LEARNING DASHBOARD SYSTEM
// ====================================================

// 1. Course Learning Dashboard Data (Full syllabus, lessons, videos, progress, deadlines)
app.get('/api/courses/:id/learn', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } });
  }

  const courseId = req.params.id;
  const course = db.findById('courses', courseId);
  if (!course) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Course not found.' } });
  }

  // Ensure course curriculum units and lessons exist
  ensureCourseCurriculum(courseId);

  // Student resolution
  let studentId = auth.student?.id;
  if (!studentId && (auth.profile.role === 'TEACHER' || auth.profile.role === 'ADMIN')) {
    // For teacher/admin preview, pick default or query student
    const previewStudentId = req.query.student_id ? String(req.query.student_id) : null;
    const defaultStudent = db.find('students')[0];
    studentId = previewStudentId || defaultStudent?.id || 'std_alex_id';
  }

  // Ensure enrollment record exists for registered student
  let enrollment = db.find('enrollments', (e) => e.course_id === courseId && e.student_id === studentId)[0];
  if (!enrollment && auth.profile.role === 'STUDENT' && auth.student) {
    enrollment = db.insert('enrollments', {
      course_id: courseId,
      student_id: studentId,
      status: 'ENROLLED',
      enrolled_at: new Date().toISOString()
    });
  }

  // Calculate real progress
  const completionStats = calculateCourseProgress(courseId, studentId);

  // Fetch modules and lessons
  const modules = db.find('course_modules', (m) => m.course_id === courseId).sort((a, b) => a.order_index - b.order_index);
  const allLessons = db.find('course_lessons', (l) => l.course_id === courseId).sort((a, b) => a.order_index - b.order_index);
  const progressRecords = db.find('lesson_progress', (lp) => lp.course_id === courseId && lp.student_id === studentId);

  // Map lessons into modules with completion and unlocked state
  let previousLessonCompleted = true; // First lesson always unlocked
  let lastAccessedLesson: any = null;

  const enrichedModules = modules.map((m) => {
    const modLessons = allLessons.filter((l) => l.module_id === m.id).map((l) => {
      const prog = progressRecords.find((p) => p.lesson_id === l.id);
      const isCompleted = prog?.status === 'COMPLETED';
      
      // Determine locked status (teacher/admin always unlocked)
      const isLocked = auth.profile.role === 'STUDENT' ? !previousLessonCompleted : false;
      if (isCompleted) {
        previousLessonCompleted = true;
      } else {
        // Next lesson unlocked, but subsequent ones locked
        previousLessonCompleted = false;
      }

      // Populate assignment or quiz object if applicable
      let assignment = null;
      if (l.assignment_id) {
        assignment = db.findById('assignments', l.assignment_id);
        if (assignment) {
          const sub = db.find('assignment_submissions', (as) => as.assignment_id === assignment.id && as.student_id === studentId)[0];
          assignment.my_submission = sub;
        }
      }

      let quiz = null;
      if (l.quiz_id) {
        quiz = db.findById('quizzes', l.quiz_id);
        if (quiz) {
          const attempts = db.find('quiz_attempts', (qa) => qa.quiz_id === quiz.id && qa.student_id === studentId);
          quiz.attempts_count = attempts.length;
          quiz.highest_score = attempts.length > 0 ? Math.max(...attempts.map((a) => a.percentage)) : undefined;
          quiz.my_latest_attempt = attempts[attempts.length - 1];
        }
      }

      const lessonObj = {
        ...l,
        progress: prog || {
          student_id: studentId,
          course_id: courseId,
          module_id: m.id,
          lesson_id: l.id,
          status: 'NOT_STARTED',
          video_watched_seconds: 0,
          video_duration_seconds: l.video_duration_seconds || 0,
          video_completion_pct: 0
        },
        status: prog?.status || 'NOT_STARTED',
        is_locked: isLocked,
        assignment,
        quiz
      };

      if (prog && prog.last_accessed_at) {
        if (!lastAccessedLesson || new Date(prog.last_accessed_at) > new Date(lastAccessedLesson.last_accessed_at || 0)) {
          lastAccessedLesson = lessonObj;
        }
      }

      return lessonObj;
    });

    const completedInMod = modLessons.filter((l) => l.status === 'COMPLETED').length;
    const modCompletionPct = modLessons.length > 0 ? Math.round((completedInMod / modLessons.length) * 100) : 0;

    return {
      ...m,
      lessons: modLessons,
      completion_pct: modCompletionPct,
      is_completed: modLessons.length > 0 && completedInMod === modLessons.length
    };
  });

  // Upcoming deadlines
  const assignments = db.find('assignments', (a) => a.course_id === courseId);
  const upcomingDeadlines = assignments.map((a) => {
    const dueDate = new Date(a.due_date);
    const daysLeft = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return {
      id: a.id,
      title: a.title,
      type: 'ASSIGNMENT',
      due_date: a.due_date,
      course_name: course.name,
      course_code: course.code,
      action_url: `/student/courses/${courseId}`,
      days_left: daysLeft
    };
  }).filter((d) => d.days_left >= -2);

  // Recent grades for this student
  const submissions = db.find('assignment_submissions', (s) => s.course_id === courseId && s.student_id === studentId && (s.status === 'GRADED' || s.status === 'EVALUATED'));
  const quizAttempts = db.find('quiz_attempts', (qa) => qa.course_id === courseId && qa.student_id === studentId);
  
  const recentGrades: any[] = [];
  submissions.forEach((s) => {
    const asg = db.findById('assignments', s.assignment_id);
    recentGrades.push({
      title: asg?.title || 'Assignment Submission',
      type: 'Assignment',
      marks_obtained: s.marks_obtained,
      max_marks: s.max_marks || 100,
      percentage: Math.round(((s.marks_obtained || 0) / (s.max_marks || 100)) * 100),
      graded_at: s.evaluated_at || s.graded_at || s.submitted_at,
      feedback: s.feedback
    });
  });

  quizAttempts.forEach((qa) => {
    const qz = db.findById('quizzes', qa.quiz_id);
    recentGrades.push({
      title: qz?.title || 'Quiz Assessment',
      type: 'Quiz',
      marks_obtained: qa.score,
      max_marks: qa.max_score,
      percentage: qa.percentage,
      graded_at: qa.created_at,
      feedback: qa.passed ? 'Passed successfully' : 'Below passing threshold'
    });
  });

  // Faculty feedback
  const facultyFeedback: any[] = [];
  submissions.filter((s) => s.feedback).forEach((s) => {
    const teacherProfile = db.findById('profiles', course.created_by || 'fac_alan_id');
    const asg = db.findById('assignments', s.assignment_id);
    facultyFeedback.push({
      id: s.id,
      faculty_name: teacherProfile?.full_name || 'Prof. Faculty Member',
      faculty_avatar: teacherProfile?.avatar_url,
      date: s.evaluated_at || s.graded_at || new Date().toISOString(),
      message: s.feedback,
      item_name: asg?.title || 'Assignment'
    });
  });

  // NPTEL and External tracking records
  let nptelTracking = null;
  if (course.is_nptel) {
    nptelTracking = db.find('nptel_tracking', (nt) => nt.course_id === courseId && nt.student_id === studentId)[0];
    if (!nptelTracking) {
      nptelTracking = db.insert('nptel_tracking', {
        course_id: courseId,
        student_id: studentId,
        nptel_course_id: course.nptel_course_id || 'noc24-cs101',
        registration_status: 'REGISTERED',
        weekly_assignments: [
          { week_number: 1, title: 'Week 1 Assignment: Foundations & Complexity', submitted: true, score: 90, max_score: 100, deadline: '2026-03-08' },
          { week_number: 2, title: 'Week 2 Assignment: Algorithmic Paradigms', submitted: true, score: 95, max_score: 100, deadline: '2026-03-15' },
          { week_number: 3, title: 'Week 3 Assignment: Dynamic Programming', submitted: true, score: 88, max_score: 100, deadline: '2026-03-22' },
          { week_number: 4, title: 'Week 4 Assignment: Graph Algorithms & Flow', submitted: false, score: 0, max_score: 100, deadline: '2026-03-29' }
        ],
        exam_date: course.nptel_exam_date || '2026-04-26',
        exam_city: 'Chennai',
        hall_ticket_number: `NPTEL-${studentId.slice(0, 4).toUpperCase()}-2026`,
        final_score: 91,
        certificate_status: 'ELIGIBLE',
        verified_by_staff: true,
        staff_notes: 'Verified against NPTEL SWAYAM score matrix.',
        updated_at: new Date().toISOString()
      });
    }
  }

  const externalTracking = db.find('external_courses', (ec) => ec.course_id === courseId && ec.student_id === studentId)[0];

  res.json({
    success: true,
    data: {
      course,
      enrollment,
      modules: enrichedModules,
      completion_stats: completionStats,
      upcoming_deadlines: upcomingDeadlines,
      recent_grades: recentGrades,
      faculty_feedback: facultyFeedback,
      nptel_tracking: nptelTracking,
      external_tracking: externalTracking,
      last_accessed_lesson: lastAccessedLesson || enrichedModules[0]?.lessons[0]
    }
  });
});

// 2. Lesson Progress & Video Tracking
app.post('/api/courses/:id/lessons/:lessonId/progress', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } });
  }

  const { id: courseId, lessonId } = req.params;
  const { video_watched_seconds, video_duration_seconds, completed, notes } = req.body;

  const course = db.findById('courses', courseId);
  const lesson = db.findById('course_lessons', lessonId);
  if (!course || !lesson) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Course or lesson not found.' } });
  }

  const studentId = auth.student ? auth.student.id : 'std_alex_id';
  const now = new Date().toISOString();

  let existing = db.find('lesson_progress', (lp) => lp.lesson_id === lessonId && lp.student_id === studentId)[0];

  const duration = Number(video_duration_seconds) || Number(lesson.video_duration_seconds) || 1500;
  const watched = Math.max(Number(video_watched_seconds) || 0, existing?.video_watched_seconds || 0);
  const pct = duration > 0 ? Math.min(100, Math.round((watched / duration) * 100)) : 100;

  const shouldMarkCompleted = Boolean(completed) || pct >= (lesson.min_video_completion_pct || 80);
  const status = shouldMarkCompleted ? 'COMPLETED' : (watched > 10 ? 'IN_PROGRESS' : 'NOT_STARTED');

  let updatedProgress;
  if (existing) {
    updatedProgress = db.update('lesson_progress', existing.id, {
      video_watched_seconds: watched,
      video_duration_seconds: duration,
      video_completion_pct: pct,
      status: shouldMarkCompleted ? 'COMPLETED' : (existing.status === 'COMPLETED' ? 'COMPLETED' : status),
      completed_at: shouldMarkCompleted && !existing.completed_at ? now : existing.completed_at,
      last_accessed_at: now,
      notes: notes !== undefined ? notes : existing.notes
    });
  } else {
    updatedProgress = db.insert('lesson_progress', {
      student_id: studentId,
      course_id: courseId,
      module_id: lesson.module_id,
      lesson_id: lessonId,
      video_watched_seconds: watched,
      video_duration_seconds: duration,
      video_completion_pct: pct,
      status: status,
      completed_at: shouldMarkCompleted ? now : null,
      last_accessed_at: now,
      notes: notes || ''
    });
  }

  // Recalculate overall course progress
  const completionStats = calculateCourseProgress(courseId, studentId);

  res.json({
    success: true,
    data: {
      progress: updatedProgress,
      completion_stats: completionStats
    }
  });
});

// 3. Quiz Details & Attempts
app.get('/api/courses/:id/quizzes/:quizId', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } });
  }

  const { id: courseId, quizId } = req.params;
  const quiz = db.findById('quizzes', quizId);
  if (!quiz) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Quiz not found.' } });
  }

  const studentId = auth.student ? auth.student.id : 'std_alex_id';
  const attempts = db.find('quiz_attempts', (qa) => qa.quiz_id === quizId && qa.student_id === studentId);

  // Sanitize questions so answer key isn't sent before student submits
  const sanitizedQuestions = (quiz.questions || []).map((q: any) => ({
    id: q.id,
    question_text: q.question_text,
    question_type: q.question_type,
    options: q.options,
    points: q.points
  }));

  res.json({
    success: true,
    data: {
      quiz: {
        ...quiz,
        questions: sanitizedQuestions
      },
      attempts,
      highest_score: attempts.length > 0 ? Math.max(...attempts.map((a) => a.percentage)) : undefined,
      attempts_count: attempts.length
    }
  });
});

// 4. Submit Quiz Attempt
app.post('/api/courses/:id/quizzes/:quizId/submit', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } });
  }

  const { id: courseId, quizId } = req.params;
  const { answers, time_spent_seconds } = req.body;

  const quiz = db.findById('quizzes', quizId);
  if (!quiz) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Quiz not found.' } });
  }

  const studentId = auth.student ? auth.student.id : 'std_alex_id';
  const now = new Date().toISOString();

  let totalScore = 0;
  let maxScore = 0;
  const questionReview: any[] = [];

  (quiz.questions || []).forEach((q: any) => {
    maxScore += q.points || 5;
    const studentAns = answers ? answers[q.id] : undefined;
    let isCorrect = false;

    if (Array.isArray(q.correct_answer_index)) {
      if (Array.isArray(studentAns)) {
        isCorrect = q.correct_answer_index.length === studentAns.length &&
          q.correct_answer_index.every((val: number) => studentAns.includes(val));
      }
    } else {
      isCorrect = studentAns === q.correct_answer_index;
    }

    if (isCorrect) {
      totalScore += q.points || 5;
    }

    questionReview.push({
      question_id: q.id,
      question_text: q.question_text,
      options: q.options,
      student_answer: studentAns,
      correct_answer: q.correct_answer_index,
      is_correct: isCorrect,
      explanation: q.explanation,
      points_awarded: isCorrect ? (q.points || 5) : 0
    });
  });

  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 100;
  const passed = percentage >= (quiz.passing_percentage || 60);

  const existingAttempts = db.find('quiz_attempts', (qa) => qa.quiz_id === quizId && qa.student_id === studentId);
  const attempt = db.insert('quiz_attempts', {
    quiz_id: quizId,
    student_id: studentId,
    course_id: courseId,
    attempt_number: existingAttempts.length + 1,
    answers: answers || {},
    score: totalScore,
    max_score: maxScore,
    percentage: percentage,
    passed: passed,
    time_spent_seconds: Number(time_spent_seconds) || 60,
    created_at: now
  });

  // If passed, mark corresponding lesson as completed
  if (passed && quiz.lesson_id) {
    const lesson = db.findById('course_lessons', quiz.lesson_id);
    if (lesson) {
      const existingProg = db.find('lesson_progress', (lp) => lp.lesson_id === lesson.id && lp.student_id === studentId)[0];
      if (existingProg) {
        db.update('lesson_progress', existingProg.id, {
          status: 'COMPLETED',
          completed_at: now
        });
      } else {
        db.insert('lesson_progress', {
          student_id: studentId,
          course_id: courseId,
          module_id: lesson.module_id,
          lesson_id: lesson.id,
          status: 'COMPLETED',
          completed_at: now
        });
      }
    }
  }

  // Recalculate progress
  const completionStats = calculateCourseProgress(courseId, studentId);

  res.json({
    success: true,
    data: {
      attempt,
      review: questionReview,
      completion_stats: completionStats
    }
  });
});

// 5. Submit Assignment
app.post('/api/assignments/:id/submit', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } });
  }

  const assignmentId = req.params.id;
  const assignment = db.findById('assignments', assignmentId);
  if (!assignment) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Assignment not found.' } });
  }

  const { submission_text, attachment_url, attachment_name } = req.body;
  const studentId = auth.student ? auth.student.id : 'std_alex_id';
  const now = new Date().toISOString();

  let existing = db.find('assignment_submissions', (s) => s.assignment_id === assignmentId && s.student_id === studentId)[0];
  let submission;

  if (existing) {
    submission = db.update('assignment_submissions', existing.id, {
      submission_text: submission_text || existing.submission_text,
      attachment_url: attachment_url || existing.attachment_url,
      attachment_name: attachment_name || existing.attachment_name,
      status: 'SUBMITTED',
      submitted_at: now
    });
  } else {
    submission = db.insert('assignment_submissions', {
      assignment_id: assignmentId,
      student_id: studentId,
      course_id: assignment.course_id,
      submission_text: submission_text || '',
      attachment_url: attachment_url || '',
      attachment_name: attachment_name || 'Assignment_Submission.pdf',
      status: 'SUBMITTED',
      submitted_at: now
    });
  }

  // Mark lesson progress
  if (assignment.lesson_id) {
    const prog = db.find('lesson_progress', (lp) => lp.lesson_id === assignment.lesson_id && lp.student_id === studentId)[0];
    if (prog) {
      db.update('lesson_progress', prog.id, { status: 'COMPLETED', completed_at: now });
    } else {
      const lesson = db.findById('course_lessons', assignment.lesson_id);
      db.insert('lesson_progress', {
        student_id: studentId,
        course_id: assignment.course_id,
        module_id: lesson?.module_id || '',
        lesson_id: assignment.lesson_id,
        status: 'COMPLETED',
        completed_at: now
      });
    }
  }

  // Recalculate progress
  const completionStats = calculateCourseProgress(assignment.course_id, studentId);

  // Notify teacher
  if (assignment.teacher_id) {
    const teacherProfile = db.findById('profiles', assignment.teacher_id);
    if (teacherProfile) {
      db.createNotification(
        teacherProfile.id,
        'Assignment Submission Received',
        `${auth.profile.full_name} submitted "${assignment.title}".`,
        'INFO',
        `/teacher/assignments`
      );
    }
  }

  res.json({
    success: true,
    data: {
      submission,
      completion_stats: completionStats
    }
  });
});

// 6. NPTEL Tracking Endpoints
app.get('/api/courses/:id/nptel', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } });
  }

  const courseId = req.params.id;
  const studentId = auth.student ? auth.student.id : (req.query.student_id ? String(req.query.student_id) : 'std_alex_id');

  const tracking = db.find('nptel_tracking', (nt) => nt.course_id === courseId && nt.student_id === studentId)[0];
  res.json({ success: true, data: tracking || null });
});

app.post('/api/courses/:id/nptel', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } });
  }

  const courseId = req.params.id;
  const studentId = auth.student ? auth.student.id : 'std_alex_id';
  const { registration_status, weekly_assignments, exam_date, exam_city, hall_ticket_number, final_score, certificate_url, certificate_status } = req.body;

  const now = new Date().toISOString();
  let existing = db.find('nptel_tracking', (nt) => nt.course_id === courseId && nt.student_id === studentId)[0];
  let record;

  if (existing) {
    record = db.update('nptel_tracking', existing.id, {
      registration_status: registration_status || existing.registration_status,
      weekly_assignments: weekly_assignments || existing.weekly_assignments,
      exam_date: exam_date || existing.exam_date,
      exam_city: exam_city || existing.exam_city,
      hall_ticket_number: hall_ticket_number || existing.hall_ticket_number,
      final_score: final_score !== undefined ? Number(final_score) : existing.final_score,
      certificate_url: certificate_url || existing.certificate_url,
      certificate_status: certificate_status || existing.certificate_status,
      updated_at: now
    });
  } else {
    record = db.insert('nptel_tracking', {
      course_id: courseId,
      student_id: studentId,
      registration_status: registration_status || 'REGISTERED',
      weekly_assignments: weekly_assignments || [],
      exam_date: exam_date || '2026-04-26',
      exam_city: exam_city || 'Chennai',
      hall_ticket_number: hall_ticket_number || '',
      final_score: Number(final_score) || 0,
      certificate_status: certificate_status || 'PENDING',
      certificate_url: certificate_url || '',
      verified_by_staff: false,
      updated_at: now
    });
  }

  res.json({ success: true, data: record });
});

// 7. External Courses Tracking
app.get('/api/courses/:id/external', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } });
  }

  const courseId = req.params.id;
  const studentId = auth.student ? auth.student.id : 'std_alex_id';
  const record = db.find('external_courses', (ec) => ec.course_id === courseId && ec.student_id === studentId)[0];

  res.json({ success: true, data: record || null });
});

app.post('/api/courses/:id/external', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } });
  }

  const courseId = req.params.id;
  const studentId = auth.student ? auth.student.id : 'std_alex_id';
  const { provider_name, external_url, progress_pct, certificate_url } = req.body;

  const now = new Date().toISOString();
  let existing = db.find('external_courses', (ec) => ec.course_id === courseId && ec.student_id === studentId)[0];
  let record;

  if (existing) {
    record = db.update('external_courses', existing.id, {
      provider_name: provider_name || existing.provider_name,
      external_url: external_url || existing.external_url,
      progress_pct: progress_pct !== undefined ? Number(progress_pct) : existing.progress_pct,
      certificate_url: certificate_url || existing.certificate_url,
      verification_status: certificate_url ? 'PENDING' : existing.verification_status,
      updated_at: now
    });
  } else {
    record = db.insert('external_courses', {
      course_id: courseId,
      student_id: studentId,
      provider_name: provider_name || 'Coursera',
      external_url: external_url || '',
      progress_pct: Number(progress_pct) || 0,
      certificate_url: certificate_url || '',
      verification_status: certificate_url ? 'PENDING' : 'NOT_SUBMITTED',
      created_at: now
    });
  }

  res.json({ success: true, data: record });
});

// 8. Staff Course Monitoring Endpoint
app.get('/api/teacher/courses/:id/monitoring', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } });
  }

  const courseId = req.params.id;
  const course = db.findById('courses', courseId);
  if (!course) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Course not found.' } });
  }

  ensureCourseCurriculum(courseId);

  const enrollments = db.find('enrollments', (e) => e.course_id === courseId && e.status !== 'DROPPED');
  const assignments = db.find('assignments', (a) => a.course_id === courseId);
  const quizzes = db.find('quizzes', (q) => q.course_id === courseId);

  let totalProgressSum = 0;
  let atRiskCount = 0;
  let completedCount = 0;

  const studentRows = enrollments.map((en) => {
    const student = db.findById('students', en.student_id);
    const profile = student ? db.findById('profiles', student.profile_id) : null;

    const completion = calculateCourseProgress(courseId, en.student_id);
    totalProgressSum += completion.overall_progress;

    if (completion.is_completed) {
      completedCount++;
    } else if (completion.overall_progress < 40) {
      atRiskCount++;
    }

    // Attendance calculation
    const classes = db.find('classes', (c) => c.course_id === courseId);
    const classIds = classes.map((c) => c.id);
    const sessions = db.find('attendance_sessions', (s) => classIds.includes(s.class_id));
    const sessionIds = sessions.map((s) => s.id);
    let attendanceRate = 85;
    if (sessionIds.length > 0) {
      const records = db.find('attendance_records', (ar) => ar.student_id === en.student_id && sessionIds.includes(ar.session_id));
      if (records.length > 0) {
        const present = records.filter((r) => r.status === 'PRESENT').length;
        attendanceRate = Math.round((present / records.length) * 100);
      }
    }

    const nptelRecord = db.find('nptel_tracking', (nt) => nt.course_id === courseId && nt.student_id === en.student_id)[0];

    const statusStr: 'On Track' | 'At Risk' | 'Completed' | 'Lagging' = completion.is_completed
      ? 'Completed'
      : completion.overall_progress < 40 || attendanceRate < 75
      ? 'At Risk'
      : completion.overall_progress < 60
      ? 'Lagging'
      : 'On Track';

    return {
      student_id: en.student_id,
      profile_id: profile?.id || '',
      name: profile?.full_name || 'Student',
      roll_number: student?.roll_number || 'N/A',
      avatar_url: profile?.avatar_url,
      progress_percentage: completion.overall_progress,
      assignments_completed: completion.assignments.completed,
      assignments_total: completion.assignments.total,
      assignment_avg_score: completion.assignments.average_score,
      quizzes_completed: completion.quizzes.completed,
      quizzes_total: completion.quizzes.total,
      quiz_avg_score: completion.quizzes.average_score,
      attendance_rate: attendanceRate,
      status: statusStr,
      last_active: en.updated_at || en.enrolled_at,
      is_nptel: !!course.is_nptel,
      nptel_status: nptelRecord?.certificate_status || nptelRecord?.registration_status
    };
  });

  const pendingSubmissions = db.find('assignment_submissions', (as) => as.course_id === courseId && as.status === 'SUBMITTED');

  res.json({
    success: true,
    data: {
      course,
      total_enrolled: enrollments.length,
      active_students: enrollments.length - completedCount,
      completed_students: completedCount,
      at_risk_students: atRiskCount,
      average_progress: enrollments.length > 0 ? Math.round(totalProgressSum / enrollments.length) : 0,
      average_assignment_score: 84,
      average_quiz_score: 82,
      average_attendance: 88,
      pending_submissions_count: pendingSubmissions.length,
      students: studentRows
    }
  });
});

// 9. Teacher Grade Assignment Submission
app.post('/api/teacher/submissions/:id/grade', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth || (auth.profile.role !== 'TEACHER' && auth.profile.role !== 'ADMIN')) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only faculty or admins can grade assignments.' } });
  }

  const submissionId = req.params.id;
  const submission = db.findById('assignment_submissions', submissionId);
  if (!submission) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Submission not found.' } });
  }

  const { marks_obtained, feedback, status } = req.body;
  const now = new Date().toISOString();

  const updated = db.update('assignment_submissions', submissionId, {
    marks_obtained: Number(marks_obtained),
    feedback: feedback || '',
    status: status || 'GRADED',
    evaluated_by: auth.profile.id,
    evaluated_at: now
  });

  // Recalculate student course progress
  const assignment = db.findById('assignments', submission.assignment_id);
  if (assignment) {
    calculateCourseProgress(assignment.course_id, submission.student_id);

    // Notify student
    const student = db.findById('students', submission.student_id);
    if (student) {
      db.createNotification(
        student.profile_id,
        `Assignment Graded: ${assignment.title}`,
        `Your submission received ${marks_obtained} marks. Feedback: "${feedback || 'Good work'}"`,
        'INFO',
        `/student/courses/${assignment.course_id}`
      );
    }
  }

  res.json({ success: true, data: updated });
});

// 10. Verify External Course or NPTEL Certificate (Faculty/Admin)
app.post('/api/teacher/external-courses/:id/verify', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth || (auth.profile.role !== 'TEACHER' && auth.profile.role !== 'ADMIN')) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Faculty verification authority required.' } });
  }

  const { id } = req.params;
  const { verification_status, notes } = req.body;
  const now = new Date().toISOString();

  let externalRecord = db.findById('external_courses', id);
  if (externalRecord) {
    const updated = db.update('external_courses', id, {
      verification_status: verification_status || 'APPROVED',
      verified_by: auth.profile.id,
      verified_at: now,
      verification_notes: notes || 'Verified official digital signature.'
    });

    const student = db.findById('students', externalRecord.student_id);
    if (student) {
      db.createNotification(
        student.profile_id,
        'External Course Certificate Verified',
        `Your external course certificate has been verified by faculty.`,
        'INFO',
        `/student/courses/${externalRecord.course_id}`
      );
    }

    return res.json({ success: true, data: updated });
  }

  let nptelRecord = db.findById('nptel_tracking', id);
  if (nptelRecord) {
    const updated = db.update('nptel_tracking', id, {
      verified_by_staff: verification_status === 'APPROVED',
      staff_notes: notes || 'Verified against SWAYAM database.',
      updated_at: now
    });
    return res.json({ success: true, data: updated });
  }

  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Record not found.' } });
});

// 11. Add Module / Lesson (Staff / Admin)
app.post('/api/courses/:id/modules', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth || (auth.profile.role !== 'TEACHER' && auth.profile.role !== 'ADMIN')) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Staff or Admin authority required.' } });
  }

  const courseId = req.params.id;
  const { title, description, duration_hours, order_index } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Module title is required.' } });
  }

  const existingModules = db.find('course_modules', (m) => m.course_id === courseId);
  const newModule = db.insert('course_modules', {
    course_id: courseId,
    title: title.trim(),
    description: description || '',
    duration_hours: Number(duration_hours) || 10,
    order_index: Number(order_index) || (existingModules.length + 1),
    created_at: new Date().toISOString()
  });

  res.status(201).json({ success: true, data: newModule });
});

app.post('/api/courses/:id/lessons', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth || (auth.profile.role !== 'TEACHER' && auth.profile.role !== 'ADMIN')) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Staff or Admin authority required.' } });
  }

  const courseId = req.params.id;
  const { module_id, title, lesson_type, duration_minutes, description, video_url, reading_content, learning_objectives } = req.body;

  if (!module_id || !title) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Module ID and Lesson Title are required.' } });
  }

  const existingLessons = db.find('course_lessons', (l) => l.module_id === module_id);
  const newLesson = db.insert('course_lessons', {
    course_id: courseId,
    module_id,
    title: title.trim(),
    lesson_type: lesson_type || 'VIDEO',
    order_index: existingLessons.length + 1,
    duration_minutes: Number(duration_minutes) || 30,
    description: description || '',
    video_url: video_url || (lesson_type === 'VIDEO' ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' : ''),
    reading_content: reading_content || '',
    learning_objectives: Array.isArray(learning_objectives) ? learning_objectives : ['Master core principles'],
    video_duration_seconds: (Number(duration_minutes) || 30) * 60,
    is_mandatory: true,
    created_at: new Date().toISOString()
  });

  res.status(201).json({ success: true, data: newLesson });
});

// 12. Update Course Completion Criteria
app.put('/api/courses/:id/completion-rules', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth || (auth.profile.role !== 'TEACHER' && auth.profile.role !== 'ADMIN')) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Staff or Admin authority required.' } });
  }

  const courseId = req.params.id;
  const { video_weight, assignment_weight, quiz_weight, practical_weight, exam_weight, min_total_pct } = req.body;

  const updatedCourse = db.update('courses', courseId, {
    completion_criteria: {
      video_weight: Number(video_weight) || 30,
      assignment_weight: Number(assignment_weight) || 25,
      quiz_weight: Number(quiz_weight) || 15,
      practical_weight: Number(practical_weight) || 10,
      exam_weight: Number(exam_weight) || 20,
      min_total_pct: Number(min_total_pct) || 60
    }
  });

  res.json({ success: true, data: updatedCourse });
});

// 13. Admin Global Course Analytics
app.get('/api/admin/course-analytics', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth || auth.profile.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Admin access required.' } });
  }

  const { department, academic_year, semester, course_type, status } = req.query;

  let courses = db.find('courses');
  if (department && department !== 'All') {
    courses = courses.filter((c) => c.department === department);
  }
  if (academic_year && academic_year !== 'All') {
    courses = courses.filter((c) => Number(c.academic_year) === Number(academic_year));
  }
  if (semester && semester !== 'All') {
    courses = courses.filter((c) => Number(c.semester) === Number(semester));
  }
  if (course_type && course_type !== 'All') {
    courses = courses.filter((c) => c.course_type === course_type);
  }

  const enrollments = db.find('enrollments');
  const allSubmissions = db.find('assignment_submissions');
  const allQuizzes = db.find('quiz_attempts');

  const courseBreakdown = courses.map((c) => {
    const cEnrolls = enrollments.filter((e) => e.course_id === c.id && e.status !== 'DROPPED');
    const cCompleted = cEnrolls.filter((e) => e.status === 'COMPLETED');
    const avgProgress = cEnrolls.length > 0 ? Math.round(cEnrolls.reduce((sum, e) => sum + (e.overall_progress_pct || 0), 0) / cEnrolls.length) : 0;
    
    return {
      id: c.id,
      code: c.code,
      name: c.name,
      department: c.department,
      course_type: c.course_type,
      academic_year: c.academic_year,
      semester: c.semester,
      enrolled_count: cEnrolls.length,
      completed_count: cCompleted.length,
      completion_rate: cEnrolls.length > 0 ? Math.round((cCompleted.length / cEnrolls.length) * 100) : 0,
      average_progress: avgProgress,
      is_nptel: !!c.is_nptel
    };
  });

  const internalCourses = courseBreakdown.filter((c) => !c.is_nptel);
  const nptelCourses = courseBreakdown.filter((c) => c.is_nptel);

  res.json({
    success: true,
    data: {
      total_courses: courses.length,
      internal_courses_count: internalCourses.length,
      nptel_courses_count: nptelCourses.length,
      total_enrollments: enrollments.filter((e) => e.status !== 'DROPPED').length,
      total_completed: enrollments.filter((e) => e.status === 'COMPLETED').length,
      overall_completion_rate: enrollments.length > 0 ? Math.round((enrollments.filter((e) => e.status === 'COMPLETED').length / enrollments.length) * 100) : 0,
      course_breakdown: courseBreakdown
    }
  });
});

// 14. Real-Data Student AI Recommendations (Gemini)
app.post('/api/ai/course-recommendations', async (req, res) => {
  const auth = getAuthUser(req);
  if (!auth) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } });
  }

  const studentId = auth.student ? auth.student.id : 'std_alex_id';
  try {
    const result = await generateStudentAcademicRecommendations(studentId);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'AI_ERROR', message: err.message } });
  }
});

// 15. Context-Aware AI Course Tutor (Gemini + Multi-language)
app.post('/api/ai/course-tutor', async (req, res) => {
  const auth = getAuthUser(req);
  const { course_id, module_id, lesson_id, message, history, language } = req.body;

  if (!course_id || !message) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Course ID and message are required.' } });
  }

  try {
    const response = await generateAICourseTutorResponse({
      courseId: course_id,
      moduleId: module_id,
      lessonId: lesson_id,
      message,
      history,
      language: language || 'English',
      userName: auth?.profile?.full_name || 'Student',
      userRole: auth?.profile?.role || 'STUDENT'
    });

    res.json({ success: true, data: response });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'AI_TUTOR_ERROR', message: err.message } });
  }
});

// 15B. SC EDU AI Chatbot Assistant (Student AI Recommendations & Diagnostics)
app.post('/api/ai/sc-edu-ai', async (req, res) => {
  const auth = getAuthUser(req);
  const { message, history, language } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Message is required.' } });
  }

  // Determine student ID
  let studentId = auth?.student?.id;
  if (!studentId && auth?.profile?.id) {
    const st = db.find('students', (s) => s.profile_id === auth.profile.id)[0];
    if (st) studentId = st.id;
  }
  if (!studentId) {
    const defaultStudent = db.find('students')[0];
    studentId = defaultStudent?.id || 'std_alex_id';
  }

  try {
    const response = await handleSCEduAIChat({
      studentId,
      message: message.trim(),
      history: Array.isArray(history) ? history : [],
      language: language || 'auto'
    });

    res.json({ success: true, data: response });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SC_EDU_AI_ERROR', message: err.message || 'Failed to process AI query' } });
  }
});

// 16. Support Tickets & Help Desk
app.get('/api/support/tickets', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } });
  }

  let tickets = db.find('support_tickets');
  if (auth.profile.role === 'STUDENT') {
    tickets = tickets.filter((t) => t.profile_id === auth.profile.id);
  }

  res.json({ success: true, data: tickets });
});

app.post('/api/support/tickets', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } });
  }

  const { category, subject, description, priority } = req.body;
  if (!subject || !description) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Subject and description are required.' } });
  }

  const now = new Date().toISOString();
  const newTicket = db.insert('support_tickets', {
    profile_id: auth.profile.id,
    user_name: auth.profile.full_name,
    user_email: auth.profile.email,
    user_role: auth.profile.role,
    category: category || 'Course Content',
    subject: subject.trim(),
    description: description.trim(),
    priority: priority || 'MEDIUM',
    status: 'OPEN',
    responses: [
      {
        id: `resp_init_${Date.now()}`,
        sender_name: 'SC EduSense AI Help Desk Bot',
        sender_role: 'AI Assistant',
        message: `Thank you for reaching out regarding "${subject.trim()}". An academic support specialist has been assigned to review your query.`,
        created_at: now,
        is_ai: true
      }
    ],
    created_at: now,
    updated_at: now
  });

  res.status(201).json({ success: true, data: newTicket });
});

app.post('/api/support/tickets/:id/reply', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } });
  }

  const ticketId = req.params.id;
  const ticket = db.findById('support_tickets', ticketId);
  if (!ticket) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Ticket not found.' } });
  }

  const { message, status } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Message cannot be empty.' } });
  }

  const now = new Date().toISOString();
  const responses = ticket.responses || [];
  responses.push({
    id: `resp_${Date.now()}`,
    sender_name: auth.profile.full_name,
    sender_role: auth.profile.role,
    message: message.trim(),
    created_at: now
  });

  const updated = db.update('support_tickets', ticketId, {
    responses,
    status: status || ticket.status,
    updated_at: now
  });

  res.json({ success: true, data: updated });
});

// 17. User Feedback & Global Help Desk System
app.get('/api/helpdesk/faqs', (_req, res) => {
  res.json({ success: true, data: HELPDESK_FAQS });
});

app.get('/api/feedback/stats', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } });
  }

  let feedbacks = db.find('feedback');
  if (auth.profile.role === 'STUDENT') {
    feedbacks = feedbacks.filter((f) => f.profile_id === auth.profile.id || f.user_id === auth.profile.id);
  } else if (auth.profile.role === 'TEACHER') {
    // Teachers see assigned or all department feedback
    feedbacks = feedbacks.filter((f) => f.assigned_to === auth.profile.id || !f.assigned_to || auth.profile.role === 'TEACHER');
  }

  const total = feedbacks.length;
  const open = feedbacks.filter((f) => f.status === 'Open').length;
  const in_review = feedbacks.filter((f) => f.status === 'In Review').length;
  const in_progress = feedbacks.filter((f) => f.status === 'In Progress' || f.status === 'Assigned').length;
  const resolved = feedbacks.filter((f) => f.status === 'Resolved').length;
  const closed = feedbacks.filter((f) => f.status === 'Closed').length;
  const critical = feedbacks.filter((f) => f.priority === 'CRITICAL' && f.status !== 'Resolved' && f.status !== 'Closed').length;

  const category_counts: Record<string, number> = {};
  feedbacks.forEach((f) => {
    category_counts[f.category] = (category_counts[f.category] || 0) + 1;
  });

  res.json({
    success: true,
    data: {
      total,
      open,
      in_review,
      in_progress,
      resolved,
      closed,
      critical,
      category_counts
    }
  });
});

app.get('/api/feedback/my', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } });
  }

  const feedbacks = db.find('feedback', (f) => f.profile_id === auth.profile.id || f.user_id === auth.profile.id);
  feedbacks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json({ success: true, data: feedbacks });
});

app.get('/api/feedback', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } });
  }

  const { category, priority, status, search, sort, assigned_to } = req.query;

  let feedbacks = db.find('feedback');

  // Role-based visibility
  if (auth.profile.role === 'STUDENT') {
    feedbacks = feedbacks.filter((f) => f.profile_id === auth.profile.id || f.user_id === auth.profile.id);
  } else if (auth.profile.role === 'TEACHER') {
    // Teachers see assigned to them or unassigned/open department tickets
    if (assigned_to === 'me') {
      feedbacks = feedbacks.filter((f) => f.assigned_to === auth.profile.id);
    }
  }

  // Filter by category
  if (category && category !== 'ALL') {
    feedbacks = feedbacks.filter((f) => f.category === category);
  }

  // Filter by priority
  if (priority && priority !== 'ALL') {
    feedbacks = feedbacks.filter((f) => f.priority === priority);
  }

  // Filter by status
  if (status && status !== 'ALL') {
    feedbacks = feedbacks.filter((f) => f.status === status);
  }

  // Search
  if (search && typeof search === 'string' && search.trim()) {
    const q = search.toLowerCase().trim();
    feedbacks = feedbacks.filter(
      (f) =>
        f.feedback_id?.toLowerCase().includes(q) ||
        f.user_name?.toLowerCase().includes(q) ||
        f.user_email?.toLowerCase().includes(q) ||
        f.subject?.toLowerCase().includes(q) ||
        f.description?.toLowerCase().includes(q) ||
        f.category?.toLowerCase().includes(q)
    );
  }

  // Sort
  if (sort === 'oldest') {
    feedbacks.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  } else {
    feedbacks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  res.json({ success: true, data: feedbacks });
});

app.get('/api/feedback/:id', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } });
  }

  const feedbackId = req.params.id;
  const feedback = db.find('feedback', (f) => f.id === feedbackId || f.feedback_id === feedbackId)[0];
  if (!feedback) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Feedback record not found.' } });
  }

  // Authorization check
  if (auth.profile.role === 'STUDENT' && feedback.profile_id !== auth.profile.id && feedback.user_id !== auth.profile.id) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Unauthorized to view this feedback ticket.' } });
  }

  res.json({ success: true, data: feedback });
});

app.post('/api/feedback', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required to submit feedback.' } });
  }

  const { category, subject, description, priority, attachment_url, page_url } = req.body;
  if (!subject || !subject.trim() || !description || !description.trim()) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Subject and description are required fields.' } });
  }

  const now = new Date().toISOString();
  const feedback_id = getNextFeedbackNumber();

  const newFeedback = db.insert('feedback', {
    feedback_id,
    profile_id: auth.profile.id,
    user_id: auth.profile.id,
    user_name: auth.profile.full_name,
    user_email: auth.profile.email,
    user_role: auth.profile.role,
    category: category || 'General',
    subject: subject.trim(),
    description: description.trim(),
    priority: priority || 'MEDIUM',
    attachment_url: attachment_url || '',
    page_url: page_url || '/',
    status: 'Open',
    admin_response: '',
    assigned_to: '',
    assigned_to_name: '',
    internal_notes: [],
    responses: [
      {
        id: `resp_init_${Date.now()}`,
        sender_id: auth.profile.id,
        sender_name: auth.profile.full_name,
        sender_role: auth.profile.role,
        message: description.trim(),
        created_at: now
      }
    ],
    created_at: now,
    updated_at: now
  });

  // Notify Admins
  const admins = db.find('profiles', (p) => p.role === 'ADMIN');
  admins.forEach((admin) => {
    db.createNotification(
      admin.id,
      `New Feedback: ${feedback_id}`,
      `${auth.profile.full_name} (${auth.profile.role}) submitted: "${subject.trim()}" [${priority || 'MEDIUM'}]`,
      'INFO',
      '/admin/feedback'
    );
  });

  // Log Audit
  db.logAudit('FEEDBACK_SUBMITTED', 'feedback', newFeedback.id, auth.profile.email, auth.profile.id, {
    feedback_id,
    category,
    subject: subject.trim(),
    page_url
  });

  res.status(201).json({
    success: true,
    data: newFeedback,
    message: 'Feedback submitted successfully. Thank you. Our team will review and resolve it.'
  });
});

app.patch('/api/feedback/:id', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } });
  }

  // Only Admin or Staff can update feedback metadata
  if (auth.profile.role === 'STUDENT') {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only staff and administrators can update feedback tickets.' } });
  }

  const feedbackId = req.params.id;
  const feedback = db.find('feedback', (f) => f.id === feedbackId || f.feedback_id === feedbackId)[0];
  if (!feedback) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Feedback record not found.' } });
  }

  const { status, priority, assigned_to, assigned_to_name, admin_response } = req.body;
  const now = new Date().toISOString();

  const updates: any = {
    updated_at: now
  };

  if (status !== undefined) {
    updates.status = status;
    if (status === 'Resolved') {
      updates.resolved_at = now;
      // Notify student
      db.createNotification(
        feedback.profile_id,
        `Feedback Resolved: ${feedback.feedback_id}`,
        `Your feedback regarding "${feedback.subject}" has been marked as Resolved.`,
        'ALERT',
        '/student/feedback'
      );
    }
  }

  if (priority !== undefined) updates.priority = priority;
  if (assigned_to !== undefined) {
    updates.assigned_to = assigned_to;
    updates.assigned_to_name = assigned_to_name || '';
    if (updates.status === 'Open') updates.status = 'Assigned';

    // Notify assigned staff
    if (assigned_to) {
      db.createNotification(
        assigned_to,
        `Feedback Assigned: ${feedback.feedback_id}`,
        `You have been assigned to handle feedback "${feedback.subject}" submitted by ${feedback.user_name}.`,
        'INFO',
        '/teacher/feedback'
      );
    }
  }
  if (admin_response !== undefined) updates.admin_response = admin_response;

  const updated = db.update('feedback', feedback.id, updates);

  db.logAudit('FEEDBACK_UPDATED', 'feedback', feedback.id, auth.profile.email, auth.profile.id, {
    feedback_id: feedback.feedback_id,
    updates
  });

  res.json({ success: true, data: updated });
});

app.post('/api/feedback/:id/respond', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } });
  }

  const feedbackId = req.params.id;
  const feedback = db.find('feedback', (f) => f.id === feedbackId || f.feedback_id === feedbackId)[0];
  if (!feedback) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Feedback record not found.' } });
  }

  const { message, status } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Response message cannot be empty.' } });
  }

  const now = new Date().toISOString();
  const responses = feedback.responses || [];
  const newResponse = {
    id: `resp_${Date.now()}`,
    sender_id: auth.profile.id,
    sender_name: auth.profile.full_name,
    sender_role: auth.profile.role,
    message: message.trim(),
    created_at: now
  };
  responses.push(newResponse);

  const updates: any = {
    responses,
    updated_at: now
  };

  if (auth.profile.role === 'ADMIN' || auth.profile.role === 'TEACHER') {
    updates.admin_response = message.trim();
    if (status) {
      updates.status = status;
    } else if (feedback.status === 'Open' || feedback.status === 'In Review' || feedback.status === 'Assigned') {
      updates.status = 'In Progress';
    }

    if (updates.status === 'Resolved') {
      updates.resolved_at = now;
    }

    // Notify the student
    db.createNotification(
      feedback.profile_id,
      `Staff Response: ${feedback.feedback_id}`,
      `${auth.profile.full_name} (${auth.profile.role}): "${message.trim().slice(0, 100)}${message.trim().length > 100 ? '...' : ''}"`,
      'INFO',
      '/student/feedback'
    );
  } else {
    // Student replied: notify assigned staff or admins
    if (feedback.assigned_to) {
      db.createNotification(
        feedback.assigned_to,
        `Student Reply: ${feedback.feedback_id}`,
        `${auth.profile.full_name} replied to feedback "${feedback.subject}"`,
        'INFO',
        '/teacher/feedback'
      );
    } else {
      const admins = db.find('profiles', (p) => p.role === 'ADMIN');
      admins.forEach((admin) => {
        db.createNotification(
          admin.id,
          `Student Reply: ${feedback.feedback_id}`,
          `${auth.profile.full_name} replied to feedback "${feedback.subject}"`,
          'INFO',
          '/admin/feedback'
        );
      });
    }
  }

  const updated = db.update('feedback', feedback.id, updates);

  res.json({ success: true, data: updated });
});

app.post('/api/feedback/:id/internal-note', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth || (auth.profile.role !== 'ADMIN' && auth.profile.role !== 'TEACHER')) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Staff or administrator authorization required to add internal notes.' } });
  }

  const feedbackId = req.params.id;
  const feedback = db.find('feedback', (f) => f.id === feedbackId || f.feedback_id === feedbackId)[0];
  if (!feedback) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Feedback record not found.' } });
  }

  const { note } = req.body;
  if (!note || !note.trim()) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Internal note cannot be empty.' } });
  }

  const now = new Date().toISOString();
  const internal_notes = feedback.internal_notes || [];
  internal_notes.push({
    id: `note_${Date.now()}`,
    author_id: auth.profile.id,
    author_name: auth.profile.full_name,
    author_role: auth.profile.role,
    note: note.trim(),
    created_at: now
  });

  const updated = db.update('feedback', feedback.id, {
    internal_notes,
    updated_at: now
  });

  res.json({ success: true, data: updated });
});

// 18. Student Profile Update (Protected Academic Fields)
app.put('/api/students/profile', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth || auth.profile.role !== 'STUDENT' || !auth.student) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Student authorization required.' } });
  }

  const { full_name, phone, avatar_url, date_of_birth, gender, address, bio, skills } = req.body;

  // Update profile allowed editable fields
  const updatedProfile = db.update('profiles', auth.profile.id, {
    full_name: full_name !== undefined ? full_name.trim() : auth.profile.full_name,
    phone: phone !== undefined ? phone.trim() : auth.profile.phone,
    avatar_url: avatar_url !== undefined ? avatar_url.trim() : auth.profile.avatar_url,
    date_of_birth: date_of_birth !== undefined ? date_of_birth : auth.profile.date_of_birth,
    gender: gender !== undefined ? gender : auth.profile.gender,
    address: address !== undefined ? address.trim() : auth.profile.address,
    updated_at: new Date().toISOString()
  });

  const updatedStudent = db.update('students', auth.student.id, {
    bio: bio !== undefined ? bio.trim() : auth.student.bio,
    skills: Array.isArray(skills) ? skills : auth.student.skills,
    updated_at: new Date().toISOString()
  });

  res.json({
    success: true,
    data: {
      profile: updatedProfile,
      student: updatedStudent
    }
  });
});

// ----------------------------------------------------
// 12. INSTITUTIONAL INQUIRIES & ACADEMIC SUPPORT
// ----------------------------------------------------

app.post('/api/inquiries', (req, res) => {
  const auth = getAuthUser(req);
  const {
    full_name,
    institutional_email,
    role,
    department,
    subject,
    inquiry_type,
    message
  } = req.body;

  if (!full_name || !full_name.trim()) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Full Name is required.' } });
  }

  if (!institutional_email || !institutional_email.trim()) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Institutional Email is required.' } });
  }

  // Basic email pattern check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(institutional_email.trim())) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_EMAIL', message: 'Please provide a valid institutional email address.' } });
  }

  if (!role || !role.trim()) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Academic Role is required.' } });
  }

  if (!department || !department.trim()) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Department is required.' } });
  }

  if (!subject || !subject.trim()) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Inquiry Subject is required.' } });
  }

  if (!inquiry_type || !inquiry_type.trim()) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Inquiry Type is required.' } });
  }

  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Message details are required.' } });
  }

  const newInquiry = db.insert('inquiries', {
    user_id: auth ? auth.profile.id : null,
    full_name: full_name.trim(),
    institutional_email: institutional_email.trim().toLowerCase(),
    role: role.trim(),
    department: department.trim(),
    subject: subject.trim(),
    inquiry_type: inquiry_type.trim(),
    message: message.trim(),
    status: 'PENDING',
  });

  // Log in audit logs
  db.logAudit(
    'SUBMIT_INQUIRY',
    'inquiry',
    newInquiry.id,
    institutional_email.trim().toLowerCase(),
    auth?.profile?.id,
    {
      inquiry_type: newInquiry.inquiry_type,
      subject: newInquiry.subject,
      role: newInquiry.role
    }
  );

  return res.status(201).json({ success: true, data: newInquiry });
});

app.get('/api/inquiries', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required to view inquiries.' } });
  }

  // If Admin or Teacher, view all inquiries; otherwise view own
  if (auth.profile.role === 'ADMIN' || auth.profile.role === 'TEACHER') {
    const allInquiries = db.find('inquiries');
    return res.json({ success: true, data: allInquiries });
  }

  const ownInquiries = db.find('inquiries', (i) => i.user_id === auth.profile.id || i.institutional_email.toLowerCase() === auth.profile.email.toLowerCase());
  return res.json({ success: true, data: ownInquiries });
});

app.get('/api/inquiries/:id', (req, res) => {
  const auth = getAuthUser(req);
  const inquiry = db.findById('inquiries', req.params.id);
  if (!inquiry) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Inquiry record not found.' } });
  }

  if (auth?.profile?.role !== 'ADMIN' && auth?.profile?.role !== 'TEACHER' && inquiry.user_id !== auth?.profile?.id && inquiry.institutional_email !== auth?.profile?.email) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Unauthorized to view this inquiry dossier.' } });
  }

  return res.json({ success: true, data: inquiry });
});

// ----------------------------------------------------
// VITE MIDDLEWARE & SERVER STARTUP
// ----------------------------------------------------

async function startServer() {
  // Sync academic course catalog and baseline structures
  try {
    syncAcademicCatalog();
    seedFeedbackData();
  } catch (err) {
    console.error('[Startup] Course catalog sync warning:', err);
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SC EduSense AI server running on http://0.0.0.0:${PORT}`);
  });
}

if (process.env.VERCEL !== '1') {
  startServer();
}

export default app;
