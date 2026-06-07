/**
 * Phase 11 P6 — Strategy alignment chunk preview lane depth overlays.
 */
import type { PromotionBatchId } from "@/lib/intelligence/v4/phase11P5FieldBookChunkPromotionDepth";

export const STRATEGY_ALIGNMENT_CHUNK_PREVIEW_HUB_HREF =
  "/admin/intelligence/strategy-alignment-chunk-preview";

export const PHASE11_P6_PREVIEW_LANE_TOTAL = 8;

export type AlignmentChunkPreviewLaneId =
  | "foundation-civic-trust"
  | "programs-comms-gotv"
  | "operations-kpi-dashboard"
  | "lifecycle-tome-root"
  | "debate-week-workflows"
  | "playbook-escalation"
  | "doctrine-sdi-crosswalk"
  | "claims-gated-promotion";

export type AlignmentChunkFilter = {
  manualDomain?: "strategic-plan" | "campaign-system";
  pathKeyPrefix?: string;
  laneSection?: "foundation" | "programs" | "operations";
  promotionBatchIds: PromotionBatchId[];
};

export type StrategyAlignmentChunkPreviewOverlay = {
  laneId: AlignmentChunkPreviewLaneId;
  label: string;
  summary: string;
  chunkFilter: AlignmentChunkFilter;
  alignmentDoctrineIds: string[];
  operatorSteps: string[];
  claimsPreviewSteps: string[];
  targetFieldBookSlugs: string[];
  intelligenceLinks: Array<{ href: string; label: string }>;
};

const ALIGNMENT = "/admin/intelligence/strategy-alignment";
const CHUNK_PROMO = "/admin/intelligence/field-book-chunk-promotion";
const CLAIMS = "/admin/intelligence/claims";
const DOCTRINE = "/admin/intelligence/strategy-doctrine";
const DEBATE = "/admin/intelligence/debate-command";

function lane(
  laneId: AlignmentChunkPreviewLaneId,
  label: string,
  summary: string,
  filter: AlignmentChunkFilter,
  doctrines: string[],
  operator: string[],
  claims: string[],
  slugs: string[],
  links: Array<{ href: string; label: string }>,
): StrategyAlignmentChunkPreviewOverlay {
  return {
    laneId,
    label,
    summary,
    chunkFilter: filter,
    alignmentDoctrineIds: doctrines,
    operatorSteps: operator,
    claimsPreviewSteps: claims,
    targetFieldBookSlugs: slugs,
    intelligenceLinks: [
      { href: STRATEGY_ALIGNMENT_CHUNK_PREVIEW_HUB_HREF, label: "Chunk preview hub" },
      { href: ALIGNMENT, label: "Strategy alignment (SDI-1)" },
      { href: CHUNK_PROMO, label: "Field Book chunk promotion" },
      { href: CLAIMS, label: "Claims ledger" },
      ...links,
    ],
  };
}

