/**
 * EMAIL-AUTOMATION-POLICY-ACTIVATION-1.0 — deterministic policy evaluation from cockpit counts only.
 * Default and only behavior in this packet: read-only summaries — no auto-send, no mutations.
 */

import {
  AUTOMATION_POLICIES,
  type AutomationPolicyDefinition,
  type AutomationPolicyId,
} from "@/lib/email-command-center/automation-policies";

const ECC = "/admin/workbench/email-command-center";

export type AutomationPolicyEvalStatus = "ok" | "warn" | "alert";

export type AutomationPolicyEvalRow = {
  id: AutomationPolicyId;
  title: string;
  status: AutomationPolicyEvalStatus;
  detailSafe: string;
  recommendedActionSafe: string;
  href: string | null;
};

export type AutomationPolicyEvalSnapshot = {
  policyVersion: "1.0";
  evaluatedAtIso: string;
  policies: AutomationPolicyEvalRow[];
  okCount: number;
  warnCount: number;
  alertCount: number;
};

/** Minimal inputs from Email Command Center snapshot — avoids circular imports with read-model. */
export type AutomationPolicyEvalContext = {
  cockpitDbReachable: boolean;
  localContactImportDbVerified: boolean;
  needsAttentionCount: number;
  itemsNotUpdatedIn7DaysCount: number;
  messageStudioNeedsReview: number;
  messageStudioApprovedGovernance: number;
  sendExecNeedPreflight: number;
  sendExecPreflightFailed: number;
  /** Failed governed SendGrid execution rows — operator review. */
  sendExecFailed: number;
  runsApprovedAwaitingExecution: number;
  runsFailed: number;
  sendGridPendingReconciliation: number;
  gmailWatchExpiring48h: number;
  suppressionCount: number;
  activeAudienceDefinitions: number;
  sendGridDbReachable: boolean;
  messageStudioDbReachable: boolean;
  sendGridReconciliationDbReachable: boolean;
  sendGridContactSyncDbReachable: boolean;
  sendExecutionDbReachable: boolean;
};

function row(
  id: AutomationPolicyId,
  title: string,
  status: AutomationPolicyEvalStatus,
  detailSafe: string,
  recommendedActionSafe: string,
  href: string | null
): AutomationPolicyEvalRow {
  return { id, title, status, detailSafe, recommendedActionSafe, href };
}

