import Link from "next/link";

import { CAMPAIGN_CONTACT_EMAIL, CONTACT_URL, getResourceRequestMailtoHref } from "@/lib/campaign-links";
import { buildVosLaneTwentySquareRows } from "@/lib/volunteer-ops/vos-lane-twenty-square";
import type { GotvReadinessBand, Team, TeamFieldOperatingSystem, TeamHealthLevel } from "@/types/dashboard";

import { DashboardDisclosure } from "@/components/dashboard/vos/DashboardDisclosure";
import { TeamGovernanceChecklistsClient } from "@/components/dashboard/vos/TeamGovernanceChecklistsClient";
import { TwentySquareProgress } from "@/components/dashboard/vos/TwentySquareProgress";
import { CopyTextButton } from "@/components/volunteer/CopyTextButton";

function healthBorder(level: TeamHealthLevel): string {
  switch (level) {
    case "green":
      return "border-kelly-success/45 bg-kelly-success/[0.08]";
    case "yellow":
      return "border-kelly-gold/50 bg-kelly-gold/[0.1]";
    case "red":
      return "border-red-300 bg-red-50/[0.55]";
    default:
      return "border-kelly-text/15 bg-kelly-fog/40";
  }
}

function gotvBandClass(band: GotvReadinessBand): string {
  switch (band) {
    case "not-started":
      return "bg-kelly-text/15 text-kelly-deep";
    case "building":
      return "bg-kelly-gold/35 text-kelly-deep";
    case "on-track":
      return "bg-kelly-blue/20 text-kelly-navy";
    case "gotv-ready":
      return "bg-kelly-success/30 text-kelly-deep";
    default:
      return "bg-kelly-fog text-kelly-deep";
  }
}

export function TeamSelfBuildingDoctrineCallout() {
  return (
    <section className="rounded-2xl border border-kelly-navy/20 bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
      <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-navy/55">Self-building field doctrine</p>
      <h2 className="mt-2 font-heading text-xl font-bold text-kelly-navy">Self-Building Team System</h2>
      <p className="mt-3 font-body text-sm leading-relaxed text-kelly-text/85">
        More teams, not bigger teams. Place people where they fit. Train as you grow. The campaign encourages and
        answers hard questions; you recruit, onboard, and get GOTV ready locally.
      </p>
      <ol className="mt-4 list-decimal space-y-2 pl-5 font-body text-sm text-kelly-text/85">
        <li>Start with one person.</li>
        <li>Build to three lanes.</li>
        <li>Stay geographic.</li>
        <li>Keep teams small.</li>
        <li>Launch more teams, not bigger teams.</li>
        <li>Place people where they fit best.</li>
        <li>Train the next team as you build it.</li>
        <li>Report simple numbers every week.</li>
        <li>Escalate questions, not routine work.</li>
        <li>Build toward GOTV readiness.</li>
      </ol>
      <p className="mt-4 font-body text-xs text-kelly-text/65">
        Full write-up in the{" "}
        <Link href="/field-playbook/overview/self-building-team-system" className="font-semibold text-kelly-blue underline">
          field playbook
        </Link>
        .
      </p>
    </section>
  );
}

