import { redirect } from "next/navigation";

import { VOLUNTEER_OS_DEMO_TEAM_SLUG } from "@/lib/team-naming";

export default function DashboardMessagesLegacyPage() {
  redirect(`/dashboard/team/${VOLUNTEER_OS_DEMO_TEAM_SLUG}/messages`);
}
