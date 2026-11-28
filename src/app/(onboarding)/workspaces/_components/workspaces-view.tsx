"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Building2,
  ChevronRight,
  Plus,
  RotateCw,
} from "lucide-react";
import { Button } from "@/components/ui";
import {
  getUserWorkspaces,
  getWorkspaceInitials,
  mapWorkspaceError,
  type Workspace,
} from "@/features/workspaces";

export interface WorkspacesViewProps {
  userId: string;
}

export function WorkspacesView({ userId }: WorkspacesViewProps) {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadWorkspaces = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const data = await getUserWorkspaces(userId);
      setWorkspaces(data);
    } catch (err: unknown) {
      setIsError(true);
      setErrorMessage(mapWorkspaceError(err));
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    let ignore = false;

    getUserWorkspaces(userId)
      .then((data) => {
        if (!ignore) {
          setWorkspaces(data);
          setIsError(false);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          setIsError(true);
          setErrorMessage(mapWorkspaceError(err));
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [userId]);

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-secondary-50">
          Workspaces
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Select a workspace to continue or create a new one
        </p>
      </div>

      {/* State 1: Loading Skeleton */}
      {isLoading ? (
        <div
          aria-label="Loading workspaces"
          className="space-y-2.5 animate-pulse"
        >
          <div className="h-16 w-full rounded-xl bg-neutral-900/60 border border-secondary-50/10" />
          <div className="h-16 w-full rounded-xl bg-neutral-900/60 border border-secondary-50/10" />
          <div className="h-16 w-full rounded-xl bg-neutral-900/60 border border-secondary-50/10" />
          <div className="h-12 w-full rounded-xl bg-neutral-900/40 mt-4" />
        </div>
      ) : null}

      {/* State 2: Error State with Retry */}
      {!isLoading && isError ? (
        <div
          role="alert"
          className="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-neutral-900/50 border border-wrong-500/30 space-y-4"
        >
          <div className="w-11 h-11 rounded-2xl bg-wrong-500/15 border border-wrong-500/30 flex items-center justify-center text-wrong-400">
            <AlertCircle className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-secondary-50">
              Unable to Load Workspaces
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-sm">
              {errorMessage ||
                "An unexpected error occurred while loading your workspaces."}
            </p>
          </div>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => void loadWorkspaces()}
          >
            <RotateCw className="w-4 h-4" aria-hidden="true" />
            <span>Retry</span>
          </Button>
        </div>
      ) : null}

      {/* State 3: Empty State */}
      {!isLoading && !isError && workspaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-neutral-900/40 border border-secondary-50/15 space-y-4">
          <div className="w-11 h-11 rounded-2xl bg-secondary-500/15 border border-secondary-500/30 flex items-center justify-center text-secondary-300">
            <Building2 className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-secondary-50">
              No Workspaces Yet
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-sm">
              Create your first workspace to start configuring AI agents and
              connecting knowledge sources.
            </p>
          </div>
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={() => router.push("/workspaces/new")}
            className="w-full"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Create Your First Workspace</span>
          </Button>
        </div>
      ) : null}

      {/* State 4: Success State */}
      {!isLoading && !isError && workspaces.length > 0 ? (
        <div className="space-y-4">
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {workspaces.map((ws) => (
              <Link
                key={ws.id}
                href={`/w/${ws.id}`}
                className="group flex items-center justify-between p-3.5 rounded-xl bg-secondary-50 border border-secondary-50/20 hover:border-secondary-500/60 hover:bg-secondary-900/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-secondary-950 border border-secondary-950 flex items-center justify-center text-secondary-50 font-bold text-xs tracking-tight shrink-0 select-none">
                    {getWorkspaceInitials(ws.name)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-secondary-950 group-hover:text-neutral-50 transition-colors truncate">
                      {ws.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-secondary-700 group-hover:text-neutral-300 transition-colors mt-0.5">
                      <span className="flex items-center gap-1">
                        {ws.agentsCount}{" "}
                        {ws.agentsCount === 1 ? "Agent" : "Agents"}
                      </span>
                      <span aria-hidden="true">•</span>
                      <span>{ws.role}</span>
                    </div>
                  </div>
                </div>

                <ChevronRight
                  className="w-5 h-5 text-secondary-950 group-hover:text-secondary-50 group-hover:translate-x-0.5 transition-all shrink-0"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>

          <Link
            href="/workspaces/new"
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-secondary-500 text-secondary-50 font-bold text-sm hover:bg-secondary-600 transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
            <span>Create Workspace</span>
          </Link>
        </div>
      ) : null}
    </div>
  );
}
