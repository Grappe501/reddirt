/**
 * Day 8 Pass 2 — abbreviated debate run-through segments (three-domain SOS coverage).
 */
import { DAY8_SOS_DOMAIN_CARDS, type Day8SosDomainId } from "@/lib/election-plan/debate-prep-day8-sos-three-domains";
import { DAY8_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import { epDebatePrepDayBlockHref, epTrapLaneHref } from "@/lib/election-plan/debate-prep-links";

export type Day8RunSegmentKind =
  | "walk-on"
  | "opening"
  | "trap"
  | "sos"
  | "pile-on"
  | "closing";

export type Day8RunSegment = {
  segmentIndex: number;
  kind: Day8RunSegmentKind;
  label: string;
  timedMinutes: number;
  staffRole: "moderator" | "hammer" | "pakko";
  kellyObjective: string;
  sourceDayId: string;
  href?: string;
  /** Set for SOS segments — must cover all three domains in run-through */
  sosDomainId?: Day8SosDomainId;
};

const TRAP_LANES = [
  { laneId: "county-champion", sourceDayId: "day-2-read-the-table" },
  { laneId: "integrity-without-participation", sourceDayId: "day-5-anticipate-and-capitalize" },
] as const;

export function buildDay8RunSegments(): Day8RunSegment[] {
  const segments: Day8RunSegment[] = [
    {
      segmentIndex: 1,
      kind: "walk-on",
      label: "Walk-on · breath + scan",
      timedMinutes: 1,
      staffRole: "moderator",
      kellyObjective: "Feet planted — picture Marcia T. — no notes on walk.",
      sourceDayId: DAY8_ID,
      href: epDebatePrepDayBlockHref(DAY8_ID, "s8-command"),
    },
    {
      segmentIndex: 2,
      kind: "opening",
      label: "Opening 90s · three SOS domains in beat B",
      timedMinutes: 2,
      staffRole: "moderator",
      kellyObjective: "Administrator frame → elections + business services + Capitol management → Arkansas promise.",
      sourceDayId: "day-1-command-foundation",
      href: epDebatePrepDayBlockHref(DAY8_ID, "s8-opening-workshop"),
    },
  ];

  TRAP_LANES.forEach((trap, idx) => {
    segments.push({
      segmentIndex: segments.length + 1,
      kind: "trap",
      label: `Trap · lane ${idx + 1}`,
      timedMinutes: 3,
      staffRole: "hammer",
      kellyObjective: "When-X-say-Y under 60s — claims-green only.",
      sourceDayId: trap.sourceDayId,
      href: epTrapLaneHref(trap.laneId),
    });
  });

  DAY8_SOS_DOMAIN_CARDS.forEach((domain) => {
    segments.push({
      segmentIndex: segments.length + 1,
      kind: "sos",
      label: `SOS · ${domain.shortLabel}`,
      timedMinutes: 2,
      staffRole: "moderator",
      kellyObjective: domain.answerSpine.slice(0, 200),
      sourceDayId: DAY8_ID,
      href: domain.href,
      sosDomainId: domain.id,
    });
  });

  segments.push(
    {
      segmentIndex: segments.length + 1,
      kind: "pile-on",
      label: "Pile-on · government trust",
      timedMinutes: 2,
      staffRole: "hammer",
      kellyObjective: "Bridge to service desk — rise to statewide tone — all three domains in one pivot if needed.",
      sourceDayId: "day-5-anticipate-and-capitalize",
      href: epDebatePrepDayBlockHref(DAY8_ID, "s8-middle-game"),
    },
    {
      segmentIndex: segments.length + 1,
      kind: "closing",
      label: "Closing 60s · service desk promise",
      timedMinutes: 2,
      staffRole: "moderator",
      kellyObjective: "Peak-end — elections + business + Capitol in final invoke — hold silence 2s.",
      sourceDayId: "day-7-refine-and-steal-show",
      href: epDebatePrepDayBlockHref(DAY8_ID, "s8-closing-workshop"),
    },
  );

  return segments.map((s, i) => ({ ...s, segmentIndex: i + 1 }));
}

export const DAY8_RUN_SEGMENT_COUNT = buildDay8RunSegments().length;
