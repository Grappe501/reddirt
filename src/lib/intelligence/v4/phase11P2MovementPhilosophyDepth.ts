/**
 * Phase 11 P2 — Movement philosophy document depth overlays.
 */
import {
  MOVEMENT_PHILOSOPHY_ENTRIES,
  MOVEMENT_PHILOSOPHY_HUB_HREF,
  movementPhilosophyDocHref,
} from "@/lib/philosophy/movement-philosophy-nav";

export type MovementPhilosophyDocOverlay = {
  pathKey: string;
  movementRole: string;
  debateApplication: string[];
  volunteerSystemImplications: string[];
  intelligenceLinks: Array<{ href: string; label: string }>;
  linkedPhilosophyBriefingIds: string[];
};

const HUB = "/admin/intelligence/strategy-philosophy-hub";
const ALIGNMENT = "/admin/intelligence/strategy-alignment";
const DEBATE_CMD = "/admin/intelligence/debate-command";
const KELLY = "/admin/intelligence/kelly-strategic-plan/framework";
const STAFF = "/admin/intelligence/staff-strategy-command";

function doc(
  pathKey: string,
  role: string,
  debate: string[],
  volunteer: string[],
  links: Array<{ href: string; label: string }>,
  briefings: string[] = [],
): MovementPhilosophyDocOverlay {
  return {
    pathKey,
    movementRole: role,
    debateApplication: debate,
    volunteerSystemImplications: volunteer,
    intelligenceLinks: [
      { href: HUB, label: "Strategy & philosophy hub" },
      { href: ALIGNMENT, label: "Strategy alignment" },
      { href: DEBATE_CMD, label: "Debate command" },
      { href: STAFF, label: "Staff strategy command" },
      ...links,
    ],
    linkedPhilosophyBriefingIds: briefings,
  };
}

