import Link from "next/link";

import { ElectionPlanBillEnrolledSectionsPanel } from "@/components/election-plan/ElectionPlanBillEnrolledSectionsPanel";
import { DebateDeepLinkText } from "@/components/election-plan/DebateDeepLinkText";
import type { ElectionPlanHammerBillDrillDown } from "@/lib/election-plan/load-hammer-bill-drill-down";
import {
  EP_LEGISLATIVE_INTEL_HREF,
  epDebateQuestionHref,
  epLegislativeIntel2021Href,
  epLegislativeIntel2025Href,
} from "@/lib/election-plan/debate-prep-links";

const TIER_STYLE = {
  novice: "border-emerald-200 bg-emerald-50/40",
  intermediate: "border-sky-200 bg-sky-50/40",
  expert: "border-violet-200 bg-violet-50/40",
} as const;

export function ElectionPlanHammerBillPanel({ deep }: { deep: ElectionPlanHammerBillDrillDown }) {
  const packageHref = deep.inIntegrity2021 ? epLegislativeIntel2021Href() : epLegislativeIntel2025Href();

  return (
    <div className="space-y-6">
      <article className="ep-card border-l-4 border-[var(--ep-gold)] p-5 text-sm">
        <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">Optional deep dive · offensive weapon</p>
        <p className="mt-2 leading-relaxed text-[var(--ep-navy)]">
          <DebateDeepLinkText text={deep.narrative.plainEnglishSummary} />
        </p>
        <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">
          Session {deep.sessionYear} · Hammer role: {deep.hammerRole}
          {deep.inIntegrity2021 ? (
            <>
              {" "}
              ·{" "}
              <Link href={epLegislativeIntel2021Href()} className="font-semibold underline">
                2021 six-bill package
              </Link>
            </>
          ) : null}
        </p>
      </article>

      <section className="ep-card p-5">
        <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Primary sources — read the actual bill</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {deep.arklegBillUrl ? (
            <a
              href={deep.arklegBillUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border-2 border-[var(--ep-navy)] bg-white px-4 py-2 text-sm font-bold text-[var(--ep-navy)] underline"
            >
              Arkleg — {deep.billNumber} ↗
            </a>
          ) : (
            <p className="text-xs text-amber-900">Arkleg URL missing — verify session year before stage.</p>
          )}
          {deep.arklegActPdfUrl ? (
            <a
              href={deep.arklegActPdfUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-950 underline"
            >
              Enrolled act PDF ↗
            </a>
          ) : null}
        </div>
      </section>

      {deep.enrolledAct ? (
        <ElectionPlanBillEnrolledSectionsPanel enrolledAct={deep.enrolledAct} variant="election-plan" />
      ) : null}

      {deep.playbook.trapSetup ? (
        <section className="ep-card border-2 border-[var(--ep-gold)]/50 bg-[var(--ep-cream)]/60 p-5 text-sm">
          <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">Trap setup — walk him into your hand</p>
          <p className="mt-2 font-semibold text-[var(--ep-navy)]">{deep.playbook.trapSetup.name}</p>
          <ul className="mt-3 space-y-2 text-[var(--ep-navy-muted)]">
            <li>
              <span className="font-semibold text-rose-900">Bait:</span> &ldquo;{deep.playbook.trapSetup.baitLineYouWantFromOpponent}&rdquo;
            </li>
            <li>
              <span className="font-semibold text-[var(--ep-navy)]">Ask him:</span>{" "}
              <DebateDeepLinkText text={deep.playbook.trapSetup.moderatorOrKellySetupQuestion} />
            </li>
            <li>
              <span className="font-semibold text-emerald-900">Pivot when he bites:</span>{" "}
              <DebateDeepLinkText text={deep.playbook.trapSetup.kellyPivotWhenHeBites} />
            </li>
          </ul>
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="ep-card border-emerald-200 bg-emerald-50/40 p-4 text-sm">
          <p className="text-xs font-bold uppercase text-emerald-900">Kelly frame</p>
          <p className="mt-2 text-[var(--ep-navy)]">
            <DebateDeepLinkText text={deep.narrative.debateFrames.kellyFrame} />
          </p>
        </article>
        <article className="ep-card border-rose-200 bg-rose-50/40 p-4 text-sm">
          <p className="text-xs font-bold uppercase text-rose-900">Hammer will say</p>
          <p className="mt-2 text-[var(--ep-navy)]">
            <DebateDeepLinkText text={deep.narrative.debateFrames.hammerFrame} />
          </p>
        </article>
        <article className="ep-card border-sky-200 bg-sky-50/40 p-4 text-sm">
          <p className="text-xs font-bold uppercase text-sky-900">County frame</p>
          <p className="mt-2 text-[var(--ep-navy)]">
            <DebateDeepLinkText text={deep.narrative.debateFrames.countyFrame} />
          </p>
        </article>
      </div>

      <section className="ep-card p-5 text-sm">
        <p className="text-xs font-bold uppercase text-[var(--ep-navy)]">Kelly anticipated questions — rehearse answers</p>
        <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
          Smart candidates dig here before ChatGPT — each tier adds depth. Optional rabbit holes; stop when you have your 30-second line.
        </p>
        <div className="mt-4 space-y-4">
          {deep.educationTiers.map((tier) => (
            <article key={tier.level} className={`rounded-lg border p-4 ${TIER_STYLE[tier.level]}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--ep-navy)]">{tier.label}</p>
              <p className="mt-2 font-semibold text-[var(--ep-navy)]">
                <DebateDeepLinkText text={tier.summary} />
              </p>
              <ol className="mt-3 list-inside list-decimal space-y-1 text-xs text-[var(--ep-navy-muted)]">
                {tier.steps.map((step) => (
                  <li key={step.slice(0, 48)}>
                    <DebateDeepLinkText text={step} />
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </section>

      <section className="ep-card p-5 text-sm">
        <p className="text-xs font-bold uppercase text-[var(--ep-navy)]">Debate timeline — six beats</p>
        <ol className="mt-4 space-y-3">
          {deep.stepByStepCoverage.map((row) => (
            <li key={row.phase} className="rounded-lg border border-[var(--ep-border)] p-4 text-xs">
              <p className="font-bold text-violet-950">{row.phase}</p>
              <p className="mt-2">
                <span className="font-semibold text-[var(--ep-navy)]">What happens:</span>{" "}
                <DebateDeepLinkText text={row.whatHappens} />
              </p>
              <p className="mt-2">
                <span className="font-semibold text-emerald-900">Kelly move:</span>{" "}
                <DebateDeepLinkText text={row.kellyMove} />
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="ep-card border-rose-200 bg-rose-50/30 p-5 text-sm">
        <p className="text-xs font-bold uppercase text-rose-950">Opponent rounds — expect · rebut · lead</p>
        <div className="mt-4 space-y-3">
          {deep.opponentExpectedResponses.map((row) => (
            <article key={`${row.speaker}-${row.round}`} className="rounded-lg border border-rose-100 bg-white p-4 text-xs">
              <p className="font-bold text-rose-900">
                Round {row.round} — {row.speaker}:
              </p>
              <p className="mt-1 italic text-[var(--ep-navy-muted)]">&ldquo;{row.likelyLine}&rdquo;</p>
              <p className="mt-2 text-[var(--ep-navy)]">
                <DebateDeepLinkText text={row.kellyRebuttal} />
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="ep-card p-5 text-sm">
        <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Definitions</p>
        <dl className="mt-4 space-y-3">
          {deep.definitions.map((d) => (
            <div key={d.term} className="rounded-lg border border-[var(--ep-border)] bg-white p-3 text-xs">
              <dt className="font-bold text-[var(--ep-navy)]">{d.term}</dt>
              <dd className="mt-1 text-[var(--ep-navy-muted)]">
                <DebateDeepLinkText text={d.definition} />
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {deep.relatedQuestions.length > 0 ? (
        <section className="ep-card border-violet-200 bg-violet-50/30 p-5 text-sm">
          <p className="text-xs font-bold uppercase text-violet-950">40 questions that touch this bill</p>
          <ul className="mt-3 space-y-2">
            {deep.relatedQuestions.map((q) => (
              <li key={q.questionId}>
                <Link href={epDebateQuestionHref(q.questionId)} className="font-semibold text-[var(--ep-navy)] underline">
                  Q{q.questionNumber} · {q.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <nav className="flex flex-wrap gap-2 text-xs font-bold">
        <Link href={EP_LEGISLATIVE_INTEL_HREF} className="rounded-full border border-[var(--ep-navy)] px-3 py-1 text-[var(--ep-navy)]">
          Legislative hub →
        </Link>
        <Link href={packageHref} className="rounded-full border border-[var(--ep-navy)] px-3 py-1 text-[var(--ep-navy)]">
          Package context →
        </Link>
      </nav>
    </div>
  );
}
