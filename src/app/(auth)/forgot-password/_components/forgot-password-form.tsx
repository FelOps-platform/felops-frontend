"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button } from "@/components/ui";
import {
  AuthApiError,
  forgotPassword,
  forgotPasswordSchema,
  mapAuthError,
  resendCode,
  verifyResetCode,
  type ForgotPasswordInput,
} from "@/features/auth";
import { AuthField, VerifyOtpModal } from "@/features/auth/components";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(
    null,
  );

  // OTP Modal State
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | undefined>(undefined);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [otpExpiresAt, setOtpExpiresAt] = useState<string | undefined>(undefined);
  const [resendAvailableAt, setResendAvailableAt] = useState<string | undefined>(
    undefined,
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
    mode: "onTouched",
    shouldFocusError: true,
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setGeneralError(null);
    setConfirmationMessage(null);
    try {
      const response = await forgotPassword({ email: data.email });

      setSubmittedEmail(data.email);
      setOtpExpiresAt(response.expiresAt);
      setResendAvailableAt(response.resendAvailableAt);
      setConfirmationMessage(
        "If an account exists for that email, we've sent a verification code.",
      );
      setOtpError(undefined);
      setIsOtpModalOpen(true);
    } catch (err: unknown) {
      setGeneralError(mapAuthError(err));
    }
  };

  const handleVerifyOtp = async (otpCode: string): Promise<boolean> => {
    setIsVerifyingOtp(true);
    setOtpError(undefined);

    try {
      await verifyResetCode({
        email: submittedEmail,
        code: otpCode,
      });

      setIsOtpModalOpen(false);
      // Reset token is persisted in an httpOnly cookie; keep email and token out of the URL
      router.push("/reset-password");
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
        email: submittedEmail,
        purpose: "reset_password",
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

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-secondary-50">
          Forgot Password
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Enter your registered email address to receive a verification code.
        </p>
      </div>

      {confirmationMessage ? (
        <Alert variant="info" className="mb-4">
          {confirmationMessage}
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

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="w-full mt-2"
        >
          {isSubmitting ? "Sending code..." : "Send Reset Code"}
        </Button>

        <div className="flex items-center justify-center text-xs text-neutral-400 pt-2 gap-1.5">
          <span>Remember your password?</span>
          <Link
            href="/sign-in"
            className="text-secondary-50 font-medium hover:underline hover:text-neutral-50 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </form>

      <VerifyOtpModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        email={submittedEmail}
        title="Reset Password Verification"
        description="Enter the 6-digit code sent to"
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
