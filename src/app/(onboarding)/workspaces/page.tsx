import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
import { SIGN_IN_PATH } from "@/features/auth/constants";
import { getSession } from "@/features/auth/session.server";
import { WorkspacesView } from "./_components/workspaces-view";

export const metadata: Metadata = {
  title: "Workspaces | FelOps",
  description: "Select a FelOps workspace or create a new one.",
};

async function WorkspacesLoader() {
  const session = await getSession();
  if (!session) {
    redirect(`${SIGN_IN_PATH}?next=%2Fworkspaces`);
  }

  return <WorkspacesView userId={session.user.id} />;
}

export default function WorkspacesPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-secondary-50" />
        </div>
      }
    >
      <WorkspacesLoader />
    </Suspense>
  );
}
