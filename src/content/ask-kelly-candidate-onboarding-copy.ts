/**
 * Kelly candidate onboarding — calm, human copy for /admin/ask-kelly.
 * (Not a product name; describes the person using the tools.)
 */

/** Command header — strong, campaign-serious (V2.2 polish). */
export const ASK_KELLY_ONBOARDING_COMMAND_CENTER_TAGLINE =
  "Your command center for learning the system, finding the right dashboard, and making updates safely.";

export const ASK_KELLY_ONBOARDING_WELCOME = {
  title: "Welcome — you’re in the right place",
  body: [
    "This space is here so you can learn the site tools at your own pace—before you change anything live.",
    "You can review feedback from the beta, update public page wording where you have the keys, see how the admin areas fit together, and look up where common tasks live.",
    "Nothing here is a test of you. It is a map, with a little room to breathe.",
  ] as const,
};

/** Shown near the read-aloud control (V2.2 hardening). */
export const ASK_KELLY_VOICE_ASSIST_ADMIN_NOTE =
  "Voice assist is optional. If it is unavailable, the dashboard still works normally.";

/** Plain text for welcome-section “Read this aloud” (TTS) — public onboarding intro only, no DB. */
export const ASK_KELLY_ONBOARDING_WELCOME_READ_ALOUD = [
  ASK_KELLY_ONBOARDING_COMMAND_CENTER_TAGLINE,
  ASK_KELLY_ONBOARDING_WELCOME.title,
  ...ASK_KELLY_ONBOARDING_WELCOME.body,
].join(" ");

export const ASK_KELLY_ONBOARDING_FIRST_CARDS_INTRO =
  "When you are ready, open one of these. You can come back to this page anytime.";

export const ASK_KELLY_ONBOARDING_UPDATES = {
  title: "How updates to page copy work",
  intro: "Changing a page hero (eyebrow, title, subtitle) follows a steady rhythm so the public site only changes when you mean it:",
  steps: [
    { label: "Edit your draft", detail: "Type in the editor while you think it through." },
    { label: "Review change", detail: "Compare what is live now to what you are proposing." },
    { label: "Confirm update", detail: "Say you are ready for a final check." },
    { label: "Send update to site", detail: "That action saves to the database and refreshes what visitors see." },
  ] as const,
  footer:
    "Until that last step completes successfully, the public page does not switch. If something fails, your work can stay on this device until you try again.",
};

export const ASK_KELLY_ONBOARDING_FEEDBACK = {
  title: "How beta feedback works",
  lines: [
    "Notes from the Ask Kelly beta are collected in a queue.",
    "Staff may help sort, label, or surface items for you.",
    "You have final say on what matters and what you act on.",
    "Nothing in that queue automatically rewrites the website—site copy still goes through the page editor when you choose to update it.",
  ] as const,
};

export const ASK_KELLY_ONBOARDING_OFFLINE = {
  title: "Traveling or spotty internet",
  lines: [
    "If you are editing and the connection drops, unfinished work can be kept in this browser as a draft.",
    "Nothing sends by itself—you always choose when to submit or save.",
    "If you see a message about a recovered draft, you can restore it or discard it. That is only on this device.",
  ] as const,
};

export const ASK_KELLY_ONBOARDING_ROUTE_FINDER_TITLE = "Ask where something is";
