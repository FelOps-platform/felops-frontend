import { SessionGate } from "@/features/auth/session-gate";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionGate
      redirectTo="/account/profile"
      fallback={
        <div className="min-h-screen bg-secondary-950 text-secondary-50 p-6 lg:p-12">
          <div className="h-8 w-48 rounded-lg bg-neutral-900/60 animate-pulse" />
        </div>
      }
    >
      {children}
    </SessionGate>
  );
}
