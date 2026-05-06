/**
 * EMAIL-SEND-EXECUTION-1.0 — governed SendGrid send execution (explicit operator actions; no queue send; no automation).
 */

import type { Prisma } from "@prisma/client";
import {
  EmailSendExecutionSendType,
  EmailSendExecutionStatus,
  EmailSendRecipientStatus,
  MessageStudioDraftStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { getAudiencePreviewMatchedProfileIds, parseCriteria } from "@/lib/email-command-center/audience-studio";
import { getMessageStudioDraft } from "@/lib/email-command-center/message-studio-drafts";
import { excludeSuppressedContacts } from "@/lib/email-command-center/sendgrid-contact-sync";
import { getSendGridEnvStatus } from "@/lib/sendgrid/config";
import {
  getSendGridMailReadiness,
  readAsmGroupId,
  sanitizeSendGridMailError,
  sendSendGridBroadcastEmail,
  sendSendGridSingleTestEmail,
} from "@/lib/sendgrid/mail-send";
import { SEND_PACKET_SUPPRESSION_KEYS } from "@/components/admin/email-command-center/message-studio-send-packet";
import {
  firstFailedPreflightCheckId,
  parsePreflightCheckRows,
  parsePreflightRecipientBreakdown,
  type SendExecutionPreflightCheckRow,
  type SendExecutionPreflightRecipientBreakdown,
} from "@/lib/email-command-center/send-execution-preflight-json";

export type { SendExecutionPreflightCheckRow, SendExecutionPreflightRecipientBreakdown };
export { firstFailedPreflightCheckId, parsePreflightCheckRows, parsePreflightRecipientBreakdown };

const PROFILE_CAP = 4000;

const ECC = "/admin/workbench/email-command-center";

const PREFLIGHT_FIX: Partial<Record<string, { fixHref: string; fixLabel: string }>> = {
  draft: { fixHref: `${ECC}/message-studio#review-queue`, fixLabel: "Message Studio → Review Queue" },
  draft_status: { fixHref: `${ECC}/message-studio#review-queue`, fixLabel: "Approve draft for send governance" },
  send_packet: { fixHref: `${ECC}/message-studio#send-packet-builder`, fixLabel: "Send Packet Builder" },
  send_packet_suppressions: { fixHref: `${ECC}/message-studio#send-packet-builder`, fixLabel: "Complete suppression checklist in packet" },
  send_packet_approvals: { fixHref: `${ECC}/message-studio#send-packet-builder`, fixLabel: "Complete approval checklist in packet" },
  subject: { fixHref: `${ECC}/message-studio#shared-drafts`, fixLabel: "Message Studio → shared drafts" },
  preheader: { fixHref: `${ECC}/message-studio#shared-drafts`, fixLabel: "Message Studio → add preheader on draft" },
  body: { fixHref: `${ECC}/message-studio#shared-drafts`, fixLabel: "Message Studio → shared drafts" },
  audience: { fixHref: `${ECC}/audiences`, fixLabel: "Audience Studio" },
  audience_active: { fixHref: `${ECC}/audiences`, fixLabel: "Activate audience definition" },
  sync_run: { fixHref: `${ECC}/sendgrid#contact-sync`, fixLabel: "SendGrid Foundation → contact sync" },
  sync_run_status: { fixHref: `${ECC}/sendgrid#contact-sync`, fixLabel: "Complete SYNCED Marketing upsert run" },
  sendgrid_broadcast_env: { fixHref: `${ECC}/readiness`, fixLabel: "Readiness (SendGrid env + ASM)" },
  sendgrid_test_env: { fixHref: `${ECC}/readiness`, fixLabel: "Readiness (SendGrid test env)" },
  sendgrid_key: { fixHref: `${ECC}/readiness`, fixLabel: "Readiness (API key)" },
  unsubscribe_asm: { fixHref: `${ECC}/readiness`, fixLabel: "Set SENDGRID_UNSUBSCRIBE_GROUP_ID (ASM)" },
  sender_identity: { fixHref: `${ECC}/readiness`, fixLabel: "Configure SENDGRID_FROM_EMAIL / FROM_NAME" },
  import_consent: { fixHref: `${ECC}/message-studio#send-packet-builder`, fixLabel: "Mark import consent reviewed in packet" },
  suppression_all_candidates: { fixHref: `${ECC}/sendgrid`, fixLabel: "Review suppressions + audience overlap" },
  recipients: { fixHref: `${ECC}/audiences`, fixLabel: "Audience / email coverage" },
  governance_final_confirmation: { fixHref: `${ECC}/send-execution`, fixLabel: "Send Execution governance / audit" },
};

function pushCheck(
  checks: SendExecutionPreflightCheckRow[],
  id: string,
  ok: boolean,
  detail: string,
  whyFailed?: string,
): void {
  const fix = !ok ? PREFLIGHT_FIX[id] : undefined;
  const wf = !ok ? (whyFailed?.trim() ? whyFailed : detail) : undefined;
  checks.push({
    id,
    ok,
    detail,
    ...(!ok && wf ? { whyFailed: wf } : {}),
    ...(!ok && fix ? { fixHref: fix.fixHref, fixLabel: fix.fixLabel } : {}),
  });
}

function readBoolRecord(packet: Record<string, unknown>, key: string): Record<string, boolean> | null {
  const v = packet[key];
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  return v as Record<string, boolean>;
}

/** Operator must type this exactly (excluding surrounding whitespace) before final SendGrid broadcast. */
export const EMAIL_SEND_FINAL_CONFIRMATION_PHRASE = "SEND APPROVED";

export type SendExecutionReadiness = {
  dbReachable: boolean;
  executionTablesAvailable: boolean;
  messageStudioDraftsAvailable: boolean;
  sendGridMailReady: boolean;
  notes: string[];
};

export async function getSendExecutionReadiness(): Promise<SendExecutionReadiness> {
  const notes: string[] = [];
  let dbReachable = false;
  let executionTablesAvailable = false;
  let messageStudioDraftsAvailable = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbReachable = true;
  } catch {
    notes.push("Database unreachable — send execution unavailable.");
  }
  if (dbReachable) {
    try {
      await prisma.emailSendExecution.count();
      executionTablesAvailable = true;
    } catch {
      notes.push("EmailSendExecution table missing — apply migration 20260510140000_email_send_execution.");
    }
    try {
      await prisma.messageStudioDraft.count();
      messageStudioDraftsAvailable = true;
    } catch {
      notes.push("MessageStudioDraft table unavailable.");
    }
  }
  const mail = getSendGridMailReadiness();
  if (!mail.broadcastAllowed) {
    notes.push(...mail.notes);
  }
  return {
    dbReachable,
    executionTablesAvailable,
    messageStudioDraftsAvailable,
    sendGridMailReady: mail.broadcastAllowed,
    notes,
  };
}

