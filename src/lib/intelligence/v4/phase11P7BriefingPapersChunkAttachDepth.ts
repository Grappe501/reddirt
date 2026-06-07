/**
 * Phase 11 P7 — Briefing papers chunk attach lane depth overlays.
 */
import type { PromotionBatchId } from "@/lib/intelligence/v4/phase11P5FieldBookChunkPromotionDepth";
import type { AlignmentChunkPreviewLaneId } from "@/lib/intelligence/v4/phase11P6StrategyAlignmentChunkPreviewDepth";

export const BRIEFING_PAPERS_CHUNK_ATTACH_HUB_HREF =
  "/admin/intelligence/briefing-papers-chunk-attach";

export const PHASE11_P7_ATTACH_LANE_TOTAL = 8;

export type BriefingPaperAttachLaneId =
  | "morning-intelligence"
  | "debate-prep"
  | "county-brief"
  | "opposition-research"
  | "media-monitoring"
  | "strategic-doctrine"
  | "candidate-talking-points"
  | "claims-gated-brief-merge";

export type BriefingPaperAttachOverlay = {
  laneId: BriefingPaperAttachLaneId;
  paperId: string;
  label: string;
  summary: string;
  linkedPreviewLanes: AlignmentChunkPreviewLaneId[];
  linkedPromotionBatches: PromotionBatchId[];
  attachSteps: string[];
  claimsAttachSteps: string[];
  targetFieldBookSlugs: string[];
  intelligenceLinks: Array<{ href: string; label: string }>;
};

const BRIEFING = "/admin/intelligence/briefing-papers";
const PREVIEW = "/admin/intelligence/strategy-alignment-chunk-preview";
const CHUNK_PROMO = "/admin/intelligence/field-book-chunk-promotion";
const CLAIMS = "/admin/intelligence/claims";
const ALIGNMENT = "/admin/intelligence/strategy-alignment";

function lane(
  laneId: BriefingPaperAttachLaneId,
  paperId: string,
  label: string,
  summary: string,
  previewLanes: AlignmentChunkPreviewLaneId[],
  batches: PromotionBatchId[],
  attach: string[],
  claims: string[],
  slugs: string[],
  links: Array<{ href: string; label: string }>,
): BriefingPaperAttachOverlay {
  return {
    laneId,
    paperId,
    label,
    summary,
    linkedPreviewLanes: previewLanes,
    linkedPromotionBatches: batches,
    attachSteps: attach,
    claimsAttachSteps: claims,
    targetFieldBookSlugs: slugs,
    intelligenceLinks: [
      { href: BRIEFING_PAPERS_CHUNK_ATTACH_HUB_HREF, label: "Chunk attach hub" },
      { href: BRIEFING, label: "Briefing papers" },
      { href: PREVIEW, label: "Alignment chunk preview (P6)" },
      { href: CHUNK_PROMO, label: "Chunk promotion (P5)" },
      { href: CLAIMS, label: "Claims ledger" },
      ...links,
    ],
  };
}

