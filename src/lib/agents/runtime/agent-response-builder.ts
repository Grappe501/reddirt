import type { ClassifiedIntent, AgentRuntimeResponse, ToolRouteResult } from "./agent-runtime-types";
import type { AgentPlanStep } from "./agent-runtime-types";
import { blockedActionExplanation } from "./tool-execution-guard";

export function buildAgentResponseCopy(input: {
  intent: ClassifiedIntent;
  contextSummary: string;
  blockers: string[];
  route: ToolRouteResult;
  safeActions: AgentPlanStep[];
  blockedActions: { action: string; reason: string }[];
}): { responseCopy: string; calmSummary: string; humanControlNote: string } {
  const lines: string[] = [];
  lines.push(`**Intent:** ${input.intent.task.replaceAll("_", " ")} (${input.intent.domain})`);
  lines.push(`**Context:** ${input.contextSummary}`);
  if (input.blockers.length) {
    lines.push(`**Blockers:** ${input.blockers.join("; ")}`);
  } else {
    lines.push("**Blockers:** none detected from current snapshot.");
  }
  lines.push("");
  lines.push("**Recommended steps:**");
  for (const step of input.safeActions.slice(0, 4)) {
    lines.push(`- ${step.title}${step.href ? ` → ${step.href}` : ""}`);
  }
  if (input.route.recommended.length) {
    lines.push("");
    lines.push("**Tools (read/recommend only):** " + input.route.recommended.map((t) => t.name).join(", "));
  }
  const blockedNote = blockedActionExplanation(input.intent.riskLevel, input.intent.rawMessage);
  if (blockedNote || input.blockedActions.length) {
    lines.push("");
    lines.push("**Human control:**");
    if (blockedNote) lines.push(blockedNote);
    for (const b of input.blockedActions.slice(0, 3)) {
      lines.push(`- Cannot auto-run: ${b.action} — ${b.reason}`);
    }
  }

  const calmSummary =
    input.blockers.length > 0
      ? `Focus on clearing: ${input.blockers[0]}. Then open the primary route.`
      : `Safe path: ${input.safeActions[0]?.title ?? "open primary route"}.`;

  const humanControlNote =
    "Campaign Agent v3 does not send email, approve events, write Google Calendar, finalize reimbursements, or post financial transactions. Click gated actions in the UI.";

  return { responseCopy: lines.join("\n"), calmSummary, humanControlNote };
}

export function toSerializableResponse(res: AgentRuntimeResponse): AgentRuntimeResponse {
  return JSON.parse(JSON.stringify(res)) as AgentRuntimeResponse;
}
