"use server";

import { cookies } from "next/headers";
import { ACTIVE_TENANT_COOKIE, appendOnboardingTenant } from "@/lib/campaign-tenancy/campaign-tenant-store";
import type { CampaignOnboardingDraft } from "@/lib/campaign-tenancy/types";

export async function setActiveCampaignTenantAction(tenantId: string) {
  const jar = await cookies();
  jar.set(ACTIVE_TENANT_COOKIE, tenantId, { path: "/", httpOnly: false, sameSite: "lax", maxAge: 60 * 60 * 24 * 180 });
  return { ok: true as const, tenantId };
}

export async function submitCampaignOnboardingAction(draft: CampaignOnboardingDraft) {
  const slug = draft.displayName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  const id = `tenant-${slug}-${Date.now().toString(36)}`;
  const tenant = appendOnboardingTenant({
    id,
    slug,
    displayName: draft.displayName.trim().slice(0, 120),
    archetype: draft.archetype,
    electionType: draft.electionType,
    geography: draft.geography,
    timelineStart: draft.timelineStart,
    timelineEnd: draft.timelineEnd,
    staffSizeBand: draft.staffSizeBand,
    budgetLevel: draft.budgetLevel,
    settings: {
      priorities: draft.priorities,
      fieldGoals: draft.fieldGoals,
      communicationGoals: draft.communicationGoals,
      complianceNeeds: draft.complianceNeeds,
      defaultReviewMonth: null,
    },
    branding: {
      logoUrl: null,
      primaryColor: draft.primaryColor,
      accentColor: "#c9a227",
      domainScaffold: `${slug}.example-campaign-os.net`,
    },
    flags: {
      reimbursementPortal: draft.archetype === "candidate_campaign" || draft.archetype === "pac",
      eventIntakePortal: true,
      volunteerPortal: true,
      coalitionPortal: draft.archetype === "advocacy_org" || draft.archetype === "county_party",
      hotWashIntelligence: true,
      financeIntelligenceV2: draft.archetype !== "ballot_issue",
      strategicIntelligence: true,
    },
  });
  const jar = await cookies();
  jar.set(ACTIVE_TENANT_COOKIE, tenant.id, { path: "/", httpOnly: false, sameSite: "lax", maxAge: 60 * 60 * 24 * 180 });
  return { ok: true as const, tenantId: tenant.id, slug: tenant.slug };
}
