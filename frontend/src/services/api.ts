import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Sends HttpOnly cookies on every request
});

let isRefreshing = false;
let failedQueue: { resolve: () => void; reject: (e: Error) => void }[] = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve();
  });
  failedQueue = [];
};

// Auto-refresh on 401 using cookie-based refresh token
api.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (err) => {
    const original = err.config;

    // Don't retry for the refresh endpoint itself, or already-retried requests
    if (
      err.response?.status !== 401 ||
      original._retry ||
      (original.url as string | undefined)?.includes('/auth/refresh')
    ) {
      return Promise.reject(err);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve: () => resolve(api(original)), reject });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      // Refresh token is in an HttpOnly cookie — no body needed
      await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
      processQueue(null);
      return api(original);
    } catch (refreshErr) {
      processQueue(refreshErr as Error);
      localStorage.removeItem('edustack_auth');
      // Redirect to the correct login page based on current URL
      const path = window.location.pathname;
      const isAdminArea = path.startsWith('/admin');
      const slugMatch = path.match(/^\/([^/]+)\//);
      const slug = !isAdminArea && slugMatch ? slugMatch[1] : null;
      window.location.href = isAdminArea
        ? '/admin/login'
        : slug
          ? `/${slug}/login`
          : '/register';
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
