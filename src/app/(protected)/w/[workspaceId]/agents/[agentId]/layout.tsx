import { AppFrame } from "../../_components/app-frame";
import { AgentSidebar } from "../_components/agent-sidebar";

export default async function AgentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string; agentId: string }>;
}) {
  const { workspaceId, agentId } = await params;

  return (
    <AppFrame
      sidebar={<AgentSidebar workspaceId={workspaceId} agentId={agentId} />}
    >
      {children}
    </AppFrame>
  );
}
