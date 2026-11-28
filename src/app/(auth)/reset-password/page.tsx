import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Alert } from "@/components/ui";
import { getResetSession } from "@/features/auth/session.server";
import { ResetPasswordForm } from "./_components/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password | FelOps",
  description: "Set a new password for your FelOps account.",
};

async function ResetPasswordGate() {
  const validation = await getResetSession();

  if (validation.status !== "valid") {
    const message =
      validation.status === "expired"
        ? "Your password reset session has expired. Please request a new verification code."
        : validation.status === "used"
          ? "This password reset session has already been used. Request a new code if you still need to update your password."
          : "A verified password reset session is required before setting a new password.";

    return (
      <div className="w-full space-y-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-secondary-50">
            Reset Session Required
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Verify your email code before updating your password.
          </p>
        </div>

        <Alert variant="warning">{message}</Alert>

        <div className="flex flex-col gap-3 pt-1">
          <Link
            href="/forgot-password"
            className="w-full inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-secondary-500 text-secondary-50 hover:bg-secondary-600 text-sm font-semibold transition-colors"
          >
            Request New Code
          </Link>
          <Link
            href="/sign-in"
            className="text-center text-xs text-neutral-400 hover:text-secondary-50 transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return <ResetPasswordForm />;
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
      <ResetPasswordGate />
    </Suspense>
  );
}
