"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Alert } from "@/components/ui";

export function ResetTokenExchange({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function exchangeToken() {
      try {
        const response = await fetch("/api/auth/reset-session", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as {
            message?: string;
          } | null;
          if (active) {
            setError(
              body?.message ||
                "This password reset link is invalid or has expired.",
            );
          }
          return;
        }

        if (active) {
          router.replace("/reset-password");
          router.refresh();
        }
      } catch {
        if (active) {
          setError("Unable to verify your reset link. Please try again.");
        }
      }
    }

    void exchangeToken();

    return () => {
      active = false;
    };
  }, [token, router]);

  if (error) {
    return (
      <div className="w-full space-y-5">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-secondary-50">
          Reset Link Unavailable
        </h2>
        <Alert variant="error">{error}</Alert>
        <Link
          href="/forgot-password"
          className="w-full inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-secondary-500 text-secondary-50 hover:bg-secondary-600 text-sm font-semibold transition-colors"
        >
          Request New Reset Code
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-center py-10 gap-3 text-center">
      <Loader2 className="w-6 h-6 animate-spin text-secondary-50" />
      <p className="text-sm text-neutral-300">
        Verifying your password reset link...
      </p>
    </div>
  );
}
