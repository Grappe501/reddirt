/**
 * Kelly Grappe — first-debate coaching layer: scripts, psychology, three-way strategy, candidate input.
 */

export type DebateScript = {
  id: string;
  label: string;
  durationSeconds: number;
  text: string;
  deliveryNotes: string[];
  claimsGate: string;
};

export type CoachingBlock = {
  title: string;
  bullets: string[];
  doNot: string[];
};

export const KELLY_ONLY_WOMAN_ON_STAGE: CoachingBlock = {
  title: "Only woman on stage — use it with discipline",
  bullets: [
    "Voters often read calm + prepared + specific as competence — your contrast is two male career politicians vs a service-first SOS candidate.",
    "Do not lead with gender; lead with SOS service for clerks and voters. Gender becomes subtext: you are not performing outrage — you are running the office.",
    "When Hammer gets prosecutorial, lower your volume slightly and slow down — the room will hear the difference as maturity, not weakness.",
    "Eye contact: moderator first when answering; brief glance at opponents only when acknowledging fair point — never stare down.",
    "Avoid apologizing for emotion; if something matters (clerks, voters), let it show once, then return to methodical facts.",
    "Wardrobe: solid color, no busy pattern on camera; still hands at podium — clasp lightly or rest on lectern.",
  ],
  doNot: [
    "Do not say opponents are afraid of a woman — sounds gimmicky.",
    "Do not reference personal family in attack context.",
    "Do not over-smile when discussing election integrity — serious face, warm tone.",
  ],
};

export const KELLY_STAGE_PRESENCE: CoachingBlock = {
  title: "Stage presence · demeanor · slow speech",
  bullets: [
    "Default pace: 20% slower than conversation — first-timers rush when nervous.",
    "One idea per sentence. Pause half-beat after act number so it lands.",
    "Methodical language: 'First… Second… As Secretary of State I would…' — not stream of consciousness.",
    "Composure cue: feet planted, shoulders down, exhale before first word.",
    "Under attack: inhale through nose, answer the question asked, not the insult implied.",
    "Notes: index card with three moves only — glancing down is fine; reading paragraphs is not.",
    "Water: sip between segments, not mid-answer.",
    "Rehearse standing in shoes you will wear — balance matters for stillness.",
  ],
  doNot: [
    "No finger pointing at opponents.",
    "No interrupting — moderator punishes newcomers harshly.",
    "No new statistics you did not verify in claims ledger.",
  ],
};

export const KELLY_PSYCHOLOGY_PREP: CoachingBlock = {
  title: "Psychological prep — first debate vs 25-year legislator",
  bullets: [
    "Expect Hammer to bait you into defending your whole life story — pivot to SOS job description in one sentence.",
    "Expect Packo to sound reasonable on process reform — agree where fair, contrast implementation and county partnership.",
    "Your win emotion: voters leave thinking Kelly will pick up the phone for clerks — not that Kelly won an argument.",
    "Pre-debate ritual: 4-7-8 breathing x3, say opening first sentence aloud alone backstage.",
    "If you blank: 'Let me answer directly…' + pillar + bridge — never fill silence with attack.",
    "Post-debate: do not read Twitter for 24 hours — staff handles spin; you sleep.",
  ],
  doNot: [
    "Do not memorize zingers that require unverified facts.",
    "Do not debate staff or family in the green room — stay in role.",
  ],
};

export const THREE_WAY_DEBATE_STRATEGY = {
  headline: "Kelly vs Hammer vs Packo — three-person geometry",
  kellyRole: "The administrator-in-waiting: calm, specific, county-first, claims-disciplined.",
  hammerRole: "The legislator-author: experience, integrity slogans, petition record — trap on implementation dollars.",
  packoRole: "The third-party reformer: anti-duopoly, election process ideas — rarely attack; contrast readiness to administer.",
  crossLanes: [
    {
      scenario: "Hammer attacks Kelly inexperience",
      hammerLikely: "Never run anything / first-time candidate.",
      packoMayAdd: "System needs outsiders — implicit boost to Packo.",
      kellyMove: "Agree Hammer has tenure → SOS administers in 75 counties → Kelly service plan. Ignore Packo unless moderator asks.",
    },
    {
      scenario: "Packo attacks two-party system",
      hammerLikely: "Defends GOP record or ignores.",
      kellyMove: "Agree voters deserve choices → SOS must still run elections fairly for all parties → Kelly will publish rules and support clerks.",
    },
    {
      scenario: "Moderator: petition / direct democracy",
      hammerLikely: "Fraud prevention frame.",
      packoMayAdd: "Access and competition frame.",
      kellyMove: "Integrity + lawful participation → county burden → verify acts — do not pile on Packo.",
    },
    {
      scenario: "Moderator: why you vs both men",
      kellyMove: "This office is daily service to election workers and voters — I am running to administer, not to perform partisan theater. I will fund clarity and answer the phone.",
    },
  ],
  whenToEngagePacko: "Only when moderator directs or Packo names you. In clerk rooms: never elevate third candidate.",
  whenToEngageHammer: "When record or bills are on the table — always act-anchor + county impact first.",
};

