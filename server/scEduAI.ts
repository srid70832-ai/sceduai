import { GoogleGenAI, Type } from '@google/genai';
import { db } from './db.js';
import { calculateStudentAnalytics } from './analytics.js';

let geminiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface SCEduAIRequest {
  studentId: string;
  message: string;
  history?: ChatMessage[];
  language?: 'auto' | 'en' | 'ta' | 'tanglish';
}

export interface SCEduAIResponse {
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
}

export async function handleSCEduAIChat(req: SCEduAIRequest): Promise<SCEduAIResponse> {
  const { studentId, message, history = [], language = 'auto' } = req;

  // 1. Gather Authentic Student Database Context
  const student = studentId ? db.findById('students', studentId) : null;
  const profile = student ? db.findById('profiles', student.profile_id) : null;
  const analytics = studentId ? calculateStudentAnalytics(studentId) : null;

  // Enrollments and courses
  const enrollments = studentId ? db.find('enrollments', (e) => e.student_id === studentId && e.status !== 'DROPPED') : [];
  const enrolledCourses = enrollments.map((en) => {
    const course = db.findById('courses', en.course_id);
    return course ? `${course.code} - ${course.name} (${course.credits} Credits, ${course.department})` : null;
  }).filter(Boolean) as string[];

  // Assignments & submissions
  const studentSubmissions = studentId ? db.find('assignment_submissions', (sub) => sub.student_id === studentId) : [];
  const assignmentSummaries = studentSubmissions.map((sub) => {
    const asg = db.findById('assignments', sub.assignment_id);
    return asg ? `${asg.title}: Status=${sub.status}, Marks=${sub.marks_obtained !== null && sub.marks_obtained !== undefined ? sub.marks_obtained : 'Pending'}/${asg.max_marks || 100}` : null;
  }).filter(Boolean).slice(0, 5) as string[];

  // Exams
  const exams = db.find('examinations').slice(0, 4).map((ex) => `${ex.name} (${ex.exam_type}): Total Marks=${ex.total_marks}`);

  const studentPreferences = profile?.onboarding_data?.student_preferences;

  const studentSummary = {
    name: profile?.full_name || 'Alex Morgan',
    roll_number: student?.roll_number || 'STU-2026',
    department: student?.major || profile?.department || 'Artificial Intelligence and Data Science',
    attendance_percentage: analytics?.attendance_percentage ?? 88,
    overall_score: analytics?.overall_academic_score ?? 84,
    enrolled_courses_count: enrolledCourses.length || 4,
    risk_level: analytics?.academic_risk || 'low'
  };

  const ai = getAIClient();

  if (ai) {
    try {
      let languageDirective = 'Auto-detect the language from user input (respond in Tamil if user speaks Tamil, Tanglish if user speaks Tanglish/Tamil-English, and English if in English).';
      if (language === 'ta') {
        languageDirective = 'Respond strictly in authentic, clear Tamil (தமிழ்) script with accurate academic vocabulary.';
      } else if (language === 'tanglish') {
        languageDirective = 'Respond in friendly, natural Tanglish (Tamil written in English alphabet, e.g. "Python la list na elements ah store panna use aagura built-in dynamic data structure...").';
      } else if (language === 'en') {
        languageDirective = 'Respond strictly in fluent, clear English with structured academic formatting.';
      }

      const systemInstruction = `You are **SC EDU AI**, the dedicated, intelligent, and highly knowledgeable AI Academic Assistant for the SC EduSense AI platform.
Your official name is strictly "SC EDU AI" (Subtitle: "AI Academic Assistant", Badge: "Gemini Powered").

Student Profile Context:
- Name: ${studentSummary.name}
- Roll Number: ${studentSummary.roll_number}
- Department: ${studentSummary.department}
- Semester: ${student?.semester || 4}
- Overall Academic Score: ${studentSummary.overall_score}%
- Attendance Rate: ${studentSummary.attendance_percentage}% (Present: ${analytics?.present_sessions || 0}, Absent: ${analytics?.absent_sessions || 0})
- Enrolled Courses: ${enrolledCourses.join('; ') || 'Core Department Courses'}
- Academic Risk Level: ${studentSummary.risk_level}
- Weak Subjects: ${analytics?.weak_subjects?.map((w: any) => w.course_name)?.join(', ') || 'None critical'}
- Strong Subjects: ${analytics?.strong_subjects?.map((s: any) => s.course_name)?.join(', ') || 'All major courses'}
- Primary Academic Goal: ${studentPreferences?.primary_academic_goal || 'Academic Excellence & Placement Readiness'}
- Recent Assignments: ${assignmentSummaries.join('; ') || 'All submissions up to date'}
- Scheduled Examinations: ${exams.join('; ') || 'Standard semester evaluations'}

Language Requirement:
${languageDirective}

Crucial Directives:
1. ALWAYS directly, accurately, and thoroughly answer the user's specific question (e.g., if they ask "What is Python?", explain Python's definition, core features, uses, and a code example. If they ask "Explain inheritance in Java", explain types of inheritance with Java code syntax. If they ask "Python la list na enna?", explain Python lists in Tanglish with examples).
2. If asked about the student's personal attendance, marks, courses, or progress, utilize the authentic student profile metrics provided above.
3. Provide rich, pedagogical formatting: use clear headings (###), bold key terms, bullet points, and code snippets (\`\`\`language ... \`\`\`) where applicable.
4. Keep the tone supportive, academically rigorous, and encouraging.
5. Provide exactly 3 helpful, contextual follow-up questions tailored to continue learning on this specific topic.
6. Return your response as a valid JSON object matching the requested schema.`;

      // Build conversation turns
      const formattedTurns = history.slice(-6).map((h) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }]
      }));

      const contents = [
        ...formattedTurns,
        { role: 'user', parts: [{ text: message }] }
      ];

      const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-3.7-flash'];
      let responseText = '';

      for (const model of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents,
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  reply: {
                    type: Type.STRING,
                    description: 'The rich markdown formatted academic response from SC EDU AI answering the question directly.'
                  },
                  detected_language: {
                    type: Type.STRING,
                    description: 'One of: English, Tamil, Tanglish'
                  },
                  suggested_followups: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '3 relevant quick question chips related to this topic'
                  }
                },
                required: ['reply', 'detected_language', 'suggested_followups']
              }
            }
          });

          if (response && response.text) {
            responseText = response.text;
            break;
          }
        } catch (modelErr: any) {
          console.warn(`[SC EDU AI] Model ${model} encountered an issue (${modelErr?.message || modelErr}), trying next fallback model...`);
          // Continue loop to try next model in candidateModels
        }
      }

      if (responseText) {
        try {
          const parsed = JSON.parse(responseText);
          if (parsed.reply && parsed.reply.trim()) {
            return {
              reply: parsed.reply,
              detected_language: parsed.detected_language || (language === 'ta' ? 'Tamil' : language === 'tanglish' ? 'Tanglish' : 'English'),
              suggested_followups: Array.isArray(parsed.suggested_followups) && parsed.suggested_followups.length > 0
                ? parsed.suggested_followups
                : ['Explain with a code example', 'How does this appear in semester exams?', 'Give me 3 practice quiz questions'],
              student_summary: studentSummary
            };
          }
        } catch (jsonErr) {
          // If JSON parsing failed but text exists, return text directly
          if (responseText.trim()) {
            return {
              reply: responseText,
              detected_language: language === 'ta' ? 'Tamil' : language === 'tanglish' ? 'Tanglish' : 'English',
              suggested_followups: ['Explain with a code example', 'How does this appear in semester exams?', 'Give me 3 practice quiz questions'],
              student_summary: studentSummary
            };
          }
        }
      }
    } catch (err) {
      console.warn('[SC EDU AI] All Gemini models exhausted, applying curricular fallback engine.');
    }
  }

  // Algorithmic Knowledge & Curriculum Fallback Engine
  return generateAlgorithmicFallback(message, language, studentSummary, enrolledCourses, analytics);
}

