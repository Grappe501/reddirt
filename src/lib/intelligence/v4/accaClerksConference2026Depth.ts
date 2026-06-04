/**
 * ACCA Summer Conference 2026 — Mountain View clerk audience + SOS candidates panel prep.
 * Hard facts: data/intelligence/acca-clerks-summer-conference-2026.json
 */
import fs from "node:fs";
import path from "node:path";

export type AccaConferenceDepthSection = {
  sectionId: string;
  title: string;
  eyebrow: string;
  narrativeOverview: string[];
  whyItMattersForKelly: string;
  plainEnglishWalkthrough: string[];
  hardEvidence: Array<{ claim: string; tier: "VERIFIED" | "PARTIAL" | "STRATEGY" | "NEEDS_RESEARCH" }>;
  whatWeStillNeed: string[];
  howToPresentInPanel: string[];
  howToPresentOnTrail: string[];
  connectToHammerRecord: string[];
  connectToPakko: string[];
  staffActions: string[];
  rehearsalPrompt?: string;
  relatedSectionIds: string[];
  href?: string;
};

export type AccaConferenceFile = {
  eventId: string;
  title: string;
  theme: string;
  venue: { name: string; address: string; phone: string };
  coordinator: { name: string; mobile: string; email: string };
  sosCandidatesPanel: {
    date: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    format: string;
    candidates: Array<{ name: string; party: string }>;
  };
  sponsors: { platinum: string[]; gold: string[] };
};

