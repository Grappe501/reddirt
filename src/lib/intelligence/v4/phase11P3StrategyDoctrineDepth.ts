/**
 * Phase 11 P3 — Strategy doctrine JSON artifact depth overlays.
 */
import {
  STRATEGY_DOCTRINE_HUB_HREF,
  STRATEGY_DOCTRINE_JSON_ENTRIES,
  strategyDoctrineDocHref,
} from "@/lib/strategy-doctrine/strategy-doctrine-nav";

export type StrategyDoctrineArtifactOverlay = {
  pathKey: string;
  strategicRole: string;
  debateApplication: string[];
  alignmentUse: string[];
  intelligenceLinks: Array<{ href: string; label: string }>;
  linkedRegistryDoctrineIds: string[];
  reviewGate: string;
};

const HUB = "/admin/intelligence/strategy-philosophy-hub";
const ALIGNMENT = "/admin/intelligence/strategy-alignment";
const DEBATE = "/admin/intelligence/debate-command";
const MOVEMENT = "/admin/intelligence/movement-philosophy";
const CLAIMS = "/admin/intelligence/claims";

function artifact(
  pathKey: string,
  role: string,
  debate: string[],
  alignment: string[],
  links: Array<{ href: string; label: string }>,
  registryIds: string[] = [],
  reviewGate = "NEEDS_REVIEW — no external or stage use until claims VERIFIED",
): StrategyDoctrineArtifactOverlay {
  return {
    pathKey,
    strategicRole: role,
    debateApplication: debate,
    alignmentUse: alignment,
    intelligenceLinks: [
      { href: HUB, label: "Strategy & philosophy hub" },
      { href: ALIGNMENT, label: "Strategy alignment (SDI-1)" },
      { href: DEBATE, label: "Debate command" },
      { href: CLAIMS, label: "Claims ledger" },
      ...links,
    ],
    linkedRegistryDoctrineIds: registryIds,
    reviewGate,
  };
}

