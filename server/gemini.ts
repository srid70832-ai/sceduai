import { GoogleGenAI, Type } from '@google/genai';
import { db } from './db.js';
import { calculateStudentAnalytics } from './analytics.js';

let geminiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

export async function generateStudentAIRecommendations(studentId: string) {
  const student = db.findById('students', studentId);
  if (!student) {
    throw new Error('Student not found');
  }

  const profile = db.findById('profiles', student.profile_id);
  const analytics = calculateStudentAnalytics(studentId);
  const studentPrefs = profile?.onboarding_data?.student_preferences;

  if (!analytics || !analytics.has_data) {
    const defaultReasoning = studentPrefs
      ? `Onboarding profile initialized for ${studentPrefs.study_year || 'Student'} majoring in ${studentPrefs.department || 'Engineering'}. Primary academic objective: "${studentPrefs.primary_academic_goal || 'Academic Excellence'}". As classroom assessments and attendance are recorded, deep AI diagnostics will continually adapt.`
      : 'No course assessments, attendance sessions, or exam marks have been logged for this student yet. As soon as assignments or exams are evaluated, AI will generate personalized guidance.';

    const initialRecommendations: any[] = [];
    if (studentPrefs) {
      if (studentPrefs.primary_academic_goal === 'Placement Preparation' || studentPrefs.primary_academic_goal === 'All of these') {
        initialRecommendations.push({
          priority: 'HIGH',
          subject: 'Placement & Industry Readiness',
          reason: `Student identified primary academic goal as "${studentPrefs.primary_academic_goal}".`,
          recommended_action: `Build a portfolio project focusing on ${studentPrefs.academic_interests?.slice(0, 2).join(' & ') || 'core computational engineering'} and practice data structures regularly.`,
          expected_improvement_area: 'Technical Interview Readiness & Applied Problem Solving'
        });
      }
      if (studentPrefs.support_subject_names && studentPrefs.support_subject_names.length > 0) {
        initialRecommendations.push({
          priority: 'HIGH',
          subject: studentPrefs.support_subject_names.join(', '),
          reason: 'Student highlighted these enrolled courses for targeted academic support.',
          recommended_action: 'Access course lecture notes, review textbook practice problems, and schedule a consultation with the course instructor.',
          expected_improvement_area: 'Targeted Subject Mastery'
        });
      }
      if (studentPrefs.academic_interests && studentPrefs.academic_interests.length > 0) {
        initialRecommendations.push({
          priority: 'MEDIUM',
          subject: `Electives & Skills: ${studentPrefs.academic_interests[0]}`,
          reason: `Academic domain of interest selected during onboarding.`,
          recommended_action: `Engage with departmental workshops and practical hands-on labs in ${studentPrefs.academic_interests.join(', ')}.`,
          expected_improvement_area: 'Domain Specialization'
        });
      }
    }

    return {
      has_enough_data: true,
      risk_level: 'low',
      reasoning_summary: defaultReasoning,
      weak_subjects: studentPrefs?.support_subject_names || [],
      strong_subjects: [],
      recommendations: initialRecommendations.length > 0 ? initialRecommendations : [
        {
          priority: 'LOW',
          subject: 'Academic Foundation Setup',
          reason: 'Student record active in database.',
          recommended_action: 'Complete upcoming course assignments on time and attend scheduled lectures.',
          expected_improvement_area: 'Continuous Assessment Performance'
        }
      ]
    };
  }

  const ai = getAIClient();

  // If Gemini API is available, generate deep model-backed intelligence
  if (ai) {
    try {
      const studentContext = studentPrefs ? `
Student Onboarding Profile & Preferences:
- Academic Year: ${studentPrefs.study_year || 'N/A'}
- Department / Major: ${studentPrefs.department || profile?.department || 'N/A'}
- Academic Interests: ${studentPrefs.academic_interests?.join(', ') || 'N/A'}${studentPrefs.other_interest ? ` (Other: ${studentPrefs.other_interest})` : ''}
- Primary Academic Goal: ${studentPrefs.primary_academic_goal || 'General Academic Improvement'}
- Self-Identified Support Subjects: ${studentPrefs.support_subject_names?.join(', ') || 'None specified'}` : '';

      const prompt = `You are the SC EduSense AI Academic Intelligence Engine.
Analyze the following authentic academic performance profile for student "${profile?.full_name || 'Student'}" (Roll: ${student.roll_number}):
${studentContext}

Academic Metrics:
- Overall Score: ${analytics.overall_academic_score}%
- Attendance Rate: ${analytics.attendance_percentage}% (Present: ${analytics.present_sessions}, Absent: ${analytics.absent_sessions}, Late: ${analytics.late_sessions} out of ${analytics.total_attendance_sessions} sessions)
- Assignment Average: ${analytics.assignment_average}% (${analytics.graded_assignments} graded)
- Examination Average: ${analytics.exam_average}% (${analytics.completed_exams} exams)
- Identified Weak Subjects: ${JSON.stringify(analytics.weak_subjects)}
- Identified Strong Subjects: ${JSON.stringify(analytics.strong_subjects)}
- Algorithmic Risk Level: ${analytics.academic_risk}

Generate a concise, structured academic recommendation response tailored to help this student achieve their specific academic goal (${studentPrefs?.primary_academic_goal || 'Academic Excellence'}) and address weak/support subjects.`;

      const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-3.7-flash'];
      let parsed: any = null;

      for (const model of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              systemInstruction: 'You are an expert academic advisor and educational data scientist. Return strict JSON following the schema provided.',
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  risk_level: {
                    type: Type.STRING,
                    description: 'One of: low, medium, high, critical'
                  },
                  reasoning_summary: {
                    type: Type.STRING,
                    description: 'A 2-3 sentence executive diagnostic summary of current academic trajectory and core factors.'
                  },
                  weak_subjects: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Names of subjects requiring targeted academic intervention.'
                  },
                  strong_subjects: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Names of subjects where the student demonstrates mastery.'
                  },
                  recommendations: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        priority: { type: Type.STRING, description: 'HIGH, MEDIUM, or LOW' },
                        subject: { type: Type.STRING, description: 'Relevant course or General Study Skill' },
                        reason: { type: Type.STRING, description: 'Data-driven cause for this recommendation' },
                        recommended_action: { type: Type.STRING, description: 'Concrete, actionable step for the student' },
                        expected_improvement_area: { type: Type.STRING, description: 'Expected outcome e.g. Concept mastery, Submission punctuality' }
                      },
                      required: ['priority', 'subject', 'reason', 'recommended_action', 'expected_improvement_area']
                    }
                  }
                },
                required: ['risk_level', 'reasoning_summary', 'weak_subjects', 'strong_subjects', 'recommendations']
              }
            }
          });

          if (response && response.text) {
            parsed = JSON.parse(response.text);
            if (parsed) break;
          }
        } catch (modelErr: any) {
          console.warn(`[Student AI Recommendations] Model ${model} unavailable, trying fallback model...`);
        }
      }

      if (parsed) {
        const finalResult = {
          has_enough_data: true,
          risk_level: parsed.risk_level || analytics.academic_risk,
          reasoning_summary: parsed.reasoning_summary || 'Analysis derived from current academic assessments and attendance tracking.',
          weak_subjects: parsed.weak_subjects || analytics.weak_subjects.map((w: any) => w.course_name),
          strong_subjects: parsed.strong_subjects || analytics.strong_subjects.map((s: any) => s.course_name),
          recommendations: parsed.recommendations || []
        };

        // Save to database cache
        db.insert('ai_recommendations', {
          student_id: studentId,
          ...finalResult,
          generated_at: db.now()
        });

        return finalResult;
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to algorithmic intelligence:', err);
    }
  }

  // Algorithmic Fallback Engine
  const weakNames = analytics.weak_subjects.map((w) => w.course_name);
  const strongNames = analytics.strong_subjects.map((s) => s.course_name);

  const fallbackRecommendations: any[] = [];

  if (analytics.attendance_percentage < 75 && analytics.total_attendance_sessions > 0) {
    fallbackRecommendations.push({
      priority: 'HIGH',
      subject: 'Class Attendance & Participation',
      reason: `Current attendance is ${analytics.attendance_percentage}%, below the university 75% threshold.`,
      recommended_action: 'Attend all remaining lecture sessions without unexcused absences to prevent exam debarment.',
      expected_improvement_area: 'Attendance Compliance & Classroom Engagement'
    });
  }

  if (analytics.weak_subjects.length > 0) {
    analytics.weak_subjects.forEach((ws) => {
      fallbackRecommendations.push({
        priority: 'HIGH',
        subject: ws.course_name,
        reason: ws.reason,
        recommended_action: `Schedule weekly revision for ${ws.course_code} core problem sets and consult faculty during office hours.`,
        expected_improvement_area: 'Assessment Score & Fundamental Conceptual Clarity'
      });
    });
  }

  if (analytics.assignment_average < 70 && analytics.submitted_assignments > 0) {
    fallbackRecommendations.push({
      priority: 'MEDIUM',
      subject: 'Coursework Submissions',
      reason: `Assignment score average is currently ${analytics.assignment_average}%.`,
      recommended_action: 'Review assignment rubrics thoroughly before submission and seek pre-submission peer reviews.',
      expected_improvement_area: 'Continuous Assessment Performance'
    });
  }

  if (fallbackRecommendations.length === 0) {
    fallbackRecommendations.push({
      priority: 'LOW',
      subject: 'Advanced Study & Honors',
      reason: `Consistent performance with an overall academic score of ${analytics.overall_academic_score}%.`,
      recommended_action: 'Explore supplementary research projects, peer tutoring, and advanced seminar electives.',
      expected_improvement_area: 'Academic Distinction & Portfolio Building'
    });
  }

  return {
    has_enough_data: true,
    risk_level: analytics.academic_risk === 'none' ? 'low' : analytics.academic_risk,
    reasoning_summary: `Academic diagnosis based on ${analytics.total_courses} enrolled course(s), ${analytics.total_attendance_sessions} attendance records, ${analytics.submitted_assignments} submitted assignment(s), and ${analytics.completed_exams} exam evaluation(s).`,
    weak_subjects: weakNames,
    strong_subjects: strongNames,
    recommendations: fallbackRecommendations
  };
}

