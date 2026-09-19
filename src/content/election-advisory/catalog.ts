export const AEAC_BASE = "/election-advisory";

export const AEAC_NAME = "Arkansas Election Advisory Commission";
export const AEAC_SHORT_NAME = "Election Advisory Commission";
export const AEAC_PUBLIC_DOMAIN = "www.arelectionadvisory.org";
export const AEAC_MOTTO_LATIN = "Regnat Populus";
export const AEAC_MOTTO_EN = "The People Rule.";

export const AEAC_CONTACT_EMAIL = "kelly@kellygrappe.com";
export const AEAC_ORGANIZER_NAME = "Kelly Grappe";
export const AEAC_ORGANIZER_ROLE = "Candidate for Arkansas Secretary of State";

export type AeacNavItem = {
  href: string;
  label: string;
};

export const aeacNavPaths: { path: string; label: string }[] = [
  { path: "", label: "Home" },
  { path: "charter", label: "Charter" },
  { path: "charge", label: "Our Charge" },
  { path: "how-we-work", label: "How We Work" },
  { path: "meetings", label: "Meetings" },
  { path: "findings", label: "Findings" },
  { path: "concerns", label: "Share a Concern" },
  { path: "participate", label: "Participate" },
  { path: "updates", label: "Updates" },
  { path: "about", label: "About" },
];

export function aeacNavItemsForBase(base: string): AeacNavItem[] {
  return aeacNavPaths.map((item) => ({
    href: item.path ? `${base}/${item.path}` : base || "/",
    label: item.label,
  }));
}

export const aeacNavItems: AeacNavItem[] = aeacNavItemsForBase(AEAC_BASE);

export const aeacDefinition =
  "The Arkansas Election Advisory Commission will be a continuing, nonpartisan advisory body focused on strengthening confidence in Arkansas elections through evidence, transparency, collaboration and continuous improvement.";

export const aeacMission =
  "The Commission will bring together Arkansans with different responsibilities, expertise and perspectives to examine our election systems and processes, ask difficult questions, identify opportunities for improvement and develop practical recommendations. The Commission will also identify opportunities to improve public understanding of Arkansas elections through clear, factual voter education and communication.";

export const aeacGoal =
  "The goal of the Commission is to build and restore trust in Arkansas elections. That trust cannot be demanded; it must be earned through secure systems, sound processes, transparency, accountability and a willingness to ask hard questions. When Arkansans understand and trust the process, they are more likely to participate in it—whether by registering to vote, serving as poll workers or election volunteers, or exercising their right to vote. The Commission will look honestly at what is working, where improvements can be made, and what concerns deserve deeper examination so that more Arkansans have both the confidence and the opportunity to participate in our elections.";

export const aeacBottomLine =
  "The goal is to discuss concerns, develop practical solutions, and create an informed public based on objective evidence and collaboration across varied viewpoints. It is to strengthen Arkansas elections, better support the people who administer them, answer legitimate questions with facts, and make the safeguards protecting every Arkansan’s vote easier to see and understand.";

export type AeacChargePhase = "before" | "during" | "after" | "across";

export type AeacChargeItem = {
  id: string;
  phase: AeacChargePhase;
  title: string;
  detail: string;
};

export const aeacChargePhases: {
  id: AeacChargePhase;
  label: string;
  summary: string;
}[] = [
  {
    id: "before",
    label: "Before the Election",
    summary: "The systems, people, and public information that have to be ready long before anyone casts a ballot.",
  },
  {
    id: "during",
    label: "During the Election",
    summary: "How Arkansans vote, how those votes are protected, and how the experience works in real counties.",
  },
  {
    id: "after",
    label: "After the Election",
    summary: "How results are counted, checked, certified, and explained so the public can see the work.",
  },
  {
    id: "across",
    label: "Across the Election Cycle",
    summary: "Emerging risks and opportunities that do not fit neatly into one day on the calendar.",
  },
];

