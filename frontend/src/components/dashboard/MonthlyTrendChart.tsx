import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MonthlyTrend } from '../../types';

interface MonthlyTrendChartProps {
  trends: MonthlyTrend[];
}

export const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({ trends }) => {
  if (!trends || trends.length === 0) {
    return (
      <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
        <p className="text-gray-400 text-sm">No monthly trend data available.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg text-xs space-y-1">
          <p className="font-bold">{label}</p>
          <p className="text-emerald-400">
            Total: ${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Monthly Spending Trends</h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis dataKey="month_name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="total_amount" fill="#6366F1" radius={[6, 6, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
