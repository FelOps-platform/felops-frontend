import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";
import { type Workspace } from "@/types/workspace";
import { mockWorkspaces, getWorkspaceInitials } from "@/data/mock-workspaces";

export type { Workspace };

export default function WorkspacesPage() {
  const workspaces = mockWorkspaces;

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-secondary-50">
          Workspaces
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Select a workspace to continue or create a new one
        </p>
      </div>

      {workspaces.length === 0 ? (
        <div className="text-center py-6 space-y-4">
          <p className="text-xs sm:text-sm text-neutral-400">
            No workspaces found. Create your first workspace to get started.
          </p>
          <Link
            href="/workspaces/new"
            className="w-full py-3.5 px-4 rounded-xl bg-secondary-50 text-secondary-950 font-semibold text-sm hover:bg-secondary-100 transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Workspace</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {workspaces.map((ws) => (
              <Link
                key={ws.id}
                href={`/w/${ws.id}`}
                className="group flex items-center justify-between p-3.5 rounded-xl bg-secondary-50 border border-secondary-50/20 hover:border-secondary-500/60 hover:bg-secondary-900/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary-950 border border-secondary-950 flex items-center justify-center text-secondary-50 font-bold text-xs tracking-tight shrink-0 select-none">
                    {getWorkspaceInitials(ws.name)}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-secondary-950 group-hover:text-neutral-50 transition-colors">
                      {ws.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-secondary-700 mt-0.5">
                      <span className="flex items-center gap-1">
                        {ws.agentsCount}{" "}
                        {ws.agentsCount === 1 ? "Agent" : "Agents"}
                      </span>
                      <span>•</span>
                      <span className="text-secondary-700">{ws.role}</span>
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-6 h-6 font-semibold text-secondary-950 group-hover:text-secondary-50 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>

          <Link
            href="/workspaces/new"
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-secondary-500 text-secondary-50 font-bold text-sm hover:bg-secondary-50 hover:text-secondary-950  transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span>Create Workspace</span>
          </Link>
        </div>
      )}
    </div>
  );
}
