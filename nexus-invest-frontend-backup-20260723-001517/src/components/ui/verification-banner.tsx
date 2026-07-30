'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useI18nStore } from '@/stores/i18n-store';
import apiClient from '@/lib/api-client';
import { API_URLS } from '@/lib/constants';

export default function VerificationBanner() {
  const { t } = useI18nStore();
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (!user.email_verified_at) {
          setVisible(true);
        }
      } catch {}
    }
  }, []);

  const handleResend = async () => {
    setResending(true);
    try {
      await apiClient.post(API_URLS.auth.resendOtp);
      toast.success(t('verification.code_sent_toast'));
      router.push('/verification-email');
    } catch {
      toast.error(t('common.error'));
    } finally {
      setResending(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-3">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300">
          <Mail className="h-4 w-4 shrink-0" />
          <span>{t('verification.banner')}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-xs font-medium text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 underline underline-offset-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 inline mr-1 ${resending ? 'animate-spin' : ''}`} />
            {t('verification.resend')}
          </button>
          <button
            onClick={() => setVisible(false)}
            className="text-amber-400 hover:text-amber-600 dark:hover:text-amber-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
