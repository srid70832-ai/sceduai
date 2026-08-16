import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface PerformanceChartProps {
  data?: Array<{ name: string; score: number; max?: number; classAverage?: number }>;
  height?: number;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ data, height = 240 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-60 flex items-center justify-center text-xs text-slate-400">
        No academic performance evaluations recorded yet.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
          <Bar
            dataKey="score"
            name="Student Score (%)"
            fill="#6366f1"
            radius={[4, 4, 0, 0]}
            isAnimationActive={true}
            animationDuration={800}
            animationEasing="ease-out"
          />
          {data[0]?.classAverage !== undefined && (
            <Bar
              dataKey="classAverage"
              name="Class Average (%)"
              fill="#94a3b8"
              radius={[4, 4, 0, 0]}
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-out"
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
