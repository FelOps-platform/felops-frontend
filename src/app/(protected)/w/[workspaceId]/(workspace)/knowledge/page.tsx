import { Suspense } from "react";
import { KnowledgeView } from "./_components/knowledge-view";

interface KnowledgePageProps {
  params: Promise<{ workspaceId: string }>;
}

async function KnowledgeContent({ params }: KnowledgePageProps) {
  const { workspaceId } = await params;
  return <KnowledgeView workspaceId={workspaceId} />;
}

export default function KnowledgePage({ params }: KnowledgePageProps) {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 max-w-6xl animate-pulse">
          <div className="h-14 bg-secondary-900/30 rounded-2xl w-1/3" />
          <div className="h-64 bg-secondary-900/20 rounded-2xl w-full" />
        </div>
      }
    >
      <KnowledgeContent params={params} />
    </Suspense>
  );
}
