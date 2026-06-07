/**
 * Phase 11 P4 — Philosophy graph node claims review depth overlays.
 */
import { loadCampaignPhilosophyGraph } from "@/lib/intelligence/campaignIntelligenceGraph";
import { getPhase10PhilosophyGraphOverlay } from "@/lib/intelligence/v4/phase10StrategyPhilosophyDepth";

export const PHILOSOPHY_GRAPH_CLAIMS_HUB_HREF = "/admin/intelligence/philosophy-graph-claims-review";

export type PhilosophyGraphClaimsOverlay = {
  philosophyId: string;
  linkedClaimId: string;
  claimReviewSteps: string[];
  stageSafeWording: string[];
  doNotSayLines: string[];
  operatorSteps: string[];
  intelligenceLinks: Array<{ href: string; label: string }>;
  linkedDoctrineIds: string[];
  linkedBriefingIds: string[];
};

const HUB = "/admin/intelligence/strategy-philosophy-hub";
const ALIGNMENT = "/admin/intelligence/strategy-alignment";
const DEBATE = "/admin/intelligence/debate-command";
const CLAIMS = "/admin/intelligence/claims";
const GRAPH = "/admin/intelligence/campaign-intelligence-graph";

function claimIdFor(philosophyId: string): string {
  return `claim-philosophy-${philosophyId}`;
}

function node(
  philosophyId: string,
  review: string[],
  safe: string[],
  blocked: string[],
  steps: string[],
  links: Array<{ href: string; label: string }>,
  doctrines: string[] = [],
  briefings: string[] = [],
): PhilosophyGraphClaimsOverlay {
  const p10 = getPhase10PhilosophyGraphOverlay(philosophyId);
  return {
    philosophyId,
    linkedClaimId: claimIdFor(philosophyId),
    claimReviewSteps: review,
    stageSafeWording: safe,
    doNotSayLines: blocked,
    operatorSteps: steps,
    intelligenceLinks: [
      { href: PHILOSOPHY_GRAPH_CLAIMS_HUB_HREF, label: "Philosophy claims hub" },
      { href: HUB, label: "Strategy & philosophy hub" },
      { href: GRAPH, label: "Intelligence graph" },
      { href: CLAIMS, label: "Claims ledger" },
      { href: DEBATE, label: "Debate command" },
      ...links,
      ...p10.intelligenceLinks.slice(0, 2),
    ],
    linkedDoctrineIds: doctrines,
    linkedBriefingIds: briefings.length ? briefings : [],
  };
}

