import type { ReactNode } from "react";
import { headers } from "next/headers";
import { AdminBoardShell } from "@/components/admin/AdminBoardShell";
import { KellyCalendarCockpitChrome } from "@/components/admin/kelly-calendar-cockpit/KellyCalendarCockpitChrome";
import { IntelligenceLaunchBoardShell } from "@/components/admin/intelligence/IntelligenceLaunchBoardShell";
import { requireAdminPage } from "@/lib/admin/require-admin";
import { loadDashboardNavigationBundle } from "@/lib/dashboard-orchestration/load-dashboard-navigation-bundle";
import { AgentObservationTracker } from "@/components/agents/AgentObservationTracker";
import { resolveActiveCampaignTenant } from "@/lib/campaign-tenancy/resolve-active-tenant";
import { isIntelligenceOppositionDebateLaunchMode } from "@/lib/intelligence/intelligenceLaunchMode";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 26;

export default async function AdminBoardLayout({ children }: { children: ReactNode }) {
  await requireAdminPage();
  const path = (await headers()).get("x-pathname") ?? "";
  if (path.startsWith("/admin/calendar-command-center/kelly")) {
    return <KellyCalendarCockpitChrome>{children}</KellyCalendarCockpitChrome>;
  }

  const launchMode = isIntelligenceOppositionDebateLaunchMode();
  if (launchMode && path.startsWith("/admin/intelligence")) {
    return <IntelligenceLaunchBoardShell currentPathname={path}>{children}</IntelligenceLaunchBoardShell>;
  }

  const [navBundle, tenantCtx] = await Promise.all([
    loadDashboardNavigationBundle("2026-03", {
      pathname: path || "/admin",
      surface: "command_center",
    }),
    launchMode ? Promise.resolve(null) : resolveActiveCampaignTenant(),
  ]);
  const tenant = tenantCtx ?? {
    tenantId: "kelly-sos-2026",
    available: [],
    branding: null,
  };
  return (
    <AgentObservationTracker role="operator" pathname={path || "/admin"} period={navBundle.period}>
      <AdminBoardShell
        campaignOsNavGroups={navBundle.navGroups}
        campaignOsNavBadges={navBundle.navBadges}
        activeMonth={navBundle.period}
        currentPathname={path || "/admin"}
        tenants={tenant.available}
        activeTenantId={tenant.tenantId}
        tenantBranding={tenant.branding}
        oppositionDebateLaunchMode={launchMode}
      >
        {children}
      </AdminBoardShell>
    </AgentObservationTracker>
  );
}
