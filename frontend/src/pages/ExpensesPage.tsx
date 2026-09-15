import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Upload } from 'lucide-react';
import { expenseService, categoryService } from '../services/api';
import { Expense, PaginatedExpenses, Category } from '../types';
import { ExpenseFilters } from '../components/expenses/ExpenseFilters';
import { ExpenseList } from '../components/expenses/ExpenseList';
import { ExpenseFormModal } from '../components/expenses/ExpenseFormModal';
import { DeleteConfirmModal } from '../components/expenses/DeleteConfirmModal';
import { CsvExportButton } from '../components/csv/CsvExportButton';
import { CsvImportModal } from '../components/csv/CsvImportModal';
import { Toast, ToastType } from '../components/common/Toast';

export const ExpensesPage: React.FC = () => {
  const [paginatedData, setPaginatedData] = useState<PaginatedExpenses | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortDir, setSortDir] = useState<string>('desc');
  const [page, setPage] = useState<number>(1);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [isCsvImportOpen, setIsCsvImportOpen] = useState<boolean>(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Load Categories on mount
  useEffect(() => {
    categoryService.getCategories().then(setCategories).catch(() => {});
  }, []);

  // Fetch Expenses
  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await expenseService.getExpenses({
        q: searchQuery || undefined,
        category_id: selectedCategory || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        sort_by: sortBy,
        sort_dir: sortDir,
        page,
        page_size: 10,
      });
      setPaginatedData(data);
    } catch (error) {
      setToast({ message: 'Failed to fetch expenses.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory, startDate, endDate, sortBy, sortDir, page]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Reset filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setStartDate('');
    setEndDate('');
    setSortBy('date');
    setSortDir('desc');
    setPage(1);
  };

  // Form submit (create or update)
  const handleFormSubmit = async (data: {
    amount: number;
    description: string;
    category_id: string;
    date: string;
    notes?: string;
  }) => {
    if (editingExpense) {
      await expenseService.updateExpense(editingExpense.id, data);
      setToast({ message: 'Expense updated successfully!', type: 'success' });
    } else {
      await expenseService.createExpense(data);
      setToast({ message: 'Expense created successfully!', type: 'success' });
    }
    fetchExpenses();
  };

  // Delete submit
  const handleDeleteConfirm = async () => {
    if (!deletingExpense) return;
    setIsDeleting(true);
    try {
      await expenseService.deleteExpense(deletingExpense.id);
      setToast({ message: 'Expense deleted successfully.', type: 'info' });
      setIsDeleteOpen(false);
      setDeletingExpense(null);
      fetchExpenses();
    } catch (error) {
      setToast({ message: 'Failed to delete expense.', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const hasActiveFilters = Boolean(searchQuery || selectedCategory || startDate || endDate);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Expenses</h1>
          <p className="text-xs text-gray-500 mt-1">Manage, search, and organize all your expense transactions</p>
        </div>

        <div className="flex items-center space-x-3">
          <CsvExportButton
            categoryId={selectedCategory}
            startDate={startDate}
            endDate={endDate}
          />
          <button
            onClick={() => setIsCsvImportOpen(true)}
            className="inline-flex items-center px-3.5 py-2.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition-all"
          >
            <Upload className="w-4 h-4 mr-2 text-indigo-600" />
            Import CSV
          </button>
          <button
            onClick={() => {
              setEditingExpense(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <ExpenseFilters
        categories={categories}
        searchQuery={searchQuery}
        onSearchChange={(q) => { setSearchQuery(q); setPage(1); }}
        selectedCategory={selectedCategory}
        onCategoryChange={(cat) => { setSelectedCategory(cat); setPage(1); }}
        startDate={startDate}
        onStartDateChange={(d) => { setStartDate(d); setPage(1); }}
        endDate={endDate}
        onEndDateChange={(d) => { setEndDate(d); setPage(1); }}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortDir={sortDir}
        onSortDirChange={setSortDir}
        onClearFilters={handleClearFilters}
      />

      {/* Expense List Table */}
      <ExpenseList
        paginatedData={paginatedData}
        isLoading={isLoading}
        onEdit={(exp) => {
          setEditingExpense(exp);
          setIsFormOpen(true);
        }}
        onDelete={(exp) => {
          setDeletingExpense(exp);
          setIsDeleteOpen(true);
        }}
        onPageChange={setPage}
        onAddClick={() => {
          setEditingExpense(null);
          setIsFormOpen(true);
        }}
        hasFilters={hasActiveFilters}
      />

      {/* Form Modal (Create / Edit) */}
      <ExpenseFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingExpense(null);
        }}
        onSubmit={handleFormSubmit}
        categories={categories}
        initialData={editingExpense}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        expense={deletingExpense}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingExpense(null);
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />

      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
        onSuccess={() => {
          setToast({ message: 'Expenses imported successfully!', type: 'success' });
          fetchExpenses();
        }}
      />

      {/* Toast Notification */}
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
