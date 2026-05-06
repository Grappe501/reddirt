/**
 * EMAIL-SENDGRID-CONTACT-SYNC-1.1 + EMAIL-SENDGRID-CONTACT-UPsert-EXECUTION-1.2 — governed SendGrid contact sync.
 * Preview-first, suppression-aware; optional Marketing Contacts upsert for APPROVED runs only (no sends).
 */

import { prisma } from "@/lib/db";
import { getSendGridEnvStatus } from "@/lib/sendgrid/config";
import {
  buildSendGridMarketingContactPayload,
  getSendGridContactImportStatus,
  getSendGridMarketingContactsReadiness,
  sanitizeSendGridApiError,
  sendGridMarketingListIdLooksValid,
  upsertSendGridMarketingContacts,
  type SendGridMarketingContactPayload,
} from "@/lib/sendgrid/marketing-contacts";
import { buildSendGridContactExportPreview } from "@/lib/email-command-center/sendgrid-foundation";
import { getAudiencePreviewMatchedProfileIds, parseCriteria } from "@/lib/email-command-center/audience-studio";

const PROFILE_CAP = 4000;

export type SendGridContactSyncReadiness = {
  dbReachable: boolean;
  sendgridApiKeyConfigured: boolean;
  suppressionTableAvailable: boolean;
  syncRunTableAvailable: boolean;
  audienceDefinitionsNonArchived: number;
  /** True when Marketing Contacts upsert may run (API key + required DB tables) — still contact management only; no sends. */
  apiExecutionEnabled: boolean;
  apiExecutionDisabledReason: string;
  warnings: string[];
};

export type SendGridSyncableCandidate = {
  profileId: string;
  email: string;
  source: string;
};

export type SendGridContactSyncPreview = {
  audienceDefinitionId: string;
  audienceName: string;
  audienceStatus: string;
  matchCount: number;
  /** Profiles with primary email that are not locally suppressed (would be eligible after future execution packet). */
  syncableCandidateCount: number;
  excludedSuppressedCount: number;
  excludedMissingEmailCount: number;
  warnings: string[];
  exportPreviewSummary: {
    profilesWithPrimaryEmail: number;
    suppressedInLocalTableApprox: number;
    governanceNotes: string[];
  };
};

export type SendGridContactPayloadPreview = {
  description: string;
  payload: Record<string, unknown>;
};

export async function getSendGridContactSyncReadiness(): Promise<SendGridContactSyncReadiness> {
  const env = getSendGridEnvStatus();
  const warnings: string[] = [];
  let dbReachable = false;
  let suppressionTableAvailable = false;
  let syncRunTableAvailable = false;
  let audienceDefinitionsNonArchived = 0;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbReachable = true;
  } catch {
    warnings.push("Database unreachable — contact sync preview cannot be persisted.");
  }

  if (dbReachable) {
    try {
      await prisma.sendGridSuppression.count();
      suppressionTableAvailable = true;
    } catch {
      warnings.push("SendGridSuppression table not available — suppression-aware sync cannot be trusted.");
    }
    try {
      await prisma.sendGridContactSyncRun.count();
      syncRunTableAvailable = true;
    } catch {
      warnings.push("SendGridContactSyncRun table missing — apply migration 20260509120000_sendgrid_contact_sync_run.");
    }
    try {
      audienceDefinitionsNonArchived = await prisma.emailAudienceDefinition.count({
        where: { status: { not: "ARCHIVED" } },
      });
    } catch {
      audienceDefinitionsNonArchived = 0;
    }
  }

  if (!env.sendgridApiKeyPresent) {
    warnings.push("SENDGRID_API_KEY not set — Marketing Contacts upsert execution is blocked; preview and approval still work.");
  }

  const marketing = getSendGridMarketingContactsReadiness();
  const apiExecutionEnabled =
    dbReachable &&
    syncRunTableAvailable &&
    suppressionTableAvailable &&
    marketing.contactUpsertAvailable;

  let apiExecutionDisabledReason =
    "Marketing Contacts upsert is available for APPROVED runs (contact sync only — does not send email).";
  if (!dbReachable) {
    apiExecutionDisabledReason = "Database unreachable — contact sync execution blocked.";
  } else if (!syncRunTableAvailable) {
    apiExecutionDisabledReason = "SendGridContactSyncRun table missing — apply migration 20260509120000_sendgrid_contact_sync_run.";
  } else if (!suppressionTableAvailable) {
    apiExecutionDisabledReason = "SendGridSuppression table unavailable — execution blocked until suppression-aware sync is trustworthy.";
  } else if (!marketing.contactUpsertAvailable) {
    apiExecutionDisabledReason = "SENDGRID_API_KEY not set — Marketing Contacts upsert execution blocked.";
  }

  return {
    dbReachable,
    sendgridApiKeyConfigured: env.sendgridApiKeyPresent,
    suppressionTableAvailable,
    syncRunTableAvailable,
    audienceDefinitionsNonArchived,
    apiExecutionEnabled,
    apiExecutionDisabledReason,
    warnings,
  };
}

