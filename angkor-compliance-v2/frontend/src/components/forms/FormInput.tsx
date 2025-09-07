import React, { forwardRef } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  showPasswordToggle?: boolean;
  isPassword?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      variant = 'default',
      size = 'md',
      showPasswordToggle = false,
      isPassword = false,
      className = '',
      type,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);

    const inputType = isPassword && showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

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

    const inputClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
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
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="text-gray-400">
                {leftIcon}
              </div>
            </div>
          )}
          
          <input
            ref={ref}
            type={inputType}
            className={`${inputClasses} ${leftIcon ? 'pl-10' : ''} ${rightIcon || showPasswordToggle ? 'pr-10' : ''}`}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          
          {(rightIcon || showPasswordToggle) && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {showPasswordToggle && isPassword ? (
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              ) : (
                <div className="text-gray-400">
                  {rightIcon}
                </div>
              )}
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

FormInput.displayName = 'FormInput';
