import React from 'react';
import { DollarSign, Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { DashboardSummary } from '../../types';

interface SummaryCardsProps {
  summary: DashboardSummary;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val);
  };

  const isIncrease = summary.percentage_change > 0;
  const isDecrease = summary.percentage_change < 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
      {/* Total Spending Card */}
      <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-500">Total Lifetime Spending</span>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900">
          {formatCurrency(summary.total_spending)}
        </div>
        <p className="mt-2 text-xs text-gray-400">All recorded transactions</p>
      </div>

      {/* Current Month Spending Card */}
      <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-500">Current Month Spending</span>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900">
          {formatCurrency(summary.current_month_spending)}
        </div>
        <div className="mt-3 flex items-center text-xs font-semibold">
          {isIncrease && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-rose-700 bg-rose-50 mr-2">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              +{summary.percentage_change.toFixed(1)}%
            </span>
          )}
          {isDecrease && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-emerald-700 bg-emerald-50 mr-2">
              <TrendingDown className="w-3.5 h-3.5 mr-1" />
              {summary.percentage_change.toFixed(1)}%
            </span>
          )}
          {!isIncrease && !isDecrease && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-gray-700 bg-gray-100 mr-2">
              <Minus className="w-3.5 h-3.5 mr-1" />
              0.0%
            </span>
          )}
          <span className="text-gray-500">vs last month</span>
        </div>
      </div>

      {/* Previous Month Card */}
      <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-500">Previous Month Spending</span>
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900">
          {formatCurrency(summary.previous_month_spending)}
        </div>
        <p className="mt-2 text-xs text-gray-400">Previous month total</p>
      </div>
    </div>
  );
};
