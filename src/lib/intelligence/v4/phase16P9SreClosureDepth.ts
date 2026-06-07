/**
 * Phase 16 P9 — SRE stack closure checkpoint depth overlays.
 */
export const SRE_CLOSURE_HUB_HREF = "/admin/intelligence/sre-closure";

export const PHASE16_P9_CHECKPOINT_TOTAL = 9;
export const PHASE16_P9_STACK_BAR_PCT = 90;

export type Phase16SreCheckpointId =
  | "p0-session-launcher"
  | "p1-run-of-show"
  | "p2-encounters"
  | "p3-drill-queue"
  | "p4-session-debrief"
  | "p5-ipad-drill-player"
  | "p6-session-memory"
  | "p7-staff-coach"
  | "p8-live-event";

export type Phase16SreCheckpointOverlay = {
  checkpointId: Phase16SreCheckpointId;
  passLabel: string;
  summary: string;
  upgradeHref: string;
  hubHref: string;
  closureSteps: string[];
  exitCriteria: string[];
};

function checkpoint(
  checkpointId: Phase16SreCheckpointId,
  passLabel: string,
  summary: string,
  upgradeHref: string,
  hubHref: string,
  steps: string[],
  exit: string[],
): Phase16SreCheckpointOverlay {
  return {
    checkpointId,
    passLabel,
    summary,
    upgradeHref,
    hubHref,
    closureSteps: steps,
    exitCriteria: exit,
  };
}