const NODE_OVERLAYS: Record<string, PhilosophyGraphClaimsOverlay> = {
  "philosophy-civic-trust": node(
    "philosophy-civic-trust",
    [
      "Verify principle against doctrine-steve-strategy and SOS keeper-of-records packet before stage.",
      "Map messaging frames to claim ledger row — balls-and-strikes SOS is INTERPRETATION until VERIFIED.",
      "Approve internal only after counsel frame cross-check on election-integrity lines.",
    ],
    [
      "Arkansas election process should be lawful, transparent, and understandable — I'm running to steward that.",
      "The SOS office calls balls and strikes — not culture-war headlines.",
    ],
    [
      "Do not claim SOS literally runs every county machine or audits every ballot by hand.",
      "Do not nationalize Arkansas county implementation with DC fraud rhetoric.",
    ],
    [
      "Open claim-philosophy-civic-trust in ledger → verify anchors → approve internal for rehearsal.",
      "Cross-read integrity-without-nationalizing briefing before debate prep section 4.",
      "Link approved wording to trap lane fraud-data-dare speak-order drill.",
    ],
    [
      { href: "/admin/intelligence/debate-briefings/integrity-without-nationalizing", label: "Integrity briefing" },
      { href: ALIGNMENT, label: "Strategy alignment" },
    ],
    ["doctrine-steve-strategy", "doctrine-sos-keeper-records"],
    ["integrity-without-nationalizing"],
  ),
  "philosophy-transparency": node(
    "philosophy-transparency",
    [
      "CVSGF and grant ledger lines require published source before VERIFIED classification.",
      "Show-your-work framing must cite SOS publication duty — not imply records already published if NEEDS_RESEARCH.",
      "Reject literal 'state librarian' metaphor claims — keeper-of-record is governed metaphor only.",
    ],
    [
      "Voters deserve published procedures, audit trails, and grant ledgers they can actually read.",
      "Transparency means showing your work — not performative outrage about opacity.",
    ],
    ["Do not say SOS is Arkansas state librarian.", "Do not cite unpublished county ledger totals as verified."],
    [
      "Seed or verify claim-philosophy-transparency with CVSGF statutory cite when ready.",
      "Open CVSGF Field Book article before approving public-adaptation tier.",
      "Pair with election-funding intelligence for county burden follow-ups.",
    ],
    [
      { href: "/admin/intelligence/field-book/cvsgf-ledger-gap", label: "CVSGF Field Book" },
      { href: "/admin/intelligence/election-funding", label: "Election funding" },
    ],
    ["doctrine-sos-keeper-records"],
  ),
  "philosophy-participation": node(
    "philosophy-participation",
    [
      "Integrity + access pairing must pass agree-but-never-only-agree briefing gate.",
      "Bill anchors SB486/SB487 require act-proof before stage citation.",
      "Pakko third-candidate lane may amplify access — Kelly adds SOS implementation detail only when VERIFIED.",
    ],
    [
      "Security and access belong together — rules should make voting workable, not merely harder.",
      "I'll fight for integrity and for participation — Arkansans deserve both.",
    ],
    ["Do not concede participation frame entirely to Hammer after agreeing on security.", "Do not cite bill effects without act number verification."],
    [
      "Run SOS question bank on participation category after claim approval.",
      "Link to debate prep section 6 encounter depth when claim moves to HUMAN_APPROVED_INTERNAL.",
      "Flag NEEDS_REVIEW in morning brief if participation claim still open debate week.",
    ],
    [
      { href: "/admin/intelligence/debate-briefings/agree-but-never-only-agree", label: "Agree briefing" },
      { href: "/admin/intelligence/sos-debate-questions", label: "SOS questions" },
    ],
    ["doctrine-steve-strategy"],
    ["agree-but-never-only-agree"],
  ),
  "philosophy-county-partnership": node(
    "philosophy-county-partnership",
    [
      "ACCA tone gate — curious partnership, not prosecution — before approving clerk-partnership lines.",
      "County KPI and funding claims must align with election-funding rollup status.",
      "Mandate-without-funding contrast requires CVSGF/HAVA diligence log clean or RESEARCH_QUESTION phrasing.",
    ],
    [
      "When the state sets policy, counties need funding, training, and a Monday-morning hotline — not unfunded mandates.",
      "Clerks aren't the enemy — they're partners implementing the law in seventy-five counties.",
    ],
    ["Do not blame county clerks for state policy failures on stage.", "Do not promise specific dollar amounts without appropriation verification."],
    [
      "Approve claim after ACCA panel script review at county-clerk-week hub.",
      "Wire approved lines to county-deep prep section and trap lane clerk-room scripts.",
      "Cross-check county-clerk-partnership briefing before Field Book promotion.",
    ],
    [
      { href: "/admin/intelligence/debate-briefings/county-clerk-partnership", label: "Clerk briefing" },
      { href: "/admin/intelligence/county-clerk-week", label: "County clerk week" },
    ],
    ["doctrine-grassroots-principles", "doctrine-county-kpi-model"],
    ["county-clerk-partnership"],
  ),
  "philosophy-modernization": node(
    "philosophy-modernization",
    [
      "VVSG and equipment claims require election-equipment hub verification before VERIFIED.",
      "Modernize-with-support frame must not overpromise rollout timelines.",
      "Author-vs-administrator contrast lines need claims gate — Hammer authorship ≠ implementation readiness.",
    ],
    [
      "Modernization only works with county training, transparent rollout, and capacity building.",
      "Passing a bill isn't implementing it — the SOS has to support clerks when mandates land.",
    ],
    ["Do not claim every county has upgraded equipment without inventory verification.", "Do not attack modernization as inherently bad — contrast implementation support."],
    [
      "Review claim against VVSG hub and Kelly theme integration plan status.",
      "Link to author-vs-administrator briefing for debate contrast rehearsal.",
      "Require human notes on any public-adaptation approval for modernization lines.",
    ],
    [
      { href: "/admin/intelligence/election-equipment-vvsg", label: "VVSG hub" },
      { href: "/admin/intelligence/debate-briefings/author-vs-administrator", label: "Author vs administrator" },
    ],
    ["doctrine-kelly-theme-integration"],
    ["author-vs-administrator"],
  ),
  "philosophy-citizen-empowerment": node(
    "philosophy-citizen-empowerment",
    [
      "Civic education and Stand Up Arkansas history lines need sourced packet before VERIFIED.",
      "Empowerment framing must stay plain-language — no jargon that sounds like consultant speak.",
      "Relational organizing doctrine AGGREGATE_ONLY — no voter-targeting implications in stage lines.",
    ],
    [
      "Policy should expand understanding and participation — not hide discretion in opaque processes.",
      "Your vote counts when the process is understandable and the rules are published.",
    ],
    ["Do not promise outcomes the SOS cannot lawfully deliver.", "Do not imply individual voter targeting or microtargeting."],
    [
      "Cross-read movement philosophy core-principles before approving empowerment claim.",
      "Pair with direct-democracy-offense briefing when petition pathways arise.",
      "Submit for review if claim text changes from graph principle default.",
    ],
    [
      { href: "/admin/intelligence/movement-philosophy/core-principles", label: "Core principles" },
      { href: "/admin/intelligence/debate-briefings/direct-democracy-offense", label: "Direct democracy briefing" },
    ],
    ["doctrine-steve-strategy", "doctrine-relational-organizing"],
    ["direct-democracy-offense"],
  ),
  "philosophy-anti-centralization": node(
    "philosophy-anti-centralization",
    [
      "Local accountability lines must not become anti-state-government slogans — clarity over cynicism.",
      "SB487/SB643 bill citations require act-proof drill before stage use.",
      "Contrast matrix governs opponent claims — no motive inference without statutory confirmation.",
    ],
    [
      "Election decisions should stay understandable and accountable at the local level — with state support, not state overload.",
      "Centralizing discretion without public notice erodes trust — I will publish the rules.",
    ],
    ["Do not claim Hammer 'centralized' elections without sourced statutory analysis.", "Do not use conspiracy framing about opaque institutional control."],
    [
      "Verify claim against opponent contrast matrix before debate trap lanes.",
      "Link to county-administration-burden narrative in strategy alignment dashboard.",
      "Reject claim variant that sounds like federal election conspiracy.",
    ],
    [
      { href: "/admin/intelligence/opposition-strategy", label: "Opposition strategy" },
      { href: ALIGNMENT, label: "Strategy alignment" },
    ],
    ["doctrine-steve-strategy", "doctrine-opponent-contrast-matrix"],
  ),
  "philosophy-direct-democracy": node(
    "philosophy-direct-democracy",
    [
      "Petition and initiative pathways require lawful-guardrails language — no promise of outcomes SOS cannot control.",
      "SB254/SB258 bill cluster needs act-proof and claims review before stage citation.",
      "Direct-democracy-offense briefing governs agree-then-contrast on petition access questions.",
    ],
    [
      "Ballot initiative pathways should stay understandable and accessible within the law.",
      "Citizens deserve clear rules for petitions — not barriers dressed up as reform.",
    ],
    ["Do not promise to reverse specific initiative rules without legal review.", "Do not attack all petition reform as anti-democratic without sourced bill analysis."],
    [
      "Open direct-democracy-offense briefing before approving claim for rehearsal.",
      "Cross-link to kim-hammer narrative-testing petition category attack playbook.",
      "Require counsel review note before public-adaptation tier on initiative lines.",
    ],
    [
      { href: "/admin/intelligence/debate-briefings/direct-democracy-offense", label: "Direct democracy briefing" },
      { href: "/admin/intelligence/kim-hammer/narrative-testing", label: "Narrative testing" },
    ],
    ["doctrine-opponent-contrast-matrix"],
    ["direct-democracy-offense"],
  ),
};

