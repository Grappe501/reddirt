/**
 * EMAIL-SENDGRID-FOUNDATION-1.0 — snapshots, previews, suppression checks.
 * No SendGrid HTTP API calls; no sends; no OpenAI; no Gmail.
 */

import { prisma } from "@/lib/db";
import {
  getSendGridEnvStatus,
  getSendGridPolicySummary,
  getSendGridReadiness,
  getSendGridWebhookReadiness,
} from "@/lib/sendgrid/config";
import {
  buildAudiencePreview,
  getAudiencePreviewMatchedProfileIds,
  parseCriteria,
} from "@/lib/email-command-center/audience-studio";

const EXPORT_EMAIL_CAP = 4000;

export type SendGridFoundationSnapshot = {
  readiness: ReturnType<typeof getSendGridReadiness>;
  env: ReturnType<typeof getSendGridEnvStatus>;
  webhook: ReturnType<typeof getSendGridWebhookReadiness>;
  policy: ReturnType<typeof getSendGridPolicySummary>;
  counts: {
    sendGridEventsTotal: number;
    sendGridSuppressionsTotal: number;
    sendGridAudienceMaps: number;
    sendGridContactMaps: number;
  };
  dbReachable: boolean;
};

export type SendGridAudienceReadinessRow = {
  audienceDefinitionId: string;
  name: string;
  status: string;
  audienceMapSyncStatus: string | null;
  lastPreviewAtIso: string | null;
  /** Operator-facing label — not a SendGrid API state. */
  sendGridReadinessLabel:
    | "draft_only"
    | "preview_ready"
    | "active_preview_ready"
    | "archived";
  suppressedMatchesApprox: number | null;
};

export type SendGridContactExportPreview = {
  audienceDefinitionId: string;
  audienceName: string;
  matchCount: number;
  profilesWithPrimaryEmail: number;
  missingPrimaryEmail: number;
  suppressedInLocalTableApprox: number;
  governanceNotes: string[];
  /** Redacted sample rows for UI (no raw emails). */
  sampleRows: Array<{
    profileId: string;
    emailDomainHint: string | null;
    suppressed: boolean;
  }>;
};

export async function getSendGridFoundationSnapshot(): Promise<SendGridFoundationSnapshot> {
  const readiness = getSendGridReadiness();
  const env = getSendGridEnvStatus();
  const webhook = getSendGridWebhookReadiness();
  const policy = getSendGridPolicySummary();

  try {
    const [sendGridEventsTotal, sendGridSuppressionsTotal, sendGridAudienceMaps, sendGridContactMaps] =
      await Promise.all([
        prisma.sendGridEvent.count(),
        prisma.sendGridSuppression.count(),
        prisma.sendGridAudienceMap.count(),
        prisma.sendGridContactMap.count(),
      ]);
    return {
      readiness,
      env,
      webhook,
      policy,
      counts: {
        sendGridEventsTotal,
        sendGridSuppressionsTotal,
        sendGridAudienceMaps,
        sendGridContactMaps,
      },
      dbReachable: true,
    };
  } catch {
    return {
      readiness,
      env,
      webhook,
      policy,
      counts: {
        sendGridEventsTotal: 0,
        sendGridSuppressionsTotal: 0,
        sendGridAudienceMaps: 0,
        sendGridContactMaps: 0,
      },
      dbReachable: false,
    };
  }
}

export async function listSendGridAudienceReadiness(): Promise<SendGridAudienceReadinessRow[]> {
  try {
    const defs = await prisma.emailAudienceDefinition.findMany({
      orderBy: { updatedAt: "desc" },
      take: 48,
      select: {
        id: true,
        name: true,
        status: true,
        sendGridAudienceMap: { select: { syncStatus: true, lastPreviewAt: true } },
        previewRuns: { orderBy: { generatedAt: "desc" }, take: 1, select: { generatedAt: true } },
      },
    });

    const rows: SendGridAudienceReadinessRow[] = [];
    for (const d of defs) {
      const lastPreviewAtIso =
        d.sendGridAudienceMap?.lastPreviewAt?.toISOString() ??
        d.previewRuns[0]?.generatedAt.toISOString() ??
        null;

      if (d.status === "ARCHIVED") {
        rows.push({
          audienceDefinitionId: d.id,
          name: d.name,
          status: d.status,
          audienceMapSyncStatus: d.sendGridAudienceMap?.syncStatus ?? null,
          lastPreviewAtIso,
          sendGridReadinessLabel: "archived",
          suppressedMatchesApprox: null,
        });
        continue;
      }

      let label: SendGridAudienceReadinessRow["sendGridReadinessLabel"] = "draft_only";
      if (d.status === "ACTIVE") {
        label = "active_preview_ready";
      } else if (d.previewRuns[0] || d.sendGridAudienceMap?.lastPreviewAt) {
        label = "preview_ready";
      }

      rows.push({
        audienceDefinitionId: d.id,
        name: d.name,
        status: d.status,
        audienceMapSyncStatus: d.sendGridAudienceMap?.syncStatus ?? null,
        lastPreviewAtIso,
        sendGridReadinessLabel: label,
        suppressedMatchesApprox: null,
      });
    }
    return rows;
  } catch {
    return [];
  }
}

function emailDomainHint(email: string | null | undefined): string | null {
  if (!email?.includes("@")) return null;
  const d = email.split("@")[1]?.trim().toLowerCase();
  return d ? `@${d}` : null;
}

