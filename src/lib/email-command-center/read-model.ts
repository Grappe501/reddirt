import { prisma } from "@/lib/db";
import { getSendGridContactSyncReadiness } from "@/lib/email-command-center/sendgrid-contact-sync";
import { getAdminActorUserId } from "@/lib/admin/actor";
import {
  getEmailWorkflowQueueSummary,
  countEmailWorkflowItemsWithEmailAiAnalysis,
  countEmailWorkflowItemsWithEmailTaskIntelligence,
} from "@/lib/email-workflow/queries";
import { emailAudienceStudioSnapshotCounts } from "@/lib/email-command-center/audience-studio";
import { emailProfileGraphSnapshotCounts } from "@/lib/email-command-center/profile-graph";
import {
  EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM,
} from "@/lib/email-workflow/governance";
import { isOpenAIConfigured } from "@/lib/openai/client";
import { getEmailAiReadiness } from "@/lib/email-workflow/ai/config";
import {
  getGmailOAuthConfigStatus,
  getGmailScopePosture,
  isGmailPubSubTopicConfigured,
} from "@/lib/gmail/config";
import { parseGmailSyncState, resolveDisplayWatchStatus } from "@/lib/gmail/gmail-sync-state";
import { isGmailWatchConfigured, isGmailPubSubVerificationConfigured } from "@/lib/gmail/watch-config";
import { getSendGridEnvStatus } from "@/lib/sendgrid/config";
import { getSendGridMailReadiness } from "@/lib/sendgrid/mail-send";
import { getSendGridReconciliationSummary } from "@/lib/email-command-center/sendgrid-event-reconciliation";
import {
  EMAIL_COMMAND_CENTER_MIGRATION_DIRS,
  queryEmailCommandCenterMigrationRows,
} from "@/lib/email-command-center/ecc-migration-gate";
import { contactImportSnapshotCounts } from "@/lib/email-command-center/contact-import";
import { messageStudioSharedDraftSnapshotCounts } from "@/lib/email-command-center/message-studio-drafts";
import {
  buildGmailProductionWatchSnapshot,
  type GmailProductionWatchSnapshot,
} from "@/lib/email-command-center/gmail-production-watch";
import {
  evaluateAllAutomationPolicies,
  type AutomationPolicyEvalSnapshot,
} from "@/lib/email-command-center/automation-policy-runner";
import {
  buildHostedDbOperatorGateExtension,
  type HostedDbOperatorGateExtension,
} from "@/lib/email-command-center/hosted-db-readiness-assistant";
import { firstFailedPreflightCheckId } from "@/lib/email-command-center/send-execution-preflight-json";
import type { EmailContactImportBatchStatus } from "@prisma/client";

/** Classify `DATABASE_URL` host for operator posture chips (names/hosts only; no credentials). */
export function classifyDatabaseUrlHostKindForOperatorGate(): "loopback" | "hostname" | "unset" {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) return "unset";
  try {
    const normalized = raw.replace(/^postgresql:/i, "postgres:");
    const u = new URL(normalized);
    const h = u.hostname.toLowerCase();
    if (h === "localhost" || h === "127.0.0.1" || h === "::1") return "loopback";
    return "hostname";
  } catch {
    return "unset";
  }
}

/** Presence-only env checks — never surface values. */
export type SendgridEnvReadiness = {
  sendgridApiKeyPresent: boolean;
  sendgridFromEmailPresent: boolean;
  sendgridFromNamePresent: boolean;
  /** True when `SENDGRID_WEBHOOK_VERIFICATION_KEY` or `SENDGRID_WEBHOOK_PUBLIC_KEY` is set (names only in UI). */
  sendgridWebhookVerificationKeyPresent: boolean;
};

export type OpenAiReadiness = {
  openaiApiKeyPresent: boolean;
  openaiModuleAvailable: boolean;
  /** EMAIL-AI-INTELLIGENCE-1.0 — advisory queue analysis (OPENAI_API_KEY present). */
  emailAiConfigured: boolean;
  /** Env model name for queue AI (OPENAI_MODEL fallback in client module). */
  emailAiModelName: string;
  /** Same as emailAiConfigured for this packet — key required to call the API. */
  emailAiSafeAnalysisAvailable: boolean;
  /** Rows where `metadataJson.emailAiAnalysis` exists (count only). */
  emailAiQueueItemsAnalyzedCount: number;
  /** Rows where `metadataJson.emailTaskIntelligence` exists (EMAIL-AI-TASK-INTELLIGENCE-1.0). */
  emailTaskIntelligenceQueueItemsCount: number;
};

export type GmailReadinessSnapshot = {
  staffGmailAccountsTotal: number;
  staffGmailAccountsActive: number;
  currentActorUserResolved: boolean;
  currentActorHasActiveStaffGmail: boolean;
  /** Domain portion only (e.g. `campaign.org`) for a coarse hint; empty if not connected. */
  actorStaffGmailSendAsDomainHint: string | null;
  /**
   * `foundation_only` — OAuth/monitor shell only, no successful metadata sync yet for actor.
   * `metadata_sync_ready` — at least one successful manual metadata sync recorded.
   */
  monitorInboxSync: "foundation_only" | "metadata_sync_ready";
  /** ISO timestamp of last successful manual metadata sync (StaffGmailAccount.gmailSyncState). */
  lastMetadataSyncAtIso: string | null;
  lastMetadataSyncMessageCount: number | null;
  lastProfileHistoryIdPresent: boolean;
  composerSendScopeViaEnv: boolean;
  humanSendRailNote: string;
  /** True when OAuth connect can start (client, redirect, encryption key, state secret). */
  oauthConnectPipelineReady: boolean;
  /** Human-readable missing env names for admin setup (no values). */
  oauthMissingEnvVarLines: string[];
  /**
   * High-level UX phase for the Command Center Gmail strip.
   */
  commandSurfacePhase: "env_incomplete" | "needs_actor" | "ready_to_connect" | "connected";
  /**
   * True when push watch is not “healthy” for the actor: no active non-expired watch after connect.
   * OAuth-only / metadata-only still counts as incomplete relative to push readiness.
   */
  gmailWatchPushIncomplete: boolean;
  pubsubTopicEnvPresent: boolean;
  /** True when pubsub route verification env is set (receiver rejects requests until configured). */
  pubsubPushVerificationEnvPresent: boolean;
  gmailWatchDisplayStatus: "NOT_CONFIGURED" | "ACTIVE" | "EXPIRED" | "ERROR" | "STOPPED";
  gmailWatchExpirationMs: string | null;
  watchHistoryIdPresent: boolean;
  /** True when topic + verification token env are set — `/api/gmail/pubsub` can accept pushes. */
  pubsubReceiverConfigured: boolean;
  connectPath: string;
  monitorPath: string;
  /** Gmail metadata review → manual queue bridge (metadata-only reads). */
  gmailReviewPath: string;
};

