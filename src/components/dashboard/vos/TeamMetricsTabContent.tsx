import {
  EVENTS_KPIS,
  MOCK_DOWNSTREAM_TREE,
  MOCK_VOLUNTEER,
  SOCIAL_MEDIA_KPIS,
} from "@/lib/dashboard/mock-data";
import type { DownstreamTeamNode, Team } from "@/types/dashboard";
import { VosKpiSummary, VosKpiMiniGrid } from "@/components/dashboard/vos/VosKpiSummary";
import { TeamDownstreamTree } from "@/components/dashboard/vos/TeamDownstreamTree";
import { KellyAccentCutout } from "@/components/dashboard/vos/KellyAccentCutout";
import { KELLY_ACCENT_METRICS } from "@/lib/campaign-assets";

function countDownstream(node: DownstreamTeamNode): number {
  return node.children.reduce((acc, c) => acc + 1 + countDownstream(c), 0);
}

export function TeamMetricsTabContent({
  team,
  teamSlug,
  downstreamRoot = MOCK_DOWNSTREAM_TREE,
}: {
  team: Team;
  teamSlug: string;
  downstreamRoot?: DownstreamTeamNode;
}) {
  const weeklyPct = team.kpis.find((k) => k.id === "k-t-2");
  const downstream = team.kpis.find((k) => k.id === "k-t-3");
  const recruited =
    team.kpis.find((k) => k.id === "k-t-4") ?? team.kpis.find((k) => k.id === "k-t-p5-referrals");

  const trendNotes = [
    { id: "t-1", label: "Week over week", value: "+6 pts on completion (demo)" },
    { id: "t-2", label: "Downstream", value: `${countDownstream(downstreamRoot)} nodes visible in tree` },
    {
      id: "t-3",
      label: "Volunteer example · Alex",
      value: `${MOCK_VOLUNTEER.weeklyTaskCompletionPercent}% personal weekly completion`,
    },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-text/50">Metrics</p>
        <h2 className="mt-2 font-heading text-xl font-bold text-kelly-navy">Team health</h2>
        <p className="mt-3 font-body text-sm text-kelly-text/75">
          Phase 1 uses seed data. Future: sync with task completions, CRM touches, and downstream launches in real time.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <p className="font-body text-xs text-kelly-text/68">Report the same three numbers weekly — trends follow consistency.</p>
          <KellyAccentCutout src={KELLY_ACCENT_METRICS} />
        </div>
        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-kelly-text/10 bg-kelly-fog/40 px-4 py-3">
            <dt className="font-body text-[10px] font-bold uppercase text-kelly-text/50">Weekly completion</dt>
            <dd className="mt-1 font-mono text-2xl font-bold text-kelly-navy">{weeklyPct?.value ?? "—"}%</dd>
          </div>
          <div className="rounded-xl border border-kelly-text/10 bg-kelly-fog/40 px-4 py-3">
            <dt className="font-body text-[10px] font-bold uppercase text-kelly-text/50">Downstream teams launched</dt>
            <dd className="mt-1 font-mono text-2xl font-bold text-kelly-navy">{downstream?.value ?? "—"}</dd>
          </div>
          <div className="rounded-xl border border-kelly-text/10 bg-kelly-fog/40 px-4 py-3">
            <dt className="font-body text-[10px] font-bold uppercase text-kelly-text/50">New volunteers (month)</dt>
            <dd className="mt-1 font-mono text-2xl font-bold text-kelly-navy">{recruited?.value ?? "—"}</dd>
          </div>
        </dl>
      </section>

      <VosKpiSummary title="Team KPIs" kpis={team.kpis} />

      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page/80 p-6 md:p-8">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">Cross-lane snapshots (demo)</h3>
        <p className="mt-2 font-body text-sm text-kelly-text/75">
          Events and social lanes surface here next to triad rollups. Future: live rollups from task completions and field reporting.
        </p>
        <div className="mt-4">
          <VosKpiMiniGrid
            kpis={[
              EVENTS_KPIS[0]!,
              EVENTS_KPIS[1]!,
              SOCIAL_MEDIA_KPIS[2]!,
              SOCIAL_MEDIA_KPIS[0]!,
            ]}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">Role KPIs (sample member)</h3>
        <p className="mt-2 font-body text-sm text-kelly-text/75">
          Showing one triad member&apos;s demo KPI set. Future: automatic rollups by lane across all rosters.
        </p>
        <div className="mt-4">
          <VosKpiMiniGrid kpis={MOCK_VOLUNTEER.kpis} />
        </div>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page/80 p-6 md:p-8">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">Downstream growth</h3>
        <p className="mt-2 font-body text-sm text-kelly-text/75">
          Live tree rooted at the county triad. Your current workspace: <span className="font-semibold text-kelly-navy">{team.displayName}</span>.
        </p>
        <ul className="mt-4 space-y-2 font-body text-sm text-kelly-text/85">
          {trendNotes.map((t) => (
            <li key={t.id} className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
              <span className="font-semibold text-kelly-deep">{t.label}:</span> {t.value}
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <TeamDownstreamTree root={downstreamRoot} currentSlug={teamSlug} />
        </div>
      </section>
    </div>
  );
}
