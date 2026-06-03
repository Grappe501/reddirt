import Link from "next/link";
import { loadKimHammerWorkbenchHubSummary } from "@/lib/opposition/kimHammerWorkbench";
import { tryIntelligenceLoad } from "@/lib/intelligence/safeIntelligenceLoad";

const EMPTY_SUMMARY = {
  totalBills: 0,
  enactedActs: 0,
  researchConfidenceScore: 0,
  topQuestions: [] as string[],
  debateDrillQueue: [] as Array<{ billNumber: string; prompt: string; risk: string }>,
  riskClaims: [] as string[],
  strongestDebateAnchors: [] as Array<{ billNumber: string; actNumber: string | null }>,
  recommendedNextPass: [] as string[],
};

/**
 * Debate launch — two JSON reads only. No KimHammerBriefingPageShell / module briefings graph.
 */
export default function DebatePrepLaunchPage() {
  const data = tryIntelligenceLoad("kim-hammer-hub-summary", () => loadKimHammerWorkbenchHubSummary(), EMPTY_SUMMARY);

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Debate prep</p>
        <h1 className="font-heading text-2xl font-bold text-kelly-navy">Kim Hammer · rehearsal briefing</h1>
        <p className="mt-2 max-w-3xl text-sm text-kelly-muted">
          Fast launch packet from the election-law bill index only. Verify bill and act numbers before any public use.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Link href="/admin/intelligence" className="rounded-full border border-kelly-navy/30 px-3 py-1 font-bold text-kelly-navy">
            ← Start here
          </Link>
          <Link
            href="/admin/intelligence/claims"
            className="rounded-full border border-kelly-navy/30 px-3 py-1 font-bold text-kelly-navy"
          >
            Claims ledger
          </Link>
        </div>
      </header>

      <section className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-kelly-text/10 bg-white p-3 text-sm">
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Bills indexed</p>
          <p className="mt-1 font-heading text-2xl font-bold">{data.totalBills}</p>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white p-3 text-sm">
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Enacted acts</p>
          <p className="mt-1 font-heading text-2xl font-bold">{data.enactedActs}</p>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white p-3 text-sm">
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Index confidence</p>
          <p className="mt-1 font-heading text-2xl font-bold">{data.researchConfidenceScore}%</p>
        </div>
      </section>

      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Core frame</h2>
        <p className="mt-2 text-xs text-kelly-muted">
          Trust, transparency, county support, participation, and election integrity — answer the question first, then bridge
          with sourced bill/act references.
        </p>
      </section>

      <section className="mb-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Question bank</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {data.topQuestions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Mock debate drill</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {data.debateDrillQueue.map((card) => (
              <li key={card.billNumber}>
                <Link
                  href={`/admin/intelligence/kim-hammer/bills/${encodeURIComponent(card.billNumber)}`}
                  className="font-semibold text-kelly-navy underline"
                >
                  {card.billNumber}
                </Link>
                : {card.prompt} (risk {card.risk})
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Strongest debate anchors</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {data.strongestDebateAnchors.map((bill) => (
              <li key={bill.billNumber}>
                <Link
                  href={`/admin/intelligence/kim-hammer/bills/${encodeURIComponent(bill.billNumber)}`}
                  className="font-semibold text-kelly-navy underline"
                >
                  {bill.billNumber}
                </Link>
                {bill.actNumber ? ` · Act ${bill.actNumber}` : null}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Do not say / risk claims</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {data.riskClaims.map((risk) => (
              <li key={risk}>{risk}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-xl border border-amber-200/50 bg-amber-50/40 p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-amber-950">Next research pass</h2>
        <ul className="mt-2 list-inside list-disc text-xs text-amber-950">
          {data.recommendedNextPass.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-3 text-[10px] text-amber-900/80">
          Full 14-section briefing, scenario simulation, and county overlays load when debate launch mode is turned off after
          deploy stabilizes.
        </p>
      </section>
    </div>
  );
}
