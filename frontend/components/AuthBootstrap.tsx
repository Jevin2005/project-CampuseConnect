"use client";

import { useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { getApiBaseUrl } from "@/lib/axios";

/**
 * AuthBootstrap - runs silent token refresh on page load.
 * Kept as a separate client component so layout.tsx stays a Server Component,
 * allowing Next.js to SSR every page immediately (fixes FCP/LCP scores).
 * Renders nothing - zero visual impact.
 */
export default function AuthBootstrap() {
  const { setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    const tryRefresh = async () => {
      try {
        const { data } = await axios.post(
          `${getApiBaseUrl()}/api/auth/refresh`,
          {},
          { withCredentials: true, timeout: 8000 }
        );
        const { accessToken, user, role: r, collegeId } = data as {
          accessToken: string;
          user: import("@/store/authStore").AuthUser;
          role: import("@/store/authStore").Role;
          collegeId?: string;
        };
        setAuth(accessToken, user, r, collegeId);
      } catch (err: any) {
        const status = err?.response?.status;
        const currentToken = useAuthStore.getState().accessToken;

        if (status === 401) {
          if (!currentToken) {
            clearAuth();
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      }
    };

    tryRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}