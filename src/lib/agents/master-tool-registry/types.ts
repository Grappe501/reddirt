import type { AiToolStatus } from "@/lib/campaign-events/ai-tools-master-catalog";
import type { CampaignAiToolRiskLevel, CampaignAiToolVersion } from "@/lib/campaign-events/ai-tools/tool-contract";

/** Cross-app master tool record (inventory pass — not full migration yet). */
export type MasterToolDomain =
  | "campaign_events"
  | "ask_kelly"
  | "kelly_agent"
  | "calendar"
  | "travel_reimbursement"
  | "approval_email"
  | "google_calendar"
  | "hot_wash"
  | "compliance"
  | "finance"
  | "email_command_center"
  | "comms_workbench"
  | "county_workbench"
  | "ajax_municipal"
  | "public_scheduling"
  | "global_orchestration"
  | "ingest_rag"
  | "other";

export type MasterToolKind = "deterministic" | "llm" | "rag" | "automation" | "scaffold" | "hybrid";

export type MasterToolRegistryEntry = {
  id: string;
  name: string;
  domain: MasterToolDomain;
  app: string;
  sourcePath: string;
  purpose: string;
  status: AiToolStatus;
  version: CampaignAiToolVersion;
  kind: MasterToolKind;
  reads: string;
  writes: string;
  permissions: string;
  humanApprovalRequired: boolean;
  observationEvents: string[];
  riskLevel: CampaignAiToolRiskLevel;
  routeBindings: string[];
  automationReadiness: "blocked" | "human_gated" | "read_only" | "ready_with_env";
  v2LearningPath: string;
  inUnifiedMasterAgent: boolean;
};

export const MASTER_TOOL_REGISTRY_VERSION = "master-tool-registry-v0.1" as const;
