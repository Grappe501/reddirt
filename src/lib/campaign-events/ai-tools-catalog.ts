export type AiToolStatus = "idea" | "scaffolded" | "partial" | "functional";

export type AiToolEntry = {
  id: string;
  name: string;
  status: AiToolStatus;
  lives: string;
  reads: string;
  writes: string;
  dependencies: string[];
  guardrails: string;
  priority: "P0" | "P1" | "P2" | "P3";
};

export type AiToolCategory = {
  id: string;
  title: string;
  tools: AiToolEntry[];
};

const status = (s: AiToolStatus) => s;

export const CAMPAIGN_EVENT_AI_TOOL_CATEGORIES: AiToolCategory[] = [
  {
    id: "intake",
    title: "1. Calendar Intake Tools",
    tools: [
      { id: "read-gcal", name: "Read Google Calendar event", status: status("partial"), lives: "Ingest / normalized JSON", reads: "GCal export", writes: "CampaignEventLedgerRecord", dependencies: ["GOOGLE_CALENDAR_* env"], guardrails: "Read-only until sync packet approved", priority: "P1" },
      { id: "read-tentative-web", name: "Read tentative website entry", status: status("idea"), lives: "Public submitter (future)", reads: "Form POST", writes: "Tentative ledger row", dependencies: ["Submitter portal"], guardrails: "No PII in smoke tests", priority: "P2" },
      { id: "dup-detect", name: "Detect duplicate event", status: status("partial"), lives: "infer-event-assumptions + conflicts.ts", reads: "Calendar id, title, time", writes: "Conflict badges", dependencies: [], guardrails: "Human confirms merge", priority: "P1" },
      { id: "conflict-detect", name: "Detect schedule conflicts", status: status("functional"), lives: "conflicts.ts", reads: "All calendar items", writes: "Conflict badges", dependencies: [], guardrails: "Flag only; no auto-cancel", priority: "P0" },
      { id: "classify-type", name: "Classify event type", status: status("functional"), lives: "classify-event.ts", reads: "Title, notes, eventType", writes: "displayEventType", dependencies: [], guardrails: "Deterministic; no opponent claims", priority: "P0" },
      { id: "infer-geo", name: "Infer city / county", status: status("partial"), lives: "infer-event-assumptions.ts", reads: "Title, location, alias memory", writes: "factCard.where", dependencies: ["City alias memory"], guardrails: "Operator confirms in review modal", priority: "P0" },
      { id: "infer-host", name: "Infer host / venue", status: status("partial"), lives: "infer-event-assumptions.ts", reads: "Title, drillDown, location", writes: "factCard.who/where", dependencies: [], guardrails: "No invented hosts", priority: "P1" },
      { id: "infer-purpose", name: "Infer campaign purpose", status: status("partial"), lives: "infer-event-assumptions.ts", reads: "Notes, event type", writes: "factCard.why", dependencies: [], guardrails: "Suggestions only", priority: "P1" },
      { id: "tentative-status", name: "Infer tentative vs official", status: status("scaffolded"), lives: "calendar-lane.ts", reads: "eventStatus, calendarStatus", writes: "Lane labels", dependencies: ["GCal promotion"], guardrails: "No GCal write yet", priority: "P1" },
    ],
  },
  {
    id: "approval",
    title: "2. Event Approval Tools",
    tools: [
      { id: "build-package", name: "Build approval package", status: status("scaffolded"), lives: "approval-package.ts + preview routes", reads: "Ledger row + inference", writes: "ApprovalPackagePayload", dependencies: [], guardrails: "Preview only", priority: "P0" },
      { id: "email-approval", name: "Email candidate + campaign manager", status: status("idea"), lives: "Future SendGrid", reads: "Package payload", writes: "Email log", dependencies: ["Email send"], guardrails: "No send this pass", priority: "P1" },
      { id: "parse-reply", name: "Parse approve/deny/hold email reply", status: status("idea"), lives: "Inbound parser (future)", reads: "MIME reply", writes: "review.decision", dependencies: ["Inbound email"], guardrails: "Human audit trail", priority: "P2" },
      { id: "secure-link", name: "Secure workbench approval link", status: status("scaffolded"), lives: "workbench ?highlight=", reads: "recordId", writes: "Signed token (TODO)", dependencies: ["Token signing"], guardrails: "Placeholder token", priority: "P1" },
      { id: "update-status", name: "Update event status from decision", status: status("functional"), lives: "review-persistence.ts", reads: "Review modal", writes: "eventStatus + _review", dependencies: [], guardrails: "Per-event only", priority: "P0" },
      { id: "promote-official", name: "Promote tentative → official calendar", status: status("idea"), lives: "calendar-lane + GCal write", reads: "Approved row", writes: "officialCalendarId", dependencies: ["Google sync"], guardrails: "No GCal write yet", priority: "P1" },
      { id: "request-info", name: "Request missing information", status: status("partial"), lives: "EmailDraftScaffoldModal", reads: "missingRequired", writes: "_review.lastEmailDraft", dependencies: [], guardrails: "Draft only; no send", priority: "P1" },
    ],
  },
  {
    id: "travel",
    title: "3. Travel Ledger Tools",
    tools: [
      { id: "origin-city", name: "Determine origin city", status: status("functional"), lives: "travel-origin.ts", reads: "Day of week, calendar", writes: "factCard.travel", dependencies: [], guardrails: "Rose Bud default; Tue/Fri LR rule", priority: "P0" },
      { id: "dest-city", name: "Determine destination city", status: status("partial"), lives: "infer + travel calc", reads: "City inference", writes: "factCard.travel", dependencies: [], guardrails: "Override in review", priority: "P0" },
      { id: "lr-rule", name: "Tuesday/Friday Little Rock rule", status: status("functional"), lives: "travel-origin.ts", reads: "Event date", writes: "Origin label", dependencies: [], guardrails: "Documented rule", priority: "P0" },
      { id: "drive-time", name: "Calculate travel time", status: status("partial"), lives: "build-approval-context", reads: "County matrix", writes: "travelTimeMinutes", dependencies: ["Route matrix"], guardrails: "Estimate only", priority: "P1" },
      { id: "rt-miles", name: "Calculate round-trip miles", status: status("functional"), lives: "travel-calc.ts", reads: "Origin/dest", writes: "roundTripMiles", dependencies: [], guardrails: "$0.70/mi rate TODO align 0.725", priority: "P0" },
      { id: "reimburse", name: "Calculate reimbursement", status: status("functional"), lives: "travel-calc.ts", reads: "Miles + rate", writes: "reimbursementAmount", dependencies: [], guardrails: "Not FIN-1 linked", priority: "P0" },
      { id: "flag-travel-gaps", name: "Flag missing travel info", status: status("functional"), lives: "calendar-event-flags.ts", reads: "Miles null", writes: "Alert badges", dependencies: [], guardrails: "", priority: "P0" },
      { id: "travel-ledger-link", name: "Connect to travel ledger JSON", status: status("partial"), lives: "/admin/travel-ledger", reads: "calendar-{id}", writes: "JSON row", dependencies: ["Link packet"], guardrails: "Parallel paths today", priority: "P1" },
      { id: "fin1-bridge", name: "Connect to FinancialTransaction", status: status("idea"), lives: "Prisma FIN-1", reads: "Approved travel", writes: "FinancialTransaction", dependencies: ["FIN-1 bridge"], guardrails: "Not built", priority: "P3" },
    ],
  },
  {
    id: "operations",
    title: "4. Event Operations Tools",
    tools: [
      { id: "run-of-show", name: "Generate Run of Show", status: status("scaffolded"), lives: "Drilldown tab", reads: "factCard.when/what", writes: "run_of_show section", dependencies: [], guardrails: "Placeholder sections", priority: "P1" },
      { id: "pack-list", name: "Generate pack list / materials", status: status("partial"), lives: "infer materialsChecklist", reads: "Event type", writes: "factCard.what", dependencies: [], guardrails: "", priority: "P2" },
      { id: "volunteer-est", name: "Estimate volunteer needs", status: status("partial"), lives: "infer staffing", reads: "Event type", writes: "factCard.who", dependencies: [], guardrails: "", priority: "P2" },
      { id: "candidate-brief", name: "Candidate briefing", status: status("idea"), lives: "Future automation", reads: "factCard", writes: "PDF/email draft", dependencies: [], guardrails: "", priority: "P2" },
      { id: "cm-brief", name: "Campaign manager briefing", status: status("idea"), lives: "Planner mode", reads: "Day agenda", writes: "Notes", dependencies: [], guardrails: "", priority: "P2" },
      { id: "host-checklist", name: "Host checklist", status: status("scaffolded"), lives: "Host dashboard (future)", reads: "House M&G intel", writes: "Host worksheet", dependencies: ["Host portal"], guardrails: "", priority: "P1" },
      { id: "setup-timeline", name: "Setup / teardown timeline", status: status("scaffolded"), lives: "Day view slots", reads: "factCard.when", writes: "when.* times", dependencies: [], guardrails: "", priority: "P2" },
    ],
  },
  {
    id: "host",
    title: "5. Host Success Tools",
    tools: [
      { id: "host-onboard", name: "Host onboarding worksheet", status: status("scaffolded"), lives: "Host dashboard roadmap", reads: "Event confirmation", writes: "Host tasks", dependencies: ["Host auth"], guardrails: "House M&G primary", priority: "P1" },
      { id: "house-planner", name: "House party planner", status: status("partial"), lives: "infer houseMeetGreet", reads: "Classification", writes: "Intel panel", dependencies: [], guardrails: "Cross-aisle guidance", priority: "P1" },
      { id: "invite-list", name: "Invitation list builder", status: status("idea"), lives: "Submitter + host views", reads: "Guest rows", writes: "_invitations", dependencies: ["Submitter portal"], guardrails: "No voter file", priority: "P2" },
      { id: "invite-script", name: "Suggested invite / call script", status: status("idea"), lives: "AI tools future", reads: "Audience goals", writes: "Draft copy", dependencies: [], guardrails: "", priority: "P3" },
      { id: "host-thanks", name: "Host thank-you", status: status("idea"), lives: "AUTOMATION_NEEDS_FUTURE", reads: "Post-event", writes: "Email draft", dependencies: ["Email send"], guardrails: "", priority: "P2" },
      { id: "recurring-rec", name: "Recurring event recommendation", status: status("scaffolded"), lives: "houseMeetGreet.recurringPotential", reads: "Title/notes", writes: "Intel note", dependencies: [], guardrails: "", priority: "P3" },
      { id: "cross-aisle", name: "Cross-aisle outreach guidance", status: status("functional"), lives: "infer-event-assumptions", reads: "House M&G", writes: "Intel banner", dependencies: [], guardrails: "Relationship-first", priority: "P1" },
    ],
  },
  {
    id: "volunteer",
    title: "6. Volunteer + Contact Tools",
    tools: [
      { id: "vol-estimator", name: "Volunteer need estimator", status: status("partial"), lives: "infer staffing", reads: "Event type", writes: "who.volunteersNeeded", dependencies: [], guardrails: "", priority: "P2" },
      { id: "vol-assign", name: "Volunteer assignment suggestions", status: status("idea"), lives: "Volunteer ops", reads: "Roster", writes: "Assignments", dependencies: ["Volunteer DB"], guardrails: "", priority: "P3" },
      { id: "reminder-scaffold", name: "Reminder email/text scaffold", status: status("idea"), lives: "Future comms", reads: "Event time", writes: "Draft", dependencies: ["SMS not built"], guardrails: "No SMS", priority: "P3" },
      { id: "phone-bank", name: "Phone bank list", status: status("idea"), lives: "Roadmap placeholder", reads: "—", writes: "—", dependencies: ["Voter file"], guardrails: "No voter matching", priority: "P3" },
      { id: "voter-xref", name: "Voter-file cross reference", status: status("idea"), lives: "Roadmap placeholder", reads: "—", writes: "—", dependencies: ["Voter file"], guardrails: "No voter matching", priority: "P3" },
      { id: "postcard", name: "Postcard target list", status: status("idea"), lives: "Roadmap placeholder", reads: "—", writes: "—", dependencies: [], guardrails: "", priority: "P3" },
    ],
  },
  {
    id: "compliance",
    title: "7. Cost / Compliance Tools",
    tools: [
      { id: "est-cost", name: "Estimate event cost", status: status("scaffolded"), lives: "cost_budget section", reads: "Travel + materials", writes: "factCard cost", dependencies: [], guardrails: "", priority: "P2" },
      { id: "receipts", name: "Attach receipts", status: status("idea"), lives: "Attachments tab", reads: "Files", writes: "Storage", dependencies: ["Receipt system"], guardrails: "Not built", priority: "P3" },
      { id: "reimb-packet", name: "Reimbursement packet builder", status: status("idea"), lives: "Travel ledger + FIN-1", reads: "Approved miles", writes: "Export", dependencies: ["PDF export"], guardrails: "", priority: "P3" },
      { id: "audit-trail", name: "Audit trail builder", status: status("partial"), lives: "_review + communication", reads: "Decisions", writes: "Timeline", dependencies: [], guardrails: "", priority: "P2" },
    ],
  },
  {
    id: "hotwash",
    title: "8. Hot Wash / Learning Tools",
    tools: [
      { id: "post-q", name: "Post-event questionnaire", status: status("idea"), lives: "hot_wash tab", reads: "Event completion", writes: "hot_wash fields", dependencies: [], guardrails: "", priority: "P2" },
      { id: "lessons", name: "Lessons learned extractor", status: status("idea"), lives: "AI future", reads: "Notes", writes: "KB chunk", dependencies: ["OpenAI optional"], guardrails: "", priority: "P3" },
      { id: "county-rec", name: "County-specific recommendations", status: status("idea"), lives: "County workbench link", reads: "County intel", writes: "Suggestions", dependencies: ["County WB data"], guardrails: "No invented data", priority: "P2" },
      { id: "type-score", name: "Event-type success scoring", status: status("idea"), lives: "Analytics future", reads: "History", writes: "Score", dependencies: [], guardrails: "", priority: "P3" },
    ],
  },
];

export const WORKFLOW_ROADMAP_SECTIONS = [
  {
    id: "tentative-submitter",
    title: "Tentative event submitter view (future)",
    bullets: [
      "Public or partner form creates tentative ledger row",
      "Submitter drilldown link to complete host, location, audience, volunteer needs",
      "Invitation list: name, email, phone, relationship tag",
      "Minimal required fields; progressive disclosure",
    ],
  },
  {
    id: "host-dashboard",
    title: "Host dashboard after confirmation (future)",
    bullets: [
      "Simple worksheet dashboard — one topic per page",
      "AI recommendations with accept/deny per item",
      "House Meet & Greet is the gold-standard host flow",
      "Drilldowns: invites, food/setup, parking, Kelly Zoom option, materials, follow-up",
      "Campaign receives updates via communication thread — not full host auth yet",
    ],
  },
] as const;
