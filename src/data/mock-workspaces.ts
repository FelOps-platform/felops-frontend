import { Workspace } from "@/types/workspace";

export const mockWorkspaces: Workspace[] = [
  {
    id: "ws-ai-production",
    name: "AI Production Hub",
    agentsCount: 8,
    role: "Owner",
  },
  {
    id: "ws-enterprise-ops",
    name: "Enterprise Operations",
    agentsCount: 4,
    role: "Admin",
  },
  {
    id: "ws-customer-fleet",
    name: "Customer Support Fleet",
    agentsCount: 12,
    role: "Member",
  },
  {
    id: "amr-khaled",
    name: "Amr Khaled",
    agentsCount: 2,
    role: "Owner",
  },
];

export const getWorkspaceInitials = (name: string): string => {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);
};
