import Link from "next/link";

export function AgentSidebar({
  workspaceId,
  agentId,
}: {
  workspaceId: string;
  agentId: string;
}) {
  return (
    <div>
      <div className="mb-4">
        <Link
          href={`/w/${workspaceId}/agents`}
          className="text-xs text-slate-500 hover:underline"
        >
          &larr; Back to Agents
        </Link>
        <h2 className="mt-2 text-lg font-bold">Agent: {agentId}</h2>
      </div>

      <nav className="flex flex-col gap-2">
        <Link
          href={`/w/${workspaceId}/agents/${agentId}`}
          className="rounded px-3 py-2 text-sm hover:bg-slate-100"
        >
          Overview
        </Link>
        <Link
          href={`/w/${workspaceId}/agents/${agentId}/edit`}
          className="rounded px-3 py-2 text-sm hover:bg-slate-100"
        >
          Edit Agent
        </Link>
      </nav>
    </div>
  );
}
