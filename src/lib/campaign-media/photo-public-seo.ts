import { siteConfig } from "@/config/site";
import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import type { CountyAlbum } from "@/lib/campaign-media/county-albums";

function absoluteUrl(path: string): string {
  const base = siteConfig.url.replace(/\/$/, "");
  return path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

function placeLabel(photo: CampaignPhotoRecord): string {
  const county = photo.campaign.county?.trim();
  if (county && county !== "Unknown") return county;
  return "Arkansas";
}

function isThinAlt(alt: string): boolean {
  return !alt || /^campaign photo from /i.test(alt) || /^from the trail in /i.test(alt);
}

/** Honest, entity-rich alt — never invents a city, venue, or scene. */
export function publicPhotoAlt(
  photo: CampaignPhotoRecord,
  opts?: { index?: number; total?: number },
): string {
  const existing = photo.accessibility.altText?.trim() ?? "";
  const place = placeLabel(photo);
  const n =
    opts?.index != null && opts.total
      ? ` — photo ${opts.index + 1} of ${opts.total}`
      : "";

  if (!isThinAlt(existing)) {
    const hasPlace = existing.toLowerCase().includes(place.toLowerCase().replace(/\s+county$/i, ""));
    return hasPlace ? existing : `${existing} ${place}, Arkansas.`;
  }

  return `Kelly Grappe, candidate for Arkansas Secretary of State, campaigning in ${place}, Arkansas${n}`;
}

export function publicPhotoCaption(
  photo: CampaignPhotoRecord,
  opts?: { index?: number; total?: number },
): string {
  const existing = photo.accessibility.caption?.trim() ?? "";
  const place = placeLabel(photo);
  if (existing && !isThinAlt(existing) && !/^from the trail in /i.test(existing)) {
    return existing;
  }
  const n =
    opts?.index != null && opts.total ? ` Photo ${opts.index + 1} of ${opts.total}.` : "";
  return `Kelly Grappe campaigning in ${place}, Arkansas, on the trail for Secretary of State.${n}`;
}

export function publicPhotoTitle(photo: CampaignPhotoRecord): string {
  const place = placeLabel(photo);
  return `Kelly Grappe in ${place}, Arkansas — campaign photo`;
}

export function countyAlbumJsonLd(album: CountyAlbum): Record<string, unknown> {
  const pageUrl = absoluteUrl(`/campaign-photos/${album.countySlug}`);
  const photos = album.events.flatMap((ev) => ev.photos);
  return {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: `${album.shortName} County campaign photos — Kelly Grappe for Arkansas Secretary of State`,
    description: `Photos of Kelly Grappe campaigning in ${album.countyDisplayName}, Arkansas, for Secretary of State.`,
    url: pageUrl,
    about: {
      "@type": "Person",
      name: "Kelly Grappe",
      jobTitle: "Candidate for Arkansas Secretary of State",
      url: absoluteUrl("/"),
    },
    contentLocation: {
      "@type": "AdministrativeArea",
      name: `${album.countyDisplayName}, Arkansas`,
    },
    image: photos.map((photo, index) => ({
      "@type": "ImageObject",
      contentUrl: absoluteUrl(photo.src),
      url: pageUrl,
      name: publicPhotoTitle(photo),
      description: publicPhotoAlt(photo, { index, total: photos.length }),
      copyrightHolder: {
        "@type": "Organization",
        name: "Kelly Grappe for Secretary of State",
      },
    })),
  };
}

export function countyAlbumsIndexJsonLd(albums: CountyAlbum[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Campaign photos by Arkansas county — Kelly Grappe for Secretary of State",
    description:
      "County-by-county campaign photos of Kelly Grappe, candidate for Arkansas Secretary of State.",
    url: absoluteUrl("/campaign-photos"),
    about: {
      "@type": "Person",
      name: "Kelly Grappe",
      jobTitle: "Candidate for Arkansas Secretary of State",
      url: absoluteUrl("/"),
    },
    hasPart: albums.map((album) => ({
      "@type": "ImageGallery",
      name: `${album.shortName} County campaign photos`,
      url: absoluteUrl(`/campaign-photos/${album.countySlug}`),
      numberOfItems: album.photoCount,
    })),
  };
}
