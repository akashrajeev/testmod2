import React from 'react';
import { Search, Filter, Calendar, X, ArrowUpDown } from 'lucide-react';
import { Category } from '../../types';

interface ExpenseFiltersProps {
  categories: Category[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (catId: string) => void;
  startDate: string;
  onStartDateChange: (d: string) => void;
  endDate: string;
  onEndDateChange: (d: string) => void;
  sortBy: string;
  onSortByChange: (s: string) => void;
  sortDir: string;
  onSortDirChange: (d: string) => void;
  onClearFilters: () => void;
}

export const ExpenseFilters: React.FC<ExpenseFiltersProps> = ({
  categories,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  sortBy,
  onSortByChange,
  sortDir,
  onSortDirChange,
  onClearFilters,
}) => {
  const hasActiveFilters = searchQuery || selectedCategory || startDate || endDate;

  return (
    <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search description or notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        {/* Category Dropdown */}
        <div className="relative">
          <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-3.5 pointer-events-none" />
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div className="relative">
          <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3.5 pointer-events-none" />
          <input
            type="date"
            placeholder="From Date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        {/* End Date */}
        <div className="relative">
          <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3.5 pointer-events-none" />
          <input
            type="date"
            placeholder="To Date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Sorting Controls & Clear Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 text-xs">
        <div className="flex items-center space-x-3">
          <span className="font-medium text-gray-500 flex items-center">
            <ArrowUpDown className="w-3.5 h-3.5 mr-1" /> Sort by:
          </span>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="py-1 px-2.5 bg-gray-100 rounded-lg text-gray-700 font-medium focus:outline-none hover:bg-gray-200 cursor-pointer"
          >
            <option value="date">Date</option>
            <option value="amount">Amount</option>
            <option value="description">Description</option>
          </select>

          <button
            onClick={() => onSortDirChange(sortDir === 'asc' ? 'desc' : 'asc')}
            className="py-1 px-2.5 bg-gray-100 rounded-lg text-gray-700 font-medium hover:bg-gray-200 transition-colors"
          >
            {sortDir === 'asc' ? 'Ascending ↑' : 'Descending ↓'}
          </button>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center px-3 py-1 text-xs font-semibold text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
          >
            <X className="w-3.5 h-3.5 mr-1" /> Reset Filters
          </button>
        )}
      </div>
    </div>
  );
};
