import React, { useState, useEffect } from 'react';
import { Plus, Upload, RefreshCw } from 'lucide-react';
import { dashboardService, categoryService, expenseService } from '../services/api';
import { DashboardSummary, Category } from '../types';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { CategoryChart } from '../components/dashboard/CategoryChart';
import { MonthlyTrendChart } from '../components/dashboard/MonthlyTrendChart';
import { RecentExpenses } from '../components/dashboard/RecentExpenses';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ExpenseFormModal } from '../components/expenses/ExpenseFormModal';
import { CsvImportModal } from '../components/csv/CsvImportModal';
import { Toast, ToastType } from '../components/common/Toast';

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Modals
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState<boolean>(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sumData, catData] = await Promise.all([
        dashboardService.getSummary(),
        categoryService.getCategories(),
      ]);
      setSummary(sumData);
      setCategories(catData);
    } catch (error) {
      setToast({ message: 'Failed to load dashboard metrics.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateExpense = async (data: {
    amount: number;
    description: string;
    category_id: string;
    date: string;
    notes?: string;
  }) => {
    await expenseService.createExpense(data);
    setToast({ message: 'Expense created successfully!', type: 'success' });
    loadData();
  };

  if (isLoading && !summary) {
    return <LoadingSpinner fullScreen label="Loading Dashboard Summary..." />;
  }

  return (
    <div className="space-y-8">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-xs text-gray-500 mt-1">Track your spending patterns and financial breakdown</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            title="Refresh"
            className="p-2.5 text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="inline-flex items-center px-4 py-2.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition-all"
          >
            <Upload className="w-4 h-4 mr-2 text-indigo-600" />
            Import CSV
          </button>
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      {summary && <SummaryCards summary={summary} />}

      {/* Charts Grid */}
      {summary && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MonthlyTrendChart trends={summary.monthly_trends} />
          </div>
          <div>
            <CategoryChart categories={summary.category_breakdown} />
          </div>
        </div>
      )}

      {/* Recent Transactions List */}
      {summary && <RecentExpenses expenses={summary.recent_expenses} />}

      {/* Form Modal */}
      <ExpenseFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateExpense}
        categories={categories}
      />

      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onSuccess={() => {
          setToast({ message: 'Expenses imported from CSV!', type: 'success' });
          loadData();
        }}
      />

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
