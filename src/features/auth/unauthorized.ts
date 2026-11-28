import { SIGN_IN_PATH } from './constants';
import { getSafeRedirectPath } from './redirect';
import { signOut } from './service';

let isHandlingUnauthorized = false;

const AUTH_ENTRY_PREFIXES = [
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
];

/**
 * Single-flight 401 handler for client requests.
 * Uses a module-level lock so concurrent failing requests only trigger
 * one sign-out and one redirect to /sign-in?next=... without redirect loops.
 */
export async function handleUnauthorized(options?: {
  redirectOverride?: string;
  navigate?: (url: string) => void;
}): Promise<void> {
  if (typeof window === 'undefined' || isHandlingUnauthorized) {
    return;
  }

  const currentPathname = window.location.pathname;
  if (
    AUTH_ENTRY_PREFIXES.some(
      (prefix) =>
        currentPathname === prefix || currentPathname.startsWith(`${prefix}/`)
    )
  ) {
    return;
  }

  isHandlingUnauthorized = true;

  try {
    await signOut();
  } catch {
    // Best-effort cookie/session cleanup before redirecting to sign-in
  }

  const currentUrl = `${window.location.pathname}${window.location.search}`;
  const safeNext = getSafeRedirectPath(options?.redirectOverride ?? currentUrl);
  const target = `${SIGN_IN_PATH}?next=${encodeURIComponent(safeNext)}`;

  if (options?.navigate) {
    options.navigate(target);
    return;
  }

  window.location.replace(target);
}

/**
 * Exposed for testing or explicit client reset if navigation is intercepted.
 */
export function resetUnauthorizedHandlerLock(): void {
  isHandlingUnauthorized = false;
}
