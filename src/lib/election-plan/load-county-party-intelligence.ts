import profilesSource from "../../../data/campaign-brain/county-party-intelligence/county-party-profiles.normalized.json";
import candidatesSource from "../../../data/campaign-brain/county-party-intelligence/county-party-meeting-calendar.candidates.json";
import indexSource from "../../../data/campaign-brain/county-party-intelligence/county-party-source-index.json";
import chunksSource from "../../../data/campaign-brain/county-party-intelligence/county-party-search-chunks.json";
import { getAllCountyVictoryTargets } from "./load-county-victory-targets";

export type CountyPartyProfile = {
  county: string;
  slug: string;
  arkdemsSlug: string;
  countyPartyUrl: string | null;
  countyChair: string | null;
  electionCommissioner: string | null;
  meetingInfoRaw: string | null;
  parsedMeetingRule: {
    recurrence: string;
    weekday: string | null;
    ordinal: string | null;
    timeLocal: string | null;
    parseStatus: string;
  } | null;
  meetingLocation: string | null;
  meetingTime: string | null;
  contactUrl: string | null;
  website: string | null;
  facebook: string | null;
  xTwitter: string | null;
  instagram: string | null;
  sourceQuote: string | null;
  sourceUrl: string | null;
  lastFetchedAt: string | null;
  confidence: "high" | "medium" | "low" | "none";
  needsHumanVerification: boolean;
  fetchStatus: string;
  fetchError: string | null;
};

export type CountyMeetingCandidate = {
  county: string;
  slug: string;
  date: string;
  timeLocal: string | null;
  location: string | null;
  sourceRule: string;
  routingRecommendation: string;
  status: "candidate" | "needs_human_call";
  sourceUrl: string | null;
};

export type CountyPartySearchChunk = {
  id: string;
  county: string;
  slug: string;
  title: string;
  href: string;
  type: string;
  sourceUrl: string | null;
  sourcePath: string;
  content: string;
  keywords: string[];
};

export function getCountyPartyProfiles(): CountyPartyProfile[] {
  return (profilesSource as { profiles: CountyPartyProfile[] }).profiles;
}

export function getCountyPartyProfile(countyOrSlug: string): CountyPartyProfile | null {
  const key = countyOrSlug.toLowerCase();
  return (
    getCountyPartyProfiles().find(
      (p) => p.slug === key || p.county.toLowerCase() === key || p.arkdemsSlug === key,
    ) ?? null
  );
}

export function getCountyPartyProfileBySlug(slug: string): CountyPartyProfile | null {
  return getCountyPartyProfile(slug);
}

export function getCountyMeetingCandidates(): CountyMeetingCandidate[] {
  return (candidatesSource as { candidates: CountyMeetingCandidate[] }).candidates;
}

export function countyPartyMeetingEventId(slug: string, date: string): string {
  return `county-party-${slug}-${date}`;
}

export function getProposedCountyPartyMeetingsForCounty(slug: string): CountyMeetingCandidate[] {
  const today = new Date().toISOString().slice(0, 10);
  return getCountyMeetingCandidates()
    .filter((c) => c.slug === slug && c.status === "candidate" && c.date && c.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getCountyMeetingCandidatesForCounty(slug: string): CountyMeetingCandidate[] {
  const today = new Date().toISOString().slice(0, 10);
  return getCountyMeetingCandidates().filter(
    (c) => c.slug === slug && (c.status === "needs_human_call" || (c.date && c.date >= today)),
  );
}

export function getCountyPartySearchChunks(): CountyPartySearchChunk[] {
  return (chunksSource as { chunks: CountyPartySearchChunk[] }).chunks;
}

export function getCountyPartyIntelligenceRollup() {
  const profiles = getCountyPartyProfiles();
  const candidates = getCountyMeetingCandidates();
  return {
    countyCount: profiles.length,
    fetchedOk: profiles.filter((p) => p.fetchStatus === "ok").length,
    chairsFound: profiles.filter((p) => p.countyChair).length,
    commissionersFound: profiles.filter((p) => p.electionCommissioner).length,
    meetingsFound: profiles.filter((p) => p.meetingInfoRaw).length,
    parseableMeetings: profiles.filter((p) => p.parsedMeetingRule?.parseStatus === "parsed").length,
    needsVerification: profiles.filter((p) => p.needsHumanVerification).length,
    meetingCandidates: candidates.filter((c) => c.status === "candidate").length,
    sourceIndexUrl: (indexSource as { sourceIndexUrl: string }).sourceIndexUrl,
    generatedAt: (profilesSource as { generatedAt: string }).generatedAt,
  };
}

export function getRecommendedCountyPartyAction(profile: CountyPartyProfile): string {
  if (profile.needsHumanVerification) return "Call county party chair and confirm meeting before scheduling";
  if (profile.parsedMeetingRule?.parseStatus === "parsed") return "Request speaking slot · confirm with chair · add to calendar as proposed";
  if (profile.countyChair) return "Pair with local coffee or house party · surrogate outreach";
  return "County team follow-up · verify ArkDems page is current";
}

export function countyPartiesHubHref(): string {
  return "/election-plan/county-parties";
}

export function countyPartyDetailHref(slug: string): string {
  return `/election-plan/county-parties/${slug}`;
}

export function getTopCountyMeetingQueue(limit = 10): CountyMeetingCandidate[] {
  const today = new Date().toISOString().slice(0, 10);
  const strategic = new Set(getAllCountyVictoryTargets().filter((c) => c.isStrategic).map((c) => c.county));
  const growthByCounty = new Map(getAllCountyVictoryTargets().map((c) => [c.county, c.percentIncrease]));

  const sorted = getCountyMeetingCandidates()
    .filter((c) => c.status === "candidate" && c.date >= today)
    .sort((a, b) => {
      const aStrat = strategic.has(a.county) ? 0 : 1;
      const bStrat = strategic.has(b.county) ? 0 : 1;
      if (aStrat !== bStrat) return aStrat - bStrat;
      const aGrowth = growthByCounty.get(a.county) ?? 0;
      const bGrowth = growthByCounty.get(b.county) ?? 0;
      if (bGrowth !== aGrowth) return bGrowth - aGrowth;
      return a.date.localeCompare(b.date);
    });

  const seen = new Set<string>();
  const deduped: CountyMeetingCandidate[] = [];
  for (const c of sorted) {
    if (seen.has(c.slug)) continue;
    seen.add(c.slug);
    deduped.push(c);
    if (deduped.length >= limit) break;
  }
  return deduped;
}
