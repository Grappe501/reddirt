import type { RelationshipNode } from "../relationship-intelligence/relationship-graph-types";

export function detectCommunicationFatigue(nodes: RelationshipNode[]): string[] {
  return nodes
    .filter((n) => n.burnoutRisk !== "low" || n.sendCount >= 5)
    .map(
      (n) =>
        `${n.displayName}: ${n.burnoutRisk} burnout risk · ${n.sendCount} sends logged — pause cadence`,
    )
    .slice(0, 12);
}
