import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { isElectionPlanAuthBypassed } from "@/lib/election-plan/auth/constants";
import {
  VOLUNTEER_SESSION_COOKIE,
  getVolunteerHubPassword,
  verifyVolunteerSessionToken,
} from "@/lib/volunteers/auth/session";

export async function requireVolunteerHubPage(): Promise<{ leaderSlug: string; initials: string }> {
  // TEMP DEMO: password gates off — flip ELECTION_PLAN_AUTH_BYPASS to restore.
  if (isElectionPlanAuthBypassed()) {
    return { leaderSlug: "will-larue", initials: "WLA" };
  }

  const secret = getVolunteerHubPassword();
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      redirect("/election-plan/operators/leaders/sign-in?error=config");
    }
    return { leaderSlug: "will-larue", initials: "WLA" };
  }

  const token = (await cookies()).get(VOLUNTEER_SESSION_COOKIE)?.value;
  const payload = verifyVolunteerSessionToken(token, secret);
  if (!payload) {
    const h = await headers();
    const pathname =
      h.get("x-pathname")?.split("?")[0] ??
      h.get("x-invoke-path")?.split("?")[0] ??
      h.get("x-forwarded-uri")?.split("?")[0] ??
      "";
    if (pathname.startsWith("/election-plan/operators/leaders")) {
      redirect(`/election-plan/operators/leaders/sign-in?next=${encodeURIComponent(pathname)}`);
    }
    redirect("/election-plan/operators/leaders/sign-in");
  }

  return { leaderSlug: payload.leaderSlug, initials: payload.initials };
}
