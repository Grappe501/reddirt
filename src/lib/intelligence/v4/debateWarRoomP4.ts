import "server-only";

import fs from "node:fs";
import path from "node:path";
import type { DebateFilmRoomState, FilmRoomItem } from "@/lib/opposition/debateFilmRoomTypes";
import { loadDebateIntelligenceV4HubPacket } from "@/lib/intelligence/v4/debateIntelligenceV4";
import type { DebateIntelligenceV4Packet } from "@/lib/intelligence/v4/debateIntelligenceV4Types";
import { computeLiveReadinessScores } from "@/lib/intelligence/v4/liveReadinessScores";
import { OPPONENT_TRAP_LANES } from "@/lib/intelligence/v4/kellyOpponentContrastPlaybook";
import { tryIntelligenceLoad } from "@/lib/intelligence/safeIntelligenceLoad";
import { loadTranscriptChunks } from "@/lib/legislature/legislativeClaimIngest";
import { buildLegislativeVideoIntelligenceRollup } from "@/lib/legislature/legislativeVideoIntelligenceRollup";
import { enrichFilmRoomWithMediaCatalog } from "@/lib/intelligence/v4/debateFilmRoomEnrichment";

const ROOT = process.cwd();

export type {
  ArgumentLibraryRow,
  CrossExamRow,
  DebateWarRoomP4Packet,
} from "@/lib/intelligence/v4/debateWarRoomP4Types";
import type {
  ArgumentLibraryRow,
  CrossExamRow,
  DebateWarRoomP4Packet,
} from "@/lib/intelligence/v4/debateWarRoomP4Types";

function readJson<T>(rel: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8")) as T;
}

