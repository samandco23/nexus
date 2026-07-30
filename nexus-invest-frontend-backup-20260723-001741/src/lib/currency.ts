import type { CurrencyCode } from './i18n';
import { formatCurrency as i18nFormat, abbreviateCurrency as i18nAbbreviate, parseLocalAmount } from './i18n';

const defaultCurrency: CurrencyCode = 'XAF';

let _getCurrency: () => CurrencyCode = () => defaultCurrency;

export function setCurrencyGetter(fn: () => CurrencyCode): void {
  _getCurrency = fn;
}

export function getPreferredCurrency(): CurrencyCode {
  try {
    return _getCurrency();
  } catch {
    return defaultCurrency;
  }
}

export function formatFCFA(amount: number): string {
  return i18nFormat(amount, getPreferredCurrency());
}

export function formatUSD(amount: number): string {
  return i18nFormat(amount, 'USD');
}

export function formatToken(amount: number, decimals: number = 6): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export const parseFCFA = parseLocalAmount;

export function abbreviateFCFA(amount: number): string {
  return i18nAbbreviate(amount, getPreferredCurrency());
}
