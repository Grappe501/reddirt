import Link from "next/link";

import type { CandidateDashboardLayerId } from "@/lib/dashboard-orchestration/candidate-dashboard-layers";

const LAYER_LABEL: Record<CandidateDashboardLayerId, string> = {
  decisions: "Decisions & approvals",
  schedule: "Schedule",
  travel: "Travel & reimbursement",
  finance: "Finance snapshot",
  reports: "Field & county reports",
};

export function CandidateLayerNav({
  month,
  layer,
}: {
  month: string;
  layer: CandidateDashboardLayerId | null;
}) {
  return (
    <nav className="flex flex-wrap items-center gap-2 font-body text-sm" aria-label="Candidate dashboard layers">
      <Link
        href={`/admin/candidate-dashboard?month=${month}`}
        className={layer ? "text-kelly-navy underline" : "font-bold text-kelly-text"}
      >
        Home
      </Link>
      {layer ? (
        <>
          <span className="text-kelly-muted" aria-hidden>
            /
          </span>
          <span className="font-semibold text-kelly-text">{LAYER_LABEL[layer]}</span>
        </>
      ) : null}
    </nav>
  );
}
