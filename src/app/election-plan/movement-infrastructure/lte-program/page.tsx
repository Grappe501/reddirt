import Link from "next/link";

import { phase18MasterPlanHref } from "@/lib/election-plan/phase-18-movement-infrastructure";

export default function LteProgramPage() {
  return (
    <>
      <div className="ep-classification">Internal · Phase 18 · LTE Program</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <Link href={phase18MasterPlanHref()} className="text-xs font-semibold text-[var(--ep-navy-muted)]">
            ← Phase 18
          </Link>
          <h1 className="mt-4 font-heading text-2xl font-bold">Letters to the Editor Program</h1>
          <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
            Phase 18.7 — volunteer LTE corps bound to Citizen Voices tier-3 newspaper inventory. Build pending.
          </p>
        </div>
      </div>
    </>
  );
}