export const aeacChargeItems: AeacChargeItem[] = [
  {
    id: "election_security_cybersecurity",
    phase: "before",
    title: "Election security and cybersecurity",
    detail:
      "Examine how Arkansas election systems are protected, how risks are identified, and how counties and the state can stay ahead of threats without shutting the public out of the conversation.",
  },
  {
    id: "voter_registration_list_maintenance",
    phase: "before",
    title: "Voter registration and list maintenance",
    detail:
      "Look at how Arkansans get on the rolls, stay on the rolls, and how list maintenance can be accurate, lawful, and understandable.",
  },
  {
    id: "county_staffing_poll_workers",
    phase: "before",
    title: "County staffing, poll workers, resources and costs",
    detail:
      "Understand the people who actually run elections: recruitment, training, staffing, resources, and the real cost of doing this work well in all 75 counties.",
  },
  {
    id: "vendors_procurement_infrastructure",
    phase: "before",
    title: "Vendors, procurement and election infrastructure",
    detail:
      "Review how equipment and services are procured, who is accountable for them, and what infrastructure counties depend on.",
  },
  {
    id: "transparency_voter_education",
    phase: "before",
    title: "Transparency, voter education and public communication",
    detail:
      "Identify clearer ways to explain Arkansas elections so people can see the process before rumors fill the silence.",
  },
  {
    id: "voting_equipment_technology",
    phase: "during",
    title: "Voting equipment and technology",
    detail:
      "Examine certification, testing, evaluation, and public demonstration of the equipment used in Arkansas elections.",
  },
  {
    id: "paper_ballots",
    phase: "during",
    title: "Paper ballots",
    detail:
      "Review current Arkansas law and practices, county experiences, and established best practices—without a predetermined conclusion.",
  },
  {
    id: "absentee_early_voting",
    phase: "during",
    title: "Absentee and early voting",
    detail:
      "Look at how Arkansans vote before Election Day, including access, verification, and county administration.",
  },
  {
    id: "accessibility_voter_experience",
    phase: "during",
    title: "Accessibility and voter experience",
    detail:
      "Ask whether every eligible Arkansan can understand the process, reach the polls, and vote with dignity.",
  },
  {
    id: "verification_physical_security",
    phase: "during",
    title: "Verification, physical security and chain of custody",
    detail:
      "Follow the ballot: how votes are verified, how materials are secured, and how chain of custody is documented.",
  },
  {
    id: "tabulation_reporting_certification",
    phase: "after",
    title: "Tabulation, reporting and certification",
    detail:
      "Examine how results move from precinct to certification, and how that path can be clearer to the public.",
  },
  {
    id: "post_election_audits",
    phase: "after",
    title: "Post-election audits",
    detail:
      "Review current Arkansas law and procedures, previous audit findings, and established best practices.",
  },
  {
    id: "results_transparency",
    phase: "after",
    title: "Transparency of election results and processes",
    detail:
      "Make the after-action record easier to see: what happened, what was checked, and what the public can inspect.",
  },
  {
    id: "emerging_risks_technologies",
    phase: "across",
    title: "Emerging risks, technologies and opportunities",
    detail:
      "Watch what is changing—new tools, new threats, and new chances to improve—through an Arkansas-first lens.",
  },
];

export const electionAdvisoryTopicValues = [
  "election_security_cybersecurity",
  "voter_registration_list_maintenance",
  "county_staffing_poll_workers",
  "vendors_procurement_infrastructure",
  "transparency_voter_education",
  "voting_equipment_technology",
  "paper_ballots",
  "absentee_early_voting",
  "accessibility_voter_experience",
  "verification_physical_security",
  "tabulation_reporting_certification",
  "post_election_audits",
  "results_transparency",
  "emerging_risks_technologies",
  "other",
] as const;

export type ElectionAdvisoryTopic = (typeof electionAdvisoryTopicValues)[number];

export const electionAdvisoryTopicLabels: Record<ElectionAdvisoryTopic, string> = {
  election_security_cybersecurity: "Election security and cybersecurity",
  voter_registration_list_maintenance: "Voter registration and list maintenance",
  county_staffing_poll_workers: "County staffing and poll workers",
  vendors_procurement_infrastructure: "Vendors, procurement and infrastructure",
  transparency_voter_education: "Transparency and voter education",
  voting_equipment_technology: "Voting equipment and technology",
  paper_ballots: "Paper ballots",
  absentee_early_voting: "Absentee and early voting",
  accessibility_voter_experience: "Accessibility and voter experience",
  verification_physical_security: "Verification and chain of custody",
  tabulation_reporting_certification: "Tabulation, reporting and certification",
  post_election_audits: "Post-election audits",
  results_transparency: "Results transparency",
  emerging_risks_technologies: "Emerging risks and technologies",
  other: "Another topic",
};