export async function excludeSuppressedContacts<T extends { email: string }>(
  candidates: T[],
): Promise<{ allowed: T[]; excludedSuppressed: number }> {
  const emails = [...new Set(candidates.map((c) => c.email.trim().toLowerCase()).filter((e) => e.includes("@")))];
  if (emails.length === 0) {
    return { allowed: [], excludedSuppressed: 0 };
  }
  let suppressedRows: { email: string }[] = [];
  try {
    suppressedRows = await prisma.sendGridSuppression.findMany({
      where: { email: { in: emails, mode: "insensitive" } },
      select: { email: true },
    });
  } catch {
    return { allowed: [], excludedSuppressed: candidates.length };
  }
  const suppressedSet = new Set(suppressedRows.map((r) => r.email.trim().toLowerCase()));
  const allowed = candidates.filter((c) => !suppressedSet.has(c.email.trim().toLowerCase()));
  const excludedSuppressed = candidates.filter((c) => suppressedSet.has(c.email.trim().toLowerCase())).length;
  return { allowed, excludedSuppressed };
}

export async function listSyncableEmailContactProfiles(audienceDefinitionId: string): Promise<SendGridSyncableCandidate[]> {
  const def = await prisma.emailAudienceDefinition.findUnique({
    where: { id: audienceDefinitionId },
    select: { id: true, status: true, criteriaJson: true },
  });
  if (!def || def.status !== "ACTIVE") {
    return [];
  }
  const criteria = parseCriteria(def.criteriaJson);
  const ids = await getAudiencePreviewMatchedProfileIds(criteria);
  const capped = ids.slice(0, PROFILE_CAP);
  if (capped.length === 0) return [];

  const profiles = await prisma.emailContactProfile.findMany({
    where: { id: { in: capped } },
    select: { id: true, primaryEmail: true, source: true },
  });

  const withEmail = profiles
    .map((p) => ({
      profileId: p.id,
      email: (p.primaryEmail?.trim().toLowerCase() ?? "") as string,
      source: p.source?.trim() || "unknown",
    }))
    .filter((p) => p.email.includes("@"));

  const { allowed } = await excludeSuppressedContacts(withEmail);
  return allowed.map((c) => ({
    profileId: c.profileId,
    email: c.email,
    source: c.source,
  }));
}

export function buildSendGridContactPayloadPreview(candidates: SendGridSyncableCandidate[]): SendGridContactPayloadPreview {
  const sample = candidates.slice(0, 8).map((c) => ({
    email: `[redacted-profile:${c.profileId}]`,
    custom_fields: {
      profile_id: c.profileId,
      source_label: c.source.slice(0, 80),
    },
  }));
  return {
    description:
      "Redacted dry shape for a future SendGrid contacts upsert — EMAIL-SENDGRID-CONTACT-SYNC-1.1 does not call SendGrid.",
    payload: {
      packet: "EMAIL-SENDGRID-CONTACT-SYNC-1.1",
      intent: "operator_preview_payload_only",
      candidateCount: candidates.length,
      sampleContactsRedacted: sample,
    },
  };
}

