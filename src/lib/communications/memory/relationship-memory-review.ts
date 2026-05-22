import { loadCommunicationsMemory } from "./communications-memory-store";
import { loadRelationshipGraph } from "../relationship-intelligence/relationship-intelligence-engine";

export function buildRelationshipMemoryReview(): {
  pendingReview: number;
  highlights: string[];
  unresolved: string[];
} {
  const mem = loadCommunicationsMemory();
  const graph = loadRelationshipGraph();
  const pending = mem.entries.filter((e) => !e.humanReviewed).length;
  return {
    pendingReview: pending,
    highlights: graph.nodes
      .filter((n) => n.trustLevel === "champion")
      .slice(0, 5)
      .map((n) => `Champion: ${n.displayName}`),
    unresolved: mem.entries
      .filter((e) => e.category === "unresolved_outreach")
      .map((e) => e.summary)
      .slice(0, 8),
  };
}
