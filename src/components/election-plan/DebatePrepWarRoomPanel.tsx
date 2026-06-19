import Link from "next/link";

import type { DebatePrepSystemV8Snapshot } from "@/lib/election-plan/debate-prep-system-v8";

const MODE_ACCENTS = {
  navy: "border-[var(--ep-navy)] bg-[var(--ep-navy)]/5",
  gold: "border-[var(--ep-gold)] bg-amber-50/60",
  rose: "border-rose-400 bg-rose-50/50",
  violet: "border-violet-400 bg-violet-50/40",
  cyan: "border-cyan-400 bg-cyan-50/40",
} as const;

const RADAR_STATUS = {
  green: "bg-emerald-500",
  amber: "bg-amber-400",
  red: "bg-rose-500",
} as const;

export function DebatePrepWarRoomPanel({ snapshot }: { snapshot: DebatePrepSystemV8Snapshot }) {
  const { worldClass: wc } = snapshot;

  return (
    <div className="space-y-8">
      <section className="ep-card border-2 border-[var(--ep-gold)]/50 bg-gradient-to-br from-[var(--ep-cream)]/80 to-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--ep-gold)]">
              {wc.countdownLabel} · world-class engine
            </p>
            <h2 className="mt-2 font-heading text-2xl font-bold text-[var(--ep-navy)]">World-class readiness</h2>
            <p className="mt-2 max-w-2xl text-sm text-[var(--ep-navy-muted)]">{wc.compositeReadinessLabel}</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-6xl font-bold text-[var(--ep-navy)]">{wc.compositeReadinessScore}%</p>
            <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Composite score</p>
          </div>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-[var(--ep-border)]">
          <div
            className="h-full rounded-full bg-[var(--ep-navy)] transition-all"
            style={{ width: `${wc.compositeReadinessScore}%` }}
          />
        </div>
      </section>

      <section>
        <h3 className="mb-4 font-heading text-lg font-bold text-[var(--ep-navy)]">8-dimension readiness radar</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {wc.readinessRadar.map((dim) => (
            <Link
              key={dim.id}
              href={dim.fixHref}
              className="ep-card block p-4 transition hover:border-[var(--ep-gold)]"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">{dim.label}</p>
                <span className={`h-2 w-2 rounded-full ${RADAR_STATUS[dim.status]}`} />
              </div>
              <p className="mt-2 font-heading text-2xl font-bold text-[var(--ep-navy)]">{dim.score}%</p>
              <p className="mt-1 text-[10px] text-[var(--ep-navy-muted)]">Target {dim.target}% · {dim.fixLabel} →</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-4 font-heading text-lg font-bold text-[var(--ep-navy)]">Prep mode launcher</h3>
        <p className="mb-4 text-sm text-[var(--ep-navy-muted)]">
          Pick the mode that matches your clock — panic to full dress. Every mode deep-links into existing tutor, rehearsal, and war room surfaces.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {wc.prepModes.map((mode) => (
            <Link
              key={mode.modeId}
              href={mode.href}
              className={`ep-card block border-2 p-5 transition hover:shadow-md ${MODE_ACCENTS[mode.accent]}`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-heading font-bold text-[var(--ep-navy)]">{mode.label}</p>
                <span className="shrink-0 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold">{mode.minutes} min</span>
              </div>
              <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{mode.tagline}</p>
              <p className="mt-3 text-xs italic text-[var(--ep-navy-muted)]">{mode.whenToUse}</p>
            </Link>
          ))}
        </div>
      </section>

      {wc.weakSpots.length ? (
        <section className="ep-card border border-rose-200 bg-rose-50/30 p-5">
          <h3 className="font-heading text-lg font-bold text-rose-950">Weak spot radar</h3>
          <ul className="mt-4 space-y-3">
            {wc.weakSpots.map((spot) => (
              <li key={spot.spotId} className="flex flex-wrap items-start justify-between gap-2 text-sm">
                <div>
                  <span
                    className={`mr-2 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                      spot.severity === "high" ? "bg-rose-200 text-rose-950" : "bg-amber-100 text-amber-950"
                    }`}
                  >
                    {spot.severity}
                  </span>
                  <span className="text-rose-950">{spot.label}</span>
                </div>
                <Link href={spot.fixHref} className="shrink-0 text-xs font-bold text-rose-900 underline">
                  {spot.fixAction} →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section id="pile-on">
        <h3 className="mb-4 font-heading text-lg font-bold text-[var(--ep-navy)]">Pile-on survival scenarios</h3>
        <p className="mb-4 text-sm text-[var(--ep-navy-muted)]">
          Three-way dynamics when Hammer bites and Pakko agrees — rehearse speak-order under pressure.
        </p>
        <div className="space-y-4">
          {wc.pileOnScenarios.map((scenario) => (
            <article key={scenario.scenarioId} className="ep-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h4 className="font-semibold text-[var(--ep-navy)]">{scenario.title}</h4>
                <span className="text-[10px] font-bold uppercase text-[var(--ep-navy-muted)]">
                  {scenario.durationMinutes} min
                </span>
              </div>
              <ol className="mt-4 space-y-3 text-sm">
                {scenario.beats.map((beat, i) => (
                  <li key={i} className="border-l-2 border-violet-300 pl-3">
                    <p className="text-[10px] font-bold uppercase text-violet-800">{beat.speaker}</p>
                    <p className="mt-0.5 italic text-[var(--ep-navy-muted)]">{beat.line}</p>
                    <p className="mt-1 font-medium text-[var(--ep-navy)]">Kelly: {beat.kellyBeat}</p>
                  </li>
                ))}
              </ol>
              <Link href={scenario.href} className="mt-3 inline-block text-xs font-bold underline">
                Drill this scenario →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="ep-card p-5">
          <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Quotable line bank</h3>
          <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">Stage-safe lines from forum intel, trap pivots, and master frame.</p>
          <ul className="mt-4 space-y-3 text-sm">
            {wc.quotableBank.map((line) => (
              <li key={line.lineId} className="rounded-lg border border-[var(--ep-border)] bg-[var(--ep-cream)]/30 p-3">
                <p className="font-medium text-[var(--ep-navy)]">&ldquo;{line.text.slice(0, 180)}{line.text.length > 180 ? "…" : ""}&rdquo;</p>
                <p className="mt-2 text-[10px] text-[var(--ep-navy-muted)]">
                  {line.source} · {line.topic}
                  {line.stageSafe ? " · clear" : " · verify"}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="ep-card p-5">
          <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Stage psychology stack</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {wc.stagePsychology.map((cue) => (
              <li key={cue.cueId} className="rounded-lg border border-cyan-200 bg-cyan-50/30 p-3">
                <div className="flex justify-between gap-2">
                  <p className="font-semibold text-[var(--ep-navy)]">{cue.title}</p>
                  <span className="text-[10px] font-mono text-cyan-900">{cue.seconds}s</span>
                </div>
                <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">When: {cue.trigger}</p>
                <p className="mt-2 text-[var(--ep-navy)]">{cue.protocol}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="ep-card border border-violet-200 bg-violet-50/30 p-5">
        <h3 className="font-heading text-lg font-bold text-violet-950">Scenario trap intelligence</h3>
        {wc.scenarioPrep.debateTrapWarnings.length ? (
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-violet-950">
            {wc.scenarioPrep.debateTrapWarnings.map((w) => (
              <li key={w.slice(0, 48)}>{w}</li>
            ))}
          </ul>
        ) : null}
        {wc.scenarioPrep.whatNotToSay.length ? (
          <>
            <p className="mt-4 text-xs font-bold uppercase text-rose-800">What not to say</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-rose-900">
              {wc.scenarioPrep.whatNotToSay.map((w) => (
                <li key={w.slice(0, 48)}>{w}</li>
              ))}
            </ul>
          </>
        ) : null}
        {wc.scenarioPrep.bridgeLineGuidance.length ? (
          <>
            <p className="mt-4 text-xs font-bold uppercase text-emerald-800">Bridge lines</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-emerald-950">
              {wc.scenarioPrep.bridgeLineGuidance.map((b) => (
                <li key={b.slice(0, 48)}>{b}</li>
              ))}
            </ul>
          </>
        ) : null}
      </section>
    </div>
  );
}
