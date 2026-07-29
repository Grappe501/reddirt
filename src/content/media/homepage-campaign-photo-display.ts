import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import { resolveRegistryCountyFromLabel } from "@/lib/county/resolve-county-label";

/** County pages may link only when county is confirmed (not Unknown). */
export function homepagePhotoCountyHref(photo: CampaignPhotoRecord): string | null {
  const county = photo.campaign.county;
  if (!county || county === "Unknown") return null;
  const reg = resolveRegistryCountyFromLabel(county);
  if (!reg?.slug) return null;
  return `/counties/${reg.slug}`;
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
