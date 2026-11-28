import SplitLayout from "@/components/common/SplitLayout";
import { SessionGate } from "@/features/auth/session-gate";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SplitLayout>
      <SessionGate
        redirectTo="/workspaces"
        fallback={
          <div className="space-y-4 py-4">
            <div className="h-7 w-40 rounded-lg bg-neutral-900/60 animate-pulse" />
            <div className="h-4 w-64 rounded-lg bg-neutral-900/40 animate-pulse" />
            <div className="h-24 w-full rounded-xl bg-neutral-900/40 animate-pulse" />
          </div>
        }
      >
        {children}
      </SessionGate>
    </SplitLayout>
  );
}
