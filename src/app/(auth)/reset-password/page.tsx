"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/features/auth";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setGeneralError(null);
    try {
      void data;

      // TODO: Call backend API to reset password
      // await authService.resetPassword({
      //   email,
      //   password: data.password,
      // });

      setIsSuccess(true);

      // Delay briefly for user feedback before redirecting to Sign In
      setTimeout(() => {
        router.push("/sign-in?reset=true");
      }, 1500);
    } catch (err: unknown) {
      setGeneralError(
        err instanceof Error
          ? err.message
          : "Failed to reset password. Please try again.",
      );
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full text-center py-4 space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-right-500/10 border border-right-500/20 flex items-center justify-center text-right-500">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-secondary-50">
          Password Reset Successful
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-sm mx-auto">
          Your password has been securely updated. Redirecting you to sign in...
        </p>
        <div className="pt-2">
          <Link
            href="/sign-in"
            className="text-xs text-secondary-50 font-medium hover:underline hover:text-neutral-50 transition-colors"
          >
            Click here if you are not redirected
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-secondary-50">
          Reset Password
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          {email ? (
            <>
              Enter a new password for{" "}
              <span className="text-secondary-50 font-medium">{email}</span>
            </>
          ) : (
            "Create a new strong password for your account"
          )}
        </p>
      </div>

      {generalError && (
        <div className="mb-4 p-3 rounded-xl bg-wrong-500/10 border border-wrong-500/20 text-wrong-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* New Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="block text-xs font-medium text-neutral-300"
          >
            New Password
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

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="confirmPassword"
            className="block text-xs font-medium text-neutral-300"
          >
            Confirm New Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••••••"
              {...register("confirmPassword")}
              className={`w-full px-4 py-3 rounded-xl bg-neutral-900/40 border text-secondary-50 placeholder-neutral-500 text-sm focus:outline-none transition-colors pr-12 ${
                errors.confirmPassword
                  ? "border-wrong-500/80 focus:border-wrong-500"
                  : "border-secondary-50/20 focus:border-secondary-50"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-secondary-50 transition-colors cursor-pointer"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword?.message && (
            <p className="text-xs text-wrong-400 mt-1">
              {errors.confirmPassword.message}
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
              <span>Resetting Password...</span>
            </>
          ) : (
            <span>Reset Password</span>
          )}
        </button>

        {/* Sign In Link */}
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
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-secondary-50" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
