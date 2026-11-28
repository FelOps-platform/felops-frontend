import {
  AuthApiError,
  type AuthApiErrorMeta,
  type AuthErrorCode,
  type ForgotPasswordRequest,
  type ForgotPasswordResponse,
  type InviteDetails,
  type OtpPurpose,
  type ResendCodeRequest,
  type ResendCodeResponse,
  type ResetPasswordRequest,
  type ResetPasswordResponse,
  type ResetTokenValidation,
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
  used: boolean;
}

interface StoredInvite {
  token: string;
  workspaceId: string;
  workspaceName: string;
  inviterName: string;
  role: 'Owner' | 'Admin' | 'Member';
  expiresAt: number;
  used: boolean;
}

interface MockAuthStores {
  initialized: boolean;
  accountStore: Map<string, StoredAccount>;
  otpStore: Map<string, StoredOtp>;
  resetTokenStore: Map<string, StoredResetToken>;
  inviteStore: Map<string, StoredInvite>;
  sessionStore: Map<string, Session>;
  activeSessionToken: string | null;
}

const NETWORK_DELAY_MS = 350;
const OTP_TTL_MS = 5 * 60 * 1000;
const RESET_TOKEN_TTL_MS = 10 * 60 * 1000;
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;
const MOCK_DEFAULT_OTP = '123456';

const INITIAL_ACCOUNTS: Array<{
  user: Parameters<typeof mapUserDtoToUser>[0];
  password: string;
}> = [
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

const INITIAL_RESET_TOKENS: Array<{ token: string; record: StoredResetToken }> = [
  {
    token: 'rst_demo_valid',
    record: {
      email: 'demo@felops.com',
      expiresAt: Date.now() + 60 * 60 * 1000,
      used: false,
    },
  },
  {
    token: 'rst_demo_expired',
    record: {
      email: 'demo@felops.com',
      expiresAt: Date.now() - 60 * 1000,
      used: false,
    },
  },
  {
    token: 'rst_demo_used',
    record: {
      email: 'demo@felops.com',
      expiresAt: Date.now() + 60 * 60 * 1000,
      used: true,
    },
  },
];

const INITIAL_INVITES: StoredInvite[] = [
  {
    token: 'inv_demo_valid',
    workspaceId: 'ws-ai-production',
    workspaceName: 'AI Production Hub',
    inviterName: 'Workspace Owner',
    role: 'Member',
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    used: false,
  },
  {
    token: 'inv_demo_expired',
    workspaceId: 'ws-enterprise-ops',
    workspaceName: 'Enterprise Operations',
    inviterName: 'Workspace Admin',
    role: 'Admin',
    expiresAt: Date.now() - 60 * 1000,
    used: false,
  },
  {
    token: 'inv_demo_used',
    workspaceId: 'ws-customer-fleet',
    workspaceName: 'Customer Support Fleet',
    inviterName: 'Workspace Owner',
    role: 'Member',
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    used: true,
  },
];

const globalForAuth = globalThis as typeof globalThis & {
  __felopsAuthStores?: MockAuthStores;
};

function getStores(): MockAuthStores {
  if (!globalForAuth.__felopsAuthStores) {
    globalForAuth.__felopsAuthStores = {
      initialized: false,
      accountStore: new Map<string, StoredAccount>(),
      otpStore: new Map<string, StoredOtp>(),
      resetTokenStore: new Map<string, StoredResetToken>(),
      inviteStore: new Map<string, StoredInvite>(),
      sessionStore: new Map<string, Session>(),
      activeSessionToken: null,
    };
  }

  const stores = globalForAuth.__felopsAuthStores;
  if (!stores.initialized) {
    for (const entry of INITIAL_ACCOUNTS) {
      const user = mapUserDtoToUser(entry.user);
      stores.accountStore.set(user.email, { user, password: entry.password });

      if (!user.emailVerified) {
        stores.otpStore.set(otpKey(user.email, 'verify_email'), {
          code: MOCK_DEFAULT_OTP,
          purpose: 'verify_email',
          expiresAt: Date.now() + OTP_TTL_MS,
          lastSentAt: Date.now() - RESEND_COOLDOWN_MS,
        });
      }
    }

    for (const item of INITIAL_RESET_TOKENS) {
      stores.resetTokenStore.set(item.token, item.record);
    }

    for (const invite of INITIAL_INVITES) {
      stores.inviteStore.set(invite.token, invite);
    }

    stores.initialized = true;
  }

  return stores;
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

function issueOtp(
  email: string,
  purpose: OtpPurpose
): { expiresAt: string; resendAvailableAt: string } {
  const { otpStore } = getStores();
  const key = otpKey(email, purpose);
  const now = Date.now();
  const expiresAtMs = now + OTP_TTL_MS;
  const resendAvailableAtMs = now + RESEND_COOLDOWN_MS;

  otpStore.set(key, {
    code: MOCK_DEFAULT_OTP,
    purpose,
    expiresAt: expiresAtMs,
    lastSentAt: now,
  });

  return {
    expiresAt: new Date(expiresAtMs).toISOString(),
    resendAvailableAt: new Date(resendAvailableAtMs).toISOString(),
  };
}

function createSessionRecord(user: User): {
  session: Session;
  sessionToken: string;
} {
  const stores = getStores();
  const sessionToken = createRandomToken('sess');
  const session: Session = {
    user: clone(user),
    expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
  };
  stores.sessionStore.set(sessionToken, session);
  stores.activeSessionToken = sessionToken;
  return { session: clone(session), sessionToken };
}

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

interface ApiErrorPayload {
  code?: AuthErrorCode;
  message?: string;
  expiresAt?: string;
  resendAvailableAt?: string;
}

async function requestAuthApi<TResponse>(
  path: string,
  options: RequestInit
): Promise<TResponse> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...options,
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
    });
  } catch (err: unknown) {
    throw new AuthApiError(
      'Unable to reach authentication service.',
      'NETWORK',
      0,
      err
    );
  }

  let payload: (TResponse & ApiErrorPayload) | null = null;
  try {
    payload = (await response.json()) as TResponse & ApiErrorPayload;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const meta: AuthApiErrorMeta | undefined =
      payload?.expiresAt || payload?.resendAvailableAt
        ? {
            expiresAt: payload.expiresAt,
            resendAvailableAt: payload.resendAvailableAt,
          }
        : undefined;

    throw new AuthApiError(
      payload?.message || 'Authentication request failed.',
      payload?.code ?? 'UNKNOWN',
      response.status,
      undefined,
      meta
    );
  }

  return payload as TResponse;
}

