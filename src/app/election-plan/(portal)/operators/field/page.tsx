import Link from "next/link";

import { ElectionPlanOperatorsAdmin } from "@/components/election-plan/ElectionPlanOperatorsAdmin";
import { ElectionPlanOperatorsSubnav } from "@/components/election-plan/ElectionPlanOperatorsSubnav";

export const metadata = {
  title: "Field operators | Election Plan",
  robots: { index: false, follow: false },
};

export default function ElectionPlanFieldOperatorsPage() {
  return (
    <>
      <div className="ep-classification">Internal · Field operator whitelist</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <Link href="/election-plan/operators" className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:underline">
            ← Operators hub
          </Link>
          <h1 className="mt-2 font-heading text-2xl font-bold text-[var(--ep-navy)]">Field operators</h1>
          <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
            3-letter initials whitelist — required before any county or city can log live field results.
          </p>
          <div className="mt-6">
            <ElectionPlanOperatorsSubnav />
          </div>
          <div className="mt-8">
            <ElectionPlanOperatorsAdmin />
          </div>
        </div>
      </div>
    </>
  );
}
