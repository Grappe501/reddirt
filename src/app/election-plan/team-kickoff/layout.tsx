import type { ReactNode } from "react";

import "./cpos-kickoff.css";
import { requireElectionPlanPortalAccess } from "@/lib/election-plan/auth/portal-access";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function TeamKickoffLayout({ children }: { children: ReactNode }) {
  await requireElectionPlanPortalAccess();
  return <>{children}</>;
}