export async function buildSendGridContactSyncPreview(audienceDefinitionId: string): Promise<SendGridContactSyncPreview> {
  const def = await prisma.emailAudienceDefinition.findUnique({
    where: { id: audienceDefinitionId },
    select: { id: true, name: true, status: true, criteriaJson: true },
  });
  if (!def) {
    throw new Error("Audience definition not found.");
  }

  const exportPreview = await buildSendGridContactExportPreview(audienceDefinitionId);
  const criteria = parseCriteria(def.criteriaJson);
  const ids = await getAudiencePreviewMatchedProfileIds(criteria);
  const cappedIds = ids.slice(0, PROFILE_CAP);

  const profiles =
    cappedIds.length === 0
      ? []
      : await prisma.emailContactProfile.findMany({
          where: { id: { in: cappedIds } },
          select: { id: true, primaryEmail: true, source: true },
        });

  const withEmail = profiles
    .map((p) => ({
      profileId: p.id,
      email: (p.primaryEmail?.trim().toLowerCase() ?? "") as string,
      source: p.source?.trim() || "unknown",
    }))
    .filter((p) => p.email.includes("@"));

  const { allowed, excludedSuppressed } = await excludeSuppressedContacts(withEmail);
  const syncableCandidateCount = def.status === "ACTIVE" ? allowed.length : 0;

  const warnings: string[] = [];
  if (def.status !== "ACTIVE") {
    warnings.push(
      "Audience is not ACTIVE — operator cannot record an approval-grade sync run until the definition is activated in Audience Studio.",
    );
  }
  if (exportPreview.missingPrimaryEmail > 0) {
    warnings.push(
      `${exportPreview.missingPrimaryEmail} matched profile(s) lack primaryEmail — they are excluded from syncable candidates.`,
    );
  }
  if (excludedSuppressed > 0) {
    warnings.push(
      `${excludedSuppressed} profile(s) with primary email overlap local SendGridSuppression — mandatory exclusions for any future execution.`,
    );
  }
  if (exportPreview.matchCount > PROFILE_CAP) {
    warnings.push(`Audience match universe truncated to ${PROFILE_CAP} profiles for overlap scans (same cap as export preview).`);
  }

  const hasImport = profiles.some(
    (s) => s.source.toLowerCase().includes("contact_import") || s.source.toLowerCase().includes("import"),
  );
  if (hasImport) {
    warnings.push(
      "Matched profiles include import-sourced rows — verify consent / source governance on Profile review before any future SendGrid execution.",
    );
  }

  return {
    audienceDefinitionId: def.id,
    audienceName: def.name,
    audienceStatus: def.status,
    matchCount: exportPreview.matchCount,
    syncableCandidateCount,
    excludedSuppressedCount: excludedSuppressed,
    excludedMissingEmailCount: exportPreview.missingPrimaryEmail,
    warnings,
    exportPreviewSummary: {
      profilesWithPrimaryEmail: exportPreview.profilesWithPrimaryEmail,
      suppressedInLocalTableApprox: exportPreview.suppressedInLocalTableApprox,
      governanceNotes: exportPreview.governanceNotes,
    },
  };
}

export type CreateSendGridContactSyncRunInput = {
  audienceDefinitionId: string;
  createdByUserId: string | null;
};

export async function createSendGridContactSyncRun(input: CreateSendGridContactSyncRunInput) {
  const def = await prisma.emailAudienceDefinition.findUnique({
    where: { id: input.audienceDefinitionId },
    select: { id: true, status: true },
  });
  if (!def) throw new Error("Audience definition not found.");
  if (def.status !== "ACTIVE") {
    throw new Error("Only ACTIVE audience definitions can record a SendGrid contact sync run.");
  }

  const preview = await buildSendGridContactSyncPreview(input.audienceDefinitionId);
  const candidates = await listSyncableEmailContactProfiles(input.audienceDefinitionId);
  const payloadPreview = buildSendGridContactPayloadPreview(candidates);

  const audienceMap = await prisma.sendGridAudienceMap.findUnique({
    where: { emailAudienceDefinitionId: input.audienceDefinitionId },
    select: { sendgridListId: true, sendgridSegmentId: true },
  });

  const previewJson = {
    ...preview,
    candidateProfileIdsSample: candidates.slice(0, 64).map((c) => c.profileId),
    payloadPreview,
  };

  const run = await prisma.sendGridContactSyncRun.create({
    data: {
      audienceDefinitionId: input.audienceDefinitionId,
      status: "PREVIEWED",
      candidateCount: candidates.length,
      excludedSuppressedCount: preview.excludedSuppressedCount,
      excludedMissingEmailCount: preview.excludedMissingEmailCount,
      warningCount: preview.warnings.length,
      sendgridListId: audienceMap?.sendgridListId ?? null,
      sendgridSegmentId: audienceMap?.sendgridSegmentId ?? null,
      previewJson: previewJson as object,
      createdByUserId: input.createdByUserId,
    },
  });

  const existingMap = await prisma.sendGridAudienceMap.findUnique({
    where: { emailAudienceDefinitionId: input.audienceDefinitionId },
    select: { metadataJson: true },
  });
  const prevMeta =
    existingMap?.metadataJson && typeof existingMap.metadataJson === "object" && !Array.isArray(existingMap.metadataJson)
      ? (existingMap.metadataJson as Record<string, unknown>)
      : {};
  const mergedMeta = { ...prevMeta, lastContactSyncRunId: run.id };

  await prisma.sendGridAudienceMap.upsert({
    where: { emailAudienceDefinitionId: input.audienceDefinitionId },
    create: {
      emailAudienceDefinitionId: input.audienceDefinitionId,
      lastPreviewAt: new Date(),
      metadataJson: mergedMeta,
    },
    update: {
      lastPreviewAt: new Date(),
      metadataJson: mergedMeta,
    },
  });

  return run;
}

