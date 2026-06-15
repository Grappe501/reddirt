import Link from "next/link";

import {
  getCampaignResponsibilityMatrix,
  getCountyLeadershipCoverage,
  getWeeklyLeadershipPacket,
  getPowerOf5CommandCenter,
  getDirectDemocracyLeadership,
  getSearcyCountyTrustPilot,
  leadershipHubHref,
  responsibilityMatrixHref,
  weeklyPacketHref,
  countyCoverageHref,
  powerOf5CommandCenterHref,
  directDemocracyLeadershipHref,
  searcyTrustPilotHref,
  type CountyLeadershipRole,
} from "@/lib/election-plan/load-phase-18-7b-ownership";
import { countyPlaybookHref } from "@/lib/election-plan/location-links";
import { OrganizationSummaryStrip } from "@/components/election-plan/CampaignOrganizationPanel";
import { MeetingsSummaryStrip } from "@/components/election-plan/Phase187EMeetingPanels";
import { ConversationStrategySummaryStrip } from "@/components/election-plan/ArkansasConversationStrategyPanel";
import { CountyVictoryTargetsSummaryStrip } from "@/components/election-plan/CountyVictoryTargetsPanel";
import { campaignOrganizationHref, getCampaignOrganizationRollup } from "@/lib/election-plan/load-campaign-organization";

function coverageColor(level: CountyLeadershipRole["coverageLevel"]): string {
  if (level === "complete") return "bg-emerald-500";
  if (level === "partial") return "bg-amber-400";
  if (level === "minimal") return "bg-orange-400";
  return "bg-red-400";
}

