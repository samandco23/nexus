import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

import { API_URLS } from './constants';

const apiClient = axios.create({
  baseURL: API_URLS.base,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

const MAX_RETRIES = 2;
const RETRYABLE_STATUSES = [408, 429, 500, 502, 503, 504];

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number };

    if (
      config &&
      !config._retryCount &&
      error.response &&
      RETRYABLE_STATUSES.includes(error.response.status)
    ) {
      config._retryCount = 1;
      return new Promise((resolve) => setTimeout(resolve, 1000)).then(() =>
        apiClient.request(config)
      );
    }

    if (
      config &&
      config._retryCount &&
      config._retryCount < MAX_RETRIES &&
      error.response &&
      RETRYABLE_STATUSES.includes(error.response.status)
    ) {
      config._retryCount += 1;
      const delay = config._retryCount * 1000;
      return new Promise((resolve) => setTimeout(resolve, delay)).then(() =>
        apiClient.request(config)
      );
    }

    if (
      error.response?.status === 401 &&
      error.config?.url !== API_URLS.auth.login &&
      error.config?.url !== API_URLS.auth.register
    ) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/connexion';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
