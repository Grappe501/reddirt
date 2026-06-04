import "server-only";

import type { LegislativeVideoCandidate } from "@/lib/legislature/legislativeVideoArchiveStore";
import { loadVideoCandidates } from "@/lib/legislature/legislativeVideoArchiveStore";
import { loadPriorityBillRegistry, type PriorityBillEntry } from "@/lib/legislature/priorityBillRegistry";
import { loadVideoArchiveRoomManifest } from "@/lib/legislature/videoArchiveRoomManifest";
import type {
  OpponentMediaRow,
  VideoArchiveBillRow,
  VideoArchiveCommitteeLink,
  VideoArchiveManualSponsorLink,
  VideoArchiveRoomPacket,
} from "@/lib/legislature/videoArchiveRoomTypes";
import type { VideoArchiveManifestAsset } from "@/lib/legislature/videoArchiveRoomManifestTypes";
import { loadOpponentMediaCatalog } from "@/lib/intelligence/opponents/loadOpponentMediaCatalog";
import { getTranscriptForMedia, loadOpponentMediaTranscripts } from "@/lib/intelligence/opponents/loadOpponentMediaTranscripts";
import { buildHammerDirectDemocracyPacket } from "@/lib/intelligence/v4/hammerDirectDemocracyOffensive";
import { buildLegislativeVideoIntelligenceRollup } from "@/lib/legislature/legislativeVideoIntelligenceRollup";
import { loadTranscriptSegments } from "@/lib/legislature/legislativeTranscriptionPipeline";
import { loadKellyRoadStories } from "@/lib/intelligence/loadKellyRoadStories";

export type {
  OpponentMediaRow,
  VideoArchiveBillRow,
  VideoArchiveCommitteeLink,
  VideoArchiveRoomPacket,
} from "@/lib/legislature/videoArchiveRoomTypes";

/** Debate anchor bills — always surfaced in archive room even if priority is lower. */
export const VIDEO_ARCHIVE_FOCUS_ANCHORS = ["SB250", "HB1457", "SB291", "SB584", "HB1707"] as const;

function billKey(billNumber: string, session: string) {
  return `${billNumber}::${session}`;
}

function candidateToLink(c: LegislativeVideoCandidate): VideoArchiveCommitteeLink {
  return {
    id: c.id,
    committeeName: c.committeeName,
    meetingDate: c.meetingDate,
    videoUrl: c.videoUrl,
    sourcePageUrl: c.sourcePageUrl,
    sourceType: c.sourceType,
    expectedSpeaker: c.expectedSpeaker,
    sponsorExpected: c.sponsorExpected,
    processingStatus: c.processingStatus,
    discoveryConfidence: c.discoveryConfidence,
    origin: "DISCOVERY",
    downloadHref: `/api/admin/intelligence/video-archive/download?candidateId=${encodeURIComponent(c.id)}`,
  };
}

function manualToLink(m: VideoArchiveManualSponsorLink): VideoArchiveCommitteeLink {
  return {
    id: m.id,
    committeeName: m.committeeName,
    meetingDate: m.meetingDate ?? "—",
    videoUrl: m.videoUrl,
    sourcePageUrl: "",
    sourceType: "MANUAL",
    expectedSpeaker: m.sponsorLabel ?? "Sponsor presentation",
    sponsorExpected: true,
    processingStatus: "MANUAL",
    discoveryConfidence: 100,
    origin: "MANUAL",
    downloadHref: `/api/admin/intelligence/video-archive/download?manualId=${encodeURIComponent(m.id)}`,
  };
}

function shouldIncludeBill(b: PriorityBillEntry): boolean {
  if (VIDEO_ARCHIVE_FOCUS_ANCHORS.includes(b.billNumber as (typeof VIDEO_ARCHIVE_FOCUS_ANCHORS)[number])) {
    return true;
  }
  return b.priorityLevel === "CRITICAL" || b.priorityLevel === "HIGH";
}

function sortBills(a: VideoArchiveBillRow, b: VideoArchiveBillRow): number {
  if (a.isDebateAnchor !== b.isDebateAnchor) return a.isDebateAnchor ? -1 : 1;
  const pri = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  return pri[a.priorityLevel] - pri[b.priorityLevel] || a.billNumber.localeCompare(b.billNumber);
}

