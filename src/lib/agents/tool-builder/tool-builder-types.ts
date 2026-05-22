export type ToolBuildTicketStatus = "proposed" | "accepted" | "rejected" | "backlog" | "built";

export type ToolBuildTicket = {
  id: string;
  source: string;
  observedProblem: string;
  workflowAffected: string;
  proposedToolName: string;
  proposedToolContract: string;
  dataNeeded: string[];
  uiNeeded: string[];
  routeIntegration: string[];
  testPlan: string[];
  riskLevel: "low" | "medium" | "high";
  expectedImpact: string;
  status: ToolBuildTicketStatus;
  reviewerNotes?: string;
  createdAt: string;
  updatedAt: string;
  priorityScore?: number;
};
