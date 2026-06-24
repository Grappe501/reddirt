import type { Metadata } from "next";
import Link from "next/link";

import { ElectionPlanOperatorsSubnav } from "@/components/election-plan/ElectionPlanOperatorsSubnav";
import { VolunteerIntakeActivationDashboard } from "@/components/volunteers/VolunteerIntakeActivationDashboard";
import { loadVolunteerIntakeDashboard } from "@/lib/volunteers/load-volunteer-intake-dashboard";

export const metadata: Metadata = {
  title: "Volunteer intake & activation | Operators",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function VolunteerIntakeOpsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const payload = await loadVolunteerIntakeDashboard();

  return (
    <>
      <div className="ep-classification">Operators · volunteer intake v1</div>
      <div className="px-6 pt-6 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Link href="/election-plan/operators" className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:underline">
            ← Operators hub
          </Link>
          <h1 className="mt-2 font-heading text-2xl font-bold text-[var(--ep-navy)]">Volunteer intake & activation</h1>
          <p className="mt-2 max-w-3xl text-sm text-[var(--ep-navy-muted)]">
            Website sign-up → operator review → county or city placement → workbench unlock. Volunteer Manager and
            Election Plan operators share this queue.
          </p>
          <div className="mt-6">
            <ElectionPlanOperatorsSubnav />
          </div>
        </div>
      </div>
      <VolunteerIntakeActivationDashboard
        payload={payload}
        selectedIntakeId={sp.intake}
        notice={sp.notice}
        error={sp.error}
      />
    </>
  );
}
