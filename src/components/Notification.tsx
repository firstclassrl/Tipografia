import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Notification: React.FC<NotificationProps> = ({
  message,
  type,
  isVisible,
  onClose,
  duration = 3000
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white border-green-400';
      case 'error':
        return 'bg-red-500 text-white border-red-400';
      case 'warning':
        return 'bg-yellow-500 text-black border-yellow-400';
      case 'info':
        return 'bg-blue-500 text-white border-blue-400';
      default:
        return 'bg-gray-500 text-white border-gray-400';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'error':
        return <X className="h-5 w-5" />;
      default:
        return <CheckCircle className="h-5 w-5" />;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] animate-in slide-in-from-bottom-2 fade-in">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${getTypeStyles()}`}>
        {getIcon()}
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 hover:opacity-70 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};