import Link from "next/link";
import { CountyKpiStrip, CountySectionHeader } from "@/components/county/dashboard";
import { countyDashboardCardClass } from "@/components/county/dashboard/countyDashboardClassNames";
import { PowerOf5PipelineVisualization } from "@/components/power-of-5/PowerOf5PipelineVisualization";
import { MessageHubLinkCard } from "@/components/integrations/MessageHubLinkCard";
import { GlossaryTerm } from "@/components/teaching/GlossaryTerm";
import { cn } from "@/lib/utils";
import type {
  LeaderDashboardFollowUpRow,
  LeaderDashboardTeamRow,
  LeaderDashboardWeakNodeRow,
  PowerOf5LeaderDashboardDemoPayload,
} from "@/lib/campaign-engine/power-of-5/build-leader-dashboard-demo";

function healthPill(health: LeaderDashboardTeamRow["health"]) {
  const map = {
    strong:
      "border-emerald-300/80 bg-emerald-50/95 text-emerald-950 dark:border-emerald-500/45 dark:bg-emerald-950/40 dark:text-emerald-100",
    watch:
      "border-amber-300/80 bg-amber-50/95 text-amber-950 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-50",
    at_risk:
      "border-rose-300/80 bg-rose-50/95 text-rose-950 dark:border-rose-500/45 dark:bg-rose-950/40 dark:text-rose-100",
  } as const;
  const label = health === "strong" ? "Healthy" : health === "watch" ? "Watch" : "At risk";
  return (
    <span className={cn("rounded-full border px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide", map[health])}>
      {label}
    </span>
  );
}

function severityStyles(sev: LeaderDashboardWeakNodeRow["severity"]) {
  if (sev === "high") return "border-l-rose-500";
  if (sev === "medium") return "border-l-amber-500";
  return "border-l-kelly-slate/40";
}

function dueBucketStyles(bucket: LeaderDashboardFollowUpRow["dueBucket"]) {
  if (bucket === "overdue")
    return "bg-rose-50 text-rose-950 ring-1 ring-rose-200/80 dark:bg-rose-950/35 dark:text-rose-100 dark:ring-rose-500/35";
  if (bucket === "today")
    return "bg-amber-50 text-amber-950 ring-1 ring-amber-200/80 dark:bg-amber-950/35 dark:text-amber-50 dark:ring-amber-500/35";
  return "bg-kelly-slate/10 text-kelly-navy ring-1 ring-kelly-slate/20 dark:bg-kelly-slate/25 dark:text-kelly-fog dark:ring-white/15";
}

function dueBucketLabel(bucket: LeaderDashboardFollowUpRow["dueBucket"]) {
  if (bucket === "overdue") return "Overdue";
  if (bucket === "today") return "Today";
  return "This week";
}

type Props = {
  data: PowerOf5LeaderDashboardDemoPayload;
};

