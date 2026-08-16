import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { ShieldCheck, Clock, User, FileText } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { EmptyState } from '../../components/common/EmptyState';

interface AdminAuditLogsPageProps {
  onNavigate: (path: string) => void;
}

export const AdminAuditLogsPage: React.FC<AdminAuditLogsPageProps> = ({ onNavigate }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    api.getAuditLogs()
      .then((data) => setLogs(data))
      .catch(() => setLogs([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Institutional Security & Audit Trail
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Immutable ledger of administrative actions, grade changes, and authentication logs
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-500" />
          System Activity Log ({logs.length} entries)
        </h3>

        {isLoading ? (
          <div className="py-12 text-center text-slate-400">Loading audit trail...</div>
        ) : logs.length === 0 ? (
          <EmptyState
            title="No audit entries recorded."
            description="System activity logs will record user logins, grading edits, and course modifications."
          />
        ) : (
          <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                <tr>
                  <th className="p-3.5 font-semibold">Timestamp</th>
                  <th className="p-3.5 font-semibold">Action</th>
                  <th className="p-3.5 font-semibold">Entity Type</th>
                  <th className="p-3.5 font-semibold">Entity ID</th>
                  <th className="p-3.5 font-semibold">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 font-mono text-[11px] text-slate-400">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40 text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">
                      {log.entity_type}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-400">
                      {log.entity_id || '—'}
                    </td>
                    <td className="p-3.5 text-slate-500 font-mono text-[10px] max-w-xs truncate">
                      {JSON.stringify(log.details || {})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
