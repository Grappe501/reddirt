import React from "react";
import type { CampaignMediaRecord } from "@/content/media/campaign-media-types";
import { buildVideoObjectJsonLd, isPublicTranscript, omitUndefinedDeep } from "@/lib/media/campaign-transcript";

export type CampaignVideoStructuredDataProps = {
  media: CampaignMediaRecord;
};

/** Server-rendered VideoObject JSON-LD. Omits empty optionals and unpublished transcripts. */
export function CampaignVideoStructuredData({ media }: CampaignVideoStructuredDataProps) {
  if (media.publicationStatus !== "PUBLISHED") return null;
  const raw = buildVideoObjectJsonLd(media, { includeTranscript: isPublicTranscript(media) });
  const data = omitUndefinedDeep(raw);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
