import React from 'react';
import { CheckCircle, AlertTriangle, Info, XCircle, AlertCircle } from 'lucide-react';
import Modal from './Modal';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  buttonText?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const InfoModal: React.FC<InfoModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  buttonText = 'OK',
  size = 'sm',
  showIcon = true
}) => {
  const getIcon = () => {
    if (!showIcon) return null;

    switch (type) {
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-8 h-8 text-yellow-600" />;
      case 'error':
        return <XCircle className="w-8 h-8 text-red-600" />;
      default:
        return <Info className="w-8 h-8 text-blue-600" />;
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500';
      case 'error':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
      default:
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      showCloseButton={false}
    >
      <div className="text-center">
        {/* Icon */}
        {showIcon && (
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {title}
        </h3>

        {/* Message */}
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          {message}
        </p>

        {/* Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className={`px-6 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${getButtonClass()}`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default InfoModal;
