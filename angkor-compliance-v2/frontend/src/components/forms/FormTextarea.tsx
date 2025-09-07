import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  maxLength?: number;
  showCharCount?: boolean;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      label,
      error,
      helperText,
      variant = 'default',
      size = 'md',
      resize = 'vertical',
      maxLength,
      showCharCount = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [charCount, setCharCount] = React.useState(0);

    const baseClasses = 'block w-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500';
    
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

    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize'
    };

    const textareaClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${resizeClasses[resize]} ${className}`;

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (maxLength) {
        setCharCount(e.target.value.length);
      }
      props.onChange?.(e);
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
          <textarea
            ref={ref}
            className={textareaClasses}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            maxLength={maxLength}
            {...props}
          />
        </div>
        
        {(showCharCount || maxLength) && (
          <div className="mt-1 flex justify-between items-center">
            {error ? (
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            ) : helperText ? (
              <p className="text-sm text-gray-500">{helperText}</p>
            ) : (
              <div />
            )}
            
            {maxLength && (
              <p className={`text-sm ${charCount > maxLength * 0.9 ? 'text-red-500' : 'text-gray-500'}`}>
                {charCount}/{maxLength}
              </p>
            )}
          </div>
        )}
        
        {error && !showCharCount && !maxLength && (
          <div className="mt-1 flex items-center">
            <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        {helperText && !error && !showCharCount && !maxLength && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';
