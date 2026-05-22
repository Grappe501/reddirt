import { loadCommunicationsMemory } from "./communications-memory-store";

export function detectUnresolvedFollowups(): string[] {
  const mem = loadCommunicationsMemory();
  return mem.entries
    .filter((e) => e.category === "unresolved_outreach" || e.category === "promise")
    .filter((e) => !e.humanReviewed)
    .map((e) => e.summary)
    .slice(0, 15);
}
