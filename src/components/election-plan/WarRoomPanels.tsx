"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";

import type { ElectionPlanWorkbenchSnapshot } from "@/lib/election-plan/types";
import { FOUR_LANE_DEFINITIONS } from "@/lib/election-plan/four-lanes-labels";
import { formatPct, formatVotes } from "@/lib/election-plan/electionPlanData";
import { cn } from "@/lib/utils";

type Props = { data: ElectionPlanWorkbenchSnapshot };

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{subtitle}</p> : null}
    </div>
  );
}

function ProgressStat({
  label,
  value,
  goal,
  format = "number",
  onClick,
  expanded,
  children,
}: {
  label: string;
  value: number;
  goal: number;
  format?: "number" | "pct";
  onClick?: () => void;
  expanded?: boolean;
  children?: ReactNode;
}) {
  const pct = goal > 0 ? Math.min(100, (value / goal) * 100) : 0;
  const display =
    format === "pct" ? `${value.toFixed(1)}%` : `${formatVotes(value)}${goal ? ` / ${formatVotes(goal)}` : ""}`;
  const interactive = Boolean(onClick);
  return (
    <div className={cn("ep-card", interactive && "cursor-pointer transition hover:ring-2 hover:ring-[var(--ep-gold-soft)]")}>
      <button
        type="button"
        className={cn("w-full text-left", !interactive && "cursor-default")}
        onClick={onClick}
        disabled={!interactive}
        aria-expanded={expanded}
      >
        <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">{label}</div>
        <div className="mt-1 font-heading text-xl font-bold text-[var(--ep-navy)]">{display}</div>
        <div className="ep-progress mt-3">
          <div className="ep-progress-bar" style={{ width: `${pct}%` }} />
        </div>
        {interactive ? (
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">
            {expanded ? "Hide roster ▲" : "View roster ▼"}
          </p>
        ) : null}
      </button>
      {expanded && children ? <div className="mt-4 border-t border-[var(--ep-border)] pt-4">{children}</div> : null}
    </div>
  );
}

