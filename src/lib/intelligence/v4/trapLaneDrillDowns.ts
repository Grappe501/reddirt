import { OPPONENT_TRAP_LANES } from "@/lib/intelligence/v4/kellyOpponentContrastPlaybook";
import { getTrapLaneStaffFindings } from "@/lib/intelligence/v4/debateWhatToLookForEnrichment";
import type { TrapLaneDrillDown } from "@/lib/intelligence/v4/trapLaneDrillDownTypes";
import type { RebuttalScript, SampleScript, DebateZinger } from "@/lib/intelligence/v4/debatePrepDrillDownTypes";
import { getTrapLaneEncounterDepth, mergeEncounterDepth } from "@/lib/intelligence/v4/debatePlainLanguageDepth";

const FIRST_TIMER =
  "Trap lanes are not insults — they are chess. You set a fair question; he answers into a record voters can check. Stay calm when he bites. If he does not bite, take your pivot anyway in one sentence and move on.";

function r(
  trigger: string,
  hammer: string,
  agree: string,
  contrast: string,
  bridge: string,
  zinger?: string,
  claimsNote?: string,
): RebuttalScript {
  return { trigger, hammerLikelyLine: hammer, agree, contrast, bridge, zinger, claimsNote };
}

function z(line: string, when: string, whenNot: string, gate?: string): DebateZinger {
  return { line, whenToUse: when, whenNotToUse: whenNot, claimsGate: gate };
}

function s(label: string, duration: string, text: string, deliveryNote?: string): SampleScript {
  return { label, duration, text, deliveryNote };
}

function baseFromTrap(
  laneId: string,
  num: number,
  trapIndex: number,
  extra: Partial<TrapLaneDrillDown>,
): TrapLaneDrillDown {
  const trap = OPPONENT_TRAP_LANES[trapIndex];
  const staff = getTrapLaneStaffFindings(laneId);
  return {
    laneId,
    laneNumber: num,
    title: trap.name,
    summary: trap.whyItWorks,
    narrativeOverview: extra.narrativeOverview ?? trap.whyItWorks,
    whatToExpectHammerToSay: extra.whatToExpectHammerToSay ?? [trap.baitLineYouWantFromOpponent],
    hammerTonalities: extra.hammerTonalities ?? [],
    whatModeratorMayAsk: extra.whatModeratorMayAsk ?? [],
    setupMoves: extra.setupMoves ?? [trap.moderatorOrKellySetupQuestion],
    setupTiming: extra.setupTiming ?? "Mid-debate when he claims a fresh start or pattern break.",
    baitPsychology: extra.baitPsychology ?? trap.whyItWorks,
    whenHeBitesSignals: extra.whenHeBitesSignals ?? [],
    kellyPivotDeep: extra.kellyPivotDeep ?? trap.kellyPivotWhenHeBites,
    rebuttalScripts: extra.rebuttalScripts ?? [],
    sampleScripts: extra.sampleScripts ?? [],
    zingers: extra.zingers ?? [],
    ifHeDoesNotBite: extra.ifHeDoesNotBite ?? [],
    mistakesFirstTimersMake: extra.mistakesFirstTimersMake ?? [],
    bodyLanguageAndTone:
      extra.bodyLanguageAndTone ??
      "Eyes on moderator. Hands still. Voice drops half a level when pivoting — authority without anger.",
    rehearsalSteps: extra.rehearsalSteps ?? [
      "Read narrative aloud once",
      "Staff plays Hammer bait line — Kelly runs setup question",
      "Kelly delivers 45s pivot without notes",
    ],
    relatedActs: extra.relatedActs ?? [],
    relatedBills: extra.relatedBills ?? [],
    packoNote: extra.packoNote,
    claimsGate: extra.claimsGate ?? "NEEDS_REVIEW — verify act numbers on Arkleg before stage",
    estimatedPrepMinutes: extra.estimatedPrepMinutes ?? 30,
    debateSteps: extra.debateSteps ?? [],
    whatToLookForOffensive: staff?.offensive ?? [],
    whatToLookForDefensive: staff?.defensive ?? [],
    whatToLookForVerify: staff?.verify ?? [],
    debateOffensiveUse:
      staff?.debateUse?.split("DEFENSIVE:")[0]?.replace(/^OFFENSIVE:\s*/i, "").trim() ??
      trap.kellyPivotWhenHeBites,
    debateDefensiveUse:
      staff?.debateUse?.split("DEFENSIVE:")[1]?.trim() ??
      staff?.defensive.join(" ") ??
      "Protect Kelly from overreach and unsupported claims.",
  };
}

