import React from 'react';
import { AlertCircle, Inbox, RefreshCw } from 'lucide-react';

interface DataStateShellProps {
  isLoading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  onRetry?: () => void;
  children: React.ReactNode;
}

export const DataStateShell: React.FC<DataStateShellProps> = ({
  isLoading = false,
  error = null,
  isEmpty = false,
  emptyTitle = 'No matching records found',
  emptyDescription = 'Adjust your search filters or add a new record to populate this view.',
  emptyActionLabel,
  onEmptyAction,
  onRetry,
  children,
}) => {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden" aria-busy="true">
        <div className="divide-y divide-slate-100">
          {[1, 2, 3, 4].map((row) => (
            <div key={row} className="px-5 py-3.5 flex items-center justify-between gap-4 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-4 bg-slate-100 rounded w-1/4" />
              <div className="h-4 bg-slate-100 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
        <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-slate-900">Unable to load records</h3>
        <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0F2544] rounded-lg hover:bg-[#16345E] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
        <Inbox className="w-8 h-8 text-slate-400 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-slate-900">{emptyTitle}</h3>
        <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">{emptyDescription}</p>
        {emptyActionLabel && onEmptyAction && (
          <button
            type="button"
            onClick={onEmptyAction}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-[#0F2544] rounded-lg hover:bg-[#16345E] transition-colors"
          >
            {emptyActionLabel}
          </button>
        )}
      </div>
    );
  }

  return <>{children}</>;
};
