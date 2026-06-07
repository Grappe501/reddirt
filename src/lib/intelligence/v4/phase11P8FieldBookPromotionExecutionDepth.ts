/**
 * Phase 11 P8 — Field Book promotion execution wave depth overlays.
 */
import type { PromotionBatchId } from "@/lib/intelligence/v4/phase11P5FieldBookChunkPromotionDepth";

export const FIELD_BOOK_PROMOTION_EXECUTION_HUB_HREF =
  "/admin/intelligence/field-book-promotion-execution";

export const PHASE11_P8_EXECUTION_WAVE_TOTAL = 8;

export type PromotionExecutionWaveId =
  | "kelly-foundation-wave"
  | "kelly-programs-wave"
  | "kelly-operations-wave"
  | "csm-lifecycle-wave"
  | "csm-operator-wave"
  | "csm-structure-wave"
  | "csm-web-wave"
  | "canon-closure-wave";

export type PromotionExecutionWaveStatus =
  | "pending"
  | "preview_ready"
  | "claims_cleared"
  | "execution_ready"
  | "promoted_stub";

export type FieldBookPromotionExecutionOverlay = {
  waveId: PromotionExecutionWaveId;
  label: string;
  summary: string;
  linkedBatchIds: PromotionBatchId[];
  targetFieldBookSlugs: string[];
  operatorSteps: string[];
  claimsExecutionSteps: string[];
  prerequisitePasses: string[];
  intelligenceLinks: Array<{ href: string; label: string }>;
};

const CANON = "/admin/intelligence/field-book/canon";
const CHUNK_PROMO = "/admin/intelligence/field-book-chunk-promotion";
const PREVIEW = "/admin/intelligence/strategy-alignment-chunk-preview";
const ATTACH = "/admin/intelligence/briefing-papers-chunk-attach";
const CLAIMS = "/admin/intelligence/claims";

function wave(
  waveId: PromotionExecutionWaveId,
  label: string,
  summary: string,
  batches: PromotionBatchId[],
  slugs: string[],
  operator: string[],
  claims: string[],
  prereqs: string[],
  links: Array<{ href: string; label: string }>,
): FieldBookPromotionExecutionOverlay {
  return {
    waveId,
    label,
    summary,
    linkedBatchIds: batches,
    targetFieldBookSlugs: slugs,
    operatorSteps: operator,
    claimsExecutionSteps: claims,
    prerequisitePasses: prereqs,
    intelligenceLinks: [
      { href: FIELD_BOOK_PROMOTION_EXECUTION_HUB_HREF, label: "Promotion execution hub" },
      { href: CANON, label: "Canon loop hub" },
      { href: CHUNK_PROMO, label: "Chunk promotion (P5)" },
      { href: CLAIMS, label: "Claims ledger" },
      ...links,
    ],
  };
}

