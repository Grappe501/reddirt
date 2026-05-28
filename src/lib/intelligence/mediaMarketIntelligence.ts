import { loadCountyBriefingIntelligenceIndex } from "@/lib/intelligence/countyBriefingIntelligence";
import { loadArkansasMediaSourceRegistry } from "@/lib/intelligence/mediaSourceDiscovery";
import type {
  BorderCountyMediaProfile,
  BorderMediaCoverageSummary,
  MediaCoverageGap,
  MediaMarketProfile,
  MediaMarketReadinessSignal,
  MediaSourceInfluence,
} from "@/lib/intelligence/types/mediaMarketIntelligence";

export const MEDIA_MARKET_PROFILES: MediaMarketProfile[] = [
  {
    marketId: "memphis",
    marketName: "Memphis (TN/MS/AR tri-state)",
    homeState: "TN",
    statesCovered: ["TN", "MS", "AR"],
    arkansasCountiesInfluenced: ["crittenden", "mississippi", "lee", "phillips", "craighead"],
    dominantSourceTypes: ["tv_news", "news", "public_radio"],
    tvStations: ["WMC Action News 5", "WREG", "WHBQ Fox 13"],
    newspapers: ["Commercial Appeal", "Daily Memphian"],
    radioPublicRadio: ["WKNO Memphis", "WEVL"],
    podcastsBlogs: [],
    governmentSources: ["Shelby County / Memphis public pages"],
    campaignRelevance: "Dominates NE Arkansas river counties; shapes Crittenden and Delta awareness.",
    monitoringPriority: "HIGH",
    confidenceLevel: "HIGH",
    notes: "Cross-state TV often outweighs Little Rock for NE edge counties.",
  },
  {
    marketId: "springfield-mo",
    marketName: "Springfield (MO)",
    homeState: "MO",
    statesCovered: ["MO", "AR"],
    arkansasCountiesInfluenced: ["benton", "carroll", "boone", "marion", "washington"],
    dominantSourceTypes: ["tv_news", "news", "public_radio"],
    tvStations: ["KY3", "KOLR", "KSPR"],
    newspapers: ["Springfield News-Leader"],
    radioPublicRadio: ["KSMU"],
    podcastsBlogs: [],
    governmentSources: [],
    campaignRelevance: "North border NWA influence; Missouri political framing reaches Carroll/Boone.",
    monitoringPriority: "HIGH",
    confidenceLevel: "MEDIUM",
    notes: "Verify local feed URLs before NSI-10 intake.",
  },
  {
    marketId: "joplin-mo",
    marketName: "Joplin (MO)",
    homeState: "MO",
    statesCovered: ["MO", "AR", "OK", "KS"],
    arkansasCountiesInfluenced: ["benton", "mcdonald", "newton"],
    dominantSourceTypes: ["news", "tv_news"],
    tvStations: ["KOAM", "KODE"],
    newspapers: ["Joplin Globe"],
    radioPublicRadio: [],
    podcastsBlogs: [],
    governmentSources: [],
    campaignRelevance: "SW Missouri framing for extreme NW Arkansas.",
    monitoringPriority: "MEDIUM",
    confidenceLevel: "MEDIUM",
    notes: "RSS probed 2026-05-28 — pending robots review.",
  },
  {
    marketId: "tulsa-ok",
    marketName: "Tulsa (OK)",
    homeState: "OK",
    statesCovered: ["OK", "AR"],
    arkansasCountiesInfluenced: ["sebastian", "crawford", "leflore", "washington"],
    dominantSourceTypes: ["news", "tv_news", "public_radio"],
    tvStations: ["KOTV", "KJRH", "KTUL"],
    newspapers: ["Tulsa World"],
    radioPublicRadio: ["Public Radio Tulsa"],
    podcastsBlogs: [],
    governmentSources: [],
    campaignRelevance: "Western AR River Valley + Fort Smith area cross-border news.",
    monitoringPriority: "HIGH",
    confidenceLevel: "HIGH",
    notes: "Tulsa World RSS probed — not fetch-approved until NSI-10.",
  },
  {
    marketId: "fort-smith",
    marketName: "Fort Smith (AR/OK)",
    homeState: "AR",
    statesCovered: ["AR", "OK"],
    arkansasCountiesInfluenced: ["sebastian", "crawford", "franklin"],
    dominantSourceTypes: ["tv_news", "news"],
    tvStations: ["KHBS/KHOG (40/29)", "KFSM (5NEWS)"],
    newspapers: ["Times Record (SW Times Record)"],
    radioPublicRadio: [],
    podcastsBlogs: [],
    governmentSources: ["Sebastian County government"],
    campaignRelevance: "Local AR hub with OK spillover; debate-relevant for River Valley.",
    monitoringPriority: "HIGH",
    confidenceLevel: "MEDIUM",
    notes: "NSI-5 Sebastian county overlay.",
  },
  {
    marketId: "texarkana",
    marketName: "Texarkana (TX/AR)",
    homeState: "AR",
    statesCovered: ["AR", "TX"],
    arkansasCountiesInfluenced: ["miller", "little-river", "hempstead"],
    dominantSourceTypes: ["news", "tv_news"],
    tvStations: ["KTAL", "KSLA (Shreveport spillover)"],
    newspapers: ["Texarkana Gazette"],
    radioPublicRadio: [],
    podcastsBlogs: [],
    governmentSources: [],
    campaignRelevance: "SW border split city; TX media shapes Miller County.",
    monitoringPriority: "HIGH",
    confidenceLevel: "MEDIUM",
    notes: "Manual review — paywall/RSS unverified.",
  },
  {
    marketId: "shreveport",
    marketName: "Shreveport (LA)",
    homeState: "LA",
    statesCovered: ["LA", "AR", "TX"],
    arkansasCountiesInfluenced: ["miller", "columbia", "union", "lafayette"],
    dominantSourceTypes: ["tv_news", "news"],
    tvStations: ["KSLA", "KTBS", "KTAL"],
    newspapers: ["Shreveport Times"],
    radioPublicRadio: [],
    podcastsBlogs: [],
    governmentSources: [],
    campaignRelevance: "Southwest AR Louisiana spillover; election law stories cross border.",
    monitoringPriority: "HIGH",
    confidenceLevel: "MEDIUM",
    notes: "Manual review only.",
  },
  {
    marketId: "monroe-la",
    marketName: "Monroe (LA)",
    homeState: "LA",
    statesCovered: ["LA", "AR"],
    arkansasCountiesInfluenced: ["union", "ashley", "chicot", "desha"],
    dominantSourceTypes: ["news", "tv_news"],
    tvStations: ["KNOE", "KTVE"],
    newspapers: ["Monroe News-Star"],
    radioPublicRadio: [],
    podcastsBlogs: [],
    governmentSources: [],
    campaignRelevance: "Southeast AR Delta; Louisiana framing on agriculture and Delta policy.",
    monitoringPriority: "MEDIUM",
    confidenceLevel: "MEDIUM",
    notes: "MyArkLaMiss covers partial south AR; Monroe adds LA angle.",
  },
  {
    marketId: "cape-girardeau-bootheel",
    marketName: "Cape Girardeau / MO Bootheel",
    homeState: "MO",
    statesCovered: ["MO", "AR"],
    arkansasCountiesInfluenced: ["mississippi", "craighead", "greene", "clay"],
    dominantSourceTypes: ["news"],
    tvStations: ["KFVS12"],
    newspapers: ["Southeast Missourian", "Daily Press (Poplar Bluff)"],
    radioPublicRadio: [],
    podcastsBlogs: [],
    governmentSources: [],
    campaignRelevance: "Bootheel media reaches NE Arkansas more than Little Rock.",
    monitoringPriority: "MEDIUM",
    confidenceLevel: "MEDIUM",
    notes: "Jonesboro Sun is AR-local; MO bootheel TV still influential.",
  },
  {
    marketId: "little-rock",
    marketName: "Little Rock / Central Arkansas",
    homeState: "AR",
    statesCovered: ["AR"],
    arkansasCountiesInfluenced: ["pulaski", "statewide"],
    dominantSourceTypes: ["news", "tv_news", "public_radio"],
    tvStations: ["KARK", "KATV", "THV11"],
    newspapers: ["Arkansas Democrat-Gazette", "Arkansas Times"],
    radioPublicRadio: ["KUAR"],
    podcastsBlogs: [],
    governmentSources: ["Arkansas SOS", "Legislature"],
    campaignRelevance: "Statewide SOS race center; sufficient for Pulaski, insufficient for border counties alone.",
    monitoringPriority: "HIGH",
    confidenceLevel: "HIGH",
    notes: "Statewide paper important but not sufficient at borders.",
  },
  {
    marketId: "northwest-arkansas",
    marketName: "Northwest Arkansas",
    homeState: "AR",
    statesCovered: ["AR"],
    arkansasCountiesInfluenced: ["benton", "washington"],
    dominantSourceTypes: ["news", "tv_news"],
    tvStations: ["KNWA/FOX24", "40/29"],
    newspapers: ["NWA Democrat-Gazette"],
    radioPublicRadio: ["KUAF"],
    podcastsBlogs: [],
    governmentSources: [],
    campaignRelevance: "NSI-5 Benton/Washington briefings; cross-state MO/OK spillover still matters.",
    monitoringPriority: "HIGH",
    confidenceLevel: "HIGH",
    notes: "Cross-border Springfield/Tulsa monitoring supplements NWA.",
  },
];

