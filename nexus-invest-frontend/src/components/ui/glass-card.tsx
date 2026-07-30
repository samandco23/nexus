'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

type GlassVariant = 'default' | 'highlight' | 'dark';
type PaddingSize = 'sm' | 'md' | 'lg';

interface GlassCardProps {
  children: ReactNode;
  variant?: GlassVariant;
  padding?: PaddingSize;
  hover?: boolean;
  glow?: boolean;
  tilt?: boolean;
  className?: string;
}

const variantStyles: Record<GlassVariant, string> = {
  default:
    'bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-700/30',
  highlight:
    'bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/40 dark:border-emerald-800/30',
  dark: 'bg-slate-900/80 dark:bg-slate-950/80 border border-slate-700/30 dark:border-slate-800/30 text-white',
};

const paddingStyles: Record<PaddingSize, string> = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export default function GlassCard({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  glow = false,
  tilt = false,
  className = '',
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={tilt ? { scale: 1.02 } : hover ? { scale: 1.02 } : undefined}
      transition={tilt || hover ? { type: 'spring', stiffness: 300, damping: 15 } : undefined}
      className={`rounded-2xl backdrop-blur-xl transition-all duration-500 ease-out
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${hover && !tilt ? 'cursor-pointer' : ''}
        ${glow ? 'shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'shadow-md'}
        ${className}`}
      role="region"
      aria-live="polite"
    >
      {children}
    </motion.div>
  );
}
