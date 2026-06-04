import { PREP_SECTION_GUIDES } from "@/lib/intelligence/v4/debateOperatorNarratives";
import { getPrepSectionEncounterDepth, mergeEncounterDepth } from "@/lib/intelligence/v4/debatePlainLanguageDepth";
import type {
  DebatePrepSectionDrillDown,
  DebateZinger,
  RebuttalScript,
  SampleScript,
} from "@/lib/intelligence/v4/debatePrepDrillDownTypes";

const FIRST_TIMER =
  "Kelly has not debated on stage before; Kim Hammer has 25+ years of public argument habit. Your job is not to win a courtroom cross-examination — it is to look calm, answer directly, and make voters trust you as the next Secretary of State. Short beats clever. Silence beats rambling.";

const DEFAULT_LINKS = [
  { href: "/admin/intelligence", label: "Command hub" },
  { href: "/admin/intelligence/claims", label: "Claims ledger" },
  { href: "/admin/intelligence/debate-command", label: "Debate command" },
];

function z(line: string, when: string, whenNot: string, gate?: string): DebateZinger {
  return { line, whenToUse: when, whenNotToUse: whenNot, claimsGate: gate };
}

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

function s(label: string, duration: string, text: string, deliveryNote?: string): SampleScript {
  return { label, duration, text, deliveryNote };
}

function mk(
  id: string,
  num: number,
  title: string,
  extra: Partial<DebatePrepSectionDrillDown>,
): DebatePrepSectionDrillDown {
  const guide = PREP_SECTION_GUIDES[id];
  if (!guide) throw new Error(`Missing PREP_SECTION_GUIDES[${id}]`);
  return {
    sectionId: id,
    sectionNumber: num,
    sectionTitle: title,
    firstTimeDebateNote: FIRST_TIMER,
    whatOpponentWillDo: [],
    whatModeratorMayAsk: [],
    setupMoves: [],
    rebuttalScripts: [],
    sampleScripts: [],
    zingers: [],
    mistakesFirstTimersMake: [],
    bodyLanguageAndTone: "Stand tall, hands still, eyes on moderator when answering. Smile once at opening, not during attacks. Never interrupt — voters punish the interrupting newcomer.",
    rehearsalSteps: ["Read drill-down aloud once", "Practice sample scripts with timer", "Staff plays Hammer for one rebuttal"],
    staffRole: "Staff tracks claims gate; Kelly does not read retrieval sections on stage.",
    relatedLinks: DEFAULT_LINKS,
    estimatedPrepMinutes: 25,
    ...guide,
    ...extra,
  };
}

