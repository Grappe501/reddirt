export type PagePromptSet = {
  pathnamePattern: string;
  prompts: string[];
};

export const PAGE_AWARE_PROMPTS: PagePromptSet[] = [
  {
    pathnamePattern: "/admin/campaign-events/reimbursement",
    prompts: [
      "What is blocking this month from being finalized?",
      "Show missing mileage.",
      "Prepare April reimbursement memo.",
    ],
  },
  {
    pathnamePattern: "/admin/campaign-events/calendar-sync",
    prompts: [
      "Why is this calendar stale?",
      "What needs to happen before Google write?",
    ],
  },
  {
    pathnamePattern: "/admin/campaign-events/calendar-promotion",
    prompts: [
      "Which events are safe to promote?",
      "Why is this event blocked?",
    ],
  },
  {
    pathnamePattern: "/admin/candidate-dashboard",
    prompts: [
      "What do I need to approve today?",
      "Show my most urgent event decisions.",
    ],
  },
  {
    pathnamePattern: "/admin/campaign-manager-dashboard",
    prompts: [
      "What is the biggest campaign operations gap?",
      "What should I clear first?",
    ],
  },
  {
    pathnamePattern: "/admin/campaign-events/review",
    prompts: [
      "Clear travel approval queue for this month.",
      "What should I do next in month review?",
    ],
  },
  {
    pathnamePattern: "/admin/campaign-events/workbench",
    prompts: [
      "What intake conflicts need review?",
      "Open month readiness summary.",
    ],
  },
  {
    pathnamePattern: "/admin/ai-command-center",
    prompts: [
      "What should I do next?",
      "What is broken in campaign ops?",
    ],
  },
];

export function getPromptsForPath(pathname: string): string[] {
  for (const set of PAGE_AWARE_PROMPTS) {
    if (pathname.includes(set.pathnamePattern.replace("/admin", "")) || pathname.startsWith(set.pathnamePattern)) {
      return set.prompts;
    }
  }
  return ["What should I do next?", "What is blocking this month?", "Show pending approvals."];
}
