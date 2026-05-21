import type { AiToolEntry, AiToolPriority, AiToolStatus } from "../ai-tools-master-catalog";

export type CampaignAiToolVersion = "v1" | "v2_future";
export type CampaignAiToolRiskLevel = "low" | "medium" | "high" | "blocked";

/** Standard contract for Campaign Event OS AI / deterministic tools. */
export type CampaignAiToolContract = {
  id: string;
  name: string;
  sprint: number;
  lifecycle: string;
  version: CampaignAiToolVersion;
  purpose: string;
  trigger: string;
  inputs: string;
  outputs: string;
  readsFrom: string;
  writesTo: string;
  humanApprovalRequired: boolean;
  riskLevel: CampaignAiToolRiskLevel;
  guardrails: string;
  currentStatus: AiToolStatus;
  deterministicHelperPath: string;
  routesUsingTool: string[];
  observationEvents: string[];
  futureAutomationPath: string;
  testChecklist: string[];
  priority?: AiToolPriority;
};

export function contractToCatalogEntry(c: CampaignAiToolContract): AiToolEntry {
  return {
    id: c.id,
    lifecycleId: c.lifecycle,
    name: c.name,
    purpose: c.purpose,
    status: c.currentStatus,
    priority: c.priority ?? "P1",
    trigger: c.trigger,
    reads: c.readsFrom,
    writes: c.writesTo,
    humanApprovalRequired: c.humanApprovalRequired,
    guardrails: c.guardrails,
    futureRoute: c.routesUsingTool[0] ?? c.deterministicHelperPath,
  };
}

export function getContractById(contracts: CampaignAiToolContract[], id: string): CampaignAiToolContract | undefined {
  return contracts.find((c) => c.id === id);
}

export const CAMPAIGN_AI_HUMAN_CONTROL_RULES = [
  "AI may suggest, draft, summarize, score, and route.",
  "AI may not send email, approve, deny, hold, promote to Google Calendar, or post financial transactions without explicit human approval.",
  "All outbound approval email requires operator click with EMAIL_SEND_ENABLED and provider config.",
  "Token decisions from recipients are human-initiated clicks, not autonomous agent loops.",
] as const;
