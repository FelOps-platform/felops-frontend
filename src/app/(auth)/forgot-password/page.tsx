import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Forgot Password | FelOps",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 p-6 text-slate-100">
      <h1 className="font-mono text-2xl font-bold">/forgot-password</h1>

      <div className="flex flex-col gap-2">
        <Link
          href="/verify-email"
          className="rounded border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-700 hover:text-white"
        >
          Submit &rarr; /verify-email
        </Link>
      </div>
    </div>
  );
}
