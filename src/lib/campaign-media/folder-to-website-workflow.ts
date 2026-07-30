/**
 * Folder → Website workflow — path constants + progress for Arrival desk.
 * Prefer Unknown. Detect ≠ Intake ≠ Save ≠ Approve ≠ Ship.
 */

import path from "node:path";
import type { PhotoIntakeStatus } from "@/lib/campaign-media/photo-ingest";
import type { ArrivalIntakePreview } from "@/lib/campaign-media/photo-ingest";
import type { VideoMasterArrivalSummary } from "@/lib/campaign-media/video-master-arrival";

export const FOLDER_TO_WEBSITE_PHOTOS_REL = "public/media/campaign-photos";
export const FOLDER_TO_WEBSITE_MASTERS_REL = "public/media/campaign-video-masters";
export const FOLDER_TO_WEBSITE_LOCAL_MASTERS_HINT = "H:/SOSWebsite/.local/video-masters";

export function folderToWebsitePhotosAbs(cwd = process.cwd()): string {
  return path.join(cwd, ...FOLDER_TO_WEBSITE_PHOTOS_REL.split("/"));
}

export function folderToWebsiteMastersAbs(cwd = process.cwd()): string {
  return path.join(cwd, ...FOLDER_TO_WEBSITE_MASTERS_REL.split("/"));
}

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

export function buildFolderToWebsiteProgress(input: {
  status: PhotoIntakeStatus;
  video: VideoMasterArrivalSummary;
  preview?: ArrivalIntakePreview | null;
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

  if (newOnDisk > 0 || unmatchedMasters > 0) {
    nextStep = "bring";
    nextLabel =
      newOnDisk > 0
        ? `Bring ${newOnDisk} still(s) into the system${unmatchedMasters ? ` · attach ${unmatchedMasters} master(s)` : ""}, then Identify.`
        : `Attach ${unmatchedMasters} unmatched master(s), then continue.`;
    nextHref = "/admin/evidence-workbench?tab=ingest";
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
