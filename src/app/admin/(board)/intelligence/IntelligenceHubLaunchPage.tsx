import Link from "next/link";
import { loadKimHammerWorkbenchHubSummary } from "@/lib/opposition/kimHammerWorkbench";
import { tryIntelligenceLoad } from "@/lib/intelligence/safeIntelligenceLoad";

const EMPTY = {
  totalBills: 0,
  enactedActs: 0,
  researchConfidenceScore: 0,
  topQuestions: [] as string[],
  debateDrillQueue: [] as Array<{ billNumber: string; prompt: string; risk: string }>,
  riskClaims: ["Verify bill numbers against the election-law index before citing in debate."],
  strongestDebateAnchors: [] as Array<{ billNumber: string; actNumber: string | null }>,
  highConfidenceThemes: [] as Array<{ theme: string; billCount: number }>,
};

/**
 * Kelly-first intelligence hub — JSON packet only, must not throw.
 */
export default function IntelligenceHubLaunchPage() {
  const data = tryIntelligenceLoad("kim-hammer-hub-summary", () => loadKimHammerWorkbenchHubSummary(), EMPTY);
  const topTheme = data.highConfidenceThemes[0];

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 rounded-2xl border-2 border-violet-900/20 bg-gradient-to-br from-violet-50/80 via-white to-kelly-page p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-violet-900">Kelly · debate week</p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-kelly-navy">Tonight&apos;s overview</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-kelly-muted">
          Your private prep room for the Secretary of State race. Start with debate prep for rehearsal prompts, then
          verify any line you plan to use in public.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/admin/intelligence/kim-hammer/debate-prep"
            className="rounded-full bg-kelly-navy px-5 py-2.5 text-sm font-bold text-white shadow-sm"
          >
            Open debate prep →
          </Link>
          <Link
            href="/admin/intelligence/claims"
            className="rounded-full border border-kelly-navy/30 bg-white px-5 py-2.5 text-sm font-bold text-kelly-navy"
          >
            Verify claims
          </Link>
        </div>
      </header>

      <section className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Bills in packet</p>
          <p className="mt-1 font-heading text-3xl font-bold">{data.totalBills}</p>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Enacted acts</p>
          <p className="mt-1 font-heading text-3xl font-bold">{data.enactedActs}</p>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">High-confidence index</p>
          <p className="mt-1 font-heading text-3xl font-bold">{data.researchConfidenceScore}%</p>
          {topTheme ? (
            <p className="mt-1 text-xs text-kelly-muted">
              Top theme: {topTheme.theme.replaceAll("_", " ")} ({topTheme.billCount} bills)
            </p>
          ) : null}
        </div>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Mock debate drill</h2>
          <p className="mt-1 text-xs text-kelly-muted">Rehearse 30s / 60s answers for anchor bills.</p>
          {data.debateDrillQueue.length === 0 ? (
            <p className="mt-3 text-xs text-amber-900">Bill index not loaded — staff: confirm opposition JSON is in the deploy.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-xs text-kelly-muted">
              {data.debateDrillQueue.map((card) => (
                <li key={card.billNumber} className="rounded border border-kelly-text/10 p-2">
                  <Link
                    href={`/admin/intelligence/kim-hammer/bills/${encodeURIComponent(card.billNumber)}`}
                    className="font-bold text-kelly-navy underline"
                  >
                    {card.billNumber}
                  </Link>
                  <span className="text-kelly-subtle"> · risk {card.risk}</span>
                  <p className="mt-1">{card.prompt}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Do not say (until verified)</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {data.riskClaims.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <h3 className="mt-4 text-xs font-bold uppercase text-kelly-navy">Reporter-style questions</h3>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {data.topQuestions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Strongest debate anchors</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {data.strongestDebateAnchors.map((bill) => (
            <Link
              key={bill.billNumber}
              href={`/admin/intelligence/kim-hammer/bills/${encodeURIComponent(bill.billNumber)}`}
              className="rounded-full border border-kelly-navy/25 bg-kelly-page px-3 py-1 text-xs font-bold text-kelly-navy"
            >
              {bill.billNumber}
              {bill.actNumber ? ` · Act ${bill.actNumber}` : ""}
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-kelly-text/10 bg-kelly-page/50 p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Staff tools</p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <Link href="/admin/intelligence/debate-command" className="font-semibold text-kelly-navy underline">
            Debate command
          </Link>
          <Link href="/admin/intelligence/kim-hammer" className="font-semibold text-kelly-navy underline">
            Opponent record
          </Link>
          <Link href="/admin/intelligence/action-queue" className="font-semibold text-kelly-navy underline">
            Action queue
          </Link>
          <Link href="/admin/intelligence/kim-hammer/evidence-command" className="font-semibold text-kelly-navy underline">
            Evidence command
          </Link>
        </div>
      </section>
    </div>
  );
}
