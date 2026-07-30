/**
 * Verified Kelly credentials for Office Layer 3 ("What Kelly Brings").
 * No headcounts, rank claims, or unsourced election assertions.
 * @see docs/website/KELLY_BIOGRAPHY_VERIFICATION_MATRIX.md
 */

import { KELLY_LINKEDIN_URL } from "@/content/office/office-layer-labels";
import type { OfficeSectionBlock } from "@/content/office/office-types";

export const kellyBringsTelecomSection: OfficeSectionBlock = {
  heading: "Operations and training experience",
  paragraphs: [
    "Kelly spent nearly twenty-five years with Alltel and then Verizon in operations and training roles—leading teams, mapping workflows, and keeping customer-facing systems functioning when deadlines and volume spike.",
    "Specific titles, dates, and scope are on her public LinkedIn profile for independent verification.",
  ],
};

export const kellyBringsSmallBusinessSection: OfficeSectionBlock = {
  heading: "Small-business ground truth",
  paragraphs: [
    "Kelly and her husband built farm and market operations at Forevermost Farms in Rose Bud—permits, cash flow, vendors, and the daily work of keeping a lawful small enterprise running in rural Arkansas.",
    "That experience informs how she thinks about filers who do not have a compliance department on speed dial.",
  ],
};

export const kellyBringsCivicSection: OfficeSectionBlock = {
  heading: "Civic leadership",
  paragraphs: [
    "Kelly helps lead Stand Up Arkansas, a nonprofit focused on voter education and community engagement—recruiting, training, and activating leaders across the state.",
    "Grassroots organizing reinforced a simple lesson: when process is intelligible, people show up and follow through.",
  ],
};

export const kellyBringsLinkedInNote =
  `Career record: ${KELLY_LINKEDIN_URL}` as const;

/** Area-specific Layer 3 closers — expectations, not promises. */
export const kellyBringsStewardshipCloser: OfficeSectionBlock = {
  heading: "Preparedness, not persuasion",
  paragraphs: [
    "Kelly enters this race with decades inside complex operations, small-business experience, and civic work in plain sight—not slogans invented for a brochure.",
    "Voters can verify the organizations and professional record linked from Meet Kelly. Explore Office priorities for how Kelly approaches the work of this office.",
  ],
};
