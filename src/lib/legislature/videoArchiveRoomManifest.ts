import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export type VideoArchiveAssetKind =
  | "SOURCE_REFERENCE"
  | "COMMITTEE_DISCOVERY"
  | "TEAM_CUT"
  | "UPLOADED_RAW";

export type VideoArchiveManifestAsset = {
  id: string;
  billNumber: string;
  session: string;
  kind: VideoArchiveAssetKind;
  title: string;
  committeeName?: string;
  meetingDate?: string;
  externalUrl?: string;
  ownedMediaAssetId?: string | null;
  parentCandidateId?: string | null;
  notes?: string;
  createdAt: string;
  createdBy?: string;
};

export type VideoArchiveManualSponsorLink = {
  id: string;
  billNumber: string;
  session: string;
  committeeName: string;
  meetingDate?: string;
  videoUrl: string;
  sponsorLabel?: string;
  notes?: string;
  createdAt: string;
};

export type VideoArchiveRoomManifest = {
  version: number;
  generatedAt: string;
  cutReadyFolderLabel: string;
  operatorNotes?: string;
  manualSponsorLinks: VideoArchiveManualSponsorLink[];
  archivedAssets: VideoArchiveManifestAsset[];
};

export const VIDEO_ARCHIVE_ROOM_MANIFEST_REL = "data/legislature/video-archives/video-archive-room-manifest.json";

function manifestPath(repoRoot: string) {
  return path.join(repoRoot, VIDEO_ARCHIVE_ROOM_MANIFEST_REL);
}

export function loadVideoArchiveRoomManifest(repoRoot: string = process.cwd()): VideoArchiveRoomManifest {
  const abs = manifestPath(repoRoot);
  if (!existsSync(abs)) {
    return {
      version: 1,
      generatedAt: new Date().toISOString(),
      cutReadyFolderLabel: "cut-and-ready",
      manualSponsorLinks: [],
      archivedAssets: [],
    };
  }
  return JSON.parse(readFileSync(abs, "utf8")) as VideoArchiveRoomManifest;
}

export function saveVideoArchiveRoomManifest(manifest: VideoArchiveRoomManifest, repoRoot: string = process.cwd()): void {
  manifest.generatedAt = new Date().toISOString();
  const abs = manifestPath(repoRoot);
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

export function appendManifestAsset(
  asset: Omit<VideoArchiveManifestAsset, "id" | "createdAt"> & { id?: string; createdAt?: string },
  repoRoot: string = process.cwd(),
): VideoArchiveManifestAsset {
  const manifest = loadVideoArchiveRoomManifest(repoRoot);
  const row: VideoArchiveManifestAsset = {
    id: asset.id ?? `vaa-${Date.now().toString(36)}`,
    createdAt: asset.createdAt ?? new Date().toISOString(),
    billNumber: asset.billNumber,
    session: asset.session,
    kind: asset.kind,
    title: asset.title,
    committeeName: asset.committeeName,
    meetingDate: asset.meetingDate,
    externalUrl: asset.externalUrl,
    ownedMediaAssetId: asset.ownedMediaAssetId ?? null,
    parentCandidateId: asset.parentCandidateId ?? null,
    notes: asset.notes,
    createdBy: asset.createdBy,
  };
  manifest.archivedAssets.push(row);
  saveVideoArchiveRoomManifest(manifest, repoRoot);
  return row;
}

export function appendManualSponsorLink(
  link: Omit<VideoArchiveManualSponsorLink, "id" | "createdAt"> & { id?: string; createdAt?: string },
  repoRoot: string = process.cwd(),
): VideoArchiveManualSponsorLink {
  const manifest = loadVideoArchiveRoomManifest(repoRoot);
  const row: VideoArchiveManualSponsorLink = {
    id: link.id ?? `msl-${Date.now().toString(36)}`,
    createdAt: link.createdAt ?? new Date().toISOString(),
    billNumber: link.billNumber,
    session: link.session,
    committeeName: link.committeeName,
    meetingDate: link.meetingDate,
    videoUrl: link.videoUrl,
    sponsorLabel: link.sponsorLabel,
    notes: link.notes,
  };
  manifest.manualSponsorLinks.push(row);
  saveVideoArchiveRoomManifest(manifest, repoRoot);
  return row;
}

export function listCutReadyAssets(manifest: VideoArchiveRoomManifest): VideoArchiveManifestAsset[] {
  return manifest.archivedAssets.filter((a) => a.kind === "TEAM_CUT");
}
