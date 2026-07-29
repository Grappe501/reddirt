/**
 * Consent / publish safety for sensitive campaign stills.
 */

/** Hold for explicit Steve + family/guardian confirmation before any public surface. */
export const CONSENT_HOLD_PHOTO_IDS = new Set([
  "personal-family-moment-20260707",
]);

export function photoRequiresConsentHold(photoId: string, notes?: string): boolean {
  if (CONSENT_HOLD_PHOTO_IDS.has(photoId)) return true;
  const n = (notes ?? "").toLowerCase();
  return n.includes("minor in frame") || n.includes("minors prominently");
}

export function publicPublishBlockedByConsent(input: {
  photoId: string;
  notes?: string;
  approvedForPublic: boolean;
  homepageCandidate: boolean;
  publicationStatus?: string;
  consentConfirmed: boolean;
}): string | null {
  if (!photoRequiresConsentHold(input.photoId, input.notes)) return null;
  const wantsPublic =
    input.approvedForPublic ||
    input.homepageCandidate ||
    input.publicationStatus === "APPROVED" ||
    input.publicationStatus === "PUBLISHED";
  if (!wantsPublic) return null;
  if (input.consentConfirmed) return null;
  return "This still is on consent hold (minor / family). Check “Consent confirmed by Steve/family” before public or homepage flags.";
}
