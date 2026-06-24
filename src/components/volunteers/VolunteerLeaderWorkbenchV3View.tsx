import Link from "next/link";

import { LeaderTemplatePanels } from "@/components/volunteers/LeaderTemplatePanels";
import { LeaderHierarchyPanel } from "@/components/volunteers/LeaderHierarchyPanel";
import { LeaderOpenSlotsPanel, LeaderRecentActivityPanel } from "@/components/volunteers/LeaderActivityPanels";
import { LeaderRosterWorkbenchPanels } from "@/components/volunteers/LeaderRosterWorkbenchPanels";
import { LeaderFieldLogPanel } from "@/components/volunteers/LeaderFieldLogPanel";
import { LeaderOperatorIdentityBar } from "@/components/volunteers/LeaderOperatorIdentityBar";
import { PowerOf5DashboardPanel } from "@/components/power-of-5/PowerOf5DashboardPanel";
import type { LeaderWorkbenchV3Payload } from "@/lib/volunteers/build-leader-workbench-v3";
import type { LeaderFieldLogContext } from "@/lib/volunteers/build-leader-field-log-context";
import { LeaderLaneNavStrip } from "@/components/volunteers/LeaderLaneDrillDownView";
import { LEADER_WORKBENCH_SECTIONS } from "@/lib/volunteers/leader-workbench-sections";
import {
  resolveLeaderCampaignPins,
  resolveLeaderPersonalLinks,
} from "@/lib/volunteers/resolve-leader-links";
import {
  formatSpecialOutreachFundraisingGoal,
  resolveSpecialOutreachProgramForLeader,
} from "@/lib/volunteers/special-outreach-programs";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-32 border-b border-[var(--ep-navy)]/10 pb-10 last:border-0">
      <h2 className="font-heading text-xl font-bold text-[var(--ep-navy)]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

type Props = {
  payload: LeaderWorkbenchV3Payload;
  isSelf?: boolean;
  fieldLog?: LeaderFieldLogContext | null;
};