export type QueueHealthSnapshot = {
  total: number;
  newCount: number;
  enrichedCount: number;
  inReviewCount: number;
  readyToRespondCount: number;
  approvedCount: number;
  escalatedCount: number;
  spamCount: number;
  closedCount: number;
  archivedCount: number;
  unassignedCount: number;
  needsAttentionCount: number;
};

export type AssignmentHealthSnapshot = {
  assignedCount: number;
  unassignedCount: number;
  currentActorAssignedItemCount: number;
  /** Items with `updatedAt` older than 7 days — heuristic only, not an SLA. */
  itemsNotUpdatedIn7DaysCount: number;
};

export type AutomationTierSnapshot = {
  tier: "T0" | "T1" | "T2" | "T3" | "T4";
  label: string;
  state: "live" | "partial" | "planned";
};

export type GovernanceSnapshot = {
  canSendFromEmailWorkflowItem: boolean;
  bullets: string[];
};

/** DB + migration + contact-import gate (no secrets). */
export type EmailCommandCenterOperatorGate = HostedDbOperatorGateExtension & {
  /** False when the cockpit could not query Postgres (degraded dashboard). */
  cockpitDbReachable: boolean;
  /** Rows for listed Email Command Center migrations; empty when DB unreachable. */
  emailCommandCenterMigrations: { name: string; applied: boolean }[];
  /** Null when migrations could not be queried (DB down); true only when every listed row applied. */
  allEmailCommandCenterMigrationsApplied: boolean | null;
  /** One-line UI hint when migrations incomplete or unknown. */
  migrationGateNote: string | null;
  contactImportStatusLabel: string;
  contactImportNextPacket: string;
  /**
   * True only when this request reached Postgres, all listed ECC migrations (including import staging) applied,
   * and import batch tables responded to a count query. Does not prove the Canonical Supabase DB or production.
   */
  localContactImportDbVerified: boolean;
  /** Repo-relative path (clone) — no in-app doc route in this packet. */
  readinessDocRepoPath: string;
  preflightCliHint: string;
  dbDiagnoseCliHint: string;
  importGateCliHint: string;
  /** Heuristic from `DATABASE_URL` host only — for operator chips (not a hosted-gate proof). */
  databaseUrlHostKind: "loopback" | "hostname" | "unset";
};

export type EmailCommandCenterSnapshot = {
  queueHealth: QueueHealthSnapshot;
  assignmentHealth: AssignmentHealthSnapshot;
  gmail: GmailReadinessSnapshot;
  sendgridEnv: SendgridEnvReadiness;
  openAi: OpenAiReadiness;
  /** EMAIL-CONTACT-PROFILE-GRAPH-1.0 — governed staging counts (no secrets). */
  profileGraph: {
    pendingProfileFactSuggestions: number;
    pendingAudienceHints: number;
    approvedActiveFacts: number;
    profilesReviewPath: string;
  };
  /** EMAIL-AUDIENCE-STUDIO-1.0 — preview / definitions over profile graph (no SendGrid). */
  audienceStudio: {
    path: string;
    /** `foundation_rails` — EMAIL-SENDGRID-FOUNDATION-1.0: readiness + webhook route + local tables (still no live sync). */
    sendgridSyncStatus: "not_connected" | "foundation_rails";
    buildingBlockApprovedTriples: number;
    draftAudienceDefinitions: number;
    activeAudienceDefinitions: number;
    dbSliceReachable: boolean;
  };
  /** EMAIL-SENDGRID-FOUNDATION-1.0 — counts + paths only (no secrets). */
  sendGridFoundation: {
    path: string;
    eventWebhookPath: string;
    apiKeyPresent: boolean;
    fromIdentityReady: boolean;
    webhookVerificationConfigured: boolean;
    recentSendGridEventsCount: number;
    suppressionCount: number;
    audienceDefinitionsNonArchived: number;
    dbReachable: boolean;
  };
  /** EMAIL-CONTACT-IMPORT-STAGING-1.0 — staged CSV batches (no SendGrid, no sends). */
  contactImport: {
    path: string;
    dbSliceReachable: boolean;
    pendingApprovalCount: number;
    committedBatchCount: number;
    /** Non-terminal batches (excludes committed + archived). */
    openImportBatchCount: number;
    consentWarningRowsSummed: number;
    latestBatches: { id: string; name: string; status: EmailContactImportBatchStatus; createdAt: Date }[];
  };
  automationTiers: AutomationTierSnapshot[];
  governance: GovernanceSnapshot;
  operatorGate: EmailCommandCenterOperatorGate;
  /** EMAIL-MESSAGE-STUDIO-SERVER-DRAFTS-1.0 — shared Postgres drafts (no send). */
  messageStudioSharedDrafts: {
    path: string;
    totalActiveSharedDrafts: number;
    needsReview: number;
    inReview: number;
    approvedForSendGovernance: number;
    dbReachable: boolean;
  };
  /** EMAIL-SENDGRID-CONTACT-SYNC-1.1 + 1.2 — operator sync preview runs; optional Marketing Contacts upsert (no sends). */
  sendGridContactSync: {
    path: string;
    dbReachable: boolean;
    runsPreviewedCount: number;
    /** Rows in APPROVED — eligible for governed Marketing Contacts upsert (1.2), not yet SYNCED/FAILED. */
    runsApprovedAwaitingExecutionCount: number;
    runsApprovedCount: number;
    runsSyncedCount: number;
    runsFailedCount: number;
    runsArchivedCount: number;
    /** Non-archived runs only — Σ `excludedSuppressedCount` (preview pipeline; not SendGrid API totals). */
    sumExcludedSuppressedNonArchived: number;
    /** Non-archived runs only — Σ `warningCount` (consent / source warnings from preview). */
    sumWarningCountNonArchived: number;
    latestSyncedAtIso: string | null;
    latestSyncedProviderJobId: string | null;
    latestSyncedProviderStatus: string | null;
    latestFailedAtIso: string | null;
    readinessWarningsSample: string[];
  };
  /** EMAIL-SEND-EXECUTION-1.0 — governed SendGrid execution (counts only; no provider calls here). */
  sendExecution: {
    path: string;
    dbReachable: boolean;
    totalExecutions: number;
    /** DRAFT + PREFLIGHT_FAILED — operator should run or re-run preflight. */
    needPreflightCount: number;
    preflightFailedCount: number;
    /** First failed checklist id tallied from recent PREFLIGHT_FAILED rows (read-only). */
    preflightFailedTopBlockers: Array<{ id: string; count: number }>;
    readyForTestCount: number;
    testSentCount: number;
    readyForFinalApprovalCount: number;
    finalApprovedCount: number;
    sendingCount: number;
    sentCount: number;
    partialFailureCount: number;
    failedCount: number;
    cancelledCount: number;
    archivedCount: number;
    /** From env only — test mail path (single recipient) can proceed when true. */
    sendGridMailTestReady: boolean;
    /** From env only — broadcast path requires ASM + from + key. */
    sendGridMailBroadcastReady: boolean;
  };
  /** EMAIL-SENDGRID-EVENT-RECIPIENT-RECONCILIATION-1.0 — webhook events vs send execution recipients (read + operator reconcile; no sends). */
  sendGridReconciliation: {
    path: string;
    dbReachable: boolean;
    totalEvents: number;
    matchedCount: number;
    skippedCount: number;
    unmatchedCount: number;
    pendingReconciliationCount: number;
    lastReconciledAtIso: string | null;
    recipientByStatus: Record<string, number>;
    recentEvents: Array<{
      id: string;
      eventType: string;
      email: string | null;
      occurredAtIso: string;
      reconciliationState: string | null;
    }>;
    bounceEventsApprox: number;
    unsubscribeEventsApprox: number;
    spamEventsApprox: number;
  };
  /** EMAIL-GMAIL-PRODUCTION-WATCH-HARDENING-1.0 — watch renewal + history cursor posture (no sends). */
  gmailProductionWatch: GmailProductionWatchSnapshot;
  /** EMAIL-AUTOMATION-POLICY-ACTIVATION-1.0 — read-only policy evaluation from snapshot counts (no workers). */
  automationPolicyEval: AutomationPolicyEvalSnapshot;
};

