import {
  ElectionPlanDrillDownRelated,
  ElectionPlanDrillDownSteps,
} from "@/components/election-plan/ElectionPlanDrillDownShell";
import { VoterAudiencePracticeLine } from "@/components/election-plan/voter-audience/VoterAudiencePracticeLine";
import type { Day1BlockStudyDeep } from "@/lib/election-plan/debatePrepDay1BlockStudy";
import type { OpponentExampleStudyDeep } from "@/lib/election-plan/debatePrepDay1OpponentExampleStudy";
import { epDebatePrepDayBlockPhaseHref } from "@/lib/election-plan/debate-prep-links";
import { kellyStudyLeadLabel, showOptionalDeepReference, showOperatorGuides } from "@/lib/election-plan/kelly-facing-ui";
import { resolveAudiencesForHooks } from "@/lib/election-plan/voter-audience-models/resolve-audiences";
import Link from "next/link";

type StudyGuideContent = Pick<
  Day1BlockStudyDeep,
  | "overview"
  | "professorLead"
  | "phases"
  | "deepSections"
  | "psychology"
  | "opponentForecast"
  | "sampleLines"
  | "doNotSay"
  | "claimsGate"
  | "keyTakeaways"
  | "practiceSteps"
  | "relatedLinks"
>;

export function ElectionPlanBlockStudyPanel({
  study,
  dayId,
  blockId,
}: {
  study: StudyGuideContent | OpponentExampleStudyDeep;
  dayId?: string;
  blockId?: string;
}) {
  const leadLabel = kellyStudyLeadLabel();
  const showDeepRef = showOptionalDeepReference();
  const lineAudiences = resolveAudiencesForHooks(["county-champion", "author-vs-administrator", "lane-2"]);
  const relatedLinks = showOperatorGuides()
    ? study.relatedLinks
    : study.relatedLinks.filter((l) => !l.href.includes("/admin/"));

  return (
    <>
      {study.professorLead ? (
        <article className="ep-card border-[var(--ep-gold)]/50 bg-[var(--ep-cream)]/60 p-5 text-sm">
          <h2 className="text-xs font-bold uppercase text-[var(--ep-gold)]">{leadLabel}</h2>
          <p className="mt-3 text-base font-medium leading-relaxed text-[var(--ep-navy)]">{study.professorLead}</p>
        </article>
      ) : null}

      <article className="ep-card mt-6 border-indigo-200 bg-indigo-50/30 p-5 text-sm">
        <h2 className="text-xs font-bold uppercase text-indigo-900">Study overview</h2>
        <p className="mt-3 leading-relaxed text-[var(--ep-navy-muted)]">{study.overview}</p>
      </article>

      <section className="mt-6 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">Timed phases — follow in order</h2>
        {study.phases.map((phase, index) => {
          const phaseNumber = index + 1;
          const href =
            dayId && blockId ? epDebatePrepDayBlockPhaseHref(dayId, blockId, phaseNumber) : null;
          const card = (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-heading text-base font-bold text-[var(--ep-navy)]">{phase.title}</h3>
                <span className="font-mono text-xs font-bold text-[var(--ep-gold)]">{phase.minutesLabel}</span>
              </div>
              <ol className="mt-3 list-inside list-decimal space-y-2 text-[var(--ep-navy-muted)]">
                {phase.steps.slice(0, 2).map((step) => (
                  <li key={step.slice(0, 48)}>{step}</li>
                ))}
                {phase.steps.length > 2 ? (
                  <li className="list-none text-xs font-semibold text-[var(--ep-navy)]">
                    +{phase.steps.length - 2} more steps in drill-down
                  </li>
                ) : null}
              </ol>
              {href ? (
                <p className="mt-3 text-xs font-bold text-[var(--ep-gold)]">Open phase drill-down →</p>
              ) : null}
            </>
          );
          return href ? (
            <Link
              key={phase.title}
              href={href}
              className="ep-card block p-5 text-sm transition hover:border-[var(--ep-gold)] hover:shadow-sm"
            >
              {card}
            </Link>
          ) : (
            <article key={phase.title} className="ep-card p-5 text-sm">
              {card}
            </article>
          );
        })}
      </section>

      {study.psychology && study.psychology.length > 0 ? (
        <section className="mt-6 space-y-4">
          <h2 className="text-xs font-bold uppercase text-violet-900">Psychology & viewer read</h2>
          {study.psychology.map((section) => (
            <article key={section.title} className="ep-card border-violet-200 bg-violet-50/30 p-5 text-sm">
              <h3 className="text-xs font-bold uppercase text-violet-900">{section.title}</h3>
              <p className="mt-3 leading-relaxed text-[var(--ep-navy-muted)]">{section.body}</p>
            </article>
          ))}
        </section>
      ) : null}

      {study.opponentForecast && study.opponentForecast.length > 0 ? (
        <section className="mt-6 space-y-4">
          <h2 className="text-xs font-bold uppercase text-amber-900">Opponent forecast</h2>
          {study.opponentForecast.map((section) => (
            <article key={section.title} className="ep-card border-amber-200 bg-amber-50/30 p-5 text-sm">
              <h3 className="text-xs font-bold uppercase text-amber-900">{section.title}</h3>
              <p className="mt-3 leading-relaxed text-[var(--ep-navy-muted)]">{section.body}</p>
            </article>
          ))}
        </section>
      ) : null}

      {showDeepRef ? (
        <section className="mt-6 space-y-4">
          <h2 className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Deep reference</h2>
          {study.deepSections.map((section) => (
            <article key={section.title} className="ep-card p-5 text-sm">
              <h3 className="text-xs font-bold uppercase text-[var(--ep-navy)]">{section.title}</h3>
              <p className="mt-3 leading-relaxed text-[var(--ep-navy-muted)]">{section.body}</p>
            </article>
          ))}
        </section>
      ) : study.deepSections.length > 0 ? (
        <details className="ep-card mt-6 p-5 text-sm">
          <summary className="cursor-pointer text-xs font-bold uppercase text-[var(--ep-navy-muted)]">
            Optional reference ({study.deepSections.length} sections)
          </summary>
          <div className="mt-4 space-y-4">
            {study.deepSections.map((section) => (
              <article key={section.title}>
                <h3 className="text-xs font-bold uppercase text-[var(--ep-navy)]">{section.title}</h3>
                <p className="mt-2 leading-relaxed text-[var(--ep-navy-muted)]">{section.body}</p>
              </article>
            ))}
          </div>
        </details>
      ) : null}

      {study.sampleLines && study.sampleLines.length > 0 ? (
        <section className="mt-6">
          <h2 className="text-xs font-bold uppercase text-emerald-900">Sample lines — practice aloud</h2>
          <div className="mt-3 space-y-3">
            {study.sampleLines.map((line) => (
              <VoterAudiencePracticeLine
                key={line.label}
                label={line.label}
                text={line.text}
                audiences={lineAudiences.slice(0, 2)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {study.doNotSay && study.doNotSay.length > 0 ? (
        <article className="ep-card mt-6 border-red-200 bg-red-50/30 p-5 text-sm">
          <h2 className="text-xs font-bold uppercase text-red-900">Do not say</h2>
          <ul className="mt-3 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
            {study.doNotSay.map((line) => (
              <li key={line.slice(0, 48)}>{line}</li>
            ))}
          </ul>
        </article>
      ) : null}

      {study.claimsGate && study.claimsGate.length > 0 ? (
        <article className="ep-card mt-6 border-slate-300 bg-slate-50/50 p-5 text-sm">
          <h2 className="text-xs font-bold uppercase text-slate-800">Claims gate</h2>
          <ul className="mt-3 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
            {study.claimsGate.map((line) => (
              <li key={line.slice(0, 48)}>{line}</li>
            ))}
          </ul>
        </article>
      ) : null}

      <article className="ep-card mt-6 border-[var(--ep-gold)]/40 bg-[var(--ep-cream)]/50 p-5 text-sm">
        <h2 className="text-xs font-bold uppercase text-[var(--ep-navy)]">Key takeaways</h2>
        <ul className="mt-3 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
          {study.keyTakeaways.map((t) => (
            <li key={t.slice(0, 48)}>{t}</li>
          ))}
        </ul>
      </article>

      <ElectionPlanDrillDownSteps title="End-of-block checklist" steps={study.practiceSteps} />
      <ElectionPlanDrillDownRelated links={relatedLinks} />
    </>
  );
}
