/**
 * Additional tools merged into master catalog (operational command center expansion).
 */
import type { AiToolEntry, AiToolLifecycle } from "./ai-tools-master-catalog";
import { SPRINT4_APPROVAL_EMAIL_CATALOG_ENTRIES } from "./ai-tools/sprint4-approval-email-tools";
import { SPRINT5_PROMOTION_CATALOG_ENTRIES } from "./calendar-promotion/sprint5-promotion-tools";
import { GLOBAL_AGENT_ORCHESTRATION_CATALOG_ENTRIES } from "./ai-tools/sprint-global-agent-tools";
import {
  AGENT_USER_INTELLIGENCE_CATALOG,
  AGENT_WRITING_CATALOG,
  AGENT_UX_CATALOG,
  AGENT_CAMPAIGN_INTELLIGENCE_CATALOG,
  AGENT_SYSTEM_INTELLIGENCE_CATALOG,
} from "./ai-tools/sprint-agent-intelligence-tools";
import { SPRINT2_AGENT_CATALOG_ENTRIES } from "./ai-tools/sprint-agent-intelligence-2-tools";
import { SPRINT3_AGENT_CATALOG_ENTRIES } from "./ai-tools/sprint-agent-intelligence-3-tools";
import { SPRINT6_EVENT_PLANNING_CATALOG_ENTRIES } from "./ai-tools/sprint-event-planning-6-tools";
import { SPRINT7_EVENT_INTELLIGENCE_CATALOG_ENTRIES } from "./ai-tools/sprint-event-intelligence-7-tools";

const S = (s: AiToolEntry["status"]) => s;

function t(lifecycleId: string, partial: Omit<AiToolEntry, "lifecycleId">): AiToolEntry {
  return { lifecycleId, ...partial };
}

