import React, { forwardRef } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface FormSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  searchable?: boolean;
  multiple?: boolean;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder = 'Select an option',
      variant = 'default',
      size = 'md',
      searchable = false,
      multiple = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);

    const baseClasses = 'block w-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 appearance-none';
    
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-4 py-4 text-lg'
    };

    const variantClasses = {
      default: `border border-gray-300 rounded-lg bg-white ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}`,
      filled: `border-0 rounded-lg bg-gray-50 ${error ? 'bg-red-50' : 'bg-gray-50'} ${isFocused ? 'bg-white shadow-sm' : ''}`,
      outlined: `border-2 rounded-lg bg-transparent ${error ? 'border-red-500' : isFocused ? 'border-amber-500' : 'border-gray-300'}`
    };

    const selectClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

    const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          <select
            ref={ref}
            className={selectClasses}
            onFocus={handleFocus}
            onBlur={handleBlur}
            multiple={multiple}
            {...props}
          >
            {!multiple && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          
          {!multiple && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </div>
          )}
        </div>
        
        {error && (
          <div className="mt-1 flex items-center">
            <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';
