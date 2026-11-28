"use client";

import { useState, useTransition } from "react";
import { Alert, Button } from "@/components/ui";
import { mapAuthError } from "@/features/auth";
import { acceptInviteAction } from "@/features/auth/actions";

export function AcceptInviteForm({
  token,
  workspaceName,
}: {
  token: string;
  workspaceName: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAccept = () => {
    setError(null);
    startTransition(async () => {
      try {
        await acceptInviteAction(token);
      } catch (err: unknown) {
        setError(mapAuthError(err));
      }
    });
  };

  return (
    <div className="space-y-4">
      {error ? <Alert variant="error">{error}</Alert> : null}

      <Button
        type="button"
        variant="primary"
        size="lg"
        isLoading={isPending}
        onClick={handleAccept}
        className="w-full"
      >
        {isPending ? "Joining Workspace..." : `Accept & Open ${workspaceName}`}
      </Button>
    </div>
  );
}
