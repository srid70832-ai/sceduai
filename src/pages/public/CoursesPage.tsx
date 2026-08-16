import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../lib/api';
import { Course } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  Search, 
  BookOpen, 
  Plus, 
  ArrowRight, 
  Building, 
  Sparkles, 
  Filter, 
  X, 
  Calendar, 
  User, 
  Layers, 
  CheckCircle2, 
  GraduationCap, 
  RotateCcw,
  SlidersHorizontal,
  Award,
  Users,
  CheckCircle,
  Clock,
  Download,
  AlertCircle,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { ACADEMIC_DEPARTMENTS } from '../../lib/departments';

interface CoursesPageProps {
  onNavigate: (path: string) => void;
}

export const CoursesPage: React.FC<CoursesPageProps> = ({ onNavigate }) => {
  const { user, student, loadDemoData } = useAuth();
  const { showToast } = useToast();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [departmentsList, setDepartmentsList] = useState<Array<{ id: string; name: string; shortCode: string }>>([]);
  const [teachersList, setTeachersList] = useState<any[]>([]);

  // Active Tab: All | Core & Electives | NPTEL
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNIVERSITY' | 'NPTEL'>('ALL');

  // Filters State
  const [search, setSearch] = useState<string>('');
  const [department, setDepartment] = useState<string>('All');
  const [academicYear, setAcademicYear] = useState<string>('All');
  const [semester, setSemester] = useState<string>('All');
  const [courseType, setCourseType] = useState<string>('All');
  const [credits, setCredits] = useState<string>('All');
  const [level, setLevel] = useState<string>('All');
  const [facultyId, setFacultyId] = useState<string>('All');
  const [section, setSection] = useState<string>('All');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  // Quick Register Modal State
  const [registeringCourse, setRegisteringCourse] = useState<Course | null>(null);
  const [isEnrolling, setIsEnrolling] = useState<boolean>(false);
  const [quickSyllabusCourse, setQuickSyllabusCourse] = useState<Course | null>(null);

  // Load departments and teachers
  useEffect(() => {
    Promise.all([
      api.getDepartments().catch(() => ACADEMIC_DEPARTMENTS),
      api.getTeachers().catch(() => [])
    ]).then(([depts, teachers]) => {
      setDepartmentsList(depts);
      setTeachersList(teachers);
    });
  }, []);

  const fetchCourses = () => {
    setIsLoading(true);
    const nptelParam = activeTab === 'NPTEL' ? true : activeTab === 'UNIVERSITY' ? false : undefined;
    
    api.getCourses({
      search: search.trim() || undefined,
      department: department !== 'All' ? department : undefined,
      academic_year: academicYear !== 'All' ? academicYear : undefined,
      semester: semester !== 'All' ? semester : undefined,
      course_type: courseType !== 'All' ? courseType : undefined,
      credits: credits !== 'All' ? credits : undefined,
      level: level !== 'All' ? level : undefined,
      faculty_id: facultyId !== 'All' ? facultyId : undefined,
      section: section !== 'All' ? section : undefined,
      is_nptel: nptelParam
    })
      .then((data) => setCourses(data))
      .catch(() => setCourses([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchCourses();
  }, [activeTab, department, academicYear, semester, courseType, credits, level, facultyId, section]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses();
  };

  const handleResetFilters = () => {
    setSearch('');
    setDepartment('All');
    setAcademicYear('All');
    setSemester('All');
    setCourseType('All');
    setCredits('All');
    setLevel('All');
    setFacultyId('All');
    setSection('All');
    setActiveTab('ALL');
  };

  const handleQuickRegister = async () => {
    if (!registeringCourse) return;

    if (!user) {
      showToast('Please sign in with your student credentials to register.', 'info');
      onNavigate('/login');
      return;
    }

    if (user.role !== 'STUDENT') {
      showToast('Only authenticated student profiles can register for courses.', 'error');
      return;
    }

    setIsEnrolling(true);
    try {
      await api.enrollCourse(registeringCourse.id);
      showToast(`Successfully registered for ${registeringCourse.code} - ${registeringCourse.name}!`, 'success');
      setRegisteringCourse(null);
      fetchCourses();
    } catch (err: any) {
      showToast(err.message || 'Registration request could not be processed.', 'error');
    } finally {
      setIsEnrolling(false);
    }
  };

  const exportCatalogToCSV = () => {
    if (courses.length === 0) {
      showToast('No course records available to export.', 'info');
      return;
    }

    const headers = [
      'Course Code',
      'Course Title',
      'Department',
      'Academic Year',
      'Semester',
      'Credits',
      'Category / Type',
      'Degree Level',
      'Max Capacity',
      'Registered Count',
      'Available Seats',
      'Status',
      'Is NPTEL',
      'NPTEL Institute',
      'Instructor'
    ];

    const rows = courses.map((c) => [
      `"${c.code}"`,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.department}"`,
      c.academic_year || Math.ceil((c.semester || 1) / 2),
      c.semester || 1,
      c.credits,
      `"${c.course_type || 'Core Theory'}"`,
      `"${c.level || 'Undergraduate'}"`,
      c.max_seats || 60,
      c.enrolled_count || 0,
      c.available_seats !== undefined ? c.available_seats : (c.max_seats || 60) - (c.enrolled_count || 0),
      `"${c.status || 'ACTIVE'}"`,
      c.is_nptel ? 'YES' : 'NO',
      `"${c.nptel_institute || 'N/A'}"`,
      `"${c.primary_faculty || c.nptel_instructor || 'Unassigned'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EduSense_Academic_Course_Catalog_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${courses.length} courses to CSV file.`, 'success');
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (search.trim()) count++;
    if (department !== 'All') count++;
    if (academicYear !== 'All') count++;
    if (semester !== 'All') count++;
    if (courseType !== 'All') count++;
    if (credits !== 'All') count++;
    if (level !== 'All') count++;
    if (facultyId !== 'All') count++;
    if (section !== 'All') count++;
    if (activeTab !== 'ALL') count++;
    return count;
  }, [search, department, academicYear, semester, courseType, credits, level, facultyId, section, activeTab]);

  const courseTypes = [
    'All',
    'Core Theory',
    'Integrated Theory & Lab',
    'Practical / Laboratory',
    'Professional Elective',
    'Open Elective',
    'Project / Seminar',
    'Mandatory Non-Credit'
  ];

  const levels = ['All', 'Undergraduate', 'Postgraduate', 'Diploma', 'Certificate'];
  const creditOptions = ['All', '1', '2', '3', '4', '5+'];
  const yearOptions = [
    { label: 'All Years', value: 'All' },
    { label: '1st Year (Sem 1-2)', value: '1' },
    { label: '2nd Year (Sem 3-4)', value: '2' },
    { label: '3rd Year (Sem 5-6)', value: '3' },
    { label: '4th Year (Sem 7-8)', value: '4' }
  ];
  const semesterOptions = [
    { label: 'All Semesters', value: 'All' },
    { label: 'Semester 1', value: '1' },
    { label: 'Semester 2', value: '2' },
    { label: 'Semester 3', value: '3' },
    { label: 'Semester 4', value: '4' },
    { label: 'Semester 5', value: '5' },
    { label: 'Semester 6', value: '6' },
    { label: 'Semester 7', value: '7' },
    { label: 'Semester 8', value: '8' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Bar */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            University Curricular Catalog & Registration System
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Academic Course Catalog
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse verified courses across all academic departments, check real-time seat availability, and register with instant credit tracking.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={exportCatalogToCSV}
            className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-indigo-500" />
            Export Catalog (CSV)
          </button>

          {user?.role === 'STUDENT' && (
            <button
              onClick={() => onNavigate('/student/courses')}
              className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer border border-indigo-200 dark:border-indigo-800"
            >
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              My Enrolled Courses
            </button>
          )}

          {user?.role === 'ADMIN' && (
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('/admin/courses')}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Manage Catalog
            </motion.button>
          )}

          {courses.length === 0 && (
            <button
              onClick={() => loadDemoData()}
              className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Load Curricular Dataset
            </button>
          )}
        </div>
      </motion.div>

      {/* Catalog Category Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'ALL'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          All Courses ({courses.length})
        </button>

        <button
          onClick={() => setActiveTab('UNIVERSITY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'UNIVERSITY'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          University Core & Electives
        </button>

        <button
          onClick={() => setActiveTab('NPTEL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'NPTEL'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-400" />
          NPTEL / SWAYAM Certified
        </button>
      </div>

      {/* Primary & Advanced Filter Panel */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
      >
        {/* Row 1: Search & Primary Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Query Input */}
          <form onSubmit={handleSearchSubmit} className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="course-catalog-search"
              placeholder="Search code, title, prerequisites, instructor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </form>

          {/* Department Filter */}
          <div className="md:col-span-4">
            <select
              id="filter-department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="All">All Academic Departments</option>
              {departmentsList.map((dept) => (
                <option key={dept.id || dept.name} value={dept.name}>
                  {dept.shortCode ? `${dept.shortCode} – ` : ''}{dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Year Filter */}
          <div className="md:col-span-2">
            <select
              id="filter-academic-year"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {yearOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Toggle & Submit Button */}
          <div className="md:col-span-2 flex items-center gap-2">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex-1 flex items-center justify-center gap-1.5 border px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                showAdvancedFilters || activeFilterCount > 0
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <button
              onClick={fetchCourses}
              className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Row 2: Secondary / Advanced Filters */}
        <AnimatePresence>
          {showAdvancedFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
            >
              {/* Semester Filter */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Semester</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer"
                >
                  {semesterOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course Type */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Course Type</label>
                <select
                  value={courseType}
                  onChange={(e) => setCourseType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer"
                >
                  {courseTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Credits */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Credits</label>
                <select
                  value={credits}
                  onChange={(e) => setCredits(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer"
                >
                  {creditOptions.map((c) => (
                    <option key={c} value={c}>
                      {c === 'All' ? 'All Credits' : `${c} Credits`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Level */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Degree Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer"
                >
                  {levels.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl === 'All' ? 'All Levels' : lvl}
                    </option>
                  ))}
                </select>
              </div>

              {/* Faculty Instructor */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Assigned Faculty</label>
                <select
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer"
                >
                  <option value="All">All Instructors</option>
                  {teachersList.map((t) => (
                    <option key={t.id} value={t.profile?.full_name || t.id}>
                      {t.profile?.full_name || t.employee_code}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Section Code</label>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer"
                >
                  <option value="All">All Sections</option>
                  <option value="Sec-A">Section A</option>
                  <option value="Sec-B">Section B</option>
                  <option value="Sec-C">Section C</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Row 3: Active Filters Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-500 font-medium">
              Showing <strong className="text-slate-900 dark:text-white font-bold">{courses.length}</strong> academic courses
            </span>

            {department !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[11px] font-medium border border-indigo-200 dark:border-indigo-800/40">
                Dept: {department}
                <button onClick={() => setDepartment('All')} className="hover:text-indigo-900 dark:hover:text-white"><X className="w-3 h-3" /></button>
              </span>
            )}

            {academicYear !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[11px] font-medium border border-indigo-200 dark:border-indigo-800/40">
                Year {academicYear}
                <button onClick={() => setAcademicYear('All')} className="hover:text-indigo-900 dark:hover:text-white"><X className="w-3 h-3" /></button>
              </span>
            )}

            {semester !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[11px] font-medium border border-indigo-200 dark:border-indigo-800/40">
                Semester {semester}
                <button onClick={() => setSemester('All')} className="hover:text-indigo-900 dark:hover:text-white"><X className="w-3 h-3" /></button>
              </span>
            )}

            {courseType !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[11px] font-medium border border-indigo-200 dark:border-indigo-800/40">
                {courseType}
                <button onClick={() => setCourseType('All')} className="hover:text-indigo-900 dark:hover:text-white"><X className="w-3 h-3" /></button>
              </span>
            )}

            {credits !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[11px] font-medium border border-indigo-200 dark:border-indigo-800/40">
                {credits} Credits
                <button onClick={() => setCredits('All')} className="hover:text-indigo-900 dark:hover:text-white"><X className="w-3 h-3" /></button>
              </span>
            )}

            {search.trim() !== '' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[11px] font-medium border border-indigo-200 dark:border-indigo-800/40">
                Query: "{search}"
                <button onClick={() => setSearch('')} className="hover:text-indigo-900 dark:hover:text-white"><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
          )}
        </div>
      </motion.div>

      {/* Course Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-72 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          title="No courses found matching your criteria."
          description="Try clearing some filter constraints, broadening your search query, or resetting filters."
          actionText="Clear All Filters"
          onAction={handleResetFilters}
          secondaryActionText="Load Curricular Dataset"
          onSecondaryAction={loadDemoData}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c, idx) => {
            const maxSeats = Number(c.max_seats) || 60;
            const enrolledCount = Number(c.enrolled_count) || 0;
            const availableSeats = c.available_seats !== undefined ? c.available_seats : Math.max(0, maxSeats - enrolledCount);
            const fillPercent = Math.min(100, Math.round((enrolledCount / maxSeats) * 100));

            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(idx * 0.03, 0.3) }}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-xs hover:border-indigo-500/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between group relative"
              >
                <div>
                  {/* Top Badges Bar */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800/40">
                        {c.code}
                      </span>
                      
                      {c.is_nptel ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800/40">
                          <Award className="w-3 h-3 text-amber-500" />
                          NPTEL
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          Year {c.academic_year || Math.ceil((c.semester || 1) / 2)} • Sem {c.semester}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {c.credits} Credits
                      </span>
                    </div>
                  </div>

                  {/* Course Title */}
                  <h3 
                    onClick={() => onNavigate(`/courses/${c.id}`)}
                    className="font-bold text-slate-900 dark:text-white text-base tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 cursor-pointer"
                  >
                    {c.name}
                  </h3>

                  {/* Department & Course Type */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1 mb-2.5 flex-wrap">
                    <span className="font-medium truncate max-w-[180px]">{c.department}</span>
                    <span>•</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium">{c.course_type || 'Core Theory'}</span>
                  </div>

                  {/* NPTEL Special Info */}
                  {c.is_nptel && (
                    <div className="mb-2.5 p-2.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-purple-900 dark:text-purple-200 font-semibold">
                        <span>{c.nptel_institute || 'IIT / IISc Network'}</span>
                        <span className="text-amber-600 dark:text-amber-400">{c.nptel_duration || '12 Weeks'}</span>
                      </div>
                      <div className="text-slate-600 dark:text-slate-300 flex items-center gap-1">
                        <User className="w-3 h-3 text-purple-500 shrink-0" />
                        <span className="truncate">{c.nptel_instructor || 'NPTEL Faculty'}</span>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {c.description || 'Comprehensive curriculum with rigorous theory, laboratory applications, and modern academic evaluation.'}
                  </p>

                  {/* Prerequisites */}
                  {c.prerequisites && c.prerequisites !== 'None' && (
                    <div className="mt-2.5 text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800/40 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800 truncate">
                      <strong className="text-slate-700 dark:text-slate-300 font-semibold">Prereq: </strong>
                      {c.prerequisites}
                    </div>
                  )}

                  {/* Live Seat Capacity Progress Bar */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                        <Users className="w-3 h-3 text-indigo-500" />
                        {enrolledCount}/{maxSeats} Seats Filled
                      </span>
                      
                      {c.is_enrolled ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Registered
                        </span>
                      ) : availableSeats > 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          {availableSeats} Available
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">
                          Waitlist Open
                        </span>
                      )}
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          fillPercent >= 100 
                            ? 'bg-amber-500' 
                            : fillPercent >= 80 
                            ? 'bg-indigo-500' 
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${fillPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setQuickSyllabusCourse(c)}
                    className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer py-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Syllabus
                  </button>

                  <div className="flex items-center gap-2">
                    {c.is_enrolled ? (
                      <button
                        onClick={() => onNavigate(`/student/courses/${c.id}`)}
                        className="bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        My Room
                      </button>
                    ) : user?.role === 'STUDENT' ? (
                      <button
                        onClick={() => setRegisteringCourse(c)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Register
                      </button>
                    ) : (
                      <button
                        onClick={() => onNavigate(`/courses/${c.id}`)}
                        className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                      >
                        Details <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Registration Confirmation Modal */}
      <Modal
        isOpen={!!registeringCourse}
        onClose={() => setRegisteringCourse(null)}
        title="Confirm Academic Course Registration"
      >
        {registeringCourse && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                  {registeringCourse.code}
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {registeringCourse.credits} Credits
                </span>
              </div>

              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                {registeringCourse.name}
              </h4>

              <p className="text-xs text-slate-600 dark:text-slate-300">
                Department: <strong>{registeringCourse.department}</strong>
              </p>
            </div>

            {registeringCourse.prerequisites && registeringCourse.prerequisites !== 'None' && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong>Prerequisite Requirement:</strong> {registeringCourse.prerequisites}. By confirming, you verify that you meet the academic eligibility criteria.
                </div>
              </div>
            )}

            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
              <p>• Registration immediately updates your real student semester course ledger.</p>
              <p>• If seat capacity is reached, you will automatically be placed on the institutional priority waitlist.</p>
              <p>• You may drop this course anytime from your Student Portal before the add/drop deadline.</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setRegisteringCourse(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleQuickRegister}
                disabled={isEnrolling}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isEnrolling ? 'Processing...' : 'Confirm Registration'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Quick Syllabus Drawer / Modal */}
      <Modal
        isOpen={!!quickSyllabusCourse}
        onClose={() => setQuickSyllabusCourse(null)}
        title={quickSyllabusCourse ? `${quickSyllabusCourse.code} — Curriculum Syllabus` : 'Curriculum Syllabus'}
      >
        {quickSyllabusCourse && (
          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1 text-xs">
            <div className="flex items-center justify-between text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="font-semibold text-slate-900 dark:text-white">{quickSyllabusCourse.name}</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{quickSyllabusCourse.credits} Credits</span>
            </div>

            <div className="text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap leading-relaxed bg-slate-50 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              {quickSyllabusCourse.syllabus || 'Detailed unit modular syllabus is available on the full course detail page.'}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  const id = quickSyllabusCourse.id;
                  setQuickSyllabusCourse(null);
                  onNavigate(`/courses/${id}`);
                }}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                Open Full Course Page <ExternalLink className="w-3 h-3" />
              </button>

              <button
                onClick={() => setQuickSyllabusCourse(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
