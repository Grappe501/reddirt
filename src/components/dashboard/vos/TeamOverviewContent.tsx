import Link from "next/link";

import {
  MOCK_ANNOUNCEMENTS,
  MOCK_CAMPAIGN_ALERTS,
  MOCK_PRIORITY_ACTIONS,
  MOCK_SHARED_FILES,
  MOCK_TEAM_MESSAGES,
  UNIVERSAL_DAILY_TASK,
} from "@/lib/dashboard/mock-data";
import { deriveTeamLifecycleStatus } from "@/lib/dashboard/invitation-privacy";
import type { DownstreamTeamNode, Team, VolunteerRole } from "@/types/dashboard";
import { TeamBuildPanel } from "@/components/dashboard/vos/TeamBuildPanel";
import { DashboardDisclosure } from "@/components/dashboard/vos/DashboardDisclosure";
import { TeamFieldOperatingSystemOverview } from "@/components/dashboard/vos/TeamFieldOperatingSystemPanels";
import { VosCommunicationHub } from "@/components/dashboard/vos/VosCommunicationHub";
import { VosDailyUniversalTaskCard } from "@/components/dashboard/vos/VosDailyUniversalTaskCard";
import { VosKpiSummary } from "@/components/dashboard/vos/VosKpiSummary";
import { VosResourceShortcuts } from "@/components/dashboard/vos/VosResourceShortcuts";
import { VosMaturityTaskDeck } from "@/components/dashboard/vos/VosMaturityTaskDeck";
import { TeamDownstreamTree } from "@/components/dashboard/vos/TeamDownstreamTree";
import { TeamRosterPanel } from "@/components/dashboard/vos/TeamRosterPanel";
import { KellyAccentCutout } from "@/components/dashboard/vos/KellyAccentCutout";
import { KELLY_ACCENT_TEAM_OVERVIEW } from "@/lib/campaign-assets";

function hasCoreTriad(members: Team["members"]): boolean {
  const s = new Set(members.map((m) => m.role));
  return s.has("events") && s.has("social-media") && s.has("power-of-5");
}

function lifecycleBadgeClass(status: string): string {
  switch (status) {
    case "active":
      return "border-kelly-success/40 bg-kelly-success/[0.12] text-kelly-deep";
    case "expanding":
      return "border-kelly-blue/35 bg-kelly-blue/[0.08] text-kelly-deep";
    case "building":
      return "border-kelly-gold/45 bg-kelly-gold/[0.12] text-kelly-deep";
    case "dormant":
    case "archived":
      return "border-kelly-text/20 bg-kelly-text/[0.06] text-kelly-text/80";
    default:
      return "border-kelly-text/15 bg-kelly-fog/50 text-kelly-deep";
  }
}

