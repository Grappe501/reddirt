import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  ELECTION_PLAN_SESSION_COOKIE,
  isElectionPlanAuthBypassed,
} from "@/lib/election-plan/auth/constants";
import {
  isCoalitionCommandOpsPath,
  isCommsCommandOpsPath,
  isEventsCommandOpsPath,
  isGrassrootsFundraisingSettlementOpsPath,
  isLaneCoverageOpsPath,
  isLeaderDashboardOpsPath,
  isLeaderWorkbenchPath,
  isLeaderWorkbenchSignInPath,
  isVolunteerIntakeOpsPath,
  isVoterRegistrationOpsPath,
} from "@/lib/election-plan/auth/portal-paths";
import {
  getElectionPlanPassword,
  verifyElectionPlanSessionToken,
} from "@/lib/election-plan/auth/session";
import { VOLUNTEER_SESSION_COOKIE } from "@/lib/volunteers/auth/constants";
import {
  getVolunteerHubPassword,
  verifyVolunteerSessionToken,
} from "@/lib/volunteers/auth/session";
import { canAccessVolunteerIntakeOps, getVolunteerLeaderBySlug, canAccessCommsCommand, canAccessVoterRegistrationCommand, canAccessEventsCommand, canAccessCoalitionCommand, canAccessLaneCoverageCommand, canAccessGrassrootsFundraisingSettlement } from "@/lib/volunteers/leader-roster";

export type PortalAuthMode = "election-plan" | "volunteer-leader" | "dev-open";

export {
  isCoalitionCommandOpsPath,
  isCommsCommandOpsPath,
  isEventsCommandOpsPath,
  isGrassrootsFundraisingSettlementOpsPath,
  isLaneCoverageOpsPath,
  isLeaderDashboardOpsPath,
  isLeaderWorkbenchPath,
  isLeaderWorkbenchSignInPath,
  isVolunteerIntakeOpsPath,
  isVoterRegistrationOpsPath,
} from "@/lib/election-plan/auth/portal-paths";

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
  // TEMP DEMO: password gates off — flip ELECTION_PLAN_AUTH_BYPASS to restore.
  if (isElectionPlanAuthBypassed()) {
    return "dev-open";
  }

  const pathname = await currentPathname();
  const epSecret = getElectionPlanPassword();
  const volSecret = getVolunteerHubPassword();
  const jar = await cookies();
  const leaderZone = isLeaderWorkbenchPath(pathname);
  const leaderSignIn = isLeaderWorkbenchSignInPath(pathname);
  const volunteerIntakeOps = isVolunteerIntakeOpsPath(pathname);
  const commsCommandOps = isCommsCommandOpsPath(pathname);
  const voterRegistrationOps = isVoterRegistrationOpsPath(pathname);
  const eventsCommandOps = isEventsCommandOpsPath(pathname);
  const coalitionCommandOps = isCoalitionCommandOpsPath(pathname);
  const leaderDashboardOps = isLeaderDashboardOpsPath(pathname);
  const laneCoverageOps = isLaneCoverageOpsPath(pathname);
  const grassrootsSettlementOps = isGrassrootsFundraisingSettlementOpsPath(pathname);
  const operatorDashboard =
    volunteerIntakeOps ||
    commsCommandOps ||
    voterRegistrationOps ||
    eventsCommandOps ||
    coalitionCommandOps ||
    leaderDashboardOps ||
    laneCoverageOps ||
    grassrootsSettlementOps;

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
      if (leader && eventsCommandOps && canAccessEventsCommand(leader)) return "volunteer-leader";
      if (leader && coalitionCommandOps && canAccessCoalitionCommand(leader)) return "volunteer-leader";
      if (leader && leaderDashboardOps) return "volunteer-leader";
      if (leader && laneCoverageOps && canAccessLaneCoverageCommand(leader)) return "volunteer-leader";
      if (leader && grassrootsSettlementOps && canAccessGrassrootsFundraisingSettlement(leader)) return "volunteer-leader";
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
