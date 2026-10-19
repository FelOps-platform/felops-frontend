import Link from "next/link";
import { AppFrame } from "./_components/app-frame";
import { WorkspaceSidebar } from "./_components/workspace-sidebar";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  return (
    <AppFrame sidebar={<WorkspaceSidebar workspaceId={workspaceId} />}>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div>
          <Link
            href={`/w/${workspaceId}/agents/new`}
            className="inline-block rounded border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Create Agent
          </Link>
        </div>
      </div>
    </AppFrame>
  );
}
