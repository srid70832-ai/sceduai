import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { Student } from '../../types';
import { GraduationCap, Plus, Search, Eye, Filter, ShieldCheck, Building } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { StudentReportModal } from '../../components/reports/StudentReportModal';
import { EmptyState } from '../../components/common/EmptyState';
import { ACADEMIC_DEPARTMENTS, DEFAULT_DEPARTMENT } from '../../lib/departments';

interface AdminStudentsPageProps {
  onNavigate: (path: string) => void;
}

export const AdminStudentsPage: React.FC<AdminStudentsPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState<string>('');
  const [department, setDepartment] = useState<string>('All');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // New Student Form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRoll, setNewRoll] = useState('');
  const [newDept, setNewDept] = useState(DEFAULT_DEPARTMENT);
  const [newMajor, setNewMajor] = useState(DEFAULT_DEPARTMENT);
  const [newSemester, setNewSemester] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStudents = () => {
    setIsLoading(true);
    api.getStudents()
      .then((data) => setStudents(data))
      .catch(() => setStudents([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newRoll.trim()) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createStudent({
        email: newEmail.trim(),
        password: 'password123',
        full_name: newName.trim(),
        roll_number: newRoll.trim().toUpperCase(),
        department: newDept,
        major: newMajor || newDept,
        semester: Number(newSemester) || 1
      });

      showToast(`Student ${newName} enrolled successfully!`, 'success');
      setIsCreateModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewRoll('');
      fetchStudents();
    } catch (err: any) {
      showToast(err.message || 'Failed to create student', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = students.filter((s) => {
    const matchSearch =
      s.profile?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.roll_number?.toLowerCase().includes(search.toLowerCase()) ||
      s.profile?.email?.toLowerCase().includes(search.toLowerCase());
    const matchDept = department === 'All' || s.department === department || s.profile?.department === department || s.major === department;
    return matchSearch && matchDept;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Student Registry & Records
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete institutional student directory, enrollments, and academic transcripts
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          Enroll New Student
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3 shadow-xs">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, roll number, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-hidden max-w-[240px]"
        >
          <option value="All">All Departments</option>
          {ACADEMIC_DEPARTMENTS.map((d) => (
            <option key={d.id} value={d.name}>
              {d.shortCode} - {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Student Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
          Registered Students ({filtered.length})
        </h3>

        {isLoading ? (
          <div className="py-12 text-center text-slate-400">Loading student directory...</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No students registered."
            description="There are currently no students registered in the institutional database matching this search."
            actionText="Enroll First Student"
            onAction={() => setIsCreateModalOpen(true)}
          />
        ) : (
          <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                <tr>
                  <th className="p-3.5 font-semibold">Roll Number</th>
                  <th className="p-3.5 font-semibold">Student Name</th>
                  <th className="p-3.5 font-semibold">Department & Major</th>
                  <th className="p-3.5 font-semibold">Semester</th>
                  <th className="p-3.5 font-semibold">Email</th>
                  <th className="p-3.5 font-semibold text-right">Academic Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 font-mono text-[11px] text-slate-400">{st.roll_number}</td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      {st.profile?.full_name || 'Enrolled Student'}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">{st.major || st.department || st.profile?.department}</td>
                    <td className="p-3.5 text-slate-500">Semester {st.semester}</td>
                    <td className="p-3.5 text-slate-400 font-mono text-[11px]">{st.profile?.email}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedStudentId(st.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Dossier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Enroll New University Student"
        maxWidth="xl"
      >
        <form onSubmit={handleCreateStudent} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Jordan Lee"
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Institutional Email *
              </label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="jordan.lee@student.edu"
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Roll Number *
              </label>
              <input
                type="text"
                required
                value={newRoll}
                onChange={(e) => setNewRoll(e.target.value)}
                placeholder="e.g. AIDS-2026-042"
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Semester
              </label>
              <input
                type="number"
                min={1}
                max={12}
                value={newSemester}
                onChange={(e) => setNewSemester(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Department *
              </label>
              <select
                value={newDept}
                onChange={(e) => {
                  setNewDept(e.target.value);
                  setNewMajor(e.target.value);
                }}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              >
                {ACADEMIC_DEPARTMENTS.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.shortCode} - {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Major Program
              </label>
              <input
                type="text"
                value={newMajor}
                onChange={(e) => setNewMajor(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Enrolling...' : 'Enroll Student'}
            </button>
          </div>
        </form>
      </Modal>

      {selectedStudentId && (
        <StudentReportModal
          isOpen={!!selectedStudentId}
          onClose={() => setSelectedStudentId(null)}
          studentId={selectedStudentId}
        />
      )}
    </div>
  );
};
