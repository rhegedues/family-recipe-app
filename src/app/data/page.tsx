import { notFound } from "next/navigation";
import { DataManagement } from '@/components/DataManagement';
import { Card } from '@/components/UI';
import { Database } from 'lucide-react';

const enabled = process.env.NEXT_PUBLIC_ENABLE_DATA_TOOLS === "true";

export default function DataPage() {
  if (!enabled) notFound();

  // Show data management tools
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Database className="w-8 h-8 text-orange-500" />
          <h1 className="text-3xl font-bold text-gray-900">Data Management</h1>
        </div>
        <p className="text-gray-600">
          Export your recipes and meal plans, or import existing data.
        </p>
      </div>

      {/* Data Management Component */}
      <Card className="p-6">
        <DataManagement />
      </Card>

      {/* Additional Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">About Data Management</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Export:</strong> Download all your recipes and meal plans as a JSON file</li>
          <li>• <strong>Import:</strong> Upload a JSON file to add recipes and meal plans</li>
          <li>• <strong>Merge Mode:</strong> Safely combine data without losing existing content</li>
          <li>• <strong>Replace Mode:</strong> Replace planner data completely (use with caution)</li>
        </ul>
      </div>
    </div>
  );
}