export function TeamVosLaneTwentySquarePanel({ team, teamSlug }: { team: Team; teamSlug: string }) {
  const rows = buildVosLaneTwentySquareRows(team);
  const base = `/dashboard/team/${teamSlug}`;

  const drill = (id: string): string => {
    switch (id) {
      case "lane-social":
        return `${base}/social-media`;
      case "lane-events":
        return `${base}/events`;
      case "lane-p5vr":
        return `${base}/power-of-5`;
      case "lane-youth":
        return `${base}/youth-outreach`;
      case "lane-womens":
        return `${base}/metrics`;
      case "lane-community":
        return `${base}/resources`;
      case "lane-gotv":
        return `${base}/metrics`;
      default:
        return base;
    }
  };

  return (
    <section className="rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-text/55">Lane momentum · 20-square</p>
          <h2 className="mt-2 font-heading text-xl font-bold text-kelly-navy">Triad and outreach lanes</h2>
        </div>
        <Link
          href={`${base}/metrics`}
          className="font-body text-xs font-semibold text-kelly-blue underline hover:text-kelly-navy"
          title="Full KPI breakdown"
        >
          Metrics →
        </Link>
      </div>
      <p className="mt-2 font-body text-sm text-kelly-text/75">
        Tap a lane to open its tab. Demo math blends GOTV categories with Youth averages until live telemetry lands per lane.
      </p>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {rows.map((r) => (
          <Link
            key={r.id}
            href={drill(r.id)}
            className="block rounded-xl border border-kelly-text/10 bg-kelly-page/50 p-4 transition hover:border-kelly-navy/25 hover:bg-white"
          >
            <TwentySquareProgress label={r.label} percent={r.percent} />
          </Link>
        ))}
      </div>
      {team.youthOutreach ? (
        <p className="mt-6 font-body text-xs text-kelly-text/65">
          Youth detail:{" "}
          <Link href={`/dashboard/team/${team.slug}/youth-outreach`} className="font-semibold text-kelly-blue underline">
            Youth (P5/VR) tab
          </Link>
          .
        </p>
      ) : null}
    </section>
  );
}

