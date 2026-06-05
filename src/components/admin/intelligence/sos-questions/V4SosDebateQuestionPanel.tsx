import Link from "next/link";
import { ClaimsGateBanner } from "@/components/admin/intelligence/ClaimsGateBanner";
import type { SosDebateQuestionDrillDown } from "@/lib/intelligence/v4/sosDebateQuestionTypes";

function ScriptBlock({ title, text, accent }: { title: string; text: string; accent: string }) {
  return (
    <article className={`rounded-xl border-2 p-5 text-sm leading-relaxed ${accent}`}>
      <h3 className="text-xs font-bold uppercase tracking-wider">{title}</h3>
      <p className="mt-3 text-kelly-text">{text}</p>
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
    <section className={`rounded-xl border p-5 text-xs ${accent}`}>
      <h3 className="font-bold uppercase tracking-wider">{title}</h3>
      <div className="mt-4 space-y-4">
        {exchanges.map((ex) => (
          <article key={ex.opponentLine.slice(0, 40)} className="rounded-lg border border-kelly-text/10 bg-white p-4">
            <p className="font-bold text-rose-900">They may say:</p>
            <p className="mt-1 italic text-kelly-muted">&ldquo;{ex.opponentLine}&rdquo;</p>
            <p className="mt-3 font-bold text-emerald-900">Kelly responds:</p>
            <p className="mt-1 leading-relaxed text-kelly-text">{ex.kellyResponse}</p>
            {ex.toneNote ? <p className="mt-2 text-[10px] font-semibold text-amber-900">{ex.toneNote}</p> : null}
          </article>
        ))}
      </div>
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
  const c = drill.comprehensive;
  if (!c) {
    return <p className="text-sm text-rose-900">Comprehensive expansion missing — contact staff.</p>;
  }

  return (
    <div className="space-y-6">
      <article className="rounded-xl border-2 border-kelly-navy/30 bg-kelly-page/40 p-6">
        <p className="text-[10px] font-bold uppercase text-kelly-navy">
          Q{drill.questionNumber} · {drill.probability} · {drill.categoryLabel}
        </p>
        <h2 className="mt-2 font-heading text-2xl font-bold text-kelly-navy">{c.questionAsAsked}</h2>
        <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-kelly-muted">
          {drill.moderatorLikelyPhrasings.map((p) => (
            <li key={p.slice(0, 48)}>{p}</li>
          ))}
          {c.additionalPhrasings.map((p) => (
            <li key={p.slice(0, 48)}>{p}</li>
          ))}
        </ul>
      </article>

      {c.scenarioContext.length > 0 ? (
        <section className="rounded-xl border border-sky-100 bg-sky-50/30 p-5 text-sm leading-relaxed text-kelly-text">
          {c.scenarioContext.map((p) => (
            <p key={p.slice(0, 48)} className="mt-3 first:mt-0">
              {p}
            </p>
          ))}
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-rose-200 bg-rose-50/30 p-5 text-sm">
          <h3 className="text-xs font-bold uppercase text-rose-950">What Kim Hammer will likely say</h3>
          <p className="mt-3 leading-relaxed text-kelly-text">{c.hammerExpectedNarrative}</p>
          <ul className="mt-3 list-inside list-disc text-xs text-rose-950/90">
            {drill.whatHammerLikelySays.map((l) => (
              <li key={l.slice(0, 48)}>{l}</li>
            ))}
          </ul>
        </article>
        <article className="rounded-xl border border-violet-200 bg-violet-50/30 p-5 text-sm">
          <h3 className="text-xs font-bold uppercase text-violet-950">What Dr. Pakko may add</h3>
          <p className="mt-3 leading-relaxed text-kelly-text">{c.packoExpectedNarrative}</p>
          <ul className="mt-3 list-inside list-disc text-xs text-violet-950/90">
            {drill.whatPackoMayAdd.length ? (
              drill.whatPackoMayAdd.map((l) => <li key={l.slice(0, 48)}>{l}</li>)
            ) : (
              <li>May stay brief — respect third candidate; differentiate administrator role.</li>
            )}
          </ul>
        </article>
      </div>

      <ExchangeList title="If Hammer says this → Kelly says this" exchanges={c.hammerExchanges} accent="border-rose-100 bg-white" />
      <ExchangeList title="If Pakko says this → Kelly says this" exchanges={c.packoExchanges} accent="border-violet-100 bg-white" />

      <section className="space-y-4">
        <h2 className="font-heading text-xl font-bold text-kelly-navy">Kelly&apos;s full answer — by speak order</h2>
        <p className="text-sm text-kelly-muted">
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

      <div className="grid gap-4 lg:grid-cols-2">
        <ScriptBlock title="Quick answer — 30 seconds" text={drill.directAnswer30s} accent="border-kelly-gold/40 bg-white" />
        <ScriptBlock title="Quick answer — 60 seconds" text={drill.directAnswer60s} accent="border-kelly-gold/40 bg-white" />
      </div>

      {drill.sampleScripts.length > 0 ? (
        <section className="rounded-xl border border-kelly-navy/15 bg-white p-5">
          <h3 className="text-sm font-bold uppercase text-kelly-navy">Alternate stand-and-deliver scripts</h3>
          <div className="mt-3 space-y-3">
            {drill.sampleScripts.map((s) => (
              <article key={s.label} className="rounded-lg border border-kelly-text/10 p-4 text-sm leading-relaxed">
                <div className="flex justify-between gap-2 text-xs font-bold text-kelly-navy">
                  <span>{s.label}</span>
                  <span className="font-mono text-kelly-subtle">{s.duration}</span>
                </div>
                <p className="mt-2">{s.text}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {drill.rebuttalIfYouArePileOnTarget.length > 0 ? (
        <section className="rounded-xl border border-amber-200 bg-amber-50/30 p-5 text-xs">
          <h3 className="font-bold uppercase text-amber-950">If both opponents pile on Kelly</h3>
          <ul className="mt-2 list-inside list-disc text-kelly-text">
            {drill.rebuttalIfYouArePileOnTarget.map((line) => (
              <li key={line.slice(0, 48)}>{line}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <ClaimsGateBanner claimsGate={drill.claimsGate} />

      {drill.relatedLinks.length > 0 ? (
        <section className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h3 className="text-[10px] font-bold uppercase text-kelly-subtle">Related prep</h3>
          <ul className="mt-2 flex flex-wrap gap-2 text-xs">
            {drill.relatedLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-full border border-kelly-navy/30 px-3 py-1 font-bold text-kelly-navy hover:bg-kelly-page"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

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
