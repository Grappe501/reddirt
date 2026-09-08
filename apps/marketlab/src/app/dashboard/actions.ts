"use server";

import { revalidatePath } from "next/cache";
import { requireMarketLabUser } from "@/lib/auth/server";
import { ensureDefaultCompetition, DEFAULT_COMPETITION_SLUG } from "@/lib/competition/ensureDefaultCompetition";
import { joinCompetition } from "@/lib/competition/joinCompetition";

export async function joinDefaultCompetition() {
  const user = await requireMarketLabUser();
  await ensureDefaultCompetition();
  await joinCompetition({
    authSubject: user.id,
    email: user.email ?? null,
    displayName: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
    competitionSlug: DEFAULT_COMPETITION_SLUG,
  });
  revalidatePath("/dashboard");
}
