import { redirect } from "next/navigation";

import { tryLoadVolunteerBoardSession } from "@/lib/volunteers/board/load-volunteer-board";

export default async function VolunteersLegacyRootPage() {
  const session = await tryLoadVolunteerBoardSession();
  if (session) redirect("/volunteers/me");
  redirect("/volunteers/sign-in");
}