/**
 * Server-side sign-in returning both Session and an opaque sessionToken for httpOnly cookies.
 */
export async function signInWithToken(
  input: SignInRequest
): Promise<{ session: Session; sessionToken: string }> {
  const { accountStore, otpStore } = getStores();
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
    const key = otpKey(email, 'verify_email');
    const existingOtp = otpStore.get(key);
    const now = Date.now();
    const canReissue =
      !existingOtp || now - existingOtp.lastSentAt >= RESEND_COOLDOWN_MS;

    const meta = canReissue
      ? issueOtp(email, 'verify_email')
      : {
          expiresAt: new Date(existingOtp.expiresAt).toISOString(),
          resendAvailableAt: new Date(
            existingOtp.lastSentAt + RESEND_COOLDOWN_MS
          ).toISOString(),
        };

    throw new AuthApiError(
      'Email address is not verified.',
      'EMAIL_NOT_VERIFIED',
      403,
      undefined,
      meta
    );
  }

  return createSessionRecord(account.user);
}

/**
 * Server-side email verification returning both Session and an opaque sessionToken.
 */
export async function verifyEmailWithToken(
  input: VerifyEmailRequest
): Promise<{ session: Session; sessionToken: string }> {
  const { accountStore, otpStore } = getStores();
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

  return createSessionRecord(account.user);
}

/**
 * Validate a session token against the server session store.
 */
export async function getSessionByToken(
  sessionToken: string | null | undefined
): Promise<Session | null> {
  if (!sessionToken) return null;

  const { sessionStore } = getStores();
  const session = sessionStore.get(sessionToken);
  if (!session) return null;

  if (Date.now() >= new Date(session.expiresAt).getTime()) {
    sessionStore.delete(sessionToken);
    return null;
  }

  return clone(session);
}

/**
 * Validate whether a short-lived resetToken is active, expired, used, or invalid.
 */
export async function validateResetTokenStatus(
  resetToken: string | null | undefined
): Promise<ResetTokenValidation> {
  if (!resetToken) {
    return { status: 'invalid' };
  }

  const { resetTokenStore } = getStores();
  const record = resetTokenStore.get(resetToken);
  if (!record) {
    return { status: 'invalid' };
  }

  if (record.used) {
    return { status: 'used' };
  }

  if (Date.now() > record.expiresAt) {
    return { status: 'expired' };
  }

  return {
    status: 'valid',
    expiresAt: new Date(record.expiresAt).toISOString(),
  };
}

/**
 * Validate a workspace invitation token on the server.
 */
