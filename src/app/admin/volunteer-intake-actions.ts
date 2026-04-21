"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  SignupSheetDocumentStatus,
  SignupSheetEntryStatus,
  SignupSheetExtractionStatus,
} from "@prisma/client";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { prisma } from "@/lib/db";
import { extractSignupRowsFromOwnedMedia } from "@/lib/volunteer-intake/extract-signup-sheet";
import { refreshMatchesForExtractionId } from "@/lib/volunteer-intake/match-entries-to-voters";
import { normalizeNamePart, normalizePhone10 } from "@/lib/volunteer-intake/normalize";
import { resolveCountyFromText } from "@/lib/volunteer-intake/resolve-county";
import { sanitizePlainText } from "@/lib/security/sanitize";

export async function createSignupDocumentFromOwnedMediaAction(formData: FormData) {
  await requireAdminAction();
  const ownedMediaId = String(formData.get("ownedMediaId") ?? "").trim();
  if (!ownedMediaId) redirect("/admin/volunteers/intake?error=media");
  const existing = await prisma.signupSheetDocument.findUnique({ where: { ownedMediaId } });
  if (existing) redirect(`/admin/volunteers/intake/${existing.id}`);
  const doc = await prisma.signupSheetDocument.create({
    data: { ownedMediaId, status: SignupSheetDocumentStatus.DRAFT },
  });
  revalidatePath("/admin/volunteers/intake");
  redirect(`/admin/volunteers/intake/${doc.id}`);
}

export async function runSignupExtractionAction(formData: FormData) {
  await requireAdminAction();
  const documentId = String(formData.get("documentId") ?? "").trim();
  if (!documentId) redirect("/admin/volunteers/intake?error=doc");
  const doc = await prisma.signupSheetDocument.findUnique({
    where: { id: documentId },
    include: { ownedMedia: true },
  });
  if (!doc) redirect("/admin/volunteers/intake?error=doc");
  await prisma.signupSheetDocument.update({
    where: { id: documentId },
    data: { lastExtractionId: null },
  });
  await prisma.signupSheetEntry.deleteMany({ where: { documentId } });
  await prisma.signupSheetExtraction.deleteMany({ where: { documentId } });
  await prisma.signupSheetDocument.update({
    where: { id: documentId },
    data: { status: SignupSheetDocumentStatus.EXTRACTING },
  });
  const result = await extractSignupRowsFromOwnedMedia(doc.ownedMedia);
  if (!result.ok) {
    await prisma.signupSheetExtraction.create({
      data: {
        documentId,
        status: SignupSheetExtractionStatus.FAILED,
        errorMessage: result.error,
        rawOcrText: result.rawOcrText ?? null,
      },
    });
    await prisma.signupSheetDocument.update({
      where: { id: documentId },
      data: { status: SignupSheetDocumentStatus.FAILED },
    });
    revalidatePath("/admin/volunteers/intake");
    revalidatePath(`/admin/volunteers/intake/${documentId}`);
    revalidatePath("/admin/workbench");
    redirect(`/admin/volunteers/intake/${documentId}?error=extract`);
  }

  const ext = await prisma.signupSheetExtraction.create({
    data: {
      documentId,
      status: SignupSheetExtractionStatus.SUCCEEDED,
      model: result.model,
      rawOcrText: result.rawOcrText,
      parsedOutputJson: result.parsed as object,
      avgConfidence: result.avgConfidence,
    },
  });
  const counties = await prisma.county.findMany({ select: { id: true, slug: true, displayName: true, fips: true } });
  for (let i = 0; i < result.rows.length; i += 1) {
    const r = result.rows[i]!;
    const countyRes = resolveCountyFromText(r.county ?? null, counties);
    await prisma.signupSheetEntry.create({
      data: {
        documentId,
        extractionId: ext.id,
        rowIndex: i,
        firstName: r.firstName ?? null,
        lastName: r.lastName ?? null,
        phone: r.phone ?? null,
        email: r.email ?? null,
        address: r.address ?? null,
        countyText: r.county ?? null,
        countyId: countyRes?.countyId ?? null,
        rawRowText: r.rawRowText || JSON.stringify(r),
        parsedJson: r as object,
        confidenceScore: r.confidence ?? null,
      },
    });
  }
  await prisma.signupSheetDocument.update({
    where: { id: documentId },
    data: {
      status: result.rows.length ? SignupSheetDocumentStatus.EXTRACTED : SignupSheetDocumentStatus.PARTIAL,
      lastExtractionId: ext.id,
    },
  });
  await refreshMatchesForExtractionId(ext.id);
  revalidatePath("/admin/volunteers/intake");
  revalidatePath(`/admin/volunteers/intake/${documentId}`);
  revalidatePath("/admin/workbench");
  redirect(`/admin/volunteers/intake/${documentId}?extracted=1`);
}

