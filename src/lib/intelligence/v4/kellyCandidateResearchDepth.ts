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
    title: "Court records / financial diligence — public brief vs staff search",
    howTheyComeAfterHer: [
      "Opposition research firms search CourtConnect, liens, UCC, business entity standing.",
      "Farm economics stress post-COVID may be spun as instability in whisper campaigns.",
      "Public brief covers verified media/campaign sources — staff CourtConnect log still pending.",
    ],
    whatToExpectOnStage: [
      "Unlikely direct criminal accusation without record — more common in mail/digital.",
      "Culture-war adjacent personal questions if debate gets hot.",
      "GotV whisper campaigns on business filings.",
    ],
    kellyResponseFramework: [
      "Use public brief facts for verified civics/campaign lines — see kellyCandidatePublicRecordBrief.",
      "Never claim 'clean search' until diligence log entries are completed and counsel-reviewed.",
      "If clean search logged: pivot to small-business survival and service frame.",
      "Boundary: 'I am running to run the Secretary of State's office for every voter.'",
    ],
    whatNotToDo: [
      "Fabricated denial of specific cases or CourtConnect results.",
      "60-second personal biography when asked SOS policy question.",
      "Attack Hammer personal finances without sourced record.",
    ],
    verificationStatus: "PARTIAL",
    prepPriority: "HIGH",
  },
  {
    id: "court-records-staff-search",
    title: "CourtConnect / UCC / property-tax staff search protocol",
    howTheyComeAfterHer: [
      "Staff must complete five diligence log searches before debate — outcomes not yet logged.",
      "Whisper campaigns may precede logged search results.",
    ],
    whatToExpectOnStage: [
      "Rare on stage unless a hit leaks to press first.",
      "Counsel gate on any response referencing specific filings.",
    ],
    kellyResponseFramework: [
      "Complete kelly-court-diligence-log.json entries with staff initials and counsel review.",
      "If incomplete at debate: use counsel frame only — no categorical denial.",
      "If clean and logged: one-sentence pivot to service frame.",
    ],
    whatNotToDo: [
      "Mark NOT_SEARCHED entries as CLEAN in public materials.",
      "Speculate about search outcomes in prep docs distributed beyond staff.",
    ],
    verificationStatus: "NEEDS_RESEARCH",
    prepPriority: "CRITICAL",
  },
  {
    id: "stand-up-learns-family",
    title: "Stand Up Arkansas + LEARNS/CAPES spouse connection",
    howTheyComeAfterHer: [
      "Hammer ties Kelly to Stand Up Arkansas, For AR Kids, and Steve Grappe's CAPES role opposing LEARNS referendum.",
      "Frames Grappe household as professional petition fighters who cannot administer SOS fairly.",
      "Arkansas Times and Dem-Gaz coverage provides clip inventory.",
    ],
    whatToExpectOnStage: [
      "Moderator bundles 'integrity' and 'petitions' with family education fights.",
      "Hammer lists 2025 act numbers without county implementation detail.",
    ],
    kellyResponseFramework: [
      "Own civics leadership — separate from SOS administrator role.",
      "Boundary on spouse: one sentence max — do not attack Steve on stage.",
      "Public stance: decline circulating petitions during race; SOS serves all lawful drives.",
      "Pivot: clerk training, published rules, hotline when new act lands Friday afternoon.",
    ],
    whatNotToDo: [
      "Deny documented Stand Up Arkansas or petition leadership.",
      "Attack LEARNS voters or Hammer personally.",
      "Relitigate CAPES referendum for 60 seconds.",
    ],
    verificationStatus: "VERIFIED",
    prepPriority: "CRITICAL",
  },
  {
    id: "depoliticize-sos-frame",
    title: "Depoliticizing SOS — campaign vs opponent 'activist' label",
    howTheyComeAfterHer: [
      "Hammer: 'Democratic activist pretending to be neutral Secretary of State.'",
      "kellygrappe.com emphasizes county fairness and election security through service.",
      "Packo may agree anti-establishment themes Kelly also used.",
    ],
    whatToExpectOnStage: [
      "Opening or closing 'partisan SOS' framing.",
      "Attempt to pin Kelly as activist in Republican-leaning state.",
    ],
    kellyResponseFramework: [
      "Lead with office plan: transparent rules, clerk partnership, equal treatment.",
      "Use 'call balls and strikes' — depoliticizing frame from verified campaign messaging.",
      "Pivot within 10 seconds to acts and county burden.",
    ],
    whatNotToDo: [
      "Apologize for running as a Democrat.",
      "Attack Pakko voters explicitly in three-way debate.",
      "Sound defensive on party label for 45+ seconds.",
    ],
    verificationStatus: "VERIFIED",
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
  "Review kellyCandidatePublicRecordBrief — rehearse Stand Up / LEARNS-CAPES / depoliticize frames.",
  "Complete court diligence log searches — document clean or counsel response before debate.",
  "Rehearse petition question with speak-order drills — never end on agree alone.",
  "Staff plays Hammer 'check my record' — Kelly uses verified Arkleg counter once only.",
  "Review culture-war depth guide — 10-second pivot drill daily.",
  "Kelly mirror dossier: candidate eyes only — no staff distribution without approval.",
];