const LANE_OVERLAYS: Record<BriefingPaperAttachLaneId, BriefingPaperAttachOverlay> = {
  "morning-intelligence": lane(
    "morning-intelligence",
    "morning-intelligence",
    "Morning intelligence brief",
    "Attach operations-lane and morning-brief manual chunks to morning-intelligence paper deep sections — situation overview and what changed.",
    ["operations-kpi-dashboard", "doctrine-sdi-crosswalk"],
    ["kelly-operations", "csm-root-tomes"],
    [
      "Open P6 operations KPI lane — select top three chunk plainText previews for situationOverview.",
      "Merge chunk summaries into whatChangedSinceLastBrief — not raw markdown.",
      "Cross-read morning-brief surface before marking paper ready for leadership review.",
    ],
    [
      "Morning brief lines are NON_PUBLISHABLE until human review — classify chunk claims INTERNAL.",
      "KPI numbers from chunks stay INTERPRETATION until target-pathway data validates.",
    ],
    ["staff-strategy-command", "kelly-strategic-plan-command"],
    [
      { href: "/admin/intelligence/morning-brief", label: "Morning brief" },
      { href: ALIGNMENT, label: "Strategy alignment" },
    ],
  ),
  "debate-prep": lane(
    "debate-prep",
    "debate-prep",
    "Debate prep brief",
    "Attach debate-week workflow and playbook chunks to debate-prep paper — debateUse, whatNotToSay, and suggestedTalkingPointDrafts sections.",
    ["debate-week-workflows", "playbook-escalation", "foundation-civic-trust"],
    ["csm-workflows", "csm-playbooks", "kelly-foundation"],
    [
      "Preview P6 debate-week lane chunks — map each to debate prep section IDs on debate command.",
      "Attach chunk summaries to debateUse and whatNotToSay deep sections only.",
      "Cross-read philosophy-graph-claims before any civic-trust chunk language hits paper.",
    ],
    [
      "Stage lines from chunks require approve_internal via claim-review API.",
      "Cut do-not-say lines from chunk plainText that fail claims-firewall.",
    ],
    ["debate-instruction-bridge", "campaign-system-manual-command"],
    [
      { href: "/admin/intelligence/debate-command", label: "Debate command" },
      { href: "/admin/intelligence/trap-lanes", label: "Trap lanes" },
    ],
  ),
  "county-brief": lane(
    "county-brief",
    "county-pulaski",
    "County brief (Pulaski template)",
    "Attach county partnership and operations chunks to county-pulaski paper — countyImpactDeep and fieldRelevance sections.",
    ["operations-kpi-dashboard", "programs-comms-gotv"],
    ["kelly-programs", "kelly-operations"],
    [
      "Use county-pulaski paperId as template — replicate attach pattern for other county-* papers.",
      "Preview programs lane chunks for county partnership language — clerk-room tone only.",
      "Attach chunk summaries to countyImpactDeep — not voter-file specifics.",
    ],
    [
      "County implementation claims require diligence log VERIFIED before paper distribution.",
      "No PII or precinct-level data from chunks in briefing paper bodies.",
    ],
    ["kelly-strategic-plan-command", "three-lane-nav"],
    [{ href: "/admin/intelligence/county-clerk-week", label: "County clerk week" }],
  ),
  "opposition-research": lane(
    "opposition-research",
    "opposition-research",
    "Opposition research brief",
    "Attach comms-media and programs chunks to opposition-research paper — opponentOpportunity and evidenceWeaknesses sections.",
    ["programs-comms-gotv", "foundation-civic-trust"],
    ["kelly-programs"],
    [
      "Preview programs/comms-media chunks — crosswalk to Kim Hammer narrative state before attach.",
      "Attach only VERIFIED legislative record lines to opponentOpportunity section.",
      "Link paper drillDownLinks to evidence command routes cited in chunk sourceFile paths.",
    ],
    [
      "Opponent personal claims from chunks require counsel frame — not NEEDS_RESEARCH on stage.",
      "Hammer bill contrast lines must match act-proof drill-down classification.",
    ],
    ["claims-firewall", "strategy-philosophy-command"],
    [{ href: "/admin/intelligence/kim-hammer/evidence-command", label: "Evidence command" }],
  ),
  "media-monitoring": lane(
    "media-monitoring",
    "media-monitoring",
    "Media monitoring brief",
    "Attach comms-media workflow chunks to media-monitoring paper — mediaUse and mediaRelevance sections.",
    ["programs-comms-gotv", "debate-week-workflows"],
    ["kelly-programs", "csm-workflows"],
    [
      "Preview comms-media pathKey chunks from P6 programs lane.",
      "Attach chunk summaries to mediaUse — pair with media-intake findings for same day.",
      "Cross-read writing-toolbox claims gate before external comms distribution.",
    ],
    [
      "Media response chunks with opponent names require diligence VERIFIED anchors.",
      "Do not attach chunk lines implying published media hits without media-intake confirmation.",
    ],
    ["staff-strategy-command", "claims-firewall"],
    [{ href: "/admin/intelligence/media-intake", label: "Media intake" }],
  ),
  "strategic-doctrine": lane(
    "strategic-doctrine",
    "doctrine",
    "Strategic doctrine brief",
    "Attach SDI-1 doctrine crosswalk chunks to doctrine paper — strategicDoctrineAlignment and recommendedNextResearch sections.",
    ["doctrine-sdi-crosswalk", "foundation-civic-trust"],
    ["kelly-foundation", "kelly-programs"],
    [
      "Open strategy-doctrine hub — confirm artifact IDs match P6 doctrine crosswalk lane.",
      "Attach foundation + programs chunk summaries to strategicDoctrineAlignment bullets.",
      "Flag tensionDoctrineIds from alignment dashboard in strategicRisks section.",
    ],
    [
      "Doctrine JSON lines are INTERNAL until claims ledger approves public-adaptation.",
      "Tension doctrines block paper promotion to Field Book until alignment clears.",
    ],
    ["strategy-doctrine-command", "strategy-philosophy-command"],
    [
      { href: "/admin/intelligence/strategy-doctrine", label: "Strategy doctrine hub" },
      { href: ALIGNMENT, label: "Strategy alignment" },
    ],
  ),
  "candidate-talking-points": lane(
    "candidate-talking-points",
    "candidate-talking-points",
    "Candidate talking points (bill/policy)",
    "Attach framework and programs chunks to candidate-talking-points paper — suggestedTalkingPointDrafts and whatVolunteersCanSafelySay.",
    ["foundation-civic-trust", "programs-comms-gotv", "lifecycle-tome-root"],
    ["kelly-foundation", "kelly-programs", "csm-root-tomes"],
    [
      "Preview foundation civic-trust chunks — attach stage-safe lines to suggestedTalkingPointDrafts only.",
      "Use writing-toolbox tone rules when merging chunk plainText into volunteerUse section.",
      "Cross-read bill act-proof before attaching policy-specific chunk headings.",
    ],
    [
      "Volunteer-safe lines require approve_internal minimum — not raw chunk dumps.",
      "Bill/policy claims need VERIFIED legislative anchor before talking point attach.",
    ],
    ["kelly-strategic-plan-command", "claims-firewall"],
    [{ href: "/admin/intelligence/writing-toolbox", label: "Writing toolbox" }],
  ),
  "claims-gated-brief-merge": lane(
    "claims-gated-brief-merge",
    "claims-gated-merge",
    "Claims-gated brief merge",
    "Final attach gate — no briefing paper chunk merge promotes to Field Book until claim-review API clears all attached lines.",
    ["claims-gated-promotion"],
    ["kelly-foundation", "csm-web-presentation"],
    [
      "For each attached chunk line: log claim ledger row or mark INTERPRETATION before paper save.",
      "POST /api/admin/intelligence/claim-review — approve_internal for debate-week papers.",
      "After claims pass: link paper deep sections to Field Book target slugs via strategy-migration bridge.",
    ],
    [
      "approve_public_adaptation required for any paper line destined for public Field Book paths.",
      "NEEDS_REVIEW philosophy claims block foundation chunk attach on all paper types.",
      "Reject attach if chunk plainText contains do-not-say lines from P6 preview gate.",
    ],
    ["claims-firewall", "field-book-chunk-promotion-command", "strategy-migration"],
    [
      { href: CHUNK_PROMO, label: "Chunk promotion hub" },
      { href: "/admin/intelligence/field-book/canon", label: "Canon loop hub" },
    ],
  ),
};

