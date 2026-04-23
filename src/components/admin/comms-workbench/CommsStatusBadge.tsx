import type {
  CommunicationDraftStatus,
  CommunicationPlanStatus,
  CommunicationSendStatus,
  CommunicationVariantStatus,
} from "@prisma/client";
import {
  getDraftStatusDisplay,
  getPlanStatusDisplay,
  getSendStatusDisplay,
  getVariantStatusDisplay,
  commsStatusBadgeClass,
} from "@/lib/comms-workbench/status-display";

type Props =
  | { segment: "plan"; status: CommunicationPlanStatus; className?: string }
  | { segment: "send"; status: CommunicationSendStatus; className?: string }
  | { segment: "draft"; status: CommunicationDraftStatus; className?: string }
  | { segment: "variant"; status: CommunicationVariantStatus; className?: string };

export function CommsStatusBadge(p: Props) {
  const d =
    p.segment === "plan"
      ? getPlanStatusDisplay(p.status)
      : p.segment === "send"
        ? getSendStatusDisplay(p.status)
        : p.segment === "draft"
          ? getDraftStatusDisplay(p.status)
          : getVariantStatusDisplay(p.status);
  return (
    <span className={commsStatusBadgeClass(d.tone, p.className)} title={d.hint}>
      {d.label}
    </span>
  );
}
