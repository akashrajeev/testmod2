import React from 'react';
import { Receipt, Search, FileX } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  iconType?: 'receipt' | 'search' | 'file';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  iconType = 'receipt',
}) => {
  const renderIcon = () => {
    switch (iconType) {
      case 'search':
        return <Search className="w-12 h-12 text-indigo-400" />;
      case 'file':
        return <FileX className="w-12 h-12 text-indigo-400" />;
      case 'receipt':
      default:
        return <Receipt className="w-12 h-12 text-indigo-400" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-dashed border-gray-300 shadow-sm my-4">
      <div className="p-3 bg-indigo-50 rounded-full mb-4">
        {renderIcon()}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
