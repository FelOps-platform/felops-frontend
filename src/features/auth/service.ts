import {
  AuthApiError,
  type ForgotPasswordRequest,
  type ForgotPasswordResponse,
  type OtpPurpose,
  type ResendCodeRequest,
  type ResendCodeResponse,
  type ResetPasswordRequest,
  type ResetPasswordResponse,
  type Session,
  type SignInRequest,
  type SignUpRequest,
  type SignUpResponse,
  type User,
  type VerifyEmailRequest,
  type VerifyResetCodeRequest,
  type VerifyResetCodeResponse,
} from './types';
import { mapUserDtoToUser } from './mappers';

interface StoredAccount {
  user: User;
  password: string;
}

interface StoredOtp {
  code: string;
  purpose: OtpPurpose;
  expiresAt: number;
  lastSentAt: number;
}

interface StoredResetToken {
  email: string;
  expiresAt: number;
}

const NETWORK_DELAY_MS = 350;
const OTP_TTL_MS = 5 * 60 * 1000;
const RESET_TOKEN_TTL_MS = 10 * 60 * 1000;
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;
const MOCK_DEFAULT_OTP = '123456';

const INITIAL_ACCOUNTS: Array<{ user: Parameters<typeof mapUserDtoToUser>[0]; password: string }> = [
  {
    user: {
      id: 'usr_demo_001',
      email: 'demo@felops.com',
      name: 'Demo Operator',
      emailVerified: true,
      createdAt: '2026-11-01T09:00:00Z',
    },
    password: 'Password1!',
  },
  {
    user: {
      id: 'usr_pending_002',
      email: 'pending@felops.com',
      name: 'Pending Operator',
      emailVerified: false,
      createdAt: '2026-11-10T10:00:00Z',
    },
    password: 'Password1!',
  },
];

const accountStore = new Map<string, StoredAccount>();
const otpStore = new Map<string, StoredOtp>();
const resetTokenStore = new Map<string, StoredResetToken>();
let currentSession: Session | null = null;

