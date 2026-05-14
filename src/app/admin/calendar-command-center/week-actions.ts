"use server";

import { revalidatePath } from "next/cache";

const REVAL = "/admin/calendar-command-center/week";

export async function weekPlanStub(formData: FormData): Promise<void> {
  void String(formData.get("weekMondayYmd") ?? "");
  void String(formData.get("weekIntent") ?? "");
  revalidatePath(REVAL);
}
