import type { ActorModelConfidence, ActorModelSourceState, DecisionSimulationActorModel } from "./actor-model";

export type PersonalityRole = "OPERATOR" | "COUNTERPARTY" | "EITHER";

export type PersonalitySource = {
  label: string;
  url: string;
  accessed: string;
};

export type PersonalityObservation = {
  at: string;
  note: string;
  sourceState: ActorModelSourceState;
  scenario?: string;
};

export type CatalogPersonality = {
  id: string;
  name: string;
  shortName: string;
  office: string;
  partyLabel: string;
  roleDefault: PersonalityRole;
  version: string;
  effectiveAt: string;
  evidenceQuality: "OBSERVED" | "MIXED" | "HYPOTHESIS";
  uncertaintyLevel: "LOW" | "MEDIUM" | "HIGH";
  badge: "RESEARCH MODEL" | "HYPOTHESIS MODEL" | "CUSTOM MODEL";
  summary: string;
  facts: string[];
  sources: PersonalitySource[];
  learningNote: string;
  custom?: boolean;
  observations?: PersonalityObservation[];
  model: DecisionSimulationActorModel;
};

const TODAY = "2026-09-09";

function frame(
  label: string,
  weight: number,
  confidence: ActorModelConfidence,
  sourceState: ActorModelSourceState,
  notes?: string,
) {
  return { label, weight, confidence, sourceState, notes };
}

function tendency(
  label: string,
  probabilityWeight: number,
  confidence: ActorModelConfidence,
  sourceState: ActorModelSourceState,
  trigger?: string,
) {
  return { label, probabilityWeight, confidence, sourceState, trigger };
}

export const GENERIC_PERSONALITY_ID = "generic";

