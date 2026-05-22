import type { RelationshipNode } from "../relationship-intelligence/relationship-graph-types";

export function detectFollowupGaps(nodes: RelationshipNode[]): {
  contactId: string;
  displayName: string;
  reason: string;
  priority: "high" | "medium";
}[] {
  return nodes
    .filter((n) => n.followUpNeeded && !n.suppressed)
    .map((n) => ({
      contactId: n.contactId,
      displayName: n.displayName,
      reason:
        n.burnoutRisk === "high"
          ? "Re-engage carefully — prior high cadence"
          : `Low engagement (${n.engagementScore}) — county ${n.countySlug ?? "statewide"}`,
      priority: n.engagementScore < 30 ? "high" as const : "medium" as const,
    }))
    .slice(0, 20);
}
