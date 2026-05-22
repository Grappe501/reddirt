import { cookies } from "next/headers";
import {
  ACTIVE_TENANT_COOKIE,
  DEFAULT_TENANT_ID,
  getTenantContext,
  listTenantsForUser,
} from "./campaign-tenant-store";
import { showDevTenancyUi, KELLY_SOS_TENANT_ID } from "./single-campaign-mode";

export async function resolveActiveCampaignTenant(userId = "admin") {
  const jar = await cookies();
  const available = listTenantsForUser(userId);
  if (!showDevTenancyUi()) {
    const ctx = getTenantContext(KELLY_SOS_TENANT_ID);
    if (!ctx) throw new Error("Kelly SOS tenant missing from store");
    return { tenantId: KELLY_SOS_TENANT_ID, ...ctx, available };
  }
  const fromCookie = jar.get(ACTIVE_TENANT_COOKIE)?.value?.trim();
  const tenantId =
    fromCookie && available.some((t) => t.id === fromCookie) ? fromCookie : available[0]?.id ?? DEFAULT_TENANT_ID;
  const ctx = getTenantContext(tenantId);
  if (!ctx) {
    const fallback = getTenantContext(DEFAULT_TENANT_ID);
    if (!fallback) throw new Error("Campaign tenancy store missing default tenant");
    return { tenantId: DEFAULT_TENANT_ID, ...fallback, available };
  }
  return { tenantId, ...ctx, available };
}

export function defaultReviewMonthForTenant(tenantId: string): string {
  const ctx = getTenantContext(tenantId);
  return ctx?.settings?.defaultReviewMonth ?? "2026-03";
}
