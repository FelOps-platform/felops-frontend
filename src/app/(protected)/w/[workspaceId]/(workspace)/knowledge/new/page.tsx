import { Suspense } from "react";
import { AddKnowledgeWizard } from "../_components/add-knowledge/add-knowledge-wizard";

interface NewKnowledgePageProps {
  params: Promise<{ workspaceId: string }>;
}

async function NewKnowledgeContent({ params }: NewKnowledgePageProps) {
  const { workspaceId } = await params;
  return <AddKnowledgeWizard workspaceId={workspaceId} />;
}

export default function NewKnowledgePage({ params }: NewKnowledgePageProps) {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto p-4 space-y-6 animate-pulse">
          <div className="flex items-center gap-3.5 mb-8 pb-5">
            <div className="w-10 h-10 rounded-xl bg-secondary-900/40" />
            <div className="space-y-2">
              <div className="h-6 w-48 bg-secondary-900/40 rounded-lg" />
              <div className="h-4 w-72 bg-secondary-900/20 rounded-lg" />
            </div>
          </div>
          <div className="h-12 w-full bg-secondary-900/30 rounded-2xl" />
          <div className="h-96 w-full bg-secondary-900/20 rounded-2xl" />
        </div>
      }
    >
      <NewKnowledgeContent params={params} />
    </Suspense>
  );
}
