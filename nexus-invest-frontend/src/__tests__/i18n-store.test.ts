import { describe, it, expect, beforeEach } from 'vitest';
import { useI18nStore } from '@/stores/i18n-store';

describe('i18n-store', () => {
  beforeEach(() => {
    useI18nStore.setState({
      locale: 'fr',
      currency: 'XAF',
      translations: {},
    });
  });

  it('defaults to French locale and XAF currency', () => {
    const state = useI18nStore.getState();
    expect(state.locale).toBe('fr');
    expect(state.currency).toBe('XAF');
  });

  it('setLocale updates the locale', () => {
    useI18nStore.getState().setLocale('en');
    expect(useI18nStore.getState().locale).toBe('en');
  });

  it('setCurrency updates the currency', () => {
    useI18nStore.getState().setCurrency('USD');
    expect(useI18nStore.getState().currency).toBe('USD');
  });
});
