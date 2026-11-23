export type WorkspaceRole = "Owner" | "Admin" | "Member";

export interface Workspace {
  id: string;
  name: string;
  agentsCount?: number;
  role?: WorkspaceRole;
}
