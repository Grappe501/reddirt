/**
 * Phase 15 P9 — CCE closure checkpoint depth overlays.
 */
export const CCE_CLOSURE_HUB_HREF = "/admin/intelligence/cce-closure";

export const PHASE15_P9_CHECKPOINT_TOTAL = 8;
export const PHASE15_P9_STACK_BAR_PCT = 90;

export type Phase15CceCheckpointId =
  | "p0-p1-candidate-command"
  | "p2-kelly-prep-week"
  | "p3-stage-safe-filter"
  | "p4-top-tier-surfacing"
  | "p5-evidence-honesty"
  | "p6-demo-mode"
  | "p7-ipad-polish"
  | "p8-staff-backstage";

export type Phase15CceCheckpointOverlay = {
  checkpointId: Phase15CceCheckpointId;
  passLabel: string;
  summary: string;
  upgradeHref: string;
  hubHref: string;
  closureSteps: string[];
  exitCriteria: string[];
};

function checkpoint(
  checkpointId: Phase15CceCheckpointId,
  passLabel: string,
  summary: string,
  upgradeHref: string,
  hubHref: string,
  steps: string[],
  exit: string[],
): Phase15CceCheckpointOverlay {
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

const CHECKPOINT_OVERLAYS: Record<Phase15CceCheckpointId, Phase15CceCheckpointOverlay> = {
  "p0-p1-candidate-command": checkpoint(
    "p0-p1-candidate-command",
    "P0+P1 — Candidate command",
    "Five-section nav collapse, builder infra hidden, unified command home with safe/blocked claims feed.",
    "/admin/intelligence/phase-15-p0-p1-upgrade",
    "/admin/intelligence",
    [
      "Verify candidate nav ≤25 links across five orchestrated sections — no builder infra in primary nav.",
      "Confirm command home readiness score, safe tonight, blocked tonight, and today focus wired.",
      "Spot-check StaffBackstageRouteGuard does not block command home or CCE closure meta routes.",
    ],
    ["5 sections · ≤25 links", "Command home feed live", "test-phase15-p0-p1-candidate-command green"],
  ),
  "p2-kelly-prep-week": checkpoint(
    "p2-kelly-prep-week",
    "P2 — Kelly prep week",
    "Seven-day orchestrated prep path with day tabs, primer, and philosophy section placement.",
    "/admin/intelligence/phase-15-p2-upgrade",
    "/admin/intelligence/kelly-prep-week",
    [
      "Walk day 1–7 tabs — each day links to briefings, depth, or trap lanes in order.",
      "Confirm kelly-prep-week-command Field Book article and canon binding on hub routes.",
      "Verify prep week hub in Philosophy nav — not buried under builder surfaces.",
    ],
    ["7/7 days wired", "Field Book + canon", "test-phase15-p2-kelly-prep-week green"],
  ),
  "p3-stage-safe-filter": checkpoint(
    "p3-stage-safe-filter",
    "P3 — Stage-safe filter",
    "Candidate deploy gating on SOS questions and trap lanes — blocked lines show staff-verify fallback.",
    "/admin/intelligence/phase-15-p3-upgrade",
    "/admin/intelligence/stage-safe-filter",
    [
      "Spot-check SOS question drill-downs — VERIFIED lines pass, NEEDS_REVIEW shows StageSafeBlockedPanel.",
      "Confirm stage-safe-filter hub in Safety nav with filter overlay inventory.",
      "Verify claims gate banner on gated debate spine surfaces.",
    ],
    ["Filter overlays at bar", "Safety nav wired", "test-phase15-p3-stage-safe-filter green"],
  ),
  "p4-top-tier-surfacing": checkpoint(
    "p4-top-tier-surfacing",
    "P4 — Top-tier surfacing",
    "Eight briefings, five depth guides, and eight psychology sections promoted to command home.",
    "/admin/intelligence/phase-15-p4-upgrade",
    "/admin/intelligence/top-tier-prep",
    [
      "Confirm CandidateTopTierStrip on command home lists tonight's promoted reads with minute estimate.",
      "Verify top-tier-prep hub inventories all promoted surfaces with P4 depth overlays.",
      "Cross-check Home nav links top-tier prep as first promoted destination.",
    ],
    ["Promoted reads on home", "Hub in Home nav", "test-phase15-p4-top-tier-surfacing green"],
  ),
  "p5-evidence-honesty": checkpoint(
    "p5-evidence-honesty",
    "P5 — Evidence honesty",
    "VERIFIED / NEEDS_REVIEW / NON_PUBLISHABLE badges on film room, briefings, opposition, and claims.",
    "/admin/intelligence/phase-15-p5-upgrade",
    "/admin/intelligence/evidence-honesty",
    [
      "Spot-check EvidenceHonestyBadge on film room, briefings, trap lanes, and claims surfaces.",
      "Confirm CandidateEvidenceHonestyStrip on command home with tonight reminder.",
      "Verify evidence-honesty hub in Home nav with 8 surface overlays at bar.",
    ],
    ["8/8 surfaces badged", "Home strip live", "test-phase15-p5-evidence-honesty green"],
  ),
  "p6-demo-mode": checkpoint(
    "p6-demo-mode",
    "P6 — Demo mode",
    "7-step ~15-minute purchase walkthrough with ACCA panel scenario and demo env banner.",
    "/admin/intelligence/phase-15-p6-upgrade",
    "/admin/intelligence/demo-mode",
    [
      "Walk demo script steps — seeded tonight scenario with IntelligenceDemoModeBanner when env live.",
      "Confirm CandidateDemoModeStrip on command home and demo-mode hub in Home nav.",
      "Verify demo-mode-command Field Book article and canon binding.",
    ],
    ["7/7 script steps", "Demo hub in Home nav", "test-phase15-p6-demo-mode green"],
  ),
  "p7-ipad-polish": checkpoint(
    "p7-ipad-polish",
    "P7 — iPad polish",
    "Five CCE bottom tabs with touch-safe section sheets — Kelly stage-side default deploy.",
    "/admin/intelligence/phase-15-p7-upgrade",
    "/admin/intelligence/ipad-polish",
    [
      "Verify CandidateIpadIntelligenceShell five-tab bottom nav matches CCE section nav.",
      "Confirm section sheets open with ≥3 links per tab and 820px max column.",
      "Check resolveIpadActiveSectionId longest-prefix match for trap-lane deep routes.",
    ],
    ["5/5 section tabs", "iPad deploy hints", "test-phase15-p7-ipad-polish green"],
  ),
  "p8-staff-backstage": checkpoint(
    "p8-staff-backstage",
    "P8 — Staff backstage",
    "Route-level STAFF guards on builder and operations — CANDIDATE redirect, not nav-only hiding.",
    "/admin/intelligence/phase-15-p8-upgrade",
    "/admin/intelligence/staff-backstage",
    [
      "Confirm StaffBackstageRouteGuard in intelligence layout redirects non-STAFF profiles.",
      "Verify 8 guard categories and prefix inventory on staff-backstage hub.",
      "Check staff-backstage hub in STAFF Operations nav — candidate nav excludes builder URLs.",
    ],
    ["8/8 guard categories", "Layout guard live", "test-phase15-p8-staff-backstage green"],
  ),
};

export const PHASE15_CCE_CHECKPOINT_IDS = Object.keys(
  CHECKPOINT_OVERLAYS,
) as Phase15CceCheckpointId[];

export function getPhase15CceCheckpointOverlay(
  checkpointId: Phase15CceCheckpointId,
): Phase15CceCheckpointOverlay {
  return CHECKPOINT_OVERLAYS[checkpointId];
}

export function phase15CceCheckpointMeetsPhase15P9Bar(overlay: Phase15CceCheckpointOverlay): boolean {
  return overlay.closureSteps.length >= 3 && overlay.exitCriteria.length >= 3;
}

export function countPhase15CceCheckpointsAtBar(): { atBar: number; total: number } {
  const atBar = PHASE15_CCE_CHECKPOINT_IDS.filter((id) =>
    phase15CceCheckpointMeetsPhase15P9Bar(getPhase15CceCheckpointOverlay(id)),
  ).length;
  return { atBar, total: PHASE15_CCE_CHECKPOINT_IDS.length };
}