const WAVE_OVERLAYS: Record<PromotionExecutionWaveId, FieldBookPromotionExecutionOverlay> = {
  "kelly-foundation-wave": wave(
    "kelly-foundation-wave",
    "Kelly foundation → Field Book",
    "Execute first promotion wave — kelly-foundation batch (84 chunks) into kelly-strategic-plan-command and strategy-philosophy-command bodies.",
    ["kelly-foundation"],
    ["kelly-strategic-plan-command", "strategy-philosophy-command", "claims-firewall"],
    [
      "Confirm P6 foundation-civic-trust lane preview complete and P7 morning-intelligence attach cleared.",
      "Promote page summaries (not raw chunks) into Field Book article bodies via staff editor — use [[claims-firewall]] on stage lines.",
      "Update field-book-chunk-promotion batch status to promotion_ready after this wave execution review.",
    ],
    [
      "All eight philosophy-graph claim rows cleared before civic-trust chunk prose hits public Field Book paths.",
      "approve_public_adaptation required on any foundation line visible outside admin.",
    ],
    ["P5", "P6", "P7"],
    [
      { href: PREVIEW + "/foundation-civic-trust", label: "Foundation preview lane" },
      { href: "/admin/intelligence/kelly-strategic-plan/framework", label: "Framework chapter" },
    ],
  ),
  "kelly-programs-wave": wave(
    "kelly-programs-wave",
    "Kelly programs → Field Book",
    "Second wave — kelly-programs batch (145 chunks) into program-themed Field Book cross-links and briefing-paper seeAlso graph.",
    ["kelly-programs"],
    ["kelly-strategic-plan-command", "strategy-migration"],
    [
      "Complete P7 programs-comms-gotv and opposition-research attach lanes before execution.",
      "Merge GOTV and comms-media chunk summaries into kelly-strategic-plan program chapter stubs.",
      "Cross-link [[strategy-doctrine-command]] from promoted program bodies.",
    ],
    [
      "GOTV numbers stay INTERPRETATION until target-pathway validates county rows.",
      "Opponent names in program chunks require diligence VERIFIED classification.",
    ],
    ["P5", "P6", "P7"],
    [{ href: ATTACH + "/programs-comms-gotv", label: "Programs attach lane" }],
  ),
  "kelly-operations-wave": wave(
    "kelly-operations-wave",
    "Kelly operations → Field Book",
    "Third wave — kelly-operations batch into staff-strategy-command and morning-brief crosswalks.",
    ["kelly-operations"],
    ["kelly-strategic-plan-command", "staff-strategy-command"],
    [
      "Execute after P7 operations-kpi-dashboard attach lane claims clearance.",
      "Promote KPI and dashboard hierarchy summaries into staff-strategy-command seeAlso — not internal Netlify routes.",
      "Pair with campaign-system chapter 06/14 wave in csm-structure-wave before marking execution_ready.",
    ],
    [
      "Internal KPI targets remain INTERNAL until build-progress pathway data complete.",
      "Technical architecture claims require build-audit sign-off.",
    ],
    ["P5", "P6", "P7"],
    [{ href: "/admin/intelligence/morning-brief", label: "Morning brief" }],
  ),
  "csm-lifecycle-wave": wave(
    "csm-lifecycle-wave",
    "CSM lifecycle tomes → Field Book",
    "Fourth wave — csm-root-tomes batch (largest corpus) — prioritize CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL summaries first.",
    ["csm-root-tomes"],
    ["campaign-system-manual-command", "strategy-migration"],
    [
      "Execute P6 lifecycle-tome-root preview lane review before any root tome promotion.",
      "Promote lifecycle manual preamble and architecture section summaries into campaign-system-manual-command.",
      "Defer simulation forecast numbers — INTERPRETATION only in Field Book bodies.",
    ],
    [
      "Simulation chunks are planning assumptions — never VERIFIED without field validation.",
      "Vendor/tool stack claims need verified contract status.",
    ],
    ["P5", "P6"],
    [{ href: "/admin/intelligence/campaign-system-manual", label: "Campaign system manual" }],
  ),
  "csm-operator-wave": wave(
    "csm-operator-wave",
    "CSM operator layer → Field Book",
    "Fifth wave — playbooks, workflows, and roles batches into operator Field Book articles.",
    ["csm-playbooks", "csm-workflows", "csm-roles"],
    ["campaign-system-manual-command", "staff-strategy-command", "debate-instruction-bridge"],
    [
      "Execute P7 debate-prep and playbook-escalation attach lanes before operator wave.",
      "Promote TRAINING_MODULE_INDEX and debate-week workflow summaries — not internal contacts.",
      "Cross-link three-lane-nav from role guide chunk summaries.",
    ],
    [
      "Escalation paths with legal advice require counsel frame clearance.",
      "Debate-week SOP lines must pass claims-firewall before Field Book merge.",
    ],
    ["P5", "P6", "P7"],
    [{ href: ATTACH + "/debate-prep", label: "Debate prep attach" }],
  ),
  "csm-structure-wave": wave(
    "csm-structure-wave",
    "CSM structure → Field Book",
    "Sixth wave — chapters, inventories, and maps batches into campaign-system-manual structure stubs.",
    ["csm-chapters", "csm-inventories", "csm-maps"],
    ["campaign-system-manual-command", "glossary"],
    [
      "Promote chapter README preambles as Field Book section stubs — one chapter at a time.",
      "Inventory index chunks feed field-book/glossary seeAlso graph.",
      "Architecture map summaries stay staff-only unless build-audit approves.",
    ],
    [
      "Chapter drafts marked TODO/WIP in source must not promote.",
      "County integration maps with PII flows stay INTERNAL.",
    ],
    ["P5", "P6"],
    [{ href: "/admin/intelligence/field-book/glossary", label: "Field Book glossary" }],
  ),
  "csm-web-wave": wave(
    "csm-web-wave",
    "CSM web presentation → Field Book",
    "Seventh wave — csm-web-presentation batch into strategy-migration and canon operator guides.",
    ["csm-web-presentation"],
    ["strategy-migration", "claims-firewall"],
    [
      "Validate every [[slug|label]] wiki link resolves to live Field Book article before promotion.",
      "Apply navLinkReleaseManifest teal batch rules to any promoted public route mentions.",
      "Update canon loop hub operator prose with web-presentation chunk summaries.",
    ],
    [
      "Public URL claims must match Netlify deploy manifest — not localhost paths.",
      "Unreleased intelligence routes must not appear in promoted Field Book copy.",
    ],
    ["P5", "P6"],
    [{ href: CANON, label: "Canon loop hub" }],
  ),
  "canon-closure-wave": wave(
    "canon-closure-wave",
    "Canon closure gate",
    "Final execution gate — all seven prior waves must reach execution_ready before Phase 11 stack marks promotion pipeline complete.",
    [
      "kelly-foundation",
      "kelly-programs",
      "kelly-operations",
      "csm-root-tomes",
      "csm-playbooks",
      "csm-workflows",
      "csm-roles",
      "csm-chapters",
      "csm-inventories",
      "csm-maps",
      "csm-web-presentation",
    ],
    ["strategy-migration", "field-book-chunk-promotion-command", "claims-firewall"],
    [
      "Verify all eleven P5 batches show promotion_ready or promoted_stub in execution state.",
      "Run computeCanonLoopStats — confirm binding count meets Phase D exit (18+ routes).",
      "Document wave completion in build-progress phase 27 entry — Phase 11 P8 exit signal.",
    ],
    [
      "No wave promotes to public Field Book until claims ledger clears all stage-adjacent lines.",
      "Phase 11 stack readiness must meet ~98% before canon-closure wave marks complete.",
      "Human staff sign-off required — execution infrastructure does not auto-write Field Book bodies.",
    ],
    ["P5", "P6", "P7", "P8"],
    [
      { href: "/admin/intelligence/build-progress", label: "Build progress" },
      { href: CHUNK_PROMO, label: "Chunk promotion hub" },
    ],
  ),
};

