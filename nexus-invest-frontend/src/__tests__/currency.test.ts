import { describe, it, expect } from 'vitest';
import { formatCurrency, convertCurrency } from '@/lib/i18n/index';

describe('currency conversion', () => {
  it('formatCurrency formats XAF correctly', () => {
    const result = formatCurrency(1000, 'XAF');
    expect(result).toBe('1 000 FCFA');
  });

  it('formatCurrency formats USD correctly', () => {
    const result = formatCurrency(600, 'USD');
    expect(result).toContain('$');
    expect(result).toContain('1');
  });

  it('convertCurrency converts XAF to EUR', () => {
    const result = convertCurrency(655.957, 'EUR');
    expect(result).toBeCloseTo(1, 0);
  });
});
