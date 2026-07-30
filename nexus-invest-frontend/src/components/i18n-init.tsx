'use client';

import { useEffect } from 'react';
import { useI18nStore } from '@/stores/i18n-store';
import { setCurrencyGetter } from '@/lib/currency';

export default function I18nInit() {
  const currency = useI18nStore((s) => s.currency);
  const locale = useI18nStore((s) => s.locale);

  useEffect(() => {
    setCurrencyGetter(() => useI18nStore.getState().currency);
    document.documentElement.lang = locale;
  }, [locale, currency]);

  return null;
}
