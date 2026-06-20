import Link from "next/link";

import { CityElectionIntelPanel } from "@/components/election-plan/CityElectionIntelPanel";
import { CityIntelligenceEnrichmentPanel } from "@/components/election-plan/CityIntelligenceEnrichmentPanel";
import { CityModelVotersPanel } from "@/components/election-plan/CityModelVotersPanel";
import { CityStrategicPlanPanel } from "@/components/election-plan/CityStrategicPlanPanel";
import { VoterFileCityIntelSection } from "@/components/election-plan/VoterFileLocationIntelPanel";
import { LocationFundraisingPanel } from "@/components/election-plan/LocationFundraisingPanel";
import { CityVictoryTargetsPanel } from "@/components/election-plan/CountyVictoryTargetsPanel";
import { ElectionPlanFieldEntryPanel } from "@/components/election-plan/ElectionPlanFieldEntryPanel";
import { LocationCalendarBindingPanel } from "@/components/election-plan/LocationCalendarBindingPanel";
import { CityNumericTargetsPanel } from "@/components/election-plan/CityNumericTargetsPanel";
import { SpecialKpiGoalCard } from "@/components/election-plan/SpecialKpiGoalCard";
import { ImmersionCountyMissionCard } from "@/components/election-plan/ImmersionCountyMissionCard";
import { CountyStrikeTeamPanel } from "@/components/election-plan/CountyStrikeTeamPanel";
import { LocationFieldEventsPanel } from "@/components/election-plan/LocationFieldEventsPanel";
import type { ExecutiveCalendarEntry } from "@/lib/election-plan/field-event-worksheet-storage";
import type { CityIntelligenceProfile } from "@/lib/election-plan/city-intelligence-types";
import type { CityLocationBrief } from "@/lib/election-plan/load-city-location-brief";
import type { LocationCalendarBinding } from "@/lib/election-plan/location-calendar-binding";
import type { CountyStrikeTeam } from "@/lib/election-plan/load-county-strike-team";
import type { ElectionPlanCity, ElectionPlanCounty } from "@/lib/election-plan/types";
import type { FieldEntryLocationSummary } from "@/lib/election-plan/field-entry/types";
import {
  cityLocationsHubHref,
  cityLocationBriefSectionHref,
  countyPlaybookHref,
  locationBriefMasterPlanHref,
} from "@/lib/election-plan/location-links";
import { cityPathToVictoryHref } from "@/lib/election-plan/path-to-victory-links";
import { formatVotes } from "@/lib/election-plan/electionPlanData";
import type { LocationFundraisingView } from "@/lib/election-plan/load-location-fundraising";
import { getCityVictoryTarget } from "@/lib/election-plan/load-county-victory-targets";
import { getSpecialKpiGoalForCity } from "@/lib/election-plan/load-special-kpi-goals";
import { getCityElectionIntel } from "@/lib/election-plan/load-city-election-intel";
import { getCityAudienceOverlay } from "@/lib/election-plan/voter-audience-models/load";
import {
  filterImmersionMissionForDisplay,
  getImmersionMissionForLocation,
} from "@/lib/election-plan/load-immersion-county-missions";
import { cn } from "@/lib/utils";

type Props = {
  brief: CityLocationBrief;
  countyKpi?: ElectionPlanCounty;
  countySlug: string;
  strikeTeam?: CountyStrikeTeam;
  fieldEvents: {
    upcoming: ExecutiveCalendarEntry[];
    recent: ExecutiveCalendarEntry[];
    totalInCounty: number;
    cityScoped: boolean;
  };
  siblingCities: ElectionPlanCity[];
  referenceDate: string;
  calendarBinding: LocationCalendarBinding;
  fieldEntrySummary?: FieldEntryLocationSummary;
  operatorInitials?: string | null;
  locationFundraising?: LocationFundraisingView | null;
  cityIntelligence?: CityIntelligenceProfile | null;
};

function statusClass(status: CityLocationBrief["status"]) {
  if (status === "approved") return "bg-emerald-100 text-emerald-900";
  if (status === "review") return "bg-amber-100 text-amber-900";
  if (status === "draft") return "bg-blue-100 text-blue-900";
  return "bg-[var(--ep-cream)] text-[var(--ep-navy-muted)]";
}

function NarrativeBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="ep-card">
      <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed text-[var(--ep-navy-muted)]">{children}</div>
    </div>
  );
}

export function CityLocationBriefPanel({
  brief,
  countyKpi,
  countySlug,
  strikeTeam,
  fieldEvents,
  siblingCities,
  referenceDate,
  calendarBinding,
  fieldEntrySummary,
  operatorInitials,
  locationFundraising,
  cityIntelligence,
}: Props) {
  const countyHref = countyPlaybookHref(brief.county, countySlug);
  const specialKpi = getSpecialKpiGoalForCity(brief.slug);
  const cityVictory = getCityVictoryTarget({
    name: brief.name,
    slug: brief.slug,
    county: brief.county,
    baselineVote: brief.targetVotes - brief.voteGain,
    targetVotes: brief.targetVotes,
    voteGain: brief.voteGain,
    isTop10: brief.isTop10,
  });
  const immersionMission = filterImmersionMissionForDisplay(
    getImmersionMissionForLocation({ countySlug, citySlug: brief.slug }),
    { surface: "city", citySlug: brief.slug },
  );
  const cityElectionIntel = getCityElectionIntel(brief.slug);
  const cityAudience = getCityAudienceOverlay(brief.slug);

  return (
    <section>
      <Link href={cityLocationsHubHref()} className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
        ← All priority cities
      </Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[var(--ep-gold)]">#{brief.rank} · {brief.county} County</p>
          <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">{brief.name}</h1>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{brief.influenceCategory}</p>
        </div>
        <span className={cn("rounded-full px-3 py-1 text-xs font-bold uppercase", statusClass(brief.status))}>
          {brief.status}
        </span>
      </div>

      <div className="mb-8">
        <CityVictoryTargetsPanel target={cityVictory} variant="hero" />
        <div className="mt-3 flex justify-end">
          <Link href={cityPathToVictoryHref(brief.slug)} className="ep-chapter-link text-sm font-semibold">
            Path to victory drill-down →
          </Link>
        </div>
      </div>

      <nav className="mb-6 flex flex-wrap gap-2 text-xs">
        {cityIntelligence ? (
          <a
            href={cityLocationBriefSectionHref(brief.slug, "place-profile")}
            className="rounded-full border border-[var(--ep-border)] px-3 py-1 font-semibold hover:border-[var(--ep-gold)]"
          >
            Place profile
          </a>
        ) : null}
        {cityAudience ? (
          <a
            href={cityLocationBriefSectionHref(brief.slug, "model-voters")}
            className="rounded-full border border-[var(--ep-border)] px-3 py-1 font-semibold hover:border-[var(--ep-gold)]"
          >
            Model voters
          </a>
        ) : null}
        <a
          href={cityLocationBriefSectionHref(brief.slug, "strategic-plan")}
          className="rounded-full border border-[var(--ep-border)] px-3 py-1 font-semibold hover:border-[var(--ep-gold)]"
        >
          Strategic plan
        </a>
        <a
          href={cityLocationBriefSectionHref(brief.slug, "brief-board")}
          className="rounded-full border border-[var(--ep-border)] px-3 py-1 font-semibold hover:border-[var(--ep-gold)]"
        >
          Brief board
        </a>
      </nav>

      {cityIntelligence ? (
        <CityIntelligenceEnrichmentPanel profile={cityIntelligence} countySlug={countySlug} />
      ) : null}

      {cityAudience ? (
        <CityModelVotersPanel overlay={cityAudience} voteTarget={brief.targetVotes} />
      ) : null}

      <CityStrategicPlanPanel brief={brief} />

      <div id="brief-board" className="scroll-mt-24">
        <div className="ep-card ep-priority-card mb-4 border-l-4 border-[var(--ep-gold)]">
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Brief board</h2>
          <p className="mt-3 text-base leading-relaxed text-[var(--ep-navy-muted)]">{brief.briefBoard}</p>
        </div>
        <NarrativeBlock title="What is going on here">{brief.situation}</NarrativeBlock>
      </div>

      <div className="ep-card mb-8">
        <h2 className="font-heading text-lg font-bold">Kelly talking points</h2>
        <div className="mt-4 space-y-4">
          {brief.kellyTalkingPoints.map((tp) => (
            <blockquote
              key={tp}
              className="border-l-4 border-[var(--ep-navy)] pl-4 text-sm italic leading-relaxed text-[var(--ep-navy)]"
            >
              {tp}
            </blockquote>
          ))}
        </div>
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        <NarrativeBlock title="House party goals">{brief.housePartyGoals}</NarrativeBlock>
        <NarrativeBlock title="Volunteer goals">{brief.volunteerGoals}</NarrativeBlock>
        <NarrativeBlock title="Registration goals">{brief.registrationGoals}</NarrativeBlock>
      </div>

      {brief.numericTargets ? (
        <CityNumericTargetsPanel targets={brief.numericTargets} countyName={brief.county} />
      ) : null}

      {specialKpi ? (
        <div className="mb-8">
          <SpecialKpiGoalCard goal={specialKpi} variant="panel" />
        </div>
      ) : null}

      {immersionMission ? (
        <div className="mb-8">
          <ImmersionCountyMissionCard mission={immersionMission} />
        </div>
      ) : null}

      {fieldEntrySummary ? (
        <div className="mb-8">
          <ElectionPlanFieldEntryPanel
            countySlug={countySlug}
            countyName={brief.county}
            citySlug={brief.slug}
            cityName={brief.name}
            initial={fieldEntrySummary}
            operatorInitials={operatorInitials ?? null}
          />
        </div>
      ) : null}

      <div className="my-6 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(brief.targetVotes)}</div>
          <div className="ep-stat-label">Vote target</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">+{formatVotes(brief.voteGain)}</div>
          <div className="ep-stat-label">Est. gain needed</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{brief.visitFrequency}</div>
          <div className="ep-stat-label">Visit cadence</div>
        </div>
      </div>

      {countyKpi ? (
        <div className="ep-card-glass mb-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">{brief.county} County playbook</h2>
              <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
                Tier {countyKpi.tier} · {countyKpi.primaryMission} · visits {countyKpi.coverageCompleted}/
                {countyKpi.coveragePlanned}
              </p>
            </div>
            <Link href={countyHref} className="ep-chapter-link text-sm">
              County playbook →
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
            <div>
              <p className="text-xs uppercase text-[var(--ep-navy-muted)]">Registration goal</p>
              <p className="font-semibold">{formatVotes(countyKpi.registrationGoal)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-[var(--ep-navy-muted)]">Lane 2 @ 50%</p>
              <p className="font-semibold">{formatVotes(countyKpi.lane2Recovery50)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-[var(--ep-navy-muted)]">Field stops in county</p>
              <p className="font-semibold">{fieldEvents.totalInCounty}</p>
            </div>
          </div>
        </div>
      ) : null}

      {locationFundraising ? <LocationFundraisingPanel fundraising={locationFundraising} /> : null}

      {strikeTeam ? (
        <div className="mb-8">
          <CountyStrikeTeamPanel team={strikeTeam} compact />
        </div>
      ) : null}

      <LocationCalendarBindingPanel
        binding={calendarBinding}
        locationLabel={brief.name}
        countyName={brief.county}
        cityName={brief.name}
      />

      <VoterFileCityIntelSection
        citySlug={brief.slug}
        cityName={brief.name}
        countySlug={countySlug}
        countyName={brief.county}
      />

      {cityElectionIntel ? <CityElectionIntelPanel intel={cityElectionIntel} /> : null}

      <div className="mb-8">
        <LocationFieldEventsPanel
          title={`Field calendar · ${brief.name}`}
          subtitle={
            fieldEvents.cityScoped
              ? `City-specific stops · ref ${referenceDate}`
              : `County-wide stops (no city-specific entries yet) · ref ${referenceDate}`
          }
          upcoming={fieldEvents.upcoming}
          recent={fieldEvents.recent}
          cities={siblingCities}
          countyName={brief.county}
          countySlug={countySlug}
        />
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link href={countyHref} className="ep-chapter-link">
          Open {brief.county} County playbook →
        </Link>
        <Link href={locationBriefMasterPlanHref()} className="ep-chapter-link">
          Location brief master plan →
        </Link>
      </div>

      {brief.status === "scaffold" ? (
        <p className="mt-6 text-xs text-[var(--ep-navy-muted)]">
          Scaffold brief — enrich in{" "}
          <code className="text-[10px]">data/campaign-brain/city-location-briefs.source.json</code> per the master
          plan.
        </p>
      ) : null}
    </section>
  );
}
