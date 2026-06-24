import type { Metadata } from "next";
import Link from "next/link";

import { StatewideVoterRegistrationDashboard } from "@/components/voter-registration/StatewideVoterRegistrationDashboard";
import { ElectionPlanOperatorsSubnav } from "@/components/election-plan/ElectionPlanOperatorsSubnav";
import { loadStatewideVrDashboard } from "@/lib/voter-registration/load-statewide-vr-dashboard";

export const metadata: Metadata = {
  title: "Voter registration command | Operators",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function VoterRegistrationOpsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const payload = await loadStatewideVrDashboard();

  return (
    <>
      <div className="ep-classification">Operators · voter registration v1</div>
      <div className="px-6 pt-6 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Link href="/election-plan/operators" className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:underline">
            ← Operators hub
          </Link>
          <h1 className="mt-2 font-heading text-2xl font-bold text-[var(--ep-navy)]">Voter registration command</h1>
          <p className="mt-2 max-w-3xl text-sm text-[var(--ep-navy-muted)]">
            Registration intake, drive cadence, Help 10 field reporting, and county goal tracking — Shannie and future
            VR leads share this surface with Election Plan operators.
          </p>
          <div className="mt-6">
            <ElectionPlanOperatorsSubnav />
          </div>
        </div>
      </div>
      <StatewideVoterRegistrationDashboard payload={payload} selectedIntakeId={sp.intake} />
    </>
  );
}
