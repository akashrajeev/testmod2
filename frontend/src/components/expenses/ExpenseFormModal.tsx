import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Save } from 'lucide-react';
import { Category, Expense } from '../../types';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    amount: number;
    description: string;
    category_id: string;
    date: string;
    notes?: string;
  }) => Promise<void>;
  categories: Category[];
  initialData?: Expense | null;
}

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  initialData,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount.toString());
      setDescription(initialData.description);
      setCategoryId(initialData.category_id);
      setDate(initialData.date);
      setNotes(initialData.notes || '');
    } else {
      setAmount('');
      setDescription('');
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
    setErrors({});
  }, [initialData, isOpen, categories]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = 'Please enter a valid positive amount.';
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required.';
    }
    if (!categoryId) {
      newErrors.category_id = 'Please select a category.';
    }
    if (!date) {
      newErrors.date = 'Date is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        amount: parseFloat(amount),
        description: description.trim(),
        category_id: categoryId,
        date,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to save expense.';
      setErrors({ server: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900">
            {initialData ? 'Edit Expense' : 'Add New Expense'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 rounded-lg hover:text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.server && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs font-medium rounded-lg border border-rose-200">
              {errors.server}
            </div>
          )}

          {/* Amount & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Amount ($) *
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full px-3.5 py-2.5 text-sm bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                  errors.amount ? 'border-rose-500 focus:ring-rose-500' : 'border-gray-200 focus:ring-indigo-500'
                }`}
              />
              {errors.amount && <p className="mt-1 text-xs text-rose-500">{errors.amount}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full px-3.5 py-2.5 text-sm bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                  errors.date ? 'border-rose-500 focus:ring-rose-500' : 'border-gray-200 focus:ring-indigo-500'
                }`}
              />
              {errors.date && <p className="mt-1 text-xs text-rose-500">{errors.date}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Description *
            </label>
            <input
              type="text"
              placeholder="e.g. Weekly grocery shopping"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-3.5 py-2.5 text-sm bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                errors.description ? 'border-rose-500 focus:ring-rose-500' : 'border-gray-200 focus:ring-indigo-500'
              }`}
            />
            {errors.description && <p className="mt-1 text-xs text-rose-500">{errors.description}</p>}
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={`w-full px-3.5 py-2.5 text-sm bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                errors.category_id ? 'border-rose-500 focus:ring-rose-500' : 'border-gray-200 focus:ring-indigo-500'
              }`}
            >
              <option value="" disabled>Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category_id && <p className="mt-1 text-xs text-rose-500">{errors.category_id}</p>}
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Additional notes or store details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-md shadow-indigo-100 disabled:opacity-50 transition-all"
            >
              {initialData ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Updating...' : 'Save Changes'}
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Creating...' : 'Create Expense'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
