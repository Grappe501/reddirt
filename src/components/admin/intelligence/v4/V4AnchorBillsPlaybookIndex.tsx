import Link from "next/link";
import { getBillOperatorPlaybook, listCuratedBillPlaybookNumbers } from "@/lib/intelligence/v4/debateBillOperatorPlaybooks";
import { findV4BillNarrative, loadDebateIntelligenceV4HubPacket } from "@/lib/intelligence/v4/debateIntelligenceV4";
import { V4BillOperatorPlaybookPanel } from "@/components/admin/intelligence/v4/V4BillOperatorPlaybookPanel";
import { KIM_HAMMER_COMMAND_CENTER_HREF } from "@/lib/opposition/kimHammerBriefingRegistry";

/** Hub / debate prep — curated anchor bill playbooks with full step-by-step narrative. */
export function V4AnchorBillsPlaybookIndex({ showFullPanels = false }: { showFullPanels?: boolean }) {
  const v4 = loadDebateIntelligenceV4HubPacket();
  const anchors = listCuratedBillPlaybookNumbers();

  const playbooks = anchors
    .map((billNumber) => {
      const narrative = findV4BillNarrative(v4, billNumber);
      if (!narrative) return null;
      const themeLabels = v4.themeMatrix
        .filter((t) => t.bills.some((b) => b.toUpperCase() === billNumber.toUpperCase()))
        .map((t) => t.label);
      return getBillOperatorPlaybook(billNumber, narrative, {
        inIntegrity2021: v4.integrity2021?.billNumbers.some((b) => b.toUpperCase() === billNumber.toUpperCase()),
        themeLabels,
      });
    })
    .filter(Boolean);

  return (
    <section className="mb-8">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-900">Record items — step-by-step</p>
      <h2 className="mt-2 font-heading text-xl font-bold text-kelly-navy">
        How to use each anchor bill (debate, social, traps)
      </h2>
      <p className="mt-2 max-w-4xl text-sm text-kelly-muted">
        Each card walks through what the bill is, when and where to raise it, why it matters to voters and clerks, how to
        say it works against everyday Arkansans (without unsourced attacks), debate scripts, social thread outlines, and how
        to bait-and-pivot traps. All 29 bills have auto playbooks on their drill-down pages.
      </p>

      {!showFullPanels ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {playbooks.map((pb) =>
            pb ? (
              <Link
                key={pb.billNumber}
                href={`${KIM_HAMMER_COMMAND_CENTER_HREF}/bills/${encodeURIComponent(pb.billNumber)}`}
                className="rounded-xl border border-kelly-navy/15 bg-white p-4 transition hover:border-kelly-navy/40"
              >
                <p className="text-[10px] font-bold uppercase text-violet-800">{pb.recordItemLabel}</p>
                <p className="mt-2 text-sm font-bold text-kelly-navy">{pb.headline.slice(0, 80)}…</p>
                <p className="mt-2 line-clamp-3 text-xs text-kelly-muted">{pb.peopleImpactFrame}</p>
                {pb.trapSetup ? (
                  <p className="mt-2 text-[10px] font-semibold text-kelly-gold">Trap: {pb.trapSetup.name}</p>
                ) : null}
              </Link>
            ) : null,
          )}
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {playbooks.map((pb) => (pb ? <V4BillOperatorPlaybookPanel key={pb.billNumber} playbook={pb} /> : null))}
        </div>
      )}
    </section>
  );
}
