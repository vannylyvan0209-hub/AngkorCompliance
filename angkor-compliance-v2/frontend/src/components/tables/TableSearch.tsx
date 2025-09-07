import React, { useState, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';

export interface SearchConfig {
  placeholder?: string;
  debounceMs?: number;
  searchFields?: string[];
  caseSensitive?: boolean;
  exactMatch?: boolean;
}

export interface TableSearchProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  config?: SearchConfig;
  showFilters?: boolean;
  onToggleFilters?: () => void;
  className?: string;
}

export const TableSearch: React.FC<TableSearchProps> = ({
  value,
  onChange,
  onClear,
  config = {},
  showFilters = false,
  onToggleFilters,
  className = ''
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  const {
    placeholder = 'Search...',
    debounceMs = 300,
    searchFields = [],
    caseSensitive = false,
    exactMatch = false
  } = config;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, value, onChange, debounceMs]);

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleClear = () => {
    setLocalValue('');
    onClear();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onChange(localValue);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className={`h-4 w-4 ${isFocused ? 'text-amber-500' : 'text-gray-400'}`} />
        </div>
        
        <input
          type="text"
          value={localValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`block w-full pl-10 pr-20 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
            isFocused
              ? 'border-amber-500'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          {localValue && (
            <button
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          {showFilters && onToggleFilters && (
            <button
              onClick={onToggleFilters}
              className="ml-1 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Toggle filters"
            >
              <Filter className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Info */}
      {localValue && (
        <div className="mt-1 text-xs text-gray-500">
          {searchFields.length > 0 && (
            <span>Searching in: {searchFields.join(', ')}</span>
          )}
          {caseSensitive && <span className="ml-2">Case sensitive</span>}
          {exactMatch && <span className="ml-2">Exact match</span>}
        </div>
      )}
    </div>
  );
};