export const PROMOTION_EXECUTION_WAVE_IDS = Object.keys(
  WAVE_OVERLAYS,
) as PromotionExecutionWaveId[];

export function getFieldBookPromotionExecutionOverlay(
  waveId: PromotionExecutionWaveId,
): FieldBookPromotionExecutionOverlay {
  return WAVE_OVERLAYS[waveId];
}

export function fieldBookPromotionExecutionWaveHref(waveId: PromotionExecutionWaveId): string {
  return `${FIELD_BOOK_PROMOTION_EXECUTION_HUB_HREF}/${waveId}`;
}

export function fieldBookPromotionExecutionMeetsPhase11P8Bar(
  overlay: FieldBookPromotionExecutionOverlay,
): boolean {
  return (
    overlay.operatorSteps.length >= 3 &&
    overlay.claimsExecutionSteps.length >= 2 &&
    overlay.targetFieldBookSlugs.length >= 1 &&
    overlay.linkedBatchIds.length >= 1 &&
    overlay.prerequisitePasses.length >= 1
  );
}

export function countFieldBookPromotionExecutionWavesAtBar(): { total: number; atBar: number } {
  const overlays = PROMOTION_EXECUTION_WAVE_IDS.map((id) => getFieldBookPromotionExecutionOverlay(id));
  const atBar = overlays.filter(fieldBookPromotionExecutionMeetsPhase11P8Bar).length;
  return { total: overlays.length, atBar };
}
