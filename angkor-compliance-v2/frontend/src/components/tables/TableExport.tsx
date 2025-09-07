import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, File, ChevronDown } from 'lucide-react';

export interface ExportOption {
  key: string;
  label: string;
  icon: React.ReactNode;
  format: 'csv' | 'xlsx' | 'pdf' | 'json';
  description?: string;
}

export interface ExportConfig {
  filename?: string;
  includeHeaders?: boolean;
  dateFormat?: string;
  timezone?: string;
  customFields?: string[];
  excludeFields?: string[];
}

export interface TableExportProps {
  data: any[];
  columns: Array<{
    key: string;
    title: string;
    dataIndex?: string;
    exportable?: boolean;
  }>;
  onExport: (format: string, config: ExportConfig) => void;
  loading?: boolean;
  className?: string;
}

export const TableExport: React.FC<TableExportProps> = ({
  data,
  columns,
  onExport,
  loading = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    filename: 'export',
    includeHeaders: true,
    dateFormat: 'YYYY-MM-DD',
    timezone: 'UTC'
  });

  const exportOptions: ExportOption[] = [
    {
      key: 'csv',
      label: 'CSV',
      icon: <FileText className="h-4 w-4" />,
      format: 'csv',
      description: 'Comma-separated values'
    },
    {
      key: 'xlsx',
      label: 'Excel',
      icon: <FileSpreadsheet className="h-4 w-4" />,
      format: 'xlsx',
      description: 'Excel spreadsheet'
    },
    {
      key: 'pdf',
      label: 'PDF',
      icon: <File className="h-4 w-4" />,
      format: 'pdf',
      description: 'Portable Document Format'
    },
    {
      key: 'json',
      label: 'JSON',
      icon: <FileText className="h-4 w-4" />,
      format: 'json',
      description: 'JavaScript Object Notation'
    }
  ];

  const handleExport = (format: string) => {
    onExport(format, exportConfig);
    setIsOpen(false);
  };

  const handleConfigChange = (key: keyof ExportConfig, value: any) => {
    setExportConfig(prev => ({ ...prev, [key]: value }));
  };

  const getExportableColumns = () => {
    return columns.filter(col => col.exportable !== false);
  };

  const generateFilename = (format: string) => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    return `${exportConfig.filename || 'export'}_${timestamp}.${format}`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Export Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading || data.length === 0}
        className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download className="h-4 w-4" />
        <span>Export</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Export Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Export Data</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            {/* Export Options */}
            <div className="space-y-2 mb-4">
              {exportOptions.map(option => (
                <button
                  key={option.key}
                  onClick={() => handleExport(option.format)}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="text-gray-600">
                    {option.icon}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Export Configuration */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Export Settings</h4>
              
              <div className="space-y-3">
                {/* Filename */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filename
                  </label>
                  <input
                    type="text"
                    value={exportConfig.filename || ''}
                    onChange={(e) => handleConfigChange('filename', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="export"
                  />
                </div>

                {/* Include Headers */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeHeaders"
                    checked={exportConfig.includeHeaders}
                    onChange={(e) => handleConfigChange('includeHeaders', e.target.checked)}
                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <label htmlFor="includeHeaders" className="ml-2 text-sm text-gray-700">
                    Include column headers
                  </label>
                </div>

                {/* Date Format */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Format
                  </label>
                  <select
                    value={exportConfig.dateFormat}
                    onChange={(e) => handleConfigChange('dateFormat', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD HH:mm:ss">YYYY-MM-DD HH:mm:ss</option>
                  </select>
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timezone
                  </label>
                  <select
                    value={exportConfig.timezone}
                    onChange={(e) => handleConfigChange('timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                    <option value="Asia/Shanghai">Shanghai</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Export Info */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                <div>Records: {data.length}</div>
                <div>Columns: {getExportableColumns().length}</div>
                <div>Filename: {generateFilename('csv')}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
