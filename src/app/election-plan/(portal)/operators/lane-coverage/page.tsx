import type { Metadata } from "next";
import Link from "next/link";

import { ElectionPlanOperatorsSubnav } from "@/components/election-plan/ElectionPlanOperatorsSubnav";
import { LaneCoverageDashboard } from "@/components/volunteers/LaneCoverageDashboard";
import { loadLaneCoverageDashboard } from "@/lib/volunteers/load-lane-coverage-dashboard";

export const metadata: Metadata = {
  title: "Lane coverage boards | Operators",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | undefined>>;
};

function parseView(raw: string | undefined): "city" | "coalition" | "campus" | undefined {
  if (raw === "city" || raw === "coalition" || raw === "campus") return raw;
  return undefined;
}

export default async function LaneCoverageOpsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const activeView = parseView(sp.view);
  const payload = await loadLaneCoverageDashboard();

  return (
    <>
      <div className="ep-classification">Operators · lane coverage v1</div>
      <div className="px-6 pt-6 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Link href="/election-plan/operators" className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:underline">
            ← Operators hub
          </Link>
          <h1 className="mt-2 font-heading text-2xl font-bold text-[var(--ep-navy)]">Lane coverage boards</h1>
          <p className="mt-2 max-w-3xl text-sm text-[var(--ep-navy-muted)]">
            City leadership (top 250), coalition workbench leads, and Students for Arkansas campus chapters — mirror
            the county coverage pattern for lane-specific gaps.
          </p>
          <div className="mt-6">
            <ElectionPlanOperatorsSubnav />
          </div>
        </div>
      </div>
      <LaneCoverageDashboard payload={payload} activeView={activeView} />
    </>
  );
}
