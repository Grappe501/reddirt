/**
 * Folder → Website workflow — path constants + progress for Arrival desk.
 * Client-safe (no node: / no server module imports). Prefer Unknown.
 */

export const FOLDER_TO_WEBSITE_PHOTOS_REL = "public/media/campaign-photos";
export const FOLDER_TO_WEBSITE_MASTERS_REL = "public/media/campaign-video-masters";
export const FOLDER_TO_WEBSITE_LOCAL_MASTERS_HINT = "H:/SOSWebsite/.local/video-masters";

export type FolderToWebsiteStepId =
  | "drop"
  | "detect"
  | "bring"
  | "identify"
  | "approve"
  | "ship";

export type FolderToWebsiteProgress = {
  newOnDisk: number;
  nestedNew: number;
  unmatchedMasters: number;
  mastersTotal: number;
  queuedUnknown: number;
  queueCount: number;
  needsApproval: number;
  approvedPublic: number;
  previewWarns: number;
  previewWillQueue: number;
  /** Highest-priority next step for the operator. */
  nextStep: FolderToWebsiteStepId;
  nextLabel: string;
  nextHref: string;
};

/** Structural inputs — keep this module free of photo-ingest / video-master server imports. */
export function buildFolderToWebsiteProgress(input: {
  status: {
    newOnDisk: number;
    nestedNew: number;
    queueUnknownCounty: number;
    queueCount: number;
    scannedOnDisk: number;
  };
  video: {
    unmatched: number;
    total: number;
  };
  preview?: {
    warnCount: number;
    willQueue: number;
  } | null;
  needsApproval: number;
  approvedPublic: number;
}): FolderToWebsiteProgress {
  const newOnDisk = input.status.newOnDisk;
  const unmatchedMasters = input.video.unmatched;
  const queuedUnknown = input.status.queueUnknownCounty;
  const queueCount = input.status.queueCount;
  const needsApproval = input.needsApproval;
  const approvedPublic = input.approvedPublic;
  const previewWarns = input.preview?.warnCount ?? 0;
  const previewWillQueue = input.preview?.willQueue ?? newOnDisk;

  let nextStep: FolderToWebsiteStepId = "drop";
  let nextLabel = "Drop stills or masters into the folders below (or use the drop zone).";
  let nextHref = "/admin/evidence-workbench?tab=ingest";

  if (newOnDisk > 0) {
    nextStep = "bring";
    nextLabel = unmatchedMasters
      ? `Bring ${newOnDisk} still(s) into the system, then attach ${unmatchedMasters} unmatched master(s).`
      : `Bring ${newOnDisk} still(s) into the system, then Identify.`;
    nextHref = "/admin/evidence-workbench?tab=ingest";
  } else if (unmatchedMasters > 0) {
    nextStep = "bring";
    nextLabel = `Attach ${unmatchedMasters} unmatched master(s) below — Prefer Unknown; we never invent a speech match.`;
    nextHref = "#ew-arrival-masters";
  } else if (queuedUnknown > 0) {
    nextStep = "identify";
    nextLabel = `Identify ${queuedUnknown} still(s) missing county — Save → Route.`;
    nextHref = "/admin/evidence-workbench?tab=identify&filter=draft";
  } else if (needsApproval > 0) {
    nextStep = "approve";
    nextLabel = `Approve ${needsApproval} geo-confirmed still(s) on County (Unknown skipped).`;
    nextHref = "/admin/evidence-workbench?tab=county";
  } else if (queueCount > 0 || approvedPublic > 0) {
    nextStep = "ship";
    nextLabel =
      "Place on Publish if needed, then Ship last mile + commit so the live site updates.";
    nextHref = "/admin/evidence-workbench?tab=publish#ew-ship-last-mile";
  } else if (input.status.scannedOnDisk === 0 && input.video.total === 0) {
    nextStep = "drop";
    nextLabel = "Drop stills into campaign-photos (folders OK) · masters flat into campaign-video-masters.";
  } else {
    nextStep = "detect";
    nextLabel = "Soft-watch is scanning — drop more files or you’re clear for now.";
  }

  return {
    newOnDisk,
    nestedNew: input.status.nestedNew,
    unmatchedMasters,
    mastersTotal: input.video.total,
    queuedUnknown,
    queueCount,
    needsApproval,
    approvedPublic,
    previewWarns,
    previewWillQueue,
    nextStep,
    nextLabel,
    nextHref,
  };
}

export const FOLDER_TO_WEBSITE_STEPS: Array<{
  id: FolderToWebsiteStepId;
  n: number;
  label: string;
  hint: string;
}> = [
  { id: "drop", n: 1, label: "Drop", hint: "Folder or drop zone" },
  { id: "detect", n: 2, label: "Detect", hint: "Soft-watch" },
  { id: "bring", n: 3, label: "Bring in", hint: "Queue drafts" },
  { id: "identify", n: 4, label: "Identify", hint: "County + Save" },
  { id: "approve", n: 5, label: "Approve", hint: "County desk" },
  { id: "ship", n: 6, label: "Ship", hint: "Publish + git" },
];
