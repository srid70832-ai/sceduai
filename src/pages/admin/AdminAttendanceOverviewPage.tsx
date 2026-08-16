import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { CalendarCheck, AlertTriangle, Users, Search, CheckCircle2 } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';

interface AdminAttendanceOverviewPageProps {
  onNavigate: (path: string) => void;
}

export const AdminAttendanceOverviewPage: React.FC<AdminAttendanceOverviewPageProps> = ({ onNavigate }) => {
  const { loadDemoData } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [filterAtRisk, setFilterAtRisk] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      api.getAdminStats().catch(() => null),
      api.getClasses().catch(() => [])
    ]).then(async ([st, clss]) => {
      setStats(st);
      const studentMap: Record<string, any> = {};
      for (const cls of clss) {
        const rep = await api.getClassReport(cls.id).catch(() => null);
        if (rep?.students) {
          rep.students.forEach((s: any) => {
            studentMap[s.student_id] = s;
          });
        }
      }
      setStudents(Object.values(studentMap));
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const filtered = students.filter((s) => {
    const matchSearch =
      s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.roll_number?.toLowerCase().includes(search.toLowerCase());
    const matchRisk = filterAtRisk ? s.attendance_rate < 75 : true;
    return matchSearch && matchRisk;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Campus-Wide Attendance Intelligence & Thresholds
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Automated monitoring of 75% regulatory compliance and chronic absenteeism flags
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Institutional Average</span>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {stats?.average_attendance || 0}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across all registered curricular sections</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Enrolled Cohort</span>
          <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">
            {students.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Active student body records</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Sub-75% Risk Flag</span>
          <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">
            {students.filter((s) => s.attendance_rate < 75).length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Students below mandatory minimum</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student or roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          onClick={() => setFilterAtRisk(!filterAtRisk)}
          className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
            filterAtRisk
              ? 'bg-rose-600 text-white border-rose-600'
              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          {filterAtRisk ? 'Showing At-Risk (<75%)' : 'Filter At-Risk Only'}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
          Campus Student Attendance Table ({filtered.length})
        </h3>

        {isLoading ? (
          <div className="py-12 text-center text-slate-400">Aggregating attendance records...</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No records found."
            description="There are currently no attendance entries matching this criteria."
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
                  <th className="p-3.5 font-semibold">Present Sessions</th>
                  <th className="p-3.5 font-semibold">Total Sessions</th>
                  <th className="p-3.5 font-semibold">Attendance Rate</th>
                  <th className="p-3.5 font-semibold">Regulatory Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((s) => {
                  const isBelow = s.attendance_rate < 75;
                  return (
                    <tr key={s.student_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-mono text-[11px] text-slate-400">{s.roll_number}</td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">{s.full_name}</td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300">{s.present_classes || 0}</td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300">{s.total_classes || 0}</td>
                      <td className="p-3.5">
                        <span className={`font-bold ${isBelow ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {s.attendance_rate}%
                        </span>
                      </td>
                      <td className="p-3.5">
                        {isBelow ? (
                          <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold text-[10px]">
                            FLAGGED AT-RISK
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
                            COMPLIANT
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
