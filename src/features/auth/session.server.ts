import 'server-only';
import { cookies } from 'next/headers';
import {
  RESET_TOKEN_COOKIE_NAME,
  SESSION_COOKIE_NAME,
} from './constants';
import { getSessionByToken, validateResetTokenStatus } from './service';
import type { ResetTokenValidation, Session } from './types';

export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

export async function hasSessionCookie(): Promise<boolean> {
  const token = await getSessionToken();
  return Boolean(token);
}

/**
 * Reads the httpOnly session cookie and validates it against the auth session store.
 */
export async function getSession(): Promise<Session | null> {
  const token = await getSessionToken();
  if (!token) return null;
  return getSessionByToken(token);
}

/**
 * Persists the opaque session token in an httpOnly, SameSite=Lax cookie.
 */
export async function createSessionCookie(
  sessionToken: string,
  expiresAt: string
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(expiresAt),
  });
}

/**
 * Clears the session cookie on sign-out or session invalidation.
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Persists a short-lived single-use password reset token in an httpOnly cookie
 * so emails and reset tokens are never exposed in URL search parameters.
 */
export async function createResetTokenCookie(
  resetToken: string,
  expiresAt: string
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(RESET_TOKEN_COOKIE_NAME, resetToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(expiresAt),
  });
}

export async function getResetTokenCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(RESET_TOKEN_COOKIE_NAME)?.value;
}

export async function getResetSession(): Promise<ResetTokenValidation> {
  const token = await getResetTokenCookie();
  return validateResetTokenStatus(token);
}

export async function clearResetTokenCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(RESET_TOKEN_COOKIE_NAME);
}
