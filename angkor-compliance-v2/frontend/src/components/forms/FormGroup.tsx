import React from 'react';

export interface FormGroupProps {
  children: React.ReactNode;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
  orientation?: 'vertical' | 'horizontal';
  spacing?: 'sm' | 'md' | 'lg';
}

export const FormGroup: React.FC<FormGroupProps> = ({
  children,
  label,
  description,
  error,
  required = false,
  className = '',
  orientation = 'vertical',
  spacing = 'md'
}) => {
  const spacingClasses = {
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6'
  };

  const orientationClasses = orientation === 'horizontal' 
    ? 'flex flex-col sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4' 
    : spacingClasses[spacing];

  return (
    <div className={`w-full ${orientationClasses} ${className}`}>
      {(label || description) && (
        <div className="flex-1">
          {label && (
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          {description && (
            <p className="text-sm text-gray-500 mb-2">{description}</p>
          )}
        </div>
      )}
      
      <div className={orientation === 'horizontal' ? 'flex-1' : 'w-full'}>
        {children}
      </div>
      
      {error && (
        <div className="flex items-center text-sm text-red-600">
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