export const KELLY_OPENING_SCRIPTS: DebateScript[] = [
  {
    id: "open-30",
    label: "Opening — 30 seconds",
    durationSeconds: 30,
    claimsGate: "GENERAL_FRAME — customize after counsel review",
    text: "I'm Kelly Grappe. I'm running for Secretary of State because Arkansas deserves an office that serves county clerks and voters every day — transparent rules, real training support, and elections that are secure and lawful. I will answer your questions directly tonight.",
    deliveryNotes: ["Last sentence slower", "Smile once at thank-you, not during integrity lines"],
  },
  {
    id: "open-60",
    label: "Opening — 60 seconds",
    durationSeconds: 60,
    claimsGate: "GENERAL_FRAME",
    text: "I'm Kelly Grappe, and I'm asking for the job of Secretary of State — not to fight a culture war, but to run a statewide service desk for election workers and voters. Clerks implement what the Capitol passes. They need a Secretary of State who publishes clear guidance, advocates for funding, and picks up the phone. I believe in trust you can verify, counties you can support, and participation protected with real integrity. Tonight I'll speak carefully — if I cite a bill, it's because we've verified it. Ask me anything.",
    deliveryNotes: ["Pause after 'picks up the phone'", "Do not name opponents in first 20 seconds"],
  },
  {
    id: "open-90",
    label: "Opening — 90 seconds",
    durationSeconds: 90,
    claimsGate: "GENERAL_FRAME — optional one verified act if staff approves",
    text: "I'm Kelly Grappe. After talking with county clerks and election commissioners across Arkansas, I'm running for Secretary of State because this office is where trust is built or broken — one training calendar, one hotline, one set of rules voters can read. I'm not a career politician asking for another platform. I'm asking to administer elections fairly in all seventy-five counties, for voters of every party. Senator Hammer and Dr. Pakko have their records — tonight I'll respect the voters' right to compare. My focus is service: transparent rules, county partnership, and integrity plus lawful participation together. I won't pretend every answer is easy; I will tell you what I know, what I'm still verifying, and what I'll do differently starting day one. Thank you for listening.",
    deliveryNotes: [
      "Calm, not rushed — 90s is shorter than it feels",
      "Naming opponents once is enough — then back to service",
    ],
  },
];

export const KELLY_CLOSING_SCRIPTS: DebateScript[] = [
  {
    id: "close-30",
    label: "Closing — 30 seconds",
    durationSeconds: 30,
    claimsGate: "GENERAL_FRAME",
    text: "You'll remember three things: trust you can see, counties you can support, and participation with integrity. I'm Kelly Grappe — choose the Secretary of State who will serve clerks and voters, not slogans. Thank you.",
    deliveryNotes: ["Eyes to camera/moderator", "No attack line"],
  },
  {
    id: "close-60",
    label: "Closing — 60 seconds",
    durationSeconds: 60,
    claimsGate: "GENERAL_FRAME",
    text: "This race is about who will run the Secretary of State's office after the cameras leave — when a clerk calls Little Rock on a Friday afternoon, when a voter needs a rule explained, when a county needs funding help at the Capitol. I will show up for that work. Trust, transparency, county support, lawful participation — that's my pledge. I'm Kelly Grappe. Thank you.",
    deliveryNotes: ["Slower on 'Friday afternoon' — humanize", "End on thank you, not opponent"],
  },
  {
    id: "close-90",
    label: "Closing — 90 seconds",
    durationSeconds: 90,
    claimsGate: "GENERAL_FRAME",
    text: "Arkansas doesn't need more political theater in the Secretary of State's office. It needs competence, calm, and respect for the people who actually run elections. I've listened to clerks. I've built this campaign on service — not on tearing anyone down. If you elect me, I will publish rules voters can verify, fight for county training and implementation support, and protect both security and lawful access. Senator Hammer has written a lot of election law. Dr. Pakko brings reform ideas from outside the two parties. I bring a commitment to administer — fairly, in every county, every day. I'm Kelly Grappe. I'd be honored to earn your vote. Thank you.",
    deliveryNotes: [
      "Fair acknowledgment of opponents — no sarcasm",
      "Final line quiet confidence, not shout",
    ],
  },
];

export const PACKO_IN_DEBATE_PREP = {
  headline: "Michael Packo (Pakko) in debate prep — cross with Hammer and Kelly",
  spellingNote: "Campaign site uses Pakko; legal/ballot spelling Packo/Pakko — verify filing before on-stage name.",
  doNotSay: [
    "Spoiler or wasted vote — alienates libertarian-leaning voters",
    "Dismiss economist credentials — sounds elitist",
  ],
  kellyBridges: [
    "Dr. Pakko and I both want voters to trust the process — I will earn that as Secretary of State by supporting clerks who implement the law.",
    "Reform ideas matter — but SOS is administration. I am running to do the daily work in seventy-five counties.",
    "If the question is duopoly — my answer is service: make the office transparent enough that parties compete on competence, not confusion.",
  ],
  hammerPackoOverlap: "Both may criticize establishment; Kelly is not establishment SOS — differentiate implementation vs commentary.",
  researchGaps: "PACKO-06 media harvest — use opponent media catalog and snippet slots before contrast ads.",
};
