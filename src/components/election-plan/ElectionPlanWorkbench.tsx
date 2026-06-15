"use client";

import Link from "next/link";
import { useState } from "react";

import type { ElectionPlanWorkbenchSnapshot } from "@/lib/election-plan/types";
import { formatPct, formatBudget, formatVotes } from "@/lib/election-plan/electionPlanData";
import { CityStrategyGrid } from "@/components/election-plan/CityStrategyGrid";
import { CountyStrategyGrid } from "@/components/election-plan/CountyStrategyGrid";
import { ExecutiveMetricCard } from "@/components/election-plan/ExecutiveMetricCard";
import { cn } from "@/lib/utils";

import {
  CampaignTimelinePanel,
  CoalitionCommandPanel,
  PresenceMapPanel,
  SherwoodVictoryPanel,
  SocialResumePanel,
  WarRoomPanel,
  WeekOperationalPanel,
} from "@/components/election-plan/WarRoomPanels";
import { ExecutiveBookHubPanel } from "@/components/election-plan/executive-book/ExecutiveBookHubPanel";

const TAB_GROUPS = [
  {
    label: "Command Center",
    tabs: [
      { id: "warRoom", label: "Executive War Room" },
      { id: "executiveBook", label: "Executive Book" },
      { id: "weeklyDashboard", label: "Weekly Dashboard" },
      { id: "fieldCalendar", label: "Field Calendar" },
      { id: "weekPlans", label: "Week Plans" },
      { id: "timeline", label: "20-Week Timeline" },
      { id: "presenceMap", label: "Coverage Reality" },
      { id: "coalitionCommand", label: "Coalition Command" },
      { id: "sherwoodVictory", label: "Sherwood Victory" },
      { id: "socialResume", label: "Social Resume" },
    ],
  },
  {
    label: "Strategy & Playbooks",
    tabs: [
      { id: "executive", label: "Executive Mission" },
      { id: "howWeWin", label: "How We Win" },
      { id: "fourLanes", label: "Four Lanes" },
      { id: "battlefield", label: "Arkansas Battlefield" },
      { id: "top40", label: "Top 40 Cities" },
      { id: "top10", label: "Top 10 Cities" },
      { id: "countyPlaybooks", label: "County Playbooks" },
      { id: "volunteerLeadership", label: "Volunteer Leadership" },
      { id: "endorsements", label: "Endorsements" },
      { id: "forwardMotion", label: "Forward Motion" },
    ],
  },
] as const;

type TabId = (typeof TAB_GROUPS)[number]["tabs"][number]["id"];

const TAB_IDS = new Set(
  TAB_GROUPS.flatMap((g) => g.tabs.map((t) => t.id)),
);

function parseTabId(value: string | undefined): TabId {
  if (value && TAB_IDS.has(value as TabId)) return value as TabId;
  return "warRoom";
}

type Props = {
  data: ElectionPlanWorkbenchSnapshot;
  initialTab?: string;
};

export function ElectionPlanWorkbench({ data, initialTab }: Props) {
  return (
    <>
      <div className="ep-classification">{data.classification}</div>

      <header className="ep-hero px-6 py-12 lg:px-10 lg:py-16">
        <div className="relative mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ep-gold)]">
            Kelly Grappe Victory Plan
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-white lg:text-5xl">
            Executive War Room
          </h1>
          <p className="mt-2 text-lg text-white/90 lg:text-xl">Arkansas Plurality Strategy · 20-Week Activation</p>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/75 lg:text-base">{data.hero.tagline}</p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.hero.metrics.map((m) => (
              <ExecutiveMetricCard key={m.label} label={m.label} value={m.value} detail={m.detail} variant="hero" />
            ))}
          </div>

          <p className="mt-6 text-xs text-white/45">
            Snapshot generated {new Date(data.generatedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
      </header>

      <TabWorkbench data={data} initialTab={initialTab} />
    </>
  );
}

