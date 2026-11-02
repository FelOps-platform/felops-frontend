import { Suspense } from "react";
import { AppFrame } from "../_components/app-frame";
import { WorkspaceSidebar, WorkspaceSidebarFallback } from "../_components/workspace-sidebar";

export default async function WorkspaceGroupLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  return (
    <AppFrame
      sidebar={
        <Suspense fallback={<WorkspaceSidebarFallback />}>
          <WorkspaceSidebar workspaceId={workspaceId} />
        </Suspense>
      }
    >
      {children}
    </AppFrame>
  );
}