export function LeadershipHubPanel() {
  const matrix = getCampaignResponsibilityMatrix();
  const packet = getWeeklyLeadershipPacket();
  const counties = getCountyLeadershipCoverage();
  const orgRollup = getCampaignOrganizationRollup();

  return (
    <section>
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-gold)]">Leadership & Ownership</p>
      <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">Campaign Operating Manual · Leadership</h1>
      <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
        Who owns each piece — and what do they do every week?
      </p>

      <div className="my-6">
        <OrganizationSummaryStrip />
      </div>

      <div className="my-6 grid gap-3 lg:grid-cols-3">
        <MeetingsSummaryStrip />
        <ConversationStrategySummaryStrip />
        <CountyVictoryTargetsSummaryStrip />
      </div>

      <div className="my-6 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value text-red-700">{orgRollup.unassignedTeams}</div>
          <div className="ep-stat-label">Teams without owner</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value text-red-700">{matrix.unassignedCount}</div>
          <div className="ep-stat-label">Initiatives unassigned</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{counties.summary.chairsIdentified}/75</div>
          <div className="ep-stat-label">County chairs identified</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{packet.weekOf}</div>
          <div className="ep-stat-label">Weekly packet week of</div>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {[
          { href: campaignOrganizationHref(), title: "Campaign Organizational Chart", detail: `${orgRollup.assignedTeams}/${orgRollup.teamCount} teams owned · Phase 18.7D` },
          { href: responsibilityMatrixHref(), title: "Campaign Responsibility Matrix", detail: `${matrix.unassignedCount} red warnings` },
          { href: weeklyPacketHref(), title: "Weekly Leadership Packet", detail: `Generated for ${packet.generatedFor}` },
          { href: countyCoverageHref(), title: "County Leadership Coverage", detail: `${counties.summary.none} counties with no roles filled` },
          { href: powerOf5CommandCenterHref(), title: "Power of 5 Command Center", detail: "Headline metric beside HCI" },
          { href: directDemocracyLeadershipHref(), title: "Direct Democracy Leadership", detail: "Ballot Initiative Support Program" },
          { href: searcyTrustPilotHref(), title: "Searcy County Trust Project", detail: "Cross-partisan pilot template" },
          { href: "/election-plan/meetings", title: "Meeting & Accountability System", detail: "5 weekly rhythms · 4 questions every call" },
          { href: "/election-plan/conversation-strategy", title: "Arkansas Conversation Strategy", detail: "Organizing doctrine · under 10 minutes" },
          { href: "/election-plan/executive-book/county-victory-targets", title: "County Victory Targets", detail: "75 counties · votes · % increase · Po5 leaders" },
          { href: "/election-plan/search", title: "Election Plan Search", detail: "Find any page · local index · 18.7H" },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="ep-card block transition hover:ring-2 hover:ring-[var(--ep-gold-soft)]">
            <h2 className="font-heading font-bold text-[var(--ep-navy)]">{item.title}</h2>
            <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{item.detail}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function CampaignResponsibilityMatrixPanel() {
  const matrix = getCampaignResponsibilityMatrix();

  return (
    <section>
      <Link href={leadershipHubHref()} className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
        ← Leadership hub
      </Link>
      <div className="mt-2">
        <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">Campaign Responsibility Matrix</h1>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{matrix.doctrine}</p>
      </div>

      {matrix.unassignedCount > 0 ? (
        <div className="my-4 rounded-lg border-2 border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
          <strong>{matrix.unassignedCount} initiatives unassigned</strong> — red warnings below require named owners before Labor Day.
        </div>
      ) : null}

      <div className="overflow-x-auto ep-card">
        <table className="w-full min-w-[56rem] text-sm">
          <thead>
            <tr className="border-b border-[var(--ep-border)] text-left text-xs uppercase text-[var(--ep-navy-muted)]">
              <th className="py-2 pr-3">Initiative</th>
              <th className="py-2 pr-3">Owner</th>
              <th className="py-2 pr-3">Backup</th>
              <th className="py-2">Goal</th>
            </tr>
          </thead>
          <tbody>
            {matrix.initiatives.map((row) => (
              <tr
                key={row.id}
                className={`border-b border-[var(--ep-border)] last:border-0 ${row.unassigned ? "bg-red-50" : ""}`}
              >
                <td className="py-2 pr-3">
                  <Link href={row.href} className="font-medium hover:underline">
                    {row.initiative}
                  </Link>
                  {row.unassigned ? (
                    <span className="ml-2 rounded-full bg-red-200 px-2 py-0.5 text-[10px] font-bold uppercase text-red-900">
                      Unassigned
                    </span>
                  ) : null}
                  <p className="mt-0.5 text-xs text-[var(--ep-navy-muted)]">{row.weeklyDeliverable}</p>
                </td>
                <td className="py-2 pr-3">{row.owner ?? "—"}</td>
                <td className="py-2 pr-3">{row.backup ?? "—"}</td>
                <td className="py-2">{row.goal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function WeeklyLeadershipPacketPanel() {
  const packet = getWeeklyLeadershipPacket();

  return (
    <section>
      <Link href={leadershipHubHref()} className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
        ← Leadership hub
      </Link>
      <div className="mt-2">
        <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">Weekly Leadership Packet</h1>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
          {packet.doctrine} · Week of {packet.generatedFor}
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {packet.sections.map((section) => (
          <div
            key={section.id}
            className={`ep-card ${section.unassignedOwner ? "border-2 border-red-200 bg-red-50/50" : ""}`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-heading font-bold text-[var(--ep-navy)]">{section.label}</h2>
              <span className="text-xs text-[var(--ep-navy-muted)]">Owner: {section.owner}</span>
              {section.unassignedOwner ? (
                <span className="rounded-full bg-red-200 px-2 py-0.5 text-[10px] font-bold uppercase text-red-900">
                  Owner TBD
                </span>
              ) : null}
            </div>
            <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-[var(--ep-navy-muted)]">
              {section.priorities.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CountyLeadershipCoveragePanel() {
  const data = getCountyLeadershipCoverage();

  return (
    <section>
      <Link href={leadershipHubHref()} className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
        ← Leadership hub
      </Link>
      <div className="mt-2">
        <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">County Leadership Coverage</h1>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">75 counties · chair · captain · Mobilize · media · faith · labor</p>
      </div>

      <div className="my-6 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{data.summary.chairsIdentified}</div>
          <div className="ep-stat-label">Chairs identified</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value text-emerald-700">{data.summary.fullyCovered}</div>
          <div className="ep-stat-label">Fully covered</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value text-red-700">{data.summary.none}</div>
          <div className="ep-stat-label">No roles filled</div>
        </div>
      </div>

      <div className="mb-6 ep-card">
        <h2 className="font-heading text-sm font-bold text-[var(--ep-navy)]">Statewide coverage map</h2>
        <div className="mt-3 flex flex-wrap gap-1">
          {data.counties.map((c) => (
            <Link
              key={c.county}
              href={countyPlaybookHref(c.county, c.county.toLowerCase())}
              title={`${c.county}: ${c.rolesFilled}/${c.rolesTotal} roles · ${c.coveragePct}%`}
              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold text-white ${coverageColor(c.coverageLevel)} hover:opacity-80`}
            >
              {c.county}
            </Link>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--ep-navy-muted)]">
          <span><span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> Complete</span>
          <span><span className="inline-block h-2 w-2 rounded-full bg-amber-400" /> Partial</span>
          <span><span className="inline-block h-2 w-2 rounded-full bg-orange-400" /> Minimal</span>
          <span><span className="inline-block h-2 w-2 rounded-full bg-red-400" /> None</span>
        </div>
      </div>

      <div className="overflow-x-auto ep-card">
        <table className="w-full min-w-[64rem] text-sm">
          <thead>
            <tr className="border-b border-[var(--ep-border)] text-left text-xs uppercase text-[var(--ep-navy-muted)]">
              <th className="py-2 pr-3">County</th>
              <th className="py-2 pr-3">Chair</th>
              <th className="py-2 pr-3">Vol. captain</th>
              <th className="py-2 pr-3">Mobilize</th>
              <th className="py-2 pr-3">Media</th>
              <th className="py-2 pr-3">Faith</th>
              <th className="py-2 pr-3">Labor</th>
              <th className="py-2">Coverage</th>
            </tr>
          </thead>
          <tbody>
            {data.counties.map((c) => (
              <tr key={c.county} className="border-b border-[var(--ep-border)] last:border-0">
                <td className="py-2 pr-3">
                  <Link href={countyPlaybookHref(c.county, c.county.toLowerCase())} className="font-medium hover:underline">
                    {c.county}
                  </Link>
                </td>
                <td className="py-2 pr-3">{c.chairIdentified ? (c.chairName ?? "Yes") : "—"}</td>
                <td className="py-2 pr-3">{c.volunteerCaptain ?? "—"}</td>
                <td className="py-2 pr-3">{c.mobilizeLead ?? "—"}</td>
                <td className="py-2 pr-3">{c.mediaLead ?? "—"}</td>
                <td className="py-2 pr-3">{c.faithLead ?? "—"}</td>
                <td className="py-2 pr-3">{c.laborLead ?? "—"}</td>
                <td className="py-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-white ${coverageColor(c.coverageLevel)}`}>
                    {c.coveragePct}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function PowerOf5CommandCenterPanel() {
  const po5 = getPowerOf5CommandCenter();

  return (
    <section>
      <Link href="/election-plan/executive-book/power-of-5" className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
        ← Executive Book · Power of 5
      </Link>
      <div className="mt-2">
        <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">{po5.title}</h1>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{po5.subtitle}</p>
      </div>

      <div className="my-6 rounded-xl border-2 border-[var(--ep-gold)] bg-gradient-to-br from-amber-50 to-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-xs uppercase text-[var(--ep-navy-muted)]">{po5.hciLink.label}</div>
            <div className="text-3xl font-bold tabular-nums text-[var(--ep-navy)]">
              {po5.hciLink.current.toLocaleString()} / {po5.hciLink.goal.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase text-[var(--ep-navy-muted)]">Founding leaders by {po5.foundingLeaders.deadline}</div>
            <div className="text-3xl font-bold tabular-nums text-[var(--ep-navy)]">
              {po5.foundingLeaders.current} / {po5.foundingLeaders.goal}
            </div>
          </div>
        </div>
      </div>

      <div className="my-6 ep-stat-grid">
        {po5.headlineMetrics.map((m) => (
          <div key={m.id} className="ep-stat">
            <div className="ep-stat-value">{m.current.toLocaleString()}</div>
            <div className="ep-stat-label">{m.label} (goal {m.goal.toLocaleString()})</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function DirectDemocracyLeadershipPanel() {
  const dd = getDirectDemocracyLeadership() as {
    title: string;
    subtitle: string;
    integrationSurfaces: string[];
    tracking: Array<{ id: string; label: string; goal: number; current: number; owner: string | null }>;
    weeklyDeliverable: string;
    publicResourceCenter: string;
  };

  return (
    <section>
      <Link href="/election-plan/direct-democracy" className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
        ← Direct Democracy
      </Link>
      <div className="mt-2">
        <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">{dd.title}</h1>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{dd.subtitle}</p>
      </div>

      <p className="my-4 text-sm">
        <strong>Weekly deliverable:</strong> {dd.weeklyDeliverable}
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        {dd.integrationSurfaces.map((s) => (
          <span key={s} className="rounded-full border border-[var(--ep-border)] px-2 py-0.5 text-xs font-semibold">
            {s}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto ep-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--ep-border)] text-left text-xs uppercase text-[var(--ep-navy-muted)]">
              <th className="py-2 pr-3">Track</th>
              <th className="py-2 pr-3">Current</th>
              <th className="py-2 pr-3">Goal</th>
              <th className="py-2">Owner</th>
            </tr>
          </thead>
          <tbody>
            {dd.tracking.map((row) => (
              <tr key={row.id} className={`border-b border-[var(--ep-border)] last:border-0 ${!row.owner ? "bg-red-50" : ""}`}>
                <td className="py-2 pr-3 font-medium">{row.label}</td>
                <td className="py-2 pr-3 tabular-nums">{row.current}</td>
                <td className="py-2 pr-3 tabular-nums">{row.goal}</td>
                <td className="py-2">{row.owner ?? "TBD"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function SearcyCountyTrustPilotPanel() {
  const pilot = getSearcyCountyTrustPilot() as {
    title: string;
    subtitle: string;
    doctrine: string;
    winCondition: { label: string; targetVotes: number; basis: string };
    replicationCounties: string[];
    goals: Array<{ id: string; label: string; target: number; completed: number; owner: string | null }>;
    milestones: Array<{ date: string; label: string }>;
    linkedSurfaces: Array<{ label: string; href: string }>;
  };

  return (
    <section>
      <Link href="/election-plan/movement-infrastructure/trust-network" className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
        ← Trust Network
      </Link>
      <div className="mt-2">
        <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">{pilot.title}</h1>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{pilot.subtitle}</p>
        <p className="mt-2 text-sm italic">{pilot.doctrine}</p>
      </div>

      <div className="my-6 ep-card border-2 border-[var(--ep-gold)]">
        <h2 className="font-heading font-bold">{pilot.winCondition.label}</h2>
        <p className="mt-1 text-2xl font-bold tabular-nums">{pilot.winCondition.targetVotes.toLocaleString()} votes</p>
        <p className="text-sm text-[var(--ep-navy-muted)]">{pilot.winCondition.basis}</p>
      </div>

      <div className="mb-6 ep-card">
        <h2 className="font-heading font-bold">Replication template counties</h2>
        <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{pilot.replicationCounties.join(" · ")}</p>
      </div>

      <div className="overflow-x-auto ep-card mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--ep-border)] text-left text-xs uppercase text-[var(--ep-navy-muted)]">
              <th className="py-2 pr-3">Goal</th>
              <th className="py-2 pr-3">Progress</th>
              <th className="py-2">Owner</th>
            </tr>
          </thead>
          <tbody>
            {pilot.goals.map((g) => (
              <tr key={g.id} className={`border-b border-[var(--ep-border)] last:border-0 ${!g.owner ? "bg-red-50" : ""}`}>
                <td className="py-2 pr-3 font-medium">{g.label}</td>
                <td className="py-2 pr-3 tabular-nums">{g.completed} / {g.target}</td>
                <td className="py-2">{g.owner ?? "TBD"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-2">
        {pilot.linkedSurfaces.map((l) => (
          <Link key={l.href} href={l.href} className="rounded-full border border-[var(--ep-border)] px-3 py-1 text-xs font-semibold hover:bg-[var(--ep-cream)]">
            {l.label} →
          </Link>
        ))}
      </div>
    </section>
  );
}
