"use client";

import "./globals.css";
import { useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";

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
        // Only destroy the session if the server explicitly says the token is invalid (401)
        // For 500s, network errors, or CORS issues — just stop loading, keep the cookie
        if (err?.response?.status === 401) {
          clearAuth();
        } else {
          // Transient error — session may still be valid, just unlock the UI
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
      <body className="bg-main antialiased">{children}</body>
    </html>
  );
}
