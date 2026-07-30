import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale, CurrencyCode } from '@/lib/i18n';
import { t as translate } from '@/lib/i18n';

interface I18nState {
  locale: Locale;
  currency: CurrencyCode;
  setLocale: (locale: Locale) => void;
  setCurrency: (currency: CurrencyCode) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set, get) => ({
      locale: 'fr',
      currency: 'XAF',
      setLocale: (locale: Locale) => {
        set({ locale });
        if (typeof window !== 'undefined') {
          document.documentElement.lang = locale;
        }
      },
      setCurrency: (currency: CurrencyCode) => set({ currency }),
      t: (key: string, params?: Record<string, string | number>) =>
        translate(get().locale, key, params),
    }),
    {
      name: 'nexus-i18n-store',
      partialize: (state) => ({ locale: state.locale, currency: state.currency }),
    }
  )
);
