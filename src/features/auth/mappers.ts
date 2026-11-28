import { ApiError } from '@/lib/api/errors';
import {
  AuthApiError,
  type AuthErrorCode,
  type User,
  type UserDto,
} from './types';

const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  INVALID_CREDENTIALS:
    'Invalid email or password. Please check your credentials and try again.',
  EMAIL_TAKEN:
    'Unable to complete registration with this email address. Please sign in or reset your password.',
  EMAIL_NOT_VERIFIED:
    'Please verify your email address before signing in.',
  OTP_INVALID:
    'The verification code is incorrect. Please check the code and try again.',
  OTP_EXPIRED:
    'This verification code has expired. Please request a new code.',
  RATE_LIMITED:
    'Too many attempts. Please wait a moment before trying again.',
  NETWORK:
    'Unable to connect to the authentication service. Please check your connection and try again.',
  UNKNOWN: 'Something went wrong. Please try again.',
};

/**
 * Maps AuthApiError, ApiError, and unknown thrown values into safe, sanitized UI copy.
 * Never leaks raw fetch failures, stack traces, or account-enumeration hints.
 */
export function mapAuthError(error: unknown): string {
  if (error instanceof AuthApiError) {
    return AUTH_ERROR_MESSAGES[error.code] ?? AUTH_ERROR_MESSAGES.UNKNOWN;
  }

  if (error instanceof ApiError) {
    if (error.status === 401) return AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS;
    if (error.status === 429) return AUTH_ERROR_MESSAGES.RATE_LIMITED;
    if (error.status === 0 || error.status >= 500) {
      return AUTH_ERROR_MESSAGES.NETWORK;
    }
    return AUTH_ERROR_MESSAGES.UNKNOWN;
  }

  if (error instanceof Error) {
    const lower = error.message.toLowerCase();
    if (
      lower.includes('fetch') ||
      lower.includes('network') ||
      lower.includes('timeout') ||
      lower.includes('failed to connect')
    ) {
      return AUTH_ERROR_MESSAGES.NETWORK;
    }
    return AUTH_ERROR_MESSAGES.UNKNOWN;
  }

  return AUTH_ERROR_MESSAGES.UNKNOWN;
}

export function mapUserDtoToUser(dto: UserDto): User {
  const email = (dto.email ?? '').trim().toLowerCase();
  const rawName = dto.name ?? dto.fullName ?? '';
  const fallbackName = email ? email.split('@')[0] : 'Workspace User';

  return {
    id: dto.id ?? `usr_${Date.now()}`,
    email,
    name: rawName.trim() || fallbackName,
    emailVerified: Boolean(dto.emailVerified ?? dto.email_verified ?? false),
    avatarUrl: (dto.avatarUrl ?? dto.avatar_url) || undefined,
    createdAt: dto.createdAt ?? dto.created_at ?? new Date().toISOString(),
  };
}