export async function updateSignupEntryAction(formData: FormData) {
  await requireAdminAction();
  const entryId = String(formData.get("entryId") ?? "").trim();
  if (!entryId) redirect("/admin/volunteers/intake?error=entry");
  const documentId = String(formData.get("documentId") ?? "").trim();
  const firstName = String(formData.get("firstName") ?? "").trim() || null;
  const lastName = String(formData.get("lastName") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim() || null;
  const countyText = String(formData.get("countyText") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const counties = await prisma.county.findMany({ select: { id: true, slug: true, displayName: true, fips: true } });
  const county = resolveCountyFromText(countyText, counties);
  await prisma.signupSheetEntry.update({
    where: { id: entryId },
    data: {
      firstName: normalizeNamePart(firstName) ?? firstName,
      lastName: normalizeNamePart(lastName) ?? lastName,
      phone,
      email,
      address,
      countyText,
      countyId: county?.countyId ?? null,
      notes,
    },
  });
  const entry = await prisma.signupSheetEntry.findUnique({ where: { id: entryId }, include: { extraction: true } });
  if (entry?.extractionId && entry.approvalStatus === SignupSheetEntryStatus.PENDING_REVIEW) {
    await prisma.volunteerMatchCandidate.deleteMany({ where: { entryId } });
    const { buildMatchCandidatesForEntry } = await import("@/lib/volunteer-intake/match-entries-to-voters");
    const { candidates } = await buildMatchCandidatesForEntry(
      {
        id: entry.id,
        firstName: entry.firstName,
        lastName: entry.lastName,
        phone: entry.phone,
        countyId: entry.countyId,
        countyText: entry.countyText,
        address: entry.address,
      },
      counties
    );
    let rank = 0;
    for (const c of candidates) {
      await prisma.volunteerMatchCandidate.create({
        data: {
          entryId,
          voterRecordId: c.voter.id,
          score: c.score,
          reasonJson: { reasons: c.reasons, hasPiiInWarehouse: true, ambiguous: candidates.length > 1 } as object,
          rank: rank++,
        },
      });
    }
  }
  revalidatePath(`/admin/volunteers/intake/${documentId}`);
  revalidatePath("/admin/workbench");
  redirect(`/admin/volunteers/intake/${documentId}?saved=1`);
}

export async function setEntryVoterOverrideAction(formData: FormData) {
  await requireAdminAction();
  const entryId = String(formData.get("entryId") ?? "").trim();
  const documentId = String(formData.get("documentId") ?? "").trim();
  const voterId = String(formData.get("matchedVoterRecordId") ?? "").trim() || null;
  if (!entryId || !documentId) redirect("/admin/volunteers/intake?error=entry");
  await prisma.signupSheetEntry.update({
    where: { id: entryId },
    data: { matchedVoterRecordId: voterId },
  });
  revalidatePath(`/admin/volunteers/intake/${documentId}`);
  redirect(`/admin/volunteers/intake/${documentId}?voter=1`);
}

export async function approveSignupEntryAction(formData: FormData) {
  await requireAdminAction();
  const entryId = String(formData.get("entryId") ?? "").trim();
  const documentId = String(formData.get("documentId") ?? "").trim();
  if (!entryId || !documentId) redirect("/admin/volunteers/intake?error=entry");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    redirect(`/admin/volunteers/intake/${documentId}?error=email`);
  }
  const entry = await prisma.signupSheetEntry.findUnique({ where: { id: entryId } });
  if (!entry || entry.approvalStatus !== SignupSheetEntryStatus.PENDING_REVIEW) {
    redirect(`/admin/volunteers/intake/${documentId}?error=state`);
  }
  const firstName = sanitizePlainText(entry.firstName ?? "", 80);
  const lastName = sanitizePlainText(entry.lastName ?? "", 80);
  const name = [firstName, lastName].filter(Boolean).join(" ").trim() || "Volunteer";
  const phone =
    normalizePhone10(entry.phone) ||
    (entry.phone?.trim() ? entry.phone.trim() : null);
  const county = (entry.countyText ?? "").trim() || null;
  const voterId = entry.matchedVoterRecordId;
  if (voterId) {
    const vr = await prisma.voterRecord.findUnique({ where: { id: voterId } });
    if (!vr) redirect(`/admin/volunteers/intake/${documentId}?error=voter`);
  }

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.upsert({
      where: { email },
      create: {
        email,
        name,
        phone,
        county: county ? sanitizePlainText(county, 80) : null,
        interests: ["volunteer", "signup_sheet_intake"],
        linkedVoterRecordId: voterId,
      },
      update: {
        name,
        phone: phone ?? undefined,
        county: county ? sanitizePlainText(county, 80) : undefined,
        linkedVoterRecordId: voterId !== null ? voterId : undefined,
      },
    });
    const withInt = await tx.user.findUnique({ where: { id: user.id }, select: { interests: true } });
    const next = Array.from(new Set([...(withInt?.interests ?? []), "signup_sheet_intake", "volunteer"]));
    await tx.user.update({ where: { id: user.id }, data: { interests: { set: next } } });
    await tx.volunteerProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, availability: "From signup sheet intake", skills: null, leadershipInterest: false },
      update: {},
    });
    await tx.submission.create({
      data: {
        userId: user.id,
        type: "volunteer_signup_sheet",
        content: `Approved from signup sheet document ${entry.documentId}, row ${entry.rowIndex}.`,
        structuredData: {
          source: "signup_sheet_intake",
          documentId: entry.documentId,
          entryId: entry.id,
          approvedAt: new Date().toISOString(),
        } as object,
      },
    });
    await tx.commitment.create({
      data: {
        userId: user.id,
        type: "volunteer",
        metadata: { source: "signup_sheet_intake", documentId: entry.documentId, entryId: entry.id } as object,
      },
    });
    await tx.signupSheetEntry.update({
      where: { id: entryId },
      data: {
        approvalStatus: SignupSheetEntryStatus.APPROVED,
        matchedUserId: user.id,
        matchedVoterRecordId: voterId,
        decidedAt: new Date(),
        firstName: firstName || entry.firstName,
        lastName: lastName || entry.lastName,
        email,
        phone: entry.phone,
        decisionNote: String(formData.get("decisionNote") ?? "").trim() || null,
      },
    });
  });

  revalidatePath("/admin/volunteers/intake");
  revalidatePath(`/admin/volunteers/intake/${documentId}`);
  revalidatePath("/admin/workbench");
  redirect(`/admin/volunteers/intake/${documentId}?approved=1`);
}

