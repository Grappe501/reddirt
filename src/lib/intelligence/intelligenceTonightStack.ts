/**
 * Proactive "tonight's stack" — top prep surfaces without a search query.
 */
import { buildLiveEventSummary } from "@/lib/intelligence/v4/phase16P8LiveEventMode";
import { getAllTrapLaneIds, getTrapLaneDrillDown } from "@/lib/intelligence/v4/trapLaneDrillDowns";
import { classifyClaimsGate } from "@/lib/intelligence/v4/claimsGatePolicy";
import type { CandidateIntelSearchResult, IntelStageSafe } from "@/lib/intelligence/candidateIntelligenceSearch";

export type TonightStackItem = {
  href: string;
  title: string;
  why: string;
  stageSafe: IntelStageSafe;
  priority: number;
};

function gateToStageSafe(gate: string): IntelStageSafe {
  const s = classifyClaimsGate(gate);
  if (s === "clear") return "clear";
  if (s === "blocked") return "blocked";
  if (s === "research_only") return "research";
  return "verify";
}

export function buildTonightPrepStack(): TonightStackItem[] {
  const live = buildLiveEventSummary();
  const items: TonightStackItem[] = [];

  items.push({
    href: "/admin/intelligence",
    title: "Command home",
    why: "Readiness score, safe lines, and tonight's focus — start here every prep session.",
    stageSafe: "clear",
    priority: 1,
  });

  if (live.countdown.isActive || live.countdown.daysRemaining <= 14) {
    items.push({
      href: live.hubHref,
      title: live.countdown.eventLabel,
      why: live.tonightReminder,
      stageSafe: "clear",
      priority: 0.5,
    });
    items.push({
      href: live.accaPrepHref,
      title: "ACCA panel prep",
      why: "Moderated Q&A run-of-show for clerk-room vocabulary.",
      stageSafe: "verify",
      priority: 0.8,
    });
  }

  items.push({
    href: "/admin/intelligence/top-tier-prep",
    title: "Top-tier prep",
    why: "Promoted briefings and depth guides — highest-signal philosophy and handling.",
    stageSafe: "clear",
    priority: 1.2,
  });

  items.push({
    href: "/admin/intelligence/opposition-strategy",
    title: "Opposition strategy",
    why: "2021 package, 2025 petition cluster, offensive moves — contrast without smear.",
    stageSafe: "verify",
    priority: 1.1,
  });

  for (const id of getAllTrapLaneIds().slice(0, 3)) {
    const lane = getTrapLaneDrillDown(id);
    if (!lane) continue;
    items.push({
      href: `/admin/intelligence/trap-lanes/${id}`,
      title: lane.title,
      why: lane.summary.slice(0, 120),
      stageSafe: gateToStageSafe(lane.claimsGate ?? ""),
      priority: 2,
    });
  }

  items.push({
    href: "/admin/intelligence/sos-debate-questions",
    title: "SOS question bank",
    why: "Speak-order drills for the most likely moderator questions.",
    stageSafe: "verify",
    priority: 2.5,
  });

  items.push({
    href: "/admin/intelligence/claims",
    title: "Claims ledger",
    why: "Gate every broadcast line — VERIFIED vs NEEDS_REVIEW before stage.",
    stageSafe: "verify",
    priority: 3,
  });

  return items.sort((a, b) => a.priority - b.priority).slice(0, 8);
}

export function tonightStackToSearchResults(stack: TonightStackItem[]): CandidateIntelSearchResult[] {
  return stack.map((item, i) => ({
    kind: "nav" as const,
    href: item.href,
    title: item.title,
    snippet: item.why,
    score: 1 - i * 0.05,
    badge: "Tonight's stack",
    stageSafe: item.stageSafe,
    matchReason: "Recommended without search",
  }));
}