/** Netlify-safe film room — opposition clip/quote JSON + optional legislative chunks (no KH-3 workbench). */
export function buildLaunchFilmRoomState(): DebateFilmRoomState {
  const items: FilmRoomItem[] = [];
  let directClipCount = 0;
  let referenceClipCount = 0;

  try {
    const clips = readJson<{
      records: Array<{
        id: string;
        title: string;
        url: string;
        clipType: string;
        retrievalNeeded?: boolean;
      }>;
    }>("data/opposition/kim-hammer-profile/opposition-clip-records.json");

    for (const clip of clips.records) {
      const isDirect = clip.clipType === "DIRECT_OPPONENT";
      if (isDirect) directClipCount += 1;
      else referenceClipCount += 1;
      items.push({
        id: clip.id,
        title: clip.title,
        dateOrSource: clip.url,
        topic: clip.clipType.replace(/_/g, " "),
        opponentClaimOrAngle: isDirect
          ? "Media/runoff clip — verify exact quotes before debate; not formal debate archive"
          : "Reference SOS debate format — do not attribute lines to Hammer",
        vulnerability: clip.retrievalNeeded
          ? "Retrieval still open — staff must pull timestamped quote"
          : isDirect
            ? "Edited news package risk"
            : "Prior-cycle SOS debate — reference only",
        recommendedCounter: isDirect
          ? "Acknowledge integrity framing → pivot to county implementation + verified acts"
          : "Practice format/timing only; use Kelly pillars from debate prep",
        confidence: clip.retrievalNeeded ? "LOW" : isDirect ? "MEDIUM" : "LOW",
        researchGaps: clip.retrievalNeeded ? ["Complete retrieval task with citation anchor"] : [],
        drillPrompt: isDirect
          ? `Watch → one claim → 30s response with act anchor (claims gate)`
          : `Shadow-answer one SOS question using rehearsal deck`,
        assetType: clip.clipType,
        url: clip.url,
        isDirectOpponentClip: isDirect,
        governanceLabel: isDirect ? "INTERNAL_DRAFT" : "REFERENCE_ONLY",
      });
    }
  } catch {
    /* optional */
  }

  try {
    const quotes = readJson<{
      records: Array<{
        id: string;
        quoteText: string;
        sourceUrlOrPath: string;
        usableForDebate?: boolean;
        publicUseRisk?: string;
      }>;
    }>("data/opposition/kim-hammer-profile/opposition-quote-records.json");

    for (const q of quotes.records.slice(0, 8)) {
      items.push({
        id: q.id,
        title: "Quote card (review before use)",
        dateOrSource: q.sourceUrlOrPath,
        topic: "Normalized quote record",
        opponentClaimOrAngle: q.quoteText,
        vulnerability:
          q.usableForDebate === false
            ? "NOT verified for debate — paraphrase or needs verbatim pull"
            : "Human review required before on-stage citation",
        recommendedCounter: "Use only if claims ledger + citation anchor approve",
        confidence: q.usableForDebate ? "MEDIUM" : "LOW",
        researchGaps: q.usableForDebate === false ? ["Verbatim quote retrieval"] : [],
        drillPrompt: "Staff: pull verbatim quote → bind citation → rehearse 30s",
        assetType: "QUOTE_RECORD",
        url: q.sourceUrlOrPath.startsWith("http") ? q.sourceUrlOrPath : null,
        isDirectOpponentClip: false,
        governanceLabel: "INTERNAL_DRAFT",
        needsVerification: true,
      });
    }
  } catch {
    /* optional */
  }

  const legChunks = tryIntelligenceLoad("p4-transcript-chunks", () => loadTranscriptChunks(), []);
  const topHammerCommitteeQuotes: string[] = [];
  const speakerVerificationWarnings: string[] = [];
  for (const chunk of legChunks.slice(0, 10)) {
    if (chunk.quoteCandidates[0]) topHammerCommitteeQuotes.push(chunk.quoteCandidates[0].slice(0, 120));
    if (chunk.speakerAttributionStatus !== "SPEAKER_CONFIRMED") {
      speakerVerificationWarnings.push(`${chunk.billNumber} ${chunk.startTime}: verify speaker`);
    }
    items.push({
      id: chunk.id,
      title: `${chunk.billNumber} committee segment`,
      dateOrSource: chunk.meetingDate,
      topic: chunk.chunkType.replace(/_/g, " "),
      opponentClaimOrAngle: chunk.summary.slice(0, 160),
      vulnerability:
        chunk.speakerAttributionStatus === "SPEAKER_CONFIRMED"
          ? "ASR/transcript needs human review"
          : "Do not attribute to Hammer without verification",
      recommendedCounter: `Bill drill-down + timestamp ${chunk.startTime} — claims gate`,
      confidence: chunk.speakerAttributionStatus === "SPEAKER_CONFIRMED" ? "MEDIUM" : "LOW",
      researchGaps: ["Human transcript review"],
      drillPrompt: `Film drill: ${chunk.billNumber} @ ${chunk.startTime}`,
      assetType: "LEGISLATIVE_COMMITTEE_VIDEO",
      url: chunk.videoUrl,
      isDirectOpponentClip: chunk.speakerAttributionStatus === "SPEAKER_CONFIRMED",
      governanceLabel: "INTERNAL_DRAFT",
      legislativeChunkId: chunk.id,
      timestampRange: `${chunk.startTime}–${chunk.endTime}`,
      speakerAttributionStatus: chunk.speakerAttributionStatus,
      needsVerification: chunk.speakerAttributionStatus !== "SPEAKER_CONFIRMED",
    });
  }

  const legislativeClipCount = legChunks.filter((c) => c.videoUrl).length;
  const coverageGaps = [
    directClipCount < 2 ? "Only one direct opponent media clip — formal debate archive thin" : "",
    legChunks.length === 0 ? "No legislative transcript chunks indexed — enable pipeline off-peak" : "",
    "Forum/local recordings not indexed",
    "Most quote records need verbatim verification",
  ].filter(Boolean);

  return {
    generatedAt: new Date().toISOString(),
    directClipCount,
    referenceClipCount,
    legislativeClipCount,
    items,
    coverageGaps,
    archiveHonestyNote:
      directClipCount <= 1 && legChunks.length === 0
        ? `P4 HONEST STATUS: ${directClipCount} direct clip(s), ${legChunks.length} legislative chunks — do not imply video proof on stage without clip ID.`
        : `P4: ${directClipCount} media + ${legChunks.length} legislative chunks — human review before any public clip use.`,
    topHammerCommitteeQuotes: topHammerCommitteeQuotes.slice(0, 5),
    billsWithTranscriptCoverage: [...new Set(legChunks.map((c) => c.billNumber))],
    speakerVerificationWarnings: speakerVerificationWarnings.slice(0, 8),
  };
}

export function buildCrossExamBank(v4: DebateIntelligenceV4Packet): CrossExamRow[] {
  const rows: CrossExamRow[] = [];
  let n = 0;

  for (const q of v4.hub.reportQuestions) {
    n += 1;
    rows.push({
      id: `reporter-${n}`,
      question: q,
      billAnchor: null,
      whenToAsk: "Press gaggle, debate Q&A, or when Hammer generalizes",
      whatYouLearn: "Whether he can move from slogan to county-level implementation detail",
      kellyPivot: "Direct answer → SOS service plan → one verified act if available",
      socialPostAngle: "Short clip: ‘Here's the question voters deserve answered.’",
      risk: "MEDIUM",
    });
  }

  for (const bill of v4.hub.strongestDebateAnchors.slice(0, 5)) {
    n += 1;
    rows.push({
      id: `bill-${bill.billNumber}`,
      question: `What did ${bill.billNumber}${bill.actNumber ? ` (Act ${bill.actNumber})` : ""} change for county clerks in the first election after passage?`,
      billAnchor: bill.billNumber,
      whenToAsk: "When he cites this bill as proof of competence",
      whatYouLearn: "Implementation knowledge vs authorship-only framing",
      kellyPivot: "County burden + funding/partnership contrast",
      socialPostAngle: `Thread: What ${bill.billNumber} meant for your county clerk.`,
      risk: bill.actNumber ? "MEDIUM" : "HIGH",
    });
  }

  for (const trap of OPPONENT_TRAP_LANES.slice(0, 4)) {
    n += 1;
    rows.push({
      id: `trap-${n}`,
      question: trap.moderatorOrKellySetupQuestion,
      billAnchor: null,
      whenToAsk: `When you hear: “${trap.baitLineYouWantFromOpponent.slice(0, 60)}…”`,
      whatYouLearn: "Whether he stays in slogans or reveals gaps",
      kellyPivot: trap.kellyPivotWhenHeBites,
      socialPostAngle: "Post-debate: contrast methods, not motives",
      risk: "LOW",
    });
  }

  return rows;
}

