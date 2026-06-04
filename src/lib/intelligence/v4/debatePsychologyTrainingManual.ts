/**
 * Debate Philosophy, Psychology, and Atmosphere — Advanced Candidate Preparation Manual.
 * Arkansas SOS three-way context (Kelly · Hammer · Pakko). Citations where research-backed.
 */

export type DebatePsychologyCitation = {
  label: string;
  source: string;
  url?: string;
  note: string;
};

export type DebatePsychologyRehearsalScript = {
  label: string;
  text: string;
  whenToUse: string;
};

export type DebatePsychologyManualSection = {
  sectionId: string;
  partNumber: number;
  title: string;
  eyebrow: string;
  estimatedReadMinutes: number;
  narrativeOverview: string[];
  whyItMattersForKelly: string;
  corePrinciples: string[];
  kellyApplication: string[];
  rehearsalScripts: DebatePsychologyRehearsalScript[];
  commonMistakes: string[];
  opponentNotes: string[];
  arkansasContext: string[];
  citations: DebatePsychologyCitation[];
  relatedSectionIds: string[];
  linkedQuestionIds?: string[];
  linkedBriefingIds?: string[];
  href?: string;
};

export const DEBATE_PSYCHOLOGY_MANUAL_TITLE =
  "Debate Philosophy, Psychology, and Atmosphere — Advanced Candidate Preparation Manual";

export const DEBATE_PSYCHOLOGY_MANUAL_SUMMARY =
  "Most candidates study issues. Good candidates study opponents. Great candidates study audiences. Elite candidates study human psychology. The audience—not the moderator, not the opponent, not the media—is the actual target. Everything else is scenery.";

