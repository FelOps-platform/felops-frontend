import { Suspense } from "react";
import { AppFrame } from "../../_components/app-frame";
import { AgentSidebar } from "../_components/agent-sidebar";

async function AgentSidebarWrapper({
  params,
}: {
  params: Promise<{ workspaceId: string; agentId: string }>;
}) {
  const { workspaceId, agentId } = await params;
  return <AgentSidebar workspaceId={workspaceId} agentId={agentId} />;
}

export default function AgentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string; agentId: string }>;
}) {
  return (
    <AppFrame
      sidebar={
        <Suspense fallback={<div className="w-80 h-screen bg-secondary-950 border-r border-secondary-50/10 shrink-0" />}>
          <AgentSidebarWrapper params={params} />
        </Suspense>
      }
    >
      {children}
    </AppFrame>
  );
}
