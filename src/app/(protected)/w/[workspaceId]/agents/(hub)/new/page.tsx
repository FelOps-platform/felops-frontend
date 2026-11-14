import { Suspense } from "react";
import { AgentStepperForm } from "../../_components/agent-stepper";

async function NewAgentContent({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return <AgentStepperForm workspaceId={workspaceId} />;
}

export default function NewAgentPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto p-6 animate-pulse" />}>
      <NewAgentContent params={params} />
    </Suspense>
  );
}
