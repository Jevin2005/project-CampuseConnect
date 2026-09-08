/**
 * Zustand Auth Store
 * Spec: authentication.md § ZUSTAND AUTH STORE
 *
 * Rules:
 * - Access token lives ONLY in memory (never localStorage / sessionStorage)
 * - On boot → layout.tsx calls GET /api/auth/refresh to silently restore session
 */

import { create } from "zustand";

export type Role = "STUDENT" | "COLLEGE_ADMIN" | "MASTER_ADMIN";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  collegeId?: string;
  collegeName?: string;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  role: Role | null;
  collegeId: string | null;
  isLoading: boolean;

  // Temp state used across S1→S2 navigation (replaces sessionStorage / URL param)
  pendingEmail: string | null;
  maskedEmail: string | null;
  devOtp: string | null;
  instantMessage: string | null;

  setAuth: (token: string, user: AuthUser, role: Role, collegeId?: string) => void;
  clearAuth: () => void;
  setLoading: (v: boolean) => void;
  setPendingEmail: (email: string, masked: string, devOtp?: string, instantMessage?: string) => void;
  clearPendingOtp: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  role: null,
  collegeId: null,
  isLoading: true, // true on boot until refresh check completes

  pendingEmail: null,
  maskedEmail: null,
  devOtp: null,
  instantMessage: null,

  setAuth: (token, user, role, collegeId) => {
    if (typeof window !== "undefined") {
      document.cookie = `accessToken=${token}; path=/; max-age=2592000; SameSite=Lax; Secure`;
    }
    set({ accessToken: token, user, role, collegeId: collegeId ?? null, isLoading: false });
  },

  clearAuth: () => {
    if (typeof window !== "undefined") {
      document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure";
    }
    set({
      accessToken: null,
      user: null,
      role: null,
      collegeId: null,
      isLoading: false,
    });
  },

  setLoading: (v) => set({ isLoading: v }),

  setPendingEmail: (email, masked, devOtp, instantMessage) =>
    set({
      pendingEmail: email,
      maskedEmail: masked,
      devOtp: devOtp ?? null,
      instantMessage: instantMessage ?? null,
    }),

  clearPendingOtp: () =>
    set({
      pendingEmail: null,
      maskedEmail: null,
      devOtp: null,
      instantMessage: null,
    }),
}));
