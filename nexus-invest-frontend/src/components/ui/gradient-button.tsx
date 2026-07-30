'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'gold' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';
type IconPosition = 'left' | 'right' | 'only';

interface GradientButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconPosition?: IconPosition;
  iconComponent?: LucideIcon;
  loading?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  shimmer?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  ariaLabel?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg',
  secondary:
    'bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-900 dark:from-slate-800 dark:to-slate-700 dark:text-slate-100 dark:hover:from-slate-700 dark:hover:to-slate-600',
  gold: 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white shadow-md hover:shadow-lg',
  danger:
    'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-md hover:shadow-lg',
  ghost:
    'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
  xl: 'px-8 py-4 text-lg gap-3',
};

const iconSizeStyles: Record<ButtonSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
  xl: 'h-5 w-5',
};

export default function GradientButton({
  children,
  variant = 'primary',
  size = 'md',
  iconPosition = 'left',
  iconComponent: Icon,
  loading = false,
  fullWidth = false,
  disabled = false,
  type = 'button',
  shimmer = true,
  onClick,
  className = '',
  ariaLabel,
}: GradientButtonProps) {
  const iconClasses = `${iconSizeStyles[size]} ${loading ? 'animate-spin' : ''}`;
  const IconComponent = loading ? Loader2 : Icon;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      className={`
        relative overflow-hidden inline-flex items-center justify-center font-semibold rounded-xl
        transition-all duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${variant === 'primary' || variant === 'gold' ? 'shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30' : ''}
        ${className}
      `}
    >
      {shimmer && (variant === 'primary' || variant === 'gold' || variant === 'danger') && !disabled && (
        <motion.div
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent"
          animate={{ x: ['100%', '-100%'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', delay: 1 }}
        />
      )}

      {loading && !Icon && iconPosition !== 'only' ? (
        <Loader2 className={iconClasses} aria-hidden="true" />
      ) : null}

      {IconComponent && iconPosition === 'left' && !loading ? (
        <IconComponent className={iconClasses} aria-hidden="true" />
      ) : null}

      {IconComponent && iconPosition === 'right' && !loading ? null : null}

      {iconPosition !== 'only' ? (
        <span className="relative z-10">{children}</span>
      ) : IconComponent && !loading ? (
        <IconComponent className={iconClasses} aria-hidden="true" />
      ) : loading ? (
        <Loader2 className={iconClasses} aria-hidden="true" />
      ) : null}

      {IconComponent && iconPosition === 'right' && !loading ? (
        <IconComponent className={iconClasses} aria-hidden="true" />
      ) : null}
    </motion.button>
  );
}
