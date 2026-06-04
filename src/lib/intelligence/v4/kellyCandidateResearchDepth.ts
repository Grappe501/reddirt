/**
 * Kelly candidate research depth — how opponents come after her, how to respond, what to expect.
 * Merges adversarial mirror findings with debate-week operator guidance.
 */

export type KellyAttackVector = {
  id: string;
  title: string;
  howTheyComeAfterHer: string[];
  whatToExpectOnStage: string[];
  kellyResponseFramework: string[];
  whatNotToDo: string[];
  verificationStatus: "VERIFIED" | "PARTIAL" | "NEEDS_RESEARCH" | "NOT_FOUND";
  prepPriority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
};

export const KELLY_ATTACK_VECTORS: KellyAttackVector[] = [
  {
    id: "petition-activist-vs-administrator",
    title: "Petition organizer vs neutral SOS administrator",
    howTheyComeAfterHer: [
      "Hammer ties Kelly to LEARNS referendum, For AR Kids, Sherwood petition hub — contrast with his petition-restriction bills.",
      "Packo may say both majors failed reform — Kelly's activism proves she cannot be neutral.",
      "Press will ask: 'Can someone who organized ballot measures fairly administer the office?'",
    ],
    whatToExpectOnStage: [
      "Moderator bundles 'integrity' and 'petitions' in one question.",
      "Hammer lists 2025 act numbers (218, 240, 274, 241, 768) without county implementation detail.",
      "Packo agrees with access theme but distinguishes himself as the reform voice.",
    ],
    kellyResponseFramework: [
      "Agree: integrity and lawful participation are both non-negotiable.",
      "Contrast: SOS administers rules for every county — writing more rules without funding is not service.",
      "Bridge: decline circulating petitions during race (public stance); SOS serves all lawful drives equally.",
      "Lead: pivot to clerk training, published rules, hotline when new act lands Friday afternoon.",
    ],
    whatNotToDo: [
      "Attack petition rights or Hammer voters personally.",
      "Deny documented petition leadership without owning civics story.",
      "Say 'stolen election' or invent fraud statistics.",
    ],
    verificationStatus: "PARTIAL",
    prepPriority: "CRITICAL",
  },
  {
    id: "experience-readiness",
    title: "Inexperience vs 25-year legislator",
    howTheyComeAfterHer: [
      "Hammer: 'I wrote the integrity laws — she has never run an election.'",
      "Experience-equals-SOS-ready trap — conflates authorship with administration.",
      "May cite bill count fast to sound authoritative.",
    ],
    whatToExpectOnStage: [
      "Opening or closing 'qualifications' question.",
      "Interrupt during Kelly county story to cite SB numbers.",
      "Spin room: 'nice person, not ready' narrative to press.",
    ],
    kellyResponseFramework: [
      "Agree: respect his years in the legislature.",
      "Contrast: writing election law is not administering 75 counties — SOS answers the phone for clerks.",
      "Bridge: Kelly's service frame — transparency, training, equal treatment.",
      "Optional zinger only if verified: 'Check my record — verified on Arkleg' counter when he invites it.",
    ],
    whatNotToDo: [
      "Mock his age or tenure.",
      "Claim Kelly 'ran elections' without sourced experience.",
      "Spend 60s on biography defense.",
    ],
    verificationStatus: "PARTIAL",
    prepPriority: "HIGH",
  },
  {
    id: "court-records-diligence",
    title: "Court records / financial diligence searches",
    howTheyComeAfterHer: [
      "Opposition research firms search CourtConnect, liens, UCC, business entity standing.",
      "Farm economics stress post-COVID may be spun as instability.",
      "No conviction in repo — absence is not proof; they will search anyway.",
    ],
    whatToExpectOnStage: [
      "Unlikely direct criminal accusation without record — more common in mail/digital.",
      "Culture-war adjacent personal questions if debate gets hot.",
      "GotV whisper campaigns on business filings.",
    ],
    kellyResponseFramework: [
      "Never deny categorically without search completed this cycle.",
      "If clean search logged: pivot to small-business survival and service frame.",
      "If hit exists: counsel + single-sentence factual response only.",
      "Boundary: 'I am running to run the Secretary of State's office for every voter.'",
    ],
    whatNotToDo: [
      "Fabricated denial of specific cases.",
      "60-second personal biography when asked SOS policy question.",
      "Attack Hammer personal finances without sourced record.",
    ],
    verificationStatus: "NEEDS_RESEARCH",
    prepPriority: "HIGH",
  },
  {
    id: "media-paper-trail",
    title: "Long media / blog / radio paper trail",
    howTheyComeAfterHer: [
      "Stand Up Arkansas, Regnat Populus letters, Forevermost essays, KUAR/Arkansas Times quotes.",
      "Movement politics language may be clipped out of context.",
      "Hammer camp frames as 'radical organizer' vs 'steady senator.'",
    ],
    whatToExpectOnStage: [
      "Gotcha quote questions rare in SOS debate — more common in editorial boards.",
      "Packo may welcome anti-establishment themes Kelly also used.",
    ],
    kellyResponseFramework: [
      "Own civics leadership chapter — separate from SOS administrator role.",
      "Pivot within 10 seconds to office plan: rules, education, county partnership.",
      "Do not relitigate old blog essays on stage — one sentence max.",
    ],
    whatNotToDo: [
      "Apologize for lawful civic engagement.",
      "Call media enemies or fake news.",
      "Share new controversial quotes in spin room.",
    ],
    verificationStatus: "PARTIAL",
    prepPriority: "MEDIUM",
  },
  {
    id: "culture-war-bait",
    title: "Culture-war identity bait",
    howTheyComeAfterHer: [
      "Questions designed to make Kelly defend identity instead of SOS plan.",
      "Hot-button words to trigger emotional response.",
      "Packo may amplify anti-establishment framing.",
    ],
    whatToExpectOnStage: [
      "Broad 'values' or 'partisan SOS' framing.",
      "Attempt to pin Kelly as Democratic activist in Republican-leaning state.",
    ],
    kellyResponseFramework: [
      "Do not repeat hot-button words — substitute 'election rules' and 'county implementation.'",
      "Boundary: SOS serves every voter — talk about acts and clerks.",
      "Pivot within 10 seconds to verified record or county burden.",
    ],
    whatNotToDo: [
      "Church debate, partisan tribal language.",
      "Ask Pakko voters to vote for Kelly explicitly in three-way debate.",
      "Sound defensive for 45+ seconds.",
    ],
    verificationStatus: "VERIFIED",
    prepPriority: "HIGH",
  },
];

export const KELLY_RESEARCH_PREP_SEQUENCE = [
  "Run court/financial search log — document clean or counsel response before debate.",
  "Rehearse petition question with speak-order drills — never end on agree alone.",
  "Staff plays Hammer 'check my record' — Kelly uses verified Arkleg counter once only.",
  "Review culture-war depth guide — 10-second pivot drill daily.",
  "Kelly mirror dossier: candidate eyes only — no staff distribution without approval.",
];
