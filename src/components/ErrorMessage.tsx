import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div 
      className="max-w-xl mx-auto my-8 p-6 bg-red-50 border border-red-200 rounded-2xl shadow-sm text-center" 
      id="error-message-card"
    >
      <div className="inline-flex p-3 bg-red-100 rounded-full text-red-600 mb-4" id="error-message-icon-wrapper">
        <AlertTriangle className="h-6 w-6" id="error-message-icon" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2" id="error-message-title">Something went wrong</h3>
      <p className="text-sm text-gray-600 mb-6 leading-relaxed" id="error-message-text">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-medium text-sm rounded-xl shadow-sm transition-all duration-150"
          id="error-message-retry-btn"
        >
          <RefreshCw className="h-4 w-4 animate-spin-hover" />
          Try Again
        </button>
      )}
    </div>
  );
};
