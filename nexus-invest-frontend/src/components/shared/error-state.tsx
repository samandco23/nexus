'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import GradientButton from '@/components/ui/gradient-button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorState({
  message = 'Une erreur est survenue. Veuillez réessayer.',
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 py-16 px-6 text-center ${className}`}
      role="alert"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      <div className="max-w-sm">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
          Oups !
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
      </div>
      {onRetry && (
        <GradientButton
          variant="secondary"
          size="md"
          iconComponent={RefreshCw}
          onClick={onRetry}
          ariaLabel="Réessayer"
        >
          Réessayer
        </GradientButton>
      )}
    </div>
  );
}
