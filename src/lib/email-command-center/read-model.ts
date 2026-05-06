import { prisma } from "@/lib/db";
import { getAdminActorUserId } from "@/lib/admin/actor";
import { getEmailWorkflowQueueSummary, countEmailWorkflowItemsWithEmailAiAnalysis } from "@/lib/email-workflow/queries";
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
import {
  EMAIL_COMMAND_CENTER_MIGRATION_DIRS,
  queryEmailCommandCenterMigrationRows,
} from "@/lib/email-command-center/ecc-migration-gate";
import { contactImportSnapshotCounts } from "@/lib/email-command-center/contact-import";
import type { EmailContactImportBatchStatus } from "@prisma/client";

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
export type EmailCommandCenterOperatorGate = {
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
  const gate: EmailCommandCenterOperatorGate = {
    cockpitDbReachable: false,
    emailCommandCenterMigrations: [],
    allEmailCommandCenterMigrationsApplied: null,
    migrationGateNote:
      "Database unreachable from this server request — cockpit counts are not live. From RedDirt/, run npm run email:db:diagnose (safe) then npm run email:command-center:preflight.",
    contactImportStatusLabel: "Paused until DB gate passes",
    contactImportNextPacket: "Row-level merge UX + canonical Supabase-hosted preflight",
    localContactImportDbVerified: false,
    readinessDocRepoPath: "docs/email-command-center-contact-import-readiness.md",
    preflightCliHint: "npm run email:command-center:preflight",
    dbDiagnoseCliHint: "npm run email:db:diagnose",
    importGateCliHint: "npm run email:contact-import:gate",
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
        "Message Studio route remains available for drafting copy when the DB is down — still no send and no server persistence in EMAIL-COMMAND-CENTER-TONIGHT-FINISH-1.0.",
        "Automation Studio and Analytics & Deliverability shells (EMAIL-AUTOMATION-ANALYTICS-SHELL-1.0) remain navigation + governance copy when the DB is down — no activation, no sends.",
      ],
    },
    operatorGate: gate,
  };
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
      "This dashboard does not send email — it is coordination + readiness only.",
      "Mass and broadcast sends require a governed SendGrid (or equivalent) packet; suppression and unsubscribe handling are mandatory before scaling sends.",
      "Gmail human send requires OAuth/token flows outside this shell; never expose tokens in UI.",
      "POST /api/gmail/pubsub records notification metadata when verification token + topic are configured — no auto-fetch, no bodies.",
      "OpenAI Email Intelligence (EMAIL-AI-INTELLIGENCE-1.0): advisory analysis on email queue detail — OPENAI_API_KEY required; no auto-send or auto-approval from AI output.",
      "Contact/Profile Graph (EMAIL-CONTACT-PROFILE-GRAPH-1.0): AI profile suggestions stage as PENDING until operator approval; facts land on EmailContactProfileFact only — not auto User/VolunteerProfile merges. Audience hints are not SendGrid segments.",
      "Audience / Microtargeting Studio (EMAIL-AUDIENCE-STUDIO-1.0): previews and saved definitions use approved profile graph data — no SendGrid sync, no sends, no automatic CRM updates.",
      "SendGrid foundation (EMAIL-SENDGRID-FOUNDATION-1.0): POST /api/sendgrid/events ingests signed Event Webhook payloads into SendGridEvent + SendGridSuppression when the DB migration is applied — no sends, no OpenAI, no auto contact sync, no User/VolunteerProfile writes from this path.",
      "Contact list CSV import (EMAIL-CONTACT-IMPORT-STAGING-1.0): staging + operator validate/approve/commit only — never SendGrid sync, never sends from this path, never assumed opt-in. Canonical Supabase DB / production requires the same CLI gates on that DATABASE_URL.",
      "Message Studio (TONIGHT-FINISH + LOCAL-DRAFTS + CAMPAIGN-VOICE + EDITORIAL-REVIEW-DESK-1.0 + PRODUCTION-TEMPLATES-1.0): browser localStorage drafts + Campaign Voice + Editorial Review Desk + production template registry/panel (risk/approval/compliance, apply modes, template history on draft); optional admin-server OpenAI when OPENAI_API_KEY is set (optional bounded templateSummary on generate); not server-backed; no legal compliance claim.",
      "Daily Operator Console (EMAIL-DAILY-OPERATOR-CONSOLE-1.0): /admin/workbench/email-command-center/daily — snapshot-driven priority cards, rule-based next actions, work queue deep links; client-only localStorage draft summary for this browser; no DB writes, no sends.",
      "Automation Studio (EMAIL-AUTOMATION-ANALYTICS-SHELL-1.0): governance + roadmap surface only — no automation activation, no auto-send, no background jobs from this route.",
      "Analytics & Deliverability (EMAIL-AUTOMATION-ANALYTICS-SHELL-1.0): read-only cockpit aggregates — does not grant send permission; no SendGrid or Gmail send from this route.",
      "Send Execution Governance (EMAIL-SEND-EXECUTION-GOVERNANCE-SHELL-1.0): `/admin/workbench/email-command-center/send-execution` — operator doctrine for future Gmail/SendGrid sends (rails, pre-send checklist, suppression + approval map). No provider APIs, no sends; execution remains EMAIL-SEND-EXECUTION-1.0.",
      "AI may suggest; operators and policy decide execution and sensitive writes.",
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
      "One or more Email Command Center migrations are not applied on this database — run npx prisma migrate deploy from RedDirt/, then npm run email:command-center:preflight.";
  } else if (allEmailCommandCenterMigrationsApplied === null) {
    migrationGateNote = "Could not verify Email Command Center migrations (_prisma_migrations query failed).";
  }

  const importSnap = await contactImportSnapshotCounts();
  const localContactImportDbVerified =
    allEmailCommandCenterMigrationsApplied === true && importSnap.dbSliceReachable;

  const operatorGate: EmailCommandCenterOperatorGate = {
    cockpitDbReachable: true,
    emailCommandCenterMigrations,
    allEmailCommandCenterMigrationsApplied,
    migrationGateNote,
    contactImportStatusLabel:
      allEmailCommandCenterMigrationsApplied === true
        ? importSnap.dbSliceReachable
          ? "EMAIL-CONTACT-IMPORT-STAGING-1.0 — staging UI live; validate → approve → commit writes EmailContactProfile + CONTACT_IMPORT facts only."
          : "ECC migrations applied but import tables did not respond — check DATABASE_URL and rerun preflight."
        : "Paused until DB gate passes",
    contactImportNextPacket: "Row-level merge UX + canonical Supabase-hosted preflight (same gates on hosted DATABASE_URL)",
    localContactImportDbVerified,
    readinessDocRepoPath: "docs/email-command-center-contact-import-readiness.md",
    preflightCliHint: "npm run email:command-center:preflight",
    dbDiagnoseCliHint: "npm run email:db:diagnose",
    importGateCliHint: "npm run email:contact-import:gate",
  };

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
    automationTiers,
    governance,
    operatorGate,
  };
  } catch {
    return buildDegradedEmailCommandCenterSnapshot();
  }
}
