import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Alert } from "@/components/ui";
import { validateResetTokenStatus } from "@/features/auth/service";
import { ResetTokenExchange } from "./_components/reset-token-exchange";

export const metadata: Metadata = {
  title: "Verify Reset Link | FelOps",
  description: "Validating your password reset request.",
};

async function ResetTokenGate({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const validation = await validateResetTokenStatus(token);

  if (validation.status !== "valid") {
    const title =
      validation.status === "expired"
        ? "Reset Link Expired"
        : validation.status === "used"
          ? "Reset Link Already Used"
          : "Invalid Reset Link";

    const message =
      validation.status === "expired"
        ? "This password reset link has expired. Please request a new code."
        : validation.status === "used"
          ? "This password reset link has already been used. Sign in with your new password or request another reset."
          : "This password reset link is invalid or could not be verified.";

    return (
      <div className="w-full space-y-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-secondary-50">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Security tokens are single-use and expire shortly after issue.
          </p>
        </div>

        <Alert variant={validation.status === "invalid" ? "error" : "warning"}>
          {message}
        </Alert>

        <div className="flex flex-col gap-3 pt-1">
          <Link
            href="/forgot-password"
            className="w-full inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-secondary-500 text-secondary-50 hover:bg-secondary-600 text-sm font-semibold transition-colors"
          >
            Request New Reset Code
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

  return <ResetTokenExchange token={token} />;
}

export default function ResetPasswordTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="w-full flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-secondary-50" />
        </div>
      }
    >
      <ResetTokenGate params={params} />
    </Suspense>
  );
}
