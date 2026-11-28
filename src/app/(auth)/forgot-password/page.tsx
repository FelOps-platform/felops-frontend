"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertCircle } from "lucide-react";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/features/auth";
import VerifyOtpModal from "../_components/VerifyOtpModal";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [generalError, setGeneralError] = useState<string | null>(null);

  // OTP Modal State
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
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setGeneralError(null);
    try {
      // TODO: Call backend API to send password reset code
      // await authService.forgotPassword(data);

      setSubmittedEmail(data.email);
      setOtpError(undefined);
      setIsOtpModalOpen(true);
    } catch (err: unknown) {
      setGeneralError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    }
  };

  const handleVerifyOtp = async (otpCode: string) => {
    setIsVerifyingOtp(true);
    setOtpError(undefined);

    try {
      void otpCode;
      // TODO: Call backend API to verify password reset code
      // const response = await authService.verifyResetCode({ email: submittedEmail, code: otpCode });

      setIsOtpModalOpen(false);

      // Redirect user to reset password page
      router.push(`/reset-password?email=${encodeURIComponent(submittedEmail)}`);
    } catch (err: unknown) {
      setOtpError(
        err instanceof Error
          ? err.message
          : "Invalid or expired verification code. Please try again.",
      );
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpError(undefined);

    try {
      // TODO: Call backend API to resend password reset code
      // await authService.forgotPassword({ email: submittedEmail });
    } catch (err: unknown) {
      setOtpError(
        err instanceof Error
          ? err.message
          : "Failed to resend code. Please try again.",
      );
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

      {generalError && (
        <div className="mb-4 p-3 rounded-xl bg-wrong-500/10 border border-wrong-500/20 text-wrong-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Email Address */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-xs font-medium text-neutral-300"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            {...register("email")}
            className={`w-full px-4 py-3 rounded-xl bg-neutral-900/40 border text-secondary-50 placeholder-neutral-500 text-sm focus:outline-none transition-colors ${
              errors.email
                ? "border-wrong-500/80 focus:border-wrong-500"
                : "border-secondary-50/20 focus:border-secondary-50"
            }`}
          />
          {errors.email?.message && (
            <p className="text-xs text-wrong-400 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 py-3.5 px-4 rounded-xl bg-secondary-50 text-secondary-950 font-semibold text-sm hover:bg-secondary-100 transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending code...</span>
            </>
          ) : (
            <span>Send Reset Code</span>
          )}
        </button>

        {/* Back to Sign In Link */}
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

      {/* Reusable OTP Verification Modal */}
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
