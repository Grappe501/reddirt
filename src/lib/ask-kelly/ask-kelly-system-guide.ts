/**
 * V2.5 — Ask Kelly system guide: pathname-aware + keyword intents (no DB, no voter/donor data).
 */

/** Public routes only — never filesystem paths or server internals. */
export type AskKellySystemGuideLink = { label: string; href: string };

export type AskKellySystemGuideResult =
  | { matched: false }
  | {
      matched: true;
      title: string;
      answer: string;
      links: AskKellySystemGuideLink[];
      nextStep: string;
      /** Optional boundary / configuration note—often rendered separately from the answer body. */
      safetyNote?: string;
    };

/** Documented onboarding routes (mirrors onboarding copy cards). */
export const ASK_KELLY_SYSTEM_ROUTES = {
  onboarding: "/admin/ask-kelly",
  pages: "/admin/pages",
  pageExample: "/admin/pages/what-we-believe",
  betaFeedback: "/admin/workbench/ask-kelly-beta",
  workbench: "/admin/workbench",
  workbenchSocial: "/admin/workbench/social",
  workbenchComms: "/admin/workbench/comms",
  workbenchBroadcasts: "/admin/workbench/comms/broadcasts",
  workbenchEmailQueue: "/admin/workbench/email-queue",
  orchestratorInbox: "/admin/inbox",
  contentOverview: "/admin/content",
  homepage: "/admin/homepage",
  /** Campaign management — public county rollup + drill-downs (RedDirt App Router). */
  countyBriefings: "/county-briefings",
  countyBriefingPope: "/county-briefings/pope",
  countyIntel: "/admin/county-intelligence",
  volunteerPublic: "/get-involved",
  adminVolunteerIntake: "/admin/volunteers/intake",
} as const;

