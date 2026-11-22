import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function AgentSidebar({
  workspaceId,
  agentId,
}: {
  workspaceId: string;
  agentId: string;
}) {
  return (
    <aside className="w-80 h-screen bg-secondary-950 border-r border-secondary-50/10 flex flex-col p-5 shrink-0 select-none z-30">
      <div className="mb-6">
        <Link
          href={`/w/${workspaceId}/agents`}
          className="text-xs text-neutral-400 hover:text-secondary-50 transition-colors inline-flex items-center gap-1.5"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Back to Agents</span>
        </Link>
        <h2 className="mt-3 text-lg font-bold text-secondary-50">
          Agent: {agentId}
        </h2>
      </div>

      <nav className="flex flex-col gap-1.5">
        <Link
          href={`/w/${workspaceId}/agents/${agentId}`}
          className="rounded-xl px-3.5 py-2.5 text-sm font-medium text-neutral-300 hover:bg-secondary-900/60 hover:text-secondary-50 transition-colors"
        >
          Overview
        </Link>
        <Link
          href={`/w/${workspaceId}/agents/${agentId}/edit`}
          className="rounded-xl px-3.5 py-2.5 text-sm font-medium text-neutral-300 hover:bg-secondary-900/60 hover:text-secondary-50 transition-colors"
        >
          Edit Agent
        </Link>
      </nav>
    </aside>
  );
}

export default AgentSidebar;
