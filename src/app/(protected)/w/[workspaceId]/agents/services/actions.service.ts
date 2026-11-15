// ---------------------------------------------------------------------------
// Actions Service: Workspace Actions API Integration Layer
// ---------------------------------------------------------------------------

export interface WorkspaceAction {
  id: string;
  name: string;
  description: string;
}

// ---------------------------------------------------------------------------
// Mock Data (Simulating Backend Workspace Actions)
// ---------------------------------------------------------------------------

export const MOCK_WORKSPACE_ACTIONS: WorkspaceAction[] = [
  {
    id: "act_slack_notify",
    name: "Send Slack Notification",
    description: "Send alert messages or direct updates to designated Slack channels.",
  },
  {
    id: "act_hubspot_lead",
    name: "Create or Update CRM Lead",
    description: "Sync leads, update lifecycle stages, and log contact activity in HubSpot.",
  },
  {
    id: "act_github_dispatch",
    name: "Dispatch GitHub Workflow",
    description: "Trigger CI/CD pipelines, release automations, or incident rollback dispatches.",
  },
  {
    id: "act_linear_issue",
    name: "File Linear Ticket",
    description: "Automatically create tracked bug reports and feature tasks with priority tags.",
  },
  {
    id: "act_stripe_invoice",
    name: "Draft Stripe Customer Invoice",
    description: "Create draft invoices and send payment links for approved customer orders.",
  },
];

export async function getWorkspaceActions(
  workspaceId: string
): Promise<WorkspaceAction[]> {
  // TODO: Fetch workspace actions from API
  return MOCK_WORKSPACE_ACTIONS;
}
