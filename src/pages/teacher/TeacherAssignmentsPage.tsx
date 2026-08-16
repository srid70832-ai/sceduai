import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Assignment, ClassItem } from '../../types';
import { useToast } from '../../context/ToastContext';
import { FileCheck, Plus, Clock, Users, ArrowRight } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';

interface TeacherAssignmentsPageProps {
  onNavigate: (path: string) => void;
}

export const TeacherAssignmentsPage: React.FC<TeacherAssignmentsPageProps> = ({ onNavigate }) => {
  const { teacher, loadDemoData } = useAuth();
  const { showToast } = useToast();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State for creating new assignment
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newClassId, setNewClassId] = useState('');
  const [newMaxMarks, setNewMaxMarks] = useState<number>(100);
  const [newDueDate, setNewDueDate] = useState('');

  const fetchData = () => {
    setIsLoading(true);
    Promise.all([
      api.getAssignments().catch(() => []),
      api.getClasses().catch(() => [])
    ]).then(([asgs, clss]) => {
      setAssignments(asgs);
      setClasses(clss);
      if (clss.length > 0) setNewClassId(clss[0].id);
    }).finally(() => {
      setIsLoading(false);
    });
  };

  useEffect(() => {
    if (teacher) {
      fetchData();
    }
  }, [teacher]);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newClassId || !newDueDate) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    const selectedClass = classes.find((c) => c.id === newClassId);
    if (!selectedClass) {
      showToast('Invalid class section selected.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createAssignment({
        course_id: selectedClass.course_id,
        class_id: newClassId,
        title: newTitle,
        description: newDesc,
        maximum_marks: Number(newMaxMarks) || 100,
        due_date: new Date(newDueDate).toISOString()
      });

      showToast(`Assignment "${newTitle}" created successfully!`, 'success');
      setIsModalOpen(false);
      setNewTitle('');
      setNewDesc('');
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create assignment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Assignments & Submissions Grading
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Publish homework assignments, review student submissions, and submit marks
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          Create New Assignment
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : assignments.length === 0 ? (
        <EmptyState
          title="No assignments created yet."
          description="Create your first assignment or load sample academic coursework."
          actionText="Create Assignment"
          onAction={() => setIsModalOpen(true)}
          secondaryActionText="Load Sample Academic Dataset"
          onSecondaryAction={loadDemoData}
        />
      ) : (
        <div className="space-y-4">
          {assignments.map((asg) => (
            <div
              key={asg.id}
              onClick={() => onNavigate(`/teacher/assignments/${asg.id}/grade`)}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-indigo-500/50 hover:shadow-md transition-all cursor-pointer flex flex-wrap items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {asg.course?.code}
                    </span>
                    <span className="text-xs text-slate-400">• Section {asg.class?.section_name || 'A'}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mt-0.5">
                    {asg.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1 max-w-lg">
                    {asg.description || 'Assignment problem set.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs">
                <div className="text-right">
                  <div className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    Due: {formatDate(asg.due_date)}
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    Max: {asg.maximum_marks} marks
                  </div>
                </div>

                <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-xs group-hover:bg-indigo-700 transition-colors">
                  Review & Grade <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Assignment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Academic Assignment"
        maxWidth="xl"
      >
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Class Section *
            </label>
            <select
              value={newClassId}
              onChange={(e) => setNewClassId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.course?.code} - Section {cls.section_name} ({cls.course?.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Assignment Title *
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Problem Set 2: Graph Theory & DFS/BFS"
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Maximum Marks *
              </label>
              <input
                type="number"
                required
                min={10}
                max={200}
                value={newMaxMarks}
                onChange={(e) => setNewMaxMarks(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Due Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Instructions / Problem Description
            </label>
            <textarea
              rows={4}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Detail assignment questions, submission format, and scoring criteria..."
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden resize-none"
            />
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
              {isSubmitting ? 'Publishing...' : 'Publish Assignment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
