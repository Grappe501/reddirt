/**
 * Phase 11 P5 — Field Book chunk promotion batch depth overlays.
 */
import { CAMPAIGN_SYSTEM_CATEGORY_LABELS } from "@/lib/campaign-strategy/campaign-system-nav";

export const FIELD_BOOK_CHUNK_PROMOTION_HUB_HREF = "/admin/intelligence/field-book-chunk-promotion";

export const PHASE11_P5_TARGET_CHUNK_TOTAL = 2795;
export const PHASE11_P5_MIN_CHUNK_TOTAL = 2700;
export const PHASE11_P5_INTELLIGENCE_GATE_PCT = 98;

export type PromotionBatchId =
  | "kelly-foundation"
  | "kelly-programs"
  | "kelly-operations"
  | "csm-root-tomes"
  | "csm-chapters"
  | "csm-playbooks"
  | "csm-roles"
  | "csm-workflows"
  | "csm-inventories"
  | "csm-maps"
  | "csm-web-presentation";

export type FieldBookChunkPromotionBatchOverlay = {
  batchId: PromotionBatchId;
  label: string;
  summary: string;
  operatorSteps: string[];
  claimsGateSteps: string[];
  targetFieldBookSlugs: string[];
  previewRoutes: Array<{ href: string; label: string }>;
  doNotPromoteUntil: string[];
};

const STRATEGY_ALIGNMENT = "/admin/intelligence/strategy-alignment";
const CANON = "/admin/intelligence/field-book/canon";
const CLAIMS = "/admin/intelligence/claims";
const CHUNKS_API = "/api/admin/campaign-strategy/chunks";

function batch(
  batchId: PromotionBatchId,
  label: string,
  summary: string,
  operator: string[],
  claims: string[],
  slugs: string[],
  previews: Array<{ href: string; label: string }>,
  blocked: string[],
): FieldBookChunkPromotionBatchOverlay {
  return {
    batchId,
    label,
    summary,
    operatorSteps: operator,
    claimsGateSteps: claims,
    targetFieldBookSlugs: slugs,
    previewRoutes: [
      { href: FIELD_BOOK_CHUNK_PROMOTION_HUB_HREF, label: "Chunk promotion hub" },
      { href: STRATEGY_ALIGNMENT, label: "Strategy alignment" },
      { href: CANON, label: "Canon loop hub" },
      { href: CLAIMS, label: "Claims ledger" },
      ...previews,
    ],
    doNotPromoteUntil: blocked,
  };
}

