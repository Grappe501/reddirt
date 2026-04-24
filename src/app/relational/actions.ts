"use server";

import { RelationalRelationshipType, VoterInteractionChannel, VoterInteractionType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getRelationalUserIdFromCookies } from "@/lib/campaign/relational-user-session";
import {
  createRelationalContact,
  getRelationalContactDetailForOwner,
  listRelationalContactsForUser,
  recordRelationalTouch,
  updateRelationalContact,
} from "@/lib/campaign-engine/relational-contacts";
import { prisma } from "@/lib/db";

async function requireOwnerUserId(): Promise<string> {
  const id = await getRelationalUserIdFromCookies();
  if (!id) {
    redirect("/relational/login");
  }
  return id;
}

export async function createRelationalContactUserAction(formData: FormData) {
  const ownerUserId = await requireOwnerUserId();
  const displayName = String(formData.get("displayName") ?? "").trim();
  if (!displayName) {
    redirect("/relational/new?error=" + encodeURIComponent("Display name is required"));
  }
  const relationshipRaw = String(formData.get("relationshipType") ?? "UNKNOWN");
  const relationshipType = Object.values(RelationalRelationshipType).includes(
    relationshipRaw as RelationalRelationshipType,
  )
    ? (relationshipRaw as RelationalRelationshipType)
    : RelationalRelationshipType.UNKNOWN;

  const isCore =
    formData.get("isCoreFive") === "on" || formData.get("isCoreFive") === "true" ? true : false;
  const slotRaw = String(formData.get("powerOfFiveSlot") ?? "").trim();
  const powerOfFiveSlot = isCore && slotRaw ? parseInt(slotRaw, 10) : null;
  if (isCore && !Number.isFinite(powerOfFiveSlot as number)) {
    redirect("/relational/new?error=" + encodeURIComponent("Core five requires a slot 1–5"));
  }

  try {
    await createRelationalContact({
      ownerUserId,
      displayName,
      firstName: String(formData.get("firstName") ?? "").trim() || null,
      lastName: String(formData.get("lastName") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      email: String(formData.get("email") ?? "").trim() || null,
      relationshipType,
      isCoreFive: isCore,
      powerOfFiveSlot: isCore ? powerOfFiveSlot : null,
      notes: String(formData.get("notes") ?? "").trim() || null,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not create contact";
    redirect(`/relational/new?error=${encodeURIComponent(msg)}`);
  }
  revalidatePath("/relational");
  redirect("/relational?saved=1");
}


export async function updateRelationalContactUserAction(contactId: string, formData: FormData) {
  const ownerUserId = await requireOwnerUserId();
  const row = await prisma.relationalContact.findFirst({
    where: { id: contactId, ownerUserId },
    select: { id: true },
  });
  if (!row) {
    redirect("/relational?error=notfound");
  }
  const displayName = String(formData.get("displayName") ?? "").trim();
  if (!displayName) {
    redirect(`/relational/${contactId}?error=name`);
  }
  const relationshipRaw = String(formData.get("relationshipType") ?? "UNKNOWN");
  const relationshipType = Object.values(RelationalRelationshipType).includes(
    relationshipRaw as RelationalRelationshipType,
  )
    ? (relationshipRaw as RelationalRelationshipType)
    : RelationalRelationshipType.UNKNOWN;

  const isCore =
    formData.get("isCoreFive") === "on" || formData.get("isCoreFive") === "true" ? true : false;
  const slotRaw = String(formData.get("powerOfFiveSlot") ?? "").trim();
  const powerOfFiveSlot = isCore && slotRaw ? parseInt(slotRaw, 10) : null;
  if (isCore && !Number.isFinite(powerOfFiveSlot as number)) {
    redirect(`/relational/${contactId}?error=${encodeURIComponent("Core five requires a slot 1–5")}`);
  }

  try {
    await updateRelationalContact(contactId, {
      displayName,
      firstName: String(formData.get("firstName") ?? "").trim() || null,
      lastName: String(formData.get("lastName") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      email: String(formData.get("email") ?? "").trim() || null,
      relationshipType,
      isCoreFive: isCore,
      powerOfFiveSlot: isCore ? powerOfFiveSlot : null,
      notes: String(formData.get("notes") ?? "").trim() || null,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not update";
    redirect(`/relational/${contactId}?error=${encodeURIComponent(msg)}`);
  }
  revalidatePath("/relational");
  revalidatePath(`/relational/${contactId}`);
  redirect(`/relational/${contactId}?saved=1`);
}

export async function listUserRelationalContacts() {
  const ownerUserId = await requireOwnerUserId();
  return listRelationalContactsForUser(ownerUserId);
}

export async function getRelationalContactDetailForCurrentUser(id: string) {
  const ownerUserId = await requireOwnerUserId();
  return getRelationalContactDetailForOwner(id, ownerUserId);
}

export async function recordRelationalTouchUserAction(contactId: string, formData: FormData) {
  const ownerUserId = await requireOwnerUserId();
  const contact = await prisma.relationalContact.findFirst({
    where: { id: contactId, ownerUserId },
    select: { id: true },
  });
  if (!contact) {
    redirect("/relational?error=notfound");
  }
  const notes = String(formData.get("notes") ?? "").trim();
  if (!notes) {
    redirect(
      `/relational/${contactId}?error=${encodeURIComponent("Notes are required to log a touch (no auto voter match)")}`,
    );
  }
  const channelRaw = String(formData.get("channel") ?? "IN_PERSON");
  const typeRaw = String(formData.get("interactionType") ?? "OTHER");
  const channel = Object.values(VoterInteractionChannel).includes(channelRaw as VoterInteractionChannel)
    ? (channelRaw as VoterInteractionChannel)
    : VoterInteractionChannel.IN_PERSON;
  const interactionType = Object.values(VoterInteractionType).includes(typeRaw as VoterInteractionType)
    ? (typeRaw as VoterInteractionType)
    : VoterInteractionType.OTHER;

  try {
    await recordRelationalTouch({
      relationalContactId: contactId,
      contactedByUserId: ownerUserId,
      interactionType,
      interactionChannel: channel,
      notes,
      createSignal: false,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not log touch";
    redirect(`/relational/${contactId}?error=${encodeURIComponent(msg)}`);
  }
  revalidatePath("/relational");
  revalidatePath(`/relational/${contactId}`);
  redirect(`/relational/${contactId}?touched=1`);
}
