import "server-only";

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import { UNKNOWN } from "@/content/media/campaign-photo-types";
import {
  COUNTY_DROP_INDEX_REL,
  type CountyDropIndexJson,
} from "@/lib/campaign-media/county-drop-types";

function indexPath(): string {
  return path.join(process.cwd(), COUNTY_DROP_INDEX_REL);
}

export function loadCountyDropIndex(): CountyDropIndexJson {
  const file = indexPath();
  if (!existsSync(file)) return { generatedAt: "", albums: [] };
  try {
    return JSON.parse(readFileSync(file, "utf8")) as CountyDropIndexJson;
  } catch {
    return { generatedAt: "", albums: [] };
  }
}

/** File-backed drop photos as album-eligible campaign records. County comes from the folder, not EXIF. */
export function listCountyDropPhotosAsRecords(): CampaignPhotoRecord[] {
  const now = "2026-09-11T00:00:00.000Z";
  const out: CampaignPhotoRecord[] = [];
  for (const album of loadCountyDropIndex().albums) {
    for (const photo of album.photos) {
      out.push({
        id: photo.id,
        src: photo.src,
        heroLevel: "FEATURE",
        publicationStatus: "PUBLISHED",
        basic: {
          originalFilename: photo.filename,
          width: photo.width,
          height: photo.height,
          fileType: "image/jpeg",
          captureDateIso: UNKNOWN,
        },
        campaign: {
          eventName: "From the trail",
          county: album.countyDisplayName,
          city: UNKNOWN,
          venue: UNKNOWN,
          eventDate: UNKNOWN,
          photographer: UNKNOWN,
          peopleVisible: [],
          organizations: [],
          campaignTheme: UNKNOWN,
          relatedIssue: UNKNOWN,
          relatedSpeechVideoIds: [],
          relatedBlogPaths: [],
          relatedEventIds: [],
          relatedPagePaths: ["/campaign-photos"],
          homepageCandidate: false,
          featuredPhoto: false,
          approvedForPublic: true,
        },
        accessibility: {
          altText: `Campaign photo from ${album.countyDisplayName}`,
          caption: `From the trail in ${album.shortName} County.`,
        },
        createdAt: now,
        updatedAt: now,
      });
    }
  }
  return out;
}
