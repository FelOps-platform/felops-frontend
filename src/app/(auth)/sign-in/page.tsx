import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className=" text-2xl font-bold">/sign-in</h1>

      <div className="flex flex-col gap-2">
        <Link
          href="/forgot-password"
          className="rounded border border-slate-700  px-4 py-2 text-sm  "
        >
          Forgot password &rarr; /forgot-password
        </Link>
        <Link
          href="/workspaces"
          className="rounded border border-slate-700  px-4 py-2 text-sm  "
        >
          Login success + token Not found &rarr; /workspaces
        </Link>
        <Link
          href="/invite/token"
          className="rounded border border-slate-700  px-4 py-2 text-sm  "
        >
          Login success + token found &rarr; /invite/token
        </Link>
        <Link
          href="/sign-up"
          className="rounded border border-slate-700  px-4 py-2 text-sm  "
        >
          Create account &rarr; /sign up
        </Link>
      </div>
    </div>
  );
}