function sendgridEnvReadiness(): SendgridEnvReadiness {
  const s = getSendGridEnvStatus();
  return {
    sendgridApiKeyPresent: s.sendgridApiKeyPresent,
    sendgridFromEmailPresent: s.sendgridFromEmailPresent,
    sendgridFromNamePresent: s.sendgridFromNamePresent,
    sendgridWebhookVerificationKeyPresent:
      s.sendgridWebhookVerificationKeyPresent || s.sendgridWebhookPublicKeyPresent,
  };
}

function extractEmailDomain(email: string): string | null {
  const at = email.indexOf("@");
  if (at === -1 || at === email.length - 1) return null;
  return email.slice(at + 1).trim().toLowerCase() || null;
}

function buildDegradedEmailCommandCenterSnapshot(): EmailCommandCenterSnapshot {
  const oauthCfg = getGmailOAuthConfigStatus();
  const pubsubTopicEnvPresent = isGmailPubSubTopicConfigured();
  const pubsubVerifierPresent = isGmailPubSubVerificationConfigured();
  const watchTopicReady = isGmailWatchConfigured();
  let commandSurfacePhase: GmailReadinessSnapshot["commandSurfacePhase"];
  if (!oauthCfg.isConfigured) {
    commandSurfacePhase = "env_incomplete";
  } else {
    commandSurfacePhase = "needs_actor";
  }
  const dbHostKind = classifyDatabaseUrlHostKindForOperatorGate();
  const gate: EmailCommandCenterOperatorGate = {
    ...buildHostedDbOperatorGateExtension(dbHostKind),
    cockpitDbReachable: false,
    emailCommandCenterMigrations: [],
    allEmailCommandCenterMigrationsApplied: null,
    migrationGateNote:
      "Database unreachable from this server request — cockpit counts are not live. From the RedDirt folder, run the safe database diagnose script, then the email command center preflight.",
    contactImportStatusLabel: "Paused until database checks pass",
    contactImportNextPacket:
      "Row-level merge experience plus hosted-environment preflight (run the same checks on the live DATABASE_URL before imports).",
    localContactImportDbVerified: false,
    readinessDocRepoPath: "docs/email-command-center-contact-import-readiness.md",
    preflightCliHint: "npm run email:command-center:preflight",
    dbDiagnoseCliHint: "npm run email:db:diagnose",
    importGateCliHint: "npm run email:contact-import:gate",
    databaseUrlHostKind: dbHostKind,
  };
  const gmail: GmailReadinessSnapshot = {
    staffGmailAccountsTotal: 0,
    staffGmailAccountsActive: 0,
    currentActorUserResolved: false,
    currentActorHasActiveStaffGmail: false,
    actorStaffGmailSendAsDomainHint: null,
    monitorInboxSync: "foundation_only",
    lastMetadataSyncAtIso: null,
    lastMetadataSyncMessageCount: null,
    lastProfileHistoryIdPresent: false,
    composerSendScopeViaEnv: false,
    humanSendRailNote:
      "Cockpit could not reach the database — Gmail readiness is best-effort only until DATABASE_URL connectivity is restored.",
    oauthConnectPipelineReady: oauthCfg.isConfigured,
    oauthMissingEnvVarLines: oauthCfg.gaps[0]?.missingEnvVars ?? [],
    commandSurfacePhase,
    gmailWatchPushIncomplete: true,
    pubsubTopicEnvPresent,
    pubsubPushVerificationEnvPresent: pubsubVerifierPresent,
    gmailWatchDisplayStatus: "NOT_CONFIGURED",
    gmailWatchExpirationMs: null,
    watchHistoryIdPresent: false,
    pubsubReceiverConfigured: pubsubVerifierPresent && watchTopicReady,
    connectPath: "/admin/workbench/email-command-center/gmail/connect",
    monitorPath: "/admin/workbench/email-command-center/gmail",
    gmailReviewPath: "/admin/workbench/email-command-center/gmail/review",
  };
  const sendgridEnv = sendgridEnvReadiness();
  return {
    queueHealth: {
      total: 0,
      newCount: 0,
      enrichedCount: 0,
      inReviewCount: 0,
      readyToRespondCount: 0,
      approvedCount: 0,
      escalatedCount: 0,
      spamCount: 0,
      closedCount: 0,
      archivedCount: 0,
      unassignedCount: 0,
      needsAttentionCount: 0,
    },
    assignmentHealth: {
      assignedCount: 0,
      unassignedCount: 0,
      currentActorAssignedItemCount: 0,
      itemsNotUpdatedIn7DaysCount: 0,
    },
    gmail,
    sendgridEnv,
    openAi: {
      openaiApiKeyPresent: isOpenAIConfigured(),
      openaiModuleAvailable: true,
      emailAiConfigured: getEmailAiReadiness().configured,
      emailAiModelName: getEmailAiReadiness().modelName,
      emailAiSafeAnalysisAvailable: getEmailAiReadiness().safeAnalysisAvailable,
      emailAiQueueItemsAnalyzedCount: 0,
      emailTaskIntelligenceQueueItemsCount: 0,
    },
    profileGraph: {
      pendingProfileFactSuggestions: 0,
      pendingAudienceHints: 0,
      approvedActiveFacts: 0,
      profilesReviewPath: "/admin/workbench/email-command-center/profiles",
    },
    audienceStudio: {
      path: "/admin/workbench/email-command-center/audiences",
      sendgridSyncStatus: "not_connected",
      buildingBlockApprovedTriples: 0,
      draftAudienceDefinitions: 0,
      activeAudienceDefinitions: 0,
      dbSliceReachable: false,
    },
    sendGridFoundation: {
      path: "/admin/workbench/email-command-center/sendgrid",
      eventWebhookPath: "/api/sendgrid/events",
      apiKeyPresent: sendgridEnv.sendgridApiKeyPresent,
      fromIdentityReady: sendgridEnv.sendgridFromEmailPresent && sendgridEnv.sendgridFromNamePresent,
      webhookVerificationConfigured: sendgridEnv.sendgridWebhookVerificationKeyPresent,
      recentSendGridEventsCount: 0,
      suppressionCount: 0,
      audienceDefinitionsNonArchived: 0,
      dbReachable: false,
    },
    contactImport: {
      path: "/admin/workbench/email-command-center/imports",
      dbSliceReachable: false,
      pendingApprovalCount: 0,
      committedBatchCount: 0,
      openImportBatchCount: 0,
      consentWarningRowsSummed: 0,
      latestBatches: [],
    },
    messageStudioSharedDrafts: {
      path: "/admin/workbench/email-command-center/message-studio#shared-drafts",
      totalActiveSharedDrafts: 0,
      needsReview: 0,
      inReview: 0,
      approvedForSendGovernance: 0,
      dbReachable: false,
    },
    sendGridContactSync: {
      path: "/admin/workbench/email-command-center/sendgrid#contact-sync",
      dbReachable: false,
      runsPreviewedCount: 0,
      runsApprovedAwaitingExecutionCount: 0,
      runsApprovedCount: 0,
      runsSyncedCount: 0,
      runsFailedCount: 0,
      runsArchivedCount: 0,
      sumExcludedSuppressedNonArchived: 0,
      sumWarningCountNonArchived: 0,
      latestSyncedAtIso: null,
      latestSyncedProviderJobId: null,
      latestSyncedProviderStatus: null,
      latestFailedAtIso: null,
      readinessWarningsSample: [],
    },
    sendExecution: {
      path: "/admin/workbench/email-command-center/send-execution",
      dbReachable: false,
      totalExecutions: 0,
      needPreflightCount: 0,
      preflightFailedCount: 0,
      preflightFailedTopBlockers: [],
      readyForTestCount: 0,
      testSentCount: 0,
      readyForFinalApprovalCount: 0,
      finalApprovedCount: 0,
      sendingCount: 0,
      sentCount: 0,
      partialFailureCount: 0,
      failedCount: 0,
      cancelledCount: 0,
      archivedCount: 0,
      sendGridMailTestReady: false,
      sendGridMailBroadcastReady: false,
    },
    sendGridReconciliation: {
      path: "/admin/workbench/email-command-center/analytics#reconciliation",
      dbReachable: false,
      totalEvents: 0,
      matchedCount: 0,
      skippedCount: 0,
      unmatchedCount: 0,
      pendingReconciliationCount: 0,
      lastReconciledAtIso: null,
      recipientByStatus: {},
      recentEvents: [],
      bounceEventsApprox: 0,
      unsubscribeEventsApprox: 0,
      spamEventsApprox: 0,
    },
    gmailProductionWatch: {
      dbReachable: false,
      missingPubsubTopic: !isGmailWatchConfigured(),
      missingPubsubVerification: !isGmailPubSubVerificationConfigured(),
      oauthWatchPrereqsOk: getGmailOAuthConfigStatus().isConfigured,
      activeStaffAccounts: 0,
      accountsNeedingRenewalCount: 0,
      accountsWithStaleHistoryCursorCount: 0,
      watchesExpiringWithin48hCount: 0,
      pendingPubsubSignalWithoutProfileCursorCount: 0,
      monitorPath: "/admin/workbench/email-command-center/gmail",
      dryRunRenewalCli: "npm run gmail:watch:renewal-check",
    },
    automationPolicyEval: evaluateAllAutomationPolicies({
      cockpitDbReachable: false,
      localContactImportDbVerified: false,
      needsAttentionCount: 0,
      itemsNotUpdatedIn7DaysCount: 0,
      messageStudioNeedsReview: 0,
      messageStudioApprovedGovernance: 0,
      sendExecNeedPreflight: 0,
      sendExecPreflightFailed: 0,
      sendExecFailed: 0,
      runsApprovedAwaitingExecution: 0,
      runsFailed: 0,
      sendGridPendingReconciliation: 0,
      gmailWatchExpiring48h: 0,
      suppressionCount: 0,
      activeAudienceDefinitions: 0,
      sendGridDbReachable: false,
      messageStudioDbReachable: false,
      sendGridReconciliationDbReachable: false,
      sendGridContactSyncDbReachable: false,
      sendExecutionDbReachable: false,
    }),
    automationTiers: [
      { tier: "T0", label: "Manual queue", state: "live" },
      { tier: "T1", label: "Deterministic interpretation (E-2A)", state: "live" },
      { tier: "T2", label: "Operator triage actions (assign / status)", state: "live" },
      {
        tier: "T3",
        label: "External sync (Gmail OAuth + metadata + watch start/renew; Pub/Sub inbox scaffold)",
        state: "partial",
      },
      { tier: "T4", label: "Policy-governed mass/automated sends", state: "planned" },
    ],
    governance: {
      canSendFromEmailWorkflowItem: EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM,
      bullets: [
        "This dashboard does not send email — it is coordination + readiness only.",
        "Contact list CSV import uses staging + operator approve/commit (EMAIL-CONTACT-IMPORT-STAGING-1.0) — no SendGrid, no sends, no assumed opt-in. When the DB gate fails, imports are not trustworthy on this request.",
        "Message Studio route remains available for drafting copy when the DB is down — still no send; shared server drafts require a live DB (EMAIL-MESSAGE-STUDIO-SERVER-DRAFTS-1.0).",
        "Automation Studio (EMAIL-AUTOMATION-ANALYTICS-SHELL-1.0 + EMAIL-AUTOMATION-POLICY-ACTIVATION-1.0) and Analytics shells remain navigation + governance copy when the DB is down — policy rows show degraded alerts only; no activation, no sends.",
      ],
    },
    operatorGate: gate,
  };
}

