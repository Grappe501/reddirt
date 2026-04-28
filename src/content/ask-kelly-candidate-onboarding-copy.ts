/**
 * Kelly candidate onboarding — calm, human copy for /admin/ask-kelly.
 * (Not a product name; describes the person using the tools.)
 */

/** Primary line under the Ask Kelly console title — serious, personal (V2.12). */
export const ASK_KELLY_ONBOARDING_COMMAND_CENTER_TAGLINE =
  "The guide sits inside your campaign operating system—not apart from it. It maps the dashboards, respects your confirmations, and keeps public changes review-first.";

export const ASK_KELLY_COMMAND_CONSOLE_HEADER = {
  /** Main H1-adjacent label for /admin/ask-kelly shell (V2.12). */
  title: "Ask Kelly command console",
  /** One restrained line under the title. */
  lead:
    "A single orientation surface for Kelly and whoever runs day-to-day with her: routing, drafts, confirmations, and the same safety rails everywhere.",
};

export const ASK_KELLY_CONFIDENCE_BLOCK = {
  title: "Built so you do not have to reteach the system every time",
  paragraphs: [
    "The guide draws on approved campaign materials, public site content, and public-safe orientation docs. It is shaped to speak in Kelly’s campaign language—not to replace her judgment.",
    "Suggestions stay draft until you apply them where they belong: the page editor for public wording, or the dashboard designed for sensitive work.",
    "Nothing publishes without review and confirmation you control.",
  ] as const,
};

/** Interface framing only — same entry model today; prioritization evolves with permissions (V2.12). */
export const ASK_KELLY_ROLE_CONSOLE_FRAMING = {
  candidate: {
    title: "Candidate console",
    body: [
      "Same Ask Kelly guide and Dixie entry model as elsewhere. Today the emphasis is familiar: Page content, tester feedback, your public voice, approvals.",
      "Website copy flows through draft → review → confirm → send update to site—the guide explains the path and does not skip your final say.",
    ] as const,
  },
  manager: {
    title: "Campaign manager console",
    body: [
      "Same guide and Dixie posture. Operational work—workbench, tasks, dashboards, queues, summaries—clusters here first as you deepen use.",
      "The guide clarifies routes and meanings; heavy automation is not promised in this shell.",
    ] as const,
  },
};

export const ASK_KELLY_SAFE_ACCESS_SECTION = {
  title: "Safe access",
  paragraphs: [
    "Ask Kelly can point to dashboards and explain what a screen is for using policy-safe, route-level context.",
    "Future reporting from this direction should rely on aggregates and summaries—not row-level supporter data in the general guide.",
    "Individual voter records, donor and treasury records, and private strategy are out of scope for public-facing Ask Kelly. Sensitive work stays in purpose-built dashboards with appropriate permissions.",
  ] as const,
};

/** Placeholder card — draft partner, not autonomous editing (V2.12). */
export const ASK_KELLY_WRITING_SURFACE_PARTNER = {
  title: "Writing surface partner (in development)",
  paragraphs: [
    "Over time Ask Kelly will help draft, revise, and strengthen website and broader campaign language—but always as suggested text.",
    "It will rely on approved writing references and your campaign context. You review every line before it touches the live site.",
    "The page editor remains where public wording goes live.",
  ] as const,
};

export const ASK_KELLY_DIXIE_CONSOLE_NOTE = {
  title: "Dixie — optional voice entry",
  bullets: [
    "User-enabled only: open the portal on this page before anything listens.",
    "Wake phrase “Dixie,” then capture until you submit with “go.” The transcript lands in review first—nothing publishes from speech alone.",
  ] as const,
};