export const ACCA_CONFERENCE_DEPTH_SECTIONS: AccaConferenceDepthSection[] = [
  {
    sectionId: "event-overview",
    title: "What this conference is — and why it is not a TV debate",
    eyebrow: "Mountain View · June 10–12",
    narrativeOverview: [
      "The Arkansas County Clerks Association Continuing Education Summer Conference is the professional home turf of Kelly's primary audience: county clerks, election commissioners, quorum court members who fund them, and the vendors and state agencies they work with every cycle. Theme: Honoring the Past. Serving the Present. Shaping the Future — RED, WHITE & BLUE.",
      "This is not a cable-news debate stage. It is a continuing-education conference at the Ozark Mountain Folk Center in Mountain View. Clerks are there to learn about ballots, cybersecurity minimum standards, personnel law, election board updates, and legislative packages — not to cheer a partisan fight.",
      "The headline event for Kelly is Thursday June 11, 1:00–3:00pm: a two-hour Secretary of State Candidates Moderated Panel Q&A with Kim Hammer (R), Kelly Grappe (D), and Dr. Michael Pakko (L). Three candidates, one moderator, clerk questions — partnership audition, not knockout round.",
    ],
    whyItMattersForKelly: "Win condition: clerks leave believing Kelly will run SOS as their statewide partner. Hammer adds rules; Kelly adds implementation.",
    plainEnglishWalkthrough: [
      "Wed–Fri conference → Kelly's panel Thu 1–3pm → breaks to meet exhibitors → association dinner Thu night → legislative package Fri morning.",
    ],
    hardEvidence: [
      { claim: "Conference June 10–12, 2026 at Ozark Mountain Folk Center, Mountain View", tier: "VERIFIED" },
      { claim: "SOS panel Thu Jun 11 1:00–3:00pm — three candidates, moderated Q&A", tier: "VERIFIED" },
    ],
    whatWeStillNeed: ["Moderator name and question format (timed? round-robin? written cards?)"],
    howToPresentInPanel: [
      "Open clerk-first: 'I'm here to learn from you and tell you how I'll serve your offices.'",
      "Never open with opponent names unless moderator asks.",
    ],
    howToPresentOnTrail: ["Tag ACCA respectfully; no video clips without clerk permission."],
    connectToHammerRecord: ["Hammer may cite bills he wrote — you cite who implements them Monday morning."],
    connectToPakko: ["Pakko may agree process is broken — Kelly adds 'I will administer the fix clerks can use.'"],
    staffActions: ["Confirm Kelly travel/lodging with county or campaign", "Print pocket SOS service pledge"],
    relatedSectionIds: ["panel-format", "kelly-clerk-room-strategy"],
    href: "/admin/intelligence/county-clerk-week",
  },
  {
    sectionId: "logistics-travel",
    title: "Logistics, travel, and staff contacts",
    eyebrow: "Operations",
    narrativeOverview: [
      "Venue: Ozark Mountain Folk Center, 1032 Park Ave, Mountain View, AR 72560 — (870) 269-3851. Optional arrival Tuesday June 9; registration Wednesday June 10 at noon; conference runs through Friday June 11 adjournment at 11:30am.",
      "Reimbursement flows through the County Clerks Continuing Education Fund (Auditor of State). Forms to Julia Burrier at julia.burrier@auditor.ar.gov or fax 501-371-2143. Mileage: one vehicle per county at $0.52/mile. Room: $110/night + tax, one room per county Wed–Thu. Wednesday dinner reimbursable up to $25 with detailed receipt. Thursday association luncheon and dinner are not reimbursable.",
      "Presenter coordinator Michael Roys (AAC): office 501-372-7550, mobile 479-567-1269, mroys@arcounties.org. Final reminder email June 2 — Kelly is on presenter list with Hammer and Pakko. Travel delays or A/V questions: call Michael's mobile.",
    ],
    whyItMattersForKelly: "Show up calm and prepared — clerks notice who respects their time and their reimbursement rules.",
    plainEnglishWalkthrough: [
      "Arrive Wed or early Thu → register → panel Thu 1pm → stay for exhibitor break 3pm → association dinner 6pm if invited.",
    ],
    hardEvidence: [
      { claim: "Michael Roys mobile 479-567-1269 — presenter coordinator", tier: "VERIFIED" },
      { claim: "Panel presenters asked to arrive 15–20 min early for A/V", tier: "VERIFIED" },
    ],
    whatWeStillNeed: ["Kelly lodging assignment — campaign vs county reimbursement", "Whether Kelly attends Wed ballot-building session"],
    howToPresentInPanel: [],
    howToPresentOnTrail: [],
    connectToHammerRecord: [],
    connectToPakko: [],
    staffActions: [
      "Kelly at venue by 12:40pm Thu for panel",
      "USB backup + email deck to mroys@arcounties.org if using slides",
      "Avoid MacBook unless pre-arranged with Michael",
    ],
    relatedSectionIds: ["staff-day-of-checklist", "event-overview"],
  },
  {
    sectionId: "agenda-before-panel",
    title: "What clerks heard before your panel — context matters",
    eyebrow: "Thursday morning",
    narrativeOverview: [
      "Thursday opens 7:30–9:00 breakfast (direct billed), welcome from ACCA President Margaret Darter (Faulkner County Clerk), then two substantive sessions before lunch.",
      "9:15–10:15: Hiring, Firing, Evaluations & Policy with Mallory McInvale, AAC Legal Counsel — personnel law clerks live with daily. 10:15–11:30: Sandra Cawyer EQ Board Update — election commissioners and board dynamics.",
      "11:30–1:00: Association Luncheon. Clerks arrive at your panel fed, networked, and thinking about HR liability and board relations — not abstract patriotism. Kelly should reference that context: 'You just spent the morning on personnel law and the election board — the SOS should make your election duties easier, not harder.'",
      "Note: Faulkner County appears in SOS Exhibit E as a 50/50 equipment funding county — Margaret Darter's home county. Kelly should know that history without sounding like she researched the president's file.",
    ],
    whyItMattersForKelly: "Mirror their morning — shows you listened to their conference, not just your talking points.",
    plainEnglishWalkthrough: [
      "HR/legal morning → EQ board → lunch → your panel → exhibitor break.",
    ],
    hardEvidence: [
      { claim: "Margaret Darter — Faulkner County Clerk & ACCA President opens sessions", tier: "VERIFIED" },
      { claim: "Morning sessions: AAC legal personnel + EQ board update before panel", tier: "VERIFIED" },
    ],
    whatWeStillNeed: ["Any ACCA legislative package preview for Friday session"],
    howToPresentInPanel: [
      "One line acknowledging their morning: personnel + board pressure is real.",
      "Offer SOS hotline/training calendar as relief valve.",
    ],
    howToPresentOnTrail: [],
    connectToHammerRecord: [],
    connectToPakko: [],
    staffActions: ["Attend EQ board session if Kelly schedule allows — take notes"],
    relatedSectionIds: ["kelly-clerk-room-strategy", "cvsgf-for-clerks"],
  },
  {
    sectionId: "wednesday-context",
    title: "Wednesday sessions — ballots, cyber, county size",
    eyebrow: "Day before panel",
    narrativeOverview: [
      "Wednesday June 10: registration noon, welcome 1pm, then Shelby Johnson (Building Ballots) 1:15–2:45 — core clerk craft. Break for vendors 2:45–3:00.",
      "3:00–3:30: Arkansas Cyber Response Board (ACRB) Minimum Standards, Multi-Factor Authentication & Passwords Update — Mainstream Technologies. Clerks are hearing cyber mandates the week Kelly speaks.",
      "3:30–4:30: Breakout by county size — large vs small county realities differ sharply. Kelly should speak to both: same integrity standard, different staffing and budget capacity.",
      "If Kelly can attend any Wednesday content, Building Ballots + cyber session gives live vocabulary for Thursday panel without citing secondhand.",
    ],
    whyItMattersForKelly: "Cyber + ballot building are clerk pain points — pair with VVSG 2.0 and CVSGF funding themes.",
    plainEnglishWalkthrough: [
      "Ballots → cyber MFA standards → county-size breakouts → adjourn 4:30.",
    ],
    hardEvidence: [
      { claim: "Shelby Johnson — Building Ballots session Wed 1:15–2:45", tier: "VERIFIED" },
      { claim: "ACRB cyber/MFA update Wed 3:00–3:30 Mainstream Technologies", tier: "VERIFIED" },
    ],
    whatWeStillNeed: ["ACRB minimum standards text — verify before citing specifics"],
    howToPresentInPanel: [
      "If cyber question arises: SOS publishes clear guidance; counties need funding for MFA rollout.",
    ],
    howToPresentOnTrail: [],
    connectToHammerRecord: ["Hammer cites integrity laws; Kelly cites cyber implementation dollars."],
    connectToPakko: [],
    staffActions: ["Optional Wed attendance for Kelly/staff — log clerk quotes with permission"],
    relatedSectionIds: ["exhibitor-sponsor-room", "cvsgf-for-clerks"],
    href: "/admin/intelligence/election-equipment-vvsg",
  },
  {
    sectionId: "panel-format",
    title: "Two-hour moderated panel — rules of engagement",
    eyebrow: "Thu 1:00–3:00pm",
    narrativeOverview: [
      "Format: Secretary of State Candidates Moderated Panel Q&A — three candidates, approximately two hours. This is longer and more conversational than a 60-minute TV debate. Clerks may ask operational questions Hammer cannot answer with slogans.",
      "Kelly's ratio: listen 40%, offer SOS service plan 40%, contrast only when asked or when Hammer overclaims 20%. Do not prosecute. Do not say 'fraud' first. Do not cite NEEDS_RESEARCH claims.",
      "Time management: with three candidates, answers should be shorter than Kelly's instinct — 60–90 seconds unless moderator invites follow-up. Leave air for clerks to ask the next question.",
      "Physical presence: stand if moderator stands; thank Margaret Darter and AAC; visit exhibitor break after — ES&S and CTCL are in the room.",
    ],
    whyItMattersForKelly: "This format rewards the candidate who sounds like a future SOS administrator, not a senator running for promotion.",
    plainEnglishWalkthrough: [
      "Moderator question → Kelly answers clerk impact first → optional contrast → pass to next candidate.",
    ],
    hardEvidence: [{ claim: "Panel scheduled 120 minutes Thu Jun 11 1:00–3:00pm", tier: "VERIFIED" }],
    whatWeStillNeed: ["Moderator identity", "Whether opening statements are allowed", "Seating order"],
    howToPresentInPanel: [
      "Structure every answer: (1) respect clerks (2) specific SOS offer (3) verify-before-quote discipline.",
      "Use trap questions as questions to all candidates, not attacks — 'I'd like to hear how each of us would publish county grant ledgers.'",
    ],
    howToPresentOnTrail: [],
    connectToHammerRecord: [
      "If Hammer says 'I stand with clerks': 'Which county-by-county CVSGF spreadsheet should clerks use when budgeting?'",
    ],
    connectToPakko: ["If Pakko piles on mandates: agree process problems; differentiate administrator role."],
    staffActions: ["Staff in room — capture questions asked, not just Kelly answers", "No live-tweeting unverified stats"],
    rehearsalPrompt: "90-second answer: why SOS for clerks — no opponent names.",
    relatedSectionIds: ["kelly-clerk-room-strategy", "three-way-panel-geometry"],
    href: "/admin/intelligence/kelly-debate-coaching",
  },
  {
    sectionId: "kelly-clerk-room-strategy",
    title: "Kelly's clerk-room strategy — partnership not performance",
    eyebrow: "Primary audience",
    narrativeOverview: [
      "County clerks reward candidates who offer: hotline, implementation calendar, funding advocacy, respect for their oath. They punish vague culture-war talk and unfunded mandates.",
      "Kelly opening frame (adapt, do not memorize robotically): 'After talking with clerks across Arkansas, I'm running for Secretary of State because this office is where trust is built or broken — one training calendar, one hotline, one set of rules voters can read. I'm not asking for another platform. I'm asking to administer elections fairly in all seventy-five counties.'",
      "Closing frame: leave with clerk cell numbers saved, not flyers stacked. Offer to return with verified training guidance. Mention claims gate discipline: 'If I don't know, I'll verify with your county and publish guidance.'",
      "Association President Margaret Darter runs a tight professional conference — match that tone. RED WHITE & BLUE theme is patriotic service, not partisan warfare.",
    ],
    whyItMattersForKelly: "Clerks talk to each other. One good panel answer travels to 75 counties faster than a TV clip.",
    plainEnglishWalkthrough: [
      "Open service → answer with clerk desk impact → close with hotline/training pledge → follow up within 24h.",
    ],
    hardEvidence: [{ claim: "County clerk audience primer in seven-day prep path", tier: "VERIFIED" }],
    whatWeStillNeed: ["Clerk ally to ask funding question if Hammer dodges"],
    howToPresentInPanel: [
      "Pocket answers from /admin/intelligence/county-clerk-week day 6 live card.",
      "Three pillars: trust/transparency, county support, participation+integrity together.",
    ],
    howToPresentOnTrail: ["Thank-you notes to AAC and any clerk hosts within 24h."],
    connectToHammerRecord: [],
    connectToPakko: [],
    staffActions: ["Laminated act cheat sheet in Kelly pocket", "Business cards with Kelly@KellyGrappe.com"],
    relatedSectionIds: ["panel-format", "topic-priority-bank"],
    href: "/admin/intelligence/county-clerk-week",
  },
  {
    sectionId: "three-way-panel-geometry",
    title: "Three-way geometry — Hammer, Kelly, Pakko in a clerk room",
    eyebrow: "Not TV debate",
    narrativeOverview: [
      "Kim Hammer (R) will offer integrity slogans, #1 ranking claims, and 'I wrote the bills.' Dr. Michael Pakko (L) will offer reform-from-outside-the-duopoly skepticism — may agree funding or mandates are opaque.",
      "Kelly rule: respect Dr. Pakko on stage; never attack Libertarian voters. Line: 'Dr. Pakko and I both want voters to trust the process — I am running to administer it in all seventy-five counties every day.' Do not say 'vote Libertarian' in this room.",
      "When Hammer and Pakko agree on a problem (unfunded mandates, opaque grants), Kelly adds the SOS plan: publish ledger, training calendar, hotline — do not pile on Pakko to hurt Hammer in front of clerks.",
      "When Hammer claims credit for county funding, Kelly uses fair funding transparency frame — not accusation. See election-funding/debate-funding section.",
    ],
    whyItMattersForKelly: "Clerks hate candidates who treat their conference as a three-way shouting match.",
    plainEnglishWalkthrough: [
      "Hammer slogans → Kelly implementation → Pakko reform → Kelly administrator close.",
    ],
    hardEvidence: [{ claim: "Three candidates listed on official agenda", tier: "VERIFIED" }],
    whatWeStillNeed: ["Pakko's likely clerk-specific talking points"],
    howToPresentInPanel: [
      "Never speak third about Hammer while Pakko is talking — wait your turn.",
      "If moderator asks 'why you over Pakko': administrator vs analyst, respectfully.",
    ],
    howToPresentOnTrail: [],
    connectToHammerRecord: ["County champion trap — implementation questions only."],
    connectToPakko: [
      "Friendly reform voice; Kelly administers Monday morning.",
      "Spelling: campaign uses Pakko — verify ballot spelling before stage.",
    ],
    staffActions: ["Log Hammer/Pakko claims for claims gate after panel"],
    relatedSectionIds: ["panel-format", "hammer-traps-clerk-room"],
    href: "/admin/intelligence/debate-depth/three-way",
  },
  {
    sectionId: "topic-priority-bank",
    title: "Topic priority bank — what clerks are likely to ask",
    eyebrow: "Q&A prep",
    narrativeOverview: [
      "High-probability clerk questions map to existing SOS question bank and clerk matrix: training dollars after new laws, poll worker recruitment, CVSGF grant visibility, cyber/MFA costs, election board relations, petition/signature procedures, VVSG 2.0 equipment timeline, ES&S support responsiveness.",
      "Kelly should route each question: (1) acknowledge clerk burden (2) cite verified fact if available (3) SOS service pledge (4) never overclaim.",
      "Pre-read priority modules before panel: election-funding/county-ledger-gap, election-funding/debate-funding, trap-lanes/county-champion, kelly-debate-coaching opening scripts, election-equipment-vvsg executive summary.",
      "Low-probability but high-risk: culture-war bait, 2020 election disputes, partisan voter-ID rhetoric — pivot to clerk service and verified procedures.",
    ],
    whyItMattersForKelly: "Two hours is long enough for every candidate to expose gaps — Kelly's depth wins if she stays verified.",
    plainEnglishWalkthrough: [
      "Clerk question → burden ack → verified fact → SOS offer → stop talking.",
    ],
    hardEvidence: [{ claim: "23 SOS debate questions in bank — subset applies to clerk panel", tier: "VERIFIED" }],
    whatWeStillNeed: ["Written questions submitted in advance if AAC collects them"],
    howToPresentInPanel: [
      "CVSGF question ready: fair public line on county-by-county ledger difficulty.",
      "2021 package: six bills one year — implementation memo Kelly would publish as SOS.",
    ],
    howToPresentOnTrail: [],
    connectToHammerRecord: ["Bill playbooks SB250, HB1457, SB291 — act numbers in pocket."],
    connectToPakko: [],
    staffActions: ["Print top 10 SOS questions tagged county-clerk audience"],
    relatedSectionIds: ["cvsgf-for-clerks", "hammer-traps-clerk-room"],
    href: "/admin/intelligence/sos-debate-questions",
  },
  {
    sectionId: "cvsgf-for-clerks",
    title: "CVSGF & HAVA — the funding question for this room",
    eyebrow: "Election funding",
    narrativeOverview: [
      "Clerks live the County Voting System Grant Fund — UCC fees, SOS grant guidelines, quorum court appropriation of local grant lines. Many counties book 'Voting System Grant Fund' or 'SOS Grant' in public budgets; no consolidated statewide award spreadsheet is public.",
      "Kelly fair line (claims-gate ready): 'I've been researching how election funding flows to Arkansas counties, and it is surprisingly difficult for the public to find a clear county-by-county accounting — election transparency should include election funding transparency.'",
      "Hammer will cite Act 808 ($8.24M) and recent $11M appropriations. Kelly response: 'Totals in Little Rock are not the same as implementation in every county — show the ledger.' Not 'they are hiding money.'",
      "This room includes ES&S as platinum sponsor and current SOS exhibitor — funding and vendor questions may intersect. Stay professional; no vendor bashing.",
    ],
    whyItMattersForKelly: "Clerks budgeting equipment need a SOS who publishes grant accounting — Kelly's positive promise.",
    plainEnglishWalkthrough: [
      "Statute → appropriation → county budget breadcrumb → missing ledger → Kelly publishes as SOS.",
    ],
    hardEvidence: [
      { claim: "FY26-27 HB1041: $11M CVSGF + $4M HAVA to SOS", tier: "VERIFIED" },
      { claim: "No public statewide county-by-county award table located", tier: "VERIFIED" },
    ],
    whatWeStillNeed: ["SOS records request response before citing 'I requested' on stage"],
    howToPresentInPanel: [
      "Invite all three candidates to commit to publishing county ledger — trap Hammer without personal attack.",
    ],
    howToPresentOnTrail: [],
    connectToHammerRecord: [
      "Trap: county-by-county ledger after each mandate he sponsored.",
    ],
    connectToPakko: ["Pakko may agree opacity — Kelly adds operational publish plan."],
    staffActions: ["Bring election-funding hub link on staff iPad — not on projection unless verified"],
    relatedSectionIds: ["exhibitor-sponsor-room", "topic-priority-bank"],
    href: "/admin/intelligence/election-funding/county-ledger-gap",
  },
  {
    sectionId: "exhibitor-sponsor-room",
    title: "Exhibitors & sponsors in the room — ES&S, CTCL, SOS booth",
    eyebrow: "Vendor awareness",
    narrativeOverview: [
      "Platinum sponsor: Election Systems & Software (ES&S). Gold: Kofile, Absolute Solutions ES&S, Center for Tech & Civic Life (CTCL). Exhibitors include Arkansas Secretary of State (current administration), Mainstream Technologies (cyber session presenter), Printelect, DivcoData, and others.",
      "Breaks explicitly invite clerks to visit vendors — Thu 3:00–3:15 after your panel. Kelly should walk the floor professionally: listen to clerks' vendor pain, do not bash ES&S on stage, acknowledge Arkansas's ES&S statewide role while promising transparent procurement and VVSG 2.0 planning.",
      "CTCL as gold sponsor may draw political attention in other venues — in this room, clerks know CTCL as training/grant resource. Kelly stays on clerk service frame, not national culture-war CTCL fights.",
      "Current SOS exhibitor means Hammer may point to incumbent operations — Kelly contrasts what she would publish and fund differently, not who is evil.",
    ],
    whyItMattersForKelly: "Clerks buy from these vendors with CVSGF dollars — credibility requires vendor literacy without conspiracy.",
    plainEnglishWalkthrough: [
      "Panel ends → exhibitor break → polite floor time → association dinner networking.",
    ],
    hardEvidence: [
      { claim: "ES&S platinum sponsor per ACCA agenda", tier: "VERIFIED" },
      { claim: "CTCL gold sponsor per ACCA agenda", tier: "VERIFIED" },
    ],
    whatWeStillNeed: ["Arkansas ES&S contract status for VVSG 2.0 — verify before stage"],
    howToPresentInPanel: [
      "Equipment questions: pair integrity with modernization timeline and grant transparency.",
    ],
    howToPresentOnTrail: [],
    connectToHammerRecord: [],
    connectToPakko: [],
    staffActions: ["Kelly visits ES&S and SOS booths briefly — staff notes clerk conversations"],
    relatedSectionIds: ["cvsgf-for-clerks", "wednesday-context"],
    href: "/admin/intelligence/election-equipment-vvsg",
  },
  {
    sectionId: "hammer-traps-clerk-room",
    title: "Hammer traps calibrated for a clerk room",
    eyebrow: "Implementation cross-exam",
    narrativeOverview: [
      "Clerks nod when you ask implementation questions Hammer cannot answer with rankings. Best traps: county-by-county CVSGF ledger; SOS staff ratio per county for Act 350; who trains poll watchers when disputes land on precinct judges; which budget line matched each 2021 mandate for their county.",
      "Delivery: curious policy learner, not prosecutor. 'Senator, you and I both want secure elections — help clerks understand how your bills connected to training dollars in their county.'",
      "Do not use film-room clips in clerk conference. Do not say Hammer stole funds. Do not attack pastor identity.",
      "If Hammer says Arkansas is #1: 'Ranking is not a substitute for clerk training dollars — SOS grant guidelines are the job you are applying for now.'",
    ],
    whyItMattersForKelly: "This audience will respect fair cross-exam on implementation — they live the unfunded mandate.",
    plainEnglishWalkthrough: [
      "Hammer overclaim → Kelly agree integrity → ask ledger/training → SOS pledge.",
    ],
    hardEvidence: [{ claim: "Hammer vs Kelly clerk matrix + county champion trap lane", tier: "VERIFIED" }],
    whatWeStillNeed: [],
    howToPresentInPanel: [
      "Maximum three trap questions all panel — spaced out, not clustered.",
    ],
    howToPresentOnTrail: [],
    connectToHammerRecord: [
      "2021 six-bill package continuity — see opposition-strategy layer.",
    ],
    connectToPakko: [],
    staffActions: ["Brief friendly clerk ally only with permission — never plant without ACCA ok"],
    relatedSectionIds: ["three-way-panel-geometry", "cvsgf-for-clerks"],
    href: "/admin/intelligence/trap-lanes/county-champion",
  },
  {
    sectionId: "staff-day-of-checklist",
    title: "Staff day-of checklist — Thu June 11",
    eyebrow: "Operations",
    narrativeOverview: [
      "12:40pm Kelly at Mountain View venue — A/V test with Michael Roys. Laptop/USB per AAC guidance; no Mac unless arranged. Presentation emailed in advance if using slides.",
      "1:00–3:00pm Staff: one note-taker for clerk questions, one for opponent claims, no public live stats. Claims gate anything new before social.",
      "3:00–3:15pm Kelly visits exhibitor break if energy allows. 6:00pm Association dinner — confirm Kelly invitation/status with AAC.",
      "Friday optional: legislative package session 9:15–10:15 if Kelly remains — shows continued respect for ACCA process.",
    ],
    whyItMattersForKelly: "Staff discipline protects Kelly's credibility with clerks who hate sloppy campaigns.",
    plainEnglishWalkthrough: [
      "T-20 A/V → panel → notes → exhibitor break → thank-yous → claims ingest.",
    ],
    hardEvidence: [{ claim: "Presenter arrival 15–20 min early per Michael Roys email", tier: "VERIFIED" }],
    whatWeStillNeed: ["Association dinner RSVP", "Media/coordination rules for recording panel"],
    howToPresentInPanel: [],
    howToPresentOnTrail: [],
    connectToHammerRecord: [],
    connectToPakko: [],
    staffActions: [
      "Michael Roys mobile 479-567-1269 on staff speed dial",
      "Capture clerk quotes with permission for memory ledger",
      "Log follow-ups in action queue within 24h",
      "Reimbursement forms to Julia Burrier if county-paid travel",
    ],
    relatedSectionIds: ["logistics-travel", "after-panel-followup"],
  },
  {
    sectionId: "after-panel-followup",
    title: "After the panel — debrief, memory, next conference",
    eyebrow: "48 hours after",
    narrativeOverview: [
      "Within 24h: thank-you to Michael Roys and Margaret Darter; thank-you notes to any clerks who shared contact info. Staff runs claims ingest on opponent statements from panel.",
      "Social: only verified lines — clerk testimonial with permission beats hot take. Tag ACCA respectfully.",
      "Debrief doc: what questions recurred, what Hammer/Pakko said on funding, which counties need follow-up visits. Feed into memory ledger and county priority calendar.",
      "Next ACCA conference: September 9–11, 2026, Benton Events Center — Kelly should plan to return as candidate or clerk partner.",
    ],
    whyItMattersForKelly: "Clerks remember follow-through more than panel applause.",
    plainEnglishWalkthrough: [
      "Debrief → claims gate → thank-yous → county follow-up schedule → Benton conference on calendar.",
    ],
    hardEvidence: [{ claim: "Next ACCA conference Sep 9-11 2026 Benton Events Center", tier: "VERIFIED" }],
    whatWeStillNeed: ["Panel recording if AAC provides", "Written clerk feedback"],
    howToPresentInPanel: [],
    howToPresentOnTrail: ["One verified thread from panel — not opponent clip montage."],
    connectToHammerRecord: [],
    connectToPakko: [],
    staffActions: [
      "Update intelligence memory ledger",
      "Schedule 3 county follow-ups from new contacts",
      "Add Benton Sep conference to campaign calendar",
    ],
    relatedSectionIds: ["kelly-clerk-room-strategy", "staff-day-of-checklist"],
    href: "/admin/intelligence/memory",
  },
];

export function loadAccaClerksConference2026(): AccaConferenceFile {
  const raw = fs.readFileSync(
    path.join(process.cwd(), "data/intelligence/acca-clerks-summer-conference-2026.json"),
    "utf8",
  );
  return JSON.parse(raw) as AccaConferenceFile;
}

export function getAllAccaConferenceDepthSectionIds(): string[] {
  return ACCA_CONFERENCE_DEPTH_SECTIONS.map((s) => s.sectionId);
}

export function getAccaConferenceDepthSection(sectionId: string): AccaConferenceDepthSection | undefined {
  return ACCA_CONFERENCE_DEPTH_SECTIONS.find((s) => s.sectionId === sectionId);
}

export function getAccaPanelCountdownDays(fromDate: Date = new Date()): number {
  const panel = new Date("2026-06-11T13:00:00-05:00");
  return Math.ceil((panel.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
}
