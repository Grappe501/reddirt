"use server";

import { revalidatePath } from "next/cache";

const REVAL = "/admin/calendar-command-center/kelly";

export async function weekendRoutePlanStub(formData: FormData): Promise<void> {
  void String(formData.get("planId") ?? "");
  void String(formData.get("intent") ?? "");
  revalidatePath(REVAL);
}
