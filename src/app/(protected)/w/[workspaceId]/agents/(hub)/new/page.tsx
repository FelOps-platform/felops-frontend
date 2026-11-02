import { AgentStepperForm } from "../../_components/agent-stepper";

export default async function NewAgentPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  return <AgentStepperForm workspaceId={workspaceId} />;
}