export function PowerOf5LeaderDashboardView({ data }: Props) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 text-kelly-text md:py-10">
      <p className="text-sm text-kelly-text/60">
        <Link className="text-kelly-slate underline" href="/dashboard">
          ← My dashboard
        </Link>
        {" · "}
        <Link className="text-kelly-slate underline" href="/">
          Home
        </Link>
      </p>

      <header className="mt-4 border-b border-kelly-navy/15 pb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-slate/75">Power of 5</p>
        <h1 className="font-heading text-2xl font-bold text-kelly-navy md:text-3xl">Leader dashboard</h1>
        <p className="mt-2 max-w-3xl text-sm text-kelly-text/75">
          Rollup for a <strong>Power Team leader</strong> in a <GlossaryTerm term="powerOf5">Power of 5</GlossaryTerm> program: teams you coach,
          completion gaps, fragile nodes, and follow-up debt. When productized, this page is auth-gated and backed by consent-scoped rosters — not
          public OIS.
        </p>
        <p className="mt-3 rounded-lg border border-amber-200/80 bg-amber-50/90 p-3 text-xs text-amber-950 dark:border-amber-500/35 dark:bg-amber-950/45 dark:text-amber-50">
          {data.demoBanner}
        </p>
      </header>

      <PowerOf5PipelineVisualization className="mt-8" variant="full" activeId="follow-up" />

      <MessageHubLinkCard
        className="mt-8"
        title="Team message packet"
        description={
          <>
            Pull the <strong>volunteer share packet</strong>, event invite scaffold, and this week’s through-line for huddles. Hub content is{" "}
            <strong>demo / seed</strong> — pair it with your roster coaching, not as a blast list.
          </>
        }
        linkLabel="Open team packet shelf →"
      />

      <CountyKpiStrip
        className="mt-8"
        overline="Team health"
        title="Executive strip"
        description="Snapshot metrics a leader checks first. Values here are demo / seed until hydration ships."
        items={data.healthKpis}
        compact
      />

      <section className="mt-10">
        <CountySectionHeader
          overline="Roster"
          title="Teams under leader"
          description="Teams assigned to you in the hierarchy (demo labels only — no member PII on this public route)."
        />
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {data.teamsUnderLeader.map((t) => (
            <div key={t.id} className={cn(countyDashboardCardClass, "border-l-4 border-l-kelly-navy/35")}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-heading text-base font-bold text-kelly-navy">{t.displayName}</p>
                {healthPill(t.health)}
              </div>
              <p className="mt-1 text-xs text-kelly-text/60">{t.geographyLabel}</p>
              <p className="mt-3 text-sm text-kelly-text/85">
                <span className="font-semibold text-kelly-navy">My Five:</span> {t.slotsFilled}/{t.slotsTarget} seats · {t.completionPct}%
                complete
              </p>
              <p className="mt-2 text-xs text-kelly-text/65">{t.lastActivityNote}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <CountySectionHeader
          overline="Gaps"
          title="Incomplete teams"
          description="Teams with open seats or unfinished “My Five” — prioritize invites and activations before chasing new turf."
        />
        {data.incompleteTeams.length === 0 ? (
          <p className="mt-4 text-sm text-kelly-text/70">No incomplete teams in this demo slice.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {data.incompleteTeams.map((t) => (
              <li key={t.id} className={cn(countyDashboardCardClass, "flex flex-wrap items-center justify-between gap-3 py-3")}>
                <div>
                  <p className="font-semibold text-kelly-navy">{t.displayName}</p>
                  <p className="text-xs text-kelly-text/60">
                    Open seats: {t.slotsTarget - t.slotsFilled} · {t.completionPct}% complete
                  </p>
                </div>
                {healthPill(t.health)}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <CountySectionHeader
          overline="Risk"
          title="Weak nodes"
          description="Signals that a node or slot is under-connected — demo copy stands in for latency / diversity / touch metrics."
        />
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {data.weakNodes.map((w) => (
            <div key={w.id} className={cn(countyDashboardCardClass, "border-l-4", severityStyles(w.severity))}>
              <p className="text-xs font-bold uppercase tracking-widest text-kelly-text/50">{w.teamDisplayName}</p>
              <p className="mt-2 text-sm text-kelly-text/85">{w.signal}</p>
              <p className="mt-2 text-[10px] font-extrabold uppercase tracking-wide text-kelly-text/45">
                Severity: {w.severity}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <CountySectionHeader
          overline="Pipeline"
          title="Follow-ups due"
          description="Relational debt queue — overdue first, then today, then the rest of the week (bucket labels are demo-only)."
        />
        <ul className="mt-4 space-y-3">
          {data.followUpsDue.map((f) => (
            <li key={f.id} className={cn(countyDashboardCardClass, "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between")}>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-kelly-navy">{f.summary}</p>
                <p className="text-xs text-kelly-text/60">{f.teamDisplayName}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide", dueBucketStyles(f.dueBucket))}>
                  {dueBucketLabel(f.dueBucket)}
                </span>
                <span className="text-xs text-kelly-text/55">{f.demoDueLabel}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-12 border-t border-kelly-text/10 pt-6 text-sm text-kelly-text/60">
        <p>
          Public statewide map:{" "}
          <Link className="font-semibold text-kelly-slate underline" href="/organizing-intelligence">
            Organizing intelligence
          </Link>
          . Staff-only operator views are intentionally not linked from public pages — use your campaign playbook for admin login.
          {" "}Spec reference:{" "}
          <code className="rounded bg-kelly-text/5 px-1">docs/POWER_OF_5_LEADER_DASHBOARD.md</code>
        </p>
      </footer>
    </div>
  );
}
