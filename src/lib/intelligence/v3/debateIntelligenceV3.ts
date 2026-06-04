import fs from "node:fs";
import path from "node:path";
import {
  loadKimHammerWorkbenchHubSummary,
  parseClaimsReview,
  type HammerBillRow,
} from "@/lib/opposition/kimHammerWorkbench";
import { tryIntelligenceLoad } from "@/lib/intelligence/safeIntelligenceLoad";
import { readMarkdownSections, sectionBulletsFromMarkdown } from "@/lib/intelligence/v3/markdownSections";
import type { DebateIntelligenceV3Packet, V3BillNarrative, V3DebatePrepSection } from "@/lib/intelligence/v3/debateIntelligenceV3Types";

const ROOT = process.cwd();

const DOCS = {
  debateProfile: "docs/opposition/KIM_HAMMER_DEBATE_PROFILE.md",
  likelyArguments: "docs/opposition/KIM_HAMMER_LIKELY_ARGUMENTS_AND_RESPONSES.md",
  contrast: "docs/opposition/KIM_HAMMER_CONTRAST_VS_KELLY.md",
  strengths: "docs/opposition/KIM_HAMMER_STRENGTHS_AND_WEAKNESSES.md",
  messageGuidance: "docs/opposition/KIM_HAMMER_ELECTION_RECORD_MESSAGE_GUIDANCE.md",
  intelligenceGaps: "docs/opposition/KIM_HAMMER_INTELLIGENCE_GAPS.md",
  dossier: "docs/opposition/KIM_HAMMER_ELECTION_RECORD_RESEARCH_DOSSIER.md",
  kh3: "docs/opposition/KIM_HAMMER_KH3_DEEP_RESEARCH.md",
  website: "docs/opposition/KIM_HAMMER_WEBSITE_MESSAGE_ANALYSIS.md",
  claimsReview: "docs/opposition/KIM_HAMMER_ELECTION_RECORD_CLAIMS_REVIEW.md",
};

function readJson<T>(relPath: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), "utf8")) as T;
}

