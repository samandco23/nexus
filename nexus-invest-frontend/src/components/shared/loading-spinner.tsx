'use client';

import { Loader2 } from 'lucide-react';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  centered?: boolean;
  label?: string;
  className?: string;
}

const sizeStyles: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export default function LoadingSpinner({
  size = 'md',
  centered = false,
  label,
  className = '',
}: LoadingSpinnerProps) {
  const spinner = (
    <div
      className={`flex flex-col items-center gap-3 ${className}`}
      role="status"
      aria-label={label || 'Chargement en cours'}
    >
      <Loader2
        className={`animate-spin text-emerald-500 ${sizeStyles[size]}`}
      />
      {label && (
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {label}
        </span>
      )}
    </div>
  );

  if (centered) {
    return (
      <div className="flex items-center justify-center w-full min-h-[200px]">
        {spinner}
      </div>
    );
  }

  return spinner;
}
