import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Loader2, Users } from "lucide-react";
import { Alert } from "@/components/ui";
import { validateInviteToken } from "@/features/auth/service";
import { getSession } from "@/features/auth/session.server";
import { AcceptInviteForm } from "./_components/accept-invite-form";

export const metadata: Metadata = {
  title: "Workspace Invitation | FelOps",
  description: "Review and accept your FelOps workspace invitation.",
};

async function InviteTokenGate({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const [invite, session] = await Promise.all([
    validateInviteToken(token),
    getSession(),
  ]);

  if (invite.status !== "valid") {
    const title =
      invite.status === "expired"
        ? "Invitation Expired"
        : invite.status === "used"
          ? "Invitation Already Accepted"
          : "Invalid Invitation";

    const message =
      invite.status === "expired"
        ? "This workspace invitation has expired. Ask a workspace admin to send you a new invite."
        : invite.status === "used"
          ? "This workspace invitation has already been accepted."
          : "This invitation link is invalid or no longer available.";

    return (
      <div className="w-full space-y-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-secondary-50">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Workspace invitations are single-use and time-limited.
          </p>
        </div>

        <Alert
          variant={
            invite.status === "used"
              ? "info"
              : invite.status === "expired"
                ? "warning"
                : "error"
          }
        >
          {message}
        </Alert>

        <Link
          href={session ? "/workspaces" : "/sign-in"}
          className="w-full inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-secondary-500 text-secondary-50 hover:bg-secondary-600 text-sm font-semibold transition-colors"
        >
          {session ? "Go to Workspaces" : "Go to Sign In"}
        </Link>
      </div>
    );
  }

  const returnPath = `/invite/${encodeURIComponent(token)}`;
  const signInHref = `/sign-in?next=${encodeURIComponent(returnPath)}`;
  const signUpHref = `/sign-up?next=${encodeURIComponent(returnPath)}`;

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <div className="w-11 h-11 rounded-2xl bg-secondary-500/15 border border-secondary-500/30 flex items-center justify-center text-secondary-300">
          <Users className="w-5 h-5" aria-hidden="true" />
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-secondary-50">
          Join {invite.workspaceName}
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
          <span className="text-secondary-50 font-medium">
            {invite.inviterName}
          </span>{" "}
          invited you to join as{" "}
          <span className="text-secondary-50 font-medium">{invite.role}</span>.
        </p>
      </div>

      {session ? (
        <AcceptInviteForm
          token={token}
          workspaceName={invite.workspaceName}
        />
      ) : (
        <div className="space-y-3">
          <Link
            href={signInHref}
            className="w-full inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-secondary-500 text-secondary-50 hover:bg-secondary-600 text-sm font-semibold transition-colors"
          >
            Sign In to Accept Invitation
          </Link>
          <Link
            href={signUpHref}
            className="w-full inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-transparent border border-secondary-50/20 text-secondary-50 hover:bg-secondary-900/40 text-sm font-semibold transition-colors"
          >
            Create Account to Join
          </Link>
        </div>
      )}
    </div>
  );
}

export default function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="w-full flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-secondary-50" />
        </div>
      }
    >
      <InviteTokenGate params={params} />
    </Suspense>
  );
}
