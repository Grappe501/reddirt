/**
 * EMAIL-AUTOMATION-POLICY-DETAILS-1.0 — static explainability copy for each read-only automation policy.
 * Paired with `evaluateOne` in `automation-policy-runner.ts` (snapshot counts only; no workers).
 */

import type { AutomationPolicyId } from "@/lib/email-command-center/automation-policies";

export type AutomationPolicyExplainSpec = {
  /** Human-readable inputs the policy inspects */
  watches: string;
  /** What operators should consider doing when non-ok */
  recommends: string;
  /** Explicit non-goals for this policy slice */
  neverDoes: string;
  /** Where counts/signals come from (no secrets) */
  dataSource: string;
};

export const AUTOMATION_POLICY_EXPLAIN_BY_ID: Record<AutomationPolicyId, AutomationPolicyExplainSpec> = {
  stale_queue_review: {
    watches:
      "EmailWorkflowItem needs-attention statuses; count of items not updated in 7+ days (heuristic, not an SLA).",
    recommends: "Triage the queue, assign owners, and close or advance stale items explicitly — use filters on the email queue.",
    neverDoes:
      "Never auto-changes queue status, never auto-sends mail, never auto-escalates, never mutates contacts or audiences.",
    dataSource: "`getEmailCommandCenterSnapshot` → `queueHealth`, `assignmentHealth` (Prisma counts on this request).",
  },
  draft_editorial_review: {
    watches: "Shared `MessageStudioDraft` rows in NEEDS_REVIEW workflow status (Postgres).",
    recommends: "Open Message Studio Review Queue, run editorial checklists, then move workflow when ready.",
    neverDoes: "Never edits draft body from this policy, never promotes local drafts, never sends mail.",
    dataSource: "`getEmailCommandCenterSnapshot` → `messageStudioSharedDrafts.needsReview` (count query).",
  },
  send_packet_execution_preflight: {
    watches:
      "`EmailSendExecution` rows needing preflight or in PREFLIGHT_FAILED; failed execution count; shared drafts marked APPROVED_FOR_SEND_GOVERNANCE without a clean preflight path.",
    recommends:
      "Open Send Execution (#ops): run preflight for DRAFT / fix PREFLIGHT_FAILED rows; when drafts are send-governance-ready, create or attach execution and complete checklist before test send.",
    neverDoes:
      "Never runs preflight automatically, never submits SendGrid mail, never mutates audience definitions or suppression rows from this check.",
    dataSource:
      "`getEmailCommandCenterSnapshot` → `sendExecution` counts + optional `preflightFailedTopBlockers`; `messageStudioSharedDrafts.approvedForSendGovernance`.",
  },
  approved_sync_not_executed: {
    watches: "`SendGridContactSyncRun` rows in APPROVED not yet SYNCED (Marketing Contacts upsert queue).",
    recommends:
      "On SendGrid Foundation #contact-sync: confirm hosted DB gate + SENDGRID_API_KEY, then execute approved run (contacts only — not an email send).",
    neverDoes: "Never auto-executes upsert, never sends campaigns, never edits audience membership automatically.",
    dataSource: "`getEmailCommandCenterSnapshot` → `sendGridContactSync.runsApprovedAwaitingExecutionCount` (+ DB reachability flag).",
  },
  failed_sync_review: {
    watches: "`SendGridContactSyncRun` rows in FAILED (safeError stored in `resultJson`).",
    recommends: "Inspect safeError on SendGrid Foundation, fix root cause, save a new preview run before re-approve.",
    neverDoes: "Never auto-retries FAILED runs, never deletes runs, never sends email from sync.",
    dataSource: "`getEmailCommandCenterSnapshot` → `sendGridContactSync.runsFailedCount` (+ DB reachability).",
  },
  unreconciled_sendgrid_events: {
    watches: "SendGridEvent rows pending `metadataJson.eccReconciliation` linkage to `EmailSendRecipient` / execution rollups.",
    recommends: "Use Analytics #reconciliation batch or per-event reconcile (DB updates only — no SendGrid send API).",
    neverDoes: "Never calls SendGrid marketing or mail send APIs; never mutates audience definitions from reconciliation.",
    dataSource: "`getEmailCommandCenterSnapshot` → `sendGridReconciliation.pendingReconciliationCount` (+ DB reachability).",
  },
  gmail_watch_expiring: {
    watches: "Staff Gmail `users.watch` expiry within 48h from persisted sync state (per-account snapshot).",
    recommends: "Renew watch from Gmail monitor or `npm run gmail:watch:renewal-check` (dry-run); execute renewal only with explicit env gate — still no mail send from these tools.",
    neverDoes: "Never renews watch automatically, never fetches message bodies from Pub/Sub, never sends Gmail mail.",
    dataSource: "`getEmailCommandCenterSnapshot` → `gmailProductionWatch.watchesExpiringWithin48hCount` (+ DB reachability).",
  },
  hosted_db_not_verified: {
    watches:
      "Cockpit DB reachability; `localContactImportDbVerified` (ECC migrations applied + import slice responded on this DATABASE_URL).",
    recommends:
      "On hosted Kelly-Grappe / canonical Postgres: run migrate deploy, `email:command-center:preflight`, and `email:contact-import:gate` per Readiness docs — verify host matches intended project.",
    neverDoes: "Never changes DATABASE_URL, never runs imports, never proves production without operator env on the correct host.",
    dataSource: "`getEmailCommandCenterSnapshot` → `operatorGate` (migration list + `localContactImportDbVerified`).",
  },
  suppressions_before_send: {
    watches: "SendGrid suppression table row count when ACTIVE audience definitions exist (intersection signal only).",
    recommends:
      "Review suppressions + contact sync previews and reconciliation posture before assembling any future broadcast send packet.",
    neverDoes: "Never removes suppressions, never auto-excludes recipients from audiences, never sends mail.",
    dataSource:
      "`getEmailCommandCenterSnapshot` → `sendGridFoundation.suppressionCount`, `audienceStudio.activeAudienceDefinitions`, `sendGridFoundation.dbReachable`.",
  },
};