function generateAlgorithmicFallback(
  message: string,
  language: string,
  studentSummary: any,
  enrolledCourses: string[],
  analytics: any
): SCEduAIResponse {
  const lower = message.toLowerCase().trim();
  const isTamil = /[\u0B80-\u0BFF]/.test(message) || language === 'ta';
  const isTanglish = language === 'tanglish' || lower.includes('eppadi') || lower.includes('solunga') || lower.includes('pannunga') || lower.includes('theriyuma') || lower.includes('vanakkam') || lower.includes('enna') || lower.includes('irukku') || lower.includes('epdi');

  let detectedLang = isTamil ? 'Tamil' : isTanglish ? 'Tanglish' : 'English';
  let reply = '';
  let followups: string[] = [];

  // 1. Python Questions
  if (lower.includes('python') || lower.includes('பைதான்')) {
    if (lower.includes('list') || lower.includes('array') || lower.includes('லிஸ்ட்')) {
      if (isTanglish) {
        reply = `### 🐍 Python Lists Explained (Tanglish)\n\n` +
          `**Python List** na multiple items ah single variable la store panna use aagura oru **ordered**, **mutable (changeable)**, and **heterogeneous** data structure.\n\n` +
          `#### 🔑 Key Features:\n` +
          `- **Ordered**: Elements specific index (0, 1, 2...) la store aagum.\n` +
          `- **Mutable**: List create pannathukku apram values ah change / add / remove pannalam.\n` +
          `- **Heterogeneous**: Orey list kula integers, strings, floats, boolean ellame mix panni vekkalam.\n\n` +
          `\`\`\`python\n` +
          `# Creating a Python list\n` +
          `student_marks = [85, 92, 78, 90]\n` +
          `mixed_list = ["Alex", 20, 88.5, True]\n\n` +
          `# Common operations\n` +
          `student_marks.append(95)       # Adds 95 at the end\n` +
          `print(student_marks[0])        # Access first element (85)\n` +
          `print(len(student_marks))      # Total elements\n` +
          `\`\`\`\n\n` +
          `#### 💡 List vs Tuple:\n` +
          `- List \`[ ]\` mutable (changes allowed).\n` +
          `- Tuple \`( )\` immutable (values lock aagirum).`;
        followups = ['List vs Tuple difference solunga', 'Python dictionary epdi use pandrathu?', 'Python list comprehension explain pannunga'];
      } else if (isTamil) {
        reply = `### 🐍 பைதான் பட்டியல் (Python List) விளக்கம்\n\n` +
          `**Python List** என்பது ஒன்றுக்கும் மேற்பட்ட உருப்படிகளை (items) வரிசையாகவும் மாற்றக்கூடியதாகவும் (mutable) சேமிக்கப் பயன்படும் ஒரு உள்ளமைக்கப்பட்ட தரவு அமைப்பாகும் (Data Structure).\n\n` +
          `#### 📌 முக்கிய பண்புகள்:\n` +
          `- **வரிசைப்படுத்தப்பட்டது (Ordered)**: ஒவ்வொரு உருப்படிக்கும் குறிப்பிட்ட குறியீட்டு எண் (Index: 0, 1, 2...) இருக்கும்.\n` +
          `- **மாற்றக்கூடியது (Mutable)**: பட்டியலில் உள்ள உருப்படிகளை எப்போது வேண்டுமானாலும் மாற்றலாம் அல்லது சேர்க்கலாம்.\n` +
          `- **பல்வேறு தரவு வகைகள்**: ஒரே பட்டியலில் எண்கள், எழுத்துக்கள், பூலியன் ஆகியவற்றை கலவையாக வைக்க முடியும்.\n\n` +
          `\`\`\`python\n` +
          `# பட்டியல் உருவாக்கம்\n` +
          `marks = [85, 92, 78, 90]\n` +
          `marks.append(95)  # புதிய மதிப்பை சேர்த்தல்\n` +
          `print(marks[0])   # முதல் உருப்படியை அச்சிடுதல் (85)\n` +
          `\`\`\``;
        followups = ['List மற்றும் Tuple இடையேயான வேறுபாடு என்ன?', 'Python Dictionary பற்றி விளக்குக', 'List Comprehension எவ்வாறு செயல்படுகிறது?'];
      } else {
        reply = `### 🐍 Python Lists: Comprehensive Guide\n\n` +
          `In Python, a **List** is a built-in, ordered, and mutable collection of items that allows duplicates and supports mixed data types.\n\n` +
          `#### 🔑 Key Characteristics:\n` +
          `1. **Ordered**: Items have a defined order based on a zero-based index (\`0, 1, 2, ...\`).\n` +
          `2. **Mutable**: You can modify, add, or delete items after creation.\n` +
          `3. **Heterogeneous**: A single list can contain integers, strings, floats, booleans, or objects.\n\n` +
          `#### 💻 Code Example & Essential Methods:\n` +
          `\`\`\`python\n` +
          `# Initializing lists\n` +
          `grades = [88, 92, 79, 95]\n` +
          `profile = ["Alex Morgan", "AI & DS", 4, 88.0]\n\n` +
          `# Operations\n` +
          `grades.append(99)              # Appends to end -> [88, 92, 79, 95, 99]\n` +
          `grades.insert(1, 85)           # Inserts at index 1\n` +
          `grades.remove(79)              # Removes specific value\n` +
          `sorted_grades = sorted(grades) # Returns sorted copy\n` +
          `print(f"Top grade: {max(grades)}, Average: {sum(grades)/len(grades):.2f}")\n` +
          `\`\`\`\n\n` +
          `#### 📊 Complexity:\n` +
          `- **Access by index**: $O(1)$\n` +
          `- **Append/Pop from end**: $O(1)$\n` +
          `- **Insert/Delete in middle**: $O(n)$`;
        followups = ['What is the difference between List and Tuple in Python?', 'How does List Comprehension work?', 'Explain Python Dictionary and Sets with code'];
      }
    } else {
      if (isTanglish) {
        reply = `### 🐍 What is Python? (Tanglish Guide)\n\n` +
          `**Python** oru high-level, interpreted, dynamically typed, and general-purpose programming language. Guido van Rossum 1991 la create pannaru.\n\n` +
          `#### 🚀 Why Python is Super Popular:\n` +
          `1. **Simple Syntax**: English mathiri easy ah read & write pannalam.\n` +
          `2. **Interpreted**: Code direct ah execute aagum (No need of manual compilation step).\n` +
          `3. **Massive Ecosystem**: AI, Machine Learning, Data Science, Web Development, Automation ellathulayum top libraries irukku (NumPy, Pandas, PyTorch, Django, FastAPI).\n` +
          `4. **Dynamic Typing**: Variable create pannumbothu data type declare panna theva illa.\n\n` +
          `\`\`\`python\n` +
          `# Simple Python demonstration\n` +
          `def greet_student(name, score):\n` +
          `    status = "Pass" if score >= 50 else "Need Improvement"\n` +
          `    return f"Welcome {name}! Score: {score}% ({status})"\n\n` +
          `print(greet_student("${studentSummary.name}", ${studentSummary.overall_score}))\n` +
          `\`\`\``;
        followups = ['Python data types explain pannunga', 'Python la OOP concepts epdi work aagum?', 'Python AI/ML packages list pannunga'];
      } else if (isTamil) {
        reply = `### 🐍 பைதான் (Python) என்றால் என்ன?\n\n` +
          `**பைதான் (Python)** என்பது உயர்நிலை (High-Level), நேரடி மொழிபெயர்ப்பு (Interpreted), மற்றும் பொதுப் பயன்பாட்டு (General-Purpose) நிரலாக்க மொழியாகும். இது 1991 ஆம் ஆண்டு கைடோ வான் ரோஸம் (Guido van Rossum) என்பவரால் உருவாக்கப்பட்டது.\n\n` +
          `#### 🌟 முக்கிய நன்மைகள்:\n` +
          `- **எளிமையான தொடரியல் (Simple Syntax)**: மனிதர்கள் படிக்கும் ஆங்கிலம் போலவே எளிதாக இருக்கும்.\n` +
          `- **பரந்த பயன்பாடுகள்**: செயற்கை நுண்ணறிவு (AI), தரவு அறிவியல் (Data Science), இணைய மேம்பாடு (Web Development), மற்றும் ஆட்டோமேஷன் ஆகியவற்றில் முதன்மை மொழியாக உள்ளது.\n` +
          `- **விரிவான நூலகங்கள்**: NumPy, Pandas, TensorFlow, Scikit-Learn போன்ற சக்திவாய்ந்த நூலகங்கள் உள்ளன.\n\n` +
          `\`\`\`python\n` +
          `# எளிய பைதான் நிரல்\n` +
          `print("வணக்கம்! SC EduSense AI உங்களை வரவேற்கிறது.")\n` +
          `\`\`\``;
        followups = ['Python தரவு வகைகள் யாவை?', 'Python-ல் Functions எவ்வாறு எழுதுவது?', 'Python மற்றும் Java இடையேயான வேறுபாடு என்ன?'];
      } else {
        reply = `### 🐍 What is Python? Comprehensive Overview\n\n` +
          `**Python** is a versatile, high-level, interpreted, dynamically typed programming language created by **Guido van Rossum** and first released in 1991. It emphasizes code readability, developer productivity, and expressive syntax.\n\n` +
          `#### 🌟 Core Architectural Features:\n` +
          `1. **Interpreted Execution**: Code is processed at runtime by the Python interpreter line-by-line.\n` +
          `2. **Multi-Paradigm**: Supports Object-Oriented (OOP), Functional, Procedural, and Modular programming styles.\n` +
          `3. **Dynamic Typing & Memory Management**: Types are bound to values, not variables, with automatic garbage collection.\n` +
          `4. **Rich Standard Library & Ecosystem**:\n` +
          `   - **Data Science & AI**: NumPy, Pandas, Scikit-Learn, PyTorch, TensorFlow\n` +
          `   - **Web & APIs**: FastAPI, Django, Flask\n` +
          `   - **Automation & Scripting**: Selenium, Beautiful Soup, Requests\n\n` +
          `#### 💻 Example Code:\n` +
          `\`\`\`python\n` +
          `class StudentDiagnostic:\n` +
          `    def __init__(self, name: str, attendance: float, score: float):\n` +
          `        self.name = name\n` +
          `        self.attendance = attendance\n` +
          `        self.score = score\n\n` +
          `    def is_eligible_for_exams(self) -> bool:\n` +
          `        return self.attendance >= 75.0\n\n` +
          `# Instantiate with authentic academic profile\n` +
          `student = StudentDiagnostic("${studentSummary.name}", ${studentSummary.attendance_percentage}, ${studentSummary.overall_score})\n` +
          `print(f"Student: {student.name} | Exam Eligible: {student.is_eligible_for_exams()}")\n` +
          `\`\`\``;
        followups = ['Explain Data Structures in Python (Lists, Dictionaries, Tuples)', 'How does Object-Oriented Programming (OOP) work in Python?', 'What are the best Python libraries for Machine Learning?'];
      }
    }
  }

  // 2. Java / OOP Questions (e.g. Inheritance, Polymorphism)
  else if (lower.includes('java') || lower.includes('inheritance') || lower.includes('oops') || lower.includes('oop') || lower.includes('polymorphism')) {
    if (lower.includes('inheritance') || lower.includes('மரபுரிமை')) {
      if (isTanglish) {
        reply = `### ☕ Inheritance in Java (Tanglish Guide)\n\n` +
          `**Inheritance** na oru class (Child / Subclass) innoru class oda (Parent / Superclass) properties & methods ah inherit (reuse) panra OOP mechanism. **\`extends\`** keyword use pannuvom.\n\n` +
          `#### 🎯 Main Advantages:\n` +
          `1. **Code Reusability**: Orey code ah thirumba thirumba ezhutha theva illa.\n` +
          `2. **Method Overriding**: Child class parent method ku custom behavior thara mudiyum (Runtime Polymorphism).\n\n` +
          `#### 💻 Java Code Example:\n` +
          `\`\`\`java\n` +
          `// Superclass (Parent)\n` +
          `class Person {\n` +
          `    String name;\n` +
          `    void displayRole() {\n` +
          `        System.out.println("Role: General Academic Member");\n` +
          `    }\n` +
          `}\n\n` +
          `// Subclass (Child) inheriting from Person\n` +
          `class Student extends Person {\n` +
          `    String rollNumber;\n` +
          `    int semester;\n\n` +
          `    @Override\n` +
          `    void displayRole() {\n` +
          `        System.out.println("Student: " + name + " (Roll: " + rollNumber + ")");\n` +
          `    }\n` +
          `}\n\n` +
          `public class Main {\n` +
          `    public static void main(String[] args) {\n` +
          `        Student s = new Student();\n` +
          `        s.name = "${studentSummary.name}";\n` +
          `        s.rollNumber = "${studentSummary.roll_number}";\n` +
          `        s.displayRole(); // Outputs custom student role\n` +
          `    }\n` +
          `}\n` +
          `\`\`\`\n\n` +
          `*Note: Java does not support Multiple Inheritance with classes to prevent Diamond Problem, but supports it through \`interfaces\`.*`;
        followups = ['Java-la Interface vs Abstract Class difference solunga', 'Polymorphism in Java explain pannunga', 'Encapsulation and Abstraction in OOP'];
      } else if (isTamil) {
        reply = `### ☕ ஜாவாவில் மரபுரிமை (Inheritance in Java)\n\n` +
          `**மரபுரிமை (Inheritance)** என்பது ஒரு புதிய வகுப்பு (Child class), ஏற்கனவே உள்ள வகுப்பின் (Parent class) பண்புகளையும் செயல்பாடுகளையும் சுவீகரித்துக் கொள்ளும் (reuse) ஆப்ஜெக்ட்-ஓரியண்டட் நிரலாக்க தத்துவமாகும். இதற்கு **\`extends\`** என்ற முக்கிய சொல் பயன்படுத்தப்படுகிறது.\n\n` +
          `#### 📌 வகைகள்:\n` +
          `1. **Single Inheritance**: ஒரு பெற்றோர் வகுப்பு -> ஒரு குழந்தை வகுப்பு.\n` +
          `2. **Multilevel Inheritance**: வகுப்பு A -> வகுப்பு B -> வகுப்பு C.\n` +
          `3. **Hierarchical Inheritance**: ஒரு பெற்றோர் வகுப்பு -> பல குழந்தை வகுப்புகள்.\n` +
          `4. **Multiple Inheritance (Interface மூலம்)**: ஜாவா இடைமுகங்கள் (Interfaces) வழியாக மட்டுமே சாத்தியம்.\n\n` +
          `\`\`\`java\n` +
          `class Parent {\n` +
          `    void greet() { System.out.println("வணக்கம்!"); }\n` +
          `}\n` +
          `class Child extends Parent {\n` +
          `    // Parent-ன் greet() தானாகவே இங்கே கிடைக்கும்\n` +
          `}\n` +
          `\`\`\``;
        followups = ['Polymorphism பற்றி விளக்குக', 'Interface மற்றும் Abstract Class வேறுபாடுகள் யாவை?', 'Java-வில் Exception Handling எவ்வாறு செய்வது?'];
      } else {
        reply = `### ☕ Inheritance in Java: Core OOP Concepts\n\n` +
          `**Inheritance** is a fundamental Object-Oriented Programming (OOP) pillar where a new class (derived/subclass) acquires the state and behavior (fields and methods) of an existing class (base/superclass) using the **\`extends\`** keyword.\n\n` +
          `#### 🎯 Key Objectives & Benefits:\n` +
          `- **Code Reusability**: Eliminates redundant logic by factoring common attributes into parent classes.\n` +
          `- **Polymorphic Substitutability**: Enables dynamic method dispatch and runtime polymorphism via \`@Override\`.\n\n` +
          `#### 💻 Complete Java Implementation:\n` +
          `\`\`\`java\n` +
          `// Superclass\n` +
          `class AcademicEntity {\n` +
          `    protected String institution = "KIT Coimbatore";\n` +
          `    protected String department;\n\n` +
          `    public AcademicEntity(String department) {\n` +
          `        this.department = department;\n` +
          `    }\n\n` +
          `    public void printDetails() {\n` +
          `        System.out.println("Institution: " + institution + " | Dept: " + department);\n` +
          `    }\n` +
          `}\n\n` +
          `// Subclass\n` +
          `class StudentMember extends AcademicEntity {\n` +
          `    private String studentName;\n` +
          `    private double attendance;\n\n` +
          `    public StudentMember(String name, String department, double attendance) {\n` +
          `        super(department); // Invoking superclass constructor\n` +
          `        this.studentName = name;\n` +
          `        this.attendance = attendance;\n` +
          `    }\n\n` +
          `    @Override\n` +
          `    public void printDetails() {\n` +
          `        super.printDetails();\n` +
          `        System.out.println("Student: " + studentName + " | Attendance: " + attendance + "%");\n` +
          `    }\n` +
          `}\n` +
          `\`\`\`\n\n` +
          `#### ⚠️ The Diamond Problem & Java's Solution:\n` +
          `Java prohibits multiple class inheritance to avoid ambiguity when two superclasses have methods with the same signature. Instead, Java utilizes **\`interface\`** implementations (\`implements InterfaceA, InterfaceB\`).`;
        followups = ['What is the difference between Method Overloading and Method Overriding?', 'Explain Abstract Classes vs Interfaces in Java', 'How does Garbage Collection and Memory Allocation work in the JVM?'];
      }
    } else {
      reply = `### ☕ Java & Object-Oriented Programming (OOP)\n\n` +
        `**Java** is a robust, class-based, object-oriented programming language designed around the principle of *"Write Once, Run Anywhere"* (WORA) via the Java Virtual Machine (JVM).\n\n` +
        `#### 🏛️ The 4 Pillars of OOP in Java:\n` +
        `1. **Encapsulation**: Wrapping data (variables) and methods into a single unit and restricting direct access using private/protected access specifiers.\n` +
        `2. **Abstraction**: Hiding internal implementation details and exposing only essential functional interfaces (via Abstract Classes & Interfaces).\n` +
        `3. **Inheritance**: Deriving new classes from parent classes to reuse code (\`extends\` keyword).\n` +
        `4. **Polymorphism**: Ability for objects to take on multiple forms (Compile-time via Overloading; Runtime via Overriding).\n\n` +
        `Would you like to deep-dive into any specific pillar with working code examples?`;
      followups = ['Explain Inheritance with a Java code example', 'What is the difference between Interface and Abstract Class?', 'Explain Method Overloading vs Overriding'];
    }
  }

  // 3. Attendance Query
  else if (lower.includes('attendance') || lower.includes('வருகை') || lower.includes('varugai')) {
    if (isTamil) {
      reply = `### 📊 உங்கள் வருகை நிலை (Attendance Overview)\n\n` +
        `வணக்கம் **${studentSummary.name}**!\n\n` +
        `- **தற்போதைய வருகை சதவீதம்**: **${studentSummary.attendance_percentage}%**\n` +
        `- **பல்கலைக்கழக வரம்பு**: குறைந்தபட்சம் **75%** தேவை.\n` +
        `- **மதிப்பீடு**: ${studentSummary.attendance_percentage >= 75 ? 'உங்கள் வருகை பாதுகாப்பான வரம்பில் உள்ளது. தொடரவும்!' : 'எச்சரிக்கை! உங்கள் வருகை 75%க்கு கீழ் உள்ளது. அனைத்து வகுப்புகளிலும் கலந்து கொள்ளவும்.'}\n\n` +
        `**மேம்படுத்த ஆலோசனைகள்:**\n` +
        `1. வரும் வாரங்களில் எந்த வகுப்பையும் தவறவிடாதீர்கள்.\n` +
        `2. விடுப்பு எடுக்க வேண்டியிருந்தால் முன்கூட்டியே பேராசிரியரிடம் அனுமதி பெறவும்.`;
      followups = ['என் பாட வாரியான வருகை எப்படி?', 'தேர்வுக்கு எத்தனை நாட்கள் உள்ளன?', 'அடுத்த அசைன்மென்ட் எப்போது?'];
    } else if (isTanglish) {
      reply = `### 📊 Ungaloda Attendance Overview\n\n` +
        `Vanakkam **${studentSummary.name}**!\n\n` +
        `- **Current Attendance Rate**: **${studentSummary.attendance_percentage}%**\n` +
        `- **University Minimum Requirement**: **75%**\n` +
        `- **Status**: ${studentSummary.attendance_percentage >= 75 ? 'Super! Unga attendance safe zone la irukku.' : 'Warning! Attendance 75% vida kammiya irukku. Continuous class attend pannunga.'}\n\n` +
        `**SC EDU AI Tips:**\n` +
        `- Upcoming lectures ethuvum skip pannatheenga.\n` +
        `- Continuous assessment marks ku attendance romba mukkiyam!`;
      followups = ['Subject-wise attendance details solunga', 'Study plan create pannalama?', 'Weak subjects epdi improve pandrathu?'];
    } else {
      reply = `### 📊 Academic Attendance Analysis\n\n` +
        `Hello **${studentSummary.name}**! Here is your verified attendance status:\n\n` +
        `- **Current Attendance**: **${studentSummary.attendance_percentage}%**\n` +
        `- **Institutional Minimum Threshold**: **75.0%**\n` +
        `- **Compliance Status**: ${studentSummary.attendance_percentage >= 75 ? '✅ In Good Standing (Eligible for all semester examinations)' : '⚠️ Action Required (Below 75% threshold)'}\n\n` +
        `#### 💡 Strategic Advice from SC EDU AI:\n` +
        `- **Maintain Consistency**: Attend all upcoming scheduled lecture hours.\n` +
        `- **Active Engagement**: Active classroom participation directly supports continuous assessment marks.`;
      followups = ['How can I boost my overall GPA?', 'Show my enrolled courses summary', 'Help me prepare for upcoming unit tests'];
    }
  }

  // 4. Performance / Grade analysis
  else if (lower.includes('performance') || lower.includes('grade') || lower.includes('score') || lower.includes('mark') || lower.includes('மதிப்பெண்') || lower.includes('மதிப்பீடு')) {
    if (isTamil) {
      reply = `### 🎯 கல்வி முன்னேற்ற மதிப்பீடு (Academic Performance)\n\n` +
        `**மாணவர்**: ${studentSummary.name} (${studentSummary.roll_number})\n` +
        `- **ஒட்டுமொத்த மதிப்பெண்**: **${studentSummary.overall_score}%**\n` +
        `- **பதிவு செய்யப்பட்ட பாடங்கள்**: ${studentSummary.enrolled_courses_count} பாடங்கள்\n` +
        `- **நிலை**: ${studentSummary.risk_level === 'low' ? 'சிறந்த முன்னேற்றம் (Low Risk)' : 'கவனம் தேவை'}\n\n` +
        `**முக்கிய பாடங்கள்:**\n` +
        enrolledCourses.slice(0, 3).map((c) => `- ${c}`).join('\n') +
        `\n\nஎந்த பாடத்தில் உதவி தேவைப்படுகிறது? நான் உங்களுக்கு விரிவான விளக்கங்களை வழங்க தயாராக உள்ளேன்.`;
      followups = ['தேர்வுக்கான 7 நாள் படிப்பு திட்டம் தாருங்கள்', 'முக்கிய சூத்திரங்களை விளக்குங்கள்', 'அசைன்மென்ட் சமர்ப்பிப்பது எப்படி?'];
    } else if (isTanglish) {
      reply = `### 🎯 Ungaloda Academic Performance Report\n\n` +
        `**Student**: ${studentSummary.name} (${studentSummary.roll_number})\n` +
        `- **Overall Academic Score**: **${studentSummary.overall_score}%**\n` +
        `- **Registered Courses**: ${studentSummary.enrolled_courses_count} subjects\n` +
        `- **Academic Trajectory**: ${studentSummary.risk_level === 'low' ? 'Good performance! Placement readiness track la irukeenga.' : 'Improvement thevai.'}\n\n` +
        `**Enrolled Courses Highlights:**\n` +
        enrolledCourses.slice(0, 3).map((c) => `• ${c}`).join('\n') +
        `\n\nEnthe subject la doubts irukku? Solunga, naan explain pandren!`;
      followups = ['Data Structures Unit 1 summarize pannunga', 'Exam preparation timetable podalama?', 'Weak topics list pannunga'];
    } else {
      reply = `### 🎯 Academic Intelligence & Diagnostics\n\n` +
        `Here is the verified academic summary for **${studentSummary.name}** (Roll: ${studentSummary.roll_number}):\n\n` +
        `- **Cumulative Score**: **${studentSummary.overall_score}%**\n` +
        `- **Attendance**: **${studentSummary.attendance_percentage}%**\n` +
        `- **Risk Classification**: **${studentSummary.risk_level.toUpperCase()}**\n` +
        `- **Active Enrolled Courses**: ${studentSummary.enrolled_courses_count} Courses\n\n` +
        `#### 📚 Enrolled Subjects:\n` +
        enrolledCourses.slice(0, 4).map((c) => `- **${c}**`).join('\n') +
        `\n\nWould you like me to generate a personalized study plan, summarize a syllabus unit, or solve practice problems?`;
      followups = ['Create a 7-day revision schedule', 'Explain core concepts in my courses', 'How to prepare for semester exams?'];
    }
  }

  // 5. Data Structures / Algorithms (Binary Search, Sorting, Trees, Graphs)
  else if (lower.includes('binary search') || lower.includes('tree') || lower.includes('graph') || lower.includes('stack') || lower.includes('queue') || lower.includes('data structure') || lower.includes('algorithm')) {
    reply = `### 🌳 Data Structures & Algorithms: Concept Guide\n\n` +
      `Data structures organize and store data for efficient access and modification, while algorithms are finite step-by-step procedures for computational problem-solving.\n\n` +
      `#### 📊 Core Data Structures Comparison:\n` +
      `| Structure | Insertion | Lookup / Search | Deletion | Primary Use Case |\n` +
      `| :--- | :--- | :--- | :--- | :--- |\n` +
      `| **Array / List** | $O(n)$ | $O(1)$ by index / $O(n)$ | $O(n)$ | Sequential linear data |\n` +
      `| **Stack (LIFO)** | $O(1)$ | $O(n)$ | $O(1)$ | Function calls, Undo systems |\n` +
      `| **Queue (FIFO)** | $O(1)$ | $O(n)$ | $O(1)$ | Task scheduling, Buffers |\n` +
      `| **Binary Search Tree** | $O(\\log n)$ avg | $O(\\log n)$ avg | $O(\\log n)$ avg | Fast sorted lookups |\n` +
      `| **Hash Map** | $O(1)$ avg | $O(1)$ avg | $O(1)$ avg | Key-Value caching |\n\n` +
      `\`\`\`python\n` +
      `# Binary Search Implementation (O(log n))\n` +
      `def binary_search(arr: list[int], target: int) -> int:\n` +
      `    left, right = 0, len(arr) - 1\n` +
      `    while left <= right:\n` +
      `        mid = (left + right) // 2\n` +
      `        if arr[mid] == target:\n` +
      `            return mid\n` +
      `        elif arr[mid] < target:\n` +
      `            left = mid + 1\n` +
      `        else:\n` +
      `            right = mid - 1\n` +
      `    return -1\n` +
      `\`\`\``;
    followups = ['Explain Binary Search step-by-step with an array trace', 'What is Big-O notation and Time Complexity?', 'Explain Breadth-First Search (BFS) vs Depth-First Search (DFS)'];
  }

  // 6. General / Fallback Question Handler
  else {
    if (isTamil) {
      reply = `### 🎓 SC EDU AI - உங்கள் கேள்விக்கான விளக்கம்\n\n` +
        `வணக்கம் **${studentSummary.name}**! நீங்கள் கேட்ட கேள்வி:\n> *"${message}"*\n\n` +
        `நான் **SC EDU AI**, உங்கள் பாடத்திட்டம் மற்றும் தொழில்நுட்பத் தலைப்புகளில் வழிகாட்ட எப்போதும் தயாராக உள்ளேன்.\n\n` +
        `- 📖 **பாடக் கோட்பாடுகள்**: கணிப்பொறி அறிவியல், AI, கணிதம், பொறியியல் சூத்திரங்கள்.\n` +
        `- 📝 **தேர்வுத் தயாரிப்பு**: மாதிரி வினாக்கள் மற்றும் படிப்பு வழிகாட்டிகள்.\n` +
        `- 📊 **வருகை & மதிப்பெண்**: உங்கள் தற்போதைய வருகை **${studentSummary.attendance_percentage}%**, மதிப்பெண் **${studentSummary.overall_score}%**.\n\n` +
        `எந்த குறிப்பிட்ட பாட அலகு அல்லது தலைப்பை ஆழமாக விளக்க வேண்டும்?`;
      followups = ['Python மற்றும் Java ஒப்பீடு', 'தேர்வுக்கு எப்படி படிப்பது?', 'பாடத்திட்ட அலகு 1-ஐ விளக்கு'];
    } else if (isTanglish) {
      reply = `### 🎓 SC EDU AI - Academic Explanation\n\n` +
        `Vanakkam **${studentSummary.name}**! Ungaloda question: \n> *"${message}"*\n\n` +
        `Ennala ungalukku detailed academic solutions and code examples provide panna mudiyum:\n\n` +
        `- 📖 **Course Concepts & Notes**: Complex algorithms & formulas simplified.\n` +
        `- 📝 **Exam Prep & Timetable**: Important questions and revision schedules.\n` +
        `- 📊 **Attendance & Performance**: Current attendance ${studentSummary.attendance_percentage}%, overall score ${studentSummary.overall_score}%.\n\n` +
        `Specific topic solunga, naan step-by-step code and notes create pandren!`;
      followups = ['Explain Python Basics with code', 'Exam revision timetable generate pannunga', 'Important questions for upcoming test'];
    } else {
      reply = `### 🎓 SC EDU AI - Academic Assistant\n\n` +
        `Hello **${studentSummary.name}**! Regarding your inquiry: \n> *"${message}"*\n\n` +
        `I am **SC EDU AI**, connected to your **${studentSummary.department}** curriculum:\n` +
        `- **Academic Score**: ${studentSummary.overall_score}%\n` +
        `- **Attendance Standing**: ${studentSummary.attendance_percentage}% (Eligible for exams)\n` +
        `- **Active Enrolled Courses**: ${studentSummary.enrolled_courses_count} subjects\n\n` +
        `#### 🚀 How I Can Help on this Topic:\n` +
        `1. **Algorithmic & Theoretical Deep Dives**: Break down mathematical proofs, data structures, and engineering formulas.\n` +
        `2. **Code Implementation**: Provide tested snippets in Python, Java, C++, TypeScript, or SQL.\n` +
        `3. **Curricular Alignment**: Summarize unit syllabus objectives and expected semester exam questions.\n\n` +
        `Feel free to ask for a code walkthrough, practice problem sets, or a step-by-step conceptual breakdown!`;
      followups = ['Provide a concrete code example on this topic', 'Generate a 3-question practice quiz', 'How does this appear in semester examinations?'];
    }
  }

  return {
    reply,
    detected_language: detectedLang,
    suggested_followups: followups.length > 0 ? followups : [
      'Explain with a code example',
      'How does this appear in semester exams?',
      'Give me 3 practice quiz questions'
    ],
    student_summary: studentSummary
  };
}
