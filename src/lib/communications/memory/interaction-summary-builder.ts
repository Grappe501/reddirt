import type { RelationshipNode } from "../relationship-intelligence/relationship-graph-types";
import { appendCommunicationsMemory } from "./communications-memory-store";

export function buildInteractionSummary(node: RelationshipNode, note: string): string {
  return `${node.displayName}: ${note} (engagement ${node.engagementScore}, trust ${node.trustLevel})`;
}

export function recordInteractionSummary(node: RelationshipNode, note: string): void {
  appendCommunicationsMemory({
    contactId: node.contactId,
    countySlug: node.countySlug,
    category: "interaction",
    summary: buildInteractionSummary(node, note),
  });
}