const EDGE_COUNTY_MARKET_MAP: Record<
  string,
  {
    countyName: string;
    region: string;
    isBorder: boolean;
    primaryMarket: string;
    secondaryMarkets: string[];
    littleRockSufficient: boolean;
    priority: "HIGH" | "MEDIUM" | "LOW";
  }
> = {
  pulaski: {
    countyName: "Pulaski County",
    region: "central-arkansas",
    isBorder: false,
    primaryMarket: "little-rock",
    secondaryMarkets: ["statewide"],
    littleRockSufficient: true,
    priority: "HIGH",
  },
  benton: {
    countyName: "Benton County",
    region: "northwest-arkansas",
    isBorder: true,
    primaryMarket: "northwest-arkansas",
    secondaryMarkets: ["springfield-mo", "joplin-mo", "tulsa-ok"],
    littleRockSufficient: false,
    priority: "HIGH",
  },
  washington: {
    countyName: "Washington County",
    region: "northwest-arkansas",
    isBorder: true,
    primaryMarket: "northwest-arkansas",
    secondaryMarkets: ["springfield-mo", "tulsa-ok"],
    littleRockSufficient: false,
    priority: "HIGH",
  },
  sebastian: {
    countyName: "Sebastian County",
    region: "river-valley",
    isBorder: true,
    primaryMarket: "fort-smith",
    secondaryMarkets: ["tulsa-ok"],
    littleRockSufficient: false,
    priority: "HIGH",
  },
  craighead: {
    countyName: "Craighead County",
    region: "northeast-arkansas",
    isBorder: true,
    primaryMarket: "cape-girardeau-bootheel",
    secondaryMarkets: ["memphis", "little-rock"],
    littleRockSufficient: false,
    priority: "HIGH",
  },
  crittenden: {
    countyName: "Crittenden County",
    region: "delta",
    isBorder: true,
    primaryMarket: "memphis",
    secondaryMarkets: ["little-rock"],
    littleRockSufficient: false,
    priority: "HIGH",
  },
  miller: {
    countyName: "Miller County",
    region: "southwest-arkansas",
    isBorder: true,
    primaryMarket: "texarkana",
    secondaryMarkets: ["shreveport"],
    littleRockSufficient: false,
    priority: "HIGH",
  },
  union: {
    countyName: "Union County",
    region: "south-arkansas",
    isBorder: true,
    primaryMarket: "monroe-la",
    secondaryMarkets: ["shreveport"],
    littleRockSufficient: false,
    priority: "MEDIUM",
  },
  mississippi: {
    countyName: "Mississippi County",
    region: "delta",
    isBorder: true,
    primaryMarket: "memphis",
    secondaryMarkets: ["cape-girardeau-bootheel"],
    littleRockSufficient: false,
    priority: "HIGH",
  },
  lee: {
    countyName: "Lee County",
    region: "delta",
    isBorder: true,
    primaryMarket: "memphis",
    secondaryMarkets: ["cape-girardeau-bootheel"],
    littleRockSufficient: false,
    priority: "MEDIUM",
  },
};

