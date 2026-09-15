import React from 'react';
import { Edit2, Trash2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Expense, PaginatedExpenses } from '../../types';
import { EmptyState } from '../common/EmptyState';

interface ExpenseListProps {
  paginatedData: PaginatedExpenses | null;
  isLoading: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  onPageChange: (page: number) => void;
  onAddClick: () => void;
  hasFilters: boolean;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  paginatedData,
  isLoading,
  onEdit,
  onDelete,
  onPageChange,
  onAddClick,
  hasFilters,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-xl" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-48" />
                <div className="h-3 bg-gray-100 rounded w-24" />
              </div>
            </div>
            <div className="h-5 bg-gray-200 rounded w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (!paginatedData || paginatedData.items.length === 0) {
    return (
      <EmptyState
        title={hasFilters ? 'No expenses match your filters' : 'No expenses recorded yet'}
        description={
          hasFilters
            ? 'Try adjusting your search criteria or resetting filters to see your expenses.'
            : 'Get started by creating your first expense or importing transactions from a CSV file.'
        }
        actionLabel={hasFilters ? undefined : 'Add First Expense'}
        onAction={hasFilters ? undefined : onAddClick}
        iconType={hasFilters ? 'search' : 'receipt'}
      />
    );
  }

  const { items, page, total_pages, total } = paginatedData;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Table for Desktop & Tablet */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 text-xs font-semibold text-gray-500 border-b border-gray-100 uppercase tracking-wider">
              <th className="py-3.5 px-6">Description</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4 text-right">Amount</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {items.map((expense) => (
              <tr key={expense.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="py-4 px-6">
                  <div className="font-semibold text-gray-900">{expense.description}</div>
                  {expense.notes && (
                    <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{expense.notes}</div>
                  )}
                </td>
                <td className="py-4 px-4">
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold"
                    style={{
                      backgroundColor: `${expense.category?.color || '#6B7280'}15`,
                      color: expense.category?.color || '#374151',
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full mr-1.5"
                      style={{ backgroundColor: expense.category?.color || '#6B7280' }}
                    />
                    {expense.category?.name || 'Uncategorized'}
                  </span>
                </td>
                <td className="py-4 px-4 text-gray-500 text-xs whitespace-nowrap">
                  <div className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                    {expense.date}
                  </div>
                </td>
                <td className="py-4 px-4 text-right font-bold text-gray-900 whitespace-nowrap">
                  -${expense.amount.toFixed(2)}
                </td>
                <td className="py-4 px-6 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onEdit(expense)}
                      title="Edit Expense"
                      className="p-1.5 text-gray-400 rounded-lg hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(expense)}
                      title="Delete Expense"
                      className="p-1.5 text-gray-400 rounded-lg hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards layout for Mobile screens */}
      <div className="sm:hidden divide-y divide-gray-100">
        {items.map((expense) => (
          <div key={expense.id} className="p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">{expense.description}</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                    style={{
                      backgroundColor: `${expense.category?.color || '#6B7280'}15`,
                      color: expense.category?.color || '#374151',
                    }}
                  >
                    {expense.category?.name || 'Uncategorized'}
                  </span>
                  <span className="text-xs text-gray-400">{expense.date}</span>
                </div>
              </div>
              <span className="font-bold text-gray-900 text-base">-${expense.amount.toFixed(2)}</span>
            </div>
            {expense.notes && <p className="text-xs text-gray-500 italic">{expense.notes}</p>}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => onEdit(expense)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(expense)}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100">
        <span className="text-xs text-gray-500">
          Showing <span className="font-semibold text-gray-800">{items.length}</span> of{' '}
          <span className="font-semibold text-gray-800">{total}</span> expenses
        </span>

        {total_pages > 1 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="p-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-gray-700 px-2">
              Page {page} of {total_pages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === total_pages}
              className="p-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
