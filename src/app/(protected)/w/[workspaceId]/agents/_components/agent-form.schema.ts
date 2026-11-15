import { z } from "zod";

// ---------------------------------------------------------------------------
// 1. Zod Schemas 
// ---------------------------------------------------------------------------

export const agentFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter a name for this Agent."),
  instructions: z
    .string()
    .trim()
    .min(1, "Instructions cannot be empty."),
  actionIds: z.array(z.string()),
  knowledgeIds: z.array(z.string()),
});

export type AgentFormData = z.infer<typeof agentFormSchema>;

// ---------------------------------------------------------------------------
// 2. Step Definitions
// ---------------------------------------------------------------------------

export interface StepConfig {
  id: number;
  title: string;
  description: string;
  fields?: (keyof AgentFormData)[];
}

export const STEPS: StepConfig[] = [
  {
    id: 1,
    title: "Basic information",
    description: "Name and instructions",
    fields: ["name", "instructions"],
  },
  {
    id: 2,
    title: "Assign Actions",
    description: "Choose Workspace Actions",
  },
  {
    id: 3,
    title: "Configure Knowledge",
    description: "Assign shared or private sources",
  },
  {
    id: 4,
    title: "Review & save",
    description: "Confirm configuration",
  },
];