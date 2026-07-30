'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

declare global {
  interface Window {
    grecaptcha?: {
      render: (container: string | HTMLElement, options: {
        sitekey: string;
        callback?: (token: string) => void;
        'expired-callback'?: () => void;
        'error-callback'?: () => void;
        theme?: 'light' | 'dark';
        size?: 'normal' | 'compact' | 'invisible';
      }) => number;
      reset: (widgetId: number) => void;
      getResponse: (widgetId: number) => string;
    };
    onRecaptchaLoad?: () => void;
  }
}

interface Props {
  sitekey: string;
  onChange: (token: string | null) => void;
}

export default function ReCaptchaInline({ sitekey, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);
  const [ready, setReady] = useState(false);

  const renderCaptcha = useCallback(() => {
    if (!containerRef.current || !window.grecaptcha) return;
    if (widgetId.current !== null) return;

    const id = window.grecaptcha.render(containerRef.current, {
      sitekey,
      callback: (token: string) => onChange(token),
      'expired-callback': () => onChange(null),
      'error-callback': () => onChange(null),
      theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
    });
    widgetId.current = id;
    setReady(true);
  }, [sitekey, onChange]);

  useEffect(() => {
    if (window.grecaptcha) {
      renderCaptcha();
      return;
    }

    window.onRecaptchaLoad = renderCaptcha;

    if (!document.querySelector('script[src*="recaptcha/api.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    return () => {
      window.onRecaptchaLoad = undefined;
    };
  }, [renderCaptcha]);

  return (
    <div className="flex justify-center min-h-[78px] items-center">
      <div ref={containerRef} />
      {!ready && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Chargement du CAPTCHA...
        </div>
      )}
    </div>
  );
}
