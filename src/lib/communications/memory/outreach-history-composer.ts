import { loadCommunicationsStore } from "@/lib/campaign-events/communications/communications-store";
import type { RelationshipNode } from "../relationship-intelligence/relationship-graph-types";

export function composeOutreachHistory(node: RelationshipNode): string[] {
  const store = loadCommunicationsStore();
  const lines = [
    `Contact ${node.email} · ${node.sendCount} sends in campaign audit`,
    node.lastTouchAt ? `Last profile touch: ${node.lastTouchAt.slice(0, 10)}` : "No touch timestamp",
  ];
  const recent = store.sends
    .filter((s) => s.status === "sent" || s.status === "blocked")
    .slice(-3);
  for (const s of recent) {
    lines.push(`Send ${s.id}: ${s.status} · ${s.recipientCount} recipients`);
  }
  return lines;
}
