/**
 * Production-ready media URLs discovered on www.kellygrappe.com (Squarespace CDN).
 * Swap for self-hosted / CMS assets later; keep alt text honest and documentary.
 */
/** YouTube/SoS hero still (2000×1125) — real photo; not `KG.jpg` (site mark / logo on Squarespace). */
const YOUTUBE_SOS_BANNER =
  "https://images.squarespace-cdn.com/content/v1/69015af815b6db2589f82b24/35318375-cb81-4f5e-970e-3df5ebdb4e18/Youtube+sos+banner+%282000+x+1125+px%29.jpg";

export const brandMediaFromLegacySite = {
  /**
   * Close-up use (donate gate, “porch” section): use the **same** hero photo as the homepage, not
   * `.../KG.jpg` (that file is the campaign wordmark, not a portrait).
   */
  kellyPortrait: `${YOUTUBE_SOS_BANNER}?format=1500w`,
  kellyPortraitAlt: "Kelly Grappe, Arkansas Secretary of State — campaign photo",
  /** Wide hero / video-adjacent still from legacy homepage */
  statewideBanner: YOUTUBE_SOS_BANNER,
  statewideBannerAlt: "Kelly Grappe campaign — Arkansas statewide imagery",
} as const;