async function buildSendExecutionSnapshot(): Promise<EmailCommandCenterSnapshot["sendExecution"]> {
  const path = "/admin/workbench/email-command-center/send-execution";
  const empty: EmailCommandCenterSnapshot["sendExecution"] = {
    path,
    dbReachable: false,
    totalExecutions: 0,
    needPreflightCount: 0,
    preflightFailedCount: 0,
    preflightFailedTopBlockers: [],
    readyForTestCount: 0,
    testSentCount: 0,
    readyForFinalApprovalCount: 0,
    finalApprovedCount: 0,
    sendingCount: 0,
    sentCount: 0,
    partialFailureCount: 0,
    failedCount: 0,
    cancelledCount: 0,
    archivedCount: 0,
    sendGridMailTestReady: false,
    sendGridMailBroadcastReady: false,
  };
  try {
    const mail = getSendGridMailReadiness();
    const [
      totalExecutions,
      draftExecutionCount,
      preflightFailedCount,
      readyForTestCount,
      testSentCount,
      readyForFinalApprovalCount,
      finalApprovedCount,
      sendingCount,
      sentCount,
      partialFailureCount,
      failedCount,
      cancelledCount,
      archivedCount,
    ] = await Promise.all([
      prisma.emailSendExecution.count(),
      prisma.emailSendExecution.count({ where: { status: "DRAFT" } }),
      prisma.emailSendExecution.count({ where: { status: "PREFLIGHT_FAILED" } }),
      prisma.emailSendExecution.count({ where: { status: "READY_FOR_TEST" } }),
      prisma.emailSendExecution.count({ where: { status: "TEST_SENT" } }),
      prisma.emailSendExecution.count({ where: { status: "READY_FOR_FINAL_APPROVAL" } }),
      prisma.emailSendExecution.count({ where: { status: "FINAL_APPROVED" } }),
      prisma.emailSendExecution.count({ where: { status: "SENDING" } }),
      prisma.emailSendExecution.count({ where: { status: "SENT" } }),
      prisma.emailSendExecution.count({ where: { status: "PARTIAL_FAILURE" } }),
      prisma.emailSendExecution.count({ where: { status: "FAILED" } }),
      prisma.emailSendExecution.count({ where: { status: "CANCELLED" } }),
      prisma.emailSendExecution.count({ where: { status: "ARCHIVED" } }),
    ]);
    const failedPreflightRows = await prisma.emailSendExecution.findMany({
      where: { status: "PREFLIGHT_FAILED" },
      orderBy: { updatedAt: "desc" },
      take: 80,
      select: { preflightJson: true },
    });
    const blockerTally = new Map<string, number>();
    for (const row of failedPreflightRows) {
      const id = firstFailedPreflightCheckId(row.preflightJson);
      if (id) blockerTally.set(id, (blockerTally.get(id) ?? 0) + 1);
    }
    const preflightFailedTopBlockers = [...blockerTally.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([id, count]) => ({ id, count }));

    const needPreflightCount = draftExecutionCount + preflightFailedCount;
    return {
      path,
      dbReachable: true,
      totalExecutions,
      needPreflightCount,
      preflightFailedCount,
      preflightFailedTopBlockers,
      readyForTestCount,
      testSentCount,
      readyForFinalApprovalCount,
      finalApprovedCount,
      sendingCount,
      sentCount,
      partialFailureCount,
      failedCount,
      cancelledCount,
      archivedCount,
      sendGridMailTestReady:
        mail.sendgridApiKeyConfigured && mail.fromEmailConfigured && mail.fromNameConfigured,
      sendGridMailBroadcastReady: mail.broadcastAllowed,
    };
  } catch {
    return empty;
  }
}

