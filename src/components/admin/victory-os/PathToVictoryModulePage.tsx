/**
 * Path to Victory — doctrine-locked admin module surface (Phase 1 complete; Phase 2 blocked).
 * No deployment recommendations until leadership sign-off.
 */

const LOCK_CHECKLIST = [
  "Critical Counties",
  "Readiness Definitions",
  "Opportunity Definitions",
  "Kelly Capacity",
  "Victory Assumptions",
  "Winning Theory",
] as const;

const GOVERNANCE_REFERENCES = [
  {
    title: "View Leadership Pre-Read",
    path: "docs/campaign-events/LEADERSHIP_LOCK_SESSION_PRE_READ.md",
  },
  {
    title: "View Leadership Decision Packet",
    path: "docs/campaign-events/LEADERSHIP_DECISION_PACKET.md",
  },
  {
    title: "View Victory Map Review",
    path: "docs/campaign-events/VICTORY_MAP_SPRINT_0_REVIEW.md",
  },
  {
    title: "View Phase 1 Complete Declaration",
    path: "docs/campaign-events/VICTORY_OS_PHASE_1_COMPLETE.md",
  },
] as const;

export function PathToVictoryModulePage() {
  return (
    <div className="mx-auto max-w-3xl pb-16">
      <p className="font-body text-[10px] font-bold uppercase tracking-[0.28em] text-kelly-copper">
        Victory OS · Admin only
      </p>
      <h1 className="mt-3 font-heading text-3xl font-bold text-kelly-navy">Path to Victory</h1>
      <p className="mt-2 font-body text-lg font-semibold text-kelly-navy/90">Victory OS command surface</p>

      <div className="mt-6 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-5 py-4">
        <p className="font-body text-xs font-bold uppercase tracking-[0.2em] text-amber-900/70">Status</p>
        <p className="mt-1 font-body text-sm font-semibold text-amber-950">
          Leadership lock required before Priority 2 begins
        </p>
      </div>

      <p className="mt-6 max-w-2xl font-body text-base leading-relaxed text-kelly-text/85">
        Victory OS Phase 1 is complete. The public website is frozen, doctrine is locked, the Victory Map is seeded,
        and Sprint 0.5 governance is complete. Priority 2 remains blocked until leadership locks the six required
        decisions.
      </p>

      <section className="mt-8" aria-labelledby="path-to-victory-locks-heading">
        <h2 id="path-to-victory-locks-heading" className="font-heading text-lg font-bold text-kelly-navy">
          Six lock checklist
        </h2>
        <ul className="mt-3 space-y-2">
          {LOCK_CHECKLIST.map((item) => (
            <li
              key={item}
              className="flex items-center gap-3 rounded-xl border border-kelly-text/10 bg-kelly-page/40 px-4 py-3 font-body text-sm text-kelly-text/90"
            >
              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-kelly-text/20 text-[10px] font-bold text-kelly-muted">
                ☐
              </span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="path-to-victory-governance-heading">
        <h2 id="path-to-victory-governance-heading" className="font-heading text-lg font-bold text-kelly-navy">
          Governance references
        </h2>
        <p className="mt-2 font-body text-sm text-kelly-muted">
          Internal repo paths — open in the workspace or share for the leadership session.
        </p>
        <ul className="mt-4 space-y-3">
          {GOVERNANCE_REFERENCES.map((ref) => (
            <li
              key={ref.path}
              className="rounded-xl border border-kelly-navy/15 bg-white px-4 py-3 shadow-sm"
            >
              <p className="font-body text-sm font-bold text-kelly-navy">{ref.title}</p>
              <code className="mt-1 block break-all font-mono text-xs text-kelly-muted">{ref.path}</code>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-8 font-body text-xs text-kelly-muted">
        Strategic frame:{" "}
        <code className="rounded bg-kelly-text/5 px-1.5 py-0.5">docs/campaign-events/sprint-0-5/00-STRATEGIC_FRAME.md</code>
        {" · "}
        Phase 2 spec:{" "}
        <code className="rounded bg-kelly-text/5 px-1.5 py-0.5">
          docs/campaign-events/VICTORY_OS_PHASE_2_DECISION_INFRASTRUCTURE.md
        </code>
      </p>
    </div>
  );
}
