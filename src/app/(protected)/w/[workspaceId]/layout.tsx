import { Suspense } from "react";
import { redirect } from "next/navigation";
import { SIGN_IN_PATH } from "@/features/auth/constants";
import { getSafeRedirectPath } from "@/features/auth/redirect";
import { getSession, hasSessionCookie } from "@/features/auth/session.server";
import { mockWorkspaces } from "@/data/mock-workspaces";
import { AppFrame } from "./_components/app-frame";
import { WorkspaceDynamicSidebar } from "./_components/workspace-dynamic-sidebar";
import { WorkspaceSidebarFallback } from "./_components/workspace-sidebar";

async function WorkspaceProtectedShell({
  params,
  children,
}: {
  params: Promise<{ workspaceId: string }>;
  children: React.ReactNode;
}) {
  const { workspaceId } = await params;
  const session = await getSession();

  if (!session) {
    const staleCookiePresent = await hasSessionCookie();
    const query = new URLSearchParams();
    if (staleCookiePresent) {
      query.set("reason", "expired");
    }
    query.set("next", getSafeRedirectPath(`/w/${workspaceId}`));
    redirect(`${SIGN_IN_PATH}?${query.toString()}`);
  }

  const hasWorkspaceAccess = mockWorkspaces.some((ws) => ws.id === workspaceId);
  if (!hasWorkspaceAccess) {
    redirect("/workspaces");
  }

  return (
    <AppFrame sidebar={<WorkspaceDynamicSidebar workspaceId={workspaceId} />}>
      {children}
    </AppFrame>
  );
}

export default function WorkspaceUnifiedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <AppFrame sidebar={<WorkspaceSidebarFallback />}>
          <div className="h-full w-full animate-pulse rounded-2xl bg-neutral-900/40" />
        </AppFrame>
      }
    >
      <WorkspaceProtectedShell params={params}>
        {children}
      </WorkspaceProtectedShell>
    </Suspense>
  );
}
