import React, { forwardRef, useState } from 'react';
import { Calendar, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string;
  error?: string;
  helperText?: string;
  value?: Date | string;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  showCalendar?: boolean;
  minDate?: Date;
  maxDate?: Date;
  format?: 'date' | 'datetime-local' | 'time';
  disabledDates?: Date[];
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      label,
      error,
      helperText,
      value,
      onChange,
      placeholder = 'Select date',
      variant = 'default',
      size = 'md',
      showCalendar = true,
      minDate,
      maxDate,
      format = 'date',
      disabledDates = [],
      className = '',
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const baseClasses = 'block w-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500';
    
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-4 py-4 text-lg'
    };

    const variantClasses = {
      default: `border border-gray-300 rounded-lg bg-white ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}`,
      filled: `border-0 rounded-lg bg-gray-50 ${error ? 'bg-red-50' : 'bg-gray-50'}`,
      outlined: `border-2 rounded-lg bg-transparent ${error ? 'border-red-500' : 'border-gray-300'}`
    };

    const inputClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

    const formatDate = (date: Date | string): string => {
      if (!date) return '';
      const d = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(d.getTime())) return '';
      
      switch (format) {
        case 'datetime-local':
          return d.toISOString().slice(0, 16);
        case 'time':
          return d.toTimeString().slice(0, 5);
        default:
          return d.toISOString().slice(0, 10);
      }
    };

    const parseDate = (dateString: string): Date | null => {
      if (!dateString) return null;
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const date = parseDate(e.target.value);
      onChange?.(date);
    };

    const handleCalendarDateSelect = (date: Date) => {
      onChange?.(date);
      setIsOpen(false);
    };

    const isDateDisabled = (date: Date): boolean => {
      if (minDate && date < minDate) return true;
      if (maxDate && date > maxDate) return true;
      return disabledDates.some(disabledDate => 
        date.toDateString() === disabledDate.toDateString()
      );
    };

    const isDateSelected = (date: Date): boolean => {
      if (!value) return false;
      const selectedDate = typeof value === 'string' ? new Date(value) : value;
      return date.toDateString() === selectedDate.toDateString();
    };

    const isToday = (date: Date): boolean => {
      const today = new Date();
      return date.toDateString() === today.toDateString();
    };

    const getDaysInMonth = (date: Date): Date[] => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const days: Date[] = [];

      // Add days from previous month
      const startDay = firstDay.getDay();
      for (let i = startDay - 1; i >= 0; i--) {
        days.push(new Date(year, month, -i));
      }

      // Add days from current month
      for (let day = 1; day <= lastDay.getDate(); day++) {
        days.push(new Date(year, month, day));
      }

      // Add days from next month to fill the grid
      const remainingDays = 42 - days.length; // 6 weeks * 7 days
      for (let day = 1; day <= remainingDays; day++) {
        days.push(new Date(year, month + 1, day));
      }

      return days;
    };

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const renderCalendar = () => {
      if (!showCalendar || !isOpen) return null;

      const days = getDaysInMonth(currentMonth);
      const currentMonthNum = currentMonth.getMonth();

      return (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <h3 className="text-sm font-medium text-gray-900">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              
              <button
                type="button"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-xs font-medium text-gray-500 text-center py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const isCurrentMonth = day.getMonth() === currentMonthNum;
                const isDisabled = isDateDisabled(day);
                const isSelected = isDateSelected(day);
                const isTodayDate = isToday(day);

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => !isDisabled && handleCalendarDateSelect(day)}
                    disabled={isDisabled}
                    className={`
                      h-8 w-8 text-xs rounded transition-colors
                      ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                      ${isSelected ? 'bg-amber-500 text-white' : 'hover:bg-gray-100'}
                      ${isTodayDate && !isSelected ? 'bg-amber-100 text-amber-700' : ''}
                      ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="w-full relative">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          <input
            ref={ref}
            type={format}
            value={formatDate(value)}
            onChange={handleInputChange}
            placeholder={placeholder}
            className={`${inputClasses} ${showCalendar ? 'pr-10' : ''}`}
            {...props}
          />
          
          {showCalendar && (
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
            >
              <Calendar className="h-5 w-5 text-gray-400" />
            </button>
          )}
        </div>
        
        {renderCalendar()}
        
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

DatePicker.displayName = 'DatePicker';
