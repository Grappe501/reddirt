/**
 * Day 1 — full study guides for each 45–60 min block (Election Plan drill-down).
 */
import {
  EP_DEBATE_PREP_PSYCHOLOGY_HREF,
  EP_DEBATE_PREP_REHEARSAL_HREF,
  EP_DEBATE_PREP_TUTOR_HREF,
  EP_FORUM_LAB_CAPITALIZE_MOVES_HREF,
  epDebatePrepBriefingHref,
  epDebatePrepDayBlockHref,
  epDebatePrepDayDrillHref,
  epDebatePrepDayExampleHref,
  epDebatePrepDayMicroLessonHref,
  epDebatePrepDayRehearsalHref,
  epDebatePrepPsychologySectionHref,
  epForumLabCapitalizeMoveHref,
  epForumLabDeepAnalysisLessonHref,
  epForumLabPredictedScriptPhaseHref,
  epTrapLaneHref,
} from "@/lib/election-plan/debate-prep-links";
import { epDebatePrepLaneHref } from "@/lib/election-plan/debate-prep-route-map";
import type { DrillDownLink } from "@/lib/election-plan/debatePrepDayDrillDown";

const DAY1 = "day-1-command-foundation" as const;

export type BlockStudyPhase = {
  minutesLabel: string;
  title: string;
  steps: string[];
};

export type BlockStudySampleLine = {
  label: string;
  text: string;
  note?: string;
};

export type Day1BlockStudyDeep = {
  blockId: string;
  studyGuideTitle: string;
  overview: string;
  professorLead?: string;
  phases: BlockStudyPhase[];
  deepSections: Array<{ title: string; body: string }>;
  psychology?: Array<{ title: string; body: string }>;
  opponentForecast?: Array<{ title: string; body: string }>;
  sampleLines?: BlockStudySampleLine[];
  doNotSay?: string[];
  claimsGate?: string[];
  keyTakeaways: string[];
  practiceSteps: string[];
  relatedLinks: DrillDownLink[];
};

