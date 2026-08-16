import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Examination, ClassItem } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Award, Plus, Calendar, Clock, Save, Users, CheckCircle2 } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';

interface TeacherExamsPageProps {
  onNavigate: (path: string) => void;
}

export const TeacherExamsPage: React.FC<TeacherExamsPageProps> = ({ onNavigate }) => {
  const { teacher, loadDemoData } = useAuth();
  const { showToast } = useToast();

  const [exams, setExams] = useState<Examination[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedExam, setSelectedExam] = useState<any | null>(null);
  const [examRoster, setExamRoster] = useState<any[]>([]);
  const [marksMap, setMarksMap] = useState<Record<string, number>>({});
  const [remarksMap, setRemarksMap] = useState<Record<string, string>>({});

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSavingMarks, setIsSavingMarks] = useState<boolean>(false);

  // Form State
  const [newCourseId, setNewCourseId] = useState('');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('MIDTERM');
  const [newDate, setNewDate] = useState('');
  const [newStartTime, setNewStartTime] = useState('09:00 AM');
  const [newDuration, setNewDuration] = useState<number>(120);
  const [newMaxMarks, setNewMaxMarks] = useState<number>(100);
  const [newWeightage, setNewWeightage] = useState<number>(30);

  const fetchData = () => {
    setIsLoading(true);
    Promise.all([
      api.getExaminations().catch(() => []),
      api.getClasses().catch(() => [])
    ]).then(([examList, clss]) => {
      setExams(examList);
      setClasses(clss);
      if (clss.length > 0) setNewCourseId(clss[0].course_id);
    }).finally(() => {
      setIsLoading(false);
    });
  };

  useEffect(() => {
    if (teacher) {
      fetchData();
    }
  }, [teacher]);

  const handleSelectExam = async (exam: Examination) => {
    setSelectedExam(exam);
    // Find class section for this course
    const cls = classes.find((c) => c.course_id === exam.course_id);
    if (cls) {
      const clsData: any = await api.getClass(cls.id);
      const students = clsData.students || (clsData.enrollments ? clsData.enrollments.map((e: any) => e.student).filter(Boolean) : []);
      setExamRoster(students);

      const existingMarks: Record<string, number> = {};
      const existingRemarks: Record<string, string> = {};

      (exam.results || []).forEach((res: any) => {
        existingMarks[res.student_id] = res.marks_obtained;
        existingRemarks[res.student_id] = res.remarks || '';
      });

      setMarksMap(existingMarks);
      setRemarksMap(existingRemarks);
    }
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseId || !newName || !newDate) {
      showToast('Please fill all required fields.', 'error');
      return;
    }

    try {
      await api.createExamination({
        course_id: newCourseId,
        name: newName,
        exam_type: newType,
        exam_date: new Date(newDate).toISOString(),
        start_time: newStartTime,
        duration_minutes: Number(newDuration),
        maximum_marks: Number(newMaxMarks),
        weightage_percent: Number(newWeightage)
      });

      showToast(`Examination "${newName}" scheduled successfully!`, 'success');
      setIsCreateModalOpen(false);
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create exam', 'error');
    }
  };

  const handleSaveMarks = async () => {
    if (!selectedExam || examRoster.length === 0) return;

    setIsSavingMarks(true);
    try {
      for (const st of examRoster) {
        if (marksMap[st.id] !== undefined) {
          await api.gradeExam(selectedExam.id, {
            student_id: st.id,
            marks_obtained: Number(marksMap[st.id]),
            remarks: remarksMap[st.id] || ''
          });
        }
      }
      showToast('Examination marks and letter grades updated successfully!', 'success');
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save marks', 'error');
    } finally {
      setIsSavingMarks(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Examinations & Marks Evaluation
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Schedule midterm/final assessments, record marks, and publish automatic grade distributions
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          Schedule New Examination
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : exams.length === 0 ? (
        <EmptyState
          title="No examinations scheduled."
          description="Schedule an exam or load sample academic test datasets."
          actionText="Schedule Examination"
          onAction={() => setIsCreateModalOpen(true)}
          secondaryActionText="Load Sample Academic Dataset"
          onSecondaryAction={loadDemoData}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Exam List */}
          <div className="space-y-3 lg:col-span-1">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider px-1">
              Examinations ({exams.length})
            </h3>
            {exams.map((exam) => (
              <div
                key={exam.id}
                onClick={() => handleSelectExam(exam)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedExam?.id === exam.id
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {exam.course?.code}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {exam.exam_type}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  {exam.name}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                  <span>{formatDate(exam.exam_date)}</span>
                  <span>Max: {exam.maximum_marks} marks</span>
                </div>
              </div>
            ))}
          </div>

          {/* Exam Grade Entry Sheet */}
          <div className="lg:col-span-2">
            {selectedExam ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {selectedExam.course?.code} • {selectedExam.exam_type}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                      {selectedExam.name} - Score Sheet
                    </h3>
                  </div>

                  <div className="text-xs text-right">
                    <span className="text-slate-400 block">Max Marks: {selectedExam.maximum_marks}</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">Weightage: {selectedExam.weightage_percent}%</span>
                  </div>
                </div>

                {examRoster.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    No enrolled students found for this course section.
                  </p>
                ) : (
                  <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                        <tr>
                          <th className="p-3.5 font-semibold">Roll Number</th>
                          <th className="p-3.5 font-semibold">Student Name</th>
                          <th className="p-3.5 font-semibold">Marks (/{selectedExam.maximum_marks})</th>
                          <th className="p-3.5 font-semibold">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {examRoster.map((st) => (
                          <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="p-3.5 font-mono text-[11px] text-slate-400">{st.roll_number}</td>
                            <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                              {st.profile?.full_name || 'Enrolled Student'}
                            </td>
                            <td className="p-3.5">
                              <input
                                type="number"
                                min={0}
                                max={selectedExam.maximum_marks}
                                value={marksMap[st.id] ?? ''}
                                onChange={(e) =>
                                  setMarksMap({ ...marksMap, [st.id]: Number(e.target.value) })
                                }
                                placeholder="0"
                                className="w-20 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden"
                              />
                            </td>
                            <td className="p-3.5">
                              <input
                                type="text"
                                value={remarksMap[st.id] || ''}
                                onChange={(e) =>
                                  setRemarksMap({ ...remarksMap, [st.id]: e.target.value })
                                }
                                placeholder="e.g. Excellent proof structure"
                                className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {examRoster.length > 0 && (
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleSaveMarks}
                      disabled={isSavingMarks}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {isSavingMarks ? 'Saving...' : 'Save & Publish Exam Grades'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center text-xs text-slate-400">
                Select an examination on the left to enter student score sheets.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Schedule Exam Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Schedule New Examination"
        maxWidth="xl"
      >
        <form onSubmit={handleCreateExam} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Course *
            </label>
            <select
              value={newCourseId}
              onChange={(e) => setNewCourseId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
            >
              {classes.map((cls) => (
                <option key={cls.course_id} value={cls.course_id}>
                  {cls.course?.code} - {cls.course?.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Exam Title *
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Midterm Assessment"
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Assessment Type *
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="MIDTERM">Midterm</option>
                <option value="FINAL">Final Comprehensive</option>
                <option value="QUIZ">Quiz / Test</option>
                <option value="LAB">Lab Practical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Exam Date *
              </label>
              <input
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Start Time *
              </label>
              <input
                type="text"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                placeholder="09:00 AM"
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Duration (mins)
              </label>
              <input
                type="number"
                value={newDuration}
                onChange={(e) => setNewDuration(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Max Marks
              </label>
              <input
                type="number"
                value={newMaxMarks}
                onChange={(e) => setNewMaxMarks(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Weightage %
              </label>
              <input
                type="number"
                value={newWeightage}
                onChange={(e) => setNewWeightage(Number(e.target.value))}
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
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md transition-all"
            >
              Schedule Exam
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
