import { AEAC_BASE } from "./catalog";

export type AeacFindingStatus = "in_progress" | "published";

export type AeacFinding = {
  slug: string;
  title: string;
  status: AeacFindingStatus;
  publishedLabel: string;
  summary: string;
  relatedTopics: string[];
};

/** Public findings library. Empty until the Commission publishes its first record. */
export const aeacFindings: AeacFinding[] = [];

export function getAeacFinding(slug: string): AeacFinding | undefined {
  return aeacFindings.find((finding) => finding.slug === slug);
}

export function aeacFindingHref(slug: string): string {
  return `${AEAC_BASE}/findings/${slug}`;
}
