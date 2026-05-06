/**
 * EMAIL-CONTACT-IMPORT-STAGING-1.0 — CSV staging, validation, dedupe, profile commit (no SendGrid, no sends, no OpenAI).
 */

import type { Prisma } from "@prisma/client";
import type { EmailContactImportBatchStatus, EmailContactImportRowValidationStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

const SOURCE_METADATA_VERSION = 1 as const;

export type ParsedCsvRow = Record<string, string>;

/** Minimal CSV parser (comma + double-quote); no streaming. */
export function parseContactCsv(text: string): { headers: string[]; rows: ParsedCsvRow[] } {
  const lines = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((l) => l.trimEnd())
    .filter((l, i) => i === 0 || l.length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const rows: ParsedCsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    const row: ParsedCsvRow = {};
    for (let c = 0; c < headers.length; c++) {
      const key = headers[c];
      if (!key) continue;
      row[key] = (cells[c] ?? "").trim();
    }
    rows.push(row);
  }
  return { headers, rows };
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function cell(raw: ParsedCsvRow, ...keys: string[]): string {
  for (const k of keys) {
    const v = raw[k.toLowerCase()];
    if (v != null && String(v).trim()) return String(v).trim();
  }
  return "";
}

export type NormalizedImportRow = {
  rowNumber: number;
  raw: ParsedCsvRow;
  normalizedEmail: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  county: string | null;
  city: string | null;
  state: string | null;
  sourceList: string | null;
  sourceDate: string | null;
  consentStatus: string | null;
  tags: string[];
  organization: string | null;
  role: string | null;
  notes: string | null;
  volunteerInterest: string | null;
  donorInterest: string | null;
  issueInterest: string | null;
};

export function normalizeContactImportRow(raw: ParsedCsvRow, rowNumber: number): NormalizedImportRow {
  const emailRaw = cell(raw, "email", "e-mail", "email address");
  const normalizedEmail = emailRaw ? emailRaw.toLowerCase().trim() : null;
  const tagsRaw = cell(raw, "tags", "tag");
  const tags = tagsRaw
    ? tagsRaw
        .split(/[,;|]/)
        .map((t) => t.trim())
        .filter(Boolean)
    : [];
  return {
    rowNumber,
    raw,
    normalizedEmail,
    firstName: cell(raw, "firstname", "first_name", "first name") || null,
    lastName: cell(raw, "lastname", "last_name", "last name") || null,
    phone: cell(raw, "phone", "mobile", "cell") || null,
    county: cell(raw, "county") || null,
    city: cell(raw, "city") || null,
    state: cell(raw, "state") || null,
    sourceList: cell(raw, "sourcelist", "source_list", "source list") || null,
    sourceDate: cell(raw, "sourcedate", "source_date", "source date") || null,
    consentStatus: cell(raw, "consentstatus", "consent_status", "consent") || null,
    tags,
    organization: cell(raw, "organization", "org") || null,
    role: cell(raw, "role", "title") || null,
    notes: cell(raw, "notes", "note") || null,
    volunteerInterest: cell(raw, "volunteerinterest", "volunteer_interest") || null,
    donorInterest: cell(raw, "donorinterest", "donor_interest") || null,
    issueInterest: cell(raw, "issueinterest", "issue_interest") || null,
  };
}

export type ValidationResult = {
  status: EmailContactImportRowValidationStatus;
  messages: string[];
};

export function validateContactImportRow(row: NormalizedImportRow): ValidationResult {
  const messages: string[] = [];
  if (!row.normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.normalizedEmail)) {
    return { status: "INVALID", messages: ["Missing or invalid email."] };
  }
  if (!row.sourceList || !row.sourceList.trim()) {
    messages.push("No sourceList — required for provenance before any future send.");
  }
  if (!row.consentStatus || !row.consentStatus.trim()) {
    messages.push("No consentStatus — operator must confirm consent posture before sends.");
  }
  const status: EmailContactImportRowValidationStatus =
    messages.length > 0 ? "WARNING" : "VALID";
  return { status, messages };
}

export function detectImportDuplicates(rows: NormalizedImportRow[]): Map<number, EmailContactImportRowValidationStatus> {
  const firstIndex = new Map<string, number>();
  const out = new Map<number, EmailContactImportRowValidationStatus>();
  for (const r of rows) {
    if (!r.normalizedEmail) continue;
    const prev = firstIndex.get(r.normalizedEmail);
    if (prev === undefined) {
      firstIndex.set(r.normalizedEmail, r.rowNumber);
    } else {
      out.set(r.rowNumber, "DUPLICATE");
    }
  }
  return out;
}

export async function matchExistingProfiles(
  rows: NormalizedImportRow[]
): Promise<Map<string, string>> {
  const emails = [...new Set(rows.map((r) => r.normalizedEmail).filter(Boolean))] as string[];
  if (emails.length === 0) return new Map();
  const profiles = await prisma.emailContactProfile.findMany({
    where: { primaryEmail: { in: emails } },
    select: { id: true, primaryEmail: true },
  });
  const map = new Map<string, string>();
  for (const p of profiles) {
    if (p.primaryEmail) map.set(p.primaryEmail.toLowerCase(), p.id);
  }
  return map;
}

export type CreateContactImportBatchInput = {
  name: string;
  sourceLabel?: string | null;
  originalFilename: string;
  createdByUserId: string | null;
  csvText: string;
};

export async function createContactImportBatch(input: CreateContactImportBatchInput) {
  const { headers, rows: parsed } = parseContactCsv(input.csvText);
  if (headers.length === 0) throw new Error("CSV has no header row.");
  const normalized: NormalizedImportRow[] = parsed.map((raw, idx) =>
    normalizeContactImportRow(raw, idx + 1)
  );

  return prisma.$transaction(async (tx) => {
    const batch = await tx.emailContactImportBatch.create({
      data: {
        name: input.name,
        sourceLabel: input.sourceLabel ?? null,
        originalFilename: input.originalFilename,
        status: "PARSED",
        rowCount: normalized.length,
        metadataJson: { headerKeys: headers, version: SOURCE_METADATA_VERSION } as Prisma.InputJsonValue,
        createdByUserId: input.createdByUserId,
      },
    });
    for (const r of normalized) {
      await tx.emailContactImportRow.create({
        data: {
          batchId: batch.id,
          rowNumber: r.rowNumber,
          rawJson: r.raw as Prisma.InputJsonValue,
          normalizedEmail: r.normalizedEmail,
          firstName: r.firstName,
          lastName: r.lastName,
          phone: r.phone,
          county: r.county,
          city: r.city,
          state: r.state,
          sourceList: r.sourceList,
          sourceDate: r.sourceDate,
          consentStatus: r.consentStatus,
          tagsJson: r.tags as Prisma.InputJsonValue,
          organization: r.organization,
          role: r.role,
          notes: r.notes,
          volunteerInterest: r.volunteerInterest,
          donorInterest: r.donorInterest,
          issueInterest: r.issueInterest,
          validationStatus: "VALID",
          validationMessagesJson: [] as Prisma.InputJsonValue,
        },
      });
    }
    return batch.id;
  });
}

export async function listContactImportBatches(limit = 25) {
  return prisma.emailContactImportBatch.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      name: true,
      status: true,
      rowCount: true,
      validRowCount: true,
      invalidRowCount: true,
      duplicateRowCount: true,
      existingProfileMatchCount: true,
      consentWarningCount: true,
      createdAt: true,
    },
  });
}

