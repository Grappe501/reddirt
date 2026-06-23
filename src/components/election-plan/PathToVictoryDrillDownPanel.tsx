import Link from "next/link";

import {
  CountyVictoryTargetsPanel,
  CityVictoryTargetsPanel,
} from "@/components/election-plan/CountyVictoryTargetsPanel";
import { formatBudget, formatPct, formatVotes } from "@/lib/election-plan/electionPlanData";
import { FOUR_LANE_DEFINITIONS } from "@/lib/election-plan/four-lanes-labels";
import {
  pathToVictoryPo5Summary,
  type PathToVictoryCityView,
  type PathToVictoryCountyView,
  VCI_EXPLAINER,
} from "@/lib/election-plan/path-to-victory-drill-down";
import { cityLocationBriefHref, countyPlaybookHref } from "@/lib/election-plan/location-links";
import { cityPathToVictoryHref } from "@/lib/election-plan/path-to-victory-links";
import { cn } from "@/lib/utils";

type Props =
  | { view: PathToVictoryCountyView; backHref?: string; backLabel?: string }
  | { view: PathToVictoryCityView; backHref?: string; backLabel?: string };

function Section({
  title,
  eyebrow,
  children,
  className,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("ep-card", className)}>
      {eyebrow ? (
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-gold)]">{eyebrow}</p>
      ) : null}
      <h2 className={cn("font-heading text-lg font-bold text-[var(--ep-navy)]", eyebrow && "mt-1")}>{title}</h2>
      {children}
    </section>
  );
}