const BATCH_OVERLAYS: Record<PromotionBatchId, FieldBookChunkPromotionBatchOverlay> = {
  "kelly-foundation": batch(
    "kelly-foundation",
    "Kelly SOS · Foundation",
    "Strategic plan foundation lane — civic trust, transparency, keeper-of-records framing. Highest Field Book promotion priority after claims clearance.",
    [
      "Filter chunks API ?manualDomain=strategic-plan and laneSection foundation — preview H2/H3 units before canon promotion.",
      "Cross-read strategy-doctrine JSON (SDI-1) for each chunk pathKey — doctrine IDs must align before Field Book body merge.",
      "Promote page summaries into [[kelly-strategic-plan-command]] bodies using [[claims-firewall]] on every stage-adjacent line.",
    ],
    [
      "Map each chunk heading to claim ledger row or mark INTERPRETATION — no VERIFIED promotion without anchor.",
      "Clear NEEDS_REVIEW philosophy graph claims before foundation civic-trust chunks hit public Field Book.",
      "Counsel frame on election-integrity lines per [[counsel-review-frame]] before batch status → promotion_ready.",
    ],
    ["kelly-strategic-plan-command", "strategy-philosophy-command", "claims-firewall"],
    [
      { href: "/admin/intelligence/kelly-strategic-plan", label: "Kelly strategic plan hub" },
      { href: "/admin/intelligence/strategy-doctrine", label: "Strategy doctrine" },
    ],
    [
      "Do not promote DC-fraud rhetoric or unsourced SOS machine claims from manual chunks.",
      "Hold until intelligence build progress ≥98% and P4 philosophy claims cleared.",
    ],
  ),
  "kelly-programs": batch(
    "kelly-programs",
    "Kelly SOS · Programs",
    "Program lane chapters — voter access, election security programs, county partnership, grants. Batch promotes into program-themed Field Book cross-links.",
    [
      "Use strategy-alignment dashboard to preview program-lane chunks against debate trap lanes.",
      "Attach chunk plainText previews to briefing-papers drafts before Field Book article merge.",
      "Link promoted slugs via [[slug]] syntax from kelly-strategic-plan-command seeAlso graph.",
    ],
    [
      "Grant ledger and CVSGF lines require published source before VERIFIED Field Book promotion.",
      "County partnership claims must match diligence log classification — not NEEDS_RESEARCH on stage.",
    ],
    ["kelly-strategic-plan-command", "strategy-migration"],
    [{ href: "/admin/intelligence/briefing-papers", label: "Briefing papers" }],
    ["Do not promote program outcomes as delivered facts when manual marks planned or draft."],
  ),
  "kelly-operations": batch(
    "kelly-operations",
    "Kelly SOS · Operations",
    "Operations lane — staff workflows, KPIs, dashboard hierarchy, technical architecture crosswalks to campaign-system manual.",
    [
      "Pair operations chunks with campaign-system chapter 06 and 14 via strategy migration bridge pathKeys.",
      "Promote operator SOP summaries into staff-strategy-command seeAlso — not raw chunk dumps.",
      "Use morning-brief and build-progress surfaces to validate KPI language before canon merge.",
    ],
    [
      "Internal-only KPI targets stay INTERNAL classification until build-progress marks complete.",
      "Technical architecture claims about Netlify/county workbench require build-audit verification.",
    ],
    ["kelly-strategic-plan-command", "staff-strategy-command", "strategy-migration"],
    [
      { href: "/admin/intelligence/campaign-system-manual", label: "Campaign system manual" },
      { href: "/admin/intelligence/build-progress", label: "Build progress" },
    ],
    ["Do not expose county workbench internals as voter-facing Field Book copy."],
  ),
  "csm-root-tomes": batch(
    "csm-root-tomes",
    CAMPAIGN_SYSTEM_CATEGORY_LABELS["root-tomes"],
    "Top-level campaign-system tomes — lifecycle manual, simulation, tool stack, morning-brief systems. Root canon for Field Book campaign-system-manual-command.",
    [
      "Index via GET /api/admin/campaign-strategy/chunks?manualDomain=campaign-system — filter root pathKeys (no slash).",
      "Promote CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL chunk summaries into campaign-system-manual-command first.",
      "Cross-link simulation chunks to scenario-simulation intelligence surface before Field Book merge.",
    ],
    [
      "Simulation forecast numbers are planning assumptions — classify INTERPRETATION in ledger.",
      "Tool stack vendor claims need verified contract status before public-adaptation paths.",
    ],
    ["campaign-system-manual-command", "strategy-migration"],
    [{ href: "/admin/intelligence/scenario-simulation", label: "Scenario simulation" }],
    ["Hold lifecycle manual promotion until P5 batch status is preview_ready minimum."],
  ),
  "csm-chapters": batch(
    "csm-chapters",
    CAMPAIGN_SYSTEM_CATEGORY_LABELS.chapters,
    "Numbered manual chapters — dashboard hierarchy, field organizing, KPIs, training, roadmap.",
    [
      "Batch by chapters/NN-* pathKey prefix — promote chapter README chunk preambles into Field Book section stubs.",
      "Chapter 06 pairs with Kelly operations lane; chapter 14 pairs with strategic-target-pathway NSI-7.",
      "Use campaign-system-manual hub reader to verify heading slugs match chunk ids before deep links.",
    ],
    [
      "KPI chapter chunks require NSI-7 alignment check before stage-adjacent promotion.",
      "Training chapter claims about debate prep must crosswalk debate-instruction-bridge article.",
    ],
    ["campaign-system-manual-command"],
    [{ href: "/admin/intelligence/strategic-target-pathway", label: "Target pathway" }],
    ["Do not promote chapter drafts marked TODO or WIP in source markdown."],
  ),
  "csm-playbooks": batch(
    "csm-playbooks",
    CAMPAIGN_SYSTEM_CATEGORY_LABELS.playbooks,
    "SOPs, escalation paths, training module index, dashboard attachment rules — operator execution layer for Field Book.",
    [
      "Prioritize TRAINING_MODULE_INDEX and ESCALATION_PATHS chunks for staff-strategy-command cross-links.",
      "DASHBOARD_ATTACHMENT_RULES chunks gate Field Book body promotion — read before any canon merge.",
      "Promote escalation summaries into human action queue governance seeAlso graph.",
    ],
    [
      "Escalation paths involving counsel require counsel-review-frame clearance.",
      "Debate-week SOP lines must pass claims-firewall before Field Book public paths.",
    ],
    ["campaign-system-manual-command", "staff-strategy-command"],
    [{ href: "/admin/intelligence/debate-command", label: "Debate command" }],
    ["Do not promote internal-only escalation contacts to public Field Book."],
  ),
  "csm-roles": batch(
    "csm-roles",
    CAMPAIGN_SYSTEM_CATEGORY_LABELS.roles,
    "Role guides — candidate, staff, volunteer, clerk-week lanes. Maps to three-lane nav and Field Book role articles.",
    [
      "Map role chunks to three-lane-nav article and ipad-candidate-ux where candidate-facing.",
      "Clerk-week role chunks crosswalk county-clerk-week intelligence surfaces.",
      "Promote role responsibility summaries — not full chunk markdown — into Field Book bodies.",
    ],
    [
      "Candidate role chunks on stage lines require debate command philosophy readiness feed green.",
      "Volunteer role chunks with legal advice need counsel classification.",
    ],
    ["campaign-system-manual-command", "three-lane-nav"],
    [{ href: "/admin/intelligence/county-clerk-week", label: "County clerk week" }],
    ["Do not promote opponent research role guidance to public Field Book."],
  ),
  "csm-workflows": batch(
    "csm-workflows",
    CAMPAIGN_SYSTEM_CATEGORY_LABELS.workflows,
    "End-to-end workflows — debate week, filing season, grant cycles, media response.",
    [
      "Debate-week workflow chunks link to debate-instruction-bridge and trap lane surfaces.",
      "Media workflow chunks cross-read comms-media Kelly manual pathKeys on strategy-alignment.",
      "Track batch promotion status in field-book-chunk-promotion-state.json after each staff review.",
    ],
    [
      "Media response workflows with opponent names require diligence log VERIFIED anchors.",
      "Filing season deadlines must cite official SOS sources before VERIFIED promotion.",
    ],
    ["campaign-system-manual-command", "debate-instruction-bridge"],
    [{ href: "/admin/intelligence/trap-lanes", label: "Trap lanes" }],
    ["Do not promote workflow timing as guarantees to voters."],
  ),
  "csm-inventories": batch(
    "csm-inventories",
    CAMPAIGN_SYSTEM_CATEGORY_LABELS.inventories,
    "Inventories and indexes — module maps, asset lists, checklist registries feeding Field Book glossary and canon hub.",
    [
      "Promote inventory index chunks into field-book/glossary seeAlso — maintain slug stability.",
      "Module map chunks crosswalk kim-hammer module registry and dossier research surfaces.",
      "Use chunk ordinal ids for stable deep links when promoting checklist items.",
    ],
    [
      "Asset inventories with dollar amounts need finance verification before Field Book merge.",
      "Opponent module inventories stay INTERNAL until diligence complete.",
    ],
    ["campaign-system-manual-command", "glossary"],
    [{ href: "/admin/intelligence/field-book/glossary", label: "Field Book glossary" }],
    ["Do not publish internal asset valuations in public Field Book paths."],
  ),
  "csm-maps": batch(
    "csm-maps",
    CAMPAIGN_SYSTEM_CATEGORY_LABELS.maps,
    "System maps — architecture diagrams, data flow, integration topology for staff Field Book canon.",
    [
      "Map chunks describe internal architecture — promote staff-only summaries into campaign-system-manual-command.",
      "Cross-link RedDirt/county workbench audit chunks with build-progress flags.",
      "Keep diagram alt-text accessible when merging chunk prose into Field Book HTML bodies.",
    ],
    [
      "Architecture claims about production systems require build-audit sign-off.",
      "County integration maps with PII flows stay INTERNAL classification.",
    ],
    ["campaign-system-manual-command", "strategy-migration"],
    [{ href: "/admin/campaign-strategy/build-audit", label: "Build audit manual" }],
    ["Do not expose admin API routes or credentials in promoted map prose."],
  ),
  "csm-web-presentation": batch(
    "csm-web-presentation",
    CAMPAIGN_SYSTEM_CATEGORY_LABELS["web-presentation"],
    "Web presentation layer — public site copy rules, Netlify deploy patterns, Field Book connected canon syntax.",
    [
      "Promote web-presentation chunks into strategy-migration and field-book/canon operator guides.",
      "Teal new-link batch rules from navLinkReleaseManifest apply to every promoted public route mention.",
      "Validate [[slug|label]] wiki links resolve to live Field Book articles before promotion_ready.",
    ],
    [
      "Public URL claims must match Netlify deploy manifest — not localhost or staging paths.",
      "Claims-firewall required on every public-adaptation chunk promoted to Field Book.",
    ],
    ["strategy-migration", "claims-firewall"],
    [{ href: "/admin/intelligence/field-book/canon", label: "Canon loop hub" }],
    ["Do not promote unreleased intelligence routes as public links."],
  ),
};

export const PROMOTION_BATCH_IDS = Object.keys(BATCH_OVERLAYS) as PromotionBatchId[];

export function getFieldBookChunkPromotionOverlay(batchId: PromotionBatchId): FieldBookChunkPromotionBatchOverlay {
  return BATCH_OVERLAYS[batchId];
}

export function fieldBookChunkPromotionBatchHref(batchId: PromotionBatchId): string {
  return `${FIELD_BOOK_CHUNK_PROMOTION_HUB_HREF}/${batchId}`;
}

export function fieldBookChunkPromotionMeetsPhase11P5Bar(overlay: FieldBookChunkPromotionBatchOverlay): boolean {
  return (
    overlay.operatorSteps.length >= 3 &&
    overlay.claimsGateSteps.length >= 2 &&
    overlay.targetFieldBookSlugs.length >= 1 &&
    overlay.doNotPromoteUntil.length >= 1
  );
}

export function countFieldBookChunkPromotionBatchesAtBar(): { total: number; atBar: number } {
  const overlays = PROMOTION_BATCH_IDS.map((id) => getFieldBookChunkPromotionOverlay(id));
  const atBar = overlays.filter(fieldBookChunkPromotionMeetsPhase11P5Bar).length;
  return { total: overlays.length, atBar };
}
