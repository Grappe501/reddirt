import Link from "next/link";

import type { DebatePhilosophyBriefing } from "@/lib/intelligence/v4/debateBriefingDepthTypes";
import { mapAdminHrefToElectionPlan } from "@/lib/election-plan/debate-prep-route-map";
import {
  EP_DEBATE_PREP_COMMAND_HREF,
  EP_TRAP_LANES_HREF,
  epDebatePrepBriefingHref,
  epTrapLaneHref,
} from "@/lib/election-plan/debate-prep-links";

function PhraseBlock({ phrases }: { phrases: DebatePhilosophyBriefing["samplePhrases"] }) {
  return (
    <section className="ep-card p-5 text-sm">
      <h3 className="text-xs font-bold uppercase text-[var(--ep-navy)]">Sample phrases</h3>
      <div className="mt-4 space-y-3">
        {phrases.map((p) => (
          <article key={p.label} className="rounded-lg border border-[var(--ep-border)] bg-white p-4">
            <p className="font-bold text-[var(--ep-navy)]">{p.label}</p>
            <p className="mt-2 leading-relaxed text-[var(--ep-navy-muted)]">&ldquo;{p.text}&rdquo;</p>
            <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
              <span className="font-semibold text-[var(--ep-navy)]">When:</span> {p.whenToUse}
            </p>
            <p className="mt-1 text-xs text-violet-900">Presence: {p.presenceGoal}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ElectionPlanPhilosophyBriefingPanel({ briefing }: { briefing: DebatePhilosophyBriefing }) {
  return (
    <div className="space-y-6">
      <article className="ep-card border-2 border-violet-300/50 bg-violet-50/40 p-5">
        <p className="text-xs font-bold uppercase text-violet-900">{briefing.eyebrow}</p>
        <p className="mt-3 text-sm leading-relaxed text-[var(--ep-navy-muted)]">{briefing.corePhilosophy}</p>
        <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">~{briefing.estimatedReadMinutes} min read</p>
      </article>

      <article className="ep-card p-5 text-sm">
        <h3 className="text-xs font-bold uppercase text-[var(--ep-navy)]">Why this method</h3>
        <p className="mt-2 text-[var(--ep-navy-muted)]">{briefing.whyThisMethod}</p>
      </article>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="ep-card border-emerald-200 bg-emerald-50/40 p-5 text-sm">
          <h3 className="text-xs font-bold uppercase text-emerald-900">When to apply</h3>
          <ul className="mt-3 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
            {briefing.whenToApply.map((w) => (
              <li key={w.slice(0, 40)}>{w}</li>
            ))}
          </ul>
        </section>
        <section className="ep-card border-rose-200 bg-rose-50/40 p-5 text-sm">
          <h3 className="text-xs font-bold uppercase text-rose-900">When not to apply</h3>
          <ul className="mt-3 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
            {briefing.whenNotToApply.map((w) => (
              <li key={w.slice(0, 40)}>{w}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="ep-card p-5 text-sm">
        <h3 className="text-xs font-bold uppercase text-[var(--ep-navy)]">Handling steps</h3>
        <ol className="mt-3 list-inside list-decimal space-y-2 text-[var(--ep-navy-muted)]">
          {briefing.handlingSteps.map((step) => (
            <li key={step.slice(0, 48)}>{step}</li>
          ))}
        </ol>
      </section>

      <PhraseBlock phrases={briefing.samplePhrases} />

      <section className="ep-card border-amber-200 bg-amber-50/40 p-5 text-sm">
        <h3 className="text-xs font-bold uppercase text-amber-900">Common mistakes</h3>
        <ul className="mt-3 list-inside list-disc text-rose-950">
          {briefing.commonMistakes.map((m) => (
            <li key={m.slice(0, 48)}>{m}</li>
          ))}
        </ul>
      </section>

      {(briefing.linkedQuestionIds.length > 0 || briefing.linkedTrapLaneIds.length > 0) && (
        <section className="ep-card p-5 text-sm">
          <h3 className="text-xs font-bold uppercase text-[var(--ep-navy)]">Linked prep surfaces</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {briefing.linkedQuestionIds.map((id) => (
              <Link
                key={id}
                href={mapAdminHrefToElectionPlan(`/admin/intelligence/sos-debate-questions/${id}`)}
                className="rounded-full border border-sky-300 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-950"
              >
                SOS: {id}
              </Link>
            ))}
            {briefing.linkedTrapLaneIds.map((id) => (
              <Link
                key={id}
                href={epTrapLaneHref(id)}
                className="rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-950"
              >
                Trap: {id.replace(/-/g, " ")}
              </Link>
            ))}
          </div>
        </section>
      )}

      {briefing.hammerResearchHooks.length > 0 ? (
        <section className="ep-card p-5 text-sm">
          <h3 className="text-xs font-bold uppercase text-[var(--ep-navy)]">Hammer research hooks</h3>
          <div className="mt-4 space-y-3">
            {briefing.hammerResearchHooks.map((hook) => (
              <article key={hook.label} className="rounded-lg border border-[var(--ep-border)] p-4">
                <p className="font-bold text-[var(--ep-navy)]">{hook.label}</p>
                <p className="mt-2 text-[var(--ep-navy-muted)]">{hook.finding}</p>
                <p className="mt-2 text-xs text-indigo-900">{hook.howToUseInPrep}</p>
                <Link href={mapAdminHrefToElectionPlan(hook.href)} className="mt-2 inline-block text-xs font-bold underline">
                  Open research →
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="ep-card p-5 text-sm">
        <h3 className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Related</h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {briefing.relatedLinks.map((l) => (
            <li key={l.href}>
              <Link href={mapAdminHrefToElectionPlan(l.href)} className="font-bold text-[var(--ep-navy)] underline">
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href={EP_DEBATE_PREP_COMMAND_HREF} className="font-bold text-[var(--ep-navy)] underline">
              Command home
            </Link>
          </li>
          <li>
            <Link href={EP_TRAP_LANES_HREF} className="font-bold text-[var(--ep-navy)] underline">
              Trap lanes
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}

export function ElectionPlanPhilosophyBriefingCard({
  briefing,
}: {
  briefing: Pick<DebatePhilosophyBriefing, "briefingId" | "eyebrow" | "title" | "summary" | "estimatedReadMinutes">;
}) {
  return (
    <Link
      href={epDebatePrepBriefingHref(briefing.briefingId)}
      className="ep-card flex min-h-[140px] flex-col p-5 transition hover:border-[var(--ep-gold)]"
    >
      <p className="text-[10px] font-bold uppercase text-violet-800">{briefing.eyebrow}</p>
      <h3 className="mt-2 font-heading text-lg font-bold text-[var(--ep-navy)]">{briefing.title}</h3>
      <p className="mt-2 flex-1 text-xs text-[var(--ep-navy-muted)] line-clamp-4">{briefing.summary}</p>
      <p className="mt-3 text-[10px] font-bold text-[var(--ep-gold)]">~{briefing.estimatedReadMinutes} min · Deep dive →</p>
    </Link>
  );
}
