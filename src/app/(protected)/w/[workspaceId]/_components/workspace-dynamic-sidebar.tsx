"use client";

import { usePathname } from "next/navigation";
import { WorkspaceSidebar } from "./workspace-sidebar";
import { AgentSidebar } from "../agents/_components/agent-sidebar";

export function WorkspaceDynamicSidebar({
  workspaceId,
}: {
  workspaceId: string;
}) {
  const pathname = usePathname();

  // Match /w/[workspaceId]/agents/[agentId] (or /w/[workspaceId]/agents/[agentId]/...)
  // Exclude /w/[workspaceId]/agents or /w/[workspaceId]/agents/new
  const escapedWorkspaceId = workspaceId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const agentMatch = pathname.match(
    new RegExp(`^/w/${escapedWorkspaceId}/agents/([^/]+)(?:/.*)?$`),
  );

  const potentialAgentId = agentMatch ? agentMatch[1] : null;
  const isAgentDetail = Boolean(
    potentialAgentId && potentialAgentId !== "new",
  );

  if (isAgentDetail && potentialAgentId) {
    return <AgentSidebar workspaceId={workspaceId} agentId={potentialAgentId} />;
  }

  return <WorkspaceSidebar workspaceId={workspaceId} />;
}
