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

export const getApiBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    // 1. Localhost development on developer's machine
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      const envUrl = process.env.NEXT_PUBLIC_API_URL;
      if (envUrl && (envUrl.includes("localhost") || envUrl.includes("127.0.0.1"))) {
        return envUrl;
      }
      return "http://localhost:5000";
    }

    // 2. Production in cloud (e.g. *.vercel.app or custom domain)
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    // Safe cloud default if Vercel env variable is omitted
    return "https://project-campuseconnect.onrender.com";
  }

  // 3. Server-side rendering (SSR / Next.js pre-render)
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") ? "http://localhost:5000" : "https://project-campuseconnect.onrender.com"),
  withCredentials: true, // needed for HTTP-only refresh cookie
  timeout: 15000,        // Never hang indefinitely; fail fast if server is unresponsive
});

/* ── Request: attach access token + ensure dynamic environment routing ───── */
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    config.baseURL = getApiBaseUrl();
  }
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
          `${getApiBaseUrl()}/api/auth/refresh`,
          {},
          { withCredentials: true, timeout: 10000 }
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
              `${getApiBaseUrl()}/api/auth/logout`,
              {},
              { withCredentials: true, timeout: 5000 }
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
