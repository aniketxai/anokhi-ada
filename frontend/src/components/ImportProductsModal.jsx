import { useState, useRef } from 'react';
import { Upload, FileJson, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { getBaseUrl } from '../api';

export default function ImportProductsModal({ isOpen, onClose, onImportComplete }) {
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/json') {
      setSelectedFile(file);
      setError(null);
    } else {
      setError('Please select a valid JSON file');
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`${getBaseUrl()}/api/admin/import-products`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Import failed');
      }

      const data = await response.json();
      setResult(data);
      
      // Call callback to refresh products
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setError(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 rounded-lg p-8 max-w-md w-full shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-6">📦 Import Products from JSON</h2>

        {/* File Input */}
        {!result && (
          <div className="space-y-4">
            <label className="block">
              <div className="border-2 border-dashed border-orange-500/50 rounded-lg p-6 cursor-pointer hover:border-orange-500 transition">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="text-center">
                  <FileJson className="w-12 h-12 text-orange-500 mx-auto mb-3" />
                  <p className="text-white font-medium">
                    {selectedFile ? selectedFile.name : 'Click to select JSON file'}
                  </p>
                  <p className="text-slate-400 text-sm mt-1">or drag and drop</p>
                </div>
              </div>
            </label>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            {/* Import Button */}
            <button
              onClick={handleImport}
              disabled={!selectedFile || isLoading}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Import Products
                </>
              )}
            </button>
          </div>
        )}

        {/* Result Summary */}
        {result && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
              <span className="text-green-400 font-medium">Import completed!</span>
            </div>

            <div className="space-y-2 bg-slate-800 p-4 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Products:</span>
                <span className="text-white font-semibold">{result.summary.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Successfully Imported:</span>
                <span className="text-green-400 font-semibold">{result.summary.imported}</span>
              </div>
              {result.summary.failed > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Failed:</span>
                  <span className="text-red-400 font-semibold">{result.summary.failed}</span>
                </div>
              )}
            </div>

            {/* Error Details */}
            {result.errors && result.errors.length > 0 && (
              <div className="bg-red-500/10 p-3 rounded-lg max-h-48 overflow-y-auto">
                <p className="text-red-400 text-xs font-semibold mb-2">Errors:</p>
                <ul className="space-y-1">
                  {result.errors.map((err, idx) => (
                    <li key={idx} className="text-red-300 text-xs">
                      • {err}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => {
                handleReset();
                onClose();
              }}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg transition"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
