import type { DashboardBlockDefinition } from "./dashboard-component-registry";
import type { InterpretedDashboardRequest } from "./dashboard-request-interpreter";

export type DashboardSafetyResult = {
  allowedBlocks: DashboardBlockDefinition[];
  blockedBlocks: { block: DashboardBlockDefinition; reason: string }[];
  humanSupervisorRequired: boolean;
  doNotTouchAreas: string[];
  safetySummary: string;
};

const FORBIDDEN_FOR_NEW_USERS: string[] = [
  "promotion_readiness",
  "print_download_actions",
];

const HIGH_RISK_NOTES = [
  "Google Calendar promotion requires explicit human confirmation.",
  "Approval emails and FIN-1 posting are forbidden for autonomous agents.",
  "Do not share real voter PII in test or demo environments.",
];

export function guardDashboardBlocks(
  blocks: DashboardBlockDefinition[],
  request: InterpretedDashboardRequest,
): DashboardSafetyResult {
  const blockedBlocks: DashboardSafetyResult["blockedBlocks"] = [];
  const allowedBlocks: DashboardBlockDefinition[] = [];

  for (const block of blocks) {
    if (request.skillLevel === "new" && FORBIDDEN_FOR_NEW_USERS.includes(block.id)) {
      blockedBlocks.push({ block, reason: "Hidden for new users — requires training first." });
      continue;
    }
    if (block.riskLevel === "high" && request.skillLevel === "new") {
      blockedBlocks.push({ block, reason: "High-risk block reserved for trained operators." });
      continue;
    }
    if (
      block.requiredRoles !== "any" &&
      !block.requiredRoles.includes(request.targetRole) &&
      request.targetRole !== "operator"
    ) {
      blockedBlocks.push({ block, reason: `Role ${request.targetRole} not in allowed list.` });
      continue;
    }
    allowedBlocks.push(block);
  }

  const humanSupervisorRequired =
    allowedBlocks.some((b) => b.riskLevel === "high") || request.targetRole === "treasurer";

  const doNotTouchAreas = [
    "Send approval email (gated)",
    "Promote to Google Calendar without review",
    "Post financial transactions to FIN-1",
    "Delete ledger rows",
  ];
  if (request.skillLevel === "new") {
    doNotTouchAreas.push("Month finalization", "Bulk approval");
  }

  return {
    allowedBlocks,
    blockedBlocks,
    humanSupervisorRequired,
    doNotTouchAreas,
    safetySummary: `${allowedBlocks.length} safe blocks · ${blockedBlocks.length} withheld · ${HIGH_RISK_NOTES[0]}`,
  };
}
