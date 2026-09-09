import type { WritingActorId } from "../writing-intelligence/contracts";

export const CAMPAIGN_PRIORITIES_VERSION = "campaign-priorities-1.0" as const;
export const CAMPAIGN_PRIORITIES_ACCESSED = "2026-09-09" as const;

export type CampaignPriority = {
  id: string;
  label: string;
  sourceState: "OBSERVED";
  summary: string;
  items: string[];
  sourceUrl: string;
  sourceTitle: string;
};

export type CampaignPrioritySnapshot = {
  actorId: WritingActorId;
  campaignSite: string;
  slogan: string;
  authorshipConfidence: "ATTRIBUTED";
  accessed: string;
  livingPages: true;
  priorities: CampaignPriority[];
  excluded: string[];
  uncertainty: string[];
};

const JONES_HOME = "https://chrisjonesforcongress.com/";
const JONES_AFFORD = "https://chrisjonesforcongress.com/affordability/";
const JONES_ACCOUNT = "https://chrisjonesforcongress.com/accountability/";
const JONES_OPP = "https://chrisjonesforcongress.com/opportunity/";
const JONES_ABOUT = "https://chrisjonesforcongress.com/about/";
const HILL_HOME = "https://www.electfrench.com/";

export const jonesCampaignPriorities: CampaignPrioritySnapshot = {
  actorId: "chris-jones-ar02",
  campaignSite: JONES_HOME,
  slogan: "A Bigger Table. A Brighter Future.",
  authorshipConfidence: "ATTRIBUTED",
  accessed: CAMPAIGN_PRIORITIES_ACCESSED,
  livingPages: true,
  priorities: [
    {
      id: "affordability",
      label: "Affordability For All",
      sourceState: "OBSERVED",
      summary: "Families should be able to live, work, raise children, and retire in Arkansas without constantly falling behind.",
      items: [
        "Safe, affordable housing for owners, renters, and first-time buyers; lower in-home energy costs",
        "Quality, affordable healthcare and lower out-of-pocket costs",
        "Education, workforce training, and lifelong learning",
        "Retirement security and savings",
        "Affordable, accessible childcare",
      ],
      sourceUrl: JONES_AFFORD,
      sourceTitle: "Affordability For All",
    },
    {
      id: "accountability",
      label: "Accountability For All",
      sourceState: "OBSERVED",
      summary: "A government that answers to the People, with clearer ethics and public-funding accountability.",
      items: [
        "Stronger ethical standards and transparent communication",
        "Officials explain decisions and handle public funding responsibly",
        "Campaign-finance disclosure reform",
        "Policies against fraud and misconduct by elected officials",
        "Encourage election participation and civil debate",
      ],
      sourceUrl: JONES_ACCOUNT,
      sourceTitle: "Accountability For All",
    },
    {
      id: "opportunity",
      label: "Opportunity For All",
      sourceState: "OBSERVED",
      summary: "Opportunity is framed as the outcome of affordability plus accountability.",
      items: [
        "Rural development so place does not determine opportunity",
        "Small-business and entrepreneur support: financing, training, market access",
        "Workforce development matched to current and future labor needs",
        "Reliable high-speed internet, especially rural and underserved areas",
        "Attract investment, talent, and innovation",
      ],
      sourceUrl: JONES_OPP,
      sourceTitle: "Opportunity For All",
    },
    {
      id: "jobs-economy",
      label: "Jobs & Local Economy",
      sourceState: "OBSERVED",
      summary: "Good jobs, fair wages, small-business growth, high-quality internet, and rural hospitals that stay open.",
      items: ["Good jobs close to home", "Fair wages", "Small business growth", "High-quality internet", "Rural hospitals stay open"],
      sourceUrl: JONES_HOME,
      sourceTitle: "Chris Jones for Congress — commitment",
    },
    {
      id: "families-health",
      label: "Families & Health",
      sourceState: "OBSERVED",
      summary: "Stronger schools, comprehensive maternal health support, addiction recovery, and food security.",
      items: ["Stronger schools", "Comprehensive maternal health support", "Addiction support and recovery", "Food security"],
      sourceUrl: JONES_HOME,
      sourceTitle: "Chris Jones for Congress — commitment",
    },
    {
      id: "schools-innovation",
      label: "Schools & Innovation",
      sourceState: "OBSERVED",
      summary: "Invest in people: early childhood, apprenticeships, technology and trades training.",
      items: ["Early childhood education", "Hands-on apprenticeships", "Technology and trades training"],
      sourceUrl: JONES_HOME,
      sourceTitle: "Chris Jones for Congress — commitment",
    },
    {
      id: "democracy",
      label: "Democracy for the People",
      sourceState: "OBSERVED",
      summary: "Fair maps, secure and accessible elections, a government you can trust, and leaders who listen.",
      items: ["Fair maps", "Secure and accessible elections", "Trustworthy government", "Leaders who listen"],
      sourceUrl: JONES_HOME,
      sourceTitle: "Chris Jones for Congress — commitment",
    },
    {
      id: "four-legs",
      label: "Four legs of the table",
      sourceState: "OBSERVED",
      summary: "About page: justice, economy, democracy, and innovation.",
      items: [
        "Justice that treats every Arkansan with dignity",
        "An economy that allows people to prosper",
        "A democracy that reflects the will of the people",
        "Innovation that prepares for coming challenges",
        "Economy / Democracy / Growth / Entrepreneurship as named about-page headings",
      ],
      sourceUrl: JONES_ABOUT,
      sourceTitle: "Meet Chris",
    },
  ],
  excluded: [
    "Fundraising poll graphics and horse-race claims are campaign chrome, not ingested as facts.",
    "No mailbox, donor, or volunteer PII was stored.",
  ],
  uncertainty: [
    "Campaign pages are living documents without stable published dates. Accessed 2026-09-09.",
    "Campaign copy is ATTRIBUTED office/campaign voice, not a claim every sentence was personally typed.",
    "Poll numbers and opponent characterizations on these pages are not treated as facts about Hill.",
  ],
};

