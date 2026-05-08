import "server-only";

import { prisma } from "@/lib/db";
import { isGmailOAuthConfigured } from "@/lib/integrations/gmail/env";
import { isGoogleCalendarConfigured } from "@/lib/calendar/env";

export async function getCommunicationIntelligenceSnapshot(): Promise<{
  gmailOAuthConfigured: boolean;
  googleCalendarEnvPresent: boolean;
  gmailMessageCount: number;
  googleContactCount: number;
  googleCalendarEventIngestCount: number;
  identityCount: number;
  identityNeedsReview: number;
  identitySuppressed: number;
  pendingMatchCandidates: number;
  recentIngestRuns: Array<{
    id: string;
    source: string;
    status: string;
    mode: string;
    createdAt: Date;
    errorSummary: string | null;
  }>;
  recentGmailSubjects: Array<{ id: string; subject: string | null; internalDate: Date | null }>;
}> {
  const [
    gmailMessageCount,
    googleContactCount,
    googleCalendarEventIngestCount,
    identityCount,
    identityNeedsReview,
    identitySuppressed,
    pendingMatchCandidates,
    recentIngestRuns,
    recentGmail,
  ] = await Promise.all([
    prisma.gmailMessageRecord.count().catch(() => 0),
    prisma.googleContactRecord.count().catch(() => 0),
    prisma.googleCalendarEventRecord.count().catch(() => 0),
    prisma.communicationIdentity.count().catch(() => 0),
    prisma.communicationIdentity.count({ where: { reviewStatus: "NEEDS_REVIEW" } }).catch(() => 0),
    prisma.communicationIdentity.count({ where: { reviewStatus: "SUPPRESSED" } }).catch(() => 0),
    prisma.communicationProfileMatchCandidate.count({ where: { status: "PENDING" } }).catch(() => 0),
    prisma.externalIngestRun
      .findMany({
        orderBy: { createdAt: "desc" },
        take: 12,
        select: { id: true, source: true, status: true, mode: true, createdAt: true, errorSummary: true },
      })
      .catch(() => []),
    prisma.gmailMessageRecord
      .findMany({
        orderBy: { internalDate: "desc" },
        take: 8,
        select: { id: true, subject: true, internalDate: true },
      })
      .catch(() => []),
  ]);

  return {
    gmailOAuthConfigured: isGmailOAuthConfigured(),
    googleCalendarEnvPresent: isGoogleCalendarConfigured(),
    gmailMessageCount,
    googleContactCount,
    googleCalendarEventIngestCount,
    identityCount,
    identityNeedsReview,
    identitySuppressed,
    pendingMatchCandidates,
    recentIngestRuns,
    recentGmailSubjects: recentGmail,
  };
}
