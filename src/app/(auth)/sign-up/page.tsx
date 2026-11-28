import { Suspense } from "react";
import type { Metadata } from "next";
import { Loader2 } from "lucide-react";
import { SignUpForm } from "./_components/sign-up-form";

export const metadata: Metadata = {
  title: "Create Account | FelOps",
  description: "Create a FelOps account and start configuring your AI agents.",
};

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-secondary-50" />
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}
