/**
 * Phase 15 P1 — Unified candidate command home feed.
 */
import { loadClaimLedger } from "@/lib/intelligence/claims/claimLedgerStore";
import type { ClaimLedgerEntry } from "@/lib/intelligence/claims/claimLedgerTypes";
import { summarizeClaimLedger } from "@/lib/intelligence/claims/claimLedgerSummary";
import { loadDebateIntelligenceV4HubPacket } from "@/lib/intelligence/v4/debateIntelligenceV4";
import { CANDIDATE_COMMAND_HOME_HREF } from "@/lib/intelligence/v4/phase15CandidateCommandDepth";
import {
  countTopTierPrepMinutes,
  listTopTierPrepTonight,
  TOP_TIER_PREP_HUB_HREF,
  type TopTierPrepItem,
} from "@/lib/intelligence/v4/phase15P4TopTierSurfacing";
import {
  buildEvidenceHonestySummary,
  type EvidenceHonestySummary,
} from "@/lib/intelligence/v4/phase15P5EvidenceHonesty";
import {
  buildDemoModeSummary,
  type DemoModeSummary,
} from "@/lib/intelligence/v4/phase15P6DemoMode";
import { isIntelligenceDemoMode } from "@/lib/intelligence/v4/intelligenceDemoMode";
import {
  buildIpadPolishSummary,
  type IpadPolishSummary,
} from "@/lib/intelligence/v4/phase15P7IpadPolish";
import {
  buildStaffBackstageSummary,
  type StaffBackstageSummary,
} from "@/lib/intelligence/v4/phase15P8StaffBackstage";
import {
  buildRehearsalLauncherSummary,
  type RehearsalLauncherSummary,
} from "@/lib/intelligence/v4/phase16P0SessionLauncher";
import {
  buildRunOfShowSummary,
  type RunOfShowSummary,
} from "@/lib/intelligence/v4/phase16P1RunOfShow";
import {
  buildEncounterScenariosSummary,
  type EncounterScenariosSummary,
} from "@/lib/intelligence/v4/phase16P2EncounterScenarios";
import {
  buildDrillQueueSummary,
  type DrillQueueSummary,
} from "@/lib/intelligence/v4/phase16P3DrillQueue";
import {
  buildSessionDebriefSummary,
  type SessionDebriefSummary,
} from "@/lib/intelligence/v4/phase16P4SessionDebrief";
import {
  buildIpadDrillPlayerSummary,
  type IpadDrillPlayerSummary,
} from "@/lib/intelligence/v4/phase16P5IpadDrillPlayer";
import {
  buildSessionMemorySummary,
  type SessionMemorySummary,
} from "@/lib/intelligence/v4/phase16P6SessionMemory";
import {
  buildStaffCoachSummary,
  type StaffCoachSummary,
} from "@/lib/intelligence/v4/phase16P7StaffCoach";
import {
  buildLiveEventSummary,
  type LiveEventSummary,
} from "@/lib/intelligence/v4/phase16P8LiveEventMode";
import { isCandidateIpadMode } from "@/lib/intelligence/candidateIpadMode";

export type CandidateStageLine = {
  id: string;
  claimText: string;
  domain: string;
  reason: string;
  href: string;
};

export type CandidateCommandHomeFeed = {
  homeHref: string;
  readinessPct: number;
  readinessLabel: string;
  safeTonight: CandidateStageLine[];
  blockedTonight: CandidateStageLine[];
  claimsSummary: {
    verified: number;
    needsReview: number;
    total: number;
  };
  todayFocus: string[];
  topTierTonight: TopTierPrepItem[];
  topTierHubHref: string;
  topTierMinutesTotal: number;
  evidenceHonesty: EvidenceHonestySummary;
  demoMode: DemoModeSummary;
  ipadPolish: IpadPolishSummary;
  staffBackstage: StaffBackstageSummary;
  rehearsalLauncher: RehearsalLauncherSummary;
  runOfShow: RunOfShowSummary;
  encounterScenarios: EncounterScenariosSummary;
  drillQueue: DrillQueueSummary;
  sessionDebrief: SessionDebriefSummary;
  ipadDrillPlayer: IpadDrillPlayerSummary;
  sessionMemory: SessionMemorySummary;
  staffCoach: StaffCoachSummary;
  liveEvent: LiveEventSummary;
};

function isStageSafe(entry: ClaimLedgerEntry): boolean {
  return (
    entry.classification === "VERIFIED" ||
    entry.verificationStatus === "HUMAN_APPROVED_FOR_PUBLIC_ADAPTATION" ||
    entry.verificationStatus === "HUMAN_APPROVED_INTERNAL"
  );
}