export function getPhilosophyGraphClaimsOverlay(philosophyId: string): PhilosophyGraphClaimsOverlay {
  return (
    NODE_OVERLAYS[philosophyId] ??
    node(
      philosophyId,
      ["Review graph node principle in claims ledger before any stage use."],
      ["Use plain-language process framing until claim VERIFIED."],
      ["Do not assert graph principle as verified fact without ledger approval."],
      ["Open linked claim row → verify → approve internal or reject."],
      [{ href: GRAPH, label: "Intelligence graph" }],
    )
  );
}

export function philosophyGraphClaimsMeetsPhase11P4Bar(overlay: PhilosophyGraphClaimsOverlay): boolean {
  return (
    overlay.claimReviewSteps.length >= 3 &&
    overlay.stageSafeWording.length >= 2 &&
    overlay.doNotSayLines.length >= 1 &&
    overlay.operatorSteps.length >= 3 &&
    overlay.intelligenceLinks.length >= 5 &&
    overlay.linkedClaimId.startsWith("claim-philosophy-")
  );
}

export function countPhilosophyGraphNodesAtPhase11P4Bar(): { atBar: number; total: number } {
  const graph = loadCampaignPhilosophyGraph();
  let atBar = 0;
  for (const n of graph.nodes) {
    if (philosophyGraphClaimsMeetsPhase11P4Bar(getPhilosophyGraphClaimsOverlay(n.philosophyId))) atBar++;
  }
  return { atBar, total: graph.nodes.length };
}

export const PHASE11_P4_PHILOSOPHY_GRAPH_NODE_TOTAL = 8;

export function philosophyGraphNodeHref(philosophyId: string): string {
  return `${PHILOSOPHY_GRAPH_CLAIMS_HUB_HREF}/${philosophyId}`;
}
