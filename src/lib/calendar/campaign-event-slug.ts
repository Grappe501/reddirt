/** Canonical slug for campaign calendar list + detail routes. */
export function campaignEventSlug(title: string, startDateYmd: string): string {
  return `${title}-${startDateYmd}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}
