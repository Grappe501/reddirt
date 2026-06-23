/**
 * Debate Command Course v9 — extended answer narratives (drill-down, no video).
 * Claims-green templates — verify before stage.
 */
import { epDebatePrepDayBlockHref, epTrapLaneHref } from "@/lib/election-plan/debate-prep-links";

export type ExtendedResponseLength = "30s" | "90s" | "180s";

export type ExtendedResponseNarrative = {
  id: string;
  category: "opening" | "elections" | "business" | "capitol" | "trap" | "closing";
  title: string;
  trigger: string;
  moduleSource: string;
  /** Short pivot for rebuttal windows */
  answer30s: string;
  /** Standard moderator answer */
  answer90s: string;
  /** Extended narrative when you have the floor */
  answer180s: string;
  voterTranslation: string;
  claimsNote: string;
  relatedHref?: string;
  relatedLabel?: string;
};

export const EXTENDED_RESPONSE_CATEGORIES = [
  { id: "opening", label: "Opening & frame" },
  { id: "elections", label: "Elections & integrity" },
  { id: "business", label: "Business services" },
  { id: "capitol", label: "Capitol management" },
  { id: "trap", label: "Trap pivots" },
  { id: "closing", label: "Closing & invoke" },
] as const;

export const EXTENDED_RESPONSE_NARRATIVES: readonly ExtendedResponseNarrative[] = [
  {
    id: "administrator-opening",
    category: "opening",
    title: "Administrator opening frame",
    trigger: "First 20 seconds — no opponent names",
    moduleSource: "Module 1",
    answer30s:
      "The Secretary of State is not a senator listing bill numbers — it is the operations desk for seventy-five counties: honest elections, business filings, and transparent Capitol rules.",
    answer90s:
      "Arkansas needs a Secretary of State who runs the desk, not a legislator reliving votes. Elections are county-run — my job is to fund clerks, modernize filings, and publish petition rules everyone can read. I have managed teams under deadline and organized with clerks in the room — that is the administrator test.",
    answer180s:
      "Start with role clarity: SOS is operations for the whole state. Beat one — elections: county clerks run ballots; the SOS funds equipment, trains staff, and answers the phone on night three of early voting. Beat two — business services: Main Street deserves plain forms and rural phone support, not a scavenger hunt in Little Rock. Beat three — Capitol management: petition titles and public records on time, without Friday surprise rule drops. Close on Arkansas promise — one sentence a voter in Mena or Pine Bluff can repeat.",
    voterTranslation: "Picture Marcia T. — 'Will my ballot count and can I file without losing a week?'",
    claimsNote: "No opponent names in opening. No invented election stats.",
    relatedHref: epDebatePrepDayBlockHref("day-1-command-foundation", "b1-tutor"),
    relatedLabel: "Module 1 · administrator frame",
  },
  {
    id: "integrity-one-sentence",
    category: "elections",
    title: "Define election integrity in one sentence",
    trigger: "Moderator: 'What does election integrity mean to you?'",
    moduleSource: "Modules 3–4",
    answer30s:
      "Integrity is funded clerks, transparent processes, and a Secretary of State who picks up the phone when a county hits a snag — not panic politics.",
    answer90s:
      "Election integrity is clerks with working equipment, trained poll workers, and processes Arkansans can watch. The SOS job is to support counties — not to grab power from them. When something breaks in your county, you should reach an administrator who answers, not a politician who blames.",
    answer180s:
      "Name the system: county-run elections, state support desk. Contrast administrator competence with chaos rhetoric — without naming opponents. Offer one concrete SOS behavior: publish guidance before rule changes, fund help desk for clerks, audit equipment backlog. Translate: your ballot in [county] depends on that desk working on night three of early voting. End with clerk partnership inside the answer, Arkansas voter in front of your eyes.",
    voterTranslation: "Rev. James H. — 'Will they try to take my vote?'",
    claimsNote: "Use forum-verified clerk support lines only — no new fraud statistics.",
    relatedHref: epDebatePrepDayBlockHref("day-4-forum-intelligence", "b4-sos"),
    relatedLabel: "Module 4 · SOS question bank",
  },
  {
    id: "clerk-partnership",
    category: "elections",
    title: "County clerk partnership",
    trigger: "Clerk funding, equipment, or 'who runs elections?'",
    moduleSource: "Modules 1 + 4",
    answer30s:
      "Elections are county-run. The SOS funds, trains, and answers the phone — clerks are partners, not props.",
    answer90s:
      "I have organized with clerks in the room. The SOS does not replace county election administrators — we equip them. That means timely funding, clear guidance, and a help desk that picks up when a county hits a snag during early voting.",
    answer180s:
      "Open with respect for county administrators — Carol W. runs the election in her county, not a politician in Little Rock. Then name three SOS deliverables: equipment funding on time, training that respects local knowledge, published processes before rule changes. Bridge from clerk room to living room: when your clerk in Boone County calls on night three, the state desk should answer. Never agree-only — add what clerks need next.",
    voterTranslation: "Carol W. in the room · Marcia T. at home wondering if the system works",
    claimsNote: "ACCA forum lines OK if claims-green.",
    relatedHref: epDebatePrepDayBlockHref("day-4-forum-intelligence", "b4-lab"),
    relatedLabel: "Module 4 · forum intelligence",
  },
  {
    id: "business-rural-modernization",
    category: "business",
    title: "Modernize business services for rural Arkansas",
    trigger: "Moderator: rural filing backlog, UCC, small business support",
    moduleSource: "Module 3",
    answer30s:
      "A filing mistake should not cost a Berryville shop owner a week of revenue — plain forms, rural phone support, audit the backlog first.",
    answer90s:
      "Half the SOS desk is business filings and UCC. Main Street deserves clear forms and real phone support — not a scavenger hunt. I would audit backlogs, publish plain-language guides, and staff rural support blocks before buying shiny software nobody asked for.",
    answer180s:
      "Lead with administrator competence — audit, plain language, rural support. Name who hurts when the desk fails: Berryville shop owner, nonprofit treasurer, farmer updating a lien. Contrast modernization that helps vs modernization that is a press release. One proof point from your platform manual — budgets managed, filings navigated. Close with Robert K. translation: 'Can I get a human on the phone?'",
    voterTranslation: "Robert K. · Main Street filing anxiety",
    claimsNote: "No specific dollar figures unless claims-green.",
    relatedHref: epDebatePrepDayBlockHref("day-3-superiority-map", "b3-manual"),
    relatedLabel: "Module 3 · SOS manual",
  },
  {
    id: "petitions-transparency",
    category: "capitol",
    title: "Ballot measures & petition rules",
    trigger: "Direct democracy, petition titles, ballot measures",
    moduleSource: "Modules 3–4",
    answer30s:
      "Courts decide fights — the SOS administers fairly with transparent titles, published timelines, and records without scavenger hunts.",
    answer90s:
      "Ballot measures deserve rules you can read without a law degree. The SOS publishes titles, timelines, and guidance before Friday rule drops — and public records responses on time. Fair administration is not picking winners — it is readable rules for every signer.",
    answer180s:
      "Frame SOS as neutral administrator — courts decide, SOS publishes. Name Diane P.'s fear: signature gathered in good faith, rules changed in confusion. Offer three behaviors: plain-language petition titles, published implementation calendars, FOIA responses with deadlines. Bridge direct-democracy coalitions you have built — without overclaiming legal outcomes.",
    voterTranslation: "Diane P. · petition signer clarity",
    claimsNote: "No opponent petition claims without verification.",
    relatedHref: epDebatePrepDayBlockHref("day-3-superiority-map", "b3-manual"),
    relatedLabel: "Module 3 · petitions + transparency",
  },
  {
    id: "trap-author-administrator",
    category: "trap",
    title: "Trap: 'I wrote the law'",
    trigger: "Hammer authorship / ranking bait",
    moduleSource: "Module 2",
    answer30s:
      "Clerks do not need another author in the Capitol — they need a Secretary of State who shows up. I will be that administrator.",
    answer90s:
      "Senators write laws. Secretaries of State run the desk — elections, business filings, Capitol rules. When a county clerk calls on night three of early voting, they need an administrator who answers, not another legislator listing bill numbers.",
    answer180s:
      "Acknowledge without flattering — 'I respect the legislature.' Pivot in one breath: SOS is operations. Stack three domains quickly. Offer one clerk-forward proof line from forum prep. Rise to statewide tone — do not get drawn into bill-by-bill sparring. End with service desk invoke.",
    voterTranslation: "Pivot from Capitol insider talk to county operator reality",
    claimsNote: "No bill number debates unless pre-cleared.",
    relatedHref: epTrapLaneHref("county-champion"),
    relatedLabel: "Trap lane · county champion",
  },
  {
    id: "trap-ranking-experience",
    category: "trap",
    title: "Trap: ranking and experience",
    trigger: "'Most experienced' / hierarchy bait",
    moduleSource: "Module 2",
    answer30s:
      "Experience running the desk matters — organizing teams, meeting payroll, answering clerks — not years listing someone else's votes.",
    answer90s:
      "Arkansas needs someone who has managed operations under deadline — nonprofits, civic coalitions, real budgets. The SOS desk is not a seniority trophy — it is elections, business services, and Capitol management working on the same day.",
    answer180s:
      "Do not accept the ranking frame. Reframe to administrator competencies: managed teams, met deadlines, built coalitions that delivered. One forum fact if claims-green. Translate for voter: experience is showing up when the filing system breaks, not debating who voted how in 2019.",
    voterTranslation: "Marcia T. — 'Can you actually run things?'",
    claimsNote: "Qualification stack from Module 3 only.",
    relatedHref: epTrapLaneHref("integrity-without-participation"),
    relatedLabel: "Trap lane · integrity without participation",
  },
  {
    id: "trap-trust-pile-on",
    category: "trap",
    title: "Pile-on: government trust",
    trigger: "Hammer + Pakko trust attack combined",
    moduleSource: "Module 5",
    answer30s:
      "Trust is earned at the service desk — elections that work, filings that clear, rules you can read. That is the job I am running to do.",
    answer90s:
      "When people stop trusting institutions, they still need ballots counted and businesses filed. The SOS rebuilds trust with transparent processes and a desk that answers — not with slogans. Elections, business services, Capitol rules — one calm administrator.",
    answer180s:
      "Bridge, do not bash government abstractly. Name three SOS behaviors that rebuild trust operationally. Acknowledge frustration without agreeing with cynicism. Picture statewide audience — rise from clerk-room agree lines. Close ready for moderator to move to next SOS domain question.",
    voterTranslation: "Statewide tone — not only clerks in the room",
    claimsNote: "No opponent trust smears.",
    relatedHref: epDebatePrepDayBlockHref("day-5-anticipate-and-capitalize", "b5-lab-review"),
    relatedLabel: "Module 5 · when-X-say-Y sheet",
  },
  {
    id: "closing-service-desk",
    category: "closing",
    title: "Closing — service desk invoke",
    trigger: "Final 60 seconds — peak-end",
    moduleSource: "Modules 7–8",
    answer30s:
      "Elect honest elections, clear business filings, and Capitol rules you can read — that is the Secretary of State I will be.",
    answer90s:
      "Arkansas deserves a Secretary of State who treats elections, business services, and Capitol management as one service desk — funded clerks, plain forms, transparent petition rules. I have done the work in the room and on the ground. Hold the pause — let the last word land.",
    answer180s:
      "Beat 1 — three domains in calm sentences, no rush. Beat 2 — one sim debrief fix on weakest domain from Module 6. Beat 3 — quotable line staff-cleared, two-second silence after last word. Picture primary persona — Marcia T. default. No new stats — lock sheet only.",
    voterTranslation: "Peak-end rule — editors pull opening calm and closing quotable",
    claimsNote: "Day 7 claims final cut is ceiling.",
    relatedHref: epDebatePrepDayBlockHref("day-7-refine-and-steal-show", "b7-open-close"),
    relatedLabel: "Module 7 · bookends polish",
  },
] as const;

export function getExtendedResponse(id: string): ExtendedResponseNarrative | undefined {
  return EXTENDED_RESPONSE_NARRATIVES.find((r) => r.id === id);
}

export function listExtendedResponsesByCategory(
  category: ExtendedResponseNarrative["category"],
): readonly ExtendedResponseNarrative[] {
  return EXTENDED_RESPONSE_NARRATIVES.filter((r) => r.category === category);
}

export const EXTENDED_RESPONSE_IDS = EXTENDED_RESPONSE_NARRATIVES.map((r) => r.id);
