import Link from "next/link";
import type { DebatePhilosophyBriefing } from "@/lib/intelligence/v4/debateBriefingDepthTypes";
import { V4DebateBriefingPanel } from "@/components/admin/intelligence/v4/V4DebateBriefingPanel";

function PhraseBlock({ phrases }: { phrases: DebatePhilosophyBriefing["samplePhrases"] }) {
  return (
    <section className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-4 text-xs">
      <h3 className="font-bold uppercase text-indigo-950">Sample phrases</h3>
      <div className="mt-3 space-y-3">
        {phrases.map((p) => (
          <article key={p.label} className="rounded-lg border border-white bg-white p-3">
            <p className="font-bold text-indigo-950">{p.label}</p>
            <p className="mt-2 leading-relaxed">&ldquo;{p.text}&rdquo;</p>
            <p className="mt-2 text-kelly-muted">When: {p.whenToUse}</p>
            <p className="mt-1 text-violet-900">Presence: {p.presenceGoal}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function V4PhilosophyBriefingPanel({ briefing }: { briefing: DebatePhilosophyBriefing }) {
  const syntheticBriefing = {
    briefingSummary: `${briefing.summary} Estimated read: ${briefing.estimatedReadMinutes} min.`,
    whyThisAnswerWorks: briefing.whyThisMethod,
    whyNotRepeatVerbatim: briefing.corePhilosophy,
    alternativeOpeners: briefing.samplePhrases,
    alternativeClosers: [],
    alternativeContrasts: [],
    philosophyBriefingIds: [],
    hammerResearchHooks: briefing.hammerResearchHooks,
    quickPrepChecklist: briefing.handlingSteps,
    oppositionIntelNote: briefing.corePhilosophy,
  };

  return (
    <div className="space-y-6">
      <article className="rounded-xl border-2 border-violet-300 bg-violet-50/50 p-5">
        <p className="text-[10px] font-bold uppercase text-violet-950">{briefing.eyebrow}</p>
        <p className="mt-3 text-sm leading-relaxed text-kelly-text">{briefing.corePhilosophy}</p>
      </article>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4 text-xs">
          <h3 className="font-bold uppercase text-emerald-950">When to apply</h3>
          <ul className="mt-2 list-inside list-disc text-kelly-muted">
            {briefing.whenToApply.map((w) => (
              <li key={w.slice(0, 40)}>{w}</li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border border-rose-200 bg-rose-50/30 p-4 text-xs">
          <h3 className="font-bold uppercase text-rose-950">When not to apply</h3>
          <ul className="mt-2 list-inside list-disc text-kelly-muted">
            {briefing.whenNotToApply.map((w) => (
              <li key={w.slice(0, 40)}>{w}</li>
            ))}
          </ul>
        </section>
      </div>

      <PhraseBlock phrases={briefing.samplePhrases} />

      <section className="rounded-xl border border-amber-200 bg-amber-50/30 p-4 text-xs">
        <h3 className="font-bold uppercase text-amber-950">Common mistakes</h3>
        <ul className="mt-2 list-inside list-disc text-rose-950">
          {briefing.commonMistakes.map((m) => (
            <li key={m.slice(0, 48)}>{m}</li>
          ))}
        </ul>
      </section>

      {(briefing.linkedQuestionIds.length > 0 || briefing.linkedTrapLaneIds.length > 0) && (
        <section className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
          <h3 className="font-bold uppercase text-kelly-navy">Linked prep surfaces</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {briefing.linkedQuestionIds.map((id) => (
              <Link
                key={id}
                href={`/admin/intelligence/sos-debate-questions/${id}`}
                className="rounded-full border border-sky-300 bg-sky-50 px-3 py-1 font-bold text-sky-950"
              >
                {id}
              </Link>
            ))}
            {briefing.linkedTrapLaneIds.map((id) => (
              <Link
                key={id}
                href={`/admin/intelligence/trap-lanes/${id}`}
                className="rounded-full border border-rose-300 bg-rose-50 px-3 py-1 font-bold text-rose-950"
              >
                {id}
              </Link>
            ))}
          </div>
        </section>
      )}

      <V4DebateBriefingPanel briefing={syntheticBriefing} title="Hammer research & handling steps" />

      <section className="rounded-xl border border-kelly-text/10 p-4 text-xs">
        <h3 className="font-bold uppercase text-kelly-subtle">Related</h3>
        <ul className="mt-2 flex flex-wrap gap-2">
          {briefing.relatedLinks.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="font-bold text-kelly-navy underline">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
