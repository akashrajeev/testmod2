import React, { useState } from 'react';
import { Upload, X, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import { csvService } from '../../services/api';
import { CsvImportSummary } from '../../types';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [result, setResult] = useState<CsvImportSummary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMessage(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setErrorMessage(null);
    setResult(null);

    try {
      const summary = await csvService.importCsv(file);
      setResult(summary);
      if (summary.imported_rows > 0) {
        onSuccess();
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to upload CSV file.';
      setErrorMessage(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900">Import Expenses from CSV</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 rounded-lg hover:text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {!result ? (
            <>
              {/* Guidance Box */}
              <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-900 space-y-1">
                <p className="font-bold flex items-center">
                  <FileText className="w-4 h-4 mr-1.5 text-indigo-600" />
                  CSV Format Instructions:
                </p>
                <p>Ensure your CSV contains columns for <span className="font-semibold">Date</span> (YYYY-MM-DD or MM/DD/YYYY), <span className="font-semibold">Description</span>, <span className="font-semibold">Category</span>, and <span className="font-semibold">Amount</span>.</p>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs font-medium rounded-lg border border-rose-200">
                  {errorMessage}
                </div>
              )}

              {/* Upload Drop Zone */}
              <div className="border-2 border-dashed border-gray-300 hover:border-indigo-500 rounded-2xl p-6 text-center transition-colors bg-gray-50/50">
                <input
                  type="file"
                  accept=".csv"
                  id="csv-file-input"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="csv-file-input" className="cursor-pointer block">
                  <Upload className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
                  <span className="text-sm font-semibold text-gray-800 block">
                    {file ? file.name : 'Click to select CSV file'}
                  </span>
                  <span className="text-xs text-gray-400 mt-1 block">
                    {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Supports standard UTF-8 encoded CSV files'}
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  className="inline-flex items-center px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-100"
                >
                  {isUploading ? 'Importing...' : 'Upload & Import'}
                </button>
              </div>
            </>
          ) : (
            /* Results Summary */
            <div className="space-y-4">
              <div className="flex items-center justify-around p-4 bg-gray-50 rounded-xl text-center border border-gray-100">
                <div>
                  <span className="text-xs text-gray-500 block">Total Rows</span>
                  <span className="text-xl font-bold text-gray-900">{result.total_rows}</span>
                </div>
                <div className="border-r border-gray-200 h-8" />
                <div>
                  <span className="text-xs text-emerald-600 font-semibold block">Imported</span>
                  <span className="text-xl font-bold text-emerald-600">{result.imported_rows}</span>
                </div>
                <div className="border-r border-gray-200 h-8" />
                <div>
                  <span className="text-xs text-rose-600 font-semibold block">Failed</span>
                  <span className="text-xl font-bold text-rose-600">{result.failed_rows}</span>
                </div>
              </div>

              {/* Error Details */}
              {result.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1 text-rose-500" />
                    Validation Issues ({result.errors.length}):
                  </h4>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 text-xs">
                    {result.errors.map((err, idx) => (
                      <div key={idx} className="p-2.5 bg-rose-50 border border-rose-100 rounded-lg text-rose-800">
                        <span className="font-bold">Row {err.row_number} ({err.field}):</span> {err.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={handleReset}
                  className="px-3.5 py-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Import Another File
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