function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/['’]/g, "'")
    .replace(/[^\p{L}\p{N}\s']/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsAny(haystack: string, needles: string[]): boolean {
  return needles.some((n) => haystack.includes(n));
}

export function normalizeGuidePathname(pathname?: string): string {
  if (pathname == null || typeof pathname !== "string") return "/";
  const t = pathname.trim().split("?")[0] || "/";
  const base = t.startsWith("/") ? t : `/${t}`;
  const collapsed = base.replace(/\/{2,}/g, "/");
  const noTrailing = collapsed.replace(/\/+$/, "") || "/";
  return noTrailing.length > 256 ? "/" : noTrailing;
}

function slugToDisplayLabel(segment: string): string {
  const s = segment.trim();
  if (!s.length) return "this page";
  return s
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/** `/admin/pages/foo` → foo */
export function adminPagesSlug(pathname?: string): string | null {
  const p = normalizeGuidePathname(pathname);
  const m = /^\/admin\/pages\/([^/]+)$/.exec(p);
  return m?.[1] ? decodeURIComponent(m[1]) : null;
}

function isLikelyPublicSitePath(p: string): boolean {
  return p.length > 1 && !p.startsWith("/admin");
}

function adminLocationSummary(pathname?: string): string | null {
  const p = normalizeGuidePathname(pathname);
  if (!p.startsWith("/admin")) return null;
  if (p === "/admin/ask-kelly") return "Candidate onboarding";
  if (p === "/admin/pages") return "the Page content list";
  if (p === ASK_KELLY_SYSTEM_ROUTES.betaFeedback) return "Ask Kelly beta feedback";
  if (p === "/admin/workbench") return "Campaign workbench";
  if (p === "/admin/content") return "Content overview";
  if (p === "/admin/homepage") return "Homepage (admin)";
  if (p === "/admin/volunteers/intake") return "Volunteer sheet intake";
  if (p === ASK_KELLY_SYSTEM_ROUTES.countyIntel) return "County intelligence";
  const slug = adminPagesSlug(p);
  if (slug) return `Page content for “${slugToDisplayLabel(slug)}”`;
  return "Admin";
}

type RuleBuild = {
  title: string;
  answer: string;
  links: AskKellySystemGuideLink[];
  nextStep: string;
  safetyNote?: string;
};

type Rule = {
  id: string;
  priority: number;
  test: (n: string) => boolean;
  build: () => RuleBuild;
};

function applyAdminPreface(built: RuleBuild, pathname?: string): RuleBuild {
  const summary = adminLocationSummary(pathname);
  if (!summary) return built;
  return {
    ...built,
    answer: `You’re signed into admin (${summary}). ${built.answer}`.trim(),
  };
}

function tryAlreadyHere(n: string, pathname?: string): AskKellySystemGuideResult | false {
  const p = normalizeGuidePathname(pathname);
  if (p === ASK_KELLY_SYSTEM_ROUTES.onboarding) {
    if (
      containsAny(n, ["where is candidate onboarding", "where's candidate onboarding", "find candidate onboarding"]) ||
      (containsAny(n, ["candidate onboarding"]) && containsAny(n, ["where", "find"]))
    ) {
      return {
        matched: true,
        title: "You’re already on Candidate onboarding",
        answer:
          "This route is your orientation screen—sections here explain Page content, beta feedback triage, and how saves work. Browse the headings, then jump to Page content when you want to edit public wording.",
        links: [{ label: "Top of onboarding", href: ASK_KELLY_SYSTEM_ROUTES.onboarding }],
        nextStep: "Scroll to “First things to learn,” then open Page content from a card or the sidebar when you’re ready.",
      };
    }
  }
  if (p === ASK_KELLY_SYSTEM_ROUTES.betaFeedback) {
    if (
      (containsAny(n, ["where is beta", "where's beta", "find beta feedback", "where is ask kelly beta"]) &&
        containsAny(n, ["feedback", "beta", "queue"])) ||
      (containsAny(n, ["beta feedback queue", "ask kelly beta"]) && containsAny(n, ["where", "find"]))
    ) {
      return {
        matched: true,
        title: "You’re already on Ask Kelly beta feedback",
        answer:
          "This screen is the triage queue for structured beta notes (category + message). Staff can help sort; nothing here overwrites public copy until you act in Page content.",
        links: [{ label: "Ask Kelly beta feedback", href: ASK_KELLY_SYSTEM_ROUTES.betaFeedback }],
        nextStep: "Scan newest items, label what matters for this week, and move real copy work into Page content when you’re ready.",
      };
    }
  }
  return false;
}

function mentionsThisPageEdit(n: string): boolean {
  return (
    containsAny(n, ["this page", "edit this", "on this page", "this screen", "change this page", "this pillar"]) ||
    (containsAny(n, ["edit", "update", "change"]) && containsAny(n, ["here", "this screen"]))
  );
}

function tryEditorThisPage(n: string, pathname?: string): AskKellySystemGuideResult | false {
  const slug = adminPagesSlug(pathname);
  if (!slug || !mentionsThisPageEdit(n)) return false;
  const label = slugToDisplayLabel(slug);
  return {
    matched: true,
    title: "Editing this pillar page",
    answer: `You’re in Page content for “${label}.” Use the fields on this screen to draft hero copy, compare to what’s live, confirm, then finish the save. Nothing changes publicly until that final save succeeds.`,
    links: [
      { label: "All pages", href: ASK_KELLY_SYSTEM_ROUTES.pages },
      { label: "Candidate onboarding", href: ASK_KELLY_SYSTEM_ROUTES.onboarding },
    ],
    nextStep: `Review eyebrow, title, and subtitle for ${label}, then run confirm → save once so the flow feels familiar.`,
  };
}

type LocKind = "where" | "doHere" | "next" | "back";

function detectLocationKind(n: string): LocKind | null {
  if (
    containsAny(n, [
      "what page am i on",
      "what page am i",
      "which page am i on",
      "which page am i",
      "what page is this",
      "what screen is this",
      "what screen am i on",
    ])
  ) {
    return "where";
  }
  if (containsAny(n, ["what can i do here", "what do i do here", "what can i do on this page", "how do i use this screen"])) {
    return "doHere";
  }
  if (containsAny(n, ["where do i go next", "where should i go next", "what's next", "what do i do next"])) {
    return "next";
  }
  if (containsAny(n, ["how do i get back", "how do i go back", "get back", "go back"])) {
    return "back";
  }
  if (/\bwhere am i\b/.test(n) && !containsAny(n, ["submit", "go next"])) {
    return "where";
  }
  return null;
}

function buildLocationAnswer(kind: LocKind, pathname?: string): AskKellySystemGuideResult | false {
  const p = normalizeGuidePathname(pathname);

  const publicLine = () => {
    if (!isLikelyPublicSitePath(p)) return null;
    return `You’re on the public site path ${p}—campaign pages visitors can see without signing in.`;
  };

  if (kind === "where") {
    const pub = publicLine();
    if (pub) {
      return {
        matched: true,
        title: "Where you are",
        answer: `${pub} Ask Kelly focuses on routing and edits; it does not expose internal lists or supporter data.`,
        links: [{ label: "Home", href: "/" }],
        nextStep: "Use the menus to explore, or Ask Kelly from here for routing questions tied to site tools.",
      };
    }
    const slug = adminPagesSlug(pathname);
    if (slug) {
      const label = slugToDisplayLabel(slug);
      return {
        matched: true,
        title: "Which screen this is",
        answer: `You’re in Admin → Page content, editing “${label}.” The slug in the URL lines up with the pillar page your changes will attach to.`,
        links: [{ label: "Page list", href: ASK_KELLY_SYSTEM_ROUTES.pages }],
        nextStep: "If this isn’t the page you meant, go back to the list and choose the correct row.",
      };
    }
    if (p === "/admin/pages") {
      return {
        matched: true,
        title: "Which screen this is",
        answer:
          "You’re on the Page content list—a directory of pillar pages you can open into the hero editor.",
        links: [{ label: "Candidate onboarding", href: ASK_KELLY_SYSTEM_ROUTES.onboarding }],
        nextStep: "Pick one page row, open it, and run a tiny copy change through save once.",
      };
    }
    if (p === ASK_KELLY_SYSTEM_ROUTES.onboarding) {
      return {
        matched: true,
        title: "Which screen this is",
        answer:
          "You’re on Candidate onboarding—the admin home that explains dashboards, beta triage, and how page saves work.",
        links: [{ label: "Page content", href: ASK_KELLY_SYSTEM_ROUTES.pages }],
        nextStep: "Skim sections top to bottom, then open Page content when you want to try one edit.",
      };
    }
    if (p === ASK_KELLY_SYSTEM_ROUTES.betaFeedback) {
      return {
        matched: true,
        title: "Which screen this is",
        answer:
          "You’re on Ask Kelly beta feedback—the structured queue for tester notes tied to Ask Kelly invites.",
        links: [{ label: "Candidate onboarding", href: ASK_KELLY_SYSTEM_ROUTES.onboarding }],
        nextStep: "Work top-down through new items and decide what needs a Page content change this sprint.",
      };
    }
    if (p.startsWith("/admin")) {
      const summary = adminLocationSummary(pathname) ?? "Admin";
      return {
        matched: true,
        title: "Which screen this is",
        answer: `You’re signed into admin (${summary}). Use the sidebar to move between ops, content, and onboarding screens.`,
        links: [
          { label: "Candidate onboarding", href: ASK_KELLY_SYSTEM_ROUTES.onboarding },
          { label: "Campaign workbench", href: ASK_KELLY_SYSTEM_ROUTES.workbench },
        ],
        nextStep: "If you meant a particular tool, ask by name—or open Candidate onboarding for a labeled map.",
      };
    }
  }

  if (kind === "doHere") {
    const pub = publicLine();
    if (pub) {
      return {
        matched: true,
        title: "What you can do here",
        answer:
          `${pub} You can browse, follow links to volunteer paths, or open Ask Kelly for routing questions.`,
        links: [{ label: "Get involved", href: "/get-involved" }],
        nextStep: "Use Ask Kelly while reading a page when you’re unsure where a workflow lives in admin.",
      };
    }
    const slug = adminPagesSlug(pathname);
    if (slug) {
      const label = slugToDisplayLabel(slug);
      return {
        matched: true,
        title: "What you can do here",
        answer:
          `On this Page content screen you can revise the hero (eyebrow, title, subtitle) for ${label}, compare drafts to what’s live, and finish a save path that writes your approved revision into site storage. Nothing publishes until the final save succeeds.`,
        links: [
          { label: "All pages", href: ASK_KELLY_SYSTEM_ROUTES.pages },
          { label: "How saves work", href: `${ASK_KELLY_SYSTEM_ROUTES.onboarding}#updates-heading` },
        ],
        nextStep: "Draft a small wording tweak, confirm, then finish save—repeat until the sequence feels predictable.",
      };
    }
    if (p === ASK_KELLY_SYSTEM_ROUTES.onboarding) {
      return {
        matched: true,
        title: "What you can do here",
        answer:
          "Read orientation sections, jump to Page content for real edits, follow links to Ask Kelly beta feedback for triage, and use Candidate onboarding whenever you lose the map.",
        links: [
          { label: "Page content", href: ASK_KELLY_SYSTEM_ROUTES.pages },
          { label: "Ask Kelly beta feedback", href: ASK_KELLY_SYSTEM_ROUTES.betaFeedback },
        ],
        nextStep: "Pick one outbound link you haven’t clicked yet—usually Page content for a sandbox edit.",
      };
    }
    if (p === ASK_KELLY_SYSTEM_ROUTES.betaFeedback) {
      return {
        matched: true,
        title: "What you can do here",
        answer:
          "Review categorized tester messages, prioritize what deserves a rewrite, coordinate with staff for labels, then handle copy in Page content when you approve a concrete change.",
        links: [{ label: "Page content", href: ASK_KELLY_SYSTEM_ROUTES.pages }],
        nextStep: "Open one note, decide “editor work” vs “nice to know,” and close the loop in Page content for real fixes.",
      };
    }
    if (p.startsWith("/admin")) {
      const summary = adminLocationSummary(pathname) ?? "this admin section";
      return {
        matched: true,
        title: "What you can do here",
        answer: `Use the controls on ${summary}; when in doubt use the sidebar to reach Page content or Candidate onboarding for the authoritative map.`,
        links: [{ label: "Candidate onboarding", href: ASK_KELLY_SYSTEM_ROUTES.onboarding }],
        nextStep: "Name the task aloud (homepage vs hero vs ops); follow the shortest admin link named after that job.",
      };
    }
  }

  if (kind === "next") {
    const pub = publicLine();
    if (pub) {
      return {
        matched: true,
        title: "Where to go next",
        answer:
          "On a public campaign page your next click depends on intent—open Ask Kelly bottom-right when you’re looking for routing or tooling, browse issues for depth, or use Get involved to volunteer.",
        links: [{ label: "Home", href: "/" }],
        nextStep: "Pick one next action: read another issue page, or open Ask Kelly and ask where that topic lives in admin.",
      };
    }
    if (p === ASK_KELLY_SYSTEM_ROUTES.onboarding) {
      return {
        matched: true,
        title: "Where to go next",
        answer:
          "After skimming onboarding, the usual next move is Page content for a hands-on hero edit, or Ask Kelly beta feedback if you’re following up on tester notes.",
        links: [
          { label: "Page content", href: ASK_KELLY_SYSTEM_ROUTES.pages },
          { label: "Ask Kelly beta feedback", href: ASK_KELLY_SYSTEM_ROUTES.betaFeedback },
        ],
        nextStep: "Open Page content, pick a low-stakes page, and run one change through save once.",
      };
    }
    const slug = adminPagesSlug(pathname);
    if (slug) {
      const label = slugToDisplayLabel(slug);
      return {
        matched: true,
        title: "Where to go next",
        answer:
          `After ${label} looks right in review, finish the save. Then either return to the page list to pick the next pillar or head to Ask Kelly beta feedback if a tester note tied to this page needs follow-up.`,
        links: [
          { label: "Page list", href: ASK_KELLY_SYSTEM_ROUTES.pages },
          { label: "Ask Kelly beta feedback", href: ASK_KELLY_SYSTEM_ROUTES.betaFeedback },
        ],
        nextStep: "Confirm save on this page first; then choose your next page or triage item.",
      };
    }
    if (p === ASK_KELLY_SYSTEM_ROUTES.betaFeedback) {
      return {
        matched: true,
        title: "Where to go next",
        answer:
          "Pick the highest priority feedback item, translate it into a concrete copy change, then open Page content to apply it with the normal review → save path.",
        links: [
          { label: "Page content", href: ASK_KELLY_SYSTEM_ROUTES.pages },
          { label: "Candidate onboarding", href: ASK_KELLY_SYSTEM_ROUTES.onboarding },
        ],
        nextStep: "Open one message, note the page it references, and handle that page in the editor before moving to the next note.",
      };
    }
    if (p.startsWith("/admin")) {
      return {
        matched: true,
        title: "Where to go next",
        answer:
          "From most admin screens the next step is either Page content for public wording, Ask Kelly beta feedback for tester triage, or Campaign workbench for ongoing tasks—pick the bucket that matches the work in front of you.",
        links: [
          { label: "Page content", href: ASK_KELLY_SYSTEM_ROUTES.pages },
          { label: "Campaign workbench", href: ASK_KELLY_SYSTEM_ROUTES.workbench },
        ],
        nextStep: "If you’re lost, open Candidate onboarding for a labeled map, then return one tool at a time.",
      };
    }
  }

  if (kind === "back") {
    return {
      matched: true,
      title: "How to get back",
      answer:
        "Use the browser Back button for one step, or use the admin sidebar and Candidate onboarding as stable anchors. Nothing here grants extra access—navigation is the same as any other admin session.",
      links: [
        { label: "Candidate onboarding", href: ASK_KELLY_SYSTEM_ROUTES.onboarding },
        { label: "Campaign workbench", href: ASK_KELLY_SYSTEM_ROUTES.workbench },
      ],
      nextStep: "Bookmark Candidate onboarding if you need a consistent home base between deep tools.",
    };
  }

  return false;
}

const rules: Rule[] = [
  {
    id: "vs-chatgpt-generic",
    priority: 0,
    test: (n) =>
      containsAny(n, ["chatgpt", "chat gpt"]) &&
      containsAny(n, ["ask kelly", "this guide", "here", "the site"]) &&
      containsAny(n, ["instead", "instead of", "vs", "versus", "rather than", "why"]),
    build: () => ({
      title: "Ask Kelly vs a general-purpose tool",
      answer:
        "Ask Kelly is anchored to this campaign’s site routes, review rules, and public-safe docs in Kelly’s stack—not the open internet. Today it responds with deterministic routing hints when it can, retrieval from curated content where operators have staged it, and the same confirmations you expect across admin. Generic tools do not inherit your dashboards, your save paths, or this deployment.",
      links: [
        { label: "Candidate onboarding", href: ASK_KELLY_SYSTEM_ROUTES.onboarding },
        { label: "Page content", href: ASK_KELLY_SYSTEM_ROUTES.pages },
      ],
      nextStep:
        "Try a concrete question like “Where do I update page copy?” from the public guide or this console—you should see route-level answers.",
    }),
  },
  {
    id: "candidate-console-what",
    priority: 0,
    test: (n) =>
      containsAny(n, ["candidate console", "the candidate console"]) ||
      (containsAny(n, ["what is"]) && containsAny(n, ["candidate console"])),
    build: () => ({
      title: "Candidate console (framing)",
      answer:
        "On this onboarding screen “Candidate console” is interface framing for Kelly’s natural priority—website copy, feedback triage, public approvals—before heavier operations. The same Ask Kelly guide and Dixie entry model applies throughout; dashboards may surface different links first as roles expand—not a separate product.",
      links: [{ label: "Candidate onboarding", href: ASK_KELLY_SYSTEM_ROUTES.onboarding }],
      nextStep:
        "Follow the staged sequence: Page content first when you want a sandbox edit, beta feedback when triage matters this week.",
    }),
  },
  {
    id: "manager-console-what",
    priority: 0,
    test: (n) =>
      containsAny(n, ["campaign manager console", "manager console"]) ||
      (containsAny(n, ["what is"]) && containsAny(n, ["campaign manager console"])),
    build: () => ({
      title: "Campaign manager console (framing)",
      answer:
        "That label is framing for whoever runs schedules, tasks, and operational dashboards: workbench queues, summaries, ops views—still on the same guide rails until dedicated shortcuts arrive. Automation is not bundled into that naming today; privileges follow whatever admin roles you already have.",
      links: [
        { label: "Campaign workbench", href: ASK_KELLY_SYSTEM_ROUTES.workbench },
        { label: "Candidate onboarding", href: ASK_KELLY_SYSTEM_ROUTES.onboarding },
      ],
      nextStep: "Bookmark Campaign workbench; treat Ask Kelly answers as orientation—they do not remotely run operations.",
    }),
  },
  {
    id: "campaign-materials-use",
    priority: 0,
    test: (n) =>
      containsAny(n, ["campaign materials", "approved materials", "our materials"]) &&
      containsAny(n, ["ask kelly"]) &&
      containsAny(n, ["can", "could", "will", "does", "should", "use", "access", "pull", "read"]),
    build: () => ({
      title: "Campaign materials inside Ask Kelly",
      answer:
        "Today Ask Kelly pulls from documented routes plus public-safe ingestion your operators approved—nothing that implies an automatic dump of every internal document. Planned work includes tighter snippets and drafting assistants, always review-first before anything publishes. Sensitive data still belongs behind the dashboards built for them.",
      links: [{ label: "Candidate onboarding", href: ASK_KELLY_SYSTEM_ROUTES.onboarding }],
      nextStep: "Treat retrieval answers as provisional; your Page content confirmations decide what reaches the live site.",
    }),
  },
  {
    id: "write-like-me",
    priority: 0,
    test: (n) =>
      containsAny(n, ["write like me", "sound like me", "voice like mine", "in my voice", "sound like i"]) ||
      (containsAny(n, ["ask kelly"]) &&
        containsAny(n, ["write"]) &&
        containsAny(n, ["like", "my voice"])) ||
      (containsAny(n, ["help"]) && containsAny(n, ["write"]) && containsAny(n, ["like"])),
    build: () => ({
      title: "Drafting in Kelly’s voice",
      answer:
        "The guide can align phrasing with approved snippets and publicly safe references—including future-controlled voice cues—but it does not claim to perfectly mirror Kelly. Suggested lines stay draft-only until you adopt them in the editor. Final tone and legal sign-off stay with Kelly and counsel.",
      links: [
        { label: "Page content", href: ASK_KELLY_SYSTEM_ROUTES.pages },
        { label: "How updates work", href: `${ASK_KELLY_SYSTEM_ROUTES.onboarding}#updates-heading` },
      ],
      nextStep: "After any suggestion, adjust one hero block yourself so the muscle memory of review and save stays familiar.",
    }),
  },
  {
    id: "safe-access-define",
    priority: 0,
    test: (n) =>
      containsAny(n, ["what is safe access", "define safe access", "what does safe access mean"]) ||
      (/\bsafe access\b/.test(n) && containsAny(n, ["what", "explain", "mean"])),
    build: () => ({
      title: "Safe access",
      answer:
        "Safe access means routing and explanations without unloading supporter databases through the conversational guide row by row. Ask Kelly can outline what each dashboard exists for while raw voter exports, treasury ledgers, and similar records stay gated behind proper tools.",
      links: [{ label: "Candidate onboarding", href: ASK_KELLY_SYSTEM_ROUTES.onboarding }],
      nextStep: "Need granular rows? Ask your ops lead for the right module—not the public-facing guide.",
    }),
  },
  {
    id: "search-internet",
    priority: 0,
    test: (n) =>
      containsAny(n, ["search the internet", "browse the internet", "search the web", "look things up online"]) &&
      (containsAny(n, ["ask kelly"]) || containsAny(n, ["can", "does", "will"])),
    build: () => ({
      title: "Searching the broader internet",
      answer:
        "Not as a live capability today. Ask Kelly sticks to sanctioned routes and staged docs; optional browsing or web search may arrive later with compliance review. Do not depend on the guide for open-web research until ops documents it.",
      links: [{ label: "Candidate onboarding", href: ASK_KELLY_SYSTEM_ROUTES.onboarding }],
      nextStep: "Use your campaign’s established research workflow until any browsing feature is announced.",
    }),
  },
  {
    id: "research-tools-what",
    priority: 0,
    test: (n) =>
      (containsAny(n, ["what are", "what is", "explain", "tell me about"]) &&
        containsAny(n, ["research tool", "research tools"])) ||
      /\bresearch tools\b/.test(n),
    build: () => ({
      title: "Research tools (planned)",
      answer:
        "Research tools on this roadmap are for deliberate, reviewed use: approved sources, cited summaries, staff review before anything ships. They are not wired in the public guide today, and open-web browsing is not a live feature here until operations enable it with clear rules.",
      links: [{ label: "Candidate onboarding", href: ASK_KELLY_SYSTEM_ROUTES.onboarding }],
      nextStep: "Until those tools exist, use your campaign’s established research workflow outside this console.",
    }),
  },
  {
    id: "comms-social-stats-where",
    priority: 0,
    test: (n) =>
      containsAny(n, ["social media stat", "social media stats", "social stats", "social performance", "where are social"]) ||
      (containsAny(n, ["social"]) &&
        containsAny(n, ["stat", "stats", "performance", "metrics", "analytics", "numbers"]) &&
        containsAny(n, ["where", "how do i see", "check", "find", "see my"])),
    build: () => ({
      title: "Where to check social performance",
      answer:
        "Aggregated “headline” social stats are not surfaced in Ask Kelly itself. Open the Social workbench in admin—there your team can review social content work items, queues, and related tooling for this deployment. Live rollups for a candidate-only mini-dashboard are still being integrated; use the workbench as the source of truth today.",
      links: [
        { label: "Social workbench", href: ASK_KELLY_SYSTEM_ROUTES.workbenchSocial },
        { label: "Campaign workbench", href: ASK_KELLY_SYSTEM_ROUTES.workbench },
      ],
      nextStep:
        "From Social workbench, scan recent posts and tasks; escalate what needs candidate sign-off rather than improvising publishes from here.",
    }),
  },
  {
    id: "comms-send-email-how",
    priority: 0,
    test: (n) =>
      containsAny(n, ["how do i send an email", "how to send an email"]) ||
      (containsAny(n, ["send"]) && containsAny(n, ["email"]) && containsAny(n, ["how", "where"])) ||
      (containsAny(n, ["email blast", "campaign email"]) && containsAny(n, ["how", "where", "send"])),
    build: () => ({
      title: "Sending email from the stack",
      answer:
        "Mass or segmented email flows through the comms hub and related queues—they require staff review, approvals, and compliance checks before anything sends. Drafting may start in Campaign workbench or comms broadcasts depending on setup. This guide does not launch sends; it routes you to the right admin surface.",
      links: [
        { label: "Comms hub", href: ASK_KELLY_SYSTEM_ROUTES.workbenchComms },
        { label: "Broadcast hub", href: ASK_KELLY_SYSTEM_ROUTES.workbenchBroadcasts },
        { label: "Email queue", href: ASK_KELLY_SYSTEM_ROUTES.workbenchEmailQueue },
      ],
      nextStep: "Coordinate subject, audience, and approval with whoever owns compliance on your team before you schedule.",
      safetyNote: "Never treat Ask Kelly answers as authorization to bypass finance or FEC rules.",
    }),
  },
  {
    id: "comms-send-text-how",
    priority: 0,
    test: (n) =>
      (containsAny(n, ["send a text", "send text", "send sms", "text supporters", "sms blast"]) &&
        containsAny(n, ["how", "where", "send"])) ||
      containsAny(n, ["how do i send a text"]),
    build: () => ({
      title: "Sending SMS / text",
      answer:
        "Programmatic SMS uses the same compliance posture as email: opt-in status, scripts, and approvals live in the comms and broadcast tools—not in this chat. Open the broadcast hub or Campaign workbench lane your team uses for SMS; follow opt-in and compliance gates there.",
      links: [
        { label: "Broadcast hub", href: ASK_KELLY_SYSTEM_ROUTES.workbenchBroadcasts },
        { label: "Campaign workbench", href: ASK_KELLY_SYSTEM_ROUTES.workbench },
        { label: "Comms hub", href: ASK_KELLY_SYSTEM_ROUTES.workbenchComms },
      ],
      nextStep: "Confirm carrier rules and consent records with your compliance lead before large sends.",
      safetyNote: "TCPA / opt-in rules apply; do not send cold mass texts from personal devices on behalf of the campaign.",
    }),
  },
  {
    id: "comms-message-one-person",
    priority: 0,
    test: (n) =>
      containsAny(n, ["message one person", "one person at a time", "one to one", "one-to-one", "individual message"]) ||
      (containsAny(n, ["one person", "single supporter"]) && containsAny(n, ["message", "email", "text"])) ||
      (containsAny(n, ["how do i message"]) && containsAny(n, ["one", "individual", "direct"])),
    build: () => ({
      title: "Messaging one person",
      answer:
        "Use the Campaign workbench—there are lanes for staff conversation templates tied to events and relationships. The orchestrator inbox handles inbound content items and triage; it is not a voter-file bulk tool. For sensitive threads, keep work inside the tools your campaign approved—never paste private supporter details into Ask Kelly prompts.",
      links: [
        { label: "Campaign workbench", href: ASK_KELLY_SYSTEM_ROUTES.workbench },
        { label: "Email queue", href: ASK_KELLY_SYSTEM_ROUTES.workbenchEmailQueue },
        { label: "Content inbox", href: ASK_KELLY_SYSTEM_ROUTES.orchestratorInbox },
      ],
      nextStep:
        "If you meant relational organizing contact, switch to relational tools your admin enabled—still no raw exports through this guide.",
      safetyNote: "Do not type personally identifiable supporter data into the public-facing Ask Kelly field.",
    }),
  },
  {
    id: "cms-county-briefings-and-county-hub",
    priority: -1,
    test: (n) =>
      containsAny(n, [
        "county briefing",
        "county briefings",
        "where are the county briefings",
        "county workbench",
        "countyworkbench",
        "distipope",
        "dist pope",
        "dist county",
        "pope briefing",
        "pope county briefing",
      ]) ||
      (containsAny(n, ["county intelligence", "county intel"]) && containsAny(n, ["where", "what", "open", "admin"])),
    build: () => ({
      title: "County briefings (campaign management)",
      answer:
        "County surfaces live inside this RedDirt deployment: the public **`/county-briefings`** index and drills such as **`/county-briefings/pope`**, plus staff **`/admin/county-intelligence`** for aggregate intel. Operators may refer to **`/countyWorkbench`** as a canonical label—in-app navigation uses these briefing routes plus optional **`NEXT_PUBLIC_COUNTY_WORKBENCH_URL`** when set. Repo-root static drops (`dist-pope-briefing/`, `dist-county-briefings/`) are packaging outputs; there are no **`/distipope-briefing`** or **`/dist-county-briefings`** App Router pages today.",
      links: [
        { label: "County briefings", href: ASK_KELLY_SYSTEM_ROUTES.countyBriefings },
        { label: "Pope county briefing", href: ASK_KELLY_SYSTEM_ROUTES.countyBriefingPope },
        { label: "County intelligence (admin)", href: ASK_KELLY_SYSTEM_ROUTES.countyIntel },
      ],
      nextStep: "Keep voter-level detail in gated admin tools—Ask Kelly does not search the voter file.",
      safetyNote: "Aggregates only on public briefing pages; follow counsel on what may be shown.",
    }),
  },
  {
    id: "cms-volunteer-surfaces",
    priority: -1,
    test: (n) =>
      containsAny(n, ["volunteer page", "volunteer signup", "volunteer sign-up", "volunteer sign up", "volunteer intake"]) ||
      (containsAny(n, ["volunteer"]) && containsAny(n, ["where", "sign up", "sign-up", "join"])) ||
      containsAny(n, ["where is the volunteer page"]),
    build: () => ({
      title: "Volunteer entry (campaign management)",
      answer:
        "Volunteer pathways use the public **Get involved** page (`/get-involved`). Staff intake for volunteer sheets is **`/admin/volunteers/intake`**. There is no literal **`/volunteerPage`** route in this app—those two URLs are the supported campaign-management surfaces.",
      links: [
        { label: "Get involved (public)", href: ASK_KELLY_SYSTEM_ROUTES.volunteerPublic },
        { label: "Volunteer sheet intake", href: ASK_KELLY_SYSTEM_ROUTES.adminVolunteerIntake },
      ],
      nextStep: "If you meant relational organizing tiers, ask your admin which relational lanes are enabled.",
    }),
  },
  {
    id: "comms-campaign-organizing-hub",
    priority: 0,
    test: (n) =>
      containsAny(n, ["campaign organizing hub", "team organizing hub", "internal organizing hub"]) ||
      (containsAny(n, ["discord"]) && containsAny(n, ["where", "what is", "how do i find", "link"])) ||
      containsAny(n, ["where is discord"]),
    build: () => ({
      title: "Campaign Organizing Hub · Discord",
      answer:
        "The Campaign Organizing Hub is your campaign-owned coordination layer—often Discord or a similar channel when your manager provisions it. No verified Discord invite ships in this admin UI; confirm access policy with your campaign manager. In-stack workflows use Campaign workbench, comms hubs, county briefings, and volunteer surfaces below—all first-party routes in this RedDirt deployment.",
      links: [
        { label: "Campaign workbench", href: ASK_KELLY_SYSTEM_ROUTES.workbench },
        { label: "Comms hub", href: ASK_KELLY_SYSTEM_ROUTES.workbenchComms },
        { label: "County briefings", href: ASK_KELLY_SYSTEM_ROUTES.countyBriefings },
        { label: "Get involved (volunteer)", href: ASK_KELLY_SYSTEM_ROUTES.volunteerPublic },
      ],
      nextStep: "If Discord is in use, keep invites and roles outside public website copy until counsel approves.",
    }),
  },
  {
    id: "comms-supporters-how",
    priority: 0,
    test: (n) =>
      containsAny(n, ["communicate with supporters", "talk to supporters", "reach supporters", "message supporters"]) ||
      (containsAny(n, ["supporters"]) &&
        containsAny(n, ["communicate", "reach", "message", "contact"]) &&
        containsAny(n, ["how", "where should"])),
    build: () => ({
      title: "Reaching supporters",
      answer:
        "Use the comms hub for planned email/SMS programs, the Social workbench for outbound social posture, and Campaign workbench for operational follow-ups. Mass channels always need approval and compliance review. One-to-one paths stay in the tools your team provisioned—Ask Kelly only maps routes, it does not send messages.",
      links: [
        { label: "Comms hub", href: ASK_KELLY_SYSTEM_ROUTES.workbenchComms },
        { label: "Social workbench", href: ASK_KELLY_SYSTEM_ROUTES.workbenchSocial },
        { label: "Campaign workbench", href: ASK_KELLY_SYSTEM_ROUTES.workbench },
      ],
      nextStep: "Pick one channel for today’s goal—broadcast for wide reach, workbench for staff-led follow-up.",
    }),
  },
  {
    id: "comms-mass-message",
    priority: 0,
    test: (n) =>
      containsAny(n, ["mass message", "bulk message", "mass email", "mass text", "send a mass"]) ||
      (containsAny(n, ["mass"]) && containsAny(n, ["send", "blast", "email", "text", "sms"])),
    build: () => ({
      title: "Mass messages",
      answer:
        "Mass email and SMS require approved templates, audience selection, and compliance review in the comms and broadcast tools—never from this chat or an ad hoc personal inbox. If you are cleared to send, build or schedule inside the broadcast hub and let your compliance workflow finish before anything deploys.",
      links: [
        { label: "Broadcast hub", href: ASK_KELLY_SYSTEM_ROUTES.workbenchBroadcasts },
        { label: "Comms hub", href: ASK_KELLY_SYSTEM_ROUTES.workbenchComms },
      ],
      nextStep: "Run the approval checklist your campaign published; Ask Kelly does not replace counsel sign-off.",
      safetyNote: "Violation of consent or disclosure rules can carry legal risk—escalate when unsure.",
    }),
  },
  {
    id: "console-minimize",
    priority: 0,
    test: (n) =>
      containsAny(n, ["minimize"]) &&
      (containsAny(n, ["console", "this panel", "ask kelly"]) || containsAny(n, ["can i", "how do i"])),
    build: () => ({
      title: "Minimizing the Ask Kelly console",
      answer:
        "On Candidate onboarding, use Minimize on the console toolbar to collapse the large header into a compact bar (your choice is saved in this browser). The admin sidebar stays put—only the console chrome tucks away so the rest of the dashboard has more room.",
      links: [{ label: "Candidate onboarding", href: ASK_KELLY_SYSTEM_ROUTES.onboarding }],
      nextStep: "Open the bar when you want the full orientation again—Open Ask Kelly returns the default view.",
    }),
  },
  {
    id: "console-fullscreen",
    priority: 0,
    test: (n) =>
      (containsAny(n, ["full screen", "fullscreen", "focus mode"]) || containsAny(n, ["make this", "wider"])) &&
      (containsAny(n, ["console", "ask kelly"]) || containsAny(n, ["can i", "how do i"])),
    build: () => ({
      title: "Full-screen focus on the console",
      answer:
        "Use Expand on the console toolbar for a wider focus layout that keeps the rest of admin navigation available (the sidebar does not disappear permanently). Exit full screen when you want the standard width back. Your mode is saved in this browser only.",
      links: [{ label: "Candidate onboarding", href: ASK_KELLY_SYSTEM_ROUTES.onboarding }],
      nextStep: "After a deep read, restore the default width if you want Page content and other tools side by side.",
    }),
  },
  {
    id: "keep-console-open",
    priority: 0,
    test: (n) =>
      containsAny(n, ["keep this open", "keep it open", "stay open"]) ||
      (containsAny(n, ["while"]) && containsAny(n, ["work", "dashboard", "working"]) && containsAny(n, ["open", "console", "ask kelly"])) ||
      (containsAny(n, ["docked", "side by side"]) && containsAny(n, ["console", "guide"])),
    build: () => ({
      title: "Keeping Ask Kelly open beside your work",
      answer:
        "Leave the Candidate onboarding console in the default or full-screen mode while you move through other admin tasks—the guide is meant to sit beside the dashboard. Minimize when you need maximum space; Expand when you want immersion. Nothing here blocks the sidebar or replaces your other tools.",
      links: [
        { label: "Candidate onboarding", href: ASK_KELLY_SYSTEM_ROUTES.onboarding },
        { label: "Page content", href: ASK_KELLY_SYSTEM_ROUTES.pages },
      ],
      nextStep: "Pick one mode per session: default width for scanning, minimize or full screen when concentration or layout calls for it.",
    }),
  },
  {
    id: "search-database",
    priority: 0,
    test: (n) =>
      containsAny(n, ["search the database", "query the database", "dump the database"]) &&
      (containsAny(n, ["ask kelly"]) || containsAny(n, ["can", "will", "does"])),
    build: () => ({
      title: "Searching internal databases",
      answer:
        "Ask Kelly does not expose ad-hoc SQL or voter and donor tables. It can still say which admin screen to open for a job. Raw reporting belongs in dashboards with audited permissions.",
      links: [
        { label: "Campaign workbench", href: ASK_KELLY_SYSTEM_ROUTES.workbench },
        { label: "Candidate onboarding", href: ASK_KELLY_SYSTEM_ROUTES.onboarding },
      ],
      nextStep: "Escalate database extracts to whoever owns data access for the campaign.",
    }),
  },
  {
    id: "build-reports",
    priority: 0,
    test: (n) =>
      containsAny(n, ["build reports", "generate reports"]) &&
      (containsAny(n, ["ask kelly"]) || containsAny(n, ["can", "will", "does"])),
    build: () => ({
      title: "Reporting",
      answer:
        "Dedicated reporting and insights modules remain the source of truth for numbers. Ask Kelly can route you there; it is not a turnkey analytics engine on its own today.",
      links: [
        { label: "Campaign workbench", href: ASK_KELLY_SYSTEM_ROUTES.workbench },
        { label: "Content overview", href: ASK_KELLY_SYSTEM_ROUTES.contentOverview },
      ],
      nextStep: "Open the reporting tool your campaign provisions; use the guide for directions, not for exports.",
    }),
  },
  {
    id: "dixie-what",
    priority: 0,
    test: (n) =>
      containsAny(n, ["what is dixie", "what's dixie", "whats dixie", "who is dixie", "explain dixie"]) ||
      (/\bdixie\b/.test(n) && containsAny(n, ["tell me about", "what is", "who is"])),
    build: () => ({
      title: "What “Dixie” is here",
      answer:
        "Dixie is an optional spoken entry path on Candidate onboarding—not a publish tool. After you explicitly enable it, the browser may listen only in this tab for a wake word, then briefly capture text you choose to submit with a verbal cue. Anything captured stays on this device until you review and copy—nothing publishes from spoken input alone.",
      links: [{ label: "Candidate onboarding", href: ASK_KELLY_SYSTEM_ROUTES.onboarding }],
      nextStep: "Treat typed questions in Ask Kelly on the public site as the dependable path unless your browser reliably supports recognition over HTTPS.",
    }),
  },
  {
    id: "dixie-portal-how",
    priority: 0,
    test: (n) =>
      containsAny(n, ["how does the dixie voice portal work", "how does dixie work"]) ||
      (/\bdixie\b/.test(n) &&
        containsAny(n, ["voice portal", "wake word"]) &&
        containsAny(n, ["how", "work", "why", "what", "explain"])),
    build: () => ({
      title: "How the Dixie voice portal behaves",
      answer:
        "Turn it on deliberately on Candidate onboarding—it does not listen until you choose “Enable.” The portal waits for your wake phrase, gathers what you speak until you submit with “go,” then stops and leaves the wording in the review box. You still copy text into Ask Kelly yourself; publishing site copy stays in the page editor with your normal confirmations.",
      links: [{ label: "Candidate onboarding", href: ASK_KELLY_SYSTEM_ROUTES.onboarding }],
      nextStep:
        "If speech recognition flakes out, toggle the portal off and type in Ask Kelly—you always keep the written path.",
    }),
  },
  {
    id: "talk-to-ask-kelly",
    priority: 0,
    test: (n) =>
      containsAny(n, [
        "how do i talk to ask kelly",
        "how can i talk to ask kelly",
        "how do you talk to ask kelly",
        "talk to ask kelly",
        "speak to ask kelly",
      ]),
    build: () => ({
      title: "How to interact with Ask Kelly",
      answer:
        "On the public site, open Ask Kelly in the corner and type your question—you can paste text drafted anywhere, including Candidate onboarding voice review boxes. Dixie capture on onboarding is optional and fills a manual review strip only—it never submits for you.",
      links: [{ label: "Candidate onboarding", href: ASK_KELLY_SYSTEM_ROUTES.onboarding }],
      nextStep: "Keep using typing as the baseline; use voice capture only when your browser supports it and you have enabled the portal yourself.",
    }),
  },
  {
    id: "dixie-publish",
    priority: 0,
    test: (n) =>
      containsAny(n, ["can dixie publish", "does dixie publish", "will dixie publish", "dixie publish"]) ||
      (/\bdixie\b/.test(n) && containsAny(n, ["publish", "go live", "goes live", "send live", "automatically update the site"]) && !containsAny(n, ["read aloud", "read this"])),
    build: () => ({
      title: "Publishing and Dixie",
      answer:
        "No. Dixie fills a plain review strip if your browser catches your speech correctly—nothing in that pathway writes to Page content or the live site automatically. Approved copy still travels through Page content review and confirmation in the usual editor flow.",
      links: [
        { label: "Page content", href: ASK_KELLY_SYSTEM_ROUTES.pages },
        { label: "How updates work", href: `${ASK_KELLY_SYSTEM_ROUTES.onboarding}#updates-heading` },
      ],
      nextStep: "Assume every change is unpublished until your editor confirmation finishes successfully.",
      safetyNote: "Spoken summaries are drafts only—inspect them closely before copying into any tool tied to voters, donors, or strategy.",
    }),
  },
  {
    id: "meta-help",
    priority: 0,
    test: (n) =>
      /\bwhat can i ask\b/.test(n) ||
      n.trim() === "help" ||
      containsAny(n, [
        "what do you do",
        "what can you do",
        "what is ask kelly",
        "how does ask kelly work",
        "how does this work",
      ]),
    build: () => ({
      title: "What you can ask",
      answer:
        "You can ask where admin tools live (Page content, beta feedback, workbench), how review and saves work before something goes live, what happens if a save fails, and how drafts behave when the connection drops. Answers follow the site route map and process guides—never donor or voter data.",
      links: [
        { label: "Candidate onboarding", href: ASK_KELLY_SYSTEM_ROUTES.onboarding },
        { label: "Page content", href: ASK_KELLY_SYSTEM_ROUTES.pages },
        { label: "Ask Kelly beta feedback", href: ASK_KELLY_SYSTEM_ROUTES.betaFeedback },
      ],
      nextStep:
        "Try “Where do I edit page copy?” from a public page with the dock open, or read the “What can I ask?” section on Candidate onboarding.",
    }),
  },
  {
    id: "candidate-onboarding-locate",
    priority: 0,
    test: (n) =>
      containsAny(n, [
        "where is candidate onboarding",
        "where's candidate onboarding",
        "candidate onboarding",
      ]) && containsAny(n, ["where", "find", "is", "link", "path"]),
    build: () => ({
      title: "Candidate onboarding",
      answer:
        "Candidate onboarding is the admin home for learning the tools: where page editing lives, where beta feedback is triaged, and how updates are meant to flow. It does not change the public site by itself—it orients you.",
      links: [{ label: "Candidate onboarding", href: ASK_KELLY_SYSTEM_ROUTES.onboarding }],
      nextStep: "Open that page, read “First things to learn,” then open Page content when you’re ready to try a hero edit.",
    }),
  },
  {
    id: "final-authority",
    priority: 0,
    test: (n) =>
      containsAny(n, [
        "who has final say",
        "who decides what goes live",
        "what goes live",
        "final say",
        "final call",
        "who approves the site",
      ]) || (containsAny(n, ["goes live", "live site", "public site"]) && containsAny(n, ["who", "decides", "approve"])),
    build: () => ({
      title: "Who decides what the public sees",
      answer:
        "Public wording changes only when someone with access completes the page editor flow and the final save succeeds. Staff can sort and surface beta feedback for you—they do not replace that save step. For site copy tied to this workflow, you have final say on what you choose to publish through the editor.",
      links: [
        { label: "How updates work (onboarding)", href: `${ASK_KELLY_SYSTEM_ROUTES.onboarding}#updates-heading` },
        { label: "Page content", href: ASK_KELLY_SYSTEM_ROUTES.pages },
      ],
      nextStep: "When in doubt, open Page content, make a small draft, and walk through review to the final save so you see the full sequence once.",
      safetyNote: "This describes the shipped editor workflow—not legal sign-off for every jurisdiction; counsel still governs sensitive content.",
    }),
  },
  {
    id: "staff-publish",
    priority: 0,
    test: (n) =>
      containsAny(n, [
        "can staff change the website",
        "can staff publish",
        "why can't staff publish",
        "why cant staff publish",
        "do staff publish",
        "staff publish changes",
      ]),
    build: () => ({
      title: "Staff and the public site",
      answer:
        "Staff can help triage beta notes and coordinate with you—they don’t silently overwrite public page copy from a side channel. Published wording still goes through the same page editor and final save you control when you’re the one updating copy.",
      links: [
        { label: "Ask Kelly beta feedback", href: ASK_KELLY_SYSTEM_ROUTES.betaFeedback },
        { label: "Page content", href: ASK_KELLY_SYSTEM_ROUTES.pages },
      ],
      nextStep: "If you’re unsure who should click “save,” align with the campaign manager first, then run the change in Page content under your login.",
    }),
  },
  {
    id: "start-here",
    priority: 1,
    test: (n) =>
      containsAny(n, [
        "where do i start",
        "where should i start",
        "how do i begin",
        "getting started",
        "where to start",
      ]) ||
      /\bwhere\b.*\b(start|begin)\b/.test(n) ||
      /\b(first step|first thing)\b/.test(n),
    build: () => ({
      title: "Start here",
      answer:
        "Your orientation screen is Candidate onboarding—it maps the dashboards, explains how beta feedback is triaged, and points you to Page content when you’re ready to edit public wording. Nothing on that screen alone pushes a change live.",
      links: [
        { label: "Candidate onboarding", href: ASK_KELLY_SYSTEM_ROUTES.onboarding },
        { label: "Campaign workbench", href: ASK_KELLY_SYSTEM_ROUTES.workbench },
      ],
      nextStep: "Open Candidate onboarding, skim “First things to learn,” then open Page content when you want to try one hero edit end-to-end.",
    }),
  },
  {
    id: "writing-partner-rewrite",
    priority: 1,
    test: (n) =>
      containsAny(n, ["writing partner", "rewrite", "rewriting", "reword", "tighten wording", "polish this", "polish copy"]) ||
      (containsAny(n, ["help me write", "help wording", "wording help"]) &&
        containsAny(n, ["page", "section", "hero", "copy", "paragraph", "subtitle", "website", "site"])) ||
      /\bhelp me rewrite\b/.test(n),
    build: () => ({
      title: "Writing help and the page editor",
      answer:
        "Ask Kelly can guide structure, suggest phrasing, and point you to Page content for the right screen. Final edits always happen in the page editor where you can compare to what’s live, confirm, then send the update. Nothing goes live without your review and that final save—there is no silent publish from the guide. The guide does not open voter files, donor records, or internal strategy documents.",
      links: [
        { label: "Page content", href: ASK_KELLY_SYSTEM_ROUTES.pages },
        { label: "How updates work", href: `${ASK_KELLY_SYSTEM_ROUTES.onboarding}#updates-heading` },
      ],
      nextStep: "Open Page content, pick a section, draft a small change, and run it through review → save once so the sequence is familiar.",
    }),
  },
  {
    id: "voice-input-planned",
    priority: 1,
    test: (n) =>
      containsAny(n, [
        "talk to the system",
        "talk to this system",
        "voice input",
        "speech to text",
        "dictate",
        "speak instead of type",
        "use my voice to",
        "use my voice",
        "talk instead of type",
        "can i talk to the",
        "can i use my voice",
      ]) && !containsAny(n, ["read aloud", "text to speech", "listen to", "read this", "tts", "hear this"]),
    build: () => ({
      title: "Voice input (planned)",
      answer:
        "Using your voice instead of typing into the public Ask Kelly guide is still a planned capability—not something every browser exposes reliably yet. Candidate onboarding may optionally offer Dixie speech capture that fills a manual review strip after you deliberately enable it; that path still does not publish or overwrite site copy.",
      links: [{ label: "Candidate onboarding", href: ASK_KELLY_SYSTEM_ROUTES.onboarding }],
      nextStep: "Type your question in Ask Kelly unless you intentionally enable onboarding voice capture; ask your deployment contact if hands-free guides are supported in your browser stack.",
    }),
  },
  {
    id: "review-before-publish",
    priority: 1,
    test: (n) =>
      containsAny(n, [
        "before publishing",
        "before i publish",
        "before it goes live",
        "review before live",
        "review before publishing",
        "checklist before",
        "what should i review before",
        "what should i check before",
        "what do i check before",
      ]) ||
      (containsAny(n, ["what should i review", "what to review"]) && containsAny(n, ["publish", "live", "go live", "website", "site"])) ||
      /\bbefore\s+(i\s+)?(publish|going live)\b/.test(n),
    build: () => ({
      title: "Before publishing",
      answer:
        "Before you send an update live, compare your draft to what’s currently public, read the hero copy for tone and accuracy, and confirm you’re on the correct page. The final save is the step that writes to storage—if you’re not ready, stop short of that until you’ve had the review you need. Ask Kelly can recap the process; it does not bypass the editor or publish on its own.",
      links: [
        { label: "Page content", href: ASK_KELLY_SYSTEM_ROUTES.pages },
        { label: "Candidate onboarding (updates)", href: `${ASK_KELLY_SYSTEM_ROUTES.onboarding}#updates-heading` },
      ],
      nextStep: "Pick one page, make a tiny draft, and walk through review and confirm so you know exactly what “done” looks like before a high-visibility change.",
    }),
  },
  {
    id: "voting-rights-language",
    priority: 2,
    test: (n) =>
      containsAny(n, ["voting rights", "vote access", "ballot access"]) &&
      containsAny(n, ["where", "how", "update", "edit", "change", "language", "wording", "copy", "page"]),
    build: () => ({
      title: "Updating voting-rights language",
      answer:
        "Issue-specific public wording lives under Page content—open the list, find the pillar that matches the topic (for example “What we believe” or the page where that language lives on the site), then edit the hero fields there. Ask Kelly can steer you to the right dashboard; the authoritative change still happens in the editor with the usual review and save. Nothing here uses voter files or targeting data.",
      links: [
        { label: "Page content", href: ASK_KELLY_SYSTEM_ROUTES.pages },
        { label: "Example: What we believe", href: ASK_KELLY_SYSTEM_ROUTES.pageExample },
      ],
      nextStep: "From Page content, search the list for the page title you see on the public site, open it, then adjust the hero wording and complete the save path.",
    }),
  },
  {
    id: "edit-pages-copy",
    priority: 2,
    test: (n) =>
      containsAny(n, [
        "where do i update the website",
        "where do i update website",
        "update the website",
        "where do i change copy",
        "change copy",
        "edit copy",
        "how do i edit this page",
        "edit this page",
        "edit the website",
        "edit website",
        "edit page",
        "change a page",
        "change page copy",
        "hero text",
        "wording on the site",
        "update the page",
      ]) ||
      (containsAny(n, ["edit", "change", "update"]) && containsAny(n, ["page", "copy", "hero", "wording", "website", "site"])),
    build: () => ({
      title: "Page content",
      answer:
        "Here’s where to go: Page content—pick a page, open it, edit the hero (eyebrow, title, subtitle), review against what’s live, confirm, then send the update. Here’s what happens next: the save has to finish successfully before visitors see the change. Nothing changes publicly until that final save succeeds.",
      links: [
        { label: "Page content", href: ASK_KELLY_SYSTEM_ROUTES.pages },
        { label: "Example: What we believe", href: ASK_KELLY_SYSTEM_ROUTES.pageExample },
      ],
      nextStep: "Pick one low-visibility page, make a tiny text tweak, and walk the flow to the final save once so the rhythm is familiar.",
    }),
  },
  {
    id: "homepage",
    priority: 2,
    test: (n) =>
      containsAny(n, ["homepage", "home page", "front page", "main page"]) &&
      containsAny(n, ["edit", "change", "update", "how", "where"]),
    build: () => ({
      title: "Homepage",
      answer:
        "Homepage composition lives under its own admin screen (sections and featured content). It’s separate from editing a pillar page hero in Page content. Use homepage when you’re changing what the `/` route shows—not when you’re only fixing text on a single issue page.",
      links: [{ label: "Homepage (admin)", href: ASK_KELLY_SYSTEM_ROUTES.homepage }],
      nextStep: "Open Homepage, change one thing you understand, and complete the save path there so you know what it affects.",
    }),
  },
  {
    id: "beta-feedback",
    priority: 2,
    test: (n) =>
      containsAny(n, [
        "show me beta feedback",
        "show beta feedback",
        "where is feedback",
        "beta feedback",
        "ask kelly beta",
        "feedback queue",
        "tester feedback",
        "what did people submit",
        "what people submitted",
      ]) ||
      (containsAny(n, ["feedback", "beta", "testers", "submit"]) &&
        containsAny(n, ["where", "see", "find", "triage", "what did", "submitted"])),
    build: () => ({
      title: "Beta feedback (what people sent)",
      answer:
        "Here’s where to go: Ask Kelly beta feedback—that queue shows structured notes people sent from the site (categories + message). Here’s what happens next: staff can sort and surface items for you; nothing in that queue automatically rewrites public copy—you still apply changes through Page content when you choose to.",
      links: [{ label: "Ask Kelly beta feedback", href: ASK_KELLY_SYSTEM_ROUTES.betaFeedback }],
      nextStep: "Open the queue, read the newest items, and decide what belongs in the editor this week versus what can wait.",
    }),
  },
  {
    id: "workbench-dashboard",
    priority: 2,
    test: (n) =>
      containsAny(n, [
        "where is the dashboard",
        "where's the dashboard",
        "where is dashboard",
        "campaign dashboard",
        "the workbench",
      ]) ||
      (containsAny(n, ["workbench", "campaign workbench", "operator"]) && !containsAny(n, ["beta feedback", "ask kelly beta"])),
    build: () => ({
      title: "Campaign workbench (operations hub)",
      answer:
        "Here’s where to go for day-to-day campaign operations: Campaign workbench—threads, tasks, and shortcuts into deeper tools. It’s not the same screen as editing one page’s hero; use Page content for public wording changes.",
      links: [
        { label: "Campaign workbench", href: ASK_KELLY_SYSTEM_ROUTES.workbench },
        { label: "Content overview", href: ASK_KELLY_SYSTEM_ROUTES.contentOverview },
      ],
      nextStep: "Open the workbench from the admin sidebar and bookmark the panels you’ll use weekly.",
    }),
  },
  {
    id: "content-overview",
    priority: 4,
    test: (n) =>
      containsAny(n, ["content overview", "where is everything", "map of admin", "what's in admin"]) ||
      (n.includes("overview") && n.includes("admin")),
    build: () => ({
      title: "Content overview",
      answer:
        "Content overview is a short map of major admin areas—useful when you forget whether something lives under site content, workbench, or homepage.",
      links: [{ label: "Content overview", href: ASK_KELLY_SYSTEM_ROUTES.contentOverview }],
      nextStep: "Skim it once, then jump straight to Page content or Homepage for real edits.",
    }),
  },
  {
    id: "database-save",
    priority: 2,
    test: (n) =>
      containsAny(n, [
        "send to database",
        "save to database",
        "what does send to database",
        "what does send to the database",
        "when does it go live",
        "when does the site change",
        "double confirm",
        "double-confirm",
        "what happens when i save",
      ]) ||
      (containsAny(n, ["database", "save", "live", "public"]) &&
        containsAny(n, ["what happens", "when", "how does", "confirm", "mean"])),
    build: () => ({
      title: "Send to database (what it means)",
      answer:
        "\"Send to database\" means the editor is writing your approved draft into the site’s stored content for that page or section. Here’s what happens next: visitors only see it after that save completes successfully and the page reloads from that stored version. If you’re still in review, you haven’t finished that final step yet.",
      links: [
        { label: "Page content", href: ASK_KELLY_SYSTEM_ROUTES.pages },
        { label: "Candidate onboarding (updates)", href: `${ASK_KELLY_SYSTEM_ROUTES.onboarding}#updates-heading` },
      ],
      nextStep: "Run one tiny change through the full review → confirm → save path so the words feel familiar before a high-visibility edit.",
    }),
  },
  {
    id: "save-fails",
    priority: 1,
    test: (n) =>
      containsAny(n, [
        "save fails",
        "save failed",
        "if the save fails",
        "when save fails",
        "what if save",
        "failed to save",
        "save fail",
      ]) ||
      /\bsave\b.*\bfails?\b/.test(n) ||
      /\bfail\b.*\bsave\b/.test(n),
    build: () => ({
      title: "If the save fails",
      answer:
        "Here’s what happens next: the public page stays on the last good version. Your draft can stay in this browser until the connection and save succeed—nothing partial goes live from a half-finished error. Retry when the network is stable; if it keeps failing, stop and get help before you retype a long block.",
      links: [{ label: "Page content", href: ASK_KELLY_SYSTEM_ROUTES.pages }],
      nextStep: "Copy long copy into a separate note before retrying, then run the save again from Page content.",
      safetyNote: "If errors persist, it may be configuration or hosting—escalate to the person who manages admin access and deployment.",
    }),
  },
  {
    id: "offline-draft",
    priority: 2,
    test: (n) =>
      containsAny(n, [
        "lose internet",
        "lost internet",
        "internet drops",
        "offline",
        "bad connection",
        "spotty",
        "connection drops",
        "lose connection",
        "lost connection",
        "how do i recover a draft",
        "recover a draft",
        "draft recovery",
      ]),
    build: () => ({
      title: "Connection drops and drafts",
      answer:
        "If you lose connection mid-edit, unfinished work can stay in this browser as a draft—it doesn’t send by itself. If you see a recovered-draft prompt, you can restore or discard; that recovery is only on this device. Here’s what happens next: reconnect, open the same screen, and finish the review → save sequence when you’re ready.",
      links: [{ label: "Candidate onboarding (offline)", href: ASK_KELLY_SYSTEM_ROUTES.onboarding }],
      nextStep: "For anything critical, keep a separate copy outside the browser before a long session.",
    }),
  },
  {
    id: "staff-approve",
    priority: 3,
    test: (n) =>
      containsAny(n, ["staff", "campaign staff", "operator", "who approves", "approve feedback", "approval"]) &&
      containsAny(n, ["feedback", "beta", "queue", "approve", "who"]),
    build: () => ({
      title: "Who handles beta feedback",
      answer:
        "Staff can triage and label beta items for you. You still decide what matters and what becomes a real site change—public copy only updates through the editor save when you (or whoever owns that decision) completes it.",
      links: [
        { label: "Ask Kelly beta feedback", href: ASK_KELLY_SYSTEM_ROUTES.betaFeedback },
        { label: "How feedback works", href: `${ASK_KELLY_SYSTEM_ROUTES.onboarding}#feedback-heading` },
      ],
      nextStep: "Skim the queue, align with staff on priorities, then handle wording in Page content when you’re ready.",
    }),
  },
  {
    id: "voice-read",
    priority: 2,
    test: (n) =>
      containsAny(n, [
        "read aloud",
        "read this to me",
        "read this section",
        "read this aloud",
        "can you read this",
        "listen to this",
        "text to speech",
      ]) && !containsAny(n, ["unavailable", "doesn't work", "doesnt work", "not working", "why can't", "why cant"]),
    build: () => ({
      title: "Read-aloud on onboarding",
      answer:
        "On the candidate onboarding screen you can use read-aloud for the welcome block when the deployment has it enabled. The same words are on screen if you prefer to read quietly.",
      links: [{ label: "Candidate onboarding", href: ASK_KELLY_SYSTEM_ROUTES.onboarding }],
      nextStep: "Open onboarding and use the read-aloud control once; if it doesn’t play, read the section on screen—nothing else is required to keep working.",
    }),
  },
  {
    id: "voice-unavailable",
    priority: 1,
    test: (n) =>
      containsAny(n, [
        "why is voice unavailable",
        "voice unavailable",
        "read aloud not working",
        "why can't i hear",
        "why cant i hear",
        "tts not working",
        "no sound",
      ]),
    build: () => ({
      title: "When read-aloud isn’t available",
      answer:
        "Read-aloud depends on server-side audio configuration for this deployment. If it’s off, you still have the full written onboarding and the same edit paths—nothing is blocked because audio failed.",
      links: [{ label: "Candidate onboarding", href: ASK_KELLY_SYSTEM_ROUTES.onboarding }],
      nextStep: "Continue in writing; ask the person who runs deployment if audio should be enabled for this environment.",
      safetyNote: "Voice features require valid environment configuration on the server; that’s operational, not a reflection of your access level.",
    }),
  },
];

function buildMatched(built: RuleBuild, pathname?: string): AskKellySystemGuideResult {
  const prefaced = applyAdminPreface(built, pathname);
  return {
    matched: true,
    title: prefaced.title,
    answer: prefaced.answer,
    links: prefaced.links,
    nextStep: prefaced.nextStep,
    ...(prefaced.safetyNote?.trim() ? { safetyNote: prefaced.safetyNote.trim() } : {}),
  };
}

export function answerAskKellySystemGuide(message: string, context?: { pathname?: string }): AskKellySystemGuideResult {
  const trimmed = message.trim();
  if (trimmed.length < 2) return { matched: false };

  const n = norm(trimmed);
  const pathname = context?.pathname;

  const already = tryAlreadyHere(n, pathname);
  if (already && already.matched) return already;

  const locKind = detectLocationKind(n);
  if (locKind) {
    const loc = buildLocationAnswer(locKind, pathname);
    if (loc && loc.matched) return loc;
  }

  const editor = tryEditorThisPage(n, pathname);
  if (editor && editor.matched) return editor;

  const candidates = rules.filter((r) => r.test(n)).sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return rules.indexOf(a) - rules.indexOf(b);
  });
  const pick = candidates[0];
  if (!pick) return { matched: false };

  const built = pick.build();
  return buildMatched(built, pathname);
}

/**
 * Reply body streamed to clients. Omit safety note text when UI shows `safetyNote` separately.
 */
export function formatAskKellySystemGuideReply(
  match: Exclude<AskKellySystemGuideResult, { matched: false }>,
  options?: { includeSafetyNoteInBody?: boolean },
): string {
  let s = `${match.title}\n\n${match.answer}`.trim();
  const include = options?.includeSafetyNoteInBody !== false;
  if (include && match.safetyNote?.trim()) {
    s += `\n\nNote: ${match.safetyNote.trim()}`;
  }
  return s;
}
