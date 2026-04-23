/**
 * Master Author Studio / Message OS — client state model.
 * Server: `POST` `/api/author-studio/*` returns `AuthorStudioPostResponse` (see `src/lib/author-studio/types.ts`); do not import OpenAI in the browser.
 */

export type MessageBrief = {
  title: string;
  campaignGoal: string;
  messageType: string;
  urgency: "routine" | "standard" | "urgent" | "breaking";
  audience: string;
  tone: string;
  /** candidate | campaign | grassroots | faith | contrast | calm */
  voiceMode: "candidate" | "campaign" | "grassroots" | "faith" | "contrast" | "calm";
  countyOrRegion: string;
  issueTags: string;
  eventLink: string;
  cta: string;
  oppositionContext: string;
  mustInclude: string;
  mustAvoid: string;
  sourceAssets: string;
  notes: string;
};

export type ResearchFileStub = { id: string; name: string; snippet: string; pinned: boolean };
export type WebFindingStub = { id: string; title: string; url: string; note: string; pinned: boolean };
export type CitationLine = { id: string; text: string; source: string };

export type ResearchWorkspaceState = {
  fileContext: ResearchFileStub[];
  webPanel: WebFindingStub[];
  sourceNotes: string;
  citations: CitationLine[];
  researchMemo: string;
  rebuttalContext: string;
  countyContext: string;
  priorSaid: string;
  summaryMemo: string;
};

export type DraftVersion = {
  id: string;
  label: string;
  body: string;
  createdAt: string;
};

export type ComposeState = {
  master: string;
  alternates: DraftVersion[];
  /** ids of alternates to show in compare mode */
  compareLeftId: string | null;
  compareRightId: string | null;
  compareMode: boolean;
  length: "tight" | "standard" | "long";
};

export type TransformKind =
  | "facebook"
  | "instagram"
  | "x_thread"
  | "tiktok"
  | "yt_shorts"
  | "email"
  | "sms"
  | "press"
  | "stump"
  | "volunteer_cta"
  | "county_localized";

export type TransformOutput = { kind: TransformKind; label: string; body: string; refined: boolean };

export type VisualPromptVersion = { id: string; label: string; prompt: string };
export type VisualStudioState = {
  imagePrompt: string;
  promptVersions: VisualPromptVersion[];
  styleNotes: string;
  quoteCardHeadline: string;
  quoteCardAttribution: string;
  thumbnailConcept: string;
  flyerConcept: string;
  beforeAfterNotes: string;
  /** TODO: wire to /api/.../image-generation when ready */
  generatedPlaceholders: { id: string; label: string }[];
};

export type VideoRepurposeState = {
  transcript: string;
  sourceClipLabel: string;
  clipSuggestions: string[];
  hooks: string;
  coldOpen: string;
  subtitles: string;
  lowerThird: string;
  broll: string;
  cutPlan: string;
  packaging: "tiktok" | "reels" | "shorts" | "x_video" | "long" | null;
  editInstructionMemo: string;
};

export type PlatformPackItem = {
  id: string;
  platform: string;
  targetAccount: string;
  objective: string;
  scheduleAt: string;
  copy: string;
  cta: string;
  hashtags: string;
  notes: string;
  assetNote: string;
  readiness: "draft" | "ready" | "blocked" | "scheduled";
};

export type ApprovalCheckItem = { id: string; label: string; done: boolean };
export type LinkedStub = { id: string; label: string; type: "task" | "asset" | "event" | "intake" };

export type ApprovalExportState = {
  checklist: ApprovalCheckItem[];
  linkedTasks: LinkedStub[];
  linkedAssets: LinkedStub[];
  linkedEvent: string;
  linkedIntake: string;
  exportNotes: string;
};

export type MasterAuthorStudioState = {
  brief: MessageBrief;
  research: ResearchWorkspaceState;
  compose: ComposeState;
  transforms: TransformOutput[];
  visual: VisualStudioState;
  video: VideoRepurposeState;
  platformPack: PlatformPackItem[];
  approval: ApprovalExportState;
};

export type StudioTabId =
  | "brief"
  | "research"
  | "compose"
  | "transform"
  | "visuals"
  | "video"
  | "pack"
  | "export";
