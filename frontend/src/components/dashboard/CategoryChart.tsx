import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CategorySpending } from '../../types';

interface CategoryChartProps {
  categories: CategorySpending[];
}

export const CategoryChart: React.FC<CategoryChartProps> = ({ categories }) => {
  if (!categories || categories.length === 0) {
    return (
      <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
        <p className="text-gray-400 text-sm">No expense category data available yet.</p>
      </div>
    );
  }

  const chartData = categories.map((cat) => ({
    name: cat.category_name,
    value: cat.total_amount,
    color: cat.color || '#6B7280',
    percentage: cat.percentage,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg text-xs space-y-1">
          <p className="font-bold">{data.name}</p>
          <p className="text-indigo-300">
            ${data.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Spending by Category</h3>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-1">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-xs py-1 border-b border-gray-50 last:border-0">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="font-medium text-gray-700 truncate max-w-[120px]">{item.name}</span>
            </div>
            <div className="flex items-center space-x-2 font-semibold text-gray-900">
              <span>${item.value.toFixed(2)}</span>
              <span className="text-gray-400 font-normal">({item.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
