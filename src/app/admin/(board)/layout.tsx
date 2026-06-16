import type { ReactNode } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { AdminBoardShell } from "@/components/admin/AdminBoardShell";
import { KellyCalendarCockpitChrome } from "@/components/admin/kelly-calendar-cockpit/KellyCalendarCockpitChrome";
import { IntelligenceLaunchBoardShell } from "@/components/admin/intelligence/IntelligenceLaunchBoardShell";
import { requireAdminPage } from "@/lib/admin/require-admin";
import { CAMPAIGN_MANAGER_WORKBENCH_NAME } from "@/lib/admin/campaign-manager-workbench-labels";
import { loadDashboardNavigationBundle } from "@/lib/dashboard-orchestration/load-dashboard-navigation-bundle";
import { AgentObservationTracker } from "@/components/agents/AgentObservationTracker";
import { resolveActiveCampaignTenant } from "@/lib/campaign-tenancy/resolve-active-tenant";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 26;

export const metadata: Metadata = {
  title: {
    default: CAMPAIGN_MANAGER_WORKBENCH_NAME,
    template: `%s · ${CAMPAIGN_MANAGER_WORKBENCH_NAME}`,
  },
  robots: { index: false, follow: false },
};

export default async function AdminBoardLayout({ children }: { children: ReactNode }) {
  await requireAdminPage();
  const h = await headers();
  const path =
    h.get("x-pathname") ??
    h.get("x-invoke-path")?.split("?")[0] ??
    h.get("x-forwarded-uri")?.split("?")[0] ??
    "";
  if (path.startsWith("/admin/calendar-command-center/kelly")) {
    return <KellyCalendarCockpitChrome>{children}</KellyCalendarCockpitChrome>;
  }

  const launchMode = process.env.NEXT_PUBLIC_INTELLIGENCE_LAUNCH_MODE === "opposition_debate";
  /** Debate launch: always minimal shell — x-pathname is often missing on Netlify and would load the heavy Campaign OS shell. */
  if (launchMode) {
    const shellPath = path.startsWith("/admin") ? path : "/admin/intelligence";
    return (
      <IntelligenceLaunchBoardShell currentPathname={shellPath}>{children}</IntelligenceLaunchBoardShell>
    );
  }

  const [navBundle, tenantCtx] = await Promise.all([
    loadDashboardNavigationBundle("2026-03", {
      pathname: path || "/admin",
      surface: "command_center",
    }),
    resolveActiveCampaignTenant(),
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
