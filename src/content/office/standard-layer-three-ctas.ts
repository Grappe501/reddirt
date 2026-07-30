import { getVolunteerSignupHref } from "@/config/external-campaign";
import { voterRegistrationHref } from "@/config/navigation";
import type { OfficeLayerThreeCopy } from "@/content/office/office-types";

/** Unified Layer 3 soft CTAs for all Office pathways — same order everywhere. */
export const STANDARD_OFFICE_LAYER_THREE_SOFT_CTAS: OfficeLayerThreeCopy["softCtas"] = [
  { label: "Meet Kelly", href: "/about" },
  { label: "Why I'm running", href: "/about/why-im-running" },
  { label: "Vote / Register", href: voterRegistrationHref },
  { label: "Volunteer", href: getVolunteerSignupHref() },
];
