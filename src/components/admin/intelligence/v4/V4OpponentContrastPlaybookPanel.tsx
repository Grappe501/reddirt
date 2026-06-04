import {
  OPPONENT_CONTRAST_LANES,
  OPPONENT_TRAP_LANES,
  RECORD_ITEM_FRAMING_PRIMER,
  SOS_JOB_CONTRAST,
} from "@/lib/intelligence/v4/kellyOpponentContrastPlaybook";

export function V4OpponentContrastPlaybookPanel() {
  return (
    <section className="mb-8 space-y-6">
      <article className="rounded-xl border-2 border-kelly-navy/15 bg-white p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Background &amp; job fit</p>
        <h2 className="mt-2 font-heading text-xl font-bold text-kelly-navy">{SOS_JOB_CONTRAST.headline}</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2 text-xs">
          <div className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-3">
            <p className="font-bold uppercase text-emerald-900">Kelly positioning</p>
            <p className="mt-2 text-emerald-950">{SOS_JOB_CONTRAST.kellyProfile}</p>
          </div>
          <div className="rounded-lg border border-rose-100 bg-rose-50/40 p-3">
            <p className="font-bold uppercase text-rose-900">Opponent record (fair)</p>
            <p className="mt-2 text-rose-950">{SOS_JOB_CONTRAST.hammerProfile}</p>
          </div>
        </div>
        <p className="mt-4 text-xs text-kelly-muted">{SOS_JOB_CONTRAST.inexperienceFraming}</p>
        <p className="mt-3 text-xs font-bold uppercase text-kelly-navy">Safe background weakness angles (verify before public)</p>
        <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
          {SOS_JOB_CONTRAST.backgroundWeaknessesSafe.map((line) => (
            <li key={line.slice(0, 48)}>{line}</li>
          ))}
        </ul>
        <ol className="mt-4 space-y-2 text-xs">
          {SOS_JOB_CONTRAST.experienceGapSteps.map((row) => (
            <li key={row.step} className="rounded border border-kelly-text/10 px-3 py-2">
              <span className="font-bold text-violet-900">
                {row.step}. {row.dimension}
              </span>
              <span className="block text-kelly-muted">{row.detail}</span>
            </li>
          ))}
        </ol>
      </article>

      <article className="rounded-xl border border-amber-200/60 bg-amber-50/40 p-5 text-xs">
        <p className="font-bold uppercase text-amber-950">{RECORD_ITEM_FRAMING_PRIMER.title}</p>
        <ol className="mt-3 list-inside list-decimal space-y-1 text-amber-950/90">
          {RECORD_ITEM_FRAMING_PRIMER.steps.map((s) => (
            <li key={s.slice(0, 40)}>{s}</li>
          ))}
        </ol>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="font-bold text-kelly-navy">In debate</p>
            <p className="mt-1 text-kelly-muted">{RECORD_ITEM_FRAMING_PRIMER.debateVsSocial.debate}</p>
          </div>
          <div>
            <p className="font-bold text-kelly-navy">On social</p>
            <p className="mt-1 text-kelly-muted">{RECORD_ITEM_FRAMING_PRIMER.debateVsSocial.social}</p>
          </div>
        </div>
      </article>

      <article className="rounded-xl border border-kelly-gold/30 bg-kelly-page/50 p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-navy">Trap lanes — position him into your hand</p>
        <div className="mt-4 space-y-4">
          {OPPONENT_TRAP_LANES.map((trap) => (
            <div key={trap.name} className="rounded-lg border border-kelly-text/10 bg-white p-4 text-xs">
              <p className="font-bold text-violet-950">{trap.name}</p>
              <ul className="mt-2 space-y-1 text-kelly-muted">
                <li>
                  <span className="font-semibold text-kelly-navy">Want him to say:</span> “{trap.baitLineYouWantFromOpponent}”
                </li>
                <li>
                  <span className="font-semibold text-kelly-navy">Ask:</span> {trap.moderatorOrKellySetupQuestion}
                </li>
                <li>
                  <span className="font-semibold text-kelly-navy">Pivot:</span> {trap.kellyPivotWhenHeBites}
                </li>
                <li>
                  <span className="font-semibold text-kelly-navy">Why:</span> {trap.whyItWorks}
                </li>
              </ul>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-xl border border-kelly-text/10 bg-white p-5">
        <p className="text-[10px] font-bold uppercase text-kelly-subtle">Contrast lanes — debate &amp; social</p>
        <div className="mt-4 space-y-6">
          {OPPONENT_CONTRAST_LANES.map((lane) => (
            <div key={lane.id} className="border-b border-kelly-text/10 pb-6 last:border-0">
              <h3 className="font-heading text-lg font-bold text-kelly-navy">{lane.title}</h3>
              <p className="mt-2 text-xs text-kelly-muted">
                <span className="font-semibold">He may claim:</span> {lane.hammerLikelyClaim}
              </p>
              <p className="mt-1 text-xs text-emerald-900">
                <span className="font-semibold">Kelly:</span> {lane.kellyContrast}
              </p>
              <p className="mt-1 text-xs text-violet-950">
                <span className="font-semibold">Experience gap:</span> {lane.experienceGap}
              </p>
              <p className="mt-2 text-xs text-kelly-muted">
                <span className="font-semibold">Social:</span> {lane.socialUse}
              </p>
              <ol className="mt-3 space-y-1 text-xs">
                {lane.debateSteps.map((row) => (
                  <li key={row.step}>
                    <span className="font-bold text-violet-800">
                      {row.dimension}:
                    </span>{" "}
                    {row.detail}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
