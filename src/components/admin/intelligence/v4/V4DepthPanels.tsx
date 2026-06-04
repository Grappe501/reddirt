import type { OpponentResponseRound, ResponseRoundPlan } from "@/lib/intelligence/v4/debateResponseRoundEnrichment";
import type { TrapLaneStepCoverage } from "@/lib/intelligence/v4/trapLaneStepCoverage";

const LEAD_COLORS = {
  respond: "border-sky-200 bg-sky-50/40",
  rebut: "border-rose-200 bg-rose-50/40",
  lead: "border-emerald-200 bg-emerald-50/40",
} as const;

export function V4ResponseRoundPanel({ plan }: { plan: ResponseRoundPlan }) {
  return (
    <div className="space-y-4">
      <article className="rounded-xl border-2 border-kelly-navy/20 bg-kelly-page/40 p-5 text-xs">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-kelly-navy">
          Response rounds — how we respond · rebut · lead
        </p>
        <p className="mt-2 text-sm text-kelly-text">{plan.narrativeStrategy}</p>
      </article>

      <div className="space-y-3">
        {plan.rounds.map((round, idx) => (
          <ResponseRoundCard key={`${round.round}-${round.speaker}-${idx}`} round={round} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 text-xs">
          <p className="font-bold uppercase text-amber-950">Handling adversity</p>
          <ul className="mt-2 list-inside list-disc text-amber-950/90">
            {plan.adversityMoves.map((line) => (
              <li key={line.slice(0, 48)}>{line}</li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 text-xs">
          <p className="font-bold uppercase text-emerald-950">Novice checklist</p>
          <ul className="mt-2 list-inside list-disc text-emerald-950/90">
            {plan.noviceChecklist.map((line) => (
              <li key={line.slice(0, 48)}>{line}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-xl border border-violet-200 bg-violet-50/30 p-4 text-xs">
        <p className="font-bold uppercase text-violet-950">Expert cross-exam prep</p>
        <ul className="mt-2 list-inside list-disc text-violet-950/90">
          {plan.expertCrossExam.map((line) => (
            <li key={line.slice(0, 56)}>{line}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function ResponseRoundCard({ round }: { round: OpponentResponseRound }) {
  return (
    <article className={`rounded-xl border p-4 text-xs ${LEAD_COLORS[round.leadOrRebut]}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase">
          Round {round.round}
        </span>
        <span className="font-bold text-kelly-navy">{round.speaker}</span>
        <span className="rounded-full border border-kelly-navy/20 px-2 py-0.5 text-[10px] font-bold uppercase text-kelly-navy">
          {round.leadOrRebut}
        </span>
      </div>
      <p className="mt-2 italic text-kelly-muted">&ldquo;{round.likelyLine}&rdquo;</p>
      <p className="mt-1 text-[10px] text-kelly-subtle">Tone: {round.tonalNote}</p>
      <p className="mt-2">
        <span className="font-bold text-emerald-900">Kelly:</span> {round.kellyResponse}
      </p>
      <p className="mt-2 text-[10px] text-amber-900">Backup: {round.backupEvidence}</p>
    </article>
  );
}

export function V4TrapStepCoveragePanel({ coverage }: { coverage: TrapLaneStepCoverage }) {
  const LEVEL_COLORS = {
    novice: "text-emerald-800",
    intermediate: "text-sky-800",
    expert: "text-violet-800",
  };

  return (
    <div className="space-y-4">
      <article className="rounded-xl border-2 border-kelly-gold/40 bg-kelly-page/50 p-5 text-xs">
        <p className="text-[10px] font-bold uppercase text-kelly-navy">Trap coverage — step-by-step drill-down</p>
        <p className="mt-2 text-sm text-kelly-text">{coverage.overview}</p>
      </article>

      <ol className="space-y-3">
        {coverage.steps.map((step) => (
          <li key={step.stepNumber} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-violet-950">
                {step.stepNumber}. {step.phase}
              </span>
              <span className={`text-[10px] font-bold uppercase ${LEVEL_COLORS[step.educationLevel]}`}>
                {step.educationLevel}
              </span>
            </div>
            <p className="mt-2">
              <span className="font-semibold text-kelly-navy">Candidate:</span> {step.candidateAction}
            </p>
            <p className="mt-1">
              <span className="font-semibold text-sky-900">Staff:</span> {step.staffAction}
            </p>
            <p className="mt-1">
              <span className="font-semibold text-emerald-900">Success:</span> {step.successSignal}
            </p>
            <p className="mt-1">
              <span className="font-semibold text-amber-900">If it fails:</span> {step.failureRecovery}
            </p>
          </li>
        ))}
      </ol>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-rose-200 bg-rose-50/30 p-4 text-xs">
          <p className="font-bold uppercase text-rose-950">Offensive playbook</p>
          <ul className="mt-2 list-inside list-disc text-rose-950/90">
            {coverage.offensivePlaybook.map((line) => (
              <li key={line.slice(0, 48)}>{line}</li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4 text-xs">
          <p className="font-bold uppercase text-emerald-950">Defensive playbook</p>
          <ul className="mt-2 list-inside list-disc text-emerald-950/90">
            {coverage.defensivePlaybook.map((line) => (
              <li key={line.slice(0, 48)}>{line}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