export const DEBATE_PSYCHOLOGY_MANUAL_SECTIONS: DebatePsychologyManualSection[] = [
  {
    sectionId: "advanced-candidate-manual-intro",
    partNumber: 1,
    title: "The audience is the actual target",
    eyebrow: "Manual introduction",
    estimatedReadMinutes: 6,
    narrativeOverview: [
      "Most candidates prepare for debates by studying issues — election law, business filings, grant funds, ballot access. That work is necessary. It is not sufficient. Issues supply vocabulary; psychology supplies outcomes.",
      "Good candidates prepare by studying opponents — what bills they filed, what clips they repeat, where they overreach. Great candidates prepare by studying audiences — who is in the room, what they fear, what they need to hear to feel safe choosing you.",
      "Elite candidates prepare by studying human psychology — how people decide under uncertainty, how contrast works on a split screen, how warmth and competence combine into trust. In a three-way Arkansas Secretary of State race, that elite layer separates a credible administrator from two experienced men who each bring a default frame (legislator-combatant vs economist-analyst).",
      "The audience is not Twitter, not the press table, not the opponent's base. The audience is the persuadable voter — often 5–15% in a contested primary or general — plus, in clerk-week contexts, the county officials who will repeat your tone in courthouse hallways. Everything else is scenery.",
      "This manual is the training spine for Kelly's debate prep stack: read a section, rehearse the scripts aloud, then open the linked SOS question or opponent dossier and apply the frame. Philosophy before policy detail; atmosphere before argument.",
    ],
    whyItMattersForKelly:
      "Kelly's biography — nonprofit CEO, community listener, mother, executive — is psychologically distinct from Hammer's legislative combat and Pakko's analyst register. This manual turns biography into repeatable stage behavior.",
    corePrinciples: [
      "Study audiences before studying zingers.",
      "Manage atmosphere before managing talking points.",
      "Contrast through calm differentiation, not volume.",
    ],
    kellyApplication: [
      "Open prep week with one psychology section per day before drilling SOS questions.",
      "In ACCA clerk rooms, the 'audience' includes clerks evaluating steadiness — not applause.",
      "On PBS-style stages, the camera magnifies emotional tone; rehearse soft landings.",
    ],
    rehearsalScripts: [
      {
        label: "Internal mantra before walk-on",
        text: "I am not here to win Twitter. I am here to win the person who still has not decided.",
        whenToUse: "30 seconds before stage — staff out of earshot.",
      },
    ],
    commonMistakes: [
      "Treating debate prep as a policy flashcard deck only.",
      "Rehearsing rebuttals without rehearsing facial expression and pace.",
      "Optimizing for partisan applause instead of persuadable silence.",
    ],
    opponentNotes: [
      "Hammer may play to his base's appetite for fight; Pakko may play to credibility of analysis. Kelly should not compete on those terms.",
    ],
    arkansasContext: [
      "2022 Arkansas PBS Secretary of State debate showed voters respond to plain competence on election administration — not maximal ideology.",
      "Three-way geometry (Kelly · Hammer · Pakko) means split-screen contrast every answer; you are always compared, never judged alone.",
    ],
    citations: [
      {
        label: "Elaboration Likelihood Model",
        source: "Petty & Cacioppo (1986) — central vs peripheral routes to persuasion",
        note: "Under time pressure and low issue knowledge, voters use peripheral cues: tone, confidence, likability.",
      },
      {
        label: "Ethos · Pathos · Logos",
        source: "Aristotle, Rhetoric",
        note: "Character and emotion precede detailed logic in live persuasion — especially on television.",
      },
    ],
    relatedSectionIds: ["rule-one-emotional-decisions", "three-audiences-battlefield"],
    linkedBriefingIds: ["presence-without-repetition"],
    href: "/admin/intelligence/debate-briefings/presence-without-repetition",
  },
  {
    sectionId: "rule-one-emotional-decisions",
    partNumber: 2,
    title: "Rule #1: Debates are emotional decisions disguised as rational evaluations",
    eyebrow: "Foundational rule",
    estimatedReadMinutes: 8,
    narrativeOverview: [
      "One of the greatest mistakes inexperienced candidates make is believing debates are won through facts. Facts matter. Facts rarely determine outcomes alone. Humans are emotional creatures who later construct logical explanations for emotional conclusions — a pattern Daniel Kahneman documents as System 1 (fast, intuitive) leading System 2 (slow, analytical) justification.",
      "Most voters decide, in order: Do I trust this person? Does this person understand people like me? Does this person seem competent? Does this person seem stable? Would I want this person handling a crisis? Only after those questions are answered do they evaluate policy specifics.",
      "This means a technically correct answer can lose if it feels cold, evasive, or arrogant. An emotionally resonant answer can win if it feels honest, grounded, and steady — even when policy detail is thinner.",
      "For Secretary of State, the emotional questions are sharper: voters are not choosing a philosopher; they are choosing who will certify elections, support clerks, and keep business services running when something goes wrong. Crisis-competence is emotional before it is statutory.",
      "Kelly should never abandon accuracy — but she should wrap accuracy in reassurance. The voter's subconscious question is not 'Did she cite the right act?' but 'Would I call her first if something broke tomorrow?'",
    ],
    whyItMattersForKelly:
      "Kelly can out-detail Hammer on implementation and out-humanize Pakko on everyday Arkansas life. Emotional resonance plus factual discipline is her win condition — not winning a law-school exam.",
    corePrinciples: [
      "Lead with trust cues; follow with evidence.",
      "Acknowledge concern before citing statute.",
      "Never confuse being right with being persuasive.",
    ],
    kellyApplication: [
      "On election integrity: validate concern → describe clerk partnership → cite verified process — in that order.",
      "On business services: neighbor frame first ('filing a lien shouldn't feel like a maze') before fee schedules.",
      "When corrected by moderator, thank them — warmth beats defensiveness.",
    ],
    rehearsalScripts: [
      {
        label: "Integrity question — emotion before statute",
        text: "I understand why people ask that — elections only work when voters believe the process. Here is what Arkansas clerks actually do, and here is what I would publish as Secretary of State so anyone can verify it.",
        whenToUse: "Any election-security or fraud-adjacent question.",
      },
      {
        label: "When opponent cites a bill number",
        text: "That bill matters — but clerks live with implementation. I have spent months listening to what works in courthouses and what does not.",
        whenToUse: "Hammer leads with legislative authorship.",
      },
    ],
    commonMistakes: [
      "Opening with 'Actually, under Title 7…' before acknowledging the voter's fear.",
      "Over-correcting with sarcasm when opponent misstates a fact.",
      "Listing ten data points when the viewer will remember three.",
    ],
    opponentNotes: [
      "Hammer may use fear and authorship as emotional shortcuts — 'I wrote the integrity law.' Pakko may use analytical density as a competence signal. Kelly's shortcut should be steady stewardship.",
    ],
    arkansasContext: [
      "Post-2020 election anxiety persists in rural and suburban Arkansas — dismissive fact-checking backfires; calm transparency builds.",
      "Clerk audiences punish candidates who treat their workload as abstract — emotional intelligence means naming their pressure.",
    ],
    citations: [
      {
        label: "Thinking, Fast and Slow",
        source: "Daniel Kahneman (2011)",
        note: "System 1 emotional judgment precedes System 2 rationalization — especially under TV time limits.",
      },
      {
        label: "Affective intelligence theory",
        source: "Marcus, Neuman & MacKuen — political decision-making",
        note: "Anxiety and enthusiasm drive candidate evaluation before ideological alignment.",
      },
    ],
    relatedSectionIds: ["competence-test-heuristics", "dad-test-reliable-leader", "trust-equation-warmth-competence"],
    linkedQuestionIds: ["election-integrity-confidence", "three-way-differentiation-opening"],
  },
  {
    sectionId: "three-audiences-battlefield",
    partNumber: 3,
    title: "The three audiences — where the election is actually won",
    eyebrow: "Audience segmentation",
    estimatedReadMinutes: 7,
    narrativeOverview: [
      "Every debate contains three separate audiences, not one. Treating them as a single blob is how candidates waste oxygen.",
      "Audience 1 — Supporters: already with you. Goal: do not lose them. You are reinforcing confidence, not converting. Short declarative lines work; do not over-explain.",
      "Audience 2 — Opponent supporters: mostly unreachable. Do not waste energy arguing with people who will never vote for you. Many candidates spend half a debate performing for an opponent's base — and alienate the middle while doing it.",
      "Audience 3 — Persuadables: the entire battlefield. Usually 5–15% of the electorate. These voters decide Arkansas primaries and tight generals. They are often independents, soft partisans, and clerk-adjacent officials who watch tone as much as policy.",
      "Every answer should pass the filter: 'What would a persuadable voter hear?' Not: 'What would Twitter hear?' Not: 'What would reporters hear?' Not: 'What would activists hear?'",
      "In a three-way SOS stage, persuadables often compare temperament across three candidates in a single split screen — Kelly's calm is a direct product of ignoring Audiences 1 and 2 noise.",
    ],
    whyItMattersForKelly:
      "Kelly's field-tested themes (non-partisan office, transparency, education) land strongest with persuadables — especially independents and Republican-leaning voters tired of division.",
    corePrinciples: [
      "Never debate the opponent's base.",
      "Every 60-second answer needs one line for persuadables.",
      "Supporters want conviction; persuadables want reassurance.",
    ],
    kellyApplication: [
      "When Hammer attacks, respond to the clerk in row four — not to Hammer's Facebook commenters.",
      "When Pakko agrees with you, add a fresh implementer's detail — show persuadables you are not interchangeable.",
      "In ACCA panel, persuadables include clerks who will tell quorum courts who sounded serious.",
    ],
    rehearsalScripts: [
      {
        label: "Persuadable close",
        text: "If you are still deciding, ask yourself who will listen to clerks, publish the rules, and tell you the truth even when it is hard — that is the Secretary of State I will be.",
        whenToUse: "Closing statement or final rebuttal slot.",
      },
    ],
    commonMistakes: [
      "Calling opponent names to fire up supporters — loses persuadables.",
      "Agreeing with everything in a pile-on — sounds like background noise.",
      "Assuming high-information Twitter equals the electorate.",
    ],
    opponentNotes: [
      "Hammer may optimize for Audience 1 (GOP integrity voters). Pakko may optimize for Audience 2's overlap with policy elites. Kelly owns Audience 3 by design.",
    ],
    arkansasContext: [
      "Kelly's tested 'unity across aisle' theme scored strongly in independent and Republican rooms — that is Audience 3 signal.",
      "ACCA audience skews professional clerks — persuadable in the sense of endorsement gravity, not partisan conversion.",
    ],
    citations: [
      {
        label: "Swing voter research",
        source: "ANES · Pew typologies — true independents as small but decisive slice",
        note: "Most 'independents' lean; the pure persuadable pool is narrow — treat every line as precious.",
      },
    ],
    relatedSectionIds: ["contrast-principle-differentiation", "cognitive-load-five-messages"],
    linkedBriefingIds: ["pile-on-survival"],
    href: "/admin/intelligence/kelly-debate-coaching",
  },
  {
    sectionId: "competence-test-heuristics",
    partNumber: 4,
    title: "The competence test — heuristics voters use instead of policy pop quizzes",
    eyebrow: "Psychology · shortcuts",
    estimatedReadMinutes: 7,
    narrativeOverview: [
      "Many voters do not know policy depth on CVSGF grants, UCC fee flows, or VVSG 2.0 certification timelines. They evaluate competence instead. The brain uses shortcuts — heuristics — to answer: Can this person solve problems? Handle pressure? Make decisions? Lead?",
      "This explains a recurring debate pattern: calm beats loud; controlled beats angry; certain beats complicated; simple beats detailed — when detail is not requested.",
      "Competence heuristics are visual and auditory: posture, pace, pause, eye contact, whether you finish a sentence cleanly. A candidate who filibusters sounds less competent than one who gives a tight 45-second answer with one memorable line.",
      "For SOS, competence means operational language: clerks, checklists, published guidance, help desks — not abstract ideology.",
      "Pakko's risk is sounding competent but theoretical. Hammer's risk is sounding experienced but political. Kelly's competence signal is executive delivery of human-scale examples.",
    ],
    whyItMattersForKelly:
      "Kelly has run a large organization and managed crises — that biography must show up as calm structure on stage, not as resume recitation.",
    corePrinciples: [
      "One clear idea per answer.",
      "Pause before answering — reads as thoughtfulness.",
      "Finish on a declarative sentence, not a hedge.",
    ],
    kellyApplication: [
      "Use 'First… Second… Finally…' scaffolding sparingly — max three beats.",
      "Replace jargon with clerk-room nouns: ballots, scanners, training, phone lines.",
      "When asked something you do not know, say what you will verify — competence includes honesty.",
    ],
    rehearsalScripts: [
      {
        label: "Competence under unknown detail",
        text: "I will not guess from this stage. Here is what the law requires, here is what I have verified with clerks, and here is what I would publish within ninety days so every county can plan.",
        whenToUse: "Funding ledger gaps, vendor specifics, or county-by-county data you cannot assert.",
      },
    ],
    commonMistakes: [
      "Showing off with acronyms — CVSGF, VVSG, HAVA in one breath without translation.",
      "Rambling to fill time — reads as panic.",
      "Matching opponent's volume to prove strength.",
    ],
    opponentNotes: [
      "If Pakko goes deep on econometrics, Kelly goes deep on implementation stories — same competence signal, different register.",
      "If Hammer lists bills, Kelly lists outcomes for clerks — contrast without insult.",
    ],
    arkansasContext: [
      "Quorum courts and clerks evaluate 'can she run the office' — not 'can she debate econometrics.'",
    ],
    citations: [
      {
        label: "Heuristics and biases",
        source: "Tversky & Kahneman — availability, representativeness",
        note: "Voters infer global competence from salient moments — one flustered answer sticks.",
      },
      {
        label: "Leadership trait ratings",
        source: "Political psychology literature on trait voting",
        note: "Competence and integrity rank among strongest candidate traits in down-ballot races.",
      },
    ],
    relatedSectionIds: ["dad-test-reliable-leader", "cognitive-load-five-messages"],
    linkedQuestionIds: ["cvsgf-county-funding-ledger", "vvsg-modernization-timeline"],
  },
  {
    sectionId: "dad-test-reliable-leader",
    partNumber: 5,
    title: "The Dad Test — who would you call first if something broke?",
    eyebrow: "Trust heuristic",
    estimatedReadMinutes: 6,
    narrativeOverview: [
      "One of the most powerful subconscious filters in American politics is reliability under stress — often summarized as the 'Dad Test' (gender-neutral in application): If something bad happened tomorrow, who would I call first?",
      "That person wins debates — not the smartest, not the most ideological, not the most detailed. The person who feels like they will pick up the phone, tell the truth, and fix what they can fix.",
      "For Kelly, the ideal frame is: experienced, steady, practical, trustworthy, competent — not partisan warrior, not distant expert, not performative outrage.",
      "Secretary of State crises are mundane until they are not: election night reporting glitches, misinformation spikes, business filing system outages, storm-day polling place changes. Voters imagine those scenarios when they watch you breathe on stage.",
      "The Dad Test is why acknowledging uncertainty correctly — 'here is what I know, here is what I will verify' — can increase trust, while bluffing destroys it.",
    ],
    whyItMattersForKelly:
      "Kelly's archetype — competent Arkansas mom who has run large organizations — maps directly onto the Dad Test if she stays warm and declarative under fire.",
    corePrinciples: [
      "Sound like the adult in the room.",
      "Prefer 'I will' over 'they should.'",
      "Never mock a voter's fear.",
    ],
    kellyApplication: [
      "When Hammer implies Kelly is weak on integrity, do not get louder — get steadier.",
      "Use mother/neighbor atmosphere (see atmosphere sections) without sounding soft on security.",
      "Close debates with stewardship language, not victory language.",
    ],
    rehearsalScripts: [
      {
        label: "Reliability reframe after attack",
        text: "You deserve a Secretary of State who tells you the truth on a bad day — not just on a campaign day. I have managed organizations through hard weeks; this office needs that same steadiness.",
        whenToUse: "Personal or competence attack from Hammer.",
      },
    ],
    commonMistakes: [
      "Trying to prove IQ instead of reliability.",
      "Sarcastic clapbacks that play on Twitter but not in living rooms.",
      "Over-promising instant fixes to complex clerk problems.",
    ],
    opponentNotes: [
      "Hammer may project fighter energy — reliable to some, exhausting to persuadables. Pakko may project analyst energy — reliable on spreadsheets, less so on emotional crisis.",
    ],
    arkansasContext: [
      "Rural Arkansas voters especially reward 'steady hand' framing — disaster and storm imagery is culturally salient.",
    ],
    citations: [
      {
        label: "Warmth vs competence tradeoff",
        source: "Social psychology — stereotype content model (Fiske et al.)",
        note: "Leaders judged on warmth and competence dimensions; ideal is high on both.",
      },
    ],
    relatedSectionIds: ["trust-equation-warmth-competence", "kelly-archetype-competent-mom-executive"],
    linkedBriefingIds: ["author-vs-administrator"],
  },
  {
    sectionId: "atmosphere-management-overview",
    partNumber: 6,
    title: "Emotional atmosphere management — you are conducting the room",
    eyebrow: "Atmosphere",
    estimatedReadMinutes: 7,
    narrativeOverview: [
      "Most candidates think they answer questions. Elite candidates manage atmosphere. Atmosphere determines interpretation — the same sentence can sound compassionate, defensive, arrogant, aggressive, or weak depending on pace, pitch, facial expression, and what happened in the thirty seconds before you spoke.",
      "Debate coaching often over-indexes on words and under-indexes on music. Staff should rehearse with video: mute the audio and ask whether Kelly looks like the safest pair of hands.",
      "Atmosphere is especially decisive in three-way formats where the cutaway camera captures reactions while opponents speak. Kelly's neutral listening face is a weapon — not boredom, not smirking, not eye-rolling.",
      "Moderators set tempo; you set temperature. When the room is hot (integrity attacks, culture-war bait), Kelly should lower temperature. When the room is anxious (funding gaps, clerk burnout), Kelly should be mother/neighbor reassuring.",
      "Atmosphere management is not inauthenticity — it is choosing which authentic facet of Kelly to show: executive, teacher, neighbor, mother, reformer.",
    ],
    whyItMattersForKelly:
      "Kelly has broader atmospheric range than opponents — mother + executive is rare in Arkansas politics and hard to fake.",
    corePrinciples: [
      "Lower temperature when opponents heat the room.",
      "Match atmosphere to question type, not personal mood.",
      "Never let an opponent choose your facial expression.",
    ],
    kellyApplication: [
      "Pre-assign atmosphere tags to top ten SOS questions in rehearsal.",
      "Practice transition lines between atmospheres ('Let me explain how this works…' = teacher).",
      "In spin room, repeat the calm atmosphere — reporters amplify heat.",
    ],
    rehearsalScripts: [
      {
        label: "Temperature drop after hot exchange",
        text: "Let me slow down for a second — this matters too much to shout about.",
        whenToUse: "After Hammer escalation or audience tension.",
      },
    ],
    commonMistakes: [
      "Single-register delivery all night — monotone competence without warmth.",
      "Laughing at opponent mistakes — reads as cruel to persuadables.",
      "Over-smiling during integrity questions — reads as dismissive.",
    ],
    opponentNotes: [
      "If Hammer raises temperature, Kelly's calm is contrast. If Pakko stays cool but dry, Kelly adds warmth without losing structure.",
    ],
    arkansasContext: [
      "Arkansas PBS and ACCA formats reward conversational temperature — not cable-news shouting.",
    ],
    citations: [
      {
        label: "Emotional contagion",
        source: "Hatfield, Cacioppo & Rapson",
        note: "Audiences mirror leader affect — calm is literally contagious on stage.",
      },
    ],
    relatedSectionIds: ["atmosphere-types-five-frames", "atmosphere-ladder-transitions"],
    linkedBriefingIds: ["presence-without-repetition"],
  },
  {
    sectionId: "atmosphere-types-five-frames",
    partNumber: 7,
    title: "Five atmosphere types — Teacher, Neighbor, Mother, Executive, Reformer",
    eyebrow: "Presence frames",
    estimatedReadMinutes: 10,
    narrativeOverview: [
      "Teacher — explains patiently, educational tone. Best for: election administration process, business services workflows, how grants move through statute to county treasuries. Signals: competence without arrogance.",
      "Neighbor — relatable, friendly, local. Best for: community impact, rural access, 'people like us' moments. Signals: authenticity and Arkansas grounding.",
      "Mother — protective, caring, reassuring. Exceptionally powerful for Kelly when discussing voter confusion, clerk stress, or public fear. Many candidates cannot access this frame without sounding performative; Kelly can if she avoids condescension.",
      "Executive — decisive, professional, structured. Best for: budgets, management, timelines, 'first ninety days' plans, ACCA partnership pledges. Signals: SOS as COO, not commentator.",
      "Reformer — energetic, optimistic, future-focused. Best for: modernization, VVSG upgrades, digital services, transparency portals. Signals: hope with a plan — not naive tech bro talk.",
      "Candidates often camp in one atmosphere. Kelly should rotate intentionally. Hammer defaults legislator/combatant; Pakko defaults professor/analyst. Kelly's multi-frame range is strategic advantage.",
    ],
    whyItMattersForKelly:
      "Mother + Executive combination is the brand differentiator — strong and kind, capable and approachable.",
    corePrinciples: [
      "Pick atmosphere before words.",
      "Mother frame requires respect — never pity.",
      "Executive frame requires specifics — never vague 'efficiency.'",
    ],
    kellyApplication: [
      "Election security: Executive open → Teacher middle → Neighbor close.",
      "Clerk burnout: Mother open → Executive plan → Neighbor thank-you.",
      "Business filings: Teacher throughout with Executive close on timelines.",
    ],
    rehearsalScripts: [
      {
        label: "Teacher — CVSGF explanation",
        text: "Here is how the grant fund actually works: business filing fees flow to a dedicated pool, the legislature appropriates, then counties apply. Voters deserve a published ledger at each step.",
        whenToUse: "Funding or UCC questions.",
      },
      {
        label: "Mother — voter fear",
        text: "If you are worried your ballot will not count, you deserve a straight answer and a human being who will help you — not a lecture.",
        whenToUse: "Integrity anxiety spikes.",
      },
      {
        label: "Executive — ninety-day plan",
        text: "Day one: clerk listening tour. Day thirty: published checklist. Day ninety: public dashboard on grants and equipment — measurable, not promised forever.",
        whenToUse: "ACCA panel or 'what will you do' questions.",
      },
    ],
    commonMistakes: [
      "Mother frame without policy backbone — sounds soft.",
      "Executive frame without empathy — sounds corporate.",
      "Reformer frame without funding honesty — sounds like a vendor pitch.",
    ],
    opponentNotes: [
      "Do not mock Pakko's professor tone — borrow respect, then pivot to people.",
      "Do not mimic Hammer's combat — stay in mother/executive band.",
    ],
    arkansasContext: [
      "Clerks respond to Executive + Neighbor; voters respond to Mother + Teacher on integrity.",
    ],
    citations: [
      {
        label: "Framing theory",
        source: "George Lakoff — don't think of an elephant",
        note: "Moral frames (protection, responsibility) activate before policy details.",
      },
    ],
    relatedSectionIds: ["atmosphere-ladder-transitions", "when-audience-anxious"],
    linkedQuestionIds: ["acca-clerk-panel-partnership", "business-services-access"],
  },
  {
    sectionId: "atmosphere-ladder-transitions",
    partNumber: 8,
    title: "The atmosphere ladder — move between frames in one answer",
    eyebrow: "Advanced presence",
    estimatedReadMinutes: 6,
    narrativeOverview: [
      "The best candidates move between atmospheres within a single answer — creating layered impression: competent, knowledgeable, relatable — simultaneously.",
      "Example — election security question: Start Executive ('As Secretary of State, my job is verifiable process'). Move Teacher ('Here is what happens when a ballot is cast…'). Finish Neighbor ('Your county clerk is your neighbor — I will have their back publicly').",
      "Transitions should be audible but subtle: 'Let me explain…' (teacher), 'Here is what I hear in courthouses…' (neighbor), 'Here is what I will do…' (executive).",
      "In three-way debates, ladder movement keeps persuadables engaged while opponents stay in one register. The contrast is subconscious but powerful on replay clips.",
      "Rehearse ladders on the five Kelly message pillars (see cognitive load section) — each pillar should have an executive version and a neighbor version.",
    ],
    whyItMattersForKelly:
      "Ladder skill prevents sounding like a single talking-point robot across ninety minutes.",
    corePrinciples: [
      "Three beats maximum per answer.",
      "Same truth, different atmosphere — not different facts.",
      "Land the close in the atmosphere that matches the question's emotion.",
    ],
    kellyApplication: [
      "Map ladders for Q1 opening, Q integrity cluster, Q funding cluster, Q business services, Q closing.",
      "In speak-third position, ladder ends with fresh implementer detail (see SOS comprehensive scripts).",
    ],
    rehearsalScripts: [
      {
        label: "Full ladder — integrity",
        text: "Executive: I will certify processes, not personalities. Teacher: Arkansas uses paper ballots, audits, and local clerks you can talk to. Neighbor: When you vote, you should feel the system works for you — that is the standard I will hold.",
        whenToUse: "Moderator integrity opener.",
      },
    ],
    commonMistakes: [
      "Jumping atmospheres without transition words — feels chaotic.",
      "Ending in teacher mode on emotional questions — feels cold.",
      "Starting in neighbor mode on funding questions — feels evasive.",
    ],
    opponentNotes: [],
    arkansasContext: [],
    citations: [],
    relatedSectionIds: ["atmosphere-types-five-frames", "cognitive-load-five-messages"],
  },
  {
    sectionId: "when-opponent-attacks-reframe",
    partNumber: 9,
    title: "When the opponent attacks — fight, redirect, or reframe",
    eyebrow: "Behavioral playbook",
    estimatedReadMinutes: 8,
    narrativeOverview: [
      "Situation: opponent attacks. Wrong response: fight fire with fire. Better: redirect to voters' stake. Elite: reframe so you appear calm and opponent appears combative.",
      "Reframing does not mean avoiding the attack — it means answering the emotional subtext ('can I trust you?') before the factual bait ('did you support X?').",
      "Example attack: 'Kelly doesn't understand election integrity.' Reframe: 'I understand why people have concerns. I've spent months talking with Arkansans about those concerns. When people ask questions about elections, they deserve answers — not dismissal.'",
      "Outcome: you appear calm; opponent appears combative; persuadables hear stewardship.",
      "Hammer's authorship traps ('I wrote the bill') should be reframed to implementation ('Clerks live with the bill after it passes'). Pakko's credential traps should be reframed to listening ('Expertise matters — so does who picks up the phone in a county office').",
    ],
    whyItMattersForKelly:
      "Kelly's public record is cleaner than attack surfaces suggest — reframe to forward-looking plans instead of litigating motives.",
    corePrinciples: [
      "Never absorb opponent's frame name ('radical,' 'RINO,' 'establishment').",
      "Validate concern → pivot to job description.",
      "Use opponent's first name sparingly — avoid personal feud energy.",
    ],
    kellyApplication: [
      "Pair with trap lane prep — reframe scripts already drafted for CVSGF and county champion lanes.",
      "If attack is false, correct once cleanly — then reframe; do not spiral.",
    ],
    rehearsalScripts: [
      {
        label: "Integrity attack reframe",
        text: "I understand why people have concerns. I've spent months talking with Arkansans about those concerns. When people ask questions about elections, they deserve answers — not dismissal.",
        whenToUse: "Hammer integrity/authorship attack.",
      },
      {
        label: "Experience attack reframe",
        text: "Dr. Pakko has spent years studying systems. I've spent years working with people who implement them — both matter, but this job is implementation first.",
        whenToUse: "Pakko cites credentials vs Kelly biography.",
      },
    ],
    commonMistakes: [
      "Saying 'That's a lie' without proof — risky on air.",
      "Long defensive biography — sounds guilty.",
      "Attacking Hammer's legislative record without sourced claims gate clearance.",
    ],
    opponentNotes: [
      "Hammer may bait Kelly into culture-war terrain — reframe back to clerk service desk.",
    ],
    arkansasContext: [
      "2022 SOS debate clips show voters reward calm responses to hot-button pivots.",
    ],
    citations: [
      {
        label: "Influence — reciprocity and contrast",
        source: "Robert Cialdini",
        note: "Contrast principle makes calm look calmer when opponent is hot.",
      },
    ],
    relatedSectionIds: ["contrast-principle-differentiation", "hammer-psychological-profile"],
    linkedBriefingIds: ["rebuttal-architecture", "author-vs-administrator"],
    href: "/admin/intelligence/trap-lanes",
  },
  {
    sectionId: "when-audience-anxious",
    partNumber: 10,
    title: "When audience anxiety rises — slow down and reassure",
    eyebrow: "Behavioral playbook",
    estimatedReadMinutes: 6,
    narrativeOverview: [
      "Watch for rising anxiety: economic uncertainty, government distrust, election concerns, community decline narratives. Anxiety changes what audiences hear — they seek safety signals, not policy density.",
      "When anxiety rises: slow down, speak softer, become reassuring. Humans follow emotional leaders during uncertainty — not the loudest voice.",
      "Mother atmosphere dominates here. Executive specifics should follow reassurance, not precede it.",
      "Kelly should name the feeling without exploiting it: 'A lot of people are worried about…' is stronger than 'People should not worry.'",
      "Clerk audiences carry chronic anxiety — unfunded mandates, staff shortages, equipment aging. Naming clerk pressure builds alliance without partisan heat.",
    ],
    whyItMattersForKelly:
      "Anxiety moments are where Kelly wins independents — if she does not accidentally sound dismissive.",
    corePrinciples: [
      "Validate before explaining.",
      "Shorter sentences when room is tense.",
      "Offer a visible next step — 'publish,' 'listen,' 'partner.'",
    ],
    kellyApplication: [
      "Link to election funding module — anxiety about money needs executive plan + neighbor empathy.",
      "Avoid joking when moderator tone is serious.",
    ],
    rehearsalScripts: [
      {
        label: "Anxiety acknowledgment",
        text: "I hear that worry in every county I visit. Here is what I can tell you today — and here is what I will make visible so you are not guessing.",
        whenToUse: "Funding gaps, integrity fear, business filing confusion.",
      },
    ],
    commonMistakes: [
      "Fact-dumping to 'destroy' fear — feels cold.",
      "Blaming voters for misinformation.",
      "Promising miracles.",
    ],
    opponentNotes: [
      "Hammer may amplify anxiety for political gain — Kelly should not deny reality, should offer steadiness.",
    ],
    arkansasContext: [
      "Post-pandemic clerk burnout and equipment costs are live ACCA anxieties — see ACCA prep module.",
    ],
    citations: [
      {
        label: "Affective intelligence",
        source: "Marcus & MacKuen",
        note: "Anxiety increases reliance on leadership cues over ideology.",
      },
    ],
    relatedSectionIds: ["atmosphere-types-five-frames", "arkansas-three-way-acca-context"],
    linkedQuestionIds: ["county-clerks-unfunded-mandates"],
    href: "/admin/intelligence/county-clerk-week/acca-summer-conference",
  },
  {
    sectionId: "when-opponent-angry-or-dominating",
    partNumber: 11,
    title: "When the opponent is angry or dominating — never mirror instability",
    eyebrow: "Behavioral playbook",
    estimatedReadMinutes: 7,
    narrativeOverview: [
      "Situation: opponent anger. Common mistake: matching anger. Never mirror emotional instability — lower intensity instead. The contrast becomes visible; audiences instinctively notice.",
      "Situation: opponent dominating airtime or interrupting. Many candidates panic. Wrong. Dominating often creates negative impressions — people dislike bullies. Allow opponent enough rope, then respond calmly in your allotted time.",
      "Moderators in Arkansas formats usually enforce time — Kelly should not wrestle the mic. Instead: 'I will use my time to answer the voter's question' — executive tone.",
      "Split-screen reaction shots reward Kelly for stillness while Hammer escalates — do not celebrate visibly, do not look bored; look respectful and ready.",
      "If Pakko tries to dominate with long analytical answers, Kelly's brevity reads as confidence — not weakness — when she lands one human sentence Pakko missed.",
    ],
    whyItMattersForKelly:
      "Kelly's gendered double-bind (must be strong but not 'shrill') is navigated by calm volume, not by out-shouting a male opponent.",
    corePrinciples: [
      "Lower volume when opponent raises volume.",
      "Do not interrupt — contrast with discipline.",
      "Use humor rarely and never at clerk expense.",
    ],
    kellyApplication: [
      "Rehearse neutral listening face with staff filming.",
      "Prepare one calm sentence to deploy after Hammer filibuster.",
    ],
    rehearsalScripts: [
      {
        label: "After opponent domination",
        text: "The question was about voters, not about us. Here is my answer in the time we have.",
        whenToUse: "Hammer consumes time or interrupts.",
      },
      {
        label: "After opponent anger",
        text: "I am not going to shout at you — you deserve better from this office.",
        whenToUse: "Direct angry attack — use sparingly, high impact.",
      },
    ],
    commonMistakes: [
      "Eye-roll or smirk — instant clip against you.",
      "Asking moderator to 'make him stop' — sounds weak unless done once, calmly.",
      "Over-talking in rebuttal — burns persuadables.",
    ],
    opponentNotes: [
      "Hammer's confidence can read as domination — Kelly's stillness flips it.",
    ],
    arkansasContext: [],
    citations: [
      {
        label: "Contrast principle",
        source: "Cialdini — Influence",
        note: "Perceptual contrast amplifies differences in demeanor.",
      },
    ],
    relatedSectionIds: ["when-opponent-attacks-reframe", "contrast-principle-differentiation"],
    linkedBriefingIds: ["pile-on-survival"],
  },
  {
    sectionId: "contrast-principle-differentiation",
    partNumber: 12,
    title: "The contrast principle — you are always compared, never judged alone",
    eyebrow: "Three-way strategy",
    estimatedReadMinutes: 8,
    narrativeOverview: [
      "Audiences rarely evaluate candidates independently. They compare. Every debate is Candidate A versus Candidate B versus Candidate C — not Candidate A versus perfection.",
      "Therefore: if Hammer is aggressive, Kelly becomes calm. If Pakko is academic, Kelly becomes practical. If Hammer is partisan, Kelly becomes independent steward. If Pakko is theoretical, Kelly becomes grounded in clerk stories.",
      "The goal is differentiation, not destruction. Respectful contrast lands with persuadables; personal destruction does not.",
      "Three-way geometry adds a second contrast axis: Kelly must differentiate from both opponents simultaneously without sounding chaotic. Rule: one contrast per answer — pick Hammer or Pakko, not both.",
      "Kelly's field-tested non-partisan and unity themes are contrast weapons against Hammer without naming him — 'this office should not be a campaign headquarters.'",
    ],
    whyItMattersForKelly:
      "Contrast is how Kelly wins without out-legislating Hammer or out-economisting Pakko.",
    corePrinciples: [
      "One opponent contrast per answer.",
      "Respect expertise, pivot to implementation.",
      "Never say 'unlike my opponents' — show, don't tell.",
    ],
    kellyApplication: [
      "Speak-second: agree + fresh add that contrasts.",
      "Speak-third: summarize both opponents' gaps in one neighbor sentence.",
    ],
    rehearsalScripts: [
      {
        label: "Respectful Pakko contrast",
        text: "Dr. Pakko has spent years studying systems. I've spent years working with people.",
        whenToUse: "Pakko leads with analysis.",
      },
      {
        label: "Hammer contrast without name",
        text: "The Secretary of State should be a service desk for all seventy-five counties — not another partisan pulpit.",
        whenToUse: "Legislative combat tone from Hammer.",
      },
    ],
    commonMistakes: [
      "Contrasting both opponents in one breath — muddy.",
      "Insulting intelligence — loses teacher atmosphere.",
      "Agreeing with Hammer on culture-war framing — collapses differentiation.",
    ],
    opponentNotes: [],
    arkansasContext: [
      "ACCA panel three-way seating — physical contrast on stage matters; sit composed, don't fidget.",
    ],
    citations: [
      {
        label: "Contrast effect",
        source: "Psychophysics · political communication research",
        note: "Judgments are relative; manage the reference point.",
      },
    ],
    relatedSectionIds: ["hammer-psychological-profile", "pakko-psychological-profile", "three-audiences-battlefield"],
    href: "/admin/intelligence/debate-depth/three-way",
  },
  {
    sectionId: "hammer-psychological-profile",
    partNumber: 13,
    title: "Kim Hammer — legislator, combatant, insider",
    eyebrow: "Opponent psychology",
    estimatedReadMinutes: 9,
    narrativeOverview: [
      "Potential atmosphere: legislator, partisan combatant, experienced insider. Strengths: institutional knowledge, confidence, political experience, authorship claims on integrity legislation. Weaknesses: can appear political, establishment, partisan — especially to persuadables tired of division.",
      "Hammer's psychological goal is often Audience 1 activation — prove he is the true integrity champion. Kelly should not contest that frame on his terms. She contests on implementation, transparency, and clerk partnership.",
      "Kelly's contrast: problem solver, citizen advocate, community listener — not partisan warrior. Use Hammer's bills as objects of implementation analysis, not moral verdicts on his soul.",
      "Expected Hammer moves: CVSGF trap ('where is the money'), authorship boasts, culture-war pivots, Kelly inexperience bait. Psychological counter: executive calm + teacher clarity + dossier-sourced facts through claims gate.",
      "See opponent dossier for claims ledger — psychology section is about presence, dossier is about evidence.",
    ],
    whyItMattersForKelly:
      "Hammer is the primary emotional threat — Pakko is the primary credibility comparison. Kelly must win contrast on both axes without mixing them.",
    corePrinciples: [
      "Do not become Hammer-lite.",
      "Never say 'I voted like you' unless true and sourced.",
      "Pivot authorship to clerk outcomes.",
    ],
    kellyApplication: [
      "Pre-load trap lane scripts — psychological reframe + factual backup.",
      "When Hammer name-drops bills, Kelly name-drops clerks.",
    ],
    rehearsalScripts: [
      {
        label: "Authorship pivot",
        text: "Passing a bill is step one. Supporting clerks who implement it for years — that is the Secretary of State's job.",
        whenToUse: "Hammer 'I wrote…' lines.",
      },
    ],
    commonMistakes: [
      "Calling Hammer a liar without claims clearance.",
      "Getting drawn into GOP primary ideological tests.",
    ],
    opponentNotes: [
      "Hammer strengths are real — dismissiveness backfires with his base and makes Kelly look arrogant to persuadables.",
    ],
    arkansasContext: [
      "Hammer's Senate record is known to Republican primary voters — Kelly targets general-election and independent persuadables, not converting hard Hammer base.",
    ],
    citations: [],
    relatedSectionIds: ["when-opponent-attacks-reframe", "pakko-psychological-profile"],
    href: "/admin/intelligence/opponents/dossiers/kim-hammer",
    linkedQuestionIds: ["act-350-election-integrity", "hammer-legislative-record-contrast"],
  },
  {
    sectionId: "pakko-psychological-profile",
    partNumber: 14,
    title: "Michael Pakko — professor, analyst, system thinker",
    eyebrow: "Opponent psychology",
    estimatedReadMinutes: 8,
    narrativeOverview: [
      "Potential atmosphere: professor, analyst, economist, system thinker. Strengths: credibility, intelligence, structured argument. Weaknesses: may appear detached, theoretical, less connected to everyday Arkansas experiences and clerk operational stress.",
      "Kelly should not attack expertise — respect expertise, then pivot to people and implementation. 'Dr. Pakko has spent years studying systems. I've spent years working with people.' That contrast is devastating because it feels respectful.",
      "Pakko may agree with Kelly on transparency themes — Kelly must add fresh implementer details when second or third to avoid blur. See pile-on briefing.",
      "Pakko's audience is often policy-literate persuadables and media — he wins paragraphs; Kelly wins trust.",
      "Three-way risk: Hammer attacks Pakko or Kelly; Kelly stays above feud — contrast both by steadiness.",
    ],
    whyItMattersForKelly:
      "Pakko is not a foil to ignore — he splits anti-Hammer vote and credibility-minded independents. Kelly must be the warm executive, not the third analyst.",
    corePrinciples: [
      "Never mock credentials.",
      "Add stories, not spreadsheets.",
      "When agreeing, add one unrepeated fact or pledge.",
    ],
    kellyApplication: [
      "Prepare 'respect + pivot' lines for economic or data questions.",
      "If Pakko cites UA credentials, Kelly cites nonprofit scale and clerk miles driven.",
    ],
    rehearsalScripts: [
      {
        label: "Respect + pivot",
        text: "Dr. Pakko is right that data matters. Clerks will tell you data only helps when someone answers the phone on a Friday afternoon.",
        whenToUse: "Pakko leads with analysis or AR data.",
      },
    ],
    commonMistakes: [
      "Trying to out-stat Pakko — wrong fight.",
      "Ignoring Pakko — three-way answers must acknowledge geometry.",
    ],
    opponentNotes: [],
    arkansasContext: [
      "Pakko's economist identity plays well in Little Rock media — Kelly needs Northwest and Delta neighbor stories ready.",
    ],
    citations: [],
    relatedSectionIds: ["contrast-principle-differentiation", "hammer-psychological-profile"],
    href: "/admin/intelligence/opponents/dossiers/michael-packo",
    linkedQuestionIds: ["three-way-differentiation-opening"],
  },
  {
    sectionId: "trust-equation-warmth-competence",
    partNumber: 15,
    title: "The trust equation — competence + authenticity + warmth",
    eyebrow: "Likability science",
    estimatedReadMinutes: 7,
    narrativeOverview: [
      "Trust is not one variable. Voters combine competence (can you do the job?), authenticity (are you real?), and warmth (do you care about people like me?). Most politicians focus only on competence — insufficient.",
      "High competence without warmth feels cold — the technician problem Pakko risks. High warmth without competence feels weak — the neighbor with no plan problem. The winning combination: strong and kind, capable and approachable, professional and human.",
      "Authenticity beats perfection. Perfection creates distance. Humans trust leaders who acknowledge reality — 'I understand that concern,' 'I've heard that all over Arkansas,' 'That's a fair question' lower resistance without conceding policy.",
      "Edelman Trust Barometer themes repeat: transparency, competence, and empathy drive institutional trust. SOS is an institution voters distrust when it feels partisan or opaque.",
      "Kelly's trust equation should be visible in body language: open palms, nod on voter concerns, no crossed arms during attacks.",
    ],
    whyItMattersForKelly:
      "Kelly's brand is literally warmth + executive competence — the trust equation is her home turf if she executes.",
    corePrinciples: [
      "Acknowledge before asserting.",
      "Show plan after empathy.",
      "Never fake folksiness — neighbor frame must use real Arkansas places and roles.",
    ],
    kellyApplication: [
      "Rotate acknowledgment phrases — do not repeat 'I understand' six times.",
      "Pair every attack response with one warmth signal and one competence signal.",
    ],
    rehearsalScripts: [
      {
        label: "Trust trifecta",
        text: "That's a fair question — I have heard it in Boone County and in Jefferson County. Here is what I will do as Secretary of State: publish the checklist, fund the clerks transparently, and answer the phone.",
        whenToUse: "Complex policy + emotional subtext.",
      },
    ],
    commonMistakes: [
      "Robotic repetition of same opener — breaks authenticity.",
      "Over-rehearsed gestures — reads as fake.",
    ],
    opponentNotes: [],
    arkansasContext: [],
    citations: [
      {
        label: "Edelman Trust Barometer",
        source: "Edelman (annual global trust study)",
        url: "https://www.edelman.com/trust",
        note: "Competence and ethics drive trust in government institutions.",
      },
      {
        label: "Stereotype content model",
        source: "Fiske, Cuddy & Glick",
        note: "Warmth and competence are universal social judgment dimensions.",
      },
    ],
    relatedSectionIds: ["likability-acknowledgment-phrases", "dad-test-reliable-leader"],
  },
  {
    sectionId: "cognitive-load-five-messages",
    partNumber: 16,
    title: "Cognitive load — voters remember three to five things",
    eyebrow: "Message discipline",
    estimatedReadMinutes: 8,
    narrativeOverview: [
      "Under pressure, human brains retain very little. Most viewers remember three to five things from an entire debate — not fifty, not twenty, not ten. Three to five.",
      "Every answer should reinforce Kelly's pillars. Everything eventually returns to these messages:",
      "Message 1: Arkansas elections are secure, but every concern deserves answers.",
      "Message 2: The Secretary of State should work for voters and small businesses.",
      "Message 3: Trust comes from transparency.",
      "Message 4: Government should be easier to use.",
      "Message 5: People deserve to be heard.",
      "Staff should score debate rehearsals: did this answer advance a pillar? If not, it was noise.",
      "Cognitive load theory also means opponents' long lists fade — Kelly's single clerk story may outlast Pakko's five statistics.",
    ],
    whyItMattersForKelly:
      "Discipline wins debates more than brilliance — Kelly should be boringly on-message in the best sense.",
    corePrinciples: [
      "One pillar per answer primary; secondary pillar optional.",
      "Repeat pillars in different words — not identical sentences.",
      "Closing statement must name all five in under sixty seconds.",
    ],
    kellyApplication: [
      "Map each SOS question ID to primary pillar in question bank metadata.",
      "Use speak-order scripts from comprehensive expansion — already pillar-aligned.",
    ],
    rehearsalScripts: [
      {
        label: "60-second close — five pillars",
        text: "Secure elections with honest answers. A Secretary of State who works for voters and entrepreneurs. Transparency you can see online. Government that is easier to use. And leaders who listen — that is the office I will run.",
        whenToUse: "Closing statement rehearsal.",
      },
    ],
    commonMistakes: [
      "Chasing every moderator topic equally — dilutes memory.",
      "Staff-added tenth message because 'this poll said…'",
      "Identical closing line every answer — sounds robotic.",
    ],
    opponentNotes: [],
    arkansasContext: [],
    citations: [
      {
        label: "Cognitive load theory",
        source: "Sweller — working memory limits",
        note: "Information overload reduces retention and trust.",
      },
      {
        label: "Message repetition in campaigns",
        source: "Political communication — Momentum Messaging research",
        note: "Thematic repetition increases recall without verbatim repetition.",
      },
    ],
    relatedSectionIds: ["three-audiences-battlefield", "kelly-archetype-competent-mom-executive"],
    linkedQuestionIds: ["opening-statement-three-candidates"],
    href: "/admin/intelligence/sos-debate-questions",
  },
  {
    sectionId: "likability-acknowledgment-phrases",
    partNumber: 17,
    title: "Likability — acknowledgment phrases that lower resistance",
    eyebrow: "Micro-language",
    estimatedReadMinutes: 5,
    narrativeOverview: [
      "Research consistently shows people prefer leaders who are competent, authentic, empathetic, and confident — not perfect. Acknowledgment phrases are micro-tools that signal empathy without surrendering position.",
      "Power phrases: 'I understand that concern.' 'I've heard that all over Arkansas.' 'That's a fair question.' 'Clerks deserve better than guesswork.' 'Voters deserve a straight answer.'",
      "Rotate phrasing — same sentiment, different words — to protect authenticity.",
      "Likability is not agreement with opponents — it is recognition of voter emotion.",
      "Avoid hollow phrases without follow-through — always attach acknowledgment to action ('…so I will publish X').",
    ],
    whyItMattersForKelly:
      "Kelly's natural conversational style fits acknowledgment language — rehearse to keep it disciplined, not rambling.",
    corePrinciples: [
      "Acknowledge → action → pillar.",
      "Never acknowledge false claims as true — acknowledge emotion only.",
    ],
    kellyApplication: [
      "Build a rotation list of five acknowledgments — staff tracks usage in mock debates.",
    ],
    rehearsalScripts: [
      {
        label: "Concern acknowledgment",
        text: "I understand that concern — and you deserve more than a slogan. Here is what I will make public.",
        whenToUse: "Integrity or funding anxiety.",
      },
      {
        label: "Clerk acknowledgment",
        text: "I've heard that from clerks in counties big and small — they do not need another lecture from Little Rock.",
        whenToUse: "Mandate or funding questions.",
      },
    ],
    commonMistakes: [
      "Over-use 'I understand' — sounds scripted.",
      "Acknowledging opponent's frame ('You're right that elections are broken').",
    ],
    opponentNotes: [],
    arkansasContext: [],
    citations: [
      {
        label: "Motivational interviewing — reflective listening",
        source: "Miller & Rollnick",
        note: "Reflecting concern reduces defensiveness — applicable to political communication.",
      },
    ],
    relatedSectionIds: ["trust-equation-warmth-competence", "kelly-archetype-competent-mom-executive"],
  },
  {
    sectionId: "audience-reading-real-time",
    partNumber: 18,
    title: "Advanced audience reading — adapt in real time",
    eyebrow: "Live performance",
    estimatedReadMinutes: 6,
    narrativeOverview: [
      "Elite candidates read the room: applause volume, facial expressions, audience movement, moderator tone, opponent frustration. The debate constantly provides feedback.",
      "Kelly cannot see everything on bright stages — but she can hear silence vs rustling, feel when answers land flat in rehearsal, and watch opponent body language on split screens in prep.",
      "Adaptation rules: if integrity section feels hot, lengthen reassurance; if clerk section feels engaged, add neighbor detail; if time is short, cut teacher layer, keep executive close.",
      "Staff in audience should not signal wildly — one agreed note if Kelly drifts off pillars.",
      "Post-debate, film room review scores atmosphere choices, not just words.",
    ],
    whyItMattersForKelly:
      "Real-time adaptation separates rehearsed from ready.",
    corePrinciples: [
      "Have a default ladder; deviate intentionally.",
      "Never abandon pillars for crowd applause on wrong topic.",
    ],
    kellyApplication: [
      "ACCA: watch clerk note-taking — lean into topics where pens move.",
      "TV: shorter answers when moderator warns on time.",
    ],
    rehearsalScripts: [],
    commonMistakes: [
      "Chasing applause with partisan red meat.",
      "Ignoring moderator time cues — looks disrespectful.",
    ],
    opponentNotes: [
      "If Hammer loses audience, do not pile on — look presidential.",
    ],
    arkansasContext: [
      "Mountain View ACCA crowd — different from Little Rock Rotary; adjust neighbor references.",
    ],
    citations: [],
    relatedSectionIds: ["atmosphere-management-overview", "arkansas-three-way-acca-context"],
    href: "/admin/intelligence/film-room",
  },
  {
    sectionId: "kelly-archetype-competent-mom-executive",
    partNumber: 19,
    title: "Kelly's highest-probability identity — the competent Arkansas mom executive",
    eyebrow: "Closing archetype",
    estimatedReadMinutes: 8,
    narrativeOverview: [
      "The audience is not looking for the smartest person in the room. They are looking for the safest pair of hands. The candidate who creates the feeling 'I trust this person to take care of things' usually wins.",
      "For Kelly, the highest-probability psychological identity is not activist, partisan, or technician. It is: The Competent Arkansas Mom Who Knows How to Run Large Organizations, Listen to People, Solve Problems, and Tell the Truth Even When It's Difficult.",
      "That archetype combines executive leadership, community trust, emotional intelligence, and authenticity in a way neither Hammer nor Pakko can easily replicate.",
      "Activation checklist: mother warmth on fear, executive structure on plans, neighbor geography on stories, teacher clarity on process, reformer optimism on modernization — all with the same five pillars underneath.",
      "This is not branding fluff — it is the strategic synthesis of every prior section in this manual.",
    ],
    whyItMattersForKelly:
      "When Kelly is unsure which atmosphere to choose, return to this archetype sentence and pick the frame that expresses it.",
    corePrinciples: [
      "Strong and kind — always both.",
      "Truth even when difficult — never cruel.",
      "Arkansas roots — real places, real roles.",
    ],
    kellyApplication: [
      "Opening and closing statements should explicitly embody archetype.",
      "Social and trail content should mirror debate atmosphere choices.",
    ],
    rehearsalScripts: [
      {
        label: "Archetype summary — 30 seconds",
        text: "I am a mom, a CEO, and an Arkansan who listens first. I will run the Secretary of State's office with competence you can see and kindness you can feel — and I will tell you the truth even when it is hard.",
        whenToUse: "Opening or closing — verify claims gate on CEO/nonprofit specifics if expanded.",
      },
    ],
    commonMistakes: [
      "Drifting into partisan warrior to match Hammer.",
      "Drifting into pure analyst to match Pakko.",
      "Hiding executive credentials for false modesty — persuadables need competence proof.",
    ],
    opponentNotes: [],
    arkansasContext: [
      "Field-tested themes confirm independent/Republican room receptivity to unity + competence — see kellyTestedDebateThemes.",
    ],
    citations: [],
    relatedSectionIds: ["dad-test-reliable-leader", "trust-equation-warmth-competence", "cognitive-load-five-messages"],
    href: "/admin/intelligence/kelly-debate-coaching",
  },
  {
    sectionId: "arkansas-three-way-acca-context",
    partNumber: 20,
    title: "Arkansas formats — three-way SOS, ACCA panel, PBS stage",
    eyebrow: "Applied context",
    estimatedReadMinutes: 9,
    narrativeOverview: [
      "This manual is not abstract — it applies to specific Arkansas moments: the three-way Secretary of State race (Kelly · Kim Hammer · Michael Pakko), ACCA Summer Conference panel in Mountain View (Thu Jun 11, 1–3pm, two-hour moderated Q&A with clerks as primary audience), PBS-style televised debates, and county courthouse trail stops.",
      "Three-way rules: speak-order strategy from SOS question bank (first/second/third scripts); never double-contrast; use agree-plus-fresh-add when second; use synthesis close when third.",
      "ACCA rules: Executive + Neighbor dominate; Mother on clerk stress; avoid partisan culture-war; end with ninety-day clerk partnership pledge — cross-link ACCA depth module.",
      "PBS rules: Teacher + Executive; shorter answers; camera favors stillness; cite verified funding and integrity facts through claims gate.",
      "Trail rules: Neighbor + Reformer; convert five pillars into courthouse vocabulary.",
      "Psychology manual → SOS questions → opponent dossiers → trap lanes → claims gate is the full rehearsal stack.",
    ],
    whyItMattersForKelly:
      "Same psychology, different atmosphere weights per venue — rehearse venue tags explicitly.",
    corePrinciples: [
      "Clerks week: partnership over politics.",
      "TV week: calm over volume.",
      "Trail week: listen over lecture.",
    ],
    kellyApplication: [
      "Day before ACCA: read sections 7, 10, 20 + ACCA module section on panel geometry.",
      "Day before PBS debate: read sections 2, 9, 11, 16 + film room clips.",
    ],
    rehearsalScripts: [
      {
        label: "ACCA panel opener",
        text: "Thank you to the clerks who keep Arkansas elections running. I am not asking for your endorsement today — I am asking how this office can serve you better starting day one.",
        whenToUse: "ACCA SOS candidates panel opening.",
      },
    ],
    commonMistakes: [
      "Using ACCA speech on PBS — too insider.",
      "Using PBS density in clerk listening sessions — too televised.",
    ],
    opponentNotes: [
      "Watch Hammer ACCA tactics in dossier; watch Pakko three-way geometry section.",
    ],
    arkansasContext: [
      "2022 Arkansas PBS SOS debate — study pacing and integrity handling in film room.",
      "ACCA Mountain View — Ozark Folk Center, clerk-primary audience.",
    ],
    citations: [
      {
        label: "Arkansas PBS debates",
        source: "AR PBS election coverage",
        url: "https://www.myarkansaspbs.org/",
        note: "Statewide televised forums set tone expectations for down-ballot races.",
      },
    ],
    relatedSectionIds: ["advanced-candidate-manual-intro", "audience-reading-real-time"],
    linkedQuestionIds: ["acca-clerk-panel-partnership", "three-way-differentiation-opening"],
    href: "/admin/intelligence/county-clerk-week/acca-summer-conference",
  },
];

export function getAllDebatePsychologyManualSectionIds(): string[] {
  return DEBATE_PSYCHOLOGY_MANUAL_SECTIONS.map((s) => s.sectionId);
}

export function getDebatePsychologyManualSection(
  sectionId: string,
): DebatePsychologyManualSection | undefined {
  return DEBATE_PSYCHOLOGY_MANUAL_SECTIONS.find((s) => s.sectionId === sectionId);
}

export function listDebatePsychologyManualSections(): DebatePsychologyManualSection[] {
  return [...DEBATE_PSYCHOLOGY_MANUAL_SECTIONS].sort((a, b) => a.partNumber - b.partNumber);
}