function TabWorkbench({ data, initialTab }: Props) {
  const [active, setActive] = useState<TabId>(() => parseTabId(initialTab));

  return (
    <div className="ep-shell">
      <nav className="ep-sidebar" aria-label="Plan sections">
        <div className="hidden px-4 pb-3 lg:block">
          <div className="font-heading text-sm font-bold text-[var(--ep-navy)]">Victory Plan</div>
          <p className="mt-0.5 text-[0.625rem] uppercase tracking-wide text-[var(--ep-navy-muted)]">20 sections</p>
        </div>
        <div className="flex gap-1 overflow-x-auto px-2 lg:flex-col lg:overflow-visible lg:px-0">
          {TAB_GROUPS.map((group) => (
            <div key={group.label} className="shrink-0 lg:shrink">
              <div className="ep-nav-group-label hidden px-4 py-2 lg:block">{group.label}</div>
              {group.tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className="ep-nav-item shrink-0 whitespace-nowrap lg:whitespace-normal"
                  data-active={active === tab.id}
                  onClick={() => setActive(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      </nav>

      <main className="ep-content">
        {active === "warRoom" && <WarRoomPanel data={data} />}
        {active === "executiveBook" && <ExecutiveBookHubPanel data={data} />}
        {active === "weeklyDashboard" && <KellyDashboardPanel data={data} />}
        {active === "fieldCalendar" && <ExecutiveCalendarPanel data={data} />}
        {active === "weekPlans" && <WeekOperationalPanel data={data} />}
        {active === "timeline" && <CampaignTimelinePanel data={data} />}
        {active === "presenceMap" && <PresenceMapPanel data={data} />}
        {active === "coalitionCommand" && <CoalitionCommandPanel data={data} />}
        {active === "sherwoodVictory" && <SherwoodVictoryPanel data={data} />}
        {active === "socialResume" && <SocialResumePanel data={data} />}
        {active === "executive" && <ExecutivePanel data={data} />}
        {active === "howWeWin" && <HowWeWinPanel data={data} />}
        {active === "fourLanes" && <FourLanesPanel data={data} />}
        {active === "battlefield" && <BattlefieldPanel data={data} />}
        {active === "top40" && <Top40Panel data={data} />}
        {active === "top10" && <Top10Panel data={data} />}
        {active === "countyPlaybooks" && <CountiesPanel data={data} />}
        {active === "volunteerLeadership" && <PeoplePowerPanel data={data} />}
        {active === "endorsements" && <EndorsementAcquisitionPanel data={data} />}
        {active === "forwardMotion" && <ForwardMotionPanel data={data} />}
      </main>
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{subtitle}</p> : null}
    </div>
  );
}

function KellyDashboardPanel({ data }: Props) {
  const d = data.candidateDashboard;
  const b = data.executiveBookV1.campaignBudget;
  return (
    <section>
      <SectionTitle
        title="Weekly Dashboard"
        subtitle={`Week ${d.currentWeek} · ${d.weekRange} — good morning, Kelly`}
      />
      <div className="ep-card mb-8 border-l-4 border-[var(--ep-gold)]">
        <h3 className="font-heading font-bold">Campaign Budget — Fundraising Targets</h3>
        <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{b.disclaimer}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="ep-stat">
            <div className="ep-stat-value">{formatBudget(b.workingCampaignTarget)}</div>
            <div className="ep-stat-label">Working campaign target</div>
          </div>
          <div className="ep-stat">
            <div className="ep-stat-value">{formatBudget(b.monthlyBurnWorking)}</div>
            <div className="ep-stat-label">Monthly burn (~)</div>
          </div>
          <div className="ep-stat">
            <div className="ep-stat-value">{formatBudget(b.salaryFloor)}</div>
            <div className="ep-stat-label">Salary floor</div>
          </div>
        </div>
        <p className="mt-4 text-sm">
          <a href={b.chapterHref} className="ep-chapter-link">
            Open Executive Book Chapter 7 →
          </a>
        </p>
      </div>
      {data.executiveBookV1.weeklyScorecard.length > 0 ? (
        <div className="ep-card mb-8 border-l-4 border-[var(--ep-navy)]">
          <h3 className="font-heading font-bold">Campaign Health Scorecard</h3>
          <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
            Executive Book V1.0 · Monday review · Labor Day gate {data.executiveBookV1.laborDayDeadline}
            {data.executiveBookV1.unassignedOwners > 0
              ? ` · ${data.executiveBookV1.unassignedOwners} ownership slots TBD`
              : ""}
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--ep-border)] text-left text-xs uppercase tracking-wide text-[var(--ep-navy-muted)]">
                  <th className="pb-2 pr-3">Metric</th>
                  <th className="pb-2 pr-3">Goal</th>
                  <th className="pb-2">Current</th>
                </tr>
              </thead>
              <tbody>
                {data.executiveBookV1.weeklyScorecard.map((row) => (
                  <tr key={row.metric} className="border-b border-[var(--ep-border)] last:border-0">
                    <td className="py-2 pr-3">{row.metric}</td>
                    <td className="py-2 pr-3">{row.goal}</td>
                    <td className="py-2 font-semibold">{row.actual}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="ep-stat">
          <div className="ep-stat-value">{d.weeksRemaining}</div>
          <div className="ep-stat-label">Weeks remaining</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(d.projectedVotes)}</div>
          <div className="ep-stat-label">Projected votes</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(d.lane2Potential)}</div>
          <div className="ep-stat-label">Lane 2 potential</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(d.registrationGoal)}</div>
          <div className="ep-stat-label">Registration goal</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">
            {d.countiesCovered} / {d.countiesTotal}
          </div>
          <div className="ep-stat-label">Counties in upcoming queue</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{d.upcomingStops}</div>
          <div className="ep-stat-label">Upcoming stops (7 days)</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">
            {d.volunteerLeadersCurrent} / {d.volunteerLeadersGoal}
          </div>
          <div className="ep-stat-label">Volunteer leaders</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{d.sherwoodGoal}</div>
          <div className="ep-stat-label">
            Sherwood · VIP {d.sherwoodVipSold}/{d.sherwoodVipGoal}
          </div>
        </div>
      </div>
      <div className="ep-card">
        <h3 className="font-heading font-bold">Top priorities this week</h3>
        <ol className="mt-3 list-inside list-decimal space-y-2 text-sm text-[var(--ep-navy-muted)]">
          {d.topPrioritiesThisWeek.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ol>
      </div>
      <p className="mt-6 text-sm text-[var(--ep-navy-muted)]">
        Full operating doc: <code className="text-xs">MONDAY-MORNING-OPERATING-DOC.md</code> · Week 1 plan in 20 Week Plan tab
      </p>
    </section>
  );
}

function HowWeWinPanel({ data }: Props) {
  return (
    <section>
      <SectionTitle title="How We Win" subtitle="Plurality · three candidates · recovery before persuasion" />
      <div className="ep-card-glass mb-8 text-sm leading-relaxed text-[var(--ep-navy-muted)]">
        <p>{data.executive.summary}</p>
        <p className="mt-4">
          We do not need 498,963 votes. We need the <strong>largest coalition</strong> in a three-way race. Recover{" "}
          <strong>102,070 missing Democrats</strong> · register <strong>50,000</strong> · build relationships in all 75
          counties · win Sherwood at <strong>60%+</strong>.
        </p>
      </div>
      <TheoryPanel data={data} />
    </section>
  );
}

function FourLanesPanel({ data }: Props) {
  return (
    <section>
      <SectionTitle title="Four Lanes" subtitle="All four move simultaneously" />
      <div className="grid gap-4 lg:grid-cols-2">
        {data.theoryOfVictory.lanes.map((lane) => (
          <div key={lane.id} className="ep-card ep-lane-card">
            <h3 className="font-heading text-lg font-bold">{lane.name}</h3>
            <div className="mt-1 font-heading text-2xl font-bold text-[var(--ep-navy)]">{formatVotes(lane.goal)}</div>
            {lane.potential ? (
              <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">Pool: {formatVotes(lane.potential)}</p>
            ) : null}
            <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{lane.note}</p>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <MathPanel data={data} />
      </div>
    </section>
  );
}

function BattlefieldPanel({ data }: Props) {
  return (
    <section>
      <SectionTitle title="Arkansas Battlefield" subtitle="Nine clusters · 75 counties · VCI-ranked missions" />
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.execution.clusters.map((c) => (
          <div key={c.id} className="ep-card text-sm">
            <h4 className="font-heading font-bold">{c.name}</h4>
            <p className="mt-1 text-[var(--ep-navy-muted)]">{c.counties.join(" · ")}</p>
            <p className="mt-2 font-semibold">VCI {formatVotes(c.vci)} · {(c.shareOfExpected * 100).toFixed(1)}% of expected</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Top40Panel({ data }: Props) {
  return (
    <section>
      <SectionTitle title="Top 40 Cities" subtitle={`${formatVotes(data.top40TargetVotes)} vote target`} />
      <CityStrategyGrid
        cities={data.cities}
        top10TargetVotes={data.top10TargetVotes}
        top40TargetVotes={data.top40TargetVotes}
        initialTop10Only={false}
      />
    </section>
  );
}

function Top10Panel({ data }: Props) {
  const top10 = data.cities.filter((c) => c.isTop10);
  return (
    <section>
      <SectionTitle title="Top 10 Cities" subtitle={`${formatVotes(data.top10TargetVotes)} deep-dive target`} />
      <CityStrategyGrid cities={top10} top10TargetVotes={data.top10TargetVotes} top40TargetVotes={data.top40TargetVotes} />
    </section>
  );
}

function SherwoodPanel({ data }: Props) {
  const s = data.coalitionPowerMap.sherwood;
  return (
    <section>
      <SectionTitle title="Sherwood 60%+" subtitle="Home-base GOTV · Central Arkansas momentum" />
      <div className="ep-warning mb-8">
        <p className="font-medium">{s.goal}</p>
        <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
          Outdoor event · 700+ capacity · VIP $1,000 · show $25 · food $25 · July 3–4 corridor
        </p>
      </div>
      <div className="ep-stat-grid mb-8">
        <div className="ep-stat">
          <div className="ep-stat-value">
            {s.vipTablesSold} / {s.vipTablesGoal}
          </div>
          <div className="ep-stat-label">VIP tables sold</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{s.ticketsSold}</div>
          <div className="ep-stat-label">Tickets sold</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{s.status}</div>
          <div className="ep-stat-label">Status</div>
        </div>
      </div>
      <ForwardMotionPanel data={data} />
    </section>
  );
}

function TwentyWeekPlanPanel({ data }: Props) {
  const [selected, setSelected] = useState(1);
  const week = data.weekPlans.find((w) => w.weekNumber === selected) ?? data.weekPlans[0];
  return (
    <section>
      <SectionTitle title="20 Week Plan" subtitle="Weeks 1–4 operational · Weeks 5–20 framework" />
      <p className="mb-6 text-sm text-[var(--ep-navy-muted)]">{data.execution.lockNotice}</p>
      <div className="mb-6 flex flex-wrap gap-1">
        {data.weekPlans.map((w) => (
          <button
            key={w.weekNumber}
            type="button"
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold",
              selected === w.weekNumber
                ? "bg-[var(--ep-navy)] text-white"
                : "bg-[var(--ep-cream)] text-[var(--ep-navy-muted)]",
            )}
            onClick={() => setSelected(w.weekNumber)}
          >
            W{w.weekNumber}
          </button>
        ))}
      </div>
      {week ? (
        <div className="ep-card">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-heading text-xl font-bold">Week {week.weekNumber}</h3>
            <span className="text-sm uppercase tracking-wide text-[var(--ep-gold)]">{week.status}</span>
          </div>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{week.range}</p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[var(--ep-navy-muted)]">Cluster</dt>
              <dd className="font-semibold">{week.cluster}</dd>
            </div>
            <div>
              <dt className="text-[var(--ep-navy-muted)]">Focus</dt>
              <dd className="font-semibold">{week.focus}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[var(--ep-navy-muted)]">Cities</dt>
              <dd className="font-semibold">{week.cities.join(" · ")}</dd>
            </div>
            {week.events && week.events.length > 0 ? (
              <div className="sm:col-span-2">
                <dt className="text-[var(--ep-navy-muted)]">Events</dt>
                <dd className="mt-1">{week.events.join(" · ")}</dd>
              </div>
            ) : null}
          </dl>
          <p className="mt-4 text-xs text-[var(--ep-navy-muted)]">
            Full week file:{" "}
            <code>
              part-iv-twenty-week-execution/.../week-{String(week.weekNumber).padStart(2, "0")}.md
            </code>
          </p>
        </div>
      ) : null}
      <div className="mt-8">
        <ExecutionPanel data={data} />
      </div>
    </section>
  );
}

function ExecutivePanel({ data }: Props) {
  return (
    <section>
      <SectionTitle title="Executive Mission" subtitle="Why this plan wins · current constraints" />
      <p className="mb-6 max-w-3xl text-base leading-relaxed">{data.executive.summary}</p>

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.executive.cards.map((c) => (
          <ExecutiveMetricCard key={c.label} label={c.label} value={c.value} detail={c.detail} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="ep-card">
          <h3 className="font-heading font-bold">Campaign Brain status</h3>
          <p className="mt-2 text-sm">{data.executive.brainStatus}</p>
        </div>
        <div className="ep-warning">
          <h3 className="font-heading font-bold text-[var(--ep-accent)]">Calendar Truth requirement</h3>
          <p className="mt-2 text-sm">{data.executive.calendarTruthRequirement}</p>
        </div>
      </div>

      <ul className="mt-6 space-y-2">
        {data.executive.constraints.map((c) => (
          <li key={c} className="flex gap-2 text-sm">
            <span className="text-[var(--ep-gold)]">▸</span>
            {c}
          </li>
        ))}
      </ul>
    </section>
  );
}

function TheoryPanel({ data }: Props) {
  return (
    <section>
      <SectionTitle title="Theory of Victory" subtitle="Four lanes · Big Table Democrat identity" />

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        {data.theoryOfVictory.lanes.map((lane) => (
          <div key={lane.id} className="ep-card ep-lane-card">
            <h3 className="font-heading text-lg font-bold">{lane.name}</h3>
            <div className="mt-1 font-heading text-2xl font-bold text-[var(--ep-navy)]">
              {formatVotes(lane.goal)}
              {lane.potential ? (
                <span className="ml-2 text-sm font-normal text-[var(--ep-navy-muted)]">
                  from {formatVotes(lane.potential)}
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{lane.note}</p>
          </div>
        ))}
      </div>

      <div className="ep-card-glass">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h3 className="font-heading text-xl font-bold">{data.theoryOfVictory.doctrine.title}</h3>
          <Link href="/election-plan/big-table-doctrine" className="text-xs font-semibold text-[var(--ep-gold)] hover:underline">
            Full doctrine →
          </Link>
        </div>
        <ul className="mt-4 space-y-2">
          {data.theoryOfVictory.doctrine.pillars.map((p) => (
            <li key={p} className="text-sm leading-relaxed">
              {p}
            </li>
          ))}
        </ul>
        <div className="mt-6 border-t border-[var(--ep-border)] pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-gold)]">Room at the table</p>
          <ul className="mt-2 grid gap-1 sm:grid-cols-2">
            {data.theoryOfVictory.doctrine.tableBeliefs.map((b) => (
              <li key={b} className="text-sm">
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function MathPanel({ data }: Props) {
  const m = data.electoralMath;
  return (
    <section>
      <SectionTitle title="Electoral Math" subtitle="Plurality path · scenario engine · drop-off recovery" />

      <blockquote className="mb-8 border-l-4 border-[var(--ep-gold)] pl-4 text-base italic leading-relaxed text-[var(--ep-navy-muted)]">
        {m.explanation}
      </blockquote>

      <div className="mb-8 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(m.baselineD)}</div>
          <div className="ep-stat-label">Baseline D floor</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(m.traditionalMajorityTarget)}</div>
          <div className="ep-stat-label">Old 50%+1 target</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">
            {formatVotes(m.pluralityRange.low)}–{formatVotes(m.pluralityRange.high)}
          </div>
          <div className="ep-stat-label">Plurality working range</div>
        </div>
      </div>

      <h3 className="mb-3 font-heading font-bold">Scenario engine</h3>
      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        {m.scenarios.map((s) => (
          <div
            key={s.label}
            className={cn("ep-card text-center", s.inPluralityRange && "ring-2 ring-[var(--ep-gold)]")}
          >
            <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">
              {s.label}
            </div>
            <div className="mt-1 font-heading text-3xl font-bold">{formatVotes(s.projectedVotes)}</div>
            {s.inPluralityRange ? (
              <div className="mt-1 text-xs font-medium text-[var(--ep-gold)]">In plurality range</div>
            ) : (
              <div className="mt-1 text-xs text-[var(--ep-navy-muted)]">Outside range</div>
            )}
          </div>
        ))}
      </div>

      <h3 className="mb-3 font-heading font-bold">Democratic drop-off</h3>
      <div className="ep-card overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            <DropRow label="2024 Presidential D" value={m.dropOff.presidential2024Dem} />
            <DropRow label="2022 Midterm SOS D" value={m.dropOff.midterm2022Dem} />
            <DropRow label="Raw drop-off" value={m.dropOff.rawDropOff} highlight />
            <DropRow label="Recovery @ 50%" value={m.dropOff.recovery50} highlight />
            <DropRow label="Recovery @ 75%" value={m.dropOff.recovery75} />
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DropRow({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <tr className="border-b border-[var(--ep-border)] last:border-0">
      <td className="py-2.5 pr-4 text-[var(--ep-navy-muted)]">{label}</td>
      <td className={cn("py-2.5 text-right font-heading font-bold", highlight && "text-[var(--ep-accent)]")}>
        {formatVotes(value)}
      </td>
    </tr>
  );
}

function CountiesPanel({ data }: Props) {
  return (
    <section>
      <SectionTitle title="County Strategy" subtitle="75 counties · VCI rank · coverage · guardrails" />
      <CountyStrategyGrid counties={data.counties} />
    </section>
  );
}

function CitiesPanel({ data }: Props) {
  return (
    <section>
      <SectionTitle title="City Strategy" subtitle="Top 40 Arkansas cities · Top 10 deep dives" />
      <CityStrategyGrid
        cities={data.cities}
        top10TargetVotes={data.top10TargetVotes}
        top40TargetVotes={data.top40TargetVotes}
      />
    </section>
  );
}

function BrainPanel({ data }: Props) {
  return (
    <section>
      <SectionTitle title="Campaign Brain" subtitle={data.campaignBrain.flow} />

      <div className="mb-8 ep-card-glass text-center">
        <p className="font-heading text-lg font-bold tracking-wide">{data.campaignBrain.flow}</p>
        <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
          The system turns strategic data into weekly decisions — not gut instinct.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {data.campaignBrain.modules.map((mod) => (
          <div key={mod.name} className="ep-card">
            <h3 className="font-heading font-bold">{mod.name}</h3>
            <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{mod.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CalendarPanel({ data }: Props) {
  const ct = data.calendarTruth;
  const verifiedPct = Math.min(100, (ct.verifiedEvents / ct.verifiedGoal) * 100);

  return (
    <section>
      <SectionTitle title="Calendar Truth" subtitle="Live governance state · Phase 9 gate" />

      <div className="ep-warning mb-8">
        <p className="font-heading text-base font-bold">{ct.warning}</p>
      </div>

      <div className="mb-6">
        <div className="mb-2 flex justify-between text-sm">
          <span>Verified events</span>
          <span className="font-bold">
            {ct.verifiedEvents} / {ct.verifiedGoal}+
          </span>
        </div>
        <div className="ep-progress">
          <div className="ep-progress-bar" style={{ width: `${verifiedPct}%` }} />
        </div>
      </div>

      <div className="mb-8 ep-stat-grid">
        <Stat label="Tentative" value={String(ct.tentativeEvents)} />
        <Stat label="Missing dates" value={String(ct.missingDates)} />
        <Stat label="County fairs" value={ct.countyFairsVerified} />
        <Stat label="Tier A events" value={ct.tierAEventsVerified} />
        <Stat label="County owners" value={ct.countyContactOwners} />
        <Stat label="Outcome reports" value={`${ct.outcomeReportPct}%`} />
      </div>

      <div className="ep-card mb-6">
        <div className="flex items-center justify-between">
          <span className="font-heading font-bold">Phase 9 — Lock Weeks 1–20</span>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-bold uppercase",
              ct.phase9Ready ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800",
            )}
          >
            {ct.phase9Ready ? "Ready" : "NO"}
          </span>
        </div>
      </div>

      <h3 className="mb-3 font-heading font-bold">Exit criteria</h3>
      <div className="space-y-2">
        {ct.exitCriteria.map((c) => (
          <div key={c.label} className="flex items-center justify-between ep-card py-3">
            <span className="text-sm">{c.label}</span>
            <span className="flex items-center gap-2 text-sm">
              <span className="font-medium">{c.current}</span>
              <span className={c.met ? "text-green-700" : "text-[var(--ep-accent)]"}>{c.met ? "✓" : "Open"}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="ep-stat">
      <div className="ep-stat-value text-xl">{value}</div>
      <div className="ep-stat-label">{label}</div>
    </div>
  );
}

function RelationshipPanel({ data }: Props) {
  const rc = data.relationshipCapital;
  return (
    <section>
      <SectionTitle title="Relationship Capital" subtitle="Fifth execution engine · physical trust" />

      <blockquote className="mb-6 border-l-4 border-[var(--ep-gold)] pl-4 font-heading text-lg italic">
        {rc.doctrine}
      </blockquote>

      <div className="mb-4 ep-stat">
        <div className="ep-stat-value">{rc.index}/100</div>
        <div className="ep-stat-label">Relationship Capital Index</div>
      </div>

      <h3 className="mb-3 font-heading font-bold">Physical assets</h3>
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {rc.assets.map((a) => (
          <div key={a.name} className="ep-card text-center">
            <div className="font-heading text-xl font-bold">
              {formatVotes(a.current)} / {formatVotes(a.goal)}
            </div>
            <div className="text-xs text-[var(--ep-navy-muted)]">{a.name}</div>
            <div className="ep-progress mt-2">
              <div
                className="ep-progress-bar"
                style={{ width: `${a.goal > 0 ? (a.current / a.goal) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <h3 className="mb-3 font-heading font-bold">Programs</h3>
      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        {rc.programs.map((p) => (
          <div key={p.name} className="ep-card">
            <div className="font-heading font-bold">{p.name}</div>
            <div className="mt-1 text-sm">
              {p.completed} done · {p.scheduled} scheduled · goal {formatVotes(p.goal)}
            </div>
          </div>
        ))}
      </div>

      <h3 className="mb-3 font-heading font-bold">Channels</h3>
      <ul className="grid gap-2 sm:grid-cols-2">
        {rc.channels.map((ch) => (
          <li key={ch} className="ep-card text-sm">
            {ch}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ExecutionPanel({ data }: Props) {
  return (
    <section>
      <SectionTitle title="20-Week Execution" subtitle="Phase 8 candidates · not locked" />

      <div className="ep-warning mb-8">
        <p className="text-sm font-medium">{data.execution.lockNotice}</p>
      </div>

      <h3 className="mb-3 font-heading font-bold">Top clusters</h3>
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.execution.clusters.map((c) => (
          <div key={c.id} className="ep-card">
            <div className="font-heading font-bold">{c.name}</div>
            <div className="mt-1 text-sm text-[var(--ep-navy-muted)]">{c.counties.join(" · ")}</div>
            <div className="mt-2 flex gap-4 text-xs">
              <span>VCI {formatVotes(c.vci)}</span>
              <span>{formatPct(c.shareOfExpected)} of expected</span>
              <span>{c.recommendedVisits} visits</span>
            </div>
          </div>
        ))}
      </div>

      <h3 className="mb-3 font-heading font-bold">Week candidates (Phase 8)</h3>
      <div className="space-y-2">
        {data.execution.weekCandidates.map((w) => (
          <div key={w.weekNumber} className="ep-card flex flex-wrap items-center justify-between gap-2 py-3">
            <div>
              <span className="font-heading font-bold">Week {w.weekNumber}</span>
              <span className="ml-2 text-sm text-[var(--ep-navy-muted)]">{w.rangeLabel}</span>
            </div>
            <div className="text-sm">
              <span className="rounded-full bg-[var(--ep-gold-soft)] px-2 py-0.5 text-xs font-semibold uppercase">
                {w.status}
              </span>
              <span className="ml-2">{w.primaryCluster}</span>
            </div>
            <div className="text-xs text-[var(--ep-navy-muted)]">
              {w.focusCities.join(" + ")} · {w.topEventCount} events
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ArchitecturePanel({ data }: Props) {
  return (
    <section>
      <SectionTitle title="Executive Book Architecture" subtitle="300-page plan · clickable table of contents" />

      <div className="space-y-3">
        {data.architecture.map((section) => (
          <div key={section.id} className="ep-arch-link">
            <div className="font-heading font-bold">{section.title}</div>
            <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{section.description}</p>
            {section.children?.length ? (
              <div className="mt-3 space-y-2 border-t border-[var(--ep-border)] pt-3">
                {section.children.map((child) => (
                  <div key={child.id} className="text-sm">
                    <span className="font-semibold">{child.title}</span>
                    <span className="text-[var(--ep-navy-muted)]"> — {child.description}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function PeoplePowerPanel({ data }: Props) {
  const pp = data.peoplePower;
  const [rosterOpen, setRosterOpen] = useState(false);
  const leaderPct = pp.foundingVolunteersGoal > 0
    ? Math.round((pp.foundingVolunteersCurrent / pp.foundingVolunteersGoal) * 1000) / 10
    : 0;

  return (
    <section>
      <SectionTitle
        title="People Power Network"
        subtitle="Mobilize · volunteers · Substack · county activation"
      />

      <div className="ep-warning mb-8">
        <p className="text-sm font-medium">
          The Brain knows where opportunity exists. People Power activates humans around that opportunity.
        </p>
      </div>

      <div className="mb-8 ep-stat-grid">
        <button
          type="button"
          className="ep-stat w-full cursor-pointer text-left transition hover:ring-2 hover:ring-[var(--ep-gold-soft)]"
          onClick={() => setRosterOpen((o) => !o)}
          aria-expanded={rosterOpen}
        >
          <div className="ep-stat-value">
            {pp.foundingVolunteersCurrent} / {pp.foundingVolunteersGoal}
          </div>
          <div className="ep-stat-label">Founding volunteer leaders</div>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">
            {rosterOpen ? "Hide roster ▲" : "View roster ▼"}
          </p>
        </button>
        <div className="ep-stat">
          <div className="ep-stat-value">{pp.launchLabel}</div>
          <div className="ep-stat-label">Launch call</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{pp.strikeTeamCoveragePct}%</div>
          <div className="ep-stat-label">Strike team coverage</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{pp.mobilizeEventsLinked}</div>
          <div className="ep-stat-label">Mobilize events linked</div>
        </div>
      </div>

      {rosterOpen && pp.foundingVolunteers.length > 0 ? (
        <div className="mb-8 ep-card">
          <h3 className="font-heading font-bold">Campaign volunteer roster</h3>
          <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
            {pp.foundingVolunteers.length} signed up · June 28 leadership launch invite list
          </p>
          <ul className="mt-4 max-h-96 space-y-2 overflow-y-auto text-sm">
            {pp.foundingVolunteers.map((v) => (
              <li
                key={v.id}
                className="flex flex-wrap items-baseline justify-between gap-x-3 border-b border-[var(--ep-border)] pb-2 last:border-0"
              >
                <span className="font-medium text-[var(--ep-navy)]">{v.name}</span>
                <span className="text-xs text-[var(--ep-navy-muted)]">
                  {v.locationHint ?? "Location TBD at June 28 call"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <div className="ep-card">
          <h3 className="font-heading font-bold">July Retreat</h3>
          <p className="mt-2 text-sm">{pp.retreatLocation}</p>
          <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
            Ownership · relationships · Power of 5 · county missions
          </p>
        </div>
        <div className="ep-card">
          <h3 className="font-heading font-bold">Monthly leadership calls</h3>
          <p className="mt-2 text-sm">{pp.monthlyCalls}</p>
          <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">Statewide Zoom · last Sunday</p>
        </div>
      </div>

      <h3 className="mb-3 font-heading font-bold">Story-first event workflow</h3>
      <div className="mb-8 flex flex-wrap items-center gap-2">
        {pp.storyWorkflow.map((step, i) => (
          <span key={step} className="flex items-center gap-2 text-sm">
            <span className="rounded-full bg-[var(--ep-navy)] px-2.5 py-1 text-xs font-semibold text-white">
              {step}
            </span>
            {i < pp.storyWorkflow.length - 1 ? (
              <span className="text-[var(--ep-navy-muted)]">→</span>
            ) : null}
          </span>
        ))}
      </div>

      <h3 className="mb-3 font-heading font-bold">Execution systems</h3>
      <div className="mb-8 grid gap-3 sm:grid-cols-2">
        {pp.sections.map((s) => (
          <div key={s.id} className="ep-card">
            <h4 className="font-heading font-bold">{s.title}</h4>
            <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{s.description}</p>
          </div>
        ))}
      </div>

      <h3 className="mb-3 font-heading font-bold">Community Relationship Index</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {pp.communityRelationshipIndex.map((m) => (
          <div key={m.label} className="ep-card text-center">
            <div className="font-heading text-xl font-bold">{formatVotes(m.current)}</div>
            <div className="text-xs text-[var(--ep-navy-muted)]">{m.label}</div>
            {m.goal ? (
              <div className="mt-2 ep-progress">
                <div
                  className="ep-progress-bar"
                  style={{ width: `${Math.min(100, (m.current / m.goal) * 100)}%` }}
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-6 ep-card-glass text-sm">
        <p>
          <strong>Power of 5 commitments:</strong> {pp.powerOf5Commitments} ·{" "}
          <strong>Substack stories:</strong> {pp.substackStoriesPublished} ·{" "}
          <strong>Mobilize RSVPs:</strong> {pp.mobilizeRsvpTotal}
        </p>
        <p className="mt-2 text-[var(--ep-navy-muted)]">
          Founding leaders: {leaderPct}% toward goal of {pp.foundingVolunteersGoal}
        </p>
      </div>

      <StudentsForArkansasPanel data={data.studentsForArkansas} />
      <CitizenVoicesPanel data={data.citizenVoices} />
    </section>
  );
}

function StudentsForArkansasPanel({ data }: { data: Props["data"]["studentsForArkansas"] }) {
  const coChairPct =
    data.coChairsGoal > 0 ? Math.round((data.coChairsConfirmed / data.coChairsGoal) * 1000) / 10 : 0;

  return (
    <div className="mt-10 border-t border-[var(--ep-border)] pt-10">
      <SectionTitle
        title={data.programName}
        subtitle="Campus chapters · voter registration · internships · youth leadership pipeline"
      />

      <div className="ep-card-glass mb-6 text-sm">
        <p className="font-medium text-[var(--ep-navy)]">{data.doctrine}</p>
        {data.powerOf5Integration ? (
          <p className="mt-2 text-[var(--ep-navy-muted)]">Power of 5: {data.powerOf5Integration}</p>
        ) : null}
      </div>

      <div className="mb-8 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">
            {data.coChairsConfirmed} / {data.coChairsGoal}
          </div>
          <div className="ep-stat-label">Founding co-chairs (Labor Day)</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">
            {data.campusLeaders} / {data.campusLeadersLaborDayGoal}
          </div>
          <div className="ep-stat-label">Campus leaders</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">
            {data.studentVolunteers} / {data.studentVolunteersLaborDayGoal}
          </div>
          <div className="ep-stat-label">Student volunteers</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">
            {data.voterRegistrations} / {data.voterRegistrationsElectionGoal}
          </div>
          <div className="ep-stat-label">Voter registrations</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">
            {data.activeCampuses} / {data.activeCampusesOctoberGoal}
          </div>
          <div className="ep-stat-label">Active campuses (Oct 1)</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{data.campusesInInventory}</div>
          <div className="ep-stat-label">Campuses in inventory</div>
        </div>
      </div>

      {data.foundingCoChairs.length > 0 ? (
        <div className="mb-8 ep-card">
          <h3 className="font-heading font-bold">Founding leadership team</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {data.foundingCoChairs.map((c) => (
              <li key={c.id} className="flex flex-col gap-0.5 border-b border-[var(--ep-border)] pb-2 last:border-0">
                <span className="font-medium text-[var(--ep-navy)]">
                  {c.name ?? "OPEN SEAT"} — {c.title}
                </span>
                <span className="text-xs text-[var(--ep-navy-muted)]">
                  {c.leadCampus} · {c.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        {data.campusRoles.length > 0 ? (
          <div className="ep-card">
            <h3 className="font-heading font-bold">Campus captain roles</h3>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
              {data.campusRoles.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {data.internshipTracks.length > 0 ? (
          <div className="ep-card">
            <h3 className="font-heading font-bold">Summer internship tracks</h3>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
              {data.internshipTracks.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        {data.monthlyRequirements.length > 0 ? (
          <div className="ep-card">
            <h3 className="font-heading font-bold">Monthly chapter requirements</h3>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
              {data.monthlyRequirements.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {data.semesterRequirements.length > 0 ? (
          <div className="ep-card">
            <h3 className="font-heading font-bold">Semester chapter requirements</h3>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
              {data.semesterRequirements.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <p className="text-xs text-[var(--ep-navy-muted)]">
        Co-chairs: {coChairPct}% toward Labor Day goal · {data.fundraisingCommissionPercent}% fundraising commission
        returned to chapters ·{" "}
        <Link href={data.executiveBookHref} className="text-[var(--ep-gold)] underline">
          Executive Book Chapter 9
        </Link>{" "}
        · June 28 brief: <code className="text-[0.65rem]">{data.june28BriefPath}</code>
      </p>
    </div>
  );
}

function CitizenVoicesPanel({ data }: { data: Props["data"]["citizenVoices"] }) {
  const foundingPct =
    data.foundingWritersGoal > 0
      ? Math.round((data.foundingWritersCurrent / data.foundingWritersGoal) * 1000) / 10
      : 0;

  return (
    <div className="mt-10 border-t border-[var(--ep-border)] pt-10">
      <SectionTitle
        title={data.networkName}
        subtitle={`${data.programName} · earned media · local validation · writing volunteers`}
      />

      <div className="ep-card-glass mb-6 text-sm">
        <p className="font-medium text-[var(--ep-navy)]">{data.positioning}</p>
        <p className="mt-2 text-[var(--ep-navy-muted)]">{data.doctrine}</p>
      </div>

      <div className="mb-8 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">
            {data.foundingWritersCurrent} / {data.foundingWritersGoal}
          </div>
          <div className="ep-stat-label">Founding writers (Labor Day)</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">
            {data.activeWritersCurrent} / {data.activeWritersGoal}
          </div>
          <div className="ep-stat-label">Active writers (October)</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">
            {data.lettersSubmitted} / {data.lettersSubmittedGoal}
          </div>
          <div className="ep-stat-label">Letters submitted</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{data.lettersPublished}</div>
          <div className="ep-stat-label">Letters published</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">
            {data.countiesRepresented} / {data.countiesGoal}
          </div>
          <div className="ep-stat-label">Counties with writers</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{data.outletsInInventory}</div>
          <div className="ep-stat-label">Outlets in inventory</div>
        </div>
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <div className="ep-card">
          <h3 className="font-heading font-bold">Weekly production targets</h3>
          <ul className="mt-3 space-y-1 text-sm">
            <li>{data.weeklyTargets.lettersSubmitted} letters submitted</li>
            <li>{data.weeklyTargets.lettersPublished} letters published</li>
            <li>{data.weeklyTargets.guestColumnsSubmitted} guest columns submitted</li>
            <li>{data.weeklyTargets.guestColumnsPublished} guest columns published</li>
          </ul>
        </div>
        <div className="ep-card">
          <h3 className="font-heading font-bold">Editorial rhythm</h3>
          <ul className="mt-3 space-y-1 text-sm">
            {data.editorialRhythm.map((d) => (
              <li key={d.day}>
                <strong>{d.day}:</strong> {d.activity}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {data.contentCategories.length > 0 ? (
        <>
          <h3 className="mb-3 font-heading font-bold">Content categories</h3>
          <div className="mb-6 flex flex-wrap gap-2">
            {data.contentCategories.map((c) => (
              <span
                key={c}
                className="rounded-full bg-[var(--ep-cream)] px-3 py-1 text-xs font-medium text-[var(--ep-navy)]"
              >
                {c}
              </span>
            ))}
          </div>
        </>
      ) : null}

      <p className="text-xs text-[var(--ep-navy-muted)]">
        Founding writers: {foundingPct}% toward Labor Day goal · Operating manual:{" "}
        <code className="text-[0.65rem]">{data.docPath}</code>
      </p>
    </div>
  );
}

function MotionPresencePanel({ data }: Props) {
  const mp = data.motionPresence;
  const countyPct =
    mp.countiesTotal > 0 ? Math.round((mp.countiesVisited / mp.countiesTotal) * 1000) / 10 : 0;

  return (
    <section>
      <SectionTitle
        title="Motion & Storytelling"
        subtitle="Phase 12 — The Arkansas Presence Strategy · perceived momentum through visible motion"
      />

      <div className="ep-warning mb-8">
        <p className="text-sm font-medium">{mp.doctrine}</p>
        <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
          North star: <strong>{mp.goal}</strong> — build a public record that Kelly is showing up across Arkansas,
          not campaign ad volume.
        </p>
      </div>

      <div className="mb-8 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{mp.arkansasPresenceScore}%</div>
          <div className="ep-stat-label">Arkansas Presence Score</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{mp.septemberPersuasionReadiness}%</div>
          <div className="ep-stat-label">September Readiness</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">
            {mp.countiesVisited} / {mp.countiesTotal}
          </div>
          <div className="ep-stat-label">Counties visited</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(mp.citiesVisited)}</div>
          <div className="ep-stat-label">Cities visited</div>
        </div>
      </div>

      <div className="mb-8 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(mp.storiesPublished)}</div>
          <div className="ep-stat-label">Stories published</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(mp.videosPublished)}</div>
          <div className="ep-stat-label">Videos published</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(mp.substackPublished)}</div>
          <div className="ep-stat-label">Substack posts</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(mp.localBusinessesHighlighted)}</div>
          <div className="ep-stat-label">Businesses highlighted</div>
        </div>
      </div>

      <h3 className="mb-3 font-heading font-bold">Story-first event workflow</h3>
      <div className="mb-8 flex flex-wrap items-center gap-2">
        {mp.storyWorkflow.map((step, i) => (
          <span key={step} className="flex items-center gap-2 text-sm">
            <span className="rounded-full bg-[var(--ep-navy)] px-2.5 py-1 text-xs font-semibold text-white">
              {step}
            </span>
            {i < mp.storyWorkflow.length - 1 ? (
              <span className="text-[var(--ep-navy-muted)]">→</span>
            ) : null}
          </span>
        ))}
      </div>

      <h3 className="mb-3 font-heading font-bold">
        Arkansas Presence Map · {countyPct}% county coverage
      </h3>
      <p className="mb-3 text-xs text-[var(--ep-navy-muted)]">
        Navy = visited · Gold tint = story published · Gray = not yet visited
      </p>
      <div className="mb-8 grid grid-cols-3 gap-1.5 sm:grid-cols-5 lg:grid-cols-10">
        {mp.countyMap.map((c) => (
          <div
            key={c.county}
            className={cn(
              "rounded px-1.5 py-2 text-center text-[10px] font-medium leading-tight sm:text-xs",
              c.coverageStatus === "story_published"
                ? "bg-[var(--ep-gold)] text-[var(--ep-navy)]"
                : c.visited
                  ? "bg-[var(--ep-navy)] text-white"
                  : "bg-[var(--ep-border)] text-[var(--ep-navy-muted)]",
            )}
            title={`${c.county}: ${c.stops} stop${c.stops === 1 ? "" : "s"} · ${c.relationshipStatus}${c.lastDate ? ` · last ${c.lastDate}` : ""}${c.daysSinceLastVisit != null ? ` · ${c.daysSinceLastVisit}d ago` : ""}`}
          >
            {c.county.replace(" County", "").replace(" county", "")}
            {c.stops > 1 ? (
              <span className="mt-0.5 block text-[9px] opacity-80">{c.stops}</span>
            ) : null}
          </div>
        ))}
      </div>

      {mp.storyCategories.length > 0 ? (
        <>
          <h3 className="mb-3 font-heading font-bold">Community story categories</h3>
          <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {mp.storyCategories.map((c) => (
              <div key={c.id} className="ep-card">
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="text-sm font-semibold">{c.label}</h4>
                  <span className="text-xs text-[var(--ep-navy-muted)]">
                    {c.count} / {c.goal}
                  </span>
                </div>
                <div className="mt-2 ep-progress">
                  <div
                    className="ep-progress-bar"
                    style={{ width: `${Math.min(100, c.goal > 0 ? (c.count / c.goal) * 100 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {mp.cadence.length > 0 ? (
        <>
          <h3 className="mb-3 font-heading font-bold">Weekly content cadence</h3>
          <div className="mb-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {mp.cadence.map((d) => (
              <div key={d.day} className="ep-card text-sm">
                <span className="font-semibold">{d.day}</span>
                <span className="text-[var(--ep-navy-muted)]"> — {d.activity}</span>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {mp.recentStops.length > 0 ? (
        <>
          <h3 className="mb-3 font-heading font-bold">Recent stops</h3>
          <div className="mb-8 space-y-2">
            {mp.recentStops.map((s, i) => (
              <div key={`${s.date}-${s.location}-${i}`} className="ep-card flex flex-wrap items-baseline gap-x-3 text-sm">
                <span className="font-semibold">{s.date}</span>
                <span>{s.location}</span>
                <span className="text-[var(--ep-navy-muted)]">
                  {s.city}, {s.county} · {s.type}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="mb-8 ep-card-glass text-sm text-[var(--ep-navy-muted)]">
          No stops logged yet. Field team adds rows to{" "}
          <code className="text-xs">data/campaign-brain/presence-stops.json</code>, then runs{" "}
          <code className="text-xs">npm run campaign-brain:motion:build</code>. Docs:{" "}
          <code className="text-xs">docs/campaign-brain/motion-and-storytelling/</code>
        </div>
      )}

      <div className="mb-8 ep-card-glass text-sm">
        <p>
          <strong>Pipeline:</strong> {mp.storiesPublished} published · {mp.storiesPending} pending ·{" "}
          {mp.storiesShared} shared · Pyramid {mp.contentPyramidCompletionPct}%
        </p>
      </div>

      <h3 className="mb-3 font-heading font-bold">Phase 12 — ten objectives</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {mp.components.map((c) => (
          <div key={c.id} className="ep-card">
            <h4 className="font-heading font-bold">{c.title}</h4>
            <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{c.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ExecutiveCalendarPanel({ data }: Props) {
  const cal = data.executiveCalendar;
  const [filter, setFilter] = useState<"all" | "past_visit" | "locked" | "scheduled" | "proposed">("all");

  const filtered = filter === "all" ? cal.entries : cal.entries.filter((e) => e.category === filter);

  const byMonth = filtered.reduce<Record<string, typeof filtered>>((acc, e) => {
    const month = e.startDate.slice(0, 7);
    if (!acc[month]) acc[month] = [];
    acc[month].push(e);
    return acc;
  }, {});

  const categoryLabel: Record<string, string> = {
    past_visit: "Past visit",
    locked: "Locked",
    scheduled: "Scheduled",
    proposed: "Proposed",
  };

  const categoryClass: Record<string, string> = {
    past_visit: "bg-slate-100 text-slate-700",
    locked: "bg-[var(--ep-navy)] text-white",
    scheduled: "bg-emerald-100 text-emerald-800",
    proposed: "bg-amber-100 text-amber-900",
  };

  return (
    <section>
      <SectionTitle
        title="Executive Field Calendar"
        subtitle="Past locations visited · locked backbone · scheduled stops · Phase C proposals"
      />

      <div className="ep-warning mb-8">
        <p className="text-sm font-medium">{cal.disclaimer}</p>
        <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
          Reference date {cal.referenceDate}. Rebuild:{" "}
          <code className="text-xs">npm run campaign-brain:executive-calendar:build</code> then{" "}
          <code className="text-xs">npm run election-plan:build</code>
        </p>
      </div>

      <div className="mb-8 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{cal.summary.pastVisitCount}</div>
          <div className="ep-stat-label">Past visits</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{cal.summary.lockedCount}</div>
          <div className="ep-stat-label">Locked backbone</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{cal.summary.scheduledCount}</div>
          <div className="ep-stat-label">Scheduled</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{cal.summary.proposedCount}</div>
          <div className="ep-stat-label">Proposed (Phase C)</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{cal.summary.countiesVisited}</div>
          <div className="ep-stat-label">Counties visited</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{cal.summary.countiesScheduled}</div>
          <div className="ep-stat-label">Counties on calendar</div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {(
          [
            ["all", "All"],
            ["past_visit", "Past"],
            ["locked", "Locked"],
            ["scheduled", "Scheduled"],
            ["proposed", "Proposed"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              filter === id
                ? "border-[var(--ep-navy)] bg-[var(--ep-navy)] text-white"
                : "border-[var(--ep-border)] bg-white text-[var(--ep-navy-muted)] hover:border-[var(--ep-navy)]",
            )}
            onClick={() => setFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="ep-card-glass text-sm text-[var(--ep-navy-muted)]">
          No calendar entries. Run{" "}
          <code className="text-xs">npm run campaign-brain:executive-calendar:build</code>.
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(byMonth)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, rows]) => (
              <div key={month}>
                <h3 className="mb-3 font-heading text-lg font-bold text-[var(--ep-navy)]">
                  {new Date(`${month}-01T12:00:00`).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-[var(--ep-border)] text-xs uppercase text-[var(--ep-navy-muted)]">
                        <th className="py-2 pr-3">Date</th>
                        <th className="py-2 pr-3">Event</th>
                        <th className="py-2 pr-3">County</th>
                        <th className="py-2 pr-3">Type</th>
                        <th className="py-2 pr-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((e) => (
                        <tr key={e.id} className="border-b border-[var(--ep-border)]">
                          <td className="py-2 pr-3 whitespace-nowrap">
                            {e.endDate && e.endDate !== e.startDate
                              ? `${e.startDate} → ${e.endDate}`
                              : e.startDate}
                          </td>
                          <td className="py-2 pr-3">
                            <div className="font-medium">{e.label}</div>
                            {e.city ? (
                              <div className="text-xs text-[var(--ep-navy-muted)]">{e.city}</div>
                            ) : null}
                            {e.notes ? (
                              <div className="mt-0.5 text-xs text-[var(--ep-navy-muted)]">{e.notes}</div>
                            ) : null}
                          </td>
                          <td className="py-2 pr-3">{e.county.replace(/ County$/i, "")}</td>
                          <td className="py-2 pr-3">
                            <span
                              className={cn(
                                "inline-block rounded px-2 py-0.5 text-xs font-medium",
                                categoryClass[e.category],
                              )}
                            >
                              {categoryLabel[e.category]}
                            </span>
                          </td>
                          <td className="py-2 pr-3 text-xs text-[var(--ep-navy-muted)]">{e.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
        </div>
      )}
    </section>
  );
}

function ForwardMotionPanel({ data }: Props) {
  const fm = data.forwardMotion;

  return (
    <section>
      <SectionTitle
        title="Forward Motion"
        subtitle="Phase 13 — announce, promote, and activate upcoming stops (draft/review only)"
      />

      <div className="ep-warning mb-8">
        <p className="text-sm font-medium">{fm.heroLine}</p>
        <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
          No live emails, Facebook posts, Mobilize publish, or press distribution from this system. Human approval
          required for all public release.
        </p>
      </div>

      <div className="mb-8 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(fm.upcomingCount)}</div>
          <div className="ep-stat-label">Upcoming stops (90d)</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(fm.nextWeekCount)}</div>
          <div className="ep-stat-label">Next 7 days</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{fm.avgActivationReadiness}%</div>
          <div className="ep-stat-label">Avg activation readiness</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(fm.priorityWindowCount)}</div>
          <div className="ep-stat-label">Priority window (21d)</div>
        </div>
      </div>

      {fm.missingPieces.length > 0 ? (
        <>
          <h3 className="mb-3 font-heading font-bold">Missing promotion pieces</h3>
          <ul className="mb-8 list-inside list-disc space-y-1 text-sm text-[var(--ep-navy-muted)]">
            {fm.missingPieces.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </>
      ) : null}

      <h3 className="mb-3 font-heading font-bold">Upcoming stops — activation status</h3>
      {fm.stops.length > 0 ? (
        <div className="mb-8 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--ep-border)] text-xs uppercase text-[var(--ep-navy-muted)]">
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">Event</th>
                <th className="py-2 pr-3">County</th>
                <th className="py-2 pr-3">Score</th>
                <th className="py-2 pr-3">Mobilize</th>
                <th className="py-2 pr-3">Facebook</th>
                <th className="py-2 pr-3">Release</th>
                <th className="py-2 pr-3">Graphic</th>
                <th className="py-2 pr-3">Story</th>
              </tr>
            </thead>
            <tbody>
              {fm.stops.map((s) => (
                <tr key={s.eventId} className="border-b border-[var(--ep-border)]">
                  <td className="py-2 pr-3 whitespace-nowrap">{s.date}</td>
                  <td className="py-2 pr-3 font-medium">{s.eventName}</td>
                  <td className="py-2 pr-3">{s.county.replace(" County", "")}</td>
                  <td className="py-2 pr-3">{s.effectiveScore}</td>
                  <td className="py-2 pr-3 text-xs">{s.mobilizeStatus}</td>
                  <td className="py-2 pr-3 text-xs">{s.facebookStatus}</td>
                  <td className="py-2 pr-3 text-xs">{s.newsReleaseStatus}</td>
                  <td className="py-2 pr-3 text-xs">{s.graphicsStatus}</td>
                  <td className="py-2 pr-3 text-xs">{s.storyWorkflowStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mb-8 ep-card-glass text-sm text-[var(--ep-navy-muted)]">
          No upcoming stops in queue. Run{" "}
          <code className="text-xs">npm run campaign-brain:forward-motion</code> after calendar data updates.
        </div>
      )}

      <h3 className="mb-3 font-heading font-bold">Phase 13 — ten objectives</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {fm.components.map((c) => (
          <div key={c.id} className="ep-card">
            <h4 className="font-heading font-bold">{c.title}</h4>
            <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{c.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 ep-card-glass text-sm text-[var(--ep-navy-muted)]">
        Docs: <code className="text-xs">docs/campaign-brain/forward-motion/</code> · Data:{" "}
        <code className="text-xs">data/campaign-brain/upcoming-stops-activation-queue.json</code>
      </div>
    </section>
  );
}

function CoalitionPowerMapPanel({ data }: Props) {
  const cp = data.coalitionPowerMap;

  return (
    <section>
      <SectionTitle
        title="Coalition & Power Map"
        subtitle="Phase 14 — Coalition, Labor & Power Map Activation · counts only, no private contact info"
      />

      <div className="ep-warning mb-8">
        <p className="text-sm font-medium">{cp.heroLine}</p>
        <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
          NAACP · AEA · Muslim · Hispanic (framework) · Labor · elected officials · Sherwood · forums · rural town halls
        </p>
      </div>

      <div className="mb-8 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">
            {cp.naacp.called} / {cp.naacp.branchesTotal}
          </div>
          <div className="ep-stat-label">NAACP branches called</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{cp.naacp.speakingScheduled}</div>
          <div className="ep-stat-label">Kelly speaking scheduled</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{cp.aea.teacherSupporters}</div>
          <div className="ep-stat-label">Teacher supporters</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{cp.labor.contacted} / {cp.labor.unionsTotal}</div>
          <div className="ep-stat-label">Unions contacted</div>
        </div>
      </div>

      <div className="mb-8 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">
            {cp.electedOfficials.contacted} / {cp.electedOfficials.total}
          </div>
          <div className="ep-stat-label">Elected officials contacted</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{cp.candidates.activePartnerships}</div>
          <div className="ep-stat-label">Candidate partnerships</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{cp.pastOfficials.engaged} / {cp.pastOfficials.total}</div>
          <div className="ep-stat-label">Past officials engaged</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{cp.muslim.contactsTotal}</div>
          <div className="ep-stat-label">Muslim community contacts</div>
        </div>
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <div className="ep-card">
          <h3 className="font-heading font-bold">WIN SHERWOOD — 60%+</h3>
          <p className="mt-2 text-sm">{cp.sherwood.goal}</p>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="text-[var(--ep-navy-muted)]">VIP tables</dt>
              <dd className="font-semibold">{cp.sherwood.vipTablesSold} / {cp.sherwood.vipTablesGoal}</dd>
            </div>
            <div>
              <dt className="text-[var(--ep-navy-muted)]">Tickets</dt>
              <dd className="font-semibold">{cp.sherwood.ticketsSold}</dd>
            </div>
            <div>
              <dt className="text-[var(--ep-navy-muted)]">Status</dt>
              <dd className="font-semibold">{cp.sherwood.status}</dd>
            </div>
          </dl>
        </div>
        <div className="ep-card">
          <h3 className="font-heading font-bold">Hispanic outreach</h3>
          <p className="mt-2 text-sm">
            Lead: <strong>{cp.hispanic.lead}</strong>
          </p>
          <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
            Framework: {cp.hispanic.frameworkStatus.replace(/_/g, " ")}
            {cp.hispanic.pendingJasmineReview ? " — pending lead review" : ""}
          </p>
        </div>
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <div className="ep-card">
          <h3 className="font-heading font-bold">Top 20 city candidate forums</h3>
          <p className="mt-2 text-sm">
            {cp.cityForums.planned} / {cp.cityForums.total} planned · {cp.cityForums.booked} booked
          </p>
          {cp.cityForums.fortSmithBooked ? (
            <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">Fort Smith: booked</p>
          ) : null}
        </div>
        <div className="ep-card">
          <h3 className="font-heading font-bold">Rural election town halls</h3>
          <p className="mt-2 text-sm">
            {cp.ruralTownhalls.planned} / {cp.ruralTownhalls.total} planned
          </p>
        </div>
      </div>

      <h3 className="mb-3 font-heading font-bold">Standard ask package</h3>
      <ol className="mb-8 list-inside list-decimal space-y-1 text-sm text-[var(--ep-navy-muted)]">
        {cp.standardAskPackage.map((q) => (
          <li key={q}>{q}</li>
        ))}
      </ol>

      <h3 className="mb-3 font-heading font-bold">Phase 14 tracks</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {cp.components.map((c) => (
          <div key={c.id} className="ep-card">
            <h4 className="font-heading font-bold">{c.title}</h4>
            <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{c.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 ep-card-glass text-sm text-[var(--ep-navy-muted)]">
        Docs: <code className="text-xs">docs/campaign-brain/coalition-power-map/</code> ·{" "}
        <code className="text-xs">npm run campaign-brain:coalition</code>
      </div>
    </section>
  );
}

function EndorsementAcquisitionPanel({ data }: Props) {
  const ea = data.endorsementAcquisition;

  return (
    <section>
      <SectionTitle
        title="Endorsement Acquisition"
        subtitle="Phase 15 — validators who move credibility, volunteers, donors, networks, and persuasion"
      />

      <div className="ep-warning mb-8">
        <p className="text-sm font-medium">{ea.heroLine}</p>
        <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
          Not collecting names — tracking requested · status · activation level on every leader record.
        </p>
      </div>

      <div className="mb-8 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(ea.requested)}</div>
          <div className="ep-stat-label">Requested</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(ea.endorsed)}</div>
          <div className="ep-stat-label">Endorsed</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(ea.pending)}</div>
          <div className="ep-stat-label">Pending</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(ea.activated)}</div>
          <div className="ep-stat-label">Activated (deployed)</div>
        </div>
      </div>

      <div className="mb-8 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(ea.volunteerLeadsGenerated)}</div>
          <div className="ep-stat-label">Volunteer leads</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(ea.donorLeadsGenerated)}</div>
          <div className="ep-stat-label">Donor leads</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(ea.meetingsScheduled)}</div>
          <div className="ep-stat-label">Meetings scheduled</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(ea.presentationsGiven)}</div>
          <div className="ep-stat-label">Presentations given</div>
        </div>
      </div>

      <h3 className="mb-3 font-heading font-bold">Five evaluation values</h3>
      <div className="mb-8 flex flex-wrap gap-2">
        {ea.valueCriteria.map((v) => (
          <span key={v} className="rounded-full bg-[var(--ep-navy)] px-3 py-1 text-xs font-semibold text-white">
            {v}
          </span>
        ))}
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <div className="ep-card">
          <h3 className="font-heading font-bold">Institutional (Tier 1)</h3>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div><dt className="text-[var(--ep-navy-muted)]">Labor</dt><dd className="font-semibold">{ea.institutional.labor}</dd></div>
            <div><dt className="text-[var(--ep-navy-muted)]">Teacher</dt><dd className="font-semibold">{ea.institutional.teacher}</dd></div>
            <div><dt className="text-[var(--ep-navy-muted)]">Civil rights</dt><dd className="font-semibold">{ea.institutional.civilRights}</dd></div>
            <div><dt className="text-[var(--ep-navy-muted)]">Total endorsed</dt><dd className="font-semibold">{ea.institutional.total}</dd></div>
          </dl>
        </div>
        <div className="ep-card">
          <h3 className="font-heading font-bold">By tier (targets tracked)</h3>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div><dt className="text-[var(--ep-navy-muted)]">Tier 1</dt><dd className="font-semibold">{ea.byTier.tier1}</dd></div>
            <div><dt className="text-[var(--ep-navy-muted)]">Tier 2</dt><dd className="font-semibold">{ea.byTier.tier2}</dd></div>
            <div><dt className="text-[var(--ep-navy-muted)]">Tier 3</dt><dd className="font-semibold">{ea.byTier.tier3}</dd></div>
            <div><dt className="text-[var(--ep-navy-muted)]">Tier 4–5</dt><dd className="font-semibold">{ea.byTier.tier4 + ea.byTier.tier5}</dd></div>
          </dl>
        </div>
      </div>

      {ea.pendingTargets.length > 0 ? (
        <>
          <h3 className="mb-3 font-heading font-bold">Pending pipeline</h3>
          <div className="mb-8 space-y-2">
            {ea.pendingTargets.map((t, i) => (
              <div key={`${t.name}-${i}`} className="ep-card flex flex-wrap items-baseline gap-x-3 text-sm">
                <span className="font-semibold">T{t.tier}</span>
                <span>{t.name}</span>
                <span className="text-[var(--ep-navy-muted)]">{t.organization} · {t.county} · {t.status.replace(/_/g, " ")}</span>
              </div>
            ))}
          </div>
        </>
      ) : null}

      <h3 className="mb-3 font-heading font-bold">Activation checklist (every endorsement)</h3>
      <ol className="mb-8 list-inside list-decimal space-y-1 text-sm text-[var(--ep-navy-muted)]">
        {ea.activationChecklist.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ol>

      <h3 className="mb-3 font-heading font-bold">Phase 15 components</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {ea.components.map((c) => (
          <div key={c.id} className="ep-card">
            <h4 className="font-heading font-bold">{c.title}</h4>
            <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{c.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 ep-card-glass text-sm text-[var(--ep-navy-muted)]">
        Leader fields: <code className="text-xs">endorsementRequested</code> ·{" "}
        <code className="text-xs">endorsementStatus</code> ·{" "}
        <code className="text-xs">endorsementActivationLevel</code> · Docs:{" "}
        <code className="text-xs">docs/campaign-brain/endorsement-strategy/</code>
      </div>
    </section>
  );
}

function VoterContactPanel({ data }: Props) {
  const vc = data.voterContact;
  const hci = vc.humanContactIndex;
  const c = hci.components;

  return (
    <section>
      <SectionTitle
        title="Voter Contact & GOTV"
        subtitle="Phase 16 — Human Contact Index and the bridge from volunteers to turnout"
      />

      <div className="ep-warning mb-8">
        <p className="text-sm font-medium">{vc.heroLine}</p>
        <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">{vc.doctrine}</p>
      </div>

      <div className="mb-8 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(hci.total)}</div>
          <div className="ep-stat-label">Human Contact Index</div>
          <div className="mt-1 text-xs text-[var(--ep-navy-muted)]">
            {formatPct(hci.completionPct)} of {formatVotes(hci.goal)} goal
          </div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(vc.funnel.voterContacts)}</div>
          <div className="ep-stat-label">Voter contacts</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(vc.funnel.commitments)}</div>
          <div className="ep-stat-label">Commitments</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(vc.funnel.volunteersActive)}</div>
          <div className="ep-stat-label">Volunteers active</div>
        </div>
      </div>

      <h3 className="mb-3 font-heading font-bold">HCI components</h3>
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Phone calls", value: c.phoneCalls },
          { label: "Postcards", value: c.postcards },
          { label: "Doors knocked", value: c.doorsKnocked },
          { label: "House party attendees", value: c.housePartyAttendees },
          { label: "Power of 5 conversations", value: c.powerOf5Conversations },
          { label: "Volunteer recruits", value: c.volunteerRecruits },
          { label: "Event attendees", value: c.eventAttendees },
        ].map((row) => (
          <div key={row.label} className="ep-card text-sm">
            <div className="text-[var(--ep-navy-muted)]">{row.label}</div>
            <div className="font-heading text-lg font-bold">{formatVotes(row.value)}</div>
          </div>
        ))}
      </div>

      <h3 className="mb-3 font-heading font-bold">Three tracks</h3>
      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        <div className="ep-card">
          <h4 className="font-heading font-bold">Track A — Lane 2 Reactivation</h4>
          <dl className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-[var(--ep-navy-muted)]">Contacted</dt><dd className="font-semibold">{formatVotes(vc.tracks.lane2Reactivation.contacted)}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--ep-navy-muted)]">Engaged</dt><dd className="font-semibold">{formatVotes(vc.tracks.lane2Reactivation.engaged)}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--ep-navy-muted)]">Committed</dt><dd className="font-semibold">{formatVotes(vc.tracks.lane2Reactivation.committed)}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--ep-navy-muted)]">Turnout target</dt><dd className="font-semibold">{formatVotes(vc.tracks.lane2Reactivation.turnoutTarget)}</dd></div>
          </dl>
        </div>
        <div className="ep-card">
          <h4 className="font-heading font-bold">Track B — Registration</h4>
          <dl className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-[var(--ep-navy-muted)]">Completed</dt><dd className="font-semibold">{formatVotes(vc.tracks.lane3Registration.registrationsCompleted)}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--ep-navy-muted)]">Started</dt><dd className="font-semibold">{formatVotes(vc.tracks.lane3Registration.registrationsStarted)}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--ep-navy-muted)]">Events</dt><dd className="font-semibold">{formatVotes(vc.tracks.lane3Registration.registrationEvents)}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--ep-navy-muted)]">Goal</dt><dd className="font-semibold">{formatVotes(vc.tracks.lane3Registration.goal)}</dd></div>
          </dl>
        </div>
        <div className="ep-card">
          <h4 className="font-heading font-bold">Track C — Persuasion</h4>
          <dl className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-[var(--ep-navy-muted)]">Conversations</dt><dd className="font-semibold">{formatVotes(vc.tracks.lane4Persuasion.conversations)}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--ep-navy-muted)]">Follow-ups</dt><dd className="font-semibold">{formatVotes(vc.tracks.lane4Persuasion.followUps)}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--ep-navy-muted)]">Endorsements</dt><dd className="font-semibold">{formatVotes(vc.tracks.lane4Persuasion.endorsementsGenerated)}</dd></div>
          </dl>
        </div>
      </div>

      {vc.channels.length > 0 ? (
        <>
          <h3 className="mb-3 font-heading font-bold">Channel dashboards</h3>
          <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {vc.channels.map((ch) => (
              <div key={ch.id} className="ep-card text-sm">
                <h4 className="font-heading font-bold">{ch.label}</h4>
                <p className="mt-1 text-[var(--ep-navy-muted)]">{ch.detail}</p>
                <div className="mt-2 font-semibold">
                  {formatVotes(ch.primaryMetric)} / {formatVotes(ch.goal)} ({formatPct(ch.completionPct)})
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}

      <h3 className="mb-3 font-heading font-bold">Phase 16 components</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {vc.components.map((item) => (
          <div key={item.id} className="ep-card">
            <h4 className="font-heading font-bold">{item.title}</h4>
            <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{item.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 ep-card-glass text-sm text-[var(--ep-navy-muted)]">
        Funnel: Volunteer → Voter Contact → Commitment → Turnout · Docs:{" "}
        <code className="text-xs">docs/campaign-brain/voter-contact/</code> ·{" "}
        <code className="text-xs">npm run campaign-brain:voter-contact:build</code>
      </div>
    </section>
  );
}