export const electionAdvisoryRoleValues = [
  "committee_member",
  "topic_expertise",
  "facilitator",
  "county_official_after_election",
  "observer_public",
  "not_sure",
] as const;

export type ElectionAdvisoryRole = (typeof electionAdvisoryRoleValues)[number];

export const electionAdvisoryRoleLabels: Record<ElectionAdvisoryRole, string> = {
  committee_member: "I want to be considered for a committee seat",
  topic_expertise: "I have expertise or a particular interest in a topic",
  facilitator: "I could help as a nonpartisan facilitator",
  county_official_after_election: "I hold a county or state election role and should wait until after the election",
  observer_public: "I want to follow the work as a member of the public",
  not_sure: "I am not sure yet — keep me in the conversation",
};

export type AeacPrinciple = {
  id: string;
  title: string;
  body: string;
};

export const aeacPrinciples: AeacPrinciple[] = [
  {
    id: "listen-first",
    title: "Listen first",
    body: "County election officials, technical experts, citizens and people with differing perspectives should have a meaningful place in the conversation.",
  },
  {
    id: "follow-evidence",
    title: "Follow evidence",
    body: "The Commission will begin without a predetermined conclusion, technology or policy.",
  },
  {
    id: "respect-structure",
    title: "Respect Arkansas’ election structure",
    body: "The Commission is advisory and will respect the legal responsibilities of county election officials and other state and local authorities.",
  },
  {
    id: "whole-system",
    title: "Consider the whole system",
    body: "Recommendations will consider security, accuracy, accessibility, cost, staffing, voter experience and operational impact.",
  },
  {
    id: "transparent",
    title: "Be transparent and accountable",
    body: "The Commission is a working body, and its deliberative meetings may be structured to encourage candid discussion. Its work will be transparent, with meeting minutes, findings, supporting information and recommendations made available to the public. Transparency is foundational to the Commission and essential to building trust.",
  },
  {
    id: "focus-arkansas",
    title: "Focus on Arkansas",
    body: "This is about Arkansas elections. We will focus on local data, use local expertise, and make practical recommendations based on what works here in our state.",
  },
];

export const aeacHomePaths = [
  {
    path: "concerns",
    kicker: "Public questions",
    title: "Share a concern",
    body: "Send a question or concern the Commission should be prepared to answer with facts.",
  },
  {
    path: "participate",
    kicker: "The who",
    title: "Join the work",
    body: "Raise your hand for a committee seat, a topic you know well, or a particular interest.",
  },
  {
    path: "updates",
    kicker: "Stay close",
    title: "Get regular updates",
    body: "Sign up for meeting notices, notes, findings, and public communications.",
  },
  {
    path: "meetings",
    kicker: "The record",
    title: "Meetings and notes",
    body: "The public schedule, minutes, and supporting materials will live here.",
  },
];

export const arkansasCountyNames = [
  "Arkansas",
  "Ashley",
  "Baxter",
  "Benton",
  "Boone",
  "Bradley",
  "Calhoun",
  "Carroll",
  "Chicot",
  "Clark",
  "Clay",
  "Cleburne",
  "Cleveland",
  "Columbia",
  "Conway",
  "Craighead",
  "Crawford",
  "Crittenden",
  "Cross",
  "Dallas",
  "Desha",
  "Drew",
  "Faulkner",
  "Franklin",
  "Fulton",
  "Garland",
  "Grant",
  "Greene",
  "Hempstead",
  "Hot Spring",
  "Howard",
  "Independence",
  "Izard",
  "Jackson",
  "Jefferson",
  "Johnson",
  "Lafayette",
  "Lawrence",
  "Lee",
  "Lincoln",
  "Little River",
  "Logan",
  "Lonoke",
  "Madison",
  "Marion",
  "Miller",
  "Mississippi",
  "Monroe",
  "Montgomery",
  "Nevada",
  "Newton",
  "Ouachita",
  "Perry",
  "Phillips",
  "Pike",
  "Poinsett",
  "Polk",
  "Pope",
  "Prairie",
  "Pulaski",
  "Randolph",
  "St. Francis",
  "Saline",
  "Scott",
  "Searcy",
  "Sebastian",
  "Sevier",
  "Sharp",
  "Stone",
  "Union",
  "Van Buren",
  "Washington",
  "White",
  "Woodruff",
  "Yell",
] as const;
