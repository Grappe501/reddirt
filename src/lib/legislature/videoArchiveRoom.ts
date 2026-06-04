import type { LegislativeVideoCandidate } from "@/lib/legislature/legislativeVideoArchiveStore";
import { loadVideoCandidates } from "@/lib/legislature/legislativeVideoArchiveStore";
import { loadPriorityBillRegistry, type PriorityBillEntry } from "@/lib/legislature/priorityBillRegistry";
import {
  loadVideoArchiveRoomManifest,
  type VideoArchiveManifestAsset,
  type VideoArchiveManualSponsorLink,
} from "@/lib/legislature/videoArchiveRoomManifest";

/** Debate anchor bills — always surfaced in archive room even if priority is lower. */
export const VIDEO_ARCHIVE_FOCUS_ANCHORS = ["SB250", "HB1457", "SB291", "SB584", "HB1707"] as const;

export type VideoArchiveCommitteeLink = {
  id: string;
  committeeName: string;
  meetingDate: string;
  videoUrl: string;
  sourcePageUrl: string;
  sourceType: string;
  expectedSpeaker: string;
  sponsorExpected: boolean;
  processingStatus: string;
  discoveryConfidence: number;
  origin: "DISCOVERY" | "MANUAL";
  downloadHref: string;
};

export type VideoArchiveBillRow = {
  billNumber: string;
  session: string;
  title: string;
  sponsor: string;
  priorityLevel: PriorityBillEntry["priorityLevel"];
  isDebateAnchor: boolean;
  billUrl: string;
  videoDiscoveryStatus: PriorityBillEntry["videoDiscoveryStatus"];
  committeeVideos: VideoArchiveCommitteeLink[];
  cutReadyAssets: VideoArchiveManifestAsset[];
  manualLinks: VideoArchiveManualSponsorLink[];
};

export type VideoArchiveRoomPacket = {
  generatedAt: string;
  focusBillCount: number;
  billsWithVideo: number;
  totalCommitteeLinks: number;
  cutReadyCount: number;
  cutReadyFolderLabel: string;
  operatorNotes: string;
  bills: VideoArchiveBillRow[];
};

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

  const bills: VideoArchiveBillRow[] = [];

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

  return {
    generatedAt: new Date().toISOString(),
    focusBillCount: bills.length,
    billsWithVideo: bills.filter((b) => b.committeeVideos.length > 0).length,
    totalCommitteeLinks: bills.reduce((n, b) => n + b.committeeVideos.length, 0),
    cutReadyCount: manifest.archivedAssets.filter((a) => a.kind === "TEAM_CUT").length,
    cutReadyFolderLabel: manifest.cutReadyFolderLabel,
    operatorNotes: manifest.operatorNotes ?? "",
    bills,
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
