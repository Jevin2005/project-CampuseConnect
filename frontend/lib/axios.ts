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

        const { accessToken, user, role, collegeId } = data as {
          accessToken: string;
          user: any;
          role: any;
          collegeId?: string;
        };

        const activeUser = user || useAuthStore.getState().user;
        const activeRole = role || useAuthStore.getState().role;
        const activeCollegeId = collegeId || useAuthStore.getState().collegeId;

        if (!activeUser || !activeRole) {
          throw new Error("No valid session user or role returned from refresh");
        }

        // Restore token and user info in store
        useAuthStore.getState().setAuth(
          accessToken,
          activeUser,
          activeRole,
          activeCollegeId ?? undefined
        );

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError: any) {
        // Only destroy the session if the refresh endpoint itself returned 401
        // (meaning the refreshToken is definitively invalid/expired)
        // For network errors or 500s on the refresh call, leave the session alone.
        const refreshStatus = refreshError?.response?.status;
        if (refreshStatus === 401) {
          useAuthStore.getState().clearAuth();
          // Clear the server-side cookie
          try {
            await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/api/auth/logout`,
              {},
              { withCredentials: true }
            );
          } catch { /* ignore */ }
          // Redirect to the correct login page based on current path
          if (typeof window !== "undefined") {
            const path = window.location.pathname;
            if (path.startsWith("/admin")) window.location.href = "/admin/login";
            else if (path.startsWith("/master")) window.location.href = "/master/login";
            else window.location.href = "/login";
          }
        }
        // For any other error (500, network) just reject — don't log out
      }
    }

    return Promise.reject(error);
  }
);

export default api;
