import Link from "next/link";

import { PowerOf5DashboardPanel } from "@/components/power-of-5/PowerOf5DashboardPanel";
import { buildVolunteerLeaderPowerOf5Context } from "@/lib/volunteers/build-leader-power-of-5";
import {
  resolveLeaderCampaignPins,
  resolveLeaderPersonalLinks,
} from "@/lib/volunteers/resolve-leader-links";
import { getEffectiveTeamLanes } from "@/lib/volunteers/leader-roster";
import { VOLUNTEER_TEAM_LANES } from "@/lib/volunteers/types";
import type { VolunteerLeader } from "@/lib/volunteers/types";

function laneLabel(id: string): string {
  return VOLUNTEER_TEAM_LANES.find((l) => l.id === id)?.label ?? id;
}

type Props = {
  leader: VolunteerLeader;
};

export function VolunteerLeaderDashboardView({ leader }: Props) {
  const areaLinks = resolveLeaderPersonalLinks(leader);
  const campaignPins = resolveLeaderCampaignPins(leader);
  const po5 = buildVolunteerLeaderPowerOf5Context(leader);

  return (
    <div className="ep-chapter-body px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-10">
        <section>
          <div className="ep-classification">Sunday starter · personalizes over time</div>
          <h2 className="mt-3 font-heading text-3xl font-bold text-[var(--ep-navy)]">Your workbench</h2>
          {leader.notes ? (
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--ep-navy-muted)]">{leader.notes}</p>
          ) : null}
        </section>

        <section className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-5 shadow-sm">
          <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Team lanes</h3>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">Pick up work in the lanes you own — more lanes unlock as we grow.</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {getEffectiveTeamLanes(leader).map((lane) => (
              <li
                key={lane}
                className="rounded-full border border-[var(--ep-gold)]/40 bg-[var(--ep-cream)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--ep-navy)]"
              >
                {laneLabel(lane)}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">My areas</h3>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
            Drill into county playbooks, city workbenches, and program hubs — same Election Plan surfaces, your geography.
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {areaLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-xl border border-[var(--ep-navy)]/10 bg-white p-4 shadow-sm transition hover:border-[var(--ep-gold)] hover:shadow-md"
                >
                  <p className="font-semibold text-[var(--ep-navy)]">{link.label}</p>
                  {link.description ? (
                    <p className="mt-1 text-xs leading-relaxed text-[var(--ep-navy-muted)]">{link.description}</p>
                  ) : (
                    <p className="mt-1 text-xs text-[var(--ep-blue)]">Open in Election Plan →</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <PowerOf5DashboardPanel
          overline="Participant tools"
          title="Power of 5"
          impactExplanation={po5.impactExplanation}
          intro={po5.intro}
          items={po5.kpiItems}
          pipelineVariant="full"
          className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-5 shadow-sm"
        />

        <section className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-5 shadow-sm">
          <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">My Five (starter)</h3>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
            Demo roster — synthetic names only. Replace with real relational contacts as you log conversations.
          </p>
          <ul className="mt-4 divide-y divide-[var(--ep-navy)]/10">
            {po5.personalDemo.myFive.map((member) => (
              <li key={member.id} className="flex flex-wrap items-start justify-between gap-2 py-3">
                <div>
                  <p className="font-semibold text-[var(--ep-navy)]">{member.displayName}</p>
                  <p className="text-xs text-[var(--ep-navy-muted)]">{member.category}</p>
                  <p className="mt-1 text-sm text-[var(--ep-navy)]/80">{member.lastTouchLabel}</p>
                </div>
                <span className="rounded-full bg-[var(--ep-cream)] px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--ep-navy)]">
                  {member.status}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/onboarding/power-of-5" className="ep-btn ep-btn-primary ep-btn-sm">
              Power of 5 walkthrough
            </Link>
            <Link href="/election-plan/operators/leader-dashboard" className="ep-btn ep-btn-ghost ep-btn-sm">
              Leader dashboard
            </Link>
            <Link href="/election-plan/operators/leaders/me" className="ep-btn ep-btn-ghost ep-btn-sm">
              My workbench
            </Link>
          </div>
        </section>

        <section>
          <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Campaign pins</h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {campaignPins.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-lg border border-dashed border-[var(--ep-navy)]/20 bg-[var(--ep-cream)]/50 p-3 text-sm"
                >
                  <span className="font-semibold text-[var(--ep-navy)]">{link.label}</span>
                  {link.description ? (
                    <span className="mt-1 block text-xs text-[var(--ep-navy-muted)]">{link.description}</span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
