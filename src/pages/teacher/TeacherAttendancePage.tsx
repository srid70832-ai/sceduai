import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { ClassItem, AttendanceStatus } from '../../types';
import { useToast } from '../../context/ToastContext';
import { CalendarCheck, Save, CheckCircle, Clock, XCircle, Users, CheckCheck } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';

interface TeacherAttendancePageProps {
  onNavigate: (path: string) => void;
}

export const TeacherAttendancePage: React.FC<TeacherAttendancePageProps> = ({ onNavigate }) => {
  const { teacher, loadDemoData } = useAuth();
  const { showToast } = useToast();

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [topic, setTopic] = useState<string>('Lecture & Laboratory Practice');
  const [roster, setRoster] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const [remarksMap, setRemarksMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Fetch teacher's classes
  useEffect(() => {
    if (teacher) {
      setIsLoading(true);
      api.getClasses()
        .then((data) => {
          setClasses(data);
          if (data.length > 0) {
            setSelectedClassId(data[0].id);
          }
        })
        .catch(() => setClasses([]))
        .finally(() => setIsLoading(false));
    }
  }, [teacher]);

  // When selectedClassId changes, fetch students in that class
  useEffect(() => {
    if (selectedClassId) {
      api.getClass(selectedClassId)
        .then((data: any) => {
          const students = data.students || (data.enrollments ? data.enrollments.map((e: any) => e.student).filter(Boolean) : []);
          setRoster(students);

          // Default all to PRESENT
          const initialMap: Record<string, AttendanceStatus> = {};
          students.forEach((st: any) => {
            initialMap[st.id] = 'PRESENT';
          });
          setAttendanceMap(initialMap);
        })
        .catch(() => setRoster([]));
    }
  }, [selectedClassId]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const updated: Record<string, AttendanceStatus> = {};
    roster.forEach((st) => {
      updated[st.id] = status;
    });
    setAttendanceMap(updated);
    showToast(`Marked all students as ${status}`, 'info');
  };

  const handleSaveAttendance = async () => {
    if (!selectedClassId || roster.length === 0) {
      showToast('No students enrolled in this section to record attendance.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const records = roster.map((st) => ({
        student_id: st.id,
        status: attendanceMap[st.id] || 'PRESENT',
        remarks: remarksMap[st.id] || topic
      }));

      await api.recordBatchAttendance({
        class_id: selectedClassId,
        date: sessionDate,
        records
      });

      showToast(`Recorded attendance for ${records.length} students successfully!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to record attendance', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Daily Attendance Recording Engine
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Record presence, absence, and late marks. Triggers automatic threshold analytics across the institution.
        </p>
      </div>

      {/* Class & Date Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Select Class Section
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
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
              Session Date
            </label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Lecture Topic / Notes
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Unit 3: Dynamic Programming"
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Roster & Marking Interface */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" />
              Student Roster ({roster.length} Enrolled)
            </h3>
            <p className="text-[11px] text-slate-400">Click status badges to toggle student attendance</p>
          </div>

          {roster.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleMarkAll('PRESENT')}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold hover:bg-emerald-500/20 transition-all flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" /> All Present
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll('ABSENT')}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-semibold hover:bg-rose-500/20 transition-all"
              >
                All Absent
              </button>
            </div>
          )}
        </div>

        {roster.length === 0 ? (
          <EmptyState
            title="No students enrolled in this section."
            description="Enroll students in this class section to record attendance."
            secondaryActionText="Load Sample Academic Dataset"
            onSecondaryAction={loadDemoData}
          />
        ) : (
          <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                <tr>
                  <th className="p-3.5 font-semibold">Roll Number</th>
                  <th className="p-3.5 font-semibold">Student Name</th>
                  <th className="p-3.5 font-semibold">Attendance Status</th>
                  <th className="p-3.5 font-semibold">Specific Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {roster.map((st) => {
                  const currentStatus = attendanceMap[st.id] || 'PRESENT';

                  return (
                    <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-mono text-[11px] text-slate-400">{st.roll_number}</td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        {st.profile?.full_name || 'Enrolled Student'}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const).map((stat) => (
                            <button
                              key={stat}
                              type="button"
                              onClick={() => handleStatusChange(st.id, stat)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                currentStatus === stat
                                  ? stat === 'PRESENT'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : stat === 'ABSENT'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : stat === 'LATE'
                                    ? 'bg-amber-600 text-white shadow-xs'
                                    : 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                              }`}
                            >
                              {stat === 'PRESENT' ? 'P' : stat === 'ABSENT' ? 'A' : stat === 'LATE' ? 'L' : 'E'}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <input
                          type="text"
                          placeholder="Optional note..."
                          value={remarksMap[st.id] || ''}
                          onChange={(e) =>
                            setRemarksMap({ ...remarksMap, [st.id]: e.target.value })
                          }
                          className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {roster.length > 0 && (
          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSaveAttendance}
              disabled={isSaving}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-6 py-3 rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Recording in Database...' : 'Save & Publish Attendance Record'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
