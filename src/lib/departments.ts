export interface AcademicDepartment {
  id: string;
  name: string;
  shortCode: string;
  category: 'Engineering & Technology' | 'Science & Mathematics' | 'Commerce & Management' | 'Humanities & Social Sciences' | 'Medical & Applied Sciences' | 'Other Disciplines';
}

export const ACADEMIC_DEPARTMENTS: AcademicDepartment[] = [
  // Engineering & Technology
  {
    id: 'ai-ds',
    name: 'Artificial Intelligence and Data Science',
    shortCode: 'AI & DS',
    category: 'Engineering & Technology',
  },
  {
    id: 'ai-ml',
    name: 'Artificial Intelligence and Machine Learning',
    shortCode: 'AI & ML',
    category: 'Engineering & Technology',
  },
  {
    id: 'cse',
    name: 'Computer Science and Engineering',
    shortCode: 'CSE',
    category: 'Engineering & Technology',
  },
  {
    id: 'cse-aiml',
    name: 'Computer Science and Engineering – AI & ML',
    shortCode: 'CSE (AI & ML)',
    category: 'Engineering & Technology',
  },
  {
    id: 'it',
    name: 'Information Technology',
    shortCode: 'IT',
    category: 'Engineering & Technology',
  },
  {
    id: 'ece',
    name: 'Electronics and Communication Engineering',
    shortCode: 'ECE',
    category: 'Engineering & Technology',
  },
  {
    id: 'eee',
    name: 'Electrical and Electronics Engineering',
    shortCode: 'EEE',
    category: 'Engineering & Technology',
  },
  {
    id: 'me',
    name: 'Mechanical Engineering',
    shortCode: 'ME',
    category: 'Engineering & Technology',
  },
  {
    id: 'ce',
    name: 'Civil Engineering',
    shortCode: 'CE',
    category: 'Engineering & Technology',
  },
  {
    id: 'bme',
    name: 'Biomedical Engineering',
    shortCode: 'BME',
    category: 'Engineering & Technology',
  },
  {
    id: 'biotech',
    name: 'Biotechnology',
    shortCode: 'BT',
    category: 'Engineering & Technology',
  },
  {
    id: 'che',
    name: 'Chemical Engineering',
    shortCode: 'ChE',
    category: 'Engineering & Technology',
  },
  {
    id: 'auto',
    name: 'Automobile Engineering',
    shortCode: 'AUTO',
    category: 'Engineering & Technology',
  },
  {
    id: 'ae',
    name: 'Aerospace Engineering',
    shortCode: 'AE',
    category: 'Engineering & Technology',
  },
  {
    id: 'robotics',
    name: 'Robotics and Automation',
    shortCode: 'ROBO',
    category: 'Engineering & Technology',
  },
  {
    id: 'iot',
    name: 'Internet of Things',
    shortCode: 'IoT',
    category: 'Engineering & Technology',
  },
  {
    id: 'cybersec',
    name: 'Cyber Security',
    shortCode: 'CYBER',
    category: 'Engineering & Technology',
  },
  {
    id: 'csbs',
    name: 'Computer Science and Business Systems',
    shortCode: 'CSBS',
    category: 'Engineering & Technology',
  },

  // Science & Mathematics
  {
    id: 'math',
    name: 'Mathematics',
    shortCode: 'MATH',
    category: 'Science & Mathematics',
  },
  {
    id: 'physics',
    name: 'Physics',
    shortCode: 'PHYS',
    category: 'Science & Mathematics',
  },
  {
    id: 'chem',
    name: 'Chemistry',
    shortCode: 'CHEM',
    category: 'Science & Mathematics',
  },
  {
    id: 'cs',
    name: 'Computer Science',
    shortCode: 'CS',
    category: 'Science & Mathematics',
  },
  {
    id: 'stats',
    name: 'Statistics',
    shortCode: 'STATS',
    category: 'Science & Mathematics',
  },
  {
    id: 'ds',
    name: 'Data Science',
    shortCode: 'DS',
    category: 'Science & Mathematics',
  },
  {
    id: 'microbio',
    name: 'Microbiology',
    shortCode: 'MB',
    category: 'Science & Mathematics',
  },
  {
    id: 'biochem',
    name: 'Biochemistry',
    shortCode: 'BC',
    category: 'Science & Mathematics',
  },

  // Commerce & Management
  {
    id: 'commerce',
    name: 'Commerce',
    shortCode: 'COMM',
    category: 'Commerce & Management',
  },
  {
    id: 'bba',
    name: 'Business Administration',
    shortCode: 'BBA',
    category: 'Commerce & Management',
  },
  {
    id: 'mgmt',
    name: 'Business Management',
    shortCode: 'MGMT',
    category: 'Commerce & Management',
  },
  {
    id: 'finance',
    name: 'Finance',
    shortCode: 'FIN',
    category: 'Commerce & Management',
  },
  {
    id: 'accounting',
    name: 'Accounting',
    shortCode: 'ACC',
    category: 'Commerce & Management',
  },
  {
    id: 'marketing',
    name: 'Marketing',
    shortCode: 'MKT',
    category: 'Commerce & Management',
  },
  {
    id: 'hr',
    name: 'Human Resources',
    shortCode: 'HR',
    category: 'Commerce & Management',
  },

  // Humanities & Social Sciences
  {
    id: 'english',
    name: 'English',
    shortCode: 'ENG',
    category: 'Humanities & Social Sciences',
  },
  {
    id: 'tamil',
    name: 'Tamil',
    shortCode: 'TAM',
    category: 'Humanities & Social Sciences',
  },
  {
    id: 'econ',
    name: 'Economics',
    shortCode: 'ECON',
    category: 'Humanities & Social Sciences',
  },
  {
    id: 'psych',
    name: 'Psychology',
    shortCode: 'PSYCH',
    category: 'Humanities & Social Sciences',
  },
  {
    id: 'sociology',
    name: 'Sociology',
    shortCode: 'SOC',
    category: 'Humanities & Social Sciences',
  },
  {
    id: 'history',
    name: 'History',
    shortCode: 'HIST',
    category: 'Humanities & Social Sciences',
  },
  {
    id: 'polsci',
    name: 'Political Science',
    shortCode: 'POL',
    category: 'Humanities & Social Sciences',
  },
  {
    id: 'journalism',
    name: 'Journalism and Mass Communication',
    shortCode: 'JMC',
    category: 'Humanities & Social Sciences',
  },

  // Medical, Applied Sciences & Professional
  {
    id: 'pharmacy',
    name: 'Pharmacy',
    shortCode: 'PHARM',
    category: 'Medical & Applied Sciences',
  },
  {
    id: 'nursing',
    name: 'Nursing',
    shortCode: 'NURS',
    category: 'Medical & Applied Sciences',
  },
  {
    id: 'arch',
    name: 'Architecture',
    shortCode: 'ARCH',
    category: 'Medical & Applied Sciences',
  },
  {
    id: 'law',
    name: 'Law',
    shortCode: 'LAW',
    category: 'Other Disciplines',
  },
  {
    id: 'edu',
    name: 'Education',
    shortCode: 'EDU',
    category: 'Other Disciplines',
  },
  {
    id: 'other',
    name: 'Other',
    shortCode: 'OTH',
    category: 'Other Disciplines',
  },
];

export const DEPARTMENT_CATEGORIES = [
  'Engineering & Technology',
  'Science & Mathematics',
  'Commerce & Management',
  'Humanities & Social Sciences',
  'Medical & Applied Sciences',
  'Other Disciplines',
] as const;

export const DEFAULT_DEPARTMENT = 'Artificial Intelligence and Data Science';

export function getDepartmentByName(name: string): AcademicDepartment | undefined {
  return ACADEMIC_DEPARTMENTS.find(
    (d) =>
      (d.name || "").toLowerCase() === (name || "").toLowerCase() ||
      (d.shortCode || "").toLowerCase() === (name || "").toLowerCase() ||
      (name === 'AI & DS' && d.id === 'ai-ds') ||
      (name === 'AI & ML' && d.id === 'ai-ml')
  );
}

export function getDepartmentDisplay(name: string): { fullName: string; shortCode: string } {
  const dept = getDepartmentByName(name);
  if (dept) {
    return { fullName: dept.name, shortCode: dept.shortCode };
  }
  return { fullName: name, shortCode: name.length > 8 ? name.substring(0, 6) + '..' : name };
}
