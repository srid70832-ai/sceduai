import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  User,
  Mail,
  ShieldCheck,
  Building,
  Phone,
  Save,
  Sparkles,
  Sliders,
  BookOpen,
  Target,
  CheckCircle2,
  Edit3,
  X,
  Lock,
  Award,
  Briefcase,
  GraduationCap,
  Calendar,
  Layers,
  Clock
} from 'lucide-react';
import { OnboardingFlow } from '../../components/onboarding/OnboardingFlow';
import { ACADEMIC_DEPARTMENTS } from '../../lib/departments';

interface TeacherProfilePageProps {
  onNavigate: (path: string) => void;
}

const FACULTY_DESIGNATIONS = [
  'Professor & Department Head',
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Senior Lecturer',
  'Lecturer',
  'Adjunct Faculty',
  'Visiting Professor'
];

export const TeacherProfilePage: React.FC<TeacherProfilePageProps> = ({ onNavigate }) => {
  const { user, teacher, updateProfile, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showOnboardingEdit, setShowOnboardingEdit] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetFormState = () => {
    if (user) {
      setFullName(user.full_name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setDepartment(teacher?.department || user.department || ACADEMIC_DEPARTMENTS[0].name);
      setDateOfBirth(user.date_of_birth || '1982-04-20');
      setGender(user.gender || 'Male');
      setAddress(user.address || 'Faculty Residence Block A, University Campus');
    }
    if (teacher) {
      setDesignation(teacher.designation || 'Professor & Department Head');
      setQualification(teacher.qualification || 'Ph.D. in Computer Science, MIT');
      setExperience(teacher.experience || '12 Years');
      setAcademicYear(teacher.academic_year || '2025 - 2026');
      setSpecialization(teacher.specialization || 'Distributed Systems & Advanced Algorithms');
    }
    setErrors({});
  };

  useEffect(() => {
    resetFormState();
  }, [user, teacher]);

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
        newErrors.email = 'Please enter a valid institutional email format.';
      }
    }

    if (phone && phone.trim()) {
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,16}$/;
      if (!phoneRegex.test(phone.trim())) {
        newErrors.phone = 'Please enter a valid phone number format.';
      }
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
        designation: designation.trim(),
        qualification: qualification.trim(),
        experience: experience.trim(),
        academic_year: academicYear.trim(),
        specialization: specialization.trim(),
        date_of_birth: dateOfBirth,
        gender,
        address: address.trim()
      });
      showToast('Faculty profile record updated successfully!', 'success');
      setIsEditing(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to update faculty profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    resetFormState();
    setIsEditing(false);
  };

  const teacherPrefs = user?.onboarding_data?.teacher_preferences;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header & Mode Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Faculty Instructor Profile
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Academic credentials, faculty appointment records, and institutional identity
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {isEditing ? (
            <>
              <button
                type="button"
                id="btn-cancel-teacher-edit"
                onClick={handleCancel}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
              <button
                type="button"
                id="btn-save-teacher-profile"
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
              id="btn-enable-teacher-edit"
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
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 text-2xl font-bold flex items-center justify-center shadow-xs">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'F'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user?.full_name}</h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Faculty
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Award className="w-3 h-3" />
                  Active Appointment
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                <span className="font-mono text-slate-600 dark:text-slate-300 font-semibold">{teacher?.employee_code || 'FAC-CSE-101'}</span>
                <span>•</span>
                <span>{user?.email}</span>
                <span>•</span>
                <span>{designation || 'Associate Professor'}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] block text-slate-400 font-semibold uppercase">Experience</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{experience || '12 Years'}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] block text-slate-400 font-semibold uppercase">Academic Year</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{academicYear || '2025 - 2026'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Faculty Focus & Teaching Calibration Card */}
      <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-purple-950/30 rounded-3xl border border-indigo-900/50 p-6 sm:p-8 shadow-md space-y-5 text-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Faculty Focus & Teaching Calibration</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Configured
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Departmental specialization, research domains, and academic alert priorities
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-edit-teacher-questionnaire"
            onClick={() => setShowOnboardingEdit(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            Edit Faculty Questionnaire
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3 border-t border-slate-800/80">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
              Department & Designation
            </span>
            <p className="text-xs font-semibold text-white">
              {teacherPrefs?.designation || designation || 'Associate Professor'} • {teacherPrefs?.department || department || 'Computer Science'}
            </p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
              Pedagogical Objective
            </span>
            <p className="text-xs font-semibold text-emerald-400">
              {teacherPrefs?.pedagogical_goals?.[0] || 'Improve Student Retention & Mastery'}
            </p>
          </div>
        </div>

        {/* Specializations */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Teaching & Research Specializations:
          </span>
          <div className="flex flex-wrap gap-2">
            {(teacherPrefs?.specialization_interests || [specialization || 'Distributed Systems', 'AI & Machine Learning']).map((spec, idx) => (
              <span
                key={idx}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-800/50 text-indigo-300"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>

        {/* Alert Priorities */}
        {teacherPrefs?.student_support_priorities && teacherPrefs.student_support_priorities.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Active Student Support Alerts:
            </span>
            <div className="flex flex-wrap gap-2">
              {teacherPrefs.student_support_priorities.map((item, idx) => (
                <span
                  key={idx}
                  className="text-xs font-medium px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-800/50 text-amber-300"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Faculty Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Academic Appointment & Credentials */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Academic Appointment & Qualifications</h2>
              <p className="text-[11px] text-slate-500">Designation, faculty ID, highest academic qualification, and teaching experience</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Faculty Full Name <span className="text-rose-500">*</span>
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="text"
                    id="input-teacher-fullname"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Prof. Alan Vance"
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

            {/* Staff ID / Employee Code (Immutable) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center justify-between">
                <span>Staff ID / Faculty Employee Code</span>
                <span className="text-[10px] text-slate-400 font-normal flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Immutable
                </span>
              </label>
              <div className="w-full bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-600 dark:text-slate-400 font-mono font-semibold flex items-center justify-between">
                <span>{teacher?.employee_code || 'FAC-CSE-101'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  Institutional Verified
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
                  id="select-teacher-department"
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

            {/* Designation */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Designation / Title
              </label>
              {isEditing ? (
                <select
                  id="select-teacher-designation"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  {FACULTY_DESIGNATIONS.map((desig) => (
                    <option key={desig} value={desig}>
                      {desig}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white">
                  {designation || 'Professor & Department Head'}
                </div>
              )}
            </div>

            {/* Qualification */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Highest Qualification
              </label>
              {isEditing ? (
                <input
                  type="text"
                  id="input-teacher-qualification"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  placeholder="e.g. Ph.D. in Computer Science, MIT"
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white">
                  {qualification || 'Ph.D. in Computer Science'}
                </div>
              )}
            </div>

            {/* Teaching Experience */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Teaching & Industry Experience
              </label>
              {isEditing ? (
                <input
                  type="text"
                  id="input-teacher-experience"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g. 12 Years"
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white">
                  {experience || '12 Years'}
                </div>
              )}
            </div>

            {/* Specialization / Research Area */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Specialization / Domain
              </label>
              {isEditing ? (
                <input
                  type="text"
                  id="input-teacher-specialization"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g. Distributed Systems & Cloud Architectures"
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white">
                  {specialization || 'Distributed Systems & Advanced Algorithms'}
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
                  id="input-teacher-academic-year"
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

        {/* Section 2: Contact Coordinates & Faculty Office */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Institutional Contact & Office Details</h2>
              <p className="text-[11px] text-slate-500">Official institutional communications and contact numbers</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Institutional Email <span className="text-rose-500">*</span>
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="email"
                    id="input-teacher-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teacher@edusense.ai"
                    className={`w-full bg-slate-50 dark:bg-slate-800/60 border rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${
                      errors.email ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {errors.email && <p className="text-[11px] text-rose-500 mt-1">{errors.email}</p>}
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white font-mono">
                  {email || 'teacher@edusense.ai'}
                </div>
              )}
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Contact Phone
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="tel"
                    id="input-teacher-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 345-6789"
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
                  id="input-teacher-dob"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white">
                  {dateOfBirth || '1982-04-20'}
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
                  id="select-teacher-gender"
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

            {/* Department Office / Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Department Office / Faculty Residence
              </label>
              {isEditing ? (
                <textarea
                  id="textarea-teacher-address"
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Department of Computer Science, Room 304, Tech Wing A"
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 text-xs font-medium text-slate-900 dark:text-white leading-relaxed">
                  {address || 'Department of Computer Science, Room 304, Tech Wing A'}
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