function sourceToInfluence(row: Record<string, unknown>, influenceType: MediaSourceInfluence["influenceType"]): MediaSourceInfluence {
  return {
    sourceId: String(row.sourceId),
    sourceName: String(row.name),
    homeMarket: String(row.homeMarket ?? row.mediaMarket ?? "unknown"),
    state: String(row.state ?? "AR"),
    influenceType,
    localInfluenceScore: Number(row.localInfluenceScore ?? 0),
    borderMarketRelevance: String(row.borderMarketRelevance ?? ""),
    ingestionMethod: String(row.ingestionMethod),
    approvedForFetch: row.approvedForFetch === true,
  };
}

export function loadMediaMarketProfiles(): MediaMarketProfile[] {
  return MEDIA_MARKET_PROFILES;
}

export function resolveCrossStateSourcesForCounty(
  countyId: string,
  repoRoot?: string,
): MediaSourceInfluence[] {
  const registry = loadArkansasMediaSourceRegistry(repoRoot);
  return registry.sources
    .filter((row) => {
      const state = (row as { state?: string }).state;
      if (!state || state === "AR") return false;
      const influenced = (row as { arkansasBorderCountiesInfluenced?: string[] }).arkansasBorderCountiesInfluenced ?? [];
      return influenced.includes(countyId) || row.countiesCovered.includes(countyId);
    })
    .map((row) => sourceToInfluence(row as Record<string, unknown>, "primary"));
}

