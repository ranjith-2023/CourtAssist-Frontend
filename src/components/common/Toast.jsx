// src/components/common/Toast.jsx
import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export const ToastContainer = ({ toasts, removeToast }) => {
  useEffect(() => {
    toasts.forEach(toast => {
      const timer = setTimeout(() => {
        removeToast(toast.id);
      }, 5000);

      return () => clearTimeout(timer);
    });
  }, [toasts, removeToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center p-4 rounded-lg shadow-lg border transform transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center flex-1">
            {toast.type === 'success' ? (
              <CheckCircle size={20} className="mr-3 flex-shrink-0" />
            ) : (
              <XCircle size={20} className="mr-3 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

// Helper function to use toast (can be used with context in real app)
export const toast = {
  success: (message) => {},
  error: (message) => {},
};