function ensureInitialized(): void {
  if (accountStore.size > 0) return;

  for (const entry of INITIAL_ACCOUNTS) {
    const user = mapUserDtoToUser(entry.user);
    accountStore.set(user.email, { user, password: entry.password });

    if (!user.emailVerified) {
      otpStore.set(otpKey(user.email, 'verify_email'), {
        code: MOCK_DEFAULT_OTP,
        purpose: 'verify_email',
        expiresAt: Date.now() + OTP_TTL_MS,
        lastSentAt: Date.now() - RESEND_COOLDOWN_MS,
      });
    }
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function otpKey(email: string, purpose: OtpPurpose): string {
  return `${purpose}:${normalizeEmail(email)}`;
}

function clone<T>(val: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(val);
  }
  return JSON.parse(JSON.stringify(val));
}

function delay(ms: number = NETWORK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createRandomToken(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID().replace(/-/g, '')}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}

function issueOtp(email: string, purpose: OtpPurpose): string {
  const key = otpKey(email, purpose);
  const now = Date.now();
  otpStore.set(key, {
    code: MOCK_DEFAULT_OTP,
    purpose,
    expiresAt: now + OTP_TTL_MS,
    lastSentAt: now,
  });
  return MOCK_DEFAULT_OTP;
}

function createSessionForUser(user: User): Session {
  const session: Session = {
    user: clone(user),
    expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
  };
  currentSession = session;
  return clone(session);
}

/**
 * Authenticate an existing verified user with email and password.
 * TODO: Replace mock store with backend POST /auth/sign-in integration.
 */
export async function signIn(input: SignInRequest): Promise<Session> {
  ensureInitialized();
  await delay();

  const email = normalizeEmail(input.email);
  const account = accountStore.get(email);

  if (!account || account.password !== input.password) {
    throw new AuthApiError(
      'Invalid email or password.',
      'INVALID_CREDENTIALS',
      401
    );
  }

  if (!account.user.emailVerified) {
    throw new AuthApiError(
      'Email address is not verified.',
      'EMAIL_NOT_VERIFIED',
      403
    );
  }

  return createSessionForUser(account.user);
}

/**
 * Register a new unverified user account and dispatch an email verification code.
 * TODO: Replace mock store with backend POST /auth/sign-up integration.
 */
export async function signUp(input: SignUpRequest): Promise<SignUpResponse> {
  ensureInitialized();
  await delay();

  const email = normalizeEmail(input.email);
  const existing = accountStore.get(email);

  if (existing && existing.user.emailVerified) {
    throw new AuthApiError(
      'Email address is already registered.',
      'EMAIL_TAKEN',
      409
    );
  }

  const user = mapUserDtoToUser({
    id: existing?.user.id ?? createRandomToken('usr'),
    email,
    name: input.name,
    emailVerified: false,
    createdAt: existing?.user.createdAt ?? new Date().toISOString(),
  });

  accountStore.set(email, { user, password: input.password });
  issueOtp(email, 'verify_email');

  return {
    message: 'Verification code sent to your email address.',
    email,
    requiresVerification: true,
  };
}

/**
 * Verify a user's email address using the 6-digit OTP code and create a session.
 * TODO: Replace mock store with backend POST /auth/verify-email integration.
 */
export async function verifyEmail(input: VerifyEmailRequest): Promise<Session> {
  ensureInitialized();
  await delay();

  const email = normalizeEmail(input.email);
  const account = accountStore.get(email);
  const key = otpKey(email, 'verify_email');
  const otp = otpStore.get(key);

  if (!account || !otp) {
    throw new AuthApiError('Invalid verification code.', 'OTP_INVALID', 400);
  }

  if (Date.now() > otp.expiresAt) {
    otpStore.delete(key);
    throw new AuthApiError('Verification code expired.', 'OTP_EXPIRED', 400);
  }

  if (otp.code !== input.code.trim()) {
    throw new AuthApiError('Invalid verification code.', 'OTP_INVALID', 400);
  }

  otpStore.delete(key);
  account.user = { ...account.user, emailVerified: true };

  return createSessionForUser(account.user);
}

/**
 * Re-issue a 6-digit OTP code for email verification or password reset.
 * TODO: Replace mock store with backend POST /auth/resend-code integration.
 */
export async function resendCode(
  input: ResendCodeRequest
): Promise<ResendCodeResponse> {
  ensureInitialized();
  await delay();

  const email = normalizeEmail(input.email);
  const purpose: OtpPurpose = input.purpose ?? 'verify_email';
  const key = otpKey(email, purpose);
  const existingOtp = otpStore.get(key);

  if (existingOtp && Date.now() - existingOtp.lastSentAt < RESEND_COOLDOWN_MS) {
    throw new AuthApiError(
      'Too many verification code requests.',
      'RATE_LIMITED',
      429
    );
  }

  if (accountStore.has(email)) {
    issueOtp(email, purpose);
  }

  return {
    message: 'A new verification code has been sent.',
    cooldownSeconds: Math.round(RESEND_COOLDOWN_MS / 1000),
  };
}

/**
 * Initiate password reset flow by issuing a reset OTP if the account exists.
 * Always responds generically to prevent email enumeration.
 * TODO: Replace mock store with backend POST /auth/forgot-password integration.
 */
export async function forgotPassword(
  input: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> {
  ensureInitialized();
  await delay();

  const email = normalizeEmail(input.email);
  if (accountStore.has(email)) {
    issueOtp(email, 'reset_password');
  }

  return {
    message:
      'If an account exists for this email address, a verification code has been sent.',
  };
}

/**
 * Verify a password reset OTP and return a short-lived single-use resetToken.
 * TODO: Replace mock store with backend POST /auth/verify-reset-code integration.
 */
export async function verifyResetCode(
  input: VerifyResetCodeRequest
): Promise<VerifyResetCodeResponse> {
  ensureInitialized();
  await delay();

  const email = normalizeEmail(input.email);
  const key = otpKey(email, 'reset_password');
  const otp = otpStore.get(key);

  if (!accountStore.has(email) || !otp) {
    throw new AuthApiError('Invalid verification code.', 'OTP_INVALID', 400);
  }

  if (Date.now() > otp.expiresAt) {
    otpStore.delete(key);
    throw new AuthApiError('Verification code expired.', 'OTP_EXPIRED', 400);
  }

  if (otp.code !== input.code.trim()) {
    throw new AuthApiError('Invalid verification code.', 'OTP_INVALID', 400);
  }

  otpStore.delete(key);

  const resetToken = createRandomToken('rst');
  const expiresAtMs = Date.now() + RESET_TOKEN_TTL_MS;
  resetTokenStore.set(resetToken, { email, expiresAt: expiresAtMs });

  return {
    resetToken,
    expiresAt: new Date(expiresAtMs).toISOString(),
  };
}

/**
 * Complete password reset using a valid, non-expired resetToken.
 * TODO: Replace mock store with backend POST /auth/reset-password integration.
 */
export async function resetPassword(
  input: ResetPasswordRequest
): Promise<ResetPasswordResponse> {
  ensureInitialized();
  await delay();

  const tokenRecord = resetTokenStore.get(input.resetToken);
  if (!tokenRecord) {
    throw new AuthApiError('Invalid reset token.', 'OTP_INVALID', 400);
  }

  if (Date.now() > tokenRecord.expiresAt) {
    resetTokenStore.delete(input.resetToken);
    throw new AuthApiError('Reset session expired.', 'OTP_EXPIRED', 400);
  }

  const account = accountStore.get(tokenRecord.email);
  if (!account) {
    resetTokenStore.delete(input.resetToken);
    throw new AuthApiError('Account not found.', 'UNKNOWN', 404);
  }

  account.password = input.newPassword;
  resetTokenStore.delete(input.resetToken);

  return {
    message: 'Your password has been updated successfully.',
  };
}

/**
 * Terminate the current authenticated session.
 * TODO: Replace mock state with backend POST /auth/sign-out integration.
 */
export async function signOut(): Promise<void> {
  await delay(150);
  currentSession = null;
}

/**
 * Retrieve the active authenticated session, or null if unauthenticated/expired.
 * TODO: Replace mock state with backend GET /auth/session integration.
 */
export async function getSession(): Promise<Session | null> {
  await delay(100);

  if (!currentSession) {
    return null;
  }

  if (Date.now() >= new Date(currentSession.expiresAt).getTime()) {
    currentSession = null;
    return null;
  }

  return clone(currentSession);
}
