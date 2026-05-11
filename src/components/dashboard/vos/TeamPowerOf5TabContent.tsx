import Link from "next/link";

import { PowerOf5DashboardPanel } from "@/components/power-of-5/PowerOf5DashboardPanel";
import type { CountyDashboardKpiItem } from "@/lib/campaign-engine/county-dashboards/types";
import { buildTeamPowerOfFiveMemberNetworks, computeTeamP5Rollup } from "@/lib/dashboard/p5-team-networks";
import type { Team } from "@/types/dashboard";

import { P5DownstreamPlacementGuide } from "./P5DownstreamPlacementGuide";
import { P5PlacementQueue } from "./P5PlacementQueue";
import { TeamPowerOfFiveNetworksGrid } from "./TeamPowerOfFiveNetworksGrid";
import { KellyAccentCutout } from "@/components/dashboard/vos/KellyAccentCutout";
import { KELLY_ACCENT_POWER_OF_5 } from "@/lib/campaign-assets";

const COORDINATOR_LINES: string[] = [
  "You are a coach and distributor — not the owner of every relational contact. The Events and Social coordinators each run their own Power of 5 networks while you track honest rollups.",
  "Help each triad member build toward five core contacts and ten registration assists in their own circle.",
  "Use the placement queue to connect new signups to the best existing relationship before anyone overloads a single list.",
  "Route anyone ready for the full volunteer kit to /volunteer (three-person operating triad), separate from casual P5 contacts.",
  "Plan monthly Community Outreach Social Hour + monthly Voter Registration Event; add both to Events when dates are firm.",
];

function teamKpisToCountyItems(team: Team): CountyDashboardKpiItem[] {
  return team.kpis
    .filter((k) => k.id.startsWith("k-t-p5") || k.id === "k-t-monthly-outreach")
    .map((k) => ({
      label: k.label,
      metric: {
        value: k.value,
        source: team.isDatabaseBacked ? ("db" as const) : ("demo" as const),
        note: k.target != null ? `Target ${k.target}` : undefined,
      },
      actionHint: "Log touches in relational contacts; celebrate honest progress.",
    }));
}

