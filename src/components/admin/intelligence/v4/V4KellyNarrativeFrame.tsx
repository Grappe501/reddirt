import { KELLY_MASTER_FRAME } from "@/lib/intelligence/v4/debateOperatorNarratives";
import { KELLY_FIELD_TESTED_THEMES, KELLY_UNITY_SPINE } from "@/lib/intelligence/v4/kellyTestedDebateThemes";

export function V4KellyNarrativeFrame() {
  return (
    <section className="mb-6 space-y-4">
      <article className="rounded-xl border border-emerald-200/50 bg-emerald-50/40 p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-900">Your narrative spine</p>
        <p className="mt-2 font-heading text-lg font-bold text-emerald-950">{KELLY_MASTER_FRAME.headline}</p>
        <p className="mt-2 text-xs font-semibold text-emerald-900">{KELLY_UNITY_SPINE}</p>
        <p className="mt-3 text-sm text-emerald-950/90">
          Hammer will sound certain because he cites bills. You win by sounding clearer and calmer: transparency,
          accountability, non-partisan administration, and educating the public — while working across the aisle to bring
          people together instead of the division voters see now. Pair that with county burden and verified record when
          needed.
        </p>
        <p className="mt-3 text-xs font-semibold text-emerald-900">Answer architecture (use on every substantive question)</p>
        <p className="mt-1 text-xs text-emerald-950">{KELLY_MASTER_FRAME.answerArchitecture}</p>
        <ul className="mt-3 list-inside list-disc text-xs text-emerald-950/90">
          {KELLY_MASTER_FRAME.pillars.map((p) => (
            <li key={p.slice(0, 48)}>{p}</li>
          ))}
        </ul>
      </article>

      <article className="rounded-xl border-2 border-sky-200 bg-sky-50/50 p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-sky-950">
          Field-tested themes — lean in (independent &amp; Republican rooms)
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {KELLY_FIELD_TESTED_THEMES.map((theme) => (
            <div key={theme.id} className="rounded-lg border border-sky-100 bg-white p-3 text-xs">
              <p className="font-bold text-kelly-navy">{theme.label}</p>
              <p className="mt-1 text-kelly-muted">{theme.fieldNote}</p>
              <p className="mt-2 italic text-sky-950">&ldquo;{theme.debateLine30s}&rdquo;</p>
              <p className="mt-2 text-[10px] font-semibold text-amber-900">{theme.claimsGate}</p>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
