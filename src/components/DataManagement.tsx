"use client";
import { useState, useRef } from 'react';
import { useRecipeStore } from '@/store/recipes';
import { createExportFilename } from '@/lib/schema';
import { Button } from '@/components/UI';
import { Download, Upload, FileText } from 'lucide-react';

export function DataManagement() {
  const { exportData, importData } = useRecipeStore();
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);
  const [replacePlanner, setReplacePlanner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const jsonData = exportData();
      const filename = createExportFilename();
      
      // Create and download file
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert(`Data exported successfully as ${filename}`);
    } catch (error) {
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      alert('Please select a JSON file');
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const result = importData(text, !!replacePlanner);
      setImportResult(result);
      
      if (result.success) {
        alert(result.message);
      } else {
        alert(result.message);
      }
    } catch (error) {
      const errorMessage = `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setImportResult({ success: false, message: errorMessage });
      alert(errorMessage);
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <FileText className="w-4 h-4" />
        <span>Data Management</span>
      </div>
      
      <div className="space-y-3">
        <div className="flex gap-3">
          {/* Export Button */}
          <Button
            onClick={handleExport}
            iconLeft={<Download className="w-4 h-4" />}
            variant="secondary"
          >
            Export Data
          </Button>

          {/* Import Button */}
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isImporting}
            />
            <Button
              iconLeft={<Upload className="w-4 h-4" />}
              variant="secondary"
              disabled={isImporting}
            >
              {isImporting ? 'Importing...' : 'Import Data'}
            </Button>
          </div>
        </div>

        {/* Import Options */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Planner import mode</h4>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="plannerMode"
                value="merge"
                checked={!replacePlanner}
                onChange={(e) => setReplacePlanner(false)}
                className="border-gray-300"
              />
              <span className="text-sm text-gray-700">Merge (safe) — union recipe IDs per cell; if the file planner is empty/missing, keep current planner unchanged.</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="plannerMode"
                value="replace"
                checked={replacePlanner}
                onChange={(e) => setReplacePlanner(true)}
                className="border-gray-300"
              />
              <span className="text-sm text-gray-700">Replace (overwrite) — replace planner with the file's planner; if the file planner is empty, clear all meals.</span>
            </label>
          </div>
        </div>
      </div>

      {/* Import Result */}
      {importResult && (
        <div className={`p-3 rounded-lg text-sm ${
          importResult.success 
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {importResult.message}
        </div>
      )}

      <div className="text-xs text-gray-500 space-y-1">
        <p><strong>Export:</strong> Downloads all recipes and meal planner data as JSON</p>
        <p><strong>Import:</strong> Merges recipes by ID and combines meal planner data</p>
        <p><strong>Format:</strong> family-recipe-export-v1-YYYYMMDD.json</p>
      </div>
    </div>
  );
}
