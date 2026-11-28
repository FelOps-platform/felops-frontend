"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Input, Label } from "@/components/ui";
import {
  createWorkspace,
  createWorkspaceSchema,
  mapWorkspaceError,
  WorkspaceApiError,
  type CreateWorkspaceInput,
} from "@/features/workspaces";

export interface CreateWorkspaceFormProps {
  userId: string;
}

export function CreateWorkspaceForm({ userId }: CreateWorkspaceFormProps) {
  const router = useRouter();
  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateWorkspaceInput>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: "",
    },
    mode: "onTouched",
    shouldFocusError: true,
  });

  const onSubmit = async (data: CreateWorkspaceInput) => {
    setGeneralError(null);
    try {
      const workspace = await createWorkspace(userId, data);
      router.push(`/w/${workspace.id}`);
      router.refresh();
    } catch (err: unknown) {
      const message = mapWorkspaceError(err);
      if (err instanceof WorkspaceApiError && err.code === "DUPLICATE_NAME") {
        setError("name", { type: "server", message }, { shouldFocus: true });
        return;
      }
      setGeneralError(message);
    }
  };

  const nameError = errors.name?.message;

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-secondary-50">
          Create Workspace
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Give your workspace a name to start building and managing your AI
          agents.
        </p>
      </div>

      {generalError ? (
        <Alert variant="error" className="mb-4">
          {generalError}
        </Alert>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="workspace-name" required>
            Workspace Name
          </Label>
          <Input
            id="workspace-name"
            type="text"
            autoComplete="organization"
            placeholder="e.g. Acme Operations"
            surface="dark"
            isError={Boolean(nameError)}
            aria-invalid={Boolean(nameError)}
            aria-describedby={nameError ? "workspace-name-error" : undefined}
            disabled={isSubmitting}
            {...register("name")}
          />
          {nameError ? (
            <p
              id="workspace-name-error"
              role="alert"
              className="text-xs text-wrong-400 mt-1"
            >
              {nameError}
            </p>
          ) : null}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="w-full mt-2"
        >
          {isSubmitting ? "Creating Workspace..." : "Create Workspace"}
        </Button>

        <div className="flex items-center justify-center text-xs text-neutral-400 pt-2">
          <Link
            href="/workspaces"
            className="text-neutral-400 hover:text-secondary-50 transition-colors"
          >
            Cancel and return to workspaces
          </Link>
        </div>
      </form>
    </div>
  );
}