export const DAY1_BLOCK_STUDY: Record<string, Day1BlockStudyDeep> = {
  "b1-posture": {
    blockId: "b1-posture",
    studyGuideTitle: "Command posture & 4-4-6 breathing — 45-minute study",
    professorLead:
      "Viewers decide whether you belong on stage in the first ten seconds — before a single policy word. This block trains the body that carries every later answer; skip it and philosophy sounds scripted.",
    overview:
      "This block trains your body before your vocabulary. Seasoned politicians look calm because stillness is rehearsed — not because adrenaline disappeared. Follow the five phases in order; do not skip mirror work.",
    phases: [
      {
        minutesLabel: "0–8 min",
        title: "Setup & why breath comes first",
        steps: [
          "Clear a standing space facing a mirror or phone camera on a stable surface.",
          "Read the 4-4-6 mechanics section below once — do not memorize yet.",
          "Notice baseline: shoulders, jaw tension, foot width. Write one word for how your body feels now.",
          "Set a 45-minute timer — when it ends, you stop even if tempted to keep going.",
        ],
      },
      {
        minutesLabel: "8–18 min",
        title: "4-4-6 breathing — mechanics & reps",
        steps: [
          "Feet shoulder-width, weight even on both feet, knees soft (not locked).",
          "Cycle 1 — Inhale through nose for 4 counts. Hold 4 counts. Exhale through mouth for 6 counts.",
          "Repeat with eyes open. Shoulders stay down on the inhale — do not lift them.",
          "Cycle 3–6: same pattern. If dizzy, shorten hold to 2 counts — never force.",
          "Cycle 7–8: add a 2-second stillness after exhale before the next inhale.",
          "Success marker: eighth cycle completed without checking notes.",
        ],
      },
      {
        minutesLabel: "18–28 min",
        title: "ASP command protocol — four steps integrated",
        steps: [
          "Step 1 — Stance: feet shoulder-width, weight even, chin neutral.",
          "Step 2 — Exhale: one full 4-4-6 cycle immediately before you would speak.",
          "Step 3 — First sentence: under twelve words if possible. Then stop — half-beat pause.",
          "Step 4 — Hands: still at sides or one hand lightly on lectern until a gesture carries meaning.",
          "Run the full sequence three times aloud with a dummy first line: 'I'm Kelly Grappe.'",
        ],
      },
      {
        minutesLabel: "28–38 min",
        title: "Micro-pause before mic & listening stillness",
        steps: [
          "Simulate moderator: say your name, then wait two full seconds before speaking.",
          "Replay video — did you rush? Target: visible pause reads as confidence.",
          "Simulate Hammer speaking first: stand still, eyes on him, hands quiet — no fidget.",
          "Practice one 4-4-6 cycle while 'listening' without moving shoulders.",
          "Deliver second sentence only after exhale — never start speaking mid-inhale.",
        ],
      },
      {
        minutesLabel: "38–45 min",
        title: "Mirror check & success gate",
        steps: [
          "Record 30 seconds: name → pause → one-sentence opening → pause → second sentence.",
          "Replay: sway? filler words? hands moving before sentence two?",
          "Mark block complete when two full 4-4-6 cycles and one clean 30s take are done.",
          "Journal one line: what felt different in my body after breath work?",
        ],
      },
    ],
    deepSections: [
      {
        title: "What is 4-4-6 breathing?",
        body:
          "A paced breath pattern used in high-stakes communication training (ASP-style command protocol): inhale 4 counts, hold 4 counts, exhale 6 counts. The longer exhale activates the parasympathetic nervous system — it tells your body you are not in immediate danger. Debate adrenaline narrows working memory; breath widens it back.",
      },
      {
        title: "Why 4-4-6 before words",
        body:
          "Motor skills must be automatic before cognitive load rises. If your first debate memory is rushing, every later answer inherits that pace. Training exhale-before-mic makes stillness the default when Hammer accelerates or the moderator piles on.",
      },
      {
        title: "When to use it on stage",
        body:
          "1) After the moderator says your name. 2) While Hammer speaks (quiet cycle, mouth closed). 3) After a bait line — before you pivot. 4) Before your closing sentence. Do not perform obvious 'meditation' on camera — one subtle exhale is enough.",
      },
      {
        title: "Common mistakes",
        body:
          "Swaying while listening. Talking over the moderator's first syllable. Gesturing before the second sentence. Lifting shoulders on inhale. Apologizing for pausing — the pause is power. Skipping mirror review.",
      },
      {
        title: "ASP four-step protocol (summary)",
        body:
          "1) Feet planted, weight even. 2) Exhale before the mic opens. 3) First sentence short — pause. 4) Hands still until gesture serves meaning. This is borrowed from police and military communication training: body protocol before content.",
      },
    ],
    psychology: [
      {
        title: "Parasympathetic activation on camera",
        body:
          "The longer exhale (6 counts) signals safety to your nervous system. On split screen, opponents who breathe visibly before speaking read as in control — not slow.",
      },
      {
        title: "Listening stillness as dominance",
        body:
          "Hammer will gesture early and tell stories. Kelly's stillness while he speaks reads as confidence, not passivity — if chin stays neutral and hands are quiet.",
      },
      {
        title: "First-ten-second viewer scan",
        body:
          "Undecided voters decide whether you 'belong' before content lands. Sway, filler, or talking over the moderator reads as unprepared — breath protocol is the fix before philosophy.",
      },
    ],
    opponentForecast: [
      {
        title: "When Hammer accelerates",
        body:
          "His pace is trained — yours must not match out of nerves. One quiet exhale while he finishes; then your first sentence at your pace, not his.",
      },
      {
        title: "Moderator pile-on",
        body:
          "If the moderator interrupts mid-breath, finish exhale before answering — never start on inhale even when pressured.",
      },
    ],
    doNotSay: [
      "Sorry for the pause — the pause is power.",
      "I'm nervous — never narrate fear on stage.",
    ],
    claimsGate: [],
    keyTakeaways: [
      "Two full 4-4-6 cycles without notes = minimum Day 1 posture success.",
      "Pause after your name is allowed — rush reads as fear.",
      "Stillness while opponents speak is power.",
    ],
    practiceSteps: [
      "Complete all five phases in one sitting.",
      "Run 4-4-6 twice with eyes open before any opponent content tonight.",
      "Record 30s opening with visible pause after name.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayBlockHref(DAY1, "b1-posture"), label: "This study guide" },
      { href: epDebatePrepLaneHref("lane-d1-asp-deep"), label: "ASP protocol lane" },
      { href: epDebatePrepDayMicroLessonHref(DAY1, "d1-asp-protocol"), label: "Micro-lesson · 4-step protocol" },
      { href: epDebatePrepPsychologySectionHref("atmosphere-management-overview"), label: "Psychology · atmosphere" },
    ],
  },
  "b1-philosophy": {
    blockId: "b1-philosophy",
    studyGuideTitle: "Philosophy spine — agree but never only agree (60 min)",
    professorLead:
      "This is the debate move viewers reward most: warmth without surrender. Hammer will agree with himself; Pakko will agree with disillusionment. Kelly must agree once — then add the SOS layer only an administrator can deliver. Ending on agree alone loses the split screen.",
    overview:
      "Hammer's first move is always agree-on-security. This block builds muscle memory for the add-on — the SOS implementation layer he cannot claim from the Senate floor. You are not learning to disagree; you are learning to agree once, then add what only the administrator can deliver.",
    phases: [
      {
        minutesLabel: "0–15 min",
        title: "Read & annotate core philosophy",
        steps: [
          "Read deep sections below — core philosophy, when to apply, when not to.",
          "Highlight one shared-value line you can say without sarcasm.",
          "Highlight one SOS deliverable add-on (clerks, funding, published rules, SOS desk).",
          "Write Hammer's predictable opener in your own words: 'We all want secure elections.'",
        ],
      },
      {
        minutesLabel: "15–30 min",
        title: "Three-phrase architecture drill",
        steps: [
          "Phrase 1 — Agree in one breath: 'Absolutely — we all want secure elections.'",
          "Phrase 2 — Pivot word is 'And' (never 'But' on shared values if you can avoid it).",
          "Phrase 3 — Clerk/SOS layer: 'And clerks need funding and answers, not just slogans.'",
          "Speak all three chained — target under 15 seconds.",
          "Repeat five times until boring.",
        ],
      },
      {
        minutesLabel: "30–45 min",
        title: "60-second closing exercise",
        steps: [
          "Staff or recording plays moderator: 'Closing thoughts on election integrity?'",
          "Kelly delivers 60s: agree once → add clerk partnership → unity close (no zinger).",
          "Count ums on replay — target three or fewer.",
          "Debrief: Did I stop at agree? Did I attack motive?",
        ],
      },
      {
        minutesLabel: "45–60 min",
        title: "Second & third speaker pivots",
        steps: [
          "Practice second-speaker line: agree + SOS deliverable Hammer cannot claim from Senate floor.",
          "Practice third-speaker line: 'I won't repeat what you heard twice — here's what SOS does next week.'",
          "Practice echo trap escape: never end on 'I agree with Senator Hammer.'",
          "Mark block complete when 60s closing feels natural, not memorized.",
        ],
      },
    ],
    deepSections: [
      {
        title: "Core philosophy",
        body:
          "Voters already heard Hammer agree with himself. Your job is not to out-agree him — it is to add the implementation layer he skipped: county funding, published rules, training calendars, and a human SOS desk when a new act lands on a Friday.",
      },
      {
        title: "Why this method wins three-way forums",
        body:
          "Forums reward the candidate who sounds prepared for the office, not the most partisan. Agreement buys ~8 seconds of trust; the fresh addition makes you memorable and non-interchangeable with Hammer or Pakko.",
      },
      {
        title: "When to apply",
        body:
          "Hammer opens with 'we all want secure elections.' Pakko says both parties failed. You speak second or third and integrity is already covered. Moderator asks yes/no fairness questions.",
      },
      {
        title: "When NOT to apply",
        body:
          "Direct factual correction needed (misquoted act text). Claims-gate line is NEEDS_RESEARCH — do not agree to unverified statistics. Culture-war bait designed for biography defense.",
      },
      {
        title: "Handling steps (in order)",
        body:
          "1) Name shared value in one sentence — no sarcasm. 2) Add one SOS deliverable Hammer cannot claim from the Senate floor. 3) Anchor with county/clerk example only if verified. 4) Close with unity — not a zinger at Hammer.",
      },
      {
        title: "Common mistakes",
        body:
          "Ending with 'I agree with Senator Hammer' and stopping. Adding abstract promises ('I'll work hard') instead of SOS deliverables. Attacking motives instead of contrasting roles (author vs administrator).",
      },
      {
        title: "Forum lab crosswalk",
        body:
          "ACCA capitalize moves: when Hammer says 'work together,' when he talks election security, when he emphasizes civic education — each has a rehearsed agree-add in forum lab. Philosophy block is the parent framework; capitalize pages are the triggers.",
      },
      {
        title: "Three-way geometry",
        body:
          "When Pakko says both parties failed, agree on fair process — do not litigate party reform. When you speak third after two agree lines, use echo-trap escape: 'I won't repeat what you heard twice — here's what SOS does next week.'",
      },
    ],
    psychology: [
      {
        title: "Why 'And' beats 'But'",
        body:
          "Shared-value agreement is emotional glue. 'But' signals combat to viewers who want calm. 'And' carries the add-on without breaking warmth — critical for Kelly's people-over-politics brand.",
      },
      {
        title: "Eight seconds of trust",
        body:
          "Forum research pattern: agreement buys ~8 seconds of audience trust — enough for one fresh sentence. The add-on must be concrete (clerks, funding, Friday rule drop) or you waste the trust.",
      },
      {
        title: "Viewer read on agree-only",
        body:
          "If Kelly stops after agreeing with Hammer, undecided voters mark her as 'same as him but less experienced.' The add-on is not optional — it is the differentiation move.",
      },
    ],
    opponentForecast: [
      {
        title: "Hammer predictable openers",
        body:
          "'We all want secure elections.' 'We need to work together.' '#1 state in the nation.' 'I've worked with clerks 16 years.' — each gets agree + clerk/SOS add.",
      },
      {
        title: "Pakko predictable openers",
        body:
          "'Both parties failed.' 'More competition.' — agree on voices/fair rules; do not become Libertarian surrogate.",
      },
      {
        title: "Moderator yes/no traps",
        body:
          "'Don't you agree integrity matters?' — yes, then add. Never yes and stop.",
      },
    ],
    sampleLines: [
      {
        label: "Second speaker pivot",
        text: "I agree with Senator Hammer that integrity matters — what Arkansas still needs is a Secretary of State who funds clerk training when Little Rock passes the next mandate.",
        note: "Calm authority — you are adding, not attacking",
      },
      {
        label: "Third speaker close",
        text: "We all want the same outcome — the difference is who will answer the phone when Saline County gets a new rule at 4 p.m. on a Friday.",
        note: "Service-forward warmth",
      },
      {
        label: "Echo trap escape",
        text: "I won't repeat what you just heard twice — here's what the Secretary of State actually does next week.",
        note: "Confident differentiation",
      },
      {
        label: "Security agree-add",
        text: "Absolutely — secure elections matter. And voters deserve to see how clerks make that real in every county.",
        note: "Pairs with forum capitalize · hammer-security",
      },
      {
        label: "Clerk Friday rule",
        text: "We all want the same outcome — the question is who answers the phone when a new rule lands at 4 p.m. on a Friday.",
        note: "Service-forward — ACCA clerk-room language",
      },
    ],
    doNotSay: [
      "I agree with Senator Hammer. (full stop)",
      "He's wrong about… — motive attack before add-on",
      "I'll work hard for Arkansas — empty add",
    ],
    claimsGate: [
      "Do not agree to unverified statistics — NEEDS_RESEARCH lines stay off stage.",
      "No specific act numbers in philosophy drill unless claims-verified.",
    ],
    keyTakeaways: [
      "Never end on agree alone — always add clerk/SOS layer.",
      "Pivot word: 'And' — then deliverable.",
      "60s closing without bill-number tennis is Day 1 philosophy success.",
    ],
    practiceSteps: [
      "Complete four phases in order.",
      "Deliver 60s closing on video.",
      "Staff checks: stopped at agree? attacked motive?",
    ],
    relatedLinks: [
      { href: epDebatePrepBriefingHref("agree-but-never-only-agree"), label: "Full philosophy briefing" },
      { href: epDebatePrepDayDrillHref(DAY1, "d1-agree-add"), label: "Command drill · agree-add" },
      { href: epDebatePrepDayRehearsalHref(DAY1, "rehearse-agree-contrast-30s"), label: "30s agree-contrast script" },
      { href: epDebatePrepLaneHref("lane-d1-author-deep"), label: "Author vs administrator lane" },
      { href: epForumLabCapitalizeMoveHref("hammer-work-together"), label: "Forum · capitalize work together" },
      { href: epForumLabCapitalizeMoveHref("hammer-security"), label: "Forum · capitalize security" },
      { href: epForumLabDeepAnalysisLessonHref("profile-hammer"), label: "Forum · Hammer profile" },
      { href: EP_FORUM_LAB_CAPITALIZE_MOVES_HREF, label: "Capitalize moves hub" },
    ],
  },
  "b1-author": {
    blockId: "b1-author",
    studyGuideTitle: "Author vs administrator — 60-minute contrast study",
    professorLead:
      "Hammer's best trap is collapsing 'I wrote the law' into 'I can run elections.' This block makes the job-fit counter automatic — two jobs voters already understand, no motive attacks, no bill-number tennis on Day 1.",
    overview:
      "Hammer's strongest move collapses 'wrote the law' into 'can run elections.' This block makes the job-fit counter automatic — writing is not administering seventy-five counties. No motive attacks; two jobs voters already understand.",
    phases: [
      {
        minutesLabel: "0–15 min",
        title: "Frame the two jobs",
        steps: [
          "Read deep sections: legislator vs SOS administrator.",
          "Write one sentence: What does a senator do on election law?",
          "Write one sentence: What does SOS do for clerks daily?",
          "Speak the contrast line once: 'Writing law and running the office clerks depend on are different jobs.'",
        ],
      },
      {
        minutesLabel: "15–30 min",
        title: "Anchor lines — no apology",
        steps: [
          "Practice: 'Sponsoring a bill is not running the office clerks depend on.'",
          "Practice: 'I am not running for the Senate — I am running to administer elections fairly for every county.'",
          "Practice: 'Senator Hammer helped write policy — the SOS job is making sure seventy-five counties can execute it.'",
          "Record each line — no self-deprecating apology about never having held office.",
        ],
      },
      {
        minutesLabel: "30–45 min",
        title: "Bait response drill",
        steps: [
          "Staff reads: 'I wrote the bills that secured Arkansas elections.'",
          "Kelly responds in 45 seconds — clerks + SOS service desk frame.",
          "Staff reads: 'I have more experience than anyone on this stage.'",
          "Kelly responds — administrator qualifications, not bill list.",
          "Repeat until three clean takes.",
        ],
      },
      {
        minutesLabel: "45–60 min",
        title: "Stack with agree-add philosophy",
        steps: [
          "Chain: agree on security → author/administrator pivot → clerk partnership.",
          "60s full arc on video — no specific act numbers unless claims-verified.",
          "Debrief: Did I list too many jobs? Did I attack motive?",
          "Mark block complete when one-sentence pivot is automatic.",
        ],
      },
    ],
    deepSections: [
      {
        title: "Core philosophy",
        body:
          "The Arkansas Secretary of State is an operations executive for elections, business services, and public records — not a senator listing bill numbers. Voters respect legislative service; they hire SOS candidates for who will implement.",
      },
      {
        title: "Why job-fit beats bill tennis",
        body:
          "Contrast frames work when they describe two jobs voters understand without knowing act numbers. Hammer wants bill-list debate — Kelly wants clerk-service debate. Pivot within one sentence when he says 'I wrote.'",
      },
      {
        title: "When to apply",
        body:
          "Experience/readiness questions. Hammer cites Heritage rankings or act authorship. Moderator asks 'why you and not him.' Any 'what qualifies you' moment.",
      },
      {
        title: "Claims gate",
        body:
          "Do not cite specific acts on stage until staff verifies. 'Clerks secured those elections' is frame-safe. Inventing funding claims or fraud statistics is not.",
      },
      {
        title: "Common mistakes",
        body:
          "Listing too many jobs. Sounding defensive about never holding office. Attacking Hammer's motives. Debating bill text line-by-line without verification.",
      },
      {
        title: "Stack with philosophy block",
        body:
          "Author pivot is often phrase 3 after agree-add: agree on security → 'And the SOS job is making sure seventy-five counties can execute it.' Practice the chain in b1-philosophy block 45–60 min phase.",
      },
    ],
    psychology: [
      {
        title: "Job-fit vs personality",
        body:
          "Voters hire SOS for operations, not charisma contests. Framing contrast as two jobs avoids sounding like you are attacking a senator — you are clarifying which job is on the ballot.",
      },
      {
        title: "Competence without apology",
        body:
          "Never having held office is only a liability if you act defensive. Anchor on organizations run, clerks organized with, deadlines met — then ask for the administrator job plainly.",
      },
    ],
    opponentForecast: [
      {
        title: "Hammer authorship bait",
        body:
          "'I wrote the bills that secured Arkansas elections.' 'I have more experience than anyone on this stage.' '#1 in the nation for election integrity.' — each gets clerk credit + administrator frame, not ranking debate.",
      },
      {
        title: "Moderator experience questions",
        body:
          "'Why you and not him?' — administrator qualifications in 45 seconds: who answers clerk calls, who funds training, who shows up when rules change.",
      },
    ],
    sampleLines: [
      {
        label: "Authorship pivot",
        text: "Clerks secured those elections — in every county. I want an office that answers their calls, not one that takes credit from the Capitol.",
      },
      {
        label: "Experience pivot",
        text: "I have managed organizations, budgets, and people under deadline — and I have organized statewide with clerks in the room, not just legislators in the Capitol.",
      },
      {
        label: "One-sentence contrast",
        text: "Writing law and running the office clerks depend on are different jobs. I am asking for the administrator job.",
      },
    ],
    doNotSay: [
      "He doesn't care about clerks — motive attack",
      "Heritage ranking says… — unverified stat on stage",
      "I've never held office so… — apology frame",
    ],
    claimsGate: [
      "Do not cite specific acts or Heritage rankings until staff verifies in claims ledger.",
      "'Clerks secured those elections' is frame-safe; invented funding figures are not.",
    ],
    keyTakeaways: [
      "One-sentence author vs administrator line without apology = success.",
      "Credit clerks; name SOS as service desk.",
      "Job fit, not personality or motive.",
    ],
    practiceSteps: [
      "Complete four phases.",
      "Three bait responses on video.",
      "Chain agree-add + author pivot once.",
    ],
    relatedLinks: [
      { href: epDebatePrepBriefingHref("author-vs-administrator"), label: "Full contrast briefing" },
      { href: epDebatePrepDayExampleHref(DAY1, "ex1-hammer-open"), label: "Hammer opening example" },
      { href: epDebatePrepLaneHref("lane-d1-author-deep"), label: "Author vs administrator lane" },
      { href: epDebatePrepDayBlockHref(DAY1, "b1-philosophy"), label: "Philosophy · agree-add stack" },
      { href: epForumLabDeepAnalysisLessonHref("profile-hammer"), label: "Forum · Hammer profile" },
      { href: epTrapLaneHref("experience-equals-sos-ready"), label: "Trap lane · experience equals SOS" },
    ],
  },
  "b1-psych": {
    blockId: "b1-psych",
    studyGuideTitle: "Debate atmosphere & psychology — 45-minute study",
    professorLead:
      "Adults learn under threat poorly — you cannot absorb trap lanes while adrenaline is high. This block names fear, rehearses atmosphere scripts, and locks Kelly's archetype: competent warmth, not performative toughness.",
    overview:
      "Adult learners need emotional honesty before opponent content sticks. This block names fear, reduces threat, and rehearses atmosphere scripts — not just reading manual pages.",
    phases: [
      {
        minutesLabel: "0–12 min",
        title: "Manual sections 1–3 (skim + one note each)",
        steps: [
          "Open psychology manual intro — note who the audience is and what they fear.",
          "Read atmosphere management overview — three levers: pace, warmth, authority.",
          "Read when audience is anxious — Kelly's job is to lower room threat without condescension.",
          "Write one bullet per section: what applies to SOS debate specifically?",
        ],
      },
      {
        minutesLabel: "12–22 min",
        title: "Fear journal (two sentences)",
        steps: [
          "Sentence 1 — honest: 'What scares me about the stage is…'",
          "Sentence 2 — offer: 'What I offer the room is…'",
          "Do not share publicly — this is for Kelly and coach only.",
          "Say both sentences aloud to one person or on video.",
        ],
      },
      {
        minutesLabel: "22–35 min",
        title: "Innocence reframe",
        steps: [
          "Read micro-lesson: innocence is not weakness.",
          "Replace one self-deprecating phrase with a competence anchor (nonprofit, clerks, deadlines).",
          "Practice: 'I have never debated on TV — I have run organizations under pressure.'",
          "No apology for being new; anchor on competence already demonstrated.",
        ],
      },
      {
        minutesLabel: "35–45 min",
        title: "Atmosphere rehearsal script",
        steps: [
          "Pick one script from atmosphere section — deliver aloud twice.",
          "Simulate anxious crowd energy: slow pace 10%, lower voice slightly, finish sentence cleanly.",
          "Mark block complete when fear + offer sentences spoken and one script rehearsed.",
        ],
      },
    ],
    deepSections: [
      {
        title: "Why psychology before trap lanes",
        body:
          "Adults learn under threat poorly. Day 1 is body and philosophy because you cannot absorb 'what Hammer will say' while your nervous system is screaming. Naming fear reduces amygdala hijack — metacognition is a performance skill.",
      },
      {
        title: "Atmosphere management — three levers",
        body:
          "Pace: slow down when room is hot. Warmth: clerk partnership language, not combat. Authority: short sentences, still body, no filler. Kelly's archetype is competent mom-executive — warmth plus command, not performative toughness.",
      },
      {
        title: "When the audience is anxious",
        body:
          "Election audiences arrive with 2020 baggage. Do not nationalize unless moderator forces it. Acknowledge shared desire for fairness, then local clerk frame. Never mirror panic — your breath protocol is the anchor.",
      },
      {
        title: "Kelly archetype on stage",
        body:
          "Voters distrust performative politicians. Steady body + honest preparation reads as authentic. 'Never debated' paired with visible rehearsal beats polished emptiness.",
      },
      {
        title: "Fear journal protocol",
        body:
          "Two sentences only — private to Kelly and coach. Sentence 1 names fear honestly; sentence 2 names what the room gets from you. Speaking them aloud reduces amygdala hijack before opponent content.",
      },
    ],
    psychology: [
      {
        title: "Adult learning safety",
        body:
          "Day 1 intensive principle: reduce threat first. Body block → philosophy → contrast → psychology → opening. Skipping emotional honesty makes later drills feel like performance.",
      },
      {
        title: "Anxious audience mirror",
        body:
          "If you mirror panic, the room escalates. Slow pace 10%, lower voice slightly, finish sentences cleanly — your breath protocol from b1-posture is the anchor.",
      },
      {
        title: "Innocence reframe",
        body:
          "'I have never debated on TV — I have run organizations under pressure.' Replace apology with competence anchor: nonprofit leadership, clerk partnerships, deadlines met.",
      },
    ],
    opponentForecast: [
      {
        title: "When Hammer goes personal",
        body:
          "Do not take bait into biography defense on Day 1. Atmosphere script: acknowledge, pivot to SOS service desk, return to clerks.",
      },
      {
        title: "When Pakko amplifies cynicism",
        body:
          "Audience may nod at 'both parties failed.' Agree on fair process without becoming Libertarian surrogate — warmth + authority, not combat.",
      },
    ],
    doNotSay: [
      "I'm terrified — never narrate fear publicly",
      "You should calm down — condescension to anxious voters",
    ],
    claimsGate: [
      "Psychology journal is private — not for broadcast or social.",
    ],
    keyTakeaways: [
      "Fear sentence + offer sentence spoken aloud.",
      "Three manual sections skimmed with one rehearsal each.",
      "Replace apology with competence anchor.",
    ],
    practiceSteps: [
      "Complete four phases.",
      "Journal two sentences.",
      "One atmosphere script on video.",
    ],
    relatedLinks: [
      { href: EP_DEBATE_PREP_PSYCHOLOGY_HREF, label: "Psychology manual hub" },
      { href: epDebatePrepPsychologySectionHref("advanced-candidate-manual-intro"), label: "Part 1 · audience target" },
      { href: epDebatePrepPsychologySectionHref("atmosphere-management-overview"), label: "Atmosphere overview" },
      { href: epDebatePrepPsychologySectionHref("when-audience-anxious"), label: "When audience is anxious" },
      { href: epDebatePrepDayMicroLessonHref(DAY1, "d1-innocence"), label: "Micro-lesson · innocence" },
      { href: epDebatePrepLaneHref("lane-d1-psych-stretch"), label: "Fear journal lane" },
    ],
  },
  "b1-tutor": {
    blockId: "b1-tutor",
    studyGuideTitle: "First impression opening — 30-minute study (replaces tutor-only block)",
    professorLead:
      "Opening lines written before body protocol sound performative. You earn the 90-second spine by finishing breath, philosophy, and contrast first — then deliver clerk partnership with a steady body. AI tutor is optional repetition, not a substitute for mirror work.",
    overview:
      "This block builds your opening without requiring AI first. Study the script architecture, rehearse on video, then optionally use the AI tutor for repetition — not as a substitute for out-loud work.",
    phases: [
      {
        minutesLabel: "0–10 min",
        title: "Opening architecture",
        steps: [
          "Read 90s opening script in rehearsal section — clerk partnership, no opponent names.",
          "Identify three beats: name/role → seventy-five counties → clerk service close.",
          "Note presence rules: eyes to moderator first, one open gesture only, hands still early.",
        ],
      },
      {
        minutesLabel: "10–20 min",
        title: "Out-loud rehearsal (no AI)",
        steps: [
          "Deliver 90s opening twice on timer — under 90 seconds both times.",
          "Between takes: one 4-4-6 cycle.",
          "Replay video: ums over three? opponent names slipped in?",
        ],
      },
      {
        minutesLabel: "20–30 min",
        title: "Optional AI tutor + lock-in",
        steps: [
          "If time: 15-minute tutor session on opening only — one mode, no topic switching.",
          "After tutor OR second video take: speak best line twice more without notes.",
          "Mark block complete when opening delivered twice cleanly on video.",
        ],
      },
    ],
    deepSections: [
      {
        title: "Why opening comes last on Day 1",
        body:
          "Opening lines written before body protocol sound performative. You earn the opening by finishing breath + philosophy + contrast frames first — then words land in a steady body.",
      },
      {
        title: "90-second opening spine",
        body:
          "I'm Kelly Grappe. I'm running to run the office — a service desk for seventy-five counties that educates and unites. Clerks run elections in Arkansas. I want to be the administrator who answers their calls, funds training, and shows up when a new rule lands on a Friday. Compare records, compare readiness, compare who will show up for clerks.",
      },
      {
        title: "Presence checklist",
        body:
          "Eyes to moderator first, then one slow room sweep. Pause after name and after 'unites.' No opponent names on Day 1. No bill numbers. Hands still until 'seventy-five counties' — one open gesture only.",
      },
      {
        title: "When to use AI tutor",
        body:
          "Use tutor for judgment-free repetition after you have rehearsed aloud. Tutor does not replace mirror work, staff bait drills, or claims gate. Fifteen minutes max — opening only.",
      },
      {
        title: "Forum predicted script crosswalk",
        body:
          "Forum lab predicted-script opening beat has moderator setup, presence notes, and newspaper angle — use after this block's two video takes for full ACCA integration.",
      },
    ],
    psychology: [
      {
        title: "First impression without opponent names",
        body:
          "Day 1 opening defines Kelly before Hammer defines her. No opponent names, no bill numbers — clerk partnership and administrator frame only. Viewers file you as SOS-ready, not reactive.",
      },
      {
        title: "Presence beats polish",
        body:
          "Two clean video takes with visible pause after name beat one long AI session. Ums under three; hands still early; one open gesture at 'seventy-five counties.'",
      },
    ],
    opponentForecast: [
      {
        title: "What comes after your opening",
        body:
          "Hammer will likely open with integrity ranking — you already rehearsed agree-add in b1-philosophy and author pivot in b1-author. Opening sets clerk frame; his open is your first capitalize trigger.",
      },
    ],
    sampleLines: [
      {
        label: "Opening beat 1",
        text: "I'm Kelly Grappe. I'm running to run the office — a service desk for seventy-five counties that educates and unites.",
      },
      {
        label: "Opening beat 2",
        text: "Clerks run elections in Arkansas. I want to be the administrator who answers their calls, funds training, and shows up when a new rule lands on a Friday.",
      },
      {
        label: "Opening close",
        text: "Compare records, compare readiness, compare who will show up for clerks.",
      },
    ],
    doNotSay: [
      "Senator Hammer… — no opponent names in Day 1 opening",
      "Act 123… — no bill numbers in opening",
    ],
    claimsGate: [
      "Opening spine uses frame-safe clerk language only — no unverified rankings or fraud framing.",
    ],
    keyTakeaways: [
      "Two clean video takes beats one long tutor session.",
      "No opponent names in Day 1 opening.",
      "AI tutor is optional reinforcement — not the study guide.",
    ],
    practiceSteps: [
      "90s opening twice on video.",
      "Optional 15-min tutor after out-loud work.",
      "Lock best line with two no-notes repetitions.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayRehearsalHref(DAY1, "rehearse-opening-90s"), label: "90s opening script & presence notes" },
      { href: epDebatePrepDayDrillHref(DAY1, "d1-calm-open"), label: "Command drill · calm opening" },
      { href: `${EP_DEBATE_PREP_REHEARSAL_HREF}?queue=standard-tonight&card=1`, label: "Rehearsal queue" },
      { href: `${EP_DEBATE_PREP_TUTOR_HREF}?focus=opening`, label: "Optional · AI tutor (opening focus)" },
      { href: epDebatePrepDayBlockHref(DAY1, "b1-posture"), label: "Posture · breath protocol" },
      { href: epForumLabPredictedScriptPhaseHref("opening"), label: "Forum · predicted opening beat" },
    ],
  },
};

export function getDay1BlockStudy(blockId: string): Day1BlockStudyDeep | undefined {
  return DAY1_BLOCK_STUDY[blockId];
}

export function listDay1BlockStudies(): Day1BlockStudyDeep[] {
  return Object.values(DAY1_BLOCK_STUDY);
}
