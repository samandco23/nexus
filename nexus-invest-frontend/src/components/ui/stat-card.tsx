'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import GlassCard from './glass-card';
import { formatFCFA } from '@/lib/currency';

interface StatCardProps {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  trend?: number | null;
  trendLabel?: string;
  isCurrency?: boolean;
  isToken?: boolean;
  suffix?: string;
  className?: string;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  trend = null,
  trendLabel,
  isCurrency = true,
  isToken = false,
  suffix,
  className = '',
}: StatCardProps) {
  const [displayedValue, setDisplayedValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isAnimating) {
          setIsAnimating(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isAnimating]);

  const isStringValue = typeof value === 'string';

  useEffect(() => {
    if (!isAnimating || isStringValue) return;

    const startTime = performance.now();
    const duration = 1500;

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      const current = Math.round(easedProgress * (value as number));

      setDisplayedValue(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, value, isStringValue]);

  const displayText = isStringValue
    ? value
    : isCurrency
    ? formatFCFA(displayedValue)
    : isToken
    ? `${displayedValue.toLocaleString('fr-FR')} tokens`
    : suffix
    ? `${displayedValue.toLocaleString('fr-FR')} ${suffix}`
    : displayedValue.toLocaleString('fr-FR');

  const TrendIcon =
    trend === null ? Minus : trend > 0 ? TrendingUp : TrendingDown;
  const trendColor =
    trend === null
      ? 'text-slate-400'
      : trend > 0
      ? 'text-emerald-500'
      : 'text-red-500';

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
    >
      <GlassCard variant="default" padding="md" className={className}>
        <div ref={ref} className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {label}
            </span>
            {Icon && (
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.1 }}
                transition={{ duration: 0.4 }}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40"
              >
                <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </motion.div>
            )}
          </div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {displayText}
          </span>
          {trend !== null && (
            <div className="flex items-center gap-1.5 text-sm">
              <TrendIcon className={`h-4 w-4 ${trendColor}`} />
              <span className={trendColor}>
                {trend > 0 ? '+' : ''}
                {trend}%
              </span>
              {trendLabel && (
                <span className="text-slate-400 dark:text-slate-500">
                  {trendLabel}
                </span>
              )}
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
