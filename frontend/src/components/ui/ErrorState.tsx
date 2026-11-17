import { type ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  action?: ReactNode;
}

export function ErrorState({
  message = 'Something went wrong',
  onRetry,
  action,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50 px-6 py-12 text-center">
      <AlertCircle className="mb-3 h-10 w-10 text-red-400" />
      <h3 className="text-base font-semibold text-red-700">{message}</h3>
      <p className="mt-1 text-sm text-red-500">Please try again or contact support if the issue persists.</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      )}
      {action}
    </div>
  );
}