export function VolunteerLeaderWorkbenchV3View({ payload, isSelf, fieldLog }: Props) {
  const { leader, po5, responsibilities, nextActions, overviewSummary, laneLabels, live, roster, hierarchy, leadTemplates, specialKpis } =
    payload;
  const areaLinks = resolveLeaderPersonalLinks(leader);
  const campaignPins = resolveLeaderCampaignPins(leader);
  const specialOutreach = resolveSpecialOutreachProgramForLeader(leader);
  const canLogField = Boolean(isSelf && fieldLog?.operatorReady);

  return (
    <div className="ep-chapter-body px-6 py-10 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-start">
        <aside className="lg:sticky lg:top-24 lg:w-52 lg:shrink-0">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">Workbench v3.4</p>
          <p className="mt-1 font-heading text-lg font-bold text-[var(--ep-navy)]">{leader.displayName}</p>
          <p className="font-mono text-sm font-bold text-[var(--ep-blue)]">{leader.initials}</p>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">
            {live.recordSource === "live" ? "Live records connected" : "Records empty — zeros are honest"}
          </p>
          {isSelf ? (
            <p className="mt-1 text-xs font-semibold text-[var(--ep-navy-muted)]">Your signed-in workbench</p>
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
            <a
              href="#activity"
              className="block rounded-md px-2 py-1.5 text-[var(--ep-navy-muted)] hover:bg-[var(--ep-cream)] hover:text-[var(--ep-navy)]"
            >
              Activity
            </a>
            {live.openLeadershipSlots.length ? (
              <a
                href="#leadership-gaps"
                className="block rounded-md px-2 py-1.5 text-[var(--ep-navy-muted)] hover:bg-[var(--ep-cream)] hover:text-[var(--ep-navy)]"
              >
                Open slots
              </a>
            ) : null}
            <a
              href="#calendar"
              className="block rounded-md px-2 py-1.5 text-[var(--ep-navy-muted)] hover:bg-[var(--ep-cream)] hover:text-[var(--ep-navy)]"
            >
              Calendar
            </a>
            {live.eventEmbeds.length ? (
              <a
                href="#events-embed"
                className="block rounded-md px-2 py-1.5 text-[var(--ep-navy-muted)] hover:bg-[var(--ep-cream)] hover:text-[var(--ep-navy)]"
              >
                Event command
              </a>
            ) : null}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 space-y-10">
          <header>
            <div className="ep-classification">Leadership workbench v3.4 · lanes + Power of 5</div>
            {leader.nonprofitAdvisor ? (
              <p className="mt-2 inline-block rounded-full bg-[var(--ep-navy)]/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--ep-navy)] ring-1 ring-[var(--ep-navy)]/25">
                Nonprofit advisor · ACM access
              </p>
            ) : null}
            {leader.volunteerManagerInterim ? (
              <p className="mt-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-950 ring-1 ring-amber-400/60">
                Interim Volunteer Manager
              </p>
            ) : null}
            {leader.countyBoardMember && !leader.workbenchTemplates?.includes("county_leader") ? (
              <p className="mt-2 inline-block rounded-full bg-[var(--ep-gold)]/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--ep-navy)] ring-1 ring-[var(--ep-gold)]/45">
                Volunteer board
              </p>
            ) : null}
            {leader.specialOutreachProgramSlug === "ozark-forward" ? (
              <p className="mt-2 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-950 ring-1 ring-emerald-500/40">
                Ozark Forward
              </p>
            ) : null}
            {leader.specialOutreachProgramSlug === "just-a-girl" ? (
              <p className="mt-2 inline-block rounded-full bg-pink-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-pink-950 ring-1 ring-pink-400/40">
                Just A Girl
              </p>
            ) : null}
            {leader.workbenchTemplates?.includes("union_liaison") ? (
              <p className="mt-2 inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-orange-950 ring-1 ring-orange-400/45">
                Union liaison
              </p>
            ) : null}
            {leader.workbenchTemplates?.includes("social_media_influencer") ? (
              <p className="mt-2 inline-block rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-fuchsia-950 ring-1 ring-fuchsia-400/45">
                Social media influencer
              </p>
            ) : null}
            {leader.workbenchTemplates?.includes("democratic_black_caucus_lead") ? (
              <p className="mt-2 inline-block rounded-full bg-[var(--ep-navy)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white ring-1 ring-[var(--ep-navy)]/40">
                Democratic Black Caucus
              </p>
            ) : null}
            {leader.campusTeamCoChair ? (
              <p className="mt-2 inline-block rounded-full bg-violet-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-violet-950 ring-1 ring-violet-400/45">
                Students for Arkansas co-chair
              </p>
            ) : null}
            {leader.workbenchTemplates?.includes("fundraising_lead") ? (
              <p className="mt-2 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-950 ring-1 ring-emerald-500/40">
                Fundraising Lead
              </p>
            ) : null}
            {leader.workbenchTemplates?.includes("fundraising_field_leader") ? (
              <p className="mt-2 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-950 ring-1 ring-emerald-500/40">
                Fundraising field leader
              </p>
            ) : null}
            {leader.workbenchTemplates?.includes("progressives_liaison") ? (
              <p className="mt-2 inline-block rounded-full bg-rose-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-rose-950 ring-1 ring-rose-400/40">
                Progressives liaison
              </p>
            ) : null}
            {leader.volunteerLeadershipTeam ? (
              <p className="mt-2 inline-block rounded-full bg-[var(--ep-gold)]/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--ep-navy)] ring-1 ring-[var(--ep-gold)]/50">
                Volunteer leadership team
              </p>
            ) : null}
            {leader.workbenchTemplates?.includes("cluster_leader") ? (
              <p className="mt-2 inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-indigo-950 ring-1 ring-indigo-400/50">
                Cluster leader
              </p>
            ) : null}
            {leader.workbenchTemplates?.includes("county_candidate_coordinator") ? (
              <p className="mt-2 inline-block rounded-full bg-[var(--ep-navy)]/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--ep-navy)] ring-1 ring-[var(--ep-navy)]/25">
                County Candidate Coordinator
              </p>
            ) : null}
            {leader.workbenchTemplates?.includes("county_leader") && !leader.countyBoardMember ? (
              <p className="mt-2 inline-block rounded-full bg-[var(--ep-navy)]/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--ep-navy)] ring-1 ring-[var(--ep-navy)]/30">
                County leader
              </p>
            ) : null}
            {leader.workbenchTemplates?.includes("city_leader") ? (
              <p className="mt-2 inline-block rounded-full bg-[var(--ep-gold)]/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--ep-navy)] ring-1 ring-[var(--ep-gold)]/45">
                City leader
              </p>
            ) : null}
            {leader.workbenchTemplates?.includes("events_lead") ? (
              <p className="mt-2 inline-block rounded-full bg-sky-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-sky-950 ring-1 ring-sky-400/40">
                Events lead
              </p>
            ) : null}
            {leader.workbenchTemplates?.includes("muslim_community_lead") ? (
              <p className="mt-2 inline-block rounded-full bg-teal-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-teal-950 ring-1 ring-teal-500/40">
                Muslim Community Lead
              </p>
            ) : null}
            {leader.interfaithCommsLiaison ? (
              <p className="mt-2 inline-block rounded-full bg-violet-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-violet-950 ring-1 ring-violet-400/40">
                Interfaith comms liaison
              </p>
            ) : null}
            {leader.workbenchTemplates?.includes("finance_inner_circle") ? (
              <p className="mt-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-950 ring-1 ring-amber-500/40">
                Finance inner circle
              </p>
            ) : null}
            {leader.workbenchTemplates?.includes("event_planner") ? (
              <p className="mt-2 inline-block rounded-full bg-[var(--ep-blue)]/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--ep-blue)] ring-1 ring-[var(--ep-blue)]/30">
                Event planner
              </p>
            ) : null}
            <h1 className="mt-2 font-heading text-3xl font-bold text-[var(--ep-navy)]">{leader.displayName}</h1>
            {leader.notes ? (
              <p className="mt-2 max-w-3xl text-sm text-[var(--ep-navy-muted)]">{leader.notes}</p>
            ) : null}
            {specialOutreach ? (
              <div className="mt-4 max-w-xl rounded-lg border border-[var(--ep-gold)]/35 bg-[var(--ep-cream)]/80 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">
                  {specialOutreach.name} · program fundraising goal
                </p>
                <p className="mt-1 font-heading text-2xl font-bold text-[var(--ep-navy)]">
                  {formatSpecialOutreachFundraisingGoal(specialOutreach)}
                </p>
                <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{specialOutreach.fundraisingGoalNote}</p>
                <Link
                  href={`/election-plan/workbenches/${specialOutreach.coalitionSlug}`}
                  className="mt-2 inline-block text-xs font-semibold text-[var(--ep-blue)] hover:underline"
                >
                  Open {specialOutreach.name} program board →
                </Link>
              </div>
            ) : null}
          </header>

          {isSelf && fieldLog?.operatorReady ? (
            <div className="mb-6">
              <LeaderOperatorIdentityBar fieldLog={fieldLog} lastLoggedAt={live.operatorEntries.lastLoggedAt} />
            </div>
          ) : null}

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
            <LeaderLaneNavStrip leader={leader} isSelf={isSelf} />
          </Section>

          <Section id="hierarchy" title="Hierarchy & work branches">
            <LeaderHierarchyPanel hierarchy={hierarchy} leaderSlug={leader.slug} isSelf={isSelf} />
          </Section>

          {leadTemplates.length || specialKpis.length || leader.volunteerManagerInterim ? (
            <Section id="lead-templates" title="Lead templates & special KPIs">
              <LeaderTemplatePanels
                templates={leadTemplates}
                specialKpis={specialKpis}
                interimVolunteerManager={leader.volunteerManagerInterim}
                leaderDisplayName={leader.displayName}
                leaderSlug={leader.slug}
                isSelf={isSelf}
              />
            </Section>
          ) : null}

          <Section id="kpi" title="KPI dashboard (live)">
            <PowerOf5DashboardPanel
              overline="Record-backed"
              title="Your geography at a glance"
              intro="Counts from workbench records and field logs — not planning JSON. Zero means no records yet."
              items={live.liveKpis}
              showOrganizingPipelines={false}
              pipelineVariant="compact"
            />
            {live.primaryCountySlug && areaLinks[0] ? (
              <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">
                <Link href={areaLinks[0].href} className="font-semibold text-[var(--ep-blue)] hover:underline">
                  Open full area drill-down →
                </Link>
              </p>
            ) : null}
          </Section>

          {live.messageSlice ? (
            <Section id="message-hub" title="Message hub">
              <div className="rounded-xl border border-[var(--ep-gold)]/40 bg-[var(--ep-cream)]/60 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">
                  {live.messageSlice.displayName}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ep-navy)]">{live.messageSlice.coreLine}</p>
                <Link href={live.messageSlice.messagesHref} className="mt-3 inline-block text-sm font-semibold text-[var(--ep-blue)] hover:underline">
                  Conversations & Stories hub →
                </Link>
              </div>
            </Section>
          ) : null}

          <Section id="activity" title="Recent activity">
            <LeaderRecentActivityPanel entries={live.operatorEntries.recent} />
          </Section>

          {live.openLeadershipSlots.length ? (
            <Section id="leadership-gaps" title="Open leadership slots">
              <p className="mb-3 text-sm text-[var(--ep-navy-muted)]">
                These roles in your connected workbenches still need a name — assign from the workbench leadership table.
              </p>
              <LeaderOpenSlotsPanel slots={live.openLeadershipSlots} />
            </Section>
          ) : null}

          <section id="calendar" className="scroll-mt-32 border-b border-[var(--ep-navy)]/10 pb-10">
            <h2 className="font-heading text-xl font-bold text-[var(--ep-navy)]">Calendar</h2>
            <div className="mt-4">
              {live.calendar.length ? (
                <ul className="divide-y divide-[var(--ep-navy)]/10 rounded-xl border border-[var(--ep-navy)]/10 bg-white">
                  {live.calendar.map((item) => (
                    <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                      <div>
                        <p className="font-semibold text-[var(--ep-navy)]">{item.title}</p>
                        <p className="text-xs text-[var(--ep-navy-muted)]">
                          {item.workbenchName} · {item.dateLabel} · {item.status}
                        </p>
                      </div>
                      <Link href={item.href} className="text-xs font-semibold text-[var(--ep-blue)] hover:underline">
                        Open →
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[var(--ep-navy-muted)]">No upcoming events on workbench records yet.</p>
              )}
            </div>
          </section>

          {live.eventEmbeds.length ? (
            <section id="events-embed" className="scroll-mt-32 border-b border-[var(--ep-navy)]/10 pb-10">
              <h2 className="font-heading text-xl font-bold text-[var(--ep-navy)]">Event command</h2>
              <div className="mt-4 space-y-4">
                {live.eventEmbeds.map((ev) => (
                  <div key={ev.href} className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-[var(--ep-navy)]">{ev.title}</p>
                        <p className="text-xs text-[var(--ep-navy-muted)]">
                          {ev.status} · {ev.assignmentFilled}/{ev.assignmentTotal} roles filled
                          {ev.leadName ? ` · Lead: ${ev.leadName}` : ""}
                        </p>
                      </div>
                      <Link href={ev.href} className="ep-btn ep-btn-primary ep-btn-sm">
                        Event workbench
                      </Link>
                    </div>
                    {ev.roles.length ? (
                      <ul className="mt-3 grid gap-1 text-xs text-[var(--ep-navy-muted)] sm:grid-cols-2">
                        {ev.roles.map((r) => (
                          <li key={`${r.role}-${r.assignee}`}>
                            <span className="font-semibold text-[var(--ep-navy)]">{r.role}:</span>{" "}
                            {r.assignee?.trim() || "Open"}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <Section id="role" title="Role & responsibilities">
            <ul className="mt-1 list-disc space-y-2 pl-5 text-sm text-[var(--ep-navy)]">
              {responsibilities.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </Section>

          <Section id="areas" title="My areas">
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

          {isSelf && fieldLog ? (
            <Section id="field-log" title="Field log">
              {canLogField ? (
                <>
                  <p className="mb-4 text-sm text-[var(--ep-navy-muted)]">
                    Log conversations, volunteers, and leaders for your county — tagged as operator{" "}
                    <strong>{fieldLog.operatorInitials}</strong>. Your entries:{" "}
                    <strong>{live.operatorEntries.totalQuantity}</strong> ({live.operatorEntries.entryCount} logs).
                  </p>
                  <LeaderFieldLogPanel
                    countySlug={fieldLog.countySlug}
                    countyName={fieldLog.countyName}
                    citySlug={fieldLog.citySlug}
                    initial={fieldLog.summary}
                    operatorInitials={fieldLog.operatorInitials}
                  />
                </>
              ) : (
                <>
                  <p className="text-sm text-[var(--ep-navy-muted)]">
                    Operator identity is syncing — refresh in a moment or sign in again. Your tagged entries:{" "}
                    <strong>{live.operatorEntries.totalQuantity}</strong> ({live.operatorEntries.entryCount} logs).
                  </p>
                  {areaLinks[0] ? (
                    <Link href={`${areaLinks[0].href}#field-log`} className="mt-3 inline-block ep-btn ep-btn-ghost ep-btn-sm">
                      Open county field log →
                    </Link>
                  ) : null}
                </>
              )}
            </Section>
          ) : null}

          <Section id="power-of-5" title="Power of 5">
            <PowerOf5DashboardPanel
              overline="Participant engine"
              title="Power of 5 structure"
              intro={po5.intro}
              items={po5.kpiItems}
              pipelineVariant="full"
            />
            <div className="mt-8">
              <LeaderRosterWorkbenchPanels
                leaderInitials={leader.initials}
                roster={roster}
                editable={Boolean(isSelf)}
              />
            </div>
          </Section>

          <Section id="next-actions" title="Next actions">
            <ul className="space-y-3">
              {nextActions.map((action) => (
                <li key={action.id} className="rounded-lg border border-[var(--ep-navy)]/10 bg-white px-4 py-3 text-sm">
                  <p className="font-semibold text-[var(--ep-navy)]">{action.title}</p>
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
