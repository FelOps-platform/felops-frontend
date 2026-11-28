import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
import { SIGN_IN_PATH } from "@/features/auth/constants";
import { getSession } from "@/features/auth/session.server";
import { CreateWorkspaceForm } from "./_components/create-workspace-form";

export const metadata: Metadata = {
  title: "Create Workspace | FelOps",
  description: "Create a new FelOps workspace to manage your AI agents.",
};

async function CreateWorkspaceLoader() {
  const session = await getSession();
  if (!session) {
    redirect(`${SIGN_IN_PATH}?next=%2Fworkspaces%2Fnew`);
  }

  return <CreateWorkspaceForm userId={session.user.id} />;
}

export default function NewWorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-secondary-50" />
        </div>
      }
    >
      <CreateWorkspaceLoader />
    </Suspense>
  );
}
