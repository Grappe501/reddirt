import "server-only";

import { prisma } from "@/lib/db";
import {
  isVolunteerRelatedAudienceCriteria,
  isVolunteerRelatedAudienceName,
} from "@/lib/email-command-center/audience-studio";
import { getSendGridEnvStatus } from "@/lib/sendgrid/config";
import { getSendGridMailReadiness } from "@/lib/sendgrid/mail-send";
import { getHostedDbProofSummary } from "@/lib/email-command-center/hosted-db-proof";
import { getCachedEmailReadinessLite } from "@/lib/workbench/operator-readiness-cache";

export type EmailLaunchRoomAudienceRow = {
  id: string;
  name: string;
  status: string;
  updatedAt: Date;
  volunteerRelated: boolean;
};

export type EmailLaunchRoomSnapshot = {
  /** True when bounded Launch Room aggregate loaded (no full ECC read-model on this path). */
  eccLoaded: boolean;
  /** Bounded lists for UI */
  latestAudiences: EmailLaunchRoomAudienceRow[];
  latestSyncRuns: Array<{
    id: string;
    status: string;
    audienceDefinitionId: string | null;
    updatedAt: Date;
  }>;
  latestDrafts: Array<{ id: string; title: string; status: string; updatedAt: Date }>;
  latestExecutions: Array<{ id: string; status: string; updatedAt: Date }>;
  audienceDraftCount: number;
  audienceActiveCount: number;
  audienceArchivedCount: number;
  volunteerActiveAudienceCount: number;
  volunteerDraftAudienceCount: number;
  sendGridEnv: ReturnType<typeof getSendGridEnvStatus>;
  sendGridMail: ReturnType<typeof getSendGridMailReadiness>;
  missingSendgridEnvNames: string[];
  asmConfigured: boolean;
  hostedDbProofOk: boolean;
  hostedDbProofNote: string;
  suppressionCount: number;
  lastSendGridEventCreatedAt: Date | null;
  sendExecution: {
    needPreflightCount: number;
    preflightFailedCount: number;
    readyForTestCount: number;
    testSentCount: number;
    readyForFinalApprovalCount: number;
    finalApprovedCount: number;
    sentCount: number;
    failedCount: number;
  };
  governance: {
    approvedDraftCount: number;
    draftsNeedingGovernanceCount: number;
  };
  nextStep: {
    label: string;
    href: string;
    reason: string;
  };
};

function missingSendgridNames(env: ReturnType<typeof getSendGridEnvStatus>): string[] {
  const out: string[] = [];
  if (!env.sendgridApiKeyPresent) out.push("SENDGRID_API_KEY");
  if (!env.sendgridFromEmailPresent) out.push("SENDGRID_FROM_EMAIL");
  if (!env.sendgridFromNamePresent) out.push("SENDGRID_FROM_NAME");
  if (!env.sendgridUnsubscribeGroupIdPresent) out.push("SENDGRID_UNSUBSCRIBE_GROUP_ID");
  return out;
}

function sendExecutionBreakdownFromLite(counts: Record<string, number>) {
  const g = (k: string) => counts[k] ?? 0;
  return {
    needPreflightCount: g("DRAFT") + g("PREFLIGHT_FAILED"),
    preflightFailedCount: g("PREFLIGHT_FAILED"),
    readyForTestCount: g("READY_FOR_TEST"),
    testSentCount: g("TEST_SENT"),
    readyForFinalApprovalCount: g("READY_FOR_FINAL_APPROVAL"),
    finalApprovedCount: g("FINAL_APPROVED"),
    sentCount: g("SENT"),
    failedCount: g("FAILED"),
  };
}

function computeNextStep(input: {
  activeAudiences: number;
  syncedRuns: number;
  approvedDrafts: number;
  needPreflight: number;
  readyForTest: number;
  testSent: number;
  readyFinal: number;
}): EmailLaunchRoomSnapshot["nextStep"] {
  const base = "/admin/workbench/email-command-center";
  if (input.activeAudiences === 0) {
    return {
      label: "Activate an audience",
      href: `${base}/audiences`,
      reason: "Send Execution and SendGrid sync require at least one ACTIVE audience definition.",
    };
  }
  if (input.syncedRuns === 0) {
    return {
      label: "Run SendGrid contact sync",
      href: `${base}/sendgrid`,
      reason: "Governed broadcast path expects a SYNCED SendGridContactSyncRun for the cohort you will mail.",
    };
  }
  if (input.approvedDrafts === 0) {
    return {
      label: "Approve a Message Studio draft",
      href: `${base}/message-studio`,
      reason: "No APPROVED_FOR_SEND_GOVERNANCE drafts detected — message + send packet must clear governance first.",
    };
  }
  if (input.needPreflight > 0) {
    return {
      label: "Run Send Execution preflight",
      href: `${base}/send-execution#ops`,
      reason: "Executions are waiting on preflight or failed preflight — fix blockers before test send.",
    };
  }
  if (input.readyForTest > 0) {
    return {
      label: "Send test mail",
      href: `${base}/send-execution#ops`,
      reason: "At least one execution is READY_FOR_TEST.",
    };
  }
  if (input.testSent > 0 || input.readyFinal > 0) {
    return {
      label: "Final approval queue",
      href: `${base}/send-execution#ops`,
      reason: "Test sent or awaiting final approval — complete governance confirmations.",
    };
  }
  return {
    label: "Open Send Execution",
    href: `${base}/send-execution#ops`,
    reason: "Pieces look aligned — assemble or continue a governed execution.",
  };
}

