import fs from "node:fs";
import path from "node:path";
import { computeOppositionBriefConfidence } from "@/lib/opposition/oppositionBriefConfidence";
import { getCachedDebatePacket } from "@/lib/intelligence/debateIntelligencePacketCache";
import {
  loadDebateIntelligenceV3Packet,
  type DebateIntelligenceV3Profile,
} from "@/lib/intelligence/v3/debateIntelligenceV3";
import type { V3DebatePrepSection } from "@/lib/intelligence/v3/debateIntelligenceV3Types";
import { tryIntelligenceLoad } from "@/lib/intelligence/safeIntelligenceLoad";
import type { DebateIntelligenceV3Packet } from "@/lib/intelligence/v3/debateIntelligenceV3Types";
import type {
  DebateIntelligenceV4Packet,
  V4ExecutiveBrief,
  V4IntegrityPackage,
  V4ReadinessDimension,
  V4RehearsalCard,
  V4ThemeRow,
} from "@/lib/intelligence/v4/debateIntelligenceV4Types";

const ROOT = process.cwd();

function readJson<T>(relPath: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), "utf8")) as T;
}

function themeLabel(theme: string): string {
  return theme.replaceAll("_", " ");
}

function loadThemeMatrix(): V4ThemeRow[] {
  const file = readJson<{ themes: Record<string, string[]> }>(
    "data/opposition/kim-hammer-election-record-theme-matrix.json",
  );
  return Object.entries(file.themes)
    .map(([theme, bills]) => ({
      theme,
      label: themeLabel(theme),
      billCount: bills.length,
      bills,
    }))
    .filter((row) => row.billCount > 0)
    .sort((a, b) => b.billCount - a.billCount);
}

function loadTimeline() {
  const file = readJson<{
    rows: Array<{
      year: string;
      billOrAct: string;
      whatChanged: string;
      hammerRole: string;
      impactCategory: string[];
      sourceConfidence: string;
    }>;
  }>("data/opposition/kim-hammer-election-record-timeline.json");
  return file.rows.map((row) => ({
    year: row.year,
    billOrAct: row.billOrAct,
    whatChanged: row.whatChanged,
    hammerRole: row.hammerRole,
    impactCategories: row.impactCategory,
    sourceConfidence: row.sourceConfidence,
  }));
}

function loadIntegrity2021(): V4IntegrityPackage | null {
  try {
    const pkg = readJson<{
      packageId: string;
      sessionYear: string;
      billNumbers: string[];
      plainEnglishSummary: string;
      narrativeArc: string[];
      strategicBriefing: V4IntegrityPackage["strategicBriefing"];
    }>("data/opposition/kim-hammer-profile/kim-hammer-kh0b-2021-integrity-foundation.json");
    return {
      packageId: pkg.packageId,
      sessionYear: pkg.sessionYear,
      billNumbers: pkg.billNumbers,
      plainEnglishSummary: pkg.plainEnglishSummary,
      narrativeArc: pkg.narrativeArc,
      strategicBriefing: pkg.strategicBriefing,
    };
  } catch {
    return null;
  }
}

function loadArchiveConfidence(hub: DebateIntelligenceV4Packet["hub"]): { score: number; basis: string } {
  let sources = 0;
  let clips = 0;
  let writings = 0;
  let tasksTotal = 0;
  let tasksComplete = 0;
  let tasksPartial = 0;
  try {
    const sourceFile = readJson<{ records?: unknown[] }>(
      "data/opposition/kim-hammer-profile/opposition-source-records.json",
    );
    sources = sourceFile.records?.length ?? 0;
  } catch {
    /* optional */
  }
  let quotes = 0;
  let usableQuotes = 0;
  try {
    const clipFile = readJson<{ records?: unknown[] }>(
      "data/opposition/kim-hammer-profile/opposition-clip-records.json",
    );
    clips = clipFile.records?.length ?? 0;
  } catch {
    /* optional */
  }
  try {
    const quoteFile = readJson<{
      records?: Array<{ usableForDebate?: boolean; usableForRapidResponse?: boolean }>;
    }>("data/opposition/kim-hammer-profile/opposition-quote-records.json");
    quotes = quoteFile.records?.length ?? 0;
    usableQuotes =
      quoteFile.records?.filter((r) => r.usableForDebate || r.usableForRapidResponse).length ?? 0;
  } catch {
    /* optional */
  }
  try {
    const writingFile = readJson<{ writings?: unknown[] }>(
      "data/opposition/kim-hammer-profile/kim-hammer-authored-writings.json",
    );
    writings = writingFile.writings?.length ?? 0;
  } catch {
    /* optional */
  }
  try {
    const taskFile = readJson<{
      tasks: Array<{ closureStatus?: string }>;
    }>("data/opposition/kim-hammer-profile/opposition-retrieval-tasks.json");
    tasksTotal = taskFile.tasks.length;
    tasksComplete = taskFile.tasks.filter((t) => t.closureStatus === "COMPLETE").length;
    tasksPartial = taskFile.tasks.filter((t) => t.closureStatus === "PARTIAL").length;
  } catch {
    /* optional */
  }

  return computeOppositionBriefConfidence({
    sourceCount: sources,
    directQuoteCount: quotes,
    usableQuoteCount: usableQuotes,
    directClipCount: clips,
    authoredWritingCount: writings,
    billRecordCount: hub.totalBills,
    retrievalTasksTotal: tasksTotal,
    retrievalTasksComplete: tasksComplete,
    retrievalTasksPartial: tasksPartial,
    claimLedgerLinkedCount: hub.claims.supported.length,
    citationSourceCount: 0,
    citationAnchorCount: 0,
    exportReadyClaims: hub.claims.supported.length,
    blockedClaims: 0,
    unsupportedClaimCount: 0,
    openGapCount: hub.claims.needsResearch.length,
  });
}