export async function getContactImportBatchDetail(batchId: string) {
  return prisma.emailContactImportBatch.findUnique({
    where: { id: batchId },
    include: {
      rows: {
        orderBy: { rowNumber: "asc" },
        include: {
          matchedProfile: { select: { id: true, primaryEmail: true } },
          committedProfile: { select: { id: true, primaryEmail: true } },
        },
      },
      decisions: { orderBy: { decidedAt: "desc" }, take: 50 },
    },
  });
}

export async function validateEmailContactImportBatch(batchId: string) {
  const batch = await prisma.emailContactImportBatch.findUnique({
    where: { id: batchId },
    include: { rows: true },
  });
  if (!batch) throw new Error("Batch not found.");
  if (
    batch.status === "COMMITTED" ||
    batch.status === "ARCHIVED" ||
    batch.status === "APPROVED"
  ) {
    throw new Error("Batch cannot be re-validated in this state.");
  }

  const normalized: NormalizedImportRow[] = batch.rows.map((row) => ({
    rowNumber: row.rowNumber,
    raw: (row.rawJson as ParsedCsvRow) ?? {},
    normalizedEmail: row.normalizedEmail,
    firstName: row.firstName,
    lastName: row.lastName,
    phone: row.phone,
    county: row.county,
    city: row.city,
    state: row.state,
    sourceList: row.sourceList,
    sourceDate: row.sourceDate,
    consentStatus: row.consentStatus,
    tags: Array.isArray(row.tagsJson) ? (row.tagsJson as string[]) : [],
    organization: row.organization,
    role: row.role,
    notes: row.notes,
    volunteerInterest: row.volunteerInterest,
    donorInterest: row.donorInterest,
    issueInterest: row.issueInterest,
  }));

  const dupMap = detectImportDuplicates(normalized);
  const existing = await matchExistingProfiles(normalized);

  let validRowCount = 0;
  let invalidRowCount = 0;
  let duplicateRowCount = 0;
  let existingProfileMatchCount = 0;
  let consentWarningCount = 0;

  for (const row of batch.rows) {
    const n = normalized.find((x) => x.rowNumber === row.rowNumber)!;
    const messages: string[] = [];
    let status: EmailContactImportRowValidationStatus;

    if (!n.normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(n.normalizedEmail)) {
      status = "INVALID";
      messages.push("Missing or invalid email.");
    } else if (dupMap.get(row.rowNumber) === "DUPLICATE") {
      status = "DUPLICATE";
      messages.push("Duplicate normalized email within this batch.");
    } else {
      const matchedId = existing.get(n.normalizedEmail);
      if (matchedId) {
        status = "EXISTING_MATCH";
        messages.push("Matches existing EmailContactProfile.primaryEmail.");
        const v = validateContactImportRow(n);
        for (const m of v.messages) {
          if (!messages.includes(m)) messages.push(m);
        }
      } else {
        const v = validateContactImportRow(n);
        status = v.status;
        messages.push(...v.messages);
      }
    }

    if (messages.some((m) => m.includes("consentStatus") || m.includes("sourceList"))) {
      consentWarningCount++;
    }

    if (status === "INVALID") invalidRowCount++;
    else if (status === "DUPLICATE") duplicateRowCount++;
    else if (status === "EXISTING_MATCH") {
      existingProfileMatchCount++;
      validRowCount++;
    } else if (status === "WARNING") validRowCount++;
    else validRowCount++;

    const matchedId =
      n.normalizedEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(n.normalizedEmail)
        ? existing.get(n.normalizedEmail)
        : undefined;

    await prisma.emailContactImportRow.update({
      where: { id: row.id },
      data: {
        validationStatus: status,
        validationMessagesJson: messages as Prisma.InputJsonValue,
        matchedProfileId: matchedId ?? null,
      },
    });
  }

  await prisma.emailContactImportBatch.update({
    where: { id: batchId },
    data: {
      status: "VALIDATED",
      validRowCount,
      invalidRowCount,
      duplicateRowCount,
      existingProfileMatchCount,
      consentWarningCount,
    },
  });
}

