import React, { forwardRef } from 'react';
import { Check, AlertCircle } from 'lucide-react';

export interface FormCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  indeterminate?: boolean;
  description?: string;
}

export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  (
    {
      label,
      error,
      helperText,
      variant = 'default',
      size = 'md',
      indeterminate = false,
      description,
      className = '',
      ...props
    },
    ref
  ) => {
    const checkboxRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => checkboxRef.current!);

    React.useEffect(() => {
      if (checkboxRef.current) {
        checkboxRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6'
    };

    const labelSizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg'
    };

    const variantClasses = {
      default: `rounded border-gray-300 text-amber-600 focus:ring-amber-500 ${error ? 'border-red-500 focus:ring-red-500' : ''}`,
      filled: `rounded border-0 bg-gray-100 text-amber-600 focus:ring-amber-500 ${error ? 'bg-red-100 focus:ring-red-500' : ''}`,
      outlined: `rounded border-2 border-gray-300 text-amber-600 focus:ring-amber-500 ${error ? 'border-red-500 focus:ring-red-500' : ''}`
    };

    const checkboxClasses = `${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

    return (
      <div className="w-full">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              ref={checkboxRef}
              type="checkbox"
              className={checkboxClasses}
              {...props}
            />
          </div>
          
          <div className="ml-3 text-sm">
            {label && (
              <label className={`font-medium text-gray-700 ${labelSizeClasses[size]}`}>
                {label}
                {props.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            
            {description && (
              <p className="text-gray-500 mt-1">{description}</p>
            )}
          </div>
        </div>
        
        {error && (
          <div className="mt-2 flex items-center">
            <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        {helperText && !error && (
          <p className="mt-2 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

FormCheckbox.displayName = 'FormCheckbox';
