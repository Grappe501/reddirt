/**
 * Lightweight “playbooks” for the campaign guide: intent hints + CTA bias.
 * No extra model call — complements journey beats and pathname.
 */
export type PlaybookId =
  | "general"
  | "first_time_voter"
  | "county_clerk"
  | "student"
  | "press"
  | "volunteer";

export function detectPlaybook(
  message: string,
  journeyBeatId?: string | null,
  pathname?: string | null,
): PlaybookId {
  const m = message.toLowerCase();
  const path = (pathname ?? "").toLowerCase();

  if (/\bpress\b|journalist|media inquiry|reporter|newsroom\b/.test(m)) return "press";
  if (/\bclerks?\b|county clerk|election admin|election administration\b/.test(m)) return "county_clerk";
  if (/\bstudent\b|high school|college|campus|university\b/.test(m)) return "student";
  if (
    /\bfirst time\b|\bfirst-time\b|never voted|register to vote|how do i vote|am i registered\b/.test(m) ||
    path.includes("voter-registration")
  ) {
    return "first_time_voter";
  }
  if (/\bvolunteer\b|canvass|phone bank|yard sign|knock doors|get involved\b/.test(m) || journeyBeatId === "beat-act") {
    return "volunteer";
  }
  return "general";
}

/** Injected after the main RAG system prompt so the model steers tone and CTAs. */
export function playbookPromptBlock(id: PlaybookId): string {
  const base =
    "PLAYBOOK (follow when it fits the visitor’s question—do not contradict CONTEXT or tool results):\n";

  switch (id) {
    case "first_time_voter":
      return (
        base +
        "- Visitor may be new to voting or registration.\n" +
        "- Prefer plain language; point to /voter-registration on this site for campaign-side help.\n" +
        "- For official lookup and forms, say clearly that the Secretary of State / VoterView is the authority—you are not replacing government sites.\n" +
        "- Close with gentle CTAs: register/check status, get involved, donate—only using paths you know from CONTEXT or tools.\n"
      );
    case "county_clerk":
      return (
        base +
        "- Visitor may work in or with county election administration.\n" +
        "- Be respectful and precise; do not invent procedures or deadlines.\n" +
        "- Ground office-role answers in CONTEXT; suggest /priorities, /civic-depth, or /understand when helpful.\n" +
        "- Offer kelly@kellygrappe.com for operational questions not covered in materials.\n"
      );
    case "student":
      return (
        base +
        "- Visitor may be a student or campus organizer.\n" +
        "- Highlight /get-involved, local organizing, events, and direct democracy education when relevant.\n" +
        "- Keep tone encouraging; no jargon walls.\n"
      );
    case "press":
      return (
        base +
        "- Visitor is likely media or needs a formal contact.\n" +
        "- Use get_public_contact_info tool for approved emails; do not invent press offices or phone trees.\n" +
        "- Short, factual, and courteous; offer /press-coverage if CONTEXT supports it.\n"
      );
    case "volunteer":
      return (
        base +
        "- Visitor wants to help the campaign.\n" +
        "- Use get_volunteer_and_involvement_links for canonical on-site paths.\n" +
        "- Mention host-a-gathering or start-a-local-team when it fits.\n"
      );
    default:
      return (
        base +
        "- General visitor: balance education about the office, Kelly’s story, and ways to participate.\n" +
        "- When wrapping up, it’s fine to mention vote in November, get involved, and donate on this site—naturally, not every sentence.\n"
      );
  }
}

/** Extra suggestion chips biased by playbook (merged with RAG hits, deduped). */
export function playbookSuggestionExtras(id: PlaybookId): Array<{ label: string; href: string }> {
  switch (id) {
    case "first_time_voter":
      return [
        { label: "Voter registration center", href: "/voter-registration" },
        { label: "Understand the office", href: "/understand" },
      ];
    case "county_clerk":
      return [
        { label: "Civic depth", href: "/civic-depth" },
        { label: "Office priorities", href: "/priorities" },
      ];
    case "student":
      return [
        { label: "Get involved", href: "/get-involved" },
        { label: "Events", href: "/events" },
      ];
    case "press":
      return [
        { label: "Press coverage", href: "/press-coverage" },
        { label: "About Kelly", href: "/about" },
      ];
    case "volunteer":
      return [
        { label: "Get involved", href: "/get-involved" },
        { label: "Host a gathering", href: "/host-a-gathering" },
      ];
    default:
      return [
        { label: "Meet Kelly", href: "/about" },
        { label: "Priorities", href: "/priorities" },
      ];
  }
}

export function mergeSuggestions(
  playbook: PlaybookId,
  fromHits: Array<{ label: string; href: string }>,
  limit = 5,
): Array<{ label: string; href: string }> {
  const seen = new Set<string>();
  const out: Array<{ label: string; href: string }> = [];
  for (const s of [...playbookSuggestionExtras(playbook), ...fromHits]) {
    if (seen.has(s.href)) continue;
    seen.add(s.href);
    out.push(s);
    if (out.length >= limit) break;
  }
  return out;
}
