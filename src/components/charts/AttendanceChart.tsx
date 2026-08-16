import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

interface AttendanceChartProps {
  data?: Array<{ name: string; present: number; absent: number; late?: number; rate?: number }>;
  type?: 'bar' | 'area';
  height?: number;
}

export const AttendanceChart: React.FC<AttendanceChartProps> = ({
  data,
  type = 'bar',
  height = 240
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-60 flex items-center justify-center text-xs text-slate-400">
        No attendance trend data recorded yet.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        {type === 'area' ? (
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.25} />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#1e293b',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
              }}
            />
            <Area
              type="monotone"
              dataKey="rate"
              name="Attendance Rate (%)"
              stroke="#6366f1"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorRate)"
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </AreaChart>
        ) : (
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.25} />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#1e293b',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            <Bar
              dataKey="present"
              name="Present"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-out"
            />
            <Bar
              dataKey="absent"
              name="Absent"
              fill="#f43f5e"
              radius={[4, 4, 0, 0]}
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-out"
            />
            <Bar
              dataKey="late"
              name="Late"
              fill="#f59e0b"
              radius={[4, 4, 0, 0]}
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