const CHECKPOINT_OVERLAYS: Record<Phase16SreCheckpointId, Phase16SreCheckpointOverlay> = {
  "p0-session-launcher": checkpoint(
    "p0-session-launcher",
    "P0 — Session launcher",
    "Stage Rehearsal Engine entry — four encounter types and default 30-minute debate-prep run-of-show.",
    "/admin/intelligence/phase-16-p0-upgrade",
    "/admin/intelligence/rehearsal",
    [
      "Confirm four encounter cards on rehearsal hub with launch hrefs into existing prep depth.",
      "Verify CandidateRehearsalLauncherStrip on command home with default 30-min debate prep CTA.",
      "Spot-check session-launcher-command Field Book and canon binding on rehearsal routes.",
    ],
    ["4 encounters · 6-step default ROS", "Rehearse nav wired", "test-phase16-p0-session-launcher green"],
  ),
  "p1-run-of-show": checkpoint(
    "p1-run-of-show",
    "P1 — Run-of-show",
    "Four timed presets — 15, 30, 45, and 60 minutes — with step lists into existing prep surfaces.",
    "/admin/intelligence/phase-16-p1-upgrade",
    "/admin/intelligence/run-of-show",
    [
      "Walk quick-15 through full-60 presets — minutes aligned within ±2 on each preset.",
      "Confirm stageSafeRequired flags on drill steps in deep and full presets.",
      "Verify run-of-show accessible via session launcher — hub not required in Rehearse nav cap.",
    ],
    ["4/4 presets at bar", "Minutes aligned", "test-phase16-p1-run-of-show green"],
  ),
  "p2-encounters": checkpoint(
    "p2-encounters",
    "P2 — Encounter scenarios",
    "ACCA panel, three-way debate, clerk 1:1, purchase walkthrough — primary route binds with evidence honesty.",
    "/admin/intelligence/phase-16-p2-upgrade",
    "/admin/intelligence/encounters",
    [
      "Verify ACCA scenario binds county-clerk-week/acca-summer-conference primary route.",
      "Confirm purchase walkthrough binds demo-mode hub — no duplicate content silo.",
      "Spot-check encounter scenarios strip on command home and hub in Rehearse nav.",
    ],
    ["4/4 scenarios at bar", "ACCA bind wired", "test-phase16-p2-encounters green"],
  ),
  "p3-drill-queue": checkpoint(
    "p3-drill-queue",
    "P3 — Drill queue",
    "Sequential SOS speak-order and trap pivot cards — stage-safe gates on every speak line.",
    "/admin/intelligence/phase-16-p3-upgrade",
    "/admin/intelligence/drill-queue",
    [
      "Run standard-tonight queue — one card at a time, blocked lines show staff-verify fallback.",
      "Confirm 6-card standard queue with claimsGate on every card overlay.",
      "Verify drill queue hub in Rehearse nav and CandidateDrillQueueStrip on command home.",
    ],
    ["3 queues · 6-card standard", "Stage-safe on speak-order", "test-phase16-p3-drill-queue green"],
  ),
  "p4-session-debrief": checkpoint(
    "p4-session-debrief",
    "P4 — Session debrief",
    "Pre-stage checklist and post-session capture — felt-risky lines to human action queue.",
    "/admin/intelligence/phase-16-p4-upgrade",
    "/admin/intelligence/session-debrief",
    [
      "Walk 5-item pre-stage checklist — confirm via capture API persists state.",
      "Verify post-session capture appends feltRisky and staffFollowUps for staff review.",
      "Confirm session debrief hub in Rehearse nav with checklist overlays at bar.",
    ],
    ["5/5 checklist · capture API", "Hub in Rehearse nav", "test-phase16-p4-session-debrief green"],
  ),
  "p5-ipad-drill-player": checkpoint(
    "p5-ipad-drill-player",
    "P5 — iPad drill player",
    "Full-screen drill stepper in candidate iPad shell — Exit · Prev · Next · Timer with 48px targets.",
    "/admin/intelligence/phase-16-p5-upgrade",
    "/admin/intelligence/ipad-drill-player",
    [
      "Verify CandidateIpadIntelligenceShell collapses to drill bottom nav on ipad-drill-player route.",
      "Confirm 4/4 player controls at bar with ≥48px touch targets and 820px column.",
      "Spot-check iPad drill player in Rehearse nav — run-of-show via session launcher only.",
    ],
    ["4/4 controls · shell wired", "Rehearse nav hub", "test-phase16-p5-ipad-drill-player green"],
  ),
  "p6-session-memory": checkpoint(
    "p6-session-memory",
    "P6 — Session memory",
    "Continue last drill on command home — persisted session state with history and staff reset.",
    "/admin/intelligence/phase-16-p6-upgrade",
    "/admin/intelligence/rehearsal-history",
    [
      "Confirm recording hooks on drill-queue, ipad-drill-player, and encounters page loads.",
      "Verify continue CTA on command home when active session exists.",
      "Check staff POST clear on /api/admin/intelligence/rehearsal-session and history cap 20.",
    ],
    ["5/5 fields · clear API", "Hub in Home nav", "test-phase16-p6-session-memory green"],
  ),
  "p7-staff-coach": checkpoint(
    "p7-staff-coach",
    "P7 — Staff coach overlay",
    "STAFF-only coach hub — assign scenario and pin up to three must-run drills for Kelly.",
    "/admin/intelligence/phase-16-p7-upgrade",
    "/admin/intelligence/rehearsal-coach",
    [
      "Confirm rehearsal-coach in STAFF_OPERATIONS_HREF_PREFIXES — candidate profile blocked.",
      "Verify assign-scenario and pin-drill API on /api/admin/intelligence/rehearsal-coach.",
      "Spot-check CandidateStaffCoachStrip surfaces assignment and pins on command home.",
    ],
    ["5/5 coach fields · route guard", "Staff nav wired", "test-phase16-p7-staff-coach green"],
  ),
  "p8-live-event": checkpoint(
    "p8-live-event",
    "P8 — Live event mode",
    "ACCA Jun 11 countdown — day-of shortest stage-safe run-of-show when clerk week or live env active.",
    "/admin/intelligence/phase-16-p8-upgrade",
    "/admin/intelligence/live-event",
    [
      "Confirm NEXT_PUBLIC_SRE_LIVE_EVENT or county_clerks audience activates live mode.",
      "Verify day-of plan selects compressed ACCA path with stage-safe-only steps on panel day.",
      "Spot-check CandidateLiveEventStrip on command home and live-event hub in Home nav.",
    ],
    ["5/5 live fields · day-of safe", "Hub in Home nav", "test-phase16-p8-live-event green"],
  ),
};

export const PHASE16_SRE_CHECKPOINT_IDS = Object.keys(
  CHECKPOINT_OVERLAYS,
) as Phase16SreCheckpointId[];

export function getPhase16SreCheckpointOverlay(
  checkpointId: Phase16SreCheckpointId,
): Phase16SreCheckpointOverlay {
  return CHECKPOINT_OVERLAYS[checkpointId];
}

export function phase16SreCheckpointMeetsPhase16P9Bar(overlay: Phase16SreCheckpointOverlay): boolean {
  return overlay.closureSteps.length >= 3 && overlay.exitCriteria.length >= 3;
}

export function countPhase16SreCheckpointsAtBar(): { atBar: number; total: number } {
  const atBar = PHASE16_SRE_CHECKPOINT_IDS.filter((id) =>
    phase16SreCheckpointMeetsPhase16P9Bar(getPhase16SreCheckpointOverlay(id)),
  ).length;
  return { atBar, total: PHASE16_SRE_CHECKPOINT_IDS.length };
}
