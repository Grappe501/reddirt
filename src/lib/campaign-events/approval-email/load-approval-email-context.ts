import "server-only";

import { getApprovalEmailConfig } from "./approval-email-config";
import { latestApprovalEmailLog, type ApprovalEmailLogEntry } from "./approval-email-log";
import { loadApprovalEmailLogForRecord } from "./approval-email-persist";
import { approvalTokenUrl, listTokensForRecord } from "./approval-token-store";
import type { ApprovalTokenAction } from "./approval-token-store";

export type ApprovalEmailContext = {
  config: ReturnType<typeof getApprovalEmailConfig>;
  logs: ApprovalEmailLogEntry[];
  lastLog: ApprovalEmailLogEntry | null;
  tokenLinks: Record<ApprovalTokenAction, string | null>;
};

export function mapTokenLinksForPayload(ctx: ApprovalEmailContext): {
  review: string | null;
  approve: string | null;
  deny: string | null;
  hold: string | null;
  requestInfo: string | null;
} | null {
  if (!ctx.tokenLinks.review) return null;
  return {
    review: ctx.tokenLinks.review,
    approve: ctx.tokenLinks.approve,
    deny: ctx.tokenLinks.deny,
    hold: ctx.tokenLinks.hold,
    requestInfo: ctx.tokenLinks.request_info,
  };
}

export async function loadApprovalEmailContext(recordId: string): Promise<ApprovalEmailContext> {
  const config = getApprovalEmailConfig();
  const logs = await loadApprovalEmailLogForRecord(recordId);
  const lastLog = latestApprovalEmailLog(logs);
  const tokens = await listTokensForRecord(recordId);
  const active = tokens.filter((t) => t.status === "active");

  const pick = (action: ApprovalTokenAction) => {
    const t = active.find((x) => x.action === action);
    return t ? approvalTokenUrl(config.baseUrl, t.id) : null;
  };

  return {
    config,
    logs,
    lastLog,
    tokenLinks: {
      review: pick("review"),
      approve: pick("approve"),
      deny: pick("deny"),
      hold: pick("hold"),
      request_info: pick("request_info"),
    },
  };
}
