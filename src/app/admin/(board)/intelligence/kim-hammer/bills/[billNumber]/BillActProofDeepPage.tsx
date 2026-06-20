import type { BillActProofDeep } from "@/lib/intelligence/v4/billActProofDepth";
import Link from "next/link";
import { ElectionPlanBillEnrolledSectionsPanel } from "@/components/election-plan/ElectionPlanBillEnrolledSectionsPanel";
import { KIM_HAMMER_COMMAND_CENTER_HREF } from "@/lib/opposition/kimHammerBriefingRegistry";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";

const TIER_COLORS = {
  novice: "border-emerald-200 bg-emerald-50/40",
  intermediate: "border-sky-200 bg-sky-50/40",
  expert: "border-violet-200 bg-violet-50/40",
} as const;

export function BillActProofDeepPage({ deep }: { deep: BillActProofDeep }) {
  const billHref = `${KIM_HAMMER_COMMAND_CENTER_HREF}/bills/${encodeURIComponent(deep.billNumber)}`;

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Act proof drill-down · v5 depth"
        title={`${deep.billNumber}${deep.actNumber ? ` → Act ${deep.actNumber}` : ""}`}
        description={deep.narrative.plainEnglishSummary}
      >
        <V4BackLinks />
        <Link href={billHref} className="rounded-full border border-violet-800/30 px-3 py-1 text-xs font-bold text-violet-950">
          Bill overview
        </Link>
        <Link
          href="/admin/intelligence/claims"
          className="rounded-full border border-amber-300/60 px-3 py-1 text-xs font-bold text-amber-950"
        >
          Claims gate
        </Link>
      </V4PageHeader>

      <section className="mb-6 rounded-xl border-2 border-kelly-gold/50 bg-kelly-page/60 p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-kelly-navy">Primary sources — read the actual bill</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {deep.arklegBillUrl ? (
            <a
              href={deep.arklegBillUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-kelly-navy bg-white px-4 py-2 text-sm font-bold text-kelly-navy underline"
            >
              Arkleg bill detail — {deep.billNumber} ({deep.sessionYear})
            </a>
          ) : (
            <p className="text-xs text-amber-900">Arkleg URL missing — verify session year on bill index before stage.</p>
          )}
          {deep.arklegActPdfUrl ? (
            <a
              href={deep.arklegActPdfUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-950 underline"
            >
              Enrolled act PDF
            </a>
          ) : null}
          {deep.sourceLinks
            .filter((u) => u !== deep.arklegBillUrl && u !== deep.arklegActPdfUrl)
            .map((url) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-kelly-text/15 px-3 py-2 text-xs font-bold text-kelly-navy underline"
              >
                {url.includes("arkleg") ? "Arkleg source" : "Source link"}
              </a>
            ))}
        </div>
        <p className="mt-3 text-xs text-kelly-muted">
          Session: {deep.sessionYear} · Hammer role: {deep.hammerRole}
          {deep.inIntegrity2021 ? " · Part of 2021 integrity foundation package" : ""}
        </p>
      </section>

      {deep.themeLabels.length > 0 ? (
        <section className="mb-4 flex flex-wrap gap-2">
          {deep.themeLabels.map((t) => (
            <span key={t} className="rounded-full border border-kelly-navy/20 px-3 py-1 text-[10px] font-bold text-kelly-navy">
              {t}
            </span>
          ))}
        </section>
      ) : null}

      <section className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50/30 p-5">
        <h2 className="text-sm font-bold uppercase text-indigo-950">Definitions &amp; key terms</h2>
        <dl className="mt-4 space-y-3 text-xs">
          {deep.definitions.map((d) => (
            <div key={d.term} className="rounded-lg border border-indigo-100 bg-white p-3">
              <dt className="font-bold text-indigo-950">{d.term}</dt>
              <dd className="mt-1 text-kelly-muted">{d.definition}</dd>
            </div>
          ))}
        </dl>
      </section>

      {deep.enrolledAct ? (
        <section className="mb-6">
          <ElectionPlanBillEnrolledSectionsPanel enrolledAct={deep.enrolledAct} variant="admin" />
        </section>
      ) : null}

      <section className="mb-6 space-y-4">
        <h2 className="text-sm font-bold uppercase text-kelly-navy">Education tiers — novice to expert</h2>
        {deep.educationTiers.map((tier) => (
          <article key={tier.level} className={`rounded-xl border p-5 text-xs ${TIER_COLORS[tier.level]}`}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-navy">{tier.label}</p>
            <p className="mt-2 text-sm font-semibold text-kelly-text">{tier.summary}</p>
            <p className="mt-3 font-bold text-kelly-navy">Steps</p>
            <ol className="mt-2 list-inside list-decimal space-y-1 text-kelly-muted">
              {tier.steps.map((step) => (
                <li key={step.slice(0, 48)}>{step}</li>
              ))}
            </ol>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div>
                <p className="font-bold text-emerald-900">Candidate should</p>
                <ul className="mt-1 list-inside list-disc text-emerald-950/90">
                  {tier.candidateDo.map((line) => (
                    <li key={line.slice(0, 48)}>{line}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-bold text-rose-900">Avoid</p>
                <ul className="mt-1 list-inside list-disc text-rose-950/90">
                  {tier.candidateAvoid.map((line) => (
                    <li key={line.slice(0, 48)}>{line}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="mb-6 rounded-xl border border-kelly-navy/15 bg-white p-5">
        <h2 className="text-sm font-bold uppercase text-kelly-navy">Step-by-step — how we cover this bill</h2>
        <ol className="mt-4 space-y-3">
          {deep.stepByStepCoverage.map((row) => (
            <li key={row.phase} className="rounded-lg border border-kelly-text/10 p-4 text-xs">
              <p className="font-bold text-violet-950">{row.phase}</p>
              <p className="mt-2">
                <span className="font-semibold text-kelly-navy">What happens:</span> {row.whatHappens}
              </p>
              <p className="mt-2">
                <span className="font-semibold text-emerald-900">Kelly move:</span> {row.kellyMove}
              </p>
              <p className="mt-2">
                <span className="font-semibold text-amber-900">Backup / evidence:</span> {row.backupEvidence}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-6 rounded-xl border border-rose-200 bg-rose-50/30 p-5">
        <h2 className="text-sm font-bold uppercase text-rose-950">Opponent response rounds — expect · rebut · lead</h2>
        <div className="mt-4 space-y-3">
          {deep.opponentExpectedResponses.map((row) => (
            <article key={`${row.speaker}-${row.round}`} className="rounded-lg border border-rose-100 bg-white p-4 text-xs">
              <p className="font-bold text-rose-900">
                Round {row.round} — {row.speaker} likely says:
              </p>
              <p className="mt-1 italic text-kelly-muted">&ldquo;{row.likelyLine}&rdquo;</p>
              <p className="mt-2">
                <span className="font-bold text-emerald-900">Kelly rebuttal / lead:</span> {row.kellyRebuttal}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 text-xs">
          <p className="font-bold uppercase text-emerald-900">Kelly frame</p>
          <p className="mt-2 text-emerald-950">{deep.narrative.debateFrames.kellyFrame}</p>
        </div>
        <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-4 text-xs">
          <p className="font-bold uppercase text-rose-900">Hammer frame (expect)</p>
          <p className="mt-2 text-rose-950">{deep.narrative.debateFrames.hammerFrame}</p>
        </div>
        <div className="rounded-xl border border-sky-100 bg-sky-50/40 p-4 text-xs">
          <p className="font-bold uppercase text-sky-900">County frame</p>
          <p className="mt-2 text-sky-950">{deep.narrative.debateFrames.countyFrame}</p>
        </div>
      </section>

      {deep.playbook.trapSetup ? (
        <section className="mb-6 rounded-xl border-2 border-kelly-gold/40 bg-kelly-page/60 p-5 text-xs">
          <p className="font-bold uppercase text-kelly-navy">Trap setup — walk him into your hand</p>
          <p className="mt-2 font-semibold text-violet-950">{deep.playbook.trapSetup.name}</p>
          <ul className="mt-3 space-y-2 text-kelly-muted">
            <li>
              <span className="font-semibold text-kelly-navy">Bait:</span> &ldquo;{deep.playbook.trapSetup.baitLineYouWantFromOpponent}&rdquo;
            </li>
            <li>
              <span className="font-semibold text-kelly-navy">Setup question:</span> {deep.playbook.trapSetup.moderatorOrKellySetupQuestion}
            </li>
            <li>
              <span className="font-semibold text-kelly-navy">Pivot when he bites:</span> {deep.playbook.trapSetup.kellyPivotWhenHeBites}
            </li>
            <li>
              <span className="font-semibold text-kelly-navy">Why it works:</span> {deep.playbook.trapSetup.whyItWorks}
            </li>
          </ul>
        </section>
      ) : null}

      <section className="rounded-xl border border-violet-200/40 bg-violet-50/30 p-4 text-xs text-violet-950">
        <p className="font-bold uppercase">Strategic briefing</p>
        <ul className="mt-2 list-inside list-disc">
          <li>How to message: {deep.narrative.strategicBriefing.howToMessage}</li>
          <li>Debate impact: {deep.narrative.strategicBriefing.debateImpact}</li>
          <li>When to use: {deep.narrative.strategicBriefing.whenToUse}</li>
          <li className="text-amber-900">When not to use: {deep.narrative.strategicBriefing.whenNotToUse}</li>
        </ul>
        <p className="mt-3 text-[10px] font-bold text-amber-900">
          Publication risk: {deep.narrative.publicationRisk} — run act-specific claims through claims ledger before broadcast.
        </p>
      </section>
    </div>
  );
}
