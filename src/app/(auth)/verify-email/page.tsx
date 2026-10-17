import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4  p-6 ">
      <h1 className=" text-2xl font-bold">/verify-email</h1>

      <div className="flex flex-col gap-2">
        <Link
          href="/reset-password/token"
          className="rounded border border-slate-700  px-4 py-2 text-sm  "
        >
          OTP valid for reset &rarr; /reset-password/token
        </Link>
        <Link
          href="/invite/token"
          className="rounded border border-slate-700  px-4 py-2 text-sm  "
        >
          valid + token found &rarr; /invite/token
        </Link>
        <Link
          href="/workspaces"
          className="rounded border border-slate-700  px-4 py-2 text-sm  "
        >
          valid &rarr; /workspaces
        </Link>
      </div>
    </div>
  );
}
