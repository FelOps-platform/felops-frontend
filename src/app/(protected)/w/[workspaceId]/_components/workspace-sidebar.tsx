import Link from "next/link";

export function WorkspaceSidebar({ workspaceId }: { workspaceId: string }) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-bold">Workspace</h2>
      <nav className="flex flex-col gap-2">
        <Link
          href={`/w/${workspaceId}`}
          className="rounded px-3 py-2 text-sm hover:bg-slate-100"
        >
          Dashboard
        </Link>
        <Link
          href={`/w/${workspaceId}/agents`}
          className="rounded px-3 py-2 text-sm hover:bg-slate-100"
        >
          Agents
        </Link>
      </nav>
    </div>
  );
}
