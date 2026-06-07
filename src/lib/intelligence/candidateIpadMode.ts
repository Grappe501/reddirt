/**
 * Candidate iPad 11" (A16) — intelligence UI profile.
 * Portrait ~820 CSS px; optimize touch, bottom nav, safe areas, readable type.
 * Phase 15 P7 — bottom nav uses five CCE sections via phase15P7IpadPolish.
 */

import { listIpadBottomNavTabs } from "@/lib/intelligence/v4/phase15P7IpadPolish";

export const CANDIDATE_IPAD_PROFILE = {
  label: 'iPad 11" (candidate)',
  maxContentWidthPx: 820,
  minTouchTargetPx: 48,
  bottomNavHeightPx: 64,
  safeAreaBottom: "env(safe-area-inset-bottom, 0px)",
  recommendedOrientation: "portrait-primary",
} as const;

/** Enable via Netlify/env on candidate device builds */
export function isCandidateIpadMode(): boolean {
  return process.env.NEXT_PUBLIC_CANDIDATE_IPAD_MODE === "true";
}

export const CANDIDATE_IPAD_DEPLOY_HINT =
  "Set NEXT_PUBLIC_CANDIDATE_IPAD_MODE=true with NEXT_PUBLIC_INTELLIGENCE_NAV_PROFILE=CANDIDATE for Kelly stage-side deploy.";

/** Phase 15 P7 — five CCE section tabs (Home · Rehearse · Philosophy · Opposition · Safety). */
export const CANDIDATE_IPAD_PRIMARY_NAV = listIpadBottomNavTabs("CANDIDATE").map((tab) => ({
  href: tab.primaryHref,
  label: tab.label,
  shortLabel: tab.shortLabel,
  sectionId: tab.sectionId,
}));

/** Legacy overflow links — section sheets are primary; keep for deep staff-adjacent routes. */
export const CANDIDATE_IPAD_MORE_LINKS = [
  { href: "/admin/intelligence/supreme-workbench", label: "Supreme workbench" },
  { href: "/admin/intelligence/opposition-strategy", label: "Opposition strategy" },
  { href: "/admin/intelligence/debate-briefings", label: "Philosophy briefings" },
  { href: "/admin/intelligence/debate-depth", label: "Plain-language depth" },
  { href: "/admin/intelligence/film-room", label: "Film room" },
  { href: "/admin/intelligence/trap-lanes", label: "Trap lanes (full drill-down)" },
  { href: "/admin/intelligence/sos-debate-questions", label: "Expected SOS questions" },
  { href: "/admin/intelligence/debate-prep/psychology-manual", label: "Psychology manual" },
  { href: "/admin/intelligence/debate-command", label: "Debate command" },
  { href: "/admin/intelligence/candidate-dossiers", label: "All candidate dossiers" },
  { href: "/admin/intelligence/opponents/dossiers/kim-hammer", label: "Hammer dossier" },
  { href: "/admin/intelligence/opponents/michael-packo", label: "Pakko command center" },
  { href: "/admin/intelligence/opponents/dossiers/michael-packo", label: "Pakko dossier" },
  { href: "/admin/intelligence/county-clerk-week/acca-summer-conference", label: "ACCA panel prep" },
  { href: "/admin/intelligence/county-clerk-week", label: "Clerk week path" },
  { href: "/admin/intelligence/agent-tooling", label: "Agent tooling (prep runs)" },
  { href: "/admin/intelligence/kim-hammer/debate-ai-workbench", label: "AI workbench (staff)" },
  { href: "/admin/intelligence/kim-hammer/debate-profile", label: "Hammer debate profile" },
  { href: "/admin/intelligence/kim-hammer/themes", label: "Election record themes" },
  { href: "/admin/intelligence/kim-hammer/timeline", label: "Legislative timeline" },
  { href: "/admin/intelligence/kim-hammer/integrity-foundation-2021", label: "2021 integrity package" },
  { href: "/admin/intelligence/kim-hammer/intelligence-gaps", label: "Intelligence gaps" },
  { href: "/admin/intelligence/kim-hammer/evidence-command", label: "Evidence command" },
  { href: "/admin/intelligence/kim-hammer/contrast-vs-kelly", label: "Contrast vs Kelly" },
  { href: "/admin/intelligence/scenario-simulation", label: "Scenarios" },
  { href: "/admin/intelligence/opponents", label: "Opponents" },
  { href: "/admin/intelligence/kim-hammer", label: "Hammer record map" },
  { href: "/admin/intelligence/election-funding", label: "Election funding" },
  { href: "/admin/intelligence/election-equipment-vvsg", label: "VVSG 2.0" },
  { href: "/admin/intelligence/build-progress", label: "Build progress" },
  { href: "/admin/intelligence/action-queue", label: "Action queue" },
] as const;

/** iPad-friendly copilot tools — deterministic, governed */
export const CANDIDATE_IPAD_COPILOT_QUICK_TOOLS = [
  {
    toolId: "debate-question-generator",
    label: "Debate questions",
    description: "Internal questions from bills + evidence status",
  },
  {
    toolId: "what-not-to-say-detector",
    label: "Do not say",
    description: "Blocked narratives for tonight",
  },
  {
    toolId: "trap-question-detector",
    label: "Trap warnings",
    description: "Risky moderator paths",
  },
  {
    toolId: "answer-builder-30-60-90",
    label: "30/60/90 answers",
    description: "Timed answer skeleton (verify claims)",
  },
  {
    toolId: "rebuttal-builder",
    label: "Rebuttal draft",
    description: "Internal rebuttal blocks — review required",
  },
] as const;
