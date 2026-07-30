'use client';

import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import GradientButton from '@/components/ui/gradient-button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 py-16 px-6 text-center ${className}`}
      role="status"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
        <Icon className="h-8 w-8 text-slate-400 dark:text-slate-500" />
      </div>
      <div className="max-w-sm">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
          {title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
      {actionLabel && onAction && (
        <GradientButton
          variant="primary"
          size="md"
          onClick={onAction}
          ariaLabel={actionLabel}
        >
          {actionLabel}
        </GradientButton>
      )}
    </div>
  );
}
