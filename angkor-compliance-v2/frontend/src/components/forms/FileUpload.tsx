import React, { useRef, useState } from 'react';
import { Upload, X, File, Image, FileText, AlertCircle, CheckCircle } from 'lucide-react';

export interface FileUploadProps {
  label?: string;
  error?: string;
  helperText?: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
  onFileSelect?: (files: File[]) => void;
  onFileRemove?: (file: File) => void;
  files?: File[];
  disabled?: boolean;
  variant?: 'default' | 'drag-drop' | 'button';
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  error,
  helperText,
  accept,
  multiple = false,
  maxSize = 10, // 10MB default
  maxFiles = 5,
  onFileSelect,
  onFileRemove,
  files = [],
  disabled = false,
  variant = 'default',
  className = ''
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image;
    if (file.type.includes('pdf') || file.type.includes('document')) return FileText;
    return File;
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }
    if (accept && !accept.split(',').some(type => {
      const trimmedType = type.trim();
      if (trimmedType.startsWith('.')) {
        return file.name.toLowerCase().endsWith(trimmedType.toLowerCase());
      }
      return file.type.match(trimmedType.replace('*', '.*'));
    })) {
      return `File type not allowed. Accepted types: ${accept}`;
    }
    return null;
  };

  const handleFiles = (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const errors: string[] = [];
    const validFiles: File[] = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setUploadErrors(errors);
    } else {
      setUploadErrors([]);
    }

    if (validFiles.length > 0) {
      const totalFiles = files.length + validFiles.length;
      if (totalFiles > maxFiles) {
        setUploadErrors([`Maximum ${maxFiles} files allowed`]);
        return;
      }
      onFileSelect?.(validFiles);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (file: File) => {
    onFileRemove?.(file);
    setUploadErrors([]);
  };

  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const renderFileList = () => {
    if (files.length === 0) return null;

    return (
      <div className="mt-4 space-y-2">
        {files.map((file, index) => {
          const Icon = getFileIcon(file);
          return (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Icon className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(file)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  const renderUploadArea = () => {
    if (variant === 'button') {
      return (
        <button
          type="button"
          onClick={openFileDialog}
          disabled={disabled}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="h-4 w-4 mr-2" />
          Choose Files
        </button>
      );
    }

    if (variant === 'drag-drop') {
      return (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-amber-500 bg-amber-50'
              : error
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileInput}
            className="hidden"
            disabled={disabled}
          />
          
          <Upload className={`mx-auto h-12 w-12 ${dragActive ? 'text-amber-500' : 'text-gray-400'}`} />
          
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-900">
              {dragActive ? 'Drop files here' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {accept && `Accepted formats: ${accept}`}
              {maxSize && ` • Max size: ${maxSize}MB`}
              {maxFiles > 1 && ` • Max files: ${maxFiles}`}
            </p>
          </div>
        </div>
      );
    }

    // Default variant
    return (
      <div className="flex items-center space-x-4">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
          disabled={disabled}
        />
      </div>
    );
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          <span className="text-red-500 ml-1">*</span>
        </label>
      )}
      
      {renderUploadArea()}
      
      {renderFileList()}
      
      {(error || uploadErrors.length > 0) && (
        <div className="mt-2 space-y-1">
          {error && (
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {uploadErrors.map((uploadError, index) => (
            <div key={index} className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
              <p className="text-sm text-red-600">{uploadError}</p>
            </div>
          ))}
        </div>
      )}
      
      {helperText && !error && uploadErrors.length === 0 && (
        <p className="mt-2 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};
