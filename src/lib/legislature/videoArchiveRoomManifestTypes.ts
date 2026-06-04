/** Client-safe video archive manifest types — no node:fs. */

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