export async function getEmailLaunchRoomSnapshot(): Promise<EmailLaunchRoomSnapshot> {
  const lite = await getCachedEmailReadinessLite();

  const [latestDrafts, latestExecutions, audienceArchivedCount, draftsNeedingGovernanceCount] = await Promise.all([
    prisma.messageStudioDraft
      .findMany({
        orderBy: { updatedAt: "desc" },
        take: 10,
        select: { id: true, title: true, status: true, updatedAt: true },
      })
      .catch(() => []),
    prisma.emailSendExecution
      .findMany({
        orderBy: { updatedAt: "desc" },
        take: 10,
        select: { id: true, status: true, updatedAt: true },
      })
      .catch(() => []),
    prisma.emailAudienceDefinition.count({ where: { status: "ARCHIVED" } }).catch(() => 0),
    prisma.messageStudioDraft
      .count({
        where: { status: { in: ["DRAFT", "NEEDS_REVIEW", "IN_REVIEW"] } },
      })
      .catch(() => 0),
  ]);

  let hostedDbProofOk = false;
  let hostedDbProofNote = "Hosted DB proof not loaded.";
  try {
    const hosted = await getHostedDbProofSummary();
    hostedDbProofOk = hosted.ok;
    hostedDbProofNote = hosted.nextRecommendedStep;
  } catch {
    hostedDbProofNote = "Hosted DB proof call failed — treat as not green until Readiness passes.";
  }

  const env = getSendGridEnvStatus();
  const mail = getSendGridMailReadiness();
  const seBreakdown = sendExecutionBreakdownFromLite(lite.sendExecutionCountsByStatus);

  const nextStep = computeNextStep({
    activeAudiences: lite.activeAudienceCount,
    syncedRuns: lite.syncedRunCount,
    approvedDrafts: lite.approvedDraftCount,
    needPreflight: seBreakdown.needPreflightCount,
    readyForTest: seBreakdown.readyForTestCount,
    testSent: seBreakdown.testSentCount,
    readyFinal: seBreakdown.readyForFinalApprovalCount,
  });

  return {
    eccLoaded: true,
    latestAudiences: lite.latestAudienceDefinitions.map((a) => ({
      id: a.id,
      name: a.name,
      status: a.status,
      updatedAt: a.updatedAt,
      volunteerRelated:
        isVolunteerRelatedAudienceCriteria(a.criteriaJson) || isVolunteerRelatedAudienceName(a.name),
    })),
    latestSyncRuns: lite.latestSendGridSyncRuns.map((r) => ({
      id: r.id,
      status: r.status,
      audienceDefinitionId: r.audienceDefinitionId,
      updatedAt: r.updatedAt,
    })),
    latestDrafts: latestDrafts.map((d) => ({
      id: d.id,
      title: d.title,
      status: d.status,
      updatedAt: d.updatedAt,
    })),
    latestExecutions: latestExecutions.map((e) => ({
      id: e.id,
      status: e.status,
      updatedAt: e.updatedAt,
    })),
    audienceDraftCount: lite.draftAudienceCount,
    audienceActiveCount: lite.activeAudienceCount,
    audienceArchivedCount,
    volunteerActiveAudienceCount: lite.volunteerActiveAudienceCount,
    volunteerDraftAudienceCount: lite.volunteerDraftAudienceCount,
    sendGridEnv: env,
    sendGridMail: mail,
    missingSendgridEnvNames: missingSendgridNames(env),
    asmConfigured: env.sendgridUnsubscribeGroupIdPresent,
    hostedDbProofOk,
    hostedDbProofNote,
    suppressionCount: lite.suppressionCount,
    lastSendGridEventCreatedAt: lite.lastSendGridWebhookAt,
    sendExecution: seBreakdown,
    governance: {
      approvedDraftCount: lite.approvedDraftCount,
      draftsNeedingGovernanceCount,
    },
    nextStep,
  };
}
