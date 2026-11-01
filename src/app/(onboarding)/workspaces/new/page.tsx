"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { createWorkspaceSchema } from "../../schemas/workspace";

export default function NewWorkspacePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (errors.name || errors.general) {
      setErrors((prev) => ({ ...prev, name: undefined, general: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validationResult = createWorkspaceSchema.safeParse({ name });
    if (!validationResult.success) {
      const fieldErrors: { name?: string } = {};
      validationResult.error.issues.forEach((err) => {
        if (err.path[0] === "name") {
          fieldErrors.name = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      console.log("Submitting new workspace:", validationResult.data);

      // TODO: Call backend API to create workspace
      // const response = await workspaceService.createWorkspace(validationResult.data);
      // const workspaceId = response.data.id;

      // Mock navigation for immediate developer feedback:
      const generatedWorkspaceId =
        name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-") || "new-workspace";

      router.push(`/w/${generatedWorkspaceId}`);
    } catch (err: any) {
      setErrors({
        general:
          err?.message || "Failed to create workspace. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Title & Subtitle */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-secondary-50">
          Create Workspace
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Give your workspace a name to start building and managing your AI
          agents.
        </p>
      </div>

      {errors.general && (
        <div className="mb-4 p-3 rounded-xl bg-wrong-500/10 border border-wrong-500/20 text-wrong-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errors.general}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Workspace Name Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-neutral-300">
            Workspace Name
          </label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={handleNameChange}
            placeholder="e.g. Acme Operations"
            className={`w-full px-4 py-3 rounded-xl bg-neutral-900/40 border text-secondary-50 placeholder-neutral-500 text-sm focus:outline-none transition-colors ${
              errors.name
                ? "border-wrong-500/80 focus:border-wrong-500"
                : "border-secondary-50/20 focus:border-secondary-50"
            }`}
          />
          {errors.name && (
            <p className="text-xs text-wrong-400 mt-1">{errors.name}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3.5 px-4 rounded-xl bg-secondary-500 text-secondary-50 font-semibold text-sm hover:bg-secondary-50 hover:text-secondary-950 transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Workspace...</span>
            </>
          ) : (
            <span>Create Workspace</span>
          )}
        </button>

        {/* Cancel / Back Link */}
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
