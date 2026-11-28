import { DEFAULT_AUTH_REDIRECT } from './constants';

/**
 * Validates a post-auth redirect target so only same-origin relative paths
 * starting with a single `/` are permitted (preventing open redirects).
 */
export function getSafeRedirectPath(
  nextParam: string | null | undefined,
  fallback: string = DEFAULT_AUTH_REDIRECT
): string {
  if (!nextParam) return fallback;

  const trimmed = nextParam.trim();
  if (
    !trimmed ||
    !trimmed.startsWith('/') ||
    trimmed.startsWith('//') ||
    trimmed.startsWith('/\\') ||
    /[\u0000-\u001F\u007F\\]/.test(trimmed)
  ) {
    return fallback;
  }

  try {
    const parsed = new URL(trimmed, 'http://localhost');
    if (parsed.origin !== 'http://localhost') {
      return fallback;
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
