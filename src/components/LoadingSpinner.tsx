import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  fullPage?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading properties...', 
  fullPage = false 
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center" id="loading-spinner-container">
      <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mb-4" id="loading-spinner-icon" />
      <p className="text-gray-600 font-medium text-sm animate-pulse">{message}</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50/50" id="loading-spinner-fullpage">
        {content}
      </div>
    );
  }

  return content;
};
