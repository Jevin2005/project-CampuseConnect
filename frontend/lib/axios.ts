/**
 * Axios instance + interceptors
 * Spec: authentication.md § AXIOS INSTANCE + INTERCEPTOR
 *
 * - withCredentials: true  → sends HTTP-only refresh-token cookie automatically
 * - Request interceptor   → attaches Bearer token from Zustand memory store
 * - Response interceptor  → on 401, silently refresh and retry once; on fail clear auth
 */

import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000",
  withCredentials: true, // needed for HTTP-only refresh cookie
});

/* ── Request: attach access token ───────────────────────────────── */
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ── Response: auto-refresh on 401 ─────────────────────────────── */
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Use a plain axios call (not the intercepted `api`) to avoid loops
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = data as { accessToken: string };
        // Restore token in store; user data already there from previous setAuth
        useAuthStore.getState().setAuth(
          accessToken,
          useAuthStore.getState().user!,
          useAuthStore.getState().role!,
          useAuthStore.getState().collegeId ?? undefined
        );

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch {
        useAuthStore.getState().clearAuth();
        // Redirect to the correct login page based on current path
        if (typeof window !== "undefined") {
          const path = window.location.pathname;
          if (path.startsWith("/admin")) window.location.href = "/admin/login";
          else if (path.startsWith("/master")) window.location.href = "/master/login";
          else window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
