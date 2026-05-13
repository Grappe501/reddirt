"use server";

import { revalidatePath } from "next/cache";

const REVAL = "/admin/calendar-command-center/fairs";

export async function fairStubAddTentative(formData: FormData): Promise<void> {
  void String(formData.get("fairId") ?? "");
  revalidatePath(REVAL);
}

export async function fairStubSendLocal(formData: FormData): Promise<void> {
  void String(formData.get("fairId") ?? "");
  revalidatePath(REVAL);
}

export async function fairStubNeedsCall(formData: FormData): Promise<void> {
  void String(formData.get("fairId") ?? "");
  revalidatePath(REVAL);
}

export async function fairStubMarkVerified(formData: FormData): Promise<void> {
  void String(formData.get("fairId") ?? "");
  revalidatePath(REVAL);
}
