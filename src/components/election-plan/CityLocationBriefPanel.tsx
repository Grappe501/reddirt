import Link from "next/link";

import type { CityLocationBrief } from "@/lib/election-plan/load-city-location-brief";
import {
  cityLocationsHubHref,
  countyWorkbenchHref,
  locationBriefMasterPlanHref,
} from "@/lib/election-plan/location-links";
import { formatVotes } from "@/lib/election-plan/electionPlanData";
import { cn } from "@/lib/utils";

type Props = { brief: CityLocationBrief };

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

export function CityLocationBriefPanel({ brief }: Props) {
  const countyHref = countyWorkbenchHref(brief.county, brief.county.toLowerCase().replace(/\s+/g, "-"));

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

      <div className="ep-card ep-priority-card mb-8 border-l-4 border-[var(--ep-gold)]">
        <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Brief board</h2>
        <p className="mt-3 text-base leading-relaxed text-[var(--ep-navy-muted)]">{brief.briefBoard}</p>
      </div>

      <div className="mb-8 space-y-4">
        <NarrativeBlock title="What is going on here">{brief.situation}</NarrativeBlock>
        <NarrativeBlock title="How we penetrate">{brief.penetration}</NarrativeBlock>
        <NarrativeBlock title="What we are trying to accomplish">{brief.accomplishment}</NarrativeBlock>
        <NarrativeBlock title="Messaging in this location">{brief.messaging}</NarrativeBlock>
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

      <div className="flex flex-wrap gap-3 text-sm">
        <Link href={countyHref} className="ep-chapter-link">
          Open {brief.county} County workbench →
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
