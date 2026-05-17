import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { createStagedCashContribution, loadStagedCashContributions } from "@/lib/compliance/cash/cash-storage";
import { extractCashSlip } from "@/lib/compliance/cash/extract-cash-slip";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const unauthorized = await assertAdminApi();
  if (unauthorized) return unauthorized;
  const contributions = await loadStagedCashContributions();
  return NextResponse.json({ contributions });
}

export async function POST(request: Request) {
  const unauthorized = await assertAdminApi();
  if (unauthorized) return unauthorized;
  const form = await request.formData();
  const amount = Number(form.get("amount") ?? 0);
  const ocrExtraction = await extractCashSlip({ enteredAmount: amount });
  const contribution = await createStagedCashContribution({
    createdByInitials: stringField(form, "createdByInitials") ?? "",
    contributionDate: stringField(form, "contributionDate"),
    amount,
    donorFullName: stringField(form, "donorFullName"),
    donorFirstName: stringField(form, "donorFirstName"),
    donorLastName: stringField(form, "donorLastName"),
    donorAddress1: stringField(form, "donorAddress1"),
    donorCity: stringField(form, "donorCity"),
    donorState: stringField(form, "donorState"),
    donorZip: stringField(form, "donorZip"),
    donorPhone: stringField(form, "donorPhone"),
    donorEmail: stringField(form, "donorEmail"),
    employer: stringField(form, "employer"),
    occupation: stringField(form, "occupation"),
    idChecked: form.get("idChecked") === "on",
    idCheckMethod: form.get("idChecked") === "on" ? "visual_check" : "not_recorded",
    idCheckedByInitials: stringField(form, "idCheckedByInitials") ?? stringField(form, "createdByInitials"),
    eventSource: stringField(form, "eventSource"),
    notes: stringField(form, "notes"),
    billPhotoPath: fileEvidenceNote(form.get("billPhoto")),
    donorSlipPhotoPath: fileEvidenceNote(form.get("donorSlipPhoto")),
    ocrExtraction,
  });
  return NextResponse.json({ contribution }, { status: 201 });
}

function stringField(form: FormData, key: string): string | undefined {
  const value = form.get(key);
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function fileEvidenceNote(value: FormDataEntryValue | null): string | undefined {
  if (!(value instanceof File) || !value.name) return undefined;
  return `not-stored:${value.name}`;
}