function buildExecutiveBrief(
  v3Base: ReturnType<typeof loadDebateIntelligenceV3Packet>,
  themeMatrix: V4ThemeRow[],
  archive: { score: number; basis: string },
): V4ExecutiveBrief {
  const topTheme = themeMatrix[0];
  const topDrill = v3Base.hub.debateDrillQueue[0];
  return {
    headline: "Debate week — record, county burden, and trust frame",
    tonightFocus: [
      topTheme
        ? `Lead with ${topTheme.label} (${topTheme.billCount} bills) — tie to verified acts, not motive claims.`
        : "Lead with verified election-law acts from the index.",
      topDrill
        ? `Rehearse ${topDrill.billNumber}: ${topDrill.prompt}`
        : "Rehearse top three drill cards with 30s direct answer first.",
      `${v3Base.hub.claims.needsResearch.length} claims still need research — do not export to public without review.`,
    ],
    threeMoves: [
      "Acknowledge integrity goal where fair; contrast means and county implementation.",
      "Anchor answers with bill/act numbers from Arkleg index.",
      "Close on SOS-as-service: counties, transparency, lawful participation.",
    ],
    confidenceLabel:
      archive.score >= 75 ? "Archive-strong internal draft" : archive.score >= 60 ? "Usable with verification gaps" : "Rehearsal-only until gaps close",
    archiveConfidenceScore: archive.score,
    archiveConfidenceBasis: archive.basis,
  };
}

function buildReadinessScorecard(
  v3Base: ReturnType<typeof loadDebateIntelligenceV3Packet>,
  archiveScore: number,
): V4ReadinessDimension[] {
  const narrativeCoverage = Math.min(
    100,
    Math.round((v3Base.billNarratives.length / Math.max(v3Base.hub.totalBills, 1)) * 100),
  );
  const claimsReady = Math.max(
    0,
    Math.round(
      (v3Base.hub.claims.supported.length /
        Math.max(1, v3Base.hub.claims.supported.length + v3Base.hub.claims.needsResearch.length)) *
        100,
    ),
  );
  const prepDepth = Math.min(100, Math.round((v3Base.debatePrepSections.length / 14) * 50 + 50));
  return [
    { id: "record", label: "Legislative record index", score: Math.min(100, v3Base.hub.totalBills * 3), note: `${v3Base.hub.totalBills} bills · ${v3Base.hub.enactedActs} enacted acts` },
    { id: "narratives", label: "KH-0B narrative cards", score: narrativeCoverage, note: `${v3Base.billNarratives.length} deep narrative cards loaded` },
    { id: "claims", label: "Claims publication safety", score: claimsReady, note: `${v3Base.hub.claims.supported.length} supported · ${v3Base.hub.claims.needsResearch.length} need research` },
    { id: "archive", label: "Opposition archive confidence", score: archiveScore, note: "Archive JSON rollup (not hardcoded)" },
    { id: "prep", label: "Debate prep section depth", score: prepDepth, note: "v3 base + v4 extension sections" },
  ];
}