const LANE_OVERLAYS: Record<AlignmentChunkPreviewLaneId, StrategyAlignmentChunkPreviewOverlay> = {
  "foundation-civic-trust": lane(
    "foundation-civic-trust",
    "Foundation · civic trust",
    "Kelly foundation lane chunks crosswalked to SDI-1 civic-trust doctrines and NSI-4 philosophy-civic-trust claim row.",
    {
      manualDomain: "strategic-plan",
      laneSection: "foundation",
      promotionBatchIds: ["kelly-foundation"],
    },
    ["doctrine-steve-strategy", "doctrine-sos-keeper-records"],
    [
      "Open alignment dashboard — confirm STRATEGICALLY_ALIGNED on integrity narratives before previewing foundation chunks.",
      "Filter chunks ?manualDomain=strategic-plan — review framework and executive-summary H2 units.",
      "Cross-read philosophy-graph-claims-review civic-trust node before attaching chunk prose to briefing-papers.",
    ],
    [
      "Map each previewed chunk heading to claim ledger row — INTERPRETATION until VERIFIED anchor exists.",
      "Reject election-fraud rhetoric lines from chunk plainText before briefing-paper merge.",
    ],
    ["kelly-strategic-plan-command", "strategy-philosophy-command", "claims-firewall"],
    [
      { href: "/admin/intelligence/philosophy-graph-claims-review/philosophy-civic-trust", label: "Civic trust claims" },
      { href: "/admin/intelligence/kelly-strategic-plan/framework", label: "Framework chapter" },
    ],
  ),
  "programs-comms-gotv": lane(
    "programs-comms-gotv",
    "Programs · comms & GOTV",
    "Program-lane chunks for comms-media and GOTV pathKeys — alignment check against narrative usage and geographic signals.",
    {
      manualDomain: "strategic-plan",
      laneSection: "programs",
      pathKeyPrefix: "programs/",
      promotionBatchIds: ["kelly-programs"],
    },
    ["doctrine-grassroots-principles", "doctrine-gotv-calendar"],
    [
      "Preview programs/comms-media and programs/gotv chunks — compare alignment signal on related Kim Hammer narratives.",
      "Attach top three chunk summaries to briefing-papers draft — not full markdown dumps.",
      "Cross-link trap lanes for comms-media manual pathKeys before stage rehearsal.",
    ],
    [
      "GOTV number claims require field-verified registration math — not simulation assumptions as VERIFIED.",
      "Comms chunks naming opponents require diligence log classification.",
    ],
    ["kelly-strategic-plan-command", "strategy-migration"],
    [
      { href: "/admin/intelligence/briefing-papers", label: "Briefing papers" },
      { href: "/admin/intelligence/kelly-strategic-plan/programs/gotv", label: "GOTV chapter" },
    ],
  ),
  "operations-kpi-dashboard": lane(
    "operations-kpi-dashboard",
    "Operations · KPI & dashboard",
    "Operations lane + campaign-system chapter 06/14 chunks — NSI-7 target pathway and build-progress crosswalk.",
    {
      manualDomain: "strategic-plan",
      laneSection: "operations",
      promotionBatchIds: ["kelly-operations", "csm-chapters"],
    },
    ["doctrine-steve-strategy"],
    [
      "Preview operations lane chunks alongside chapters/06-dashboard-hierarchy and chapters/14-kpis-and-scorecards.",
      "Compare chunk KPI language to strategic-target-pathway flags — hold MISSING county rows.",
      "Use morning-brief surface to validate daily objective wording from chunk previews.",
    ],
    [
      "Internal KPI targets stay INTERNAL classification until build-progress marks pathway data complete.",
      "Dashboard hierarchy claims about Netlify routes require build-audit verification.",
    ],
    ["kelly-strategic-plan-command", "staff-strategy-command"],
    [
      { href: "/admin/intelligence/strategic-target-pathway", label: "Target pathway" },
      { href: "/admin/intelligence/morning-brief", label: "Morning brief" },
    ],
  ),
  "lifecycle-tome-root": lane(
    "lifecycle-tome-root",
    "Campaign system · lifecycle tome",
    "Root tome chunks — CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL preamble and architecture sections.",
    {
      manualDomain: "campaign-system",
      promotionBatchIds: ["csm-root-tomes"],
    },
    ["doctrine-steve-strategy", "doctrine-relational-organizing"],
    [
      "Filter ?manualDomain=campaign-system — prioritize lifecycle manual root pathKey chunks.",
      "Cross-read strategy-philosophy-hub inventory before promoting tome summaries into Field Book.",
      "Pair simulation plan chunks with scenario-simulation intelligence surface.",
    ],
    [
      "Simulation forecast numbers in chunk previews are planning assumptions — INTERPRETATION only.",
      "Vendor/tool claims need verified contract status before public-adaptation.",
    ],
    ["campaign-system-manual-command", "strategy-migration"],
    [{ href: "/admin/intelligence/scenario-simulation", label: "Scenario simulation" }],
  ),
  "debate-week-workflows": lane(
    "debate-week-workflows",
    "Debate week workflows",
    "Campaign-system workflow chunks crosswalked to debate command, trap lanes, and debate-instruction-bridge.",
    {
      manualDomain: "campaign-system",
      pathKeyPrefix: "workflows/",
      promotionBatchIds: ["csm-workflows"],
    },
    ["doctrine-steve-strategy"],
    [
      "Preview debate-week workflow chunks — map each to debate prep section IDs on debate command.",
      "Run alignment check on trap-lane narratives before attaching workflow chunk language.",
      "Link approved chunk summaries to debate-instruction-bridge Field Book article seeAlso.",
    ],
    [
      "Opponent names in workflow chunks require diligence VERIFIED anchors.",
      "Stage lines from chunks must pass claims-firewall before debate-week promotion.",
    ],
    ["campaign-system-manual-command", "debate-instruction-bridge"],
    [
      { href: DEBATE, label: "Debate command" },
      { href: "/admin/intelligence/trap-lanes", label: "Trap lanes" },
    ],
  ),
  "playbook-escalation": lane(
    "playbook-escalation",
    "Playbooks · escalation & training",
    "SOP and escalation path chunks — staff-strategy-command and human action queue governance.",
    {
      manualDomain: "campaign-system",
      pathKeyPrefix: "playbooks/",
      promotionBatchIds: ["csm-playbooks"],
    },
    ["doctrine-poll-watcher-model"],
    [
      "Preview TRAINING_MODULE_INDEX and ESCALATION_PATHS chunks before staff-strategy promotion.",
      "Confirm alignment dashboard shows no STRATEGICALLY_CONTRADICTORY on related narratives.",
      "Attach escalation summaries to staff-strategy-command — not internal contact details.",
    ],
    [
      "Counsel frame required on escalation paths involving legal advice.",
      "Internal-only contacts must not appear in Field Book public paths.",
    ],
    ["campaign-system-manual-command", "staff-strategy-command"],
    [{ href: "/admin/intelligence/staff-strategy-command", label: "Staff strategy command" }],
  ),
  "doctrine-sdi-crosswalk": lane(
    "doctrine-sdi-crosswalk",
    "SDI-1 doctrine crosswalk",
    "Nine strategy-doctrine JSON artifacts mapped to chunk pathKeys — alignment reader validates before preview.",
    {
      promotionBatchIds: ["kelly-foundation", "kelly-programs"],
    },
    [
      "doctrine-steve-strategy",
      "doctrine-grassroots-principles",
      "doctrine-gotv-calendar",
      "doctrine-poll-watcher-model",
      "doctrine-relational-organizing",
    ],
    [
      "Open strategy-doctrine hub — confirm artifact IDs match alignment dashboard matchedDoctrineIds.",
      "Preview foundation + programs chunks that reference each doctrine ID in navLabel or heading.",
      "Crosswalk alignment tensionDoctrineIds before merging chunk prose into Field Book.",
    ],
    [
      "Doctrine JSON lines are INTERNAL until claims ledger approves public-adaptation path.",
      "Tension doctrines block Field Book promotion until alignment signal clears.",
    ],
    ["strategy-doctrine-command", "strategy-philosophy-command"],
    [
      { href: DOCTRINE, label: "Strategy doctrine hub" },
      { href: "/admin/intelligence/strategy-doctrine/steve-strategy-doctrine", label: "Steve doctrine" },
    ],
  ),
  "claims-gated-promotion": lane(
    "claims-gated-promotion",
    "Claims-gated promotion queue",
    "Final preview gate — chunk batches may not promote to Field Book until claims ledger clears stage-adjacent lines.",
    {
      promotionBatchIds: [
        "kelly-foundation",
        "kelly-programs",
        "kelly-operations",
        "csm-root-tomes",
        "csm-web-presentation",
      ],
    },
    [],
    [
      "For each previewed chunk: classify lines as VERIFIED, INTERPRETATION, or NEEDS_RESEARCH in claims ledger.",
      "Use /api/admin/intelligence/claim-review for approve_internal before briefing-paper or Field Book merge.",
      "Update field-book-chunk-promotion batch status to claims_gated after ledger review pass.",
    ],
    [
      "No VERIFIED promotion without published source anchor on election-integrity lines.",
      "NEEDS_REVIEW philosophy graph claims block foundation batch promotion_ready status.",
      "Public-adaptation requires approve_public_adaptation — not approve_internal alone.",
    ],
    ["claims-firewall", "field-book-chunk-promotion-command", "strategy-migration"],
    [
      { href: CHUNK_PROMO, label: "Chunk promotion hub" },
      { href: "/admin/intelligence/field-book/canon", label: "Canon loop hub" },
    ],
  ),
};

