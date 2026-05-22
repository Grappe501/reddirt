import type { RelationshipNode } from "./relationship-graph-types";

export function buildRelationshipMemoryLines(node: RelationshipNode): string[] {
  const lines: string[] = [
    `${node.displayName} · trust ${node.trustLevel} · engagement ${node.engagementScore}/100`,
  ];
  if (node.countySlug) lines.push(`County: ${node.countySlug}`);
  if (node.notes.length) lines.push(`Notes: ${node.notes[0]}`);
  if (node.followUpNeeded) lines.push("Follow-up recommended — human review before outreach");
  if (node.burnoutRisk === "high") lines.push("Reduce communication frequency — burnout risk");
  return lines;
}
