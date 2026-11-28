"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { Alert, Button } from "@/components/ui";
import {
  mapAuthError,
  resetPassword,
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/features/auth";
import {
  PasswordField,
  PasswordRequirements,
} from "@/features/auth/components";

export function ResetPasswordForm() {
  const router = useRouter();
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      resetToken: "session-cookie",
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
    criteriaMode: "all",
    shouldFocusError: true,
  });

  const passwordValue = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setGeneralError(null);
    try {
      await resetPassword({
        resetToken: "",
        newPassword: data.password,
      });

      setIsSuccess(true);
      window.setTimeout(() => {
        router.replace("/sign-in?reset=true");
        router.refresh();
      }, 1500);
    } catch (err: unknown) {
      setGeneralError(mapAuthError(err));
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full text-center py-4 space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-right-500/10 border border-right-500/20 flex items-center justify-center text-right-500">
          <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-secondary-50">
          Password Reset Successful
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-sm mx-auto">
          Your password has been securely updated. Redirecting you to sign in...
        </p>
        <div className="pt-2">
          <Link
            href="/sign-in?reset=true"
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
          Create a new strong password for your account.
        </p>
      </div>

      {generalError ? (
        <Alert variant="error" className="mb-4">
          {generalError}
        </Alert>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <input type="hidden" {...register("resetToken")} />

        <div className="space-y-2">
          <PasswordField
            id="password"
            label="New Password"
            autoComplete="new-password"
            placeholder="Create a strong password"
            hintId="reset-password-requirements"
            disabled={isSubmitting}
            error={errors.password?.message}
            {...register("password")}
          />
          <PasswordRequirements
            id="reset-password-requirements"
            value={passwordValue}
            showFailures={Boolean(errors.password || isSubmitted)}
          />
        </div>

        <PasswordField
          id="confirmPassword"
          label="Confirm New Password"
          autoComplete="new-password"
          placeholder="Re-enter your new password"
          disabled={isSubmitting}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="w-full mt-2"
        >
          {isSubmitting ? "Resetting Password..." : "Reset Password"}
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
    </div>
  );
}