function evaluateOne(id: AutomationPolicyId, ctx: AutomationPolicyEvalContext): AutomationPolicyEvalRow {
  const def = AUTOMATION_POLICIES.find((p) => p.id === id);
  const title = def?.title ?? id;

  switch (id) {
    case "stale_queue_review": {
      if (!ctx.cockpitDbReachable) {
        return row(id, title, "alert", "cockpit_db_unreachable", "Restore DATABASE_URL then open Daily / queue.", `${ECC}/readiness`);
      }
      if (ctx.needsAttentionCount > 0) {
        return row(
          id,
          title,
          "warn",
          `needs_attention_count_${ctx.needsAttentionCount}`,
          "Triage needs-attention queue items — explicit operator actions only.",
          "/admin/workbench/email-queue",
        );
      }
      if (ctx.itemsNotUpdatedIn7DaysCount > 10) {
        return row(
          id,
          title,
          "warn",
          `items_not_updated_7d_${ctx.itemsNotUpdatedIn7DaysCount}`,
          "Review older queue items for follow-up — heuristic only.",
          "/admin/workbench/email-queue",
        );
      }
      return row(id, title, "ok", "queue_posture_ok", "No stale signals from snapshot counts.", "/admin/workbench/email-queue");
    }
    case "draft_editorial_review": {
      if (!ctx.messageStudioDbReachable) {
        return row(id, title, "warn", "shared_drafts_db_unreachable", "Fix DB for shared draft counts.", `${ECC}/message-studio#shared-drafts`);
      }
      if (ctx.messageStudioNeedsReview > 0) {
        return row(
          id,
          title,
          "warn",
          `shared_drafts_needs_review_${ctx.messageStudioNeedsReview}`,
          "Open Message Studio shared drafts and run editorial review.",
          `${ECC}/message-studio#shared-drafts`,
        );
      }
      return row(id, title, "ok", "no_shared_drafts_pending_review", "—", `${ECC}/message-studio`);
    }
    case "send_packet_execution_preflight": {
      if (!ctx.sendExecutionDbReachable) {
        return row(id, title, "warn", "send_execution_db_unreachable", "Apply migrations for send execution tables.", `${ECC}/send-execution`);
      }
      if (ctx.sendExecFailed > 0) {
        return row(
          id,
          title,
          "warn",
          `send_execution_failed_${ctx.sendExecFailed}`,
          "Review failed SendGrid execution rows on Send execution ops panel.",
          `${ECC}/send-execution#ops`,
        );
      }
      if (ctx.sendExecNeedPreflight > 0 || ctx.sendExecPreflightFailed > 0) {
        return row(
          id,
          title,
          "warn",
          `need_preflight_${ctx.sendExecNeedPreflight}_preflight_failed_${ctx.sendExecPreflightFailed}`,
          "Open Send execution → run or fix preflight for tracked executions.",
          `${ECC}/send-execution#ops`,
        );
      }
      if (ctx.messageStudioApprovedGovernance > 0) {
        return row(
          id,
          title,
          "warn",
          `shared_drafts_send_governance_ready_${ctx.messageStudioApprovedGovernance}`,
          "Shared drafts marked for send governance — create/run execution preflight when operator is ready.",
          `${ECC}/send-execution`,
        );
      }
      return row(id, title, "ok", "no_preflight_blockers_from_snapshot", "—", `${ECC}/send-execution`);
    }
    case "approved_sync_not_executed": {
      if (!ctx.sendGridContactSyncDbReachable) {
        return row(id, title, "warn", "contact_sync_slice_unreachable", "Check DB for SendGridContactSyncRun.", `${ECC}/sendgrid#contact-sync`);
      }
      if (ctx.runsApprovedAwaitingExecution > 0) {
        return row(
          id,
          title,
          "warn",
          `approved_awaiting_upsert_${ctx.runsApprovedAwaitingExecution}`,
          "Execute approved Marketing Contacts upsert on SendGrid Foundation when operator + keys + hosted gate allow.",
          `${ECC}/sendgrid#contact-sync`,
        );
      }
      return row(id, title, "ok", "no_approved_runs_waiting", "—", `${ECC}/sendgrid#contact-sync`);
    }
    case "failed_sync_review": {
      if (!ctx.sendGridContactSyncDbReachable) {
        return row(id, title, "warn", "contact_sync_slice_unreachable", "Check DB.", `${ECC}/sendgrid#contact-sync`);
      }
      if (ctx.runsFailed > 0) {
        return row(
          id,
          title,
          "warn",
          `sync_failed_count_${ctx.runsFailed}`,
          "Review FAILED sync runs and safeError in resultJson.",
          `${ECC}/sendgrid#contact-sync`,
        );
      }
      return row(id, title, "ok", "no_failed_sync_runs", "—", `${ECC}/sendgrid#contact-sync`);
    }
    case "unreconciled_sendgrid_events": {
      if (!ctx.sendGridReconciliationDbReachable) {
        return row(id, title, "warn", "reconciliation_slice_unreachable", "Check DB for SendGridEvent.", `${ECC}/analytics#reconciliation`);
      }
      if (ctx.sendGridPendingReconciliation > 0) {
        return row(
          id,
          title,
          "warn",
          `pending_reconciliation_${ctx.sendGridPendingReconciliation}`,
          "Reconcile SendGrid webhook events to recipients on Analytics (operator-only, no send).",
          `${ECC}/analytics#reconciliation`,
        );
      }
      return row(id, title, "ok", "no_pending_reconciliation", "—", `${ECC}/analytics#reconciliation`);
    }
    case "gmail_watch_expiring": {
      if (ctx.gmailWatchExpiring48h > 0) {
        return row(
          id,
          title,
          "warn",
          `watches_expiring_48h_${ctx.gmailWatchExpiring48h}`,
          "Renew users.watch from Gmail monitor or npm run gmail:watch:renewal-check (dry-run).",
          `${ECC}/gmail`,
        );
      }
      return row(id, title, "ok", "no_watch_expiry_signal", "—", `${ECC}/gmail`);
    }
    case "hosted_db_not_verified": {
      if (!ctx.cockpitDbReachable) {
        return row(id, title, "alert", "cockpit_db_unreachable", "Fix DATABASE_URL first.", `${ECC}/readiness`);
      }
      if (!ctx.localContactImportDbVerified) {
        return row(
          id,
          title,
          "warn",
          "hosted_import_gate_not_verified",
          "Run email:contact-import:gate on hosted Kelly-Grappe DATABASE_URL before production imports.",
          `${ECC}/readiness`,
        );
      }
      return row(id, title, "ok", "import_gate_verified_on_this_db", "—", `${ECC}/readiness`);
    }
    case "suppressions_before_send": {
      if (!ctx.sendGridDbReachable) {
        return row(id, title, "warn", "sendgrid_foundation_unreachable", "Check DB / migrations.", `${ECC}/sendgrid`);
      }
      if (ctx.suppressionCount > 0 && ctx.activeAudienceDefinitions > 0) {
        return row(
          id,
          title,
          "warn",
          `suppressions_${ctx.suppressionCount}_active_audiences_${ctx.activeAudienceDefinitions}`,
          "Review suppressions + contact sync previews before any future broadcast send packet.",
          `${ECC}/sendgrid`,
        );
      }
      return row(id, title, "ok", "no_suppression_audience_intersection_signal", "—", `${ECC}/analytics`);
    }
    default: {
      const _exhaustive: never = id;
      return _exhaustive;
    }
  }
}

export function listAutomationPolicies(): AutomationPolicyDefinition[] {
  return [...AUTOMATION_POLICIES];
}

export function evaluateAutomationPolicy(policyId: string, ctx: AutomationPolicyEvalContext): AutomationPolicyEvalRow | null {
  const id = policyId as AutomationPolicyId;
  if (!AUTOMATION_POLICIES.some((p) => p.id === id)) return null;
  return evaluateOne(id, ctx);
}

export function evaluateAllAutomationPolicies(ctx: AutomationPolicyEvalContext): AutomationPolicyEvalSnapshot {
  const evaluatedAtIso = new Date().toISOString();
  const policies = AUTOMATION_POLICIES.map((p) => evaluateOne(p.id, ctx));
  const okCount = policies.filter((r) => r.status === "ok").length;
  const warnCount = policies.filter((r) => r.status === "warn").length;
  const alertCount = policies.filter((r) => r.status === "alert").length;
  return { policyVersion: "1.0", evaluatedAtIso, policies, okCount, warnCount, alertCount };
}

/** Alias for operators — same as evaluateAllAutomationPolicies in this packet. */
export function getAutomationPolicySummary(ctx: AutomationPolicyEvalContext): AutomationPolicyEvalSnapshot {
  return evaluateAllAutomationPolicies(ctx);
}
