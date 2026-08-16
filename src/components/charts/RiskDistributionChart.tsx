import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface RiskDistributionChartProps {
  distribution?: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  height?: number;
}

export const RiskDistributionChart: React.FC<RiskDistributionChartProps> = ({
  distribution,
  height = 240
}) => {
  const data = [
    { name: 'Low Risk', value: distribution?.low || 0, color: '#10b981' },
    { name: 'Moderate Risk', value: distribution?.medium || 0, color: '#3b82f6' },
    { name: 'High Risk', value: distribution?.high || 0, color: '#f59e0b' },
    { name: 'Critical Risk', value: distribution?.critical || 0, color: '#ef4444' }
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="h-60 flex items-center justify-center text-xs text-slate-400">
        No student risk evaluation metrics recorded yet.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
            isAnimationActive={true}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
            ))}
          </Pie>
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
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
