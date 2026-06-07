/**
 * Phase 16 P4 — Session debrief (pre-stage checklist + post-session capture).
 */
import { buildCandidateCommandHomeFeed } from "@/lib/intelligence/v4/candidateCommandHome";
import { isCandidateIpadMode } from "@/lib/intelligence/candidateIpadMode";
import { REHEARSAL_HUB_HREF } from "@/lib/intelligence/v4/phase16P0SessionLauncher";
import { countSessionDebriefCaptures, loadSessionDebriefState } from "@/lib/intelligence/v4/phase16P4SessionDebriefState";

export const SESSION_DEBRIEF_HUB_HREF = "/admin/intelligence/session-debrief";

export const PHASE16_P4_PRE_CHECKLIST_TOTAL = 5;
export const HUMAN_ACTION_QUEUE_HREF = "/admin/intelligence/action-queue";

export type PreStageChecklistItemId =
  | "claims-clear"
  | "encounter-selected"
  | "ipad-ready"
  | "evidence-honesty"
  | "safe-lines-reviewed";

export type PreStageChecklistStatus = "pass" | "warn" | "manual";

export type PreStageChecklistItem = {
  itemId: PreStageChecklistItemId;
  order: number;
  title: string;
  description: string;
  href: string;
  autoStatus: PreStageChecklistStatus;
  statusLabel: string;
  kellyBeat: string;
};

export const PRE_STAGE_CHECKLIST_IDS: PreStageChecklistItemId[] = [
  "claims-clear",
  "encounter-selected",
  "ipad-ready",
  "evidence-honesty",
  "safe-lines-reviewed",
];

export function buildPreStageChecklist(): PreStageChecklistItem[] {
  const feed = buildCandidateCommandHomeFeed();
  const needsReview = feed.claimsSummary.needsReview;
  const safeCount = feed.safeTonight.length;
  const ipadOn = isCandidateIpadMode();

  return [
    {
      itemId: "claims-clear",
      order: 1,
      title: "Claims ledger clear for stage",
      description: "No NEEDS_REVIEW lines rehearsed as proof — research-question framing only if blocked.",
      href: "/admin/intelligence/claims",
      autoStatus: needsReview === 0 ? "pass" : "warn",
      statusLabel: needsReview === 0 ? "Clear" : `${needsReview} NEEDS_REVIEW`,
      kellyBeat: "Scan blocked tonight lines on command home before any new adaptation.",
    },
    {
      itemId: "encounter-selected",
      order: 2,
      title: "Tonight's encounter selected",
      description: "Pick debate prep, ACCA panel, clerk 1:1, or purchase walkthrough before drills.",
      href: REHEARSAL_HUB_HREF,
      autoStatus: "pass",
      statusLabel: "Default debate prep ready",
      kellyBeat: "Session launcher sets the run-of-show — do not skip encounter pick.",
    },
    {
      itemId: "ipad-ready",
      order: 3,
      title: "iPad stage-side mode",
      description: "Rehearse on the same device you carry side-stage — candidate profile, touch targets.",
      href: "/admin/intelligence/ipad-polish",
      autoStatus: ipadOn ? "pass" : "manual",
      statusLabel: ipadOn ? "iPad mode on" : "Desktop — enable iPad env for stage-side",
      kellyBeat: "NEXT_PUBLIC_CANDIDATE_IPAD_MODE=true for five-tab candidate shell.",
    },
    {
      itemId: "evidence-honesty",
      order: 4,
      title: "Evidence honesty badges reviewed",
      description: "VERIFIED / NEEDS_REVIEW / NON_PUBLISHABLE visible before any proof language.",
      href: "/admin/intelligence/evidence-honesty",
      autoStatus: "manual",
      statusLabel: `${feed.evidenceHonesty.nonStageSafeCount} gated film drills`,
      kellyBeat: "Honesty badge on every drill — never cite unverified totals on stage.",
    },
    {
      itemId: "safe-lines-reviewed",
      order: 5,
      title: "Safe tonight lines reviewed",
      description: "Read staff-cleared lines on command home — know what you can say before doors.",
      href: "/admin/intelligence",
      autoStatus: safeCount > 0 ? "pass" : "warn",
      statusLabel: safeCount > 0 ? `${safeCount} safe lines` : "No verified lines yet",
      kellyBeat: "Safe tonight strip is your stage whitelist — blocked lines stay off-mic.",
    },
  ];
}

export type SessionDebriefSummary = {
  hubHref: string;
  checklistCount: number;
  captureCount: number;
  actionQueueHref: string;
  tonightReminder: string;
};

export function buildSessionDebriefSummary(): SessionDebriefSummary {
  const captures = countSessionDebriefCaptures();
  return {
    hubHref: SESSION_DEBRIEF_HUB_HREF,
    checklistCount: PHASE16_P4_PRE_CHECKLIST_TOTAL,
    captureCount: captures,
    actionQueueHref: HUMAN_ACTION_QUEUE_HREF,
    tonightReminder:
      "Pre-stage checklist before doors — post-session capture for felt-risky lines and staff follow-ups routed to human action queue review.",
  };
}

export function getLatestSessionDebriefCapture() {
  const state = loadSessionDebriefState();
  return state?.captures[0] ?? null;
}

export function listRecentSessionDebriefCaptures(limit = 5) {
  return loadSessionDebriefState()?.captures.slice(0, limit) ?? [];
}
