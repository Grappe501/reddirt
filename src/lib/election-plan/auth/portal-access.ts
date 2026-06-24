import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { ELECTION_PLAN_SESSION_COOKIE } from "@/lib/election-plan/auth/constants";
import {
  getElectionPlanPassword,
  verifyElectionPlanSessionToken,
} from "@/lib/election-plan/auth/session";
import { VOLUNTEER_SESSION_COOKIE } from "@/lib/volunteers/auth/constants";
import {
  getVolunteerHubPassword,
  verifyVolunteerSessionToken,
} from "@/lib/volunteers/auth/session";
import { canAccessVolunteerIntakeOps, getVolunteerLeaderBySlug, canAccessCommsCommand, canAccessVoterRegistrationCommand } from "@/lib/volunteers/leader-roster";

export type PortalAuthMode = "election-plan" | "volunteer-leader" | "dev-open";

export function isLeaderWorkbenchPath(pathname: string): boolean {
  const path = pathname.split("?")[0]?.replace(/\/$/, "") ?? "";
  return path.startsWith("/election-plan/operators/leaders");
}

export function isVolunteerIntakeOpsPath(pathname: string): boolean {
  const path = pathname.split("?")[0]?.replace(/\/$/, "") ?? "";
  return path === "/election-plan/operators/volunteer-intake";
}

export function isCommsCommandOpsPath(pathname: string): boolean {
  const path = pathname.split("?")[0]?.replace(/\/$/, "") ?? "";
  return path === "/election-plan/operators/comms-command";
}

export function isVoterRegistrationOpsPath(pathname: string): boolean {
  const path = pathname.split("?")[0]?.replace(/\/$/, "") ?? "";
  return path === "/election-plan/operators/voter-registration";
}

export function isLeaderWorkbenchSignInPath(pathname: string): boolean {
  const path = pathname.split("?")[0]?.replace(/\/$/, "") ?? "";
  return path === "/election-plan/operators/leaders/sign-in";
}

async function currentPathname(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-pathname")?.split("?")[0] ??
    h.get("x-invoke-path")?.split("?")[0] ??
    h.get("x-forwarded-uri")?.split("?")[0] ??
    "/election-plan"
  );
}

/** Election Plan password session OR volunteer-leader session on leader workbench routes only. */
export async function requireElectionPlanPortalAccess(): Promise<PortalAuthMode> {
  const pathname = await currentPathname();
  const epSecret = getElectionPlanPassword();
  const volSecret = getVolunteerHubPassword();
  const jar = await cookies();
  const leaderZone = isLeaderWorkbenchPath(pathname);
  const leaderSignIn = isLeaderWorkbenchSignInPath(pathname);
  const volunteerIntakeOps = isVolunteerIntakeOpsPath(pathname);
  const commsCommandOps = isCommsCommandOpsPath(pathname);
  const voterRegistrationOps = isVoterRegistrationOpsPath(pathname);
  const operatorDashboard = volunteerIntakeOps || commsCommandOps || voterRegistrationOps;

  if (epSecret) {
    const epToken = jar.get(ELECTION_PLAN_SESSION_COOKIE)?.value;
    if (verifyElectionPlanSessionToken(epToken, epSecret)) {
      return "election-plan";
    }
  }

  if ((leaderZone || operatorDashboard) && !leaderSignIn && volSecret) {
    const volToken = jar.get(VOLUNTEER_SESSION_COOKIE)?.value;
    const volPayload = verifyVolunteerSessionToken(volToken, volSecret);
    if (volPayload) {
      if (leaderZone) return "volunteer-leader";
      const leader = getVolunteerLeaderBySlug(volPayload.leaderSlug);
      if (leader && volunteerIntakeOps && canAccessVolunteerIntakeOps(leader)) return "volunteer-leader";
      if (leader && commsCommandOps && canAccessCommsCommand(leader)) return "volunteer-leader";
      if (leader && voterRegistrationOps && canAccessVoterRegistrationCommand(leader)) return "volunteer-leader";
    }
    redirect(`/election-plan/operators/leaders/sign-in?next=${encodeURIComponent(pathname)}`);
  }

  if (operatorDashboard && process.env.NODE_ENV !== "production" && !volSecret && !epSecret) {
    return "dev-open";
  }

  if (leaderSignIn) {
    return epSecret || volSecret ? "dev-open" : "dev-open";
  }

  if (process.env.NODE_ENV !== "production" && !epSecret && !volSecret) {
    return "dev-open";
  }

  if (leaderZone && process.env.NODE_ENV !== "production" && !volSecret) {
    return "dev-open";
  }

  if (!epSecret) {
    if (process.env.NODE_ENV === "production") {
      redirect("/election-plan/login?error=config");
    }
    return "dev-open";
  }

  if (pathname.startsWith("/election-plan") && !pathname.startsWith("/election-plan/login")) {
    redirect(`/election-plan/login?next=${encodeURIComponent(pathname)}`);
  }
  redirect("/election-plan/login");
}
