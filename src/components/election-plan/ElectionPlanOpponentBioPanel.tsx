import Link from "next/link";

import {
  ElectionPlanDrillDownRelated,
  ElectionPlanDrillDownSteps,
} from "@/components/election-plan/ElectionPlanDrillDownShell";
import { epOpponentBioHref } from "@/lib/election-plan/debate-prep-links";
import type { OpponentBioPage } from "@/lib/election-plan/opponentBioDrillDown";

export function ElectionPlanOpponentBioPanel({
  bio,
  prev,
  next,
}: {
  bio: OpponentBioPage;
  prev: { opponentId: string; displayName: string } | null;
  next: { opponentId: string; displayName: string } | null;
}) {
  return (
    <div className="space-y-6">
      <article className="ep-card border-2 border-[var(--ep-gold)]/50 bg-[var(--ep-cream)]/60 p-5 text-sm">
        <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">Professor lead — engrave this</p>
        <p className="mt-3 text-base font-medium leading-relaxed text-[var(--ep-navy)]">{bio.professorLead}</p>
      </article>

      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-violet-900">Reading schedule — Day 2 · 4 · 6</h2>
        {bio.readingPhases.map((phase) => (
          <article key={phase.dayNumber} className="ep-card border-violet-200 bg-violet-50/30 p-5 text-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-heading text-base font-bold text-[var(--ep-navy)]">{phase.title}</h3>
              <span className="font-mono text-xs font-bold text-violet-900">{phase.minutesLabel}</span>
            </div>
            <p className="mt-2 font-semibold text-violet-950">{phase.focus}</p>
            <ol className="mt-3 list-inside list-decimal space-y-1 text-[var(--ep-navy-muted)]">
              {phase.steps.map((step) => (
                <li key={step.slice(0, 48)}>{step}</li>
              ))}
            </ol>
            <p className="mt-3 text-xs font-bold text-emerald-900">Success: {phase.successCheck}</p>
          </article>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--ep-navy)]">What they prioritize</h2>
        {bio.priorities.map((item) => (
          <article key={item.heading} className="ep-card p-5 text-sm">
            <h3 className="text-xs font-bold uppercase text-rose-900">{item.heading}</h3>
            <p className="mt-3 leading-relaxed text-[var(--ep-navy-muted)]">{item.body}</p>
          </article>
        ))}
      </section>

      <article className="ep-card border-indigo-200 bg-indigo-50/30 p-5 text-sm">
        <h2 className="text-xs font-bold uppercase text-indigo-900">Biography — know who they are</h2>
        {bio.biographyParagraphs.map((p) => (
          <p key={p.slice(0, 48)} className="mt-3 first:mt-2 leading-relaxed text-[var(--ep-navy)]">
            {p}
          </p>
        ))}
      </article>

      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--ep-gold)]">Psychology & viewer read</h2>
        {bio.psychology.map((item) => (
          <article key={item.heading} className="ep-card border-violet-200 bg-violet-50/20 p-5 text-sm">
            <h3 className="text-xs font-bold uppercase text-violet-900">{item.heading}</h3>
            <p className="mt-3 leading-relaxed text-[var(--ep-navy-muted)]">{item.body}</p>
          </article>
        ))}
      </section>

      <article className="ep-card border-amber-200 bg-amber-50/30 p-5 text-sm">
        <h2 className="text-xs font-bold uppercase text-amber-900">Debate tells — watch for these</h2>
        <ul className="mt-3 list-inside list-disc space-y-1 text-[var(--ep-navy)]">
          {bio.debateTells.map((tell) => (
            <li key={tell.slice(0, 48)}>{tell}</li>
          ))}
        </ul>
      </article>

      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--ep-gold)]">Forecast — what they will say</h2>
        {bio.forecast.map((item) => (
          <article key={item.heading} className="ep-card p-5 text-sm">
            <h3 className="text-xs font-bold uppercase text-[var(--ep-navy)]">{item.heading}</h3>
            <p className="mt-3 leading-relaxed text-[var(--ep-navy-muted)]">{item.body}</p>
          </article>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-900">Command mode — how Kelly stays in charge</h2>
        {bio.commandMode.map((item) => (
          <article key={item.heading} className="ep-card border-emerald-200 bg-emerald-50/30 p-5 text-sm">
            <h3 className="text-xs font-bold uppercase text-emerald-900">{item.heading}</h3>
            <p className="mt-3 leading-relaxed text-[var(--ep-navy-muted)]">{item.body}</p>
          </article>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase text-emerald-900">Memory lines — speak aloud until boring</h2>
        {bio.memoryLines.map((line) => (
          <article key={line.label} className="ep-card border-emerald-300 bg-emerald-50/40 p-4 text-sm">
            <p className="text-xs font-bold uppercase text-emerald-900">{line.label}</p>
            <p className="mt-2 italic text-[var(--ep-navy)]">&ldquo;{line.text}&rdquo;</p>
            {line.note ? <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">{line.note}</p> : null}
          </article>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Full dossier depth — section by section</h2>
        {bio.dossierSections.map((section) => (
          <article key={section.sectionId} className="ep-card p-5 text-sm">
            <p className="text-xs font-bold uppercase text-rose-800">{section.eyebrow}</p>
            <h3 className="mt-1 font-heading text-lg font-bold text-[var(--ep-navy)]">{section.title}</h3>
            <p className="mt-2 text-xs font-semibold text-[var(--ep-navy)]">{section.whyItMatters}</p>
            {section.narrative.map((p) => (
              <p key={p.slice(0, 48)} className="mt-3 leading-relaxed text-[var(--ep-navy-muted)]">
                {p}
              </p>
            ))}
            {section.debateUse.length > 0 ? (
              <div className="mt-4">
                <p className="text-xs font-bold uppercase text-emerald-900">On stage</p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
                  {section.debateUse.map((line) => (
                    <li key={line.slice(0, 48)}>{line}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {section.readAloudDebate ? (
              <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/40 p-3 italic text-[var(--ep-navy)]">
                {section.readAloudDebate}
              </p>
            ) : null}
            {section.doNotSay.length > 0 ? (
              <p className="mt-3 text-xs font-bold text-amber-900">Do not say: {section.doNotSay.join(" · ")}</p>
            ) : null}
          </article>
        ))}
      </section>

      <article className="ep-card border-red-200 bg-red-50/30 p-5 text-sm">
        <h2 className="text-xs font-bold uppercase text-red-900">Do not say</h2>
        <ul className="mt-3 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
          {bio.doNotSay.map((line) => (
            <li key={line.slice(0, 48)}>{line}</li>
          ))}
        </ul>
      </article>

      <article className="ep-card border-slate-300 bg-slate-50/50 p-5 text-sm">
        <h2 className="text-xs font-bold uppercase text-slate-800">Claims gate</h2>
        <ul className="mt-3 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
          {bio.claimsGate.map((line) => (
            <li key={line.slice(0, 48)}>{line}</li>
          ))}
        </ul>
      </article>

      <ElectionPlanDrillDownSteps title="Practice cadence" steps={bio.practiceSteps} />
      <ElectionPlanDrillDownRelated links={bio.relatedLinks} />

      <nav className="flex flex-wrap justify-between gap-3 border-t border-[var(--ep-border)] pt-6 text-xs font-bold">
        {prev ? (
          <Link href={epOpponentBioHref(prev.opponentId)} className="text-[var(--ep-navy)] underline">
            ← {prev.displayName}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={epOpponentBioHref(next.opponentId)} className="text-[var(--ep-navy)] underline">
            {next.displayName} →
          </Link>
        ) : null}
      </nav>
    </div>
  );
}
