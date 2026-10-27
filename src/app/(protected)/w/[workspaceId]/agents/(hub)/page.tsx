import Link from "next/link";
import { Plus } from "lucide-react";

export default async function AgentsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-secondary-50/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-secondary-50">
            Agents
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Configure Agents with clear instructions and approved Workspace
            Actions.
          </p>
        </div>

        <Link
          href={`/w/${workspaceId}/agents/new`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary-500 text-secondary-50 font-semibold text-xs sm:text-sm hover:bg-secondary-100 transition-colors shadow-lg cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>create Agent</span>
        </Link>
      </div>
    </div>
  );
}
