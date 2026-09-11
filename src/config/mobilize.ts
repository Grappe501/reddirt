/**
 * Public Mobilize event feed for Grappe for SOS volunteer shifts.
 * Override with NEXT_PUBLIC_MOBILIZE_ORG_SLUG / NEXT_PUBLIC_MOBILIZE_ORG_ID if the org moves.
 * Public feed: https://www.mobilize.us/thecommitteetoelectkellygrappe/
 */
export const DEFAULT_MOBILIZE_ORG_SLUG = "thecommitteetoelectkellygrappe";
export const DEFAULT_MOBILIZE_ORG_ID = 52195;

export function getMobilizeOrgSlug(): string {
  const slug = process.env.NEXT_PUBLIC_MOBILIZE_ORG_SLUG?.trim().toLowerCase();
  return slug || DEFAULT_MOBILIZE_ORG_SLUG;
}

export function getMobilizeOrgId(): number {
  const raw = process.env.NEXT_PUBLIC_MOBILIZE_ORG_ID?.trim();
  if (!raw) return DEFAULT_MOBILIZE_ORG_ID;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_MOBILIZE_ORG_ID;
}

export function mobilizeFeedUrl(slug = getMobilizeOrgSlug()): string {
  return `https://www.mobilize.us/${slug}/`;
}

export function mobilizeSearchUrl(): string {
  return "https://www.mobilize.us/?q=kelly%20grappe";
}
