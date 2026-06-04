import Link from "next/link";
import type { SosDebateQuestionDrillDown } from "@/lib/intelligence/v4/sosDebateQuestionTypes";
import { SOS_DEBATE_SPEAK_ORDER_RULE } from "@/lib/intelligence/v4/sosDebateQuestionBank";
import { KELLY_UNITY_SPINE } from "@/lib/intelligence/v4/kellyTestedDebateThemes";
import { buildSosQuestionResponseRounds } from "@/lib/intelligence/v4/debateResponseRoundEnrichment";
import { V4ResponseRoundPanel } from "@/components/admin/intelligence/v4/V4DepthPanels";
import { V4EncounterDepthPanel } from "@/components/admin/intelligence/v4/V4EncounterDepthPanel";

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-sky-100 bg-sky-50/30 p-4 text-xs leading-relaxed text-kelly-text">
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-sky-900">{title}</h3>
      <div className="mt-2 text-kelly-muted">{children}</div>
    </section>
  );
}

export function V4SosDebateQuestionPanel({
  drill,
  prev,
  next,
}: {
  drill: SosDebateQuestionDrillDown;
  prev: { questionId: string; title: string } | null;
  next: { questionId: string; title: string } | null;
}) {
  return (
    <div className="space-y-6">
      <article className="rounded-xl border-2 border-amber-200 bg-amber-50/50 p-5">
        <p className="text-[10px] font-bold uppercase text-amber-950">
          Question {drill.questionNumber} · {drill.probability} probability · ~{drill.estimatedPrepMinutes} min prep
        </p>
        <p className="mt-2 text-sm text-amber-950">{drill.researchBasis}</p>
        <p className="mt-2 text-[10px] font-bold text-amber-900">{drill.claimsGate}</p>
      </article>

      <article className="rounded-xl border-2 border-sky-200 bg-sky-50/40 p-5 text-xs">
        <p className="font-bold uppercase text-sky-950">Unity spine — weave into every answer</p>
        <p className="mt-2 text-sky-950">{KELLY_UNITY_SPINE}</p>
      </article>

      <article className="rounded-xl border-2 border-violet-200 bg-violet-50/40 p-5 text-xs">
        <p className="font-bold uppercase text-violet-950">Speak order rule (1st · 2nd · 3rd)</p>
        <p className="mt-2 text-violet-950">{SOS_DEBATE_SPEAK_ORDER_RULE}</p>
      </article>

      {drill.encounterDepth ? <V4EncounterDepthPanel depth={drill.encounterDepth} /> : null}

      <V4ResponseRoundPanel plan={buildSosQuestionResponseRounds(drill)} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Block title="Why moderators ask">
          <p>{drill.whyModeratorsAsk}</p>
          <p className="mt-2 font-semibold text-kelly-navy">SOS job duties touched:</p>
          <ul className="mt-1 list-inside list-disc">
            {drill.sosJobDuties.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </Block>
        <Block title="Research basis">
          <ul className="list-inside list-disc">
            {drill.researchRefs.map((ref) => (
              <li key={ref.url}>
                <a href={ref.url} target="_blank" rel="noreferrer" className="font-bold text-kelly-navy underline">
                  {ref.source}
                </a>
                {" — "}
                {ref.note}
              </li>
            ))}
          </ul>
        </Block>
      </div>

      <Block title="How the moderator may phrase it">
        <ul className="list-inside list-disc">
          {drill.moderatorLikelyPhrasings.map((p) => (
            <li key={p.slice(0, 48)}>{p}</li>
          ))}
        </ul>
      </Block>

      <div className="grid gap-4 lg:grid-cols-2">
        <Block title="What Hammer likely says">
          <ul className="list-inside list-disc text-rose-950/90">
            {drill.whatHammerLikelySays.map((l) => (
              <li key={l.slice(0, 48)}>{l}</li>
            ))}
          </ul>
        </Block>
        <Block title="What Packo may add (three-way)">
          <ul className="list-inside list-disc">
            {drill.whatPackoMayAdd.length ? (
              drill.whatPackoMayAdd.map((l) => <li key={l.slice(0, 48)}>{l}</li>)
            ) : (
              <li>—</li>
            )}
          </ul>
        </Block>
      </div>

      <article className="rounded-xl border-2 border-kelly-gold/40 bg-white p-5">
        <h3 className="text-sm font-bold uppercase text-kelly-navy">Speak order drills — never just agree</h3>
        <div className="mt-4 space-y-4">
          {drill.speakOrderDrills.map((s) => (
            <div key={s.position} className="rounded-lg border border-kelly-text/10 p-4 text-xs">
              <p className="font-bold text-violet-950">
                {s.label} (position {s.position})
              </p>
              <p className="mt-2">
                <span className="font-semibold text-kelly-navy">Strategy:</span> {s.strategy}
              </p>
              <p className="mt-2">
                <span className="font-semibold text-emerald-900">Open:</span> {s.openingLine}
              </p>
              <p className="mt-2">
                <span className="font-semibold text-rose-900">Fresh addition (do not skip):</span> {s.freshAddition}
              </p>
              <p className="mt-2">
                <span className="font-semibold text-amber-900">If others already agreed:</span> {s.ifOthersAlreadyAgreed}
              </p>
              <p className="mt-2">
                <span className="font-semibold text-rose-900">If attacked:</span> {s.ifOthersAttackedKelly}
              </p>
              <p className="mt-2">
                <span className="font-semibold text-kelly-navy">Close beat:</span> {s.closingBeat}
              </p>
            </div>
          ))}
        </div>
      </article>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-5 text-xs">
          <h3 className="font-bold uppercase text-emerald-950">Direct answer — 30s</h3>
          <p className="mt-2 leading-relaxed text-kelly-text">{drill.directAnswer30s}</p>
        </article>
        <article className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-5 text-xs">
          <h3 className="font-bold uppercase text-emerald-950">Direct answer — 60s</h3>
          <p className="mt-2 leading-relaxed text-kelly-text">{drill.directAnswer60s}</p>
        </article>
      </div>

      <article className="rounded-xl border border-violet-200 bg-violet-50/20 p-5 text-xs">
        <h3 className="font-bold uppercase text-violet-950">Agree — but never only agree</h3>
        <p className="mt-2">{drill.agreeButNeverOnlyAgree}</p>
      </article>

      {drill.rebuttalIfHammerAttacks.length > 0 ? (
        <section className="rounded-xl border border-white bg-white p-5">
          <h3 className="text-sm font-bold uppercase text-rose-950">Rebuttal if Hammer attacks</h3>
          <div className="mt-4 space-y-3">
            {drill.rebuttalIfHammerAttacks.map((script) => (
              <article key={script.trigger} className="rounded-lg border border-rose-100 p-3 text-xs">
                <p className="font-bold text-rose-900">When: {script.trigger}</p>
                <p className="mt-1 italic text-kelly-muted">He may say: &ldquo;{script.hammerLikelyLine}&rdquo;</p>
                <p className="mt-2 text-emerald-900">
                  <span className="font-bold">Agree:</span> {script.agree}
                </p>
                <p className="mt-1 text-violet-900">
                  <span className="font-bold">Contrast:</span> {script.contrast}
                </p>
                <p className="mt-1 text-kelly-navy">
                  <span className="font-bold">Bridge:</span> {script.bridge}
                </p>
                {script.claimsNote ? <p className="mt-2 text-amber-900">Claims: {script.claimsNote}</p> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {drill.sampleScripts.length > 0 ? (
        <section className="rounded-xl border border-kelly-navy/15 bg-kelly-page/30 p-5">
          <h3 className="text-sm font-bold uppercase text-kelly-navy">Stand-and-deliver scripts</h3>
          <div className="mt-3 space-y-3">
            {drill.sampleScripts.map((s) => (
              <article key={s.label} className="rounded-lg border border-kelly-text/10 bg-white p-4 text-xs">
                <div className="flex justify-between gap-2">
                  <span className="font-bold text-kelly-navy">{s.label}</span>
                  <span className="font-mono text-[10px] text-kelly-subtle">{s.duration}</span>
                </div>
                <p className="mt-2 leading-relaxed">{s.text}</p>
                {s.deliveryNote ? <p className="mt-2 font-semibold text-violet-900">Delivery: {s.deliveryNote}</p> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Block title="Mistakes first-timers make">
          <ul className="list-inside list-disc text-rose-950">
            {drill.mistakesFirstTimersMake.map((m) => (
              <li key={m.slice(0, 48)}>{m}</li>
            ))}
          </ul>
        </Block>
        <Block title="Body language & tone">
          <p>{drill.bodyLanguageAndTone}</p>
          <p className="mt-3 font-bold text-kelly-navy">Rehearsal steps</p>
          <ol className="mt-1 list-inside list-decimal">
            {drill.rehearsalSteps.map((step) => (
              <li key={step.slice(0, 48)}>{step}</li>
            ))}
          </ol>
        </Block>
      </div>

      <section className="rounded-xl border border-kelly-text/10 bg-white p-4">
        <h3 className="text-[10px] font-bold uppercase text-kelly-subtle">Related surfaces</h3>
        <ul className="mt-2 flex flex-wrap gap-2 text-xs">
          {drill.relatedLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="rounded-full border border-kelly-navy/30 px-3 py-1 font-bold text-kelly-navy hover:bg-kelly-page">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <nav className="flex flex-wrap justify-between gap-3 border-t border-kelly-text/10 pt-6 text-xs">
        {prev ? (
          <Link href={`/admin/intelligence/sos-debate-questions/${prev.questionId}`} className="font-bold text-kelly-navy underline">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/admin/intelligence/sos-debate-questions/${next.questionId}`} className="font-bold text-kelly-navy underline">
            {next.title} →
          </Link>
        ) : null}
      </nav>
    </div>
  );
}
