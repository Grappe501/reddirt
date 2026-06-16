import Link from "next/link";
import type { ReactNode } from "react";
import { adminLogoutAction } from "@/app/admin/actions";
import { CampaignPaidForBar } from "@/components/layout/CampaignPaidForBar";
import { getCountyWorkbenchPortalUrl } from "@/lib/county/county-workbench-portal-url";
import { CampaignOsNavRail } from "@/components/admin/navigation/CampaignOsNavRail";
import { AdminPrimaryNav } from "@/components/admin/navigation/AdminPrimaryNav";
import { GlobalAiCommandPalette } from "@/components/admin/navigation/GlobalAiCommandPalette";
import { isAskKellyUiEnabled } from "@/lib/feature-flags/ask-kelly-ui";
import {
  CAMPAIGN_MANAGER_WORKBENCH_EYEBROW,
  CAMPAIGN_MANAGER_WORKBENCH_HEADLINE,
  CAMPAIGN_MANAGER_WORKBENCH_NAME,
  CAMPAIGN_MANAGER_WORKBENCH_TAGLINE,
} from "@/lib/admin/campaign-manager-workbench-labels";
import { OperatorContextProvider } from "@/components/admin/navigation/OperatorContextProvider";
import type { CampaignOsNavGroup } from "@/lib/dashboard-orchestration/campaign-os-nav-config";
import { KellySingleCampaignBadge } from "@/components/admin/campaign-tenancy/KellySingleCampaignBadge";
import { GlobalCampaignSwitcher } from "@/components/admin/campaign-tenancy/GlobalCampaignSwitcher";
import { CampaignBrandingStyles } from "@/components/admin/campaign-tenancy/CampaignBrandingStyles";
import type { CampaignBranding, CampaignTenant } from "@/lib/campaign-tenancy/types";
import { showDevTenancyUi } from "@/lib/campaign-tenancy/single-campaign-mode";

