import { existsSync } from "node:fs";
import { join } from "node:path";

import type {
  CampaignApprovalStatus,
  ErnieReviewStatus,
  VolunteerResource,
  VolunteerResourceMockupStatus,
  VolunteerResourcePublicationStatus,
} from "@/lib/volunteer-resources";
import {
  CAMPAIGN_APPROVAL_LABELS,
  ERNIE_REVIEW_LABELS,
  MOCKUP_STATUS_LABELS,
  VOLUNTEER_RESOURCE_PUBLICATION_LABELS,
} from "@/lib/volunteer-resources";

export type { VolunteerResourcePublicationStatus };

/** Badge styling — not downloadable until `published` when asset is a file download. */
export function publicationStatusBadgeClass(status: VolunteerResourcePublicationStatus): string {
  switch (status) {
    case "published":
      return "border-kelly-success/40 bg-kelly-success/15 text-kelly-deep";
    case "approved":
      return "border-kelly-blue/35 bg-kelly-blue/10 text-kelly-navy";
    case "mockup_ready":
      return "border-kelly-gold/50 bg-kelly-gold/15 text-kelly-deep";
    case "internal_review":
      return "border-kelly-text/25 bg-kelly-fog text-kelly-deep";
    case "draft":
    default:
      return "border-kelly-text/20 bg-kelly-text/10 text-kelly-text/80";
  }
}

export function isPdfOrFileDownloadHref(href: string, fileType?: string): boolean {
  if (fileType === "PDF") return true;
  return /\.pdf(\?|$)/i.test(href);
}

function pathOnlyFromHref(href: string): string {
  return href.split("#")[0]?.split("?")[0] ?? "";
}

/**
 * True when a PDF should exist under `public/` for this site-root path.
 * External `https://` PDFs are not verified on disk here.
 */