export async function rejectSignupEntryAction(formData: FormData) {
  await requireAdminAction();
  const entryId = String(formData.get("entryId") ?? "").trim();
  const documentId = String(formData.get("documentId") ?? "").trim();
  if (!entryId || !documentId) redirect("/admin/volunteers/intake?error=entry");
  const note = String(formData.get("decisionNote") ?? "").trim() || null;
  await prisma.signupSheetEntry.update({
    where: { id: entryId },
    data: { approvalStatus: SignupSheetEntryStatus.REJECTED, decidedAt: new Date(), decisionNote: note },
  });
  revalidatePath(`/admin/volunteers/intake/${documentId}`);
  revalidatePath("/admin/workbench");
  redirect(`/admin/volunteers/intake/${documentId}?rejected=1`);
}

export async function skipSignupEntryAction(formData: FormData) {
  await requireAdminAction();
  const entryId = String(formData.get("entryId") ?? "").trim();
  const documentId = String(formData.get("documentId") ?? "").trim();
  if (!entryId || !documentId) redirect("/admin/volunteers/intake?error=entry");
  await prisma.signupSheetEntry.update({
    where: { id: entryId },
    data: { approvalStatus: SignupSheetEntryStatus.SKIPPED, decidedAt: new Date() },
  });
  revalidatePath(`/admin/volunteers/intake/${documentId}`);
  revalidatePath("/admin/workbench");
  redirect(`/admin/volunteers/intake/${documentId}?skipped=1`);
}
