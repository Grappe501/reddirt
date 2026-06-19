import Link from "next/link";

import {
  ElectionPlanDrillDownRelated,
  ElectionPlanDrillDownSteps,
} from "@/components/election-plan/ElectionPlanDrillDownShell";
import { mapQuestionRelatedLinksForElectionPlan } from "@/lib/election-plan/debateQuestionReferenceDrillDown";
import { epDebateQuestionHref } from "@/lib/election-plan/debate-prep-links";
import type { SosDebateQuestionDrillDown } from "@/lib/intelligence/v4/sosDebateQuestionTypes";

function ScriptBlock({ title, text, accent }: { title: string; text: string; accent: string }) {
  return (
    <article className={`ep-card p-5 text-sm leading-relaxed ${accent}`}>
      <h3 className="text-xs font-bold uppercase tracking-wider">{title}</h3>
      <p className="mt-3 text-[var(--ep-navy)]">{text}</p>
    </article>
  );
}

function ExchangeList({
  title,
  exchanges,
  accent,
}: {
  title: string;
  exchanges: Array<{ opponentLine: string; kellyResponse: string; toneNote?: string }>;
  accent: string;
}) {
  if (!exchanges.length) return null;
  return (
    <section className={`ep-card p-5 text-sm ${accent}`}>
      <h3 className="text-xs font-bold uppercase tracking-wider">{title}</h3>
      <div className="mt-4 space-y-4">
        {exchanges.map((ex) => (
          <article key={ex.opponentLine.slice(0, 40)} className="rounded-lg border border-[var(--ep-border)] bg-white p-4">
            <p className="text-xs font-bold text-rose-900">They may say:</p>
            <p className="mt-1 italic text-[var(--ep-navy-muted)]">&ldquo;{ex.opponentLine}&rdquo;</p>
            <p className="mt-3 text-xs font-bold text-emerald-900">Kelly responds:</p>
            <p className="mt-1 leading-relaxed text-[var(--ep-navy)]">{ex.kellyResponse}</p>
            {ex.toneNote ? <p className="mt-2 text-[10px] font-semibold text-amber-900">{ex.toneNote}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

export function ElectionPlanSosQuestionPanel({
  drill,
  prev,
  next,
}: {
  drill: SosDebateQuestionDrillDown;
  prev: { questionId: string; title: string } | null;
  next: { questionId: string; title: string } | null;
}) {
  const c = drill.comprehensive;
  if (!c) {
    return <p className="text-sm text-rose-900">Comprehensive expansion missing — contact staff.</p>;
  }

  const relatedLinks = mapQuestionRelatedLinksForElectionPlan(drill);

  return (
    <div className="space-y-6">
      <article className="ep-card border-2 border-[var(--ep-navy)]/20 bg-[var(--ep-cream)]/40 p-6">
        <p className="text-[10px] font-bold uppercase text-[var(--ep-navy-muted)]">
          Q{drill.questionNumber} · {drill.probability} · {drill.categoryLabel}
        </p>
        <h2 className="mt-2 font-heading text-2xl font-bold text-[var(--ep-navy)]">{c.questionAsAsked}</h2>
        <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-[var(--ep-navy-muted)]">
          {drill.moderatorLikelyPhrasings.map((p) => (
            <li key={p.slice(0, 48)}>{p}</li>
          ))}
          {c.additionalPhrasings.map((p) => (
            <li key={p.slice(0, 48)}>{p}</li>
          ))}
        </ul>
      </article>

      {c.scenarioContext.length > 0 ? (
        <section className="ep-card border-sky-200 bg-sky-50/30 p-5 text-sm leading-relaxed text-[var(--ep-navy)]">
          <h3 className="text-xs font-bold uppercase text-sky-900">Scenario context</h3>
          {c.scenarioContext.map((p) => (
            <p key={p.slice(0, 48)} className="mt-3 first:mt-2">
              {p}
            </p>
          ))}
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="ep-card border-rose-200 bg-rose-50/30 p-5 text-sm">
          <h3 className="text-xs font-bold uppercase text-rose-950">What Kim Hammer will likely say</h3>
          <p className="mt-3 leading-relaxed text-[var(--ep-navy)]">{c.hammerExpectedNarrative}</p>
          <ul className="mt-3 list-inside list-disc text-xs text-rose-950/90">
            {drill.whatHammerLikelySays.map((l) => (
              <li key={l.slice(0, 48)}>{l}</li>
            ))}
          </ul>
        </article>
        <article className="ep-card border-violet-200 bg-violet-50/30 p-5 text-sm">
          <h3 className="text-xs font-bold uppercase text-violet-950">What Dr. Pakko may add</h3>
          <p className="mt-3 leading-relaxed text-[var(--ep-navy)]">{c.packoExpectedNarrative}</p>
          <ul className="mt-3 list-inside list-disc text-xs text-violet-950/90">
            {drill.whatPackoMayAdd.length ? (
              drill.whatPackoMayAdd.map((l) => <li key={l.slice(0, 48)}>{l}</li>)
            ) : (
              <li>May stay brief — respect third candidate; differentiate administrator role.</li>
            )}
          </ul>
        </article>
      </div>

      <ExchangeList title="If Hammer says this → Kelly says this" exchanges={c.hammerExchanges} accent="border-rose-100" />
      <ExchangeList title="If Pakko says this → Kelly says this" exchanges={c.packoExchanges} accent="border-violet-100" />

      <section className="space-y-4">
        <h2 className="font-heading text-xl font-bold text-[var(--ep-navy)]">Kelly&apos;s full answer — by speak order</h2>
        <p className="text-sm text-[var(--ep-navy-muted)]">
          In a three-way panel, moderators rotate who answers first. Rehearse all three — never stop at &ldquo;I agree.&rdquo;
        </p>
        <ScriptBlock
          title="Kelly speaks FIRST — full response (read aloud)"
          text={c.speakFirstFullScript}
          accent="border-emerald-300 bg-emerald-50/40"
        />
        <ScriptBlock
          title="Kelly speaks SECOND — full response (read aloud)"
          text={c.speakSecondFullScript}
          accent="border-sky-300 bg-sky-50/40"
        />
        <ScriptBlock
          title="Kelly speaks THIRD — full response (read aloud)"
          text={c.speakThirdFullScript}
          accent="border-violet-300 bg-violet-50/40"
        />
      </section>

      {drill.speakOrderDrills.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--ep-gold)]">Speak-order architecture</h2>
          {drill.speakOrderDrills.map((s) => (
            <article key={s.position} className="ep-card p-5 text-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-heading text-base font-bold text-[var(--ep-navy)]">{s.label}</h3>
                <span className="font-mono text-xs font-bold text-[var(--ep-gold)]">Position {s.position}</span>
              </div>
              <p className="mt-2 text-[var(--ep-navy-muted)]">{s.strategy}</p>
              <dl className="mt-4 space-y-3 text-xs">
                <div>
                  <dt className="font-bold text-[var(--ep-navy)]">Opening</dt>
                  <dd className="mt-1 italic text-[var(--ep-navy-muted)]">{s.openingLine}</dd>
                </div>
                <div>
                  <dt className="font-bold text-[var(--ep-navy)]">Fresh addition</dt>
                  <dd className="mt-1 text-[var(--ep-navy-muted)]">{s.freshAddition}</dd>
                </div>
                <div>
                  <dt className="font-bold text-[var(--ep-navy)]">If others already agreed</dt>
                  <dd className="mt-1 text-[var(--ep-navy-muted)]">{s.ifOthersAlreadyAgreed}</dd>
                </div>
                <div>
                  <dt className="font-bold text-amber-900">If Kelly is attacked</dt>
                  <dd className="mt-1 text-[var(--ep-navy-muted)]">{s.ifOthersAttackedKelly}</dd>
                </div>
                <div>
                  <dt className="font-bold text-emerald-900">Closing beat</dt>
                  <dd className="mt-1 text-[var(--ep-navy-muted)]">{s.closingBeat}</dd>
                </div>
              </dl>
            </article>
          ))}
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <ScriptBlock title="Quick answer — 30 seconds" text={drill.directAnswer30s} accent="border-[var(--ep-gold)]/40" />
        <ScriptBlock title="Quick answer — 60 seconds" text={drill.directAnswer60s} accent="border-[var(--ep-gold)]/40" />
      </div>

      {drill.rebuttalIfHammerAttacks.length > 0 ? (
        <section className="ep-card border-rose-200 bg-rose-50/20 p-5 text-sm">
          <h3 className="text-xs font-bold uppercase text-rose-950">Rebuttal & cross — if Hammer attacks</h3>
          <div className="mt-4 space-y-4">
            {drill.rebuttalIfHammerAttacks.map((r) => (
              <article key={r.trigger} className="rounded-lg border border-[var(--ep-border)] bg-white p-4">
                <p className="text-xs font-bold text-rose-900">When: {r.trigger}</p>
                <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">He may say: &ldquo;{r.hammerLikelyLine}&rdquo;</p>
                <p className="mt-3 leading-relaxed text-[var(--ep-navy)]">
                  {r.agree} {r.contrast} {r.bridge}
                </p>
                {r.claimsNote ? <p className="mt-2 text-[10px] font-bold text-amber-900">{r.claimsNote}</p> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {drill.sampleScripts.length > 0 ? (
        <section className="ep-card p-5">
          <h3 className="text-sm font-bold uppercase text-[var(--ep-navy)]">Alternate stand-and-deliver scripts</h3>
          <div className="mt-3 space-y-3">
            {drill.sampleScripts.map((s) => (
              <article key={s.label} className="rounded-lg border border-[var(--ep-border)] p-4 text-sm leading-relaxed">
                <div className="flex justify-between gap-2 text-xs font-bold text-[var(--ep-navy)]">
                  <span>{s.label}</span>
                  <span className="font-mono text-[var(--ep-navy-muted)]">{s.duration}</span>
                </div>
                <p className="mt-2 text-[var(--ep-navy)]">{s.text}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {drill.rebuttalIfYouArePileOnTarget.length > 0 ? (
        <section className="ep-card border-amber-200 bg-amber-50/30 p-5 text-sm">
          <h3 className="text-xs font-bold uppercase text-amber-950">If both opponents pile on Kelly</h3>
          <ul className="mt-2 list-inside list-disc text-[var(--ep-navy)]">
            {drill.rebuttalIfYouArePileOnTarget.map((line) => (
              <li key={line.slice(0, 48)}>{line}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {drill.mistakesFirstTimersMake.length > 0 ? (
        <article className="ep-card border-amber-200 bg-amber-50/20 p-5 text-sm">
          <h3 className="text-xs font-bold uppercase text-amber-950">Mistakes first-timers make</h3>
          <ul className="mt-3 list-inside list-disc text-[var(--ep-navy-muted)]">
            {drill.mistakesFirstTimersMake.map((m) => (
              <li key={m.slice(0, 48)}>{m}</li>
            ))}
          </ul>
        </article>
      ) : null}

      {drill.bodyLanguageAndTone ? (
        <article className="ep-card p-5 text-sm">
          <h3 className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Body language & tone</h3>
          <p className="mt-2 text-[var(--ep-navy)]">{drill.bodyLanguageAndTone}</p>
        </article>
      ) : null}

      <article className="ep-card border-slate-300 bg-slate-50/50 p-5 text-sm">
        <h3 className="text-xs font-bold uppercase text-slate-800">Claims gate</h3>
        <p className="mt-2 text-[var(--ep-navy-muted)]">{drill.claimsGate}</p>
      </article>

      {drill.rehearsalSteps.length > 0 ? (
        <ElectionPlanDrillDownSteps title="Rehearsal steps" steps={drill.rehearsalSteps} />
      ) : null}

      <ElectionPlanDrillDownRelated links={relatedLinks} />

      <nav className="flex flex-wrap justify-between gap-3 border-t border-[var(--ep-border)] pt-6 text-xs font-bold">
        {prev ? (
          <Link href={epDebateQuestionHref(prev.questionId)} className="text-[var(--ep-navy)] underline">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={epDebateQuestionHref(next.questionId)} className="text-[var(--ep-navy)] underline">
            {next.title} →
          </Link>
        ) : null}
      </nav>
    </div>
  );
}
