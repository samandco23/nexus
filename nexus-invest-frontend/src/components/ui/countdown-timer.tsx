'use client';

import { useEffect, useState } from 'react';
import { intervalToDuration } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatFCFA } from '@/lib/currency';

interface CountdownTimerProps {
  targetDate: Date;
  label?: string;
  estimatedAmount?: number;
  onComplete?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(target: Date): TimeLeft {
  const now = new Date();
  if (now >= target) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const diff = intervalToDuration({ start: now, end: target });
  return {
    days: diff.days ?? 0,
    hours: diff.hours ?? 0,
    minutes: diff.minutes ?? 0,
    seconds: diff.seconds ?? 0,
  };
}

function padNumber(n: number): string {
  return n.toString().padStart(2, '0');
}

interface DigitFlapProps {
  digit: string;
}

function DigitFlap({ digit }: DigitFlapProps) {
  const [prevDigit, setPrevDigit] = useState(digit);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (digit !== prevDigit) {
      setFlipping(true);
      const timer = setTimeout(() => {
        setPrevDigit(digit);
        setFlipping(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [digit, prevDigit]);

  return (
    <div
      className={`relative inline-flex items-center justify-center w-10 h-12 sm:w-12 sm:h-14 rounded-lg bg-slate-800 dark:bg-slate-900 text-white font-mono text-xl sm:text-2xl font-bold transition-all duration-300 ${
        flipping ? 'scale-y-[-0.5] opacity-70' : 'scale-y-100 opacity-100'
      }`}
      aria-hidden="true"
    >
      {flipping ? prevDigit : digit}
    </div>
  );
}

function TimeUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex gap-0.5">
        <DigitFlap digit={value[0]} />
        <DigitFlap digit={value[1]} />
      </div>
      <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

export default function CountdownTimer({
  targetDate,
  label,
  estimatedAmount,
  onComplete,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    calculateTimeLeft(targetDate)
  );
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = calculateTimeLeft(targetDate);
      setTimeLeft(remaining);

      if (
        remaining.days === 0 &&
        remaining.hours === 0 &&
        remaining.minutes === 0 &&
        remaining.seconds === 0
      ) {
        setIsComplete(true);
        onComplete?.();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onComplete]);

  if (isComplete) {
    return (
      <div className="flex flex-col items-center gap-2">
        <span className="text-emerald-500 font-semibold text-lg">
          Investissement terminé
        </span>
        {estimatedAmount && (
          <span className="text-emerald-400 font-bold text-xl">
            +{formatFCFA(estimatedAmount)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {label && (
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {label}
        </span>
      )}
      <div className="flex items-center gap-2 sm:gap-3" role="timer" aria-label="Compte à rebours">
        <TimeUnit value={padNumber(timeLeft.days)} label="Jours" />
        <span className="text-2xl font-bold text-slate-500 dark:text-slate-400 mt-[-1.5rem]">
          :
        </span>
        <TimeUnit value={padNumber(timeLeft.hours)} label="Heures" />
        <span className="text-2xl font-bold text-slate-500 dark:text-slate-400 mt-[-1.5rem]">
          :
        </span>
        <TimeUnit value={padNumber(timeLeft.minutes)} label="Minutes" />
        <span className="text-2xl font-bold text-slate-500 dark:text-slate-400 mt-[-1.5rem]">
          :
        </span>
        <TimeUnit value={padNumber(timeLeft.seconds)} label="Secondes" />
      </div>
      {estimatedAmount && (
        <span className="text-sm text-emerald-500 font-semibold">
          Gain estimé : {formatFCFA(estimatedAmount)}
        </span>
      )}
    </div>
  );
}