export const DEBATE_PREP_SECTION_DRILL_DOWNS: Record<string, DebatePrepSectionDrillDown> = {
  strategy: mk("strategy", 1, "Debate strategy overview", {
    estimatedPrepMinutes: 35,
    firstTimeDebateNote:
      "Your first debate is a job interview for SOS, not a trial. Hammer will try to make it about who has been in the building longer. You make it about who will serve clerks and voters after the cameras leave.",
    whatOpponentWillDo: [
      "Open with integrity + experience + #1 ranking talking points",
      "Interrupt your answers with bill numbers to sound authoritative",
      "Frame every Kelly answer as ‘inexperience’ or ‘radical’",
      "Avoid county implementation dollars unless forced",
    ],
    whatModeratorMayAsk: [
      "Why are you qualified for Secretary of State?",
      "What is the biggest difference between you and Senator Hammer?",
      "How will you handle election integrity concerns?",
    ],
    setupMoves: [
      "Decide three moves tonight before walk-on — write on index card",
      "Tell staff your ‘educate not attack’ rule — they flag you if tone spikes",
      "Pre-agree: if Hammer gets personal, you pivot to SOS service in one sentence",
    ],
    rebuttalScripts: [
      r(
        "Qualifications attack",
        "I've been working on election law for years; my opponent hasn't run anything.",
        "Senator Hammer has real tenure on election legislation — I respect that.",
        "Writing law and administering elections for 75 counties are different jobs.",
        "I'm running to be the Secretary of State who answers your county clerk's phone — not another legislator adding rules.",
        "The question isn't who talked about elections longest — it's who will run the office as service.",
      ),
    ],
    sampleScripts: [
      s(
        "Mental model (not spoken)",
        "30s",
        "Educate on record → county impact → Kelly SOS vision. Do not prosecute motive.",
        "Memorize this before opening.",
      ),
      s(
        "If moderator asks ‘strategy’",
        "45s",
        "Voters deserve a Secretary of State who publishes rules they can read, funds clerk training, and treats integrity and participation as one job — not a culture war. I'll answer your questions directly and cite the acts I've verified.",
        "Calm pace — one breath between sentences.",
      ),
    ],
    zingers: [
      z(
        "The Secretary of State's job is service in all 75 counties — not another round of unfunded mandates from the Capitol.",
        "Closing any segment on qualifications",
        "When you cannot name a specific SOS implementation offer yet",
        "GENERAL_FRAME — no new statistics",
      ),
    ],
    mistakesFirstTimersMake: [
      "Trying to rebut every Hammer sentence instead of answering the moderator",
      "Speaking over the moderator to get the last word",
      "Opening with an attack before stating SOS vision",
      "Using fraud language without claims approval",
    ],
    rehearsalSteps: [
      "Read debate profile markdown sections on Purpose + Educate vs attack",
      "List three moves from executive brief — say aloud",
      "90-second mock: moderator asks qualification — use sample script",
      "Staff debrief: did Kelly educate or attack?",
    ],
    staffRole: "Print three moves card; time answers; stop Kelly if over 60s on 30s questions.",
    relatedLinks: [
      ...DEFAULT_LINKS,
      { href: "/admin/intelligence/kim-hammer/debate-profile", label: "Debate profile (KH-2)" },
    ],
    whyItMatters:
      "Sets your debate goal: educate on record and SOS philosophy, not win a courtroom argument. Against a 25-year politician, voters forgive policy gaps more than they forgive looking rattled or unfair.",
    howToSetUp: "Block 35 minutes: 10 min read this drill-down, 15 min mock with staff as Hammer, 10 min write three moves in Kelly's words.",
    howToUseInDebate: "When you feel adrenaline — glance at three moves mentally; return to direct answer + act anchor + county bridge.",
  }),

  "core-frame": mk("core-frame", 2, "Candidate core frame", {
    estimatedPrepMinutes: 40,
    whatOpponentWillDo: [
      "Paint Kelly as culture-war or anti-integrity",
      "Claim Hammer is the ‘safe’ integrity choice",
      "Use pastoral/community identity indirectly to suggest Kelly is outsider",
    ],
    whatModeratorMayAsk: [
      "In one sentence, why should voters trust you on elections?",
      "Is this race about integrity or access?",
    ],
    setupMoves: [
      "Memorize one-sentence frame: SOS as service — trust, counties, participation+integrity",
      "Practice saying frame after ANY Hammer attack without repeating his words",
    ],
    rebuttalScripts: [
      r(
        "Culture war bait",
        "We need a fighter for election integrity, not experiments.",
        "I agree Arkansas elections must be secure and trusted.",
        "Security without transparent rules and county support is just confusion for voters and clerks.",
        "I'll run the Secretary of State's office so rules are public, training is funded, and participation stays lawful.",
      ),
    ],
    sampleScripts: [
      s(
        "One-sentence frame",
        "15s",
        "Secretary of State is a service job: transparent rules, real support for county election workers, and integrity plus lawful participation together.",
        "Say slower than feels natural.",
      ),
      s(
        "Bridge after any attack",
        "20s",
        "I hear the concern about integrity — here's what I'd do differently as Secretary of State…",
        "Never skip the bridge.",
      ),
    ],
    zingers: [
      z(
        "I won't run the Secretary of State's office as a culture-war platform — I'll run it as a service desk for every county clerk.",
        "When Hammer goes abstract on ‘values’",
        "If you've already used it twice — repetition sounds rehearsed",
      ),
    ],
    mistakesFirstTimersMake: [
      "Defending against labels Hammer never said aloud",
      "Forgetting to end answers on Kelly vision",
      "Motive attacks (fraudster, corrupt) without sources",
    ],
    rehearsalSteps: [
      "Write frame in Kelly's handwriting",
      "10 reps: random Hammer insult → frame + bridge only",
      "Record audio — check for sarcasm (remove it)",
    ],
    relatedLinks: [
      ...DEFAULT_LINKS,
      { href: "/admin/intelligence/kim-hammer/contrast-vs-kelly", label: "Contrast vs Kelly" },
    ],
  }),

  pillars: mk("pillars", 3, "Three core debate pillars", {
    estimatedPrepMinutes: 45,
    whatOpponentWillDo: ["Collapse all issues into ‘integrity’ single pillar", "Ignore county costs", "Skip participation/access except to attack"],
    whatModeratorMayAsk: [
      "Name your top three priorities as Secretary of State",
      "How do integrity and voter access fit together?",
    ],
    setupMoves: [
      "Assign top anchor bill to each pillar (SB250 trust, HB1457 county, SB291 participation)",
      "Practice tagging answers: ‘That's a county-support issue…’",
    ],
    rebuttalScripts: [
      r(
        "Integrity-only framing",
        "Integrity is the only thing that matters in this office.",
        "Integrity is the foundation — I agree.",
        "Integrity also requires rules people can verify and counties that can implement them.",
        "My three priorities are trust you can see, counties you can support, and participation that stays lawful.",
      ),
    ],
    sampleScripts: [
      s("Pillar stack", "60s", "First, trust — publish the rules… Second, counties — training and funding… Third, participation with integrity — lawful access and real enforcement.", "Hold up fingers 1-2-3"),
    ],
    zingers: [
      z("Integrity isn't a slogan — it's a system counties can actually run.", "After Hammer says ‘integrity’ three times", "If you cannot cite a county example next"),
    ],
    mistakesFirstTimersMake: ["Listing ten policies instead of three pillars", "Dropping participation pillar when pressed on fraud"],
    rehearsalSteps: ["Map 3 bills to pillars on whiteboard", "60s pillar answer ×3 with timer"],
    relatedLinks: [{ href: "/admin/intelligence/kim-hammer/debate-prep", label: "Anchor bill playbooks (prep page)" }],
  }),

  "likely-hammer": mk("likely-hammer", 4, "Likely Hammer arguments + evidence anchors", {
    estimatedPrepMinutes: 50,
    whatOpponentWillDo: [
      "Cite Heritage Foundation #1 ranking (paraphrase — verify before Kelly repeats)",
      "List bill numbers rapidly to sound expert",
      "Claim 2025 bills are new direction vs old record",
      "Invoke 2020/post-election security narrative",
    ],
    whatModeratorMayAsk: [
      "Respond to Senator Hammer's point about his election law record",
      "Do you believe Arkansas elections are secure today?",
    ],
    setupMoves: [
      "Pre-listen: match his lane (integrity / experience / petitions) to rehearsed bridge",
      "Do not repeat ranking claims unless claims ledger approves",
    ],
    rebuttalScripts: [
      r(
        "I know elections better than anyone",
        "Nobody knows this issue better than I do.",
        "The Senator has spent years on election legislation — that's real.",
        "The Secretary of State administers what county clerks live every day.",
        "I'm asking voters to choose the candidate who will fund implementation, not just author bills.",
        "Experience writing rules isn't the same as running the office that helps clerks execute them.",
      ),
      r(
        "2025 fresh start",
        "My new bills fix what we learned since 2020.",
        "We all want secure elections after 2020.",
        "In 2021 you also sponsored a six-bill package that changed county duties — verify acts before citing.",
        "Voters deserve continuity honesty: what changed for clerks then and now?",
      ),
    ],
    sampleScripts: [
      s("Secure elections agree-then-contrast", "45s", "Yes — Arkansas elections must be secure. The question is whether the next Secretary of State will publish clear rules and support counties implementing them, or keep adding mandates without a help desk.", "Lead with yes"),
    ],
    zingers: [
      z("You wrote the rules — I'll help counties survive them.", "Only if 2021 package verified", "Sounds glib without act cite", "NEEDS_RESEARCH if acts not verified"),
    ],
    mistakesFirstTimersMake: [
      "Fact-checking him live on stage without prep",
      "Repeating his ranking claim as if true",
      "Getting drawn into 2020 stolen-election framing",
    ],
    rehearsalSteps: [
      "Staff reads each likely argument bullet; Kelly gives 30s bridge",
      "Run argument map lanes in order",
    ],
    relatedLinks: [
      { href: "/admin/intelligence/kim-hammer/debate-prep/argument-map", label: "Argument map drill-down" },
      { href: "/admin/intelligence/debate-command", label: "Cross-exam bank" },
    ],
  }),

  "question-bank": mk("question-bank", 5, "Bill-to-question bank", {
    estimatedPrepMinutes: 55,
    whatOpponentWillDo: ["Hope you dodge bill-specific questions", "Answer your bill points with different bills"],
    whatModeratorMayAsk: hubQuestions(),
    setupMoves: [
      "Pick top 5 hub questions — write 60s answer each with one act number",
      "Practice ‘I don't have that act verified tonight’ line for gaps",
    ],
    rebuttalScripts: [
      r(
        "Dodge accusation",
        "She won't answer the bill.",
        "Here's my direct answer on [bill]…",
        "And here's what it meant for county clerks…",
        "As Secretary of State I would publish guidance so clerks aren't guessing.",
      ),
    ],
    sampleScripts: [
      s("Direct answer template", "60s", "Yes/No or clear position first. Act [number] changed [plain English]. County clerks [impact]. As SOS I would [specific service offer].", "First 10 seconds must answer the question"),
    ],
    zingers: [],
    mistakesFirstTimersMake: ["Starting with biography before answering", "Quoting wrong act number under pressure"],
    rehearsalSteps: ["Top 5 questions aloud ×2", "Flash cards: bill number → 10s county impact"],
    relatedLinks: [{ href: "/admin/intelligence/kim-hammer/bills/SB250", label: "SB250 drill-down" }],
  }),

  "answer-builder": mk("answer-builder", 6, "Answer builder", {
    estimatedPrepMinutes: 60,
    whatOpponentWillDo: ["Force long answers to burn clock", "Ask compound questions"],
    whatModeratorMayAsk: ["Any policy question — structure is your defense"],
    setupMoves: ["Memorize five-step architecture on index card: Direct → Act → Impact → Values → Bridge"],
    rebuttalScripts: [],
    sampleScripts: [
      s("Five-step demo", "60s", "Direct: Yes, clerks need more support. Act: [verified]. Impact: Counties had to… Values: Trust and transparency. Bridge: That's why I'm running SOS as service.", "Underline Direct in your notes"),
      s("30-second cut", "30s", "Direct + Act + Bridge only — drop county detail if light flashes", "Practice when moderator says ‘short’"),
    ],
    zingers: [z("Let me answer your question first.", "When Hammer interrupts", "If moderator already called on you — obey moderator")],
    mistakesFirstTimersMake: [
      "Skipping direct answer to attack opponent",
      "Dropping act anchor when nervous",
      "Rambling past 60s — moderator cuts you, looks weak",
    ],
    rehearsalSteps: [
      "Rewrite 3 rehearsal deck cards using five steps explicitly",
      "Timer drill: 30s strict",
    ],
    relatedLinks: [{ href: "/admin/intelligence", label: "Rehearsal deck on hub" }],
  }),

  rebuttal: mk("rebuttal", 7, "Rebuttal builder", {
    estimatedPrepMinutes: 50,
    whatOpponentWillDo: [
      "Personalize attacks on Kelly readiness",
      "Use confident tone to imply Kelly is lying",
      "Bait emotional response",
    ],
    whatModeratorMayAsk: ["Rebuttal segment — often open ‘respond to…’"],
    setupMoves: [
      "Agree/contrast/bridge written for top 4 lanes",
      "Practice neutral face during Hammer attacks",
    ],
    rebuttalScripts: [
      r(
        "Inexperience",
        "She's never run anything.",
        "I've led [verified bio line if approved] — and I've built this campaign on listening to clerks.",
        "SOS is about administration and service.",
        "I'll publish rules, fund training, and treat election workers as partners.",
      ),
      r(
        "Anti-integrity",
        "She doesn't care about fraud.",
        "I care deeply about real fraud prosecuted with evidence.",
        "I also care that lawful voters aren't blocked by confusion.",
        "Integrity and participation aren't opposites when the Secretary of State does the job right.",
      ),
    ],
    sampleScripts: [
      s("Agree-contrast-bridge", "25s", "I agree with the goal of [X]. Where we differ is [implementation]. As Secretary of State I will [bridge].", "Shorter than you think"),
    ],
    zingers: [z("I won't trade insults — I'll trade solutions for county clerks.", "If Hammer gets personal", "If it sounds dismissive of valid concern")],
    mistakesFirstTimersMake: [
      "Matching anger",
      "Long rebuttal — moderator moves on",
      "New facts not in prep packet",
    ],
    rehearsalSteps: ["Staff plays Hammer harsh; Kelly only agree-contrast-bridge", "Film and review tone"],
    relatedLinks: [{ href: "/admin/intelligence/kim-hammer/debate-prep/argument-map", label: "Argument map" }],
  }),

  drill: mk("drill", 8, "Mock debate drill mode", {
    estimatedPrepMinutes: 70,
    whatOpponentWillDo: ["N/A — this is your practice mode"],
    whatModeratorMayAsk: ["N/A"],
    setupMoves: [
      "Stand while rehearsing — debate is standing",
      "Use phone timer: 30s / 60s / rebuttal 25s",
      "Full run of rehearsal deck before any new reading",
    ],
    rebuttalScripts: [],
    sampleScripts: [
      s("Drill card execution", "per card", "Read prompt → 30s answer → 60s answer → 25s rebuttal hint aloud", "No paragraphs — oral only"),
    ],
    zingers: [],
    mistakesFirstTimersMake: [
      "Only reading packet silently",
      "Practicing seated",
      "Skipping high-risk cards",
    ],
    rehearsalSteps: [
      "Full deck timed run",
      "Second run on HIGH risk only",
      "Third run: worst-case Hammer interruption mid-answer",
    ],
    staffRole: "Staff is Hammer + timer + tone coach. Stop and reset if Kelly rambles.",
    bodyLanguageAndTone: "Feet shoulder-width; don't sway; microphone distance practice if venue allows.",
    relatedLinks: [
      { href: "/admin/intelligence/film-room", label: "Film room (full)" },
      { href: "/admin/intelligence/debate-command", label: "Debate command" },
    ],
  }),

  opening: mk("opening", 9, "Opening statement builder", {
    estimatedPrepMinutes: 45,
    whatOpponentWillDo: ["Listen for attackable lines", "Note if Kelly leads with opponent name"],
    whatModeratorMayAsk: ["Opening statements — often 60–90s"],
    setupMoves: [
      "Write 90s opening — no Hammer name in first 30s",
      "One optional act only if verified",
      "End on SOS service pledge",
    ],
    rebuttalScripts: [],
    sampleScripts: [
      s(
        "Opening draft (customize)",
        "90s",
        "Arkansas deserves a Secretary of State who treats election workers as partners, publishes rules voters can verify, and protects both integrity and lawful participation. I'm Kelly Grappe. I'm running because clerks told me they need a statewide help desk — not another unfunded mandate from Little Rock. I'll answer your questions tonight with honesty — including what still needs verification.",
        "Memorize closing sentence; opening can be note card",
      ),
    ],
    zingers: [
      z("I'm not here to perform outrage — I'm here to earn your trust for the office that runs elections.", "Last 15s of opening", "If already said in stump"),
    ],
    mistakesFirstTimersMake: [
      "Leading with Hammer attack",
      "Ten bill numbers in opening",
      "Speaking too fast — sounds nervous",
    ],
    rehearsalSteps: ["5 aloud reps", "Record video — check fidgeting", "Cut to 75s if moderator confirms shorter"],
    relatedLinks: [{ href: "/admin/intelligence/kim-hammer/debate-prep/opening", label: "Opening — full drill-down" }],
  }),

  closing: mk("closing", 10, "Closing statement builder", {
    estimatedPrepMinutes: 40,
    whatOpponentWillDo: ["Try to rattle you before close with last rebuttal"],
    whatModeratorMayAsk: ["Closing statements"],
    setupMoves: ["Mirror opening pillars; forward-looking; no new attacks"],
    rebuttalScripts: [],
    sampleScripts: [
      s(
        "Closing draft",
        "60–90s",
        "You'll remember three things: trust you can see, counties you can support, and participation protected with real integrity. I'm asking for the job that administers elections — Secretary of State — so Arkansas gets service, not slogans. Thank you.",
        "End looking at camera/moderator, not Hammer",
      ),
    ],
    zingers: [z("Choose the Secretary of State who will answer your clerk's phone — not the one who only adds rules.", "Final line", "If clerks not in audience")],
    mistakesFirstTimersMake: ["Introducing new bills in close", "Ending on attack", "Running over time — cut pledge not attack"],
    rehearsalSteps: [
      "3 reps after mock debate when tired — muscle memory under fatigue",
      "Final 10s: look at moderator, not opponent, on thank you",
    ],
  }),

  risk: mk("risk", 11, "Attack / defense risk meter", {
    estimatedPrepMinutes: 30,
    whatOpponentWillDo: ["Bait fraud/stolen language", "Hope Kelly overclaims statistics"],
    whatModeratorMayAsk: ["Gotcha questions on fraud, 2020, motives"],
    setupMoves: ["Staff reads do-not-say list aloud 30 min before stage", "Kelly carries mental: NEEDS_RESEARCH = omit"],
    rebuttalScripts: [
      r(
        "Fraud bait",
        "Are you saying there's no fraud?",
        "Real fraud should be investigated and prosecuted.",
        "I won't use fraud as a political football without evidence.",
        "I'll publish clear rules so lawful voters aren't caught in confusion.",
      ),
    ],
    sampleScripts: [
      s("Research-question framing", "20s", "That's an important claim — I want verified sources before I state it publicly. Here's what I can say with confidence tonight…", "Use when gap topic hits"),
    ],
    zingers: [],
    mistakesFirstTimersMake: [
      "Improvising statistics",
      "Motive words: corrupt, stolen, rigged",
      "Repeating staff INTERPRETATION as fact",
    ],
    rehearsalSteps: ["Quiz: staff says claim → Kelly says supported or omit"],
    relatedLinks: [{ href: "/admin/intelligence/claims", label: "Claims ledger" }],
    staffRole: "Staff MUST brief red lines; headset if possible for live flags.",
  }),

  reporter: mk("reporter", 12, "Reporter question prep", {
    estimatedPrepMinutes: 35,
    whatOpponentWillDo: ["Spin room compares quotes to fact-checkers"],
    whatModeratorMayAsk: ["N/A — post-debate gaggle"],
    setupMoves: ["Prepare 3 crisp quotes with act anchors — write on card", "Same claims gate as debate"],
    rebuttalScripts: [],
    sampleScripts: [
      s("Quote 1 — service frame", "15s", "I'm running Secretary of State as a service job for all 75 counties.", "Repeatable"),
      s("Quote 2 — contrast", "15s", "Writing election law isn't the same as administering it — verify acts on Arkleg.", "If asked record"),
    ],
    zingers: [],
    mistakesFirstTimersMake: ["Freelancing new claims in spin room", "Long answers — 15s quotes travel"],
    rehearsalSteps: ["Practice 3 quotes after mock debate fatigue"],
    relatedLinks: [{ href: "/admin/intelligence/kim-hammer/debate-prep/media-followup", label: "Media follow-up section" }],
  }),

  county: mk("county", 13, "County clerk / election worker angle", {
    estimatedPrepMinutes: 45,
    whatOpponentWillDo: ["Say ‘I stand with clerks’ without funding detail", "Avoid quorum court dollars"],
    whatModeratorMayAsk: [
      "What will you do for county election officials?",
      "Are unfunded mandates a problem?",
    ],
    setupMoves: [
      "Humanize one election worker story (generic if local not verified)",
      "Memorize county champion trap questions from debate command",
    ],
    rebuttalScripts: [
      r(
        "Stand with clerks",
        "I stand with county clerks 100%.",
        "Clerks deserve more than words.",
        "Show the budget line that funded your last mandate's training.",
        "As SOS I'll publish implementation calendars and a clerk hotline.",
        "Clerks don't need another slogan — they need a Secretary of State who picks up the phone.",
      ),
    ],
    sampleScripts: [
      s("County frame", "60s", "County clerks implement what the Capitol passes. The Secretary of State should be their statewide partner — training, guidance, funding advocacy — not another layer of blame.", "Name ‘clerks’ early"),
    ],
    zingers: [
      z("Election workers aren't props for a press release — they're partners I'll fund and defend.", "County questions", "If specific clerk not verified for endorsement claim"),
    ],
    mistakesFirstTimersMake: ["Attacking clerks' integrity", "Promising dollar amounts not in platform"],
    rehearsalSteps: ["Pair with county-clerk-week day 6 live card", "Rehearse trap question calmly"],
    relatedLinks: [
      { href: "/admin/intelligence/kim-hammer/county-administration-burden", label: "County burden layer" },
      { href: "/admin/intelligence/county-clerk-week", label: "7-day clerk path" },
    ],
  }),

  "direct-democracy": mk("direct-democracy", 14, "Direct democracy angle", {
    estimatedPrepMinutes: 40,
    whatOpponentWillDo: ["Frame petition bills as fraud prevention only", "Ignore signature burden on citizens"],
    whatModeratorMayAsk: [
      "Are ballot initiatives too easy or too hard in Arkansas?",
      "How do you balance access and integrity on petitions?",
    ],
    setupMoves: ["One verified petition bill example ready", "Agree security → contrast process burden"],
    rebuttalScripts: [
      r(
        "Fraud on petitions",
        "We had to stop fraudulent signatures.",
        "I support prosecuting real fraud with evidence.",
        "Tight rules without clear guidance block lawful participation and bury counties in challenges.",
        "SOS should publish signature standards counties can execute.",
      ),
    ],
    sampleScripts: [
      s("Access + integrity", "45s", "Integrity and lawful participation go together. The Secretary of State should make rules readable for signers and manageable for counties — not a guessing game.", "No bill soup"),
    ],
    zingers: [],
    mistakesFirstTimersMake: ["Sounding anti-petition", "Citing unverified fraud cases"],
    rehearsalSteps: ["Link to petition-cluster section 27", "Verify act text for one example"],
    relatedLinks: [{ href: "/admin/intelligence/kim-hammer/themes", label: "Theme matrix" }],
  }),

  "executive-tonight": mk("executive-tonight", 15, "Executive tonight focus", {
    estimatedPrepMinutes: 15,
    whatOpponentWillDo: ["Unknown — compress to three moves"],
    whatModeratorMayAsk: ["Anything — three moves are your panic button"],
    setupMoves: ["Screenshot executive brief; physical index card"],
    rebuttalScripts: [],
    sampleScripts: [s("Three moves aloud", "30s", "Read executive brief three moves verbatim twice before venue", "Last 10 min before stage")],
    zingers: [],
    mistakesFirstTimersMake: ["Cramming new material in last 10 minutes"],
    rehearsalSteps: ["Say three moves with eyes closed"],
    relatedLinks: [{ href: "/admin/intelligence", label: "Hub executive brief" }],
    whenToUse: "Last 10 minutes before walk-on — not during opening prep days earlier.",
  }),

  "argument-map": mk("argument-map", 16, "Structured argument / rebuttal map", {
    estimatedPrepMinutes: 55,
    whatOpponentWillDo: ["Hit multiple lanes in one answer to confuse"],
    whatModeratorMayAsk: ["Respond to prior statement"],
    setupMoves: ["Print argument map; color-code lanes", "Practice lane ID in first 5 words Hammer speaks"],
    rebuttalScripts: [
      r("Lane: experience", "I've done this for decades.", "Real tenure — agree.", "SOS admin vs Senate sponsor.", "Service desk for clerks."),
      r("Lane: integrity ranking", "Arkansas #1.", "We want secure elections.", "Rankings don't pay clerk overtime.", "Implementation plan."),
      r("Lane: petitions", "Stop fraud.", "Prosecute real fraud.", "Process burden.", "Clear SOS rules."),
    ],
    sampleScripts: [],
    zingers: [],
    mistakesFirstTimersMake: ["Wrong lane bridge — sounds non-responsive"],
    rehearsalSteps: ["Staff reads lane label → Kelly gives bridge only"],
    relatedLinks: [{ href: "/admin/intelligence/kim-hammer/debate-prep/argument-map", label: "This section drill-down" }],
  }),

  "strengths-ack": mk("strengths-ack", 17, "Opponent strengths to acknowledge fairly", {
    estimatedPrepMinutes: 25,
    whatOpponentWillDo: ["Expect you to sound bitter — surprise him with fairness"],
    whatModeratorMayAsk: ["What do you respect about your opponent?"],
    setupMoves: ["Pick 2 VERIFIED strengths — one sentence each", "Pivot within 10 seconds"],
    rebuttalScripts: [],
    sampleScripts: [
      s("Fair acknowledgment", "20s", "Senator Hammer has focused on election law for years — I respect that focus. Voters still have to choose who will administer the office for clerks statewide.", "No sarcasm"),
    ],
    zingers: [],
    mistakesFirstTimersMake: ["Backhanded compliments", "Over-praising — sounds like endorsement"],
    rehearsalSteps: ["Practice without smiling mockingly"],
  }),

  vulnerabilities: mk("vulnerabilities", 18, "Debate-safe vulnerability framing", {
    estimatedPrepMinutes: 35,
    whatOpponentWillDo: ["Sensitive to attacks on his record — may overreact if you overreach"],
    whatModeratorMayAsk: ["What's your opponent's weakness?"],
    setupMoves: ["Use saferWording lines ONLY", "One vulnerability per segment max"],
    rebuttalScripts: [],
    sampleScripts: [
      s("Safer wording example", "30s", "The pattern voters should examine is whether each bill came with county implementation funding — that's a fair question for any legislator.", "RESEARCH_QUESTION framing"),
    ],
    zingers: [],
    mistakesFirstTimersMake: ["Fraud accusations", "Personal pastor attacks", "Improvising vulnerability"],
    rehearsalSteps: ["Staff reads label → Kelly reads saferWording verbatim"],
    relatedLinks: [{ href: "/admin/intelligence/kim-hammer/strengths-weaknesses", label: "Strengths / weaknesses matrix" }],
  }),

  "integrity-2021": mk("integrity-2021", 19, "2021 integrity foundation package", {
    estimatedPrepMinutes: 50,
    whatOpponentWillDo: ["Separate 2025 from 2021", "Call 2021 necessary for 2020 security"],
    whatModeratorMayAsk: ["What about the 2021 election law package?"],
    setupMoves: ["Memorize six bill numbers when verified", "One plain-English sentence on cumulative burden"],
    rebuttalScripts: [
      r(
        "2025 is new",
        "2025 bills are a fresh start.",
        "Security after 2020 mattered.",
        "2021 six-bill package changed county duties — pattern not pivot.",
        "Verify acts on Arkleg — I'll wait for your implementation dollar answer.",
      ),
    ],
    sampleScripts: [
      s("2021 pivot", "45s", "In 2021, six major election bills landed in one session. County clerks had to absorb them together. The question for Secretary of State is who helps them implement — not who adds more rules without a help desk.", "Verify bill list before stage"),
    ],
    zingers: [
      z("2025 isn't a reset button for county clerks — 2021 already changed their job.", "When Hammer pivots to 2025 only", "Without verified 2021 list"),
    ],
    mistakesFirstTimersMake: ["Wrong act numbers", "Claiming motives for 2021 package"],
    rehearsalSteps: ["Timeline + 2021 package back-to-back rehearsal"],
    relatedLinks: [{ href: "/admin/intelligence/kim-hammer/integrity-foundation-2021", label: "2021 package module" }],
  }),

  timeline: mk("timeline", 20, "Legislative timeline highlights", {
    estimatedPrepMinutes: 35,
    whatOpponentWillDo: ["Cherry-pick one popular bill", "Ignore cumulative timeline"],
    whatModeratorMayAsk: ["Is this a pattern or one bill?"],
    setupMoves: ["Pick 3 HIGH confidence timeline rows", "Practice ‘pattern not cherry-pick’ line"],
    rebuttalScripts: [],
    sampleScripts: [
      s("Chronology rebuttal", "40s", "One bill is a data point — the timeline shows what counties absorbed over multiple sessions. That's the fair way to judge readiness for Secretary of State.", "Gesture open hand — calm"),
    ],
    zingers: [],
    mistakesFirstTimersMake: ["Reading timeline like a spreadsheet on stage"],
    rehearsalSteps: ["Story arc: 2021 cluster → later bills → clerk impact"],
    relatedLinks: [{ href: "/admin/intelligence/kim-hammer/timeline", label: "Timeline UI" }],
  }),

  "theme-matrix": mk("theme-matrix", 21, "Theme matrix drill-down", {
    estimatedPrepMinutes: 30,
    whatOpponentWillDo: ["Overload with bill count", "Hope you list 29 bills"],
    whatModeratorMayAsk: ["Why so many election bills?"],
    setupMoves: ["Lead theme-first: petition cluster OR county admin", "Max 2 act anchors per answer"],
    rebuttalScripts: [],
    sampleScripts: [
      s("Theme-first", "45s", "You'll see a few themes — site control, county administration, petitions — not random bills. Here's what that meant for Arkansas…", "Theme then bill"),
    ],
    zingers: [],
    mistakesFirstTimersMake: ["Bill soup", "Wrong theme classification"],
    rehearsalSteps: ["Name top theme from hub — cite 2 bills only"],
    relatedLinks: [{ href: "/admin/intelligence/kim-hammer/themes", label: "Themes page" }],
  }),

  "rapid-response": mk("rapid-response", 22, "Rapid response evidence locker", {
    estimatedPrepMinutes: 20,
    whatOpponentWillDo: ["Surprise quote in debate — staff handles locker"],
    whatModeratorMayAsk: ["N/A on stage"],
    setupMoves: ["Kelly knows only READY assets; staff tracks PENDING"],
    rebuttalScripts: [],
    sampleScripts: [],
    zingers: [],
    mistakesFirstTimersMake: ["Kelly citing PENDING assets live"],
    rehearsalSteps: ["Staff drill: surprise quote → Kelly defers to verify"],
    staffRole: "Staff only on stage — Kelly does not read locker live.",
    whenToUse: "Spin room and post-debate — not opening/closing prep.",
  }),

  "retrieval-queue": mk("retrieval-queue", 23, "Staff retrieval queue (do not read aloud)", {
    estimatedPrepMinutes: 10,
    whatOpponentWillDo: ["N/A"],
    whatModeratorMayAsk: ["Topics on OPEN retrieval — Kelly declines to claim"],
    setupMoves: ["Kelly scans titles only — knows what NOT to say"],
    rebuttalScripts: [],
    sampleScripts: [
      s("Decline to claim", "15s", "I won't assert that without verified sources — here's what I can say with confidence…", "Memorize"),
    ],
    zingers: [],
    mistakesFirstTimersMake: ["Reading queue on stage", "Staff leaking OPEN items to Kelly last minute"],
    staffRole: "PRIMARY audience for this section.",
    whenToUse: "Internal — never on stage.",
  }),

  "citation-discipline": mk("citation-discipline", 24, "Evidence citation discipline", {
    estimatedPrepMinutes: 25,
    whatOpponentWillDo: ["Imprecise citations that sound good", "Hope you match inaccurately"],
    whatModeratorMayAsk: ["Specific act numbers"],
    setupMoves: ["Verifier on headset if possible", "Acts not anecdotes"],
    rebuttalScripts: [],
    sampleScripts: [
      s("Citation habit", "varies", "Act [number] on Arkleg changed [X].", "If unsure: ‘verify on Arkleg’"),
    ],
    zingers: [],
    mistakesFirstTimersMake: ["Anecdotes instead of acts", "VERIFIED vs INTERPRETATION confusion"],
    rehearsalSteps: ["Quiz act numbers for top 3 bills"],
    relatedLinks: [{ href: "/admin/intelligence/claims", label: "Claims" }],
  }),

  "media-followup": mk("media-followup", 25, "Post-debate media follow-up", {
    estimatedPrepMinutes: 30,
    whatOpponentWillDo: ["N/A — press follows Kelly clips"],
    whatModeratorMayAsk: ["Press gaggle questions — overlap with section 12"],
    setupMoves: ["Index card 3 quotes", "Seed quotes during debate answers"],
    rebuttalScripts: [],
    sampleScripts: [
      s("Bridge to press", "10s", "What I want reporters to remember tonight is…", "Optional close of debate answer"),
    ],
    zingers: [],
    mistakesFirstTimersMake: ["New policy in gaggle", "Off-record comments"],
    rehearsalSteps: ["Gaggle mock 5 min after timed debate"],
  }),

  "county-deep": mk("county-deep", 26, "County burden deep dive", {
    estimatedPrepMinutes: 45,
    whatOpponentWillDo: ["Minimize county costs", "Shift to statewide rankings"],
    whatModeratorMayAsk: ["Rural county impact", "Clerk staffing"],
    setupMoves: ["Two strongest county narratives from bill cards", "Quorum court funding line"],
    rebuttalScripts: [
      r(
        "Clerks fine",
        "Clerks handled it fine.",
        "Clerks always step up.",
        "Stepping up isn't a budget strategy.",
        "SOS should advocate funding and publish training — that's the job I'll run for.",
      ),
    ],
    sampleScripts: [
      s("Humanize worker", "50s", "Imagine you're the election coordinator in a county with two staff — a new mandate lands without training dollars. The Secretary of State should show up with guidance and funding advocacy — not a press release.", "Empathy — not pity"),
    ],
    zingers: [
      z("Quorum courts fund clerks — the Secretary of State should show up with numbers, not rankings.", "Rural county context", "Without specific budget cite"),
    ],
    mistakesFirstTimersMake: ["Blaming clerks", "Fake county anecdotes"],
    rehearsalSteps: ["Read county-deep paragraphs from packet aloud", "Pair with county section 13"],
    relatedLinks: [{ href: "/admin/intelligence/kim-hammer/county-administration-burden", label: "KH-0B burden" }],
  }),

  "petition-cluster": mk("petition-cluster", 27, "Petition / direct democracy cluster", {
    estimatedPrepMinutes: 40,
    whatOpponentWillDo: ["Cluster all petition bills as fraud fight", "Avoid signature gatherer burden"],
    whatModeratorMayAsk: ["Initiative access vs fraud"],
    setupMoves: ["List bills from theme matrix — verify one", "Link to section 14 frame"],
    rebuttalScripts: [],
    sampleScripts: [
      s("Cluster answer", "50s", "Several bills touch petitions and initiatives. The fair question is whether each change came with clear SOS guidance and county capacity — or just new penalties.", "Theme cluster"),
    ],
    zingers: [],
    mistakesFirstTimersMake: ["Anti-initiative tone", "Unverified fraud stats"],
    rehearsalSteps: ["Theme matrix petition row → one 60s answer"],
    relatedLinks: [{ href: "/admin/intelligence/kim-hammer/debate-prep/direct-democracy", label: "Direct democracy drill-down" }],
  }),

  "closing-checklist": mk("closing-checklist", 28, "Closing checklist (mental print)", {
    estimatedPrepMinutes: 10,
    whatOpponentWillDo: ["Last-second personal attack"],
    whatModeratorMayAsk: ["N/A — mental check"],
    setupMoves: [
      "Verbal checklist with staff 5 min before stage",
      "Do-not-say reviewed",
      "NOT_READY claims named",
      "Three moves recited",
      "Water + bathroom — first-timers forget",
    ],
    rebuttalScripts: [],
    sampleScripts: [],
    zingers: [],
    mistakesFirstTimersMake: [
      "Skipping checklist because ‘ready’",
      "New cramming 2 min before",
      "Forgetting to breathe before mic on",
    ],
    rehearsalSteps: [
      "Staff reads checklist items; Kelly says ‘checked’",
      "Walk to mark on stage if venue walkthrough allowed",
    ],
    bodyLanguageAndTone: "Slow exhale before first word. First sentence under 15 words.",
    whenToUse: "5 minutes before stage — every high-stakes appearance.",
    tiesTogether: "All 27 prior sections converge here.",
  }),
};

