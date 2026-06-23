/**
 * Day 8 Pass 2 — crash course surface merging Days 1–7 + three SOS domain balance.
 */
import {
  DAY8_OPENING_DOMAIN_BEATS,
  DAY8_SOS_DOMAIN_CARDS,
  DAY8_SOS_THREE_DOMAINS_FRAME,
  DAY8_WEEK_BALANCE_CORRECTION,
  type Day8SosDomainCard,
} from "@/lib/election-plan/debate-prep-day8-sos-three-domains";
import {
  DAY8_CLAIMS_GATE,
  DAY8_OPENING_BEATS,
  DAY8_CLOSING_BEATS,
} from "@/lib/election-plan/debate-prep-day8-crash-copy";
import { buildDay8RunSegments, type Day8RunSegment } from "@/lib/election-plan/debate-prep-day8-run-segments";
import { buildDay5CapitalizeSurface, type Day5WhenXSayYRow } from "@/lib/election-plan/load-day5-capitalize-surface";
import { buildDay7PolishSurface, type Day7PolishBookend } from "@/lib/election-plan/load-day7-polish-surface";
import { DAY8_ID } from "@/lib/election-plan/debatePrepDayDrillDown";

export type Day8OpeningBeat = {
  beat: number;
  label: string;
  objective: string;
  templateHint: string;
  href?: string;
};

export type Day8LockSheetDomainRow = {
  domainId: Day8SosDomainCard["id"];
  domainLabel: string;
  lockedLine: string;
  coveredInOpening: boolean;
  coveredInSos: boolean;
};

export type Day8CrashCourseSurface = {
  dayId: typeof DAY8_ID;
  threeDomainsFrame: string;
  weekBalanceCorrection: string;
  domains: readonly Day8SosDomainCard[];
  openingBeats: Day8OpeningBeat[];
  closingBeats: typeof DAY8_CLOSING_BEATS;
  bookends: {
    opening: Day7PolishBookend;
    closing: Day7PolishBookend;
  };
  whenXSayYPairs: Day5WhenXSayYRow[];
  runSegments: Day8RunSegment[];
  lockSheetDomainRows: Day8LockSheetDomainRow[];
  sosDomainCount: number;
  runSegmentCount: number;
  claimsGateLines: readonly string[];
  hasThreeDomainOpening: boolean;
  hasThreeDomainSos: boolean;
};

function buildOpeningBeats(): Day8OpeningBeat[] {
  return [
    {
      beat: 0,
      label: "Beat A · Administrator",
      objective: DAY8_OPENING_BEATS[0]?.objective ?? "Administrator frame — no opponent names",
      templateHint: "SOS is operations for seventy-five counties — not a senator listing bill numbers.",
      href: DAY8_OPENING_BEATS[0]?.href,
    },
    ...DAY8_OPENING_DOMAIN_BEATS.map((domainBeat) => ({
      beat: domainBeat.beat,
      label: `Beat B${domainBeat.beat} · ${domainBeat.domainLabel}`,
      objective: domainBeat.objective,
      templateHint: domainBeat.templateLine,
      href: domainBeat.href,
    })),
    {
      beat: 4,
      label: "Beat C · Arkansas promise",
      objective: DAY8_OPENING_BEATS[1]?.objective ?? "Picture primary persona — statewide tone",
      templateHint: "One sentence voters can repeat — clerk partnership inside, Arkansas people in front.",
      href: DAY8_OPENING_BEATS[1]?.href,
    },
  ];
}

function buildLockSheetRows(): Day8LockSheetDomainRow[] {
  return DAY8_SOS_DOMAIN_CARDS.map((domain) => ({
    domainId: domain.id,
    domainLabel: domain.shortLabel,
    lockedLine: domain.kellyProofTemplate.slice(0, 160),
    coveredInOpening: true,
    coveredInSos: true,
  }));
}

export function buildDay8CrashCourseSurface(): Day8CrashCourseSurface {
  const day7 = buildDay7PolishSurface();
  const day5 = buildDay5CapitalizeSurface();
  const runSegments = buildDay8RunSegments();
  const verifiedPairs = day5.pairs.filter((p) => !p.isPlaceholder && p.kellyLine.trim()).slice(0, 4);

  return {
    dayId: DAY8_ID,
    threeDomainsFrame: DAY8_SOS_THREE_DOMAINS_FRAME,
    weekBalanceCorrection: DAY8_WEEK_BALANCE_CORRECTION,
    domains: DAY8_SOS_DOMAIN_CARDS,
    openingBeats: buildOpeningBeats(),
    closingBeats: DAY8_CLOSING_BEATS,
    bookends: day7.bookends,
    whenXSayYPairs: verifiedPairs,
    runSegments,
    lockSheetDomainRows: buildLockSheetRows(),
    sosDomainCount: DAY8_SOS_DOMAIN_CARDS.length,
    runSegmentCount: runSegments.length,
    claimsGateLines: DAY8_CLAIMS_GATE,
    hasThreeDomainOpening: DAY8_OPENING_DOMAIN_BEATS.length === 3,
    hasThreeDomainSos: runSegments.filter((s) => s.kind === "sos").length === 3,
  };
}
