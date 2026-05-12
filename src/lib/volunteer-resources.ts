import { VOLUNTEER_OS_DEMO_TEAM_SLUG } from "@/lib/team-naming";

export type VolunteerResourceCategoryId =
  | "getting-started"
  | "team-building"
  | "roles"
  | "weekly-operations"
  | "recruitment"
  | "printables"
  | "playbook"
  | "email-templates"
  | "messaging-talking-points"
  | "team-launch-kit"
  | "county-party-organizing"
  | "events-lane-toolkits"
  | "muslim-community-outreach"
  | "youth-p5-outreach"
  | "social-media-design";

export type VolunteerResourcePublicationStatus =
  | "draft"
  | "internal_review"
  | "mockup_ready"
  | "approved"
  | "published";

/** Ernie polish / review pipeline — required before any binary download ships. */
export type ErnieReviewStatus =
  | "not_started"
  | "needs_document_build"
  | "ready_for_ernie"
  | "in_ernie_review"
  | "revision_needed"
  | "ernie_approved";

export type VolunteerResourceMockupStatus =
  | "not_started"
  | "draft_needed"
  | "mockup_ready"
  | "approved_mockup";

export type CampaignApprovalStatus = "not_started" | "pending" | "approved" | "rejected";

export const ERNIE_REVIEW_LABELS: Record<ErnieReviewStatus, string> = {
  not_started: "Not started",
  needs_document_build: "Needs document build",
  ready_for_ernie: "Ready for Ernie",
  in_ernie_review: "In Ernie review",
  revision_needed: "Revision needed",
  ernie_approved: "Ernie approved",
};

export const MOCKUP_STATUS_LABELS: Record<VolunteerResourceMockupStatus, string> = {
  not_started: "Not started",
  draft_needed: "Draft needed",
  mockup_ready: "Design preview",
  approved_mockup: "Mockup approved",
};

