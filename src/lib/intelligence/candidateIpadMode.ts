/**
 * Candidate iPad 11" (A16) — intelligence UI profile.
 * Portrait ~820 CSS px; optimize touch, bottom nav, safe areas, readable type.
 */

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

export const CANDIDATE_IPAD_PRIMARY_NAV = [
  { href: "/admin/intelligence", label: "Home", shortLabel: "Home" },
  { href: "/admin/intelligence/kelly-debate-coaching", label: "Coaching", shortLabel: "Coach" },
  { href: "/admin/intelligence/kim-hammer/debate-prep", label: "Debate prep", shortLabel: "Prep" },
  { href: "/admin/intelligence/video-archive-room", label: "Record & video", shortLabel: "Record" },
  { href: "/admin/intelligence/claims", label: "Claims", shortLabel: "Claims" },
] as const;

export const CANDIDATE_IPAD_MORE_LINKS = [
  { href: "/admin/intelligence/trap-lanes", label: "Trap lanes (full drill-down)" },
  { href: "/admin/intelligence/debate-command", label: "Trap questions" },
  { href: "/admin/intelligence/county-clerk-week", label: "Clerk week path" },
  { href: "/admin/intelligence/kim-hammer/debate-ai-workbench", label: "AI workbench (staff)" },
  { href: "/admin/intelligence/scenario-simulation", label: "Scenarios" },
  { href: "/admin/intelligence/opponents", label: "Opponents" },
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
