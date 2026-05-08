import "server-only";

import { prisma } from "@/lib/db";
import {
  isVolunteerRelatedAudienceCriteria,
  isVolunteerRelatedAudienceName,
} from "@/lib/email-command-center/audience-studio";
import { getSendGridEnvStatus } from "@/lib/sendgrid/config";
import { getSendGridMailReadiness } from "@/lib/sendgrid/mail-send";

export type EmailReadinessLite = {
  activeAudienceCount: number;
  draftAudienceCount: number;
  recentActiveAudiences: Array<{ id: string; name: string; updatedAt: Date; volunteerRelated: boolean }>;
  /** Last 10 definitions any status — for Launch Room / distribution UI. */
  latestAudienceDefinitions: Array<{ id: string; name: string; status: string; updatedAt: Date; criteriaJson: unknown }>;
  volunteerActiveAudienceCount: number;
  volunteerDraftAudienceCount: number;
  latestSendGridSyncRuns: Array<{
    id: string;
    status: string;
    audienceDefinitionId: string | null;
    updatedAt: Date;
  }>;
  syncedRunCount: number;
  approvedDraftCount: number;
  recentApprovedDrafts: Array<{ id: string; title: string; updatedAt: Date }>;
  sendExecutionCountsByStatus: Record<string, number>;
  sendExecutionsAwaitingAction: Array<{ id: string; status: string; updatedAt: Date }>;
  sendgridApiKeyPresent: boolean;
  sendgridFromIdentityReady: boolean;
  sendgridAsmConfigured: boolean;
  sendgridBroadcastAllowed: boolean;
  missingSendgridEnvNames: string[];
  hostedDbProofStatus: "unknown" | "ok" | "not_ok";
  suppressionCount: number;
  lastSendGridWebhookAt: Date | null;
};

function missingSendgridNames(env: ReturnType<typeof getSendGridEnvStatus>): string[] {
  const out: string[] = [];
  if (!env.sendgridApiKeyPresent) out.push("SENDGRID_API_KEY");
  if (!env.sendgridFromEmailPresent) out.push("SENDGRID_FROM_EMAIL");
  if (!env.sendgridFromNamePresent) out.push("SENDGRID_FROM_NAME");
  if (!env.sendgridUnsubscribeGroupIdPresent) out.push("SENDGRID_UNSUBSCRIBE_GROUP_ID");
  return out;
}

/**
 * Bounded read model for dashboards — no full ECC snapshot.
 * Hosted DB proof stays expensive; use "unknown" here and link operators to Readiness for canonical proof.
 */
export async function getEmailReadinessLite(): Promise<EmailReadinessLite> {
  const env = getSendGridEnvStatus();
  const mail = getSendGridMailReadiness();

  const [
    activeAudienceCount,
    draftAudienceCount,
    recentActiveRows,
    volunteerActiveAudienceCount,
    volunteerDraftAudienceCount,
    latestSendGridSyncRuns,
    syncedRunCount,
    approvedDraftCount,
    recentApprovedDrafts,
    execGrouped,
    awaitingExecs,
    suppressionCount,
    lastWebhook,
    latestAudienceDefinitions,
  ] = await Promise.all([
    prisma.emailAudienceDefinition.count({ where: { status: "ACTIVE" } }).catch(() => 0),
    prisma.emailAudienceDefinition.count({ where: { status: "DRAFT" } }).catch(() => 0),
    prisma.emailAudienceDefinition
      .findMany({
        where: { status: "ACTIVE" },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { id: true, name: true, updatedAt: true, criteriaJson: true },
      })
      .catch(() => []),
    prisma.emailAudienceDefinition
      .count({
        where: {
          status: "ACTIVE",
          OR: [
            { name: { contains: "volunteer", mode: "insensitive" } },
            { criteriaJson: { path: ["workflowSourceType"], equals: "VOLUNTEER_TRIGGER" } },
          ],
        },
      })
      .catch(() => 0),
    prisma.emailAudienceDefinition
      .count({
        where: {
          status: "DRAFT",
          OR: [
            { name: { contains: "volunteer", mode: "insensitive" } },
            { criteriaJson: { path: ["workflowSourceType"], equals: "VOLUNTEER_TRIGGER" } },
          ],
        },
      })
      .catch(() => 0),
    prisma.sendGridContactSyncRun
      .findMany({
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { id: true, status: true, audienceDefinitionId: true, updatedAt: true },
      })
      .catch(() => []),
    prisma.sendGridContactSyncRun.count({ where: { status: "SYNCED" } }).catch(() => 0),
    prisma.messageStudioDraft.count({ where: { status: "APPROVED_FOR_SEND_GOVERNANCE" } }).catch(() => 0),
    prisma.messageStudioDraft
      .findMany({
        where: { status: "APPROVED_FOR_SEND_GOVERNANCE" },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { id: true, title: true, updatedAt: true },
      })
      .catch(() => []),
    prisma.emailSendExecution
      .groupBy({
        by: ["status"],
        _count: { _all: true },
      })
      .catch(() => []),
    prisma.emailSendExecution
      .findMany({
        where: {
          status: {
            in: ["DRAFT", "PREFLIGHT_FAILED", "READY_FOR_TEST", "TEST_SENT", "READY_FOR_FINAL_APPROVAL", "FINAL_APPROVED"],
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { id: true, status: true, updatedAt: true },
      })
      .catch(() => []),
    prisma.sendGridSuppression.count().catch(() => 0),
    prisma.sendGridEvent.findFirst({ orderBy: { createdAt: "desc" }, select: { createdAt: true } }).catch(() => null),
    prisma.emailAudienceDefinition
      .findMany({
        orderBy: { updatedAt: "desc" },
        take: 10,
        select: { id: true, name: true, status: true, updatedAt: true, criteriaJson: true },
      })
      .catch(() => []),
  ]);

  const sendExecutionCountsByStatus: Record<string, number> = {};
  for (const row of execGrouped) {
    sendExecutionCountsByStatus[row.status] = row._count._all;
  }

  const recentActiveAudiences = recentActiveRows.map((r) => ({
    id: r.id,
    name: r.name,
    updatedAt: r.updatedAt,
    volunteerRelated:
      isVolunteerRelatedAudienceCriteria(r.criteriaJson) || isVolunteerRelatedAudienceName(r.name),
  }));

  return {
    activeAudienceCount,
    draftAudienceCount,
    recentActiveAudiences,
    latestAudienceDefinitions,
    volunteerActiveAudienceCount,
    volunteerDraftAudienceCount,
    latestSendGridSyncRuns,
    syncedRunCount,
    approvedDraftCount,
    recentApprovedDrafts,
    sendExecutionCountsByStatus,
    sendExecutionsAwaitingAction: awaitingExecs,
    sendgridApiKeyPresent: env.sendgridApiKeyPresent,
    sendgridFromIdentityReady: env.sendgridFromEmailPresent && env.sendgridFromNamePresent,
    sendgridAsmConfigured: env.sendgridUnsubscribeGroupIdPresent,
    sendgridBroadcastAllowed: mail.broadcastAllowed,
    missingSendgridEnvNames: missingSendgridNames(env),
    hostedDbProofStatus: "unknown",
    suppressionCount,
    lastSendGridWebhookAt: lastWebhook?.createdAt ?? null,
  };
}
