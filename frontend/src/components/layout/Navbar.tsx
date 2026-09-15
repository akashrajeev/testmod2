import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User as UserIcon, Menu } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm md:px-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-gray-500 rounded-lg md:hidden hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-9 h-9 bg-indigo-600 rounded-xl shadow-md text-white font-bold text-lg">
            $
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">
            Expense<span className="text-indigo-600">Tracker</span>
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {user && (
          <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-gray-800">{user.full_name}</span>
              <span className="text-xs text-gray-500">{user.email}</span>
            </div>
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-sm">
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-2 text-gray-500 rounded-lg hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
