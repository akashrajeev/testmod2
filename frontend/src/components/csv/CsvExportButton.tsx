import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { csvService } from '../../services/api';

interface CsvExportButtonProps {
  categoryId?: string;
  startDate?: string;
  endDate?: string;
}

export const CsvExportButton: React.FC<CsvExportButtonProps> = ({
  categoryId,
  startDate,
  endDate,
}) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await csvService.exportCsv({
        category_id: categoryId || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });

      // Create download URL
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      const today = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `expenses_${today}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export CSV. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="inline-flex items-center px-4 py-2.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 focus:outline-none shadow-sm transition-all disabled:opacity-50"
    >
      <Download className="w-4 h-4 mr-2 text-gray-500" />
      {isExporting ? 'Exporting...' : 'Export CSV'}
    </button>
  );
};
