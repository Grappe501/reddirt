/**
 * Intelligence search v4 — unified SRE + copilot + smart search orchestration.
 */
import { runSmartIntelligenceSearch, type IntelSearchSmartBrief } from "@/lib/intelligence/intelligenceSmartSearch";
import {
  recommendCopilotToolsFromQuery,
  type AiPrepToolRecommendation,
} from "@/lib/intelligence/intelligenceAiPrepV4";
import type { CandidateIntelSearchResult, CandidateIntelCorpusCounts } from "@/lib/intelligence/candidateIntelligenceSearch";
import { INTEL_SEARCH_SUGGESTIONS_V4 } from "@/lib/intelligence/intelligenceSearchCore";
import { REHEARSAL_HUB_HREF } from "@/lib/intelligence/v4/phase16P0SessionLauncher";
import { RUN_OF_SHOW_HUB_HREF } from "@/lib/intelligence/v4/phase16P1RunOfShow";
import { ENCOUNTERS_HUB_HREF } from "@/lib/intelligence/v4/phase16P2EncounterScenarios";
import { DRILL_QUEUE_HUB_HREF } from "@/lib/intelligence/v4/phase16P3DrillQueueShared";
import { SESSION_DEBRIEF_HUB_HREF } from "@/lib/intelligence/v4/phase16P4SessionDebrief";
import { REHEARSAL_HISTORY_HUB_HREF } from "@/lib/intelligence/v4/phase16P6SessionMemory";
import { LIVE_EVENT_HUB_HREF } from "@/lib/intelligence/v4/phase16P8LiveEventMode";
import { SRE_CLOSURE_HUB_HREF } from "@/lib/intelligence/v4/phase16P9SreClosureDepth";
import type { IntelSearchIntent } from "@/lib/intelligence/intelligenceSearchCore";

export const INTEL_SEARCH_V4_VERSION = "smart-v4.0";

export type SreShortcut = {
  href: string;
  title: string;
  why: string;
};

const PROFILE_SUGGESTIONS: Record<"CANDIDATE" | "STAFF" | "CLERK_WEEK", string[]> = {
  CANDIDATE: [
    "trap lane pivot when he bites",
    "Hammer 2021 election package",
    "three-way speak order",
    "verified claims election funding",
    "psychology under attack",
  ],
  STAFF: [
    "Kim Hammer intelligence gaps",
    "claims NEEDS_REVIEW ledger",
    "evidence command export ready",
    "opposition vulnerability ranking",
    "media intake triage",
  ],
  CLERK_WEEK: [
    "ACCA panel prep Jun 11",
    "VVSG 2.0 county burden",
    "election funding remittance",
    "clerk week day-of plan",
    "Mountain View panel script",
  ],
};

const SRE_STACK: SreShortcut[] = [
  { href: REHEARSAL_HUB_HREF, title: "Session launcher", why: "Start tonight's rehearsal session" },
  { href: RUN_OF_SHOW_HUB_HREF, title: "Run of show", why: "Timed stage sequence" },
  { href: ENCOUNTERS_HUB_HREF, title: "Encounters", why: "Scenario drills for three-way stage" },
  { href: DRILL_QUEUE_HUB_HREF, title: "Drill queue", why: "Stage-safe card queue" },
  { href: SESSION_DEBRIEF_HUB_HREF, title: "Session debrief", why: "Capture what worked on stage" },
  { href: REHEARSAL_HISTORY_HUB_HREF, title: "Session memory", why: "Prior rehearsal notes" },
  { href: LIVE_EVENT_HUB_HREF, title: "Live event", why: "ACCA / day-of countdown" },
  { href: SRE_CLOSURE_HUB_HREF, title: "SRE closure", why: "Full stack readiness check" },
];

export function getSreShortcutsForIntent(intent?: IntelSearchIntent, limit = 4): SreShortcut[] {
  if (intent === "rehearse" || intent === "philosophy") {
    return SRE_STACK.slice(0, limit);
  }
  if (intent === "clerks") {
    return [
      { href: LIVE_EVENT_HUB_HREF, title: "Live event", why: "ACCA panel day-of prep" },
      { href: ENCOUNTERS_HUB_HREF, title: "Encounters", why: "Clerk-room scenario drills" },
      { href: DRILL_QUEUE_HUB_HREF, title: "Drill queue", why: "County burden card queue" },
      { href: REHEARSAL_HUB_HREF, title: "Session launcher", why: "Launch clerk-week rehearsal" },
    ].slice(0, limit);
  }
  if (intent === "opposition") {
    return [
      { href: DRILL_QUEUE_HUB_HREF, title: "Drill queue", why: "Opposition contrast cards" },
      { href: ENCOUNTERS_HUB_HREF, title: "Encounters", why: "Hammer attack scenarios" },
      { href: REHEARSAL_HUB_HREF, title: "Session launcher", why: "Rehearse offensive moves" },
    ].slice(0, limit);
  }
  return SRE_STACK.slice(0, 2);
}

export function getProfileSearchSuggestions(profile: "CANDIDATE" | "STAFF" | "CLERK_WEEK"): string[] {
  return PROFILE_SUGGESTIONS[profile] ?? [...INTEL_SEARCH_SUGGESTIONS_V4];
}

export type RunIntelligenceSearchV4Options = {
  query: string;
  profile?: "CANDIDATE" | "STAFF" | "CLERK_WEEK";
  mode?: "smart" | "quick";
  includeBrief?: boolean;
  limit?: number;
};

export type IntelligenceSearchV4Result = {
  version: typeof INTEL_SEARCH_V4_VERSION;
  results: CandidateIntelSearchResult[];
  smart: IntelSearchSmartBrief | null;
  corpusCounts: CandidateIntelCorpusCounts;
  analysis: {
    intent: string;
    intentLabel: string;
    urgency: string;
    rewrittenQueries: string[];
  } | null;
  didYouMean: string[];
  copilotRecommendations: AiPrepToolRecommendation[];
  sreShortcuts: SreShortcut[];
  profileSuggestions: string[];
};

export async function runIntelligenceSearchV4(
  options: RunIntelligenceSearchV4Options,
): Promise<IntelligenceSearchV4Result> {
  const profile = options.profile ?? "CANDIDATE";
  const base = await runSmartIntelligenceSearch({
    query: options.query,
    profile,
    mode: options.mode ?? "smart",
    includeBrief: options.includeBrief,
    limit: options.limit ?? 24,
  });

  const intent = (base.analysis?.intent ?? "general") as IntelSearchIntent;

  return {
    version: INTEL_SEARCH_V4_VERSION,
    results: base.results,
    smart: base.smart,
    corpusCounts: base.corpusCounts,
    analysis: base.analysis
      ? {
          intent: base.analysis.intent,
          intentLabel: base.analysis.intentLabel,
          urgency: base.analysis.urgency,
          rewrittenQueries: base.analysis.searchQueries,
        }
      : null,
    didYouMean: base.didYouMean ?? [],
    copilotRecommendations: recommendCopilotToolsFromQuery(options.query, intent, profile),
    sreShortcuts: getSreShortcutsForIntent(intent),
    profileSuggestions: getProfileSearchSuggestions(profile),
  };
}