export type SendGridContactSyncExecutionSafeResult = {
  executedAt: string;
  candidateCount: number;
  submittedCount: number;
  excludedSuppressedCount: number;
  excludedMissingEmailCount: number;
  providerJobIds: string[];
  providerJobId: string | null;
  providerStatus: string | null;
  apiExecution: boolean;
  emailSendPerformed: false;
};

export async function buildSendGridUpsertPayloadFromApprovedRun(
  runId: string,
): Promise<{ ok: true; contacts: SendGridMarketingContactPayload[] } | { ok: false; reason: string }> {
  const run = await prisma.sendGridContactSyncRun.findUnique({
    where: { id: runId },
    select: { id: true, status: true, audienceDefinitionId: true, previewJson: true },
  });
  if (!run) return { ok: false, reason: "Sync run not found." };
  if (run.status !== "APPROVED") {
    return { ok: false, reason: `Run is not APPROVED (current: ${run.status}).` };
  }
  if (!run.previewJson || typeof run.previewJson !== "object") {
    return { ok: false, reason: "Run has no previewJson." };
  }
  if (!run.audienceDefinitionId) {
    return { ok: false, reason: "Run has no audienceDefinitionId." };
  }
  const candidates = await listSyncableEmailContactProfiles(run.audienceDefinitionId);
  return { ok: true, contacts: candidates.map((c) => buildSendGridMarketingContactPayload(c)) };
}

export async function markSendGridContactSyncRunSynced(runId: string, result: SendGridContactSyncExecutionSafeResult) {
  await prisma.sendGridContactSyncRun.update({
    where: { id: runId },
    data: {
      status: "SYNCED",
      syncedAt: new Date(),
      resultJson: result as object,
    },
  });
}

export async function markSendGridContactSyncRunFailed(
  runId: string,
  safeError: string,
  opts?: { apiAttempted?: boolean },
) {
  const apiAttempted = Boolean(opts?.apiAttempted);
  await prisma.sendGridContactSyncRun.update({
    where: { id: runId },
    data: {
      status: "FAILED",
      resultJson: {
        executedAt: new Date().toISOString(),
        failedAt: new Date().toISOString(),
        safeError: safeError.slice(0, 2000),
        apiExecution: apiAttempted,
        emailSendPerformed: false,
      } as object,
    },
  });
}

/**
 * Execute an APPROVED sync run: re-check audience ACTIVE, suppression/missing-email posture, upsert eligible emails only.
 * Does not send email or touch campaigns/automation.
 */
export async function executeApprovedSendGridContactSyncRun(
  runId: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const run = await prisma.sendGridContactSyncRun.findUnique({
    where: { id: runId },
  });
  if (!run) return { ok: false, reason: "Sync run not found." };
  if (run.status !== "APPROVED") {
    return { ok: false, reason: `Run is not APPROVED (current: ${run.status}).` };
  }
  if (!run.previewJson || typeof run.previewJson !== "object") {
    return { ok: false, reason: "Run has no previewJson — cannot execute." };
  }
  if (!run.audienceDefinitionId) {
    return { ok: false, reason: "Run has no audienceDefinitionId." };
  }

  const audience = await prisma.emailAudienceDefinition.findUnique({
    where: { id: run.audienceDefinitionId },
    select: { status: true },
  });
  if (!audience || audience.status !== "ACTIVE") {
    return { ok: false, reason: "Audience is not ACTIVE — sync execution blocked." };
  }

  const env = getSendGridEnvStatus();
  if (!env.sendgridApiKeyPresent) {
    return { ok: false, reason: "SENDGRID_API_KEY is not configured — execution blocked." };
  }

  const preview = await buildSendGridContactSyncPreview(run.audienceDefinitionId);
  const candidates = await listSyncableEmailContactProfiles(run.audienceDefinitionId);
  const contacts = candidates.map((c) => buildSendGridMarketingContactPayload(c));

  const listIds: string[] = [];
  if (run.sendgridListId && sendGridMarketingListIdLooksValid(run.sendgridListId)) {
    listIds.push(run.sendgridListId.trim());
  }

  try {
    if (contacts.length === 0) {
      await markSendGridContactSyncRunSynced(runId, {
        executedAt: new Date().toISOString(),
        candidateCount: 0,
        submittedCount: 0,
        excludedSuppressedCount: preview.excludedSuppressedCount,
        excludedMissingEmailCount: preview.excludedMissingEmailCount,
        providerJobIds: [],
        providerJobId: null,
        providerStatus: null,
        apiExecution: false,
        emailSendPerformed: false,
      });
      return { ok: true };
    }

    const outcome = await upsertSendGridMarketingContacts({ contacts, listIds });
    if (!outcome.ok) {
      await markSendGridContactSyncRunFailed(runId, outcome.safeMessage, { apiAttempted: true });
      return { ok: false, reason: outcome.safeMessage };
    }

    const jobIds = outcome.batches.map((b) => b.jobId).filter((x): x is string => Boolean(x));
    let providerStatus: string | null = null;
    const lastJob = jobIds[jobIds.length - 1];
    if (lastJob) {
      const st = await getSendGridContactImportStatus(lastJob);
      if (st.ok) providerStatus = st.status;
    }

    await markSendGridContactSyncRunSynced(runId, {
      executedAt: new Date().toISOString(),
      candidateCount: candidates.length,
      submittedCount: outcome.totalSubmitted,
      excludedSuppressedCount: preview.excludedSuppressedCount,
      excludedMissingEmailCount: preview.excludedMissingEmailCount,
      providerJobIds: jobIds,
      providerJobId: jobIds[0] ?? null,
      providerStatus,
      apiExecution: true,
      emailSendPerformed: false,
    });
    return { ok: true };
  } catch (e) {
    const msg = sanitizeSendGridApiError(e);
    await markSendGridContactSyncRunFailed(runId, msg, { apiAttempted: true });
    return { ok: false, reason: msg };
  }
}

