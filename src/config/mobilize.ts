/**
 * Public Mobilize event feed for Grappe for SOS volunteer shifts.
 * Set NEXT_PUBLIC_MOBILIZE_ORG_SLUG to the slug in https://www.mobilize.us/{slug}/
 * or NEXT_PUBLIC_MOBILIZE_ORG_ID to the numeric organization id from the dashboard.
 */
export function getMobilizeOrgSlug(): string | null {
  const slug = process.env.NEXT_PUBLIC_MOBILIZE_ORG_SLUG?.trim().toLowerCase();
  return slug || null;
}

export function getMobilizeOrgId(): number | null {
  const raw = process.env.NEXT_PUBLIC_MOBILIZE_ORG_ID?.trim();
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function mobilizeFeedUrl(slug: string): string {
  return `https://www.mobilize.us/${slug}/`;
}
