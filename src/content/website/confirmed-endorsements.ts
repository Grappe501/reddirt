/**
 * Confirmed public endorsements — campaign-record canon for launch surfaces.
 * Do not invent dates, quotes, or logos. Breadth of coalition > ranking of names.
 * @see docs/website/CAMPAIGN_EXPERIENCE_REVIEW_DOCTRINE.md
 */

export type ConfirmedEndorsement = {
  id: string;
  /** Coalition lens — what this support represents, not a rank order */
  coalitionLabel: "Working People" | "Educators" | "Community Leadership" | "Civic & Political Advocacy";
  name: string;
  status: "Endorsed";
  /** One factual sentence: who they are */
  description: string;
  /** ISO or human label only when confirmed; omit rather than guess */
  announcedDateLabel?: string;
  relatedPhotoId?: string;
  /** Clarifies photo vs endorsement moment when they differ */
  relatedPhotoNote?: string;
  sourceNote?: string;
  homepage: boolean;
};

/**
 * Launch set authorized by campaign (Steve) for public surfaces.
 * Quotes and announcement URLs stay off until separately approved.
 */
export const CONFIRMED_ENDORSEMENTS: readonly ConfirmedEndorsement[] = [
  {
    id: "arkansas-afl-cio",
    coalitionLabel: "Working People",
    name: "Arkansas AFL-CIO",
    status: "Endorsed",
    description: "Represents workers from affiliated labor organizations across Arkansas.",
    relatedPhotoId: "afl-cio-pre-event-networking-20260629",
    sourceNote: "Campaign-confirmed endorsement for Arkansas Secretary of State.",
    homepage: true,
  },
  {
    id: "arkansas-education-association",
    coalitionLabel: "Educators",
    name: "Arkansas Education Association",
    status: "Endorsed",
    description: "Represents educators across Arkansas.",
    sourceNote: "Campaign-confirmed endorsement for Arkansas Secretary of State.",
    homepage: true,
  },
  {
    id: "josh-irby",
    coalitionLabel: "Community Leadership",
    name: "Josh Irby",
    status: "Endorsed",
    description: "Arkansas State Senate candidate offering community leadership support for this race.",
    sourceNote: "Campaign-confirmed individual endorsement.",
    homepage: true,
  },
  {
    id: "progressive-arkansas-women-pac",
    coalitionLabel: "Civic & Political Advocacy",
    name: "Progressive Arkansas Women PAC",
    status: "Endorsed",
    description: "Supports progressive women candidates for state and local office in Arkansas.",
    sourceNote: "Campaign-confirmed endorsement for Arkansas Secretary of State.",
    homepage: true,
  },
] as const;

export function listHomepageEndorsements(): ConfirmedEndorsement[] {
  return CONFIRMED_ENDORSEMENTS.filter((e) => e.homepage);
}

export function listConfirmedEndorsements(): ConfirmedEndorsement[] {
  return [...CONFIRMED_ENDORSEMENTS];
}
