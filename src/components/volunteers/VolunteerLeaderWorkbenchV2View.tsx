import Link from "next/link";

import { PowerOf5DashboardPanel } from "@/components/power-of-5/PowerOf5DashboardPanel";
import type { LeaderWorkbenchV2Payload } from "@/lib/volunteers/build-leader-workbench-v2";
import { LEADER_WORKBENCH_SECTIONS } from "@/lib/volunteers/leader-workbench-sections";
import {
  resolveLeaderCampaignPins,
  resolveLeaderPersonalLinks,
} from "@/lib/volunteers/resolve-leader-links";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-32 border-b border-[var(--ep-navy)]/10 pb-10 last:border-0">
      <h2 className="font-heading text-xl font-bold text-[var(--ep-navy)]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

type Props = {
  payload: LeaderWorkbenchV2Payload;
  isSelf?: boolean;
};

export function VolunteerLeaderWorkbenchV2View({ payload, isSelf }: Props) {
  const { leader, po5, responsibilities, nextActions, overviewSummary, laneLabels } = payload;
  const areaLinks = resolveLeaderPersonalLinks(leader);
  const campaignPins = resolveLeaderCampaignPins(leader);

  return (
    <div className="ep-chapter-body px-6 py-10 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-start">
        <aside className="lg:sticky lg:top-24 lg:w-52 lg:shrink-0">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">Workbench v2</p>
          <p className="mt-1 font-heading text-lg font-bold text-[var(--ep-navy)]">{leader.displayName}</p>
          <p className="font-mono text-sm font-bold text-[var(--ep-blue)]">{leader.initials}</p>
          {isSelf ? (
            <p className="mt-2 text-xs font-semibold text-[var(--ep-navy-muted)]">Your signed-in workbench</p>
          ) : null}
          <nav className="mt-4 space-y-1 text-sm" aria-label="Workbench sections">
            {LEADER_WORKBENCH_SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="block rounded-md px-2 py-1.5 text-[var(--ep-navy-muted)] hover:bg-[var(--ep-cream)] hover:text-[var(--ep-navy)]"
              >
                {s.label}
              </a>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 space-y-10">
          <header>
            <div className="ep-classification">Leadership workbench · participant tools included</div>
            <h1 className="mt-2 font-heading text-3xl font-bold text-[var(--ep-navy)]">{leader.displayName}</h1>
            {leader.notes ? (
              <p className="mt-2 max-w-3xl text-sm text-[var(--ep-navy-muted)]">{leader.notes}</p>
            ) : null}
          </header>

          <Section id="overview" title="Overview">
            <p className="max-w-3xl text-sm leading-relaxed text-[var(--ep-navy)]">{overviewSummary}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {laneLabels.map((lane) => (
                <li
                  key={lane}
                  className="rounded-full border border-[var(--ep-gold)]/40 bg-[var(--ep-cream)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--ep-navy)]"
                >
                  {lane}
                </li>
              ))}
            </ul>
          </Section>

          <Section id="role" title="Role & responsibilities">
            <p className="text-sm text-[var(--ep-navy-muted)]">
              Duties for your assigned lanes — expand as the campaign adds scope.
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--ep-navy)]">
              {responsibilities.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </Section>

          <Section id="areas" title="My areas">
            <p className="text-sm text-[var(--ep-navy-muted)]">
              County playbooks, city workbenches, programs, and events — same Election Plan surfaces, your geography.
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {areaLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block rounded-xl border border-[var(--ep-navy)]/10 bg-white p-4 shadow-sm transition hover:border-[var(--ep-gold)]"
                  >
                    <p className="font-semibold text-[var(--ep-navy)]">{link.label}</p>
                    <p className="mt-1 text-xs text-[var(--ep-blue)]">Open in Election Plan →</p>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>

          <Section id="kpi" title="KPI dashboard">
            <PowerOf5DashboardPanel
              overline="Record-backed when live"
              title="Relational KPIs"
              impactExplanation={po5.impactExplanation}
              intro="Demo counts until PPEN rosters connect — zeros mean no records yet, not fake progress."
              items={po5.kpiItems}
              pipelineVariant="compact"
              showOrganizingPipelines={false}
            />
          </Section>

          <Section id="power-of-5" title="Power of 5">
            <PowerOf5DashboardPanel
              overline="Participant engine"
              title="Power of 5 structure"
              intro={po5.intro}
              items={[]}
              pipelineVariant="full"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/onboarding/power-of-5" className="ep-btn ep-btn-primary ep-btn-sm">
                Walkthrough
              </Link>
              <Link href="/election-plan/operators/leader-dashboard" className="ep-btn ep-btn-ghost ep-btn-sm">
                Leader dashboard
              </Link>
              <Link href="/election-plan/power-of-5/command-center" className="ep-btn ep-btn-ghost ep-btn-sm">
                Command center
              </Link>
            </div>
          </Section>

          <Section id="my-five" title="My Five">
            <p className="text-sm text-[var(--ep-navy-muted)]">Synthetic demo roster — no real PII.</p>
            <ul className="mt-4 divide-y divide-[var(--ep-navy)]/10 rounded-xl border border-[var(--ep-navy)]/10 bg-white">
              {po5.personalDemo.myFive.map((member) => (
                <li key={member.id} className="flex flex-wrap items-start justify-between gap-2 px-4 py-3">
                  <div>
                    <p className="font-semibold text-[var(--ep-navy)]">{member.displayName}</p>
                    <p className="text-xs text-[var(--ep-navy-muted)]">{member.category}</p>
                    <p className="mt-1 text-sm text-[var(--ep-navy)]/80">{member.lastTouchLabel}</p>
                  </div>
                  <span className="rounded-full bg-[var(--ep-cream)] px-2 py-0.5 text-xs font-semibold uppercase text-[var(--ep-navy)]">
                    {member.status}
                  </span>
                </li>
              ))}
            </ul>
          </Section>

          <Section id="next-actions" title="Next actions">
            <ul className="space-y-3">
              {nextActions.map((action) => (
                <li
                  key={action.id}
                  className="rounded-lg border border-[var(--ep-navy)]/10 bg-white px-4 py-3 text-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-semibold text-[var(--ep-navy)]">{action.title}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        action.priority === "high"
                          ? "bg-rose-50 text-rose-800"
                          : action.priority === "medium"
                            ? "bg-amber-50 text-amber-900"
                            : "bg-[var(--ep-cream)] text-[var(--ep-navy-muted)]"
                      }`}
                    >
                      {action.priority}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
                    {action.lane} · {action.dueLabel}
                  </p>
                </li>
              ))}
            </ul>
          </Section>

          <Section id="training" title="Training & tools">
            <ul className="grid gap-3 sm:grid-cols-2">
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
          </Section>
        </div>
      </div>
    </div>
  );
}