const DOC_OVERLAYS: Record<string, MovementPhilosophyDocOverlay> = {
  README: doc(
    "README",
    "Orientation index — canonical public philosophy corpus before debate-week messaging or volunteer copy changes.",
    [
      "Staff should read vision + core-principles before drafting debate-safe contrast lines.",
      "Index links the four movement docs plus VOL-CORE-1 volunteer foundation — not a substitute for reading each.",
    ],
    [
      "Volunteer AI and onboarding copy must trace back to docs listed here — no orphan tone shifts.",
      "Cross-read volunteer-philosophy-foundation before changing nudge cadence or assignment language.",
    ],
    [
      { href: movementPhilosophyDocHref("core-principles"), label: "Core principles" },
      { href: movementPhilosophyDocHref("volunteer-philosophy-foundation"), label: "Volunteer foundation" },
    ],
  ),
  "vision-and-goals": doc(
    "vision-and-goals",
    "North star and time-horizon goals — anchors every debate answer in structure and participation, not rhetoric alone.",
    [
      "Use one-line summaries contextually — 'If the people can act, power has to listen' for direct-democracy questions.",
      "Short-term win framing must not collapse medium-term infrastructure-building story on stage.",
    ],
    [
      "Volunteer onboarding should echo block-by-block ownership — not candidate-as-hero funnel.",
      "Power-of-5 and relational lanes inherit long-term civic network goal from this doc.",
    ],
    [
      { href: KELLY, label: "Kelly theory of change" },
      { href: "/admin/intelligence/debate-briefings/direct-democracy-offense", label: "Direct democracy briefing" },
    ],
    ["direct-democracy-offense", "author-vs-administrator"],
  ),
  "core-principles": doc(
    "core-principles",
    "Movement architecture — pain → purpose → possibility; community-centered power; grassroots + technology loop.",
    [
      "Debate contrast: everyday Arkansans vs concentrated control — clarity without cynicism.",
      "Leadership development as strategy — cite precinct/county pipeline when Hammer attacks 'career politicians'.",
    ],
    [
      "VOL-CORE-1 authoritative tone source — engineering and AI must not paraphrase for edge.",
      "Radical accessibility commitments govern debate plain-language and volunteer copy readability.",
    ],
    [
      { href: movementPhilosophyDocHref("positioning-and-coalition"), label: "Positioning & coalition" },
      { href: "/admin/intelligence/debate-briefings/agree-but-never-only-agree", label: "Agree-but-never-only-agree" },
    ],
    ["agree-but-never-only-agree", "author-vs-administrator", "rebuttal-architecture"],
  ),
  "positioning-and-coalition": doc(
    "positioning-and-coalition",
    "Coalition guardrails and emotional anchor — restore what the party was supposed to be, not shrink the coalition.",
    [
      "Avoid headline-only 'fighting Democrats' framing on stage — use productive party-restoration frame.",
      "Homepage spine themes ('Arkansas wasn't built by the powerful') safe for opening contrast before policy specifics.",
    ],
    [
      "Coalition naming directions here are reference — do not auto-generate volunteer-facing party labels.",
      "Calm steady leadership tone from positioning doc governs crisis comms and AI coaching cadence.",
    ],
    [
      { href: "/admin/intelligence/kim-hammer/narrative-testing", label: "Narrative testing by category" },
      { href: "/admin/intelligence/strategy-alignment", label: "Strategy alignment" },
    ],
    ["integrity-without-nationalizing", "pile-on-survival"],
  ),
  "volunteer-philosophy-foundation": doc(
    "volunteer-philosophy-foundation",
    "VOL-CORE-1 — campaign culture translated into volunteer system behavior: trust, calm leadership, action over permission.",
    [
      "Debate prep is staff/candidate lane — but stage tone must match calm-steady-leadership belief from VOL-CORE-1.",
      "People-powered vs control contrast on stage aligns with trust-over-control system rule.",
    ],
    [
      "Default yes for safe organizing actions; approval gates only for high-risk surfaces (bulk send, PII export).",
      "AI suggests, does not command — invitational copy in volunteer nudges and debate coaching alike.",
      "Onboarding must feel empowering — first action small, immediate, trust-reinforcing.",
    ],
    [
      { href: "/admin/intelligence/campaign-system-manual/ANYONE_CAN_ONBOARD_CAMPAIGN_CULTURE_AND_PATHWAY_SYSTEM", label: "Onboarding culture manual" },
      { href: movementPhilosophyDocHref("core-principles"), label: "Core principles" },
    ],
    ["agree-but-never-only-agree", "presence-without-repetition"],
  ),
};

export function getMovementPhilosophyDocOverlay(pathKey: string): MovementPhilosophyDocOverlay {
  const key = pathKey.replace(/^\/+|\/+$/g, "") || "README";
  return (
    DOC_OVERLAYS[key] ??
    doc(
      key,
      "Movement philosophy document — cross-read with strategy-philosophy hub and debate briefings.",
      ["Align stage lines with core principles before external use."],
      ["Volunteer-facing copy must stay consistent with public philosophy corpus."],
      [{ href: MOVEMENT_PHILOSOPHY_HUB_HREF, label: "Philosophy hub" }],
    )
  );
}

export function movementPhilosophyDocMeetsPhase11P2Bar(overlay: MovementPhilosophyDocOverlay): boolean {
  return (
    overlay.movementRole.length >= 40 &&
    overlay.debateApplication.length >= 2 &&
    overlay.volunteerSystemImplications.length >= 2 &&
    overlay.intelligenceLinks.length >= 5
  );
}

export function countMovementPhilosophyDocsAtPhase11P2Bar(): { atBar: number; total: number } {
  let atBar = 0;
  for (const entry of MOVEMENT_PHILOSOPHY_ENTRIES) {
    const overlay = getMovementPhilosophyDocOverlay(entry.pathKey);
    if (movementPhilosophyDocMeetsPhase11P2Bar(overlay)) atBar++;
  }
  return { atBar, total: MOVEMENT_PHILOSOPHY_ENTRIES.length };
}

export const PHASE11_P2_MOVEMENT_PHILOSOPHY_DOC_TOTAL = MOVEMENT_PHILOSOPHY_ENTRIES.length;
