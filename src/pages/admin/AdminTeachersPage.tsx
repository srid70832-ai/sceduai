import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { Teacher } from '../../types';
import { Users, Plus, Search, Mail, Building, BookOpen } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { ACADEMIC_DEPARTMENTS, DEFAULT_DEPARTMENT } from '../../lib/departments';

interface AdminTeachersPageProps {
  onNavigate: (path: string) => void;
}

export const AdminTeachersPage: React.FC<AdminTeachersPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [search, setSearch] = useState<string>('');
  const [department, setDepartment] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newDept, setNewDept] = useState(DEFAULT_DEPARTMENT);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTeachers = () => {
    setIsLoading(true);
    api.getTeachers()
      .then((data) => setTeachers(data))
      .catch(() => setTeachers([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newCode.trim()) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createTeacher({
        email: newEmail.trim(),
        password: 'password123',
        full_name: newName.trim(),
        employee_code: newCode.trim().toUpperCase(),
        department: newDept
      });

      showToast(`Faculty member ${newName} added successfully!`, 'success');
      setIsModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewCode('');
      fetchTeachers();
    } catch (err: any) {
      showToast(err.message || 'Failed to add faculty member', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = teachers.filter((t) => {
    const matchSearch =
      t.profile?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.employee_code?.toLowerCase().includes(search.toLowerCase()) ||
      t.profile?.email?.toLowerCase().includes(search.toLowerCase());
    const matchDept = department === 'All' || t.department === department || t.profile?.department === department;
    return matchSearch && matchDept;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Faculty & Academic Instructors
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Registered professors, lecturers, and assigned teaching workloads
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Faculty Member
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3 shadow-xs">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by faculty name, code, email..."
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

      {/* Faculty Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No faculty members registered."
          description="There are currently no instructors matching your filter in the institutional database."
          actionText="Add First Faculty Member"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-base flex items-center justify-center">
                  {t.profile?.full_name ? t.profile.full_name.charAt(0) : 'F'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    {t.profile?.full_name || 'Faculty Member'}
                  </h3>
                  <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold block">
                    {t.employee_code}
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{t.department || t.profile?.department || 'Academic Faculty'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono truncate">{t.profile?.email}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add University Faculty Member"
        maxWidth="md"
      >
        <form onSubmit={handleCreateTeacher} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Dr. Rajesh Kumar"
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
              placeholder="rajesh.kumar@faculty.edu"
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Faculty Employee Code *
            </label>
            <input
              type="text"
              required
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="e.g. FAC-AIDS-108"
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Department *
            </label>
            <select
              value={newDept}
              onChange={(e) => setNewDept(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
            >
              {ACADEMIC_DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.shortCode} - {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Faculty'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
