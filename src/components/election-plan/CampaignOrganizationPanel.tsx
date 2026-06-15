import Link from "next/link";

import {
  campaignOrganizationHref,
  getCampaignOrganization,
  getCampaignOrganizationRollup,
  type FunctionalTeam,
} from "@/lib/election-plan/load-campaign-organization";
import {
  leadershipHubHref,
  responsibilityMatrixHref,
  weeklyPacketHref,
} from "@/lib/election-plan/load-phase-18-7b-ownership";
import { academyOnboardingHref } from "@/lib/election-plan/load-volunteer-onboarding";

function TeamStatusBadge({ team }: { team: FunctionalTeam }) {
  if (team.unassigned) {
    return (
      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase text-red-900">
        Owner TBD
      </span>
    );
  }
  if (team.status === "critical") {
    return (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-900">
        Critical
      </span>
    );
  }
  return (
    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-900">
      Active
    </span>
  );
}

export function CampaignOrganizationPanel() {
  const org = getCampaignOrganization();
  const rollup = getCampaignOrganizationRollup();
  const { leadership } = org;

  return (
    <section>
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href={leadershipHubHref()} className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
          ← Leadership hub
        </Link>
      </div>

      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-gold)]">Phase 18.7D</p>
      <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">{org.title}</h1>
      <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{org.subtitle}</p>
      <p className="mt-3 text-sm italic text-[var(--ep-navy-muted)]">{org.doctrine}</p>

      <div className="my-6 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{rollup.assignedTeams}/{rollup.teamCount}</div>
          <div className="ep-stat-label">Teams with named owner</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value text-red-700">{rollup.unassignedTeams}</div>
          <div className="ep-stat-label">Teams need owner</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{rollup.totalOpenPositions}</div>
          <div className="ep-stat-label">Open positions</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{rollup.criticalTeams}</div>
          <div className="ep-stat-label">Critical teams</div>
        </div>
      </div>

      <div className="mb-8 ep-card">
        <h2 className="font-heading font-bold text-[var(--ep-navy)]">Leadership</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {[leadership.candidate, leadership.campaignManager, leadership.operationsDirector].map((role) => (
            <div key={role.title} className="rounded-lg border border-[var(--ep-border)] p-4">
              <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">{role.title}</p>
              <p className="mt-1 font-heading text-lg font-bold text-[var(--ep-navy)]">{role.name}</p>
              <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{role.focus}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading font-bold text-[var(--ep-navy)]">Functional teams</h2>
        <div className="flex flex-wrap gap-2 text-xs">
          <Link href={responsibilityMatrixHref()} className="font-semibold underline">
            Responsibility matrix
          </Link>
          <Link href={weeklyPacketHref()} className="font-semibold underline">
            Weekly packet
          </Link>
          <Link href={academyOnboardingHref()} className="font-semibold underline">
            Volunteer onboarding
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {org.teams.map((team) => (
          <div
            key={team.id}
            className={`ep-card ${team.unassigned ? "border-2 border-red-200 bg-red-50/30" : ""}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <Link href={team.href} className="font-heading text-lg font-bold text-[var(--ep-navy)] hover:underline">
                  {team.name}
                </Link>
                <TeamStatusBadge team={team} />
              </div>
              <div className="text-right text-sm">
                <p>
                  <span className="text-[var(--ep-navy-muted)]">Volunteers:</span>{" "}
                  <strong>{team.currentVolunteers}</strong>
                  <span className="mx-1 text-[var(--ep-navy-muted)]">·</span>
                  <span className="text-[var(--ep-navy-muted)]">Open:</span>{" "}
                  <strong className={team.openPositions > 0 ? "text-red-700" : ""}>{team.openPositions}</strong>
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Owner</p>
                <p className="mt-1 text-sm font-semibold">{team.owner ?? "— TBD"}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Deputy</p>
                <p className="mt-1 text-sm">{team.deputy ?? "—"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Weekly meeting</p>
                <p className="mt-1 text-sm">{team.weeklyMeetingTime}</p>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">What this team does every week</p>
              <p className="mt-1 text-sm font-medium text-[var(--ep-navy)]">{team.weeklyDeliverable}</p>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 text-sm">
              <div>
                <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Monthly goal</p>
                <p className="mt-1 text-[var(--ep-navy-muted)]">{team.monthlyGoal}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Quarter goal</p>
                <p className="mt-1 text-[var(--ep-navy-muted)]">{team.quarterGoal}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 ep-card border border-dashed border-[var(--ep-border)]">
        <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Next build · {org.nextBuild.phase}</p>
        <h3 className="mt-1 font-heading font-bold text-[var(--ep-navy)]">{org.nextBuild.title}</h3>
        <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{org.nextBuild.note}</p>
      </div>
    </section>
  );
}

export function OrganizationSummaryStrip() {
  const rollup = getCampaignOrganizationRollup();
  return (
    <Link
      href={campaignOrganizationHref()}
      className="block ep-card transition hover:ring-2 hover:ring-[var(--ep-gold-soft)]"
    >
      <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">Phase 18.7D · Organization</p>
      <p className="mt-1 font-heading font-bold text-[var(--ep-navy)]">Campaign org chart</p>
      <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
        {rollup.assignedTeams}/{rollup.teamCount} teams owned · {rollup.unassignedTeams} need owner ·{" "}
        {rollup.totalOpenPositions} open positions
      </p>
    </Link>
  );
}
