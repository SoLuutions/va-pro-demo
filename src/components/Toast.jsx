import React, { useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  useEffect(() => {
    toasts.forEach(toast => {
      const timer = setTimeout(() => {
        onDismiss(toast.id);
      }, 5000);
      return () => clearTimeout(timer);
    });
  }, [toasts, onDismiss]);

  if (toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5" />;
      case 'error': return <AlertCircle className="h-5 w-5" />;
      case 'warning': return <AlertTriangle className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  const getColors = (type) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start p-4 rounded-lg border shadow-lg animate-slide-in ${getColors(toast.type)}`}
        >
          <div className="flex-shrink-0">
            {getIcon(toast.type)}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="flex-shrink-0 ml-4 hover:opacity-70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
