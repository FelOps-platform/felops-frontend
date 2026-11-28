"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button } from "@/components/ui";
import {
  AuthApiError,
  DEFAULT_AUTH_REDIRECT,
  getSafeRedirectPath,
  mapAuthError,
  resendCode,
  signIn,
  signInSchema,
  verifyEmail,
  type SignInInput,
} from "@/features/auth";
import {
  AuthField,
  PasswordField,
  VerifyOtpModal,
} from "@/features/auth/components";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Resume verification state for unverified accounts
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | undefined>(undefined);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [otpExpiresAt, setOtpExpiresAt] = useState<string | undefined>(undefined);
  const [resendAvailableAt, setResendAvailableAt] = useState<string | undefined>(
    undefined,
  );

  const isPasswordReset = searchParams.get("reset") === "true";
  const isSessionExpired = searchParams.get("reason") === "expired";
  const rawNext = searchParams.get("next");
  const safeRedirectPath = getSafeRedirectPath(rawNext, DEFAULT_AUTH_REDIRECT);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onTouched",
    shouldFocusError: true,
  });

  const onSubmit = async (data: SignInInput) => {
    setGeneralError(null);
    try {
      await signIn(data);
      router.replace(safeRedirectPath);
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof AuthApiError && err.code === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(data.email);
        setOtpExpiresAt(err.meta?.expiresAt);
        setResendAvailableAt(err.meta?.resendAvailableAt);
        setOtpError(undefined);
        setIsOtpModalOpen(true);
        return;
      }
      setGeneralError(mapAuthError(err));
    }
  };

  const handleVerifyOtp = async (otpCode: string): Promise<boolean> => {
    setIsVerifyingOtp(true);
    setOtpError(undefined);

    try {
      await verifyEmail({ email: unverifiedEmail, code: otpCode });
      setIsOtpModalOpen(false);
      router.replace(safeRedirectPath);
      router.refresh();
      return true;
    } catch (err: unknown) {
      setOtpError(mapAuthError(err));
      return false;
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpError(undefined);

    try {
      const response = await resendCode({
        email: unverifiedEmail,
        purpose: "verify_email",
      });
      setOtpExpiresAt(response.expiresAt);
      setResendAvailableAt(response.resendAvailableAt);
    } catch (err: unknown) {
      if (err instanceof AuthApiError && err.meta) {
        if (err.meta.expiresAt) setOtpExpiresAt(err.meta.expiresAt);
        if (err.meta.resendAvailableAt) {
          setResendAvailableAt(err.meta.resendAvailableAt);
        }
      }
      setOtpError(mapAuthError(err));
    }
  };

  const signUpHref = rawNext
    ? `/sign-up?next=${encodeURIComponent(safeRedirectPath)}`
    : "/sign-up";

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-secondary-50">
          Sign In
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Access your Workspace and continue your work.
        </p>
      </div>

      {isPasswordReset ? (
        <Alert variant="success" className="mb-4">
          Your password has been updated. Please sign in.
        </Alert>
      ) : null}

      {isSessionExpired && !generalError ? (
        <Alert variant="warning" className="mb-4">
          Your session has expired. Please sign in again.
        </Alert>
      ) : null}

      {generalError ? (
        <Alert variant="error" className="mb-4">
          {generalError}
        </Alert>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <AuthField
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          disabled={isSubmitting}
          error={errors.email?.message}
          {...register("email")}
        />

        <PasswordField
          id="password"
          label="Password"
          autoComplete="current-password"
          placeholder="Enter your password"
          disabled={isSubmitting}
          error={errors.password?.message}
          labelRight={
            <Link
              href="/forgot-password"
              className="text-xs text-neutral-400 hover:text-secondary-50 transition-colors"
            >
              Forgot password?
            </Link>
          }
          {...register("password")}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="w-full mt-2"
        >
          {isSubmitting ? "Signing In..." : "Sign In"}
        </Button>

        <div className="flex items-center justify-center text-xs text-neutral-400 pt-2 gap-1.5">
          <span>Don&apos;t have an account?</span>
          <Link
            href={signUpHref}
            className="text-secondary-50 font-medium hover:underline hover:text-neutral-50 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </form>

      <VerifyOtpModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        email={unverifiedEmail}
        title="Verify your email"
        description="Your account is not verified yet. Enter the 6-digit code sent to"
        isVerifying={isVerifyingOtp}
        error={otpError}
        expiresAt={otpExpiresAt}
        resendAvailableAt={resendAvailableAt}
        onClearError={() => setOtpError(undefined)}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
      />
    </div>
  );
}
