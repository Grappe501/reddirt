"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setActiveCampaignTenantAction } from "@/app/admin/campaign-tenancy/actions";
import type { CampaignBranding, CampaignTenant } from "@/lib/campaign-tenancy/types";

export function GlobalCampaignSwitcher({
  tenants,
  activeTenantId,
  branding,
}: {
  tenants: CampaignTenant[];
  activeTenantId: string;
  branding?: CampaignBranding | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const active = tenants.find((t) => t.id === activeTenantId) ?? tenants[0];

  return (
    <div className="mx-3 mb-3 rounded-xl border border-kelly-page/15 bg-kelly-page/5 p-3">
      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-kelly-page/45">Active campaign</p>
      <div className="mt-2 flex items-center gap-2">
        <span
          className="h-8 w-8 shrink-0 rounded-full border border-kelly-page/20"
          style={{ background: branding?.primaryColor ?? "#1a365d" }}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-kelly-page">{active?.displayName ?? "Campaign"}</p>
          <p className="truncate text-[10px] text-kelly-page/55">{active?.geography ?? active?.archetype}</p>
        </div>
      </div>
      <select
        className="mt-2 w-full rounded-lg border border-kelly-page/20 bg-kelly-text px-2 py-1.5 text-xs text-kelly-page"
        value={activeTenantId}
        disabled={pending}
        onChange={(e) => {
          const id = e.target.value;
          start(async () => {
            await setActiveCampaignTenantAction(id);
            router.refresh();
          });
        }}
      >
        {tenants.map((t) => (
          <option key={t.id} value={t.id}>
            {t.displayName}
          </option>
        ))}
      </select>
      <p className="mt-1 text-[9px] text-kelly-page/40">AI agent uses this campaign context</p>
    </div>
  );
}
