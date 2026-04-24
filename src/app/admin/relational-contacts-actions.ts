"use server";

import {
  RelationalRelationshipType,
  RelationalOrganizingStatus,
  RelationalMatchStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { createRelationalContact } from "@/lib/campaign-engine/relational-contacts";
import { prisma } from "@/lib/db";

function parseRelationshipType(raw: string): RelationalRelationshipType {
  const s = String(raw || "").trim();
  if (Object.values(RelationalRelationshipType).includes(s as RelationalRelationshipType)) {
    return s as RelationalRelationshipType;
  }
  return RelationalRelationshipType.UNKNOWN;
}

function parseOrganizingStatus(raw: string): RelationalOrganizingStatus | undefined {
  const s = String(raw || "").trim();
  if (!s) return undefined;
  if (Object.values(RelationalOrganizingStatus).includes(s as RelationalOrganizingStatus)) {
    return s as RelationalOrganizingStatus;
  }
  return undefined;
}

function parseMatchStatus(raw: string): RelationalMatchStatus | undefined {
  const s = String(raw || "").trim();
  if (!s) return undefined;
  if (Object.values(RelationalMatchStatus).includes(s as RelationalMatchStatus)) {
    return s as RelationalMatchStatus;
  }
  return undefined;
}

export async function createRelationalContactAdminAction(formData: FormData) {
  await requireAdminAction();

  const ownerEmail = String(formData.get("ownerEmail") ?? "").trim().toLowerCase();
  if (!ownerEmail) {
    redirect("/admin/relational-contacts?error=owner");
  }
  const owner = await prisma.user.findUnique({ where: { email: ownerEmail }, select: { id: true } });
  if (!owner) {
    redirect("/admin/relational-contacts?error=nouser");
  }

  const displayName = String(formData.get("displayName") ?? "").trim();
  if (!displayName) {
    redirect("/admin/relational-contacts?error=name");
  }

  const countySlug = String(formData.get("countySlug") ?? "").trim();
  let countyId: string | null = null;
  if (countySlug) {
    const c = await prisma.county.findUnique({ where: { slug: countySlug }, select: { id: true } });
    countyId = c?.id ?? null;
  }

  const isCoreFive = formData.get("isCoreFive") === "on";
  const slotRaw = String(formData.get("powerOfFiveSlot") ?? "").trim();
  const powerOfFiveSlot = slotRaw ? parseInt(slotRaw, 10) : null;

  try {
    await createRelationalContact({
      ownerUserId: owner.id,
      displayName,
      firstName: String(formData.get("firstName") ?? "").trim() || null,
      lastName: String(formData.get("lastName") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      email: String(formData.get("email") ?? "").trim() || null,
      relationshipType: parseRelationshipType(String(formData.get("relationshipType") ?? "UNKNOWN")),
      countyId,
      organizingStatus: parseOrganizingStatus(String(formData.get("organizingStatus") ?? "")),
      matchStatus: parseMatchStatus(String(formData.get("matchStatus") ?? "")),
      isCoreFive,
      powerOfFiveSlot: Number.isFinite(powerOfFiveSlot as number) ? powerOfFiveSlot : null,
      notes: String(formData.get("notes") ?? "").trim() || null,
    });
  } catch {
    redirect("/admin/relational-contacts?error=create");
  }

  revalidatePath("/admin/relational-contacts");
  redirect("/admin/relational-contacts?saved=1");
}