export async function validateInviteToken(token: string): Promise<InviteDetails> {
  const { inviteStore } = getStores();
  const invite = inviteStore.get(token);

  if (!invite) {
    return {
      token,
      status: 'invalid',
      workspaceId: '',
      workspaceName: 'Unknown Workspace',
      inviterName: 'Workspace Team',
      role: 'Member',
      expiresAt: new Date(0).toISOString(),
    };
  }

  let status: InviteDetails['status'] = 'valid';
  if (invite.used) {
    status = 'used';
  } else if (Date.now() > invite.expiresAt) {
    status = 'expired';
  }

  return {
    token: invite.token,
    status,
    workspaceId: invite.workspaceId,
    workspaceName: invite.workspaceName,
    inviterName: invite.inviterName,
    role: invite.role,
    expiresAt: new Date(invite.expiresAt).toISOString(),
  };
}

/**
 * Mark an invitation token as accepted/used on the server.
 */
export async function acceptInviteToken(token: string): Promise<InviteDetails> {
  const details = await validateInviteToken(token);
  if (details.status !== 'valid') {
    throw new AuthApiError(
      details.status === 'expired'
        ? 'Invitation link expired.'
        : 'Invitation link is invalid or already used.',
      details.status === 'expired' ? 'OTP_EXPIRED' : 'OTP_INVALID',
      400
    );
  }

  const { inviteStore } = getStores();
  const stored = inviteStore.get(token);
  if (stored) {
    stored.used = true;
  }

  return { ...details, status: 'used' };
}

/**
 * Revoke a specific session token (or active token if omitted) from the server session store.
 */
export async function signOutByToken(
  sessionToken?: string | null
): Promise<void> {
  const stores = getStores();
  if (sessionToken) {
    stores.sessionStore.delete(sessionToken);
    if (stores.activeSessionToken === sessionToken) {
      stores.activeSessionToken = null;
    }
    return;
  }

  if (stores.activeSessionToken) {
    stores.sessionStore.delete(stores.activeSessionToken);
    stores.activeSessionToken = null;
  }
}

/**
 * Authenticate an existing verified user with email and password.
 * In browser contexts, delegates to POST /api/auth/sign-in so the httpOnly cookie is set.
 * TODO: Replace mock store with backend POST /auth/sign-in integration.
 */
export async function signIn(input: SignInRequest): Promise<Session> {
  if (isBrowser()) {
    const data = await requestAuthApi<{ session: Session }>(
      '/api/auth/sign-in',
      {
        method: 'POST',
        body: JSON.stringify(input),
      }
    );
    return data.session;
  }

  const { session } = await signInWithToken(input);
  return session;
}

/**
 * Register a new unverified user account and dispatch an email verification code.
 * TODO: Replace mock store with backend POST /auth/sign-up integration.
 */
