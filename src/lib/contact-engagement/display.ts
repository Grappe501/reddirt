import type { CommunicationRecipientEventType } from "@prisma/client";
import { truncateCommsDisplayText } from "../comms-workbench/outcome-display";

const MAX = 200;

/**
 * One-line, operator-safe label for a recipient event row.
 */
export function formatRecipientEventSummaryLine(input: {
  eventType: CommunicationRecipientEventType;
  providerName: string | null;
  linkLabel: string | null;
  linkUrl: string | null;
}): string {
  const parts: string[] = [String(input.eventType)];
  if (input.providerName) parts.push(String(input.providerName));
  if (input.linkLabel) parts.push(String(input.linkLabel));
  if (input.linkUrl) {
    try {
      const u = new URL(input.linkUrl);
      parts.push(`→ ${u.host}${u.pathname}`.slice(0, 80));
    } catch {
      parts.push("→ (link)");
    }
  }
  return truncateCommsDisplayText(parts.join(" · "), MAX);
}
