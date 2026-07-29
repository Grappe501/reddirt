/**
 * Launch photography tier IDs — curation intent for OPERATION ARKANSAS.
 * Homepage wiring still uses HOMEPAGE_* lists; keep Gold IDs in sync when rotating.
 * @see docs/website/LAUNCH_PHOTOGRAPHY_TIERS.md
 */

export const LAUNCH_PHOTO_GOLD_IDS = [
  "mena-polk-meet-greet-20260411",
  "war-memorial-stadium-concourse-20260320",
  "toad-suck-daze-toad-race-20260501",
  "johnson-county-peach-festival-parade-20260718",
  "watermelon-festival-booth-service-20260725",
  "afl-cio-pre-event-networking-20260629",
  "stone-porch-door-conversation-20260301",
  "elks-lodge-breakfast-table-20260228",
] as const;

/** Confirmed-county Gold stills preferred for Across Arkansas band. */
export const LAUNCH_PHOTO_GOLD_CONFIRMED_COUNTY_IDS = [
  "mena-polk-meet-greet-20260411",
  "war-memorial-stadium-concourse-20260320",
  "toad-suck-daze-toad-race-20260501",
  "johnson-county-peach-festival-parade-20260718",
  "watermelon-festival-booth-service-20260725",
] as const;

export const LAUNCH_PHOTO_SILVER_IDS = [
  "cave-city-watermelon-festival-parade-20260725",
  "war-memorial-stadium-community-laugh-20260320",
  "regnat-populus-tent-conversation-20260501",
  "toad-suck-daze-pafford-ems-20260501",
  "toad-suck-daze-tent-first-responders-20260501",
] as const;

export const LAUNCH_VIDEO_GOLD_IDS = [
  "ripples-hot-springs-village",
  "office-belongs-to-the-people",
] as const;