export async function signUp(input: SignUpRequest): Promise<SignUpResponse> {
  if (isBrowser()) {
    return requestAuthApi<SignUpResponse>('/api/auth/sign-up', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  const { accountStore } = getStores();
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
  const { expiresAt, resendAvailableAt } = issueOtp(email, 'verify_email');

  return {
    message: 'Verification code sent to your email address.',
    email,
    requiresVerification: true,
    expiresAt,
    resendAvailableAt,
  };
}

/**
 * Verify a user's email address using the 6-digit OTP code and create a session.
 * In browser contexts, delegates to POST /api/auth/verify-email so the httpOnly cookie is set.
 * TODO: Replace mock store with backend POST /auth/verify-email integration.
 */
export async function verifyEmail(input: VerifyEmailRequest): Promise<Session> {
  if (isBrowser()) {
    const data = await requestAuthApi<{ session: Session }>(
      '/api/auth/verify-email',
      {
        method: 'POST',
        body: JSON.stringify(input),
      }
    );
    return data.session;
  }

  const { session } = await verifyEmailWithToken(input);
  return session;
}

/**
 * Re-issue a 6-digit OTP code for email verification or password reset.
 * TODO: Replace mock store with backend POST /auth/resend-code integration.
 */
export async function resendCode(
  input: ResendCodeRequest
): Promise<ResendCodeResponse> {
  if (isBrowser()) {
    return requestAuthApi<ResendCodeResponse>('/api/auth/resend-code', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  const { accountStore, otpStore } = getStores();
  await delay();

  const email = normalizeEmail(input.email);
  const purpose: OtpPurpose = input.purpose ?? 'verify_email';
  const key = otpKey(email, purpose);
  const existingOtp = otpStore.get(key);

  if (existingOtp && Date.now() - existingOtp.lastSentAt < RESEND_COOLDOWN_MS) {
    throw new AuthApiError(
      'Too many verification code requests.',
      'RATE_LIMITED',
      429,
      undefined,
      {
        expiresAt: new Date(existingOtp.expiresAt).toISOString(),
        resendAvailableAt: new Date(
          existingOtp.lastSentAt + RESEND_COOLDOWN_MS
        ).toISOString(),
      }
    );
  }

  const timings = accountStore.has(email)
    ? issueOtp(email, purpose)
    : {
        expiresAt: new Date(Date.now() + OTP_TTL_MS).toISOString(),
        resendAvailableAt: new Date(Date.now() + RESEND_COOLDOWN_MS).toISOString(),
      };

  return {
    message: 'A new verification code has been sent.',
    cooldownSeconds: Math.round(RESEND_COOLDOWN_MS / 1000),
    expiresAt: timings.expiresAt,
    resendAvailableAt: timings.resendAvailableAt,
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
  if (isBrowser()) {
    return requestAuthApi<ForgotPasswordResponse>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  const { accountStore } = getStores();
  await delay();

  const email = normalizeEmail(input.email);
  const timings = accountStore.has(email)
    ? issueOtp(email, 'reset_password')
    : {
        expiresAt: new Date(Date.now() + OTP_TTL_MS).toISOString(),
        resendAvailableAt: new Date(Date.now() + RESEND_COOLDOWN_MS).toISOString(),
      };

  return {
    message:
      "If an account exists for that email, we've sent a verification code.",
    expiresAt: timings.expiresAt,
    resendAvailableAt: timings.resendAvailableAt,
  };
}

/**
 * Verify a password reset OTP and return a short-lived single-use resetToken.
 * TODO: Replace mock store with backend POST /auth/verify-reset-code integration.
 */
export async function verifyResetCode(
  input: VerifyResetCodeRequest
): Promise<VerifyResetCodeResponse> {
  if (isBrowser()) {
    return requestAuthApi<VerifyResetCodeResponse>(
      '/api/auth/verify-reset-code',
      {
        method: 'POST',
        body: JSON.stringify(input),
      }
    );
  }

  const { accountStore, otpStore, resetTokenStore } = getStores();
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
  resetTokenStore.set(resetToken, { email, expiresAt: expiresAtMs, used: false });

  return {
    resetToken,
    expiresAt: new Date(expiresAtMs).toISOString(),
  };
}

/**
 * Complete password reset using a valid, non-expired single-use resetToken.
 * TODO: Replace mock store with backend POST /auth/reset-password integration.
 */
export async function resetPassword(
  input: ResetPasswordRequest
): Promise<ResetPasswordResponse> {
  if (isBrowser()) {
    return requestAuthApi<ResetPasswordResponse>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  const { accountStore, resetTokenStore } = getStores();
  await delay();

  const tokenRecord = resetTokenStore.get(input.resetToken);
  if (!tokenRecord || tokenRecord.used) {
    throw new AuthApiError('Invalid or already used reset token.', 'OTP_INVALID', 400);
  }

  if (Date.now() > tokenRecord.expiresAt) {
    throw new AuthApiError('Reset session expired.', 'OTP_EXPIRED', 400);
  }

  const account = accountStore.get(tokenRecord.email);
  if (!account) {
    tokenRecord.used = true;
    throw new AuthApiError('Account not found.', 'UNKNOWN', 404);
  }

  account.password = input.newPassword;
  tokenRecord.used = true;

  return {
    message: 'Your password has been updated successfully.',
  };
}

/**
 * Terminate the current authenticated session and clear the httpOnly cookie.
 * TODO: Replace mock state with backend POST /auth/sign-out integration.
 */
export async function signOut(): Promise<void> {
  if (isBrowser()) {
    await requestAuthApi<{ ok: boolean }>('/api/auth/sign-out', {
      method: 'POST',
    });
    return;
  }

  await delay(150);
  await signOutByToken();
}

/**
 * Retrieve the active authenticated session, or null if unauthenticated/expired.
 * TODO: Replace mock state with backend GET /auth/session integration.
 */
export async function getSession(): Promise<Session | null> {
  if (isBrowser()) {
    try {
      const data = await requestAuthApi<{ session: Session | null }>(
        '/api/auth/session',
        { method: 'GET' }
      );
      return data.session;
    } catch {
      return null;
    }
  }

  await delay(100);
  const { activeSessionToken } = getStores();
  return getSessionByToken(activeSessionToken);
}