/** New tools to append per lifecycle id */
export const SUPPLEMENT_TOOLS_BY_LIFECYCLE: Record<string, AiToolEntry[]> = {
  calendar_intake: [
    t("calendar_intake", { id: "cal-views-os", name: "Campaign calendar OS views", purpose: "Timeline/month/week/day/agenda campaign calendar.", status: S("functional"), priority: "P0", trigger: "Open campaign calendar", reads: "ledger records", writes: "—", humanApprovalRequired: false, guardrails: "Read-only views", futureRoute: "/admin/campaign-calendar/timeline" }),
    t("calendar_intake", { id: "intake-recurring-detector", name: "Recurring event detector", purpose: "Flag repeating titles/locations across months.", status: S("idea"), priority: "P2", trigger: "Seed / review load", reads: "title, location, calendar id", writes: "recurrence badge", humanApprovalRequired: false, guardrails: "Flag only", futureRoute: "recurrence-detector.ts" }),
    t("calendar_intake", { id: "intake-dup-cal-id", name: "Duplicate calendar id detector", purpose: "Surface JSON rows sharing same calendar id.", status: S("functional"), priority: "P1", trigger: "Month seed / readiness", reads: "normalized JSON", writes: "readiness warning", humanApprovalRequired: false, guardrails: "Upsert dedupes DB", futureRoute: "month-readiness-duplicates.ts" }),
    t("calendar_intake", { id: "intake-declined-retain", name: "Declined event retention checker", purpose: "Ensure declined rows stay in ledger for audit.", status: S("partial"), priority: "P2", trigger: "Review load", reads: "eventStatus", writes: "—", humanApprovalRequired: false, guardrails: "Never delete", futureRoute: "merge-persisted-row.ts" }),
    t("calendar_intake", { id: "intake-to-ledger-bridge", name: "Intake-to-ledger bridge", purpose: "Create idempotent CampaignEventLedgerRecord on public schedule submit.", status: S("functional"), priority: "P0", trigger: "POST schedule-campaign-event", reads: "form + assistant", writes: "CampaignEventLedgerRecord", humanApprovalRequired: false, guardrails: "sourceKey dedupe", futureRoute: "intake-ledger-bridge.ts" }),
    t("calendar_intake", { id: "intake-duplicate-detector", name: "Intake duplicate detector", purpose: "Flag title/city/host/date duplicates before confirm.", status: S("functional"), priority: "P0", trigger: "Bridge create", reads: "peers + ledger", writes: "_intake.duplicateRisk", humanApprovalRequired: false, guardrails: "Non-blocking", futureRoute: "intake-duplicate-conflict.ts" }),
    t("calendar_intake", { id: "intake-conflict-detector", name: "Intake conflict detector", purpose: "Overlap/work-hours conflicts vs calendar peers.", status: S("functional"), priority: "P0", trigger: "Bridge create", reads: "normalized JSON + ledger", writes: "_intake.scheduleConflict", humanApprovalRequired: false, guardrails: "Non-blocking", futureRoute: "intake-duplicate-conflict.ts" }),
    t("calendar_intake", { id: "tentative-event-router", name: "Tentative event router", purpose: "Route WEBSITE_ENTRY rows to tentative calendar lane.", status: S("functional"), priority: "P0", trigger: "Workbench load", reads: "entrySource", writes: "calendarLanes", humanApprovalRequired: false, guardrails: "No GCal write", futureRoute: "calendar-lane.ts" }),
    t("calendar_intake", { id: "intake-summary-builder", name: "Intake summary builder", purpose: "Plain-language intake summary for operators.", status: S("functional"), priority: "P0", trigger: "Bridge create", reads: "inference", writes: "_intake.intakeSummary", humanApprovalRequired: false, guardrails: "Suggestions only", futureRoute: "intake-inference.ts" }),
    t("calendar_intake", { id: "tentative-review-assistant", name: "Tentative review assistant", purpose: "Recommend next action on website intake review.", status: S("functional"), priority: "P0", trigger: "Event review modal", reads: "_intake", writes: "UI card", humanApprovalRequired: true, guardrails: "No auto-approve", futureRoute: "IntakeAiSummaryCard.tsx" }),
    t("calendar_intake", { id: "website-intake-normalizer", name: "Website intake normalizer", purpose: "Map public form → fact card + synthetic calendar item.", status: S("functional"), priority: "P0", trigger: "Bridge create", reads: "ScheduleCampaignEventBody", writes: "factCard sections", humanApprovalRequired: false, guardrails: "Sanitize PII paths", futureRoute: "intake-ledger-bridge.ts" }),
    t("calendar_intake", { id: "schedule-risk-scanner", name: "Schedule risk scanner", purpose: "Combine assistant staff flags + overlap detection.", status: S("partial"), priority: "P1", trigger: "Bridge + review", reads: "assistant.privateStaffFlags", writes: "warnings", humanApprovalRequired: false, guardrails: "Staff flags stripped from public API", futureRoute: "public-scheduling-agent.ts" }),
    t("calendar_intake", { id: "gcal-read-status-checker", name: "GCal read status checker", purpose: "Compute ledger calendar truth status per row.", status: S("functional"), priority: "P0", trigger: "Workbench/calendar load", reads: "ledger + GoogleCalendarEventRecord", writes: "UI sync meta", humanApprovalRequired: false, guardrails: "Read-only", futureRoute: "resolve-ledger-calendar-sync.ts" }),
    t("calendar_intake", { id: "gcal-ledger-match-assistant", name: "GCal ledger match assistant", purpose: "Match Google ingest rows to ledger by id/title/date.", status: S("functional"), priority: "P0", trigger: "Truth resolve", reads: "GoogleCalendarEventRecord", writes: "matchedBy", humanApprovalRequired: false, guardrails: "No fact overwrite", futureRoute: "match-calendar-truth-to-ledger.ts" }),
    t("calendar_intake", { id: "normalized-json-freshness-monitor", name: "Normalized JSON freshness monitor", purpose: "Warn when calendar-items.normalized.json is stale.", status: S("functional"), priority: "P0", trigger: "Dashboard/workbench load", reads: "file mtime", writes: "banner", humanApprovalRequired: false, guardrails: "Read-only", futureRoute: "normalized-json-freshness.ts" }),
    t("calendar_intake", { id: "website-only-event-router", name: "Website-only event router", purpose: "Label WEBSITE_ENTRY rows without Google match.", status: S("functional"), priority: "P0", trigger: "Truth resolve", reads: "entrySource", writes: "WEBSITE_ENTRY_ONLY", humanApprovalRequired: false, guardrails: "", futureRoute: "calendar-sync-truth-types.ts" }),
    t("calendar_intake", { id: "imported-only-event-router", name: "Imported-only event router", purpose: "Label normalized JSON seed rows.", status: S("functional"), priority: "P0", trigger: "Truth resolve", reads: "sourceKey", writes: "IMPORTED_FROM_NORMALIZED_JSON", humanApprovalRequired: false, guardrails: "", futureRoute: "calendar-sync-truth-types.ts" }),
    t("calendar_intake", { id: "stale-calendar-warning-agent", name: "Stale calendar warning agent", purpose: "Flag GOOGLE_READ_STALE and JSON file age.", status: S("functional"), priority: "P0", trigger: "Sync dashboard", reads: "mtime + updatedGoogleAt", writes: "syncWarning", humanApprovalRequired: false, guardrails: "Non-blocking", futureRoute: "/admin/campaign-events/calendar-sync" }),
    t("calendar_intake", { id: "tentative-calendar-readiness-checker", name: "Tentative calendar readiness checker", purpose: "Pre-flight tentative lane before Sprint 5 write.", status: S("partial"), priority: "P1", trigger: "Truth resolve", reads: "tentativeCalendarId", writes: "TENTATIVE_CALENDAR_READY", humanApprovalRequired: true, guardrails: "No GCal write", futureRoute: "calendar-lane.ts" }),
    t("calendar_intake", { id: "official-calendar-readiness-checker", name: "Official calendar readiness checker", purpose: "Pre-flight official lane before Sprint 5 write.", status: S("partial"), priority: "P1", trigger: "Truth resolve", reads: "officialCalendarId", writes: "OFFICIAL_CALENDAR_READY", humanApprovalRequired: true, guardrails: "No GCal write", futureRoute: "calendar-lane.ts" }),
    t("calendar_intake", { id: "calendar-sync-command-advisor", name: "Calendar sync command advisor", purpose: "Show safe CLI refresh sequence on sync dashboard.", status: S("functional"), priority: "P0", trigger: "Open calendar-sync", reads: "env + sources", writes: "CLI copy", humanApprovalRequired: true, guardrails: "No server-side sync button", futureRoute: "load-calendar-sync-dashboard.ts" }),
  ],
  tentative_approval: [
    t("tentative_approval", { id: "appr-summary-build", name: "Approval summary builder", purpose: "Deterministic plain-language approve/hold/deny summary.", status: S("functional"), priority: "P0", trigger: "Month review load", reads: "row + inference", writes: "UI summary only", humanApprovalRequired: false, guardrails: "No auto-decide", futureRoute: "approval-summary-builder.ts" }),
    t("tentative_approval", { id: "appr-tentative-promo-check", name: "Tentative-to-official promotion checker", purpose: "Verify approved events eligible for official lane.", status: S("idea"), priority: "P1", trigger: "Decision approved", reads: "calendarLanes", writes: "promotion checklist", humanApprovalRequired: true, guardrails: "No GCal write", futureRoute: "calendar-lane.ts" }),
  ],
  conflict_detection: [
    t("conflict_detection", { id: "conf-travel-route-sanity", name: "Travel route sanity checker", purpose: "Flag impossible same-day drive chains.", status: S("partial"), priority: "P2", trigger: "Same-day events", reads: "times + cities", writes: "warning note", humanApprovalRequired: true, guardrails: "Estimate only", futureRoute: "mileage-inference-assist.ts" }),
  ],
  fact_card_completion: [
    t("fact_card_completion", { id: "fc-venue-memory", name: "Venue memory", purpose: "Reuse venue/city from prior events at same location string.", status: S("partial"), priority: "P1", trigger: "Location assist", reads: "prior ledger rows", writes: "where.venueName, where.city", humanApprovalRequired: true, guardrails: "No overwrite human values", futureRoute: "location-inference-assist.ts" }),
    t("fact_card_completion", { id: "fc-host-memory", name: "Host memory", purpose: "Remember host org/contact from past events.", status: S("idea"), priority: "P2", trigger: "Review load", reads: "host fields history", writes: "who.*", humanApprovalRequired: true, guardrails: "No invented hosts", futureRoute: "host-memory.ts" }),
    t("fact_card_completion", { id: "cri-city-county-assist", name: "City/county inference assist", purpose: "One-click accept for missing geo in month review.", status: S("functional"), priority: "P0", trigger: "focus=missing_city|county", reads: "title, location, registry", writes: "where.city, where.county", humanApprovalRequired: true, guardrails: "humanLocks", futureRoute: "location-inference-assist.ts" }),
  ],
  mileage_reimbursement: [
    t("mileage_reimbursement", { id: "mr-mileage-assist", name: "Mileage review assist", purpose: "Haversine estimate + accept in month review.", status: S("functional"), priority: "P0", trigger: "focus=missing_mileage", reads: "origin, destination", writes: "roundTripMiles", humanApprovalRequired: true, guardrails: "Recalculate required", futureRoute: "mileage-inference-assist.ts" }),
    t("mileage_reimbursement", { id: "mr-anomaly-detector", name: "Mileage anomaly detector", purpose: "Flag miles/reimbursement outliers vs month median.", status: S("partial"), priority: "P1", trigger: "Travel report / reimbursement load", reads: "period reimbursements", writes: "anomaly hint in UI", humanApprovalRequired: true, guardrails: "Flag only", futureRoute: "travel-report-anomaly.ts" }),
    t("mileage_reimbursement", { id: "mr-reimbursement-status-checker", name: "Reimbursement readiness checker", purpose: "Compute draft/needs review/ready from queues + report.", status: S("functional"), priority: "P0", trigger: "Reimbursement page load", reads: "ledger rows + status JSON", writes: "effective status display", humanApprovalRequired: false, guardrails: "Operator finalizes manually", futureRoute: "reimbursement-month-status.ts" }),
    t("mileage_reimbursement", { id: "mr-finalization-guard", name: "Reimbursement finalization guard", purpose: "Block finalize when mileage/city/approval gaps remain.", status: S("functional"), priority: "P0", trigger: "Finalize month", reads: "queue verification", writes: "status history", humanApprovalRequired: true, guardrails: "Force override with confirm", futureRoute: "reimbursement-actions.ts" }),
    t("mileage_reimbursement", { id: "mr-report-builder", name: "Official reimbursement report builder", purpose: "Build approved-only print table + totals.", status: S("functional"), priority: "P0", trigger: "Open reimbursement", reads: "CampaignEventLedgerRecord", writes: "report DTO", humanApprovalRequired: false, guardrails: "Excludes personal/duplicate", futureRoute: "reimbursement-report.ts" }),
    t("mileage_reimbursement", { id: "mr-appendix-builder", name: "Reimbursement appendix builder", purpose: "Categorize denied/personal/duplicate/hold for audit.", status: S("functional"), priority: "P0", trigger: "Report build", reads: "travel decisions", writes: "excludedLines", humanApprovalRequired: false, guardrails: "Not in totals", futureRoute: "reimbursement-report.ts" }),
    t("mileage_reimbursement", { id: "mr-travel-queue-verifier", name: "Travel queue verifier", purpose: "Count needs-approval/approved/denied/hold per month.", status: S("functional"), priority: "P0", trigger: "CLI or page load", reads: "ledger rows", writes: "verification JSON", humanApprovalRequired: false, guardrails: "Read-only", futureRoute: "scripts/verify-travel-reimbursement-queues.ts" }),
    t("mileage_reimbursement", { id: "mr-correction-assist", name: "Reimbursement correction assist", purpose: "Deep-link to edit/recalculate/missing-mileage queues.", status: S("functional"), priority: "P0", trigger: "Travel surfaces", reads: "recordId", writes: "—", humanApprovalRequired: true, guardrails: "No GCal write", futureRoute: "TravelCorrectionAssist.tsx" }),
    t("mileage_reimbursement", { id: "mr-final-packet-checklist", name: "Final reimbursement packet checklist", purpose: "Month completion checklist on reimbursement page.", status: S("functional"), priority: "P0", trigger: "Reimbursement page", reads: "status context", writes: "checklist UI", humanApprovalRequired: true, guardrails: "", futureRoute: "ReimbursementMonthChecklist.tsx" }),
  ],
  county_region_intel: [
    t("county_region_intel", { id: "cri-county-context", name: "County context fetcher", purpose: "Pull county profile summary for event review.", status: S("partial"), priority: "P1", trigger: "County link click", reads: "countyWorkbench + registry", writes: "—", humanApprovalRequired: false, guardrails: "No invented leaders", futureRoute: "/admin/counties/[slug]" }),
    t("county_region_intel", { id: "cri-local-leader", name: "Local leader lookup", purpose: "Suggest county leader contacts from workbench profiles.", status: S("idea"), priority: "P2", trigger: "County selected", reads: "countyWorkbench leaders", writes: "who.campaignPointPerson hint", humanApprovalRequired: true, guardrails: "Verified data only", futureRoute: "countyWorkbench/leaders" }),
    t("county_region_intel", { id: "cri-county-pattern", name: "County pattern detector", purpose: "Surface county event density and gaps.", status: S("idea"), priority: "P3", trigger: "Monthly analytics", reads: "ledger by county", writes: "county insights", humanApprovalRequired: false, guardrails: "", futureRoute: "county analytics" }),
  ],
  host_dashboard: [
    t("host_dashboard", { id: "host-rec-engine", name: "Host dashboard recommendation engine", purpose: "Rank host prep tasks by event type.", status: S("idea"), priority: "P2", trigger: "Event approved", reads: "factCard + house M&G intel", writes: "host recommendations", humanApprovalRequired: true, guardrails: "No host portal auth", futureRoute: "/host/dashboard (future)" }),
  ],
  invitation_list: [
    t("invitation_list", { id: "inv-analyzer", name: "Invite list analyzer", purpose: "Check invite count vs venue capacity heuristics.", status: S("idea"), priority: "P3", trigger: "Invites captured", reads: "guest list", writes: "analysis note", humanApprovalRequired: true, guardrails: "No voter matching", futureRoute: "invite-analyzer.ts" }),
  ],
  volunteer_ops: [
    t("volunteer_ops", { id: "vol-shift-matcher", name: "Volunteer shift matcher", purpose: "Match volunteer skills to event type needs.", status: S("idea"), priority: "P3", trigger: "Event confirmed", reads: "roster skills", writes: "suggested volunteers", humanApprovalRequired: true, guardrails: "No auto-assign", futureRoute: "/admin/volunteers" }),
  ],
  candidate_briefing: [
    t("candidate_briefing", { id: "cb-prep-brief", name: "Candidate prep brief generator", purpose: "One-page brief before event from fact card.", status: S("idea"), priority: "P2", trigger: "Pre-event T-1", reads: "factCard + inference", writes: "brief markdown", humanApprovalRequired: true, guardrails: "No auto-send", futureRoute: "/admin/candidate-dashboard" }),
  ],
  cm_briefing: [
    t("cm_briefing", { id: "cm-prep-brief", name: "Campaign manager prep brief", purpose: "CM-facing ops brief per event/day.", status: S("idea"), priority: "P2", trigger: "Pre-event", reads: "factCard + conflicts", writes: "brief markdown", humanApprovalRequired: true, guardrails: "", futureRoute: "/admin/campaign-manager-dashboard" }),
  ],
  hot_wash_learning: [
    t("hot_wash_learning", { id: "hotwash-media-upload", name: "Hot Wash media upload", purpose: "Admin upload images/video/audio/docs to pending county/event folders.", status: S("functional"), priority: "P0", trigger: "Event drilldown Hot Wash", reads: "multipart file", writes: "media-index.json + pending path", humanApprovalRequired: false, guardrails: "Pending until CM approve", futureRoute: "/admin/campaign-events/[recordId]" }),
    t("hot_wash_learning", { id: "hotwash-video-intake", name: "Hot Wash video intake", purpose: "Classify and queue video uploads for review.", status: S("partial"), priority: "P1", trigger: "Video upload", reads: "video/*", writes: "pending folder", humanApprovalRequired: true, guardrails: "No auto-publish", futureRoute: "media-storage.ts" }),
    t("hot_wash_learning", { id: "hotwash-speech-transcription", name: "Hot Wash speech transcription", purpose: "Transcribe remarks and speeches to text.", status: S("scaffolded"), priority: "P2", trigger: "Post-upload", reads: "audio/video", writes: "transcript field", humanApprovalRequired: true, guardrails: "Not built", futureRoute: "transcription pipeline" }),
    t("hot_wash_learning", { id: "hotwash-content-chunker", name: "Hot Wash content chunker", purpose: "Chunk transcripts into AI knowledge base.", status: S("scaffolded"), priority: "P2", trigger: "Transcript complete", reads: "transcript", writes: "vector chunks", humanApprovalRequired: true, guardrails: "No vector DB yet", futureRoute: "chunking pipeline" }),
    t("hot_wash_learning", { id: "county-media-archive-publisher", name: "County media archive publisher", purpose: "Move CM-approved media to official county archive path.", status: S("partial"), priority: "P0", trigger: "CM approve", reads: "pending file", writes: "approved/ folder", humanApprovalRequired: true, guardrails: "No auto without approve", futureRoute: "media-storage.ts" }),
    t("hot_wash_learning", { id: "uploader-grouping-tool", name: "Uploader grouping tool", purpose: "Group pending uploads by uploader name/email.", status: S("functional"), priority: "P1", trigger: "Hot Wash load", reads: "media-index", writes: "UI grouping", humanApprovalRequired: false, guardrails: "", futureRoute: "loadEventMediaBundle" }),
    t("hot_wash_learning", { id: "campaign-manager-media-approval", name: "Campaign manager media approval", purpose: "Queue to approve/reject pending Hot Wash media.", status: S("functional"), priority: "P0", trigger: "Media approval page", reads: "pending items", writes: "approvalStatus + file move", humanApprovalRequired: true, guardrails: "Never delete on reject", futureRoute: "/admin/campaign-events/media-approval" }),
    t("hot_wash_learning", { id: "event-memory-builder", name: "Event memory builder", purpose: "Attach approved media + notes to event memory for AI.", status: S("scaffolded"), priority: "P2", trigger: "Post-approve", reads: "media + _hotWash", writes: "event memory store", humanApprovalRequired: true, guardrails: "Not built", futureRoute: "event-memory.ts" }),
    t("hot_wash_learning", { id: "county-memory-builder", name: "County memory builder", purpose: "Roll up county learnings from Hot Wash across events.", status: S("scaffolded"), priority: "P2", trigger: "County review", reads: "approved county archive", writes: "county memory", humanApprovalRequired: true, guardrails: "No invented leaders", futureRoute: "county-memory.ts" }),
    t("hot_wash_learning", { id: "hw-event-success", name: "Event success score", purpose: "Score post-event outcomes from hot wash fields.", status: S("idea"), priority: "P3", trigger: "Post-event", reads: "hot_wash + decision", writes: "success score", humanApprovalRequired: true, guardrails: "", futureRoute: "event-success-score.ts" }),
    t("hot_wash_learning", { id: "hw-post-learning", name: "Post-event learning extractor", purpose: "Aggregate lessons across month.", status: S("idea"), priority: "P3", trigger: "Month close", reads: "hot wash notes", writes: "learning digest", humanApprovalRequired: true, guardrails: "", futureRoute: "learning-extractor.ts" }),
  ],
  reporting_exports: [
    t("reporting_exports", { id: "rpt-travel-summarizer", name: "Monthly travel report summarizer", purpose: "Deterministic narrative + totals on travel report.", status: S("functional"), priority: "P0", trigger: "Travel report open", reads: "period travel lines", writes: "summary text", humanApprovalRequired: false, guardrails: "No LLM", futureRoute: "travel-report-logic.ts" }),
    t("reporting_exports", { id: "rpt-month-readiness", name: "Month close readiness checker", purpose: "Score and queue gaps before month handoff.", status: S("functional"), priority: "P0", trigger: "Readiness page", reads: "period rows", writes: "readiness score", humanApprovalRequired: false, guardrails: "May gate at 80%", futureRoute: "/admin/campaign-events/month-readiness" }),
    t("reporting_exports", { id: "rpt-readiness-score", name: "Readiness score engine", purpose: "Weighted per-event completion scoring.", status: S("functional"), priority: "P0", trigger: "Review save", reads: "ledger rows", writes: "score %", humanApprovalRequired: false, guardrails: "Deterministic", futureRoute: "month-readiness-score.ts" }),
  ],
  compliance_receipts: [
    t("compliance_receipts", { id: "comp-missing-receipt", name: "Missing receipt detector", purpose: "Flag approved travel without receipt attachment.", status: S("idea"), priority: "P2", trigger: "Month close", reads: "reimbursement + attachments", writes: "missing receipt list", humanApprovalRequired: true, guardrails: "Not built", futureRoute: "compliance-receipts" }),
    t("compliance_receipts", { id: "comp-handoff-checker", name: "Compliance handoff checker", purpose: "Verify month ready for compliance export.", status: S("scaffolded"), priority: "P1", trigger: "Month close", reads: "readiness + travel report", writes: "handoff checklist", humanApprovalRequired: true, guardrails: "No FIN-1 bridge", futureRoute: "compliance handoff doc" }),
  ],
  automation_sequences: [
    t("automation_sequences", { id: "auto-blocked-registry", name: "Automation blocked registry", purpose: "List tools blocked from auto-run (email, GCal, etc.).", status: S("functional"), priority: "P0", trigger: "AI tools page", reads: "tool catalog", writes: "—", humanApprovalRequired: false, guardrails: "Inventory only", futureRoute: "/admin/campaign-events/ai-tools" }),
  ],
  saas_client_dashboard: [
    t("saas_client_dashboard", { id: "saas-planner-scaffold", name: "Franklin planner scaffolding", purpose: "Day/agenda planner notes panel.", status: S("scaffolded"), priority: "P2", trigger: "Calendar day/agenda", reads: "day events", writes: "localStorage", humanApprovalRequired: false, guardrails: "Client-only notes", futureRoute: "FranklinPlannerScaffold" }),
  ],
  sprint4_approval_email: SPRINT4_APPROVAL_EMAIL_CATALOG_ENTRIES,
  sprint5_calendar_promotion: SPRINT5_PROMOTION_CATALOG_ENTRIES,
  global_agent_orchestration: GLOBAL_AGENT_ORCHESTRATION_CATALOG_ENTRIES,
  agent_user_intelligence: AGENT_USER_INTELLIGENCE_CATALOG,
  agent_writing: AGENT_WRITING_CATALOG,
  agent_ux_intelligence: AGENT_UX_CATALOG,
  agent_campaign_intelligence: AGENT_CAMPAIGN_INTELLIGENCE_CATALOG,
  agent_system_intelligence: AGENT_SYSTEM_INTELLIGENCE_CATALOG,
  agent_intelligence_sprint2: SPRINT2_AGENT_CATALOG_ENTRIES,
  agent_intelligence_sprint3: SPRINT3_AGENT_CATALOG_ENTRIES,
  event_planning_sprint6: SPRINT6_EVENT_PLANNING_CATALOG_ENTRIES,
  event_intelligence_sprint7: SPRINT7_EVENT_INTELLIGENCE_CATALOG_ENTRIES,
};

