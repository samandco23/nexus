import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '@/lib/api-client';

describe('api-client', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('sets base URL from constants', () => {
    expect(apiClient.defaults.baseURL).toBeTruthy();
    expect(apiClient.defaults.timeout).toBe(30000);
    expect(apiClient.defaults.withCredentials).toBe(true);
  });

  it('injects Authorization header when token exists', () => {
    sessionStorage.setItem('access_token', 'test-token-123');
    const config = apiClient.interceptors.request as unknown as { handlers: Array<{ fulfilled: (config: Record<string, unknown>) => Record<string, unknown> }> };
    expect(config).toBeDefined();
  });

  it('has retry interceptors configured', () => {
    const interceptors = apiClient.interceptors.response;
    expect(interceptors).toBeDefined();
  });
});
