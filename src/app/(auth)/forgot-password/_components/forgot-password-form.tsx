"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button } from "@/components/ui";
import {
  forgotPassword,
  forgotPasswordSchema,
  mapAuthError,
  resendCode,
  verifyResetCode,
  type ForgotPasswordInput,
} from "@/features/auth";
import { AuthField } from "@/features/auth/components";
import VerifyOtpModal from "../../_components/VerifyOtpModal";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(
    null,
  );

  // OTP Modal State (refactored in Phase 4)
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | undefined>(undefined);
  const [submittedEmail, setSubmittedEmail] = useState("");

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
      await forgotPassword({ email: data.email });

      setSubmittedEmail(data.email);
      setConfirmationMessage(
        "If an account exists for that email, we've sent a verification code.",
      );
      setOtpError(undefined);
      setIsOtpModalOpen(true);
    } catch (err: unknown) {
      setGeneralError(mapAuthError(err));
    }
  };

  const handleVerifyOtp = async (otpCode: string) => {
    setIsVerifyingOtp(true);
    setOtpError(undefined);

    try {
      const { resetToken } = await verifyResetCode({
        email: submittedEmail,
        code: otpCode,
      });

      setIsOtpModalOpen(false);
      router.push(`/reset-password?token=${encodeURIComponent(resetToken)}`);
    } catch (err: unknown) {
      setOtpError(mapAuthError(err));
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpError(undefined);

    try {
      await resendCode({ email: submittedEmail, purpose: "reset_password" });
    } catch (err: unknown) {
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
        onClearError={() => setOtpError(undefined)}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
      />
    </div>
  );
}