export const CAMPAIGN_APPROVAL_LABELS: Record<CampaignApprovalStatus, string> = {
  not_started: "Not started",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export type VolunteerResourceCategory = {
  id: VolunteerResourceCategoryId;
  title: string;
  description: string;
};

export const VOLUNTEER_RESOURCE_CATEGORIES: VolunteerResourceCategory[] = [
  {
    id: "getting-started",
    title: "Getting started",
    description: "Orientation, welcome, and first-session materials.",
  },
  {
    id: "team-building",
    title: "Team building",
    description: "How to stand up and launch a 3-person geographic team.",
  },
  { id: "roles", title: "Role guides", description: "Lane-specific guides for coordinators." },
  {
    id: "weekly-operations",
    title: "Weekly operations",
    description: "Huddles, reporting, and light metrics.",
  },
  { id: "recruitment", title: "Recruitment", description: "Pitch, FAQ, and sharing tools." },
  { id: "printables", title: "Printable materials", description: "One-pagers, cards, and event sheets." },
  {
    id: "playbook",
    title: "Full playbook",
    description: "Complete field manual in the browser (and future PDF).",
  },
  {
    id: "email-templates",
    title: "Email templates",
    description: "Copy-ready shells for volunteers — fill names in your mail app; keep claims factual.",
  },
  {
    id: "messaging-talking-points",
    title: "Messaging & talking points",
    description: "Consistent language for doors, texts, events, and social posts.",
  },
  {
    id: "team-launch-kit",
    title: "Team Launch Kit",
    description: "Checklists, templates, and operational glue for new triads — build the next team.",
  },
  {
    id: "county-party-organizing",
    title: "County Democratic Party organizing",
    description:
      "Monthly meeting rhythm, P5 outreach, precinct triads, VR toolkit, and comms aligned with the county dashboard and Volunteer OS.",
  },
  {
    id: "events-lane-toolkits",
    title: "Events lane · field scheduling",
    description:
      "House parties, county fundraisers, weekend immersions, two-day city visits, faith communities, festivals, and travel rhythm — execution playbooks for the Events coordinator and hosts.",
  },
  {
    id: "muslim-community-outreach",
    title: "Muslim Community outreach (draft)",
    description:
      "Youth and Women’s civic organizing resources — draft pending Muslim community leadership review. Not final until reviewed.",
  },
  {
    id: "youth-p5-outreach",
    title: "Youth Outreach (P5/VR)",
    description:
      "Campus teams, student registration, social recruitment — formal sub-lane under Power of 5 / Voter Registration across the VOS.",
  },
  {
    id: "social-media-design",
    title: "Social media & design",
    description: "Canva, local graphics, brand kit, and templates so teams ship visuals without waiting on HQ.",
  },
];

export type VolunteerResource = {
  id: string;
  title: string;
  description: string;
  category: VolunteerResourceCategoryId;
  /** Absolute URL, `/path` on this site, or `https://…` */
  href: string;
  fileType?: string;
  fileSize?: string;
  comingSoon?: boolean;
  /**
   * Optional override for download / release workflow. If omitted, status is inferred
   * (PDFs default to draft when comingSoon; web pages default to published when not comingSoon).
   */
  publicationStatus?: VolunteerResourcePublicationStatus;
  /**
   * When true (default for PDFs), direct download is blocked until Ernie + campaign + on-disk file gates pass.
   * Set false only for rare exceptions documented in production notes.
   */
  ernieReviewRequired?: boolean;
  ernieReviewStatus?: ErnieReviewStatus;
  mockupStatus?: VolunteerResourceMockupStatus;
  campaignApprovalStatus?: CampaignApprovalStatus;
  productionNotes?: string;
};

export const VOLUNTEER_RESOURCE_PUBLICATION_LABELS: Record<VolunteerResourcePublicationStatus, string> = {
  draft: "Draft",
  internal_review: "Internal review",
  mockup_ready: "Design preview",
  approved: "Approved",
  published: "Published",
};

export const VOLUNTEER_RESOURCES: VolunteerResource[] = [
  {
    id: "quick-start",
    category: "getting-started",
    title: "Quick start guide",
    description: "Fast orientation for brand-new volunteers.",
    href: "/resources/getting-started/quick-start-guide.pdf",
    fileType: "PDF",
    comingSoon: true,
  },
  {
    id: "welcome-packet",
    category: "getting-started",
    title: "Volunteer welcome packet",
    description: "What to expect and how to plug in locally.",
    href: "/resources/getting-started/volunteer-welcome-packet.pdf",
    fileType: "PDF",
    comingSoon: true,
  },
  {
    id: "first-15",
    category: "getting-started",
    title: "First 15 minutes checklist",
    description: "Same steps as the onboarding page, printable.",
    href: "/volunteer#first-15-minutes",
    fileType: "Web",
  },
  {
    id: "build-team",
    category: "team-building",
    title: "How to build a 3-person team",
    description: "Full module: one person → pair → three lanes, geography, downstream teams.",
    href: "/volunteer#build-three-person-team",
    fileType: "Web",
  },
  {
    id: "team-launch-checklist",
    category: "team-building",
    title: "Team launch checklist",
    description: "Before you go live as a triad.",
    href: "/resources/team-building/team-launch-checklist.pdf",
    fileType: "PDF",
    comingSoon: true,
  },
  {
    id: "team-builder-worksheet",
    category: "team-building",
    title: "Team builder worksheet",
    description: "Capture geography, lanes, and upstream contact.",
    href: "/resources/team-building/team-builder-worksheet.pdf",
    fileType: "PDF",
    comingSoon: true,
  },
  {
    id: "geographic-guide",
    category: "team-building",
    title: "Geographic team guide",
    description: "County vs city vs precinct vs neighborhood framing.",
    href: "/field-playbook/structure/fractal-overview",
    fileType: "Web",
  },
  {
    id: "role-events",
    category: "roles",
    title: "Events coordinator guide",
    description: "Planning and hosting local moments.",
    href: "/field-playbook/roles/events-coordinator",
    fileType: "Web",
  },
  {
    id: "role-social",
    category: "roles",
    title: "Social media coordinator guide",
    description: "Amplify approved content responsibly.",
    href: "/field-playbook/roles/social-coordinator",
    fileType: "Web",
  },
  {
    id: "role-p5",
    category: "roles",
    title: "Power of 5 / voter registration guide",
    description: "Relational organizing and registration support.",
    href: "/field-playbook/roles/power-of-five-coordinator",
    fileType: "Web",
  },
  {
    id: "huddle-agenda",
    category: "weekly-operations",
    title: "Weekly huddle agenda",
    description: "30-minute team rhythm template.",
    href: "/field-playbook/rhythm/weekly-huddle",
    fileType: "Web",
  },
  {
    id: "reporting-template",
    category: "weekly-operations",
    title: "Weekly reporting template",
    description: "Short report your upstream contact can forward.",
    href: "/resources/weekly-operations/weekly-reporting-template.pdf",
    fileType: "PDF",
    comingSoon: true,
  },
  {
    id: "metrics-tracker",
    category: "weekly-operations",
    title: "Metrics tracker",
    description: "Lightweight team scoreboard definitions.",
    href: "/field-playbook/metrics/key-metrics",
    fileType: "Web",
  },
  {
    id: "pitch-script",
    category: "recruitment",
    title: "Volunteer pitch script",
    description: "Friendly invite language for friends and neighbors.",
    href: "/field-playbook/recruitment/pitch-and-faq",
    fileType: "Web",
  },
  {
    id: "recruitment-faq",
    category: "recruitment",
    title: "FAQ",
    description: "Common volunteer questions.",
    href: "/field-playbook/recruitment/pitch-and-faq",
    fileType: "Web",
  },
  {
    id: "local-post-ideas",
    category: "recruitment",
    title: "Local post ideas",
    description: "Prompts for weekly local social posts (also on the team dashboard Resources tab).",
    href: `/dashboard/team/${VOLUNTEER_OS_DEMO_TEAM_SLUG}/resources#local-post-ideas`,
    fileType: "Web",
  },
  {
    id: "qr-sharing",
    category: "recruitment",
    title: "QR code sharing guide",
    description: "How to point people at /volunteer from posters and tables.",
    href: "/resources/recruitment/qr-code-sharing-guide.pdf",
    fileType: "PDF",
    comingSoon: true,
  },
  {
    id: "volunteer-qr",
    category: "recruitment",
    title: "Volunteer QR code",
    description: "A printable QR code linking directly to the volunteer onboarding page.",
    href: "/resources/recruitment/volunteer-qr-code.pdf",
    fileType: "PDF",
    comingSoon: true,
  },
  {
    id: "role-cards-print",
    category: "printables",
    title: "One-page role cards",
    description: "Events, social, and Power of 5 at a glance.",
    href: "/resources/printables/role-cards.pdf",
    fileType: "PDF",
    comingSoon: true,
  },
  {
    id: "team-worksheet-print",
    category: "printables",
    title: "Team worksheets",
    description: "Printable triad planning sheets.",
    href: "/resources/printables/team-worksheets.pdf",
    fileType: "PDF",
    comingSoon: true,
  },
  {
    id: "event-checklist-print",
    category: "printables",
    title: "Event checklists",
    description: "Day-of and week-before event steps.",
    href: "/resources/printables/event-checklists.pdf",
    fileType: "PDF",
    comingSoon: true,
  },
  {
    id: "playbook-pdf",
    category: "playbook",
    title: "Complete field playbook (PDF)",
    description: "Single downloadable manual — ship when asset exists.",
    href: "/resources/playbook/field-playbook-complete.pdf",
    fileType: "PDF",
    comingSoon: true,
  },
  {
    id: "playbook-web",
    category: "playbook",
    title: "Field playbook (web)",
    description: "Full manual with navigation — same content as PDF, always current.",
    href: "/field-playbook",
    fileType: "Web",
  },
  {
    id: "email-templates-hub",
    category: "email-templates",
    title: "Email templates hub",
    description: "Volunteer invite, downstream fit check, post-approval link, events, follow-ups, and more.",
    href: "/volunteer/resources/email-templates",
    fileType: "Web",
  },
  {
    id: "email-invite-volunteer",
    category: "email-templates",
    title: "Invite someone to volunteer",
    description: "Short shell pointing to /volunteer with warm, low-pressure language.",
    href: "/volunteer/resources/email-templates#invite-volunteer",
    fileType: "Web",
  },
  {
    id: "email-downstream-fit",
    category: "email-templates",
    title: "Ask a downstream team lead about fit",
    description: "Private note before you send anyone a join link.",
    href: "/volunteer/resources/email-templates#downstream-fit",
    fileType: "Web",
  },
  {
    id: "email-after-approval",
    category: "email-templates",
    title: "Send invite link / QR after approval",
    description: "Thank them and pass the exact URL the downstream team approved.",
    href: "/volunteer/resources/email-templates#after-approval",
    fileType: "Web",
  },
  {
    id: "email-outreach-social",
    category: "email-templates",
    title: "Invite · community outreach social hour",
    description: "Low-commitment on-ramp for curious neighbors.",
    href: "/volunteer/resources/email-templates#outreach-social-hour",
    fileType: "Web",
  },
  {
    id: "email-vr-event",
    category: "email-templates",
    title: "Invite · voter registration event",
    description: "Practical help for registration and bringing a friend.",
    href: "/volunteer/resources/email-templates#vr-event",
    fileType: "Web",
  },
  {
    id: "email-follow-up",
    category: "email-templates",
    title: "Follow up after a conversation",
    description: "One-paragraph check-in without pressure.",
    href: "/volunteer/resources/email-templates#follow-up",
    fileType: "Web",
  },
  {
    id: "email-thank-you",
    category: "email-templates",
    title: "Thank someone after they help",
    description: "Gratitude that reinforces community norms.",
    href: "/volunteer/resources/email-templates#thank-you",
    fileType: "Web",
  },
  {
    id: "email-share-volunteer-page",
    category: "email-templates",
    title: "Ask someone to share the volunteer page",
    description: "Peer-to-peer distribution of /volunteer.",
    href: "/volunteer/resources/email-templates#share-volunteer",
    fileType: "Web",
  },
  {
    id: "email-invite-p5",
    category: "email-templates",
    title: "Invite someone to build their own Power of 5",
    description: "Relational turnout without overwhelming jargon.",
    href: "/volunteer/resources/email-templates#invite-p5",
    fileType: "Web",
  },
  {
    id: "messaging-hub",
    category: "messaging-talking-points",
    title: "Messaging & talking points hub",
    description: "Kelly pillars, registration language, triad + P5 explainers, Q&A prompts.",
    href: "/volunteer/resources/messaging",
    fileType: "Web",
  },
  {
    id: "msg-kelly-stands-for",
    category: "messaging-talking-points",
    title: "What Kelly stands for",
    description: "Values-first framing — pair with the field playbook for depth.",
    href: "/volunteer/resources/messaging#kelly-stands-for",
    fileType: "Web",
  },
  {
    id: "msg-why-running",
    category: "messaging-talking-points",
    title: "Why Kelly is running",
    description: "Neighbor-version narrative; expand only from HQ-approved copy.",
    href: "/volunteer/resources/messaging#why-running",
    fileType: "Web",
  },
  {
    id: "msg-election-integrity",
    category: "messaging-talking-points",
    title: "Election integrity",
    description: "Access and accurate counts; avoid rumor chains.",
    href: "/volunteer/resources/messaging#election-integrity",
    fileType: "Web",
  },
  {
    id: "msg-voter-registration",
    category: "messaging-talking-points",
    title: "Voter registration",
    description: "Neighbor care framing for VR help.",
    href: "/volunteer/resources/messaging#voter-registration",
    fileType: "Web",
  },
  {
    id: "msg-volunteer-invite-language",
    category: "messaging-talking-points",
    title: "Volunteer invitation",
    description: "Warm asks that respect boundaries.",
    href: "/volunteer/resources/messaging#volunteer-invite",
    fileType: "Web",
  },
  {
    id: "msg-p5-invite",
    category: "messaging-talking-points",
    title: "Power of 5 invitation",
    description: "Relational lists and downstream placement in one paragraph.",
    href: "/volunteer/resources/messaging#p5-invite",
    fileType: "Web",
  },
  {
    id: "msg-secure-elections",
    category: "messaging-talking-points",
    title: "Secure elections",
    description: "Accuracy and safety without rumor chains.",
    href: "/volunteer/resources/messaging#secure-elections",
    fileType: "Web",
  },
  {
    id: "msg-local-control",
    category: "messaging-talking-points",
    title: "Local control",
    description: "Practical local leadership framing.",
    href: "/volunteer/resources/messaging#local-control",
    fileType: "Web",
  },
  {
    id: "msg-service-accountability",
    category: "messaging-talking-points",
    title: "Service and accountability",
    description: "Show up, tell the truth, share credit.",
    href: "/volunteer/resources/messaging#service-accountability",
    fileType: "Web",
  },
  {
    id: "msg-captions",
    category: "messaging-talking-points",
    title: "Social media caption examples",
    description: "Short patterns you can localise.",
    href: "/volunteer/resources/messaging#captions",
    fileType: "Web",
  },
  {
    id: "msg-triad-model",
    category: "messaging-talking-points",
    title: "How to talk about the 3-person team model",
    description: "Events, Social, P5/VR — why three lanes matter locally.",
    href: "/volunteer/resources/messaging#triad-model",
    fileType: "Web",
  },
  {
    id: "msg-explain-p5",
    category: "messaging-talking-points",
    title: "How to explain Power of 5",
    description: "Five real relationships you can coach toward turnout and registration help.",
    href: "/volunteer/resources/messaging#explain-p5",
    fileType: "Web",
  },
  {
    id: "msg-invite-no-pressure",
    category: "messaging-talking-points",
    title: "How to invite someone without pressure",
    description: "Curiosity-led scripts; easy outs; no shame.",
    href: "/volunteer/resources/messaging#no-pressure",
    fileType: "Web",
  },
  {
    id: "msg-faq",
    category: "messaging-talking-points",
    title: "How to answer common questions",
    description: "Short guardrails — escalate policy or legal questions to HQ.",
    href: "/volunteer/resources/messaging#faq",
    fileType: "Web",
  },
  {
    id: "launch-kit-hub",
    category: "team-launch-kit",
    title: "Team Launch Kit · hub",
    description: "Single page linking launch checklists, templates, P5, huddles, events, messaging, GOTV, placement.",
    href: "/volunteer/resources/team-launch-kit",
    fileType: "Web",
  },
  {
    id: "launch-checklist",
    category: "team-launch-kit",
    title: "Team launch checklist",
    description: "Before you go live as a triad.",
    href: "/resources/team-building/team-launch-checklist.pdf",
    fileType: "PDF",
    comingSoon: true,
  },
  {
    id: "launch-invite-templates",
    category: "team-launch-kit",
    title: "Invite templates",
    description: "Email shells + volunteer page language.",
    href: "/volunteer/resources/email-templates",
    fileType: "Web",
  },
  {
    id: "launch-p5-worksheet",
    category: "team-launch-kit",
    title: "Power of 5 worksheet",
    description: "Track relationships responsibly (printable when available).",
    href: "/resources/printables/team-worksheets.pdf",
    fileType: "PDF",
    comingSoon: true,
  },
  {
    id: "launch-huddle",
    category: "team-launch-kit",
    title: "Weekly huddle agenda",
    description: "30-minute rhythm for triads.",
    href: "/field-playbook/rhythm/weekly-huddle",
    fileType: "Web",
  },
  {
    id: "launch-events-tracker",
    category: "team-launch-kit",
    title: "Events tracker",
    description: "Pipeline and day-of patterns (field ops).",
    href: "/field-playbook/roles/events-hosting-playbook",
    fileType: "Web",
  },
  {
    id: "launch-social-examples",
    category: "team-launch-kit",
    title: "Social post examples",
    description: "Patterns that stay local and factual.",
    href: "/volunteer/resources/messaging#captions",
    fileType: "Web",
  },
  {
    id: "launch-messaging",
    category: "team-launch-kit",
    title: "Talking points",
    description: "Campaign-approved messaging hub.",
    href: "/volunteer/resources/messaging",
    fileType: "Web",
  },
  {
    id: "launch-gotv-checklist",
    category: "team-launch-kit",
    title: "GOTV readiness checklist",
    description: "Mirror of dashboard score categories — use with your upstream.",
    href: "/field-playbook/metrics/key-metrics",
    fileType: "Web",
  },
  {
    id: "launch-downstream-guide",
    category: "team-launch-kit",
    title: "Downstream placement guide",
    description: "Place people where they fit — Power of 5 tab + templates.",
    href: "/volunteer/resources/email-templates#downstream-fit",
    fileType: "Web",
  },
  {
    id: "launch-qr-guide",
    category: "team-launch-kit",
    title: "QR invite guide",
    description: "Point people at /volunteer and team joins safely.",
    href: "/resources/recruitment/qr-code-sharing-guide.pdf",
    fileType: "PDF",
    comingSoon: true,
  },
  {
    id: "cd-launch-kit-hub",
    category: "county-party-organizing",
    title: "County Party Launch Kit · hub",
    description: "Meeting checklist, agenda, P5 invites, precinct guide, VR toolkit, social, and talking points — anchors for county leadership.",
    href: "/volunteer/resources/county-party-launch-kit",
    fileType: "Web",
  },
  {
    id: "cd-county-dashboard-hub",
    category: "county-party-organizing",
    title: "County Democrats · organizing dashboard",
    description: "Per-county shell: monthly meeting, lanes, P5/VR, precinct builder, resources, messages, rollup KPIs.",
    href: "/dashboard/community/county-democrats",
    fileType: "Web",
  },
  {
    id: "cd-meeting-email-set",
    category: "county-party-organizing",
    title: "County party email templates",
    description: "Meeting invite, RSVP reminder, follow-up, volunteer and P5 invites, thank-you, precinct team invite.",
    href: "/volunteer/resources/email-templates#county-meeting-invite",
    fileType: "Web",
  },
  {
    id: "cd-precinct-email",
    category: "county-party-organizing",
    title: "Precinct team invite (email)",
    description: "Copy-ready shell for recruiting a 3-person precinct triad.",
    href: "/volunteer/resources/email-templates#county-precinct-invite",
    fileType: "Web",
  },
  {
    id: "cd-messaging",
    category: "county-party-organizing",
    title: "County-facing messaging",
    description: "Pair local meetings with the general messaging library — keep claims factual and approved.",
    href: "/volunteer/resources/messaging",
    fileType: "Web",
  },
  {
    id: "cd-social-design",
    category: "county-party-organizing",
    title: "Social graphics & Canva",
    description: "Local save-the-date and meeting graphics — use the social design hub.",
    href: "/volunteer/resources/social-media-design",
    fileType: "Web",
  },
  {
    id: "ev-lane-hub",
    category: "events-lane-toolkits",
    title: "Events lane · operating manual (hub)",
    description: "House parties, fundraisers, immersions, faith visits, festivals, travel rhythm — links to playbooks and follow-up templates.",
    href: "/volunteer/resources/events-lane",
    fileType: "Web",
  },
  {
    id: "ev-house-party-toolkit",
    category: "events-lane-toolkits",
    title: "House Party Toolkit (field playbook)",
    description: "Host recruitment, invites, room setup, run-of-show, donation variant, follow-up — train others on this doc.",
    href: "/field-playbook/roles/house-party-playbook",
    fileType: "Web",
  },
  {
    id: "ev-fundraising-toolkit",
    category: "events-lane-toolkits",
    title: "Fundraising Event Toolkit (field playbook)",
    description: "County objective through September, tracking grid, reception run-of-show, treasurer handoffs — stacks under Events until a fundraising dashboard ships.",
    href: "/field-playbook/roles/fundraising-receptions-county",
    fileType: "Web",
  },
  {
    id: "ev-weekend-immersion",
    category: "events-lane-toolkits",
    title: "Weekend Community Immersion planner",
    description: "4–5 home meet-and-greets around an anchor event; KPI and debrief pattern.",
    href: "/field-playbook/roles/weekend-community-immersion",
    fileType: "Web",
  },
  {
    id: "ev-two-day-city",
    category: "events-lane-toolkits",
    title: "Two-day city immersion model",
    description: "Stack clerk, leaders, students, homes, faith — paired with travel rhythm doc.",
    href: "/field-playbook/roles/two-day-city-immersion",
    fileType: "Web",
  },
  {
    id: "ev-faith-visits",
    category: "events-lane-toolkits",
    title: "Faith community visit guide",
    description: "Respectful scheduling, checklist, automation intent when events are created in admin.",
    href: "/field-playbook/roles/faith-community-visits",
    fileType: "Web",
  },
  {
    id: "ev-travel-rhythm",
    category: "events-lane-toolkits",
    title: "Travel rhythm model",
    description: "Sustainable weekly tour defaults for Kelly and surrogates — home nights and return buffers.",
    href: "/field-playbook/roles/travel-rhythm-model",
    fileType: "Web",
  },
  {
    id: "ev-clerk-checklist",
    category: "events-lane-toolkits",
    title: "County Clerk visit checklist",
    description: "Professional county seat touch — mirrors Events and Youth KPI language.",
    href: "/field-playbook/roles/county-clerk-visit-checklist",
    fileType: "Web",
  },
  {
    id: "ev-local-guide",
    category: "events-lane-toolkits",
    title: "Local guide checklist (Kelly visits)",
    description: "Who to know, landmines, food, exit cues — pair with two-day model.",
    href: "/field-playbook/roles/festivals-fairs-local-guide",
    fileType: "Web",
  },
  {
    id: "ev-small-formats",
    category: "events-lane-toolkits",
    title: "Coffee, lunch, appetizers, clergy coffee",
    description: "Lightweight formats that feed house parties and immersions.",
    href: "/field-playbook/roles/small-format-gatherings",
    fileType: "Web",
  },
  {
    id: "mc-dashboard-live",
    category: "muslim-community-outreach",
    title: "Muslim Community Region · Live dashboard",
    description:
      "Partner-facing shell: Overview, lanes, mosque polling readiness, resources, messages, rollup — still labeled draft until leadership review.",
    href: "/dashboard/community/muslim",
    fileType: "Web",
  },
  {
    id: "mc-hub",
    category: "muslim-community-outreach",
    title: "Muslim Community Civic Organizing Dashboard (draft plan)",
    description:
      "Region leadership model, dashboard tabs, Youth and Women’s lanes, KPIs, cross-lane coordination — community review required.",
    href: "/volunteer/resources/muslim-community",
    fileType: "Web",
  },
  {
    id: "mc-youth-civic",
    category: "muslim-community-outreach",
    title: "Youth Civic Participation Guide",
    description: "Draft — pending Muslim community review.",
    href: "/volunteer/resources/muslim-community#resource-youth-civic",
    fileType: "Web",
  },
  {
    id: "mc-youth-student-vr",
    category: "muslim-community-outreach",
    title: "Student Voter Registration Checklist",
    description: "Draft — pending Muslim community review.",
    href: "/volunteer/resources/muslim-community#resource-youth-student-vr",
    fileType: "Web",
  },
  {
    id: "mc-youth-volunteer-invite",
    category: "muslim-community-outreach",
    title: "Youth Volunteer Invitation Template",
    description: "Draft — pending Muslim community review.",
    href: "/volunteer/resources/muslim-community#resource-youth-volunteer-invite",
    fileType: "Web",
  },
  {
    id: "mc-youth-social",
    category: "muslim-community-outreach",
    title: "Youth Social Media Guidelines",
    description: "Draft — pending Muslim community review.",
    href: "/volunteer/resources/muslim-community#resource-youth-social",
    fileType: "Web",
  },
  {
    id: "mc-youth-service",
    category: "muslim-community-outreach",
    title: "Community Service-to-Civic Action Guide",
    description: "Draft — pending Muslim community review.",
    href: "/volunteer/resources/muslim-community#resource-youth-service-civic",
    fileType: "Web",
  },
  {
    id: "mc-women-civic",
    category: "muslim-community-outreach",
    title: "Women’s Civic Conversation Guide",
    description: "Draft — pending Muslim community review.",
    href: "/volunteer/resources/muslim-community#resource-women-civic",
    fileType: "Web",
  },
  {
    id: "mc-women-family",
    category: "muslim-community-outreach",
    title: "Family-Friendly Event Checklist",
    description: "Draft — pending Muslim community review.",
    href: "/volunteer/resources/muslim-community#resource-women-family-events",
    fileType: "Web",
  },
  {
    id: "mc-women-listening",
    category: "muslim-community-outreach",
    title: "Women’s Listening Session Guide",
    description: "Draft — pending Muslim community review.",
    href: "/volunteer/resources/muslim-community#resource-women-listening",
    fileType: "Web",
  },
  {
    id: "mc-women-volunteer",
    category: "muslim-community-outreach",
    title: "Women Volunteer Invitation Template",
    description: "Draft — pending Muslim community review.",
    href: "/volunteer/resources/muslim-community#resource-women-volunteer-invite",
    fileType: "Web",
  },
  {
    id: "mc-women-respect",
    category: "muslim-community-outreach",
    title: "Respectful Outreach Guidance",
    description: "Draft — pending Muslim community review.",
    href: "/volunteer/resources/muslim-community#resource-women-respectful-outreach",
    fileType: "Web",
  },
  {
    id: "youth-hub",
    category: "youth-p5-outreach",
    title: "Youth Outreach hub",
    description: "Reporting hierarchy, campus model, KPIs — aligns with team dashboard Youth (P5/VR) tab.",
    href: "/volunteer/resources/youth-outreach",
    fileType: "Web",
  },
  {
    id: "youth-campus-launch",
    category: "youth-p5-outreach",
    title: "Campus Team Launch Guide",
    description: "Student triad: Events · Social · P5/VR — start with one student.",
    href: "/volunteer/resources/youth-outreach#campus-launch",
    fileType: "Web",
    comingSoon: true,
  },
  {
    id: "youth-hs-guide",
    category: "youth-p5-outreach",
    title: "High School Outreach Guide",
    description: "Rising seniors, trusted leaders, school-appropriate engagement.",
    href: "/volunteer/resources/youth-outreach#high-school",
    fileType: "Web",
    comingSoon: true,
  },
  {
    id: "youth-college-guide",
    category: "youth-p5-outreach",
    title: "College Outreach Guide",
    description: "Org networks, dorms, Greek life, faith-based student groups.",
    href: "/volunteer/resources/youth-outreach#college",
    fileType: "Web",
    comingSoon: true,
  },
  {
    id: "youth-reg-checklist",
    category: "youth-p5-outreach",
    title: "Student Registration Drive Checklist",
    description: "Tables, digital pushes, semester windows.",
    href: "/volunteer/resources/youth-outreach#registration",
    fileType: "Web",
    comingSoon: true,
  },
  {
    id: "youth-social-playbook",
    category: "youth-p5-outreach",
    title: "Student Social Media Playbook",
    description: "Weekly post, stories/reels, peer invites to /volunteer.",
    href: "/volunteer/resources/youth-outreach#social",
    fileType: "Web",
    comingSoon: true,
  },
  {
    id: "youth-invite-templates",
    category: "youth-p5-outreach",
    title: "Student Volunteer Invitation Templates",
    description: "Short, respectful peer invites.",
    href: "/volunteer/resources/email-templates",
    fileType: "Web",
  },
  {
    id: "youth-semester",
    category: "youth-p5-outreach",
    title: "Semester Planning Calendar",
    description: "Monthly outreach + VR + social challenge rhythm.",
    href: "/volunteer/resources/youth-outreach#semester",
    fileType: "Web",
    comingSoon: true,
  },
  {
    id: "youth-parent-comms",
    category: "youth-p5-outreach",
    title: "Parent Communication Guidance",
    description: "High school context; counsel review for minors.",
    href: "/volunteer/resources/youth-outreach#parents",
    fileType: "Web",
    comingSoon: true,
  },
  {
    id: "youth-campus-talking",
    category: "youth-p5-outreach",
    title: "Campus Talking Points",
    description: "Values-first student copy — pair with messaging library.",
    href: "/volunteer/resources/youth-outreach#talking-points",
    fileType: "Web",
    comingSoon: true,
  },
  {
    id: "youth-cross-campus-playbook",
    category: "youth-p5-outreach",
    title: "Cross-Campus Recruitment Playbook",
    description: "Build your campus, then help another launch — peer networks and weekly invite rhythm.",
    href: "/volunteer/resources/youth-outreach#cross-campus",
    fileType: "Web",
    comingSoon: true,
  },
  {
    id: "youth-gamification-guide",
    category: "youth-p5-outreach",
    title: "Student Gamification Guide",
    description: "Scoreboard metrics, recognition ladder, and badge framing (honest tracking).",
    href: "/volunteer/resources/youth-outreach#gamification",
    fileType: "Web",
    comingSoon: true,
  },
  {
    id: "youth-challenge-toolkit",
    category: "youth-p5-outreach",
    title: "Campus Challenge Toolkit",
    description: "Cross-campus challenges, joint events, and monthly pushes.",
    href: "/volunteer/resources/youth-outreach#challenges",
    fileType: "Web",
    comingSoon: true,
  },
  {
    id: "youth-kelly-campus-planner",
    category: "youth-p5-outreach",
    title: "Kelly Campus Visit Planner",
    description: "Request flow, student event types, and city-day coordination with Events.",
    href: "/volunteer/resources/youth-outreach#kelly-campus",
    fileType: "Web",
    comingSoon: true,
  },
  {
    id: "youth-immersion-planner",
    category: "youth-p5-outreach",
    title: "Two-Day Immersion Planner",
    description: "2–3 deep immersions / week target; day-one and day-two itinerary skeleton.",
    href: "/volunteer/resources/youth-outreach#immersion",
    fileType: "Web",
    comingSoon: true,
  },
  {
    id: "youth-county-clerk-checklist",
    category: "youth-p5-outreach",
    title: "County Clerk Visit Checklist",
    description: "County seat visits — contacted, requested, scheduled, completed, follow-up.",
    href: "/volunteer/resources/youth-outreach#county-clerk",
    fileType: "Web",
    comingSoon: true,
  },
  {
    id: "sm-canva-quick-start",
    category: "social-media-design",
    title: "Canva Quick Start Guide",
    description: "Volunteer-friendly first session: templates, text, export.",
    href: "/volunteer/resources/social-media-design#canva-quick-start",
    fileType: "Web",
    comingSoon: true,
  },
  {
    id: "sm-brand-kit",
    category: "social-media-design",
    title: "Campaign Brand Kit",
    description: "Colors, fonts, logo rules — download when asset pack is published.",
    href: "/volunteer/resources/social-media-design#brand-kit",
    fileType: "Web",
    comingSoon: true,
  },
  {
    id: "sm-headshot-library",
    category: "social-media-design",
    title: "Kelly Headshot Library",
    description: "Dashboard hero and feed crops under public/images/kelly/headshots/.",
    href: "/volunteer/resources/social-media-design#headshots",
    fileType: "Web",
  },
  {
    id: "sm-graphic-templates",
    category: "social-media-design",
    title: "Social Media Graphic Templates",
    description: "Square, story, and quote shells — HQ upload pending.",
    href: "/volunteer/resources/social-media-design#templates",
    fileType: "Web",
    comingSoon: true,
  },
  {
    id: "sm-flyer-template",
    category: "social-media-design",
    title: "Event Flyer Template",
    description: "Printable / shareable flyer skeleton for local hosts.",
    href: "/volunteer/resources/social-media-design#flyer",
    fileType: "Web",
    comingSoon: true,
  },
  {
    id: "sm-story-template",
    category: "social-media-design",
    title: "Story Graphic Template",
    description: "9:16 safe zone for Instagram/Facebook stories.",
    href: "/volunteer/resources/social-media-design#story",
    fileType: "Web",
    comingSoon: true,
  },
  {
    id: "sm-square-template",
    category: "social-media-design",
    title: "Square Post Template",
    description: "1080×1080 baseline for feed posts.",
    href: "/volunteer/resources/social-media-design#square",
    fileType: "Web",
    comingSoon: true,
  },
  {
    id: "sm-local-media-guide",
    category: "social-media-design",
    title: "Local Media Graphic Guide",
    description: "Facebook groups, newsletters, calendars, chambers — keep it local and shareable.",
    href: "/volunteer/resources/social-media-design#local-media",
    fileType: "Web",
  },
  {
    id: "sm-volunteer-recruitment-graphic",
    category: "social-media-design",
    title: "How to Make a Volunteer Recruitment Graphic",
    description: "Peer invite tone; link to /volunteer; no overcrowded text.",
    href: "/volunteer/resources/social-media-design#volunteer-recruitment",
    fileType: "Web",
    comingSoon: true,
  },
  {
    id: "sm-vr-graphic",
    category: "social-media-design",
    title: "How to Make a Voter Registration Graphic",
    description: "Clear deadline-neutral reminders; pair with Events + P5/VR.",
    href: "/volunteer/resources/social-media-design#voter-registration",
    fileType: "Web",
    comingSoon: true,
  },
];

export function getVolunteerResourcesByCategory(): Map<VolunteerResourceCategoryId, VolunteerResource[]> {
  const map = new Map<VolunteerResourceCategoryId, VolunteerResource[]>();
  for (const c of VOLUNTEER_RESOURCE_CATEGORIES) {
    map.set(c.id, []);
  }
  for (const r of VOLUNTEER_RESOURCES) {
    map.get(r.category)!.push(r);
  }
  return map;
}
