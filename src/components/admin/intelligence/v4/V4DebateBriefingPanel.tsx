import Link from "next/link";
import type { DebateAlternativeLine, DebateQuestionBriefing } from "@/lib/intelligence/v4/debateBriefingDepthTypes";

function AltLines({ title, lines }: { title: string; lines: DebateAlternativeLine[] }) {
  if (!lines.length) return null;
  return (
    <section className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-4">
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-indigo-950">{title}</h3>
      <div className="mt-3 space-y-3">
        {lines.map((line) => (
          <article key={line.label} className="rounded-lg border border-white bg-white p-3 text-xs">
            <p className="font-bold text-indigo-950">{line.label}</p>
            <p className="mt-2 leading-relaxed text-kelly-text">&ldquo;{line.text}&rdquo;</p>
            <p className="mt-2 text-kelly-muted">
              <span className="font-semibold text-kelly-navy">When:</span> {line.whenToUse}
            </p>
            <p className="mt-1 text-violet-900">
              <span className="font-semibold">Presence:</span> {line.presenceGoal}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function V4DebateBriefingPanel({ briefing, title }: { briefing: DebateQuestionBriefing; title?: string }) {
  return (
    <div className="space-y-4">
      <article className="rounded-xl border-2 border-kelly-gold/50 bg-gradient-to-br from-amber-50/80 to-white p-5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-950">
          {title ?? "Quick-read briefing"}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-kelly-text">{briefing.briefingSummary}</p>
      </article>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 text-xs">
          <h3 className="font-bold uppercase text-emerald-950">Why this answer works</h3>
          <p className="mt-2 leading-relaxed text-kelly-muted">{briefing.whyThisAnswerWorks}</p>
        </article>
        <article className="rounded-xl border border-rose-200 bg-rose-50/30 p-4 text-xs">
          <h3 className="font-bold uppercase text-rose-950">Avoid sounding repetitive</h3>
          <p className="mt-2 leading-relaxed text-kelly-muted">{briefing.whyNotRepeatVerbatim}</p>
        </article>
      </div>

      <article className="rounded-xl border border-violet-200 bg-violet-50/30 p-4 text-xs">
        <h3 className="font-bold uppercase text-violet-950">Hammer / Packo intel for prep</h3>
        <p className="mt-2 leading-relaxed text-kelly-muted">{briefing.oppositionIntelNote}</p>
      </article>

      <AltLines title="Alternative openers — same presence, different words" lines={briefing.alternativeOpeners} />
      <AltLines title="Alternative closers — rotate so answers don't echo" lines={briefing.alternativeClosers} />
      <AltLines title="Alternative contrast lines — rebuttal variety" lines={briefing.alternativeContrasts} />

      <section className="rounded-xl border border-kelly-navy/15 bg-white p-4 text-xs">
        <h3 className="font-bold uppercase text-kelly-navy">Philosophy briefings — read before rehearsing</h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {briefing.philosophyBriefingIds.map((id) => (
            <li key={id}>
              <Link
                href={`/admin/intelligence/debate-briefings/${id}`}
                className="rounded-full border border-kelly-navy/30 bg-kelly-page/50 px-3 py-1 font-bold text-kelly-navy hover:bg-kelly-page"
              >
                {id.replace(/-/g, " ")}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-rose-100 bg-rose-50/20 p-4 text-xs">
        <h3 className="font-bold uppercase text-rose-950">Hammer opposition research — open before stage</h3>
        <ul className="mt-3 space-y-3">
          {briefing.hammerResearchHooks.map((hook) => (
            <li key={hook.href + hook.label} className="rounded-lg border border-white bg-white p-3">
              <Link href={hook.href} className="font-bold text-kelly-navy underline">
                {hook.label}
              </Link>
              <p className="mt-1 text-kelly-muted">{hook.finding}</p>
              <p className="mt-2 font-semibold text-violet-900">Prep use: {hook.howToUseInPrep}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-sky-100 bg-sky-50/30 p-4 text-xs">
        <h3 className="font-bold uppercase text-sky-950">5-minute prep checklist</h3>
        <ol className="mt-2 list-inside list-decimal space-y-1 text-kelly-muted">
          {briefing.quickPrepChecklist.map((step) => (
            <li key={step.slice(0, 48)}>{step}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}
