export const OFFICE_AREA_SLUGS = ["elections", "business", "records", "capitol"] as const;
export type OfficeAreaSlug = (typeof OFFICE_AREA_SLUGS)[number];

export type OfficeSectionBlock = {
  heading?: string;
  paragraphs: readonly string[];
};

export type OfficeCard = {
  title: string;
  body: string;
};

export type OfficeLayerCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: readonly OfficeSectionBlock[];
  cards?: readonly OfficeCard[];
};

export type OfficeLayerThreeCopy = OfficeLayerCopy & {
  softCtas: readonly { label: string; href: string }[];
};

export type OfficeAreaConfig = {
  slug: OfficeAreaSlug;
  title: string;
  shortTitle: string;
  navLabel: string;
  metaDescription: string;
  /** Default: "See why this matters" */
  layerOneNextLabel?: string;
  /** Default: "See the full picture" */
  layerTwoNextLabel?: string;
  layerOne: OfficeLayerCopy;
  layerTwo: OfficeLayerCopy;
  layerThree: OfficeLayerThreeCopy;
  /** Optional proof band linking to the campaign trail (Layer 3 only). */
  layerThreeTrailProof?: {
    title: string;
    body: string;
    ctaLabel: string;
    ctaHref: string;
  };
  relatedLinks?: readonly { label: string; href: string }[];
};
