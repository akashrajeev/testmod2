import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Expense } from '../../types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  expense: Expense | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  expense,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  if (!isOpen || !expense) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden p-6 text-center">
        <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 text-rose-600 mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Expense</h3>
        <p className="text-sm text-gray-500 mb-6">
          Are you sure you want to delete <span className="font-semibold text-gray-800">"{expense.description}"</span> of <span className="font-semibold text-gray-800">${expense.amount.toFixed(2)}</span>? This action cannot be undone.
        </p>

        <div className="flex items-center justify-center space-x-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-md shadow-rose-100 disabled:opacity-50 transition-all"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isDeleting ? 'Deleting...' : 'Delete Expense'}
          </button>
        </div>
      </div>
    </div>
  );
};
