import React, { useState } from 'react';
import { Filter, X, ChevronDown, Search } from 'lucide-react';

export interface FilterOption {
  value: string | number;
  label: string;
  count?: number;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'search' | 'date' | 'daterange' | 'number' | 'numberrange';
  options?: FilterOption[];
  placeholder?: string;
  multiple?: boolean;
}

export interface TableFilterProps {
  filters: FilterConfig[];
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  onClear: () => void;
  className?: string;
}

export const TableFilter: React.FC<TableFilterProps> = ({
  filters,
  values,
  onChange,
  onClear,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localValues, setLocalValues] = useState(values);

  const handleFilterChange = (key: string, value: any) => {
    const newValues = { ...localValues, [key]: value };
    setLocalValues(newValues);
  };

  const handleApply = () => {
    onChange(localValues);
    setIsOpen(false);
  };

  const handleClear = () => {
    setLocalValues({});
    onClear();
    setIsOpen(false);
  };

  const hasActiveFilters = Object.values(values).some(value => 
    value !== undefined && value !== null && value !== '' && 
    (Array.isArray(value) ? value.length > 0 : true)
  );

  const getActiveFilterCount = () => {
    return Object.values(values).filter(value => 
      value !== undefined && value !== null && value !== '' && 
      (Array.isArray(value) ? value.length > 0 : true)
    ).length;
  };

  const renderFilterInput = (filter: FilterConfig) => {
    const value = localValues[filter.key];

    switch (filter.type) {
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="">All {filter.label}</option>
            {filter.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label} {option.count !== undefined ? `(${option.count})` : ''}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {filter.options?.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) ? value.includes(option.value) : false}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    const newValues = e.target.checked
                      ? [...currentValues, option.value]
                      : currentValues.filter(v => v !== option.value);
                    handleFilterChange(filter.key, newValues.length > 0 ? newValues : undefined);
                  }}
                  className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {option.label} {option.count !== undefined ? `(${option.count})` : ''}
                </span>
              </label>
            ))}
          </div>
        );

      case 'search':
        return (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleFilterChange(filter.key, e.target.value || undefined)}
              placeholder={filter.placeholder || `Search ${filter.label.toLowerCase()}...`}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        );

      case 'daterange':
        return (
          <div className="space-y-2">
            <input
              type="date"
              value={value?.start || ''}
              onChange={(e) => handleFilterChange(filter.key, {
                ...value,
                start: e.target.value || undefined
              })}
              placeholder="Start date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            <input
              type="date"
              value={value?.end || ''}
              onChange={(e) => handleFilterChange(filter.key, {
                ...value,
                end: e.target.value || undefined
              })}
              placeholder="End date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value ? Number(e.target.value) : undefined)}
            placeholder={filter.placeholder || `Enter ${filter.label.toLowerCase()}...`}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        );

      case 'numberrange':
        return (
          <div className="space-y-2">
            <input
              type="number"
              value={value?.min || ''}
              onChange={(e) => handleFilterChange(filter.key, {
                ...value,
                min: e.target.value ? Number(e.target.value) : undefined
              })}
              placeholder="Min"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            <input
              type="number"
              value={value?.max || ''}
              onChange={(e) => handleFilterChange(filter.key, {
                ...value,
                max: e.target.value ? Number(e.target.value) : undefined
              })}
              placeholder="Max"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
          hasActiveFilters
            ? 'border-amber-500 bg-amber-50 text-amber-700'
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        <Filter className="h-4 w-4" />
        <span>Filters</span>
        {hasActiveFilters && (
          <span className="bg-amber-600 text-white text-xs rounded-full px-2 py-0.5">
            {getActiveFilterCount()}
          </span>
        )}
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Filters</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              {filters.map(filter => (
                <div key={filter.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {filter.label}
                  </label>
                  {renderFilterInput(filter)}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={handleClear}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear All
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  className="px-4 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="mt-2 flex flex-wrap gap-2">
          {Object.entries(values).map(([key, value]) => {
            if (value === undefined || value === null || value === '' || 
                (Array.isArray(value) && value.length === 0)) {
              return null;
            }

            const filter = filters.find(f => f.key === key);
            if (!filter) return null;

            const getDisplayValue = () => {
              if (Array.isArray(value)) {
                return value.join(', ');
              }
              if (typeof value === 'object' && value !== null) {
                return Object.entries(value)
                  .filter(([_, v]) => v !== undefined && v !== '')
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(', ');
              }
              return String(value);
            };

            return (
              <div
                key={key}
                className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm"
              >
                <span className="font-medium">{filter.label}:</span>
                <span>{getDisplayValue()}</span>
                <button
                  onClick={() => {
                    const newValues = { ...values };
                    delete newValues[key];
                    onChange(newValues);
                  }}
                  className="ml-1 p-0.5 hover:bg-amber-200 rounded-full transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