export function resolveCountyMediaMarketProfile(
  countyId: string,
  repoRoot?: string,
): BorderCountyMediaProfile | null {
  const map = EDGE_COUNTY_MARKET_MAP[countyId];
  if (!map) return null;

  const registry = loadArkansasMediaSourceRegistry(repoRoot);
  const profiles = loadMediaMarketProfiles();
  const primary = profiles.find((p) => p.marketId === map.primaryMarket);
  const secondary = map.secondaryMarkets
    .map((id) => profiles.find((p) => p.marketId === id))
    .filter((p): p is MediaMarketProfile => Boolean(p));

  const arkansasSources = registry.sources
    .filter((row) => {
      const state = (row as { state?: string }).state ?? "AR";
      return state === "AR" && (row.countiesCovered.includes(countyId) || row.countiesCovered.includes("statewide"));
    })
    .slice(0, 8)
    .map((row) => sourceToInfluence(row as Record<string, unknown>, row.countiesCovered.includes("statewide") ? "statewide" : "primary"));

  const crossStateSources = resolveCrossStateSourcesForCounty(countyId, repoRoot);

  const localPapers = [
    ...primary?.newspapers ?? [],
    ...secondary.flatMap((p) => p.newspapers),
  ];
  const localRadio = [
    ...primary?.radioPublicRadio ?? [],
    ...secondary.flatMap((p) => p.radioPublicRadio),
  ];
  const tvMarketInfluence = [
    ...primary?.tvStations ?? [],
    ...secondary.flatMap((p) => p.tvStations),
  ];

  const coverageGaps: string[] = [];
  if (!map.littleRockSufficient) {
    coverageGaps.push("Little Rock / statewide media alone is likely insufficient for voter awareness.");
  }
  if (crossStateSources.length === 0) {
    coverageGaps.push("No cross-state sources registered for this county yet.");
  }
  if (crossStateSources.every((s) => !s.approvedForFetch)) {
    coverageGaps.push("Cross-state sources require manual review — no automated fetch approved.");
  }

  const messagingImplications: string[] = [];
  if (!map.littleRockSufficient) {
    messagingImplications.push("Do not assume statewide Little Rock messaging reaches this county's voters.");
  }
  if (localPapers.length > 0) {
    messagingImplications.push("Local paper outreach and validation may matter more than statewide digital.");
  }
  if (tvMarketInfluence.some((t) => t.includes("Memphis") || t.includes("Tulsa") || t.includes("Shreveport"))) {
    messagingImplications.push("Cross-state TV likely shapes public awareness — validate talking points locally.");
  }
  if (map.isBorder) {
    messagingImplications.push("Regional language and examples should be validated with county field team.");
  }

  const readinessSignals = computeSignalsForCounty(countyId, map, crossStateSources.length, coverageGaps);

  let monitoringStrength: BorderCountyMediaProfile["monitoringStrength"] = "MODERATE";
  if (coverageGaps.length >= 3 || crossStateSources.length === 0) monitoringStrength = "WEAK";
  if (crossStateSources.length >= 2 && arkansasSources.length >= 3) monitoringStrength = "STRONG";

  return {
    countyId,
    countyName: map.countyName,
    region: map.region,
    isBorderCounty: map.isBorder,
    primaryMediaMarket: primary?.marketName ?? map.primaryMarket,
    secondaryMediaMarkets: secondary.map((p) => p.marketName),
    arkansasSources,
    crossStateSources,
    localPapers,
    localRadio,
    tvMarketInfluence,
    statewidePaperImportant: !map.littleRockSufficient,
    littleRockCoverageSufficient: map.littleRockSufficient,
    monitoringStrength,
    coverageGaps,
    monitoringPriority: map.priority,
    messagingImplications,
    readinessSignals,
  };
}