export function buildVideoArchiveRoomPacket(repoRoot: string = process.cwd()): VideoArchiveRoomPacket {
  const registry = loadPriorityBillRegistry(repoRoot);
  const candidates = loadVideoCandidates(repoRoot).candidates;
  const manifest = loadVideoArchiveRoomManifest(repoRoot);

  const byBill = new Map<string, LegislativeVideoCandidate[]>();
  for (const c of candidates) {
    const key = billKey(c.billNumber, c.session);
    const list = byBill.get(key) ?? [];
    list.push(c);
    byBill.set(key, list);
  }

  const focusBills = registry.bills.filter(shouldIncludeBill);
  const seen = new Set<string>();

  const bills: VideoArchiveRoomPacket["bills"] = [];

  for (const b of focusBills) {
    const key = billKey(b.billNumber, b.session);
    if (seen.has(key)) continue;
    seen.add(key);

    const discovered = (byBill.get(key) ?? []).map(candidateToLink);
    const manualForBill = manifest.manualSponsorLinks.filter(
      (m) => m.billNumber === b.billNumber && m.session === b.session,
    );
    const manualLinks = manualForBill;
    const manualVideos = manualForBill.map(manualToLink);

    const committeeVideos = [...discovered, ...manualVideos].sort((x, y) =>
      x.meetingDate.localeCompare(y.meetingDate),
    );

    const cutReadyAssets = manifest.archivedAssets.filter(
      (a) => a.billNumber === b.billNumber && a.session === b.session && a.kind === "TEAM_CUT",
    );

    bills.push({
      billNumber: b.billNumber,
      session: b.session,
      title: b.title,
      sponsor: b.sponsor,
      priorityLevel: b.priorityLevel,
      isDebateAnchor: VIDEO_ARCHIVE_FOCUS_ANCHORS.includes(
        b.billNumber as (typeof VIDEO_ARCHIVE_FOCUS_ANCHORS)[number],
      ),
      billUrl: b.billUrl,
      videoDiscoveryStatus: b.videoDiscoveryStatus,
      committeeVideos,
      cutReadyAssets,
      manualLinks,
    });
  }

  bills.sort(sortBills);

  const catalog = loadOpponentMediaCatalog(repoRoot);
  const enrichOpponent = (opponentId: string): OpponentMediaRow[] =>
    catalog.candidates
      .filter((e) => e.opponentId === opponentId)
      .map((entry) => {
        const snippetSlots = manifest.opponentSnippetSlots.filter(
          (s) => s.parentOpponentMediaId === entry.id,
        );
        const snippets = manifest.archivedAssets.filter(
          (a) => a.parentOpponentMediaId === entry.id && a.kind === "OPPONENT_SNIPPET",
        );
        return {
          ...entry,
          snippetSlots,
          snippets,
          watchUrl: entry.url,
          downloadUrl: `/api/admin/intelligence/video-archive/download?opponentMediaId=${encodeURIComponent(entry.id)}`,
          transcript: getTranscriptForMedia(entry.id, repoRoot),
        };
      });

  const transcriptFile = loadOpponentMediaTranscripts(repoRoot);
  const pipelineSegments = loadTranscriptSegments(repoRoot);
  const rollup = buildLegislativeVideoIntelligenceRollup(repoRoot);
  const committeeExcerpts = pipelineSegments.segments.slice(0, 12).map((s) => ({
    billNumber: s.billNumber,
    videoCandidateId: s.videoCandidateId,
    text: s.text,
    speakerLabel: s.speakerLabel,
  }));

  return {
    generatedAt: new Date().toISOString(),
    focusBillCount: bills.length,
    billsWithVideo: bills.filter((b) => b.committeeVideos.length > 0).length,
    totalCommitteeLinks: bills.reduce((n, b) => n + b.committeeVideos.length, 0),
    cutReadyCount: manifest.archivedAssets.filter(
      (a) => a.kind === "TEAM_CUT" || a.kind === "OPPONENT_SNIPPET",
    ).length,
    cutReadyFolderLabel: manifest.cutReadyFolderLabel,
    operatorNotes: manifest.operatorNotes ?? "",
    bills,
    opponentMedia: {
      hammer: enrichOpponent("kim-hammer"),
      packo: enrichOpponent("michael-packo"),
      kellySuggestions: manifest.kellyCandidateSuggestions,
    },
    transcripts: {
      catalogCount: transcriptFile.entries.length,
      pipelineSegmentCount: pipelineSegments.segments.length,
      transcriptionStatus: rollup.transcriptionProviderStatus,
    },
    legislativeRecord: buildHammerDirectDemocracyPacket(),
    roadStories: loadKellyRoadStories(repoRoot),
    committeeTranscriptExcerpts: committeeExcerpts,
  };
}

export function findVideoCandidateById(
  candidateId: string,
  repoRoot: string = process.cwd(),
): LegislativeVideoCandidate | undefined {
  return loadVideoCandidates(repoRoot).candidates.find((c) => c.id === candidateId);
}

export function findManualSponsorLinkById(
  manualId: string,
  repoRoot: string = process.cwd(),
): VideoArchiveManualSponsorLink | undefined {
  return loadVideoArchiveRoomManifest(repoRoot).manualSponsorLinks.find((m) => m.id === manualId);
}

export function findManifestAssetById(
  assetId: string,
  repoRoot: string = process.cwd(),
): VideoArchiveManifestAsset | undefined {
  return loadVideoArchiveRoomManifest(repoRoot).archivedAssets.find((a) => a.id === assetId);
}

export function findOpponentMediaUrl(
  opponentMediaId: string,
  repoRoot: string = process.cwd(),
): string | undefined {
  return loadOpponentMediaCatalog(repoRoot).candidates.find((c) => c.id === opponentMediaId)?.url;
}