function buildRehearsalDeck(v3Base: ReturnType<typeof loadDebateIntelligenceV3Packet>): V4RehearsalCard[] {
  return v3Base.hub.debateDrillQueue.map((card) => ({
    ...card,
    answer30: card.answer30 || card.answer60?.slice(0, 280) || card.prompt,
    answer60: card.answer60 || card.prompt,
    rebuttalHint: card.rebuttalPivot || card.bridgeLine,
  }));
}

function buildV4DebatePrepSections(
  v3Base: ReturnType<typeof loadDebateIntelligenceV3Packet>,
  v4: Omit<DebateIntelligenceV4Packet, "debatePrepSectionsV4" | "version">,
): V3DebatePrepSection[] {
  const base = v3Base.debatePrepSections;
  const extension: V3DebatePrepSection[] = [
    {
      id: "executive-tonight",
      title: "15) Executive tonight focus",
      bullets: v4.executiveBrief.tonightFocus,
      paragraphs: [v4.executiveBrief.headline],
    },
    {
      id: "argument-map",
      title: "16) Structured argument / rebuttal map",
      bullets: v4.likelyArguments.map(
        (a) => `${a.id}: ${a.argument} · cites: ${a.evidenceHeMayCite.slice(0, 2).join("; ")}`,
      ),
      paragraphs: v4.rebuttalPlaybook.slice(0, 6).map(
        (r) => `[${r.prompt}] Agree: ${r.agreeWhereValid} · Contrast: ${r.contrastMethod} · Bridge: ${r.kellyBridge}`,
      ),
    },
    {
      id: "strengths-ack",
      title: "17) Opponent strengths to acknowledge fairly",
      bullets: v4.strengths.map((s) => `${s.label} (${s.evidenceStatus})`),
      paragraphs: [],
    },
    {
      id: "vulnerabilities",
      title: "18) Debate-safe vulnerability framing",
      bullets: v4.weaknesses.map((w) => w.saferWording ?? w.label),
      paragraphs: v4.weaknesses.map((w) => `Usefulness: ${w.debateUsefulness ?? "MEDIUM"} · confidence ${w.sourceConfidence}`),
    },
    {
      id: "integrity-2021",
      title: "19) 2021 integrity foundation package",
      bullets: v4.integrity2021?.narrativeArc ?? ["2021 six-bill package JSON not loaded"],
      paragraphs: v4.integrity2021
        ? [v4.integrity2021.plainEnglishSummary, `Bills: ${v4.integrity2021.billNumbers.join(", ")}`]
        : [],
    },
    {
      id: "timeline",
      title: "20) Legislative timeline highlights",
      bullets: v4.timeline.slice(0, 12).map((t) => `${t.year} · ${t.billOrAct} (${t.hammerRole}): ${t.whatChanged.slice(0, 120)}…`),
      paragraphs: [],
    },
    {
      id: "theme-matrix",
      title: "21) Theme matrix drill-down",
      bullets: v4.themeMatrix.slice(0, 10).map((t) => `${t.label}: ${t.bills.join(", ")}`),
      paragraphs: [],
    },
    {
      id: "rapid-response",
      title: "22) Rapid response evidence locker",
      bullets: v4.rapidResponseAssets.map((a) => `${a.category}: ${a.asset} (${a.verificationStatus})`),
      paragraphs: [],
    },
    {
      id: "retrieval-queue",
      title: "23) Staff retrieval queue (do not read aloud)",
      bullets: v4.retrievalQueue.map((t) => `[${t.priority}] ${t.description} — ${t.taskStatus}`),
      paragraphs: v4.retrievalQueue.map((t) => t.recommendedHumanAction),
    },
    {
      id: "citation-discipline",
      title: "24) Evidence citation discipline",
      bullets: [
        "Bill/act numbers must match Arkleg index before public use.",
        "Tag quotes VERIFIED_FACT vs INTERPRETATION vs NEEDS_REVIEW.",
        "No stolen-election or fraud-without-evidence framing.",
        `${v3Base.hub.claims.needsResearch.length} markdown claims still need research.`,
      ],
      paragraphs: [],
    },
    {
      id: "media-followup",
      title: "25) Post-debate media follow-up",
      bullets: v3Base.hub.reportQuestions.slice(0, 8),
      paragraphs: v3Base.researchLayers.messageGuidance
        .find((s) => s.heading.toLowerCase().includes("reporter"))
        ?.bullets?.slice(0, 4) ?? [],
    },
    {
      id: "county-deep",
      title: "26) County burden deep dive",
      bullets: v3Base.hub.countyOfficialConcerns,
      paragraphs: v3Base.billNarratives.slice(0, 4).map((n) => `${n.billNumber}: ${n.countyImpactNarrative}`),
    },
    {
      id: "petition-cluster",
      title: "27) Petition / direct democracy cluster",
      bullets:
        v4.themeMatrix
          .find((t) => t.theme.includes("direct_democracy") || t.theme.includes("petition"))
          ?.bills.map((b) => `${b} — verify act text before citing`) ?? v3Base.hub.directDemocracyConcerns,
      paragraphs: v3Base.hub.directDemocracyConcerns,
    },
    {
      id: "closing-checklist",
      title: "28) Closing checklist (mental print)",
      bullets: [
        "Direct answer → act anchor → values contrast → county impact → bridge.",
        "Three pillars: trust/transparency, county support, participation + integrity.",
        "Do-not-say list reviewed.",
        "Know which claims are NOT_READY for export.",
      ],
      paragraphs: v4.executiveBrief.threeMoves,
    },
  ];
  return [...base, ...extension];
}

