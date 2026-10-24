import Link from "next/link";
export default function WorkspacesPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 ">
      <h1 className="font-mono text-2xl font-bold">/workspaces</h1>

      <div className="flex flex-col gap-2">
        <Link
          href="/workspaces/new"
          className="rounded border px-4 py-2 text-sm "
        >
          Click &apos;Create New&apos; &rarr; /workspaces/new
        </Link>
        <Link href="/" className="rounded border px-4 py-2 text-sm ">
          Click &rarr; /dashboeard
        </Link>
      </div>
    </div>
  );
}
