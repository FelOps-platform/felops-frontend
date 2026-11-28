import { Suspense } from "react";
import type { Metadata } from "next";
import { Loader2 } from "lucide-react";
import { SignInForm } from "./_components/sign-in-form";

export const metadata: Metadata = {
  title: "Sign In | FelOps",
  description: "Sign in to access your FelOps workspace and AI agents.",
};

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-secondary-50" />
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