export async function generateTeacherClassInsights(classId: string) {
  const classItem = db.findById('classes', classId);
  if (!classItem) {
    throw new Error('Class not found');
  }

  const course = db.findById('courses', classItem.course_id);
  const classStudents = db.find('class_students', (cs) => cs.class_id === classId);
  const studentIds = classStudents.map((cs) => cs.student_id);

  if (studentIds.length === 0) {
    return {
      has_enough_data: false,
      message: 'No students enrolled in this class yet.',
      class_id: classId,
      class_name: `${course?.code || ''} - Section ${classItem.section_name}`,
      students_requiring_attention: [],
      attendance_trend_summary: 'No attendance records logged.',
      lowest_performing_topics: [],
      strengths_summary: 'Pending initial student activity.',
      actionable_teaching_recommendations: []
    };
  }

  // Calculate class-level metrics
  const assignments = db.find('assignments', (a) => a.class_id === classId);
  const assignmentIds = assignments.map(a => a.id);
  const submissions = db.find('assignment_submissions', (s) => assignmentIds.includes(s.assignment_id));
  
  const sessions = db.find('attendance_sessions', (as) => as.class_id === classId);
  const sessionIds = sessions.map(s => s.id);
  const attendanceRecords = db.find('attendance_records', (ar) => sessionIds.includes(ar.session_id));

  const studentsAttention: any[] = [];

  studentIds.forEach((sId) => {
    const student = db.findById('students', sId);
    const profile = student ? db.findById('profiles', student.profile_id) : null;
    const sRecords = attendanceRecords.filter(r => r.student_id === sId);
    const present = sRecords.filter(r => r.status === 'PRESENT').length;
    const attRate = sRecords.length > 0 ? (present / sRecords.length) * 100 : 100;
    
    const sSubs = submissions.filter(s => s.student_id === sId);
    const missing = assignments.length - sSubs.length;

    if (sRecords.length >= 2 && attRate < 75) {
      studentsAttention.push({
        student_id: sId,
        student_name: profile?.full_name || 'Student',
        roll_number: student?.roll_number || 'N/A',
        risk_factor: 'ATTENDANCE',
        reason: `Attendance is at ${Math.round(attRate)}% (${sRecords.length - present} missed out of ${sRecords.length} sessions).`,
        suggested_action: 'Issue an attendance advisory notice and verify if personal support is needed.'
      });
    } else if (missing >= 2 && assignments.length >= 2) {
      studentsAttention.push({
        student_id: sId,
        student_name: profile?.full_name || 'Student',
        roll_number: student?.roll_number || 'N/A',
        risk_factor: 'MISSING_ASSIGNMENTS',
        reason: `Missing ${missing} assignment submission(s).`,
        suggested_action: 'Set up an assignment catch-up deadline.'
      });
    }
  });

  const ai = getAIClient();
  if (ai && (sessions.length > 0 || assignments.length > 0)) {
    try {
      const prompt = `You are SC EduSense AI Academic Intelligence for Teachers.
Analyze class "${course?.name} (${course?.code})" - Section ${classItem.section_name}:
- Total Enrolled Students: ${studentIds.length}
- Attendance Sessions Logged: ${sessions.length}
- Total Assignments Published: ${assignments.length}
- Total Submissions Received: ${submissions.length}
- Students Flagged for Intervention: ${studentsAttention.length}

Generate a concise pedagogical insight and actionable teaching recommendations for the instructor.`;

      const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-3.7-flash'];
      let parsed: any = null;

      for (const model of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  attendance_trend_summary: { type: Type.STRING },
                  lowest_performing_topics: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  strengths_summary: { type: Type.STRING },
                  actionable_teaching_recommendations: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ['attendance_trend_summary', 'lowest_performing_topics', 'strengths_summary', 'actionable_teaching_recommendations']
              }
            }
          });

          if (response && response.text) {
            parsed = JSON.parse(response.text);
            if (parsed) break;
          }
        } catch (modelErr: any) {
          console.warn(`[Teacher Class Insights] Model ${model} unavailable, trying fallback model...`);
        }
      }

      if (parsed) {
        return {
          has_enough_data: true,
          class_id: classId,
          class_name: `${course?.code || ''} - Section ${classItem.section_name}`,
          students_requiring_attention: studentsAttention,
          attendance_trend_summary: parsed.attendance_trend_summary || `Class attendance is stable across ${sessions.length} logged session(s).`,
          lowest_performing_topics: parsed.lowest_performing_topics || ['Foundational coursework problem sets'],
          strengths_summary: parsed.strengths_summary || 'Students exhibit steady engagement with regular course deliverables.',
          actionable_teaching_recommendations: parsed.actionable_teaching_recommendations || [
            'Conduct an active problem-solving session in the next scheduled class.',
            'Share supplementary solution walk-throughs for previous assignments.'
          ]
        };
      }
    } catch (err) {
      console.warn('Gemini class insights failed, using algorithmic response:', err);
    }
  }

  return {
    has_enough_data: true,
    class_id: classId,
    class_name: `${course?.code || ''} - Section ${classItem.section_name}`,
    students_requiring_attention: studentsAttention,
    attendance_trend_summary: sessions.length > 0 
      ? `Calculated from ${sessions.length} classroom session(s) across ${studentIds.length} enrolled student(s).`
      : 'No attendance sessions logged yet.',
    lowest_performing_topics: assignments.length > 0 ? ['Complex assignment application exercises'] : [],
    strengths_summary: `Enrolled cohort of ${studentIds.length} student(s) actively registered for ${course?.name || 'course'}.`,
    actionable_teaching_recommendations: [
      'Provide regular formative feedback on submitted assignments within 5 days of submission.',
      'Check in with students flagged with high attendance or submission risks.',
      'Reinforce core foundational prerequisites before administering midterm evaluations.'
    ]
  };
}

