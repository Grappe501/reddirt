import {
  ElectionPlanDrillDownRelated,
  ElectionPlanDrillDownSteps,
} from "@/components/election-plan/ElectionPlanDrillDownShell";
import type { Day1BlockStudyDeep } from "@/lib/election-plan/debatePrepDay1BlockStudy";
import type { OpponentExampleStudyDeep } from "@/lib/election-plan/debatePrepDay1OpponentExampleStudy";

type StudyGuideContent = Pick<
  Day1BlockStudyDeep,
  "overview" | "phases" | "deepSections" | "sampleLines" | "keyTakeaways" | "practiceSteps" | "relatedLinks"
>;

export function ElectionPlanBlockStudyPanel({ study }: { study: StudyGuideContent | OpponentExampleStudyDeep }) {
  return (
    <>
      <article className="ep-card border-indigo-200 bg-indigo-50/30 p-5 text-sm">
        <h2 className="text-xs font-bold uppercase text-indigo-900">Study overview</h2>
        <p className="mt-3 leading-relaxed text-[var(--ep-navy-muted)]">{study.overview}</p>
      </article>

      <section className="mt-6 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">Timed phases — follow in order</h2>
        {study.phases.map((phase) => (
          <article key={phase.title} className="ep-card p-5 text-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-heading text-base font-bold text-[var(--ep-navy)]">{phase.title}</h3>
              <span className="font-mono text-xs font-bold text-[var(--ep-gold)]">{phase.minutesLabel}</span>
            </div>
            <ol className="mt-3 list-inside list-decimal space-y-2 text-[var(--ep-navy-muted)]">
              {phase.steps.map((step) => (
                <li key={step.slice(0, 48)}>{step}</li>
              ))}
            </ol>
          </article>
        ))}
      </section>

      <section className="mt-6 space-y-4">
        <h2 className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Deep reference</h2>
        {study.deepSections.map((section) => (
          <article key={section.title} className="ep-card p-5 text-sm">
            <h3 className="text-xs font-bold uppercase text-[var(--ep-navy)]">{section.title}</h3>
            <p className="mt-3 leading-relaxed text-[var(--ep-navy-muted)]">{section.body}</p>
          </article>
        ))}
      </section>

      {study.sampleLines && study.sampleLines.length > 0 ? (
        <section className="mt-6">
          <h2 className="text-xs font-bold uppercase text-emerald-900">Sample lines — practice aloud</h2>
          <div className="mt-3 space-y-3">
            {study.sampleLines.map((line) => (
              <article key={line.label} className="ep-card border-emerald-200 bg-emerald-50/40 p-4 text-sm">
                <p className="text-xs font-bold uppercase text-emerald-900">{line.label}</p>
                <p className="mt-2 italic text-[var(--ep-navy)]">&ldquo;{line.text}&rdquo;</p>
                {line.note ? <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">{line.note}</p> : null}
              </article>
            ))}
          </div>
        </section>
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
      <ElectionPlanDrillDownRelated links={study.relatedLinks} />
    </>
  );
}
