/**
 * Tool safety classification — every tool and action gets a safety level.
 */

import type { AgentToolSafetyLevel } from "./agent-tooling-types";
import { ORCHESTRATION_FORBIDDEN_AUTO_ACTIONS } from "../orchestration-tool-contracts";

export const PROHIBITED_EXECUTION_TYPES = [
  "auto_send_email",
  "auto_send_sms",
  "google_calendar_write",
  "finance_post",
  "reimbursement_submit",
  "voter_export",
  "contact_export",
  "sensitive_memory_auto_store",
  "production_mutation_without_approval",
  ...ORCHESTRATION_FORBIDDEN_AUTO_ACTIONS,
] as const;

export type ProhibitedExecutionType = (typeof PROHIBITED_EXECUTION_TYPES)[number];

const PROHIBITED_PATTERNS = [
  /send/i,
  /export/i,
  /gcal.*write/i,
  /finance.*post/i,
  /reimbursement.*submit/i,
  /voter/i,
  /mass-email/i,
  /autonomous-outreach/i,
];

export function classifyToolSafety(input: {
  id: string;
  humanApprovalRequired: boolean;
  writesTo: string;
  riskLevel: string;
  guardrails: string;
}): AgentToolSafetyLevel {
  const combined = `${input.id} ${input.writesTo} ${input.guardrails}`.toLowerCase();
  if (input.riskLevel === "blocked") return "prohibited";
  if (PROHIBITED_PATTERNS.some((p) => p.test(combined)) && !combined.includes("draft")) {
    return "approval_required";
  }
  if (combined.includes("forbidden") || combined.includes("no auto")) return "approval_required";
  if (input.writesTo === "—" || input.writesTo === "-" || input.writesTo.toLowerCase() === "none") {
    return input.humanApprovalRequired ? "safe_prepare" : "safe_read";
  }
  if (input.humanApprovalRequired || input.writesTo.includes("draft") || input.writesTo.includes("prepared")) {
    return "approval_required";
  }
  if (input.writesTo.length > 2) return "safe_prepare";
  return "safe_read";
}

export function isProhibitedExecution(actionType: string): boolean {
  const lower = actionType.toLowerCase();
  return PROHIBITED_EXECUTION_TYPES.some((p) => lower.includes(p.replace(/-/g, "_")) || lower.includes(p));
}

export function assertPreparedActionSafe(action: { canExecuteNow: boolean; restrictedExecution: boolean }): boolean {
  return action.canExecuteNow === false && action.restrictedExecution === true;
}
