/**
 * Master inventory of AI / deterministic tools for campaign calendar + travel ledger.
 * Roadmap only unless status is functional/partial.
 */

export type AiToolStatus = "idea" | "scaffolded" | "partial" | "functional";

export type AiToolPriority = "P0" | "P1" | "P2" | "P3";

export type AiToolEntry = {
  id: string;
  lifecycleId: string;
  name: string;
  purpose: string;
  status: AiToolStatus;
  priority: AiToolPriority;
  trigger: string;
  reads: string;
  writes: string;
  humanApprovalRequired: boolean;
  guardrails: string;
  futureRoute: string;
};

export type AiToolLifecycle = {
  id: string;
  order: number;
  title: string;
  tools: AiToolEntry[];
};

function t(
  lifecycleId: string,
  partial: Omit<AiToolEntry, "lifecycleId">,
): AiToolEntry {
  return { lifecycleId, ...partial };
}

const S = (s: AiToolStatus) => s;

export const AI_TOOL_LIFECYCLES: AiToolLifecycle[] = [
  {
    id: "calendar_intake",
    order: 1,
    title: "1. Calendar Intake",
    tools: [
      t("calendar_intake", { id: "intake-gcal-read", name: "Read Google Calendar event", purpose: "Import official/tentative GCal rows into campaign ledger.", status: S("partial"), priority: "P1", trigger: "Sync job or manual refresh", reads: "Google Calendar API / export", writes: "CampaignEventLedgerRecord", humanApprovalRequired: false, guardrails: "Read-only until write packet approved", futureRoute: "Ingest pipeline" }),
      t("calendar_intake", { id: "intake-normalized-json", name: "Load normalized calendar JSON", purpose: "Bootstrap ledger from command-center export.", status: S("functional"), priority: "P0", trigger: "Page load / seed script", reads: "data/calendar-command-center/*.json", writes: "Prisma upsert", humanApprovalRequired: false, guardrails: "Idempotent seed; preserves factCard", futureRoute: "npm run campaign-events:seed-month" }),
      t("calendar_intake", { id: "intake-seed-april", name: "Seed April ledger month", purpose: "Upsert April 2026 rows from normalized JSON.", status: S("functional"), priority: "P0", trigger: "npm run campaign-events:seed-april", reads: "calendar-items.normalized.json", writes: "CampaignEventLedgerRecord period=2026-04", humanApprovalRequired: false, guardrails: "No factCard wipe", futureRoute: "npm run campaign-events:seed-april" }),
      t("calendar_intake", { id: "intake-website-tentative", name: "Ingest tentative website submission", purpose: "Capture public/partner proposed events.", status: S("idea"), priority: "P2", trigger: "Form POST", reads: "Tentative submitter API", writes: "TENTATIVE ledger row", humanApprovalRequired: true, guardrails: "Spam/rate limits", futureRoute: "/api/tentative-events" }),
      t("calendar_intake", { id: "intake-classify-type", name: "Classify event type", purpose: "Map import type + title patterns to operations label.", status: S("functional"), priority: "P0", trigger: "Row create / review load", reads: "title, notes, eventType", writes: "displayEventType, factCard.why", humanApprovalRequired: false, guardrails: "Deterministic only", futureRoute: "classify-event.ts" }),
      t("calendar_intake", { id: "intake-dedupe", name: "Detect duplicate calendar row", purpose: "Flag overlapping titles and duplicate calendar ids in source JSON.", status: S("partial"), priority: "P1", trigger: "Review load / readiness", reads: "calendar id, title, time window", writes: "conflict badges + readiness warning", humanApprovalRequired: true, guardrails: "Never auto-delete", futureRoute: "conflicts.ts · month-readiness-duplicates.ts" }),
    ],
  },
  {
    id: "tentative_approval",
    order: 2,
    title: "2. Tentative Event Approval",
    tools: [
      t("tentative_approval", { id: "appr-package-build", name: "Build approval package", purpose: "Assemble email-ready summary for candidate + CM.", status: S("partial"), priority: "P0", trigger: "Tentative created / workbench select", reads: "Ledger row + inference", writes: "ApprovalPackagePayload", humanApprovalRequired: false, guardrails: "Preview only; no send yet", futureRoute: "/admin/campaign-calendar/approval-package/[id]" }),
      t("tentative_approval", { id: "appr-month-wizard", name: "Month review wizard", purpose: "Sequential approve/deny/hold for a month.", status: S("functional"), priority: "P0", trigger: "Start Month Review", reads: "Period rows", writes: "_review.decision", humanApprovalRequired: true, guardrails: "One event at a time", futureRoute: "/admin/campaign-events/review" }),
      t("tentative_approval", { id: "appr-email-send", name: "Email approval package", purpose: "Send package to candidate and campaign manager.", status: S("idea"), priority: "P1", trigger: "Operator send", reads: "Package payload", writes: "Email log", humanApprovalRequired: true, guardrails: "No PII in tests", futureRoute: "SendGrid / comms hub" }),
      t("tentative_approval", { id: "appr-parse-reply", name: "Parse approve/deny/hold reply", purpose: "Extract decision from inbound email.", status: S("idea"), priority: "P2", trigger: "Inbound MIME", reads: "Reply body", writes: "_review.decision", humanApprovalRequired: true, guardrails: "Human audit", futureRoute: "Inbound parser service" }),
      t("tentative_approval", { id: "appr-secure-link", name: "Signed workbench link", purpose: "Tokenized URL for external approvers.", status: S("scaffolded"), priority: "P1", trigger: "Package generated", reads: "recordId", writes: "Signed JWT", humanApprovalRequired: false, guardrails: "Placeholder token", futureRoute: "/admin/campaign-events/workbench?highlight=" }),
      t("tentative_approval", { id: "appr-promote-official", name: "Promote to official calendar", purpose: "Move approved event to official GCal lane.", status: S("idea"), priority: "P1", trigger: "Decision approved", reads: "Approved row", writes: "officialCalendarId", humanApprovalRequired: true, guardrails: "No GCal write", futureRoute: "GCal write sync" }),
    ],
  },
  {
    id: "conflict_detection",
    order: 3,
    title: "3. Conflict Detection",
    tools: [
      t("conflict_detection", { id: "conf-schedule", name: "Schedule overlap detection", purpose: "Find double-booked times.", status: S("functional"), priority: "P0", trigger: "Review / calendar load", reads: "All calendar items in window", writes: "Conflict badges", humanApprovalRequired: true, guardrails: "Flag only", futureRoute: "conflicts.ts" }),
      t("conflict_detection", { id: "conf-work-hours", name: "Work-hours warning", purpose: "Flag Mon–Fri employer hours overlap.", status: S("functional"), priority: "P0", trigger: "Event time parse", reads: "start/end Central", writes: "workHours badge", humanApprovalRequired: true, guardrails: "Requires confirmation", futureRoute: "work-schedule.ts" }),
      t("conflict_detection", { id: "conf-travel-window", name: "Travel window feasibility", purpose: "Estimate if drive time fits between events.", status: S("idea"), priority: "P2", trigger: "Same-day multiple events", reads: "Route matrix", writes: "Warning note", humanApprovalRequired: true, guardrails: "Estimate only", futureRoute: "travel-feasibility.ts" }),
    ],
  },
  {
    id: "fact_card_completion",
    order: 4,
    title: "4. Event Fact Card Completion",
    tools: [
      t("fact_card_completion", { id: "fc-infer-assumptions", name: "Per-event AI assumptions", purpose: "Deterministic inference for review prefill.", status: S("functional"), priority: "P0", trigger: "Review modal / month review", reads: "title, location, notes", writes: "factCard sections", humanApprovalRequired: true, guardrails: "No bulk inference", futureRoute: "infer-event-assumptions.ts" }),
      t("fact_card_completion", { id: "fc-section-edit", name: "Editable fact sections", purpose: "Operator edits When/Where/Who/Travel.", status: S("functional"), priority: "P0", trigger: "Save section", reads: "factCard JSON", writes: "Prisma factCard", humanApprovalRequired: true, guardrails: "Section-scoped patches", futureRoute: "FactSectionEditor" }),
      t("fact_card_completion", { id: "fc-zip-county", name: "ZIP → county assist", purpose: "Use ZIP to validate county.", status: S("partial"), priority: "P1", trigger: "ZIP entered", reads: "zipCode", writes: "where.county", humanApprovalRequired: true, guardrails: "Future geocoder", futureRoute: "ZIP lookup service" }),
      t("fact_card_completion", { id: "fc-missing-gaps", name: "Missing field counter", purpose: "Surface gap count for list views.", status: S("functional"), priority: "P0", trigger: "Save / load", reads: "factCard", writes: "missingInfoCount", humanApprovalRequired: false, guardrails: "", futureRoute: "countEditableGaps" }),
      t("fact_card_completion", { id: "fc-drilldown", name: "Event drilldown home", purpose: "Full operational tabs per event.", status: S("partial"), priority: "P1", trigger: "Open drilldown", reads: "record", writes: "notes thread", humanApprovalRequired: true, guardrails: "Placeholders on some tabs", futureRoute: "/admin/campaign-events/[recordId]" }),
    ],
  },
  {
    id: "travel_ledger",
    order: 5,
    title: "5. Travel Ledger",
    tools: [
      t("travel_ledger", { id: "tl-json-ledger", name: "JSON travel ledger", purpose: "Parallel mileage trip store from calendar import.", status: S("partial"), priority: "P1", trigger: "Calendar import", reads: "calendar-items", writes: "data/travel-ledger/", humanApprovalRequired: true, guardrails: "Not FIN-1", futureRoute: "/admin/travel-ledger" }),
      t("travel_ledger", { id: "tl-event-link", name: "Link event row ↔ travel trip", purpose: "Unify campaign event and trip mileage.", status: S("idea"), priority: "P1", trigger: "Approved travel", reads: "calendarSourceId", writes: "trip link field", humanApprovalRequired: true, guardrails: "Integration packet", futureRoute: "travel-ledger bridge" }),
      t("travel_ledger", { id: "tl-month-report", name: "Monthly travel ledger report", purpose: "One line per travel event with totals.", status: S("functional"), priority: "P0", trigger: "Open travel report", reads: "Period ledger rows", writes: "— (read-only report)", humanApprovalRequired: false, guardrails: "No PDF yet", futureRoute: "/admin/campaign-events/travel-report" }),
    ],
  },
  {
    id: "mileage_reimbursement",
    order: 6,
    title: "6. Mileage / Reimbursement",
    tools: [
      t("mileage_reimbursement", { id: "mr-origin-rule", name: "Travel origin resolver", purpose: "Rose Bud vs Tue/Fri Little Rock.", status: S("functional"), priority: "P0", trigger: "Recalculate", reads: "event date, overnight", writes: "travel origin labels", humanApprovalRequired: false, guardrails: "Documented rules", futureRoute: "travel-origin.ts" }),
      t("mileage_reimbursement", { id: "mr-rt-miles", name: "Round-trip miles", purpose: "Calculate mileage from origin/dest.", status: S("functional"), priority: "P0", trigger: "Save & recalculate", reads: "cities", writes: "roundTripMiles", humanApprovalRequired: true, guardrails: "$0.70/mi", futureRoute: "travel-calc.ts" }),
      t("mileage_reimbursement", { id: "mr-reimburse-dollar", name: "Reimbursement amount", purpose: "miles × rate on record.", status: S("functional"), priority: "P0", trigger: "Recalculate", reads: "miles, rate", writes: "reimbursementAmount", humanApprovalRequired: true, guardrails: "Not treasury FIN-1", futureRoute: "travel-calc.ts" }),
      t("mileage_reimbursement", { id: "mr-summary-writer", name: "Reimbursement summary writer", purpose: "Narrative status note on official reimbursement header.", status: S("partial"), priority: "P1", trigger: "Report build", reads: "queues + totals", writes: "statusNote", humanApprovalRequired: false, guardrails: "Deterministic text", futureRoute: "reimbursement-report.ts" }),
      t("mileage_reimbursement", { id: "mr-policy-align", name: "Policy rate align (0.725)", purpose: "Match CAMPAIGN_POLICY_V1 when approved.", status: S("idea"), priority: "P2", trigger: "Treasury sign-off", reads: "policy.ts", writes: "rate constant", humanApprovalRequired: true, guardrails: "TODO in constants", futureRoute: "constants.ts" }),
    ],
  },
  {
    id: "county_region_intel",
    order: 7,
    title: "7. County / Region Intelligence",
    tools: [
      t("county_region_intel", { id: "cri-infer-county", name: "Infer county from city", purpose: "City alias → county for travel context.", status: S("partial"), priority: "P0", trigger: "Inference", reads: "city, title", writes: "where.county", humanApprovalRequired: true, guardrails: "Confirm in review", futureRoute: "infer-event-assumptions.ts" }),
      t("county_region_intel", { id: "cri-county-link", name: "County workbench link", purpose: "Jump to county ops bridge.", status: S("functional"), priority: "P1", trigger: "County on row", reads: "county label", writes: "—", humanApprovalRequired: false, guardrails: "No invented data", futureRoute: "/admin/counties/[slug]" }),
      t("county_region_intel", { id: "cri-region-queue", name: "Month review by region", purpose: "Queue events by AR command region.", status: S("functional"), priority: "P2", trigger: "Review mode=region", reads: "ARKANSAS_COUNTY_REGISTRY", writes: "—", humanApprovalRequired: true, guardrails: "", futureRoute: "month-review-queue" }),
      t("county_region_intel", { id: "cri-county-wb-v2", name: "County Dashboard V2", purpose: "Field-first county intel in sister app.", status: S("partial"), priority: "P2", trigger: "External link", reads: "countyWorkbench", writes: "—", humanApprovalRequired: false, guardrails: "Separate Netlify app", futureRoute: "countyWorkbench /counties/[slug]/dashboard-v2" }),
    ],
  },
  {
    id: "host_dashboard",
    order: 8,
    title: "8. Host Dashboard",
    tools: [
      t("host_dashboard", { id: "host-worksheet", name: "Host onboarding worksheet", purpose: "Post-confirmation host tasks.", status: S("scaffolded"), priority: "P1", trigger: "Event approved", reads: "House M&G intel", writes: "host tasks JSON", humanApprovalRequired: true, guardrails: "No host auth", futureRoute: "/host/dashboard (future)" }),
      t("host_dashboard", { id: "host-ai-rec", name: "Host AI recommendations", purpose: "Suggest setup/invite improvements.", status: S("idea"), priority: "P2", trigger: "Host login", reads: "event factCard", writes: "recommendations", humanApprovalRequired: true, guardrails: "Accept/deny per item", futureRoute: "Host dashboard" }),
      t("host_dashboard", { id: "host-house-mg", name: "House Meet & Greet kit", purpose: "Cross-aisle + low-stress guidance.", status: S("partial"), priority: "P1", trigger: "Classification house_meet_greet", reads: "title patterns", writes: "intel panel", humanApprovalRequired: false, guardrails: "Relationship-first", futureRoute: "infer-event-assumptions" }),
    ],
  },
  {
    id: "invitation_list",
    order: 9,
    title: "9. Invitation List",
    tools: [
      t("invitation_list", { id: "inv-builder", name: "Invitation list builder", purpose: "Collect guests with relationship tags.", status: S("idea"), priority: "P2", trigger: "Host/submitter form", reads: "guest rows", writes: "_invitations", humanApprovalRequired: true, guardrails: "No voter file", futureRoute: "Submitter portal" }),
      t("invitation_list", { id: "inv-evite-copy", name: "Evite / invitation copy", purpose: "Generate invite text.", status: S("idea"), priority: "P3", trigger: "Operator request", reads: "event summary", writes: "draft copy", humanApprovalRequired: true, guardrails: "", futureRoute: "AI tools comms" }),
      t("invitation_list", { id: "inv-followup", name: "Invite follow-up reminders", purpose: "Remind host to send invites.", status: S("idea"), priority: "P3", trigger: "Pre-event automation", reads: "event date", writes: "reminder queue", humanApprovalRequired: true, guardrails: "No SMS yet", futureRoute: "Automation sequences" }),
    ],
  },
  {
    id: "volunteer_ops",
    order: 10,
    title: "10. Volunteer Operations",
    tools: [
      t("volunteer_ops", { id: "vol-estimate", name: "Volunteer need estimator", purpose: "Guess staffing from event type.", status: S("partial"), priority: "P2", trigger: "Inference", reads: "event type", writes: "who.volunteersNeeded", humanApprovalRequired: true, guardrails: "", futureRoute: "infer-event-assumptions" }),
      t("volunteer_ops", { id: "vol-assign", name: "Volunteer assignment", purpose: "Match roster to event.", status: S("idea"), priority: "P3", trigger: "Event confirmed", reads: "Volunteer roster", writes: "assignments", humanApprovalRequired: true, guardrails: "", futureRoute: "/admin/volunteers" }),
      t("volunteer_ops", { id: "vol-reminder", name: "Volunteer reminder", purpose: "Pre-event volunteer email.", status: S("idea"), priority: "P3", trigger: "Automation", reads: "event time", writes: "email draft", humanApprovalRequired: true, guardrails: "No send", futureRoute: "AUTOMATION_NEEDS_FUTURE" }),
    ],
  },
  {
    id: "candidate_briefing",
    order: 11,
    title: "11. Candidate Briefing",
    tools: [
      t("candidate_briefing", { id: "cb-daily-agenda", name: "Candidate day agenda", purpose: "Franklin planner candidate schedule panel.", status: S("scaffolded"), priority: "P2", trigger: "Day calendar view", reads: "day events", writes: "localStorage notes", humanApprovalRequired: false, guardrails: "Local only", futureRoute: "/admin/campaign-calendar/day" }),
      t("candidate_briefing", { id: "cb-event-brief", name: "Per-event briefing sheet", purpose: "One-pager before arrival.", status: S("idea"), priority: "P2", trigger: "Pre-event", reads: "factCard", writes: "brief PDF", humanApprovalRequired: true, guardrails: "", futureRoute: "Candidate cockpit" }),
      t("candidate_briefing", { id: "cb-cockpit", name: "Kelly candidate cockpit", purpose: "Calendar command center for Kelly.", status: S("partial"), priority: "P1", trigger: "Daily use", reads: "calendar + goals", writes: "—", humanApprovalRequired: false, guardrails: "", futureRoute: "/admin/calendar-command-center/kelly" }),
    ],
  },
  {
    id: "cm_briefing",
    order: 12,
    title: "12. Campaign Manager Briefing",
    tools: [
      t("cm_briefing", { id: "cm-planner-notes", name: "CM planner notes", purpose: "Campaign manager Franklin panel.", status: S("scaffolded"), priority: "P2", trigger: "Agenda/day view", reads: "events", writes: "localStorage", humanApprovalRequired: false, guardrails: "", futureRoute: "FranklinPlannerScaffold" }),
      t("cm_briefing", { id: "cm-workbench", name: "Campaign workbench hub", purpose: "Ops hub for CM orchestration.", status: S("partial"), priority: "P1", trigger: "Daily", reads: "multiple modules", writes: "—", humanApprovalRequired: false, guardrails: "", futureRoute: "/admin/workbench" }),
      t("cm_briefing", { id: "cm-daily-digest", name: "CM daily digest", purpose: "Email summary of day/week.", status: S("idea"), priority: "P2", trigger: "Scheduled", reads: "calendar period", writes: "email", humanApprovalRequired: true, guardrails: "No send", futureRoute: "Automation" }),
    ],
  },
  {
    id: "run_of_show",
    order: 13,
    title: "13. Run of Show",
    tools: [
      t("run_of_show", { id: "ros-template", name: "Run-of-show template", purpose: "Setup → speaking → teardown timeline.", status: S("scaffolded"), priority: "P1", trigger: "Event drilldown", reads: "factCard.when", writes: "run_of_show section", humanApprovalRequired: true, guardrails: "Placeholder", futureRoute: "Drilldown tab" }),
      t("run_of_show", { id: "ros-generate", name: "Generate ROS from type", purpose: "AI/template ROS by event class.", status: S("idea"), priority: "P2", trigger: "Approve event", reads: "event type", writes: "ROS fields", humanApprovalRequired: true, guardrails: "", futureRoute: "ROS generator" }),
    ],
  },
  {
    id: "materials_pack",
    order: 14,
    title: "14. Materials / Pack List",
    tools: [
      t("materials_pack", { id: "mat-checklist", name: "Materials checklist inference", purpose: "Table/literature/signs list.", status: S("partial"), priority: "P2", trigger: "Inference", reads: "event type", writes: "what.materialsNeeded", humanApprovalRequired: true, guardrails: "", futureRoute: "infer-event-assumptions" }),
      t("materials_pack", { id: "mat-pack-list", name: "Pack list PDF", purpose: "Printable pack for volunteers.", status: S("idea"), priority: "P3", trigger: "Pre-event", reads: "materials", writes: "PDF", humanApprovalRequired: true, guardrails: "", futureRoute: "Export" }),
    ],
  },
  {
    id: "event_cost_budget",
    order: 15,
    title: "15. Event Cost / Budget",
    tools: [
      t("event_cost_budget", { id: "cost-estimate", name: "Event cost estimate", purpose: "Rough event spend.", status: S("scaffolded"), priority: "P2", trigger: "Drilldown costs tab", reads: "travel + materials", writes: "cost_budget section", humanApprovalRequired: true, guardrails: "Not FIN-1", futureRoute: "Drilldown" }),
      t("event_cost_budget", { id: "cost-budget-link", name: "Link to budget plan", purpose: "Tie to BUDGET-2 plans.", status: S("idea"), priority: "P3", trigger: "Approved spend", reads: "BudgetPlan", writes: "allocation", humanApprovalRequired: true, guardrails: "", futureRoute: "/admin/budgets" }),
    ],
  },
  {
    id: "compliance_receipts",
    order: 16,
    title: "16. Compliance / Receipts",
    tools: [
      t("compliance_receipts", { id: "comp-receipt-attach", name: "Attach receipts", purpose: "Store receipt images per event.", status: S("idea"), priority: "P3", trigger: "Post-event", reads: "file upload", writes: "attachments", humanApprovalRequired: true, guardrails: "Not built", futureRoute: "Drilldown attachments" }),
      t("compliance_receipts", { id: "comp-category", name: "Compliance category suggest", purpose: "Suggest FEC/category.", status: S("idea"), priority: "P3", trigger: "Expense entry", reads: "event type", writes: "category", humanApprovalRequired: true, guardrails: "Human sign-off", futureRoute: "Compliance module" }),
      t("compliance_receipts", { id: "comp-audit-trail", name: "Decision audit trail", purpose: "Timeline of approvals.", status: S("partial"), priority: "P2", trigger: "Decisions", reads: "_review", writes: "approval timeline", humanApprovalRequired: false, guardrails: "", futureRoute: "approval-timeline.ts" }),
    ],
  },
  {
    id: "comms_email",
    order: 17,
    title: "17. Communications / Email",
    tools: [
      t("comms_email", { id: "email-draft-scaffold", name: "Request-info email draft", purpose: "Scaffold host/location emails.", status: S("partial"), priority: "P1", trigger: "Review modal", reads: "missing checklist", writes: "_review.lastEmailDraft", humanApprovalRequired: true, guardrails: "No send", futureRoute: "EmailDraftScaffoldModal" }),
      t("comms_email", { id: "email-thread", name: "Event communication thread", purpose: "Internal notes by role.", status: S("partial"), priority: "P2", trigger: "Add note", reads: "—", writes: "_communication", humanApprovalRequired: true, guardrails: "Not full chat", futureRoute: "Drilldown communication" }),
      t("comms_email", { id: "email-confirm-all", name: "Confirmed event email all", purpose: "Notify everyone after approve.", status: S("idea"), priority: "P2", trigger: "Approve", reads: "roster", writes: "sent log", humanApprovalRequired: true, guardrails: "Automation future", futureRoute: "AUTOMATION_NEEDS_FUTURE" }),
    ],
  },
  {
    id: "text_phone_postcard",
    order: 18,
    title: "18. Text / Phone / Postcard (Future)",
    tools: [
      t("text_phone_postcard", { id: "sms-reminder", name: "SMS reminders", purpose: "Text volunteers/hosts.", status: S("idea"), priority: "P3", trigger: "Pre-event", reads: "phone list", writes: "SMS queue", humanApprovalRequired: true, guardrails: "Not built", futureRoute: "—" }),
      t("text_phone_postcard", { id: "phone-bank", name: "Phone bank list", purpose: "Call list from invites.", status: S("idea"), priority: "P3", trigger: "Campaign", reads: "contacts", writes: "call sheet", humanApprovalRequired: true, guardrails: "No voter file", futureRoute: "—" }),
      t("text_phone_postcard", { id: "postcard-target", name: "Postcard targeting", purpose: "Mail universe from geography.", status: S("idea"), priority: "P3", trigger: "Program", reads: "voter file (future)", writes: "print batch", humanApprovalRequired: true, guardrails: "Not built", futureRoute: "—" }),
    ],
  },
  {
    id: "hot_wash_learning",
    order: 19,
    title: "19. Hot Wash / Learning",
    tools: [
      t("hot_wash_learning", { id: "hw-post-form", name: "Post-event questionnaire", purpose: "Capture lessons after event.", status: S("scaffolded"), priority: "P2", trigger: "Post-event", reads: "—", writes: "hot_wash section", humanApprovalRequired: true, guardrails: "Placeholder", futureRoute: "Drilldown" }),
      t("hot_wash_learning", { id: "hw-lessons", name: "Lessons extractor", purpose: "Summarize patterns across events.", status: S("idea"), priority: "P3", trigger: "Monthly", reads: "hot wash notes", writes: "KB chunks", humanApprovalRequired: true, guardrails: "", futureRoute: "Learning store" }),
      t("hot_wash_learning", { id: "hw-county-rec", name: "County success patterns", purpose: "Per-county recommendations.", status: S("idea"), priority: "P3", trigger: "County review", reads: "county history", writes: "suggestions", humanApprovalRequired: true, guardrails: "", futureRoute: "County workbench" }),
    ],
  },
  {
    id: "automation_sequences",
    order: 20,
    title: "20. Automation Sequences",
    tools: [
      t("automation_sequences", { id: "auto-pre-event", name: "Pre-event prep sequence", purpose: "Automated prep checklist run.", status: S("idea"), priority: "P2", trigger: "T-7 days", reads: "event", writes: "tasks", humanApprovalRequired: true, guardrails: "Not running", futureRoute: "AUTOMATION_NEEDS_FUTURE" }),
      t("automation_sequences", { id: "auto-volunteer", name: "Volunteer reminder sequence", purpose: "Volunteer comms chain.", status: S("idea"), priority: "P3", trigger: "T-3 days", reads: "volunteers", writes: "emails", humanApprovalRequired: true, guardrails: "", futureRoute: "Automation" }),
      t("automation_sequences", { id: "auto-reimb-follow", name: "Reimbursement follow-up", purpose: "Nudge after approved travel.", status: S("idea"), priority: "P3", trigger: "Post-trip", reads: "approved miles", writes: "reminder", humanApprovalRequired: true, guardrails: "", futureRoute: "Automation" }),
    ],
  },
  {
    id: "reporting_exports",
    order: 21,
    title: "21. Reporting / Exports",
    tools: [
      t("reporting_exports", { id: "rpt-travel-month", name: "Monthly travel report", purpose: "Chronological travel lines + totals.", status: S("functional"), priority: "P0", trigger: "Open report", reads: "period rows", writes: "—", humanApprovalRequired: false, guardrails: "CSV yes; PDF scaffold", futureRoute: "/admin/campaign-events/travel-report" }),
      t("reporting_exports", { id: "rpt-csv-export", name: "CSV export", purpose: "Download travel table.", status: S("functional"), priority: "P1", trigger: "Export CSV click", reads: "filtered rows", writes: "client download", humanApprovalRequired: false, guardrails: "No PII export guard yet", futureRoute: "travel-report CSV" }),
      t("reporting_exports", { id: "rpt-pdf", name: "PDF export", purpose: "Printable monthly packet.", status: S("scaffolded"), priority: "P2", trigger: "Export PDF", reads: "report data", writes: "PDF file", humanApprovalRequired: true, guardrails: "Not built", futureRoute: "PDF service" }),
      t("reporting_exports", { id: "rpt-reimb-packet", name: "Reimbursement packet", purpose: "Bundle for treasurer.", status: S("idea"), priority: "P2", trigger: "Month close", reads: "approved travel", writes: "packet", humanApprovalRequired: true, guardrails: "", futureRoute: "Attach to reimbursement" }),
    ],
  },
  {
    id: "saas_client_dashboard",
    order: 22,
    title: "22. SaaS / Client Campaign Dashboard",
    tools: [
      t("saas_client_dashboard", { id: "saas-netlify", name: "Netlify client dashboard", purpose: "External campaign SaaS view.", status: S("idea"), priority: "P3", trigger: "Deploy", reads: "aggregates", writes: "—", humanApprovalRequired: false, guardrails: "Not built", futureRoute: "Netlify dashboard" }),
      t("saas_client_dashboard", { id: "saas-candidate-view", name: "Candidate dashboard", purpose: "Candidate-facing approvals + travel summary.", status: S("functional"), priority: "P1", trigger: "Open dashboard", reads: "ledger period", writes: "—", humanApprovalRequired: false, guardrails: "Admin auth", futureRoute: "/admin/candidate-dashboard" }),
      t("saas_client_dashboard", { id: "saas-cm-view", name: "Campaign manager dashboard", purpose: "CM ops + travel + calendar health.", status: S("functional"), priority: "P1", trigger: "Open dashboard", reads: "ledger period", writes: "—", humanApprovalRequired: false, guardrails: "Admin auth", futureRoute: "/admin/campaign-manager-dashboard" }),
      t("saas_client_dashboard", { id: "saas-cm-legacy-workbench", name: "CM legacy workbench", purpose: "Orchestration hub rollup (pre-dashboard).", status: S("partial"), priority: "P2", trigger: "CM login", reads: "truth snapshot", writes: "—", humanApprovalRequired: false, guardrails: "", futureRoute: "/admin/workbench" }),
    ],
  },
];

