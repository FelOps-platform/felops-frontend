import { Suspense } from "react";
import { AppFrame } from "../_components/app-frame";
import { WorkspaceSidebar, WorkspaceSidebarFallback } from "../_components/workspace-sidebar";

async function SidebarWrapper({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return <WorkspaceSidebar workspaceId={workspaceId} />;
}

export default function WorkspaceGroupLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}) {
  return (
    <AppFrame
      sidebar={
        <Suspense fallback={<WorkspaceSidebarFallback />}>
          <SidebarWrapper params={params} />
        </Suspense>
      }
    >
      {children}
    </AppFrame>
  );
}
