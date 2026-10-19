import Link from "next/link";

export default async function AgentsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Agents</h1>
        <Link
          href={`/w/${workspaceId}/agents/new`}
          className="inline-block rounded border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
        >
          Create Agent
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm text-slate-500">Agents list:</p>
        <Link
          href={`/w/${workspaceId}/agents/agent-123`}
          className="inline-block w-fit rounded border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
        >
          aaaaa
        </Link>
      </div>
    </div>
  );
}
