/** Edge-safe path helpers — no session/crypto/leader-roster imports (middleware only). */

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

export function isEventsCommandOpsPath(pathname: string): boolean {
  const path = pathname.split("?")[0]?.replace(/\/$/, "") ?? "";
  return path === "/election-plan/operators/events-command";
}

export function isCoalitionCommandOpsPath(pathname: string): boolean {
  const path = pathname.split("?")[0]?.replace(/\/$/, "") ?? "";
  return path === "/election-plan/operators/coalition-command";
}

export function isLeaderDashboardOpsPath(pathname: string): boolean {
  const path = pathname.split("?")[0]?.replace(/\/$/, "") ?? "";
  return path === "/election-plan/operators/leader-dashboard";
}

export function isLaneCoverageOpsPath(pathname: string): boolean {
  const path = pathname.split("?")[0]?.replace(/\/$/, "") ?? "";
  return path === "/election-plan/operators/lane-coverage";
}

export function isGrassrootsFundraisingSettlementOpsPath(pathname: string): boolean {
  const path = pathname.split("?")[0]?.replace(/\/$/, "") ?? "";
  return path === "/election-plan/operators/grassroots-fundraising-settlement";
}

export function isLeaderWorkbenchSignInPath(pathname: string): boolean {
  const path = pathname.split("?")[0]?.replace(/\/$/, "") ?? "";
  return path === "/election-plan/operators/leaders/sign-in";
}
