import { redirect } from "next/navigation";

import { VOLUNTEER_OS_DEMO_TEAM_SLUG } from "@/lib/team-naming";

export default function DashboardMetricsLegacyPage() {
  redirect(`/dashboard/team/${VOLUNTEER_OS_DEMO_TEAM_SLUG}/metrics`);
}