export const BRIEFING_PAPER_ATTACH_LANE_IDS = Object.keys(
  LANE_OVERLAYS,
) as BriefingPaperAttachLaneId[];

export function getBriefingPaperAttachOverlay(
  laneId: BriefingPaperAttachLaneId,
): BriefingPaperAttachOverlay {
  return LANE_OVERLAYS[laneId];
}

export function briefingPaperAttachLaneHref(laneId: BriefingPaperAttachLaneId): string {
  return `${BRIEFING_PAPERS_CHUNK_ATTACH_HUB_HREF}/${laneId}`;
}

export function briefingPaperAttachMeetsPhase11P7Bar(overlay: BriefingPaperAttachOverlay): boolean {
  const linksOk =
    overlay.linkedPreviewLanes.length >= 1 || overlay.laneId === "claims-gated-brief-merge";
  return (
    overlay.attachSteps.length >= 3 &&
    overlay.claimsAttachSteps.length >= 2 &&
    overlay.targetFieldBookSlugs.length >= 1 &&
    overlay.linkedPromotionBatches.length >= 1 &&
    linksOk
  );
}

export function countBriefingPaperAttachLanesAtBar(): { total: number; atBar: number } {
  const overlays = BRIEFING_PAPER_ATTACH_LANE_IDS.map((id) => getBriefingPaperAttachOverlay(id));
  const atBar = overlays.filter(briefingPaperAttachMeetsPhase11P7Bar).length;
  return { total: overlays.length, atBar };
}