/** Capability snapshot for the onboarding console (V2.14 — not persisted; editorial status). */
/** V2.15 — Fast access surface on Candidate onboarding; links only (no sends). */
export const ASK_KELLY_CANDIDATE_COMMUNICATION_BOARD = {
  sectionTitle: "Candidate command board",
  sectionLead:
    "One orientation surface—links only; nothing here sends mail, SMS, or mass messages. Use connected workbenches for review and approval workflows.",
  cards: [
    {
      id: "ask-kelly",
      title: "Ask Kelly · Dixie",
      state: "live" as const,
      stateLabel: "Console",
      description:
        "Orientation and voice-review posture match the public site: approved sources, draft-by-default, no open-ended browsing.",
      complianceNote: "",
      href: "/admin/ask-kelly",
      actionLabel: "Console overview",
    },
    {
      id: "website-pages",
      title: "Website & page copy",
      state: "live" as const,
      stateLabel: "Editor",
      description:
        "Edit public page heroes and structured content. Changes publish only after draft → review → confirm → save—not from this dashboard alone.",
      complianceNote: "",
      href: "/admin/pages",
      actionLabel: "Open Page content",
    },
    {
      id: "feedback-beta",
      title: "Ask Kelly beta feedback",
      state: "live" as const,
      stateLabel: "Queue",
      description:
        "Tester notes go to triage—they do not overwrite the live site. Staff may sort items for Kelly; nothing auto-publishes.",
      complianceNote: "",
      href: "/admin/workbench/ask-kelly-beta",
      actionLabel: "Open beta triage",
    },
    {
      id: "social",
      title: "Social performance",
      state: "live" as const,
      stateLabel: "Workbench",
      description:
        "Social stats connection pending for a headline number on this console—open the Social workbench for drafts, platforms, and performance context.",
      complianceNote: "",
      href: "/admin/workbench/social",
      actionLabel: "Open Social workbench",
    },
    {
      id: "email",
      title: "Email programs",
      state: "live" as const,
      stateLabel: "Hub",
      description:
        "SendGrid-backed rails exist when keys are set—use the Comms hub for broadcasts, plans, and approval chains.",
      complianceNote: "Mass messages require approval and compliance checks.",
      href: "/admin/workbench/comms",
      actionLabel: "Open comms hub",
    },
    {
      id: "sms",
      title: "Text (SMS)",
      state: "live" as const,
      stateLabel: "Broadcasts",
      description:
        "Twilio-style SMS routing is code-complete; production sends require verified env and approvals in the broadcast flow.",
      complianceNote: "Mass messages require approval and compliance checks.",
      href: "/admin/workbench/comms/broadcasts",
      actionLabel: "Open broadcasts",
    },
    {
      id: "individual",
      title: "Campaign workbench",
      state: "live" as const,
      stateLabel: "Lanes",
      description:
        "Cross-tool hub for tasks, intake, and scripted touches—paired with orchestrator queues for inbound content routing.",
      complianceNote: "",
      href: "/admin/workbench",
      actionLabel: "Open workbench",
    },
    {
      id: "ops-kpi",
      title: "Command center · KPIs",
      state: "live" as const,
      stateLabel: "Orchestrator",
      description:
        "Aggregate inbound counts, queues, and status tiles—better “where are we right now.” Not a substitute for finance or voter-file reporting.",
      complianceNote: "",
      href: "/admin/orchestrator",
      actionLabel: "Open command center",
    },
    {
      id: "county-workbench",
      title: "County briefing hub",
      state: "live" as const,
      stateLabel: "Public + admin",
      description:
        "Public hub at /county-briefings; Pope pilot at /county-briefings/pope and /county-briefings/pope/v2; staff views at /admin/county-intelligence. Eight-county expansion parity: see docs/NORTHWEST_REGION_AND_8_COUNTY_WORKBENCH_PARITY_AUDIT.md (no fabricated targets).",
      complianceNote: "",
      href: "/county-briefings",
      actionLabel: "Open county briefings",
    },
    {
      id: "reports",
      title: "Reports & insights",
      state: "planned" as const,
      stateLabel: "Scaffold",
      description:
        "Aggregate summaries and connector health over time—no raw voter rows in this shell. Today /admin/insights is a placeholder page; charts land after orchestrator data hardens.",
      complianceNote: "",
      href: "/admin/insights",
      actionLabel: "Open insights (placeholder)",
    },
    {
      id: "candidate-identity",
      title: "Candidate voter identity",
      state: "planned" as const,
      stateLabel: "Staff-assisted",
      description:
        "Linking an admin user to a single voter file row is staff-assisted when ops configures it—no self-serve public search for Kelly in this build.",
      complianceNote: "",
      href: undefined,
      actionLabel: "Coordinator setup · no open search",
    },
  ] as const,
};

