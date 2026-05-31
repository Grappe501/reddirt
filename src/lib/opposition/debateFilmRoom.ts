import { loadKimHammerKh3Workbench } from "@/lib/opposition/kimHammerKh3Workbench";
import { loadTranscriptChunks } from "@/lib/legislature/legislativeClaimIngest";

export type FilmRoomItem = {
  id: string;
  title: string;
  dateOrSource: string;
  topic: string;
  opponentClaimOrAngle: string;
  vulnerability: string;
  recommendedCounter: string;
  confidence: "LOW" | "MEDIUM" | "HIGH";
  researchGaps: string[];
  drillPrompt: string;
  assetType: string;
  url: string | null;
  isDirectOpponentClip: boolean;
  governanceLabel: "INTERNAL_DRAFT" | "REFERENCE_ONLY";
  legislativeChunkId?: string;
  timestampRange?: string;
  speakerAttributionStatus?: string;
  needsVerification?: boolean;
};

export type DebateFilmRoomState = {
  generatedAt: string;
  directClipCount: number;
  referenceClipCount: number;
  legislativeClipCount: number;
  items: FilmRoomItem[];
  coverageGaps: string[];
  archiveHonestyNote: string;
  topHammerCommitteeQuotes: string[];
  billsWithTranscriptCoverage: string[];
  speakerVerificationWarnings: string[];
};

export function buildDebateFilmRoomState(): DebateFilmRoomState {
  const kh3 = loadKimHammerKh3Workbench();
  const kh2 = kh3.kh2;
  const archive = kh3.debateArchive;
  const items: FilmRoomItem[] = [];

  for (const asset of archive.kimHammerDirectDebateAssets) {
    items.push({
      id: asset.id,
      title: asset.title,
      dateOrSource: asset.url,
      topic: "Opponent media / runoff coverage",
      opponentClaimOrAngle: "Election integrity framing — verify exact quotes before debate use",
      vulnerability: "Clip is media coverage, not formal debate — context may be edited",
      recommendedCounter: "Pivot to county support + verified record; cite export-ready claims only",
      confidence: asset.sourceConfidence,
      researchGaps: archive.openGaps,
      drillPrompt: "Watch clip → identify one claim → draft 30s response with citation check",
      assetType: asset.assetType,
      url: asset.url,
      isDirectOpponentClip: true,
      governanceLabel: "INTERNAL_DRAFT",
    });
  }

  for (const ref of archive.secretaryOfStateDebateArchive) {
    items.push({
      id: ref.id,
      title: ref.title,
      dateOrSource: ref.url,
      topic: "Prior AR SOS debate reference",
      opponentClaimOrAngle: "Study question patterns — not Kim Hammer specific",
      vulnerability: "Reference only — do not attribute statements to current opponent",
      recommendedCounter: "Use for format/timing practice; adapt Kelly contrast frames from KH-2",
      confidence: ref.sourceConfidence,
      researchGaps: ["Not opponent-specific — label clearly in prep room"],
      drillPrompt: "Shadow answer one SOS debate question using Kelly pillars",
      assetType: ref.assetType,
      url: ref.url,
      isDirectOpponentClip: false,
      governanceLabel: "REFERENCE_ONLY",
    });
  }

  const likelyThemes = archive.likelySosDebateQuestionThemes.slice(0, 3);
  for (const theme of likelyThemes) {
    const rebuttal = kh2.rebuttalPrep.rebuttals.find((e) =>
      e.prompt.toLowerCase().includes(theme.split(" ")[0]?.toLowerCase() ?? ""),
    );
    items.push({
      id: `theme-${theme.slice(0, 24).replace(/\W+/g, "-")}`,
      title: `Likely theme: ${theme}`,
      dateOrSource: "kim-hammer-debate-archive-index.json",
      topic: theme,
      opponentClaimOrAngle: kh2.likelyArguments.arguments[0]?.argument ?? "See likely-arguments JSON",
      vulnerability: "Theme-level prep — not clip-verified",
      recommendedCounter: rebuttal?.kellyBridge ?? "Use debate-profile 30s/60s paths — human review required",
      confidence: "MEDIUM",
      researchGaps: archive.openGaps,
      drillPrompt: `60s answer drill: ${theme}`,
      assetType: "THEME_DRILL",
      url: null,
      isDirectOpponentClip: false,
      governanceLabel: "INTERNAL_DRAFT",
    });
  }

  const legChunks = loadTranscriptChunks();
  const topHammerCommitteeQuotes: string[] = [];
  const speakerVerificationWarnings: string[] = [];
  for (const chunk of legChunks.slice(0, 12)) {
    if (chunk.quoteCandidates[0]) topHammerCommitteeQuotes.push(chunk.quoteCandidates[0].slice(0, 120));
    if (chunk.speakerAttributionStatus !== "SPEAKER_CONFIRMED") {
      speakerVerificationWarnings.push(
        `${chunk.billNumber} ${chunk.startTime}: ${chunk.speakerAttributionStatus} — verify before debate use`,
      );
    }
    items.push({
      id: chunk.id,
      title: `${chunk.billNumber} — ${chunk.chunkType}`,
      dateOrSource: `${chunk.meetingDate} · ${chunk.committeeName}`,
      topic: chunk.chunkType.replace(/_/g, " "),
      opponentClaimOrAngle: chunk.summary.slice(0, 160),
      vulnerability:
        chunk.speakerAttributionStatus === "SPEAKER_CONFIRMED"
          ? "Transcript needs human review — automated ASR not final"
          : "Speaker attribution not confirmed — do not attribute to Hammer without verification",
      recommendedCounter: "Use bill record + export-ready claims; verify timestamp in committee video",
      confidence: chunk.speakerAttributionStatus === "SPEAKER_CONFIRMED" ? "MEDIUM" : "LOW",
      researchGaps: chunk.reviewStatus === "NEEDS_REVIEW" ? ["Human transcript/speaker review required"] : [],
      drillPrompt: `Film room: ${chunk.billNumber} at ${chunk.startTime} — draft 30s rebuttal with citation check`,
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

  const directClipCount = archive.kimHammerDirectDebateAssets.length;
  const referenceClipCount = archive.secretaryOfStateDebateArchive.length;
  const legislativeClipCount = legChunks.filter((c) => c.videoUrl).length;
  const billsWithTranscriptCoverage = [...new Set(legChunks.map((c) => c.billNumber))];
  const coverageGaps = [
    ...archive.openGaps,
    directClipCount < 2 ? "Only one direct Kim Hammer media clip — formal debate archive missing" : "",
    legChunks.length === 0 ? "No legislative committee transcript chunks — run legislature:intelligence:run with discovery enabled" : "",
    "Local forum recordings not indexed",
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
        ? `HONEST STATUS: Only ${directClipCount} direct opponent clip + ${legChunks.length} legislative chunks. Film Room MVP — run video pipeline.`
        : `${directClipCount} media clips + ${legChunks.length} legislative chunks indexed — human review required.`,
    topHammerCommitteeQuotes: topHammerCommitteeQuotes.slice(0, 5),
    billsWithTranscriptCoverage,
    speakerVerificationWarnings: speakerVerificationWarnings.slice(0, 8),
  };
}
