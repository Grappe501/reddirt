/**
 * Day 8 — full study guides for crash course sections (Pass 2 · three SOS domains).
 */
import {
  epDebatePrepDayBlockHref,
  epDebatePrepDayConceptHref,
  epDebatePrepDayHref,
  epDebatePrepDayRehearsalHref,
} from "@/lib/election-plan/debate-prep-links";
import {
  DAY8_ARKANSAS_PEOPLE_FRAME,
  DAY8_AUDIBLE_CARD,
  DAY8_CLAIMS_GATE,
  DAY8_DOMAIN_COVERAGE_CHECK,
  DAY8_PM_EXECUTION_NOTE,
  DAY8_WEEK_BALANCE_CORRECTION,
} from "@/lib/election-plan/debate-prep-day8-crash-copy";
import {
  DAY8_SOS_DOMAIN_CARDS,
  DAY8_SOS_THREE_DOMAINS_FRAME,
} from "@/lib/election-plan/debate-prep-day8-sos-three-domains";
import { DAY8_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import { buildDay8CrashCourseSurface } from "@/lib/election-plan/load-day8-crash-course-surface";
import type { Day1BlockStudyDeep } from "@/lib/election-plan/debatePrepDay1BlockStudy";

const claimsGateLines = [...DAY8_CLAIMS_GATE];
const surface = () => buildDay8CrashCourseSurface();

export const DAY8_BLOCK_STUDY: Record<string, Day1BlockStudyDeep> = {
  "s8-orient": {
    blockId: "s8-orient",
    studyGuideTitle: "§0 · Start here · 10-minute orient",
    professorLead: DAY8_AUDIBLE_CARD,
    overview: `${DAY8_ARKANSAS_PEOPLE_FRAME} ${DAY8_SOS_THREE_DOMAINS_FRAME}`,
    phases: [
      {
        minutesLabel: "0–4 min",
        title: "Audible + three-domain frame",
        steps: [
          "Read audible card aloud — you are behind; this course is the whole week.",
          `Read three-domain frame: ${DAY8_SOS_DOMAIN_CARDS.map((d) => d.shortLabel).join(" · ")}.`,
          DAY8_WEEK_BALANCE_CORRECTION,
          "Choose full (~3h) or minimum (~90m) path.",
        ],
      },
      {
        minutesLabel: "4–8 min",
        title: "Domain coverage checklist",
        steps: [
          ...DAY8_DOMAIN_COVERAGE_CHECK.map((q) => `Evening check preview: ${q}`),
          "Name three things you will NOT do today (new stats, opponent smears, clerk-only opening).",
        ],
      },
      {
        minutesLabel: "8–10 min",
        title: "Sign-off → pre-debate prep",
        steps: [
          "Staff confirms Day 7 lock sheet is loaded.",
          "Tap Continue — next section is pre-debate prep.",
        ],
      },
    ],
    deepSections: [
      { title: "Why three domains today", body: DAY8_WEEK_BALANCE_CORRECTION },
      { title: "Audience", body: DAY8_ARKANSAS_PEOPLE_FRAME },
    ],
    keyTakeaways: [
      "Can name elections, business services, and Capitol management as the three SOS jobs.",
      "Committed to one line per domain before PM travel.",
    ],
    practiceSteps: [
      "Read three-domain frame aloud.",
      "Complete phase steps in order.",
    ],
    claimsGate: claimsGateLines,
    relatedLinks: [
      { href: epDebatePrepDayConceptHref(DAY8_ID, "sos-three-domains-d8"), label: "Three SOS domains concept" },
      { href: epDebatePrepDayHref(DAY8_ID), label: "Day 8 overview" },
    ],
  },
  "s8-pre-debate": {
    blockId: "s8-pre-debate",
    studyGuideTitle: "§1 · Pre-debate prep · 15-minute ritual",
    professorLead: "Lock what exists — three if-X-then-Y cards and domain lock sheet preview.",
    overview:
      "Preview lock sheet with one line per SOS domain. Three implementation-intention cards. Hydrate — no new ingestion.",
    phases: [
      {
        minutesLabel: "0–5 min",
        title: "Lock sheet · three domains",
        steps: [
          `Review ${surface().lockSheetDomainRows.length} domain rows on lock sheet preview.`,
          "Elections line — claims-green from Day 4/7 only.",
          "Business services line — Day 3 manual / platform template only.",
          "Capitol management line — petitions/records template only.",
        ],
      },
      {
        minutesLabel: "5–10 min",
        title: "If-X-then-Y cards",
        steps: [
          "If Hammer says 'I wrote the law' → administrator pivot (author vs administrator).",
          "If moderator asks business services → Robert K. picture · Main Street filing answer.",
          "If pile-on on trust → service desk for all three domains, rise to tone.",
        ],
      },
      {
        minutesLabel: "10–15 min",
        title: "Physical readiness",
        steps: [
          "Hydrate · voice check · no new content.",
          "Staff handles logistics PM — Kelly saves voice for stage.",
        ],
      },
    ],
    deepSections: [{ title: "Claims gate", body: claimsGateLines.join(" · ") }],
    keyTakeaways: ["Lock sheet lists all three domains.", "Three if-X-then-Y cards written."],
    practiceSteps: ["Preview lock sheet rows.", "Write three if-X-then-Y cards."],
    claimsGate: claimsGateLines,
    relatedLinks: [
      { href: epDebatePrepDayBlockHref(DAY8_ID, "s8-lock-sheet"), label: "Lock sheet section" },
      { href: epDebatePrepDayBlockHref("day-7-refine-and-steal-show", "b7-claims-final"), label: "Day 7 claims final" },
    ],
  },
  "s8-command": {
    blockId: "s8-command",
    studyGuideTitle: "§2 · Command presence · 20-minute body protocol",
    professorLead: "Body before words — Day 1 compressed. Calm reads as administrator for all three domains.",
    overview: "4-4-6 breath ×3, scan protocol, listen face while staff reads Hammer bait.",
    phases: [
      {
        minutesLabel: "0–8 min",
        title: "Breath + mic pause",
        steps: [
          "Stand — 4-4-6 breath ×3 — micro-pause before first word.",
          "Mirror check: feet planted, shoulders down, hands still until gesture serves.",
          "Repeat without notes.",
        ],
      },
      {
        minutesLabel: "8–14 min",
        title: "Scan protocol",
        steps: [
          "Scan order: moderator → opponents → camera → persona chip (Marcia T. default).",
          "Practice scan while staff reads Pakko line — eyes on speaker, not notes.",
        ],
      },
      {
        minutesLabel: "14–20 min",
        title: "Listen face",
        steps: [
          "Staff reads Hammer authorship bait — Kelly still body, no reactive face.",
          "Log: did scan include camera? (yes / repeat once)",
        ],
      },
    ],
    deepSections: [{ title: "Day 1 import", body: "Command Mode is body protocol — not a persona." }],
    keyTakeaways: ["Two breath cycles without notes.", "Scan names four points in order."],
    practiceSteps: ["Complete breath and scan drills.", "Log listen-face rep."],
    claimsGate: claimsGateLines,
    relatedLinks: [
      { href: epDebatePrepDayBlockHref("day-1-command-foundation", "b1-posture"), label: "Day 1 posture block" },
      { href: epDebatePrepDayBlockHref(DAY8_ID, "s8-persona-wall"), label: "Persona wall next" },
    ],
  },
  "s8-persona-wall": {
    blockId: "s8-persona-wall",
    studyGuideTitle: "§3 · Persona wall · 15-minute audience map",
    professorLead: "Map each SOS domain to a face in the room — not only Carol W.",
    overview:
      "Default Marcia T. for opening/closing; assign Robert K. to business services and Diane P. to Capitol management.",
    phases: [
      {
        minutesLabel: "0–6 min",
        title: "Domain → persona map",
        steps: DAY8_SOS_DOMAIN_CARDS.map(
          (d) => `${d.shortLabel}: picture ${d.personaSpeakTo} — ${d.voterQuestion.slice(0, 80)}…`,
        ),
      },
      {
        minutesLabel: "6–12 min",
        title: "Translation drills · voter language",
        steps: [
          "Elections: clerk sentence → why your ballot matters (Rev. James H. listening).",
          "Business services: filing backlog → Berryville shop owner time lost (Robert K.).",
          "Capitol management: Friday rule drop → petition signer confusion (Diane P.).",
        ],
      },
      {
        minutesLabel: "12–15 min",
        title: "Primary speak-to lock",
        steps: [
          "Set primary speak-to: Marcia T. for opening beat C.",
          "Secondary chips ready for SOS domain answers.",
        ],
      },
    ],
    deepSections: [{ title: "Forum vs debate", body: DAY8_ARKANSAS_PEOPLE_FRAME }],
    keyTakeaways: ["Three domain translations spoken aloud.", "Primary persona set for opening."],
    practiceSteps: ["Map domains to personas.", "Three translation drills aloud."],
    claimsGate: claimsGateLines,
    relatedLinks: [
      { href: epDebatePrepDayConceptHref(DAY8_ID, "sos-three-domains-d8"), label: "Three domains concept" },
      { href: "/election-plan/debate-prep/voter-audiences", label: "Voter audiences hub" },
    ],
  },
  "s8-opening-workshop": {
    blockId: "s8-opening-workshop",
    studyGuideTitle: "§4 · Opening workshop · 30-minute construct + deliver",
    professorLead: "90s opening — Beat B must name all three SOS domains in one breath each.",
    overview: surface().bookends.opening.script.slice(0, 120) + "…",
    phases: [
      {
        minutesLabel: "0–8 min",
        title: "Build notecard · four beats",
        steps: [
          "Beat A (0–20s): Administrator — SOS runs elections, business services, Capitol management.",
          ...DAY8_SOS_DOMAIN_CARDS.map(
            (d, i) =>
              `Beat B${i + 1} (${20 + i * 20}–${40 + i * 20}s): ${d.shortLabel} — ${d.kellyProofTemplate.slice(0, 100)}…`,
          ),
          "Beat C (80–90s): Arkansas promise — picture Marcia T.",
        ],
      },
      {
        minutesLabel: "8–18 min",
        title: "Rep 1 · timed 90s",
        steps: [
          "Timer 90s hard stop — deliver cold.",
          "Log: which domain felt weakest? (elections / business / Capitol)",
        ],
      },
      {
        minutesLabel: "18–28 min",
        title: "Rep 2 · fix one beat",
        steps: [
          "Fix weakest domain beat only — do not rewrite whole script.",
          "Second timed 90s rep.",
          "Staff claims gate check — green only.",
        ],
      },
      {
        minutesLabel: "28–30 min",
        title: "Sign-off",
        steps: ["Answer: all three domains named in opening? (yes / one more rep on weak domain)"],
      },
    ],
    deepSections: surface().openingBeats.map((b) => ({
      title: b.label,
      body: `${b.objective} — ${b.templateHint}`,
    })),
    keyTakeaways: [
      "Opening under 90s with three domains named.",
      "No opponent names in opening.",
    ],
    practiceSteps: ["Build four-beat notecard.", "Two timed 90s reps."],
    claimsGate: claimsGateLines,
    relatedLinks: [
      { href: epDebatePrepDayRehearsalHref("day-1-command-foundation", "rehearse-opening-90s"), label: "Day 1 opening" },
      { href: epDebatePrepDayConceptHref(DAY8_ID, "opening-construction-d8"), label: "Opening construction" },
    ],
  },
  "s8-middle-game": {
    blockId: "s8-middle-game",
    studyGuideTitle: "§5 · Middle game · 45-minute traps + three-domain SOS",
    professorLead: "One timed SOS answer per domain — voter translation in last 20s of each.",
    overview: `Four when-X-say-Y reps + three SOS answers (${DAY8_SOS_DOMAIN_CARDS.map((d) => d.shortLabel).join(", ")}) + pile-on cold.`,
    phases: [
      {
        minutesLabel: "0–8 min",
        title: "Listen · opponent tells",
        steps: [
          "Silent scan — staff reads Hammer authorship + ranking tells.",
          "Staff reads Pakko libertarian line — Kelly listen face only.",
        ],
      },
      {
        minutesLabel: "8–20 min",
        title: "When-X-say-Y ×4",
        steps: [
          ...surface()
            .whenXSayYPairs.slice(0, 4)
            .map((p, i) => `Pair ${i + 1}: ${p.triggerLabel.slice(0, 60)}… → 60s Kelly line.`),
          "If fewer than four green pairs — use Day 5 sheet; no invented triggers.",
        ],
      },
      {
        minutesLabel: "20–38 min",
        title: "SOS sprint · one per domain",
        steps: DAY8_SOS_DOMAIN_CARDS.map(
          (d) =>
            `${d.shortLabel} (90s): ${d.moderatorTheme} — picture ${d.personaSpeakTo.split(" · ")[0]} — translate for voter in last 20s.`,
        ),
      },
      {
        minutesLabel: "38–45 min",
        title: "Pile-on cold",
        steps: [
          "Hammer + Pakko trust pile-on — bridge to service desk covering all three domains.",
          "Log: which domain was thinnest under timer?",
        ],
      },
    ],
    deepSections: DAY8_SOS_DOMAIN_CARDS.map((d) => ({
      title: d.label,
      body: d.answerSpine,
    })),
    keyTakeaways: DAY8_DOMAIN_COVERAGE_CHECK.map((c) => c.replace("?", " — logged")),
    practiceSteps: ["Four trap pairs.", "Three domain SOS answers.", "Pile-on pivot."],
    claimsGate: claimsGateLines,
    relatedLinks: [
      { href: epDebatePrepDayBlockHref("day-5-anticipate-and-capitalize", "b5-lab-review"), label: "Day 5 capitalize" },
      { href: epDebatePrepDayConceptHref(DAY8_ID, "middle-game-traps-d8"), label: "Middle game concept" },
    ],
  },
  "s8-closing-workshop": {
    blockId: "s8-closing-workshop",
    studyGuideTitle: "§6 · Closing workshop · 25-minute construct + deliver",
    professorLead: "Peak-end — closing beat 1 invokes service desk for all three domains, not clerk-only.",
    overview: "60s closing: service desk promise → Day 6 fix on weakest domain → quotable pause.",
    phases: [
      {
        minutesLabel: "0–8 min",
        title: "Build closing beats",
        steps: [
          "Beat 1: Elections + business filings + transparent Capitol rules — one calm sentence each.",
          "Beat 2: Import Day 6 debrief fix for weakest domain — one sentence only.",
          "Beat 3: Staff-cleared quotable — one breath pause before last word.",
        ],
      },
      {
        minutesLabel: "8–18 min",
        title: "Rep 1 · timed 60s",
        steps: ["Deliver cold — timer 60s.", "Hold silence 2s after last word."],
      },
      {
        minutesLabel: "18–25 min",
        title: "Rep 2 · peak-end gate",
        steps: [
          "Second timed rep — fix beat 1 if agree-only.",
          "Log: all three domains echoed in closing invoke? (yes / fix beat 1)",
        ],
      },
    ],
    deepSections: [
      { title: "Peak-end rule", body: "Editors pull opening calm and closing quotable — middle blurs on broadcast." },
    ],
    keyTakeaways: ["Closing ends on service desk promise, not agree-only.", "Two timed reps logged."],
    practiceSteps: ["Build three closing beats.", "Two timed 60s reps."],
    claimsGate: claimsGateLines,
    relatedLinks: [
      { href: epDebatePrepDayBlockHref("day-7-refine-and-steal-show", "b7-open-close"), label: "Day 7 bookends" },
      { href: epDebatePrepDayConceptHref(DAY8_ID, "closing-construction-d8"), label: "Closing construction" },
    ],
  },
  "s8-run-through": {
    blockId: "s8-run-through",
    studyGuideTitle: "§7 · Abbreviated run-through · 22-minute full arc",
    professorLead: `Full arc with ${surface().runSegmentCount} segments — three SOS questions must fire in sim.`,
    overview: surface()
      .runSegments.map((s) => s.label)
      .join(" → "),
    phases: [
      {
        minutesLabel: "0–18 min",
        title: "Speak-aloud arc",
        steps: surface().runSegments.map(
          (s) =>
            `${s.label} (${s.timedMinutes}m): ${s.kellyObjective.slice(0, 100)}${s.sosDomainId ? ` [${s.sosDomainId}]` : ""}…`,
        ),
      },
      {
        minutesLabel: "18–22 min",
        title: "Debrief micro-log",
        steps: [
          "Log one fix for post-debate debrief.",
          "Confirm: elections + business services + Capitol each spoke in SOS segment?",
        ],
      },
    ],
    deepSections: [{ title: "Segment count", body: `${surface().runSegmentCount} segments including 3 domain SOS prompts.` }],
    keyTakeaways: ["Full arc without stopping for research.", "Three-domain SOS coverage confirmed."],
    practiceSteps: ["Run full speak-aloud arc.", "Log one debrief fix."],
    claimsGate: claimsGateLines,
    relatedLinks: [
      { href: epDebatePrepDayRehearsalHref(DAY8_ID, "rehearse-crash-run-through"), label: "Run-through rehearsal script" },
      { href: epDebatePrepDayBlockHref("day-6-full-simulation", "b6-sim"), label: "Day 6 full sim" },
    ],
  },
  "s8-lock-sheet": {
    blockId: "s8-lock-sheet",
    studyGuideTitle: "§8 · Lock sheet · 8-minute export + PM handoff",
    professorLead: "Export green lines only — one row per domain plus bookends and top trap pairs.",
    overview: DAY8_PM_EXECUTION_NOTE,
    phases: [
      {
        minutesLabel: "0–4 min",
        title: "Export lock sheet",
        steps: [
          "Opening 90s beats (A + B1/B2/B3 + C) — claims-green.",
          "Three domain SOS lines + four trap pairs + closing 60s.",
          "Quotable line if staff-cleared.",
        ],
      },
      {
        minutesLabel: "4–8 min",
        title: "PM protocol + course complete",
        steps: [
          "Read PM handoff: travel → stage → debrief.",
          ...DAY8_DOMAIN_COVERAGE_CHECK.map((q) => `Confirm: ${q}`),
          "Return to Day 8 overview — course complete check.",
        ],
      },
    ],
    deepSections: [{ title: "PM execution", body: DAY8_PM_EXECUTION_NOTE }],
    keyTakeaways: ["Lock sheet exported.", "Three-domain coverage check answered yes."],
    practiceSteps: ["Export lock sheet.", "Confirm domain coverage checklist."],
    claimsGate: claimsGateLines,
    relatedLinks: [
      { href: epDebatePrepDayHref(DAY8_ID), label: "Course complete check" },
      { href: epDebatePrepDayConceptHref(DAY8_ID, "success-check-d8"), label: "Success check" },
    ],
  },
};

export function getDay8BlockStudy(blockId: string): Day1BlockStudyDeep | undefined {
  return DAY8_BLOCK_STUDY[blockId];
}

export function listDay8BlockStudyIds(): string[] {
  return Object.keys(DAY8_BLOCK_STUDY);
}
