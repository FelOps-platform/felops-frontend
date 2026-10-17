import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Workspace | FelOps",
};

export default function NewWorkspacePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center ">
      <h1 className="font-mono text-2xl font-bold">/workspaces/new</h1>
      <p className="text-xs ">
        Terminal route in Auth Layer (exits to Application Dashboard)
      </p>
    </div>
  );
}
