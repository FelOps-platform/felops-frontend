import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4  p-6 ">
      <h1 className="font-mono text-2xl font-bold">/sign-up</h1>

      <div className="flex flex-col gap-2">
        <Link
          href="/verify-email"
          className="rounded border px-4 py-2 text-sm "
        >
          account created or Complete Signup + token found&rarr; /verify-email
        </Link>
      </div>
    </div>
  );
}