export function TeamPowerOf5TabContent({ team, teamSlug }: { team: Team; teamSlug: string }) {
  const items = teamKpisToCountyItems(team);
  const programs = team.monthlyPrograms ?? [];
  const p5 = team.powerOfFiveSummary;
  const targets = team.powerOfFiveTeamTargets;
  const teamContactGoal = targets?.minCoreContacts ?? 15;
  const teamRegGoal = targets?.minRegistrations ?? 30;

  const networks = buildTeamPowerOfFiveMemberNetworks(team);
  const rollup = computeTeamP5Rollup(networks, teamContactGoal, teamRegGoal);

  const placementLeads = team.powerOfFivePlacementLeads ?? [];

  const memberLabel = (id: string) => team.members.find((m) => m.volunteerId === id)?.name ?? id;

  const hasReachGrid = Boolean(team.reachContacts?.length);
  const blend = (fromNetworks: number, summaryVal?: number) => Math.max(fromNetworks, summaryVal ?? 0);

  /**
   * Team banner: prefer relational grid sums when that is the only source; otherwise merge in `powerOfFiveSummary`
   * so HQ rollups stay visible next to per-member columns (demo creek has both).
   */
  const totalContacts =
    !hasReachGrid && team.isDatabaseBacked && p5 ? p5.contactsTracked : blend(rollup.totalContacts, p5?.contactsTracked);
  const totalTouches =
    !hasReachGrid && team.isDatabaseBacked && p5 ? p5.touchesCompleted : blend(rollup.totalTouches, p5?.touchesCompleted);
  const totalRegs =
    !hasReachGrid && team.isDatabaseBacked && p5 ? p5.registrationsCompleted : blend(rollup.totalRegs, p5?.registrationsCompleted);
  const totalVolRef =
    !hasReachGrid && team.isDatabaseBacked && p5 ? p5.volunteersReferred : blend(rollup.totalVolunteerRefs, p5?.volunteersReferred);

  const contactProgressPercent = Math.min(100, Math.round((totalContacts / Math.max(teamContactGoal, 1)) * 100));
  const registrationProgressPercent = Math.min(100, Math.round((totalRegs / Math.max(teamRegGoal, 1)) * 100));

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-kelly-blue/30 bg-kelly-blue/[0.07] p-5 md:p-6">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-kelly-navy/55">Youth Outreach · P5/VR sub-lane</p>
        <p className="mt-2 font-body text-sm text-kelly-text/85">
          Student voter registration, campus triads, and social-led recruitment roll up under the{" "}
          <span className="font-semibold text-kelly-deep">Power of 5 / Voter Registration lead</span>. Open the Youth lane for
          campus mapping, high school and college programs, student team builder, and youth KPIs.
        </p>
        <Link
          href={`/dashboard/team/${teamSlug}/youth-outreach`}
          className="mt-3 inline-flex rounded-lg bg-kelly-navy px-4 py-2 font-body text-xs font-semibold text-white hover:bg-kelly-deep"
        >
          Open Youth Outreach (P5/VR)
        </Link>
      </section>

      <section className="rounded-2xl border border-kelly-navy/20 bg-kelly-navy/[0.04] p-6 md:p-8">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-navy/60">Team rollup</p>
        <h2 className="mt-2 font-heading text-xl font-bold text-kelly-navy">Power of 5 · triad totals</h2>
        <div className="mt-3 flex flex-col gap-3 border-b border-kelly-navy/12 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl font-body text-xs text-kelly-text/78">
            Coach every network — place people where they fit and keep touches relational.
          </p>
          <KellyAccentCutout src={KELLY_ACCENT_POWER_OF_5} />
        </div>
        <p className="mt-2 font-body text-sm text-kelly-text/80">
          Targets: <span className="font-semibold text-kelly-deep">{teamContactGoal}</span> total P5 contacts and{" "}
          <span className="font-semibold text-kelly-deep">{teamRegGoal}</span> voter registrations across all three
          networks. Each coordinator still aims for five contacts and ten registration assists in their own list.
        </p>
        {p5 && !hasReachGrid && team.isDatabaseBacked ? (
          <p className="mt-2 font-body text-xs text-kelly-text/65">
            Per-contact columns will appear when relational rows sync into this workspace; totals reflect the current
            rollup.
          </p>
        ) : null}
        <dl className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-xl border border-kelly-text/10 bg-white/90 px-4 py-3">
            <dt className="font-body text-[10px] font-bold uppercase text-kelly-text/50">Total P5 contacts</dt>
            <dd className="mt-1 font-mono text-2xl font-bold text-kelly-navy">{totalContacts}</dd>
          </div>
          <div className="rounded-xl border border-kelly-text/10 bg-white/90 px-4 py-3">
            <dt className="font-body text-[10px] font-bold uppercase text-kelly-text/50">Total touches</dt>
            <dd className="mt-1 font-mono text-2xl font-bold text-kelly-navy">{totalTouches}</dd>
          </div>
          <div className="rounded-xl border border-kelly-text/10 bg-white/90 px-4 py-3">
            <dt className="font-body text-[10px] font-bold uppercase text-kelly-text/50">Total registrations</dt>
            <dd className="mt-1 font-mono text-2xl font-bold text-kelly-navy">{totalRegs}</dd>
          </div>
          <div className="rounded-xl border border-kelly-text/10 bg-white/90 px-4 py-3">
            <dt className="font-body text-[10px] font-bold uppercase text-kelly-text/50">Volunteer referrals</dt>
            <dd className="mt-1 font-mono text-2xl font-bold text-kelly-navy">{totalVolRef}</dd>
          </div>
          <div className="rounded-xl border border-kelly-text/10 bg-white/90 px-4 py-3">
            <dt className="font-body text-[10px] font-bold uppercase text-kelly-text/50">Members · complete P5 lists</dt>
            <dd className="mt-1 font-mono text-2xl font-bold text-kelly-navy">
              {rollup.membersWithCompleteP5Lists}/{rollup.memberCount}
            </dd>
            <p className="mt-1 font-body text-[11px] text-kelly-text/65">Each list complete at five core contacts.</p>
          </div>
          <div className="rounded-xl border border-kelly-text/10 bg-white/90 px-4 py-3 sm:col-span-2 xl:col-span-1">
            <dt className="font-body text-[10px] font-bold uppercase text-kelly-text/50">Progress toward 30 registrations</dt>
            <dd className="mt-2">
              <div className="flex justify-between font-mono text-sm font-bold text-kelly-deep">
                <span>{totalRegs}</span>
                <span>{teamRegGoal}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-kelly-text/10">
                <div
                  className="h-full rounded-full bg-kelly-navy/80"
                  style={{ width: `${registrationProgressPercent}%` }}
                />
              </div>
            </dd>
          </div>
        </dl>
        <div className="mt-4">
          <p className="font-body text-[10px] font-bold uppercase text-kelly-text/50">Progress toward {teamContactGoal} contacts</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-kelly-text/10">
            <div className="h-full rounded-full bg-kelly-gold/90" style={{ width: `${contactProgressPercent}%` }} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-kelly-blue/25 bg-kelly-blue/[0.04] p-6 md:p-8">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-deep/70">
          Two different “teams”
        </p>
        <h3 className="mt-2 font-heading text-lg font-bold text-kelly-navy">Operating triad vs Power of 5 network</h3>
        <ul className="mt-4 list-disc space-y-2 pl-5 font-body text-sm text-kelly-text/85">
          <li>
            <span className="font-semibold text-kelly-deep">Three-person team</span> — Events, Social, and Power of 5 /
            VR coordinators share this workspace.
          </li>
          <li>
            <span className="font-semibold text-kelly-deep">Three Power of 5 networks</span> — one per coordinator,
            visible together below so the P5/VR lead can coach everyone.
          </li>
          <li>
            If a Power of 5 contact wants to volunteer with the campaign, send them to{" "}
            <Link className="font-semibold text-kelly-blue underline" href="/volunteer">
              /volunteer
            </Link>
            .
          </li>
        </ul>
      </section>

      <PowerOf5DashboardPanel
        overline="Reach-style relational engine"
        title="Power of 5 · voter registration"
        impactExplanation="You are building personal networks, not broadcasting lists. Each volunteer names five people they truly know, earns trust, locks turnout plans, and helps neighbors register — aiming for ten registrations per Power of 5 circle."
        intro="Shared Power of 5 ladder from county dashboards. Underneath, the triad grid lists all three coordinators’ networks side by side."
        items={items}
        showOrganizingPipelines
        activePipelineId="volunteer"
        pipelineVariant="full"
        className="rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-[var(--shadow-soft)] md:p-8"
      />

      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page/80 p-6 shadow-[var(--shadow-soft)] md:p-8">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-text/50">
          Team Power of 5 Networks
        </p>
        <h3 className="mt-2 font-heading text-lg font-bold text-kelly-navy">All three coordinators on one map</h3>
        <p className="mt-2 font-body text-sm text-kelly-text/80">
          Desktop shows three columns (Events · Social · P5/VR). Mobile stacks cards so you can scan each list without
          losing context.
        </p>
        <div className="mt-6">
          <TeamPowerOfFiveNetworksGrid networks={networks} />
        </div>
      </section>

      <section className="rounded-2xl border border-kelly-navy/15 bg-kelly-navy/[0.03] p-6 md:p-8">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-navy/60">P5/VR coordinator</p>
        <h3 className="mt-2 font-heading text-lg font-bold text-kelly-navy">Coach, connect, and track — not solo carrying every relationship</h3>
        <p className="mt-3 font-body text-sm text-kelly-text/85">
          The Power of 5 / VR coordinator helps the Events and Social leads build lists that feel natural to them, watches
          registration math for the whole triad, and routes new people to the right lane — including monthly outreach and VR
          events — without becoming the dumping ground for every name.
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 font-body text-sm text-kelly-text/85">
          {COORDINATOR_LINES.map((line, idx) => (
            <li key={idx}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-kelly-blue/25 bg-kelly-blue/[0.05] p-6 shadow-[var(--shadow-soft)] md:p-8">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">Registration events & polling-place readiness</h3>
        <p className="mt-2 font-body text-sm text-kelly-text/85">
          When Events runs VR-forward tables or outreach socials, use the execution checklist for two-person table discipline, honest
          counting, and post-event handoff — without improvising legal guidance at busy polls.
        </p>
        <p className="mt-3 font-body text-sm">
          <Link href="/field-playbook/roles/p5-vr-event-operations" className="font-semibold text-kelly-blue underline">
            P5 / VR · registration events & polling-place readiness
          </Link>
        </p>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">Goals · personal & team</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-kelly-text/10 bg-kelly-page/80 p-4">
            <p className="font-body text-xs font-bold uppercase text-kelly-text/50">Every volunteer</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
              <li>Five core contacts in your own network column.</li>
              <li>Steady relational touches logged for the team rollup.</li>
              <li>Ten registration assists per network where honest.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-kelly-text/10 bg-kelly-page/80 p-4">
            <p className="font-body text-xs font-bold uppercase text-kelly-text/50">Team targets</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
              <li>{teamContactGoal} total Power of 5 contacts combined.</li>
              <li>{teamRegGoal} total voter registrations tracked.</li>
              <li>Monthly Community Outreach Social Hour + monthly VR event on the calendar.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page/80 p-6 shadow-[var(--shadow-soft)] md:p-8">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">P5 placement · downstream & routing</h3>
        <p className="mt-2 font-body text-sm text-kelly-text/80">
          Route new relational energy responsibly: grow your own list only when there is room; otherwise place people
          downstream, into events, or into /volunteer with a private fit check first.
        </p>
        <div className="mt-6">
          <P5DownstreamPlacementGuide />
        </div>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">Placement queue (mock)</h3>
        <p className="mt-2 font-body text-sm text-kelly-text/80">
          Triad workspace for handoffs. Use copy buttons for campaign-approved email shells — fill bracketed fields with
          real details in your mail client; never paste private voter data into shared logs.
        </p>
        <div className="mt-4">
          <P5PlacementQueue leads={placementLeads} team={team} memberLabel={memberLabel} />
        </div>
        {team.teamInviteUrl || team.teamQrCodeUrl ? (
          <div className="mt-6 rounded-xl border border-dashed border-kelly-text/25 bg-kelly-fog/40 p-4">
            <p className="font-body text-xs font-bold uppercase text-kelly-text/55">Team invite placeholders (this workspace)</p>
            <dl className="mt-2 space-y-2 font-mono text-[11px] text-kelly-deep">
              {team.teamInviteUrl ? (
                <div>
                  <dt className="text-kelly-text/50">teamInviteUrl</dt>
                  <dd className="break-all">{team.teamInviteUrl}</dd>
                </div>
              ) : null}
              {team.teamQrCodeUrl ? (
                <div>
                  <dt className="text-kelly-text/50">teamQrCodeUrl</dt>
                  <dd className="break-all">{team.teamQrCodeUrl}</dd>
                </div>
              ) : null}
            </dl>
            <p className="mt-2 font-body text-[11px] text-kelly-text/60">
              Each downstream triad will get its own join link and QR from HQ. Replace example.invalid hosts in production.
            </p>
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">Monthly P5 / VR programs</h3>
        <p className="mt-2 font-body text-sm text-kelly-text/80">
          Community Outreach Social Hour and the monthly voter registration push should land in the Events system when
          scheduled so RSVPs stay coordinated.
        </p>
        <ul className="mt-4 space-y-3">
          {programs.map((p) => (
            <li key={p.id} className="rounded-xl border border-kelly-text/10 bg-kelly-page/80 px-4 py-3">
              <p className="font-heading text-sm font-bold text-kelly-deep">{p.title}</p>
              <p className="mt-1 font-body text-xs uppercase tracking-wide text-kelly-text/55">{p.cadence}</p>
              {p.planningNote ? <p className="mt-2 font-body text-xs text-kelly-text/70">{p.planningNote}</p> : null}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-lg border border-kelly-navy/25 bg-kelly-navy/[0.05] px-4 py-2 font-body text-xs font-semibold text-kelly-navy hover:bg-kelly-navy/10"
            title="Mock control — will create Events board items when the API is wired"
          >
            Add outreach social hour to events board
          </button>
          <button
            type="button"
            className="rounded-lg border border-kelly-navy/25 bg-kelly-navy/[0.05] px-4 py-2 font-body text-xs font-semibold text-kelly-navy hover:bg-kelly-navy/10"
            title="Mock control — will create Events board items when the API is wired"
          >
            Add voter registration event to events board
          </button>
          <Link
            href={`/dashboard/team/${teamSlug}/events`}
            className="rounded-lg border border-kelly-text/20 px-4 py-2 font-body text-xs font-semibold text-kelly-deep hover:bg-kelly-fog/60"
          >
            Open Events tab
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page/80 p-6 md:p-8">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">Personal Power of 5 checklist</h3>
        <ul className="mt-4 list-decimal space-y-2 pl-6 font-body text-sm text-kelly-text/85">
          <li>Name five core contacts you can coach authentically.</li>
          <li>Schedule weekly touches — log them for the team rollup.</li>
          <li>Track support + turnout mindset without gossiping private details.</li>
          <li>Aim for ten registration assists per network.</li>
          <li>When a friend wants the full volunteer kit, send them to /volunteer.</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-dashed border-kelly-text/25 bg-kelly-fog/40 p-6 md:p-8">
        <h3 className="font-heading text-base font-bold text-kelly-navy">Deep dives</h3>
        <ul className="mt-3 space-y-2 font-body text-sm">
          <li>
            <Link className="font-semibold text-kelly-blue underline" href="/onboarding/power-of-5">
              Interactive Power of 5 onboarding
            </Link>
          </li>
          <li>
            <Link
              className="font-semibold text-kelly-blue underline"
              href="/field-playbook/roles/power-of-five-coordinator"
            >
              Field playbook · Power of 5 coordinator
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
