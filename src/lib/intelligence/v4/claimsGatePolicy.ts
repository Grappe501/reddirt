/** Claims gate helpers — stage-use locks for trap lanes, SOS bank, and dossiers. */

export type ClaimsGateSeverity = "clear" | "review" | "research_only" | "blocked";

export function classifyClaimsGate(claimsGate: string): ClaimsGateSeverity {
  const gate = claimsGate.toUpperCase();
  if (gate === "OK" || gate.startsWith("OK ")) return "clear";
  if (gate.includes("NEEDS_RESEARCH") || gate.includes("RESEARCH_QUESTION")) return "research_only";
  if (gate.includes("NEEDS_REVIEW") || gate.includes("VERIFY") || gate.includes("INTERPRETATION")) {
    return "review";
  }
  if (gate.includes("DO NOT") || gate.includes("NO ") || gate.includes("BLOCK")) return "blocked";
  return "review";
}

export function isClaimsGateStageBlocked(claimsGate: string): boolean {
  const severity = classifyClaimsGate(claimsGate);
  return severity === "research_only" || severity === "blocked";
}

export function claimsGateStageLabel(claimsGate: string): string {
  switch (classifyClaimsGate(claimsGate)) {
    case "clear":
      return "Clear for rehearsal";
    case "research_only":
      return "Research-question only — no numeric cite on stage";
    case "blocked":
      return "Blocked — do not use on stage";
    default:
      return "Staff verify before stage";
  }
}

export const RESEARCH_QUESTION_FRAMING =
  "Use research-question framing only — cite statute pattern, not unverified totals.";