export function TeamOverviewContent({
  team,
  teamSlug,
  downstreamRoot,
  viewerUserId,
  viewerMemberId,
  viewerIsCampaignAdmin,
  openRoles,
  signupSuggestions = [],
}: {
  team: Team;
  teamSlug: string;
  downstreamRoot: DownstreamTeamNode;
  viewerUserId: string | null;
  /** Same as `viewerUserId` for DB teams; mock teams may use `?as=` vol id. */
  viewerMemberId: string | null;
  /** Demo: `?staff=1` or team admin on DB-backed teams. */
  viewerIsCampaignAdmin: boolean;
  openRoles: VolunteerRole[];
  signupSuggestions?: { id: string; displayLabel: string }[];
}) {
  const displayLifecycle =
    team.lifecycleStatus ??
    deriveTeamLifecycleStatus({
      memberCount: team.members.length,
      hasCoreTriad: hasCoreTriad(team.members),
      downstreamLaunched: team.downstreamTeamIds.length,
    });
  const messagesHref = `/dashboard/team/${teamSlug}/messages`;
  const p5 = team.powerOfFiveSummary;
  const nextOutreach = team.monthlyPrograms?.[0]?.title ?? team.upcomingEvents[0]?.title;
  const fos = team.fieldOperatingSystem;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 font-body text-[11px] font-bold uppercase tracking-wide ${lifecycleBadgeClass(displayLifecycle)}`}
        >
          Team status · {displayLifecycle}
        </span>
        {!hasCoreTriad(team.members) ? (
          <span className="font-body text-xs text-kelly-text/70">
            Building: fill Events, Social, and Power of 5 / VR lanes to reach active status.
          </span>
        ) : (
          <span className="font-body text-xs text-kelly-text/70">Active triad — keep downstream teams and P5 networks growing.</span>
        )}
      </div>

      <DashboardDisclosure summary="Field encouragement — tap to read" className="md:scroll-mt-4">
        <section className="rounded-2xl border border-kelly-gold/35 bg-gradient-to-br from-kelly-gold/[0.1] via-white to-kelly-page p-4 ring-1 ring-kelly-navy/8 md:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-body text-[10px] font-bold uppercase tracking-wide text-kelly-deep/85">Field encouragement</p>
              <p className="mt-1 font-body text-sm text-kelly-text/85">
                Your geography matters — steady invites and honest weekly numbers beat one-off hero weeks that burn volunteers out.
              </p>
            </div>
            <KellyAccentCutout src={KELLY_ACCENT_TEAM_OVERVIEW} />
          </div>
        </section>
      </DashboardDisclosure>

      <DashboardDisclosure summary="Who does what — campaign HQ vs volunteers (expand)">
        <section className="rounded-2xl border border-kelly-navy/15 bg-kelly-navy/[0.03] p-6 md:p-8">
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-navy/60">Campaign & volunteer roles</p>
          <h2 className="mt-2 font-heading text-xl font-bold text-kelly-navy">Who does what</h2>
          <p className="mt-4 font-body text-sm leading-relaxed text-kelly-text/85 md:text-base">
            <span className="font-semibold text-kelly-deep">Campaign HQ: </span>
            encourage teams, answer hard questions, publish weekly priorities, approve and guide messaging, support major
            events, and monitor progress toward statewide GOTV readiness.
          </p>
          <p className="mt-3 font-body text-sm leading-relaxed text-kelly-text/85 md:text-base">
            <span className="font-semibold text-kelly-deep">Volunteer system: </span>
            recruit, onboard, train, launch teams, place people downstream, track KPIs, and prepare GOTV capacity — without
            waiting to be micromanaged.
          </p>
        </section>
      </DashboardDisclosure>

      {fos ? (
        <TeamFieldOperatingSystemOverview fos={fos} teamSlug={teamSlug} teamDisplayName={team.displayName} team={team} />
      ) : null}

      {p5 ? (
        <section className="rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-text/50">Power of 5 · snapshot</p>
              <h3 className="mt-2 font-heading text-lg font-bold text-kelly-navy">Relational organizing & voter registration</h3>
            </div>
            <Link
              href={`/dashboard/team/${teamSlug}/power-of-5`}
              className="font-body text-xs font-semibold text-kelly-blue underline hover:text-kelly-navy"
            >
              Open full P5 / VR →
            </Link>
          </div>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-kelly-text/10 bg-kelly-fog/40 px-4 py-3">
              <dt className="font-body text-[10px] font-bold uppercase text-kelly-text/50">Registrations tracked</dt>
              <dd className="mt-1 font-mono text-xl font-bold text-kelly-navy">{p5.registrationsCompleted}</dd>
            </div>
            <div className="rounded-xl border border-kelly-text/10 bg-kelly-fog/40 px-4 py-3">
              <dt className="font-body text-[10px] font-bold uppercase text-kelly-text/50">Power of 5 contacts</dt>
              <dd className="mt-1 font-mono text-xl font-bold text-kelly-navy">{p5.contactsTracked}</dd>
            </div>
            <div className="rounded-xl border border-kelly-text/10 bg-kelly-fog/40 px-4 py-3">
              <dt className="font-body text-[10px] font-bold uppercase text-kelly-text/50">Touches logged</dt>
              <dd className="mt-1 font-mono text-xl font-bold text-kelly-navy">{p5.touchesCompleted}</dd>
            </div>
            <div className="rounded-xl border border-kelly-text/10 bg-kelly-fog/40 px-4 py-3">
              <dt className="font-body text-[10px] font-bold uppercase text-kelly-text/50">Next monthly program</dt>
              <dd className="mt-1 font-body text-sm font-semibold text-kelly-deep">{nextOutreach ?? "Schedule in Events"}</dd>
            </div>
          </dl>
          <DashboardDisclosure summary="Coaching notes on this snapshot (expand)">
            <p className="font-body text-xs text-kelly-text/65">
              Detailed cadence lives on the{" "}
              <Link href={`/dashboard/team/${teamSlug}/power-of-5`} className="font-semibold text-kelly-navy underline">
                Power of 5 / VR
              </Link>{" "}
              tab. Turnout goal: ten new registrations per Power of 5 network — quality relationships beat blast messaging.
            </p>
          </DashboardDisclosure>
        </section>
      ) : null}

      <TeamBuildPanel
        team={team}
        openRoles={openRoles}
        viewerMemberId={viewerMemberId}
        viewerIsCampaignAdmin={viewerIsCampaignAdmin}
        viewerUserId={viewerUserId}
        suggestions={signupSuggestions}
      />

      <VosCommunicationHub
        announcements={MOCK_ANNOUNCEMENTS}
        priorityActions={MOCK_PRIORITY_ACTIONS}
        messages={MOCK_TEAM_MESSAGES}
        sharedFiles={MOCK_SHARED_FILES}
        alerts={MOCK_CAMPAIGN_ALERTS}
        compact
        messagesHref={messagesHref}
      />

      <VosDailyUniversalTaskCard task={UNIVERSAL_DAILY_TASK} moreHref={`/dashboard/team/${teamSlug}/training`} />

      <VosMaturityTaskDeck team={team} />

      <VosKpiSummary title={team.isDatabaseBacked ? "Team KPIs" : "Team KPIs (demo seed)"} kpis={team.kpis} cardHref={`/dashboard/team/${teamSlug}/metrics`} />

      <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:gap-8">
        <TeamRosterPanel team={team} />
        <section className="rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-text/50">Upcoming events</p>
              <h3 className="mt-2 font-heading text-lg font-bold text-kelly-navy">On the calendar</h3>
            </div>
            <Link
              href={`/dashboard/team/${teamSlug}/events`}
              className="min-h-[44px] font-body text-xs font-semibold text-kelly-blue underline hover:text-kelly-navy sm:min-h-0"
              title="Open event planner"
            >
              Event planner →
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {team.upcomingEvents.map((e) => (
              <li key={e.id} className="rounded-xl border border-kelly-text/10 bg-kelly-page/80 px-4 py-3">
                <p className="font-heading text-sm font-bold text-kelly-deep">{e.title}</p>
                <p className="mt-1 font-body text-xs text-kelly-text/75">
                  {e.date}
                  {e.location ? ` · ${e.location}` : ""}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-4 font-body text-xs text-kelly-text/60">
            Full pipeline on the{" "}
            <Link href={`/dashboard/team/${teamSlug}/events`} className="font-semibold text-kelly-navy underline hover:text-kelly-blue">
              Events
            </Link>{" "}
            tab.
          </p>
        </section>
      </div>

      <TeamDownstreamTree root={downstreamRoot} currentSlug={teamSlug} />

      <VosResourceShortcuts teamSlug={teamSlug} />
    </div>
  );
}