function readText(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function loadBillNarratives(): V3BillNarrative[] {
  const file = readJson<{
    bills: Array<{
      billNumber: string;
      actNumber: string | null;
      title: string;
      plainEnglishSummary: string;
      billNarrative: string;
      countyImpactNarrative: string;
      debateFrames: { kellyFrame: string; hammerFrame: string; countyFrame: string };
      counterArguments: string[];
      supporterArguments: string[];
      publicationRisk: string;
      strategicBriefing: {
        howToMessage: string;
        debateImpact: string;
        whenToUse: string;
        whenNotToUse: string;
      };
    }>;
  }>("data/opposition/kim-hammer-election-record-legislative-narratives.json");

  return file.bills.map((bill) => ({
    billNumber: bill.billNumber,
    actNumber: bill.actNumber,
    title: bill.title,
    plainEnglishSummary: bill.plainEnglishSummary,
    billNarrative: bill.billNarrative,
    countyImpactNarrative: bill.countyImpactNarrative,
    debateFrames: bill.debateFrames,
    counterArguments: bill.counterArguments,
    supporterArguments: bill.supporterArguments,
    publicationRisk: bill.publicationRisk,
    strategicBriefing: bill.strategicBriefing,
  }));
}

function buildDebatePrepSections(
  hub: DebateIntelligenceV3Packet["hub"],
  layers: DebateIntelligenceV3Packet["researchLayers"],
  narratives: V3BillNarrative[],
): V3DebatePrepSection[] {
  const lanes = layers.debateProfile.find((s) => s.heading.toLowerCase().includes("high-probability"))?.bullets ?? [];
  const likelyArgs = layers.likelyArguments.flatMap((s) => s.bullets);
  const contrast = layers.contrastVsKelly.flatMap((s) => [...s.paragraphs, ...s.bullets]).slice(0, 8);
  const county = hub.countyOfficialConcerns.length
    ? hub.countyOfficialConcerns
    : sectionBulletsFromMarkdown(DOCS.messageGuidance, "County Official Concerns To Verify");
  const directDemocracy = hub.directDemocracyConcerns.length
    ? hub.directDemocracyConcerns
    : sectionBulletsFromMarkdown(DOCS.messageGuidance, "Direct Democracy Advocate Critiques To Verify");

  const anchorNarratives = narratives.filter((n) =>
    hub.strongestDebateAnchors.some((b) => b.billNumber === n.billNumber),
  );

  return [
    {
      id: "strategy",
      title: "1) Debate strategy overview",
      bullets: [
        "Educate voters on record, county impact, and Secretary of State philosophy.",
        "Rehearse mock debate: opening, direct answers, rebuttal, closing.",
        ...lanes,
      ],
      paragraphs: layers.debateProfile.find((s) => s.heading === "Purpose")?.paragraphs ?? [],
    },
    {
      id: "core-frame",
      title: "2) Candidate core frame",
      bullets: contrast.length
        ? contrast
        : [
            "Rebuild trust through transparency, county support, and participation.",
            "Contrast methods and implementation — not motives without sources.",
          ],
      paragraphs: [],
    },
    {
      id: "pillars",
      title: "3) Three core debate pillars",
      bullets: [
        "Trust and transparency (rules voters can see and verify).",
        "Support counties and election workers (training, funding clarity, SOS guidance).",
        "Protect participation and direct democracy while maintaining integrity.",
      ],
      paragraphs: [],
    },
    {
      id: "likely-hammer",
      title: "4) Likely Hammer arguments + evidence anchors",
      bullets: likelyArgs.length
        ? likelyArgs
        : anchorNarratives.map((n) => `${n.billNumber}: ${n.debateFrames.hammerFrame}`),
      paragraphs: [],
    },
    {
      id: "question-bank",
      title: "5) Bill-to-question bank",
      bullets: hub.topQuestions,
      paragraphs: anchorNarratives.map((n) => `${n.billNumber} — ${n.strategicBriefing.whenToUse}`),
    },
    {
      id: "answer-builder",
      title: "6) Answer builder",
      bullets: [
        "Direct answer first.",
        "Bill/act anchor from Arkleg index.",
        "Values contrast (trust, access, county support).",
        "Voter and county process impact.",
        "Solution path + bridge line.",
      ],
      paragraphs: layers.debateProfile.find((s) => s.heading.includes("Structured response"))?.paragraphs ?? [],
    },
    {
      id: "rebuttal",
      title: "7) Rebuttal builder",
      bullets:
        layers.likelyArguments.find((s) => s.heading.toLowerCase().includes("response"))?.bullets ?? [
          "Acknowledge integrity goal where fair.",
          "Distinguish means and county implementation burden.",
          "Return to trust / transparency / participation frame.",
        ],
      paragraphs: [],
    },
    {
      id: "drill",
      title: "8) Mock debate drill mode",
      bullets: hub.debateDrillQueue.map(
        (card) => `${card.billNumber}: ${card.prompt} · 30s/60s/rebuttal · risk ${card.risk}`,
      ),
      paragraphs: hub.debateDrillQueue.slice(0, 3).map((card) => card.answer60),
    },
    {
      id: "opening",
      title: "9) Opening statement builder",
      bullets: [
        "Office philosophy: service over culture war.",
        "Unity + trust + county support + integrity-through-transparency.",
      ],
      paragraphs: anchorNarratives.slice(0, 2).map((n) => n.strategicBriefing.howToMessage),
    },
    {
      id: "closing",
      title: "10) Closing statement builder",
      bullets: [
        "Voter trust, county support, participation, competence.",
        "Why SOS office matters in daily Arkansas life.",
      ],
      paragraphs: [],
    },
    {
      id: "risk",
      title: "11) Attack / defense risk meter",
      bullets: [
        ...hub.riskClaims,
        ...layers.debateProfile.find((s) => s.heading.includes("Risk"))?.bullets ?? [],
        `${hub.claims.needsResearch.length} claims still need research before public use.`,
      ],
      paragraphs: [],
    },
    {
      id: "reporter",
      title: "12) Reporter question prep",
      bullets: hub.reportQuestions.length ? hub.reportQuestions : hub.topQuestions,
      paragraphs: [],
    },
    {
      id: "county",
      title: "13) County clerk / election worker angle",
      bullets: county,
      paragraphs: anchorNarratives.map((n) => n.countyImpactNarrative).slice(0, 4),
    },
    {
      id: "direct-democracy",
      title: "14) Direct democracy angle",
      bullets: directDemocracy,
      paragraphs: layers.messageGuidance
        .filter((s) => s.heading.toLowerCase().includes("direct") || s.heading.toLowerCase().includes("petition"))
        .flatMap((s) => s.bullets)
        .slice(0, 6),
    },
  ];
}

function buildOpponentModules(layers: DebateIntelligenceV3Packet["researchLayers"]): DebateIntelligenceV3Packet["opponentModules"] {
  const gapCount = layers.intelligenceGaps.flatMap((s) => s.bullets).length;
  return [
    {
      id: "debate-profile",
      title: "Debate profile (KH-2)",
      summary: `${layers.debateProfile.length} sections — argument lanes and response architecture.`,
      href: "/admin/intelligence/kim-hammer/debate-profile",
    },
    {
      id: "likely-args",
      title: "Likely arguments",
      summary: `${layers.likelyArguments.flatMap((s) => s.bullets).length} likely opponent lines — rebuttal map on debate prep.`,
      href: "/admin/intelligence/kim-hammer/debate-prep",
    },
    {
      id: "contrast",
      title: "Contrast vs Kelly",
      summary: "Values-forward contrast frames sourced from opposition research packet.",
      href: "/admin/intelligence/kim-hammer/contrast-vs-kelly",
    },
    {
      id: "themes",
      title: "Election record themes",
      summary: "v4 theme matrix — bill-linked clusters (Netlify-safe JSON load).",
      href: "/admin/intelligence/kim-hammer/themes",
    },
    {
      id: "gaps",
      title: "Intelligence gaps",
      summary: `${gapCount} open retrieval / verification items before export.`,
      href: "/admin/intelligence/kim-hammer/intelligence-gaps",
    },
    {
      id: "kh3",
      title: "KH-3 deep research",
      summary: `${layers.kh3DeepResearch.length} deep-dive sections (writings, capacity, archives).`,
      href: "/admin/intelligence/kim-hammer/background-deep",
    },
  ];
}

export function loadDebateIntelligenceV3Packet(): DebateIntelligenceV3Packet {
  return tryIntelligenceLoad("debate-intelligence-v3", () => {
    const hubSummary = loadKimHammerWorkbenchHubSummary();
    const claimsMd = readText(DOCS.claimsReview);
    const claims = parseClaimsReview(claimsMd);
    const reportQuestions = sectionBulletsFromMarkdown(DOCS.messageGuidance, "Questions Voters/Reporters May Ask");
    const countyOfficialConcerns = sectionBulletsFromMarkdown(DOCS.messageGuidance, "County Official Concerns To Verify");
    const directDemocracyConcerns = sectionBulletsFromMarkdown(
      DOCS.messageGuidance,
      "Direct Democracy Advocate Critiques To Verify",
    );

    const hub = {
      ...hubSummary,
      reportQuestions: reportQuestions.length ? reportQuestions : hubSummary.topQuestions,
      countyOfficialConcerns,
      directDemocracyConcerns,
      claims: {
        supported: claims.filter((c) => c.assessment === "supported"),
        partial: claims.filter((c) => c.assessment === "partially supported"),
        needsResearch: claims.filter((c) => c.assessment === "needs more research"),
      },
    };

    const researchLayers = {
      debateProfile: readMarkdownSections(DOCS.debateProfile),
      likelyArguments: readMarkdownSections(DOCS.likelyArguments),
      contrastVsKelly: readMarkdownSections(DOCS.contrast),
      strengthsWeaknesses: readMarkdownSections(DOCS.strengths),
      messageGuidance: readMarkdownSections(DOCS.messageGuidance),
      intelligenceGaps: readMarkdownSections(DOCS.intelligenceGaps),
      publicDossier: readMarkdownSections(DOCS.dossier).slice(0, 12),
      kh3DeepResearch: readMarkdownSections(DOCS.kh3).slice(0, 10),
      websiteAnalysis: readMarkdownSections(DOCS.website).slice(0, 8),
    };

    const billNarratives = loadBillNarratives();
    const debatePrepSections = buildDebatePrepSections(hub, researchLayers, billNarratives);
    const opponentModules = buildOpponentModules(researchLayers);

    return {
      version: "3.0",
      generatedAt: hubSummary.generatedAt,
      hub,
      researchLayers,
      billNarratives,
      debatePrepSections,
      opponentModules,
    };
  }, emptyV3Packet());
}

export function findV3BillNarrative(
  packet: DebateIntelligenceV3Packet,
  billNumber: string,
): V3BillNarrative | undefined {
  return packet.billNarratives.find(
    (row) => row.billNumber.toUpperCase() === billNumber.toUpperCase(),
  );
}

export function findV3BillRow(packet: DebateIntelligenceV3Packet, billNumber: string): HammerBillRow | undefined {
  return packet.hub.strongestDebateAnchors.find(
    (row) => row.billNumber.toUpperCase() === billNumber.toUpperCase(),
  );
}

function emptyV3Packet(): DebateIntelligenceV3Packet {
  return {
    version: "3.0",
    generatedAt: new Date().toISOString(),
    hub: {
      totalBills: 0,
      enactedActs: 0,
      researchConfidenceScore: 0,
      topQuestions: [],
      debateDrillQueue: [],
      riskClaims: ["Opposition JSON not loaded — check Netlify included_files"],
      strongestDebateAnchors: [],
      highConfidenceThemes: [],
      topContrastThemes: [],
      recommendedNextPass: ["Redeploy with data/opposition bundled"],
      reportQuestions: [],
      countyOfficialConcerns: [],
      directDemocracyConcerns: [],
      claims: { supported: [], partial: [], needsResearch: [] },
    },
    researchLayers: {
      debateProfile: [],
      likelyArguments: [],
      contrastVsKelly: [],
      strengthsWeaknesses: [],
      messageGuidance: [],
      intelligenceGaps: [],
      publicDossier: [],
      kh3DeepResearch: [],
      websiteAnalysis: [],
    },
    billNarratives: [],
    debatePrepSections: [],
    opponentModules: [],
  };
}
