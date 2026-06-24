import type { Metadata } from "next";
import Link from "next/link";

import { StatewideCommsCommandDashboard } from "@/components/comms/StatewideCommsCommandDashboard";
import { ElectionPlanOperatorsSubnav } from "@/components/election-plan/ElectionPlanOperatorsSubnav";
import { loadStatewideCommsDashboard } from "@/lib/comms/load-statewide-comms-dashboard";

export const metadata: Metadata = {
  title: "Statewide comms command | Operators",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function CommsCommandOpsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const payload = await loadStatewideCommsDashboard();

  return (
    <>
      <div className="ep-classification">Operators · statewide comms v1</div>
      <div className="px-6 pt-6 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Link href="/election-plan/operators" className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:underline">
            ← Operators hub
          </Link>
          <h1 className="mt-2 font-heading text-2xl font-bold text-[var(--ep-navy)]">Statewide comms command</h1>
          <p className="mt-2 max-w-3xl text-sm text-[var(--ep-navy-muted)]">
            Editorial review, event alignment, email triage, and county comms coverage — Leann and future comms leads
            share this surface with Election Plan operators.
          </p>
          <div className="mt-6">
            <ElectionPlanOperatorsSubnav />
          </div>
        </div>
      </div>
      <StatewideCommsCommandDashboard
        payload={payload}
        selectedDraftId={sp.draft}
        notice={sp.notice}
        error={sp.error}
      />
    </>
  );
}
