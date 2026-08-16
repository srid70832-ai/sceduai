import { db } from './db.js';
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini API lazily
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// ----------------------------------------------------
// LMS CURRICULUM SEEDER & STRUCTURING
// ----------------------------------------------------

export function ensureCourseCurriculum(courseId: string) {
  const course = db.findById('courses', courseId);
  if (!course) return null;

  const existingModules = db.find('course_modules', (m) => m.course_id === courseId);
  if (existingModules.length > 0) {
    return existingModules;
  }

  // Parse syllabus or generate standard units
  let unitTitles: string[] = [];
  if (course.syllabus) {
    unitTitles = course.syllabus
      .split('\n')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);
  }

  if (unitTitles.length === 0) {
    unitTitles = [
      `Unit 1: Foundations & Core Principles of ${course.name}`,
      `Unit 2: Architecture, Methods & Design Patterns`,
      `Unit 3: Implementation, Algorithms & Advanced Concepts`,
      `Unit 4: Real-world Applications & System Integration`,
      `Unit 5: Capstone Assessment, Optimization & Case Studies`
    ];
  }

  const createdModules: any[] = [];
  const now = new Date().toISOString();

  unitTitles.forEach((rawTitle: string, uIdx: number) => {
    const cleanTitle = rawTitle.includes(':') ? rawTitle : `Unit ${uIdx + 1}: ${rawTitle}`;
    const module = db.insert('course_modules', {
      course_id: courseId,
      title: cleanTitle,
      order_index: uIdx + 1,
      description: `Comprehensive instruction on ${cleanTitle.split(':')[1]?.trim() || cleanTitle} covering theoretical foundations, implementation methodologies, and domain applications.`,
      duration_hours: 8 + (uIdx * 2),
      created_at: now
    });
    createdModules.push(module);

    const unitTopic = cleanTitle.split(':')[1]?.trim() || cleanTitle;

    // 1. Video Lesson
    const videoLesson = db.insert('course_lessons', {
      course_id: courseId,
      module_id: module.id,
      title: `${cleanTitle.split(':')[0] || 'Unit ' + (uIdx + 1)} Lecture: ${unitTopic}`,
      lesson_type: 'VIDEO',
      order_index: 1,
      duration_minutes: 25 + (uIdx * 5),
      description: `High-definition video lecture covering ${unitTopic} with animated architecture diagrams, step-by-step mathematical proofs, and live interactive coding.`,
      learning_objectives: [
        `Understand core principles and theoretical foundations of ${unitTopic}`,
        `Analyze algorithmic complexity and trade-offs`,
        `Apply design patterns to real-world engineering constraints`
      ],
      video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      video_thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=640',
      video_duration_seconds: (25 + (uIdx * 5)) * 60,
      is_mandatory: true,
      min_video_completion_pct: 80,
      resource_urls: [
        { title: 'Lecture Slide Deck (PDF)', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'PDF' },
        { title: 'Source Code Repository', url: 'https://github.com', type: 'CODE' }
      ],
      created_at: now
    });

    // 2. Reading Material Lesson
    const readingLesson = db.insert('course_lessons', {
      course_id: courseId,
      module_id: module.id,
      title: `Reading & Technical Notes: ${unitTopic}`,
      lesson_type: 'READING',
      order_index: 2,
      duration_minutes: 20,
      description: `In-depth theoretical notes, API references, mathematical proofs, and comprehensive cheat sheets for ${unitTopic}.`,
      reading_content: `### 📚 Study Notes: ${unitTopic}\n\n#### 1. Overview & Theoretical Context\n${course.description || 'This course explores foundational principles, computational complexity, and modern industrial practices.'}\n\nKey takeaways for **${unitTopic}**:\n* **Mathematical rigor**: Formulate problem constraints using formal notations and invariant specifications.\n* **Performance profiling**: Observe asymptotic execution bounds across average and worst-case scenarios.\n* **Fault tolerance**: Structure error boundaries and defensive edge-case handling.\n\n#### 2. Key Terminology & Definitions\n* **Invariant**: A property of a mathematical object or code loop that remains unchanged under specified transformations.\n* **Throughput vs. Latency**: The rate at which operations are processed versus the total time taken for an individual operation.\n* **State Invariance**: Guaranteeing consistent relational or in-memory boundaries before and after state transitions.\n\n#### 3. Recommended Research References\n1. Cormen, Leiserson, Rivest, Stein — *Introduction to Algorithms* (4th Edition)\n2. Tanenbaum, Van Steen — *Distributed Systems: Principles and Paradigms*\n3. IEEE / ACM Transactions on Computer & Software Systems.`,
      is_mandatory: true,
      created_at: now
    });

    // 3. Interactive Quiz Lesson
    const quizQuestions = generateQuizQuestionsForTopic(course.code, unitTopic, uIdx + 1);
    const quiz = db.insert('quizzes', {
      course_id: courseId,
      module_id: module.id,
      title: `${cleanTitle.split(':')[0] || 'Unit ' + (uIdx + 1)} Assessment Quiz: ${unitTopic}`,
      description: `Test your comprehension of ${unitTopic} with timed conceptual and analytical questions.`,
      time_limit_minutes: 15,
      passing_percentage: 70,
      max_attempts: 3,
      questions: quizQuestions,
      total_points: quizQuestions.reduce((acc: number, q: any) => acc + q.points, 0),
      created_at: now
    });

    const quizLesson = db.insert('course_lessons', {
      course_id: courseId,
      module_id: module.id,
      title: `${cleanTitle.split(':')[0] || 'Unit ' + (uIdx + 1)} Quiz: ${unitTopic}`,
      lesson_type: 'QUIZ',
      order_index: 3,
      duration_minutes: 15,
      description: `Interactive evaluation consisting of ${quizQuestions.length} questions. Passing score is 70%.`,
      quiz_id: quiz.id,
      is_mandatory: true,
      created_at: now
    });
    db.update('quizzes', quiz.id, { lesson_id: quizLesson.id });

    // 4. Assignment Lesson
    const dueDate = new Date(Date.now() + (uIdx + 1) * 7 * 24 * 60 * 60 * 1000).toISOString();
    const assignment = db.insert('assignments', {
      course_id: courseId,
      module_id: module.id,
      teacher_id: course.created_by || 'fac_alan_id',
      title: `${cleanTitle.split(':')[0] || 'Unit ' + (uIdx + 1)} Practical Assignment: ${unitTopic}`,
      description: `Implement and submit an engineering solution addressing key challenges in ${unitTopic}. Provide clean source code and an analytical report.`,
      instructions: `1. Formulate your solution in clean, well-commented code.\n2. Write a 2-page PDF report including time complexity analysis, test coverage logs, and architectural diagrams.\n3. Upload your code repository or PDF before the deadline (${new Date(dueDate).toLocaleDateString()}).`,
      attached_resources: [
        { title: 'Assignment Starter Template (ZIP)', url: 'https://github.com' },
        { title: 'Grading Rubric & Benchmark Dataset (PDF)', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
      ],
      start_date: now,
      due_date: dueDate,
      maximum_marks: 100,
      passing_marks: 60,
      created_at: now
    });

    const assignmentLesson = db.insert('course_lessons', {
      course_id: courseId,
      module_id: module.id,
      title: `${cleanTitle.split(':')[0] || 'Unit ' + (uIdx + 1)} Assignment: ${unitTopic}`,
      lesson_type: 'ASSIGNMENT',
      order_index: 4,
      duration_minutes: 60,
      description: `Practical submission due on ${new Date(dueDate).toLocaleDateString()}. Maximum marks: 100.`,
      assignment_id: assignment.id,
      is_mandatory: true,
      created_at: now
    });
    db.update('assignments', assignment.id, { lesson_id: assignmentLesson.id });

    // If last unit (Unit 5), add Final Comprehensive Assessment
    if (uIdx === unitTitles.length - 1) {
      const finalExamDate = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString();
      const examQuestions = [
        ...generateQuizQuestionsForTopic(course.code, 'Comprehensive Foundations', 1),
        ...generateQuizQuestionsForTopic(course.code, 'Advanced Architectures & Synthesis', 2)
      ];

      const finalExamQuiz = db.insert('quizzes', {
        course_id: courseId,
        module_id: module.id,
        title: `Final Comprehensive Assessment: ${course.name}`,
        description: `Official End-of-Course Comprehensive Assessment. Covers all 5 Units. Passing threshold: 60%.`,
        time_limit_minutes: 60,
        passing_percentage: 60,
        max_attempts: 2,
        questions: examQuestions,
        total_points: examQuestions.reduce((acc: number, q: any) => acc + q.points, 0),
        created_at: now
      });

      db.insert('course_lessons', {
        course_id: courseId,
        module_id: module.id,
        title: `Course Final Assessment & Completion Exam`,
        lesson_type: 'EXAM',
        order_index: 5,
        duration_minutes: 60,
        description: `Final proctored assessment required for university course credit certification.`,
        quiz_id: finalExamQuiz.id,
        is_mandatory: true,
        created_at: now
      });
    }
  });

  // Ensure default completion criteria on course
  if (!course.completion_criteria) {
    db.update('courses', courseId, {
      completion_criteria: {
        video_weight: 30,
        assignment_weight: 25,
        quiz_weight: 15,
        practical_weight: 10,
        exam_weight: 20,
        min_attendance_pct: 75,
        min_assignment_score: 50,
        min_quiz_score: 60,
        min_total_pct: 60
      }
    });
  }

  return createdModules;
}

