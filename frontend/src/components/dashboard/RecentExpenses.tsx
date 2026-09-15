import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar } from 'lucide-react';
import { Expense } from '../../types';

interface RecentExpensesProps {
  expenses: Expense[];
}

export const RecentExpenses: React.FC<RecentExpensesProps> = ({ expenses }) => {
  return (
    <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
        <Link
          to="/expenses"
          className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Link>
      </div>

      {!expenses || expenses.length === 0 ? (
        <p className="text-center py-8 text-sm text-gray-400">No recent transactions found.</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {expenses.map((expense) => (
            <div key={expense.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
              <div className="flex items-center space-x-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: expense.category?.color || '#6B7280' }}
                >
                  {expense.category?.name ? expense.category.name.charAt(0) : '?'}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">{expense.description}</h4>
                  <div className="flex items-center space-x-2 text-xs text-gray-400 mt-0.5">
                    <span>{expense.category?.name || 'Uncategorized'}</span>
                    <span>•</span>
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {expense.date}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right font-bold text-sm text-gray-900">
                -${expense.amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