export async function buildSendGridContactExportPreview(audienceDefinitionId: string): Promise<SendGridContactExportPreview> {
  const def = await prisma.emailAudienceDefinition.findUnique({
    where: { id: audienceDefinitionId },
    select: { id: true, name: true, criteriaJson: true },
  });
  if (!def) throw new Error("Audience definition not found.");

  const criteria = parseCriteria(def.criteriaJson);
  const ids = await getAudiencePreviewMatchedProfileIds(criteria);
  const capped = ids.slice(0, EXPORT_EMAIL_CAP);

  const profiles =
    capped.length === 0
      ? []
      : await prisma.emailContactProfile.findMany({
          where: { id: { in: capped } },
          select: { id: true, primaryEmail: true },
        });

  const emails = profiles
    .map((p) => p.primaryEmail?.trim().toLowerCase())
    .filter((e): e is string => Boolean(e && e.includes("@")));

  const uniqueEmails = [...new Set(emails)];

  const suppressedRows =
    uniqueEmails.length === 0
      ? []
      : await prisma.sendGridSuppression.findMany({
          where: { email: { in: uniqueEmails, mode: "insensitive" } },
          select: { email: true },
        });
  const suppressedSet = new Set(suppressedRows.map((r) => r.email.trim().toLowerCase()));
  const suppressedInLocalTableApprox = suppressedSet.size;

  const profilesWithPrimaryEmail = profiles.filter((p) => Boolean(p.primaryEmail?.trim())).length;
  const missingPrimaryEmail = Math.max(0, ids.length - profilesWithPrimaryEmail);

  const sampleRows = profiles.slice(0, 8).map((p) => {
    const em = p.primaryEmail?.trim().toLowerCase();
    return {
      profileId: p.id,
      emailDomainHint: emailDomainHint(p.primaryEmail),
      suppressed: em ? suppressedSet.has(em) : false,
    };
  });

  const governanceNotes = [
    "Export preview only — no SendGrid API calls and no contact sync in EMAIL-SENDGRID-FOUNDATION-1.0.",
    "Suppressions use local SendGridSuppression rows ingested from signed webhooks only.",
    ids.length > EXPORT_EMAIL_CAP
      ? `Universe truncated to ${EXPORT_EMAIL_CAP} profiles for suppression scan performance.`
      : "Universe fully scanned for suppression overlap (within matched profile list).",
  ];

  return {
    audienceDefinitionId: def.id,
    audienceName: def.name,
    matchCount: ids.length,
    profilesWithPrimaryEmail,
    missingPrimaryEmail,
    suppressedInLocalTableApprox,
    governanceNotes,
    sampleRows,
  };
}

export async function checkEmailSuppressionStatus(email: string): Promise<{
  suppressed: boolean;
  types: string[];
}> {
  const e = email.trim().toLowerCase();
  if (!e.includes("@")) return { suppressed: false, types: [] };
  try {
    const rows = await prisma.sendGridSuppression.findMany({
      where: { email: { equals: e, mode: "insensitive" } },
      select: { suppressionType: true },
      orderBy: { occurredAt: "desc" },
      take: 20,
    });
    const types = [...new Set(rows.map((r) => r.suppressionType))];
    return { suppressed: rows.length > 0, types };
  } catch {
    return { suppressed: false, types: [] };
  }
}

export async function listRecentSendGridEvents(limit = 25): Promise<
  Array<{
    id: string;
    eventType: string;
    email: string | null;
    occurredAt: Date;
  }>
> {
  try {
    return await prisma.sendGridEvent.findMany({
      orderBy: { occurredAt: "desc" },
      take: limit,
      select: { id: true, eventType: true, email: true, occurredAt: true },
    });
  } catch {
    return [];
  }
}

export async function listSendGridSuppressionSummary(): Promise<Array<{ type: string; count: number }>> {
  try {
    const grouped = await prisma.sendGridSuppression.groupBy({
      by: ["suppressionType"],
      _count: { _all: true },
    });
    return grouped.map((g) => ({ type: g.suppressionType, count: g._count._all }));
  } catch {
    return [];
  }
}

export async function mapAudienceDefinitionToSendGridPayloadPreview(audienceDefinitionId: string): Promise<{
  description: string;
  payload: Record<string, unknown>;
}> {
  const def = await prisma.emailAudienceDefinition.findUnique({
    where: { id: audienceDefinitionId },
    select: { name: true, criteriaJson: true },
  });
  if (!def) throw new Error("Audience definition not found.");

  const criteria = parseCriteria(def.criteriaJson);
  const preview = await buildAudiencePreview(criteria);
  const contacts = preview.samples.map((s) => ({
    email: `[redacted-profile:${s.profileId}]`,
    custom_fields: { profile_id: s.profileId, domain_hint: s.emailDomainHint },
  }));

  const payload: Record<string, unknown> = {
    packet: "EMAIL-SENDGRID-FOUNDATION-1.0",
    intent: "future_contacts_api_dry_shape_only",
    audienceName: def.name,
    contactCountHint: preview.matchCount,
    sampleContactsRedacted: contacts,
    criteriaSummary: preview.limitations.slice(0, 8),
  };

  return {
    description:
      "JSON-safe, PII-redacted dry shape for a future SendGrid Marketing Campaigns contacts import — not executed.",
    payload,
  };
}
