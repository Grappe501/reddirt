import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  ELECTION_PLAN_SESSION_COOKIE,
  getElectionPlanPassword,
  verifyElectionPlanSessionToken,
} from "@/lib/election-plan/auth/session";

export async function requireElectionPlanPage(): Promise<void> {
  const secret = getElectionPlanPassword();
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      redirect("/election-plan/login?error=config");
    }
    return;
  }
  const token = (await cookies()).get(ELECTION_PLAN_SESSION_COOKIE)?.value;
  if (!verifyElectionPlanSessionToken(token, secret)) {
    const h = await headers();
    const pathname =
      h.get("x-pathname")?.split("?")[0] ??
      h.get("x-invoke-path")?.split("?")[0] ??
      h.get("x-forwarded-uri")?.split("?")[0] ??
      "";
    if (pathname.startsWith("/election-plan") && !pathname.startsWith("/election-plan/login")) {
      redirect(`/election-plan/login?next=${encodeURIComponent(pathname)}`);
    }
    redirect("/election-plan/login");
  }
}