function computeSignalsForCounty(
  countyId: string,
  map: (typeof EDGE_COUNTY_MARKET_MAP)[string],
  crossStateCount: number,
  gaps: string[],
): Array<{ signal: MediaMarketReadinessSignal; text: string }> {
  const signals: Array<{ signal: MediaMarketReadinessSignal; text: string }> = [];

  if (map.isBorder && crossStateCount >= 2) {
    signals.push({
      signal: "BORDER_MEDIA_STRONG",
      text: `${map.countyName}: ${crossStateCount} cross-state sources registered — border monitoring footprint present.`,
    });
  }
  if (map.isBorder && crossStateCount === 0) {
    signals.push({
      signal: "BORDER_MEDIA_WEAK",
      text: `${map.countyName}: no cross-state sources registered — edge monitoring gap.`,
    });
  }
  if (localPapersCritical(countyId)) {
    signals.push({
      signal: "LOCAL_PAPER_CRITICAL",
      text: `${map.countyName}: local papers likely more influential than statewide outlets.`,
    });
  }
  if (map.primaryMarket === "memphis" || map.primaryMarket === "tulsa-ok" || map.primaryMarket === "shreveport") {
    signals.push({
      signal: "CROSS_STATE_TV_DOMINANT",
      text: `${map.countyName}: primary market ${map.primaryMarket} — cross-state TV likely dominates awareness.`,
    });
  }
  if (!map.littleRockSufficient) {
    signals.push({
      signal: "STATEWIDE_PAPER_IMPORTANT",
      text: `${map.countyName}: statewide paper supplements but does not replace local/border media.`,
    });
  }
  if (gaps.length > 0) {
    signals.push({
      signal: "MEDIA_COVERAGE_GAP",
      text: gaps[0] ?? "Coverage gap flagged.",
    });
  }
  signals.push({
    signal: "MANUAL_REVIEW_REQUIRED",
    text: `${map.countyName}: all cross-border findings remain NEEDS_REVIEW / NON_PUBLISHABLE.`,
  });

  return signals;
}

function localPapersCritical(countyId: string): boolean {
  return ["craighead", "sebastian", "miller", "crittenden", "union"].includes(countyId);
}

export function summarizeBorderMediaCoverage(repoRoot?: string): BorderMediaCoverageSummary {
  const registry = loadArkansasMediaSourceRegistry(repoRoot);
  const crossState = registry.sources.filter((row) => {
    const state = (row as { state?: string }).state;
    return state && state !== "AR";
  });

  const edgeCounties = Object.keys(EDGE_COUNTY_MARKET_MAP);
  const gaps = computeMediaCoverageGaps(repoRoot);

  return {
    generatedAt: new Date().toISOString(),
    marketCount: MEDIA_MARKET_PROFILES.length,
    crossStateSourceCount: crossState.length,
    edgeCountyCount: edgeCounties.length,
    fetchApprovedCrossState: crossState.filter((row) => row.approvedForFetch).length,
    manualReviewCrossState: crossState.filter((row) => row.ingestionMethod === "MANUAL_REVIEW" || !row.approvedForFetch).length,
    highPriorityMarkets: MEDIA_MARKET_PROFILES.filter((p) => p.monitoringPriority === "HIGH").map((p) => p.marketName),
    coverageGapCount: gaps.length,
  };
}

