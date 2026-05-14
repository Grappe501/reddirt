/** File-staged media registry (no large binaries in git). */

export type MediaVisibility = "public" | "private" | "internal";

export type MediaUsableFor = "website" | "social" | "press" | "internal_only";

export type CountyMediaMetadata = {
  id: string;
  county: string;
  city?: string;
  eventId?: string;
  eventDate?: string;
  venue?: string;
  photographer?: string;
  source?: string;
  description?: string;
  aiCaption?: string;
  altText?: string;
  tags: string[];
  visibility: MediaVisibility;
  usableFor: MediaUsableFor[];
  peopleShown?: string[];
  storagePath: string;
  thumbnailPath?: string;
  createdAt: string;
};

export type MediaIndexFile = {
  version: 1;
  items: CountyMediaMetadata[];
};