export function sanitizeProviderError(error: unknown): string {
  return sanitizeSendGridMailError(error);
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function htmlForSend(body: string, broadcast: boolean): string {
  const complianceNote = broadcast
    ? '<p style="font-size:11px;color:#555;">This broadcast uses SendGrid ASM when configured. Recipients excluded by local suppression are not mailed.</p>'
    : "";
  const trimmed = body.trim();
  if (trimmed.toLowerCase().startsWith("<!doctype") || trimmed.toLowerCase().startsWith("<html")) {
    return `${trimmed}${complianceNote}`;
  }
  return `<!DOCTYPE html><html><body>${body}${complianceNote}</body></html>`;
}

function textForSend(body: string, broadcast: boolean): string {
  const note = broadcast ? "\n\n---\nCampaign email via SendGrid (governed send execution).\n" : "";
  const stripped = body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return `${stripped}${note}`;
}

export async function listEmailSendExecutions(limit = 40) {
  try {
    return await prisma.emailSendExecution.findMany({
      orderBy: { updatedAt: "desc" },
      take: limit,
      include: {
        emailAudienceDefinition: { select: { id: true, name: true } },
        messageStudioDraft: { select: { id: true, title: true } },
        sendGridContactSyncRun: { select: { id: true, status: true } },
      },
    });
  } catch {
    return [];
  }
}

export async function getEmailSendExecution(id: string) {
  try {
    return await prisma.emailSendExecution.findUnique({
      where: { id },
      include: {
        recipients: { orderBy: { email: "asc" } },
        approvals: { orderBy: { createdAt: "desc" } },
        emailAudienceDefinition: true,
        messageStudioDraft: true,
        sendGridContactSyncRun: true,
      },
    });
  } catch {
    return null;
  }
}

export type CreateSendExecutionDraftInput = {
  messageStudioDraftId: string;
  emailAudienceDefinitionId: string;
  sendGridContactSyncRunId?: string | null;
  sendType?: EmailSendExecutionSendType;
  createdByUserId: string | null;
};

export async function createSendExecutionDraft(input: CreateSendExecutionDraftInput) {
  const draft = await getMessageStudioDraft(input.messageStudioDraftId);
  if (!draft) throw new Error("Shared Message Studio draft not found.");
  const audience = await prisma.emailAudienceDefinition.findUnique({
    where: { id: input.emailAudienceDefinitionId },
  });
  if (!audience || audience.status !== "ACTIVE") {
    throw new Error("Audience must exist and be ACTIVE.");
  }

  const sendType = input.sendType ?? "SENDGRID_BROADCAST";
  const fromEmail = process.env.SENDGRID_FROM_EMAIL?.trim() ?? "";
  const fromName = process.env.SENDGRID_FROM_NAME?.trim() ?? "";

  const packet =
    draft.sendPacketJson && isPlainObject(draft.sendPacketJson)
      ? (draft.sendPacketJson as Record<string, unknown>)
      : {};

  return prisma.emailSendExecution.create({
    data: {
      status: "DRAFT",
      sendType,
      messageStudioDraftId: draft.id,
      emailAudienceDefinitionId: audience.id,
      sendGridContactSyncRunId: input.sendGridContactSyncRunId ?? null,
      sendPacketJson: packet as Prisma.InputJsonValue,
      subject: draft.subject?.trim() ?? "",
      preheader: draft.preheader?.trim() ?? "",
      body: draft.body ?? "",
      fromEmail,
      fromName,
      replyToEmail: null,
      createdByUserId: input.createdByUserId,
      metadataJson: { source: "EMAIL-SEND-EXECUTION-1.0", draftTitle: draft.title },
    },
  });
}

export async function buildSendExecutionFromSharedDraftAndPacket(input: CreateSendExecutionDraftInput) {
  return createSendExecutionDraft(input);
}

async function loadAudienceProfilesWithEmail(audienceDefinitionId: string) {
  const def = await prisma.emailAudienceDefinition.findUnique({
    where: { id: audienceDefinitionId },
    select: { criteriaJson: true },
  });
  if (!def) return [];
  const criteria = parseCriteria(def.criteriaJson);
  const ids = await getAudiencePreviewMatchedProfileIds(criteria);
  const capped = ids.slice(0, PROFILE_CAP);
  if (!capped.length) return [];
  return prisma.emailContactProfile.findMany({
    where: { id: { in: capped } },
    select: { id: true, primaryEmail: true, source: true },
  });
}

export async function listEligibleRecipientsForSend(sendExecutionId: string) {
  return prisma.emailSendRecipient.findMany({
    where: { sendExecutionId, status: "READY" },
    orderBy: { email: "asc" },
  });
}

/** Re-scan suppression for existing recipient rows (READY/CANDIDATE → EXCLUDED_SUPPRESSED). */
export async function applySuppressionExclusions(sendExecutionId: string) {
  const rows = await prisma.emailSendRecipient.findMany({
    where: {
      sendExecutionId,
      status: { in: ["CANDIDATE", "READY"] },
    },
  });
  const withEmail = rows
    .map((r) => ({ id: r.id, email: r.email.trim().toLowerCase() }))
    .filter((r) => r.email.includes("@"));
  const { allowed } = await excludeSuppressedContacts(withEmail.map((r) => ({ email: r.email })));
  const allowedSet = new Set(allowed.map((a) => a.email));
  for (const r of rows) {
    const e = r.email.trim().toLowerCase();
    if (!e.includes("@")) continue;
    if (!allowedSet.has(e)) {
      await prisma.emailSendRecipient.update({
        where: { id: r.id },
        data: { status: "EXCLUDED_SUPPRESSED", suppressionReason: "sendgrid_suppression_table" },
      });
    }
  }
}

export async function runSendExecutionPreflight(sendExecutionId: string, preflightByUserId: string | null) {
  const ex = await prisma.emailSendExecution.findUnique({
    where: { id: sendExecutionId },
    include: { messageStudioDraft: true, sendGridContactSyncRun: true },
  });
  if (!ex) throw new Error("Send execution not found.");

  const statusesAllowingPreflight = new Set<EmailSendExecutionStatus>([
    "DRAFT",
    "PREFLIGHT_FAILED",
    "READY_FOR_TEST",
  ]);
  if (!statusesAllowingPreflight.has(ex.status)) {
    throw new Error(`Preflight is not allowed when execution status is ${ex.status}.`);
  }

  const checks: SendExecutionPreflightCheckRow[] = [];
  const broadcast = ex.sendType === "SENDGRID_BROADCAST";

  pushCheck(
    checks,
    "governance_final_confirmation",
    !ex.finalApprovedAt,
    ex.finalApprovedAt
      ? "Unexpected: execution already shows final approval timestamp — preflight should not re-run after final approval."
      : "Final typed confirmation not recorded on this execution (expected until after explicit final approval).",
    ex.finalApprovedAt
      ? "This execution row already has finalApprovedAt set. Open governance / audit rather than re-running preflight."
      : undefined,
  );

  if (!ex.messageStudioDraftId || !ex.messageStudioDraft) {
    pushCheck(
      checks,
      "draft",
      false,
      "Shared draft link missing.",
      "EmailSendExecution.messageStudioDraftId is empty — create a new execution from Message Studio so copy and packet attach to a server draft.",
    );
  } else if (ex.messageStudioDraft.status !== MessageStudioDraftStatus.APPROVED_FOR_SEND_GOVERNANCE) {
    pushCheck(
      checks,
      "draft_status",
      false,
      "Draft must be APPROVED_FOR_SEND_GOVERNANCE before preflight.",
      `Linked Message Studio draft is ${ex.messageStudioDraft.status}. Move it to Approved for send governance in the Review Queue before execution can proceed.`,
    );
  } else {
    pushCheck(checks, "draft", true, "Shared draft present and governance-approved.");
  }

  const packetOk = isPlainObject(ex.sendPacketJson) && Object.keys(ex.sendPacketJson as object).length > 0;
  if (!packetOk) {
    pushCheck(
      checks,
      "send_packet",
      false,
      "sendPacketJson is required on execution (copy from Message Studio Send Packet).",
      "Execution was created without a send packet snapshot — regenerate in Message Studio Send Packet Builder and create a new execution, or re-save from a workflow that copies packet JSON onto the row.",
    );
  } else {
    pushCheck(checks, "send_packet", true, "Send packet JSON present.");
  }

  if (!ex.subject?.trim()) {
    pushCheck(checks, "subject", false, "Subject required.", "Subject is empty on the execution row — update the promoted Message Studio draft or recreate the execution after the draft has a subject.");
  } else {
    pushCheck(checks, "subject", true, "Subject present.");
  }

  if (!ex.preheader?.trim()) {
    pushCheck(
      checks,
      "preheader",
      false,
      "Preheader required for governed sends.",
      "Preheader is empty — inbox clients often show unexpected preview text. Add a short preheader on the Message Studio draft and re-promote / update the execution copy.",
    );
  } else {
    pushCheck(checks, "preheader", true, "Preheader present.");
  }

  if (!ex.body?.trim()) {
    pushCheck(checks, "body", false, "Body required.", "HTML/text body is empty on the execution — complete body content on the shared draft before preflight.");
  } else {
    pushCheck(checks, "body", true, "Body present.");
  }

  const audienceIdMaybe = ex.emailAudienceDefinitionId;
  if (!audienceIdMaybe) {
    pushCheck(checks, "audience", false, "Audience required.", "No EmailAudienceDefinition is linked — pick an ACTIVE audience when creating the execution.");
  } else {
    pushCheck(checks, "audience", true, "Audience linked.");
  }

  const audience = audienceIdMaybe
    ? await prisma.emailAudienceDefinition.findUnique({
        where: { id: audienceIdMaybe },
      })
    : null;
  if (!audience || audience.status !== "ACTIVE") {
    pushCheck(
      checks,
      "audience_active",
      false,
      "Audience must be ACTIVE.",
      audience
        ? `Audience “${audience.name}” is ${audience.status}. Activate it in Audience Studio for execution-ready sends.`
        : "Audience row missing — select a valid ACTIVE definition.",
    );
  } else {
    pushCheck(checks, "audience_active", true, "Audience ACTIVE.");
  }

  const packet = isPlainObject(ex.sendPacketJson) ? (ex.sendPacketJson as Record<string, unknown>) : {};
  const suppressionRec = readBoolRecord(packet, "suppressionChecklist");
  if (broadcast) {
    if (!suppressionRec) {
      pushCheck(
        checks,
        "send_packet_suppressions",
        false,
        "Send packet must include suppressionChecklist (all items acknowledged for broadcast).",
        "Promote a fresh send packet from Message Studio so suppressionChecklist is stored on the execution JSON.",
      );
    } else {
      const missing = SEND_PACKET_SUPPRESSION_KEYS.filter((k) => suppressionRec[k] !== true);
      if (missing.length) {
        pushCheck(
          checks,
          "send_packet_suppressions",
          false,
          `Suppression checklist incomplete (${missing.length} item(s)).`,
          `Open Send Packet Builder and check: ${missing.slice(0, 4).join(", ")}${missing.length > 4 ? ", …" : ""}.`,
        );
      } else {
        pushCheck(checks, "send_packet_suppressions", true, "Send packet suppression checklist complete.");
      }
    }
  } else {
    pushCheck(
      checks,
      "send_packet_suppressions",
      true,
      "Broadcast-only suppression checklist gate skipped for test execution.",
    );
  }

  const approvalRec = readBoolRecord(packet, "approvalChecklist");
  if (!approvalRec) {
    pushCheck(
      checks,
      "send_packet_approvals",
      false,
      "Send packet must include approvalChecklist (operator + comms sign-off).",
      "Save a send packet snapshot from Message Studio so approvalChecklist is embedded in execution.sendPacketJson.",
    );
  } else {
    const op = approvalRec.operator_reviewed === true;
    const comms = approvalRec.comms_reviewed === true;
    const finalBad = approvalRec.final_send_operator_not_authorized === true;
    if (!op || !comms || finalBad) {
      pushCheck(
        checks,
        "send_packet_approvals",
        false,
        "Operator + comms approval roles not resolved in packet (final operator must not be flagged unauthorized).",
        !op
          ? "Check “Operator reviewed” on the Send Packet approval checklist."
          : !comms
            ? "Check “Comms reviewed” on the Send Packet approval checklist."
            : "Uncheck or clear “Final send operator not yet authorized” once the correct operator is authorized for downstream test/final steps.",
      );
    } else {
      pushCheck(checks, "send_packet_approvals", true, "Core approval roles resolved in send packet.");
    }
  }

  const fromEmailResolved = (ex.fromEmail?.trim() || process.env.SENDGRID_FROM_EMAIL?.trim() || "") !== "";
  const fromNameResolved = (ex.fromName?.trim() || process.env.SENDGRID_FROM_NAME?.trim() || "") !== "";
  if (!fromEmailResolved || !fromNameResolved) {
    pushCheck(
      checks,
      "sender_identity",
      false,
      "Sender identity incomplete (execution row + SENDGRID_FROM_* fallback).",
      "Set from email/name on the execution or configure SENDGRID_FROM_EMAIL and SENDGRID_FROM_NAME for the deployment.",
    );
  } else {
    pushCheck(checks, "sender_identity", true, "Sender identity resolves from execution or environment.");
  }

  const mailReadiness = getSendGridMailReadiness();
  if (broadcast) {
    if (!mailReadiness.broadcastAllowed) {
      pushCheck(
        checks,
        "sendgrid_broadcast_env",
        false,
        mailReadiness.notes.join(" ") || "SendGrid broadcast env incomplete.",
        "Broadcast needs API key, from email/name, and numeric SENDGRID_UNSUBSCRIBE_GROUP_ID (ASM). Use Readiness + env docs — no send occurs during preflight.",
      );
    } else {
      pushCheck(checks, "sendgrid_broadcast_env", true, "SendGrid broadcast env (key + from + ASM) present.");
    }
  } else if (ex.sendType === "SENDGRID_TEST") {
    if (!mailReadiness.sendgridApiKeyConfigured || !mailReadiness.fromEmailConfigured || !mailReadiness.fromNameConfigured) {
      pushCheck(
        checks,
        "sendgrid_test_env",
        false,
        "Test send requires SENDGRID_API_KEY, SENDGRID_FROM_EMAIL, SENDGRID_FROM_NAME.",
        "Configure SendGrid test mail env before running test send — preflight records the gap early.",
      );
    } else {
      pushCheck(checks, "sendgrid_test_env", true, "SendGrid test mail env present.");
    }
  }

  const env = getSendGridEnvStatus();
  if (!env.sendgridApiKeyPresent) {
    pushCheck(checks, "sendgrid_key", false, "SENDGRID_API_KEY required.", "API key env missing — governed sends cannot call SendGrid until configured.");
  } else {
    pushCheck(checks, "sendgrid_key", true, "API key present (name only in logs).");
  }

  if (broadcast) {
    const asm = readAsmGroupId();
    if (asm === null || Number.isNaN(asm)) {
      pushCheck(
        checks,
        "unsubscribe_asm",
        false,
        "Unsubscribe posture unknown — numeric ASM group id missing.",
        "Set SENDGRID_UNSUBSCRIBE_GROUP_ID so broadcast mail can attach SendGrid unsubscribe groups (required for compliance posture on this path).",
      );
    } else {
      pushCheck(checks, "unsubscribe_asm", true, `Unsubscribe posture known (ASM group id present).`);
    }
  } else {
    pushCheck(checks, "unsubscribe_asm", true, "ASM not required for single-recipient test path.");
  }

  if (broadcast) {
    if (!ex.sendGridContactSyncRunId) {
      pushCheck(
        checks,
        "sync_run",
        false,
        "SYNCED SendGridContactSyncRun required for broadcast.",
        "Link a contact sync run that has completed Marketing Contacts upsert (SYNCED) so broadcast sends align with the governed list.",
      );
    } else if (!ex.sendGridContactSyncRun || ex.sendGridContactSyncRun.status !== "SYNCED") {
      pushCheck(
        checks,
        "sync_run_status",
        false,
        "Contact sync run must be SYNCED before broadcast preflight.",
        `Selected run status is ${ex.sendGridContactSyncRun?.status ?? "unknown"} — finish approved upsert on SendGrid Foundation or pick a SYNCED run.`,
      );
    } else {
      pushCheck(checks, "sync_run", true, "SYNCED contact sync run linked.");
    }
  } else if (ex.sendType === "SENDGRID_TEST") {
    pushCheck(checks, "sync_run", true, "Test execution — SYNCED sync run not required.");
  }

  const allProfiles = audienceIdMaybe ? await loadAudienceProfilesWithEmail(audienceIdMaybe) : [];
  const withEmail = allProfiles
    .map((p) => ({
      profileId: p.id,
      email: (p.primaryEmail ?? "").trim().toLowerCase(),
      source: p.source?.trim() ?? "",
    }))
    .filter((p) => p.email.includes("@"));

  const { allowed: nonSuppressed, excludedSuppressed } = await excludeSuppressedContacts(withEmail);

  const importConsentOk = packet.importListConsentReviewed === true;
  const hasImportSource = withEmail.some(
    (p) => p.source.toLowerCase().includes("import") || p.source.toLowerCase().includes("contact_import"),
  );
  if (hasImportSource && !importConsentOk) {
    pushCheck(
      checks,
      "import_consent",
      false,
      "Import-sourced profiles detected — set sendPacketJson.importListConsentReviewed true after review.",
      "Audience includes CONTACT_IMPORT-sourced profiles. Operators must confirm consent/source posture and set importListConsentReviewed on the packet JSON.",
    );
  } else if (hasImportSource) {
    pushCheck(checks, "import_consent", true, "Operator acknowledged import list consent in send packet.");
  } else {
    pushCheck(checks, "import_consent", true, "No import-only source posture flagged.");
  }

  let readyCount = 0;
  const syncableSet = new Set(nonSuppressed.map((p) => p.profileId));
  for (const p of withEmail) {
    const suppressed = !syncableSet.has(p.profileId);
    if (suppressed) continue;
    if (hasImportSource && !importConsentOk) continue;
    readyCount += 1;
  }

  const excludedMissingConsent = hasImportSource && !importConsentOk ? nonSuppressed.length : 0;

  if (withEmail.length > 0 && nonSuppressed.length === 0) {
    pushCheck(
      checks,
      "suppression_all_candidates",
      false,
      "Every matched email overlaps local SendGrid suppressions — no eligible recipients.",
      "Review SendGrid suppressions and audience overlap; remove bad addresses or choose a different cohort before send.",
    );
  } else {
    pushCheck(
      checks,
      "suppression_all_candidates",
      true,
      excludedSuppressed > 0
        ? `${excludedSuppressed} candidate(s) excluded by local suppression scan; others remain eligible.`
        : "No local suppression overlap on candidate emails (or no candidates).",
    );
  }

  if (readyCount === 0) {
    pushCheck(
      checks,
      "recipients",
      false,
      "No READY recipients after suppression / consent gates.",
      "Fix audience coverage, import-consent flags, or suppression overlap until at least one profile can be marked READY.",
    );
  } else {
    pushCheck(checks, "recipients", true, `${readyCount} READY recipient(s).`);
  }

  const allChecksOk = checks.every((c) => c.ok);

  const recipientBreakdown: SendExecutionPreflightRecipientBreakdown = {
    audienceMatchedProfiles: allProfiles.length,
    candidatesWithValidEmail: withEmail.length,
    profilesMissingEmail: Math.max(0, allProfiles.length - withEmail.length),
    excludedSuppressed,
    excludedMissingConsentSource: excludedMissingConsent,
    finalEligible: readyCount,
  };

  await prisma.emailSendRecipient.deleteMany({ where: { sendExecutionId } });

  if (allChecksOk) {
    for (const p of withEmail) {
      const suppressed = !syncableSet.has(p.profileId);
      let status: EmailSendRecipientStatus;
      let suppressionReason: string | null = null;
      if (suppressed) {
        status = "EXCLUDED_SUPPRESSED";
        suppressionReason = "local_sendgrid_suppression_overlap";
      } else if (hasImportSource && !importConsentOk) {
        status = "EXCLUDED_MISSING_CONSENT";
      } else {
        status = "READY";
      }
      await prisma.emailSendRecipient.create({
        data: {
          sendExecutionId,
          email: p.email,
          emailContactProfileId: p.profileId,
          status,
          suppressionReason,
        },
      });
    }
  }

  const failedChecks = checks.filter((c) => !c.ok);
  const firstFail = failedChecks[0];

  await prisma.emailSendExecution.update({
    where: { id: sendExecutionId },
    data: {
      candidateRecipientCount: withEmail.length,
      suppressedRecipientCount: excludedSuppressed,
      finalRecipientCount: allChecksOk ? readyCount : 0,
      preflightByUserId,
      preflightAt: new Date(),
      preflightJson: {
        packet: "EMAIL-SEND-EXECUTION-PREFLIGHT-HARDENING-1.0",
        checkedAt: new Date().toISOString(),
        checks,
        recipientBreakdown,
        automaticSendEnabled: false,
        queueSend: false,
      } as Prisma.InputJsonValue,
      status: allChecksOk ? "READY_FOR_TEST" : "PREFLIGHT_FAILED",
      errorSafe: allChecksOk ? null : firstFail?.whyFailed ?? firstFail?.detail ?? "Preflight failed.",
    },
  });

  return { ok: allChecksOk, checks, readyCount };
}

export async function markSendExecutionReadyForTest(sendExecutionId: string, userId: string | null) {
  const ex = await prisma.emailSendExecution.findUnique({ where: { id: sendExecutionId } });
  if (!ex) throw new Error("Not found.");
  if (ex.status !== "DRAFT" && ex.status !== "PREFLIGHT_FAILED") {
    return { ok: true, note: "Preflight already completed for this execution." };
  }
  await runSendExecutionPreflight(sendExecutionId, userId);
  return { ok: true };
}

export async function sendSendGridTestEmail(sendExecutionId: string, testRecipientEmail: string, sentByUserId: string | null) {
  const ex = await prisma.emailSendExecution.findUnique({ where: { id: sendExecutionId } });
  if (!ex || ex.status !== "READY_FOR_TEST") throw new Error("Execution must be READY_FOR_TEST.");
  const to = testRecipientEmail.trim();
  if (!to.includes("@")) throw new Error("Invalid test recipient.");

  const mail = getSendGridMailReadiness();
  if (!mail.sendgridApiKeyConfigured || !mail.fromEmailConfigured || !mail.fromNameConfigured) {
    throw new Error("SendGrid mail not configured for test send.");
  }

  const html = htmlForSend(ex.body, false);
  const text = textForSend(ex.body, false);
  const result = await sendSendGridSingleTestEmail({
    to,
    subject: `[TEST] ${ex.subject}`,
    html,
    text,
    fromEmail: ex.fromEmail || process.env.SENDGRID_FROM_EMAIL!.trim(),
    fromName: ex.fromName || process.env.SENDGRID_FROM_NAME!.trim(),
    replyToEmail: ex.replyToEmail,
  });

  if (!result.ok) {
    await prisma.emailSendExecution.update({
      where: { id: sendExecutionId },
      data: {
        errorSafe: result.safeMessage,
        providerResultJson: { testSend: false, reason: result.safeMessage } as Prisma.InputJsonValue,
      },
    });
    throw new Error(result.safeMessage);
  }

  await prisma.emailSendExecution.update({
    where: { id: sendExecutionId },
    data: {
      status: "TEST_SENT",
      testRecipientEmail: to,
      sentByUserId,
      providerResultJson: {
        testSend: true,
        testRecipientEmail: to,
        httpStatus: result.statusCode,
        sentAt: new Date().toISOString(),
      } as Prisma.InputJsonValue,
      errorSafe: null,
    },
  });
}

export async function markSendExecutionReadyForFinalApproval(sendExecutionId: string) {
  const ex = await prisma.emailSendExecution.findUnique({ where: { id: sendExecutionId } });
  if (!ex || ex.status !== "TEST_SENT") throw new Error("Execution must be TEST_SENT.");
  if (ex.sendType !== "SENDGRID_BROADCAST") {
    throw new Error("Final approval flow applies to SENDGRID_BROADCAST executions only.");
  }
  await prisma.emailSendExecution.update({
    where: { id: sendExecutionId },
    data: { status: "READY_FOR_FINAL_APPROVAL" },
  });
}

export async function approveSendExecutionFinal(sendExecutionId: string, approvedByUserId: string | null, note?: string) {
  const ex = await prisma.emailSendExecution.findUnique({ where: { id: sendExecutionId } });
  if (!ex || ex.status !== "READY_FOR_FINAL_APPROVAL") throw new Error("Execution must be READY_FOR_FINAL_APPROVAL.");
  if (ex.sendType !== "SENDGRID_BROADCAST") {
    throw new Error("Final approval applies to SENDGRID_BROADCAST executions only.");
  }
  await prisma.$transaction([
    prisma.emailSendApproval.create({
      data: {
        sendExecutionId,
        approvalType: "FINAL_SEND_APPROVAL",
        status: "APPROVED",
        note: note?.trim() ?? "",
        approvedByUserId,
        decidedAt: new Date(),
      },
    }),
    prisma.emailSendExecution.update({
      where: { id: sendExecutionId },
      data: {
        status: "FINAL_APPROVED",
        approvedByUserId,
        finalApprovedAt: new Date(),
        approvalJson: {
          finalApprovedAt: new Date().toISOString(),
          finalApprovedByUserId: approvedByUserId,
        } as Prisma.InputJsonValue,
      },
    }),
  ]);
}

export async function executeFinalSendGridSend(
  sendExecutionId: string,
  confirmationPhrase: string,
  sentByUserId: string | null,
) {
  const trimmed = confirmationPhrase.trim();
  if (trimmed !== EMAIL_SEND_FINAL_CONFIRMATION_PHRASE) {
    throw new Error(`Confirmation must be exactly: ${EMAIL_SEND_FINAL_CONFIRMATION_PHRASE}`);
  }

  const ex = await prisma.emailSendExecution.findUnique({
    where: { id: sendExecutionId },
    include: { recipients: true },
  });
  if (!ex || ex.status !== "FINAL_APPROVED") throw new Error("Execution must be FINAL_APPROVED.");
  if (ex.sendType !== "SENDGRID_BROADCAST") {
    throw new Error("Final governed multi-recipient send is only implemented for SENDGRID_BROADCAST.");
  }

  const asmId = readAsmGroupId();
  if (asmId === null || Number.isNaN(asmId)) {
    throw new Error("Broadcast requires SENDGRID_UNSUBSCRIBE_GROUP_ID (numeric ASM).");
  }

  await applySuppressionExclusions(sendExecutionId);
  const ready = await prisma.emailSendRecipient.findMany({
    where: { sendExecutionId, status: "READY" },
  });
  if (!ready.length) throw new Error("No READY recipients after suppression re-check.");

  const emails = ready.map((r) => r.email);
  const html = htmlForSend(ex.body, true);
  const text = textForSend(ex.body, true);
  const fromEmail = ex.fromEmail || process.env.SENDGRID_FROM_EMAIL?.trim() || "";
  const fromName = ex.fromName || process.env.SENDGRID_FROM_NAME?.trim() || "";

  await prisma.emailSendExecution.update({
    where: { id: sendExecutionId },
    data: { status: "SENDING", sentByUserId },
  });

  const result = await sendSendGridBroadcastEmail({
    recipientEmails: emails,
    subject: ex.subject,
    html,
    text,
    fromEmail,
    fromName,
    replyToEmail: ex.replyToEmail,
    asmGroupId: asmId,
    sendExecutionId,
    broadcastRecipientContext: ready.map((r) => ({
      email: r.email.trim().toLowerCase(),
      emailSendRecipientId: r.id,
    })),
  });
  if (!result.ok) {
    await prisma.emailSendExecution.update({
      where: { id: sendExecutionId },
      data: {
        status: "FAILED",
        errorSafe: result.safeMessage,
        providerResultJson: { ok: false } as Prisma.InputJsonValue,
      },
    });
    throw new Error(result.safeMessage);
  }
  await prisma.emailSendRecipient.updateMany({
    where: { sendExecutionId, status: "READY" },
    data: { status: "SUBMITTED" },
  });
  await prisma.emailSendExecution.update({
    where: { id: sendExecutionId },
    data: {
      status: "SENT",
      sentAt: new Date(),
      finalRecipientCount: ready.length,
      providerResultJson: {
        ok: true,
        batches: result.batches,
        lastStatusCode: result.lastStatusCode,
        recipientCount: ready.length,
        sentAt: new Date().toISOString(),
      } as Prisma.InputJsonValue,
      errorSafe: null,
    },
  });
}

export async function archiveSendExecution(sendExecutionId: string) {
  await prisma.emailSendExecution.update({
    where: { id: sendExecutionId },
    data: { status: "ARCHIVED", archivedAt: new Date() },
  });
}