const siteLinks: { href: string; label: string }[] = [
  { href: "/admin/content", label: "Overview" },
  { href: "/admin/homepage", label: "Homepage" },
  { href: "/admin/pages", label: "Page copy" },
  { href: "/admin/stories", label: "Stories" },
  { href: "/admin/editorial", label: "Editorial" },
  { href: "/admin/explainers", label: "Explainers" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/owned-media", label: "Owned media" },
  { href: "/admin/counties", label: "Counties" },
  { href: "/admin/county-intelligence", label: "County intel" },
  { href: "/admin/settings", label: "Settings" },
];

const legacyOpsLinks: { href: string; label: string }[] = [
  { href: "/admin/workbench", label: "Campaign workbench (UWR)" },
  { href: "/admin/calendar-command-center", label: "Legacy calendar command center" },
  { href: "/admin/travel-ledger", label: "Travel ledger (legacy)" },
  { href: "/admin/orchestrator", label: "Orchestrator hub" },
  { href: "/admin/inbox", label: "Inbox" },
];

export function AdminBoardShell({
  children,
  campaignOsNavGroups,
  campaignOsNavBadges = {},
  activeMonth = "2026-03",
  currentPathname = "/admin",
  tenants = [],
  activeTenantId = "kelly-sos-2026",
  tenantBranding,
  oppositionDebateLaunchMode = false,
}: {
  children: ReactNode;
  campaignOsNavGroups?: CampaignOsNavGroup[];
  campaignOsNavBadges?: Record<string, number>;
  activeMonth?: string;
  currentPathname?: string;
  tenants?: CampaignTenant[];
  activeTenantId?: string;
  tenantBranding?: CampaignBranding | null;
  oppositionDebateLaunchMode?: boolean;
}) {
  const countyPortal = getCountyWorkbenchPortalUrl();
  const showCampaignOs = Boolean(campaignOsNavGroups?.length);
  const hideLegacyNav = oppositionDebateLaunchMode;
  const showAskKellyUi = isAskKellyUiEnabled();

  return (
    <OperatorContextProvider defaultMonth={activeMonth}>
      {tenantBranding ? (
        <CampaignBrandingStyles primaryColor={tenantBranding.primaryColor} accentColor={tenantBranding.accentColor} />
      ) : null}
      <div className="flex min-h-screen bg-transparent text-kelly-text">
        <aside className="flex w-[min(100%,300px)] flex-col border-r border-[var(--border-on-navy)] bg-kelly-text text-kelly-inverse">
          <div className="border-b border-[var(--border-on-navy)] px-5 py-6">
            <p className="os-eyebrow-inverse tracking-[0.28em]">
              {oppositionDebateLaunchMode ? "Debate week" : CAMPAIGN_MANAGER_WORKBENCH_EYEBROW}
            </p>
            <p className="mt-2 font-heading text-lg font-bold leading-tight text-kelly-inverse">
              {oppositionDebateLaunchMode ? "Opposition & debate intelligence" : CAMPAIGN_MANAGER_WORKBENCH_HEADLINE}
            </p>
            <p className="mt-1 font-heading text-sm font-semibold text-kelly-gold/90">
              {oppositionDebateLaunchMode ? null : CAMPAIGN_MANAGER_WORKBENCH_NAME}
            </p>
            <p className="mt-2 font-body text-xs leading-relaxed text-kelly-inverse-soft">
              {oppositionDebateLaunchMode
                ? "Internal workbench — claims require human review before any public use."
                : CAMPAIGN_MANAGER_WORKBENCH_TAGLINE}
            </p>
          </div>
          <nav className="flex flex-1 flex-col gap-3 overflow-y-auto px-3 py-4" aria-label="Campaign OS">
            <KellySingleCampaignBadge />
            {showDevTenancyUi() && tenants.length > 1 ? (
              <details className="mx-3 text-[10px] text-kelly-inverse-muted">
                <summary className="cursor-pointer font-bold uppercase tracking-wider">Developer · tenancy</summary>
                <GlobalCampaignSwitcher tenants={tenants} activeTenantId={activeTenantId} branding={tenantBranding} />
              </details>
            ) : null}
            {showCampaignOs ? (
              <>
                <AdminPrimaryNav pathname={currentPathname} />
                <CampaignOsNavRail groups={campaignOsNavGroups!} badges={campaignOsNavBadges} />
              </>
            ) : null}
            {!hideLegacyNav ? (
              <>
                <div>
                  <p className="os-nav-group-label">Legacy & site</p>
                  <div className="flex flex-col gap-0.5">
                    {legacyOpsLinks.map((l) => (
                      <Link key={l.href} href={l.href} className="os-nav-link">
                        {l.label}
                      </Link>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="os-nav-group-label">Site content</p>
                  <div className="flex flex-col gap-0.5">
                    {siteLinks.map((l) => (
                      <Link key={l.href} href={l.href} className="os-nav-link py-2.5">
                        {l.label}
                      </Link>
                    ))}
                  </div>
                  {countyPortal ? (
                    <a
                      href={`${countyPortal}/counties`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 block rounded-md px-3 py-2.5 font-body text-sm font-medium text-kelly-inverse transition hover:bg-kelly-page/10"
                    >
                      County portal ↗
                    </a>
                  ) : null}
                </div>
              </>
            ) : null}
          </nav>
          <div className="border-t border-[var(--border-on-navy)] p-4">
            <form action={adminLogoutAction}>
              <button
                type="submit"
                className="w-full rounded-md border border-[var(--border-on-navy)] px-3 py-2 font-body text-xs font-semibold uppercase tracking-wider text-kelly-inverse transition hover:bg-white/10"
              >
                Sign out
              </button>
            </form>
            {showAskKellyUi ? (
              <p className="mt-3 text-center font-body text-[10px] text-kelly-inverse-muted">
                Press <kbd className="rounded border border-[var(--border-on-navy)] px-1 text-kelly-inverse-soft">Ctrl+K</kbd> for command palette
              </p>
            ) : null}
          </div>
        </aside>
        <div className="flex min-h-screen flex-1 flex-col os-admin-canvas">
          <main className="flex-1 px-6 py-8 lg:px-10 lg:py-10">{children}</main>
          <div className="border-t border-kelly-border bg-kelly-wash px-6 py-3 lg:px-10">
            <CampaignPaidForBar variant="light" />
          </div>
        </div>
      </div>
      {showAskKellyUi ? (
        <GlobalAiCommandPalette role="operator" pathname={currentPathname} period={activeMonth} />
      ) : null}
    </OperatorContextProvider>
  );
}
