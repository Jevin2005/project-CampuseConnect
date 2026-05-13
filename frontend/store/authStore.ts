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

  setAuth: (token: string, user: AuthUser, role: Role, collegeId?: string) => void;
  clearAuth: () => void;
  setLoading: (v: boolean) => void;
  setPendingEmail: (email: string, masked: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  role: null,
  collegeId: null,
  isLoading: true, // true on boot until refresh check completes

  pendingEmail: null,
  maskedEmail: null,

  setAuth: (token, user, role, collegeId) =>
    set({ accessToken: token, user, role, collegeId: collegeId ?? null, isLoading: false }),

  clearAuth: () =>
    set({
      accessToken: null,
      user: null,
      role: null,
      collegeId: null,
      isLoading: false,
    }),

  setLoading: (v) => set({ isLoading: v }),

  setPendingEmail: (email, masked) =>
    set({ pendingEmail: email, maskedEmail: masked }),
}));
