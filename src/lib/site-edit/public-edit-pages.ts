/**
 * Public pages operators browse while in site edit mode.
 * Basic copy (MediaPageHero strings) + media slots — website workbench later.
 */

export type PublicEditPageLink = {
  href: string;
  label: string;
  hint: string;
};

export const PUBLIC_EDIT_PAGE_LINKS: PublicEditPageLink[] = [
  { href: "/", label: "Home", hint: "Trust funnel hero + media" },
  { href: "/about", label: "Meet Kelly", hint: "About hero + story" },
  { href: "/about/journey", label: "Journey", hint: "Bio journey" },
  { href: "/about/why-im-running", label: "Why running", hint: "Why this race" },
  { href: "/priorities", label: "Priorities", hint: "Issues heroes" },
  { href: "/kelly-speaks", label: "Kelly Speaks", hint: "Video index" },
  { href: "/campaign-photos", label: "Campaign photos", hint: "Albums intro" },
  { href: "/from-the-road", label: "From the road", hint: "Trail proof" },
  { href: "/endorsements", label: "Endorsements", hint: "Support page" },
  { href: "/events", label: "Events", hint: "Events path" },
  { href: "/schedule", label: "Schedule", hint: "Public schedule" },
  { href: "/listening-sessions", label: "Listening", hint: "Listening sessions" },
  { href: "/get-involved", label: "Get involved", hint: "Join path" },
  { href: "/volunteer", label: "Volunteer", hint: "Volunteer" },
  { href: "/donate", label: "Donate", hint: "Donate hero" },
  { href: "/contact", label: "Contact", hint: "Contact" },
  { href: "/direct-democracy", label: "Direct democracy", hint: "DD path" },
  { href: "/arkansas", label: "Arkansas", hint: "Statewide" },
  { href: "/press-coverage", label: "Press", hint: "Coverage" },
  { href: "/host-a-gathering", label: "Host gathering", hint: "Host path" },
  { href: "/start-a-local-team", label: "Local team", hint: "Start a team" },
  { href: "/office/why-this-race-matters", label: "Why this race", hint: "Office layer" },
];
