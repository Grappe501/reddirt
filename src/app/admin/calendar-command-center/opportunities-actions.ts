"use server";

import { revalidatePath } from "next/cache";

const REVAL = "/admin/calendar-command-center/opportunities";

/** Stub: wire to WorkflowIntake / Prisma later — revalidates staff board only. */
export async function opportunityBoardStub(formData: FormData): Promise<void> {
  void String(formData.get("opportunityId") ?? "");
  void String(formData.get("intent") ?? "");
  revalidatePath(REVAL);
}