const SUPPLEMENT_ONLY_LIFECYCLES: AiToolLifecycle[] = [
  {
    id: "sprint4_approval_email",
    order: 25,
    title: "Sprint 4 — Approval email toolchain",
    tools: SUPPLEMENT_TOOLS_BY_LIFECYCLE.sprint4_approval_email ?? [],
  },
  {
    id: "sprint5_calendar_promotion",
    order: 26,
    title: "Sprint 5 — Google Calendar promotion",
    tools: SUPPLEMENT_TOOLS_BY_LIFECYCLE.sprint5_calendar_promotion ?? [],
  },
  {
    id: "global_agent_orchestration",
    order: 27,
    title: "Global — All-knowing agent orchestration",
    tools: SUPPLEMENT_TOOLS_BY_LIFECYCLE.global_agent_orchestration ?? [],
  },
  {
    id: "agent_user_intelligence",
    order: 28,
    title: "Agent Intelligence — User anticipation",
    tools: SUPPLEMENT_TOOLS_BY_LIFECYCLE.agent_user_intelligence ?? [],
  },
  {
    id: "agent_writing",
    order: 29,
    title: "Agent Intelligence — Writing agent",
    tools: SUPPLEMENT_TOOLS_BY_LIFECYCLE.agent_writing ?? [],
  },
  {
    id: "agent_ux_intelligence",
    order: 30,
    title: "Agent Intelligence — UX psychology",
    tools: SUPPLEMENT_TOOLS_BY_LIFECYCLE.agent_ux_intelligence ?? [],
  },
  {
    id: "agent_campaign_intelligence",
    order: 31,
    title: "Agent Intelligence — Campaign gaps",
    tools: SUPPLEMENT_TOOLS_BY_LIFECYCLE.agent_campaign_intelligence ?? [],
  },
  {
    id: "agent_system_intelligence",
    order: 32,
    title: "Agent Intelligence — System orchestration",
    tools: SUPPLEMENT_TOOLS_BY_LIFECYCLE.agent_system_intelligence ?? [],
  },
  {
    id: "agent_intelligence_sprint2",
    order: 33,
    title: "Agent Intelligence Sprint 2 — Live orchestration",
    tools: SUPPLEMENT_TOOLS_BY_LIFECYCLE.agent_intelligence_sprint2 ?? [],
  },
  {
    id: "agent_intelligence_sprint3",
    order: 34,
    title: "Agent Intelligence Sprint 3 — Unified runtime",
    tools: SUPPLEMENT_TOOLS_BY_LIFECYCLE.agent_intelligence_sprint3 ?? [],
  },
  {
    id: "event_planning_sprint6",
    order: 35,
    title: "Sprint 6 — Event planning drilldown",
    tools: SUPPLEMENT_TOOLS_BY_LIFECYCLE.event_planning_sprint6 ?? [],
  },
  {
    id: "event_intelligence_sprint7",
    order: 36,
    title: "Sprint 7 — Hot wash intelligence & county memory",
    tools: SUPPLEMENT_TOOLS_BY_LIFECYCLE.event_intelligence_sprint7 ?? [],
  },
];

export function mergeSupplementIntoLifecycles(lifecycles: AiToolLifecycle[]): AiToolLifecycle[] {
  const merged = lifecycles.map((lc) => {
    const extra = SUPPLEMENT_TOOLS_BY_LIFECYCLE[lc.id] ?? [];
    const existingIds = new Set(lc.tools.map((x) => x.id));
    const added = extra.filter((x) => !existingIds.has(x.id));
    return { ...lc, tools: [...lc.tools, ...added] };
  });
  const existingIds = new Set(merged.map((lc) => lc.id));
  const appended = SUPPLEMENT_ONLY_LIFECYCLES.filter((lc) => !existingIds.has(lc.id));
  return [...merged, ...appended].sort((a, b) => a.order - b.order);
}