export function volunteerPublicPdfExists(href: string): boolean {
  const pathOnly = pathOnlyFromHref(href);
  if (!pathOnly.startsWith("/") || pathOnly.startsWith("//")) return false;
  if (!/\.pdf$/i.test(pathOnly)) return false;
  const rel = pathOnly.replace(/^\//, "");
  try {
    return existsSync(join(process.cwd(), "public", rel));
  } catch {
    return false;
  }
}

function localPdfTarget(href: string): boolean {
  const pathOnly = pathOnlyFromHref(href);
  return pathOnly.startsWith("/") && !pathOnly.startsWith("//") && /\.pdf$/i.test(pathOnly);
}

function ernieReviewRequiredForResource(resource: VolunteerResource): boolean {
  if (resource.ernieReviewRequired === false) return false;
  return isPdfOrFileDownloadHref(resource.href, resource.fileType);
}

/**
 * Infer status when `publicationStatus` is not set explicitly on the row.
 */
export function inferPublicationStatus(resource: VolunteerResource): VolunteerResourcePublicationStatus {
  if (resource.publicationStatus) return resource.publicationStatus;

  const downloadish = isPdfOrFileDownloadHref(resource.href, resource.fileType);

  if (downloadish) {
    if (resource.comingSoon) return "draft";
    return "internal_review";
  }

  if (resource.comingSoon) return "internal_review";

  return "published";
}

export function inferErnieReviewStatus(resource: VolunteerResource): ErnieReviewStatus {
  if (resource.ernieReviewStatus) return resource.ernieReviewStatus;
  if (!ernieReviewRequiredForResource(resource)) return "ernie_approved";
  if (resource.comingSoon) return "needs_document_build";
  const pub = inferPublicationStatus(resource);
  if (pub === "published") return "in_ernie_review";
  return "needs_document_build";
}

export function inferVolunteerResourceMockupStatus(resource: VolunteerResource): VolunteerResourceMockupStatus {
  if (resource.mockupStatus) return resource.mockupStatus;
  if (!ernieReviewRequiredForResource(resource)) return "not_started";
  if (resource.comingSoon) return "not_started";
  const pub = inferPublicationStatus(resource);
  if (pub === "mockup_ready" || pub === "approved" || pub === "published") return "mockup_ready";
  return "draft_needed";
}

export function inferCampaignApprovalStatus(resource: VolunteerResource): CampaignApprovalStatus {
  if (resource.campaignApprovalStatus) return resource.campaignApprovalStatus;
  if (!ernieReviewRequiredForResource(resource)) return "approved";
  const pub = inferPublicationStatus(resource);
  if (pub === "published") return "pending";
  return "not_started";
}

export type VolunteerResourceCardPresentation = {
  status: VolunteerResourcePublicationStatus;
  statusLabel: string;
  /** True when we may link directly to a binary file for download. */
  allowDirectFileDownload: boolean;
  /** Shown under description for in-flight assets. */
  reviewNote: string | null;
  /** Secondary line for PDFs and similar. */
  downloadNote: string | null;
  ernieReviewStatus: ErnieReviewStatus;
  ernieReviewLabel: string;
  campaignApprovalStatus: CampaignApprovalStatus;
  campaignApprovalLabel: string;
  mockupStatus: VolunteerResourceMockupStatus;
  mockupStatusLabel: string;
  /** Local PDF path: file present under public/. */
  publicFileOnDisk: boolean | null;
  /** Human-readable blockers when a PDF is not offered as direct download. */
  downloadGatesNote: string | null;
};

export function presentVolunteerResource(resource: VolunteerResource): VolunteerResourceCardPresentation {
  const status = inferPublicationStatus(resource);
  const statusLabel = VOLUNTEER_RESOURCE_PUBLICATION_LABELS[status];
  const downloadish = isPdfOrFileDownloadHref(resource.href, resource.fileType);
  const ernieRequired = ernieReviewRequiredForResource(resource);
  const ernieSt = inferErnieReviewStatus(resource);
  const campaignSt = inferCampaignApprovalStatus(resource);
  const mockupSt = inferVolunteerResourceMockupStatus(resource);

  const publicFileOnDisk = localPdfTarget(resource.href) ? volunteerPublicPdfExists(resource.href) : null;

  let allowDirectFileDownload =
    downloadish && !resource.comingSoon && status === "published";

  if (allowDirectFileDownload && ernieRequired) {
    allowDirectFileDownload = ernieSt === "ernie_approved" && campaignSt === "approved";
  }
  if (allowDirectFileDownload && localPdfTarget(resource.href)) {
    allowDirectFileDownload = Boolean(publicFileOnDisk);
  }

  const gateParts: string[] = [];
  if (downloadish && localPdfTarget(resource.href) && publicFileOnDisk === false) {
    gateParts.push("Final PDF not yet uploaded to the site.");
  }
  if (ernieRequired && ernieSt !== "ernie_approved") {
    gateParts.push(`Ernie review: ${ERNIE_REVIEW_LABELS[ernieSt]}.`);
  }
  if (ernieRequired && campaignSt !== "approved") {
    gateParts.push(`Campaign approval: ${CAMPAIGN_APPROVAL_LABELS[campaignSt]}.`);
  }
  const downloadGatesNote = gateParts.length ? gateParts.join(" ") : null;

  let reviewNote: string | null = null;
  if (downloadish && !allowDirectFileDownload) {
    reviewNote =
      "Download coming after campaign review — Ernie polish, campaign approval, and an uploaded file are required before this is a direct link.";
  } else if (resource.comingSoon && downloadish) {
    reviewNote = "Not available for download yet — mockup and approval required before release.";
  } else if (resource.comingSoon && !downloadish) {
    reviewNote =
      "Campaign review — content may be draft; page may still be useful for structure and links.";
  }

  let downloadNote: string | null = null;
  if (downloadish) {
    downloadNote =
      allowDirectFileDownload
        ? "Campaign-approved download (Ernie + campaign gates cleared; file on server)."
        : "Printable PDF — review pipeline and upload required before final download.";
  } else if (resource.fileType === "Web") {
    downloadNote = "Read online — updates with the field playbook and site.";
  }

  return {
    status,
    statusLabel,
    allowDirectFileDownload,
    reviewNote,
    downloadNote,
    ernieReviewStatus: ernieSt,
    ernieReviewLabel: ERNIE_REVIEW_LABELS[ernieSt],
    campaignApprovalStatus: campaignSt,
    campaignApprovalLabel: CAMPAIGN_APPROVAL_LABELS[campaignSt],
    mockupStatus: mockupSt,
    mockupStatusLabel: MOCKUP_STATUS_LABELS[mockupSt],
    publicFileOnDisk,
    downloadGatesNote,
  };
}
