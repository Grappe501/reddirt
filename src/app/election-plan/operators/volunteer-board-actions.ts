"use server";

import { revalidatePath } from "next/cache";

import { provisionVolunteerBoardUser } from "@/lib/volunteers/board/provision-volunteer";
import { buildVolunteerBoardInviteUrl } from "@/lib/volunteers/board/session";

export async function provisionVolunteerBoardAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const zip = String(formData.get("zip") ?? "").trim();
  const county = String(formData.get("county") ?? "").trim();

  const result = await provisionVolunteerBoardUser({
    email,
    name: name || null,
    phone: phone || null,
    zip: zip || null,
    county: county || null,
  });

  const inviteUrl = buildVolunteerBoardInviteUrl(result.userId, result.volunteerProfileId);
  revalidatePath("/election-plan/operators/volunteer-intake");
  revalidatePath("/admin/volunteers/intake");

  return {
    ok: true as const,
    userId: result.userId,
    volunteerProfileId: result.volunteerProfileId,
    created: result.created,
    inviteUrl,
  };
}