export const chrisJonesPersonality: CatalogPersonality = {
  id: "chris-jones-ar02",
  name: "Dr. Chris Jones",
  shortName: "Jones",
  office: "Democratic nominee, U.S. House Arkansas 2nd District (2026)",
  partyLabel: "Democratic",
  roleDefault: "OPERATOR",
  version: "jones-ar02-research-1.0",
  effectiveAt: `${TODAY}T00:00:00.000Z`,
  evidenceQuality: "MIXED",
  uncertaintyLevel: "MEDIUM",
  badge: "RESEARCH MODEL",
  summary:
    "Public biographical and campaign record only. Not a psychological profile. Frames below are tagged OBSERVED / INFERRED / HYPOTHESIS.",
  facts: [
    "Pine Bluff native; 2022 Democratic nominee for Arkansas governor (lost to Sarah Huckabee Sanders).",
    "Morehouse College: B.S. mathematics and B.S. physics; NASA scholarship; summer NASA internships.",
    "MIT: S.M. Nuclear Engineering and S.M. Technology and Policy (2003); thesis on nuclear nonproliferation.",
    "MIT: Ph.D. Urban Planning (2016); dissertation on the Tennessee Valley Authority, energy, race, and class.",
    "Assistant Dean for Graduate Education at MIT, 2004–2013 (public biographical record).",
    "Ordained minister; former executive director, Arkansas Regional Innovation Hub.",
    "Filed/launched 2026 AR-02 congressional bid; Democratic nominee vs incumbent French Hill. General election November 3, 2026.",
    "Stated 2026 campaign themes include affordability, accountability, opportunity, education/workforce, housing, healthcare, and childcare.",
  ],
  sources: [
    { label: "Ballotpedia — Chris Jones (AR congressional candidate)", url: "https://ballotpedia.org/Chris_Jones_(Arkansas_congressional_candidate)", accessed: TODAY },
    { label: "Wikipedia — Chris Jones (Arkansas politician)", url: "https://en.wikipedia.org/wiki/Chris_Jones_(Arkansas_politician)", accessed: TODAY },
    { label: "Talk Business & Politics — congressional launch, Oct 9 2025", url: "https://talkbusiness.net/2025/10/chris-jones-officially-launches-bid-for-congress/", accessed: TODAY },
    { label: "Campaign site — Affordability For All", url: "https://chrisjonesforcongress.com/affordability/", accessed: TODAY },
    { label: "Ballotpedia — AR-02 2026", url: "https://ballotpedia.org/Arkansas%27_2nd_Congressional_District_election,_2026", accessed: TODAY },
  ],
  learningNote:
    "Update this model only when an operator attaches an observed outcome from a real public exchange. Do not treat ensemble output as new evidence about Jones.",
  model: {
    actorName: "Dr. Chris Jones",
    version: "jones-ar02-research-1.0",
    effectiveAt: `${TODAY}T00:00:00.000Z`,
    description:
      "Research-bounded operator/challenger model for Arkansas's 2nd District. Use only public biographical and campaign-record facts. Do not invent private motives or unsourced attacks.",
    primaryIncentives: [
      "Affordability for working families (housing, healthcare, childcare, energy, retirement) — campaign site",
      "Opportunity via education, workforce, infrastructure, and innovation — public bio and campaign themes",
      "Present as a builder/scientist/minister with Arkansas roots — public biography",
    ],
    strategicConstraints: [
      "Challenger against a multi-term incumbent Financial Services chair",
      "District Cook PVI reported R+8; treat electability pressure as context, not destiny",
      "No private information; no autonomous contact or posting",
    ],
    preferredFrames: [
      frame("Affordability for working families", 1, "HIGH", "OBSERVED", "chrisjonesforcongress.com/affordability"),
      frame("Opportunity and STEAM / education investment", 0.9, "HIGH", "OBSERVED", "Public bio and 2022/2026 themes"),
      frame("Scientist-minister-builder identity", 0.8, "MEDIUM", "OBSERVED", "NASA scholarship, MIT degrees, ordained minister"),
      frame("Accountability and ethics in government", 0.7, "MEDIUM", "OBSERVED", "Campaign accountability theme"),
    ],
    attackLanes: [
      frame("Incumbent distance from household costs", 0.7, "LOW", "HYPOTHESIS", "Not a documented Jones attack line; simulation-only"),
      frame("Institutional capture vs working families", 0.5, "LOW", "HYPOTHESIS"),
    ],
    defensiveFrames: [
      frame("Return to Arkansas public-service record", 0.8, "MEDIUM", "INFERRED", "Bio emphasizes return from MIT/Boston to AR"),
      frame("Stay on affordability and opportunity", 0.9, "MEDIUM", "INFERRED"),
    ],
    escalationTendencies: [
      tendency("Contrast on kitchen-table economics", 0.8, "LOW", "HYPOTHESIS"),
      tendency("Credential and service narrative", 0.7, "MEDIUM", "INFERRED"),
    ],
    deescalationTendencies: [
      tendency("Return to shared Arkansas future / no one left behind", 0.6, "MEDIUM", "INFERRED", "Launch quote reported by Talk Business"),
    ],
    communicationStyle: [
      "Personal or everyday opening into systems diagnosis",
      "Engineering/science analogy used as explanation, not ornament",
      "Moral framing and hopeful close after the diagnosis",
    ],
    likelyAudiences: ["Central Arkansas working families", "Democratic primary/general coalition", "Education and innovation networks"],
    uncertaintyNotes: [
      "No private strategy documents were used.",
      "Response-style weights are HYPOTHESIS unless tagged otherwise.",
      "2022 gubernatorial loss is electoral context, not a personality diagnosis.",
    ],
  },
};

