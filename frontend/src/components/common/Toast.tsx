import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    },
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-800',
      icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
    },
    info: {
      bg: 'bg-indigo-50 border-indigo-200 text-indigo-800',
      icon: <Info className="w-5 h-5 text-indigo-500" />,
    },
  };

  const currentStyle = styles[type];

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center p-4 max-w-md border rounded-lg shadow-lg ${currentStyle.bg} transition-all duration-300 animate-slide-up`}>
      <div className="flex-shrink-0 mr-3">{currentStyle.icon}</div>
      <div className="text-sm font-medium mr-4 flex-1">{message}</div>
      <button
        onClick={onClose}
        className="inline-flex flex-shrink-0 p-1 rounded-md hover:bg-black/5 focus:outline-none"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
