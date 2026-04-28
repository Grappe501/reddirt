/**
 * Public and beta-tester copy for Ask Kelly (invite-only beta feedback).
 * No internal readiness grades, no “AI” product naming (see campaign-system-manual).
 */

import type { AskKellyBetaCategory } from "@/lib/forms/ask-kelly-beta-types";

export const ASK_KELLY_BETA_INVITE_BANNER =
  "Invite-only beta. Your feedback goes to the candidate first—staff can help sort it, but Kelly makes the final call.";

export const ASK_KELLY_BETA_ONBOARDING = [
  "This site is built to look and feel like someone running for Secretary of State who gets systems, automation, modern civic infrastructure, and how government should work in this century.",
  "Most people only see the first few pages. That’s on purpose, and that’s fine.",
  "If you go deeper, it’s because you want to. Beta testers are being invited to look more closely than a normal voter would—and we’re glad you’re here.",
].join(" ");

export const ASK_KELLY_CATEGORY_LABELS: Record<AskKellyBetaCategory, string> = {
  website_issues_ease_of_use: "Website issues / ease of use / intuitiveness",
  volunteer_questions_onboarding: "Volunteer questions and onboarding",
  message_content_feedback: "Message / content feedback",
};

/** Layered when guided help / search cannot answer. */
export const ASK_KELLY_ASSISTANT_FALLBACK_LAYERS = {
  primary:
    "The command center couldn’t pull a live answer from the server—here’s where to go next: use the menus and links on the site, or write a structured note.",
  secondary:
    "Nothing changes publicly from this panel alone. Here’s what happens next: send feedback below if something needs eyes on it; Kelly reviews beta feedback, and staff can organize it—but the final publish path still follows the usual editor saves.",
  tertiary:
    "When the line is busy, treating unknowns honestly beats guessing. That restraint is deliberate.",
} as const;

export const ASK_KELLY_FEEDBACK_SUCCESS =
  "Thanks. Your note was received. Kelly reviews beta feedback; the campaign may follow up if needed—no promises on response time while we’re still building.";

export const ASK_KELLY_FEEDBACK_FORM_INTRO =
  "Use one category, say what you saw, and (if it helps) which page. Short is fine. Long is fine. Honest is best.";