export const frenchHillPersonality: CatalogPersonality = {
  id: "french-hill-ar02",
  name: "Rep. French Hill",
  shortName: "Hill",
  office: "U.S. Representative, Arkansas 2nd District (incumbent since 2015)",
  partyLabel: "Republican",
  roleDefault: "COUNTERPARTY",
  version: "hill-ar02-research-1.0",
  effectiveAt: `${TODAY}T00:00:00.000Z`,
  evidenceQuality: "MIXED",
  uncertaintyLevel: "MEDIUM",
  badge: "RESEARCH MODEL",
  summary:
    "Public office, career, and official-communications record only. Not a psychological profile. No opponent-campaign characterizations are treated as fact.",
  facts: [
    "Ninth-generation Arkansan; Little Rock resident; Vanderbilt B.A. Economics, magna cum laude.",
    "U.S. Representative for AR-02 since January 2015.",
    "Chair, House Financial Services Committee, 119th Congress; previously vice chair and digital-assets subcommittee chair.",
    "Prior: Senate Banking staff; Deputy Assistant Secretary of the Treasury for Corporate Finance (1989–91); Executive Secretary, President's Economic Policy Council.",
    "Founder/CEO, Delta Trust & Banking Corporation (1999–2014, sold to Simmons Bank).",
    "2024 general: 58.9% vs Marcus Jones. 2026 Republican primary winner vs Chase McDowell; general vs Chris Jones on November 3, 2026.",
    "Official communications emphasize financial regulation, capital access, waste/fraud (Golden Fleece), defense, and district casework.",
  ],
  sources: [
    { label: "Official House biography", url: "https://hill.house.gov/biography/", accessed: TODAY },
    { label: "Wikipedia — James French Hill", url: "https://en.wikipedia.org/wiki/James_French_Hill", accessed: TODAY },
    { label: "Ballotpedia — AR-02 2026", url: "https://ballotpedia.org/Arkansas%27_2nd_Congressional_District_election,_2026", accessed: TODAY },
    { label: "House site — Main Street Capital Access Act (Jul 22 2026)", url: "https://hill.house.gov/", accessed: TODAY },
  ],
  learningNote:
    "Do not ingest opposition talking points as Hill's voice. Attach only his own public statements or roll-call-grounded observations.",
  model: {
    actorName: "Rep. French Hill",
    version: "hill-ar02-research-1.0",
    effectiveAt: `${TODAY}T00:00:00.000Z`,
    description:
      "Research-bounded incumbent model. Grounded in official biography and public legislative/communications record. Do not use unsourced opponent claims.",
    primaryIncentives: [
      "Financial-system and capital-access agenda (committee chair record)",
      "Incumbent delivery: casework, district offices, institutional competence",
      "Fiscal-oversight / anti-waste public communications (Golden Fleece series)",
    ],
    strategicConstraints: [
      "Public record as multi-term incumbent and Financial Services chair",
      "National-security and intelligence committee history is public; do not invent classified-adjacent claims",
      "No private information; no autonomous contact or posting",
    ],
    preferredFrames: [
      frame("Financial services and capital access", 1, "HIGH", "OBSERVED", "Committee chair; Main Street Capital Access Act"),
      frame("Waste, fraud, and agency accountability", 0.85, "HIGH", "OBSERVED", "Golden Fleece awards on official site"),
      frame("Banking/Treasury professional competence", 0.8, "HIGH", "OBSERVED", "Official biography"),
      frame("National security and intelligence experience", 0.7, "MEDIUM", "OBSERVED", "Prior HPSCI and Foreign Affairs membership"),
    ],
    attackLanes: [
      frame("Challenger inexperience on financial regulation", 0.6, "LOW", "HYPOTHESIS", "Not cited from a Hill statement in this version"),
      frame("District delivery vs nationalized campaign", 0.5, "LOW", "HYPOTHESIS"),
    ],
    defensiveFrames: [
      frame("Committee gavel and legislative output", 0.9, "MEDIUM", "INFERRED"),
      frame("Local offices and constituent work", 0.7, "MEDIUM", "INFERRED", "Published Little Rock and Conway offices"),
    ],
    escalationTendencies: [
      tendency("Institutional-record contrast", 0.7, "LOW", "HYPOTHESIS"),
      tendency("Fiscal / regulatory specificity", 0.8, "MEDIUM", "INFERRED"),
    ],
    deescalationTendencies: [
      tendency("Return to district-work and committee process", 0.6, "MEDIUM", "INFERRED"),
    ],
    communicationStyle: [
      "Official-office newsletter register beginning Friends",
      "Statistic or local example before committee/legislative proof",
      "Constituent-service close; office voice not claimed as personally typed",
    ],
    likelyAudiences: ["AR-02 Republican base", "Financial-services stakeholders", "Central Arkansas civic/business networks"],
    uncertaintyNotes: [
      "Campaign-arm characterizations of the opponent are excluded from this model.",
      "Social-issue votes exist in the public record; they are not used here as simulated attack content unless the opening move raises them.",
      "Response-style weights are mostly HYPOTHESIS.",
    ],
  },
};