export const ASK_KELLY_MANUAL_OF_EVERYTHING_STATUS = {
  title: "Manual of Everything status",
  intro:
    "The full campaign-system manual stays internal; approved excerpts surface through guided training and chunked docs—not wholesale ingestion into public tools.",
  rows: [
    { label: "Guided onboarding", status: "Live" },
    { label: "System guide (Ask Kelly intents)", status: "Live" },
    { label: "Safe docs (public RAG corpus)", status: "Partial" },
    { label: "Full manual training (admin-grounded retrieval)", status: "Staged" },
    { label: "Report engine", status: "Planned" },
  ] as const,
};

export const ASK_KELLY_ONBOARDING_WELCOME = {
  title: "Welcome — you’re in the right place",
  body: [
    "This space is here so you can learn the site tools at your own pace—before you change anything live.",
    "You can review feedback from the beta, update public page wording where you have the keys, see how the admin areas fit together, and look up where common tasks live.",
    "Ask Kelly is the guide—not a detached help desk. It explains the operating system before it asks you to click through it.",
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

/** Grouped prompts for the public Ask Kelly dock (V2.6) — examples only, no data access. */
export const ASK_KELLY_WHAT_CAN_I_ASK = {
  title: "What can I ask?",
  intro:
    "On the public site, open Ask Kelly (bottom-right) and type in your own words—or start from examples like these. The guide covers routing and process, not donor or voter files.",
  groups: [
    {
      heading: "Find a dashboard",
      examples: ["Where is the dashboard?", "Where is candidate onboarding?", "Where do I see beta feedback?"] as const,
    },
    {
      heading: "Edit the website",
      examples: ["Where do I edit page copy?", "What does send to database mean?", "What happens if the save fails?"] as const,
    },
    {
      heading: "Understand approvals",
      examples: ["Who has final say?", "Can staff change the website?", "What goes live and when?"] as const,
    },
    {
      heading: "Recover a draft",
      examples: ["How do I recover a draft?", "What if I lose connection?"] as const,
    },
    {
      heading: "Use voice assist",
      examples: ["Can you read this to me?", "Why is voice unavailable?"] as const,
    },
  ] as const,
} as const;

/** localStorage key — client-only onboarding progress for /admin/ask-kelly (V2.9). */
export const ASK_KELLY_CANDIDATE_ONBOARDING_PROGRESS_KEY = "ask_kelly_candidate_onboarding_progress_v1";

/** Short lines to copy into the public site guide from the onboarding portal. */
export const ASK_KELLY_PORTAL_GUIDE_PROMPTS = [
  "Where should I start?",
  "Explain page updates.",
  "What can staff do?",
  "What happens if I skip onboarding?",
  "How do I recover a draft?",
] as const;

/** V2.10 — Writing / navigation examples for the public site guide (paste into Ask Kelly). */
export const ASK_KELLY_PORTAL_WRITING_NAV_PROMPTS = [
  "Help me rewrite a page section.",
  "Where do I update voting rights language?",
  "Walk me through changing website copy.",
  "Read this section aloud.",
  "What should I review before publishing?",
] as const;

/** V2.10 — Admin onboarding: how voice + the site guide fit with the page editor (no auto-publish). */
export const ASK_KELLY_VOICE_WRITING_PARTNER = {
  title: "Voice and writing partner",
  intro:
    "Ask Kelly is the site guide: it can point you to dashboards, explain what each area is for, and walk through process in plain language.",
  points: [
    "You can use Ask Kelly to find where to work—Page content, beta feedback, workbench—and to understand what happens before something is public.",
    "Read-aloud is available where this deployment has it enabled (for example on this page). It is optional; the written path is always there.",
    "Speaking to fill in the guide instead of typing is a planned capability for a later release. Until then, type your question in the guide as usual.",
    "Help with website wording stays review-first: the guide can suggest direction, but you apply and approve changes in the page editor. Nothing goes live without your review and a successful save—there is no automatic publish from the guide.",
  ],
} as const;

/** V2.9 staged portal — copy only, no data access. */
export const ASK_KELLY_PORTAL = {
  promptChipsIntro:
    "Open Ask Kelly on the public site (bottom-right), paste a line below, or use it with staff. The guide covers routes and process—not donor files, voter rows, or internal strategy.",
  stage1: {
    label: "Welcome",
    title: "You’re at the entry to the system",
    lead:
      "This page opens the map: how the campaign site’s admin areas connect, where hero copy is edited, and how a change earns its way to the public version only after clear review.",
    body: [
      "Ask Kelly is the guide woven through that map—routing, plain-language process, reminders of what confirmation means—not a separate desk you have to plead with.",
      "Nothing you read here bypasses the editor. When you are ready to publish, the controls you already trust still apply.",
    ],
  },
  stage2: {
    label: "How this onboarding works",
    title: "Your pace. Your questions.",
    body: [
      "Continue when you are ready. You can skip ahead in the sidebar anytime—links stay available.",
      "If you step away, your progress on this walkthrough is remembered only in this browser until you restart it.",
      "The public site does not change until you finish the right confirmations in Page content—not from this overview alone.",
    ],
  },
  stage3: {
    label: "Page content",
    title: "First area: page copy",
    why: "Visitors read what you publish here. Drafts and reviews exist so wording is intentional before anything goes live.",
    flowIntro: "Updates follow a steady sequence:",
    flow: [
      { name: "Draft", detail: "Edit in the page editor while you think it through." },
      { name: "Review", detail: "Compare what is live to what you propose." },
      { name: "Confirm", detail: "Signal you are ready for a final check." },
      { name: "Send update to site", detail: "Saves so visitors see the new copy—only after that step succeeds." },
    ],
    ctaOpen: "Open Page content",
    ctaComplete: "Mark step complete",
  },
  stage4: {
    label: "Ask Kelly — beta feedback",
    title: "Feedback from testers",
    body: [
      "Notes from the Ask Kelly beta land in a queue you can open from the workbench.",
      "Staff may sort or surface items for you. You decide what to act on.",
      "Nothing in that queue rewrites the site by itself—public copy still goes through the page editor when you choose.",
    ],
    ctaOpen: "Open beta feedback",
    ctaComplete: "Mark step complete",
  },
  stage5: {
    label: "Campaign workbench",
    title: "Operational view",
    body: [
      "The workbench is a hub for campaign-side tools and links. Use it to move between tasks without hunting the full menu every time.",
      "It does not run your operation for you—it organizes access. What you do there still follows each tool’s own rules and confirmations.",
    ],
    ctaOpen: "Open workbench",
    ctaComplete: "Mark step complete",
  },
  stage6: {
    label: "Voice and connection",
    title: "Read-aloud and spotty connections",
    body: [
      "Read-aloud is optional. If it is unavailable, read on screen as usual.",
      "If the connection drops while you edit, work can stay in this browser as a draft until you save or send again—nothing sends by itself.",
    ],
    ctaComplete: "Mark step complete",
  },
  stage7: {
    label: "Ready",
    title: "You can start now.",
    lead: "Pick a next action, or return here whenever you need the map.",
    ctaPages: "Start with Page content",
    ctaBeta: "Review beta feedback",
    ctaGuide: "Ask where something is",
    ctaDone: "Finish onboarding walkthrough",
  },
} as const;

/** Plain text for read-aloud in the voice step (stage 6). */
export const ASK_KELLY_PORTAL_STAGE6_READ_ALOUD = [
  ASK_KELLY_PORTAL.stage6.title,
  ...ASK_KELLY_PORTAL.stage6.body,
  ASK_KELLY_VOICE_ASSIST_ADMIN_NOTE,
].join(" ");
