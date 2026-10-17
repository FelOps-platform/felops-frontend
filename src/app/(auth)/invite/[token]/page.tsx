import Link from "next/link";

export default function InvitePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4  p-6 ">
      <h1 className="font-mono text-2xl font-bold">/invite/token</h1>

      <div className="flex flex-col gap-2">
        <Link href="/" className="rounded border ">
          Accept invit &rarr; /dashboeard
        </Link>
      </div>
    </div>
  );
}