export async function markSendGridContactSyncRunPreviewed(runId: string) {
  const run = await prisma.sendGridContactSyncRun.findUnique({
    where: { id: runId },
    select: { id: true, audienceDefinitionId: true, status: true },
  });
  if (!run) throw new Error("Sync run not found.");
  if (!run.audienceDefinitionId) return;

  await prisma.sendGridContactSyncRun.update({
    where: { id: runId },
    data: { status: "PREVIEWED" },
  });

  const existingMap = await prisma.sendGridAudienceMap.findUnique({
    where: { emailAudienceDefinitionId: run.audienceDefinitionId },
    select: { metadataJson: true },
  });
  const prevMeta =
    existingMap?.metadataJson && typeof existingMap.metadataJson === "object" && !Array.isArray(existingMap.metadataJson)
      ? (existingMap.metadataJson as Record<string, unknown>)
      : {};
  const mergedMeta = { ...prevMeta, lastContactSyncRunId: run.id };

  await prisma.sendGridAudienceMap.upsert({
    where: { emailAudienceDefinitionId: run.audienceDefinitionId },
    create: {
      emailAudienceDefinitionId: run.audienceDefinitionId,
      lastPreviewAt: new Date(),
      metadataJson: mergedMeta,
    },
    update: { lastPreviewAt: new Date(), metadataJson: mergedMeta },
  });
}

/** @deprecated Prefer executeApprovedSendGridContactSyncRun — same behavior since 1.2. */
export async function executeSendGridContactSyncRun(
  runId: string,
): Promise<{ ok: true } | { ok: false; reason: string; operatorNote?: string }> {
  return executeApprovedSendGridContactSyncRun(runId);
}

export async function listSendGridContactSyncRuns(limit = 20) {
  try {
    return await prisma.sendGridContactSyncRun.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        audienceDefinitionId: true,
        status: true,
        candidateCount: true,
        excludedSuppressedCount: true,
        excludedMissingEmailCount: true,
        warningCount: true,
        createdAt: true,
        syncedAt: true,
        resultJson: true,
      },
    });
  } catch {
    return [];
  }
}

export async function listLatestContactSyncRunStatusByAudienceIds(
  audienceIds: string[],
): Promise<Record<string, { status: string; runId: string }>> {
  if (!audienceIds.length) return {};
  try {
    const runs = await prisma.sendGridContactSyncRun.findMany({
      where: { audienceDefinitionId: { in: audienceIds } },
      orderBy: { createdAt: "desc" },
      take: 400,
      select: { id: true, audienceDefinitionId: true, status: true },
    });
    const out: Record<string, { status: string; runId: string }> = {};
    for (const r of runs) {
      if (r.audienceDefinitionId && !out[r.audienceDefinitionId]) {
        out[r.audienceDefinitionId] = { status: r.status, runId: r.id };
      }
    }
    return out;
  } catch {
    return {};
  }
}
