import { db } from './db.js';

export interface HelpDeskFAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  tags: string[];
}

export const HELPDESK_FAQS: HelpDeskFAQItem[] = [
  {
    id: 'faq_01',
    category: 'Course Registration & Enrollment',
    question: 'How do I register for electives and Department Core courses?',
    answer: 'Navigate to "My Courses" or the "Public Catalog" from your sidebar. Browse active courses for your semester and click "Register Course". If prerequisites are satisfied and credit limits allow, enrollment will be confirmed instantly.',
    tags: ['courses', 'registration', 'enrollment', 'electives']
  },
  {
    id: 'faq_02',
    category: 'NPTEL & External Credit Transfer',
    question: 'How do I submit my NPTEL certificate for course credit equivalence?',
    answer: 'Open the course details page for any NPTEL-mapped course, scroll down to the "NPTEL & SWAYAM Tracking" card, and click "Submit NPTEL Certificate". Upload your verification URL, Roll No, and Score for Faculty approval.',
    tags: ['nptel', 'swayam', 'certificate', 'credits', 'transfer']
  },
  {
    id: 'faq_03',
    category: 'Attendance & Thresholds',
    question: 'What is the mandatory attendance requirement for semester exams?',
    answer: 'SC EduSense AI enforces the standard university regulation of minimum 75.0% cumulative attendance per course to be eligible for final examinations. If your attendance falls between 65-74%, you must submit medical documentation for condonation review.',
    tags: ['attendance', 'condonation', 'eligibility', 'leave']
  },
  {
    id: 'faq_04',
    category: 'Assignments & Submissions',
    question: 'Can I re-submit an assignment before the deadline?',
    answer: 'Yes. Navigate to "Assignments", open the active assignment card, and click "Edit / Replace Submission". You can update your text or file attachment up until the instructor-set deadline.',
    tags: ['assignments', 'submission', 'deadlines', 'grading']
  },
  {
    id: 'faq_05',
    category: 'AI Academic Assistant (SC EDU AI)',
    question: 'How does SC EDU AI help with my studies and exam revision?',
    answer: 'SC EDU AI is grounded in your verified enrollment syllabus, attendance records, and performance metrics. It can generate 7-day revision timetables, solve coding algorithms, explain complex proofs, and converse fluently in English, தமிழ் (Tamil), and Tanglish with voice support.',
    tags: ['ai', 'sc edu ai', 'gemini', 'tamil', 'tanglish', 'study plan']
  },
  {
    id: 'faq_06',
    category: 'Technical & Account Support',
    question: 'Who should I contact if my grades or attendance records do not load?',
    answer: 'You can submit a ticket right here using the "Submit Feedback" tab or floating button. Select the appropriate issue category and your ticket will be routed directly to the Department Faculty Advisor and IT Help Desk.',
    tags: ['technical', 'bug', 'support', 'help desk', 'error']
  }
];

export function getNextFeedbackNumber(): string {
  const currentYear = new Date().getFullYear();
  const allFeedback = db.find('feedback');
  const count = allFeedback.length + 1;
  const padded = String(count).padStart(4, '0');
  return `FDB-${currentYear}-${padded}`;
}

