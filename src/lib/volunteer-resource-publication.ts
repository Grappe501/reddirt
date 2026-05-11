import type {
  VolunteerResource,
  VolunteerResourcePublicationStatus,
} from "@/lib/volunteer-resources";
import { VOLUNTEER_RESOURCE_PUBLICATION_LABELS } from "@/lib/volunteer-resources";

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

export type VolunteerResourceCardPresentation = {
  status: VolunteerResourcePublicationStatus;
  statusLabel: string;
  /** True when we may link directly to a binary file for download. */
  allowDirectFileDownload: boolean;
  /** Shown under description for in-flight assets. */
  reviewNote: string | null;
  /** Secondary line for PDFs and similar. */
  downloadNote: string | null;
};

export function presentVolunteerResource(resource: VolunteerResource): VolunteerResourceCardPresentation {
  const status = inferPublicationStatus(resource);
  const statusLabel = VOLUNTEER_RESOURCE_PUBLICATION_LABELS[status];
  const downloadish = isPdfOrFileDownloadHref(resource.href, resource.fileType);

  const allowDirectFileDownload = downloadish && status === "published" && !resource.comingSoon;

  let reviewNote: string | null = null;
  if (downloadish && status !== "published") {
    reviewNote = "Download coming after campaign review.";
  } else if (resource.comingSoon && downloadish) {
    reviewNote = "Not available for download yet — mockup and approval required before release.";
  } else if (resource.comingSoon && !downloadish) {
    reviewNote =
      "Campaign review — content may be draft; page may still be useful for structure and links.";
  }

  let downloadNote: string | null = null;
  if (downloadish) {
    downloadNote =
      status === "published"
        ? "Campaign-approved download."
        : "Printable PDF — campaign review required before final file is linked.";
  } else if (resource.fileType === "Web") {
    downloadNote = "Read online — updates with the field playbook and site.";
  }

  return {
    status,
    statusLabel,
    allowDirectFileDownload,
    reviewNote,
    downloadNote,
  };
}
