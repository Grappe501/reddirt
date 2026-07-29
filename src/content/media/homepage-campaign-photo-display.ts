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