export async function previewContactImportCommit(batchId: string) {
  const batch = await prisma.emailContactImportBatch.findUnique({
    where: { id: batchId },
    include: { rows: true },
  });
  if (!batch) throw new Error("Batch not found.");
  const commitable = batch.rows.filter((r) =>
    ["VALID", "WARNING", "EXISTING_MATCH"].includes(r.validationStatus)
  );
  return {
    batchId,
    status: batch.status,
    wouldCreateProfiles: commitable.filter((r) => !r.matchedProfileId).length,
    wouldUpdateProfiles: commitable.filter((r) => Boolean(r.matchedProfileId)).length,
    wouldSkipInvalid: batch.rows.filter((r) => r.validationStatus === "INVALID").length,
    wouldSkipDuplicate: batch.rows.filter((r) => r.validationStatus === "DUPLICATE").length,
    rowCount: batch.rows.length,
  };
}

export async function approveContactImportBatch(batchId: string, actorUserId: string | null) {
  const batch = await prisma.emailContactImportBatch.findUnique({ where: { id: batchId } });
  if (!batch) throw new Error("Batch not found.");
  if (batch.status !== "VALIDATED" && batch.status !== "READY_FOR_APPROVAL") {
    throw new Error("Batch must be validated before approval.");
  }
  const now = new Date();
  await prisma.$transaction([
    prisma.emailContactImportBatch.update({
      where: { id: batchId },
      data: {
        status: "APPROVED",
        approvedAt: now,
        approvedByUserId: actorUserId,
      },
    }),
    prisma.emailContactImportDecision.create({
      data: {
        batchId,
        decisionType: "APPROVE_BATCH",
        reason: "Operator approved staged import batch for commit.",
        decidedByUserId: actorUserId,
        metadataJson: { batchId, at: now.toISOString() } as Prisma.InputJsonValue,
      },
    }),
  ]);
}

function importSourceMeta(batchId: string, rowId: string): Prisma.InputJsonValue {
  return {
    version: SOURCE_METADATA_VERSION,
    batchId,
    rowId,
    source: "EMAIL_CONTACT_IMPORT_STAGING",
  } as Prisma.InputJsonValue;
}

