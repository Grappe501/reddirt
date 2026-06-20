/**
 * Phase 15 P0 — Five-section candidate command navigation.
 */
import { isCountyClerkPrimaryAudience } from "@/lib/intelligence/v4/debateAudienceMode";
import {
  CANDIDATE_COMMAND_HOME_HREF,
  isBuilderInfraHref,
  PHASE15_P0_MAX_LINKS_PER_SECTION,
  PHASE15_P0_MAX_SECTIONS,
} from "@/lib/intelligence/v4/phase15CandidateCommandDepth";
import { resolveIntelligenceNavProfileClient } from "@/lib/intelligence/v4/roleBasedNavProfile";
import { SEARCH_AI_PREP_HUB_HREF } from "@/lib/intelligence/intelligenceAiPrepV4Client";
import { DEBATE_PREP_TUTOR_HUB_HREF } from "@/lib/intelligence/v4/debatePrepTutorPackageClient";

export type CandidateCommandNavLink = {
  href: string;
  label: string;
  description?: string;
};

export type CandidateCommandNavSection = {
  id: string;
  label: string;
  summary: string;
  links: CandidateCommandNavLink[];
};

function section(
  id: string,
  label: string,
  summary: string,
  links: CandidateCommandNavLink[],
  maxLinks: number = PHASE15_P0_MAX_LINKS_PER_SECTION,
): CandidateCommandNavSection {
  return { id, label, summary, links: links.slice(0, maxLinks) };
}

function buildKellySections(): CandidateCommandNavSection[] {
  return [
    section("home", "Home", "Tonight's briefing, readiness, and first moves.", [
      {
        href: "/admin/intelligence/debate-week-intensive",
        label: "Debate week intensive",
        description: "Command Mode 7-day course — start here for SOS debate prep.",
      },
      {
        href: "/admin/intelligence/top-tier-prep",
        label: "Top-tier prep",
        description: "Promoted briefings, depth guides, and psychology — start here tonight.",
      },
      {
        href: "/admin/intelligence/forum-transcript-lab",
        label: "Forum transcript lab",
        description: "Upload forum video · AI transcript · capitalize playbook.",
      },
      {
        href: CANDIDATE_COMMAND_HOME_HREF,
        label: "Command home",
        description: "Readiness score, safe lines, blocked lines, and today's focus.",
      },
      {
        href: "/admin/intelligence/sre-closure",
        label: "SRE closure",
        description: "Nine P0–P8 checkpoints — Stage Rehearsal Engine exit gate.",
      },
      {
        href: "/admin/intelligence/live-event",
        label: "Live event",
        description: "ACCA Jun 11 countdown — day-of shortest stage-safe run-of-show.",
      },
    ], 6),
    section("rehearse", "Rehearse", "Stage prep — scripts, drills, and coaching.", [
      {
        href: DEBATE_PREP_TUTOR_HUB_HREF,
        label: "AI debate prep tutor",
        description: "5–30 min coached sessions — trap pivots, SOS speak-order, practice critique. Start here when time is short.",
      },
      {
        href: "/admin/intelligence/rehearsal-history",
        label: "Rehearsal history",
        description: "Continue last drill — session memory and staff reset.",
      },
      {
        href: "/admin/intelligence/rehearsal",
        label: "Session launcher",
        description: "Pick tonight's encounter — timed run-of-show into trap lanes, SOS, and claims.",
      },
      {
        href: "/admin/intelligence/encounters",
        label: "Encounter scenarios",
        description: "ACCA panel, three-way debate, clerk 1:1, purchase walkthrough — primary route binds.",
      },
      {
        href: "/admin/intelligence/drill-queue",
        label: "Drill queue",
        description: "One card at a time — SOS speak-order and trap pivots with stage-safe gates.",
      },
      {
        href: "/admin/intelligence/session-debrief",
        label: "Session debrief",
        description: "Pre-stage checklist and post-session capture — staff follow-ups to action queue.",
      },
      {
        href: "/admin/intelligence/ipad-drill-player",
        label: "iPad drill player",
        description: "Full-screen stepper — Exit · Prev · Next · Timer when rehearsing side-stage.",
      },
    ], 7),
    section("philosophy", "Philosophy", "How to handle attacks and stay on message.", [
      {
        href: SEARCH_AI_PREP_HUB_HREF,
        label: "Search & AI prep",
        description: "Smart search v4 + 12 governed AI prep tools — Ctrl+K anywhere.",
      },
      {
        href: "/admin/intelligence/kelly-prep-week",
        label: "Kelly prep week",
        description: "Seven-day orchestrated path — one day at a time, in order.",
      },
      {
        href: "/admin/intelligence/debate-briefings",
        label: "Philosophy briefings",
        description: "Eight handling methods — agree-but-contrast, pile-on survival, rebuttal architecture.",
      },
      {
        href: "/admin/intelligence/debate-depth",
        label: "Plain-language depth",
        description: "Survival guides when stuck, under attack, or facing culture-war bait.",
      },
      {
        href: "/admin/intelligence/debate-prep/psychology-manual",
        label: "Psychology manual",
        description: "Stage psychology, three-way dynamics, ACCA panel atmosphere.",
      },
    ]),
    section("opposition", "Opposition", "Know Hammer and Pakko — contrast without smear.", [
      {
        href: "/admin/intelligence/opponents",
        label: "Opponents hub",
        description: "Hammer production dossier + Pakko scaffold with contrast gates.",
      },
      {
        href: "/admin/intelligence/candidate-dossiers",
        label: "Candidate dossiers",
        description: "Kelly alignment profile plus opponent briefing books.",
      },
      {
        href: "/admin/intelligence/opponents/michael-packo",
        label: "Pakko command",
        description: "Libertarian contrast scaffold — quote ledger and diligence links.",
      },
      {
        href: "/admin/intelligence/election-funding",
        label: "Election funding",
        description: "CVSGF + HAVA evidence for clerk-room vocabulary.",
      },
    ]),
    section("safety", "Safety", "Red lines and reference before any public line.", [
      {
        href: "/admin/intelligence/claims",
        label: "Claims ledger",
        description: "VERIFIED vs NEEDS_REVIEW — gate every broadcast line.",
      },
      {
        href: "/admin/intelligence/stage-safe-filter",
        label: "Stage-safe filter",
        description: "What Kelly can rehearse on candidate deploy — gated lines show staff-verify fallback.",
      },
      {
        href: "/admin/intelligence/field-book",
        label: "The Field Book",
        description: "Campaign canon — claims firewall, operator guides, cheat sheets.",
      },
      {
        href: "/admin/intelligence/election-equipment-vvsg",
        label: "VVSG 2.0",
        description: "Equipment modernization vocabulary for clerk conversations.",
      },
      {
        href: "/admin/intelligence/ipad-polish",
        label: "iPad polish",
        description: "Five CCE bottom tabs — touch-safe section sheets for stage-side deploy.",
      },
    ]),
  ];
}

