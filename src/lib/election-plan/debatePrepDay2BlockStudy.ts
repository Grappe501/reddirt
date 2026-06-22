/**
 * Day 2 — full study guides for each block (Election Plan drill-down).
 */
import {
  EP_DEBATE_PREP_TUTOR_HREF,
  EP_FORUM_TRANSCRIPT_LAB_HREF,
  EP_OPPONENT_BIOS_HREF,
  EP_OPPOSITION_RESEARCH_HREF,
  epDebatePrepDayBlockHref,
  epDebatePrepDayConceptHref,
  epDebatePrepDayDrillHref,
  epDebatePrepDayExampleHref,
  epDebatePrepDayMicroLessonHref,
  epDebatePrepDayRehearsalHref,
  epDebatePrepPsychologySectionHref,
  epOpponentBioHref,
  epTrapLaneHref,
} from "@/lib/election-plan/debate-prep-links";
import { epDebatePrepLaneHref } from "@/lib/election-plan/debate-prep-route-map";
import { DAY2_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import type { Day1BlockStudyDeep } from "@/lib/election-plan/debatePrepDay1BlockStudy";

export const DAY2_BLOCK_STUDY: Record<string, Day1BlockStudyDeep> = {
  "b2-film": {
    blockId: "b2-film",
    studyGuideTitle: "Film room — opponent tells worksheet · 90-minute study",
    professorLead:
      "Tonight you watch before you counter. Hammer's rhythm is predictable once you name three tells — voice speed, ranking cite, jaw tension. Pakko gets one respect line. Write tells first; rebuttal comes in trap lanes.",
    overview:
      "Observational learning beats memorizing every line. Watch one Hammer segment and one Pakko segment from the forum lab; pause at tells; complete the worksheet before any pivot practice. Three Hammer tells + one Pakko tell is enough for tonight.",
    phases: [
      {
        minutesLabel: "0–10 min",
        title: "Setup & worksheet",
        steps: [
          "Open film room below — five ACCA study clips with YouTube start times (election-plan, no admin login).",
          "Create a tell worksheet: three rows for Hammer, one row for Pakko.",
          "Columns: Tell · What I saw/heard · Kelly pivot phrase (one sentence each).",
          "Set a 90-minute timer — film block ends when timer ends, not when clips feel 'done.'",
        ],
      },
      {
        minutesLabel: "10–40 min",
        title: "Hammer clip — pause at three tells",
        steps: [
          "Watch first 3–5 minutes without writing — notice pace, filler, pivot phrases.",
          "Rewatch with pause: mark when voice speed increases (threatened → you slow down).",
          "Mark second tell: Heritage / integrity ranking cite (abstract scorecard incoming).",
          "Mark third tell: jaw tension or bill-number list acceleration.",
          "Write one pivot line per tell — clerk phone, not ranking debate.",
          "Optional: open film-deep lane for signal checklist.",
        ],
      },
      {
        minutesLabel: "40–55 min",
        title: "Pakko clip — one respect line",
        steps: [
          "Watch one Pakko segment — note where he looks when Hammer speaks.",
          "Write one respect line: acknowledge reform without ceding SOS administrator job.",
          "Do not script an attack on third-candidate status — contrast gate applies.",
          "Speak respect line once aloud — under 15 seconds.",
        ],
      },
      {
        minutesLabel: "55–75 min",
        title: "Tell → pivot reps (no full debate)",
        steps: [
          "Staff reads each tell category — Kelly speaks pivot only, 20 seconds max.",
          "Ranking cite → county clerk phone line.",
          "Authorship cite → author vs administrator one-liner.",
          "Mandate / 2020 frame → clerks forward, not relitigate.",
          "Repeat until each pivot feels boring.",
        ],
      },
      {
        minutesLabel: "75–90 min",
        title: "Worksheet lock & success gate",
        steps: [
          "Read worksheet aloud — three Hammer tells + one Pakko line without notes.",
          "Journal: which tell made me want to react instead of respond?",
          "Mark block complete when worksheet is filled and one ranking pivot is clean on video.",
          "Do not start trap lane reps here — that is the next block.",
        ],
      },
    ],
    deepSections: [
      {
        title: "Hammer watch list",
        body:
          "Listen for: integrity ranking · act authorship · mandate language · 2020 framing. Each is a pivot point to clerks and implementation — not a fight about motives.",
      },
      {
        title: "Voice & jaw signals",
        body:
          "When Hammer accelerates, Kelly slows. Nonverbal tells precede verbal pivots. If you match his pace, viewers read anxiety. Still hands + slower voice = command contrast.",
      },
      {
        title: "Pakko geometry",
        body:
          "When Pakko looks at Hammer during a pile-on, Kelly looks at the moderator. One bridge sentence to clerks — never fight two fronts in one answer.",
      },
      {
        title: "When to apply film tells",
        body:
          "Use worksheet tells during trap lanes tonight and forum lab on Day 4 — not as a script of every Hammer line. Recognition triggers pivot phrases you already rehearsed in Day 1 philosophy and author blocks.",
      },
      {
        title: "Common mistakes",
        body:
          "Rewatching clips without pausing. Debating Heritage rankings instead of clerk pivot. Skipping Pakko segment because Hammer is louder. Jumping to trap lanes before worksheet is filled.",
      },
    ],
    psychology: [
      {
        title: "Observational learning",
        body:
          "Seasoned debaters win on timing before vocabulary. You are building a prediction model — not a script of every Hammer line.",
      },
    ],
    opponentForecast: [
      {
        title: "Hammer in clips",
        body:
          "Expect ranking cites, bill authorship, and 'secure elections' framing. He will sound confident — your job is recognition, not outrage.",
      },
      {
        title: "Pakko in clips",
        body:
          "Expect libertarian overreach / both-parties-failed themes. Steal reform lane by agreeing on clerk burden, then naming SOS service desk.",
      },
    ],
    sampleLines: [
      {
        label: "Ranking pivot",
        text: "Clerks in your county know whether the SOS office answered the phone last week. That is the ranking I care about.",
      },
      {
        label: "Authorship pivot",
        text: "Writing law and running the office clerks depend on are different jobs. I am asking for the administrator job.",
      },
    ],
    doNotSay: [
      "Trying to counter every line in the clip",
      "Heritage ranking debate without clerk pivot",
      "Attacking Pakko's party status",
      "Skipping the worksheet and jumping to rebuttal",
    ],
    claimsGate: [
      "No Heritage or ranking statistics on stage unless claims-verified.",
      "Forum quotes — verify timestamp before broadcast use.",
      "No fraud counts or opponent motive claims.",
    ],
    keyTakeaways: [
      "Three Hammer tells named on paper before trap lanes.",
      "One Pakko respect line — spoken once.",
      "Slow down when Hammer speeds up.",
    ],
    practiceSteps: [
      "Worksheet complete with three Hammer tells.",
      "One ranking pivot on video under 30 seconds.",
      "Forum lab links opened from election-plan only.",
    ],
    relatedLinks: [
      { href: EP_FORUM_TRANSCRIPT_LAB_HREF, label: "Forum transcript lab" },
      { href: epDebatePrepLaneHref("lane-d2-film-deep"), label: "Film tell extraction lane" },
      { href: epDebatePrepDayMicroLessonHref(DAY2_ID, "d2-watch-hammer"), label: "Hammer watch list micro-lesson" },
      { href: epOpponentBioHref("kim-hammer"), label: "Hammer bio (after clips)" },
      { href: epDebatePrepDayBlockHref(DAY2_ID, "b2-trap1"), label: "Next block · trap lanes" },
    ],
  },
  "b2-trap1": {
    blockId: "b2-trap1",
    studyGuideTitle: "Trap lanes 1–2 — authorship & 2021 package · 75-minute study",
    professorLead:
      "Hammer will stay in authorship lane all night if you let him. Trap lanes 1–2 rehearse bait → pivot in speak-order until boring — not until perfect.",
    overview:
      "Open trap lane 1 (experience = SOS ready) and trap lane 2 (2021 vs 2025 pivot). Staff reads bait lines; Kelly delivers 60-second rebuttals in first, second, and third speak positions. Log one stiff line for tomorrow.",
    phases: [
      {
        minutesLabel: "0–10 min",
        title: "Open lanes & read bait",
        steps: [
          "Open trap lane 1 · authorship in election-plan war room.",
          "Read bait line aloud once: 'I wrote the bills that secured Arkansas elections.'",
          "Open trap lane 2 · 2021 package continuity.",
          "Read setup question: how is 2025 different for county clerks?",
          "Do not memorize act numbers tonight — clerk frame only.",
        ],
      },
      {
        minutesLabel: "10–30 min",
        title: "Lane 1 — authorship pivot reps",
        steps: [
          "Staff reads bait — Kelly 60s response, speak position 1 (set unity frame).",
          "Repeat speak position 2 — agree + author/administrator add-on.",
          "Repeat speak position 3 — memorable clerk close.",
          "Three rounds minimum — pivot until boring.",
          "If jaw tightens, one 4-4-6 cycle before speaking.",
        ],
      },
      {
        minutesLabel: "30–50 min",
        title: "Lane 2 — 2021 package continuity",
        steps: [
          "Staff bait: 'My 2025 bills are a fresh start on election security.'",
          "Kelly pivot: six bills in 2021 shifted burden — what changed for clerks?",
          "Bridge unfunded mandate frame — integrity yes, implementation dollars matter.",
          "Three speak-order rounds — do not list seven bill numbers in one answer.",
          "Optional: link to legislative intel 2021 package (election-plan).",
        ],
      },
      {
        minutesLabel: "50–65 min",
        title: "Combined bait drill",
        steps: [
          "Staff alternates lane 1 and lane 2 bait lines without warning.",
          "Kelly 45s each — same frames, natural wording.",
          "Staff checks: stopped at agree? attacked motive? cited unverified acts?",
          "Log one line that still feels stiff — fix on Day 3, not tonight.",
        ],
      },
      {
        minutesLabel: "65–75 min",
        title: "Success gate",
        steps: [
          "Deliver authorship pivot under 90 seconds without notes.",
          "Name one 2021 continuity line without act-number tennis.",
          "Mark block complete when lane 1 feels automatic.",
        ],
      },
    ],
    deepSections: [
      {
        title: "Trap lane 1 — experience equals SOS ready",
        body:
          "Hammer collapses legislative tenure into SOS competence. Kelly agrees where true, then separates author from administrator — clerks implement, SOS serves.",
      },
      {
        title: "Trap lane 2 — 2021 vs 2025",
        body:
          "2025 petition bills continue 2021 architecture — not a fresh start. Kelly honors security, asks for county implementation ledger and training dollars.",
      },
      {
        title: "When to apply lane 1",
        body:
          "Experience/readiness questions. Hammer cites authorship or Heritage rankings. Moderator asks why Kelly over a senator. Any 'what qualifies you' beat after film tells land.",
      },
      {
        title: "When NOT to apply",
        body:
          "Direct factual correction on act text (claims gate). Culture-war bait designed for biography defense. Moments where clerk service story is stronger than contrast frame.",
      },
      {
        title: "Common mistakes",
        body:
          "Stopping at 'I agree with Senator Hammer.' Listing bill numbers without verification. Attacking motives instead of contrasting jobs. Matching Hammer's pace when bait accelerates.",
      },
      {
        title: "Stack with film block",
        body:
          "Each trap bait should map to a tell from the film worksheet — ranking cite → clerk phone line; authorship cite → administrator pivot. Rehearse tell → pivot chain before combined bait drill.",
      },
    ],
    opponentForecast: [
      {
        title: "Hammer bait patterns",
        body: "Bill lists · ranking cites · 'I stood with clerks' without county detail · 2020 relitigation.",
      },
    ],
    sampleLines: [
      {
        label: "Authorship pivot",
        text: "Senator Hammer helped write policy — the SOS job is making sure seventy-five counties can execute it.",
      },
      {
        label: "2021 continuity",
        text: "Integrity without implementation is an unfunded mandate on our clerks.",
      },
    ],
    doNotSay: [
      "I agree with Senator Hammer. (full stop)",
      "Seven bill numbers in one answer",
      "2020 stolen election framing",
      "Motive attacks before clerk pivot",
    ],
    claimsGate: [
      "Act numbers on stage only when claims-verified.",
      "No Heritage ranking stats without sourced data.",
    ],
    keyTakeaways: [
      "Trap lane 1 under 90 seconds is Day 2 minimum success check.",
      "Pivot until boring — not until perfect.",
      "Speak-order all three positions rehearsed once.",
    ],
    practiceSteps: [
      "Lane 1 three rounds complete.",
      "Lane 2 continuity line spoken aloud.",
      "One stiff line logged for staff.",
    ],
    relatedLinks: [
      { href: epTrapLaneHref("experience-equals-sos-ready"), label: "Trap lane 1" },
      { href: epTrapLaneHref("2021-vs-2025-pivot"), label: "Trap lane 2" },
      { href: epDebatePrepLaneHref("lane-d2-trap-deep"), label: "Trap speak-order lab" },
      { href: epDebatePrepDayDrillHref(DAY2_ID, "d2-authorship-pivot"), label: "Authorship pivot drill" },
      { href: epDebatePrepDayDrillHref(DAY2_ID, "d2-ranking-pivot"), label: "Ranking pivot drill" },
      { href: epDebatePrepDayRehearsalHref(DAY2_ID, "rehearse-hammer-bait-60s"), label: "Hammer bait rehearsal" },
    ],
  },
  "b2-packo": {
    blockId: "b2-packo",
    studyGuideTitle: "Pakko contrast scaffold — 45-minute study",
    professorLead:
      "Three-way geometry: Kelly center. Pakko is not the operational target — acknowledge reform where true, then pivot to who administers Monday morning in seventy-five counties.",
    overview:
      "Read Pakko bio respect line and contrast gate. Practice one sentence acknowledging Pakko without ceding SOS credibility. 30-second acknowledge + pivot phrase is tonight's goal.",
    phases: [
      {
        minutesLabel: "0–10 min",
        title: "Read respect scaffold",
        steps: [
          "Open Pakko opponent bio — Day 2 first-read phase.",
          "Read professor lead + three-way section once.",
          "Write: one sentence that respects Pakko's reform concern.",
          "Write: one sentence that names SOS administrator job.",
        ],
      },
      {
        minutesLabel: "10–25 min",
        title: "Contrast gate — no double front",
        steps: [
          "Practice: agree on clerk burden without endorsing anti-participation framing.",
          "Practice: 'Dr. Pakko raises fair questions — my job is administering elections in all 75 counties.'",
          "Do not attack libertarian label or ballot access — contrast on execution.",
          "Speak acknowledge line once — pause — speak pivot line.",
        ],
      },
      {
        minutesLabel: "25–40 min",
        title: "30-second pivot reps",
        steps: [
          "Staff reads Pakko libertarian overreach line from example.",
          "Kelly delivers 30s acknowledge + pivot without notes.",
          "Repeat three times — boring automaticity.",
          "If Hammer bait follows in sim, bridge to clerks — do not fight both.",
        ],
      },
      {
        minutesLabel: "40–45 min",
        title: "Lock-in",
        steps: [
          "One clean take on video.",
          "Mark block complete when respect + pivot fits in 30 seconds.",
        ],
      },
    ],
    deepSections: [
      {
        title: "Three-way respect",
        body:
          "Pakko plays measured reform economist. Kelly agrees where true, differentiates administrator vs commentator. Never make the debate Kelly vs Pakko — Hammer is authorship lane.",
      },
      {
        title: "Contrast gate",
        body:
          "Agree on clerk burden without endorsing anti-participation framing. Reform yes — SOS execution is the differentiator.",
      },
      {
        title: "30-second architecture",
        body:
          "Sentence one: respect. Sentence two: pivot to administrator job. Stop. Do not add a third attack line.",
      },
      {
        title: "When to apply",
        body:
          "Pakko speaks on reform or clerk burden. Hammer and Pakko pile-on in the same segment. Moderator asks Kelly to respond to third-candidate framing. Never initiate Pakko contrast unprompted.",
      },
      {
        title: "Common mistakes",
        body:
          "Making the debate Kelly vs Pakko. Patronizing reform voters. Endorsing anti-participation framing to sound tough. Looking at Pakko when Hammer bait follows — bridge to clerks instead.",
      },
    ],
    psychology: [
      {
        title: "Respect without patronizing",
        body:
          "Libertarian-leaning viewers punish condescension. Acknowledge Pakko's reform concern as legitimate, then name who runs Monday morning.",
      },
    ],
    opponentForecast: [
      {
        title: "After Kelly agrees",
        body: "Hammer may tag-team with authorship — bridge to author vs administrator, not Pakko attack.",
      },
      {
        title: "Pakko overreach line",
        body: "Government failed clerks framing — agree on burden, pivot to SOS service desk and published rules.",
      },
    ],
    sampleLines: [
      {
        label: "Acknowledge + pivot",
        text: "I agree bureaucracy can burden clerks — that is why I want unfunded mandates on the record, not more Capitol mandates without funding.",
      },
      {
        label: "Respect line",
        text: "Dr. Pakko raises fair reform questions — the Secretary of State administers the process in daylight for every county.",
      },
      {
        label: "Clerk burden agree",
        text: "Clerks carry unfunded mandates — I want those on the record, not more Capitol credit without implementation.",
      },
    ],
    doNotSay: [
      "Attacking third-candidate status",
      "Anti-democracy or anti-petition framing",
      "Ignoring Pakko because Hammer is louder",
    ],
    claimsGate: ["No unsourced Pakko quotes — verify in forum lab before stage use."],
    keyTakeaways: [
      "One Pakko pivot rehearsed aloud — Day 2 evening check item.",
      "Respect without ceding SOS.",
      "Look at moderator when both opponents talk.",
    ],
    practiceSteps: [
      "Respect line spoken once.",
      "30s pivot on video.",
      "Bio Day 2 phase skim complete.",
    ],
    relatedLinks: [
      { href: epOpponentBioHref("michael-packo"), label: "Pakko bio" },
      { href: epDebatePrepDayExampleHref(DAY2_ID, "ex2-pakko-split"), label: "Pakko split example" },
      { href: epDebatePrepDayMicroLessonHref(DAY2_ID, "d2-three-way"), label: "Three-way geometry" },
      { href: epDebatePrepDayRehearsalHref(DAY2_ID, "rehearse-pakko-pivot-30s"), label: "Pakko pivot rehearsal" },
      { href: EP_OPPOSITION_RESEARCH_HREF, label: "Opposition research" },
    ],
  },
  "b2-coaching": {
    blockId: "b2-coaching",
    studyGuideTitle: "Stage presence & three-way geometry · 45-minute study",
    professorLead:
      "Command Mode includes where your eyes go. When you are not speaking, moderator-centered scanning signals respect and control — furtive glances read as uncertainty.",
    overview:
      "Read three-way geometry micro-lesson; practice eye-line when Hammer and Pakko speak; one pile-on stillness drill with staff. Never look rattled when double-teamed.",
    phases: [
      {
        minutesLabel: "0–10 min",
        title: "Read geometry lesson",
        steps: [
          "Open micro-lesson d2-three-way — read once.",
          "Open psychology section · anxious audience if helpful.",
          "Note rule: opponent speaks → Kelly looks at moderator.",
          "Note pile-on rule: still hands, one bridge sentence.",
        ],
      },
      {
        minutesLabel: "10–25 min",
        title: "Eye-line reps",
        steps: [
          "Stand — staff plays Hammer speaking; Kelly eyes on moderator.",
          "Staff plays Pakko — same eye line.",
          "Staff plays both talking — Kelly still, one breath, bridge to clerks.",
          "Record 30s — check for darting eyes or defensive posture.",
        ],
      },
      {
        minutesLabel: "25–40 min",
        title: "Pile-on drill",
        steps: [
          "Staff double-team bait — one line from each opponent.",
          "Kelly one bridge sentence only — then stop.",
          "Repeat three times — shorter each time.",
          "Optional: open geometry stretch lane for checklist.",
        ],
      },
      {
        minutesLabel: "40–45 min",
        title: "Success gate",
        steps: [
          "One pile-on bridge without fidgeting on video.",
          "Mark block complete.",
        ],
      },
    ],
    deepSections: [
      {
        title: "Moderator-centered scan",
        body:
          "Audience reads furtive eye movement as uncertainty. When challenged, look at the moderator — not the floor, not your notes.",
      },
      {
        title: "Pile-on bridge patterns",
        body:
          "When Hammer and Pakko both speak, still hands + one bridge sentence to clerks beats a two-front counterattack every time.",
      },
      {
        title: "When to stop talking",
        body:
          "After the bridge sentence, stop. Over-talking under pile-on reads as panic. Let the moderator retake the floor.",
      },
      {
        title: "Eye-line drill checklist",
        body:
          "Opponent speaks → eyes to moderator. You speak → start on moderator, finish on audience. Never track bait with your head.",
      },
      {
        title: "Stack with trap lanes",
        body:
          "After authorship pivot reps, run pile-on drill with same clerk bridge line — body protocol from Day 1 posture block carries the pivot. Still hands under double-team is the visual proof of command.",
      },
    ],
    psychology: [
      {
        title: "Anxious audience read",
        body:
          "Integrity-anxious voters watch body language before policy. Stillness under pile-on is a trust signal.",
      },
      {
        title: "Three-way geometry preview",
        body:
          "Kelly center: engage Hammer on job fit, acknowledge Pakko briefly, never fight two fronts in one answer.",
      },
    ],
    opponentForecast: [
      {
        title: "Double-team moment",
        body: "Hammer authorship bait + Pakko reform agree in same segment — bridge to clerks, do not split attention.",
      },
      {
        title: "Moderator interruption",
        body: "If cut off mid-bridge, thank moderator, deliver one clerk line, stop — do not restart the fight.",
      },
    ],
    sampleLines: [
      {
        label: "Pile-on bridge",
        text: "Clerks in seventy-five counties need an administrator who answers the phone — that is the job I am asking for.",
      },
      {
        label: "Stillness cue",
        text: "I hear both of you — let me answer the clerk service question first.",
      },
      {
        label: "Moderator return",
        text: "Thank you, moderator — one sentence for county clerks.",
      },
    ],
    claimsGate: ["No unsourced opponent quotes in pile-on drills — verify forum timestamps before broadcast use."],
    doNotSay: ["Reactive head-shaking while opponents speak", "Looking down when double-teamed"],
    keyTakeaways: [
      "Eyes to moderator when not speaking.",
      "One pile-on bridge sentence rehearsed.",
      "Still hands under pressure.",
    ],
    practiceSteps: [
      "Micro-lesson read.",
      "One pile-on drill on video.",
    ],
    relatedLinks: [
      { href: EP_DEBATE_PREP_TUTOR_HREF, label: "Debate prep tutor" },
      { href: epDebatePrepLaneHref("lane-d2-geometry-stretch"), label: "Eye-line geometry lane" },
      { href: epDebatePrepPsychologySectionHref("when-audience-anxious"), label: "Psychology · anxious audience" },
      { href: epDebatePrepDayMicroLessonHref(DAY2_ID, "d2-three-way"), label: "Three-way geometry micro-lesson" },
      { href: epDebatePrepDayConceptHref(DAY2_ID, "three-way-geometry"), label: "Three-way geometry concept" },
    ],
  },
  "b2-opponent-bios": {
    blockId: "b2-opponent-bios",
    studyGuideTitle: "Opponent biographies — first full read · 60-minute study",
    professorLead:
      "Nothing on stage should surprise you after tonight. Thirty minutes on Hammer, thirty on Pakko — priorities, psychology, tells, memory lines. Recognition beats memorized attacks.",
    overview:
      "Follow Day 2 bio reading cadence: Hammer first (after film tells land), then Pakko. Speak one memory line from each opponent in debate voice. Link film worksheet tells to bio forecast sections.",
    phases: [
      {
        minutesLabel: "0–5 min",
        title: "Cadence & setup",
        steps: [
          "Confirm film worksheet is complete — bios land better after clips.",
          "Open opponent bios hub — Day 2 first-read callout.",
          "Set 30-minute timer for Hammer segment.",
        ],
      },
      {
        minutesLabel: "5–35 min",
        title: "Hammer bio — 30-minute read",
        steps: [
          "Read professor lead + biography — speak read-aloud debate line once.",
          "Study priorities and psychology — match three tells from film worksheet.",
          "Skim dossier sections — star ACCA tactics and 2021 package.",
          "Memorize author vs administrator contrast — not motive attack.",
          "Success check: name three tells + one agree-add pivot without notes.",
        ],
      },
      {
        minutesLabel: "35–40 min",
        title: "Hammer memory line",
        steps: [
          "Read memory lines section — pick one debate version.",
          "Speak aloud twice — natural, not theatrical.",
        ],
      },
      {
        minutesLabel: "40–55 min",
        title: "Pakko bio — 30-minute read",
        steps: [
          "Read Pakko Day 2 first-read phase steps.",
          "Focus: respect line, reform lane, three-way geometry.",
          "Skim dossier — note one agree-add opportunity.",
          "Speak one Pakko memory line in debate voice.",
        ],
      },
      {
        minutesLabel: "55–60 min",
        title: "Lock-in",
        steps: [
          "Alternate: staff says opponent name — Kelly one-sentence frame each.",
          "Mark block complete when both bios read and one memory line each spoken.",
        ],
      },
    ],
    deepSections: [
      {
        title: "Day 2 reading cadence",
        body:
          "First read after film room and trap lanes. Day 4 re-read after forum lab. Day 6 lock-in before simulation — memory lines only.",
      },
      {
        title: "Hammer bio reading protocol",
        body:
          "Read professor lead and biography aloud once. Match three film tells to psychology section. Star ACCA tactics and 2021 package — do not memorize attack lines. End with one agree-add pivot in debate voice.",
      },
      {
        title: "Pakko bio reading protocol",
        body:
          "Read respect scaffold and reform lane. Note one agree-add on clerk burden. Speak one memory line — under 15 seconds. Link three-way geometry micro-lesson before closing the block.",
      },
      {
        title: "Memory line rules",
        body:
          "Memory lines are frames, not zingers. Speak twice in natural debate voice — not theatrical. If a line needs act numbers, claims-gate it before stage use.",
      },
      {
        title: "Common mistakes",
        body:
          "Reading bios before film worksheet. Skipping Pakko segment. Memorizing dossier attacks instead of command pivots. Quoting opponent lines without forum timestamp verification.",
      },
    ],
    opponentForecast: [
      {
        title: "Hammer bio focus",
        body: "Authorship · ranking · mandate · 2021 six-bill continuity · ACCA panel tactics.",
      },
      {
        title: "Pakko bio focus",
        body: "Reform economist · both-parties-failed · clerk burden agree-add · third-candidate respect.",
      },
    ],
    doNotSay: [
      "Skipping Pakko because Hammer is louder",
      "Memorizing attack lines instead of command pivots",
      "Reading bios before film worksheet (order matters)",
    ],
    claimsGate: [
      "Bio dossier claims — run through claims gate before broadcast.",
      "No new opponent allegations without sourced evidence.",
    ],
    keyTakeaways: [
      "Both bios read end-to-end.",
      "Three Hammer tells + one Pakko pivot — evening check.",
      "Memory lines spoken in debate voice.",
    ],
    practiceSteps: [
      "Hammer 30-min read complete.",
      "Pakko 30-min read complete.",
      "One memory line each aloud.",
    ],
    relatedLinks: [
      { href: epOpponentBioHref("kim-hammer"), label: "Kim Hammer · first read" },
      { href: epOpponentBioHref("michael-packo"), label: "Michael Pakko · first read" },
      { href: EP_OPPONENT_BIOS_HREF, label: "Opponent bios hub" },
      { href: epDebatePrepDayBlockHref(DAY2_ID, "b2-film"), label: "Film worksheet block" },
      { href: EP_OPPOSITION_RESEARCH_HREF, label: "Opposition research" },
    ],
  },
};

export function getDay2BlockStudy(blockId: string): Day1BlockStudyDeep | undefined {
  return DAY2_BLOCK_STUDY[blockId];
}