export async function askAITutorCourseQuery(options: {
  courseId: string;
  message: string;
  history?: Array<{ role: 'user' | 'assistant' | 'model'; content: string }>;
  userName?: string;
  userRole?: string;
}) {
  const { courseId, message, history = [], userName, userRole } = options;

  const course = db.findById('courses', courseId);
  if (!course) {
    throw new Error('Course not found in academic catalog.');
  }

  const assignments = db.find('assignments', (a) => a.course_id === courseId || a.class_id && db.findById('classes', a.class_id)?.course_id === courseId);
  const examinations = db.find('examinations', (e) => e.course_id === courseId);
  const classes = db.find('classes', (c) => c.course_id === courseId);

  const ai = getAIClient();

  if (ai) {
    try {
      const formattedHistory = history.slice(-8).map((h) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }]
      }));

      const courseContext = `
Course Catalog Information:
- Code: ${course.code}
- Title: ${course.name}
- Department: ${course.department}
- Level: ${course.level || 'Undergraduate'} (Year ${course.academic_year || 1}, Semester ${course.semester || 1})
- Credits: ${course.credits} Credits
- Course Type: ${course.course_type}
- Prerequisites: ${course.prerequisites || 'None specified'}
- Official Syllabus:
${course.syllabus || 'Unit 1: Fundamentals\nUnit 2: Core Concepts\nUnit 3: Applied Principles\nUnit 4: Advanced Systems\nUnit 5: Integration & Evaluation'}
- Overview & Objectives: ${course.description || 'Comprehensive university curriculum.'}
${assignments.length > 0 ? `- Course Assignments: ${assignments.slice(0, 4).map((a: any) => `"${a.title}" (Due: ${a.due_date ? a.due_date.split('T')[0] : 'TBA'}, Max Marks: ${a.maximum_marks})`).join(', ')}` : ''}
${examinations.length > 0 ? `- Scheduled Evaluations: ${examinations.slice(0, 3).map((e: any) => `"${e.name}" (${e.maximum_marks} marks, ${e.duration_minutes} min)`).join(', ')}` : ''}
${classes.length > 0 ? `- Active Sections: ${classes.map((c: any) => `Section ${c.section_name}`).join(', ')}` : ''}
`;

      const prompt = `Student / User: ${userName || 'Student'} (${userRole || 'STUDENT'})
Query: "${message}"

Answer the query thoroughly and contextually using the course syllabus and curriculum above.
Return a structured JSON with:
1. "reply": clear, formatted markdown response with headers, bold concepts, formulas or code if helpful, and practical explanations.
2. "suggested_followups": an array of exactly 3 concise, logical follow-up questions the student might ask next to deepen understanding.
3. "referenced_units": an array of syllabus units relevant to this answer (e.g. ["Unit 1", "Unit 2"]).`;

      const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-3.7-flash'];
      let parsed: any = null;
      let usedModel = 'gemini-2.5-flash';

      for (const model of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: [
              ...formattedHistory,
              { role: 'user', parts: [{ text: prompt }] }
            ],
            config: {
              systemInstruction: `You are the SC EduSense AI Academic Tutor & Syllabus Specialist for the course "${course.code}: ${course.name}" at KIT (Kalaignarkarunanidhi Institute of Technology, Coimbatore).
Your mission is to clarify syllabus topics, demystify difficult theoretical concepts, explain prerequisite connections, provide structured practice problems with solutions, and guide students step-by-step through their academic curriculum.
Always maintain a supportive, academically rigorous tone. Keep explanations clear, well-structured, and pedagogical.
${courseContext}`,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  reply: {
                    type: Type.STRING,
                    description: 'The comprehensive markdown-formatted tutoring explanation.'
                  },
                  suggested_followups: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '3 recommended follow-up questions tailored to the syllabus.'
                  },
                  referenced_units: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Specific syllabus units referenced in the response.'
                  }
                },
                required: ['reply', 'suggested_followups', 'referenced_units']
              }
            }
          });

          if (response && response.text) {
            parsed = JSON.parse(response.text);
            if (parsed && parsed.reply) {
              usedModel = model;
              break;
            }
          }
        } catch (modelErr: any) {
          console.warn(`[AI Course Tutor] Model ${model} unavailable, trying fallback model...`);
        }
      }

      if (parsed && parsed.reply) {
        return {
          reply: parsed.reply,
          suggested_followups: parsed.suggested_followups || [
            `Can you give a practical example of this topic?`,
            `What are the most common exam questions from this unit?`,
            `How does this connect with subsequent course units?`
          ],
          referenced_units: parsed.referenced_units || [],
          source: usedModel,
          course_code: course.code,
          course_name: course.name
        };
      }
    } catch (err) {
      console.warn('Gemini AI Tutor call failed, falling back to curricular intelligence engine:', err);
    }
  }

  // Curricular Intelligence Fallback Engine
  const syllabusLines = (course.syllabus || '')
    .split('\n')
    .filter((l: string) => l.trim().length > 0);

  const lowerQuery = message.toLowerCase();
  let generatedReply = '';
  let followups: string[] = [];
  let refUnits: string[] = [];

  // Match unit queries
  const unitMatch = lowerQuery.match(/unit\s*([1-5]|[i|v|x]+)/i);
  if (unitMatch) {
    const unitNum = unitMatch[1];
    const matchingUnit = syllabusLines.find((l: string) => l.toLowerCase().includes(`unit ${unitNum.toLowerCase()}`) || l.toLowerCase().includes(`unit ${unitNum}`));
    
    if (matchingUnit) {
      refUnits.push(matchingUnit.split(':')[0] || `Unit ${unitNum}`);
      generatedReply = `### 📚 ${matchingUnit} Breakdown\n\n` +
        `**Course:** ${course.code} - ${course.name}\n\n` +
        `Here is a targeted breakdown of the core topics and learning competencies covered in **${matchingUnit}**:\n\n` +
        `1. **Core Theoretical Concepts**: Key principles, foundational architectures, and standard methodologies.\n` +
        `2. **Applied Skills & Formulations**: Problem-solving strategies, algorithmic steps, and laboratory implementation standards.\n` +
        `3. **Key Exam Focus Areas**: Definitions, comparative distinctions, schematic derivations, and numerical applications.\n\n` +
        `#### 💡 Recommended Study Strategy:\n` +
        `- Review standard textbook chapters corresponding to *${matchingUnit}*.\n` +
        `- Solve at least 3 previous semester exam questions from this specific unit.\n` +
        `- Create a one-page summary sheet with definitions, formulas, and flow diagrams.`;

      followups = [
        `What are sample practice questions for ${matchingUnit}?`,
        `What prerequisites do I need before studying ${matchingUnit}?`,
        `How is ${matchingUnit} tested in the continuous internal evaluations?`
      ];
    }
  }

  // Match prerequisite queries
  if (!generatedReply && (lowerQuery.includes('prereq') || lowerQuery.includes('prior knowledge') || lowerQuery.includes('background') || lowerQuery.includes('prepare'))) {
    generatedReply = `### 🎯 Prerequisites & Preparatory Roadmap for ${course.code}\n\n` +
      `**Official Prerequisite:** ${course.prerequisites || 'None (Direct foundational entry)'}\n\n` +
      `To excel in **${course.name}** (${course.credits} Credits, Semester ${course.semester}), ensure comfort with:\n\n` +
      `- **Foundational Domain Knowledge**: Understanding core departmental principles established in preceding semesters.\n` +
      `- **Analytical & Mathematical Tools**: Basic logical problem solving, discrete math/calculus foundations as applicable.\n` +
      `- **Tools & Software Stack**: Recommended IDEs, standard simulation/programming tools used during lab sessions.\n\n` +
      `*Tip: If you need a refresher on previous subjects, reach out to faculty during scheduled tutorial office hours.*`;

    followups = [
      `Summarize the complete Unit 1 to 5 syllabus`,
      `What are the most challenging units in this course?`,
      `Show me upcoming assignments and exam schedules`
    ];
  }

  // Match exam, marks, grading, or assessment queries
  if (!generatedReply && (lowerQuery.includes('exam') || lowerQuery.includes('mark') || lowerQuery.includes('grad') || lowerQuery.includes('internal') || lowerQuery.includes('test') || lowerQuery.includes('quiz'))) {
    const examList = examinations.length > 0
      ? examinations.map((e: any) => `- **${e.name}**: ${e.maximum_marks} marks (${e.duration_minutes} minutes duration)`).join('\n')
      : '- Continuous Internal Assessment (CIA): Mid-term tests, quizzes, and assignment evaluations.\n- End Semester Autonomous Examination (ESE): Comprehensive theoretical and practical evaluation.';

    generatedReply = `### 📊 Evaluation & Assessment Pattern for ${course.code}\n\n` +
      `**Course:** ${course.name} (${course.credits} Credits)\n\n` +
      `The academic performance in this course is evaluated through a blend of formative assessments and summative exams:\n\n` +
      `${examList}\n\n` +
      `#### 📝 High-Scoring Tips:\n` +
      `- **Continuous Assignments**: Submit all ${assignments.length || 'scheduled'} assignments on time with detailed derivations/code.\n` +
      `- **Attendance Compliance**: Maintain at least 75% classroom attendance to remain eligible for all institutional evaluations.\n` +
      `- **Systematic Unit Revision**: Review unit objectives weekly rather than cramming before the examination date.`;

    followups = [
      `Generate 3 practice questions for the upcoming exam`,
      `Which unit carries the highest weightage?`,
      `Explain the key concepts of Unit 1`
    ];
  }

  // Match practice question / quiz queries
  if (!generatedReply && (lowerQuery.includes('practice') || lowerQuery.includes('quiz') || lowerQuery.includes('question') || lowerQuery.includes('problem'))) {
    generatedReply = `### ✏️ Practice & Self-Assessment Exercises: ${course.code}\n\n` +
      `Here are 3 curated self-assessment practice problems aligned with **${course.name}**:\n\n` +
      `1. **Conceptual Understanding (10 Marks)**:\n` +
      `   *Explain the foundational architecture and primary mathematical/algorithmic principles underlying Unit 1 with a neat diagram.*\n\n` +
      `2. **Analytical Application (12 Marks)**:\n` +
      `   *Compare and contrast the primary approaches taught in Unit 2 versus Unit 3 in terms of computational complexity, efficiency, and real-world scalability.*\n\n` +
      `3. **Applied Design Scenario (15 Marks)**:\n` +
      `   *Design an end-to-end solution for an engineering problem utilizing the key techniques from the later units of this course.*\n\n` +
      `*Try solving these under timed conditions (30 minutes) for optimal retention!*`;

    followups = [
      `Provide step-by-step solutions for these practice problems`,
      `Give me multiple-choice questions for Unit 1`,
      `Explain the hardest topic in Unit 3`
    ];
  }

  // Default syllabus overview & contextual assistance
  if (!generatedReply) {
    const formattedUnits = syllabusLines.length > 0
      ? syllabusLines.map((line: string) => `• **${line}**`).join('\n')
      : `• **Unit 1**: Core Foundations & Semantics\n• **Unit 2**: Structural Analysis & Methodologies\n• **Unit 3**: Advanced Formulations & Algorithms\n• **Unit 4**: System Design & Implementations\n• **Unit 5**: Case Studies & Emerging Applications`;

    generatedReply = `### 🎓 AI Tutor: ${course.code} - ${course.name}\n\n` +
      `Hello! I am your contextual syllabus tutor for **${course.name}** (${course.department}). Here is an overview of the curriculum modules:\n\n` +
      `${formattedUnits}\n\n` +
      `**Course Highlights:**\n` +
      `- **Credits:** ${course.credits} Credits (${course.course_type})\n` +
      `- **Prerequisites:** ${course.prerequisites || 'None specified'}\n` +
      `- **Level:** Year ${course.academic_year || 1}, Semester ${course.semester || 1}\n\n` +
      `How can I help you today? You can ask me to explain any specific unit, simplify challenging algorithms, generate practice quizzes, or review prerequisite topics!`;

    followups = [
      `Break down Unit 1 key concepts & formulas`,
      `What are the most common exam questions in this course?`,
      `Explain the prerequisites needed for this subject`
    ];
  }

  return {
    reply: generatedReply,
    suggested_followups: followups,
    referenced_units: refUnits,
    source: 'curricular-engine',
    course_code: course.code,
    course_name: course.name
  };
}