const ARTIFACT_OVERLAYS: Record<string, StrategyDoctrineArtifactOverlay> = {
  "campaign-strategic-doctrine-registry": artifact(
    "campaign-strategic-doctrine-registry",
    "SDI-1 master index — maps every doctrine to source path, review status, narrative links, and AI accessibility policy.",
    [
      "Debate prep uses registry to cross-check narrative-doctrine alignment before stage lines.",
      "Filter APPROVED_FOR_INTERNAL_USE vs NEEDS_REVIEW before briefing paper citations.",
    ],
    [
      "Strategy alignment dashboard reads this registry — primary coherence index input.",
      "Narrative-doctrine map in campaignStrategicAlignment resolves linked entries per narrative ID.",
    ],
    [
      { href: STRATEGY_DOCTRINE_HUB_HREF, label: "Doctrine hub" },
      { href: "/admin/intelligence/campaign-intelligence-graph", label: "Intelligence graph" },
    ],
    [],
    "Registry is metadata — individual doctrines still NEEDS_REVIEW until steward approval",
  ),
  "steve-strategy-doctrine": artifact(
    "steve-strategy-doctrine",
    "Steve doctrine structured intake — balls-and-strikes SOS, eye-to-eye campaigning, guardrails blocking voter targeting.",
    [
      "Anchor election-integrity answers in balls-and-strikes framing — avoid cultural-war SOS rhetoric.",
      "Unity-over-division principle governs contrast tone vs Hammer without shrinking coalition.",
    ],
    [
      "Priority doctrine for SDI alignment signals — CRITICAL sensitivity.",
      "Guardrails block autonomous outreach — human approval before strategy activation.",
    ],
    [
      { href: MOVEMENT, label: "Movement philosophy" },
      { href: "/admin/intelligence/debate-briefings/author-vs-administrator", label: "Author vs administrator" },
    ],
    ["doctrine-steve-strategy-json", "doctrine-steve-strategy"],
  ),
  "arkansas-grassroots-principles": artifact(
    "arkansas-grassroots-principles",
    "Field doctrine — county differences are real; relationships and local visibility are infrastructure.",
    [
      "County fluency dimension — cite county-specific posture when Hammer attacks unfunded mandates.",
      "Avoid statewide one-size messaging on stage — reference local trust frame.",
    ],
    [
      "Links to kh0b-county-administration-burden narrative in alignment engine.",
      "County profiles incomplete for all 75 counties — flag UNDERDEFINED in alignment.",
    ],
    [
      { href: "/admin/intelligence/county-clerk-week", label: "County clerk week" },
      { href: "/admin/intelligence/strategic-target-pathway", label: "Strategic target pathway" },
    ],
    ["doctrine-grassroots-principles"],
  ),
  "relational-organizing-playbook": artifact(
    "relational-organizing-playbook",
    "Relational organizing patterns — captain ladders, phone trees, trusted-network outreach under aggregate-only AI policy.",
    [
      "Debate answers on volunteer scale should echo neighbor-to-neighbor trust — not extractive contact mining.",
      "Power of 5 and relational lanes inherit patterns from this playbook.",
    ],
    [
      "AGGREGATE_ONLY aiAccessibility — no voter-file browsing as public product.",
      "Patterns status NEEDS_REVIEW until Steve validation.",
    ],
    [
      { href: "/admin/intelligence/staff-strategy-command", label: "Staff strategy command" },
      { href: MOVEMENT, label: "Volunteer philosophy" },
    ],
    ["doctrine-relational-organizing"],
  ),
  "event-visibility-playbook": artifact(
    "event-visibility-playbook",
    "Local visibility framework — presence before pitch; local faces first at fairs, festivals, civic clubs.",
    [
      "Safe stage examples: courthouse days, civic club presence — not performative digital-only politics.",
      "Pair with Steve doctrine eye-to-eye campaigning on credibility questions.",
    ],
    [
      "Event types list feeds field captain planning — not auto-deploy messaging.",
      "Cross-read campaign-system manual event workflows before promotion.",
    ],
    [
      { href: "/admin/intelligence/campaign-system-manual", label: "Campaign system manual" },
      { href: "/admin/intelligence/kelly-strategic-plan/programs/relational-field", label: "Kelly relational field" },
    ],
    [],
  ),
  "gotv-backward-calendar-model": artifact(
    "gotv-backward-calendar-model",
    "GOTV backward planning — T-90 through election day windows with compliance review required flags.",
    [
      "Debate turnout questions — reference backward windows without promising autonomous targeting.",
      "Poll watcher training plan appears in T-90 window — link to coverage model.",
    ],
    [
      "Companion to GOTV markdown doctrine in registry — machine-readable intake.",
      "Compliance review required on each window — no auto-send programs.",
    ],
    [
      { href: strategyDoctrineDocHref("poll-watcher-coverage-model"), label: "Poll watcher model" },
      { href: "/admin/intelligence/scenario-simulation", label: "Scenario simulation" },
    ],
    ["doctrine-gotv-backward-planning"],
  ),
  "poll-watcher-coverage-model": artifact(
    "poll-watcher-coverage-model",
    "Observer coverage template — county, site, training, credentialing, gap tracking per polling location.",
    [
      "Election integrity debate frame — process clarity and lawful observer coverage, not conspiracy rhetoric.",
      "Coverage gaps feed county clerk week prep and morning brief action queue.",
    ],
    [
      "Required fields template — MISSING defaults honest about incomplete county ledger.",
      "Legal guidance status gate before deploying observer recruitment messaging.",
    ],
    [
      { href: "/admin/intelligence/election-funding", label: "Election funding" },
      { href: "/admin/intelligence/county-clerk-week", label: "County clerk week" },
    ],
    [],
  ),
  "county-strategy-source-index": artifact(
    "county-strategy-source-index",
    "Source index for county strategy — campaign brain artifacts, Rockefeller research, public history citations.",
    [
      "Diligence and debate prep — trace county claims to indexed sources before stage use.",
      "Rockefeller research packet linked for historical reform framing with guardrails.",
    ],
    [
      "Feeds SDI discovery phase — internal HIGH confidence paths vs MEDIUM public history.",
      "Crosswalk to campaign-intelligence-graph entity resolution.",
    ],
    [
      { href: strategyDoctrineDocHref("rockefeller-grassroots-case-study"), label: "Rockefeller case study" },
      { href: "/admin/intelligence/diligence", label: "Diligence hub" },
    ],
    [],
  ),
  "rockefeller-grassroots-case-study": artifact(
    "rockefeller-grassroots-case-study",
    "Historical case study — Winthrop Rockefeller reform campaigns; county persistence, coalition lessons, sourced claims only.",
    [
      "Identity-and-history anchor from movement philosophy — return to what Arkansas can be.",
      "Only directly sourced lines safe for stage — NEEDS_REVIEW on volunteer infrastructure claims.",
    ],
    [
      "Public history sources (EOA) HIGH confidence — internal extrapolation MEDIUM.",
      "Do not overstate parallels to current race without counsel review.",
    ],
    [
      { href: MOVEMENT, label: "Positioning & coalition" },
      { href: "/admin/intelligence/debate-briefings/integrity-without-nationalizing", label: "Integrity briefing" },
    ],
    [],
    "Historical framing — verify each line against case study directlySourced array",
  ),
};

export function getStrategyDoctrineArtifactOverlay(pathKey: string): StrategyDoctrineArtifactOverlay {
  const key = pathKey.replace(/^\/+|\/+$/g, "") || "campaign-strategic-doctrine-registry";
  const entry = STRATEGY_DOCTRINE_JSON_ENTRIES.find((e) => e.pathKey === key);
  return (
    ARTIFACT_OVERLAYS[key] ??
    artifact(
      key,
      "Strategy doctrine JSON artifact — read-only SDI-1 intake; cross-check strategy alignment before use.",
      ["Verify review status in registry before debate or external citation."],
      ["Run strategy alignment dashboard for narrative-doctrine coherence."],
      [{ href: STRATEGY_DOCTRINE_HUB_HREF, label: "Doctrine hub" }],
      entry?.registryDoctrineIds ?? [],
    )
  );
}

export function strategyDoctrineArtifactMeetsPhase11P3Bar(overlay: StrategyDoctrineArtifactOverlay): boolean {
  return (
    overlay.strategicRole.length >= 40 &&
    overlay.debateApplication.length >= 2 &&
    overlay.alignmentUse.length >= 2 &&
    overlay.intelligenceLinks.length >= 5
  );
}

export function countStrategyDoctrineArtifactsAtPhase11P3Bar(): { atBar: number; total: number } {
  let atBar = 0;
  for (const entry of STRATEGY_DOCTRINE_JSON_ENTRIES) {
    const overlay = getStrategyDoctrineArtifactOverlay(entry.pathKey);
    if (strategyDoctrineArtifactMeetsPhase11P3Bar(overlay)) atBar++;
  }
  return { atBar, total: STRATEGY_DOCTRINE_JSON_ENTRIES.length };
}

export const PHASE11_P3_STRATEGY_DOCTRINE_ARTIFACT_TOTAL = STRATEGY_DOCTRINE_JSON_ENTRIES.length;
