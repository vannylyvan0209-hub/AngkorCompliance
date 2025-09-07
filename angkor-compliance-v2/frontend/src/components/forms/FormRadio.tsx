import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

export interface RadioOption {
  value: string | number;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface FormRadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: RadioOption[];
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'vertical' | 'horizontal';
  name: string;
}

export const FormRadio = forwardRef<HTMLInputElement, FormRadioProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      variant = 'default',
      size = 'md',
      orientation = 'vertical',
      name,
      className = '',
      ...props
    },
    ref
  ) => {
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
      default: `border-gray-300 text-amber-600 focus:ring-amber-500 ${error ? 'border-red-500 focus:ring-red-500' : ''}`,
      filled: `border-0 bg-gray-100 text-amber-600 focus:ring-amber-500 ${error ? 'bg-red-100 focus:ring-red-500' : ''}`,
      outlined: `border-2 border-gray-300 text-amber-600 focus:ring-amber-500 ${error ? 'border-red-500 focus:ring-red-500' : ''}`
    };

    const radioClasses = `${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

    const containerClasses = orientation === 'horizontal' 
      ? 'flex flex-wrap gap-4' 
      : 'space-y-3';

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className={containerClasses}>
          {options.map((option) => (
            <div key={option.value} className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  ref={ref}
                  type="radio"
                  name={name}
                  value={option.value}
                  disabled={option.disabled}
                  className={radioClasses}
                  {...props}
                />
              </div>
              
              <div className="ml-3 text-sm">
                <label className={`font-medium text-gray-700 ${labelSizeClasses[size]} ${option.disabled ? 'text-gray-400' : ''}`}>
                  {option.label}
                </label>
                
                {option.description && (
                  <p className={`text-gray-500 mt-1 ${option.disabled ? 'text-gray-400' : ''}`}>
                    {option.description}
                  </p>
                )}
              </div>
            </div>
          ))}
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

FormRadio.displayName = 'FormRadio';