export async function commitApprovedContactImportBatch(batchId: string, actorUserId: string | null) {
  const batch = await prisma.emailContactImportBatch.findUnique({
    where: { id: batchId },
    include: { rows: true },
  });
  if (!batch) throw new Error("Batch not found.");
  if (batch.status !== "APPROVED") throw new Error("Batch must be APPROVED before commit.");

  const rows = batch.rows.filter((r) =>
    ["VALID", "WARNING", "EXISTING_MATCH"].includes(r.validationStatus)
  );
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      if (!row.normalizedEmail) continue;
      const displayName = [row.firstName, row.lastName].filter(Boolean).join(" ").trim() || null;

      let profileId = row.matchedProfileId;
      if (!profileId) {
        const created = await tx.emailContactProfile.create({
          data: {
            primaryEmail: row.normalizedEmail,
            displayName,
            county: row.county,
            city: row.city,
            state: row.state,
            source: "contact_import",
            metadataJson: {
              contactImportBatchId: batchId,
              contactImportRowId: row.id,
            } as Prisma.InputJsonValue,
          },
        });
        profileId = created.id;
      } else {
        await tx.emailContactProfile.update({
          where: { id: profileId },
          data: {
            displayName: displayName ?? undefined,
            county: row.county ?? undefined,
            city: row.city ?? undefined,
            state: row.state ?? undefined,
          },
        });
      }

      const factWrites: Prisma.EmailContactProfileFactCreateManyInput[] = [];
      const pushFact = (factKey: string, factValue: string | null | undefined) => {
        if (!factValue || !factValue.trim()) return;
        factWrites.push({
          profileId: profileId!,
          factType: "CONTACT_IMPORT",
          factKey,
          factValue: factValue.trim(),
          confidence: 1,
          sourceType: "CONTACT_IMPORT",
          sourceMetadataJson: importSourceMeta(batchId, row.id),
          status: "ACTIVE",
          approvedByUserId: actorUserId,
          approvedAt: now,
        });
      };
      pushFact("county", row.county);
      pushFact("city", row.city);
      pushFact("organization", row.organization);
      pushFact("role", row.role);
      pushFact("issueInterest", row.issueInterest);
      pushFact("volunteerInterest", row.volunteerInterest);
      pushFact("donorInterest", row.donorInterest);
      if (row.sourceList) pushFact("sourceList", row.sourceList);
      if (row.sourceDate) pushFact("sourceDate", row.sourceDate);
      if (row.consentStatus) pushFact("consentStatus", row.consentStatus);

      if (factWrites.length) {
        await tx.emailContactProfileFact.createMany({ data: factWrites });
      }

      await tx.emailContactImportRow.update({
        where: { id: row.id },
        data: { committedProfileId: profileId },
      });
    }

    await tx.emailContactImportBatch.update({
      where: { id: batchId },
      data: {
        status: "COMMITTED",
        committedAt: now,
      },
    });
    await tx.emailContactImportDecision.create({
      data: {
        batchId,
        decisionType: "CREATE_PROFILE",
        reason: "Committed approved import rows to EmailContactProfile + CONTACT_IMPORT facts.",
        decidedByUserId: actorUserId,
        metadataJson: { batchId, rowCount: rows.length } as Prisma.InputJsonValue,
      },
    });
  });
}

export async function archiveContactImportBatch(batchId: string) {
  await prisma.emailContactImportBatch.update({
    where: { id: batchId },
    data: { status: "ARCHIVED" },
  });
}

export async function contactImportSnapshotCounts() {
  try {
    const [pendingApproval, committed, openBatches, consentAgg, latest] = await Promise.all([
      prisma.emailContactImportBatch.count({
        where: { status: { in: ["VALIDATED", "READY_FOR_APPROVAL"] } },
      }),
      prisma.emailContactImportBatch.count({ where: { status: "COMMITTED" } }),
      prisma.emailContactImportBatch.count({
        where: { status: { notIn: ["COMMITTED", "ARCHIVED"] } },
      }),
      prisma.emailContactImportBatch.aggregate({
        _sum: { consentWarningCount: true },
      }),
      prisma.emailContactImportBatch.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, status: true, createdAt: true },
      }),
    ]);
    return {
      dbSliceReachable: true,
      pendingApprovalCount: pendingApproval,
      committedBatchCount: committed,
      /** Batches still in the staging lifecycle (excludes committed + archived). */
      openImportBatchCount: openBatches,
      consentWarningRowsCount: consentAgg._sum.consentWarningCount ?? 0,
      latestBatches: latest,
    };
  } catch {
    return {
      dbSliceReachable: false,
      pendingApprovalCount: 0,
      committedBatchCount: 0,
      openImportBatchCount: 0,
      consentWarningRowsCount: 0,
      latestBatches: [] as { id: string; name: string; status: EmailContactImportBatchStatus; createdAt: Date }[],
    };
  }
}