export function seedFeedbackData() {
  const existing = db.find('feedback');
  if (existing && existing.length > 0) return;

  const now = new Date();
  const d1 = new Date(now.getTime() - 48 * 3600 * 1000).toISOString();
  const d2 = new Date(now.getTime() - 24 * 3600 * 1000).toISOString();
  const d3 = new Date(now.getTime() - 6 * 3600 * 1000).toISOString();

  const students = db.find('students');
  const teachers = db.find('teachers');
  const profiles = db.find('profiles');

  const alexProfile = profiles.find((p) => p.email === 'alex.morgan@edusense.ai') || profiles.find((p) => p.role === 'STUDENT');
  const priyaProfile = profiles.find((p) => p.email === 'priya.sharma@edusense.ai');
  const davidProfile = profiles.find((p) => p.email === 'david.miller@edusense.ai');
  const alanProfile = profiles.find((p) => p.email === 'teacher@edusense.ai') || profiles.find((p) => p.role === 'TEACHER');

  if (alexProfile) {
    db.insert('feedback', {
      feedback_id: 'FDB-2026-0001',
      profile_id: alexProfile.id,
      user_id: alexProfile.id,
      user_name: alexProfile.full_name,
      user_email: alexProfile.email,
      user_role: 'STUDENT',
      category: 'Course Issue',
      subject: 'Course Registration & Prerequisites Display',
      description: 'When I register for the Distributed Systems elective, the registration succeeds but course requirements and lab schedule are not displayed on the overview dashboard.',
      priority: 'HIGH',
      attachment_url: '',
      page_url: '/student/courses',
      status: 'In Progress',
      admin_response: 'We are checking the course configuration. The prerequisites table has been updated in the catalog.',
      assigned_to: alanProfile?.id || '',
      assigned_to_name: alanProfile?.full_name || 'Prof. Alan Vance',
      internal_notes: [
        {
          id: 'note_1',
          author_id: alanProfile?.id || 'sys',
          author_name: alanProfile?.full_name || 'Prof. Alan Vance',
          author_role: 'TEACHER',
          note: 'Verified syllabus prerequisite links for CSE-401. Updated classroom lab allocation.',
          created_at: d2
        }
      ],
      responses: [
        {
          id: 'resp_1',
          sender_id: alexProfile.id,
          sender_name: alexProfile.full_name,
          sender_role: 'STUDENT',
          message: 'When I register for the course, the registration succeeds but course requirements are not displayed.',
          created_at: d1
        },
        {
          id: 'resp_2',
          sender_id: alanProfile?.id || 'admin',
          sender_name: alanProfile?.full_name || 'Prof. Alan Vance',
          sender_role: 'TEACHER',
          message: 'We are checking the course configuration. The prerequisites table has been updated in the catalog.',
          created_at: d2
        }
      ],
      created_at: d1,
      updated_at: d2
    });
  }

  if (davidProfile) {
    db.insert('feedback', {
      feedback_id: 'FDB-2026-0002',
      profile_id: davidProfile.id,
      user_id: davidProfile.id,
      user_name: davidProfile.full_name,
      user_email: davidProfile.email,
      user_role: 'STUDENT',
      category: 'NPTEL Course Issue',
      subject: 'NPTEL Cloud Computing Certificate Credit Transfer',
      description: 'I submitted my 12-week NPTEL Cloud Infrastructure certificate with Elite Gold badge. Please verify for 3-credit semester transfer.',
      priority: 'MEDIUM',
      attachment_url: '',
      page_url: '/student/courses',
      status: 'In Review',
      admin_response: 'Certificate received and forwarded to Academic Dean for credit audit.',
      assigned_to: alanProfile?.id || '',
      assigned_to_name: alanProfile?.full_name || 'Prof. Alan Vance',
      internal_notes: [],
      responses: [
        {
          id: 'resp_d1',
          sender_id: davidProfile.id,
          sender_name: davidProfile.full_name,
          sender_role: 'STUDENT',
          message: 'I submitted my 12-week NPTEL Cloud Infrastructure certificate with Elite Gold badge. Please verify for 3-credit semester transfer.',
          created_at: d2
        },
        {
          id: 'resp_d2',
          sender_id: alanProfile?.id || 'admin',
          sender_name: alanProfile?.full_name || 'Prof. Alan Vance',
          sender_role: 'TEACHER',
          message: 'Certificate received and forwarded to Academic Dean for credit audit.',
          created_at: d3
        }
      ],
      created_at: d2,
      updated_at: d3
    });
  }

  if (priyaProfile) {
    db.insert('feedback', {
      feedback_id: 'FDB-2026-0003',
      profile_id: priyaProfile.id,
      user_id: priyaProfile.id,
      user_name: priyaProfile.full_name,
      user_email: priyaProfile.email,
      user_role: 'STUDENT',
      category: 'AI / Chatbot Issue',
      subject: 'SC EDU AI Exam Timetable Download Option',
      description: 'Would love if SC EDU AI study timetables can be exported directly as markdown or PDF notes for semester preparation.',
      priority: 'LOW',
      attachment_url: '',
      page_url: '/student/ai-insights',
      status: 'Resolved',
      admin_response: 'Thank you for the wonderful suggestion! The markdown export feature has now been added directly into the SC EDU AI header toolbar.',
      assigned_to: '',
      assigned_to_name: 'Academic Affairs Admin Team',
      internal_notes: [],
      responses: [
        {
          id: 'resp_p1',
          sender_id: priyaProfile.id,
          sender_name: priyaProfile.full_name,
          sender_role: 'STUDENT',
          message: 'Would love if SC EDU AI study timetables can be exported directly as markdown or PDF notes for semester preparation.',
          created_at: d1
        },
        {
          id: 'resp_p2',
          sender_id: 'admin_sys',
          sender_name: 'Dr. Evelyn Hayes',
          sender_role: 'ADMIN',
          message: 'Thank you for the wonderful suggestion! The markdown export feature has now been added directly into the SC EDU AI header toolbar.',
          created_at: d3
        }
      ],
      created_at: d1,
      updated_at: d3,
      resolved_at: d3
    });
  }
}
