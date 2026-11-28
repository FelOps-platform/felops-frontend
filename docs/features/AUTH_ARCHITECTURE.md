# Auth Architecture

Status: Draft

## Goal and Non-Goals
- **Goal**:
  - Establish a clean, centralized Feature-Driven Domain Architecture for Authentication and Session Management (`src/features/auth/`) shared across public auth entry routes (`/sign-in`, `/sign-up`, `/forgot-password`), token-based recovery and invitation routes (`/reset-password`, `/reset-password/[token]`, `/invite/[token]`), onboarding (`/workspaces*`), account (`/account/*`), and protected workspace layouts (`/w/[workspaceId]/*`).
  - Enforce defense-in-depth route protection combining optimistic Next.js 16 Proxy checks (`src/proxy.ts`) with server-side session verification inside `<Suspense>` boundaries (`SessionGate` in `src/features/auth/session-gate.tsx`) compatible with `cacheComponents` and `partialPrefetching`.
  - Persist session and password-reset tokens exclusively in `httpOnly`, `SameSite=Lax`, `Secure` (in production) cookies (`src/features/auth/session.server.ts`), avoiding `localStorage` and keeping sensitive emails and tokens out of URL query parameters.
  - Prevent open-redirect vulnerabilities via strict same-origin path validation (`getSafeRedirectPath` in `src/features/auth/redirect.ts`).
  - Standardize input validation with Zod v4 (`src/features/auth/schema.ts`), typed domain errors (`AuthApiError` extending shared `ApiError` in `src/lib/api/errors.ts`), and enumeration-safe error sanitization (`mapAuthError` in `src/features/auth/mappers.ts`).
  - Build accessible Server/Client split auth screens using shared UI primitives (`Input`, `Button`, `Label`, `Alert`, `Modal`) and reusable auth components (`AuthField`, `PasswordField`, `PasswordRequirements`, `VerifyOtpModal`).
- **Non-Goals**:
  - Direct connection to a live production identity provider or database during the initial frontend foundation phase (frontend `service.ts` initially operates against a `globalThis`-backed mock store and Next.js `/api/auth/*` Route Handlers until Backend API Integration in Phase 3).
  - Enterprise SSO / OAuth provider integrations (SAML, OIDC) or MFA hardware-key management in the initial auth release.
  - Modifying workspace feature internals beyond consuming `session.server.ts` and `redirect.ts` in protected layouts.

## System Overview & Security Constraints
- **Optimistic Edge/Network Proxy (`src/proxy.ts`)**:
  - Implements Next.js 16 `proxy(request: NextRequest)` with a static `config.matcher` excluding `/api/*`, `/_next/static`, `/_next/image`, `favicon.ico`, and static asset extensions (`svg`, `png`, `jpg`, `jpeg`, `gif`, `webp`, `ico`).
  - Checks only cookie presence (`SESSION_COOKIE_NAME = 'felops_session'`):
    - Unauthenticated requests to protected prefixes (`/w`, `/workspaces`, `/account`) redirect to `/sign-in?next=<encodedPathAndSearch>`.
    - Authenticated requests to public auth entry routes (`/sign-in`, `/sign-up`, `/forgot-password`) redirect via `getSafeRedirectPath(searchParams.get('next'), DEFAULT_AUTH_REDIRECT)`.
    - Loop prevention: when redirected to `/sign-in?reason=expired` with a stale cookie, `proxy` deletes `SESSION_COOKIE_NAME` on the outgoing response and permits `/sign-in` to render.
- **Server-Side Session Gates & Cookie Persistence (`session.server.ts`, `session-gate.tsx`)**:
  - `session.server.ts` marks server-only boundaries (`import 'server-only'`) and uses `next/headers` (`cookies()`) to read, issue, and clear `SESSION_COOKIE_NAME` (`felops_session`) and `RESET_TOKEN_COOKIE_NAME` (`felops_reset_token`) with `httpOnly: true`, `sameSite: 'lax'`, `path: '/'`, and `secure: process.env.NODE_ENV === 'production'`.
  - `SessionGate` wraps `getSession()` and `hasSessionCookie()` inside a React `<Suspense>` boundary so layouts keep static-shell compatibility under Next.js `cacheComponents: true`.
  - Protected layouts (`src/app/(onboarding)/layout.tsx`, `src/app/account/layout.tsx`, `src/app/(protected)/w/[workspaceId]/layout.tsx`) validate the active session on the server before rendering protected children.
