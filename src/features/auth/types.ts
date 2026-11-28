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

export interface AuthApiErrorMeta {
  expiresAt?: string;
  resendAvailableAt?: string;
}

export class AuthApiError extends ApiError<AuthErrorCode> {
  readonly meta?: AuthApiErrorMeta;

  constructor(
    message: string,
    code: AuthErrorCode,
    status: number,
    cause?: unknown,
    meta?: AuthApiErrorMeta
  ) {
    super(message, code, status, cause);
    this.name = 'AuthApiError';
    this.meta = meta;
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
  expiresAt: string;
  resendAvailableAt: string;
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
  expiresAt: string;
  resendAvailableAt: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  expiresAt: string;
  resendAvailableAt: string;
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

export type TokenValidationStatus = 'valid' | 'expired' | 'used' | 'invalid';

export interface ResetTokenValidation {
  status: TokenValidationStatus;
  expiresAt?: string;
}

export interface InviteDetails {
  token: string;
  status: TokenValidationStatus;
  workspaceId: string;
  workspaceName: string;
  inviterName: string;
  role: 'Owner' | 'Admin' | 'Member';
  expiresAt: string;
}
