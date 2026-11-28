"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { signUpSchema, type SignUpInput } from "@/features/auth";
import VerifyOtpModal from "../_components/VerifyOtpModal";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // OTP Modal State
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | undefined>(undefined);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
    mode: "onTouched",
  });

  const onSubmit = async (data: SignUpInput) => {
    setGeneralError(null);
    try {
      // TODO: Call backend sign-up API here
      // const response = await authService.signUp(data);

      setRegisteredEmail(data.email);
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
      // TODO: Call backend verify OTP API here
      // await authService.verifyOtp({ email: registeredEmail, code: otpCode });

      setIsOtpModalOpen(false);

      // TODO: Redirect user after successful verification (e.g., router.push("/dashboard"))
    } catch (err: unknown) {
      setOtpError(
        err instanceof Error
          ? err.message
          : "Invalid verification code. Please try again.",
      );
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpError(undefined);

    try {
      // TODO: Call backend resend OTP API here
      // await authService.resendOtp({ email: registeredEmail });
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
          Create Account
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Start configuring your AI agents in minutes
        </p>
      </div>

      {generalError && (
        <div className="mb-4 p-3 rounded-xl bg-wrong-500/10 border border-wrong-500/20 text-wrong-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="fullName"
            className="block text-xs font-medium text-neutral-300"
          >
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder="Hana Ehab"
            {...register("fullName")}
            className={`w-full px-4 py-3 rounded-xl bg-neutral-900/40 border text-secondary-50 placeholder-neutral-500 text-sm focus:outline-none transition-colors ${
              errors.fullName
                ? "border-wrong-500/80 focus:border-wrong-500"
                : "border-secondary-50/20 focus:border-secondary-50"
            }`}
          />
          {errors.fullName?.message && (
            <p className="text-xs text-wrong-400 mt-1">
              {errors.fullName.message}
            </p>
          )}
        </div>

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

        {/* Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="block text-xs font-medium text-neutral-300"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••••••"
              {...register("password")}
              className={`w-full px-4 py-3 rounded-xl bg-neutral-900/40 border text-secondary-50 placeholder-neutral-500 text-sm focus:outline-none transition-colors pr-12 ${
                errors.password
                  ? "border-wrong-500/80 focus:border-wrong-500"
                  : "border-secondary-50/20 focus:border-secondary-50"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-secondary-50 transition-colors cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password?.message && (
            <p className="text-xs text-wrong-400 mt-1">
              {errors.password.message}
            </p>
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
              <span>Creating Account...</span>
            </>
          ) : (
            <span>Create Account</span>
          )}
        </button>

        {/* Sign In Link */}
        <div className="flex items-center justify-center text-xs text-neutral-400 pt-2 gap-1.5">
          <span>Already have an account?</span>
          <Link
            href="/sign-in"
            className="text-secondary-50 font-medium hover:underline hover:text-neutral-50 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </form>

      {/* OTP Verification Modal */}
      <VerifyOtpModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        email={registeredEmail}
        isVerifying={isVerifyingOtp}
        error={otpError}
        onClearError={() => setOtpError(undefined)}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
      />
    </div>
  );
}
