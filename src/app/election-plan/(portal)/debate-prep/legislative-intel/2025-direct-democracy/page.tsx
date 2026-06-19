import Link from "next/link";

import { ElectionPlanDebatePrepSubnav } from "@/components/election-plan/ElectionPlanDebatePrepSubnav";
import { LegislativeIntelDrillDownPanel } from "@/components/election-plan/LegislativeIntelDrillDownPanel";
import { EP_LEGISLATIVE_INTEL_HREF } from "@/lib/election-plan/debate-prep-links";
import { getLegislativeIntel2025Page } from "@/lib/election-plan/legislative-intel-drill-down";

export const metadata = {
  title: "2025 direct democracy bills | Debate Prep",
  robots: { index: false, follow: false },
};

export default function LegislativeIntel2025Page() {
  const page = getLegislativeIntel2025Page();

  return (
    <div className="ep-chapter-body px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <ElectionPlanDebatePrepSubnav compact />
        <header className="mb-6">
          <Link href={EP_LEGISLATIVE_INTEL_HREF} className="text-xs font-bold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
            ← Legislative intelligence
          </Link>
          <h1 className="mt-3 font-heading text-3xl font-bold text-[var(--ep-navy)]">{page.title}</h1>
          <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{page.subtitle}</p>
        </header>
        <LegislativeIntelDrillDownPanel page={page} />
      </div>
    </div>
  );
}
