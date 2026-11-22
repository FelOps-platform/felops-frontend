import { Suspense } from "react";
import { AppFrame } from "./_components/app-frame";
import { WorkspaceDynamicSidebar } from "./_components/workspace-dynamic-sidebar";
import { WorkspaceSidebarFallback } from "./_components/workspace-sidebar";

async function DynamicSidebarWrapper({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return <WorkspaceDynamicSidebar workspaceId={workspaceId} />;
}

export default function WorkspaceUnifiedLayout({
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
          <DynamicSidebarWrapper params={params} />
        </Suspense>
      }
    >
      {children}
    </AppFrame>
  );
}
