import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { Course } from '../../types';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Eye, 
  Layers, 
  FileSpreadsheet, 
  Trash2, 
  Building, 
  Edit3, 
  CheckCircle2, 
  X, 
  Filter, 
  RotateCcw, 
  SlidersHorizontal,
  GraduationCap,
  Calendar,
  UserCheck
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { CourseReportModal } from '../../components/reports/CourseReportModal';
import { EmptyState } from '../../components/common/EmptyState';
import { ACADEMIC_DEPARTMENTS, DEFAULT_DEPARTMENT } from '../../lib/departments';

interface AdminCoursesPageProps {
  onNavigate: (path: string) => void;
}

export const AdminCoursesPage: React.FC<AdminCoursesPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachersList, setTeachersList] = useState<any[]>([]);
  const [departmentsList, setDepartmentsList] = useState<any[]>([]);

  // 9 Filter State
  const [search, setSearch] = useState<string>('');
  const [department, setDepartment] = useState<string>('All');
  const [academicYear, setAcademicYear] = useState<string>('All');
  const [semester, setSemester] = useState<string>('All');
  const [courseType, setCourseType] = useState<string>('All');
  const [creditsFilter, setCreditsFilter] = useState<string>('All');
  const [levelFilter, setLevelFilter] = useState<string>('All');
  const [facultyFilter, setFacultyFilter] = useState<string>('All');
  const [sectionFilter, setSectionFilter] = useState<string>('All');

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [dept, setDept] = useState(DEFAULT_DEPARTMENT);
  const [formAcademicYear, setFormAcademicYear] = useState<number>(1);
  const [formSemester, setFormSemester] = useState<number>(1);
  const [formCredits, setFormCredits] = useState<number>(3);
  const [formCourseType, setFormCourseType] = useState('Core Theory');
  const [formLevel, setFormLevel] = useState('Undergraduate');
  const [formPrerequisites, setFormPrerequisites] = useState('None');
  const [desc, setDesc] = useState('');
  const [syllabus, setSyllabus] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | 'ARCHIVED'>('ACTIVE');
  
  // Optional initial section scheduling on create
  const [scheduleSection, setScheduleSection] = useState(true);
  const [initialSectionName, setInitialSectionName] = useState('Sec-A');
  const [initialTeacherId, setInitialTeacherId] = useState('');

  // Load teachers and departments
  useEffect(() => {
    Promise.all([
      api.getTeachers().catch(() => []),
      api.getDepartments().catch(() => ACADEMIC_DEPARTMENTS)
    ]).then(([teachers, depts]) => {
      setTeachersList(teachers);
      setDepartmentsList(depts);
      if (teachers.length > 0) {
        setInitialTeacherId(teachers[0].id);
      }
    });
  }, []);

  const fetchCourses = () => {
    setIsLoading(true);
    api.getCourses({
      search: search.trim() || undefined,
      department: department !== 'All' ? department : undefined,
      academic_year: academicYear !== 'All' ? academicYear : undefined,
      semester: semester !== 'All' ? semester : undefined,
      course_type: courseType !== 'All' ? courseType : undefined,
      credits: creditsFilter !== 'All' ? creditsFilter : undefined,
      level: levelFilter !== 'All' ? levelFilter : undefined,
      faculty_id: facultyFilter !== 'All' ? facultyFilter : undefined,
      section: sectionFilter !== 'All' ? sectionFilter : undefined,
    })
      .then((data) => setCourses(data))
      .catch(() => setCourses([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchCourses();
  }, [department, academicYear, semester, courseType, creditsFilter, levelFilter, facultyFilter, sectionFilter]);

  const handleOpenCreate = () => {
    setEditingCourse(null);
    setCode('');
    setName('');
    setDept(DEFAULT_DEPARTMENT);
    setFormAcademicYear(1);
    setFormSemester(1);
    setFormCredits(3);
    setFormCourseType('Core Theory');
    setFormLevel('Undergraduate');
    setFormPrerequisites('None');
    setDesc('');
    setSyllabus('');
    setStatus('ACTIVE');
    setScheduleSection(true);
    setInitialSectionName('Sec-A');
    if (teachersList.length > 0) {
      setInitialTeacherId(teachersList[0].id);
    }
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Course) => {
    setEditingCourse(c);
    setCode(c.code);
    setName(c.name);
    setDept(c.department);
    const sem = Number(c.semester) || 1;
    setFormSemester(sem);
    setFormAcademicYear(c.academic_year || Math.ceil(sem / 2));
    setFormCredits(Number(c.credits) || 3);
    setFormCourseType(c.course_type || 'Core Theory');
    setFormLevel(c.level || 'Undergraduate');
    setFormPrerequisites(c.prerequisites || 'None');
    setDesc(c.description || '');
    setSyllabus(c.syllabus || '');
    setStatus(c.status || 'ACTIVE');
    setScheduleSection(false);
    setIsModalOpen(true);
  };

  const handleSemesterChange = (newSem: number) => {
    setFormSemester(newSem);
    setFormAcademicYear(Math.ceil(newSem / 2));
  };

  const handleSubmitCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      showToast('Please fill out course code and name.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCourse) {
        // Update existing course
        await api.updateCourse(editingCourse.id, {
          code: code.trim().toUpperCase(),
          name: name.trim(),
          department: dept,
          academic_year: Number(formAcademicYear),
          semester: Number(formSemester),
          credits: Number(formCredits),
          course_type: formCourseType,
          level: formLevel as any,
          prerequisites: formPrerequisites.trim(),
          description: desc.trim(),
          syllabus: syllabus.trim(),
          status
        });
        showToast(`Course ${code.toUpperCase()} updated successfully!`, 'success');
      } else {
        // Create new course
        await api.createCourse({
          code: code.trim().toUpperCase(),
          name: name.trim(),
          department: dept,
          academic_year: Number(formAcademicYear),
          semester: Number(formSemester),
          credits: Number(formCredits),
          course_type: formCourseType,
          level: formLevel as any,
          prerequisites: formPrerequisites.trim(),
          description: desc.trim(),
          syllabus: syllabus.trim(),
          status,
          initial_section: scheduleSection ? initialSectionName : undefined,
          initial_teacher_id: scheduleSection ? initialTeacherId : undefined
        });
        showToast(`Course ${code.toUpperCase()} created and published to catalog!`, 'success');
      }

      setIsModalOpen(false);
      fetchCourses();
    } catch (err: any) {
      showToast(err.message || 'Course transaction failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async (courseId: string, courseCode: string) => {
    if (!window.confirm(`Are you sure you want to delete or archive course ${courseCode}?`)) {
      return;
    }

    try {
      const res = await api.deleteCourse(courseId);
      showToast(res.message || `Course ${courseCode} removed.`, 'success');
      fetchCourses();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete course', 'error');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setDepartment('All');
    setAcademicYear('All');
    setSemester('All');
    setCourseType('All');
    setCreditsFilter('All');
    setLevelFilter('All');
    setFacultyFilter('All');
    setSectionFilter('All');
  };

  const courseTypes = [
    'Core Theory',
    'Integrated Theory & Lab',
    'Practical / Laboratory',
    'Professional Elective',
    'Open Elective',
    'Project / Seminar',
    'Mandatory Non-Credit'
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Curricular Course Catalog & Registry
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Define accredited degree courses across 8 departments, assign credit weightages, manage class sections, and publish syllabi.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create New Course
        </button>
      </div>

      {/* Multi-Dimensional Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search code, title, prerequisites..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchCourses()}
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="md:col-span-4">
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="All">All Academic Departments</option>
              {departmentsList.map((d) => (
                <option key={d.id || d.name} value={d.name}>
                  {d.shortCode ? `${d.shortCode} – ` : ''}{d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3 flex items-center gap-2">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex-1 flex items-center justify-center gap-1.5 border px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                showAdvancedFilters
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 text-indigo-600 dark:text-indigo-400'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>More Filters</span>
            </button>

            <button
              onClick={fetchCourses}
              className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showAdvancedFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5"
            >
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Year</label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200"
                >
                  <option value="All">All Years</option>
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Semester</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200"
                >
                  <option value="All">All Semesters</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Type</label>
                <select
                  value={courseType}
                  onChange={(e) => setCourseType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200"
                >
                  <option value="All">All Types</option>
                  {courseTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Credits</label>
                <select
                  value={creditsFilter}
                  onChange={(e) => setCreditsFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200"
                >
                  <option value="All">All Credits</option>
                  <option value="1">1 Credit</option>
                  <option value="2">2 Credits</option>
                  <option value="3">3 Credits</option>
                  <option value="4">4 Credits</option>
                  <option value="5+">5+ Credits</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Level</label>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200"
                >
                  <option value="All">All Levels</option>
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Postgraduate">Postgraduate</option>
                  <option value="Diploma">Diploma</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Instructor</label>
                <select
                  value={facultyFilter}
                  onChange={(e) => setFacultyFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200"
                >
                  <option value="All">All Instructors</option>
                  {teachersList.map((t) => (
                    <option key={t.id} value={t.profile?.full_name || t.id}>
                      {t.profile?.full_name || t.employee_code}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Section</label>
                <select
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200"
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

        <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
          <span>Found <strong>{courses.length}</strong> registered courses in catalog</span>
          <button onClick={handleResetFilters} className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer">
            <RotateCcw className="w-3 h-3" /> Reset Filters
          </button>
        </div>
      </div>

      {/* Courses Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          title="No courses found in database."
          description="There are currently no courses registered matching the filter criteria."
          actionText="Create New Course"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const derivedYear = course.academic_year || Math.ceil((course.semester || 1) / 2);
            return (
              <div
                key={course.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-xs flex flex-col justify-between hover:border-indigo-500/40 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800/40">
                        {course.code}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        Year {derivedYear} • Sem {course.semester}
                      </span>
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 font-bold">{course.credits} Credits</span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight line-clamp-1">
                    {course.name}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1 mb-2">
                    <span className="truncate max-w-[180px]">{course.department}</span>
                    <span>•</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium">{course.course_type || 'Core Theory'}</span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {course.description || 'Comprehensive university curriculum.'}
                  </p>

                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{course.classes_count ? `${course.classes_count} Sections` : '1 Section'}</span>
                    <span>{course.enrolled_count || 0} Enrolled Students</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(course)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                      title="Edit Course"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id, course.code)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                      title="Delete / Archive Course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigate(`/courses/${course.id}`)}
                      className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                    <button
                      onClick={() => setSelectedCourseId(course.id)}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      Dossier
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Course Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCourse ? `Edit Course: ${editingCourse.code}` : "Add Curricular Course to Catalog"}
        maxWidth="3xl"
      >
        <form onSubmit={handleSubmitCourse} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Course Code *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. AD201"
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden uppercase font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Course Title *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Machine Learning & Predictive Analytics"
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Department *
              </label>
              <select
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden cursor-pointer"
              >
                {departmentsList.map((d) => (
                  <option key={d.id || d.name} value={d.name}>
                    {d.shortCode ? `${d.shortCode} – ` : ''}{d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Semester (1-8) *
              </label>
              <select
                value={formSemester}
                onChange={(e) => handleSemesterChange(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s} (Year {Math.ceil(s / 2)})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Academic Year (1-4)
              </label>
              <select
                value={formAcademicYear}
                onChange={(e) => setFormAcademicYear(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden cursor-pointer"
              >
                <option value={1}>1st Year (Freshman)</option>
                <option value={2}>2nd Year (Sophomore)</option>
                <option value={3}>3rd Year (Junior)</option>
                <option value={4}>4th Year (Senior)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Course Type
              </label>
              <select
                value={formCourseType}
                onChange={(e) => setFormCourseType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden cursor-pointer"
              >
                {courseTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Credits (Weightage)
              </label>
              <input
                type="number"
                min={1}
                max={12}
                value={formCredits}
                onChange={(e) => setFormCredits(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Academic Level
              </label>
              <select
                value={formLevel}
                onChange={(e) => setFormLevel(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden cursor-pointer"
              >
                <option value="Undergraduate">Undergraduate</option>
                <option value="Postgraduate">Postgraduate</option>
                <option value="Diploma">Diploma Program</option>
                <option value="Certificate">Certificate</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Prerequisites
            </label>
            <input
              type="text"
              value={formPrerequisites}
              onChange={(e) => setFormPrerequisites(e.target.value)}
              placeholder="e.g. Linear Algebra & Multivariable Calculus, Data Structures"
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Course Description
            </label>
            <textarea
              rows={2}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Short summary of course topics and learning objectives..."
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-hidden resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Syllabus Units / Modular Outline
            </label>
            <textarea
              rows={4}
              value={syllabus}
              onChange={(e) => setSyllabus(e.target.value)}
              placeholder={`UNIT I: Theoretical Foundations & Principles (9 Hours)\nUNIT II: Algorithm Architectures & Implementations (9 Hours)\nUNIT III: Applied Laboratory Benchmarking (9 Hours)`}
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 font-mono text-xs text-slate-900 dark:text-white focus:outline-hidden resize-none"
            />
          </div>

          {/* Section Scheduling Options on Create */}
          {!editingCourse && (
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-200 dark:border-indigo-800/40 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="schedule-initial-section"
                  checked={scheduleSection}
                  onChange={(e) => setScheduleSection(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="schedule-initial-section" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  Automatically Schedule Initial Section & Assign Faculty Instructor
                </label>
              </div>

              {scheduleSection && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Section Name
                    </label>
                    <input
                      type="text"
                      value={initialSectionName}
                      onChange={(e) => setInitialSectionName(e.target.value)}
                      placeholder="e.g. Sec-A"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Assign Faculty Instructor
                    </label>
                    <select
                      value={initialTeacherId}
                      onChange={(e) => setInitialTeacherId(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    >
                      {teachersList.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.profile?.full_name || t.employee_code} ({t.department})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : editingCourse ? 'Save Changes' : 'Publish Course'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Dossier Report Modal */}
      {selectedCourseId && (
        <CourseReportModal
          isOpen={!!selectedCourseId}
          onClose={() => setSelectedCourseId(null)}
          courseId={selectedCourseId}
        />
      )}
    </div>
  );
};
