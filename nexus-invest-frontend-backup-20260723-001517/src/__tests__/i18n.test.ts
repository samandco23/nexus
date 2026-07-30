import { describe, it, expect } from 'vitest';
import { t, getLocaleFromCurrency, getCurrencyForLocale } from '@/lib/i18n/index';

describe('i18n engine', () => {
  it('returns French text for fr locale', () => {
    const result = t('fr', 'app.name');
    expect(result).toBe('NexusCoin');
  });

  it('returns English text for en locale', () => {
    const result = t('en', 'app.name');
    expect(result).toBe('NexusCoin');
  });

  it('falls back to French for missing keys', () => {
    const result = t('en', 'nonexistent.key');
    expect(result).toBe('nonexistent.key');
  });

  it('interpolates params correctly', () => {
    const result = t('fr', 'invest.duration_days', { days: '30' });
    expect(result).toContain('30');
  });

  it('getLocaleFromCurrency returns correct locale', () => {
    expect(getLocaleFromCurrency('XAF')).toBe('fr');
    expect(getLocaleFromCurrency('USD')).toBe('en');
  });

  it('getCurrencyForLocale returns correct currency', () => {
    expect(getCurrencyForLocale('fr')).toBe('XAF');
    expect(getCurrencyForLocale('en')).toBe('USD');
  });
});
