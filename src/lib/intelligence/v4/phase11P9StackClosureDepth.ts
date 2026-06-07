/**
 * Phase 11 P9 — Stack closure checkpoint depth overlays.
 */
export const PHASE_11_STACK_CLOSURE_HUB_HREF = "/admin/intelligence/phase-11-stack-closure";

export const PHASE11_P9_CHECKPOINT_TOTAL = 9;
export const PHASE11_P9_STACK_BAR_PCT = 90;

export type Phase11StackCheckpointId =
  | "p0-campaign-system"
  | "p1-kelly-strategic-plan"
  | "p2-movement-staff-strategy"
  | "p3-strategy-doctrine"
  | "p4-philosophy-claims"
  | "p5-chunk-promotion"
  | "p6-alignment-preview"
  | "p7-briefing-attach"
  | "p8-promotion-execution";

export type Phase11StackCheckpointOverlay = {
  checkpointId: Phase11StackCheckpointId;
  passLabel: string;
  summary: string;
  upgradeHref: string;
  hubHref: string;
  closureSteps: string[];
  exitCriteria: string[];
};

function checkpoint(
  checkpointId: Phase11StackCheckpointId,
  passLabel: string,
  summary: string,
  upgradeHref: string,
  hubHref: string,
  steps: string[],
  exit: string[],
): Phase11StackCheckpointOverlay {
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

const CHECKPOINT_OVERLAYS: Record<Phase11StackCheckpointId, Phase11StackCheckpointOverlay> = {
  "p0-campaign-system": checkpoint(
    "p0-campaign-system",
    "P0 — Campaign system manual",
    "252-file campaign-system-manual browsable in intelligence with eight category guides.",
    "/admin/intelligence/phase-11-upgrade",
    "/admin/intelligence/campaign-system-manual",
    [
      "Verify campaign-system-manual reader loads all eight categories with file inventory.",
      "Confirm campaign-system-manual-command Field Book article and canon binding live.",
      "Cross-link strategy-philosophy-hub inventory entry for campaign-system surface.",
    ],
    ["252 files discovered", "8/8 category guides at bar", "test-phase11-campaign-system-surfacing green"],
  ),
  "p1-kelly-strategic-plan": checkpoint(
    "p1-kelly-strategic-plan",
    "P1 — Kelly strategic plan",
    "All 22 Kelly SOS chapters in intelligence tree with P1 depth overlays.",
    "/admin/intelligence/phase-11-p1-upgrade",
    "/admin/intelligence/kelly-strategic-plan",
    [
      "Spot-check framework, executive-summary, and programs/gotv chapter overlays.",
      "Confirm kelly-strategic-plan-command canon on hub and P1 upgrade routes.",
      "Verify migration bridge maps Kelly pathKeys on strategy surfaces.",
    ],
    ["22/22 chapters enriched", "Field Book + canon wired", "test-phase11-p1-kelly-strategic-plan green"],
  ),
  "p2-movement-staff-strategy": checkpoint(
    "p2-movement-staff-strategy",
    "P2 — Movement philosophy + staff strategy",
    "docs/philosophy corpus and six staff strategy surfaces enriched with migration bridge.",
    "/admin/intelligence/phase-11-p2-upgrade",
    "/admin/intelligence/movement-philosophy",
    [
      "Confirm movement philosophy docs and staff-strategy-command surfaces at P2 bar.",
      "Verify debate command philosophy readiness feed includes movement and staff rows.",
      "Check migration bridge route count meets P2 threshold.",
    ],
    ["Movement docs + staff surfaces at bar", "Debate philosophy feed live", "test-phase11-p2 green"],
  ),
  "p3-strategy-doctrine": checkpoint(
    "p3-strategy-doctrine",
    "P3 — Strategy doctrine JSON",
    "Nine SDI-1 JSON artifacts browsable with P3 overlays in intelligence.",
    "/admin/intelligence/phase-11-p3-upgrade",
    "/admin/intelligence/strategy-doctrine",
    [
      "Browse all nine strategy-doctrine artifacts in intelligence reader.",
      "Confirm strategy-doctrine-command Field Book article and canon binding.",
      "Cross-read strategy-alignment dashboard doctrine crosswalk rows.",
    ],
    ["9/9 artifacts at P3 bar", "Registry entries wired", "test-phase11-p3-strategy-doctrine green"],
  ),
  "p4-philosophy-claims": checkpoint(
    "p4-philosophy-claims",
    "P4 — Philosophy graph claims",
    "Eight NSI-4 nodes bound to claim ledger with P4 review workflow.",
    "/admin/intelligence/phase-11-p4-upgrade",
    "/admin/intelligence/philosophy-graph-claims-review",
    [
      "Verify eight claim-philosophy-* ledger rows seeded and reviewable.",
      "Spot-check per-node P4 overlays — stage-safe wording and do-not-say lines.",
      "Confirm claim-review API integrates with philosophy claims hub queue.",
    ],
    ["8/8 nodes at P4 bar", "8 ledger claims", "test-phase11-p4-philosophy-graph-claims-review green"],
  ),
  "p5-chunk-promotion": checkpoint(
    "p5-chunk-promotion",
    "P5 — Field Book chunk promotion",
    "~2,795 strategy manual chunks in eleven promotion batches.",
    "/admin/intelligence/phase-11-p5-upgrade",
    "/admin/intelligence/field-book-chunk-promotion",
    [
      "Confirm chunk total ≥2700 from strategy-chunking corpus.",
      "Verify eleven P5 batch overlays with operator and claims gate steps.",
      "Check field-book-chunk-promotion-state.json reflects batch chunk counts.",
    ],
    ["11/11 batches at bar", "2700+ chunks catalogued", "test-phase11-p5-field-book-chunk-promotion green"],
  ),
  "p6-alignment-preview": checkpoint(
    "p6-alignment-preview",
    "P6 — Alignment chunk preview",
    "Eight SDI-1 preview lanes wire P5 batches to strategy-alignment filters.",
    "/admin/intelligence/phase-11-p6-upgrade",
    "/admin/intelligence/strategy-alignment-chunk-preview",
    [
      "Run strategy-alignment page — confirm P6 chunk preview strip visible.",
      "Verify eight preview lanes with sample chunk displays on per-lane pages.",
      "Cross-check doctrine crosswalk lane against strategy-doctrine hub.",
    ],
    ["8/8 preview lanes at bar", "200+ matching chunks", "test-phase11-p6-strategy-alignment-chunk-preview green"],
  ),
  "p7-briefing-attach": checkpoint(
    "p7-briefing-attach",
    "P7 — Briefing papers chunk attach",
    "Eight attach lanes merge P6 previews into briefing paper deep sections.",
    "/admin/intelligence/phase-11-p7-upgrade",
    "/admin/intelligence/briefing-papers-chunk-attach",
    [
      "Confirm briefing-papers page shows P7 chunk attach strip.",
      "Verify attach lanes map paperIds to P6 preview lanes and P5 batches.",
      "Check claims attach steps reference claim-review API on each lane.",
    ],
    ["8/8 attach lanes at bar", "500+ attachable chunks", "test-phase11-p7-briefing-papers-chunk-attach green"],
  ),
  "p8-promotion-execution": checkpoint(
    "p8-promotion-execution",
    "P8 — Field Book promotion execution",
    "Eight execution waves complete the P5→P8 canon pipeline.",
    "/admin/intelligence/phase-11-p8-upgrade",
    "/admin/intelligence/field-book-promotion-execution",
    [
      "Confirm field-book/canon hub shows P8 promotion execution strip.",
      "Verify eight execution waves map batches to Field Book target slugs.",
      "Check promotion pipeline ready signal — P5 chunks + P7 lanes + canon bindings.",
    ],
    ["8/8 waves at bar", "2700+ linked chunks + 18+ canon bindings", "test-phase11-p8-field-book-promotion-execution green"],
  ),
};

export const PHASE_11_STACK_CHECKPOINT_IDS = Object.keys(
  CHECKPOINT_OVERLAYS,
) as Phase11StackCheckpointId[];

export function getPhase11StackCheckpointOverlay(
  checkpointId: Phase11StackCheckpointId,
): Phase11StackCheckpointOverlay {
  return CHECKPOINT_OVERLAYS[checkpointId];
}

export function phase11StackCheckpointMeetsPhase11P9Bar(
  overlay: Phase11StackCheckpointOverlay,
): boolean {
  return (
    overlay.closureSteps.length >= 3 &&
    overlay.exitCriteria.length >= 2 &&
    overlay.upgradeHref.length > 0 &&
    overlay.hubHref.length > 0
  );
}

export function countPhase11StackCheckpointsAtBar(): { total: number; atBar: number } {
  const overlays = PHASE_11_STACK_CHECKPOINT_IDS.map((id) => getPhase11StackCheckpointOverlay(id));
  const atBar = overlays.filter(phase11StackCheckpointMeetsPhase11P9Bar).length;
  return { total: overlays.length, atBar };
}
