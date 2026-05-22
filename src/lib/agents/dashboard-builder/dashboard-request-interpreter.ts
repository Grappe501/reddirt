import type { CampaignUserRole } from "@/lib/agents/user-intelligence/user-personas";

export type DashboardDetailLevel = "simple" | "standard" | "power";

export type InterpretedDashboardRequest = {
  targetRole: CampaignUserRole;
  taskLabel: string;
  skillLevel: "new" | "experienced" | "expert";
  detailLevel: DashboardDetailLevel;
  workflowFocus: string;
  keywords: string[];
  month: string;
  county?: string | null;
  naturalLanguageSummary: string;
};

const ROLE_ALIASES: Record<string, CampaignUserRole> = {
  candidate: "candidate",
  kelly: "candidate",
  treasurer: "treasurer",
  finance: "treasurer",
  manager: "campaign_manager",
  "campaign manager": "campaign_manager",
  cm: "campaign_manager",
  volunteer: "operator",
  coordinator: "operator",
  county: "operator",
  host: "operator",
  admin: "operator",
  operator: "operator",
  steve: "operator",
};

export function interpretDashboardRequest(input: {
  roleLabel: string;
  taskDescription: string;
  experience?: string;
  detailLevel?: DashboardDetailLevel;
  freeformRequest?: string;
  month?: string;
}): InterpretedDashboardRequest {
  const combined = `${input.roleLabel} ${input.taskDescription} ${input.freeformRequest ?? ""}`.toLowerCase();
  let targetRole: CampaignUserRole = "campaign_manager";
  for (const [key, role] of Object.entries(ROLE_ALIASES)) {
    if (combined.includes(key)) {
      targetRole = role;
      break;
    }
  }

  const monthMatch = combined.match(/(\d{4}-\d{2})|april|march|may/i);
  let month = input.month ?? "2026-03";
  if (monthMatch) {
    if (monthMatch[1]) month = monthMatch[1];
    else if (/april/i.test(combined)) month = "2026-04";
    else if (/may/i.test(combined)) month = "2026-05";
    else if (/march/i.test(combined)) month = "2026-03";
  }

  const countyMatch = combined.match(/pulaski|benton|washington|faulkner|county/i);
  const county = countyMatch ? (combined.includes("pulaski") ? "Pulaski" : "County focus") : null;

  let skillLevel: InterpretedDashboardRequest["skillLevel"] = "experienced";
  if (/new|first time|simple|helping/i.test(combined)) skillLevel = "new";
  if (/expert|power|steve|operator/i.test(combined)) skillLevel = "expert";

  let detailLevel: DashboardDetailLevel = input.detailLevel ?? "standard";
  if (/simple|minimal|new user/i.test(combined)) detailLevel = "simple";
  if (/power|full|everything|expert/i.test(combined)) detailLevel = "power";

  const keywords: string[] = [];
  if (/reimburse|mileage|travel|treasurer/i.test(combined)) keywords.push("reimbursement");
  if (/approv/i.test(combined)) keywords.push("approval");
  if (/volunteer|house party/i.test(combined)) keywords.push("volunteer");
  if (/county|pulaski/i.test(combined)) keywords.push("county");
  if (/event|planning/i.test(combined)) keywords.push("events");
  if (/calendar|sync/i.test(combined)) keywords.push("calendar");

  const workflowFocus =
    keywords[0] ??
    (targetRole === "treasurer" ? "reimbursement" : targetRole === "candidate" ? "approval" : "operations");

  return {
    targetRole,
    taskLabel: input.taskDescription.trim() || "General campaign operations",
    skillLevel,
    detailLevel,
    workflowFocus,
    keywords,
    month,
    county,
    naturalLanguageSummary: `Dashboard for ${targetRole} — ${workflowFocus} (${month})${county ? ` · ${county}` : ""}`,
  };
}
