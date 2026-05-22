import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import type {
  CampaignBranding,
  CampaignFeatureFlags,
  CampaignMembership,
  CampaignSettings,
  CampaignTenant,
  CampaignTenancyStore,
} from "./types";

const STORE_REL = "data/campaign-tenancy/tenants.json";
export const DEFAULT_TENANT_ID = "kelly-sos-2026";
export const ACTIVE_TENANT_COOKIE = "campaign-tenant-id";

function storePath(repoRoot?: string): string {
  return path.join(repoRoot ?? process.cwd(), STORE_REL);
}

export function loadCampaignTenancyStore(repoRoot?: string): CampaignTenancyStore {
  const p = storePath(repoRoot);
  if (!existsSync(p)) {
    return { tenants: [], memberships: [], settings: [], branding: [], featureFlags: [] };
  }
  const raw = JSON.parse(readFileSync(p, "utf8")) as CampaignTenancyStore;
  return {
    tenants: raw.tenants ?? [],
    memberships: raw.memberships ?? [],
    settings: raw.settings ?? [],
    branding: raw.branding ?? [],
    featureFlags: raw.featureFlags ?? [],
  };
}

export function getTenantById(tenantId: string, repoRoot?: string): CampaignTenant | null {
  return loadCampaignTenancyStore(repoRoot).tenants.find((t) => t.id === tenantId) ?? null;
}

export function getTenantContext(tenantId: string, repoRoot?: string): {
  tenant: CampaignTenant;
  settings: CampaignSettings | null;
  branding: CampaignBranding | null;
  featureFlags: CampaignFeatureFlags | null;
  memberships: CampaignMembership[];
} | null {
  const store = loadCampaignTenancyStore(repoRoot);
  const tenant = store.tenants.find((t) => t.id === tenantId);
  if (!tenant) return null;
  return {
    tenant,
    settings: store.settings.find((s) => s.tenantId === tenantId) ?? null,
    branding: store.branding.find((b) => b.tenantId === tenantId) ?? null,
    featureFlags: store.featureFlags.find((f) => f.tenantId === tenantId) ?? null,
    memberships: store.memberships.filter((m) => m.tenantId === tenantId),
  };
}

export function listTenantsForUser(userId: string, repoRoot?: string): CampaignTenant[] {
  const store = loadCampaignTenancyStore(repoRoot);
  const ids = new Set(store.memberships.filter((m) => m.userId === userId).map((m) => m.tenantId));
  return store.tenants.filter((t) => t.isActive && ids.has(t.id));
}

export function upsertTenant(tenant: CampaignTenant, repoRoot?: string): void {
  const p = storePath(repoRoot);
  const dir = path.dirname(p);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const store = loadCampaignTenancyStore(repoRoot);
  const idx = store.tenants.findIndex((t) => t.id === tenant.id);
  if (idx >= 0) store.tenants[idx] = tenant;
  else store.tenants.push(tenant);
  writeFileSync(p, JSON.stringify(store, null, 2), "utf8");
}

export function appendOnboardingTenant(
  draft: {
    id: string;
    slug: string;
    displayName: string;
    archetype: CampaignTenant["archetype"];
    electionType: string;
    geography: string;
    timelineStart: string;
    timelineEnd: string;
    staffSizeBand: string;
    budgetLevel: string;
    settings: Omit<CampaignSettings, "tenantId">;
    branding: Omit<CampaignBranding, "tenantId">;
    flags: Omit<CampaignFeatureFlags, "tenantId">;
  },
  repoRoot?: string,
): CampaignTenant {
  const now = new Date().toISOString();
  const tenant: CampaignTenant = {
    id: draft.id,
    slug: draft.slug,
    displayName: draft.displayName,
    archetype: draft.archetype,
    electionType: draft.electionType,
    geography: draft.geography,
    timelineStart: draft.timelineStart,
    timelineEnd: draft.timelineEnd,
    staffSizeBand: draft.staffSizeBand,
    budgetLevel: draft.budgetLevel,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
  const p = storePath(repoRoot);
  const store = loadCampaignTenancyStore(repoRoot);
  store.tenants.push(tenant);
  store.settings.push({ tenantId: draft.id, ...draft.settings });
  store.branding.push({ tenantId: draft.id, ...draft.branding });
  store.featureFlags.push({ tenantId: draft.id, ...draft.flags });
  store.memberships.push({
    id: `mem-${draft.id}-admin`,
    tenantId: draft.id,
    userId: "admin",
    role: "owner",
    createdAt: now,
  });
  writeFileSync(p, JSON.stringify(store, null, 2), "utf8");
  return tenant;
}