async function buildSendGridReconciliationSnapshot(): Promise<EmailCommandCenterSnapshot["sendGridReconciliation"]> {
  const path = "/admin/workbench/email-command-center/analytics#reconciliation";
  const empty: EmailCommandCenterSnapshot["sendGridReconciliation"] = {
    path,
    dbReachable: false,
    totalEvents: 0,
    matchedCount: 0,
    skippedCount: 0,
    unmatchedCount: 0,
    pendingReconciliationCount: 0,
    lastReconciledAtIso: null,
    recipientByStatus: {},
    recentEvents: [],
    bounceEventsApprox: 0,
    unsubscribeEventsApprox: 0,
    spamEventsApprox: 0,
  };
  try {
    const s = await getSendGridReconciliationSummary();
    if (!s.dbReachable) return empty;
    const recipientByStatus: Record<string, number> = {};
    for (const [k, v] of Object.entries(s.recipientByStatus)) {
      recipientByStatus[k] = v;
    }
    return {
      path,
      dbReachable: true,
      totalEvents: s.totalEvents,
      matchedCount: s.matchedCount,
      skippedCount: s.skippedCount,
      unmatchedCount: s.unmatchedCount,
      pendingReconciliationCount: s.pendingReconciliationCount,
      lastReconciledAtIso: s.lastReconciledAtIso,
      recipientByStatus,
      recentEvents: s.recentEvents.map((e) => ({
        id: e.id,
        eventType: e.eventType,
        email: e.email,
        occurredAtIso: e.occurredAtIso,
        reconciliationState: e.reconciliation?.state ?? null,
      })),
      bounceEventsApprox: s.bounceEventsApprox,
      unsubscribeEventsApprox: s.unsubscribeEventsApprox,
      spamEventsApprox: s.spamEventsApprox,
    };
  } catch {
    return empty;
  }
}