export const TRAP_LANE_DRILL_DOWNS: Record<string, TrapLaneDrillDown> = {
  "2021-vs-2025-pivot": baseFromTrap("2021-vs-2025-pivot", 1, 0, {
    narrativeOverview:
      "Hammer will try to sell 2025 petition bills as a new, sober chapter — separate from the 2021 six-bill election package. Your job is to show continuity: Little Rock keeps adding rules; counties keep implementing without new money. Voters should hear pattern, not personality.",
    whatToExpectHammerToSay: [
      "‘2025 was about election security — a fresh start.’",
      "‘We fixed what was broken after 2020.’",
      "‘Those 2021 bills were a different time — we've learned.’",
      "‘Check my record — I have been consistent on integrity.’",
      "Lists 2025 act numbers fast to sound in command.",
    ],
    hammerTonalities: [
      "Senator-in-charge cadence — rapid bill numbers",
      "Dismissive of ‘one session’ criticism",
      "Appeals to Trump-era election anxiety without Arkansas data",
    ],
    whatModeratorMayAsk: [
      "Is 2025 a continuation of 2021 election law changes?",
      "What changed for county clerks between packages?",
      "How many fraud cases justified the new petition rules?",
    ],
    setupMoves: [
      "Early in debate: ‘Senator, you led major election packages in 2021 and again in 2025 — help voters see what changed for clerks.’",
      "When he says fresh start: ‘Fresh for whom — the Capitol or the county courthouse?’",
      "Hold up one 2021 act and one 2025 act only — do not stack six numbers unless moderator invites.",
      "Bridge to road story: clerk got 2021 rules, then 2025 rules, no training line item.",
    ],
    setupTiming: "Best after he mentions experience or ‘check my record’ — trap reinforces Check My Record playbook.",
    baitPsychology:
      "He wants to compartmentalize sessions so Kelly cannot paint a decade-long squeeze. Forcing comparison makes him defend two architectures at once.",
    whenHeBitesSignals: [
      "He says ‘different circumstances’ without county examples",
      "He pivots to national fraud headlines",
      "He cannot name clerk funding between packages",
    ],
    kellyPivotDeep:
      "Open the timeline: 2021 package set the architecture; 2025 added petition pressure. Kelly breaks the pattern with SOS service — training calendar, funding advocacy, readable rules — not another authorship spree.",
    relatedActs: ["727", "728", "729", "730", "731", "218", "240", "274", "768"],
    relatedBills: ["SB486", "SB250", "SB584"],
    debateSteps: [
      { step: 1, dimension: "WHAT", detail: "Two packages — 2021 six-bill cluster + 2025 petition stack." },
      { step: 2, dimension: "WHEN", detail: "After he claims fresh start or check my record." },
      { step: 3, dimension: "WHERE", detail: "Debate integrity segment; county forums." },
      { step: 4, dimension: "WHY", detail: "Voters forgive one fix; they resist permanent ratchet." },
      { step: 5, dimension: "HOW", detail: "Timeline verbal → one clerk cost → Kelly SOS pledge." },
      { step: 6, dimension: "WHO", detail: "Clerks implementing both waves." },
    ],
    rebuttalScripts: [
      r(
        "He separates 2025 from 2021",
        "Apples and oranges — 2021 was emergency, 2025 was precision.",
        "Emergencies deserve answers — show clerks the funding.",
        "Both sessions added rules counties must live under without a SOS partner.",
        "I am running to implement fairly — not to add another stack.",
        "Pattern matters more than slogans.",
        "Verify 2021 act list before citing all six on stage.",
      ),
    ],
    sampleScripts: [
      s(
        "Setup question — 20s",
        "20s",
        "Senator, you sponsored a major election package in 2021 and another petition package in 2025. What changed for a county clerk between those two moments — besides more paper?",
        "Pause after ‘more paper’ — let room react",
      ),
      s(
        "Pivot — 45s",
        "45s",
        "I am not saying elections were easy in 2021. I am saying Arkansas now has a pattern: new rules from the Capitol, clerks absorb the cost. Secretary of State should publish guidance clerks can read and fight for funding at the Capitol. That is the job I am asking for.",
      ),
    ],
    zingers: [
      z(
        "Fresh start? Show us the fresh funding line for clerks.",
        "After he says fresh start",
        "Before you have verified budget data",
        "GENERAL_FRAME",
      ),
    ],
    ifHeDoesNotBite: [
      "Do not repeat setup three times — one pivot sentence and move to county service frame.",
      "Use 2025 act only: ‘Act 768 landed on clerks — what did SOS fund?’",
    ],
    mistakesFirstTimersMake: [
      "Listing every 2021 bill — sounds like attack brochure",
      "Saying he ‘always’ does X without act cite",
      "Getting angry about 2020 — national rabbit hole",
    ],
    estimatedPrepMinutes: 35,
  }),

  "integrity-without-participation": baseFromTrap("integrity-without-participation", 2, 1, {
    narrativeOverview:
      "Hammer's favorite false choice: security OR chaos. Kelly owns both: prosecute real fraud, protect lawful petition drives and referendum rights. This lane pairs with direct democracy corner and Check My Record acts 218–768.",
    whatToExpectHammerToSay: [
      "‘If you weaken these bills, you invite fraud.’",
      "‘Arkansas voters want secure elections, not chaos.’",
      "‘Out-of-state money flooded petition drives.’",
      "‘I am pro-security; my opponent is pro-chaos.’",
      "Invokes ‘protect the constitution’ without fraud case counts.",
    ],
    hammerTonalities: ["Binary framing", "Moral high ground", "Implied Kelly is soft on crime"],
    whatModeratorMayAsk: [
      "Can we have election integrity and ballot access?",
      "How would you stop petition fraud without stopping lawful drives?",
      "What is the SOS role in both?",
    ],
    setupMoves: [
      "Preempt in opening if petition topic likely: ‘integrity and participation together.’",
      "Ask: ‘Name the conviction count that justified Act 241.’",
      "When he goes binary: ‘I agree on prosecuting fraud — show the data per act.’",
      "Road story: volunteer confusion, not fraud.",
    ],
    setupTiming: "When moderator says petition, ballot measure, or signature gathering.",
    baitPsychology: "Forces him to quantify fraud or admit process was the real target.",
    whenHeBitesSignals: ["No numbers", "Pivot to national stories", "Attacks Kelly as naive"],
    kellyPivotDeep:
      "Kelly: SOS publishes plain rules, funds clerk training, investigates real fraud — without strangling lawful circulators. Participation and integrity are one package.",
    relatedActs: ["218", "240", "241", "274", "279", "768"],
    relatedBills: ["SB207", "SB584", "SB291"],
    packoNote: "If Packo joins on access — agree briefly; narrow to who administers in 75 counties.",
    rebuttalScripts: [
      r(
        "Security vs chaos",
        "You cannot have both — pick a side.",
        "I pick both — prosecute fraud, protect lawful drives.",
        "Your bills added process without proving fraud cases per act.",
        "Secretary of State should make rules readable — not trap volunteers.",
      ),
    ],
    sampleScripts: [
      s(
        "Kelly frame — 30s",
        "30s",
        "Arkansas can have election integrity and lawful participation. Prosecute real fraud — I support that. But do not criminalize confusion. Publish rules voters and volunteers can read. Fund clerks. That is Secretary of State service.",
      ),
    ],
    estimatedPrepMinutes: 30,
  }),

  "county-champion": baseFromTrap("county-champion", 3, 2, {
    narrativeOverview:
      "Hammer claims rural county identity — ‘I am the clerks' guy.’ Test with verifiable clerk support and implementation dollars. Kelly wins with SOS deliverables: hotline, training calendar, quorum-court funding advocacy.",
    whatToExpectHammerToSay: [
      "‘I work with county clerks every day.’",
      "‘Rural Arkansas needs strong election laws.’",
      "‘Kelly does not understand county government.’",
      "Name-drops meetings without funding outcomes.",
    ],
    setupMoves: [
      "Ask which clerk associations endorsed his implementation plan for Act 350.",
      "Ask for training module funded when Act 444 passed.",
      "Use road story — Friday mandate, no training budget.",
    ],
    relatedActs: ["350", "444"],
    relatedBills: ["HB1457", "SB250"],
    kellyPivotDeep:
      "Clerks need a SOS who shows up — not another promise from Little Rock. Kelly lists hotline, training, funding asks with specifics.",
    sampleScripts: [
      s(
        "County champion trap — 25s",
        "25s",
        "Senator, which county clerk associations endorsed your implementation plan for the last election act you sponsored — and what was the funding line?",
      ),
    ],
    estimatedPrepMinutes: 28,
  }),

  "fraud-data-dare": baseFromTrap("fraud-data-dare", 4, 3, {
    narrativeOverview:
      "Move emotion to data. Every petition bill should have a fraud justification — make him show it or retreat to ‘process.’ Core offensive lane for direct democracy.",
    whatToExpectHammerToSay: [
      "‘Fraud is everywhere.’",
      "‘You have seen the news — people gaming the system.’",
      "‘We had to tighten signatures.’",
      "Cites national cases, not Arkansas convictions.",
    ],
    setupMoves: [
      "‘How many Arkansas election-fraud convictions in five years justify Act 241?’",
      "‘Under Act 768, what local petition problem had documented cases?’",
      "Pair with THV11 ‘led the charge’ only after staff verifies framing.",
    ],
    relatedActs: ["241", "768", "218"],
    kellyPivotDeep: "Prosecute real fraud. Do not bury lawful drives in paperwork. SOS transparency.",
    sampleScripts: [
      s(
        "Fraud dare — 20s",
        "20s",
        "Senator, you asked voters to check your record — help us check outcomes: how many fraud convictions justified the petition bills you sponsored in 2025?",
      ),
    ],
    estimatedPrepMinutes: 32,
  }),

  "experience-equals-sos-ready": baseFromTrap("experience-equals-sos-ready", 5, 4, {
    narrativeOverview:
      "Maps directly to Check My Record. Legislative tenure is real — SOS is administering in 75 counties. Kelly superiority: service desk, not authorship.",
    whatToExpectHammerToSay: [
      "‘Nobody knows election law like I do.’",
      "‘Sixteen years of service.’",
      "‘My opponent has never run anything.’",
      "‘Check my record.’",
    ],
    setupMoves: [
      "Welcome check my record — verified acts on Arkleg.",
      "‘What did you do to help all 75 counties implement on time?’",
      "Author vs administrator frame.",
    ],
    relatedActs: ["218", "240", "274", "241", "768"],
    kellyPivotDeep: "See Check My Record six-beat walkthrough on debate coaching page.",
    sampleScripts: [
      s(
        "Check my record welcome — 50s",
        "50s",
        "I have checked your record, Senator — verified on Arkleg. In 2025 you sponsored Acts 218, 240, 274, 241, and 768. That is legislative experience — Secretary of State is implementation in every county. I am running to answer the phone for clerks.",
        "Full script on coaching page",
      ),
    ],
    estimatedPrepMinutes: 40,
  }),

  "culture-war-escalation": baseFromTrap("culture-war-escalation", 6, 5, {
    narrativeOverview:
      "When biography or partisan war bait appears — decline theater. Return to acts, counties, SOS service. Voters reward composure; clips favor Kelly discipline. This lane is the most dangerous for a first-time debater because it feels personal. It is not personal — it is a tactic to steal your time.",
    whatToExpectHammerToSay: [
      "Personal dig at Kelly background or faith",
      "Partisan war language ('radical,' 'elite,' 'they')",
      "Provocative framing on opponents, church, or gender",
      "Attempts to make Kelly interrupt or raise voice",
      "Asking you to condemn a group of Arkansas voters",
      "Implying you are 'not one of us' without saying it plainly",
    ],
    hammerTonalities: [
      "Moral certainty tone — sounds like a sermon, not a policy answer",
      "Speed increase after bait to pressure interruption",
      "Looking at audience for reaction instead of moderator",
    ],
    whatModeratorMayAsk: [
      "A 'gotcha' biography question packaged as qualifications",
      "Whether you will disavow a supporter or opponent statement",
      "Why voters should trust you on 'values'",
    ],
    setupMoves: [
      "Do not take fresh bait — finish your current answer in one sentence first.",
      "Boundary: ‘I am running to run the Secretary of State's office for every voter.’",
      "Pivot to bill, county clerks, or transparency within 10 seconds.",
      "If moderator repeats bait: thank them, decline biography, answer SOS role only.",
    ],
    baitPsychology:
      "He wants a clip of you angry or defensive. Undecided voters forgive policy disagreement; they punish loss of control. Your win is boring composure on camera.",
    whenHeBitesSignals: [
      "He defends biography longer than a bill",
      "He uses hot-button words you did not use",
      "He turns toward you instead of moderator — invitation to interrupt",
    ],
    kellyPivotDeep:
      "Decline bait calmly — never repeat his insult words. Anchor one verified act or county burden, then unity bridge: non-partisan SOS educates the public and supports all 75 counties. If Packo piles on, add one fresh line about clerks — do not ask for his vote.",
    rebuttalScripts: [
      r(
        "Biography attack",
        "You don't understand Arkansas values.",
        "I love this state — that is why I am running for a service office, not a talk show.",
        "Values show up in how we treat county clerks and voters — published rules, equal treatment.",
        "Let's compare acts and implementation — who funds clerk training?",
        "Service desk, not culture-war pulpit.",
      ),
      r(
        "Partisan bait",
        "This is about Democrats vs Republicans.",
        "Election administration should be non-partisan — equal rules for every county.",
        "My opponent wrote many election laws; I am asking who will implement them fairly for clerks.",
        "I will work across the aisle so voters trust the process.",
      ),
    ],
    ifHeDoesNotBite: [
      "Stay on substance — do not pre-empt attacks that did not happen",
      "If bait fails, he may return to bill numbers — switch to experience or 2021 trap lane",
    ],
    mistakesFirstTimersMake: [
      "Defending biography for 60 seconds",
      "Finger pointing or stepping toward opponent",
      "Apologizing for being a woman or outsider — do not use gender as weapon",
      "Repeating his hot-button words back to 'deny' them — amplifies the frame",
      "Asking Hammer to apologize — moderators dislike candidate-on-candidate fights",
    ],
    bodyLanguageAndTone:
      "Hands still at waist. Chin level. Look at moderator when declining bait. When pivoting to counties, slight turn to audience — invite them into service frame. Never smirk or laugh at bait.",
    rehearsalSteps: [
      "Read 15s decline script aloud 5 times — eyes on imaginary moderator",
      "Staff throws bait lines; Kelly practices pivot under 10s",
      "Watch one opponent clip — practice not mirroring his volume",
      "Open /admin/intelligence/debate-depth/culture-war for full plain-language block",
    ],
    sampleScripts: [
      s(
        "Decline bait — 15s",
        "15s",
        "I am running to make the Secretary of State's office work for every voter in every county. Let's talk about the acts and the clerks who implement them.",
        "Eyes to moderator — not Hammer",
      ),
      s(
        "Pivot after bait — 30s",
        "30s",
        "The Secretary of State should educate voters on the rules and support county clerks equally. I will publish guidance anyone can read and fund training — not unfunded mandates from the Capitol.",
        "Calm pace — slower than his bait",
      ),
      s(
        "Packo pile-on — 20s",
        "20s",
        "I agree we need secure elections. Here is what neither of you said: county clerks in all 75 counties need clear rules and resources before the next cycle.",
      ),
    ],
    zingers: [
      z(
        "Service desk, not pulpit.",
        "After biography bait when you need a crisp close",
        "When moderator already ruled the question out of order",
        "Tone only — not a standalone policy answer",
      ),
    ],
    relatedLinks: [
      { href: "/admin/intelligence/debate-depth/culture-war", label: "Culture-war depth guide" },
      { href: "/admin/intelligence/debate-depth/if-stuck", label: "If you get stuck" },
      { href: "/admin/intelligence/sos-debate-questions", label: "SOS questions" },
    ],
    estimatedPrepMinutes: 25,
  }),
};

export function getTrapLaneDrillDown(laneId: string): TrapLaneDrillDown | undefined {
  const row = TRAP_LANE_DRILL_DOWNS[laneId];
  if (!row) return undefined;
  const encounterDepth = mergeEncounterDepth(row.encounterDepth, getTrapLaneEncounterDepth(laneId));
  return encounterDepth ? { ...row, encounterDepth } : row;
}

export function getAllTrapLaneIds(): string[] {
  return Object.keys(TRAP_LANE_DRILL_DOWNS);
}

export function listTrapLaneSummaries(): Array<{ laneId: string; title: string; summary: string }> {
  return getAllTrapLaneIds().map((id) => ({
    laneId: id,
    title: TRAP_LANE_DRILL_DOWNS[id].title,
    summary: TRAP_LANE_DRILL_DOWNS[id].summary,
  }));
}

export const TRAP_LANE_FIRST_TIMER_NOTE = FIRST_TIMER;
