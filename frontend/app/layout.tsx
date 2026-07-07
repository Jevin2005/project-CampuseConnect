"use client";

import "./globals.css";
import { useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { SpeedInsights } from "@vercel/speed-insights/next";

// NOTE: metadata export must live in a Server Component.
// We handle that via a separate server wrapper; for now the layout itself
// is a Client Component so it can run the silent-refresh effect.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { setAuth, clearAuth, setLoading } = useAuthStore();

  /**
   * Silent refresh on every page load / tab re-focus.
   * IMPORTANT: Only call clearAuth() on definitive 401 (invalid/expired token).
   * For network errors or 500s, just stop the loading spinner — the refreshToken
   * cookie is still valid and middleware will keep the user on their page.
   */
  useEffect(() => {
    const tryRefresh = async () => {
      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/api/auth/refresh`,
          {},
          { withCredentials: true }
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
          // Only clear auth if there is NO valid in-memory token already
          // (i.e. user was NOT just logged in — this is a cold page load)
          if (!currentToken) {
            clearAuth();
          } else {
            // User just logged in — they have a valid accessToken in memory.
            // The refresh cookie may not be working (cross-domain issue) but
            // the user is authenticated. Don't destroy their session.
            setLoading(false);
          }
        } else {
          // Transient error (network, 500) — keep session alive
          setLoading(false);
        }
      }
    };

    tryRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-main antialiased">
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
