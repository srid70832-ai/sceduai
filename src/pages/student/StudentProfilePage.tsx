import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  User,
  Mail,
  GraduationCap,
  Building,
  Phone,
  ShieldCheck,
  Save,
  Sparkles,
  Sliders,
  BookOpen,
  Target,
  CheckCircle2,
  Edit3,
  X,
  Calendar,
  MapPin,
  Lock,
  Hash,
  Award,
  Layers,
  Clock
} from 'lucide-react';
import { OnboardingFlow } from '../../components/onboarding/OnboardingFlow';
import { ACADEMIC_DEPARTMENTS } from '../../lib/departments';

interface StudentProfilePageProps {
  onNavigate: (path: string) => void;
}

export const StudentProfilePage: React.FC<StudentProfilePageProps> = ({ onNavigate }) => {
  const { user, student, updateProfile, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showOnboardingEdit, setShowOnboardingEdit] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [degreeProgram, setDegreeProgram] = useState('');
  const [studyYear, setStudyYear] = useState('');
  const [semester, setSemester] = useState<number>(1);
  const [section, setSection] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync state with current user and student data
  const resetFormState = () => {
    if (user) {
      setFullName(user.full_name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setDepartment(user.department || student?.major || ACADEMIC_DEPARTMENTS[0].name);
      setDateOfBirth(user.date_of_birth || student?.date_of_birth || '2004-06-15');
      setGender(user.gender || student?.gender || 'Male');
      setAddress(user.address || student?.address || 'University Residential Campus, Block B, Academic City');
    }
    if (student) {
      setDegreeProgram(student.degree_program || `B.Tech. in ${student.major || user?.department || 'Computer Science'}`);
      setStudyYear(student.study_year || (student.semester <= 2 ? '1st Year' : student.semester <= 4 ? '2nd Year' : student.semester <= 6 ? '3rd Year' : '4th Year'));
      setSemester(student.semester || 1);
      setSection(student.section || 'A');
      setAcademicYear(student.academic_year || '2025 - 2026');
    }
    setErrors({});
  };

  useEffect(() => {
    resetFormState();
  }, [user, student]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.fullName = 'Full Name must be at least 2 characters.';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = 'Please enter a valid email format (e.g. student@edusense.ai).';
      }
    }

    if (phone && phone.trim()) {
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,16}$/;
      if (!phoneRegex.test(phone.trim())) {
        newErrors.phone = 'Please enter a valid phone number format.';
      }
    }

    if (!semester || semester < 1 || semester > 8) {
      newErrors.semester = 'Semester must be between 1 and 8.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please correct the highlighted errors before saving.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        department: department.trim(),
        date_of_birth: dateOfBirth,
        gender,
        address: address.trim(),
        degree_program: degreeProgram.trim(),
        major: department.trim(),
        study_year: studyYear,
        year: studyYear.includes('1') ? 1 : studyYear.includes('2') ? 2 : studyYear.includes('3') ? 3 : 4,
        semester: Number(semester),
        section: section.trim().toUpperCase(),
        academic_year: academicYear.trim()
      });
      showToast('Student profile information updated successfully!', 'success');
      setIsEditing(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to update student profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    resetFormState();
    setIsEditing(false);
  };

  const studentPrefs = user?.onboarding_data?.student_preferences;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Student Profile & Academic Record
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Official institutional registry & student information dossier
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {isEditing ? (
            <>
              <button
                type="button"
                id="btn-cancel-profile-edit"
                onClick={handleCancel}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
              <button
                type="button"
                id="btn-save-profile"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button
              type="button"
              id="btn-enable-profile-edit"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Identity Summary Card (Initial / Icon Based Avatar) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-2xl font-bold flex items-center justify-center shadow-xs">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user?.full_name}</h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Student
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  <Award className="w-3 h-3" />
                  {student?.academic_status || 'ACTIVE'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                <span className="font-mono text-slate-600 dark:text-slate-300 font-semibold">{student?.roll_number || 'REG-PENDING'}</span>
                <span>•</span>
                <span>{user?.email}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] block text-slate-400 font-semibold uppercase">Year</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{studyYear || '2nd Year'}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] block text-slate-400 font-semibold uppercase">Semester</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">Sem {semester}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] block text-slate-400 font-semibold uppercase">Section</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{section || 'A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Onboarding & AI Calibration Card */}
      <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-purple-950/30 rounded-3xl border border-indigo-900/50 p-6 sm:p-8 shadow-md space-y-5 text-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Academic Onboarding & AI Calibration</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Calibrated
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Personalized study milestones, placement preparation, and support courses
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-edit-onboarding-questionnaire"
            onClick={() => setShowOnboardingEdit(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            Edit Questionnaire
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-3 border-t border-slate-800/80">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
              <Building className="w-3 h-3" />
              Department
            </div>
            <p className="text-xs font-semibold text-white">
              {studentPrefs?.department || department || 'Computer Science'}
            </p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
              <GraduationCap className="w-3 h-3" />
              Year of Study
            </div>
            <p className="text-xs font-semibold text-white">
              {studentPrefs?.study_year || studyYear || '1st Year'}
            </p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
              <Target className="w-3 h-3" />
              Primary Goal
            </div>
            <p className="text-xs font-semibold text-emerald-400">
              {studentPrefs?.primary_academic_goal || 'All of these'}
            </p>
          </div>
        </div>

        {/* Interests Tags */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Academic Interests & Domains:
          </span>
          <div className="flex flex-wrap gap-2">
            {(studentPrefs?.academic_interests || ['AI & Machine Learning', 'Data Science']).map((interest, idx) => (
              <span
                key={idx}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-800/50 text-indigo-300"
              >
                {interest}
              </span>
            ))}
            {studentPrefs?.other_interest && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-800/50 text-purple-300">
                + {studentPrefs.other_interest}
              </span>
            )}
          </div>
        </div>

        {/* Support Courses */}
        {studentPrefs?.support_subject_names && studentPrefs.support_subject_names.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3 h-3 text-amber-400" />
              Self-Flagged Support Courses:
            </span>
            <div className="flex flex-wrap gap-2">
              {studentPrefs.support_subject_names.map((courseName, idx) => (
                <span
                  key={idx}
                  className="text-xs font-medium px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-800/50 text-amber-300"
                >
                  {courseName}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Academic & Institutional Information */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Academic & Institutional Records</h2>
              <p className="text-[11px] text-slate-500">Degree, enrollment stream, roll number, and semester registration</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="text"
                    id="input-student-fullname"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className={`w-full bg-slate-50 dark:bg-slate-800/60 border rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${
                      errors.fullName ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {errors.fullName && <p className="text-[11px] text-rose-500 mt-1">{errors.fullName}</p>}
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white">
                  {fullName || 'N/A'}
                </div>
              )}
            </div>

            {/* Student Roll Number (Immutable Institutional Key) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center justify-between">
                <span>Student Roll / Register Number</span>
                <span className="text-[10px] text-slate-400 font-normal flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Immutable
                </span>
              </label>
              <div className="w-full bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-600 dark:text-slate-400 font-mono font-semibold flex items-center justify-between">
                <span>{student?.roll_number || 'CS2026-081'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  Registrar Verified
                </span>
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Department <span className="text-rose-500">*</span>
              </label>
              {isEditing ? (
                <select
                  id="select-student-department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  {ACADEMIC_DEPARTMENTS.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name} ({dept.shortCode})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white">
                  {department || 'Computer Science and Engineering'}
                </div>
              )}
            </div>

            {/* Degree / Program */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Degree / Program
              </label>
              {isEditing ? (
                <input
                  type="text"
                  id="input-student-degree"
                  value={degreeProgram}
                  onChange={(e) => setDegreeProgram(e.target.value)}
                  placeholder="e.g. B.Tech. in Computer Science and Engineering"
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white">
                  {degreeProgram || 'B.Tech. in Computer Science'}
                </div>
              )}
            </div>

            {/* Year of Study */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Year of Study
              </label>
              {isEditing ? (
                <select
                  id="select-student-year"
                  value={studyYear}
                  onChange={(e) => setStudyYear(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white">
                  {studyYear || '2nd Year'}
                </div>
              )}
            </div>

            {/* Semester */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Current Semester (1-8)
              </label>
              {isEditing ? (
                <div>
                  <select
                    id="select-student-semester"
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                  {errors.semester && <p className="text-[11px] text-rose-500 mt-1">{errors.semester}</p>}
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white">
                  Semester {semester}
                </div>
              )}
            </div>

            {/* Section */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Section
              </label>
              {isEditing ? (
                <input
                  type="text"
                  id="input-student-section"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  placeholder="e.g. A, B, C"
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white">
                  Section {section || 'A'}
                </div>
              )}
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Academic Year
              </label>
              {isEditing ? (
                <input
                  type="text"
                  id="input-student-academic-year"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="e.g. 2025 - 2026"
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white">
                  {academicYear || '2025 - 2026'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Contact & Personal Details */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Personal & Contact Dossier</h2>
              <p className="text-[11px] text-slate-500">Contact coordinates, personal identification, and residential address</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                University Email <span className="text-rose-500">*</span>
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="email"
                    id="input-student-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@edusense.ai"
                    className={`w-full bg-slate-50 dark:bg-slate-800/60 border rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${
                      errors.email ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {errors.email && <p className="text-[11px] text-rose-500 mt-1">{errors.email}</p>}
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white font-mono">
                  {email || 'student@edusense.ai'}
                </div>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Contact Phone
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="tel"
                    id="input-student-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 567-8901"
                    className={`w-full bg-slate-50 dark:bg-slate-800/60 border rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${
                      errors.phone ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {errors.phone && <p className="text-[11px] text-rose-500 mt-1">{errors.phone}</p>}
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white">
                  {phone || 'Not provided'}
                </div>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Date of Birth
              </label>
              {isEditing ? (
                <input
                  type="date"
                  id="input-student-dob"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white">
                  {dateOfBirth || '2004-06-15'}
                </div>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Gender
              </label>
              {isEditing ? (
                <select
                  id="select-student-gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white">
                  {gender || 'Male'}
                </div>
              )}
            </div>

            {/* Residential / Campus Address (Full Width) */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Residential / Campus Address
              </label>
              {isEditing ? (
                <textarea
                  id="textarea-student-address"
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. University Residential Campus, Block B, Room 402, Academic City"
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 text-xs font-medium text-slate-900 dark:text-white leading-relaxed">
                  {address || 'University Residential Campus, Block B, Academic City'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating Bottom Save Action when in edit mode */}
        {isEditing && (
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            >
              Cancel Changes
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving Profile...' : 'Save Profile Updates'}
            </button>
          </div>
        )}
      </form>

      {/* Edit Onboarding Modal */}
      {showOnboardingEdit && (
        <OnboardingFlow
          isEditing={true}
          onClose={() => setShowOnboardingEdit(false)}
          onComplete={async () => {
            setShowOnboardingEdit(false);
            await refreshUser();
          }}
        />
      )}
    </div>
  );
};