function isStageBlocked(entry: ClaimLedgerEntry): boolean {
  return (
    entry.classification === "NEEDS_REVIEW" ||
    entry.classification === "UNSUPPORTED" ||
    entry.verificationStatus === "NEEDS_REVIEW" ||
    entry.internalUseStatus === "DO_NOT_USE" ||
    entry.publicUseRisk === "CRITICAL"
  );
}

function toStageLine(entry: ClaimLedgerEntry, reason: string): CandidateStageLine {
  return {
    id: entry.id,
    claimText: entry.claimText,
    domain: entry.domain,
    reason,
    href: `/admin/intelligence/claims#${entry.id}`,
  };
}

export function buildCandidateCommandHomeFeed(): CandidateCommandHomeFeed {
  const v4 = loadDebateIntelligenceV4HubPacket();
  const summary = summarizeClaimLedger();
  const entries = loadClaimLedger().entries;

  const readinessPct =
    v4.readinessScorecard.length > 0
      ? Math.round(
          v4.readinessScorecard.reduce((s, d) => s + d.score, 0) / v4.readinessScorecard.length,
        )
      : 0;

  const safeEntries = entries
    .filter(isStageSafe)
    .sort((a, b) => b.confidenceScore - a.confidenceScore)
    .slice(0, 3);

  const blockedEntries = entries
    .filter(isStageBlocked)
    .sort((a, b) => {
      const rank = (e: ClaimLedgerEntry) =>
        e.publicUseRisk === "CRITICAL" ? 3 : e.classification === "UNSUPPORTED" ? 2 : 1;
      return rank(b) - rank(a);
    })
    .slice(0, 3);

  const safeTonight = safeEntries.map((e) =>
    toStageLine(
      e,
      e.verificationStatus === "HUMAN_APPROVED_FOR_PUBLIC_ADAPTATION"
        ? "Approved for public adaptation"
        : "Verified in claims ledger",
    ),
  );

  const blockedTonight = blockedEntries.map((e) =>
    toStageLine(
      e,
      e.recommendedHumanAction?.trim() ||
        (e.classification === "UNSUPPORTED" ? "Unsupported — do not say on stage" : "Needs staff review before stage"),
    ),
  );

  const lowestDimension = [...v4.readinessScorecard].sort((a, b) => a.score - b.score)[0];
  const topTierTonight = listTopTierPrepTonight();
  const todayFocus = [
    `Start with top-tier prep — ${topTierTonight.length} promoted reads (~${countTopTierPrepMinutes(topTierTonight)} min).`,
    lowestDimension
      ? `Strengthen ${lowestDimension.label.toLowerCase()} (${lowestDimension.score}%) before deep drills.`
      : "Review readiness dimensions on debate command.",
    "Rehearse one trap lane with speak-order drills — never end on agree alone.",
    summary.needsReviewClaims > 0
      ? `${summary.needsReviewClaims} claims still NEEDS_REVIEW — use research-question framing only.`
      : "Claims firewall clear for verified lines — still verify before any new adaptation.",
  ];

  return {
    homeHref: CANDIDATE_COMMAND_HOME_HREF,
    readinessPct,
    readinessLabel:
      readinessPct >= 85
        ? "Stage-ready band"
        : readinessPct >= 70
          ? "Rehearsal band"
          : "Build gaps open",
    safeTonight,
    blockedTonight,
    claimsSummary: {
      verified: summary.verifiedClaims + summary.approvedPublicAdaptation,
      needsReview: summary.needsReviewClaims,
      total: summary.totalClaims,
    },
    todayFocus,
    topTierTonight,
    topTierHubHref: TOP_TIER_PREP_HUB_HREF,
    topTierMinutesTotal: countTopTierPrepMinutes(topTierTonight),
    evidenceHonesty: buildEvidenceHonestySummary(),
    demoMode: buildDemoModeSummary(isIntelligenceDemoMode()),
    ipadPolish: buildIpadPolishSummary(isCandidateIpadMode()),
    staffBackstage: buildStaffBackstageSummary(),
    rehearsalLauncher: buildRehearsalLauncherSummary(),
    runOfShow: buildRunOfShowSummary(),
    encounterScenarios: buildEncounterScenariosSummary(),
    drillQueue: buildDrillQueueSummary(),
    sessionDebrief: buildSessionDebriefSummary(),
    ipadDrillPlayer: buildIpadDrillPlayerSummary(),
    sessionMemory: buildSessionMemorySummary(),
    staffCoach: buildStaffCoachSummary(),
    liveEvent: buildLiveEventSummary(),
  };
}