export const ALL_AI_TOOLS: AiToolEntry[] = AI_TOOL_LIFECYCLES.flatMap((c) => c.tools);

export type AiToolFilters = {
  lifecycleId: string;
  status: string;
  priority: string;
  humanApprovalOnly: boolean;
  search: string;
};

export const DEFAULT_AI_TOOL_FILTERS: AiToolFilters = {
  lifecycleId: "all",
  status: "all",
  priority: "all",
  humanApprovalOnly: false,
  search: "",
};

export function filterAiTools(tools: AiToolEntry[], filters: AiToolFilters): AiToolEntry[] {
  return tools.filter((t) => {
    if (filters.lifecycleId !== "all" && t.lifecycleId !== filters.lifecycleId) return false;
    if (filters.status !== "all" && t.status !== filters.status) return false;
    if (filters.priority !== "all" && t.priority !== filters.priority) return false;
    if (filters.humanApprovalOnly && !t.humanApprovalRequired) return false;
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      const hay = `${t.name} ${t.purpose} ${t.futureRoute}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function countToolsByStatus(tools: AiToolEntry[]) {
  return {
    idea: tools.filter((t) => t.status === "idea").length,
    scaffolded: tools.filter((t) => t.status === "scaffolded").length,
    partial: tools.filter((t) => t.status === "partial").length,
    functional: tools.filter((t) => t.status === "functional").length,
    total: tools.length,
    humanApproval: tools.filter((t) => t.humanApprovalRequired).length,
  };
}

/** @deprecated Use AI_TOOL_LIFECYCLES — kept for imports during transition */
export const CAMPAIGN_EVENT_AI_TOOL_CATEGORIES = AI_TOOL_LIFECYCLES.map((c) => ({
  id: c.id,
  title: c.title,
  tools: c.tools.map((t) => ({
    id: t.id,
    name: t.name,
    status: t.status,
    lives: t.futureRoute,
    reads: t.reads,
    writes: t.writes,
    dependencies: [],
    guardrails: t.guardrails,
    priority: t.priority,
  })),
}));

export const WORKFLOW_ROADMAP_SECTIONS = [
  {
    id: "inventory-note",
    title: "Master inventory",
    bullets: [
      "22 lifecycle groups · filter by status, priority, lifecycle, human-approval required",
      "Functional tools are wired in RedDirt today; idea/scaffolded are roadmap only",
    ],
  },
] as const;
