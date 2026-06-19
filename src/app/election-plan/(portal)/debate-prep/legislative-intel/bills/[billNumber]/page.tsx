import Link from "next/link";
import { notFound } from "next/navigation";

import { ElectionPlanDebatePrepSubnav } from "@/components/election-plan/ElectionPlanDebatePrepSubnav";
import { ElectionPlanHammerBillPanel } from "@/components/election-plan/ElectionPlanHammerBillPanel";
import { EP_LEGISLATIVE_INTEL_HREF } from "@/lib/election-plan/debate-prep-links";
import { loadElectionPlanHammerBillDrillDown } from "@/lib/election-plan/load-hammer-bill-drill-down";
import { listAllBillNumbersFromIndex } from "@/lib/intelligence/v4/billActProofDepth";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return listAllBillNumbersFromIndex().map((billNumber) => ({ billNumber }));
}

export async function generateMetadata({ params }: { params: Promise<{ billNumber: string }> }) {
  const { billNumber } = await params;
  const deep = loadElectionPlanHammerBillDrillDown(billNumber);
  if (!deep) return { title: "Bill not found" };
  return {
    title: `${deep.billNumber}${deep.actNumber ? ` → Act ${deep.actNumber}` : ""} | Debate weapon`,
    robots: { index: false, follow: false },
  };
}

export default async function ElectionPlanHammerBillPage({
  params,
}: {
  params: Promise<{ billNumber: string }>;
}) {
  const { billNumber } = await params;
  const deep = loadElectionPlanHammerBillDrillDown(billNumber);
  if (!deep) notFound();

  return (
    <div className="ep-chapter-body px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <ElectionPlanDebatePrepSubnav compact />
        <header className="mb-6">
          <Link
            href={EP_LEGISLATIVE_INTEL_HREF}
            className="text-xs font-bold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]"
          >
            ← Legislative intelligence
          </Link>
          <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">
            Optional drill-down · Hammer bill weapon
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-[var(--ep-navy)]">
            {deep.billNumber}
            {deep.actNumber ? ` → Act ${deep.actNumber}` : ""}
          </h1>
          <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{deep.title}</p>
        </header>
        <ElectionPlanHammerBillPanel deep={deep} />
      </div>
    </div>
  );
}
