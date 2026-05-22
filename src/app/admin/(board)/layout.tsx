import type { ReactNode } from "react";
import { headers } from "next/headers";
import { AdminBoardShell } from "@/components/admin/AdminBoardShell";
import { KellyCalendarCockpitChrome } from "@/components/admin/kelly-calendar-cockpit/KellyCalendarCockpitChrome";
import { requireAdminPage } from "@/lib/admin/require-admin";
import { loadDashboardNavigationBundle } from "@/lib/dashboard-orchestration/load-dashboard-navigation-bundle";
import { AgentObservationTracker } from "@/components/agents/AgentObservationTracker";

export const dynamic = "force-dynamic";

export default async function AdminBoardLayout({ children }: { children: ReactNode }) {
  await requireAdminPage();
  const path = (await headers()).get("x-pathname") ?? "";
  if (path.startsWith("/admin/calendar-command-center/kelly")) {
    return <KellyCalendarCockpitChrome>{children}</KellyCalendarCockpitChrome>;
  }
  const navBundle = await loadDashboardNavigationBundle("2026-03", {
    pathname: path || "/admin",
    surface: "command_center",
  });
  return (
    <AgentObservationTracker role="operator" pathname={path || "/admin"} period={navBundle.period}>
      <AdminBoardShell
        campaignOsNavGroups={navBundle.navGroups}
        campaignOsNavBadges={navBundle.navBadges}
        activeMonth={navBundle.period}
        currentPathname={path || "/admin"}
      >
        {children}
      </AdminBoardShell>
    </AgentObservationTracker>
  );
}