- **Open-Redirect Prevention (`redirect.ts`)**:
  - `getSafeRedirectPath(nextParam, fallback = DEFAULT_AUTH_REDIRECT)` accepts only relative paths starting with a single `/` and rejects protocol-relative URLs (`//evil.com`), backslashes (`/\`, control characters), and cross-origin schemes (`https://...`, `javascript:...`) by parsing against a fixed local base origin.
- **Single-Flight 401 Client Handling (`unauthorized.ts`)**:
  - `handleUnauthorized` uses a module-level boolean lock (`isHandlingUnauthorized`) so concurrent `401` responses trigger only one `signOut()` request and one navigation to `/sign-in?next=...`, short-circuiting when already on auth entry routes (`/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`).
- **Validation & Error Sanitization (`schema.ts`, `types.ts`, `mappers.ts`)**:
  - All form inputs are validated client-side with Zod schemas (`emailSchema`, `passwordSchema`, `otpCodeSchema`, `signInSchema`, `signUpSchema`, `forgotPasswordSchema`, `verifyOtpSchema`, `resetPasswordSchema`).
  - `AuthApiError` extends base `ApiError<AuthErrorCode>` (`src/lib/api/errors.ts`) with optional OTP timing metadata (`AuthApiErrorMeta`).
  - `mapAuthError(error)` translates every `AuthErrorCode`, `ApiError` status code, and thrown `Error` into generic, enumeration-safe copy without leaking raw fetch messages or stack traces.

## Routes and Files Touched
- **Route(s)**:
  - `/sign-in`: Server page (`Metadata`) + `SignInForm` client component with `?reset=true`, `?reason=expired`, `?next=...`, and automatic `VerifyOtpModal` resumption on `EMAIL_NOT_VERIFIED`.
  - `/sign-up`: Server page (`Metadata`) + `SignUpForm` client component with live `PasswordRequirements` checklist and `VerifyOtpModal` email verification.
  - `/forgot-password`: Server page (`Metadata`) + `ForgotPasswordForm` client component with enumeration-safe confirmation and `VerifyOtpModal` reset code verification.
  - `/reset-password`: Server `ResetPasswordGate` (`<Suspense>`) validating the `httpOnly` reset-session cookie (`getResetSession()`) before rendering `ResetPasswordForm`.
  - `/reset-password/[token]`: Server `ResetTokenGate` (`<Suspense>`) validating single-use token status (`valid`, `expired`, `used`, `invalid`) and exchanging valid link tokens via `ResetTokenExchange` (`POST /api/auth/reset-session`).
  - `/invite/[token]`: Server `InviteTokenGate` (`<Suspense>`) validating workspace invitations and rendering `AcceptInviteForm` (`acceptInviteAction`) or sign-in/sign-up links preserving `?next`.
  - `/api/auth/*`: Route Handlers for `sign-in`, `sign-up`, `verify-email`, `resend-code`, `forgot-password`, `verify-reset-code`, `reset-password`, `reset-session`, `sign-out`, and `session`.
- **Files**:
  - *Shared Error Base (`src/lib/api/`)*:
    - `src/lib/api/errors.ts`: Base `ApiError<TCode>` class (`status`, `code`, `message`, `cause`) and `ApiErrorOptions`.
  - *Auth Domain Layer (`src/features/auth/`)*:
    - `src/features/auth/constants.ts`: `SESSION_COOKIE_NAME`, `RESET_TOKEN_COOKIE_NAME`, `DEFAULT_AUTH_REDIRECT`, `SIGN_IN_PATH`.
    - `src/features/auth/types.ts`: `User`, `UserDto`, `Session`, `AuthErrorCode`, `AuthApiErrorMeta`, `AuthApiError`, `OtpPurpose`, `TokenValidationStatus`, `ResetTokenValidation`, `InviteDetails`, and request/response payload interfaces.
    - `src/features/auth/schema.ts`: Consolidated Zod schemas (`emailSchema`, `passwordSchema`, `otpCodeSchema`, `signInSchema`, `signUpSchema`, `forgotPasswordSchema`, `verifyOtpSchema`, `resetPasswordSchema`) and inferred input types.
    - `src/features/auth/mappers.ts`: `mapAuthError` and `mapUserDtoToUser`.
    - `src/features/auth/redirect.ts`: `getSafeRedirectPath`.
    - `src/features/auth/service.ts`: Auth service operations (`signIn`, `signUp`, `verifyEmail`, `resendCode`, `forgotPassword`, `verifyResetCode`, `resetPassword`, `signOut`, `getSession`) and server token helpers (`signInWithToken`, `verifyEmailWithToken`, `getSessionByToken`, `signOutByToken`, `validateResetTokenStatus`, `validateInviteToken`, `acceptInviteToken`).
    - `src/features/auth/session.server.ts`: Server-only cookie helpers (`getSessionToken`, `hasSessionCookie`, `getSession`, `createSessionCookie`, `clearSessionCookie`, `createResetTokenCookie`, `getResetTokenCookie`, `getResetSession`, `clearResetTokenCookie`).
    - `src/features/auth/session-gate.tsx`: `<SessionGate>` Server Component wrapping `cookies()` access in `<Suspense>`.
    - `src/features/auth/actions.ts`: `'use server'` Server Actions (`logoutAction`, `acceptInviteAction`).
    - `src/features/auth/route-helpers.ts`: Shared Route Handler utilities (`jsonErrorResponse`, `parseJsonBody`).
    - `src/features/auth/unauthorized.ts`: Single-flight 401 client redirect utility (`handleUnauthorized`, `resetUnauthorizedHandlerLock`).
    - `src/features/auth/index.ts`: Client-safe public barrel exports (explicitly omitting `session.server.ts`, `session-gate.tsx`, `actions.ts`, and `route-helpers.ts`).
  - *Feature-Based Module Structure (`src/features/auth/components/`)*:
    - `src/features/auth/components/auth-field.tsx`: `AuthField` wrapper built on `Label` + `Input` with `aria-invalid`, `aria-describedby`, `role="alert"` error text, `labelRight`, and `endAdornment`.
    - `src/features/auth/components/password-field.tsx`: `PasswordField` wrapping `AuthField` with show/hide visibility toggle (`aria-pressed`, dynamic `aria-label`).
    - `src/features/auth/components/password-requirements.tsx`: Live `PasswordRequirements` checklist mirroring `passwordSchema` rules.
    - `src/features/auth/components/verify-otp-modal.tsx`: Accessible 6-digit `VerifyOtpModal` built on `Modal` with separate `expiresAt` and `resendAvailableAt` timers.
    - `src/features/auth/components/index.ts`: Component barrel exports.
  - *Edge/Network Proxy & Protected Layouts*:
    - `src/proxy.ts`: Next.js 16 optimistic route protection proxy.
    - `src/app/(onboarding)/layout.tsx`: Wraps onboarding routes in `<SessionGate>`.
    - `src/app/account/layout.tsx`: Wraps `/account/*` routes in `<SessionGate>`.
    - `src/app/(protected)/w/[workspaceId]/layout.tsx`: Validates session and workspace membership inside `<Suspense>`.

## UI States
- **Loading**:
  - Page-level `<Suspense>` boundaries render centered `Loader2` spinners or layout skeletons while reading `cookies()` or `searchParams`.
  - Form submit buttons pass `isLoading={isSubmitting}` to `Button` and disable inputs to prevent duplicate submissions.
  - `VerifyOtpModal` disables OTP inputs, close controls (`closeDisabled={isVerifying}`), and resend triggers while verification or resend requests are in flight.
  - `/reset-password/[token]` displays a centered verification spinner while `ResetTokenExchange` swaps the link token into an `httpOnly` cookie.
- **Empty**:
  - Initial form fields render with neutral placeholders and unactivated `PasswordRequirements` indicators (`text-neutral-400`).
  - Missing or uninitialized `resetToken` sessions on `/reset-password` render an explicit empty/missing-session prompt linking to `/forgot-password`.
- **Error**:
  - Field-level Zod and targeted server errors (`EMAIL_TAKEN`) render inline via `<p id="<id>-error" role="alert">` and `aria-invalid="true"`.
  - Form-level errors (`INVALID_CREDENTIALS`, `NETWORK`, `RATE_LIMITED`, `UNKNOWN`) render inside `<Alert variant="error">`.
  - Expired, used, or invalid tokens on `/reset-password`, `/reset-password/[token]`, and `/invite/[token]` render dedicated `Alert` error/warning cards with recovery CTAs.
  - `VerifyOtpModal` clears digits, triggers visual feedback, refocuses the first digit box, and displays mapped `Alert` messages on `OTP_INVALID`, `OTP_EXPIRED`, or `429 RATE_LIMITED`.
- **Success**:
  - `SignInForm` and OTP verification redirect via `router.replace(safeRedirectPath)` + `router.refresh()` with `httpOnly` session cookie persisted.
  - `SignInForm` displays `<Alert variant="success">` when `?reset=true` is present.
  - `ForgotPasswordForm` always displays an enumeration-safe `<Alert variant="info">` confirmation message and opens `VerifyOtpModal`.
  - `ResetPasswordForm` renders a `CheckCircle2` confirmation view before redirecting to `/sign-in?reset=true`.

## Data and Types

### Backend API Contract
- `POST /api/auth/sign-in`: Authenticates credentials, issues `httpOnly` `felops_session` cookie, and returns `{ session }`; returns `403 EMAIL_NOT_VERIFIED` with OTP timing metadata for unverified accounts.
- `POST /api/auth/sign-up`: Registers an unverified account, issues verification OTP, and returns `201` `{ message, email, requiresVerification, expiresAt, resendAvailableAt }`.
- `POST /api/auth/verify-email`: Validates 6-digit OTP, marks user verified, issues `httpOnly` `felops_session` cookie, and returns `{ session }`.
- `POST /api/auth/resend-code`: Re-issues verification or reset OTP with cooldown enforcement (`429 RATE_LIMITED`) and returns `{ message, cooldownSeconds, expiresAt, resendAvailableAt }`.
- `POST /api/auth/forgot-password`: Issues reset OTP if account exists and always returns enumeration-safe `{ message, expiresAt, resendAvailableAt }`.
- `POST /api/auth/verify-reset-code`: Verifies reset OTP, issues single-use `resetToken`, sets `httpOnly` `felops_reset_token` cookie, and returns `{ resetToken, expiresAt }`.
- `POST /api/auth/reset-session`: Exchanges a valid URL reset link token into the `httpOnly` `felops_reset_token` cookie.
- `POST /api/auth/reset-password`: Consumes `resetToken` (from `httpOnly` cookie or payload), updates password, marks token used, and clears `felops_reset_token`.
- `POST /api/auth/sign-out`: Revokes active session token and clears `felops_session` cookie.
- `GET /api/auth/session`: Validates `felops_session` cookie and returns `{ session }` (`200`) or `{ session: null }` (`401`).

### TypeScript Domain Models (`src/features/auth/types.ts`)
```ts
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

export type OtpPurpose = 'verify_email' | 'reset_password';
export type TokenValidationStatus = 'valid' | 'expired' | 'used' | 'invalid';
```

### Mock Service Architecture (`src/features/auth/service.ts`)
- **Shared Server Store**: Uses a `globalThis`-persisted `MockAuthStores` singleton (`accountStore`, `otpStore`, `resetTokenStore`, `inviteStore`, `sessionStore`) so Server Components, Server Actions, and Route Handlers share consistent state during development.
- **Environment Routing**: Browser calls delegate to `/api/auth/*` via `fetch(..., { credentials: 'same-origin' })` so `httpOnly` cookies are managed by Next.js Route Handlers; server callers execute directly against the store.
- **Stateful Rules**: Tracks unverified accounts (`pending@felops.com`), enforces 30s resend cooldown (`RATE_LIMITED`), enforces 5-minute OTP TTL and 10-minute single-use `resetToken` TTL, and seeds demo reset/invite tokens (`rst_demo_valid`, `rst_demo_expired`, `rst_demo_used`, `inv_demo_valid`, `inv_demo_expired`, `inv_demo_used`).

## Form and Validation

### Schema (`src/features/auth/schema.ts`)
```ts
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Email address is required')
  .email('Please enter a valid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(72, 'Password must be 72 characters or fewer')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(
    /[^A-Za-z0-9]/,
    'Password must contain at least one special character'
  );

export const otpCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, 'Verification code must be exactly 6 digits');
```
- Form schemas built from these primitives: `signInSchema`, `signUpSchema`, `forgotPasswordSchema`, `verifyOtpSchema`, and `resetPasswordSchema` (with `.refine()` checking `password === confirmPassword`).

### Form Handling Rules
- **Form Engine**: `react-hook-form` + `@hookform/resolvers/zod` with `noValidate` on every `<form>`, `mode: 'onTouched'`, `shouldFocusError: true`, and `criteriaMode: 'all'` on password creation/reset forms.
- **Reactive Field Watching**: Uses `useWatch` rather than `watch()` to feed `PasswordRequirements` cleanly without React Compiler memoization warnings.
- **Server Error Routing**: `EMAIL_TAKEN` maps to `setError('email', ...)` with focus; authentication, network, and rate-limit errors render in `<Alert variant="error">`.

## Components

### Reused UI Components
- `src/components/ui/input.tsx`: `Input` (`surface="dark"`, `isError` ring/border states).
- `src/components/ui/button.tsx`: `Button` (`isLoading` spinner, disabled states, `surface="dark" | "light"`).
- `src/components/ui/label.tsx`: `Label` (`htmlFor`, `required`).
- `src/components/ui/alert.tsx`: `Alert` (`role="alert"`, `info | success | warning | error` variants).
- `src/components/ui/modal.tsx`: `Modal` with `aria-labelledby`, `aria-describedby`, Tab focus trapping, `closeDisabled`, `initialFocusRef`, and focus restoration on close.
- `src/components/common/SplitLayout.tsx`: Split branding/card shell shared by `(auth)` and `(onboarding)`.

### Feature Auth Components (`src/features/auth/components/`)
- `auth-field.tsx`: `AuthField` combining `Label`, `Input`, `labelRight`, `endAdornment`, and accessible inline errors.
- `password-field.tsx`: `PasswordField` wrapping `AuthField` with a password visibility toggle (`aria-pressed`, `aria-label`).
- `password-requirements.tsx`: `PasswordRequirements` live rule checklist.
- `verify-otp-modal.tsx`: `VerifyOtpModal` multi-digit PIN modal with dual `expiresAt` and `resendAvailableAt` timers.

### Colocated Route Components (`src/app/(auth)/`)
- `sign-in/_components/sign-in-form.tsx`: `SignInForm`
- `sign-up/_components/sign-up-form.tsx`: `SignUpForm`
- `forgot-password/_components/forgot-password-form.tsx`: `ForgotPasswordForm`
- `reset-password/_components/reset-password-form.tsx`: `ResetPasswordForm`
- `reset-password/[token]/_components/reset-token-exchange.tsx`: `ResetTokenExchange`
- `invite/[token]/_components/accept-invite-form.tsx`: `AcceptInviteForm`

## Accessibility Notes
- **Labels & Autocomplete**: Every input has a matching `<label htmlFor>` / `<input id>` and standard `autoComplete` attributes (`email`, `current-password`, `new-password`, `name`, `one-time-code`).
- **Validation & Alerts**: Invalid fields expose `aria-invalid` and `aria-describedby` linked to `<p id="<id>-error" role="alert">`; form-level alerts use `role="alert"`; password visibility buttons expose `aria-pressed` and dynamic `aria-label`.
- **OTP Modal & Keyboard Behavior**: `VerifyOtpModal` inherits `role="dialog"`, `aria-modal="true"`, `Escape` handling, Tab focus trap, and focus restoration from `Modal`; individual digit inputs expose `aria-label="Digit N of 6"`, support `ArrowLeft`/`ArrowRight`/`Backspace`/`Home`/`End`, handle multi-digit autofill/paste, and return focus to digit 1 on invalid code submission.
- **Design Tokens & Hygiene**: All colors use `globals.css` semantic tokens (`secondary-*`, `neutral-*`, `wrong-*`, `right-*`) with zero raw hex values, no `bg-white`/`text-white` overrides, and zero `console.log` statements.

## Acceptance Criteria

### Phase 0: Architecture & Proxy Route Protection
- [x] Implement `src/proxy.ts` with Next.js 16 `proxy()` and static `matcher` excluding `/api`, `_next/static`, `_next/image`, `favicon.ico`, and static assets.
- [x] Implement `src/features/auth/redirect.ts` (`getSafeRedirectPath`) rejecting protocol-relative, backslash, and external redirect URLs.
- [x] Implement `src/features/auth/session.server.ts` (`getSession`, `createSessionCookie`, `clearSessionCookie`, `createResetTokenCookie`, `getResetSession`, `clearResetTokenCookie`) using `httpOnly`, `SameSite=Lax` cookies.
- [x] Implement `src/features/auth/session-gate.tsx` (`SessionGate`) wrapping `cookies()` access in `<Suspense>` across `(onboarding)`, `account`, and `w/[workspaceId]` layouts.
- [x] Implement `logoutAction` and `acceptInviteAction` in `src/features/auth/actions.ts`, plus single-flight `handleUnauthorized` in `src/features/auth/unauthorized.ts`.

### Phase 1: Zod Validation & Error Foundations
- [x] Extract shared base `ApiError` in `src/lib/api/errors.ts` and extend it cleanly in `AuthApiError` (`src/features/auth/types.ts`).
- [x] Consolidate all auth Zod schemas (`emailSchema`, `passwordSchema`, `otpCodeSchema`, `signInSchema`, `signUpSchema`, `forgotPasswordSchema`, `verifyOtpSchema`, `resetPasswordSchema`) in `src/features/auth/schema.ts`.
- [x] Implement `mapAuthError` and `mapUserDtoToUser` in `src/features/auth/mappers.ts` with safe, enumeration-resistant copy.
- [x] Centralize constants (`constants.ts`), route helpers (`route-helpers.ts`), and client-safe barrel exports (`index.ts`).

### Phase 2: Auth UI Components & Mock Flows
- [x] Build `AuthField`, `PasswordField`, and `PasswordRequirements` in `src/features/auth/components/` on top of `src/components/ui`.
- [x] Rebuild `VerifyOtpModal` (`src/features/auth/components/verify-otp-modal.tsx`) on `Modal` with focus trap, focus return, `one-time-code` autofill/paste, keyboard navigation, and separate `expiresAt` / `resendAvailableAt` timers.
- [x] Split `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`, `/reset-password/[token]`, and `/invite/[token]` into Server Component `page.tsx` files (`Metadata` + `<Suspense>`) and colocated Client Components.
- [x] Wire stateful `globalThis` mock service (`src/features/auth/service.ts`) and `/api/auth/*` Route Handlers, including `EMAIL_NOT_VERIFIED` OTP resumption and `httpOnly` reset-token verification.

### Phase 3: Backend API Integration (`service.ts`)
- [ ] Replace `globalThis` in-memory stores (`INITIAL_ACCOUNTS`, `INITIAL_RESET_TOKENS`, `INITIAL_INVITES`, `MOCK_DEFAULT_OTP`) in `src/features/auth/service.ts` with live backend HTTP calls.
- [ ] Configure environment-based backend API base URL and server-to-backend request forwarding inside `src/app/api/auth/*` Route Handlers.
- [ ] Propagate backend HTTP status codes (`401`, `403`, `409`, `429`, `5xx`) into typed `AuthApiError` instances.

### Phase 4: DTO Mappers & Error Meta Alignment (`mappers.ts`)
- [ ] Align `UserDto` and `mapUserDtoToUser` in `src/features/auth/mappers.ts` with finalized backend user payload schemas.
- [ ] Map backend response fields for OTP `expiresAt`, `resendAvailableAt`, and reset/invite token payloads into `AuthApiErrorMeta` and domain response types.
- [ ] Verify all backend error codes map cleanly through `mapAuthError` without exposing raw backend error payloads.

### Phase 5: Real Cookie & Session Lifecycle Activation (`session.server.ts`)
- [ ] Replace mock opaque session tokens with backend-issued signed/encrypted session tokens and token verification in `src/features/auth/session.server.ts`.
- [ ] Implement session refresh/rotation and server-side revocation on sign-out and password reset.
- [ ] Remove `/api/auth/*` mock-only state mutations where superseded by direct backend session cookies or BFF token exchange.

### Phase 6: End-to-End Verification & Cleanup
- [ ] Execute full end-to-end verification across sign-up, `EMAIL_NOT_VERIFIED` sign-in resumption, OTP resend rate limiting, token-based password reset, invite acceptance, and `logoutAction` against the live backend.
- [ ] Remove any remaining mock constants, seeded test accounts, and placeholder TODO comments in `src/features/auth/`.
- [ ] Run `npx tsc --noEmit`, `npm run lint`, and `npm run build` with zero errors before final release.