function buildClerkWeekSections(): CandidateCommandNavSection[] {
  const kelly = buildKellySections();
  const home = kelly[0]!;
  return [
    {
      ...home,
      links: [
        {
          href: CANDIDATE_COMMAND_HOME_HREF,
          label: "Command home",
          description: "Clerk-week orientation with 7-day path and readiness.",
        },
        {
          href: "/admin/intelligence/county-clerk-week",
          label: "7-day clerk path",
          description: "Daily readings, trap setup, and live-event card.",
        },
        {
          href: "/admin/intelligence/county-clerk-week/acca-summer-conference",
          label: "ACCA panel prep",
          description: "Jun 11 Mountain View panel — moderated Q&A prep.",
        },
        {
          href: "/admin/intelligence/election-funding",
          label: "Election funding",
          description: "CVSGF + HAVA statutory evidence for clerk rooms.",
        },
        {
          href: "/admin/intelligence/claims",
          label: "Verify claims",
          description: "Gate every clerk-room line before you speak.",
        },
      ],
    },
    ...kelly.slice(1),
  ];
}

const STAFF_OPERATIONS_SECTION: CandidateCommandNavSection = {
  id: "operations",
  label: "Operations",
  summary: "Staff research, builder tracks, and full operator surfaces — not for stage without review.",
  links: [
    {
      href: "/admin/intelligence/staff-backstage",
      label: "Staff backstage",
      description: "Route guard inventory — builder and operations surfaces STAFF-only.",
    },
    {
      href: "/admin/intelligence/rehearsal-coach",
      label: "Rehearsal coach",
      description: "Assign tonight's scenario and pin must-run drills for Kelly.",
    },
    {
      href: "/admin/intelligence/supreme-workbench",
      label: "Supreme workbench",
      description: "Full operator dashboard with build gaps and module nav.",
    },
    {
      href: "/admin/intelligence/morning-brief",
      label: "Morning brief",
      description: "Daily staff digest and action queue sync.",
    },
    {
      href: "/admin/intelligence/build-progress",
      label: "Build progress",
      description: "Master intelligence stack tracker and phase exit gates.",
    },
    {
      href: "/admin/intelligence/strategy-philosophy-hub",
      label: "Strategy & philosophy",
      description: "Full strategy inventory and Phase 10 crosswalk.",
    },
    {
      href: "/admin/intelligence/command-center",
      label: "Command center",
      description: "Cross-lane staff orientation dashboard.",
    },
  ],
};

export function buildCandidateCommandNavSections(
  profileOverride?: "CANDIDATE" | "STAFF" | "CLERK_WEEK",
): CandidateCommandNavSection[] {
  const profile = profileOverride ?? resolveIntelligenceNavProfileClient(isCountyClerkPrimaryAudience());
  const clerkWeek = profile === "CLERK_WEEK" || isCountyClerkPrimaryAudience();
  const base = clerkWeek ? buildClerkWeekSections() : buildKellySections();

  if (profile === "STAFF") {
    return [...base.slice(0, PHASE15_P0_MAX_SECTIONS), STAFF_OPERATIONS_SECTION];
  }

  return base.slice(0, PHASE15_P0_MAX_SECTIONS);
}

export function flattenCandidateCommandNavLinks(
  sections: CandidateCommandNavSection[] = buildCandidateCommandNavSections(),
): CandidateCommandNavLink[] {
  const seen = new Set<string>();
  const out: CandidateCommandNavLink[] = [];
  for (const sec of sections) {
    for (const link of sec.links) {
      if (seen.has(link.href)) continue;
      seen.add(link.href);
      out.push(link);
    }
  }
  return out;
}

export function countCandidateCommandNavLinks(
  sections: CandidateCommandNavSection[] = buildCandidateCommandNavSections("CANDIDATE"),
): number {
  return flattenCandidateCommandNavLinks(sections).length;
}

export function candidateNavHasBuilderInfra(
  sections: CandidateCommandNavSection[] = buildCandidateCommandNavSections("CANDIDATE"),
): boolean {
  return flattenCandidateCommandNavLinks(sections).some((l) => isBuilderInfraHref(l.href));
}

export function shouldUseCandidateCommandSectionNav(
  profileOverride?: "CANDIDATE" | "STAFF" | "CLERK_WEEK",
): boolean {
  const profile = profileOverride ?? resolveIntelligenceNavProfileClient(isCountyClerkPrimaryAudience());
  return profile !== "STAFF";
}
