"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button } from "@/components/ui";
import {
  DEFAULT_AUTH_REDIRECT,
  getSafeRedirectPath,
  mapAuthError,
  signIn,
  signInSchema,
  type SignInInput,
} from "@/features/auth";
import { AuthField, PasswordField } from "@/features/auth/components";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [generalError, setGeneralError] = useState<string | null>(null);

  const isPasswordReset = searchParams.get("reset") === "true";
  const isSessionExpired = searchParams.get("reason") === "expired";
  const safeRedirectPath = getSafeRedirectPath(
    searchParams.get("next"),
    DEFAULT_AUTH_REDIRECT,
  );

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
      setGeneralError(mapAuthError(err));
    }
  };

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
            href="/sign-up"
            className="text-secondary-50 font-medium hover:underline hover:text-neutral-50 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </form>
    </div>
  );
}
