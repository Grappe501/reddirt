import Link from "next/link";

import { getVolunteerLeaderRoster, countsInFieldLeaderRoster, getEffectiveTeamLanes } from "@/lib/volunteers/leader-roster";
import { leaderWorkbenchHref } from "@/lib/volunteers/build-leader-workbench-v2";
import { VOLUNTEER_TEAM_LANES } from "@/lib/volunteers/types";

function laneLabel(id: string): string {
  return VOLUNTEER_TEAM_LANES.find((l) => l.id === id)?.label ?? id;
}

export function ElectionPlanOperatorsHubPanel() {
  const roster = getVolunteerLeaderRoster();
  const fieldCount = roster.filter(countsInFieldLeaderRoster).length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Link
        href="/election-plan/operators/volunteer-intake"
        className="rounded-xl border border-[var(--ep-gold)]/50 bg-white p-6 shadow-sm transition hover:border-[var(--ep-gold)] hover:shadow-md"
      >
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">Intake · activation</p>
        <h2 className="mt-2 font-heading text-xl font-bold text-[var(--ep-navy)]">Volunteer intake queue</h2>
        <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
          Public form → review → placement → workbench unlock — shared with Volunteer Manager.
        </p>
      </Link>

      <Link
        href="/election-plan/operators/comms-command"
        className="rounded-xl border border-[var(--ep-gold)]/50 bg-white p-6 shadow-sm transition hover:border-[var(--ep-gold)] hover:shadow-md"
      >
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">Comms · editorial</p>
        <h2 className="mt-2 font-heading text-xl font-bold text-[var(--ep-navy)]">Statewide comms command</h2>
        <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
          Editorial review, event alignment, email triage, and county comms coverage — Leann + comms leads.
        </p>
      </Link>

      <Link
        href="/election-plan/operators/voter-registration"
        className="rounded-xl border border-[var(--ep-gold)]/50 bg-white p-6 shadow-sm transition hover:border-[var(--ep-gold)] hover:shadow-md"
      >
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">VR · registration</p>
        <h2 className="mt-2 font-heading text-xl font-bold text-[var(--ep-navy)]">Voter registration command</h2>
        <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
          Registration intake, drive cadence, Help 10 reporting, and county goals — Shannie + VR lane leads.
        </p>
      </Link>

      <Link
        href="/election-plan/operators/events-command"
        className="rounded-xl border border-[var(--ep-gold)]/50 bg-white p-6 shadow-sm transition hover:border-[var(--ep-gold)] hover:shadow-md"
      >
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">Events · Mobilize</p>
        <h2 className="mt-2 font-heading text-xl font-bold text-[var(--ep-navy)]">Events & Mobilize command</h2>
        <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
          Upcoming stops, Mobilize gaps, promotion readiness, and post-event closeout — John + events lane leads.
        </p>
      </Link>

      <Link
        href="/election-plan/operators/coalition-command"
        className="rounded-xl border border-[var(--ep-gold)]/50 bg-white p-6 shadow-sm transition hover:border-[var(--ep-gold)] hover:shadow-md"
      >
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">Coalition · partners</p>
        <h2 className="mt-2 font-heading text-xl font-bold text-[var(--ep-navy)]">Coalition lane rollup</h2>
        <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
          Twelve workbenches — ownership, readiness, partner intake, and liaison roster — Lela + coalition leads.
        </p>
      </Link>

      <Link
        href="/election-plan/operators/leader-dashboard"
        className="rounded-xl border border-[var(--ep-gold)]/50 bg-white p-6 shadow-sm transition hover:border-[var(--ep-gold)] hover:shadow-md"
      >
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">Po5 · team health</p>
        <h2 className="mt-2 font-heading text-xl font-bold text-[var(--ep-navy)]">Leader dashboard</h2>
        <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
          Live My Five, follow-ups, and team health per leader — statewide Po5 gaps for command access.
        </p>
      </Link>

      <Link
        href="/election-plan/operators/leaders"
        className="rounded-xl border border-[var(--ep-gold)]/50 bg-white p-6 shadow-sm transition hover:border-[var(--ep-gold)] hover:shadow-md"
      >
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">v3.4 · Leader workbenches</p>
        <h2 className="mt-2 font-heading text-xl font-bold text-[var(--ep-navy)]">Volunteer leaders</h2>
        <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
          {roster.length} personal command surfaces — lane drill-downs, My Five + team roster, field log, Power of 5.
        </p>
      </Link>

      <Link
        href="/election-plan/operators/leaders/me"
        className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-6 shadow-sm transition hover:border-[var(--ep-navy)]/30 hover:shadow-md"
      >
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-blue)]">Quick entry</p>
        <h2 className="mt-2 font-heading text-xl font-bold text-[var(--ep-navy)]">My workbench</h2>
        <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
          Sign in with your 3-letter code + shared password to land on your personal v3.4 workbench.
        </p>
      </Link>

      <Link
        href="/election-plan/operators/field"
        className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-6 shadow-sm transition hover:border-[var(--ep-navy)]/30 hover:shadow-md"
      >
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Field logging</p>
        <h2 className="mt-2 font-heading text-xl font-bold text-[var(--ep-navy)]">Field operators</h2>
        <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
          3-letter initials whitelist — required before county or city field results can be logged.
        </p>
      </Link>

      <Link
        href="/election-plan/operators/leaders/command"
        className="rounded-xl border border-dashed border-[var(--ep-navy)]/20 bg-[var(--ep-cream)]/60 p-6 sm:col-span-2 lg:col-span-3"
      >
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Command</p>
        <h2 className="mt-2 font-heading text-lg font-bold text-[var(--ep-navy)]">Full roster table</h2>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
          Command staff and {fieldCount} field leaders — full roster, lanes, and login codes.
        </p>
      </Link>
    </div>
  );
}

export function ElectionPlanLeaderRosterGrid() {
  const roster = getVolunteerLeaderRoster();

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {roster.map((leader) => (
        <li key={leader.slug}>
          <Link
            href={leaderWorkbenchHref(leader.slug)}
            className="block h-full rounded-xl border border-[var(--ep-navy)]/10 bg-white p-4 shadow-sm transition hover:border-[var(--ep-gold)] hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold text-[var(--ep-navy)]">{leader.displayName}</p>
              <span className="font-mono text-xs font-bold text-[var(--ep-blue)]">{leader.initials}</span>
            </div>
            <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
              {getEffectiveTeamLanes(leader).map(laneLabel).join(" · ")}
            </p>
            {leader.notes ? (
              <p className="mt-2 line-clamp-2 text-[10px] leading-relaxed text-[var(--ep-navy-muted)]">{leader.notes}</p>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
