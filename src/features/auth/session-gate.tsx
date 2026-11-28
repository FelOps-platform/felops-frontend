import { Suspense, type ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { SIGN_IN_PATH } from './constants';
import { getSafeRedirectPath } from './redirect';
import { getSession, hasSessionCookie } from './session.server';

interface SessionGateProps {
  children: ReactNode;
  redirectTo?: string;
  fallback?: ReactNode;
}

async function SessionGateInner({
  children,
  redirectTo,
}: {
  children: ReactNode;
  redirectTo?: string;
}) {
  const session = await getSession();

  if (!session) {
    const staleCookiePresent = await hasSessionCookie();
    const params = new URLSearchParams();

    if (staleCookiePresent) {
      params.set('reason', 'expired');
    }

    if (redirectTo) {
      params.set('next', getSafeRedirectPath(redirectTo));
    }

    const queryString = params.toString();
    redirect(queryString ? `${SIGN_IN_PATH}?${queryString}` : SIGN_IN_PATH);
  }

  return <>{children}</>;
}

/**
 * Server-side session verification boundary compatible with Next.js Cache Components.
 * Reads cookies() inside a Suspense boundary so layouts remain static-shell compatible.
 */
export function SessionGate({
  children,
  redirectTo,
  fallback = null,
}: SessionGateProps) {
  return (
    <Suspense fallback={fallback}>
      <SessionGateInner redirectTo={redirectTo}>
        {children}
      </SessionGateInner>
    </Suspense>
  );
}
