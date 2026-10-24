import Link from "next/link";

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4  p-6 ">
      <h1 className="font-mono text-2xl font-bold">/reset-password/token</h1>

      <div className="flex flex-col gap-2">
        <Link href="/sign-in" className="rounded border ">
          password updated &rarr; /sign-in
        </Link>
      </div>
    </div>
  );
}