export function buildArgumentLibrary(v4: DebateIntelligenceV4Packet): ArgumentLibraryRow[] {
  return v4.likelyArguments.map((arg) => {
    const rebuttal = v4.rebuttalPlaybook.find((r) =>
      r.prompt.toLowerCase().includes(arg.id.replace("kh-arg-", "").slice(0, 8)),
    ) ?? v4.rebuttalPlaybook[0];
    const billHint = arg.evidenceHeMayCite.find((e) => /^[A-Z]{2}\d+/.test(e)) ?? null;
    return {
      id: arg.id,
      hammerLine: arg.argument,
      evidenceHeMayCite: arg.evidenceHeMayCite,
      agreeWhereValid: rebuttal?.agreeWhereValid ?? "Acknowledge integrity goal where fair",
      contrastPivot: rebuttal?.contrastMethod ?? "Contrast implementation and county burden",
      kellyBridge: rebuttal?.kellyBridge ?? "Bridge to SOS-as-service",
      billDrillHref: billHint
        ? `/admin/intelligence/kim-hammer/bills/${encodeURIComponent(billHint)}`
        : null,
      debateStep: "Agree → contrast → act anchor → county impact → bridge (under 60s)",
      socialSnippet: `He may say: “${arg.argument.slice(0, 80)}…” — our frame: ${rebuttal?.kellyBridge?.slice(0, 100) ?? "county partnership"}`,
    };
  });
}


export function loadDebateWarRoomP4Packet(): DebateWarRoomP4Packet {
  return tryIntelligenceLoad("debate-war-room-p4", () => {
    const v4 = loadDebateIntelligenceV4HubPacket();
    const filmRoom = enrichFilmRoomWithMediaCatalog(buildLaunchFilmRoomState());
    const crossExamBank = buildCrossExamBank(v4);
    const argumentLibrary = buildArgumentLibrary(v4);
    const readinessScores = computeLiveReadinessScores({ v4, filmRoom });
    const legislative = tryIntelligenceLoad(
      "p4-legislative-rollup",
      () => buildLegislativeVideoIntelligenceRollup(),
      null,
    );

    const todayPriorities = [
      {
        title: "Film room status",
        value: `${filmRoom.directClipCount} direct · ${filmRoom.legislativeClipCount} legislative`,
        detail: filmRoom.archiveHonestyNote,
      },
      {
        title: "Cross-exam bank",
        value: `${crossExamBank.length} questions`,
        detail: "Use to walk opponent into implementation gaps — not personal attacks",
      },
      {
        title: "Claims to verify",
        value: `${v4.hub.claims.needsResearch.length} need research`,
        detail: v4.hub.riskClaims[0] ?? "Review claims ledger",
      },
      {
        title: "Prep sections",
        value: `${v4.debatePrepSectionsV4.length} sections`,
        detail: v4.executiveBrief.tonightFocus[0] ?? "Open executive brief",
      },
    ];

    return {
      version: "4.0-p4",
      generatedAt: new Date().toISOString(),
      filmRoom,
      crossExamBank,
      argumentLibrary,
      readinessScores,
      todayPriorities,
      scenarioTraps: OPPONENT_TRAP_LANES.map((t) => t.name),
      whatNotToSay: [
        ...v4.hub.riskClaims.slice(0, 5),
        "Fraud without sourced proof",
        "Stolen election framing",
      ],
      archiveHonesty: filmRoom.archiveHonestyNote,
      legislativeNote: legislative?.automationNote ?? "Legislative rollup not loaded — JSON-only film room",
    };
  }, {
    version: "4.0-p4",
    generatedAt: new Date().toISOString(),
    filmRoom: buildLaunchFilmRoomState(),
    crossExamBank: [],
    argumentLibrary: [],
    readinessScores: [],
    todayPriorities: [],
    scenarioTraps: [],
    whatNotToSay: ["P4 packet fallback"],
    archiveHonesty: "P4 fallback",
    legislativeNote: "",
  });
}
