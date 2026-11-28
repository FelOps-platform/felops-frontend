import { ApiError } from '@/lib/api/errors';

export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  avatarUrl?: string;
  createdAt: string;
}

export interface Session {
  user: User;
  expiresAt: string;
}

export interface UserDto {
  id?: string;
  email?: string;
  name?: string;
  fullName?: string;
  emailVerified?: boolean;
  email_verified?: boolean;
  avatarUrl?: string | null;
  avatar_url?: string | null;
  createdAt?: string;
  created_at?: string;
}

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_TAKEN'
  | 'EMAIL_NOT_VERIFIED'
  | 'OTP_INVALID'
  | 'OTP_EXPIRED'
  | 'RATE_LIMITED'
  | 'NETWORK'
  | 'UNKNOWN';

export class AuthApiError extends ApiError<AuthErrorCode> {
  constructor(
    message: string,
    code: AuthErrorCode,
    status: number,
    cause?: unknown
  ) {
    super(message, code, status, cause);
    this.name = 'AuthApiError';
    Object.setPrototypeOf(this, AuthApiError.prototype);
  }
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
}

export interface SignUpResponse {
  message: string;
  email: string;
  requiresVerification: boolean;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export type OtpPurpose = 'verify_email' | 'reset_password';

export interface ResendCodeRequest {
  email: string;
  purpose?: OtpPurpose;
}

export interface ResendCodeResponse {
  message: string;
  cooldownSeconds: number;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface VerifyResetCodeRequest {
  email: string;
  code: string;
}

export interface VerifyResetCodeResponse {
  resetToken: string;
  expiresAt: string;
}

export interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}