function VolunteerLeaderRoster({
  leaders,
  subtitle,
}: {
  leaders: Array<{
    id: string;
    name: string;
    locationHint: string | null;
    inviteStatus: string;
    confirmedFoundingTeam: boolean;
  }>;
  subtitle?: string;
}) {
  if (leaders.length === 0) {
    return <p className="text-sm text-[var(--ep-navy-muted)]">No volunteers on roster yet.</p>;
  }
  return (
    <div>
      {subtitle ? <p className="mb-3 text-xs text-[var(--ep-navy-muted)]">{subtitle}</p> : null}
      <ul className="max-h-80 space-y-2 overflow-y-auto text-sm">
        {leaders.map((v) => (
          <li
            key={v.id}
            className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 border-b border-[var(--ep-border)] pb-2 last:border-0"
          >
            <span className="font-medium text-[var(--ep-navy)]">{v.name}</span>
            {v.locationHint ? (
              <span className="text-xs text-[var(--ep-navy-muted)]">
                {v.locationHint}
                {v.confirmedFoundingTeam ? " · founding team" : ""}
              </span>
            ) : v.confirmedFoundingTeam ? (
              <span className="text-xs text-[var(--ep-navy-muted)]">founding team</span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** PASS-17 Deliverable 1 — Executive War Room Homepage */
export function WarRoomPanel({ data }: Props) {
  const w = data.warRoom;
  const [volunteerRosterOpen, setVolunteerRosterOpen] = useState(false);
  const [sherwoodVolunteersOpen, setSherwoodVolunteersOpen] = useState(false);
  return (
    <section>
      <SectionTitle
        title="Executive War Room"
        subtitle={`Week ${w.currentWeek} · ${w.weekRange} — campaign command center`}
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="ep-card ep-war-stat">
          <div className="ep-war-stat-value">{w.weeksRemaining}</div>
          <div className="ep-war-stat-label">Weeks remaining</div>
        </div>
        <Link
          href="/election-plan/lanes-overview"
          className="ep-card ep-war-stat block transition hover:ring-2 hover:ring-[var(--ep-gold-soft)]"
        >
          <div className="ep-war-stat-value">{formatVotes(w.projectedVotes)}</div>
          <div className="ep-war-stat-label">Current projection</div>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">
            Lanes breakdown →
          </p>
        </Link>
        <div className="ep-card ep-war-stat">
          <div className="ep-war-stat-value">{formatVotes(w.lane2Potential)}</div>
          <div className="ep-war-stat-label">{FOUR_LANE_DEFINITIONS.lane2.fullLabel} potential</div>
        </div>
        <Link
          href="/election-plan/registration-goals"
          className="ep-card ep-war-stat block transition hover:ring-2 hover:ring-[var(--ep-gold-soft)]"
        >
          <div className="ep-war-stat-value">{formatVotes(w.registrationGoal)}</div>
          <div className="ep-war-stat-label">Registration goal</div>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">
            County breakdown →
          </p>
        </Link>
        <div className="ep-card ep-war-stat">
          <div className="ep-war-stat-value">
            {w.endorsementsEndorsed} / {w.endorsementsRequested}
          </div>
          <div className="ep-war-stat-label">Endorsed / requested</div>
        </div>
      </div>

      <p className="mb-4 text-xs text-[var(--ep-navy-muted)]">
        Intelligence opportunities are scored Forward Motion stops — fairs, forums, and community events ranked for
        Kelly&apos;s next moves. Not confirmed Google Calendar until OAuth sync. Confirmed schedule: Google Calendar →{" "}
        <code className="text-[10px]">CampaignEvent</code> → public{" "}
        <code className="text-[10px]">/campaign-calendar</code>.
      </p>

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ProgressStat
          label="Volunteer leaders"
          value={w.volunteerLeadersCurrent}
          goal={w.volunteerLeadersGoal}
          onClick={() => setVolunteerRosterOpen((open) => !open)}
          expanded={volunteerRosterOpen}
        >
          <VolunteerLeaderRoster
            leaders={w.volunteerLeaders}
            subtitle={`${w.volunteerLeaders.length} on June 28 invite list · ${w.volunteerLeadersCurrent} total campaign signups`}
          />
        </ProgressStat>
        <Link
          href="/election-plan/intelligence-opportunities"
          className="ep-card ep-war-stat block transition hover:ring-2 hover:ring-[var(--ep-gold-soft)]"
        >
          <div className="ep-war-stat-value">{w.upcomingEvents}</div>
          <div className="ep-war-stat-label">Intelligence opportunities (7d)</div>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">
            Forward Motion breakdown →
          </p>
        </Link>
        <ProgressStat label="Counties visited" value={w.countiesCovered} goal={w.countiesTotal} />
        <ProgressStat label="Human Contact Index" value={w.hciTotal} goal={w.hciGoal} />
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <div className="ep-card">
          <h3 className="font-heading font-bold">Calendar Truth</h3>
          <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
            {w.calendarTruthVerified} / {w.calendarTruthGoal} verified events · Phase 9 lock:{" "}
            {w.phase9Ready ? "Ready" : "Not yet"}
          </p>
          <div className="ep-progress mt-3">
            <div className="ep-progress-bar" style={{ width: `${w.calendarTruthPct}%` }} />
          </div>
          <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">{w.calendarTruthPct}% toward verification goal</p>
        </div>
        <div className="ep-card">
          <h3 className="font-heading font-bold">Sherwood 60%+</h3>
          <p className="mt-2 text-sm">
            VIP {w.sherwoodVipSold}/{w.sherwoodVipGoal} · Tickets {w.sherwoodTicketsSold}
          </p>
          <button
            type="button"
            className="mt-3 w-full rounded-md border border-[var(--ep-border)] bg-[var(--ep-cream)] px-3 py-2 text-left text-sm transition hover:ring-2 hover:ring-[var(--ep-gold-soft)]"
            onClick={() => setSherwoodVolunteersOpen((open) => !open)}
            aria-expanded={sherwoodVolunteersOpen}
          >
            <span className="font-semibold text-[var(--ep-navy)]">
              Sherwood volunteers: {w.sherwoodVolunteers}
            </span>
            <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">
              {sherwoodVolunteersOpen ? "Hide roster ▲" : "View roster ▼"}
            </span>
          </button>
          {sherwoodVolunteersOpen ? (
            <div className="mt-4 border-t border-[var(--ep-border)] pt-4">
              <VolunteerLeaderRoster
                leaders={w.sherwoodVolunteersRoster}
                subtitle={`${w.sherwoodVolunteers} confirmed for Sherwood event ops · contact details coming later`}
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="ep-card ep-priority-card">
        <h3 className="font-heading text-lg font-bold">Top priorities this week</h3>
        <ol className="mt-4 list-inside list-decimal space-y-2 text-sm leading-relaxed">
          {w.topPrioritiesThisWeek.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** PASS-17 Deliverable 3 — 20-Week Strategic Timeline */
export function CampaignTimelinePanel({ data }: Props) {
  const milestones = data.campaignTimeline;
  const byWeek = new Map<number, typeof milestones>();
  for (const m of milestones) {
    const list = byWeek.get(m.weekNumber) ?? [];
    list.push(m);
    byWeek.set(m.weekNumber, list);
  }

  return (
    <section>
      <SectionTitle
        title="20-Week Strategic Calendar"
        subtitle="County fairs · forums · Sherwood · volunteer launch · GOTV · Election Day"
      />
      <div className="ep-timeline">
        {Array.from({ length: 20 }, (_, i) => i + 1).map((weekNum) => {
          const items = byWeek.get(weekNum) ?? [];
          const weekPlan = data.weekPlans.find((w) => w.weekNumber === weekNum);
          return (
            <div key={weekNum} className="ep-timeline-row">
              <div className="ep-timeline-week">
                <span className="ep-timeline-week-num">W{weekNum}</span>
                <span className="ep-timeline-week-range">{weekPlan?.range ?? ""}</span>
              </div>
              <div className="ep-timeline-body">
                {weekPlan ? (
                  <p className="mb-2 text-sm font-semibold text-[var(--ep-navy)]">
                    {weekPlan.cluster} · <span className="font-normal text-[var(--ep-navy-muted)]">{weekPlan.focus}</span>
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  {items.map((m) => (
                    <span
                      key={`${m.date}-${m.label}`}
                      className={cn(
                        "ep-timeline-chip",
                        m.importance === "major" && "ep-timeline-chip-major",
                        `ep-timeline-cat-${m.category}`,
                      )}
                      title={m.date}
                    >
                      {m.label}
                    </span>
                  ))}
                  {items.length === 0 && weekPlan ? (
                    <span className="text-xs text-[var(--ep-navy-muted)]">Cluster week — see Week Plans</span>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** PASS-17 Deliverable 2 — Week 1–4 operational + framework for 5–20 */
export function WeekOperationalPanel({ data }: Props) {
  const [selected, setSelected] = useState(1);
  const week = data.weekPlans.find((w) => w.weekNumber === selected);

  return (
    <section>
      <SectionTitle title="Week Plans" subtitle="Weeks 1–4 operational · Weeks 5–20 framework" />
      <div className="mb-6 flex flex-wrap gap-1">
        {data.weekPlans.map((w) => (
          <button
            key={w.weekNumber}
            type="button"
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              selected === w.weekNumber
                ? "bg-[var(--ep-navy)] text-white"
                : "bg-[var(--ep-cream)] text-[var(--ep-navy-muted)] hover:bg-[var(--ep-gold-soft)]",
            )}
            onClick={() => setSelected(w.weekNumber)}
          >
            W{w.weekNumber}
            {w.status === "operational" ? " ●" : ""}
          </button>
        ))}
      </div>

      {week ? (
        <div className="space-y-4">
          <div className="ep-card">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-heading text-xl font-bold">Week {week.weekNumber}</h3>
              <span className="rounded-full bg-[var(--ep-gold-soft)] px-3 py-0.5 text-xs font-bold uppercase tracking-wide text-[var(--ep-navy)]">
                {week.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{week.range}</p>
            <p className="mt-3 font-medium">{week.clusterFocus ?? week.focus}</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <GoalBlock title="Cluster & geography" items={[
              `Cluster: ${week.cluster}`,
              `Cities: ${week.cities.join(" · ")}`,
              week.counties?.length ? `Counties: ${week.counties.join(" · ")}` : "",
            ].filter(Boolean)} />
            {week.events?.length ? <GoalBlock title="Events" items={week.events} /> : null}
            {week.volunteerGoals?.length ? <GoalBlock title="Volunteer goals" items={week.volunteerGoals} /> : null}
            {week.coalitionGoals?.length ? <GoalBlock title="Coalition goals" items={week.coalitionGoals} /> : null}
            {week.storytellingGoals?.length ? <GoalBlock title="Storytelling goals" items={week.storytellingGoals} /> : null}
            {week.endorsementGoals?.length ? <GoalBlock title="Endorsement goals" items={week.endorsementGoals} /> : null}
            {week.gotvGoals?.length ? <GoalBlock title="GOTV goals" items={week.gotvGoals} /> : null}
          </div>

          {week.metrics?.length ? (
            <div className="ep-card">
              <h4 className="font-heading font-bold">Metrics</h4>
              <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                {week.metrics.map((m) => (
                  <div key={m.label} className="flex justify-between text-sm">
                    <dt className="text-[var(--ep-navy-muted)]">{m.label}</dt>
                    <dd className="font-semibold">{m.target}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function GoalBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="ep-card">
      <h4 className="font-heading font-bold">{title}</h4>
      <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-[var(--ep-navy-muted)]">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

/** Coverage Reality — leadership-confirmed county visit audit (not Forward Motion queue) */
export function PresenceMapPanel({ data }: Props) {
  const c = data.coverageReality;
  const s = data.calendarSettlement;

  return (
    <section>
      <SectionTitle
        title="Coverage Reality"
        subtitle="Strategic county presence — reconciled from leadership history + calendar touch summary"
      />

      <div className="ep-card ep-priority-card mb-6">
        <p className="text-sm leading-relaxed text-[var(--ep-navy-muted)]">{c.disclaimer}</p>
        <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
          Reference {c.referenceDate} · Brain previously reported {c.brainPreviouslyReported}/75 · reconciled +{c.reconciliationDelta} →{" "}
          <strong>{c.visitedCount}/75</strong>
        </p>
      </div>

      {s.lockedEventCount > 0 ? (
        <div className="ep-card mb-8">
          <h3 className="font-heading font-bold">Calendar settlement backbone</h3>
          <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
            Locked schedule {s.windowStart} → {s.windowEnd} · Early voting {s.earlyVotingStart} · planning intelligence only
          </p>
          <div className="mt-4 ep-stat-grid">
            <div className="ep-stat">
              <div className="ep-stat-value">{s.lockedEventCount}</div>
              <div className="ep-stat-label">Locked events</div>
            </div>
            <div className="ep-stat">
              <div className="ep-stat-value">{s.openDayCount}</div>
              <div className="ep-stat-label">Open weekends</div>
            </div>
            <div className="ep-stat">
              <div className="ep-stat-value">
                {s.projectedCountiesAfterLocked}/75
              </div>
              <div className="ep-stat-label">After locked trips</div>
            </div>
            <div className="ep-stat">
              <div className="ep-stat-value">{s.stillMissingCount}</div>
              <div className="ep-stat-label">Still missing</div>
            </div>
          </div>
          {s.lockedBackbone.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--ep-border)] text-left text-xs uppercase tracking-wide text-[var(--ep-navy-muted)]">
                    <th className="pb-2 pr-3">Date</th>
                    <th className="pb-2 pr-3">Event</th>
                    <th className="pb-2 pr-3">County</th>
                    <th className="pb-2">Travel</th>
                  </tr>
                </thead>
                <tbody>
                  {s.lockedBackbone.map((e) => (
                    <tr key={`${e.date}-${e.eventName}`} className="border-b border-[var(--ep-border)] last:border-0">
                      <td className="py-2 pr-3 whitespace-nowrap">{e.date}</td>
                      <td className="py-2 pr-3">{e.eventName}</td>
                      <td className="py-2 pr-3">{e.county}</td>
                      <td className="py-2 text-xs">{e.travelClass}{e.overnightLikely ? " · overnight" : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mb-8 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">
            {c.visitedCount}/{c.visitedCount + c.neverVisitedCount}
          </div>
          <div className="ep-stat-label">Counties visited</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{c.neverVisitedCount}</div>
          <div className="ep-stat-label">Never visited</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{c.deltaGapCount}</div>
          <div className="ep-stat-label">Delta gaps</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{c.tier1RevisitDue}</div>
          <div className="ep-stat-label">Tier 1 revisit due</div>
        </div>
      </div>

      <div className="mb-8 ep-card">
        <h3 className="font-heading font-bold">Top county priority queue</h3>
        <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
          Fill open calendar days from this queue + locked trips — not the Forward Motion intelligence feed.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--ep-border)] text-left text-xs uppercase tracking-wide text-[var(--ep-navy-muted)]">
                <th className="pb-2 pr-3">#</th>
                <th className="pb-2 pr-3">County</th>
                <th className="pb-2 pr-3">VCI</th>
                <th className="pb-2 pr-3">Visits</th>
                <th className="pb-2 pr-3">Days since</th>
                <th className="pb-2 pr-3">Category</th>
                <th className="pb-2">Score</th>
              </tr>
            </thead>
            <tbody>
              {c.priorityQueue.map((r, i) => (
                <tr key={r.county} className="border-b border-[var(--ep-border)] last:border-0">
                  <td className="py-2 pr-3">{i + 1}</td>
                  <td className="py-2 pr-3 font-medium">{r.county}</td>
                  <td className="py-2 pr-3">{r.vciRank ?? "—"}</td>
                  <td className="py-2 pr-3">{r.visitCount}</td>
                  <td className="py-2 pr-3">{r.daysSinceLastVisit ?? "—"}</td>
                  <td className="py-2 pr-3 text-xs">{r.planningCategory.replace(/_/g, " ")}</td>
                  <td className="py-2">{r.priorityScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <div className="ep-card">
          <h3 className="font-heading font-bold">Delta gaps (never visited)</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {c.deltaGapCounties.map((r) => (
              <li key={r.county}>
                <span className="font-medium">{r.county}</span>
                <span className="text-[var(--ep-navy-muted)]"> · VCI {r.vciRank ?? "—"}</span>
                <p className="mt-0.5 text-xs text-[var(--ep-navy-muted)]">{r.recommendedAction}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="ep-card">
          <h3 className="font-heading font-bold">Tier 1 revisit due</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {c.tier1RevisitQueue.map((r) => (
              <li key={r.county}>
                <span className="font-medium">{r.county}</span>
                <span className="text-[var(--ep-navy-muted)]">
                  {" "}
                  · {r.visitCount} visits · last {r.lastVisitDate ?? "date uncertain"}
                </span>
                <p className="mt-0.5 text-xs text-[var(--ep-navy-muted)]">{r.recommendedAction}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <div className="ep-card">
          <h3 className="font-heading font-bold">Visited counties ({c.visitedCount})</h3>
          <div className="mt-3 flex flex-wrap gap-1">
            {c.visitedCounties.map((row) => (
              <span key={row.county} className="ep-county-chip ep-county-chip-visited" title={`VCI ${row.vciRank ?? "—"} · ${row.visitCount} visits`}>
                {row.county} ({row.visitCount})
              </span>
            ))}
          </div>
        </div>
        <div className="ep-card">
          <h3 className="font-heading font-bold">Never visited ({c.neverVisitedCount})</h3>
          <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">Showing highest-priority gaps first</p>
          <div className="mt-3 flex flex-wrap gap-1">
            {[...c.neverVisitedCounties]
              .sort((a, b) => b.priorityScore - a.priorityScore)
              .slice(0, 32)
              .map((row) => (
                <span key={row.county} className="ep-county-chip">
                  {row.county}
                </span>
              ))}
          </div>
        </div>
      </div>

      {s.tier1RevisitStatus.length > 0 ? (
        <div className="ep-card mb-8">
          <h3 className="font-heading font-bold">Tier 1 revisit status</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--ep-border)] text-left text-xs uppercase tracking-wide text-[var(--ep-navy-muted)]">
                  <th className="pb-2 pr-3">County</th>
                  <th className="pb-2 pr-3">Last visit</th>
                  <th className="pb-2 pr-3">Next locked</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {s.tier1RevisitStatus.map((t) => (
                  <tr key={t.county} className="border-b border-[var(--ep-border)] last:border-0">
                    <td className="py-2 pr-3 font-medium">{t.county}</td>
                    <td className="py-2 pr-3">{t.lastVisitDate ?? "—"}</td>
                    <td className="py-2 pr-3 text-xs">{t.nextLockedEvent ?? "—"}</td>
                    <td className="py-2 text-xs">{t.status.replace(/_/g, " ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {s.topOpenRecommendations.length > 0 ? (
        <div className="ep-card mb-8">
          <h3 className="font-heading font-bold">Top open-day recommendations</h3>
          <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">Weekends post-debate · not Kelly&apos;s confirmed calendar</p>
          <ul className="mt-3 space-y-2 text-sm">
            {s.topOpenRecommendations.slice(0, 5).map((r) => (
              <li key={`${r.date}-${r.county}`}>
                <span className="font-medium">{r.date}</span>
                <span className="text-[var(--ep-navy-muted)]">
                  {" "}
                  · {r.city}, {r.county} · score {r.score} · {r.travelClass}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {data.calendarFillPhaseA.corridorCount > 0 ? (
        <div className="ep-card mb-8 border-l-4 border-[var(--ep-gold)]">
          <h3 className="font-heading font-bold">Calendar Fill Phase A</h3>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{data.calendarFillPhaseA.disclaimer}</p>
          <div className="mt-4 ep-stat-grid">
            <div className="ep-stat">
              <div className="ep-stat-value">{data.calendarFillPhaseA.corridorCount}</div>
              <div className="ep-stat-label">Completion corridors</div>
            </div>
            <div className="ep-stat">
              <div className="ep-stat-value">{data.calendarFillPhaseA.remainingCountyCount}</div>
              <div className="ep-stat-label">Counties grouped</div>
            </div>
            <div className="ep-stat">
              <div className="ep-stat-value">{data.calendarFillPhaseA.openWeekendCount}</div>
              <div className="ep-stat-label">Open weekends</div>
            </div>
            <div className="ep-stat">
              <div className="ep-stat-value">{data.calendarFillPhaseA.datesAssigned ? "Yes" : "No"}</div>
              <div className="ep-stat-label">Dates assigned</div>
            </div>
          </div>
          {data.calendarFillPhaseA.topWeekendTradeoffs.length > 0 ? (
            <div className="mt-4">
              <h4 className="text-sm font-bold">Top weekend tradeoffs</h4>
              <ul className="mt-2 space-y-2 text-sm">
                {data.calendarFillPhaseA.topWeekendTradeoffs.map((t) => (
                  <li key={t.weekend}>
                    <span className="font-medium">{t.weekend}</span>
                    <span className="text-[var(--ep-navy-muted)]">
                      {" "}
                      · A: {t.optionA} vs B: {t.optionB}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {data.calendarFillPhaseA.septemberGate.length > 0 ? (
            <div className="mt-4">
              <h4 className="text-sm font-bold">September readiness gate</h4>
              <ul className="mt-2 space-y-1 text-xs">
                {data.calendarFillPhaseA.septemberGate.slice(0, 5).map((g) => (
                  <li key={g.criterion}>
                    <span className="font-medium uppercase">{g.status}</span> — {g.criterion}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {data.calendarFillPhaseB.proposedBlockCount > 0 ? (
        <div className="ep-card mb-8 border-l-4 border-amber-500">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-heading font-bold">Calendar Fill Phase B</h3>
            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold uppercase text-amber-900">
              Proposed — leadership approval required
            </span>
          </div>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{data.calendarFillPhaseB.disclaimer}</p>
          <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{data.calendarFillPhaseB.strategyLabel}</p>
          <div className="mt-4 ep-stat-grid">
            <div className="ep-stat">
              <div className="ep-stat-value">{data.calendarFillPhaseB.proposedTotalAfterFill}/75</div>
              <div className="ep-stat-label">Proposed coverage</div>
            </div>
            <div className="ep-stat">
              <div className="ep-stat-value">{data.calendarFillPhaseB.proposedBlockCount}</div>
              <div className="ep-stat-label">Proposed blocks</div>
            </div>
            <div className="ep-stat">
              <div className="ep-stat-value">{data.calendarFillPhaseB.deltaCountiesScheduled}</div>
              <div className="ep-stat-label">Delta in proposal</div>
            </div>
            <div className="ep-stat">
              <div className="ep-stat-value">{data.calendarFillPhaseB.stillMissingAfterFill}</div>
              <div className="ep-stat-label">Still missing</div>
            </div>
          </div>
          {data.calendarFillPhaseB.proposedBlocks.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--ep-border)] text-left text-xs uppercase tracking-wide text-[var(--ep-navy-muted)]">
                    <th className="pb-2 pr-3">Dates</th>
                    <th className="pb-2 pr-3">Block</th>
                    <th className="pb-2 pr-3">New</th>
                    <th className="pb-2">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {data.calendarFillPhaseB.proposedBlocks.map((b) => (
                    <tr key={b.startDate + b.label} className="border-b border-[var(--ep-border)] last:border-0">
                      <td className="py-2 pr-3 whitespace-nowrap text-xs">
                        {b.startDate}
                        {b.endDate !== b.startDate ? `–${b.endDate.slice(5)}` : ""}
                      </td>
                      <td className="py-2 pr-3">{b.label}</td>
                      <td className="py-2 pr-3 text-xs">{b.countiesNew.join(", ") || "—"}</td>
                      <td className="py-2 text-xs">{b.category.replace(/_/g, " ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          {data.calendarFillPhaseB.tier1RevisitsProposed.length > 0 ? (
            <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">
              Tier 1 revisits in proposal: {data.calendarFillPhaseB.tier1RevisitsProposed.join(" · ")}
            </p>
          ) : null}
        </div>
      ) : null}

      {data.calendarFillPhaseC.mustHitCountyCount > 0 ? (
        <div className="ep-card mb-8 border-l-4 border-blue-600">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-heading font-bold">Calendar Fill Phase C</h3>
            <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold uppercase text-blue-900">
              Operational lock review — not final
            </span>
          </div>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{data.calendarFillPhaseC.disclaimer}</p>
          <div className="mt-4 ep-stat-grid">
            <div className="ep-stat">
              <div className="ep-stat-value">{data.calendarFillPhaseC.mustHitCountyCount}</div>
              <div className="ep-stat-label">Must-hit counties</div>
            </div>
            <div className="ep-stat">
              <div className="ep-stat-value">{data.calendarFillPhaseC.bonusCountyCount}</div>
              <div className="ep-stat-label">Bonus-if-time</div>
            </div>
            <div className="ep-stat">
              <div className="ep-stat-value">{data.calendarFillPhaseC.conditionalBlocksResolved}</div>
              <div className="ep-stat-label">Conditional resolved</div>
            </div>
            <div className="ep-stat">
              <div className="ep-stat-value">{data.calendarFillPhaseC.leadershipDecisionsPending}</div>
              <div className="ep-stat-label">Decisions pending</div>
            </div>
          </div>
          <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">
            {data.calendarFillPhaseC.pathwayMustHit} · {data.calendarFillPhaseC.pathwayFull}
          </p>
          {data.calendarFillPhaseC.refinedBlocks.some((b) => b.approvalStatus === "conditional_resolved") ? (
            <div className="mt-4">
              <h4 className="text-sm font-bold">Phase C refinements</h4>
              <ul className="mt-2 space-y-1 text-xs">
                {data.calendarFillPhaseC.refinedBlocks
                  .filter((b) => b.approvalStatus === "conditional_resolved")
                  .map((b) => (
                    <li key={b.id}>
                      <span className="font-medium">{b.label}</span>
                      {b.mustHitCounties.length > 0 ? (
                        <span className="text-[var(--ep-navy-muted)]">
                          {" "}
                          — must-hit: {b.mustHitCounties.join(", ")}
                          {b.bonusIfTimeCounties.length > 0
                            ? ` · bonus: ${b.bonusIfTimeCounties.join(", ")}`
                            : ""}
                        </span>
                      ) : null}
                    </li>
                  ))}
              </ul>
            </div>
          ) : null}
          {data.calendarFillPhaseC.timeAudits.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <h4 className="text-sm font-bold">Kelly time allocation audit</h4>
              <table className="mt-2 w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--ep-border)] text-left text-xs uppercase tracking-wide text-[var(--ep-navy-muted)]">
                    <th className="pb-2 pr-3">Block</th>
                    <th className="pb-2 pr-3">Candidate</th>
                    <th className="pb-2 pr-3">Travel</th>
                    <th className="pb-2 pr-3">Event</th>
                    <th className="pb-2 pr-3">Relationship</th>
                    <th className="pb-2">Density</th>
                  </tr>
                </thead>
                <tbody>
                  {data.calendarFillPhaseC.timeAudits.map((a) => (
                    <tr key={a.blockId} className="border-b border-[var(--ep-border)] last:border-0">
                      <td className="py-2 pr-3 text-xs">{a.block}</td>
                      <td className="py-2 pr-3 text-xs">{a.candidateHours}h</td>
                      <td className="py-2 pr-3 text-xs">{a.travelHours}h</td>
                      <td className="py-2 pr-3 text-xs">{a.eventHours}h</td>
                      <td className="py-2 pr-3 text-xs">{a.relationshipHours}h</td>
                      <td className="py-2 text-xs capitalize">{a.relationshipDensity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      ) : null}

      <p className="text-xs text-[var(--ep-navy-muted)]">{c.doctrine}</p>
    </section>
  );
}

/** PASS-17 Deliverable 5 — Coalition Command Center */
export function CoalitionCommandPanel({ data }: Props) {
  const c = data.coalitionPowerMap;
  const tracks = [
    { label: "NAACP", called: c.naacp.called, total: c.naacp.branchesTotal, meetings: c.naacp.meetingsRequested, speaking: c.naacp.speakingScheduled },
    { label: "Labor", called: c.labor.contacted, total: c.labor.unionsTotal, meetings: c.labor.meetingsCompleted, speaking: c.labor.endorsementsInProgress },
    { label: "AEA / Teachers", called: c.aea.teacherSupporters, total: c.aea.countiesActive, meetings: c.aea.meetingsCompleted, speaking: 0 },
    { label: "Muslim community", called: c.muslim.contactsTotal, total: c.muslim.contactsTotal, meetings: c.muslim.meetingsOpen, speaking: c.muslim.meetingsRequested },
    { label: "Hispanic outreach", called: 0, total: 0, meetings: 0, speaking: 0, note: c.hispanic.frameworkStatus },
    { label: "Current officials", called: c.electedOfficials.contacted, total: c.electedOfficials.total, meetings: c.electedOfficials.meetingsCompleted, speaking: c.electedOfficials.introductionsRequested },
    { label: "Former officials", called: c.pastOfficials.engaged, total: c.pastOfficials.total, meetings: 0, speaking: 0 },
    { label: "Candidate partnerships", called: c.candidates.activePartnerships, total: c.candidates.activePartnerships, meetings: c.candidates.sharedEvents, speaking: c.candidates.jointMobilize },
  ];

  return (
    <section>
      <SectionTitle title="Coalition Command Center" subtitle={c.heroLine} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tracks.map((t) => (
          <div key={t.label} className="ep-card text-sm">
            <h4 className="font-heading font-bold">{t.label}</h4>
            {"note" in t && t.note ? (
              <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">{String(t.note)}</p>
            ) : (
              <dl className="mt-2 space-y-1">
                <div className="flex justify-between">
                  <dt className="text-[var(--ep-navy-muted)]">Contacted</dt>
                  <dd className="font-semibold">{t.called}{t.total ? ` / ${t.total}` : ""}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--ep-navy-muted)]">Meetings</dt>
                  <dd className="font-semibold">{t.meetings}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--ep-navy-muted)]">Events / intros</dt>
                  <dd className="font-semibold">{t.speaking}</dd>
                </div>
              </dl>
            )}
          </div>
        ))}
      </div>
      <div className="mt-6 ep-card">
        <h3 className="font-heading font-bold">Endorsement pipeline (linked)</h3>
        <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
          {data.endorsementAcquisition.requested} requested · {data.endorsementAcquisition.endorsed} endorsed ·{" "}
          {data.endorsementAcquisition.activated} activated · {data.endorsementAcquisition.volunteerLeadsGenerated}{" "}
          volunteer leads
        </p>
      </div>
    </section>
  );
}

/** PASS-17 Deliverable 6 — Sherwood Victory Center */
export function SherwoodVictoryPanel({ data }: Props) {
  const s = data.coalitionPowerMap.sherwood;
  const w = data.warRoom;
  const [sherwoodVolunteersOpen, setSherwoodVolunteersOpen] = useState(false);
  return (
    <section>
      <SectionTitle title="Sherwood Victory Center" subtitle="Flagship home-base event · 60%+ win goal" />
      <div className="ep-warning mb-8">
        <p className="text-lg font-semibold">{s.goal}</p>
        <p className="mt-2 text-sm">Outdoor · 700+ capacity · VIP $1,000 · show $25 · food $25 · July 3–4 corridor</p>
      </div>
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <ProgressStat label="VIP tables sold" value={w.sherwoodVipSold} goal={w.sherwoodVipGoal} />
        <ProgressStat label="Tickets sold" value={w.sherwoodTicketsSold} goal={700} />
        <ProgressStat
          label="Sherwood volunteers"
          value={w.sherwoodVolunteers}
          goal={50}
          onClick={() => setSherwoodVolunteersOpen((open) => !open)}
          expanded={sherwoodVolunteersOpen}
        >
          <VolunteerLeaderRoster
            leaders={w.sherwoodVolunteersRoster}
            subtitle={`${w.sherwoodVolunteers} confirmed · contact details coming later`}
          />
        </ProgressStat>
      </div>
      <div className="ep-card">
        <h3 className="font-heading font-bold">Activation checklist</h3>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-[var(--ep-navy-muted)]">
          <li>Mobilize event draft — human approval before publish</li>
          <li>Facebook event draft — human approval</li>
          <li>Media advisory — local papers + radio</li>
          <li>VIP table outreach — 20 tables @ $1,000</li>
          <li>Volunteer shift signup for event day</li>
          <li>Story capture plan — Substack + social same day</li>
        </ul>
      </div>
    </section>
  );
}

/** PASS-17 Deliverable 7 — Social Media Resume */
export function SocialResumePanel({ data }: Props) {
  const m = data.motionPresence;
  return (
    <section>
      <SectionTitle
        title="Social Media Resume"
        subtitle="September voters should see proof Kelly has been working statewide for months"
      />
      <div className="mb-8 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{m.countiesVisited}</div>
          <div className="ep-stat-label">Counties highlighted</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{m.storiesPublished}</div>
          <div className="ep-stat-label">Stories published</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{m.localBusinessesHighlighted}</div>
          <div className="ep-stat-label">Businesses featured</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{m.peopleSpotlighted}</div>
          <div className="ep-stat-label">Community leaders featured</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{m.videosPublished}</div>
          <div className="ep-stat-label">Videos posted</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{m.socialPostsPublished}</div>
          <div className="ep-stat-label">Social posts</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{m.substackPublished}</div>
          <div className="ep-stat-label">Substack features</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{m.goal}</div>
          <div className="ep-stat-label">Story goal</div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="mb-3 font-heading font-bold">Story categories</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {m.storyCategories.map((cat) => (
            <div key={cat.id} className="ep-card text-sm">
              <div className="flex justify-between">
                <span className="font-semibold">{cat.label}</span>
                <span>
                  {cat.count} / {cat.goal}
                </span>
              </div>
              <div className="ep-progress mt-2">
                <div
                  className="ep-progress-bar"
                  style={{ width: `${cat.goal ? Math.min(100, (cat.count / cat.goal) * 100) : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ep-card">
        <h3 className="font-heading font-bold">Upcoming story opportunities</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {data.forwardMotion.stops.slice(0, 8).map((stop) => (
            <li key={stop.eventId}>
              {stop.date} · {stop.eventName} — {stop.county} · {stop.storyWorkflowStatus.replace(/_/g, " ")}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
