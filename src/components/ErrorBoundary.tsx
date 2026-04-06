'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ error, errorInfo });

    // In production, send error to logging service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
      // logErrorToService(error, errorInfo);
    }
  }

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[var(--gray-100)] flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full text-center">
            <div className="w-20 h-20 bg-[var(--danger-light)] rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-[var(--danger)]" />
            </div>
            
            <h1 className="text-2xl font-black text-[var(--navy)] mb-3">
              عذراً، حدث خطأ ما
            </h1>
            
            <p className="text-[var(--gray-600)] mb-6">
              نعتذر عن الإزعاج. يمكنك محاولة تحديث الصفحة أو العودة للصفحة الرئيسية.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-[var(--gray-100)] rounded-xl p-4 mb-6 text-right overflow-auto max-h-48">
                <p className="text-sm font-bold text-[var(--danger)] mb-2">
                  {this.state.error.message}
                </p>
                {this.state.errorInfo && (
                  <pre className="text-xs text-[var(--gray-600)] whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={this.handleRefresh}
                className="flex items-center gap-2 px-6 py-3 bg-[var(--teal)] text-white rounded-xl font-bold hover:bg-[var(--teal-dark)] transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                تحديث الصفحة
              </button>
              
              <Link
                href="/"
                onClick={this.handleReset}
                className="flex items-center gap-2 px-6 py-3 bg-[var(--gray-100)] text-[var(--gray-600)] rounded-xl font-bold hover:bg-[var(--gray-200)] transition-colors"
              >
                <Home className="w-5 h-5" />
                الصفحة الرئيسية
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Error boundary for specific sections
export function SectionErrorBoundary({ children, sectionName }: { children: ReactNode; sectionName: string }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="bg-white rounded-[var(--radius)] p-6 shadow-sm border border-[var(--gray-100)] mb-5" dir="rtl">
          <div className="flex items-center gap-3 text-[var(--danger)] mb-3">
            <AlertTriangle className="w-6 h-6" />
            <h3 className="font-bold text-lg">خطأ في تحميل {sectionName}</h3>
          </div>
          <p className="text-[var(--gray-600)] mb-4">
            حدث خطأ أثناء تحميل هذا القسم. يرجى تحديث الصفحة.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--teal)] text-white rounded-lg font-bold hover:bg-[var(--teal-dark)] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            تحديث
          </button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

// Async error handler hook
export function useAsyncError() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((err: unknown) => {
    if (err instanceof Error) {
      setError(err);
    } else {
      setError(new Error(String(err)));
    }
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
}
