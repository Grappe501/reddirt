import Link from "next/link";
import type { PathToVictorySnapshot } from "@/lib/victory-os/path-to-victory-snapshot";
import { VictoryOsShellSuspense } from "./victory-os-ui/VictoryOsShellSuspense";
import { vos } from "./victory-os-ui/victory-os-tokens";
import { PathToVictoryCopyPathButton } from "./PathToVictoryCopyPathButton";

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
  {
    title: "View Strategic Frame (facilitator)",
    path: "docs/campaign-events/sprint-0-5/00-STRATEGIC_FRAME.md",
  },
  {
    title: "View Kelly Draft Input",
    path: "docs/campaign-events/LEADERSHIP_DRAFT_INPUT_KELLY.md",
  },
] as const;

const LAYERS = [
  {
    title: "Campaign website",
    status: "Complete / frozen",
    detail: "Public trust, competence, visibility, action",
  },
  {
    title: "Victory OS",
    status: "Phase 1 complete",
    detail: "Internal strategy, governance, allocation, execution",
  },
  {
    title: "Leadership",
    status: "Session required",
    detail: "Source of assumptions and winning theory",
  },
] as const;

const STRATEGIC_DIMENSIONS = [
  { name: "Electoral importance", question: "How much does this county matter to victory?" },
  { name: "Opportunity", question: "How much vote growth is realistically available?" },
  { name: "Candidate deployment", question: "How often should Kelly physically appear?" },
] as const;

function formatVotes(n: number): string {
  return n.toLocaleString("en-US");
}

