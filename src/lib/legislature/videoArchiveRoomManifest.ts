import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export type VideoArchiveAssetKind =
  | "SOURCE_REFERENCE"
  | "COMMITTEE_DISCOVERY"
  | "TEAM_CUT"
  | "UPLOADED_RAW"
  | "OPPONENT_SNIPPET";

export type OpponentSnippetSlot = {
  id: string;
  parentOpponentMediaId: string;
  label: string;
  /** Filled when team uploads cut */
  assetId?: string | null;
  status: "EMPTY" | "READY";
  notes?: string;
};

export type KellyCandidateSuggestion = {
  id: string;
  text: string;
  category: "opening" | "closing" | "rebuttal" | "coaching" | "other";
  createdAt: string;
  createdBy?: string;
};

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
  parentOpponentMediaId?: string | null;
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
  opponentSnippetSlots: OpponentSnippetSlot[];
  kellyCandidateSuggestions: KellyCandidateSuggestion[];
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
      opponentSnippetSlots: [],
      kellyCandidateSuggestions: [],
    };
  }
  const raw = JSON.parse(readFileSync(abs, "utf8")) as VideoArchiveRoomManifest;
  return {
    ...raw,
    opponentSnippetSlots: raw.opponentSnippetSlots ?? [],
    kellyCandidateSuggestions: raw.kellyCandidateSuggestions ?? [],
  };
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
  return manifest.archivedAssets.filter((a) => a.kind === "TEAM_CUT" || a.kind === "OPPONENT_SNIPPET");
}

export function appendOpponentSnippetAsset(
  asset: Omit<VideoArchiveManifestAsset, "id" | "createdAt" | "kind"> & {
    id?: string;
    createdAt?: string;
  },
  repoRoot: string = process.cwd(),
): VideoArchiveManifestAsset {
  return appendManifestAsset(
    {
      ...asset,
      billNumber: asset.billNumber || "MEDIA",
      session: asset.session || "opponent",
      kind: "OPPONENT_SNIPPET",
    },
    repoRoot,
  );
}

export function ensureSnippetSlot(
  parentOpponentMediaId: string,
  label: string,
  repoRoot: string = process.cwd(),
): OpponentSnippetSlot {
  const manifest = loadVideoArchiveRoomManifest(repoRoot);
  const existing = manifest.opponentSnippetSlots.find(
    (s) => s.parentOpponentMediaId === parentOpponentMediaId && s.label === label,
  );
  if (existing) return existing;
  const slot: OpponentSnippetSlot = {
    id: `slot-${Date.now().toString(36)}`,
    parentOpponentMediaId,
    label,
    status: "EMPTY",
  };
  manifest.opponentSnippetSlots.push(slot);
  saveVideoArchiveRoomManifest(manifest, repoRoot);
  return slot;
}

export function linkSnippetToAsset(
  slotId: string,
  assetId: string,
  repoRoot: string = process.cwd(),
): void {
  const manifest = loadVideoArchiveRoomManifest(repoRoot);
  const slot = manifest.opponentSnippetSlots.find((s) => s.id === slotId);
  if (slot) {
    slot.assetId = assetId;
    slot.status = "READY";
  }
  saveVideoArchiveRoomManifest(manifest, repoRoot);
}

export function appendKellySuggestion(
  text: string,
  category: KellyCandidateSuggestion["category"],
  createdBy?: string,
  repoRoot: string = process.cwd(),
): KellyCandidateSuggestion {
  const manifest = loadVideoArchiveRoomManifest(repoRoot);
  const row: KellyCandidateSuggestion = {
    id: `kcs-${Date.now().toString(36)}`,
    text,
    category,
    createdAt: new Date().toISOString(),
    createdBy,
  };
  manifest.kellyCandidateSuggestions.push(row);
  saveVideoArchiveRoomManifest(manifest, repoRoot);
  return row;
}