export const genericPersonality: CatalogPersonality = {
  id: GENERIC_PERSONALITY_ID,
  name: "Generic hypothesis model",
  shortName: "Generic",
  office: "Unspecified actor",
  partyLabel: "Unspecified",
  roleDefault: "EITHER",
  version: "dashboard-generic-actor-1.0",
  effectiveAt: `${TODAY}T00:00:00.000Z`,
  evidenceQuality: "HYPOTHESIS",
  uncertaintyLevel: "HIGH",
  badge: "HYPOTHESIS MODEL",
  summary: "No researched public record is attached. Treat every behavioral weight as a hypothesis.",
  facts: ["Operator-supplied name and context only."],
  sources: [],
  learningNote: "Replace with a researched or custom personality before treating output as actor-specific.",
  model: {
    actorName: "Generic counterparty",
    version: "dashboard-generic-actor-1.0",
    effectiveAt: `${TODAY}T00:00:00.000Z`,
    description: "Generic hypothesis model. No researched actor profile.",
    primaryIncentives: ["Protect credibility", "Advance stated objectives"],
    strategicConstraints: ["Public scrutiny", "Incomplete information"],
    preferredFrames: [frame("Defend current position", 1, "LOW", "HYPOTHESIS")],
    attackLanes: [frame("Credibility", 1, "LOW", "HYPOTHESIS")],
    defensiveFrames: [frame("Stay on message", 1, "LOW", "HYPOTHESIS")],
    escalationTendencies: [tendency("Measured counter", 1, "LOW", "HYPOTHESIS")],
    deescalationTendencies: [tendency("Deprioritize", 0.4, "LOW", "HYPOTHESIS")],
    communicationStyle: ["Adaptive"],
    likelyAudiences: ["General public"],
    uncertaintyNotes: ["HYPOTHESIS MODEL — no researched profile."],
  },
};

export const BUILT_IN_PERSONALITIES: CatalogPersonality[] = [
  chrisJonesPersonality,
  frenchHillPersonality,
  genericPersonality,
];

export function listBuiltInPersonalities(): CatalogPersonality[] {
  return BUILT_IN_PERSONALITIES;
}

export function getBuiltInPersonality(id: string | undefined | null): CatalogPersonality | null {
  if (!id) return null;
  return BUILT_IN_PERSONALITIES.find((item) => item.id === id) ?? null;
}

export function mergePersonalityCatalog(custom: CatalogPersonality[] = []): CatalogPersonality[] {
  const extras = custom.filter((item) => !BUILT_IN_PERSONALITIES.some((built) => built.id === item.id));
  return [...BUILT_IN_PERSONALITIES, ...extras];
}

export function resolvePersonality(
  id: string | undefined,
  custom: CatalogPersonality[] = [],
): CatalogPersonality {
  return getBuiltInPersonality(id) ?? custom.find((item) => item.id === id) ?? genericPersonality;
}

export function personalityToOpeningActor(personality: CatalogPersonality) {
  return {
    name: personality.name,
    actorType: "PERSON" as const,
    description: `${personality.office}. ${personality.summary}`,
    sourceVersion: personality.version,
  };
}