/** full = all markdown + v4 JSON; hub = core markdown + v4 JSON; surface = JSON hub + theme/timeline only. */
export type DebateIntelligenceV4Profile = DebateIntelligenceV3Profile;

function loadV4JsonExtensions(): Pick<
  DebateIntelligenceV4Packet,
  | "likelyArguments"
  | "rebuttalPlaybook"
  | "strengths"
  | "weaknesses"
  | "retrievalQueue"
  | "intelligenceGaps"
  | "rapidResponseAssets"
> {
  const likelyArguments = readJson<{ arguments: DebateIntelligenceV4Packet["likelyArguments"] }>(
    "data/opposition/kim-hammer-profile/kim-hammer-likely-arguments.json",
  ).arguments;

  const rebuttalPlaybook = readJson<{ rebuttals: DebateIntelligenceV4Packet["rebuttalPlaybook"] }>(
    "data/opposition/kim-hammer-profile/kim-hammer-rebuttal-prep.json",
  ).rebuttals;

  const strengths = readJson<{ strengths: Array<{ id: string; strength: string; evidenceStatus: string; sourceConfidence: string; sources: string[] }> }>(
    "data/opposition/kim-hammer-profile/kim-hammer-strengths-matrix.json",
  ).strengths.map((s) => ({
    id: s.id,
    label: s.strength,
    evidenceStatus: s.evidenceStatus,
    sourceConfidence: s.sourceConfidence,
    sources: s.sources,
  }));

  const weaknesses = readJson<{
    weaknesses: Array<{
      id: string;
      weakness: string;
      evidenceStatus: string;
      sourceConfidence: string;
      debateUsefulness?: string;
      saferWording?: string;
      sources: string[];
    }>;
  }>("data/opposition/kim-hammer-profile/kim-hammer-vulnerability-matrix.json").weaknesses.map((w) => ({
    id: w.id,
    label: w.weakness,
    evidenceStatus: w.evidenceStatus,
    sourceConfidence: w.sourceConfidence,
    debateUsefulness: w.debateUsefulness,
    saferWording: w.saferWording,
    sources: w.sources,
  }));

  const retrievalQueue = readJson<{
    tasks: Array<{
      id: string;
      priority: string;
      description: string;
      taskStatus: string;
      closureStatus: string;
      recommendedHumanAction: string;
    }>;
  }>("data/opposition/kim-hammer-profile/opposition-retrieval-tasks.json")
    .tasks.slice(0, 8)
    .map((t) => ({
      id: t.id,
      priority: t.priority,
      description: t.description,
      taskStatus: t.taskStatus,
      closureStatus: t.closureStatus,
      recommendedHumanAction: t.recommendedHumanAction,
    }));

  const intelligenceGaps = readJson<{
    gaps: Array<{ id: string; priority: string; description: string; externalMessageReadiness: string }>;
  }>("data/opposition/kim-hammer-profile/kim-hammer-intelligence-gaps.json").gaps.slice(0, 10);

  const rapidResponseAssets = readJson<{
    evidenceLocker: Array<{ id: string; category: string; asset: string; verificationStatus: string }>;
  }>("data/opposition/kim-hammer-profile/kim-hammer-kh3-rapid-response-appendix.json").evidenceLocker;

  return {
    likelyArguments,
    rebuttalPlaybook,
    strengths,
    weaknesses,
    retrievalQueue,
    intelligenceGaps,
    rapidResponseAssets,
  };
}