export function TeamHealthIndicators({ fos }: { fos: TeamFieldOperatingSystem }) {
  const { health } = fos;
  return (
    <section className={`rounded-2xl border-2 p-5 md:p-6 ${healthBorder(health.level)}`}>
      <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-text/55">Team health</p>
      <h2 className="mt-2 font-heading text-lg font-bold text-kelly-navy">{health.headline}</h2>
      <DashboardDisclosure summary="How to read team health colors" className="mt-2 border-kelly-text/15 bg-white/50 shadow-none">
        <p className="font-body text-xs text-kelly-text/75">
          Green means moving well · Yellow means needs attention · Red means needs support. Signals update from your
          dashboard activity — not a performance review.
        </p>
      </DashboardDisclosure>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {health.signals.map((s) => (
          <li
            key={s.label}
            className={`rounded-lg border px-3 py-2 font-body text-xs ${
              s.ok ? "border-kelly-success/35 bg-white/80 text-kelly-deep" : "border-kelly-text/20 bg-white/90 text-kelly-deep"
            }`}
          >
            <span className="mr-1 font-bold">{s.ok ? "✓" : "○"}</span>
            {s.label}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function TeamExpansionLadderPanel({ fos }: { fos: TeamFieldOperatingSystem }) {
  return (
    <section className="rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
      <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-text/50">Expansion ladder</p>
      <h2 className="mt-2 font-heading text-xl font-bold text-kelly-navy">From solo starter to GOTV-ready unit</h2>
      <p className="mt-2 font-body text-sm text-kelly-text/75">
        Current focus: stage {fos.currentFocusOrder}. Small actions, statewide impact — build the next team.
      </p>
      <ol className="mt-6 space-y-4">
        {fos.expansionLadder.map((st) => (
          <li
            key={st.order}
            className={`rounded-xl border px-4 py-3 ${
              st.order === fos.currentFocusOrder && !st.isComplete
                ? "border-kelly-navy/35 bg-kelly-navy/[0.04] ring-1 ring-kelly-navy/15"
                : st.isComplete
                  ? "border-kelly-success/30 bg-kelly-success/[0.06]"
                  : "border-kelly-text/10 bg-kelly-page/80"
            }`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-heading text-sm font-bold text-kelly-navy">
                {st.order}. {st.title}
              </p>
              <span className="font-mono text-[11px] text-kelly-text/60">{st.progressPercent}% · progress</span>
            </div>
            <p className="mt-1 font-body text-xs text-kelly-text/70">
              <span className="font-semibold text-kelly-deep">Requirements: </span>
              {st.requirements}
            </p>
            <p className="mt-2 font-body text-xs text-kelly-text/85">
              <span className="font-semibold text-kelly-navy">Next action: </span>
              {st.nextAction}
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-kelly-text/10">
              <div className="h-full bg-kelly-navy/70" style={{ width: `${st.progressPercent}%` }} />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function TeamGotvReadinessPanel({ fos }: { fos: TeamFieldOperatingSystem }) {
  const { gotvReadiness: g } = fos;
  return (
    <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page/80 p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-text/50">GOTV readiness score</p>
          <h2 className="mt-2 font-heading text-xl font-bold text-kelly-navy">Target: get GOTV ready</h2>
          <p className="mt-2 font-body text-sm text-kelly-text/75">
            Composite {g.compositeScore}% · categories are coaching tools, not grades.
          </p>
        </div>
        <span className={`rounded-full px-4 py-1.5 font-body text-xs font-bold ${gotvBandClass(g.band)}`}>{g.bandLabel}</span>
      </div>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {g.categories.map((c) => (
          <li key={c.id} className="rounded-xl border border-kelly-text/10 bg-white px-4 py-3 shadow-sm">
            <p className="font-body text-[10px] font-bold uppercase text-kelly-text/50">{c.label}</p>
            <p className="mt-1 font-mono text-lg font-bold text-kelly-navy">{c.score}%</p>
            <p className="mt-1 font-body text-[11px] text-kelly-text/70">{c.detail}</p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-kelly-text/10">
              <div className="h-full bg-kelly-blue/60" style={{ width: `${c.score}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function goalRow(label: string, current: number, target: number) {
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  return (
    <div key={label} className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
      <div className="flex justify-between gap-2 font-body text-[11px] text-kelly-text/80">
        <span>{label}</span>
        <span className="font-mono font-semibold text-kelly-navy">
          {current.toLocaleString()} / {target.toLocaleString()}
        </span>
      </div>
      <div className="mt-1 h-1 overflow-hidden rounded-full bg-kelly-text/10">
        <div className="h-full bg-kelly-gold/70" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function StatewideGoalsContributionPanel({
  fos,
  teamDisplayName,
}: {
  fos: TeamFieldOperatingSystem;
  teamDisplayName: string;
}) {
  const { statewideGoals: s } = fos;
  return (
    <section className="rounded-2xl border border-kelly-navy/15 bg-kelly-navy/[0.03] p-6 md:p-8">
      <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-navy/55">Statewide volunteer goals · demo totals</p>
      <h2 className="mt-2 font-heading text-xl font-bold text-kelly-navy">Your contribution to the statewide goal</h2>
      <p className="mt-2 font-body text-sm text-kelly-text/80">
        {teamDisplayName} — mock statewide counters until live federation sync. Every team builds another team.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {goalRow("County teams launched", s.countyTeamsLaunched.current, s.countyTeamsLaunched.target)}
        {goalRow("City teams launched", s.cityTeamsLaunched.current, s.cityTeamsLaunched.target)}
        {goalRow("Precinct teams launched", s.precinctTeamsLaunched.current, s.precinctTeamsLaunched.target)}
        {goalRow("Neighborhood teams launched", s.neighborhoodTeamsLaunched.current, s.neighborhoodTeamsLaunched.target)}
        {goalRow("Volunteers onboarded", s.totalVolunteersOnboarded.current, s.totalVolunteersOnboarded.target)}
        {goalRow("Power of 5 contacts (est.)", s.totalPowerOfFiveContacts.current, s.totalPowerOfFiveContacts.target)}
        {goalRow("New registrations tracked", s.totalNewRegistrations.current, s.totalNewRegistrations.target)}
        {goalRow("Downstream teams", s.totalDownstreamTeams.current, s.totalDownstreamTeams.target)}
        {goalRow("GOTV-ready teams", s.gotvReadyTeams.current, s.gotvReadyTeams.target)}
      </div>
      <div className="mt-6 rounded-xl border border-kelly-text/10 bg-white p-4">
        <p className="font-body text-[10px] font-bold uppercase text-kelly-text/50">This triad’s share</p>
        <ul className="mt-3 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
          {fos.statewideContribution.lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function WeeklyCampaignBriefingExpanded({
  fos,
  teamSlug,
}: {
  fos: TeamFieldOperatingSystem;
  teamSlug: string;
}) {
  const b = fos.briefing;
  const trainingHref = b.trainingResourceHref || `/dashboard/team/${teamSlug}/training`;
  return (
    <section className="rounded-2xl border border-kelly-navy/15 bg-kelly-navy/[0.03] p-6 md:p-8">
      <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-navy/60">Weekly campaign briefing</p>
      <h2 className="mt-2 font-heading text-xl font-bold text-kelly-navy">What matters this week</h2>
      <p className="mt-4 font-body text-sm leading-relaxed text-kelly-text/85 md:text-base">{b.narrative}</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <p className="font-body text-[10px] font-bold uppercase text-kelly-text/50">This week’s focus</p>
          <p className="mt-2 font-body text-sm text-kelly-text/85">{b.weekFocus}</p>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <p className="font-body text-[10px] font-bold uppercase text-kelly-text/50">Priority social post</p>
          <p className="mt-2 font-body text-sm text-kelly-text/85">{b.prioritySocialPost}</p>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <p className="font-body text-[10px] font-bold uppercase text-kelly-text/50">Priority event need</p>
          <p className="mt-2 font-body text-sm text-kelly-text/85">{b.priorityEventNeed}</p>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <p className="font-body text-[10px] font-bold uppercase text-kelly-text/50">Priority P5 / VR ask</p>
          <p className="mt-2 font-body text-sm text-kelly-text/85">{b.priorityP5VrAsk}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-kelly-text/10 bg-white p-4">
        <div className="min-w-0 flex-1">
          <p className="font-body text-[10px] font-bold uppercase text-kelly-text/50">Training resource of the week</p>
          <p className="mt-1 font-body text-sm font-semibold text-kelly-navy">{b.trainingResourceOfWeek}</p>
        </div>
        <Link href={trainingHref} className="rounded-lg bg-kelly-navy px-3 py-2 font-body text-xs font-semibold text-white hover:bg-kelly-deep">
          Open training
        </Link>
        <Link href={`/dashboard/team/${teamSlug}/training`} className="rounded-lg border border-kelly-navy/25 px-3 py-2 font-body text-xs font-semibold text-kelly-navy hover:bg-kelly-fog">
          All modules
        </Link>
      </div>

      <div className="mt-4 rounded-xl border border-kelly-text/10 bg-kelly-fog/40 p-4">
        <p className="font-body text-[10px] font-bold uppercase text-kelly-text/50">Questions to send upstream</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
          {b.questionsForUpstream.map((q) => (
            <li key={q} className="flex flex-wrap items-start justify-between gap-2">
              <span>{q}</span>
              <CopyTextButton text={q} label="Copy" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function AskCampaignPanel({ teamDisplayName, teamSlug }: { teamDisplayName: string; teamSlug: string }) {
  const to = CAMPAIGN_CONTACT_EMAIL.replace(/^mailto:/i, "");
  const subject = encodeURIComponent(`Field support · ${teamDisplayName}`);
  const body = encodeURIComponent(
    `Team: ${teamDisplayName}\nDashboard slug: ${teamSlug}\n\nWhat we need (question, event approval, messaging, placement, conflict, tech):\n\n`,
  );
  const mailto = `mailto:${to}?subject=${subject}&body=${body}`;
  return (
    <section className="rounded-2xl border border-kelly-blue/25 bg-kelly-blue/[0.06] p-5 md:p-6">
      <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-navy/55">Ask the Campaign</p>
      <h2 className="mt-2 font-heading text-lg font-bold text-kelly-navy">Escalate when you’re stuck</h2>
      <p className="mt-2 font-body text-sm text-kelly-text/85">
        Email HQ for policy, approvals, messaging review, placement dead-ends, serious conflict, or broken tools. Routine
        huddles stay local.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={mailto}
          className="min-h-[44px] rounded-lg bg-kelly-navy px-4 py-2.5 font-body text-xs font-semibold text-white hover:bg-kelly-deep"
        >
          Email campaign support
        </a>
        <a
          href={getResourceRequestMailtoHref()}
          className="min-h-[44px] rounded-lg border border-kelly-navy/25 bg-white px-4 py-2.5 font-body text-xs font-semibold text-kelly-navy hover:bg-kelly-fog"
        >
          Request a printed resource
        </a>
        <a
          href={CONTACT_URL}
          className="min-h-[44px] rounded-lg border border-kelly-navy/25 bg-white px-4 py-2.5 font-body text-xs font-semibold text-kelly-navy hover:bg-kelly-fog"
        >
          Campaign contact page
        </a>
      </div>
      <DashboardDisclosure summary="When to use this path (examples)" className="mt-4 border-kelly-text/15 bg-white/80 shadow-none">
        <p className="font-body text-sm text-kelly-text/85">
          Use this path when you cannot answer locally: policy or legal questions, event approvals, messaging you are unsure
          about, placement dead-ends, interpersonal conflict, or broken tools. Routine huddles and weekly numbers stay with
          your triad.
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/80">
          <li>Questions you cannot answer with the playbook or messaging library</li>
          <li>Event approval or major visibility</li>
          <li>Messaging review</li>
          <li>Volunteer placement problems</li>
          <li>Conflict or personality issues that block the team</li>
          <li>Technical help with dashboard access</li>
        </ul>
      </DashboardDisclosure>
    </section>
  );
}

export function TeamFieldGovernanceBlock({
  fos,
  teamSlug,
}: {
  fos: TeamFieldOperatingSystem;
  teamSlug: string;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <TeamGovernanceChecklistsClient
        teamSlug={teamSlug}
        weeklyTitle="Weekly self-governance check"
        monthlyTitle="Monthly self-governance check"
        weeklyItems={fos.governanceWeekly}
        monthlyItems={fos.governanceMonthly}
      />
      <TeamGovernanceChecklistsClient
        teamSlug={teamSlug}
        weeklyTitle="When you launch downstream — training responsibility"
        monthlyTitle="Checklist for the new team"
        weeklyItems={fos.downstreamTrainingChecklist}
        monthlyItems={[]}
        variant="downstream"
      />
    </div>
  );
}

export function TeamFieldOperatingSystemOverview({
  fos,
  teamSlug,
  teamDisplayName,
  team,
}: {
  fos: TeamFieldOperatingSystem;
  teamSlug: string;
  teamDisplayName: string;
  /** When set, renders the 20-square lane grid from team + GOTV seed. */
  team?: Team;
}) {
  const briefTeaser =
    fos.briefing.weekFocus.length > 80 ? `${fos.briefing.weekFocus.slice(0, 80).trim()}…` : fos.briefing.weekFocus;

  return (
    <div className="space-y-4 md:space-y-5">
      <TeamHealthIndicators fos={fos} />
      {team ? <TeamVosLaneTwentySquarePanel team={team} teamSlug={teamSlug} /> : null}

      <DashboardDisclosure summary="Self-building team doctrine · learn more">
        <TeamSelfBuildingDoctrineCallout />
      </DashboardDisclosure>

      <DashboardDisclosure summary={`Weekly briefing · ${briefTeaser}`}>
        <WeeklyCampaignBriefingExpanded fos={fos} teamSlug={teamSlug} />
      </DashboardDisclosure>

      <DashboardDisclosure summary={`Expansion ladder · now focused on stage ${fos.currentFocusOrder}`}>
        <TeamExpansionLadderPanel fos={fos} />
      </DashboardDisclosure>

      <DashboardDisclosure summary={`GOTV readiness · ${fos.gotvReadiness.compositeScore}% · open for category detail`}>
        <TeamGotvReadinessPanel fos={fos} />
      </DashboardDisclosure>

      <DashboardDisclosure summary="Statewide goals · your team’s share (expand)">
        <StatewideGoalsContributionPanel fos={fos} teamDisplayName={teamDisplayName} />
      </DashboardDisclosure>

      <DashboardDisclosure summary="Governance checklists · weekly self-checks and downstream training">
        <TeamFieldGovernanceBlock fos={fos} teamSlug={teamSlug} />
      </DashboardDisclosure>

      <AskCampaignPanel teamDisplayName={teamDisplayName} teamSlug={teamSlug} />
    </div>
  );
}
