import { Suspense } from "react";
import { AddKnowledgeForm } from "../_components/add-knowledge/add-knowledge-form";

interface NewKnowledgePageProps {
  params: Promise<{ workspaceId: string }>;
}

async function NewKnowledgeContent({ params }: NewKnowledgePageProps) {
  const { workspaceId } = await params;
  return <AddKnowledgeForm workspaceId={workspaceId} />;
}

export default function NewKnowledgePage({ params }: NewKnowledgePageProps) {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 max-w-6xl animate-pulse">
          <div>
            <div className="w-9 h-9 rounded-xl bg-secondary-900/40 mb-5" />
            <div className="h-7 w-64 bg-secondary-900/40 rounded-lg mb-2" />
            <div className="h-4 w-96 bg-secondary-900/20 rounded-lg" />
          </div>
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="h-8 w-48 mx-auto bg-secondary-900/30 rounded-2xl" />
            <div className="h-96 w-full bg-secondary-900/20 rounded-3xl" />
          </div>
        </div>
      }
    >
      <NewKnowledgeContent params={params} />
    </Suspense>
  );
}
