import fr from './fr';
import en from './en';
import es from './es';

export type Locale = 'fr' | 'en' | 'es';

const translations: Record<Locale, Record<string, string>> = { fr, en, es };

export function t(locale: Locale, key: string, params?: Record<string, string | number>): string {
  let str = translations[locale]?.[key] ?? translations.fr?.[key] ?? key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      str = str.replace(`{${k}}`, String(v));
    });
  }
  return str;
}

export type CurrencyCode = 'XAF' | 'USD' | 'EUR' | 'GBP';

export const CURRENCIES: { code: CurrencyCode; labelKey: string; symbol: string; locale: Intl.LocalesArgument }[] = [
  { code: 'XAF', labelKey: 'currency.xaf', symbol: 'FCFA', locale: 'fr-FR' },
  { code: 'USD', labelKey: 'currency.usd', symbol: '$', locale: 'en-US' },
  { code: 'EUR', labelKey: 'currency.eur', symbol: '€', locale: 'de-DE' },
  { code: 'GBP', labelKey: 'currency.gbp', symbol: '£', locale: 'en-GB' },
];

export const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  XAF: 1,
  EUR: 1 / 655.957,
  USD: 1 / 600,
  GBP: 1 / 700,
};

export function convertCurrency(amountInXAF: number, target: CurrencyCode): number {
  if (target === 'XAF') return amountInXAF;
  return amountInXAF * EXCHANGE_RATES[target];
}

export function formatCurrency(amountInXAF: number, target: CurrencyCode): string {
  const converted = convertCurrency(amountInXAF, target);
  if (target === 'XAF') {
    const parts = Math.round(converted).toString().split('');
    const formatted: string[] = [];
    let count = 0;
    for (let i = parts.length - 1; i >= 0; i--) {
      count++;
      formatted.unshift(parts[i]);
      if (count % 3 === 0 && i !== 0) formatted.unshift(' ');
    }
    return `${formatted.join('')} FCFA`;
  }
  const currencyInfo = CURRENCIES.find((c) => c.code === target);
  const locale = currencyInfo?.locale ?? 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: target,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(converted);
}

export function abbreviateCurrency(amountInXAF: number, target: CurrencyCode): string {
  const converted = convertCurrency(amountInXAF, target);
  const currencyInfo = CURRENCIES.find((c) => c.code === target);
  const sym = currencyInfo?.symbol ?? (target === 'XAF' ? 'FCFA' : target);
  if (converted >= 1_000_000) {
    return `${(converted / 1_000_000).toFixed(1).replace('.0', '')} M ${sym}`;
  }
  if (converted >= 1_000) {
    return `${(converted / 1_000).toFixed(1).replace('.0', '')} K ${sym}`;
  }
  return formatCurrency(amountInXAF, target);
}

export function parseLocalAmount(value: string): number {
  const cleaned = value.replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
}

export function getLocaleFromCurrency(currency: CurrencyCode): Locale {
  switch (currency) {
    case 'XAF': return 'fr';
    case 'USD': return 'en';
    case 'EUR': return 'es';
    case 'GBP': return 'en';
  }
}

export function getCurrencyForLocale(locale: Locale): CurrencyCode {
  switch (locale) {
    case 'fr': return 'XAF';
    case 'en': return 'USD';
    case 'es': return 'EUR';
  }
}
