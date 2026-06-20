/**
 * Day 3 — full study guides for each block (Election Plan drill-down).
 */
import {
  EP_EXECUTIVE_BOOK_HREF,
  EP_OPPOSITION_RESEARCH_HREF,
  epDebatePrepBriefingHref,
  epDebatePrepDayBlockHref,
  epDebatePrepDayConceptHref,
  epDebatePrepDayDrillHref,
  epDebatePrepDayExampleHref,
  epDebatePrepDayMicroLessonHref,
  epDebatePrepDayRehearsalHref,
  epHammerBillHref,
  epOpponentBioHref,
  epOppositionResearchModuleHref,
  epTrapLaneHref,
} from "@/lib/election-plan/debate-prep-links";
import { epDebatePrepLaneHref } from "@/lib/election-plan/debate-prep-route-map";
import { DAY3_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import type { Day1BlockStudyDeep } from "@/lib/election-plan/debatePrepDay1BlockStudy";

export const DAY3_BLOCK_STUDY: Record<string, Day1BlockStudyDeep> = {
  "b3-manual": {
    blockId: "b3-manual",
    studyGuideTitle: "Kelly SOS manual — framework + three-job stack · 75-minute study",
    professorLead:
      "Tonight you overwhelm with competence, not volume. Pick three Kelly jobs from the executive book — nonprofit leadership, direct democracy organizing, clerk partnership — and repeat them until the list feels boring. Stop at three beats; slower and specific beats fast and abstract.",
    overview:
      "Map three pillars from the executive book to debate answers — one notecard per pillar. Pick three operational Kelly jobs (who you served, what broke, how you fixed it). Rehearse a 90-second qualification stack with zero bill numbers. Your manual is the opponent's missing operator guide.",
    phases: [
      {
        minutesLabel: "0–15 min",
        title: "Executive book setup — three pillars",
        steps: [
          "Open executive book hub — framework chapter first (election-plan, no admin login).",
          "Skim platform implementation and path-to-victory chapters — note clerk-facing beats only.",
          "Write three pillar headers on notecards: SOS desk · clerk partnership · civic organizing.",
          "Set a 75-minute timer — block ends when timer ends, not when every chapter feels read.",
        ],
      },
      {
        minutesLabel: "15–30 min",
        title: "Pick three Kelly jobs",
        steps: [
          "From executive book + platform: list five candidate jobs — nonprofit admin, ballot initiative organizing, clerk coalition work, etc.",
          "Star three that make a county clerk nod — not the most impressive on paper, the most operational.",
          "One sentence per job: who depended on you · what broke · how you fixed it.",
          "Cross out bill-authorship or Capitol credit lines — administrator frame only tonight.",
        ],
      },
      {
        minutesLabel: "30–45 min",
        title: "Notecard drill — one pillar per card",
        steps: [
          "Notecard 1: nonprofit / budget / people under deadline.",
          "Notecard 2: direct democracy organizing — statewide with clerks in the room.",
          "Notecard 3: SOS platform implementation — what clerks need on the record Monday morning.",
          "Read each card once aloud — under 20 seconds per card.",
          "Optional: open qualification stack lane for signal checklist.",
        ],
      },
      {
        minutesLabel: "45–60 min",
        title: "90s qualification stack — no bill numbers",
        steps: [
          "Stack three beats in order — slow voice, still hands.",
          "Staff interrupt test: if you reach for a fourth job, stop and smile.",
          "Bridge line ready: 'Writing law and running the office clerks depend on are different jobs.'",
          "Three full 90s reps on timer — mark complete when boring.",
        ],
      },
      {
        minutesLabel: "60–75 min",
        title: "Success gate & claims check",
        steps: [
          "Recite three superiority beats without notes.",
          "Claims-check each org title or stat on the notecards — red-line anything NEEDS_REVIEW.",
          "Journal: which beat felt most natural vs forced?",
          "Mark block complete when three beats are verified and 90s stack is under time.",
        ],
      },
    ],
    deepSections: [
      {
        title: "Three beats only",
        body:
          "Working memory holds about three items under stress. Hammer overwhelms with bill count; Kelly overwhelms with three operational stories told slowly. Urge to add a fourth job = mark for staff research, not stage.",
      },
      {
        title: "Executive book → debate bridge",
        body:
          "Framework chapters are not a résumé dump. Each pillar maps to one clerk-relevant sentence: who you served, what broke, how you fixed it. Platform implementation beats abstract policy.",
      },
      {
        title: "Administrator vs author",
        body:
          "Hammer lists act numbers as proof he can run SOS. Kelly stacks organizations managed, budgets met, people who got answers under deadline — especially for county clerks on night three of early voting.",
      },
      {
        title: "When to apply qualification stack",
        body:
          "'Why are you qualified?' · Hammer bill-list bait · experience-equals-SOS-ready trap · any moment Kelly needs calm command without ranking debate.",
      },
      {
        title: "Common mistakes",
        body:
          "Listing every job on stage. Unverified org stats or titles. Matching Hammer's pace when he sprays bill numbers. Stopping at two beats because the third feels redundant — repetition is the point.",
      },
    ],
    psychology: [
      {
        title: "Self-efficacy through mastery",
        body:
          "List what you have done until the list feels boring — that is when it will survive adrenaline on stage. Boring repetition is the success signal, not novelty.",
      },
    ],
    opponentForecast: [
      {
        title: "Hammer bill-list spray",
        body:
          "Expect act numbers and authorship cites when qualifications come up. Your pivot: administrator on night three of early voting — not sponsor reading act numbers.",
      },
    ],
    sampleLines: [
      {
        label: "90s stack opener",
        text: "I have managed organizations, budgets, and people under deadline — and I have organized statewide with clerks in the room, not just legislators in the Capitol.",
      },
      {
        label: "Administrator pivot",
        text: "Writing law and running the office clerks depend on are different jobs — I am asking for the administrator job.",
      },
    ],
    doNotSay: [
      "Bill numbers unless claims-verified",
      "Fourth job story because you have more material",
      "Ranking or Heritage scorecard debate",
      "Résumé dump without clerk-relevant beat per job",
    ],
    claimsGate: [
      "No unsourced job titles, org stats, or budget figures on stage.",
      "Executive book quotes — verify in claims ledger before broadcast.",
      "Three superiority beats must each pass green before rehearsal lock.",
    ],
    keyTakeaways: [
      "Three Kelly jobs on notecards — clerk-relevant beat each.",
      "90s stack under timer with zero bill numbers.",
      "Repeat until boring — that is mastery.",
    ],
    practiceSteps: [
      "Three notecards complete.",
      "One 90s qualification stack on video.",
      "Claims-check each fact used.",
    ],
    relatedLinks: [
      { href: EP_EXECUTIVE_BOOK_HREF, label: "Executive book hub" },
      { href: epDebatePrepLaneHref("lane-d3-stack"), label: "Qualification stack lane" },
      { href: epDebatePrepDayRehearsalHref(DAY3_ID, "rehearse-qualified-90s"), label: "90s qualification rehearsal" },
      { href: epDebatePrepBriefingHref("author-vs-administrator"), label: "Author vs administrator briefing" },
      { href: epDebatePrepDayBlockHref(DAY3_ID, "b3-claims"), label: "Next block · claims gate" },
    ],
  },
  "b3-opposition": {
    blockId: "b3-opposition",
    studyGuideTitle: "Opposition strategy — offense sequence · 60-minute study",
    professorLead:
      "Offense tonight is contrast on job fit — not smear. Skim six offensive moves, pick two that feel natural in your voice, and rehearse 90 seconds each. Link Hammer enrolled sections for implementation contrast — clerks execute, SOS serves.",
    overview:
      "Open opposition research hub — offense sequence and themes. Pick two contrast moves that feel like Kelly, not a staff-written attack. Rehearse each in 90 seconds. Run every line through claims gate before stage use. Forced offense reads fake; clerk-centered contrast reads command.",
    phases: [
      {
        minutesLabel: "0–15 min",
        title: "Skim six offensive moves",
        steps: [
          "Open opposition research hub — offense sequence section.",
          "Read six moves once — star two that feel natural, not personal.",
          "Write: contrast on job fit · not motive attack · for each starred move.",
          "Drop any move that targets biography instead of administrator competence.",
        ],
      },
      {
        minutesLabel: "15–30 min",
        title: "Pick two natural moves",
        steps: [
          "Move 1: author vs administrator — Hammer legislative history vs Kelly operational stack.",
          "Move 2: implementation gap — enrolled act text vs county clerk burden (research frame).",
          "Optional stretch: open offense sequence lane for full checklist.",
          "Speak one-line summary of each move aloud — under 15 seconds.",
        ],
      },
      {
        minutesLabel: "30–45 min",
        title: "90s rehearsal each — contrast not smear",
        steps: [
          "Staff reads neutral setup — Kelly delivers move 1 in 90s, timer on.",
          "Repeat move 1 three times — vary wording, same frame.",
          "Staff setup — Kelly delivers move 2 in 90s.",
          "Skim Hammer bill enrolled sections — one implementation contrast line only (no act-number tennis).",
          "Open ex3-hammer-admin example if claims gate is green.",
        ],
      },
      {
        minutesLabel: "45–60 min",
        title: "Claims gate & lock-in",
        steps: [
          "Run both offense lines through claims ledger — red-line NEEDS_REVIEW.",
          "Journal: which move felt natural vs forced?",
          "Mark block complete when two moves pass claims and one 90s rep each is clean.",
          "Do not stage personal smear lines — clerk-centered only.",
        ],
      },
    ],
    deepSections: [
      {
        title: "Offense = job-fit contrast",
        body:
          "Kelly's offensive moves pre-load contrast so she is not always defending. Contrast who administers Monday morning in seventy-five counties — not who wrote more acts in the Capitol.",
      },
      {
        title: "Hammer enrolled sections — implementation lens",
        body:
          "Enrolled act text shows what clerks must implement. Contrast sponsor credit with county execution burden — research frame unless claims-verified. Open legislative intel only for implementation detail, not bill-number spray.",
      },
      {
        title: "Natural vs forced offense",
        body:
          "If a move feels personal or theatrical, drop it. Clerks and skeptical administrators reward specific operational beats — not zingers. Pick two moves you would say to a clerk over coffee.",
      },
      {
        title: "Stack with qualification block",
        body:
          "Offense moves should reinforce the three-job stack from b3-manual — not introduce a fourth narrative. Author vs administrator bridges Hammer bill-list bait to Kelly administrator frame.",
      },
      {
        title: "Common mistakes",
        body:
          "Personal smear instead of job-fit contrast. Unverified act numbers in offense lines. Using six moves on stage instead of two rehearsed. Skipping claims gate because contrast feels obvious.",
      },
    ],
    opponentForecast: [
      {
        title: "Hammer response to offense",
        body:
          "May double down on bill list or ranking cite — bridge to administrator pivot, not bill tennis. May cite ACCA panel — pivot to clerk phone and grant ledger.",
      },
    ],
    sampleLines: [
      {
        label: "Author vs administrator offense",
        text: "Senator Hammer helped write policy — the SOS job is making sure seventy-five counties can execute it.",
      },
      {
        label: "Implementation contrast",
        text: "Clerks implement what the Capitol passes — I want an SOS who publishes the grant ledger county clerks can actually use.",
      },
    ],
    doNotSay: [
      "Motive attacks before clerk pivot",
      "Unverified act numbers in offense lines",
      "Six offensive moves on stage in one night",
      "Personal smear framed as contrast",
    ],
    claimsGate: [
      "Every offense move must pass claims ledger before stage use.",
      "Act numbers and enrolled-text quotes — verify before broadcast.",
      "No unsourced opponent allegations — contrast on job fit only.",
    ],
    keyTakeaways: [
      "Two natural offense moves rehearsed 90s each.",
      "Implementation contrast linked to enrolled sections — research frame.",
      "Claims gate green on every line planned for stage.",
    ],
    practiceSteps: [
      "Two offense moves selected and rehearsed.",
      "One implementation contrast line from legislative intel skim.",
      "Claims-check both moves.",
    ],
    relatedLinks: [
      { href: EP_OPPOSITION_RESEARCH_HREF, label: "Opposition research hub" },
      { href: epDebatePrepLaneHref("lane-d3-offense-stretch"), label: "Offense sequence lane" },
      { href: epHammerBillHref("SB486"), label: "Hammer bill · enrolled sections (verify)" },
      { href: epDebatePrepDayExampleHref(DAY3_ID, "ex3-hammer-admin"), label: "Hammer admin example" },
      { href: epOpponentBioHref("kim-hammer"), label: "Hammer bio" },
    ],
  },
  "b3-funding": {
    blockId: "b3-funding",
    studyGuideTitle: "Election funding + clerk mandates · 60-minute study",
    professorLead:
      "Clerks care about money — Hammer owns the bills that created burden. Tonight you ask for the ledger; you do not invent CVSGF or HAVA totals. Research-question framing signals competence without claims risk.",
    overview:
      "Skim election funding traps in opposition research. Memorize one clerk-funding research question. Rehearse a 60-second answer in research frame only — no invented dollar amounts. Unfunded mandate burden is Kelly's policy lane that clerks feel in their bones.",
    phases: [
      {
        minutesLabel: "0–15 min",
        title: "Election funding traps skim",
        steps: [
          "Open opposition research — election funding intelligence section.",
          "Read trap lane · election funding — note clerk mandate burden themes.",
          "Write three research questions — not answers with dollar amounts.",
          "Optional: open funding deep lane for CVSGF/HAVA checklist.",
        ],
      },
      {
        minutesLabel: "15–30 min",
        title: "Research question frame",
        steps: [
          "Pick one question: where did pass-through funds land county-by-county?",
          "Pick one question: which mandates came with implementation dollars?",
          "Speak each question once — under 20 seconds, clerk-centered language.",
          "Red-line any urge to cite CVSGF or HAVA totals from memory.",
        ],
      },
      {
        minutesLabel: "30–45 min",
        title: "Clerk mandate burden frame",
        steps: [
          "Bridge: clerks should not guess whether a mandate came with dollars.",
          "Commitment line: publish a grant ledger as Secretary of State.",
          "Contrast: Capitol credit vs county execution — no partisan attack.",
          "Link to b3-manual clerk partnership beat — one sentence.",
        ],
      },
      {
        minutesLabel: "45–60 min",
        title: "60s rehearsal & claims gate",
        steps: [
          "Rehearse clerk funding answer — timer 60 seconds, research frame only.",
          "Staff interrupt: if Kelly cites a dollar amount, stop and reset.",
          "Three clean reps — mark complete when boring.",
          "Open claims ledger — verify any funding stat before stage use.",
        ],
      },
    ],
    deepSections: [
      {
        title: "Research question frame",
        body:
          "Questions signal competence without claims risk. 'I have been researching how election funding flows to counties' beats inventing a CVSGF total. Ask for the ledger — do not fabricate.",
      },
      {
        title: "Clerk mandate burden",
        body:
          "County clerks implement what the Capitol passes. Kelly honors security, asks where implementation dollars landed — especially for mandates Hammer-sponsored. Clerk-centered, not smear.",
      },
      {
        title: "CVSGF / HAVA — claims discipline",
        body:
          "Federal pass-through and state grant programs are claims-gated. Research frame and ledger commitment are safe tonight. Dollar amounts on stage only when green in claims ledger.",
      },
      {
        title: "When to apply funding frame",
        body:
          "Clerk funding questions · unfunded mandate bait · Hammer 'I funded elections' claims · moderator asks about county costs. Pivot from bill list to grant ledger research.",
      },
      {
        title: "Common mistakes",
        body:
          "Inventing CVSGF or HAVA totals from memory. Partisan attack instead of clerk service. Debating Hammer bill list without research question. Skipping 60s rehearsal because funding feels abstract.",
      },
    ],
    psychology: [
      {
        title: "Carol Whitfield · county clerk viewer",
        body:
          "Clerks reward a candidate who names their grant question without Capitol credit. Research frame + ledger commitment reads as administrator competence.",
      },
    ],
    opponentForecast: [
      {
        title: "Hammer funding bait",
        body:
          "May cite bills that 'funded' elections without county-by-county accounting. Kelly asks where pass-through landed — research frame, not dollar tennis.",
      },
    ],
    sampleLines: [
      {
        label: "Research frame",
        text: "I have been researching how election funding flows to counties, and it is hard for the public to find county-by-county accounting.",
      },
      {
        label: "Ledger commitment",
        text: "Clerks should not have to guess whether a mandate came with dollars — I will publish a grant ledger as Secretary of State.",
      },
    ],
    doNotSay: [
      "Invented CVSGF, HAVA, or county dollar amounts",
      "Unverified grant totals from forum or opponent quotes",
      "Partisan attack on Hammer funding motives",
      "Seven bill numbers in one funding answer",
    ],
    claimsGate: [
      "No invented dollar amounts — research question frame only unless claims-verified.",
      "CVSGF / HAVA / federal pass-through totals — green in claims ledger before stage.",
      "County-specific grant claims need verification — generic clerk frame OK.",
    ],
    keyTakeaways: [
      "One clerk funding research question memorized.",
      "60s answer under timer — zero unsourced dollar amounts.",
      "Grant ledger commitment spoken once aloud.",
    ],
    practiceSteps: [
      "Election funding traps skim complete.",
      "One 60s clerk funding rehearsal on video.",
      "Claims-check any stat referenced.",
    ],
    relatedLinks: [
      { href: EP_OPPOSITION_RESEARCH_HREF, label: "Election funding intelligence" },
      { href: epTrapLaneHref("election-funding"), label: "Trap lane · election funding" },
      { href: epDebatePrepLaneHref("lane-d3-funding-deep"), label: "Funding research lane" },
      { href: epDebatePrepDayRehearsalHref(DAY3_ID, "rehearse-clerk-funding-60s"), label: "60s clerk funding rehearsal" },
      { href: epDebatePrepDayBlockHref(DAY3_ID, "b3-claims"), label: "Next block · claims gate" },
    ],
  },
  "b3-claims": {
    blockId: "b3-claims",
    studyGuideTitle: "Claims gate — verify superiority lines · 45-minute study",
    professorLead:
      "Command Mode never improvises unverified numbers. Mark every superiority stat green or red — red line means do not stage. Lock three verified superiority points for tomorrow's rehearsal and every debate answer tonight.",
    overview:
      "Open claims ledger module. Mark every stat you plan to use in Day 3 blocks green or red. Red-line anything NEEDS_REVIEW — do not stage. Lock three green superiority points for memory recitation. Evening success check: three points verified, one offense move natural, zero red lines in rehearsal.",
    phases: [
      {
        minutesLabel: "0–11 min",
        title: "Open claims ledger",
        steps: [
          "Open claims ledger module in election-plan opposition research.",
          "Filter or skim superiority-relevant categories — org stats, funding, opponent quotes.",
          "Read claims gate rules aloud once — red line = do not stage.",
          "List every fact used in b3-manual, b3-opposition, b3-funding notecards.",
        ],
      },
      {
        minutesLabel: "11–22 min",
        title: "Mark green / red",
        steps: [
          "Green: verified, sourced, safe for stage tonight.",
          "Red: NEEDS_REVIEW, unsourced, or forum quote without timestamp.",
          "Cross out red lines on notecards — replace with research frame if needed.",
          "No improvising around red lines — drop the stat or fix with staff.",
        ],
      },
      {
        minutesLabel: "22–33 min",
        title: "Lock three superiority points",
        steps: [
          "Pick three green superiority beats — one per notecard from manual block.",
          "Recite all three from memory — no notes, under 60 seconds total.",
          "Staff checks: any bill number? any dollar amount? any unverified org stat?",
          "If any fail, swap beat or research-frame until all three pass.",
        ],
      },
      {
        minutesLabel: "33–45 min",
        title: "Evening success gate",
        steps: [
          "Answer aloud: three superiority points verified in claims?",
          "Answer: offense move felt natural?",
          "Answer: any stat red-lined?",
          "Mark Day 3 minimum complete if manual + claims blocks done — offense/funding can roll to morning if tired.",
        ],
      },
    ],
    deepSections: [
      {
        title: "Claims gate discipline",
        body:
          "Superiority stack fails if one invented stat lands on stage. Green/red marking is not bureaucracy — it is the difference between command and correction. Red line = do not stage, full stop.",
      },
      {
        title: "Three points for memory",
        body:
          "Day 3 success check: Kelly recites three verified superiority points from memory. Not five, not seven — three green beats locked tonight carry through Day 4 forum lab and Day 6 simulation.",
      },
      {
        title: "Superiority without arrogance",
        body:
          "Specific beats abstract. Tell who depended on you and what broke — voters read humility + competence, not bragging. Claims gate keeps specificity honest.",
      },
      {
        title: "Cross-block claims sweep",
        body:
          "Sweep facts from manual notecards, offense lines, and funding rehearsal. One red line in any block invalidates the whole stack until fixed or replaced with research frame.",
      },
      {
        title: "Common mistakes",
        body:
          "Staging NEEDS_REVIEW stats because they sound right. Adding a fourth superiority point without claims check. Skipping claims block because manual felt solid. Using forum quotes without timestamp verification.",
      },
    ],
    psychology: [
      {
        title: "Frank Donnelly · integrity without fear-mongering",
        body:
          "Integrity-anxious viewers punish invented stats harder than policy disagreement. Verified superiority beats build trust — unverified numbers destroy it in one sentence.",
      },
    ],
    doNotSay: [
      "NEEDS_REVIEW stats on stage",
      "Forum quotes without verified timestamp",
      "Fourth superiority beat without green check",
      "Improvised dollar amounts under pressure",
    ],
    claimsGate: [
      "Every superiority stat green in claims ledger before stage — red line = do not stage.",
      "Forum quotes and opponent lines — verify timestamp before broadcast.",
      "Org titles, budget figures, grant totals — claims-verified or research frame only.",
      "Three locked superiority points must each pass individual green check.",
    ],
    keyTakeaways: [
      "Three green superiority points locked for memory.",
      "Zero red lines in planned rehearsal lines.",
      "Claims ledger sweep complete for all Day 3 blocks.",
    ],
    practiceSteps: [
      "Claims ledger opened and facts marked green/red.",
      "Three superiority beats recited from memory.",
      "Evening success check answered aloud.",
    ],
    relatedLinks: [
      { href: epOppositionResearchModuleHref("claims-ledger"), label: "Claims ledger module" },
      { href: epDebatePrepDayConceptHref(DAY3_ID, "success-check-d3"), label: "Success check concept" },
      { href: epDebatePrepDayRehearsalHref(DAY3_ID, "rehearse-qualified-90s"), label: "90s qualification rehearsal" },
      { href: epDebatePrepDayMicroLessonHref(DAY3_ID, "d3-overwhelm"), label: "Overwhelm with competence micro-lesson" },
      { href: epDebatePrepDayBlockHref(DAY3_ID, "b3-manual"), label: "Manual block · three-job stack" },
    ],
  },
};

export function getDay3BlockStudy(blockId: string): Day1BlockStudyDeep | undefined {
  return DAY3_BLOCK_STUDY[blockId];
}
