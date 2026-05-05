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
  automationTiers: AutomationTierSnapshot[];
  governance: GovernanceSnapshot;
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

/**
 * Read-only aggregate snapshot for the Email Command Center dashboard.
 * No provider calls; no secrets returned.
 */
export async function getEmailCommandCenterSnapshot(): Promise<EmailCommandCenterSnapshot> {
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
      "AI may suggest; operators and policy decide execution and sensitive writes.",
    ],
  };

  const sendgridEnv = sendgridEnvReadiness();
  const sendGridDbReachable = sendGridEventCount >= 0;

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
    openAi: (() => {
      const emailAi = getEmailAiReadiness();
      return {
        openaiApiKeyPresent: isOpenAIConfigured(),
        openaiModuleAvailable: true,
        emailAiConfigured: emailAi.configured,
        emailAiModelName: emailAi.modelName,
        emailAiSafeAnalysisAvailable: emailAi.safeAnalysisAvailable,
        emailAiQueueItemsAnalyzedCount,
      };
    })(),
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
    automationTiers,
    governance,
  };
}
