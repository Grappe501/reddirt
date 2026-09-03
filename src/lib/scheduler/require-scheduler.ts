import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { isLocalAdminHost } from "@/lib/admin/local-admin-host";
import {
  SCHEDULER_SESSION_COOKIE,
  isSchedulerConfigured,
  schedulerSessionSecret,
  verifySchedulerSessionToken,
} from "@/lib/scheduler/session";

export type SchedulerActor = { email: string };

export async function requireSchedulerPage(): Promise<SchedulerActor> {
  if (await isLocalAdminHost()) {
    return { email: getLocalActorEmail() };
  }
  if (!isSchedulerConfigured()) {
    redirect("/scheduler/login?error=config");
  }
  const token = (await cookies()).get(SCHEDULER_SESSION_COOKIE)?.value;
  const verified = verifySchedulerSessionToken(token, schedulerSessionSecret());
  if (!verified.ok) {
    const h = await headers();
    const pathname =
      h.get("x-pathname")?.split("?")[0] ??
      h.get("x-invoke-path")?.split("?")[0] ??
      h.get("x-forwarded-uri")?.split("?")[0] ??
      "";
    if (pathname.startsWith("/scheduler") && pathname !== "/scheduler/login") {
      redirect(`/scheduler/login?next=${encodeURIComponent(pathname)}`);
    }
    redirect("/scheduler/login");
  }
  return { email: verified.email };
}

function getLocalActorEmail(): string {
  return process.env.SCHEDULER_OPERATOR_EMAIL?.trim().toLowerCase() || "local-dev@scheduler";
}
