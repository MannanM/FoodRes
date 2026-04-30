import { useRef, type ChangeEvent } from 'react';
import { exportData, importData, saveState } from '../lib/storage';
import { Download, Upload, Copy, ClipboardPaste, FileText, Eraser } from 'lucide-react';
import { exampleData } from '../lib/exampleData';
import { useStateContext } from '../context/StateContext';

const Settings = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { cleanStorage } = useStateContext();

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `foodres_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importData(content);
        if (success) {
          alert('Data imported successfully!');
          // Force context reload
          window.location.reload();
        } else {
          alert('Invalid backup file.');
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExportClipboard = async () => {
    try {
      await navigator.clipboard.writeText(exportData());
      alert('Data copied to clipboard!');
    } catch (err) {
      alert('Failed to copy to clipboard.');
    }
  };

  const handleImportClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const success = importData(text);
      if (success) {
        alert('Data imported from clipboard successfully!');
        window.location.reload();
      } else {
        alert('Invalid backup data in clipboard.');
      }
    } catch (err) {
      alert('Failed to read from clipboard. Make sure you grant clipboard permissions.');
    }
  };

  const handleLoadExample = () => {
    if (window.confirm('This will OVERWRITE your current data with example data. Are you sure?')) {
      saveState(exampleData);
      alert('Example data loaded successfully!');
      window.location.reload();
    }
  };

  const handleCleanStorage = () => {
    if (window.confirm('This will remove all items with 0 quantity and empty food groups. Are you sure?')) {
      cleanStorage();
      alert('Storage cleaned successfully!');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Data Management</h2>
        
        <div className="space-y-4">
          <button 
            onClick={handleExport}
            className="w-full py-4 bg-primary text-white rounded-xl font-medium shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Download size={20} /> Export Backup (JSON)
          </button>

          <div className="relative">
            <input 
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleImport}
              className="hidden"
              id="import-upload"
            />
            <label 
              htmlFor="import-upload"
              className="w-full py-4 bg-slate-100 text-slate-800 rounded-xl font-medium border border-slate-300 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload size={20} /> Import Backup (JSON)
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleExportClipboard}
              className="w-full py-3 bg-white text-slate-700 rounded-xl font-medium border border-slate-300 shadow-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <Copy size={18} /> Copy to Clipboard
            </button>
            <button 
              onClick={handleImportClipboard}
              className="w-full py-3 bg-white text-slate-700 rounded-xl font-medium border border-slate-300 shadow-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <ClipboardPaste size={18} /> Load from Clipboard
            </button>
          </div>

          <button 
            onClick={handleLoadExample}
            className="w-full py-3 mt-4 bg-slate-800 text-white rounded-xl font-medium shadow-sm hover:bg-slate-900 transition-colors flex items-center justify-center gap-2"
          >
            <FileText size={20} /> Load Example Data
          </button>

          <button 
            onClick={handleCleanStorage}
            className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-medium border border-red-200 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
          >
            <Eraser size={20} /> Clean Storage
          </button>
          
          <div className="mt-8 pt-6 border-t border-slate-100 text-sm text-slate-500 text-center">
            <p>FoodRes stores all data locally in your browser. Clearing your browser data will wipe your inventory. Always keep a backup!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
