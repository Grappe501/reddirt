import { getJoinCampaignHref } from "@/config/external-campaign";
import { voterRegistrationHref } from "@/config/navigation";
import type { OfficeLayerThreeCopy } from "@/content/office/office-types";

/** Unified Layer 3 soft CTAs for all Office pathways — same order everywhere. */
export const STANDARD_OFFICE_LAYER_THREE_SOFT_CTAS: OfficeLayerThreeCopy["softCtas"] = [
  { label: "Meet Kelly", href: "/about" },
  { label: "Why Kelly", href: "/about/why-kelly" },
  { label: "Vote / Register", href: voterRegistrationHref },
  { label: "Volunteer", href: getJoinCampaignHref() },
];