function SourceTable({ citations }: { citations: PathToVictoryCountyView["citations"] }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[36rem] text-left text-xs">
        <thead>
          <tr className="border-b border-[var(--ep-border)] uppercase text-[var(--ep-navy-muted)]">
            <th className="pb-2 pr-3">Source</th>
            <th className="pb-2 pr-3">File</th>
            <th className="pb-2">Note</th>
          </tr>
        </thead>
        <tbody>
          {citations.map((c) => (
            <tr key={c.id} className="border-b border-[var(--ep-border)] last:border-0">
              <td className="py-2 pr-3 font-semibold text-[var(--ep-navy)]">{c.label}</td>
              <td className="py-2 pr-3 font-mono text-[10px] text-[var(--ep-navy-muted)]">
                {c.file}
                {c.field ? (
                  <>
                    <br />
                    <span className="text-[var(--ep-navy)]">{c.field}</span>
                  </>
                ) : null}
              </td>
              <td className="py-2 text-[var(--ep-navy-muted)]">{c.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LaneBreakdownTable({ lanes }: { lanes: PathToVictoryCountyView["lanes"] }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[48rem] text-sm">
        <thead>
          <tr className="border-b border-[var(--ep-border)] text-left text-xs uppercase text-[var(--ep-navy-muted)]">
            <th className="pb-2 pr-3">Lane</th>
            <th className="pb-2 pr-3 text-right">Raw potential</th>
            <th className="pb-2 pr-3 text-right">Achievement</th>
            <th className="pb-2 pr-3 text-right">Expected capture</th>
            <th className="pb-2">Volunteer focus</th>
          </tr>
        </thead>
        <tbody>
          {lanes.map((lane) => {
            const def = FOUR_LANE_DEFINITIONS[lane.laneId];
            return (
              <tr key={lane.laneId} className="border-b border-[var(--ep-border)] align-top last:border-0">
                <td className="py-3 pr-3">
                  <p className="font-semibold text-[var(--ep-navy)]">{def.fullLabel}</p>
                  <p className="mt-0.5 text-xs text-[var(--ep-navy-muted)]">{def.voteGoal}</p>
                </td>
                <td className="py-3 pr-3 text-right tabular-nums font-medium">{formatVotes(lane.rawPotential)}</td>
                <td className="py-3 pr-3 text-right tabular-nums text-[var(--ep-navy-muted)]">
                  {lane.achievementRate != null ? formatPct(lane.achievementRate) : "Hold baseline"}
                </td>
                <td className="py-3 pr-3 text-right tabular-nums font-bold text-[var(--ep-navy)]">
                  {formatVotes(lane.expectedCapture)}
                </td>
                <td className="py-3">
                  <ul className="list-inside list-disc space-y-1 text-xs text-[var(--ep-navy-muted)]">
                    {lane.volunteerFocus.map((line) => (
                      <li key={line.slice(0, 40)}>{line}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CountyPathToVictoryContent({ view }: { view: PathToVictoryCountyView }) {
  return (
    <div className="space-y-6">
      <div className="ep-card-glass border-l-4 border-[var(--ep-gold)] p-4 text-sm">
        <p className="font-semibold text-[var(--ep-navy)]">{view.primaryMission}</p>
        <p className="mt-1 text-[var(--ep-navy-muted)]">{view.secondaryMission}</p>
        <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">{view.recommendedAction}</p>
        {view.narrative ? (
          <p className="mt-3 border-t border-[var(--ep-border)] pt-3 leading-relaxed text-[var(--ep-navy-muted)]">
            {view.narrative}
          </p>
        ) : null}
      </div>

      <CountyVictoryTargetsPanel target={view.victoryTarget} variant="hero" />

      <Section title="Four-lane vote math" eyebrow="Where the numbers come from">
        <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
          {VCI_EXPLAINER.formula} — {VCI_EXPLAINER.formulaNote}
        </p>
        <div className="my-4 ep-stat-grid">
          <div className="ep-stat">
            <div className="ep-stat-value">{formatVotes(view.vci)}</div>
            <div className="ep-stat-label">VCI #{view.vciRank}</div>
          </div>
          <div className="ep-stat">
            <div className="ep-stat-value">{formatVotes(view.totalExpectedLaneCapture)}</div>
            <div className="ep-stat-label">Modeled lane stack</div>
          </div>
          {view.winScenario ? (
            <div className="ep-stat">
              <div className="ep-stat-value">{formatVotes(view.winScenario.countyWinContribution)}</div>
              <div className="ep-stat-label">Statewide win contribution</div>
            </div>
          ) : null}
          <div className="ep-stat">
            <div className="ep-stat-value">Tier {view.tier}</div>
            <div className="ep-stat-label">{view.clusterName ?? "Cluster TBD"}</div>
          </div>
        </div>
        <LaneBreakdownTable lanes={view.lanes} />
        <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">{pathToVictoryPo5Summary(view.victoryTarget)}</p>
      </Section>

      {view.areaBreakdown.length > 0 ? (
        <Section title="Geographic lane allocation" eyebrow="City · town · rural">
          <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
            Priority cities carry Top 250 vote targets; outlying areas cover the rest of the county.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[40rem] text-sm">
              <thead>
                <tr className="border-b border-[var(--ep-border)] text-left text-xs uppercase text-[var(--ep-navy-muted)]">
                  <th className="pb-2 pr-3">Area</th>
                  <th className="pb-2 pr-3 text-right">Expected</th>
                  <th className="pb-2 pr-3 text-right">Lane 2</th>
                  <th className="pb-2 pr-3 text-right">Lane 3</th>
                  <th className="pb-2 pr-3 text-right">Lane 4</th>
                  <th className="pb-2 text-right">Share</th>
                </tr>
              </thead>
              <tbody>
                {view.areaBreakdown.map((area) => (
                  <tr key={area.slug} className="border-b border-[var(--ep-border)] last:border-0">
                    <td className="py-2 pr-3">
                      {area.citySlug ? (
                        <Link href={cityPathToVictoryHref(area.citySlug)} className="font-medium hover:text-[var(--ep-gold)]">
                          {area.name}
                        </Link>
                      ) : (
                        <span className="font-medium">{area.name}</span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums font-semibold">
                      {formatVotes(area.expectedContribution)}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums">{formatVotes(area.lane2)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{formatVotes(area.lane3)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{formatVotes(area.lane4)}</td>
                    <td className="py-2 text-right tabular-nums">{formatPct(area.shareOfCounty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      ) : null}

      {view.registrationAllocation.length > 0 ? (
        <Section title="Lane 3 · Registration plan" eyebrow="Chapter 05 allocation">
          <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
            County goal {formatVotes(view.winScenario?.registrationGoal ?? view.lanes[2].rawPotential)} ·{" "}
            {view.registrationAllocatedTotal.toLocaleString()} new registrations allocated across priority cities
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[32rem] text-sm">
              <thead>
                <tr className="border-b border-[var(--ep-border)] text-xs uppercase text-[var(--ep-navy-muted)]">
                  <th className="pb-2 pr-3 text-left">City</th>
                  <th className="pb-2 pr-3 text-right">Share</th>
                  <th className="pb-2 pr-3 text-right">New regs</th>
                  <th className="pb-2 text-right">Checks</th>
                </tr>
              </thead>
              <tbody>
                {view.registrationAllocation.map((row) => (
                  <tr key={row.citySlug} className="border-b border-[var(--ep-border)] last:border-0">
                    <td className="py-2 pr-3">
                      <Link href={cityLocationBriefHref(row.citySlug)} className="font-medium hover:text-[var(--ep-gold)]">
                        {row.cityName}
                      </Link>
                    </td>
                    <td className="py-2 pr-3 text-right">{row.countySharePct}%</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{row.newRegistrations.toLocaleString()}</td>
                    <td className="py-2 text-right tabular-nums">{row.registrationChecks.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      ) : null}

      {view.housePartyRollup ? (
        <Section title="House party & Power of 5 plan" eyebrow="Grassroots production">
          <div className="my-4 ep-stat-grid">
            <div className="ep-stat">
              <div className="ep-stat-value">{view.housePartyRollup.hosts}</div>
              <div className="ep-stat-label">Listed hosts</div>
            </div>
            <div className="ep-stat">
              <div className="ep-stat-value">{view.housePartyRollup.activeHosts}</div>
              <div className="ep-stat-label">Active before peak</div>
            </div>
            <div className="ep-stat">
              <div className="ep-stat-value">{view.housePartyRollup.powerOf5Circles}</div>
              <div className="ep-stat-label">Po5 circles</div>
            </div>
            <div className="ep-stat">
              <div className="ep-stat-value">{view.housePartyRollup.conversationsTarget.toLocaleString()}</div>
              <div className="ep-stat-label">Trusted conversations</div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-sm">
              <thead>
                <tr className="border-b border-[var(--ep-border)] text-xs uppercase text-[var(--ep-navy-muted)]">
                  <th className="pb-2 pr-3 text-left">City</th>
                  <th className="pb-2 pr-3 text-right">Hosts</th>
                  <th className="pb-2 pr-3 text-right">Active</th>
                  <th className="pb-2 pr-3 text-right">Po5</th>
                  <th className="pb-2 text-right">Conversations</th>
                </tr>
              </thead>
              <tbody>
                {view.housePartyRollup.cities.map((row) => (
                  <tr key={row.citySlug} className="border-b border-[var(--ep-border)] last:border-0">
                    <td className="py-2 pr-3">
                      <Link href={cityPathToVictoryHref(row.citySlug)} className="font-medium hover:text-[var(--ep-gold)]">
                        {row.cityName}
                      </Link>
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums">{row.hosts}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{row.activeHosts}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{row.powerOf5Circles}</td>
                    <td className="py-2 text-right tabular-nums">{row.conversationsTarget.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      ) : null}

      {view.fundraising ? (
        <Section title="Fundraising operating system" eyebrow="Dollar targets follow vote math">
          <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
            <div className="rounded-lg border border-[var(--ep-border)] p-3">
              <p className="text-xs uppercase text-[var(--ep-navy-muted)]">County base</p>
              <p className="font-heading text-xl font-bold">{formatBudget(view.fundraising.baseGoal)}</p>
            </div>
            <div className="rounded-lg border border-[var(--ep-border)] p-3">
              <p className="text-xs uppercase text-[var(--ep-navy-muted)]">Stretch</p>
              <p className="font-heading text-xl font-bold">{formatBudget(view.fundraising.stretchGoal)}</p>
            </div>
            <div className="rounded-lg border border-[var(--ep-border)] p-3">
              <p className="text-xs uppercase text-[var(--ep-navy-muted)]">Communities</p>
              <p className="font-heading text-xl font-bold">{view.fundraising.communities.length}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">
            Source: fundraising-operating-system.source.json — proportional to Top 250 city vote goals.
          </p>
        </Section>
      ) : null}

      {view.persuasionFocus.length > 0 ? (
        <Section title="Persuasion & demographic focus" eyebrow="Who to prioritize">
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-[var(--ep-navy-muted)]">
            {view.persuasionFocus.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </Section>
      ) : null}

      {view.coalitionFrameworks.length > 0 ? (
        <Section title="Coalition workbench frameworks" eyebrow="Local leads fill intel slots">
          <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
            Framework slots only — coalition leads name real orgs and relationships. Match volunteer pathways to county
            mission.
          </p>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {view.coalitionFrameworks.map((c) => (
              <article key={c.slug} className="rounded-lg border border-[var(--ep-border)] p-4">
                <Link href={c.workbenchHref} className="font-heading text-sm font-bold text-[var(--ep-navy)] hover:text-[var(--ep-gold)]">
                  {c.name} →
                </Link>
                <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{c.tagline}</p>
                <p className="mt-2 text-xs leading-relaxed text-[var(--ep-navy)]">{c.relevance}</p>
              </article>
            ))}
          </div>
        </Section>
      ) : null}

      {view.engagementThisWeek.length > 0 ? (
        <Section title="This week — volunteer checklist" eyebrow="Field execution">
          <ol className="mt-3 list-inside list-decimal space-y-2 text-sm text-[var(--ep-navy-muted)]">
            {view.engagementThisWeek.map((item) => (
              <li key={item.slice(0, 48)}>{item}</li>
            ))}
          </ol>
        </Section>
      ) : null}

      <Section title="Data sources & provenance" eyebrow="Audit trail">
        <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
          Every number on this page traces to a locked planning file. Replace synthetic inputs as official SOS and
          county data are ingested.
        </p>
        <SourceTable citations={view.citations} />
      </Section>
    </div>
  );
}

function CityPathToVictoryContent({ view }: { view: PathToVictoryCityView }) {
  return (
    <div className="space-y-6">
      <div className="ep-card-glass text-sm">
        <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">
          #{view.rank} · {view.county} County · Tier {view.countyContext.tier}
        </p>
        <p className="mt-2 font-semibold text-[var(--ep-navy)]">{view.influenceCategory}</p>
        <p className="mt-1 text-[var(--ep-navy-muted)]">{view.strategicRole}</p>
        <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
          County mission: {view.countyContext.primaryMission} · {view.countyContext.secondaryMission}
        </p>
      </div>

      <CityVictoryTargetsPanel target={view.victoryTarget} variant="hero" />

      <Section title="City lane breakdown" eyebrow="Share of county four-lane math">
        <LaneBreakdownTable lanes={view.lanes} />
        {view.areaBreakdown ? (
          <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">
            City share of county expected capture: {formatPct(view.areaBreakdown.shareOfCounty)} ·{" "}
            {formatVotes(view.areaBreakdown.expectedContribution)} votes across lanes 2–4 (plus city baseline in Lane 1)
          </p>
        ) : null}
      </Section>

      {view.numericTargets ? (
        <Section title="Locked numeric targets" eyebrow={view.numericTargets.source}>
          <div className="my-4 ep-stat-grid">
            <div className="ep-stat">
              <div className="ep-stat-value">{view.numericTargets.registration.newRegistrations.toLocaleString()}</div>
              <div className="ep-stat-label">New registrations</div>
            </div>
            <div className="ep-stat">
              <div className="ep-stat-value">{view.numericTargets.registration.registrationChecks.toLocaleString()}</div>
              <div className="ep-stat-label">Registration checks</div>
            </div>
            <div className="ep-stat">
              <div className="ep-stat-value">{view.numericTargets.houseParties.hosts}</div>
              <div className="ep-stat-label">House party hosts</div>
            </div>
            <div className="ep-stat">
              <div className="ep-stat-value">{view.numericTargets.volunteers.activeVolunteers}</div>
              <div className="ep-stat-label">Active volunteers</div>
            </div>
          </div>
          <p className="text-sm text-[var(--ep-navy-muted)]">
            {view.numericTargets.registration.countySharePct}% of {view.county} County&apos;s{" "}
            {view.numericTargets.registration.countyRegistrationGoal.toLocaleString()} Lane 3 goal ·{" "}
            {view.numericTargets.houseParties.conversationsTarget.toLocaleString()} trusted conversations ·{" "}
            {view.numericTargets.volunteers.captains} neighborhood captains
          </p>
        </Section>
      ) : null}

      {view.persuasionFocus.length > 0 ? (
        <Section title="Persuasion focus in this city">
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-[var(--ep-navy-muted)]">
            {view.persuasionFocus.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section title="Data sources">
        <SourceTable citations={view.citations} />
      </Section>
    </div>
  );
}

export function PathToVictoryDrillDownPanel({ view, backHref, backLabel }: Props) {
  const isCounty = view.kind === "county";
  const title = isCounty ? `${view.county} County` : view.name;
  const defaultBack = isCounty
    ? countyPlaybookHref(view.county, view.slug)
    : cityLocationBriefHref(view.slug);
  const defaultBackLabel = isCounty ? `${view.county} County playbook` : `${view.name} location brief`;

  return (
    <section>
      <Link
        href={backHref ?? defaultBack}
        className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]"
      >
        ← {backLabel ?? defaultBackLabel}
      </Link>

      <header className="mt-4 mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--ep-gold)]">
          Path to Victory · {isCounty ? "County drill-down" : "City drill-down"}
        </p>
        <h1 className="mt-2 font-heading text-2xl font-bold text-[var(--ep-navy)]">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-[var(--ep-navy-muted)]">
          Dense volunteer-facing breakdown: lane vote math with sources, registration and house party plans, fundraising
          targets, coalition frameworks, and persuasion focus — exactly what to work this week.
        </p>
      </header>

      <nav className="mb-8 flex flex-wrap gap-2" aria-label="Related election plan chapters">
        {view.relatedLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="ep-card px-3 py-2 text-xs font-semibold text-[var(--ep-navy)] hover:border-[var(--ep-gold)]"
          >
            {link.label} →
          </Link>
        ))}
      </nav>

      {isCounty ? <CountyPathToVictoryContent view={view} /> : <CityPathToVictoryContent view={view} />}
    </section>
  );
}