export function computeMediaCoverageGaps(repoRoot?: string): MediaCoverageGap[] {
  const gaps: MediaCoverageGap[] = [];
  for (const countyId of Object.keys(EDGE_COUNTY_MARKET_MAP)) {
    const profile = resolveCountyMediaMarketProfile(countyId, repoRoot);
    if (!profile) continue;
    for (const text of profile.coverageGaps) {
      gaps.push({
        countyId,
        countyName: profile.countyName,
        gapType: "border_media",
        signal: "MEDIA_COVERAGE_GAP",
        text,
      });
    }
    if (profile.monitoringStrength === "WEAK") {
      gaps.push({
        countyId,
        countyName: profile.countyName,
        gapType: "monitoring_weak",
        signal: "BORDER_MEDIA_WEAK",
        text: `${profile.countyName}: monitoring strength WEAK — expand cross-state registry.`,
      });
    }
  }
  return gaps;
}

export function computeMediaMarketReadinessSignals(
  repoRoot?: string,
): Array<{ countyId: string; signal: MediaMarketReadinessSignal; text: string }> {
  const out: Array<{ countyId: string; signal: MediaMarketReadinessSignal; text: string }> = [];
  for (const countyId of Object.keys(EDGE_COUNTY_MARKET_MAP)) {
    const profile = resolveCountyMediaMarketProfile(countyId, repoRoot);
    if (!profile) continue;
    for (const row of profile.readinessSignals) {
      out.push({ countyId, signal: row.signal, text: row.text });
    }
  }
  return out;
}

export function summarizeManualReviewBurden(repoRoot?: string): {
  totalManualCrossState: number;
  byMarket: Record<string, number>;
} {
  const registry = loadArkansasMediaSourceRegistry(repoRoot);
  const crossState = registry.sources.filter((row) => (row as { state?: string }).state !== "AR");
  const byMarket: Record<string, number> = {};
  for (const row of crossState) {
    const market = String((row as { homeMarket?: string }).homeMarket ?? "unknown");
    byMarket[market] = (byMarket[market] ?? 0) + 1;
  }
  return {
    totalManualCrossState: crossState.filter((row) => !row.approvedForFetch).length,
    byMarket,
  };
}

export function summarizeBorderMediaIntelligence(repoRoot?: string): {
  coverage: BorderMediaCoverageSummary;
  gaps: MediaCoverageGap[];
  signals: ReturnType<typeof computeMediaMarketReadinessSignals>;
  manualBurden: ReturnType<typeof summarizeManualReviewBurden>;
} {
  return {
    coverage: summarizeBorderMediaCoverage(repoRoot),
    gaps: computeMediaCoverageGaps(repoRoot),
    signals: computeMediaMarketReadinessSignals(repoRoot),
    manualBurden: summarizeManualReviewBurden(repoRoot),
  };
}

export function recommendBorderMarketMonitoringPriorities(repoRoot?: string): string[] {
  const intel = summarizeBorderMediaIntelligence(repoRoot);
  return [
    ...intel.coverage.highPriorityMarkets.slice(0, 3).map((m) => `Monitor market: ${m}`),
    ...intel.gaps.slice(0, 4).map((g) => g.text),
    "Verify robots.txt before enabling cross-state RSS in NSI-10.",
  ];
}

export function summarizeEdgeCountyCoverageGaps(repoRoot?: string): string[] {
  return computeMediaCoverageGaps(repoRoot).map((g) => `${g.countyName}: ${g.text}`);
}

export function recommendLocalPaperReviewPriorities(repoRoot?: string): string[] {
  const index = loadCountyBriefingIntelligenceIndex(repoRoot);
  const priorities: string[] = [];
  for (const county of index.counties) {
    const profile = resolveCountyMediaMarketProfile(county.countyId, repoRoot);
    if (profile?.readinessSignals.some((s) => s.signal === "LOCAL_PAPER_CRITICAL")) {
      priorities.push(`${county.countyName}: prioritize local paper review over statewide clips.`);
    }
  }
  for (const countyId of ["crittenden", "miller", "craighead"]) {
    const profile = resolveCountyMediaMarketProfile(countyId, repoRoot);
    if (profile && !priorities.some((p) => p.includes(profile.countyName))) {
      priorities.push(`${profile.countyName}: border market ${profile.primaryMediaMarket} — manual monitoring.`);
    }
  }
  return priorities.slice(0, 6);
}
