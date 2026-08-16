import { db } from './db.js';

export function seedSampleAcademicData() {
  // Clear any existing database
  db.resetDatabase();

  const now = new Date().toISOString();

  // 1. SEED DEPARTMENTS
  const departmentsData = [
    {
      id: 'ai-ds',
      name: 'Artificial Intelligence and Data Science',
      shortCode: 'AI & DS',
      category: 'Engineering & Technology',
      description: 'Undergraduate and postgraduate programs in artificial intelligence, machine learning, neural architectures, and data engineering.'
    },
    {
      id: 'cse',
      name: 'Computer Science and Engineering',
      shortCode: 'CSE',
      category: 'Engineering & Technology',
      description: 'Foundations of computation, software engineering, distributed systems, algorithms, and computer architecture.'
    },
    {
      id: 'it',
      name: 'Information Technology',
      shortCode: 'IT',
      category: 'Engineering & Technology',
      description: 'Applied information systems, cloud engineering, cybersecurity, network architectures, and full-stack software development.'
    },
    {
      id: 'ece',
      name: 'Electronics and Communication Engineering',
      shortCode: 'ECE',
      category: 'Engineering & Technology',
      description: 'Digital signal processing, VLSI design, wireless communication, RF systems, and embedded computing.'
    },
    {
      id: 'eee',
      name: 'Electrical and Electronics Engineering',
      shortCode: 'EEE',
      category: 'Engineering & Technology',
      description: 'Power systems, electrical machinery, renewable energy generation, smart grid technology, and power electronics.'
    },
    {
      id: 'me',
      name: 'Mechanical Engineering',
      shortCode: 'ME',
      category: 'Engineering & Technology',
      description: 'Thermal engineering, fluid mechanics, computer-integrated manufacturing, robotics, kinematics, and materials design.'
    },
    {
      id: 'ce',
      name: 'Civil Engineering',
      shortCode: 'CE',
      category: 'Engineering & Technology',
      description: 'Structural engineering, geotechnical analysis, environmental infrastructure, transportation systems, and surveying.'
    },
    {
      id: 'bme',
      name: 'Biomedical Engineering',
      shortCode: 'BME',
      category: 'Engineering & Technology',
      description: 'Medical instrumentation, biosignal processing, clinical diagnostics, biomedical imaging physics, and biomaterials.'
    }
  ];

  departmentsData.forEach((dept) => {
    db.insert('departments', dept);
  });

  // 2. CREATE PROFILES & USERS
  // Admin Profile
  const adminProfile = db.insert('profiles', {
    auth_user_id: 'auth_admin_01',
    full_name: 'Dr. Evelyn Hayes',
    email: 'admin@edusense.ai',
    phone: '+1 (555) 234-5678',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
    role: 'ADMIN',
    department: 'Academic Affairs'
  });
  db.insert('administrators', {
    profile_id: adminProfile.id,
    admin_level: 'SUPER_ADMIN'
  });

  // Faculty Profiles across Departments
  const facultyMembers = [
    {
      auth_id: 'auth_prof_alan',
      name: 'Prof. Alan Vance',
      email: 'teacher@edusense.ai',
      phone: '+1 (555) 345-6789',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
      department: 'Computer Science and Engineering',
      employee_code: 'FAC-CSE-101',
      qualification: 'Ph.D. in Computer Science, MIT',
      specialization: 'Distributed Systems & Advanced Algorithms',
      designation: 'Professor & Department Head'
    },
    {
      auth_id: 'auth_dr_sarah',
      name: 'Dr. Sarah Lin',
      email: 'sarah.lin@edusense.ai',
      phone: '+1 (555) 456-7890',
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256',
      department: 'Artificial Intelligence and Data Science',
      employee_code: 'FAC-AIDS-102',
      qualification: 'Ph.D. in Machine Learning, Stanford University',
      specialization: 'Deep Learning & Statistical Inference',
      designation: 'Associate Professor'
    },
    {
      auth_id: 'auth_prof_marcus',
      name: 'Prof. Marcus Sterling',
      email: 'marcus.sterling@edusense.ai',
      phone: '+1 (555) 567-8902',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
      department: 'Information Technology',
      employee_code: 'FAC-IT-103',
      qualification: 'Ph.D. in Software Engineering, Carnegie Mellon',
      specialization: 'Cloud Infrastructure & Cybersecurity',
      designation: 'Associate Professor'
    },
    {
      auth_id: 'auth_dr_rajesh',
      name: 'Dr. Rajesh Kumar',
      email: 'rajesh.kumar@edusense.ai',
      phone: '+1 (555) 678-9013',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
      department: 'Electronics and Communication Engineering',
      employee_code: 'FAC-ECE-104',
      qualification: 'Ph.D. in Microelectronics, UC Berkeley',
      specialization: 'VLSI Architectures & Digital Signal Processing',
      designation: 'Professor'
    },
    {
      auth_id: 'auth_dr_elena',
      name: 'Dr. Elena Rostova',
      email: 'elena.rostova@edusense.ai',
      phone: '+1 (555) 789-0124',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256',
      department: 'Electrical and Electronics Engineering',
      employee_code: 'FAC-EEE-105',
      qualification: 'Ph.D. in Power Systems, ETH Zurich',
      specialization: 'Smart Grids & Renewable Energy Systems',
      designation: 'Associate Professor'
    },
    {
      auth_id: 'auth_prof_david',
      name: 'Prof. David Henderson',
      email: 'david.henderson@edusense.ai',
      phone: '+1 (555) 890-1235',
      avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=256',
      department: 'Mechanical Engineering',
      employee_code: 'FAC-ME-106',
      qualification: 'Ph.D. in Mechanical Robotics, Caltech',
      specialization: 'Thermal Dynamics & Autonomous Robotics',
      designation: 'Professor'
    },
    {
      auth_id: 'auth_dr_ananya',
      name: 'Dr. Ananya Iyer',
      email: 'ananya.iyer@edusense.ai',
      phone: '+1 (555) 901-2346',
      avatar_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=256',
      department: 'Civil Engineering',
      employee_code: 'FAC-CE-107',
      qualification: 'Ph.D. in Structural Engineering, Imperial College London',
      specialization: 'Seismic Structural Analysis & Sustainable Materials',
      designation: 'Associate Professor'
    },
    {
      auth_id: 'auth_dr_jennifer',
      name: 'Dr. Jennifer Zhao',
      email: 'jennifer.zhao@edusense.ai',
      phone: '+1 (555) 012-3457',
      avatar_url: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&q=80&w=256',
      department: 'Biomedical Engineering',
      employee_code: 'FAC-BME-108',
      qualification: 'Ph.D. in Biomedical Instrumentation, Johns Hopkins',
      specialization: 'Biosignal Processing & Clinical Diagnostic Systems',
      designation: 'Professor'
    }
  ];

  const facultyRecords: Record<string, any> = {};
  facultyMembers.forEach((f) => {
    const prof = db.insert('profiles', {
      auth_user_id: f.auth_id,
      full_name: f.name,
      email: f.email,
      phone: f.phone,
      avatar_url: f.avatar_url,
      role: 'TEACHER',
      department: f.department
    });
    const teacher = db.insert('teachers', {
      profile_id: prof.id,
      employee_code: f.employee_code,
      qualification: f.qualification,
      specialization: f.specialization,
      designation: f.designation,
      experience: '12 Years',
      academic_year: '2025 - 2026',
      department: f.department
    });
    facultyRecords[f.department] = { profile: prof, teacher };
  });

  // 3. SEED STUDENTS
  const studentData = [
    {
      auth_id: 'auth_alex_morgan',
      name: 'Alex Morgan',
      email: 'student@edusense.ai',
      phone: '+1 (555) 567-8901',
      avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=256',
      department: 'Computer Science and Engineering',
      roll_number: 'CS2026-081',
      enrollment_year: 2024,
      semester: 4,
      major: 'Computer Science and Engineering'
    },
    {
      auth_id: 'auth_priya_sharma',
      name: 'Priya Sharma',
      email: 'priya.sharma@edusense.ai',
      phone: '+1 (555) 678-9012',
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=256',
      department: 'Computer Science and Engineering',
      roll_number: 'CS2026-082',
      enrollment_year: 2024,
      semester: 4,
      major: 'Computer Science and Engineering'
    },
    {
      auth_id: 'auth_david_kim',
      name: 'David Kim',
      email: 'david.kim@edusense.ai',
      phone: '+1 (555) 789-0123',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
      department: 'Computer Science and Engineering',
      roll_number: 'CS2026-083',
      enrollment_year: 2024,
      semester: 4,
      major: 'Computer Science and Engineering'
    },
    {
      auth_id: 'auth_kavya_nair',
      name: 'Kavya Nair',
      email: 'kavya.nair@edusense.ai',
      phone: '+1 (555) 890-1234',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
      department: 'Artificial Intelligence and Data Science',
      roll_number: 'AD2026-015',
      enrollment_year: 2025,
      semester: 2,
      major: 'Artificial Intelligence and Data Science'
    },
    {
      auth_id: 'auth_rohit_menon',
      name: 'Rohit Menon',
      email: 'rohit.menon@edusense.ai',
      phone: '+1 (555) 901-2345',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
      department: 'Electronics and Communication Engineering',
      roll_number: 'EC2026-042',
      enrollment_year: 2023,
      semester: 6,
      major: 'Electronics and Communication Engineering'
    }
  ];

  const studentRecords: any[] = [];
  studentData.forEach((s) => {
    const studyYear = s.semester <= 2 ? '1st Year' : s.semester <= 4 ? '2nd Year' : s.semester <= 6 ? '3rd Year' : '4th Year';
    const prof = db.insert('profiles', {
      auth_user_id: s.auth_id,
      full_name: s.name,
      email: s.email,
      phone: s.phone,
      avatar_url: s.avatar_url,
      role: 'STUDENT',
      department: s.department,
      date_of_birth: '2004-06-15',
      gender: s.name.includes('Priya') || s.name.includes('Kavya') ? 'Female' : 'Male',
      address: 'University Residential Campus, Block B, Academic City'
    });
    const st = db.insert('students', {
      profile_id: prof.id,
      roll_number: s.roll_number,
      enrollment_year: s.enrollment_year,
      semester: s.semester,
      major: s.major,
      degree_program: `B.Tech. in ${s.major}`,
      study_year: studyYear,
      year: s.semester <= 2 ? 1 : s.semester <= 4 ? 2 : s.semester <= 6 ? 3 : 4,
      section: 'A',
      academic_year: '2025 - 2026',
      date_of_birth: '2004-06-15',
      gender: s.name.includes('Priya') || s.name.includes('Kavya') ? 'Female' : 'Male',
      address: 'University Residential Campus, Block B, Academic City',
      academic_status: 'ACTIVE'
    });
    studentRecords.push({ profile: prof, student: st });
  });

  const studentAlex = studentRecords[0].student;
  const studentPriya = studentRecords[1].student;
  const studentDavid = studentRecords[2].student;

  // 4. SEED COMPREHENSIVE CURRICULUM ACROSS ALL 8 DEPARTMENTS, ALL 4 YEARS, AND ALL 8 SEMESTERS
  const coursesData = [
    // -------------------------------------------------------------
    // 1. ARTIFICIAL INTELLIGENCE & DATA SCIENCE
    // -------------------------------------------------------------
    {
      code: 'AD101',
      name: 'Python Programming for AI & Data Science',
      department: 'Artificial Intelligence and Data Science',
      academic_year: 1,
      semester: 1,
      credits: 4,
      course_type: 'Core Theory',
      level: 'Undergraduate',
      description: 'Foundational computational problem solving using Python, vector operations with NumPy, dataframes with Pandas, and algorithmic thinking for data workflows.',
      prerequisites: 'None',
      syllabus: 'Unit 1: Python Semantics & Control Structures\nUnit 2: Modular Programming & Data Structures\nUnit 3: Numerical Computation with NumPy\nUnit 4: Data Cleansing with Pandas\nUnit 5: Data Visualizations with Matplotlib & Seaborn',
      status: 'ACTIVE'
    },
    {
      code: 'AD102',
      name: 'Data Structures & Object-Oriented Analysis',
      department: 'Artificial Intelligence and Data Science',
      academic_year: 1,
      semester: 2,
      credits: 4,
      course_type: 'Integrated Theory & Lab',
      level: 'Undergraduate',
      description: 'Rigorous implementation of linear and non-linear data structures, asymptotic notation, tree traversal heuristics, graphs, and OOP design patterns.',
      prerequisites: 'AD101 Python Programming for AI & Data Science',
      syllabus: 'Unit 1: Asymptotic Complexity & Recursion\nUnit 2: Stacks, Queues, and Linked Structures\nUnit 3: Trees, Heaps, and Priority Queues\nUnit 4: Graph Search Algorithms (BFS, DFS)\nUnit 5: Sorting & Hashing Techniques',
      status: 'ACTIVE'
    },
    {
      code: 'AD201',
      name: 'Database Systems & NoSQL Data Architecture',
      department: 'Artificial Intelligence and Data Science',
      academic_year: 2,
      semester: 3,
      credits: 4,
      course_type: 'Integrated Theory & Lab',
      level: 'Undergraduate',
      description: 'Relational database design, relational algebra, SQL optimization, ACID transactions, document stores (MongoDB), and vector database indexing.',
      prerequisites: 'AD102 Data Structures & Object-Oriented Analysis',
      syllabus: 'Unit 1: Relational Data Models & ER Schemas\nUnit 2: Advanced SQL & Query Optimization\nUnit 3: Normalization & Functional Dependencies\nUnit 4: Transaction Processing & Concurrency\nUnit 5: NoSQL & Vector Embeddings Indexing',
      status: 'ACTIVE'
    },
    {
      code: 'AD202',
      name: 'Applied Machine Learning & Statistical Inference',
      department: 'Artificial Intelligence and Data Science',
      academic_year: 2,
      semester: 4,
      credits: 4,
      course_type: 'Core Theory',
      level: 'Undergraduate',
      description: 'Supervised and unsupervised machine learning algorithms, regularized linear models, decision trees, ensemble methods, and cross-validation protocols.',
      prerequisites: 'AD201 Database Systems & NoSQL Data Architecture',
      syllabus: 'Unit 1: Probability Distributions & Maximum Likelihood\nUnit 2: Linear & Logistic Regression, Regularization\nUnit 3: Decision Trees, Random Forests, XGBoost\nUnit 4: Unsupervised Clustering & PCA\nUnit 5: Model Validation & Hyperparameter Tuning',
      status: 'ACTIVE'
    },
    {
      code: 'AD301',
      name: 'Deep Learning & Neural Network Architectures',
      department: 'Artificial Intelligence and Data Science',
      academic_year: 3,
      semester: 5,
      credits: 4,
      course_type: 'Core Theory',
      level: 'Undergraduate',
      description: 'Mathematical foundations of backpropagation, convolutional neural networks (CNNs), sequence models (RNNs/LSTMs), and attention mechanisms in PyTorch.',
      prerequisites: 'AD202 Applied Machine Learning & Statistical Inference',
      syllabus: 'Unit 1: Perceptrons, Multi-Layer Feedforward & Backprop\nUnit 2: Optimization (Adam, RMSProp) & Regularization\nUnit 3: Convolutional Neural Networks (ResNet, EfficientNet)\nUnit 4: Recurrent Networks & Sequence Modeling\nUnit 5: Transformers & Self-Attention Fundamentals',
      status: 'ACTIVE'
    },
    {
      code: 'AD302',
      name: 'Big Data Analytics & Distributed Computing',
      department: 'Artificial Intelligence and Data Science',
      academic_year: 3,
      semester: 6,
      credits: 4,
      course_type: 'Integrated Theory & Lab',
      level: 'Undergraduate',
      description: 'Scalable data pipelines with Apache Spark, Hadoop MapReduce, stream processing with Kafka, and cloud data warehouses.',
      prerequisites: 'AD301 Deep Learning & Neural Network Architectures',
      syllabus: 'Unit 1: Distributed Computing Foundations\nUnit 2: Apache Spark RDDs & DataFrames\nUnit 3: Streaming Data Ingestion with Kafka\nUnit 4: Distributed Machine Learning Pipelines\nUnit 5: Cloud Data Lakes & Governance',
      status: 'ACTIVE'
    },
    {
      code: 'AD401',
      name: 'Natural Language Processing & Large Language Models',
      department: 'Artificial Intelligence and Data Science',
      academic_year: 4,
      semester: 7,
      credits: 4,
      course_type: 'Professional Elective',
      level: 'Undergraduate',
      description: 'Tokenization, word embeddings (Word2Vec), Transformer architectures (BERT, GPT), instruction tuning, RAG systems, and LLM agent orchestration.',
      prerequisites: 'AD301 Deep Learning & Neural Network Architectures',
      syllabus: 'Unit 1: Text Preprocessing & Vectorization\nUnit 2: Language Modeling & BERT Masked Architectures\nUnit 3: Generative Pre-trained Transformers (GPT)\nUnit 4: Retrieval-Augmented Generation (RAG)\nUnit 5: Prompt Engineering, Fine-Tuning & Evaluation',
      status: 'ACTIVE'
    },
    {
      code: 'AD402',
      name: 'Capstone AI Engineering Project',
      department: 'Artificial Intelligence and Data Science',
      academic_year: 4,
      semester: 8,
      credits: 6,
      course_type: 'Project / Seminar',
      level: 'Undergraduate',
      description: 'End-to-end production deployment of an AI-powered system solving a verified enterprise or healthcare challenge with rigorous validation.',
      prerequisites: 'AD401 Natural Language Processing & Large Language Models',
      syllabus: 'Unit 1: Problem Definition & Literature Review\nUnit 2: Dataset Curation & Preprocessing\nUnit 3: Model Architecture & Training\nUnit 4: Deployment & API Integration\nUnit 5: Technical Dissertation & Defense',
      status: 'ACTIVE'
    },

    // -------------------------------------------------------------
    // 2. COMPUTER SCIENCE AND ENGINEERING
    // -------------------------------------------------------------
    {
      code: 'CS101',
      name: 'Problem Solving & C Programming',
      department: 'Computer Science and Engineering',
      academic_year: 1,
      semester: 1,
      credits: 4,
      course_type: 'Core Theory',
      level: 'Undergraduate',
      description: 'Structured programming methodology in C, pointers, memory allocation, arrays, strings, structures, file handling, and computational problem solving.',
      prerequisites: 'None',
      syllabus: 'Unit 1: Algorithms, Flowcharts, & Basic C Types\nUnit 2: Control Flow & Iteration\nUnit 3: Arrays, Strings, & Modular Functions\nUnit 4: Pointers & Dynamic Memory Management\nUnit 5: Structures, Unions, & File I/O',
      status: 'ACTIVE'
    },
    {
      code: 'CS102',
      name: 'Discrete Mathematical Structures',
      department: 'Computer Science and Engineering',
      academic_year: 1,
      semester: 2,
      credits: 4,
      course_type: 'Core Theory',
      level: 'Undergraduate',
      description: 'Propositional logic, predicate calculus, set theory, relations, combinatorics, graph theory, trees, and algebraic structures for theoretical computer science.',
      prerequisites: 'None',
      syllabus: 'Unit 1: Propositional & Predicate Logic\nUnit 2: Sets, Relations, & Equivalence Classes\nUnit 3: Combinatorics & Generating Functions\nUnit 4: Graph Theory & Eulerian/Hamiltonian Paths\nUnit 5: Groups, Rings, & Boolean Algebra',
      status: 'ACTIVE'
    },
    {
      code: 'CS201',
      name: 'Object-Oriented Programming with Java',
      department: 'Computer Science and Engineering',
      academic_year: 2,
      semester: 3,
      credits: 4,
      course_type: 'Integrated Theory & Lab',
      level: 'Undergraduate',
      description: 'Object-oriented paradigm, inheritance, polymorphism, abstract classes, exception handling, multithreading, Java Collections Framework, and GUI components.',
      prerequisites: 'CS101 Problem Solving & C Programming',
      syllabus: 'Unit 1: OOP Principles & Class Architecture\nUnit 2: Inheritance, Interfaces, & Packages\nUnit 3: Exception Handling & File I/O Streams\nUnit 4: Multithreading & Synchronization\nUnit 5: Java Collections Framework & Generics',
      status: 'ACTIVE'
    },
    {
      code: 'CS202',
      name: 'Advanced Algorithms & Complexity',
      department: 'Computer Science and Engineering',
      academic_year: 2,
      semester: 4,
      credits: 4,
      course_type: 'Core Theory',
      level: 'Undergraduate',
      description: 'Comprehensive study of divide-and-conquer, dynamic programming, network flows, amortized analysis, NP-completeness, and randomized algorithms.',
      prerequisites: 'CS102 Discrete Mathematical Structures',
      syllabus: 'Unit 1: Asymptotic Analysis & Recurrences\nUnit 2: Dynamic Programming Paradigms\nUnit 3: Greedy Algorithms & Matroids\nUnit 4: Network Flows & Maximum Bipartite Matching\nUnit 5: NP-Completeness, Reductions, & Approximation',
      status: 'ACTIVE'
    },
    {
      code: 'CS301',
      name: 'Distributed Cloud Architecture',
      department: 'Computer Science and Engineering',
      academic_year: 3,
      semester: 5,
      credits: 3,
      course_type: 'Core Theory',
      level: 'Undergraduate',
      description: 'Design and analysis of fault-tolerant distributed systems, consensus algorithms (Raft, Paxos), microservices, containerization, and cloud infrastructure patterns.',
      prerequisites: 'CS202 Advanced Algorithms & Complexity',
      syllabus: 'Unit 1: Distributed Clocks & Logical Time\nUnit 2: Consensus Protocols & Leader Election\nUnit 3: CAP Theorem, Partitioning, & Consistency\nUnit 4: RPC, gRPC, & Microservice Patterns\nUnit 5: Cloud Containerization (Docker, Kubernetes)',
      status: 'ACTIVE'
    },
    {
      code: 'CS302',
      name: 'Compiler Design & Formal Languages',
      department: 'Computer Science and Engineering',
      academic_year: 3,
      semester: 6,
      credits: 4,
      course_type: 'Core Theory',
      level: 'Undergraduate',
      description: 'Lexical analysis, LL/LR parsing grammars, syntax-directed translation, intermediate code representations, symbol tables, and code optimization passes.',
      prerequisites: 'CS202 Advanced Algorithms & Complexity',
      syllabus: 'Unit 1: Lexical Analysis & Finite Automata\nUnit 2: Context-Free Grammars & Top-Down Parsing\nUnit 3: LR Parsing (SLR, LALR, Canonical LR)\nUnit 4: Intermediate Code Generation & TAC\nUnit 5: Code Optimization & Target Code Generation',
      status: 'ACTIVE'
    },
    {
      code: 'CS401',
      name: 'Advanced Computer Vision & Generative AI',
      department: 'Computer Science and Engineering',
      academic_year: 4,
      semester: 7,
      credits: 4,
      course_type: 'Professional Elective',
      level: 'Undergraduate',
      description: 'Image filtering, feature extraction (SIFT, ORB), object detection (YOLO), semantic segmentation, diffusion models, and GAN architectures.',
      prerequisites: 'CS301 Distributed Cloud Architecture',
      syllabus: 'Unit 1: Image Processing & Spatial Filtering\nUnit 2: Feature Detection & Matching\nUnit 3: Object Detection (Faster R-CNN, YOLO)\nUnit 4: Semantic & Instance Segmentation\nUnit 5: Generative Adversarial Networks & Diffusion',
      status: 'ACTIVE'
    },
    {
      code: 'CS402',
      name: 'Major Engineering Capstone Project',
      department: 'Computer Science and Engineering',
      academic_year: 4,
      semester: 8,
      credits: 6,
      course_type: 'Project / Seminar',
      level: 'Undergraduate',
      description: 'Design, engineering, and implementation of a substantial software or computational system with full technical documentation and presentation.',
      prerequisites: 'CS401 Advanced Computer Vision & Generative AI',
      syllabus: 'Unit 1: System Requirements & Architecture Specification\nUnit 2: Module Implementation & Unit Testing\nUnit 3: Integration & Performance Profiling\nUnit 4: Security & Penetration Testing\nUnit 5: Technical Defense & Publication',
      status: 'ACTIVE'
    },

    // -------------------------------------------------------------
    // 3. INFORMATION TECHNOLOGY
    // -------------------------------------------------------------
    {
      code: 'IT101',
      name: 'Information Technology Essentials & Web Foundations',
      department: 'Information Technology',
      academic_year: 1,
      semester: 1,
      credits: 3,
      course_type: 'Core Theory',
      level: 'Undergraduate',
      description: 'Foundations of web standards, modern HTML5 semantics, CSS3 layouts, JavaScript execution runtime, and networked software architectures.',
      prerequisites: 'None',
      syllabus: 'Unit 1: Internet Protocols & Client-Server Paradigm\nUnit 2: Semantic HTML5 & Responsive CSS3\nUnit 3: Modern JavaScript (ES6+) & DOM Manipulation\nUnit 4: Asynchronous JavaScript & RESTful APIs\nUnit 5: Web Accessibility & Performance Optimization',
      status: 'ACTIVE'
    },
    {
      code: 'IT201',
      name: 'Full-Stack Cloud Application Engineering',
      department: 'Information Technology',
      academic_year: 2,
      semester: 3,
      credits: 4,
      course_type: 'Integrated Theory & Lab',
      level: 'Undergraduate',
      description: 'End-to-end full-stack development with React, Node.js, Express, PostgreSQL/MongoDB, authentication protocols, and containerized deployment.',
      prerequisites: 'IT101 Information Technology Essentials & Web Foundations',
      syllabus: 'Unit 1: Component Architectures with React\nUnit 2: Server-Side REST APIs with Express\nUnit 3: Database ORM & Migrations\nUnit 4: JWT, OAuth2, & Session Security\nUnit 5: CI/CD Pipelines & Cloud Container Deployment',
      status: 'ACTIVE'
    },
    {
      code: 'IT301',
      name: 'Cyber Security & Cryptographic Protocols',
      department: 'Information Technology',
      academic_year: 3,
      semester: 5,
      credits: 4,
      course_type: 'Core Theory',
      level: 'Undergraduate',
      description: 'Symmetric/asymmetric encryption (AES, RSA), digital signatures, public key infrastructure (PKI), network vulnerability scanning, and threat modeling.',
      prerequisites: 'IT201 Full-Stack Cloud Application Engineering',
      syllabus: 'Unit 1: Classical & Modern Cryptography (AES, DES)\nUnit 2: Asymmetric Cryptography & RSA\nUnit 3: Hash Functions, SHA-256, & Digital Signatures\nUnit 4: Network Attacks & Firewall Architectures\nUnit 5: Ethical Hacking & Vulnerability Assessment',
      status: 'ACTIVE'
    },
    {
      code: 'IT401',
      name: 'Cloud DevOps & Infrastructure as Code',
      department: 'Information Technology',
      academic_year: 4,
      semester: 7,
      credits: 4,
      course_type: 'Professional Elective',
      level: 'Undergraduate',
      description: 'Automating scalable infrastructure with Terraform, Docker, Kubernetes clusters, Prometheus monitoring, and zero-downtime deployment strategies.',
      prerequisites: 'IT301 Cyber Security & Cryptographic Protocols',
      syllabus: 'Unit 1: DevOps Culture & GitOps Methodologies\nUnit 2: Infrastructure as Code with Terraform\nUnit 3: Kubernetes Architecture & Pod Orchestration\nUnit 4: Logging & Telemetry with Prometheus/Grafana\nUnit 5: Site Reliability Engineering (SRE) Principles',
      status: 'ACTIVE'
    },

    // -------------------------------------------------------------
    // 4. ELECTRONICS AND COMMUNICATION ENGINEERING
    // -------------------------------------------------------------
    {
      code: 'EC101',
      name: 'Circuit Theory and Network Analysis',
      department: 'Electronics and Communication Engineering',
      academic_year: 1,
      semester: 1,
      credits: 4,
      course_type: 'Core Theory',
      level: 'Undergraduate',
      description: 'Kirchhoff laws, nodal and mesh analysis, Thevenin/Norton network theorems, transient analysis of RLC circuits, and AC sinusoidal steady-state responses.',
      prerequisites: 'None',
      syllabus: 'Unit 1: DC Circuit Laws & Node/Mesh Formulation\nUnit 2: Network Theorems (Thevenin, Norton, Superposition)\nUnit 3: Transient Response of RC, RL, & RLC Circuits\nUnit 4: AC Steady-State Analysis & Phasors\nUnit 5: Two-Port Networks & Resonance',
      status: 'ACTIVE'
    },
    {
      code: 'EC201',
      name: 'Signals and Linear Systems',
      department: 'Electronics and Communication Engineering',
      academic_year: 2,
      semester: 3,
      credits: 4,
      course_type: 'Core Theory',
      level: 'Undergraduate',
      description: 'Continuous and discrete-time signals, LTI systems, convolution integral, Fourier series, Fourier Transform, Laplace Transform, and Z-Transform analysis.',
      prerequisites: 'EC101 Circuit Theory and Network Analysis',
      syllabus: 'Unit 1: Signal Classification & System Properties\nUnit 2: LTI Systems & Convolution\nUnit 3: Fourier Analysis of Continuous Signals\nUnit 4: Laplace Transform & System Stability\nUnit 5: Z-Transform & Discrete-Time Analysis',
      status: 'ACTIVE'
    },
    {
      code: 'EC301',
      name: 'VLSI Design & Verilog HDL Lab',
      department: 'Electronics and Communication Engineering',
      academic_year: 3,
      semester: 5,
      credits: 4,
      course_type: 'Integrated Theory & Lab',
      level: 'Undergraduate',
      description: 'CMOS logic gates, MOSFET fabrication physics, propagation delays, dynamic CMOS, stick diagrams, Verilog HDL synthesis, and FPGA design.',
      prerequisites: 'EC201 Signals and Linear Systems',
      syllabus: 'Unit 1: MOSFET Physics & CMOS Inverter Characteristics\nUnit 2: Static & Dynamic CMOS Logic Circuits\nUnit 3: Layout Design Rules & Parasitic Effects\nUnit 4: Verilog HDL Modeling & Testbenches\nUnit 5: FPGA Implementation & Timing Closure',
      status: 'ACTIVE'
    },
    {
      code: 'EC401',
      name: 'Wireless Sensor Networks & 5G Communications',
      department: 'Electronics and Communication Engineering',
      academic_year: 4,
      semester: 7,
      credits: 4,
      course_type: 'Professional Elective',
      level: 'Undergraduate',
      description: 'Cellular network design, massive MIMO, beamforming, 5G New Radio (NR) protocols, IoT low-power wireless standards (Zigbee, LoRaWAN), and sensor nodes.',
      prerequisites: 'EC301 VLSI Design & Verilog HDL Lab',
      syllabus: 'Unit 1: Wireless Propagation & Multi-path Fading\nUnit 2: Cellular Concepts, Handoff, & Channel Capacity\nUnit 3: 5G NR Architecture & Massive MIMO\nUnit 4: Wireless Sensor Network Protocols & Routing\nUnit 5: Low-Power WAN Technologies (LoRa, NB-IoT)',
      status: 'ACTIVE'
    },

    // -------------------------------------------------------------
    // 5. ELECTRICAL AND ELECTRONICS ENGINEERING
    // -------------------------------------------------------------
    {
      code: 'EE101',
      name: 'Basic Electrical Engineering & Magnetic Circuits',
      department: 'Electrical and Electronics Engineering',
      academic_year: 1,
      semester: 1,
      credits: 3,
      course_type: 'Core Theory',
      level: 'Undergraduate',
      description: 'DC & AC circuit fundamentals, magnetic circuits, single-phase transformers, measuring instruments, and basic electrical power safety.',
      prerequisites: 'None',
      syllabus: 'Unit 1: Electrical Quantities & DC Circuits\nUnit 2: Single-Phase & Three-Phase AC Systems\nUnit 3: Magnetic Circuits & Inductance\nUnit 4: Transformers & Operating Characteristics\nUnit 5: Electrical Measuring Instruments & Safety',
      status: 'ACTIVE'
    },
    {
      code: 'EE201',
      name: 'Electrical Machines & Electromechanical Conversion',
      department: 'Electrical and Electronics Engineering',
      academic_year: 2,
      semester: 3,
      credits: 4,
      course_type: 'Practical / Laboratory',
      level: 'Undergraduate',
      description: 'DC motors and generators, three-phase induction motors, synchronous machines, torque-speed curves, and industrial drive speed control.',
      prerequisites: 'EE101 Basic Electrical Engineering & Magnetic Circuits',
      syllabus: 'Unit 1: Electromechanical Energy Conversion Principles\nUnit 2: DC Generators & Motors Performance\nUnit 3: Three-Phase Induction Motors\nUnit 4: Synchronous Machines & Alternators\nUnit 5: Special Electrical Motors (BLDC, Stepper)',
      status: 'ACTIVE'
    },
    {
      code: 'EE301',
      name: 'Power Electronics & Variable Frequency Drives',
      department: 'Electrical and Electronics Engineering',
      academic_year: 3,
      semester: 5,
      credits: 4,
      course_type: 'Core Theory',
      level: 'Undergraduate',
      description: 'Power semiconductor switching (IGBT, MOSFET, Thyristor), phase-controlled rectifiers, DC-DC buck/boost converters, PWM inverters, and motor drives.',
      prerequisites: 'EE201 Electrical Machines & Electromechanical Conversion',
      syllabus: 'Unit 1: Power Semiconductor Switching Devices\nUnit 2: Phase-Controlled Rectifiers\nUnit 3: DC-DC Switching Converters (Buck, Boost)\nUnit 4: Pulse-Width Modulated Inverters\nUnit 5: AC/DC Motor Drives & Applications',
      status: 'ACTIVE'
    },
    {
      code: 'EE401',
      name: 'Electric Vehicles & Smart Grid Integration',
      department: 'Electrical and Electronics Engineering',
      academic_year: 4,
      semester: 7,
      credits: 4,
      course_type: 'Professional Elective',
      level: 'Undergraduate',
      description: 'EV powertrain dynamics, battery management systems (BMS), regenerative braking, bidirectional charging, and microgrid synchronization.',
      prerequisites: 'EE301 Power Electronics & Variable Frequency Drives',
      syllabus: 'Unit 1: Electric Vehicle Architecture & Dynamics\nUnit 2: Battery Chemistries & BMS Architectures\nUnit 3: EV Traction Inverters & Motor Drives\nUnit 4: V2G (Vehicle-to-Grid) Bidirectional Power\nUnit 5: Smart Microgrid Control & Renewable Sync',
      status: 'ACTIVE'
    },

    // -------------------------------------------------------------
    // 6. MECHANICAL ENGINEERING
    // -------------------------------------------------------------
    {
      code: 'ME101',
      name: 'Engineering Mechanics & Statics',
      department: 'Mechanical Engineering',
      academic_year: 1,
      semester: 1,
      credits: 4,
      course_type: 'Core Theory',
      level: 'Undergraduate',
      description: 'Force systems, equilibrium of rigid bodies, free body diagrams, truss analysis, friction, centroids, moments of inertia, and kinematic equations.',
      prerequisites: 'None',
      syllabus: 'Unit 1: Statics of Particles & Force Systems\nUnit 2: Equilibrium of Rigid Bodies & Free Body Diagrams\nUnit 3: Analysis of Simple Trusses & Frames\nUnit 4: Friction & Friction Drives\nUnit 5: Centroids & Moments of Inertia',
      status: 'ACTIVE'
    },
    {
      code: 'ME201',
      name: 'Manufacturing Technology & Metallurgy',
      department: 'Mechanical Engineering',
      academic_year: 2,
      semester: 3,
      credits: 4,
      course_type: 'Core Theory',
      level: 'Undergraduate',
      description: 'Metal casting processes, welding and joining technologies, forming and forging, phase diagrams, heat treatment of steels, and CNC machining.',
      prerequisites: 'ME101 Engineering Mechanics & Statics',
      syllabus: 'Unit 1: Metal Casting Processes & Gating Design\nUnit 2: Joining & Welding Technologies\nUnit 3: Metal Forming, Rolling, & Forging\nUnit 4: Material Science & Phase Diagrams (Fe-C)\nUnit 5: Heat Treatment & Surface Finishing',
      status: 'ACTIVE'
    },
    {
      code: 'ME301',
      name: 'Design of Transmission Systems & Machine Elements',
      department: 'Mechanical Engineering',
      academic_year: 3,
      semester: 5,
      credits: 4,
      course_type: 'Core Theory',
      level: 'Undergraduate',
      description: 'Design of shafts, gears (spur, helical, bevel, worm), flexible transmission elements (belts, chains), clutches, brakes, and bearing selection.',
      prerequisites: 'ME201 Manufacturing Technology & Metallurgy',
      syllabus: 'Unit 1: Design of Flexible Elements (Belts, Chains)\nUnit 2: Spur & Helical Gear Design\nUnit 3: Bevel & Worm Gear Transmissions\nUnit 4: Multi-Speed Gear Box Architecture\nUnit 5: Clutches, Brakes, & Hydrodynamic Bearings',
      status: 'ACTIVE'
    },
    {
      code: 'ME401',
      name: 'Computer Integrated Manufacturing & Autonomous Robotics',
      department: 'Mechanical Engineering',
      academic_year: 4,
      semester: 7,
      credits: 4,
      course_type: 'Professional Elective',
      level: 'Undergraduate',
      description: 'CNC part programming, automated guided vehicles (AGVs), industrial robotic arm kinematics (DH parameters), machine vision in manufacturing, and additive fabrication.',
      prerequisites: 'ME301 Design of Transmission Systems & Machine Elements',
      syllabus: 'Unit 1: CIM Concepts & Group Technology\nUnit 2: CNC Programming & Adaptive Control\nUnit 3: Robotic Arm Kinematics & Inverse Solutions\nUnit 4: Sensors & Actuators in Industrial Automation\nUnit 5: Additive Manufacturing (3D Printing) & Industry 4.0',
      status: 'ACTIVE'
    },

    // -------------------------------------------------------------
    // 7. CIVIL ENGINEERING
    // -------------------------------------------------------------
    {
      code: 'CE101',
      name: 'Engineering Geology & Surveying Techniques',
      department: 'Civil Engineering',
      academic_year: 1,
      semester: 1,
      credits: 3,
      course_type: 'Practical / Laboratory',
      level: 'Undergraduate',
      description: 'Geological formations, mineralogy, levelling, theodolite surveying, Total Station operations, contour mapping, and GPS field mapping.',
      prerequisites: 'None',
      syllabus: 'Unit 1: Physical Geology & Mineral Properties\nUnit 2: Linear Measurements & Compass Surveying\nUnit 3: Levelling, Contouring, & Earthwork Volumes\nUnit 4: Theodolite Traversing & Total Station\nUnit 5: GPS & Geographic Information Systems (GIS)',
      status: 'ACTIVE'
    },
    {
      code: 'CE201',
      name: 'Fluid Mechanics & Hydraulic Machinery',
      department: 'Civil Engineering',
      academic_year: 2,
      semester: 3,
      credits: 4,
      course_type: 'Integrated Theory & Lab',
      level: 'Undergraduate',
      description: 'Fluid statics, buoyancy, Bernoulli theorem, laminar and turbulent pipe flow, boundary layer theory, open channel flow, and hydraulic turbines/pumps.',
      prerequisites: 'CE101 Engineering Geology & Surveying Techniques',
      syllabus: 'Unit 1: Fluid Properties & Pressure Measurement\nUnit 2: Fluid Kinematics & Continuity Equations\nUnit 3: Dynamics of Fluid Flow (Bernoulli & Momentum)\nUnit 4: Flow Through Pipes & Boundary Layer Theory\nUnit 5: Hydraulic Turbines & Centrifugal Pumps',
      status: 'ACTIVE'
    },
    {
      code: 'CE301',
      name: 'Design of Reinforced Concrete Structures',
      department: 'Civil Engineering',
      academic_year: 3,
      semester: 5,
      credits: 4,
      course_type: 'Core Theory',
      level: 'Undergraduate',
      description: 'Limit state design philosophy, singly and doubly reinforced beams, shear design, bond and anchorage, two-way slabs, and axially loaded columns.',
      prerequisites: 'CE201 Fluid Mechanics & Hydraulic Machinery',
      syllabus: 'Unit 1: Limit State Design Principles & IS 456\nUnit 2: Analysis & Design of Singly/Doubly Beams\nUnit 3: Design for Shear, Torsion, & Development Length\nUnit 4: Design of One-Way & Two-Way Slabs\nUnit 5: Design of Short & Slender Columns',
      status: 'ACTIVE'
    },
    {
      code: 'CE401',
      name: 'Environmental Engineering & Sustainable Infrastructure',
      department: 'Civil Engineering',
      academic_year: 4,
      semester: 7,
      credits: 3,
      course_type: 'Professional Elective',
      level: 'Undergraduate',
      description: 'Water demand forecasting, water treatment plant design (coagulation, filtration, chlorination), sewage collection networks, and solid waste lifecycle.',
      prerequisites: 'CE301 Design of Reinforced Concrete Structures',
      syllabus: 'Unit 1: Water Quality Standards & Source Protection\nUnit 2: Water Treatment Unit Operations\nUnit 3: Wastewater Treatment & Activated Sludge Process\nUnit 4: Air Pollution Control & Noise Mitigation\nUnit 5: Solid Waste Management & Sustainable Cities',
      status: 'ACTIVE'
    },

    // -------------------------------------------------------------
    // 8. BIOMEDICAL ENGINEERING
    // -------------------------------------------------------------
    {
      code: 'BM101',
      name: 'Human Anatomy & Physiology for Engineers',
      department: 'Biomedical Engineering',
      academic_year: 1,
      semester: 1,
      credits: 3,
      course_type: 'Core Theory',
      level: 'Undergraduate',
      description: 'Cellular biology, cardiovascular hemodynamics, pulmonary mechanics, nervous system electrophysiology, and musculoskeletal biomechanics.',
      prerequisites: 'None',
      syllabus: 'Unit 1: Cell Physiology & Membrane Transport\nUnit 2: Cardiovascular System & Blood Flow Dynamics\nUnit 3: Respiratory Mechanics & Gas Exchange\nUnit 4: Nervous System & Action Potentials\nUnit 5: Musculoskeletal Biomechanics',
      status: 'ACTIVE'
    },
    {
      code: 'BM201',
      name: 'Biosignal Acquisition & Processing Lab',
      department: 'Biomedical Engineering',
      academic_year: 2,
      semester: 3,
      credits: 4,
      course_type: 'Integrated Theory & Lab',
      level: 'Undergraduate',
      description: 'Bioelectrodes, instrumentation amplifiers, filtering of ECG, EEG, and EMG signals, wavelets, and noise reduction techniques.',
      prerequisites: 'BM101 Human Anatomy & Physiology for Engineers',
      syllabus: 'Unit 1: Bioelectric Potentials & Electrode Interfaces\nUnit 2: Biomedical Instrumentation Amplifiers\nUnit 3: ECG Recording & QRS Complex Detection\nUnit 4: EEG Rhythms & EMG Spectral Analysis\nUnit 5: Digital Filtering & Artifact Removal',
      status: 'ACTIVE'
    },
    {
      code: 'BM301',
      name: 'Diagnostic and Therapeutic Equipment',
      department: 'Biomedical Engineering',
      academic_year: 3,
      semester: 5,
      credits: 4,
      course_type: 'Core Theory',
      level: 'Undergraduate',
      description: 'Cardiac pacemakers, defibrillators, dialyzers, ventilators, surgical diathermy, infant incubators, and patient monitoring telemetries.',
      prerequisites: 'BM201 Biosignal Acquisition & Processing Lab',
      syllabus: 'Unit 1: Cardiac Pacemakers & Defibrillators\nUnit 2: Hemodialysis Systems & Artificial Kidney\nUnit 3: Mechanical Ventilators & Anesthesia Machines\nUnit 4: Electrosurgical Units & Diathermy\nUnit 5: ICU Patient Monitors & Electrical Safety',
      status: 'ACTIVE'
    },
    {
      code: 'BM401',
      name: 'Medical Imaging Physics & Neural Engineering',
      department: 'Biomedical Engineering',
      academic_year: 4,
      semester: 7,
      credits: 4,
      course_type: 'Professional Elective',
      level: 'Undergraduate',
      description: 'Physics of X-ray CT, MRI (Bloch equations, RF pulses), ultrasound transducers, PET/SPECT nuclear imaging, and Brain-Computer Interfaces (BCI).',
      prerequisites: 'BM301 Diagnostic and Therapeutic Equipment',
      syllabus: 'Unit 1: X-Ray Physics & Computed Tomography (CT)\nUnit 2: Magnetic Resonance Imaging (MRI) Principles\nUnit 3: Ultrasound Physics & Doppler Echocardiography\nUnit 4: Nuclear Medicine (PET/SPECT) Imaging\nUnit 5: Brain-Computer Interfaces & Neuro-prosthetics',
      learning_outcomes: 'Model MRI spin dynamics; Process ultrasound Doppler signals; Design non-invasive BCI classifiers.',
      assessment_pattern: '40% CIA, 60% ESE',
      schedule_info: 'Mon, Wed • 11:30 AM - 01:00 PM • Bio-Optics Suite',
      max_seats: 40,
      status: 'ACTIVE'
    },

    // -------------------------------------------------------------
    // 9. EXPANDED ACADEMIC SPECIALIZATION COURSES
    // -------------------------------------------------------------
    // ARTIFICIAL INTELLIGENCE
    {
      code: 'AD303',
      name: 'Reinforcement Learning & Autonomous Decision Systems',
      department: 'Artificial Intelligence and Data Science',
      academic_year: 3,
      semester: 6,
      credits: 4,
      course_type: 'Core Theory',
      level: 'Undergraduate',
      description: 'Markov decision processes (MDPs), value/policy iteration, temporal difference learning (Q-Learning, SARSA), deep Q-networks (DQN), policy gradient methods (PPO, TRPO), and multi-agent reinforcement learning.',
      prerequisites: 'AD202 Applied Machine Learning & Statistical Inference',
      syllabus: 'Unit 1: Foundations of Reinforcement Learning & MDPs\nUnit 2: Dynamic Programming & Monte Carlo Methods\nUnit 3: Temporal Difference Learning (Q-Learning, SARSA)\nUnit 4: Deep Q-Networks (DQN) & Double DQN\nUnit 5: Policy Gradient Methods (REINFORCE, Actor-Critic, PPO)',
      learning_outcomes: 'Formulate sequential decision problems as MDPs; Implement tabular TD learning and Deep RL agents in PyTorch; Analyze policy gradient convergence.',
      assessment_pattern: '40% CIA (Quizzes, Lab Assignments, Midterm), 60% ESE',
      schedule_info: 'Mon, Wed, Fri • 11:30 AM - 01:00 PM • AI Lab 302',
      max_seats: 50,
      status: 'ACTIVE'
    },
    {
      code: 'AD203',
      name: 'Knowledge Representation and Reasoning in AI',
      department: 'Artificial Intelligence and Data Science',
      academic_year: 2,
      semester: 4,
      credits: 3,
      course_type: 'Core Theory',
      level: 'Undergraduate',
      description: 'First-order logic, ontologies, description logics (OWL), semantic web technologies, knowledge graphs (Neo4j), probabilistic reasoning, and Bayesian belief networks.',
      prerequisites: 'AD101 Python Programming for AI & Data Science',
      syllabus: 'Unit 1: Propositional & First-Order Logic in AI\nUnit 2: Ontological Engineering & Semantic Web (RDF, OWL)\nUnit 3: Knowledge Graphs & Graph Querying (SPARQL, Cypher)\nUnit 4: Probabilistic Reasoning & Bayesian Belief Networks\nUnit 5: Automated Theorem Proving & Rule-Based Expert Systems',
      learning_outcomes: 'Construct domain ontologies and knowledge graphs; Query knowledge bases using SPARQL; Perform probabilistic inference with Bayesian networks.',
      assessment_pattern: '40% CIA, 60% ESE',
      schedule_info: 'Tue, Thu • 09:00 AM - 10:30 AM • Turing Hall 202',
      max_seats: 60,
      status: 'ACTIVE'
    },

    // DATA SCIENCE
    {
      code: 'DS201',
      name: 'Statistical Foundations for Data Science & Predictive Analytics',
      department: 'Data Science',
      academic_year: 2,
      semester: 3,
      credits: 4,
      course_type: 'Core Theory',
      level: 'Undergraduate',
      description: 'Probability distributions, central limit theorem, hypothesis testing (Z, t, Chi-Square, ANOVA), confidence intervals, regression diagnostics, and resampling techniques.',
      prerequisites: 'CS101 Problem Solving & C Programming',
      syllabus: 'Unit 1: Probability Theory & Random Variables\nUnit 2: Sampling Distributions & Central Limit Theorem\nUnit 3: Parametric & Non-Parametric Hypothesis Testing\nUnit 4: Linear & Logistic Regression Diagnostics\nUnit 5: Bootstrapping, Jackknife & Monte Carlo Simulations',
      learning_outcomes: 'Design statistical experiments; Conduct rigorous hypothesis tests; Validate predictive modeling assumptions with diagnostic metrics.',
      assessment_pattern: '40% CIA, 60% ESE',
      schedule_info: 'Mon, Wed, Fri • 02:00 PM - 03:30 PM • Gauss Lecture Hall 101',
      max_seats: 60,
      status: 'ACTIVE'
    },
    {
      code: 'DS301',
      name: 'Data Mining, Feature Engineering & High-Dimensional Analytics',
      department: 'Data Science',
      academic_year: 3,
      semester: 5,
      credits: 4,
      course_type: 'Integrated Theory & Lab',
      level: 'Undergraduate',
      description: 'Association rule mining (Apriori, FP-Growth), high-dimensional clustering, dimensionality reduction (PCA, t-SNE, UMAP), automated feature engineering, and anomaly detection.',
      prerequisites: 'DS201 Statistical Foundations for Data Science & Predictive Analytics',
      syllabus: 'Unit 1: Data Preprocessing & Advanced Feature Encoding\nUnit 2: Frequent Pattern Mining & Association Rules\nUnit 3: Advanced Clustering & Density-Based Methods (DBSCAN, HDBSCAN)\nUnit 4: High-Dimensional Reduction (PCA, Kernel PCA, t-SNE, UMAP)\nUnit 5: Anomaly Detection & Time-Series Pattern Mining',
      learning_outcomes: 'Engineer robust feature sets from noisy datasets; Uncover latent patterns in high-dimensional domains; Deploy anomaly detection pipelines.',
      assessment_pattern: '50% Theory & Lab Continuous Assessment, 50% End Term',
      schedule_info: 'Tue, Thu • 10:30 AM - 12:00 PM • Data Science Lab 205',
      max_seats: 50,
      status: 'ACTIVE'
    },

    // COMPUTER SCIENCE & PROGRAMMING
    {
      code: 'CS205',
      name: 'Computer Organization, Architecture & Microprocessors',
      department: 'Computer Science and Engineering',
      academic_year: 2,
      semester: 3,
      credits: 4,
      course_type: 'Core Theory',
      level: 'Undergraduate',
      description: 'Instruction set architecture (RISC-V/x86), ALU design, pipelining, hazard resolution, memory hierarchy (cache design, virtual memory), and I/O interfacing.',
      prerequisites: 'CS101 Problem Solving & C Programming',
      syllabus: 'Unit 1: Digital Logic & Register Transfer Language\nUnit 2: Central Processing Unit & RISC-V Instruction Architecture\nUnit 3: Pipelining Principles, Data & Control Hazards\nUnit 4: Memory Hierarchy, Cache Mapping, & Virtual Memory\nUnit 5: Multiprocessor Architectures & Parallel Processing',
      learning_outcomes: 'Understand hardware-software boundary; Analyze CPU pipelining performance; Design cache hierarchies and address translation mechanisms.',
      assessment_pattern: '40% CIA, 60% ESE',
      schedule_info: 'Mon, Wed • 08:30 AM - 10:00 AM • Von Neumann Hall 103',
      max_seats: 60,
      status: 'ACTIVE'
    },
    {
      code: 'CS304',
      name: 'Theory of Computation & Automata Theory',
      department: 'Computer Science and Engineering',
      academic_year: 3,
      semester: 5,
      credits: 4,
      course_type: 'Core Theory',
      level: 'Undergraduate',
      description: 'Deterministic and non-deterministic finite automata (DFA/NFA), regular expressions, context-free grammars, pushdown automata, Turing machines, decidability, and the Halting problem.',
      prerequisites: 'CS102 Discrete Mathematical Structures',
      syllabus: 'Unit 1: Finite Automata & Regular Languages\nUnit 2: Context-Free Grammars & Pushdown Automata\nUnit 3: Pumping Lemmas for Regular & Context-Free Languages\nUnit 4: Turing Machines & Church-Turing Thesis\nUnit 5: Decidability, Undecidability & Halting Problem',
      learning_outcomes: 'Construct DFAs, NFAs, and Turing Machines; Prove language non-regularity via Pumping Lemma; Analyze computational boundaries.',
      assessment_pattern: '40% CIA, 60% ESE',
      schedule_info: 'Tue, Thu, Fri • 01:30 PM - 03:00 PM • Turing Auditorium',
      max_seats: 60,
      status: 'ACTIVE'
    },
    {
      code: 'CS103',
      name: 'Advanced Data Structures & Modern C++ Systems Programming',
      department: 'Computer Science and Engineering',
      academic_year: 1,
      semester: 2,
      credits: 4,
      course_type: 'Integrated Theory & Lab',
      level: 'Undergraduate',
      description: 'Modern C++ (C++20), RAII, smart pointers, templates, STL containers, balanced search trees (AVL, Red-Black, B-Trees), segment trees, and cache-friendly memory allocators.',
      prerequisites: 'CS101 Problem Solving & C Programming',
      syllabus: 'Unit 1: Modern C++ Features, Move Semantics & Smart Pointers\nUnit 2: Self-Balancing Trees (AVL, Red-Black Trees, B+ Trees)\nUnit 3: Priority Queues, Binomial & Fibonacci Heaps\nUnit 4: Disjoint Set Union (DSU) & Segment Trees\nUnit 5: Memory Allocators, Concurrency & STL Deep Dive',
      learning_outcomes: 'Write performant, memory-safe C++ systems code; Implement advanced balanced trees from scratch; Build concurrent data structures.',
      assessment_pattern: '50% Practical Lab Assessment, 50% Theory Exam',
      schedule_info: 'Mon, Wed, Fri • 09:00 AM - 10:30 AM • Systems Computing Lab',
      max_seats: 60,
      status: 'ACTIVE'
    },
    {
      code: 'IT102',
      name: 'Cross-Platform Mobile Application Development with Flutter & React Native',
      department: 'Information Technology',
      academic_year: 2,
      semester: 4,
      credits: 4,
      course_type: 'Integrated Theory & Lab',
      level: 'Undergraduate',
      description: 'Mobile UI/UX paradigms, Flutter/Dart reactive widgets, React Native bridge architecture, local state management (Bloc, Redux), SQLite storage, push notifications, and app store deployment.',
      prerequisites: 'IT101 Information Technology Essentials & Web Foundations',
      syllabus: 'Unit 1: Mobile UI/UX Design & Flutter Framework Foundations\nUnit 2: State Management Paradigms (Riverpod, Bloc, Redux)\nUnit 3: Hardware APIs (Camera, Geolocation, Biometrics)\nUnit 4: Persistent Offline Storage & Firebase Integration\nUnit 5: Automated Testing, Fastlane CI/CD & App Store Release',
      learning_outcomes: 'Build responsive cross-platform native apps; Manage complex state with predictable unidirection flows; Deploy to iOS and Android environments.',
      assessment_pattern: '60% Project Milestones & Lab, 40% Final Exam',
      schedule_info: 'Mon, Thu • 03:00 PM - 05:00 PM • Mobile Engineering Lab',
      max_seats: 50,
      status: 'ACTIVE'
    },

    // MACHINE LEARNING & DEEP LEARNING
    {
      code: 'ML302',
      name: 'Machine Learning Operations (MLOps) & Pipeline Engineering',
      department: 'Artificial Intelligence and Machine Learning',
      academic_year: 3,
      semester: 6,
      credits: 4,
      course_type: 'Integrated Theory & Lab',
      level: 'Undergraduate',
      description: 'End-to-end ML lifecycle, data versioning with DVC, experiment tracking with MLflow, containerized serving with BentoML/TorchServe, drift detection with Evidently, and Kubeflow orchestration.',
      prerequisites: 'AD202 Applied Machine Learning & Statistical Inference',
      syllabus: 'Unit 1: Principles of MLOps & Reproducible ML Lifecycle\nUnit 2: Data Versioning (DVC) & Experiment Tracking (MLflow)\nUnit 3: Continuous Integration & Automated Model Testing\nUnit 4: Model Serving (FastAPI, TorchServe, Triton Server)\nUnit 5: Data Drift, Concept Drift Monitoring & Kubeflow Pipelines',
      learning_outcomes: 'Automate model training and validation pipelines; Package models for low-latency inference; Detect production data distribution shifts.',
      assessment_pattern: '50% CIA & Pipeline Projects, 50% End Term',
      schedule_info: 'Tue, Fri • 02:00 PM - 04:00 PM • Cloud ML Lab 401',
      max_seats: 45,
      status: 'ACTIVE'
    },
    {
      code: 'AI202',
      name: 'Pattern Recognition & Applied Machine Learning',
      department: 'Artificial Intelligence and Machine Learning',
      academic_year: 2,
      semester: 4,
      credits: 4,
      course_type: 'Core Theory',
      level: 'Undergraduate',
      description: 'Statistical pattern classification, Bayesian decision theory, discriminant functions, kernel methods, Support Vector Machines (SVM), and hidden Markov models (HMMs).',
      prerequisites: 'AD101 Python Programming for AI & Data Science',
      syllabus: 'Unit 1: Bayesian Decision Theory & Maximum Likelihood Estimation\nUnit 2: Linear Discriminant Functions & Perceptrons\nUnit 3: Kernel Methods & Support Vector Machines\nUnit 4: Hidden Markov Models (HMMs) & Sequence Decoding\nUnit 5: Feature Extraction, Fisher Linear Discriminant & Manifold Learning',
      learning_outcomes: 'Formulate classification as Bayesian risk minimization; Derive optimal SVM decision boundaries; Implement Viterbi algorithms for sequence tagging.',
      assessment_pattern: '40% CIA, 60% ESE',
      schedule_info: 'Mon, Wed • 10:00 AM - 11:30 AM • Ramanujan Hall',
      max_seats: 60,
      status: 'ACTIVE'
    },
    {
      code: 'AD304',
      name: 'Generative AI, Diffusion Models & Multi-Modal Deep Learning',
      department: 'Artificial Intelligence and Data Science',
      academic_year: 3,
      semester: 6,
      credits: 4,
      course_type: 'Professional Elective',
      level: 'Undergraduate',
      description: 'Variational Autoencoders (VAEs), Generative Adversarial Networks (GANs), Denoising Diffusion Probabilistic Models (DDPM), Stable Diffusion, CLIP cross-modal embeddings, and vision-language models (VLMs).',
      prerequisites: 'AD301 Deep Learning & Neural Network Architectures',
      syllabus: 'Unit 1: Latent Variable Models & Variational Autoencoders (VAEs)\nUnit 2: Generative Adversarial Networks (StyleGAN, CycleGAN)\nUnit 3: Diffusion Models (DDPM, Score-Based Generative Models)\nUnit 4: Multi-Modal Contrastive Learning (CLIP, BLIP)\nUnit 5: Vision-Language Models & Generative Audio Architectures',
      learning_outcomes: 'Implement DDPM and VAE architectures; Train multi-modal alignment models with CLIP loss; Fine-tune vision-language foundation models.',
      assessment_pattern: '50% Project Implementation, 50% End Term Exam',
      schedule_info: 'Wed, Fri • 01:30 PM - 03:00 PM • AI Research Studio 501',
      max_seats: 45,
      status: 'ACTIVE'
    },

    // CLOUD COMPUTING & DISTRIBUTED SYSTEMS
    {
      code: 'CC301',
      name: 'Cloud Native Architecture & Distributed Microservices',
      department: 'Computer Science and Engineering',
      academic_year: 3,
      semester: 6,
      credits: 3,
      course_type: 'Core Theory',
      level: 'Undergraduate',
      description: '12-Factor app principles, microservices communication (gRPC, REST, Event Sourcing), service mesh (Istio), distributed tracing (OpenTelemetry), and Kubernetes deployment topologies.',
      prerequisites: 'CS301 Distributed Cloud Architecture',
      syllabus: 'Unit 1: 12-Factor App Methodology & Microservice Decomposition\nUnit 2: Synchronous & Asynchronous Messaging (gRPC, RabbitMQ)\nUnit 3: Event Sourcing & CQRS Patterns\nUnit 4: Service Mesh, Envoy Proxy & Istio Traffic Control\nUnit 5: Distributed Observability (Prometheus, Jaeger, OpenTelemetry)',
      learning_outcomes: 'Architect resilient event-driven microservices; Implement service-mesh security and mTLS; Instrument telemetry for distributed observability.',
      assessment_pattern: '40% CIA, 60% ESE',
      schedule_info: 'Tue, Thu • 08:30 AM - 10:00 AM • Cloud Center Hall',
      max_seats: 55,
      status: 'ACTIVE'
    },
    {
      code: 'IT302',
      name: 'Cloud Virtualization, Serverless Computing & AWS Solutions',
      department: 'Information Technology',
      academic_year: 3,
      semester: 5,
      credits: 4,
      course_type: 'Integrated Theory & Lab',
      level: 'Undergraduate',
      description: 'Hypervisors, container runtimes (containerd), serverless execution (AWS Lambda, Cloudflare Workers), cloud storage tiers (S3, DynamoDB), and IAM security best practices.',
      prerequisites: 'IT201 Full-Stack Cloud Application Engineering',
      syllabus: 'Unit 1: Virtualization Technologies (Type 1 & 2 Hypervisors, KVM)\nUnit 2: Serverless Computing Architectures & Event Triggers\nUnit 3: AWS Core Services (EC2, S3, RDS, DynamoDB, VPC)\nUnit 4: Cloud Security, IAM Policies & KMS Encryption\nUnit 5: Cost Optimization & High-Availability Multi-Region Design',
      learning_outcomes: 'Deploy scalable serverless micro-backends; Configure multi-tier VPC network topologies; Implement zero-trust cloud IAM policies.',
      assessment_pattern: '50% Practical Lab Assessment, 50% Theory Exam',
      schedule_info: 'Mon, Wed, Fri • 03:30 PM - 05:00 PM • Cloud Infrastructure Lab',
      max_seats: 50,
      status: 'ACTIVE'
    },

    // CYBER SECURITY
    {
      code: 'CY302',
      name: 'Ethical Hacking, Penetration Testing & Network Defense',
      department: 'Cyber Security',
      academic_year: 3,
      semester: 6,
      credits: 4,
      course_type: 'Integrated Theory & Lab',
      level: 'Undergraduate',
      description: 'Reconnaissance, vulnerability scanning (Nmap, Nessus), exploitation with Metasploit, web application security (OWASP Top 10), privilege escalation, and active directory penetration.',
      prerequisites: 'IT301 Cyber Security & Cryptographic Protocols',
      syllabus: 'Unit 1: Penetration Testing Methodologies & Ethics\nUnit 2: Network Reconnaissance & Port Scanning\nUnit 3: Vulnerability Assessment & Exploitation (Metasploit)\nUnit 4: Web Application Hacking (SQLi, XSS, CSRF, SSRF)\nUnit 5: Post-Exploitation, Privilege Escalation & Remediation Reporting',
      learning_outcomes: 'Conduct safe penetration testing; Identify and remediate OWASP Top 10 vulnerabilities; Produce enterprise security audit dossiers.',
      assessment_pattern: '60% Hands-on Capture-The-Flag (CTF) Labs, 40% Theory',
      schedule_info: 'Tue, Thu • 02:00 PM - 04:30 PM • Cyber Defense Range 101',
      max_seats: 40,
      status: 'ACTIVE'
    },
    {
      code: 'CY201',
      name: 'Applied Information Security & Cryptographic Systems',
      department: 'Cyber Security',
      academic_year: 2,
      semester: 3,
      credits: 4,
      course_type: 'Core Theory',
      level: 'Undergraduate',
      description: 'Modern block ciphers (AES-GCM), public-key cryptography (ECC, Diffie-Hellman), zero-knowledge proofs, digital certificates (X.509), and secure transport layers (TLS 1.3).',
      prerequisites: 'CS102 Discrete Mathematical Structures',
      syllabus: 'Unit 1: Information Security Principles & Threat Landscapes\nUnit 2: Symmetric Encryption & Galois/Counter Mode (GCM)\nUnit 3: Elliptic Curve Cryptography (ECC) & Key Exchange\nUnit 4: PKI, X.509 Certificates & TLS 1.3 Handshake Protocol\nUnit 5: Zero-Knowledge Proofs & Post-Quantum Cryptography Basics',
      learning_outcomes: 'Analyze cryptographic cipher security; Implement secure TLS socket communication; Evaluate post-quantum security resilience.',
      assessment_pattern: '40% CIA, 60% ESE',
      schedule_info: 'Mon, Wed • 10:00 AM - 11:30 AM • Cryptography Suite',
      max_seats: 50,
      status: 'ACTIVE'
    },

    // DATABASE SYSTEMS
    {
      code: 'DB202',
      name: 'Advanced Database Management Systems, Indexing & Query Tuning',
      department: 'Computer Science and Engineering',
      academic_year: 2,
      semester: 4,
      credits: 4,
      course_type: 'Integrated Theory & Lab',
      level: 'Undergraduate',
      description: 'Storage engine internals (B+ Tree, LSM Trees), query compilation, cost-based optimizer mechanics, lock management, multi-version concurrency control (MVCC), and crash recovery (ARIES).',
      prerequisites: 'AD201 Database Systems & NoSQL Data Architecture',
      syllabus: 'Unit 1: Database Storage Engines & Buffer Pool Management\nUnit 2: B+ Tree, Hash & LSM Tree Indexing Structures\nUnit 3: Cost-Based Query Optimization & Join Algorithms\nUnit 4: Concurrency Control (2PL, Timestamp, MVCC)\nUnit 5: WAL, ARIES Crash Recovery & Distributed Consensus',
      learning_outcomes: 'Optimize slow SQL queries using explain plan metrics; Understand B+ Tree vs LSM Tree performance trade-offs; Implement ACID transaction protocols.',
      assessment_pattern: '50% Practical Query Lab, 50% Theory Exam',
      schedule_info: 'Tue, Thu • 11:30 AM - 01:00 PM • Database Systems Lab',
      max_seats: 55,
      status: 'ACTIVE'
    },
    {
      code: 'DS302',
      name: 'Distributed NoSQL Datastores & Real-Time Stream Ingestion',
      department: 'Data Science',
      academic_year: 3,
      semester: 6,
      credits: 4,
      course_type: 'Integrated Theory & Lab',
      level: 'Undergraduate',
      description: 'Column-family stores (Cassandra), key-value stores (Redis), distributed stream processing with Apache Flink, exactly-once processing semantics, and real-time dashboarding.',
      prerequisites: 'AD302 Big Data Analytics & Distributed Computing',
      syllabus: 'Unit 1: NoSQL Taxonomies & Consistency Models (CAP/PACELC)\nUnit 2: Wide-Column Architecture with Apache Cassandra\nUnit 3: In-Memory Datastores & Caching with Redis Cluster\nUnit 4: Real-Time Stream Processing with Apache Flink\nUnit 5: End-to-End Exactly-Once Data Streaming Architectures',
      learning_outcomes: 'Design data models for wide-column distributed stores; Implement streaming pipelines with Apache Flink; Guarantee exactly-once delivery.',
      assessment_pattern: '50% Lab & Streaming Projects, 50% End Term',
      schedule_info: 'Mon, Fri • 01:30 PM - 03:30 PM • Real-Time Systems Lab',
      max_seats: 45,
      status: 'ACTIVE'
    },

    // SOFTWARE ENGINEERING
    {
      code: 'SE301',
      name: 'Software Architecture, Design Patterns & Enterprise Agile Methodologies',
      department: 'Computer Science and Engineering',
      academic_year: 3,
      semester: 5,
      credits: 4,
      course_type: 'Core Theory',
      level: 'Undergraduate',
      description: 'Gang of Four (GoF) design patterns, SOLID principles, Clean Architecture, Domain-Driven Design (DDD), Scrum/Kanban frameworks, and technical debt management.',
      prerequisites: 'CS201 Object-Oriented Programming with Java',
      syllabus: 'Unit 1: Software Lifecycle Models & Scaled Agile Frameworks\nUnit 2: SOLID Principles & Creational/Structural Design Patterns\nUnit 3: Behavioral Patterns & Clean Architecture Layers\nUnit 4: Domain-Driven Design (Bounded Contexts, Aggregates)\nUnit 5: Architectural Refactoring, Technical Debt & Code Smells',
      learning_outcomes: 'Apply GoF design patterns to complex problems; Model enterprise domains using DDD bounded contexts; Conduct architectural code reviews.',
      assessment_pattern: '40% CIA, 60% ESE',
      schedule_info: 'Tue, Thu • 09:30 AM - 11:00 AM • Software Engineering Studio',
      max_seats: 60,
      status: 'ACTIVE'
    },
    {
      code: 'SE401',
      name: 'Software Quality Assurance, Automated Testing & Verification',
      department: 'Computer Science and Engineering',
      academic_year: 4,
      semester: 7,
      credits: 3,
      course_type: 'Professional Elective',
      level: 'Undergraduate',
      description: 'Test-Driven Development (TDD), Behavior-Driven Development (BDD), unit/integration/e2e testing frameworks (Jest, Playwright), mutation testing, static code analysis (SonarQube), and formal verification.',
      prerequisites: 'SE301 Software Architecture, Design Patterns & Enterprise Agile Methodologies',
      syllabus: 'Unit 1: Testing Fundamentals & Test Pyramid Strategy\nUnit 2: Test-Driven Development (TDD) & BDD (Cucumber)\nUnit 3: End-to-End Automated Testing (Playwright, Cypress)\nUnit 4: Mutation Testing & Static Code Analysis (SonarQube)\nUnit 5: Performance Profiling, Load Testing (k6) & Security Testing',
      learning_outcomes: 'Write comprehensive automated test suites; Implement CI testing gates with code coverage thresholds; Conduct formal verification.',
      assessment_pattern: '50% Automated Test Portfolio, 50% Exam',
      schedule_info: 'Wed, Fri • 10:00 AM - 11:30 AM • QA Lab 304',
      max_seats: 50,
      status: 'ACTIVE'
    },

    // -------------------------------------------------------------
    // 10. OFFICIAL VERIFIED NPTEL / SWAYAM ONLINE COURSES
    // -------------------------------------------------------------
    {
      code: 'NPTEL-CS101',
      name: 'Programming, Data Structures and Algorithms Using Python',
      department: 'Computer Science and Engineering',
      academic_year: 1,
      semester: 2,
      credits: 3,
      course_type: 'Core Theory',
      level: 'Undergraduate',
      description: 'Official NPTEL / SWAYAM national online course covering algorithmic problem solving, Python recursion, searching, sorting, and linear/non-linear data structures.',
      prerequisites: 'Basic Mathematical Foundations',
      syllabus: 'Unit 1: Python Basics & Computational Thinking\nUnit 2: Searching, Sorting & Asymptotic Notation\nUnit 3: Recursive Data Structures & Backtracking\nUnit 4: Stacks, Queues, Heaps & Binary Search Trees\nUnit 5: Dynamic Programming on Sequences & Graphs',
      learning_outcomes: 'Write algorithmic solutions in Python; Implement and benchmark common data structures; Solve recurrence relations.',
      assessment_pattern: '25% Weekly Online Assignments, 75% Proctored NPTEL Exam',
      schedule_info: 'Online / Self-Paced • 8 Weeks Duration • NPTEL Portal',
      max_seats: 120,
      is_nptel: true,
      nptel_course_id: 'noc24-cs101',
      nptel_url: 'https://nptel.ac.in/courses/106106145',
      nptel_institute: 'Chennai Mathematical Institute (CMI) / NPTEL',
      nptel_instructor: 'Prof. Madhavan Mukund',
      nptel_duration: '8 Weeks',
      nptel_exam_date: '2026-04-26',
      nptel_enrollment_end: '2026-03-31',
      status: 'ACTIVE'
    },
    {
      code: 'NPTEL-CS102',
      name: 'Getting Started With Competitive Programming',
      department: 'Computer Science and Engineering',
      academic_year: 2,
      semester: 3,
      credits: 4,
      course_type: 'Professional Elective',
      level: 'Undergraduate',
      description: 'Official NPTEL course focusing on high-efficiency competitive programming heuristics, number theory, graph flows, segment trees, and dynamic programming tricks.',
      prerequisites: 'CS103 Advanced Data Structures & Modern C++ Systems Programming',
      syllabus: 'Unit 1: Greedy Strategies & Binary Search on Answers\nUnit 2: Number Theory (GCD, Sieve, Modular Arithmetic)\nUnit 3: Graph Shortest Paths & Minimum Spanning Trees\nUnit 4: Dynamic Programming State Optimization & Bitmasking\nUnit 5: Range Queries with Fenwick & Segment Trees',
      learning_outcomes: 'Solve Codeforces/LeetCode hard problems within runtime bounds; Implement advanced range query trees; Apply bitmask DP.',
      assessment_pattern: '25% Contest Problems, 75% Proctored Exam',
      schedule_info: 'Online / Live Discussion • 12 Weeks • NPTEL Portal',
      max_seats: 100,
      is_nptel: true,
      nptel_course_id: 'noc24-cs102',
      nptel_url: 'https://nptel.ac.in/courses/106106232',
      nptel_institute: 'IIT Gandhinagar / NPTEL',
      nptel_instructor: 'Prof. Neeldhara Misra',
      nptel_duration: '12 Weeks',
      nptel_exam_date: '2026-05-03',
      nptel_enrollment_end: '2026-03-31',
      status: 'ACTIVE'
    },
    {
      code: 'NPTEL-CS103',
      name: 'The Joy of Computing using Python',
      department: 'Computer Science and Engineering',
      academic_year: 1,
      semester: 1,
      credits: 3,
      course_type: 'Open Elective',
      level: 'Undergraduate',
      description: 'Popular NPTEL interactive course making programming intuitive through playful problem solving, cryptographic puzzles, image manipulation, and simulations.',
      prerequisites: 'None',
      syllabus: 'Unit 1: Motivation & Creative Coding in Python\nUnit 2: Games, Puzzles & String Manipulation\nUnit 3: Cryptography & Caesar Cipher Implementation\nUnit 4: Image Processing & Turtle Visualizations\nUnit 5: Web Scraping, Social Network Analysis & Simulation',
      learning_outcomes: 'Develop intrinsic passion for algorithmic logic; Automate daily workflows with Python; Build simple interactive software.',
      assessment_pattern: '25% Weekly Quizzes, 75% End Exam',
      schedule_info: 'Online / Interactive • 12 Weeks • NPTEL Portal',
      max_seats: 150,
      is_nptel: true,
      nptel_course_id: 'noc24-cs103',
      nptel_url: 'https://nptel.ac.in/courses/106106182',
      nptel_institute: 'IIT Ropar / NPTEL',
      nptel_instructor: 'Prof. Sudarshan Iyengar',
      nptel_duration: '12 Weeks',
      nptel_exam_date: '2026-05-03',
      nptel_enrollment_end: '2026-03-31',
      status: 'ACTIVE'
    },
    {
      code: 'NPTEL-DS101',
      name: 'Python for Data Science',
      department: 'Data Science',
      academic_year: 2,
      semester: 3,
      credits: 2,
      course_type: 'Professional Elective',
      level: 'Undergraduate',
      description: 'Fast-track NPTEL course exploring data ingestion, exploratory analysis with Pandas, linear models with scikit-learn, and statistical data visualization.',
      prerequisites: 'Basic Python Knowledge',
      syllabus: 'Unit 1: Introduction to Data Science & Python Setup\nUnit 2: NumPy Arrays & Matrix Mathematics\nUnit 3: Data Munging with Pandas DataFrames\nUnit 4: Exploratory Data Analysis & Visualization (Seaborn)\nUnit 5: Predictive Modeling with Scikit-Learn',
      learning_outcomes: 'Perform exploratory analysis on messy real-world data; Train baseline regressors and classifiers in scikit-learn.',
      assessment_pattern: '25% Weekly Assignments, 75% Proctored Exam',
      schedule_info: 'Online • 4 Weeks Intensive • NPTEL Portal',
      max_seats: 150,
      is_nptel: true,
      nptel_course_id: 'noc24-ds101',
      nptel_url: 'https://nptel.ac.in/courses/106106212',
      nptel_institute: 'IIT Madras / NPTEL',
      nptel_instructor: 'Prof. Ragunathan Rengasamy',
      nptel_duration: '4 Weeks',
      nptel_exam_date: '2026-04-19',
      nptel_enrollment_end: '2026-03-31',
      status: 'ACTIVE'
    },
    {
      code: 'NPTEL-AI101',
      name: 'Reinforcement Learning',
      department: 'Artificial Intelligence and Data Science',
      academic_year: 3,
      semester: 6,
      credits: 4,
      course_type: 'Professional Elective',
      level: 'Postgraduate',
      description: 'Rigorous NPTEL advanced course covering dynamic programming, Monte Carlo methods, TD learning, function approximation, and policy gradients.',
      prerequisites: 'Probability, Linear Algebra, Machine Learning',
      syllabus: 'Unit 1: Multi-Armed Bandits & Exploration Strategies\nUnit 2: Finite Markov Decision Processes\nUnit 3: Dynamic Programming (Value & Policy Iteration)\nUnit 4: Temporal-Difference Learning & Q-Learning\nUnit 5: Eligibility Traces, Function Approximation & Policy Gradients',
      learning_outcomes: 'Master theoretical foundations of RL; Implement tabular and approximate RL agents; Prove convergence bounds.',
      assessment_pattern: '25% Assignments, 75% Final Exam',
      schedule_info: 'Online • 12 Weeks • NPTEL Portal',
      max_seats: 80,
      is_nptel: true,
      nptel_course_id: 'noc24-ai101',
      nptel_url: 'https://nptel.ac.in/courses/106106198',
      nptel_institute: 'IIT Madras / NPTEL',
      nptel_instructor: 'Prof. Balaraman Ravindran',
      nptel_duration: '12 Weeks',
      nptel_exam_date: '2026-05-03',
      nptel_enrollment_end: '2026-03-31',
      status: 'ACTIVE'
    },
    {
      code: 'NPTEL-AI102',
      name: 'Deep Learning',
      department: 'Artificial Intelligence and Data Science',
      academic_year: 3,
      semester: 5,
      credits: 4,
      course_type: 'Core Theory',
      level: 'Postgraduate',
      description: 'Comprehensive NPTEL course covering multi-layer perceptrons, backpropagation, CNNs for computer vision, RNNs/LSTMs for sequence modeling, and autoencoders.',
      prerequisites: 'Linear Algebra, Calculus, Python',
      syllabus: 'Unit 1: Biological Neurons to Multi-Layer Perceptrons\nUnit 2: Optimization Methods (SGD, Adam, RMSprop)\nUnit 3: Convolutional Neural Networks (ResNet, VGG)\nUnit 4: Recurrent Neural Networks & Attention Mechanisms\nUnit 5: Generative Models (Autoencoders, GANs)',
      learning_outcomes: 'Build state-of-the-art neural architectures; Tune deep hyperparameters effectively; Deploy vision models.',
      assessment_pattern: '25% Online Assignments, 75% Proctored Exam',
      schedule_info: 'Online • 12 Weeks • NPTEL Portal',
      max_seats: 90,
      is_nptel: true,
      nptel_course_id: 'noc24-ai102',
      nptel_url: 'https://nptel.ac.in/courses/106105215',
      nptel_institute: 'IIT Kharagpur / NPTEL',
      nptel_instructor: 'Prof. Prabir Kumar Biswas',
      nptel_duration: '12 Weeks',
      nptel_exam_date: '2026-05-03',
      nptel_enrollment_end: '2026-03-31',
      status: 'ACTIVE'
    },
    {
      code: 'NPTEL-DB101',
      name: 'Database Management System',
      department: 'Computer Science and Engineering',
      academic_year: 2,
      semester: 3,
      credits: 3,
      course_type: 'Core Theory',
      level: 'Undergraduate',
      description: 'NPTEL fundamental course on relational schemas, SQL, relational calculus, schema normalization (1NF to BCNF), and transaction concurrency.',
      prerequisites: 'CS102 Discrete Mathematical Structures',
      syllabus: 'Unit 1: Relational Model & Relational Algebra\nUnit 2: Structured Query Language (SQL) & Constraints\nUnit 3: Database Normalization (1NF, 2NF, 3NF, BCNF)\nUnit 4: Transaction Processing & ACID Properties\nUnit 5: Concurrency Control Protocols & Recovery',
      learning_outcomes: 'Design normalized ER models; Write optimized multi-table SQL queries; Implement serializable transactions.',
      assessment_pattern: '25% Assignments, 75% Proctored Exam',
      schedule_info: 'Online • 8 Weeks • NPTEL Portal',
      max_seats: 120,
      is_nptel: true,
      nptel_course_id: 'noc24-db101',
      nptel_url: 'https://nptel.ac.in/courses/106105175',
      nptel_institute: 'IIT Kharagpur / NPTEL',
      nptel_instructor: 'Prof. Partha Pratim Das',
      nptel_duration: '8 Weeks',
      nptel_exam_date: '2026-04-26',
      nptel_enrollment_end: '2026-03-31',
      status: 'ACTIVE'
    },
    {
      code: 'NPTEL-CC101',
      name: 'Cloud Computing',
      department: 'Computer Science and Engineering',
      academic_year: 3,
      semester: 5,
      credits: 3,
      course_type: 'Professional Elective',
      level: 'Undergraduate',
      description: 'NPTEL flagship cloud systems course explaining cloud architectures (IaaS, PaaS, SaaS), virtualization mechanisms, distributed storage, and SLA management.',
      prerequisites: 'Computer Networks, Operating Systems',
      syllabus: 'Unit 1: Cloud Computing Principles & Service Models\nUnit 2: Virtualization & Hypervisor Architectures\nUnit 3: Cloud Storage Systems & Distributed File Systems\nUnit 4: Resource Management, Scheduling & SLAs\nUnit 5: Cloud Security, OpenStack & Industrial Cloud Case Studies',
      learning_outcomes: 'Evaluate cloud service trade-offs; Design fault-tolerant cloud services; Formulate resource provisioning strategies.',
      assessment_pattern: '25% Weekly Quizzes, 75% Final Proctored Exam',
      schedule_info: 'Online • 8 Weeks • NPTEL Portal',
      max_seats: 120,
      is_nptel: true,
      nptel_course_id: 'noc24-cc101',
      nptel_url: 'https://nptel.ac.in/courses/106105167',
      nptel_institute: 'IIT Kharagpur / NPTEL',
      nptel_instructor: 'Prof. Soumya Kanti Ghosh',
      nptel_duration: '8 Weeks',
      nptel_exam_date: '2026-04-26',
      nptel_enrollment_end: '2026-03-31',
      status: 'ACTIVE'
    },
    {
      code: 'NPTEL-CY101',
      name: 'Cryptography and Network Security',
      department: 'Cyber Security',
      academic_year: 3,
      semester: 5,
      credits: 4,
      course_type: 'Core Theory',
      level: 'Undergraduate',
      description: 'Foundational NPTEL course in mathematical cryptography: classical ciphers, DES/AES, RSA, Discrete Log, digital signatures, and IPsec/SSL protocols.',
      prerequisites: 'CS102 Discrete Mathematical Structures',
      syllabus: 'Unit 1: Classical Ciphers & Shannon Theory of Secrecy\nUnit 2: Symmetric Key Cryptography (DES, AES, Block Cipher Modes)\nUnit 3: Public Key Cryptography (RSA, Diffie-Hellman, ElGamal)\nUnit 4: Cryptographic Hash Functions & Digital Signatures (SHA, DSA)\nUnit 5: Network Security Protocols (Kerberos, IPsec, TLS)',
      learning_outcomes: 'Perform modular arithmetic proofs; Implement cryptographic hash algorithms; Audit network security configurations.',
      assessment_pattern: '25% Assignments, 75% Proctored Exam',
      schedule_info: 'Online • 12 Weeks • NPTEL Portal',
      max_seats: 100,
      is_nptel: true,
      nptel_course_id: 'noc24-cy101',
      nptel_url: 'https://nptel.ac.in/courses/106105162',
      nptel_institute: 'IIT Kharagpur / NPTEL',
      nptel_instructor: 'Prof. Sourav Mukhopadhyay',
      nptel_duration: '12 Weeks',
      nptel_exam_date: '2026-05-03',
      nptel_enrollment_end: '2026-03-31',
      status: 'ACTIVE'
    },
    {
      code: 'NPTEL-SE101',
      name: 'Software Engineering',
      department: 'Computer Science and Engineering',
      academic_year: 3,
      semester: 5,
      credits: 4,
      course_type: 'Core Theory',
      level: 'Undergraduate',
      description: 'Classical NPTEL software engineering curriculum detailing requirements engineering, UML modeling, function-oriented design, object-oriented metrics, and testing.',
      prerequisites: 'CS201 Object-Oriented Programming with Java',
      syllabus: 'Unit 1: Software Lifecycle Models & Requirement Engineering\nUnit 2: Structured Analysis, Design & Data Flow Diagrams (DFDs)\nUnit 3: Object-Oriented Design Using UML (Class, Sequence, State)\nUnit 4: Software Coding Standards, Refactoring & Metrics\nUnit 5: Software Testing Strategies (Black-Box, White-Box, Integration)',
      learning_outcomes: 'Draft SRS documents; Construct UML architectures; Calculate cyclomatic complexity and achieve 100% path coverage.',
      assessment_pattern: '25% Assignments, 75% Proctored Exam',
      schedule_info: 'Online • 12 Weeks • NPTEL Portal',
      max_seats: 120,
      is_nptel: true,
      nptel_course_id: 'noc24-se101',
      nptel_url: 'https://nptel.ac.in/courses/106105182',
      nptel_institute: 'IIT Kharagpur / NPTEL',
      nptel_instructor: 'Prof. Rajib Mall',
      nptel_duration: '12 Weeks',
      nptel_exam_date: '2026-05-03',
      nptel_enrollment_end: '2026-03-31',
      status: 'ACTIVE'
    }
  ];

  // Insert all courses
  const createdCourses: Record<string, any> = {};
  coursesData.forEach((c: any) => {
    const course = db.insert('courses', {
      code: c.code,
      name: c.name,
      department: c.department,
      academic_year: c.academic_year,
      semester: c.semester,
      credits: c.credits,
      course_type: c.course_type,
      level: c.level,
      description: c.description,
      prerequisites: c.prerequisites,
      syllabus: c.syllabus,
      learning_outcomes: c.learning_outcomes || '',
      assessment_pattern: c.assessment_pattern || '40% Continuous Internal Assessment, 60% End Semester Examination',
      schedule_info: c.schedule_info || 'Mon, Wed, Fri • Lecture Hall',
      max_seats: c.max_seats || 60,
      is_nptel: Boolean(c.is_nptel),
      nptel_course_id: c.nptel_course_id || null,
      nptel_url: c.nptel_url || null,
      nptel_institute: c.nptel_institute || null,
      nptel_instructor: c.nptel_instructor || null,
      nptel_duration: c.nptel_duration || null,
      nptel_exam_date: c.nptel_exam_date || null,
      nptel_enrollment_end: c.nptel_enrollment_end || null,
      status: c.status || 'ACTIVE',
      created_by: adminProfile.id
    });
    createdCourses[c.code] = course;
  });

  // 5. CREATE ACTIVE CLASSES / SECTIONS WITH INSTRUCTORS
  const classSectionsData = [
    // CSE 2nd Year (Sem 4)
    {
      courseCode: 'CS202',
      dept: 'Computer Science and Engineering',
      section_name: 'Sec-A',
      term: 'Spring 2026',
      room: 'Turing Hall 304',
      days: 'Mon, Wed, Fri',
      time: '09:00 AM - 10:30 AM',
      capacity: 45
    },
    {
      courseCode: 'CS202',
      dept: 'Computer Science and Engineering',
      section_name: 'Sec-B',
      term: 'Spring 2026',
      room: 'Turing Hall 306',
      days: 'Tue, Thu',
      time: '11:00 AM - 12:30 PM',
      capacity: 45
    },
    // CSE 3rd Year (Sem 5)
    {
      courseCode: 'CS301',
      dept: 'Computer Science and Engineering',
      section_name: 'Sec-A',
      term: 'Spring 2026',
      room: 'Hopper Lab 208',
      days: 'Mon, Wed',
      time: '02:00 PM - 03:30 PM',
      capacity: 40
    },
    // AI & DS 2nd Year (Sem 4)
    {
      courseCode: 'AD202',
      dept: 'Artificial Intelligence and Data Science',
      section_name: 'Sec-A',
      term: 'Spring 2026',
      room: 'Euler Complex 102',
      days: 'Tue, Thu',
      time: '09:30 AM - 11:00 AM',
      capacity: 40
    },
    // AI & DS 1st Year (Sem 2)
    {
      courseCode: 'AD102',
      dept: 'Artificial Intelligence and Data Science',
      section_name: 'Sec-A',
      term: 'Spring 2026',
      room: 'Lovelace Computing Suite 101',
      days: 'Mon, Wed, Fri',
      time: '10:00 AM - 11:30 AM',
      capacity: 40
    },
    // IT 2nd Year (Sem 3)
    {
      courseCode: 'IT201',
      dept: 'Information Technology',
      section_name: 'Sec-A',
      term: 'Spring 2026',
      room: 'Berners-Lee Studio 202',
      days: 'Tue, Thu',
      time: '01:30 PM - 03:00 PM',
      capacity: 40
    },
    // ECE 3rd Year (Sem 5)
    {
      courseCode: 'EC301',
      dept: 'Electronics and Communication Engineering',
      section_name: 'Sec-A',
      term: 'Spring 2026',
      room: 'Maxwell Hall 105',
      days: 'Mon, Wed',
      time: '11:00 AM - 12:30 PM',
      capacity: 40
    },
    // EEE 2nd Year (Sem 3)
    {
      courseCode: 'EE201',
      dept: 'Electrical and Electronics Engineering',
      section_name: 'Sec-A',
      term: 'Spring 2026',
      room: 'Tesla Machinery Lab 102',
      days: 'Tue, Thu',
      time: '02:00 PM - 03:30 PM',
      capacity: 35
    },
    // ME 2nd Year (Sem 3)
    {
      courseCode: 'ME201',
      dept: 'Mechanical Engineering',
      section_name: 'Sec-A',
      term: 'Spring 2026',
      room: 'Watt Workshop 104',
      days: 'Mon, Wed, Fri',
      time: '08:30 AM - 10:00 AM',
      capacity: 40
    },
    // CE 2nd Year (Sem 3)
    {
      courseCode: 'CE201',
      dept: 'Civil Engineering',
      section_name: 'Sec-A',
      term: 'Spring 2026',
      room: 'Smeaton Hydraulics Hall 101',
      days: 'Mon, Wed',
      time: '10:00 AM - 11:30 AM',
      capacity: 35
    },
    // BME 2nd Year (Sem 3)
    {
      courseCode: 'BM201',
      dept: 'Biomedical Engineering',
      section_name: 'Sec-A',
      term: 'Spring 2026',
      room: 'Curie Bio-Instrumentation Suite 201',
      days: 'Tue, Thu',
      time: '10:00 AM - 11:30 AM',
      capacity: 35
    }
  ];

  const createdClasses: Record<string, any> = {};
  classSectionsData.forEach((cs) => {
    const course = createdCourses[cs.courseCode];
    if (!course) return;
    const fac = facultyRecords[cs.dept] || Object.values(facultyRecords)[0];
    const newClass = db.insert('classes', {
      course_id: course.id,
      teacher_id: fac.teacher.id,
      section_name: cs.section_name,
      academic_term: cs.term,
      room: cs.room,
      schedule_days: cs.days,
      schedule_time: cs.time,
      capacity: cs.capacity
    });
    createdClasses[`${cs.courseCode}_${cs.section_name}`] = newClass;
  });

  // 6. ENROLL STUDENTS INTO MATCHING COURSES & SECTIONS
  // Alex, Priya, David into CS202 (Sec-A), CS301 (Sec-A), AD202 (Sec-A)
  const enrolledStudentGroup = [studentAlex, studentPriya, studentDavid];
  const targetClassesForStudents = [
    createdClasses['CS202_Sec-A'],
    createdClasses['CS301_Sec-A'],
    createdClasses['AD202_Sec-A']
  ].filter(Boolean);

  enrolledStudentGroup.forEach((st) => {
    targetClassesForStudents.forEach((cls) => {
      // Course enrollment
      const existingCourseEnrollment = db.find('enrollments', (e) => e.course_id === cls.course_id && e.student_id === st.id)[0];
      if (!existingCourseEnrollment) {
        db.insert('enrollments', {
          course_id: cls.course_id,
          student_id: st.id,
          status: 'ENROLLED'
        });
      }

      // Class section enrollment
      const existingClassStudent = db.find('class_students', (cs) => cs.class_id === cls.id && cs.student_id === st.id)[0];
      if (!existingClassStudent) {
        db.insert('class_students', {
          class_id: cls.id,
          student_id: st.id,
          enrolled_at: now
        });
      }
    });
  });

  // 7. ATTENDANCE SESSIONS & RECORDS
  const csClass = createdClasses['CS202_Sec-A'];
  const adClass = createdClasses['AD202_Sec-A'];
  const sessionDates = ['2026-03-02', '2026-03-04', '2026-03-06', '2026-03-09', '2026-03-11', '2026-03-13'];

  if (csClass) {
    sessionDates.forEach((dt, idx) => {
      const s = db.insert('attendance_sessions', {
        class_id: csClass.id,
        teacher_id: csClass.teacher_id,
        session_date: dt,
        session_topic: `Advanced Algorithms Lecture ${idx + 1}: Dynamic Programming Optimizations`
      });

      db.insert('attendance_records', { session_id: s.id, student_id: studentAlex.id, status: idx === 3 ? 'ABSENT' : (idx === 4 ? 'LATE' : 'PRESENT') });
      db.insert('attendance_records', { session_id: s.id, student_id: studentPriya.id, status: 'PRESENT' });
      db.insert('attendance_records', { session_id: s.id, student_id: studentDavid.id, status: idx % 2 === 0 ? 'PRESENT' : 'ABSENT' });
    });
  }

  if (adClass) {
    sessionDates.forEach((dt, idx) => {
      const s = db.insert('attendance_sessions', {
        class_id: adClass.id,
        teacher_id: adClass.teacher_id,
        session_date: dt,
        session_topic: `Machine Learning Session ${idx + 1}: Regularized Estimators & Optimization`
      });

      db.insert('attendance_records', { session_id: s.id, student_id: studentAlex.id, status: 'PRESENT' });
      db.insert('attendance_records', { session_id: s.id, student_id: studentPriya.id, status: 'PRESENT' });
      db.insert('attendance_records', { session_id: s.id, student_id: studentDavid.id, status: 'PRESENT' });
    });
  }

  // 8. ASSIGNMENTS & SUBMISSIONS
  if (csClass) {
    const asg1 = db.insert('assignments', {
      course_id: csClass.course_id,
      class_id: csClass.id,
      teacher_id: csClass.teacher_id,
      title: 'Assignment 1: Matrix Chain Multiplication & DP Memoization',
      description: 'Implement dynamic programming algorithms for optimal matrix parenthesization in O(n^3) and compare benchmark execution timings against naive recursive implementations.',
      due_date: '2026-03-20T23:59:59.000Z',
      maximum_marks: 100
    });

    db.insert('assignment_submissions', {
      assignment_id: asg1.id,
      student_id: studentAlex.id,
      submission_text: 'Completed DP matrix parenthesization algorithm with test harness. Asymptotic speedup verified.',
      marks_obtained: 94,
      feedback: 'Excellent work. Clean recurrence formulation and benchmark analysis.',
      evaluated_by: csClass.teacher_id,
      evaluated_at: now,
      status: 'EVALUATED'
    });

    db.insert('assignment_submissions', {
      assignment_id: asg1.id,
      student_id: studentPriya.id,
      submission_text: 'Submitted implementation with memoized cache tables.',
      marks_obtained: 98,
      feedback: 'Flawless code structure and comprehensive complexity proofs.',
      evaluated_by: csClass.teacher_id,
      evaluated_at: now,
      status: 'EVALUATED'
    });

    db.insert('assignment_submissions', {
      assignment_id: asg1.id,
      student_id: studentDavid.id,
      submission_text: 'Initial recursive code with bottom-up DP table.',
      marks_obtained: 78,
      feedback: 'Good attempt. Minor boundary indexing issue in table initialization.',
      evaluated_by: csClass.teacher_id,
      evaluated_at: now,
      status: 'EVALUATED'
    });
  }

  // 9. EXAMINATIONS & RESULTS
  if (csClass) {
    const exam1 = db.insert('examinations', {
      course_id: csClass.course_id,
      class_id: csClass.id,
      teacher_id: csClass.teacher_id,
      name: 'Midterm Examination: Algorithmic Paradigms & Flows',
      exam_type: 'MIDTERM',
      exam_date: '2026-03-28',
      start_time: '10:00 AM',
      duration_minutes: 90,
      maximum_marks: 100,
      weightage_percent: 30
    });

    db.insert('exam_results', {
      examination_id: exam1.id,
      student_id: studentAlex.id,
      marks_obtained: 91,
      grade: 'A+',
      remarks: 'Outstanding performance across DP and graph flow proofs.',
      graded_by: csClass.teacher_id,
      graded_at: now
    });

    db.insert('exam_results', {
      examination_id: exam1.id,
      student_id: studentPriya.id,
      marks_obtained: 95,
      grade: 'A+',
      remarks: 'Top score in cohort.',
      graded_by: csClass.teacher_id,
      graded_at: now
    });

    db.insert('exam_results', {
      examination_id: exam1.id,
      student_id: studentDavid.id,
      marks_obtained: 76,
      grade: 'B',
      remarks: 'Solid grasp of fundamentals. Review Ford-Fulkerson min-cut theorem.',
      graded_by: csClass.teacher_id,
      graded_at: now
    });
  }

  // Initial audit log
  db.logAudit('DATABASE_SEEDED', 'system', 'all', adminProfile.email, adminProfile.id, { coursesCount: coursesData.length });
  console.log(`[Database Seed] Successfully initialized ${coursesData.length} academic courses across 8 departments and 4 academic years.`);
}

export function syncAcademicCatalog() {
  const existingCourses = db.find('courses');
  const admin = db.find('profiles', (p) => p.role === 'ADMIN')[0] || { id: 'admin_sys_id', email: 'admin@edusense.ai' };
  
  // If no courses or missing courses, run seed
  if (!existingCourses || existingCourses.length < 15) {
    seedSampleAcademicData();
    return;
  }
}
