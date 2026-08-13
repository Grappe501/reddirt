import { getVolunteerSignupHref } from "@/config/external-campaign";
import { voterRegistrationHref } from "@/config/navigation";
import type { OfficeLayerThreeCopy } from "@/content/office/office-types";

/** Unified Layer 3 soft CTAs for all Office pathways — same order everywhere. */
export const STANDARD_OFFICE_LAYER_THREE_SOFT_CTAS: OfficeLayerThreeCopy["softCtas"] = [
  { label: "Campaign Videos", href: "/kelly-speaks" },
  { label: "Why this race matters", href: "/office/why-this-race-matters" },
  { label: "Vote / Register", href: voterRegistrationHref },
  { label: "Volunteer", href: getVolunteerSignupHref() },
];
