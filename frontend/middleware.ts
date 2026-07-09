/**
 * Next.js Middleware — Route Protection
 * Spec: authentication.md § NEXT.JS MIDDLEWARE
 *
 * Strategy:
 * - Read the refreshToken HTTP-only cookie to check if user is logged in.
 * - Decode the access token from a client-readable cookie (set by the backend)
 *   OR call the refresh endpoint to determine the current role.
 * - Redirect unauthorized users to the correct login page.
 * - Redirect already-logged-in users away from login pages.
 *
 * Note: Since access tokens live in Zustand (memory), middleware uses the
 * refreshToken cookie as the presence signal and decodes it (without full
 * verification — that happens on the backend). This is the standard pattern
 * for Next.js middleware where we can't make async API calls reliably.
 */

import { NextRequest, NextResponse } from 'next/server';

/* ─── Route groups ──────────────────────────────────────────────── */
const STUDENT_ROUTES = [
  '/marketplace',
  '/product',
  '/viewer',
  '/sell',
  '/my-listings',
  '/my-purchases',
  '/profile',
];

const ADMIN_ROUTES = [
  '/admin/dashboard',
  '/admin/requests',
  '/admin/products',
  '/admin/advertisements',
  '/admin/revenue',
  '/admin/settings',
];

const MASTER_ROUTES = [
  '/master/dashboard',
  '/master/colleges',
  '/master/revenue',
  '/master/settings',
  '/master/students',
  '/master/college-requests',
  '/master/requests',
];

const STUDENT_AUTH_PAGES = ['/login', '/verify-otp', '/pending-approval'];
const ADMIN_AUTH_PAGES = ['/admin/login', '/admin/register'];
const MASTER_AUTH_PAGES = ['/master/login'];

/* ─── Decode JWT payload without verification ─────────────────── */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;
    const json = Buffer.from(base64, 'base64url').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/* ─── Helper: does path start with any prefix ────────────────── */
function matchesAny(pathname: string, prefixes: string[]): boolean {
  return prefixes.some(p => pathname === p || pathname.startsWith(p + '/'));
}

/* ─── Middleware ─────────────────────────────────────────────── */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const refreshToken = req.cookies.get('refreshToken')?.value || req.cookies.get('accessToken')?.value;

  // Decode the refresh token to get role (not verification — just presence + role)
  let role: string | null = null;
  let isExpired = false;

  if (refreshToken) {
    const payload = decodeJwtPayload(refreshToken);
    if (payload) {
      role = payload.role as string;
      const exp = payload.exp as number;
      if (exp && Date.now() / 1000 > exp) {
        isExpired = true;
        role = null;
      }
    }
  }

  const isAuthenticated = !!role && !isExpired;

  /* ── Redirect already-authenticated users away from THEIR auth pages ── */
  if (isAuthenticated) {
    if (role === 'STUDENT' && matchesAny(pathname, STUDENT_AUTH_PAGES)) {
      return NextResponse.redirect(new URL('/marketplace', req.url));
    }
    if (role === 'COLLEGE_ADMIN' && matchesAny(pathname, ADMIN_AUTH_PAGES)) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }
    if (role === 'MASTER_ADMIN' && matchesAny(pathname, MASTER_AUTH_PAGES)) {
      return NextResponse.redirect(new URL('/master/dashboard', req.url));
    }
  }

  /* ── Protect student routes ───────────────────────────────────── */
  if (matchesAny(pathname, STUDENT_ROUTES)) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (role !== 'STUDENT') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  /* ── Protect admin routes ─────────────────────────────────────── */
  if (matchesAny(pathname, ADMIN_ROUTES)) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
    if (role !== 'COLLEGE_ADMIN') {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  /* ── Protect master routes ────────────────────────────────────── */
  if (matchesAny(pathname, MASTER_ROUTES)) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/master/login', req.url));
    }
    if (role !== 'MASTER_ADMIN') {
      return NextResponse.redirect(new URL('/master/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