async function buildSendGridContactSyncSnapshot(): Promise<EmailCommandCenterSnapshot["sendGridContactSync"]> {
  const base: EmailCommandCenterSnapshot["sendGridContactSync"] = {
    path: "/admin/workbench/email-command-center/sendgrid#contact-sync",
    dbReachable: false,
    runsPreviewedCount: 0,
    runsApprovedAwaitingExecutionCount: 0,
    runsApprovedCount: 0,
    runsSyncedCount: 0,
    runsFailedCount: 0,
    runsArchivedCount: 0,
    sumExcludedSuppressedNonArchived: 0,
    sumWarningCountNonArchived: 0,
    latestSyncedAtIso: null,
    latestSyncedProviderJobId: null,
    latestSyncedProviderStatus: null,
    latestFailedAtIso: null,
    readinessWarningsSample: [],
  };
  try {
    const readiness = await getSendGridContactSyncReadiness();
    const nonArchivedWhere = { status: { not: "ARCHIVED" as const } };
    const [
      runsPreviewedCount,
      runsApprovedAwaitingExecutionCount,
      runsSyncedCount,
      runsFailedCount,
      runsArchivedCount,
      latestSynced,
      latestFailed,
      pipelineSums,
    ] = await Promise.all([
      prisma.sendGridContactSyncRun.count({ where: { status: "PREVIEWED" } }),
      prisma.sendGridContactSyncRun.count({ where: { status: "APPROVED" } }),
      prisma.sendGridContactSyncRun.count({ where: { status: "SYNCED" } }),
      prisma.sendGridContactSyncRun.count({ where: { status: "FAILED" } }),
      prisma.sendGridContactSyncRun.count({ where: { status: "ARCHIVED" } }),
      prisma.sendGridContactSyncRun.findFirst({
        where: { status: "SYNCED", syncedAt: { not: null } },
        orderBy: { syncedAt: "desc" },
        select: { syncedAt: true, resultJson: true },
      }),
      prisma.sendGridContactSyncRun.findFirst({
        where: { status: "FAILED" },
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true },
      }),
      prisma.sendGridContactSyncRun.aggregate({
        where: nonArchivedWhere,
        _sum: { excludedSuppressedCount: true, warningCount: true },
      }),
    ]);

    let latestSyncedProviderJobId: string | null = null;
    let latestSyncedProviderStatus: string | null = null;
    if (latestSynced?.resultJson && typeof latestSynced.resultJson === "object" && !Array.isArray(latestSynced.resultJson)) {
      const j = latestSynced.resultJson as Record<string, unknown>;
      if (typeof j.providerJobId === "string" && j.providerJobId.trim()) latestSyncedProviderJobId = j.providerJobId.trim();
      if (typeof j.providerStatus === "string" && j.providerStatus.trim()) latestSyncedProviderStatus = j.providerStatus.trim();
    }

    return {
      ...base,
      dbReachable: readiness.dbReachable && readiness.syncRunTableAvailable,
      runsPreviewedCount,
      runsApprovedAwaitingExecutionCount,
      runsApprovedCount: runsApprovedAwaitingExecutionCount,
      runsSyncedCount,
      runsFailedCount,
      runsArchivedCount,
      sumExcludedSuppressedNonArchived: pipelineSums._sum.excludedSuppressedCount ?? 0,
      sumWarningCountNonArchived: pipelineSums._sum.warningCount ?? 0,
      latestSyncedAtIso: latestSynced?.syncedAt?.toISOString() ?? null,
      latestSyncedProviderJobId,
      latestSyncedProviderStatus,
      latestFailedAtIso: latestFailed?.updatedAt?.toISOString() ?? null,
      readinessWarningsSample: readiness.warnings.slice(0, 4),
    };
  } catch {
    return base;
  }
}

/**
 * Read-only aggregate snapshot for the Email Command Center dashboard.
 * No provider calls; no secrets returned.
 */
