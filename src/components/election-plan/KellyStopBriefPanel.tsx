import Link from "next/link";

import { getCountyPartyProfileBySlug } from "@/lib/election-plan/load-county-party-intelligence";
import {
  formatDpaOfficerLine,
  getDpaChairForCounty,
  getDpaOfficerOrgsForLocation,
} from "@/lib/election-plan/load-dpa-county-officers";
import { CountyPartyOfficerRoster } from "@/components/election-plan/CountyPartyOfficerRoster";
import {
  filterImmersionMissionForDisplay,
  getImmersionMissionForLocation,
} from "@/lib/election-plan/load-immersion-county-missions";
import { getMissionProgress } from "@/lib/election-plan/load-immersion-mission-progress";
import { MissionProgressPanel } from "@/components/election-plan/MissionProgressPanel";
import type { StopCommandCenterView } from "@/lib/election-plan/forward-motion-stop-types";

type Props = {
  view: StopCommandCenterView;
};

function buildAskFor(view: StopCommandCenterView): string {
  const asks = view.powerOf5Goals.map((g) => `${g.goal} ${g.label.toLowerCase()}`);
  if (asks.length === 0) return "Recruit one Po5 leader · one house party host · three meaningful conversations.";
  return asks.slice(0, 3).join(" · ");
}

function buildAfterLeave(view: StopCommandCenterView): string {
  const parts = [
    view.stop.nextAction,
    "Log conversations and new volunteers in county file",
    view.mobilizeEnforcement.required ? "Confirm Mobilize event before public promotion" : null,
  ].filter(Boolean);
  return parts.join(" · ");
}

export function KellyStopBriefPanel({ view }: Props) {
  const countyParty = view.countySlug ? getCountyPartyProfileBySlug(view.countySlug) : null;
  const officerOrgs = getDpaOfficerOrgsForLocation({
    countySlug: view.countySlug,
    city: view.stop.city,
    eventSlug: view.stop.eventName,
  });
  const dpaChair = (view.countySlug ? getDpaChairForCounty(view.countySlug) : officerOrgs[0]?.chair) ?? null;
  const mission = filterImmersionMissionForDisplay(
    getImmersionMissionForLocation({
      countySlug: view.countySlug ?? undefined,
      citySlug: view.cityBrief?.slug,
    }),
    { surface: "stop-brief", citySlug: view.cityBrief?.slug },
  );
  const progress = mission ? getMissionProgress(mission.id) : null;

  const whoMeeting = [
    dpaChair ? formatDpaOfficerLine(dpaChair) : countyParty?.countyChair ? `County chair ${countyParty.countyChair}` : null,
    ...view.coalitionTargets.slice(0, 3).map((c) => c.label),
  ]
    .filter(Boolean)
    .join(" · ");

  const rows = [
    {
      q: "Where am I going?",
      a: `${view.stop.eventName} · ${view.stop.date}${view.timeLabel ? ` · ${view.timeLabel}` : ""} · ${view.stop.county}${view.stop.city !== "TBD" ? ` · ${view.stop.city}` : ""}${view.venue ? ` · ${view.venue}` : ""}`,
    },
    {
      q: "Who am I meeting?",
      a: whoMeeting || "County team + coalition partners — confirm names with field lead before arrival.",
    },
    {
      q: "Why does this stop matter?",
      a: mission
        ? `${mission.headline} — ${mission.tagline}`
        : view.whyItMatters,
    },
    {
      q: "What do I need to ask for?",
      a: buildAskFor(view),
    },
    {
      q: "What should happen after I leave?",
      a: buildAfterLeave(view),
    },
  ];

  return (
    <div className="mb-8 ep-card border-2 border-[var(--ep-gold)] bg-gradient-to-br from-amber-50/80 to-white">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--ep-gold)]">Kelly briefing · 5 questions</p>
      <h2 className="mt-1 font-heading text-xl font-bold text-[var(--ep-navy)]">What you need for this stop</h2>
      <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">Not the full strategy encyclopedia — five answers before you walk in.</p>

      <ol className="mt-5 space-y-4">
        {rows.map((row, i) => (
          <li key={row.q} className="border-l-4 border-[var(--ep-navy)] pl-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">
              {i + 1}. {row.q}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--ep-navy)]">{row.a}</p>
          </li>
        ))}
      </ol>

      {officerOrgs.length > 0 ? (
        <div className="mt-5">
          <CountyPartyOfficerRoster orgs={officerOrgs} variant="contacts" title="Who to call for this stop" />
        </div>
      ) : null}

      {mission && progress ? (
        <div className="mt-5">
          <MissionProgressPanel progress={progress} missionHeadline={mission.headline} compact />
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold">
        {view.countyPlaybookHref ? (
          <Link href={view.countyPlaybookHref} className="text-[var(--ep-navy)] hover:underline">
            County playbook →
          </Link>
        ) : null}
        {officerOrgs[0] ? (
          <Link href={officerOrgs[0].href} className="text-[var(--ep-navy)] hover:underline">
            County party officers →
          </Link>
        ) : countyParty ? (
          <Link href={`/election-plan/county-parties/${countyParty.slug}`} className="text-[var(--ep-navy)] hover:underline">
            County party intel →
          </Link>
        ) : null}
        <Link href="/election-plan/executive-book/doctrine" className="text-[var(--ep-navy-muted)] hover:underline">
          Campaign doctrine →
        </Link>
      </div>
    </div>
  );
}
