import type { CommunicationSequence } from "./communication-sequence-types";

export function detectSequenceRisks(seq: CommunicationSequence): string[] {
  const risks: string[] = [];
  if (seq.steps.length > 5) risks.push("Long sequence — check fatigue before scheduling");
  if (seq.type === "power_of_five_recruitment") {
    risks.push("Relational organizing content — supervisor approval required");
  }
  if (seq.cadenceDays.some((d) => d === 0) && seq.steps.length > 3) {
    risks.push("Multiple same-day touches — consolidate drafts");
  }
  return risks;
}
