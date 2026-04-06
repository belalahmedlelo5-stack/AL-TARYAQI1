'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast } from '@/types';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type'], duration?: number) => void;
  hideToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const ToastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const ToastStyles = {
  success: 'bg-[var(--success)]',
  error: 'bg-[var(--danger)]',
  warning: 'bg-[var(--warning)]',
  info: 'bg-[var(--navy)]',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((
    message: string, 
    type: Toast['type'] = 'info', 
    duration = 3500
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, message, type, duration };
    
    setToasts((prev) => [...prev, newToast]);

    // Auto-hide toast after duration
    if (duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, duration);
    }
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const value: ToastContextType = {
    toasts,
    showToast,
    hideToast,
    clearToasts,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-7 left-7 z-[9999] flex flex-col gap-3" dir="rtl">
        {toasts.map((toast) => {
          const Icon = ToastIcons[toast.type];
          return (
            <div
              key={toast.id}
              className={`
                ${ToastStyles[toast.type]} 
                text-white px-5 py-3.5 rounded-xl 
                shadow-lg flex items-center gap-2.5 
                animate-toast-in min-w-[280px]
              `}
              role="alert"
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-bold text-base flex-1">{toast.message}</span>
              <button
                onClick={() => hideToast(toast.id)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

// Custom hook to use toast context
export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Standalone toast function for use outside components
let toastCallback: ((message: string, type?: Toast['type'], duration?: number) => void) | null = null;

export function setToastCallback(callback: typeof toastCallback) {
  toastCallback = callback;
}

export function toast(message: string, type?: Toast['type'], duration?: number) {
  if (toastCallback) {
    toastCallback(message, type, duration);
  }
}
