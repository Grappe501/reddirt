import type { Metadata } from "next";
import Link from "next/link";

import { ElectionPlanOperatorsSubnav } from "@/components/election-plan/ElectionPlanOperatorsSubnav";
import { GrassrootsFundraisingSettlementDashboard } from "@/components/volunteers/GrassrootsFundraisingSettlementDashboard";
import { loadGrassrootsFundraisingSettlementDashboard } from "@/lib/volunteers/load-grassroots-fundraising-settlement-dashboard";

export const metadata: Metadata = {
  title: "Grassroots fundraising settlement | Operators",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function GrassrootsFundraisingSettlementOpsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const payload = await loadGrassrootsFundraisingSettlementDashboard();

  return (
    <>
      <div className="ep-classification">Operators · grassroots settlement v1 · internal</div>
      <div className="px-6 pt-6 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Link href="/election-plan/operators" className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:underline">
            ← Operators hub
          </Link>
          <h1 className="mt-2 font-heading text-2xl font-bold text-[var(--ep-navy)]">Grassroots fundraising settlement</h1>
          <p className="mt-2 max-w-3xl text-sm text-[var(--ep-navy-muted)]">
            Commission registry, QR / weblink attribution, and GoodChange gift matching — operator-only until treasurer
            and counsel approve payout structure.
          </p>
          <div className="mt-6">
            <ElectionPlanOperatorsSubnav />
          </div>
        </div>
      </div>
      <GrassrootsFundraisingSettlementDashboard payload={payload} selectedGiftId={sp.gift} />
    </>
  );
}
