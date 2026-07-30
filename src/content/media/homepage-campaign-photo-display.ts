import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import { resolveRegistryCountyFromLabel } from "@/lib/county/resolve-county-label";

/** County photo albums on the public site (not county command / intelligence pages). */
export function homepagePhotoCountyHref(photo: CampaignPhotoRecord): string | null {
  const county = photo.campaign.county;
  if (!county || county === "Unknown") return null;
  const reg = resolveRegistryCountyFromLabel(county);
  if (!reg?.slug) return null;
  return `/campaign-photos/${reg.slug}`;
}

/**
 * Intentional crop for homepage / gallery cards.
 * Portraits bias slightly toward the upper third (faces / conversation).
 */
export function homepagePhotoObjectPositionClass(photo: CampaignPhotoRecord): string {
  if (photo.basic.orientation === "PORTRAIT") return "object-[50%_20%]";
  if (photo.id.includes("stadium") || photo.id.includes("concourse")) return "object-[50%_35%]";
  return "object-center";
}

/**
 * Decisive one-line captions for curated homepage FEATURE stills (place + action).
 * Unknown geography is not invented — fallback keeps the registry caption.
 */
const HOMEPAGE_DECISIVE_CAPTIONS: Record<string, string> = {
  "afl-cio-pre-event-networking-20260629":
    "Kelly talks with labor attendees before an Arkansas AFL-CIO gathering.",
  "mena-polk-meet-greet-20260411":
    "Mena, Polk County — Kelly visits with voters at a park meet-and-greet.",
  "war-memorial-stadium-concourse-20260320":
    "Little Rock — Kelly on the War Memorial Stadium concourse.",
  "toad-suck-daze-toad-race-20260501":
    "Toad Suck Daze — Kelly at the festival toad race with neighbors.",
  "johnson-county-peach-festival-parade-20260718":
    "Johnson County Peach Festival — Kelly in the parade route crowd.",
  "watermelon-festival-booth-service-20260725":
    "Watermelon Festival — Kelly at the campaign booth with visitors.",
  "stone-porch-door-conversation-20260301":
    "Door conversation on a stone porch — listening first.",
  "elks-lodge-breakfast-table-20260228":
    "Civic breakfast table — Kelly seated with community members.",
};

/** Homepage caption: decisive override when curated; else registry caption. */
export function homepagePhotoCaption(photo: CampaignPhotoRecord): string {
  return HOMEPAGE_DECISIVE_CAPTIONS[photo.id] ?? photo.accessibility.caption;
}
