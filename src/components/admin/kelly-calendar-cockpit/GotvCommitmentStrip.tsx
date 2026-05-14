import Link from "next/link";

import type { GotvCommitmentAllocationFile } from "@/lib/field-ops/gotv-commitment-types";

export function GotvCommitmentStrip({ allocation }: { allocation: GotvCommitmentAllocationFile | null }) {
  if (!allocation) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 font-body text-[11px] text-amber-950">
        GOTV allocation missing. Run <code className="rounded bg-white px-1">npm run fieldops:gotv-allocation:build</code>.
      </div>
    );
  }
  const pct = Math.min(100, Math.round((allocation.statewide.currentCommitments / allocation.statewide.commitmentGoal) * 100));
  return (
    <div className="rounded-lg border border-emerald-800/20 bg-emerald-50/70 px-3 py-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-emerald-900/70">GOTV commitment capacity</p>
          <p className="font-body text-[11px] text-kelly-text/75">
            {allocation.statewide.currentCommitments.toLocaleString()} / {allocation.statewide.commitmentGoal.toLocaleString()} commitment cards · gap{" "}
            {allocation.statewide.commitmentGap.toLocaleString()} · relational coverage target{" "}
            {allocation.statewide.estimatedRelationalCoverage.toLocaleString()}
          </p>
        </div>
        <Link href="/admin/calendar-command-center/gotv" className="rounded-full border border-emerald-800/20 bg-white px-2.5 py-1 font-body text-[10px] font-bold uppercase text-emerald-950">
          GOTV board
        </Link>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
        <div className="h-full rounded-full bg-emerald-700" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
