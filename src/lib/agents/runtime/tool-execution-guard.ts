import type { MasterToolRegistryEntry } from "../master-tool-registry/types";
import type { AgentRiskLevel } from "./agent-runtime-types";

const BLOCKED_WRITE_PATTERNS = [
  /send/i,
  /publish/i,
  /post.*transaction/i,
  /finalize/i,
  /sms/i,
  /gcal write|google.*write|promote.*automatic/i,
];

const HIGH_RISK_TOOL_IDS = new Set([
  "appr-email-send",
  "promotion-execute-write",
  "email-send-guard",
]);

export function isHighRiskUserMessage(message: string): boolean {
  const m = message.toLowerCase();
  return BLOCKED_WRITE_PATTERNS.some((p) => p.test(m));
}

export function guardToolExecution(
  tool: MasterToolRegistryEntry,
  intentRisk: AgentRiskLevel,
): { allowed: boolean; reason: string } {
  if (intentRisk === "blocked") {
    return { allowed: false, reason: "Request classified as blocked automation." };
  }
  if (HIGH_RISK_TOOL_IDS.has(tool.id)) {
    return { allowed: false, reason: "Tool requires explicit human gate — not auto-invoked." };
  }
  if (tool.riskLevel === "high" || tool.riskLevel === "blocked") {
    return { allowed: false, reason: `Tool risk ${tool.riskLevel} — recommend route only.` };
  }
  if (tool.humanApprovalRequired && tool.automationReadiness !== "read_only") {
    return { allowed: false, reason: "humanApprovalRequired — operator must click gated UI." };
  }
  if (tool.writes !== "—" && tool.writes.trim() && !tool.writes.toLowerCase().includes("observation")) {
    const w = tool.writes.toLowerCase();
    if (w.includes("send") || w.includes("gcal") || w.includes("google") || w.includes("financial")) {
      return { allowed: false, reason: "Write path blocked for runtime auto-exec." };
    }
  }
  return { allowed: true, reason: "Read-only or safe deterministic recommend." };
}

export function blockedActionExplanation(intentRisk: AgentRiskLevel, message: string): string | null {
  if (intentRisk !== "blocked" && !isHighRiskUserMessage(message)) return null;
  return "Campaign Agent cannot send, approve, promote to Google Calendar, finalize reimbursements, or post financial data. Use the linked workflow and click the gated action yourself.";
}