function generateQuizQuestionsForTopic(courseCode: string, topic: string, unitNum: number) {
  return [
    {
      id: `q_${unitNum}_1`,
      question_text: `What is the primary architectural principle governing ${topic}?`,
      question_type: 'MULTIPLE_CHOICE' as const,
      options: [
        `High cohesion with minimal, loosely coupled interface boundaries`,
        `Monolithic centralized state storage without concurrency guarantees`,
        `Linear execution without asymptotic optimization or caching`,
        `Unrestricted mutable global variables across compilation units`
      ],
      correct_answer_index: 0,
      explanation: `Modern engineering design prioritizes high cohesion and loose coupling to minimize cross-module side effects and enhance maintainability.`,
      points: 5
    },
    {
      id: `q_${unitNum}_2`,
      question_text: `Which of the following guarantees optimal runtime complexity in ${topic}?`,
      question_type: 'MULTIPLE_CHOICE' as const,
      options: [
        `Exhaustive recursive brute-force iteration across all permutations`,
        `Dynamic programming memoization and balanced binary indexing`,
        `Repeated quadratic array scanning without index hashing`,
        `Randomized non-deterministic search without termination invariants`
      ],
      correct_answer_index: 1,
      explanation: `Memoization and balanced tree/hash indexing avoid redundant subproblem calculations, reducing exponential runtime to polynomial or logarithmic bounds.`,
      points: 5
    },
    {
      id: `q_${unitNum}_3`,
      question_text: `True or False: In ${topic}, formal invariant verification ensures that edge-case anomalies are eliminated prior to production deployment.`,
      question_type: 'TRUE_FALSE' as const,
      options: ['True', 'False'],
      correct_answer_index: 0,
      explanation: `Invariant verification rigorously checks pre-conditions, post-conditions, and loop invariants to guarantee system safety properties.`,
      points: 5
    },
    {
      id: `q_${unitNum}_4`,
      question_text: `When scaling ${topic} under heavy concurrency workloads, what strategy is most effective?`,
      question_type: 'MULTIPLE_CHOICE' as const,
      options: [
        `Lock-free concurrent data structures or optimistic concurrency control (OCC)`,
        `Single-threaded blocking synchronous FIFO queue`,
        `Disabling transaction log writes and crash recovery`,
        `Unbounded memory allocation per incoming request thread`
      ],
      correct_answer_index: 0,
      explanation: `Lock-free algorithms and optimistic concurrency control minimize thread contention and eliminate deadlocks in high-throughput workloads.`,
      points: 5
    }
  ];
}