export const ALIGNMENT_CHUNK_PREVIEW_LANE_IDS = Object.keys(
  LANE_OVERLAYS,
) as AlignmentChunkPreviewLaneId[];

export function getStrategyAlignmentChunkPreviewOverlay(
  laneId: AlignmentChunkPreviewLaneId,
): StrategyAlignmentChunkPreviewOverlay {
  return LANE_OVERLAYS[laneId];
}

export function alignmentChunkPreviewLaneHref(laneId: AlignmentChunkPreviewLaneId): string {
  return `${STRATEGY_ALIGNMENT_CHUNK_PREVIEW_HUB_HREF}/${laneId}`;
}

export function strategyAlignmentChunkPreviewMeetsPhase11P6Bar(
  overlay: StrategyAlignmentChunkPreviewOverlay,
): boolean {
  const doctrineOk =
    overlay.alignmentDoctrineIds.length >= 1 || overlay.laneId === "claims-gated-promotion";
  return (
    overlay.operatorSteps.length >= 3 &&
    overlay.claimsPreviewSteps.length >= 2 &&
    overlay.targetFieldBookSlugs.length >= 1 &&
    doctrineOk
  );
}

export function countStrategyAlignmentChunkPreviewLanesAtBar(): { total: number; atBar: number } {
  const overlays = ALIGNMENT_CHUNK_PREVIEW_LANE_IDS.map((id) =>
    getStrategyAlignmentChunkPreviewOverlay(id),
  );
  const atBar = overlays.filter(strategyAlignmentChunkPreviewMeetsPhase11P6Bar).length;
  return { total: overlays.length, atBar };
}
