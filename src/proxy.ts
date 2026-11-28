import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  DEFAULT_AUTH_REDIRECT,
  SESSION_COOKIE_NAME,
  SIGN_IN_PATH,
} from '@/features/auth/constants';
import { getSafeRedirectPath } from '@/features/auth/redirect';

const PROTECTED_PREFIXES = ['/w', '/workspaces', '/account'] as const;
const AUTH_ENTRY_ROUTES = [
  '/sign-in',
  '/sign-up',
  '/forgot-password',
] as const;

function matchesPrefix(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/**
 * Next.js 16 optimistic Proxy for route-level cookie presence checks.
 * Real session and membership verification happens in server SessionGate layouts.
 */
export function proxy(request: NextRequest) {
  const { pathname, search, searchParams } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const hasSessionCookie = Boolean(sessionCookie);

  if (matchesPrefix(pathname, PROTECTED_PREFIXES) && !hasSessionCookie) {
    const nextPath = getSafeRedirectPath(`${pathname}${search}`);
    const signInUrl = new URL(SIGN_IN_PATH, request.url);
    signInUrl.searchParams.set('next', nextPath);
    return NextResponse.redirect(signInUrl);
  }

  if (matchesPrefix(pathname, AUTH_ENTRY_ROUTES) && hasSessionCookie) {
    // If redirected back due to an expired/invalid server session, clear stale cookie without looping
    if (
      pathname === SIGN_IN_PATH &&
      searchParams.get('reason') === 'expired'
    ) {
      const response = NextResponse.next();
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }

    const safeTarget = getSafeRedirectPath(
      searchParams.get('next'),
      DEFAULT_AUTH_REDIRECT
    );
    return NextResponse.redirect(new URL(safeTarget, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