function hubQuestions(): string[] {
  return [
    "Where do you stand on Act 350 / paper ballot implementation?",
    "Should Arkansas tighten petition signature rules further?",
    "What is your plan for county election worker training?",
    "How is Secretary of State different from your opponent's Senate record?",
    "What would you do differently in the Secretary of State's office on day one?",
  ];
}

export function getPrepSectionDrillDown(sectionId: string): DebatePrepSectionDrillDown | undefined {
  const row = DEBATE_PREP_SECTION_DRILL_DOWNS[sectionId];
  if (!row) return undefined;
  const encounterDepth = mergeEncounterDepth(row.encounterDepth, getPrepSectionEncounterDepth(sectionId));
  return encounterDepth ? { ...row, encounterDepth } : row;
}

export function getAllPrepSectionDrillDownIds(): string[] {
  return Object.keys(DEBATE_PREP_SECTION_DRILL_DOWNS);
}

/** v3-only section ids in prep packet — route to KH modules instead of 404. */
export const PREP_SECTION_MODULE_FALLBACK_HREF: Record<string, string> = {
  "debate-profile": "/admin/intelligence/kim-hammer/debate-profile",
  "likely-args": "/admin/intelligence/kim-hammer/debate-profile",
  contrast: "/admin/intelligence/kim-hammer/contrast-vs-kelly",
  themes: "/admin/intelligence/kim-hammer/themes",
  gaps: "/admin/intelligence/kim-hammer/intelligence-gaps",
  kh3: "/admin/intelligence/kim-hammer/background-deep",
};

export function resolvePrepSectionHref(sectionId: string): string {
  if (DEBATE_PREP_SECTION_DRILL_DOWNS[sectionId]) {
    return `/admin/intelligence/kim-hammer/debate-prep/${sectionId}`;
  }
  return PREP_SECTION_MODULE_FALLBACK_HREF[sectionId] ?? `/admin/intelligence/kim-hammer/debate-prep`;
}

/** Merge drill-down operator fields back into lightweight guide accessor. */
export function getPrepSectionGuideFromDrillDown(sectionId: string) {
  const d = getPrepSectionDrillDown(sectionId);
  if (!d) return PREP_SECTION_GUIDES[sectionId];
  const {
    sectionId: _id,
    sectionNumber: _n,
    sectionTitle: _t,
    firstTimeDebateNote: _f,
    whatOpponentWillDo: _o,
    whatModeratorMayAsk: _m,
    setupMoves: _s,
    rebuttalScripts: _r,
    sampleScripts: _ss,
    zingers: _z,
    mistakesFirstTimersMake: _mi,
    bodyLanguageAndTone: _b,
    rehearsalSteps: _re,
    staffRole: _st,
    relatedLinks: _rl,
    estimatedPrepMinutes: _em,
    ...guide
  } = d;
  return guide;
}
