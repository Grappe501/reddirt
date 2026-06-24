import { OperationsMyWorkPanel } from "@/components/volunteers/OperationsMyWorkPanel";
import type { RoleInboxPayload } from "@/lib/volunteers/ops-work-items";

type Props = {
  payload: RoleInboxPayload;
  leaderName: string;
  returnTo?: string;
  statusMessage?: string | null;
};

export function LeaderMyWorkPanel({
  payload,
  leaderName,
  returnTo = "/election-plan/operators/leaders/me#my-work",
  statusMessage,
}: Props) {
  return (
    <OperationsMyWorkPanel
      payload={payload}
      returnTo={returnTo}
      statusMessage={statusMessage}
      title={`${leaderName}'s work queue`}
      subtitle="Assigned coaching tasks, CRM follow-ups, and open My Five slots — complete tasks here or jump to the linked section."
      viewAllHref="#my-work"
    />
  );
}
