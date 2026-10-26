import { AppFrame } from "../_components/app-frame";
import { WorkspaceSidebar } from "../_components/workspace-sidebar";

export default async function WorkspaceGroupLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  return (
    <AppFrame sidebar={<WorkspaceSidebar workspaceId={workspaceId} />}>
      {children}
    </AppFrame>
  );
}