function emptyV4JsonExtensions(): ReturnType<typeof loadV4JsonExtensions> {
  return {
    likelyArguments: [],
    rebuttalPlaybook: [],
    strengths: [],
    weaknesses: [],
    retrievalQueue: [],
    intelligenceGaps: [],
    rapidResponseAssets: [],
  };
}

function buildV4Packet(profile: DebateIntelligenceV4Profile): DebateIntelligenceV4Packet {
  const v3Profile: DebateIntelligenceV3Profile = profile;
  const v3 = loadDebateIntelligenceV3Packet(v3Profile);
  const themeMatrix = loadThemeMatrix();
  const timeline = loadTimeline();
  const integrity2021 = profile === "surface" ? null : loadIntegrity2021();
  const archive = loadArchiveConfidence(v3.hub);
  const json =
    profile === "surface" ? emptyV4JsonExtensions() : loadV4JsonExtensions();

  const executiveBrief = buildExecutiveBrief(v3, themeMatrix, archive);
  const readinessScorecard = buildReadinessScorecard(v3, archive.score);
  const rehearsalDeck = profile === "surface" ? [] : buildRehearsalDeck(v3);

  const core: Omit<DebateIntelligenceV4Packet, "debatePrepSectionsV4"> = {
    ...v3,
    version: "4.0",
    executiveBrief,
    readinessScorecard,
    themeMatrix,
    timeline,
    integrity2021,
    retrievalQueue: json.retrievalQueue,
    intelligenceGaps: json.intelligenceGaps,
    rapidResponseAssets: json.rapidResponseAssets,
    likelyArguments: json.likelyArguments,
    rebuttalPlaybook: json.rebuttalPlaybook,
    strengths: json.strengths,
    weaknesses: json.weaknesses,
    rehearsalDeck,
  };

  return {
    ...core,
    debatePrepSectionsV4:
      profile === "surface" ? [] : buildV4DebatePrepSections(v3, core),
  };
}

function emptyV4Extension(v3: DebateIntelligenceV3Packet): DebateIntelligenceV4Packet {
  const archive = { score: 0, basis: "not loaded" };
  const partial = {
    ...v3,
    version: "4.0" as const,
    executiveBrief: {
      headline: "v4 extension unavailable",
      tonightFocus: ["Check data/opposition on deploy"],
      threeMoves: [],
      confidenceLabel: "offline",
      archiveConfidenceScore: 0,
      archiveConfidenceBasis: archive.basis,
    },
    readinessScorecard: [],
    themeMatrix: [],
    timeline: [],
    likelyArguments: [],
    rebuttalPlaybook: [],
    strengths: [],
    weaknesses: [],
    integrity2021: null,
    retrievalQueue: [],
    intelligenceGaps: [],
    rapidResponseAssets: [],
    rehearsalDeck: [],
    debatePrepSectionsV4: v3.debatePrepSections,
  };
  return partial;
}

export function loadDebateIntelligenceV4Packet(
  profile: DebateIntelligenceV4Profile = "full",
): DebateIntelligenceV4Packet {
  return getCachedDebatePacket(`v4:${profile}`, () =>
    tryIntelligenceLoad(
      `debate-intelligence-v4:${profile}`,
      () => buildV4Packet(profile),
      emptyV4Extension(emptyV3PacketForV4Fallback()),
    ),
  );
}

/** Hub, debate prep index, claims — skips dossier/KH-3/website markdown. */
export function loadDebateIntelligenceV4HubPacket(): DebateIntelligenceV4Packet {
  return loadDebateIntelligenceV4Packet("hub");
}

/** Themes/timeline — JSON only, no markdown parse. */
export function loadDebateIntelligenceV4SurfacePacket(): DebateIntelligenceV4Packet {
  return loadDebateIntelligenceV4Packet("surface");
}

function emptyV3PacketForV4Fallback(): DebateIntelligenceV3Packet {
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

export function findV4BillNarrative(packet: DebateIntelligenceV4Packet, billNumber: string) {
  return packet.billNarratives.find((row) => row.billNumber.toUpperCase() === billNumber.toUpperCase());
}

export function findV4TimelineForBill(packet: DebateIntelligenceV4Packet, billNumber: string) {
  const upper = billNumber.toUpperCase();
  return packet.timeline.filter((row) => row.billOrAct.toUpperCase().includes(upper.replace(/[^A-Z0-9]/g, "")));
}

export function isInIntegrity2021(packet: DebateIntelligenceV4Packet, billNumber: string): boolean {
  return packet.integrity2021?.billNumbers.some((b) => b.toUpperCase() === billNumber.toUpperCase()) ?? false;
}