export const hillCampaignPriorities: CampaignPrioritySnapshot = {
  actorId: "french-hill-ar02",
  campaignSite: HILL_HOME,
  slogan: "Promises Made. Promises Kept.",
  authorshipConfidence: "ATTRIBUTED",
  accessed: CAMPAIGN_PRIORITIES_ACCESSED,
  livingPages: true,
  priorities: [
    {
      id: "taxes-jobs",
      label: "Taxes, jobs & economic prosperity",
      sourceState: "OBSERVED",
      summary: "Campaign lead issue: tax cuts, inflation, housing supply, capital access, and digital-asset rules.",
      items: [
        "Working Families Tax Cut: no tax on tips or overtime; expanded HSAs; adoption credits; agriculture/rural lending relief; Invest in America child accounts",
        "Senior deduction tied to Social Security tax relief (campaign-stated, with Trump)",
        "Price Stability Act — inflation focus for groceries and gasoline",
        "Lower Healthcare Premiums for All Americans Act",
        "21st Century Housing Bill — modernize programs, cut regulatory roadblocks, more homes",
        "Little Rock Port airport-navigation relocation — campaign-stated industrial site",
        "Stablecoin framework; INVEST Act capital access; S-CAP worker ownership; 15% long-term capital-gains cap; AI in financial services",
      ],
      sourceUrl: HILL_HOME,
      sourceTitle: "French on the Issues",
    },
    {
      id: "border",
      label: "Fighting illegal immigration & securing our border",
      sourceState: "OBSERVED",
      summary: "Campaign states all states are border states; cites eight trips in nine years.",
      items: [
        "Secure the Border Act and No Sanctuary for Criminals Act",
        "Preventing Overdoses and Saving Lives Act 2.0 and Fentanyl Sanctions Act (campaign-stated signed)",
        "Laken Riley Act — mandatory detention for certain criminal charges",
      ],
      sourceUrl: HILL_HOME,
      sourceTitle: "French on the Issues",
    },
    {
      id: "veterans",
      label: "Supporting America's heroes",
      sourceState: "OBSERVED",
      summary: "Fisher House on the VA campus and veterans casework; several 2025 bills marked as not yet law.",
      items: [
        "Fisher House at the VA hospital campus",
        "Campaign-stated casework: 2,000 closed cases and $93 million recovered — not independently verified here",
        "Veterans Benefits Expansion Act of 2025; Major Richard Star Act of 2025; Shari Briley and Eric Edmundson bill — starred as not yet passed",
      ],
      sourceUrl: HILL_HOME,
      sourceTitle: "French on the Issues",
    },
    {
      id: "seniors",
      label: "Standing strong for Arkansas seniors",
      sourceState: "OBSERVED",
      summary: "Disability-to-work awareness, public-pension Social Security fix, and a senior tax deduction.",
      items: [
        "Ticket to Work Advertisement Act",
        "Social Security Fairness Act (campaign-stated signed)",
        "Working Families tax package senior deduction (campaign-stated)",
      ],
      sourceUrl: HILL_HOME,
      sourceTitle: "French on the Issues",
    },
    {
      id: "conservation",
      label: "Conservation for the Natural State",
      sourceState: "OBSERVED",
      summary: "Flatside Wilderness and Little Red River sustainable-rivers work.",
      items: [
        "Flatside Wilderness Act (campaign-stated signed January 10, 2019)",
        "Later expansion adding 2,200 national-forest acres (campaign-stated)",
        "Army Corps / Energy funding so the Little Red River stays in the sustainable rivers program",
      ],
      sourceUrl: HILL_HOME,
      sourceTitle: "French on the Issues",
    },
    {
      id: "fiscal",
      label: "Draining the tax & spend swamp",
      sourceState: "OBSERVED",
      summary: "Golden Fleece waste highlights and balanced-budget amendments.",
      items: ["Golden Fleece Award for federal spending waste", "Two sponsored balanced-budget amendments"],
      sourceUrl: HILL_HOME,
      sourceTitle: "French on the Issues",
    },
    {
      id: "family-values",
      label: "Arkansas conservative family values",
      sourceState: "OBSERVED",
      summary: "Campaign-stated social positions. Not used as simulated attack content unless the opening raises them.",
      items: ["Protecting the unborn", "Second Amendment", "Religious liberty at home and abroad"],
      sourceUrl: HILL_HOME,
      sourceTitle: "French on the Issues",
    },
  ],
  excluded: [
    "Endorsement lists and scorecards are not treated as issue priorities.",
    "Family names and volunteer-form fields were not stored.",
    "Official hill.house.gov newsletters remain a separate official-office corpus.",
  ],
  uncertainty: [
    "Campaign pages are living documents without stable published dates. Accessed 2026-09-09.",
    "Legislative outcome claims on the campaign site are ATTRIBUTED campaign statements unless separately confirmed.",
    "Casework dollar and count figures are campaign-stated, not audited in this ingest.",
    "Opponent-campaign characterizations are not ingested as facts about Jones.",
  ],
};

export function getCampaignPrioritySnapshot(actorId?: string): CampaignPrioritySnapshot | null {
  if (actorId === "chris-jones-ar02") return jonesCampaignPriorities;
  if (actorId === "french-hill-ar02") return hillCampaignPriorities;
  return null;
}

export function formatCampaignPrioritiesPromptLine(actorId?: string): string {
  const snap = getCampaignPrioritySnapshot(actorId);
  if (!snap) return "";
  const labels = snap.priorities.map((item) => item.label).join("; ");
  return `Immediate campaign priorities (${snap.authorshipConfidence}, living pages accessed ${snap.accessed}): ${labels}.`;
}