export async function getEmailCommandCenterSnapshot(): Promise<EmailCommandCenterSnapshot> {
  try {
  const summary = await getEmailWorkflowQueueSummary();
  const actorId = await getAdminActorUserId();

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    spamCount,
    closedCount,
    archivedCount,
    currentActorAssignedItemCount,
    itemsNotUpdatedIn7DaysCount,
    staffGmailAccountsTotal,
    staffGmailAccountsActive,
    actorStaffGmail,
    emailAiQueueItemsAnalyzedCount,
    emailTaskIntelligenceQueueItemsCount,
    profileGraphCounts,
    audienceStudioCounts,
    sendGridEventCount,
    sendGridSuppressionCount,
    audienceDefinitionsNonArchived,
  ] = await Promise.all([
    prisma.emailWorkflowItem.count({ where: { status: "SPAM" } }),
    prisma.emailWorkflowItem.count({ where: { status: "CLOSED" } }),
    prisma.emailWorkflowItem.count({ where: { status: "ARCHIVED" } }),
    actorId
      ? prisma.emailWorkflowItem.count({ where: { assignedToUserId: actorId } })
      : Promise.resolve(0),
    prisma.emailWorkflowItem.count({ where: { updatedAt: { lt: sevenDaysAgo } } }),
    prisma.staffGmailAccount.count(),
    prisma.staffGmailAccount.count({ where: { isActive: true } }),
    actorId
      ? prisma.staffGmailAccount.findFirst({
          where: { userId: actorId, isActive: true },
          select: { sendAsEmail: true, gmailSyncState: true },
        })
      : Promise.resolve(null),
    countEmailWorkflowItemsWithEmailAiAnalysis(),
    countEmailWorkflowItemsWithEmailTaskIntelligence(),
    emailProfileGraphSnapshotCounts(),
    emailAudienceStudioSnapshotCounts(),
    prisma.sendGridEvent.count().catch(() => -1),
    prisma.sendGridSuppression.count().catch(() => -1),
    prisma.emailAudienceDefinition.count({ where: { status: { not: "ARCHIVED" } } }).catch(() => -1),
  ]);

  const assignedCount = Math.max(0, summary.total - summary.unassignedCount);
  const domainHint = actorStaffGmail?.sendAsEmail
    ? extractEmailDomain(actorStaffGmail.sendAsEmail)
    : null;

  const actorSync = actorStaffGmail ? parseGmailSyncState(actorStaffGmail.gmailSyncState) : null;
  const watchDisplay = actorSync ? resolveDisplayWatchStatus(actorSync) : "NOT_CONFIGURED";
  const posture = getGmailScopePosture();

  const oauthCfg = getGmailOAuthConfigStatus();
  const pubsubTopicEnvPresent = isGmailPubSubTopicConfigured();
  const pubsubVerifierPresent = isGmailPubSubVerificationConfigured();
  const watchTopicReady = isGmailWatchConfigured();

  let commandSurfacePhase: GmailReadinessSnapshot["commandSurfacePhase"];
  if (!oauthCfg.isConfigured) {
    commandSurfacePhase = "env_incomplete";
  } else if (!actorId) {
    commandSurfacePhase = "needs_actor";
  } else if (!actorStaffGmail) {
    commandSurfacePhase = "ready_to_connect";
  } else {
    commandSurfacePhase = "connected";
  }

  const gmailWatchPushIncomplete =
    commandSurfacePhase === "connected" &&
    (!watchTopicReady || watchDisplay !== "ACTIVE" || !pubsubVerifierPresent);

  const gmail: GmailReadinessSnapshot = {
    staffGmailAccountsTotal,
    staffGmailAccountsActive,
    currentActorUserResolved: Boolean(actorId),
    currentActorHasActiveStaffGmail: Boolean(actorStaffGmail),
    actorStaffGmailSendAsDomainHint: domainHint,
    monitorInboxSync: actorSync?.lastSuccessfulSyncAt ? "metadata_sync_ready" : "foundation_only",
    lastMetadataSyncAtIso: actorSync?.lastSuccessfulSyncAt ?? null,
    lastMetadataSyncMessageCount: actorSync?.lastMetadataSyncCount ?? null,
    lastProfileHistoryIdPresent: Boolean(actorSync?.lastHistoryId),
    composerSendScopeViaEnv: posture.composerSendRequestedViaEnv,
    humanSendRailNote:
      actorStaffGmail == null
        ? "No active Staff Gmail link for the current admin actor — use Connect from the Gmail monitor when the OAuth env is ready."
        : posture.composerSendRequestedViaEnv
          ? "Staff linked with composer send scope via env — human send stays on the comms workbench; monitoring does not send."
          : "Staff linked (monitor defaults to gmail.metadata only). Set GMAIL_OAUTH_INCLUDE_SEND_FOR_WORKBENCH=true and reconnect if the workbench composer needs gmail.send.",
    oauthConnectPipelineReady: oauthCfg.isConfigured,
    oauthMissingEnvVarLines: oauthCfg.gaps[0]?.missingEnvVars ?? [],
    commandSurfacePhase,
    gmailWatchPushIncomplete,
    pubsubTopicEnvPresent,
    pubsubPushVerificationEnvPresent: pubsubVerifierPresent,
    gmailWatchDisplayStatus: watchDisplay,
    gmailWatchExpirationMs: actorSync?.watchExpiration ?? null,
    watchHistoryIdPresent: Boolean(actorSync?.watchHistoryId),
    pubsubReceiverConfigured: pubsubVerifierPresent && watchTopicReady,
    connectPath: "/admin/workbench/email-command-center/gmail/connect",
    monitorPath: "/admin/workbench/email-command-center/gmail",
    gmailReviewPath: "/admin/workbench/email-command-center/gmail/review",
  };

  const automationTiers: AutomationTierSnapshot[] = [
    { tier: "T0", label: "Manual queue", state: "live" },
    { tier: "T1", label: "Deterministic interpretation (E-2A)", state: "live" },
    { tier: "T2", label: "Operator triage actions (assign / status)", state: "live" },
    {
      tier: "T3",
      label: "External sync (Gmail OAuth + metadata + watch start/renew; Pub/Sub inbox scaffold)",
      state: "partial",
    },
    { tier: "T4", label: "Policy-governed mass/automated sends", state: "planned" },
  ];

  const governance: GovernanceSnapshot = {
    canSendFromEmailWorkflowItem: EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM,
    bullets: [
      "This dashboard does not send email — it coordinates triage, drafts, and readiness only.",
      "Mass and broadcast sends need a governed delivery provider, suppression lists, and unsubscribe handling before scale.",
      "Gmail human send uses OAuth outside this UI — never paste tokens into tickets or chat.",
      "Gmail inbox notifications record metadata only when verification is configured — no auto-fetch of full bodies.",
      "Gmail inbox watch: renew before expiry; use the renewal dry-run from RedDirt/; stale history cursors need metadata sync first — still no send from these tools.",
      "OpenAI on the queue: advisory analysis only when a server key is set — no auto-send or auto-approval from model output.",
      "Contact profile graph: AI suggestions stay pending until staff approve; approved facts land on audit tables — not silent merges into volunteer profiles. Saved audiences are not provider mailing lists.",
      "Audience studio: previews use approved profile data — no automatic list sync, no sends, no silent CRM rewrites.",
      "SendGrid foundation: signed webhooks land delivery and suppression events in the database when the workspace is updated — no sends, no auto contact sync, no silent profile writes from that path.",
      "SendGrid contact sync: preview, approve, then optional governed upserts for approved runs — contact management only, not campaigns or mass send.",
      "CSV contact import: staging with staff validate → approve → commit only — no delivery, no assumed opt-in. Run the same hosted-environment checks on production DATABASE_URL before treating imports as live.",
      "Message Studio: local drafts plus optional shared drafts in the database, campaign voice, editorial review, templates; optional server AI when configured — still no send and no legal compliance guarantee from the tool.",
      "Daily console: snapshot-driven priorities, next actions, and deep links to queues — read-only draft counts from the database; no sends.",
      "Automation studio: governance map and read-only policy evaluation from live counts — no workers, no auto-send; refresh updates the snapshot only.",
      "Analytics: read-only aggregates plus optional staff-triggered reconciliation of delivery events — no provider send API and no Gmail send.",
      "Send execution: governed test and broadcast path only after approvals, active audience, suppressions, optional synced contacts, explicit test send, final approval, and typed confirmation — queue send from items stays off.",
      "AI may suggest; staff and policy decide execution and sensitive writes.",
    ],
  };

  const sendgridEnv = sendgridEnvReadiness();
  const sendGridDbReachable = sendGridEventCount >= 0;

  let emailCommandCenterMigrations: { name: string; applied: boolean }[] = [];
  let allEmailCommandCenterMigrationsApplied: boolean | null = null;
  const mccRowsResult = await queryEmailCommandCenterMigrationRows(prisma).catch((): null => null);
  if (mccRowsResult === null) {
    emailCommandCenterMigrations = [];
    allEmailCommandCenterMigrationsApplied = null;
  } else {
    emailCommandCenterMigrations = mccRowsResult;
    allEmailCommandCenterMigrationsApplied =
      mccRowsResult.length === EMAIL_COMMAND_CENTER_MIGRATION_DIRS.length &&
      mccRowsResult.every((r) => r.applied);
  }

  let migrationGateNote: string | null = null;
  if (allEmailCommandCenterMigrationsApplied === false) {
    migrationGateNote =
      "One or more workspace database updates for messaging tools are not applied on this database. From the RedDirt project folder, run the email command center preflight your team uses after deploy.";
  } else if (allEmailCommandCenterMigrationsApplied === null) {
    migrationGateNote =
      "Could not verify workspace database update status (database unreachable or the check query failed).";
  }

  const importSnap = await contactImportSnapshotCounts();
  const messageStudioSharedDraftsSnapshot = await messageStudioSharedDraftSnapshotCounts();
  const sendGridContactSyncSnapshot = await buildSendGridContactSyncSnapshot();
  const sendExecutionSnapshot = await buildSendExecutionSnapshot();
  const sendGridReconciliationSnapshot = await buildSendGridReconciliationSnapshot();
  const gmailProductionWatchSnapshot = await buildGmailProductionWatchSnapshot();
  const localContactImportDbVerified =
    allEmailCommandCenterMigrationsApplied === true && importSnap.dbSliceReachable;

  const dbHostKindLive = classifyDatabaseUrlHostKindForOperatorGate();
  const operatorGate: EmailCommandCenterOperatorGate = {
    ...buildHostedDbOperatorGateExtension(dbHostKindLive),
    cockpitDbReachable: true,
    emailCommandCenterMigrations,
    allEmailCommandCenterMigrationsApplied,
    migrationGateNote,
    contactImportStatusLabel:
      allEmailCommandCenterMigrationsApplied === true
        ? importSnap.dbSliceReachable
          ? "Contact import staging is live — validate, approve, then commit; writes stay on contact profiles and import audit fields only."
          : "Workspace updates look applied, but import tables did not respond — confirm DATABASE_URL and rerun preflight."
        : "Paused until database checks pass",
    contactImportNextPacket:
      "Row-level merge experience plus hosted-environment preflight (run the same checks on the live DATABASE_URL before imports).",
    localContactImportDbVerified,
    readinessDocRepoPath: "docs/email-command-center-contact-import-readiness.md",
    preflightCliHint: "npm run email:command-center:preflight",
    dbDiagnoseCliHint: "npm run email:db:diagnose",
    importGateCliHint: "npm run email:contact-import:gate",
    databaseUrlHostKind: dbHostKindLive,
  };

  const automationPolicyEval = evaluateAllAutomationPolicies({
    cockpitDbReachable: operatorGate.cockpitDbReachable,
    localContactImportDbVerified,
    needsAttentionCount: summary.needsAttentionCount,
    itemsNotUpdatedIn7DaysCount,
    messageStudioNeedsReview: messageStudioSharedDraftsSnapshot.needsReview,
    messageStudioApprovedGovernance: messageStudioSharedDraftsSnapshot.approvedForSendGovernance,
    sendExecNeedPreflight: sendExecutionSnapshot.needPreflightCount,
    sendExecPreflightFailed: sendExecutionSnapshot.preflightFailedCount,
    sendExecFailed: sendExecutionSnapshot.failedCount,
    runsApprovedAwaitingExecution: sendGridContactSyncSnapshot.runsApprovedAwaitingExecutionCount,
    runsFailed: sendGridContactSyncSnapshot.runsFailedCount,
    sendGridPendingReconciliation: sendGridReconciliationSnapshot.pendingReconciliationCount,
    gmailWatchExpiring48h: gmailProductionWatchSnapshot.watchesExpiringWithin48hCount,
    suppressionCount: sendGridDbReachable ? sendGridSuppressionCount : 0,
    activeAudienceDefinitions: audienceStudioCounts.activeAudienceDefinitions,
    sendGridDbReachable,
    messageStudioDbReachable: messageStudioSharedDraftsSnapshot.dbReachable,
    sendGridReconciliationDbReachable: sendGridReconciliationSnapshot.dbReachable,
    sendGridContactSyncDbReachable: sendGridContactSyncSnapshot.dbReachable,
    sendExecutionDbReachable: sendExecutionSnapshot.dbReachable,
  });

  const emailAi = getEmailAiReadiness();

  return {
    queueHealth: {
      total: summary.total,
      newCount: summary.newCount,
      enrichedCount: summary.enrichedCount,
      inReviewCount: summary.inReviewCount,
      readyToRespondCount: summary.readyCount,
      approvedCount: summary.approvedCount,
      escalatedCount: summary.escalatedCount,
      spamCount,
      closedCount,
      archivedCount,
      unassignedCount: summary.unassignedCount,
      needsAttentionCount: summary.needsAttentionCount,
    },
    assignmentHealth: {
      assignedCount,
      unassignedCount: summary.unassignedCount,
      currentActorAssignedItemCount,
      itemsNotUpdatedIn7DaysCount,
    },
    gmail,
    sendgridEnv: sendgridEnv,
    openAi: {
      openaiApiKeyPresent: isOpenAIConfigured(),
      openaiModuleAvailable: true,
      emailAiConfigured: emailAi.configured,
      emailAiModelName: emailAi.modelName,
      emailAiSafeAnalysisAvailable: emailAi.safeAnalysisAvailable,
      emailAiQueueItemsAnalyzedCount,
      emailTaskIntelligenceQueueItemsCount,
    },
    profileGraph: {
      pendingProfileFactSuggestions: profileGraphCounts.pendingProfileSuggestions,
      pendingAudienceHints: profileGraphCounts.pendingAudienceHints,
      approvedActiveFacts: profileGraphCounts.approvedActiveFacts,
      profilesReviewPath: "/admin/workbench/email-command-center/profiles",
    },
    audienceStudio: {
      path: "/admin/workbench/email-command-center/audiences",
      sendgridSyncStatus: sendGridDbReachable && audienceStudioCounts.studioTablesReachable ? "foundation_rails" : "not_connected",
      buildingBlockApprovedTriples: audienceStudioCounts.buildingBlockApprovedTriples,
      draftAudienceDefinitions: audienceStudioCounts.draftAudienceDefinitions,
      activeAudienceDefinitions: audienceStudioCounts.activeAudienceDefinitions,
      dbSliceReachable: audienceStudioCounts.studioTablesReachable,
    },
    sendGridFoundation: {
      path: "/admin/workbench/email-command-center/sendgrid",
      eventWebhookPath: "/api/sendgrid/events",
      apiKeyPresent: sendgridEnv.sendgridApiKeyPresent,
      fromIdentityReady: sendgridEnv.sendgridFromEmailPresent && sendgridEnv.sendgridFromNamePresent,
      webhookVerificationConfigured: sendgridEnv.sendgridWebhookVerificationKeyPresent,
      recentSendGridEventsCount: sendGridDbReachable ? sendGridEventCount : 0,
      suppressionCount: sendGridDbReachable ? sendGridSuppressionCount : 0,
      audienceDefinitionsNonArchived: sendGridDbReachable ? audienceDefinitionsNonArchived : 0,
      dbReachable: sendGridDbReachable,
    },
    contactImport: {
      path: "/admin/workbench/email-command-center/imports",
      dbSliceReachable: importSnap.dbSliceReachable,
      pendingApprovalCount: importSnap.pendingApprovalCount,
      committedBatchCount: importSnap.committedBatchCount,
      openImportBatchCount: importSnap.openImportBatchCount,
      consentWarningRowsSummed: importSnap.consentWarningRowsCount,
      latestBatches: importSnap.latestBatches,
    },
    messageStudioSharedDrafts: {
      path: "/admin/workbench/email-command-center/message-studio#shared-drafts",
      totalActiveSharedDrafts: messageStudioSharedDraftsSnapshot.totalActiveSharedDrafts,
      needsReview: messageStudioSharedDraftsSnapshot.needsReview,
      inReview: messageStudioSharedDraftsSnapshot.inReview,
      approvedForSendGovernance: messageStudioSharedDraftsSnapshot.approvedForSendGovernance,
      dbReachable: messageStudioSharedDraftsSnapshot.dbReachable,
    },
    sendGridContactSync: sendGridContactSyncSnapshot,
    sendExecution: sendExecutionSnapshot,
    sendGridReconciliation: sendGridReconciliationSnapshot,
    gmailProductionWatch: gmailProductionWatchSnapshot,
    automationPolicyEval,
    automationTiers,
    governance,
    operatorGate,
  };
  } catch {
    return buildDegradedEmailCommandCenterSnapshot();
  }
}