function LockIcon({ locked }: { locked: boolean }) {
  return (
    <span
      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
        locked
          ? "border-emerald-300 bg-emerald-50 text-emerald-800"
          : "border-kelly-text/20 bg-white text-kelly-muted"
      }`}
      aria-hidden
    >
      {locked ? "✓" : "○"}
    </span>
  );
}

export function PathToVictoryModuleView({ snapshot }: { snapshot: PathToVictorySnapshot }) {
  const progressPct = snapshot.locksTotal > 0 ? Math.round((snapshot.locksComplete / snapshot.locksTotal) * 100) : 0;
  const blocked = snapshot.overallStatus !== "leadership_locked";

  return (
    <VictoryOsShellSuspense
      headline="Path to Victory"
      subline="Victory OS command surface — governance gate until leadership sign-off"
      showSeason5Daily={false}
    >
      <section className={`${vos.hero} mb-8`}>
        <div className={vos.heroGlow} />
        <div className={vos.heroGlowAlt} />
        <div className="relative space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className={vos.eyebrowOnDark}>Victory OS · Admin only</p>
              <h2 className="mt-2 font-heading text-2xl font-bold md:text-3xl">Governance command surface</h2>
              <p className="mt-2 max-w-2xl font-body text-sm leading-relaxed text-white/85">
                Phase 1 foundation is complete. Priority 2 (Deployment Priority Engine) stays blocked until all six
                leadership decisions are locked and signed.
              </p>
            </div>
            <span className={vos.draftBadgeOnDark}>
              {blocked ? "Leadership lock required" : "Ready for Priority 2"}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className={vos.metricOnDark}>
              <span className="text-white/60">Counties</span>{" "}
              <span className="font-bold">{snapshot.map.totalCounties}</span>
            </span>
            <span className={vos.metricOnDark}>
              <span className="text-white/60">Planning gap</span>{" "}
              <span className="font-bold">{formatVotes(snapshot.map.statewideVoteGap)}</span>
            </span>
            <span className={vos.metricOnDark}>
              <span className="text-white/60">Draft critical</span>{" "}
              <span className="font-bold">{snapshot.map.electoral.critical}</span>
            </span>
            <span className={vos.metricOnDark}>
              <span className="text-white/60">Locks</span>{" "}
              <span className="font-bold">
                {snapshot.locksComplete}/{snapshot.locksTotal}
              </span>
            </span>
            <span className={vos.metricOnDark}>
              <span className="text-white/60">Map</span>{" "}
              <span className="font-bold capitalize">{snapshot.map.classificationStatus.replace(/_/g, " ")}</span>
            </span>
          </div>
        </div>
      </section>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {LAYERS.map((layer) => (
          <article key={layer.title} className={vos.card}>
            <p className={vos.eyebrow}>{layer.title}</p>
            <p className="mt-2 font-heading text-lg font-bold text-kelly-navy">{layer.status}</p>
            <p className="mt-1 font-body text-sm text-kelly-muted">{layer.detail}</p>
          </article>
        ))}
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <section className={vos.glass} aria-labelledby="path-to-victory-locks-heading">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="path-to-victory-locks-heading" className="font-heading text-lg font-bold text-kelly-navy">
                Six leadership locks
              </h2>
              <p className="mt-1 font-body text-sm text-kelly-muted">
                {snapshot.locksComplete} of {snapshot.locksTotal} locked · {progressPct}% toward Priority 2
              </p>
            </div>
          </div>
          <div className="mb-4 h-2 overflow-hidden rounded-full bg-kelly-text/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-kelly-copper to-kelly-gold transition-all"
              style={{ width: `${progressPct}%` }}
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Leadership lock progress"
            />
          </div>
          <ul className="space-y-2">
            {snapshot.locks.map((item) => {
              const locked = item.status === "locked";
              return (
                <li
                  key={item.id}
                  className="flex items-start gap-3 rounded-xl border border-kelly-text/8 bg-white/80 px-4 py-3"
                >
                  <LockIcon locked={locked} />
                  <div className="min-w-0 flex-1">
                    <p className="font-body text-sm font-semibold text-kelly-navy">{item.label}</p>
                    {item.docPath ? (
                      <code className="mt-0.5 block truncate font-mono text-[10px] text-kelly-muted">{item.docPath}</code>
                    ) : null}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider ${
                      locked ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {item.status}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className={vos.glass} aria-labelledby="path-to-victory-map-heading">
          <h2 id="path-to-victory-map-heading" className="font-heading text-lg font-bold text-kelly-navy">
            Victory Map snapshot (draft)
          </h2>
          <p className="mt-1 font-body text-sm text-kelly-muted">
            Seeded for leadership review — not operational until locks are signed.
          </p>
          <dl className="mt-4 space-y-4">
            <div>
              <dt className="font-body text-xs font-bold uppercase tracking-wider text-kelly-muted">Electoral importance</dt>
              <dd className="mt-2 flex flex-wrap gap-2">
                {(
                  [
                    ["Critical", snapshot.map.electoral.critical],
                    ["Important", snapshot.map.electoral.important],
                    ["Helpful", snapshot.map.electoral.helpful],
                    ["Maintenance", snapshot.map.electoral.maintenance],
                  ] as const
                ).map(([label, count]) => (
                  <span
                    key={label}
                    className="rounded-lg border border-kelly-navy/10 bg-kelly-page/40 px-3 py-1.5 font-body text-xs"
                  >
                    <span className="font-bold text-kelly-navy">{count}</span>{" "}
                    <span className="text-kelly-muted">{label}</span>
                  </span>
                ))}
              </dd>
            </div>
            <div>
              <dt className="font-body text-xs font-bold uppercase tracking-wider text-kelly-muted">Opportunity (draft)</dt>
              <dd className="mt-2 flex flex-wrap gap-2">
                {(
                  [
                    ["High", snapshot.map.opportunity.high],
                    ["Medium", snapshot.map.opportunity.medium],
                    ["Low", snapshot.map.opportunity.low],
                  ] as const
                ).map(([label, count]) => (
                  <span
                    key={label}
                    className="rounded-lg border border-kelly-copper/20 bg-kelly-copper/5 px-3 py-1.5 font-body text-xs"
                  >
                    <span className="font-bold text-kelly-navy">{count}</span>{" "}
                    <span className="text-kelly-muted">{label}</span>
                  </span>
                ))}
              </dd>
              <p className="mt-2 font-body text-xs text-amber-800/90">
                High count likely too large — leadership should narrow definitions in session.
              </p>
            </div>
            <div>
              <dt className="font-body text-xs font-bold uppercase tracking-wider text-kelly-muted">Readiness (draft)</dt>
              <dd className="mt-2 flex flex-wrap gap-2">
                {(
                  [
                    ["Strong", snapshot.map.readiness.strong],
                    ["Moderate", snapshot.map.readiness.moderate],
                    ["Weak", snapshot.map.readiness.weak],
                  ] as const
                ).map(([label, count]) => (
                  <span
                    key={label}
                    className="rounded-lg border border-kelly-text/10 bg-white px-3 py-1.5 font-body text-xs"
                  >
                    <span className="font-bold text-kelly-navy">{count}</span>{" "}
                    <span className="text-kelly-muted">{label}</span>
                  </span>
                ))}
              </dd>
              <p className="mt-2 font-body text-xs text-kelly-muted">
                Recommend adopting <strong>Unknown</strong> — weak may reflect missing data, not field weakness.
              </p>
            </div>
          </dl>
        </section>
      </div>

      <section className={`${vos.glass} mb-8`} aria-labelledby="path-to-victory-dimensions-heading">
        <h2 id="path-to-victory-dimensions-heading" className="font-heading text-lg font-bold text-kelly-navy">
          Three strategic dimensions (keep separate)
        </h2>
        <p className="mt-1 font-body text-sm text-kelly-muted">
          One county can be Critical + medium opportunity + three Kelly visits. Do not merge these in debate.
        </p>
        <ul className="mt-4 grid gap-3 md:grid-cols-3">
          {STRATEGIC_DIMENSIONS.map((d) => (
            <li key={d.name} className="rounded-xl border border-kelly-navy/10 bg-kelly-page/30 px-4 py-3">
              <p className="font-body text-sm font-bold text-kelly-navy">{d.name}</p>
              <p className="mt-1 font-body text-xs leading-relaxed text-kelly-muted">{d.question}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8 rounded-2xl border border-dashed border-kelly-navy/20 bg-kelly-page/30 px-5 py-4">
        <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-muted">Phase 2 unlock sequence</p>
        <ol className="mt-3 flex flex-col gap-2 font-body text-sm text-kelly-navy md:flex-row md:flex-wrap md:items-center md:gap-y-2">
          {[
            "Leadership sign-off",
            "Victory Map locked",
            "Priority 2 begins",
            "resolveDeploymentPriority()",
          ].map((step, i, arr) => (
            <li key={step} className="flex items-center gap-2">
              <span className="font-bold">{step}</span>
              {i < arr.length - 1 ? <span className="hidden text-kelly-muted md:inline" aria-hidden>→</span> : null}
            </li>
          ))}
        </ol>
      </section>

      <section className={vos.glass} aria-labelledby="path-to-victory-governance-heading">
        <h2 id="path-to-victory-governance-heading" className="font-heading text-lg font-bold text-kelly-navy">
          Governance session materials
        </h2>
        <p className="mt-1 font-body text-sm text-kelly-muted">
          Repo paths — copy and open in the workspace or attach to the calendar invite.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {GOVERNANCE_REFERENCES.map((ref) => (
            <li
              key={ref.path}
              className="flex flex-col justify-between gap-3 rounded-xl border border-kelly-navy/12 bg-white p-4 shadow-sm"
            >
              <div>
                <p className="font-body text-sm font-bold text-kelly-navy">{ref.title}</p>
                <code className="mt-2 block break-all font-mono text-[11px] leading-relaxed text-kelly-muted">
                  {ref.path}
                </code>
              </div>
              <PathToVictoryCopyPathButton path={ref.path} />
            </li>
          ))}
        </ul>
      </section>

      <blockquote className="mt-8 rounded-2xl border border-kelly-gold/30 bg-kelly-gold/10 px-5 py-4">
        <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-navy/70">County chair standard</p>
        <p className="mt-2 font-body text-sm italic leading-relaxed text-kelly-navy/90">
          &ldquo;Benton is ranked above White because it is Critical, has high opportunity, moderate readiness, and
          higher urgency this week.&rdquo;
        </p>
        <p className="mt-2 font-body text-xs text-kelly-muted">
          If a county chair cannot understand that logic, Phase 2 is not ready.
        </p>
      </blockquote>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/admin/ai-command-center" className={vos.btnSecondary}>
          ← Campaign OS dashboard
        </Link>
      </div>
    </VictoryOsShellSuspense>
  );
}