// ----------------------------------------------------
// COURSE PROGRESS & COMPLETION CALCULATOR
// ----------------------------------------------------

export function calculateCourseProgress(courseId: string, studentId: string) {
  const course = db.findById('courses', courseId);
  const enrollment = db.find('enrollments', (e) => e.course_id === courseId && e.student_id === studentId)[0];
  
  const modules = db.find('course_modules', (m) => m.course_id === courseId).sort((a, b) => a.order_index - b.order_index);
  const lessons = db.find('course_lessons', (l) => l.course_id === courseId).sort((a, b) => a.order_index - b.order_index);
  
  const progressRecords = db.find('lesson_progress', (lp) => lp.course_id === courseId && lp.student_id === studentId);
  const assignments = db.find('assignments', (a) => a.course_id === courseId);
  const assignmentSubmissions = db.find('assignment_submissions', (as) => as.course_id === courseId && as.student_id === studentId);
  const quizzes = db.find('quizzes', (q) => q.course_id === courseId);
  const quizAttempts = db.find('quiz_attempts', (qa) => qa.course_id === courseId && qa.student_id === studentId);

  // Criteria weights (default or custom)
  const criteria = course?.completion_criteria || {
    video_weight: 30,
    assignment_weight: 25,
    quiz_weight: 15,
    practical_weight: 10,
    exam_weight: 20,
    min_total_pct: 60
  };

  // 1. Videos Progress
  const videoLessons = lessons.filter((l) => l.lesson_type === 'VIDEO');
  const completedVideos = videoLessons.filter((vl) => {
    const prog = progressRecords.find((p) => p.lesson_id === vl.id);
    return prog?.status === 'COMPLETED';
  });
  const videoPct = videoLessons.length > 0 ? (completedVideos.length / videoLessons.length) * 100 : 100;

  // 2. Assignments Progress & Scores
  const completedAssignments = assignmentSubmissions.filter((s) => s.status === 'GRADED' || s.status === 'EVALUATED' || s.status === 'SUBMITTED');
  const gradedAssignments = assignmentSubmissions.filter((s) => (s.status === 'GRADED' || s.status === 'EVALUATED') && s.marks_obtained !== undefined);
  const avgAssignmentScore = gradedAssignments.length > 0
    ? gradedAssignments.reduce((sum, s) => sum + (s.marks_obtained / (s.max_marks || 100)) * 100, 0) / gradedAssignments.length
    : 0;
  const assignmentPct = assignments.length > 0 ? (completedAssignments.length / assignments.length) * 100 : 100;

  // 3. Quizzes Progress & Scores
  const passedQuizzes = quizzes.filter((q) => {
    const attempts = quizAttempts.filter((qa) => qa.quiz_id === q.id);
    return attempts.some((att) => att.passed || att.percentage >= (q.passing_percentage || 60));
  });
  const avgQuizScore = quizAttempts.length > 0
    ? quizAttempts.reduce((sum, qa) => sum + qa.percentage, 0) / quizAttempts.length
    : 0;
  const quizPct = quizzes.length > 0 ? (passedQuizzes.length / quizzes.length) * 100 : 100;

  // 4. Practical / Lab Tasks
  const practicalLessons = lessons.filter((l) => l.lesson_type === 'PRACTICAL');
  const completedPracticals = practicalLessons.filter((pl) => {
    const prog = progressRecords.find((p) => p.lesson_id === pl.id);
    return prog?.status === 'COMPLETED';
  });
  const practicalPct = practicalLessons.length > 0 ? (completedPracticals.length / practicalLessons.length) * 100 : 100;

  // 5. Final Exam / Assessment
  const examLessons = lessons.filter((l) => l.lesson_type === 'EXAM');
  const completedExams = examLessons.filter((el) => {
    if (el.quiz_id) {
      const attempts = quizAttempts.filter((qa) => qa.quiz_id === el.quiz_id);
      return attempts.some((att) => att.passed || att.percentage >= 60);
    }
    const prog = progressRecords.find((p) => p.lesson_id === el.id);
    return prog?.status === 'COMPLETED';
  });
  const examPct = examLessons.length > 0 ? (completedExams.length / examLessons.length) * 100 : 100;

  // Weighted total calculation
  const totalWeight = (criteria.video_weight || 30) +
                      (criteria.assignment_weight || 25) +
                      (criteria.quiz_weight || 15) +
                      (criteria.practical_weight || 10) +
                      (criteria.exam_weight || 20);

  const weightedScore = (
    (videoPct * (criteria.video_weight || 30)) +
    (assignmentPct * (criteria.assignment_weight || 25)) +
    (quizPct * (criteria.quiz_weight || 15)) +
    (practicalPct * (criteria.practical_weight || 10)) +
    (examPct * (criteria.exam_weight || 20))
  ) / (totalWeight || 100);

  const overallProgress = Math.min(100, Math.round(weightedScore));

  // Determine if mandatory requirements are met
  const missingRequirements: string[] = [];
  if (videoLessons.length > 0 && completedVideos.length < videoLessons.length) {
    missingRequirements.push(`Complete all ${videoLessons.length} video lectures (${completedVideos.length}/${videoLessons.length} finished)`);
  }
  if (assignments.length > 0 && completedAssignments.length < assignments.length) {
    missingRequirements.push(`Submit all ${assignments.length} assignments (${completedAssignments.length}/${assignments.length} submitted)`);
  }
  if (quizzes.length > 0 && passedQuizzes.length < quizzes.length) {
    missingRequirements.push(`Pass all ${quizzes.length} unit quizzes (${passedQuizzes.length}/${quizzes.length} passed)`);
  }
  if (examLessons.length > 0 && completedExams.length < examLessons.length) {
    missingRequirements.push(`Pass the Course Final Assessment (${completedExams.length}/${examLessons.length} completed)`);
  }
  if (overallProgress < (criteria.min_total_pct || 60)) {
    missingRequirements.push(`Attain overall minimum aggregate score of ${criteria.min_total_pct || 60}% (current: ${overallProgress}%)`);
  }

  const isCompleted = missingRequirements.length === 0 && overallProgress >= (criteria.min_total_pct || 60);

  // Update enrollment record
  if (enrollment) {
    const updates: any = {
      overall_progress_pct: overallProgress,
      completed_lessons_count: completedVideos.length + completedAssignments.length + passedQuizzes.length + completedPracticals.length + completedExams.length,
      total_lessons_count: lessons.length
    };

    if (isCompleted && enrollment.status !== 'COMPLETED') {
      updates.status = 'COMPLETED';
      updates.completed_at = new Date().toISOString();
      updates.certificate_issued = true;
      updates.certificate_id = `CERT-${course?.code || 'CRS'}-${studentId.slice(0, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
      updates.certificate_issued_at = new Date().toISOString();

      // Create notification and audit
      const studentProfile = db.findById('students', studentId);
      if (studentProfile) {
        db.createNotification(
          studentProfile.profile_id,
          `🎓 Course Completed: ${course?.name}`,
          `Congratulations! You have satisfied all academic and practical requirements for ${course?.code}. Your verified certificate (${updates.certificate_id}) is now ready.`,
          'INFO',
          `/student/courses/${courseId}`
        );
      }
    }

    db.update('enrollments', enrollment.id, updates);
  }

  return {
    overall_progress: overallProgress,
    is_completed: isCompleted,
    completed_at: enrollment?.completed_at,
    certificate_issued: enrollment?.certificate_issued || isCompleted,
    certificate_id: enrollment?.certificate_id,
    videos: {
      total: videoLessons.length,
      completed: completedVideos.length,
      percentage: Math.round(videoPct),
      weight: criteria.video_weight || 30
    },
    assignments: {
      total: assignments.length,
      completed: completedAssignments.length,
      average_score: Math.round(avgAssignmentScore),
      percentage: Math.round(assignmentPct),
      weight: criteria.assignment_weight || 25
    },
    quizzes: {
      total: quizzes.length,
      completed: passedQuizzes.length,
      average_score: Math.round(avgQuizScore),
      percentage: Math.round(quizPct),
      weight: criteria.quiz_weight || 15
    },
    practicals: {
      total: practicalLessons.length,
      completed: completedPracticals.length,
      percentage: Math.round(practicalPct),
      weight: criteria.practical_weight || 10
    },
    exams: {
      total: examLessons.length,
      completed: completedExams.length,
      score: Math.round(examPct),
      percentage: Math.round(examPct),
      weight: criteria.exam_weight || 20
    },
    requirements_met: isCompleted,
    missing_requirements: missingRequirements
  };
}

// ----------------------------------------------------
// AI COURSE ASSISTANT & REAL RECOMMENDATIONS (GEMINI)
// ----------------------------------------------------

export async function generateAICourseTutorResponse(params: {
  courseId: string;
  moduleId?: string;
  lessonId?: string;
  message: string;
  history?: Array<{ role: string; content: string }>;
  language?: 'English' | 'Tamil' | 'Hindi' | string;
  userName?: string;
  userRole?: string;
}) {
  const course = db.findById('courses', params.courseId);
  const currentModule = params.moduleId ? db.findById('course_modules', params.moduleId) : null;
  const currentLesson = params.lessonId ? db.findById('course_lessons', params.lessonId) : null;

  const gemini = getGeminiClient();
  const language = params.language || 'English';

  const systemContext = `You are the SC EduSense AI Course Assistant and Academic Tutor.
Course Context:
- Course Code: ${course?.code || 'N/A'}
- Course Title: ${course?.name || 'N/A'}
- Department: ${course?.department || 'N/A'}
- Course Type: ${course?.course_type || 'N/A'}
- Current Unit/Module: ${currentModule ? currentModule.title : 'Overview / All Units'}
- Current Lesson: ${currentLesson ? `${currentLesson.title} (${currentLesson.lesson_type})` : 'General Course Room'}
- Current Lesson Objectives: ${currentLesson?.learning_objectives ? JSON.stringify(currentLesson.learning_objectives) : 'N/A'}
- Student Name: ${params.userName || 'Student'}

Instructions:
1. Provide accurate, clear, and pedagogically rich academic guidance.
2. If asked to explain in Tamil or Hindi, or if language is '${language}', respond in that language with high clarity while keeping technical terms recognizable.
3. Offer practical examples, step-by-step mathematical or code breakdowns where relevant.
4. Keep explanations constructive, encouraging, and directly grounded in the syllabus context.
5. Provide 2-3 brief suggested follow-up questions at the end.`;

  if (!gemini) {
    // High-quality deterministic fallback if GEMINI_API_KEY is not configured
    let langGreeting = `Hello ${params.userName || 'Student'}!`;
    if (language === 'Tamil') langGreeting = `வணக்கம் ${params.userName || 'மாணவரே'}!`;
    if (language === 'Hindi') langGreeting = `नमस्ते ${params.userName || 'विद्यार्थी'}!`;

    return {
      reply: `${langGreeting}\n\nRegarding **${params.message}** in **${course?.code || 'this course'}** (${currentLesson?.title || currentModule?.title || 'General'}):\n\n* **Core Principle**: In this domain, concepts are structured around robust mathematical invariants and systematic algorithmic complexity bounds.\n* **Implementation Tip**: Focus on establishing clear input/output assertions and verifying edge-case handling before testing larger workloads.\n* **Study Strategy**: Review the lecture slides for ${currentModule?.title || 'Unit 1'}, complete the unit self-check quiz, and test your code against the assignment starter template.\n\n*Let me know if you would like step-by-step examples or practice problems!*`,
      suggested_followups: [
        `Explain the core mathematical formula in ${currentLesson?.title || 'this topic'}`,
        `Generate 3 practice questions with step-by-step solutions`,
        `How does this concept apply in industry software systems?`
      ],
      referenced_units: currentModule ? [currentModule.title] : ['Unit 1']
    };
  }

  try {
    const formattedHistory = (params.history || []).map((h) => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }]
    }));

    const promptText = `User Message: "${params.message}"\nTarget Language: ${language}`;
    const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-3.7-flash'];
    let replyText = '';

    for (const model of candidateModels) {
      try {
        const response = await gemini.models.generateContent({
          model,
          contents: [
            ...formattedHistory,
            {
              role: 'user',
              parts: [{ text: `${systemContext}\n\n${promptText}` }]
            }
          ]
        });

        if (response && response.text) {
          replyText = response.text;
          break;
        }
      } catch (modelErr: any) {
        console.warn(`[LMS AI Tutor] Model ${model} unavailable, trying fallback model...`);
      }
    }

    if (replyText) {
      return {
        reply: replyText,
        suggested_followups: [
          `Can you summarize the key takeaways of this topic?`,
          `Create a 3-question practice quiz based on this`,
          `What is the most common mistake students make here?`
        ],
        referenced_units: currentModule ? [currentModule.title] : ['Unit 1']
      };
    }
  } catch (err: any) {
    console.error('Gemini Course Tutor API Error:', err);
  }
  return {
    reply: `I encountered a connection issue with the AI engine. However, based on your syllabus for **${course?.name}**, ensure you understand the foundational definitions in **${currentModule?.title || 'Unit 1'}** and review the accompanying lecture notes.`,
    suggested_followups: [`Explain Unit 1 core concepts`, `Review assignment requirements`],
    referenced_units: ['Unit 1']
  };
}

// ----------------------------------------------------
// GEMINI REAL ACADEMIC RECOMMENDATIONS
// ----------------------------------------------------

export async function generateStudentAcademicRecommendations(studentId: string) {
  const student = db.findById('students', studentId);
  const profile = student ? db.findById('profiles', student.profile_id) : null;
  if (!student) {
    return {
      recommendations: [],
      has_sufficient_data: false,
      message: 'Not enough learning data available yet.'
    };
  }

  const enrollments = db.find('enrollments', (e) => e.student_id === studentId && e.status !== 'DROPPED');
  const submissions = db.find('assignment_submissions', (s) => s.student_id === studentId);
  const quizAttempts = db.find('quiz_attempts', (qa) => qa.student_id === studentId);
  const attendanceRecords = db.find('attendance_records', (ar) => ar.student_id === studentId);
  const examResults = db.find('exam_results', (er) => er.student_id === studentId);

  const totalLearningEvents = enrollments.length + submissions.length + quizAttempts.length + attendanceRecords.length + examResults.length;

  if (totalLearningEvents < 2) {
    return {
      recommendations: [],
      has_sufficient_data: false,
      message: 'Not enough learning data available yet. Complete more lessons, quizzes, or assignments to unlock personalized AI recommendations.'
    };
  }

  // Calculate actual attendance percentage
  let attendancePct = 85;
  if (attendanceRecords.length > 0) {
    const present = attendanceRecords.filter((r) => r.status === 'PRESENT').length;
    const late = attendanceRecords.filter((r) => r.status === 'LATE').length;
    attendancePct = Math.round(((present + late * 0.5) / attendanceRecords.length) * 100);
  }

  // Course-specific progress data
  const enrolledCoursesData = enrollments.map((en) => {
    const course = db.findById('courses', en.course_id);
    const cSubmissions = submissions.filter((s) => s.course_id === en.course_id);
    const cQuizzes = quizAttempts.filter((q) => q.course_id === en.course_id);
    const avgSubScore = cSubmissions.length > 0 ? Math.round(cSubmissions.reduce((a, s) => a + (s.marks_obtained || 0), 0) / cSubmissions.length) : null;
    const avgQuizScore = cQuizzes.length > 0 ? Math.round(cQuizzes.reduce((a, q) => a + (q.percentage || 0), 0) / cQuizzes.length) : null;

    return {
      course_id: en.course_id,
      course_code: course?.code || 'CRS',
      course_name: course?.name || 'Course',
      progress_pct: en.overall_progress_pct || 0,
      avg_assignment_score: avgSubScore,
      avg_quiz_score: avgQuizScore
    };
  });

  const gemini = getGeminiClient();

  if (gemini) {
    try {
      const prompt = `Analyze this student's actual university academic data and provide 3 actionable, highly specific learning recommendations.
Student Profile:
- Name: ${profile?.full_name || 'Alex'}
- Major: ${student.major || 'Computer Science'}
- Semester: ${student.semester || 4}
- Attendance Rate: ${attendancePct}%
- Enrolled Courses & Real Metrics: ${JSON.stringify(enrolledCoursesData)}
- Recent Submissions Count: ${submissions.length}
- Recent Quiz Attempts Count: ${quizAttempts.length}

Format your response as a valid JSON array of objects with keys:
"title": short action-oriented recommendation title,
"category": one of "Coursework", "Quizzes", "Assignments", "Attendance", "Study Strategy",
"priority": "HIGH" | "MEDIUM" | "LOW",
"analysis": 1-2 sentence diagnostic of why this is recommended based on actual metrics,
"action_text": clear next action for the student,
"target_course_code": string course code or "ALL".

Return ONLY the valid JSON array without markdown backticks.`;

      const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-3.7-flash'];
      let parsed: any = null;

      for (const model of candidateModels) {
        try {
          const resp = await gemini.models.generateContent({
            model,
            contents: prompt
          });

          const cleanJson = (resp.text || '').replace(/```json/g, '').replace(/```/g, '').trim();
          const p = JSON.parse(cleanJson);
          if (Array.isArray(p) && p.length > 0) {
            parsed = p;
            break;
          }
        } catch (modelErr: any) {
          console.warn(`[LMS Academic Recommendations] Model ${model} unavailable, trying fallback model...`);
        }
      }

      if (parsed && Array.isArray(parsed) && parsed.length > 0) {
        return {
          recommendations: parsed,
          has_sufficient_data: true,
          message: 'Personalized recommendations generated based on your real course metrics and assessment performance.'
        };
      }
    } catch (err) {
      console.warn('Gemini Academic Recommendation fallback used:', err);
    }
  }

  // Deterministic fallback based on actual data
  const dynamicRecs = [];
  enrolledCoursesData.forEach((cd) => {
    if (cd.progress_pct < 50) {
      dynamicRecs.push({
        title: `Accelerate Progress in ${cd.course_code}`,
        category: 'Coursework',
        priority: 'HIGH',
        analysis: `Your progress in ${cd.course_name} is currently at ${cd.progress_pct}%, which is behind the recommended pace for this semester.`,
        action_text: `Watch the next video lecture in Unit 2 and complete the accompanying reading notes.`,
        target_course_code: cd.course_code
      });
    }
    if (cd.avg_quiz_score !== null && cd.avg_quiz_score < 70) {
      dynamicRecs.push({
        title: `Strengthen Fundamentals for ${cd.course_code} Quizzes`,
        category: 'Quizzes',
        priority: 'MEDIUM',
        analysis: `Your average quiz score in ${cd.course_code} is ${cd.avg_quiz_score}%. Reviewing algorithmic proofs will improve assessment scores.`,
        action_text: `Retake the Unit 1 Self-Assessment Quiz and use the AI Tutor to clarify incorrect answers.`,
        target_course_code: cd.course_code
      });
    }
  });

  if (attendancePct < 80) {
    dynamicRecs.push({
      title: 'Monitor Attendance Compliance',
      category: 'Attendance',
      priority: 'HIGH',
      analysis: `Your aggregate attendance rate of ${attendancePct}% is approaching the mandatory institutional minimum threshold of 75%.`,
      action_text: 'Ensure consistent attendance in upcoming scheduled class sections.',
      target_course_code: 'ALL'
    });
  }

  if (dynamicRecs.length === 0) {
    dynamicRecs.push({
      title: 'Maintain Strong Academic Trajectory',
      category: 'Study Strategy',
      priority: 'LOW',
      analysis: `You are consistently on track across enrolled courses with healthy progress and strong assessment metrics.`,
      action_text: 'Explore NPTEL certifications and advanced elective topics to build competitive placement credentials.',
      target_course_code: enrolledCoursesData[0]?.course_code || 'ALL'
    });
  }

  return {
    recommendations: dynamicRecs.slice(0, 4),
    has_sufficient_data: true,
    message: 'Personalized recommendations generated based on your real course metrics and assessment performance.'
  };
}
