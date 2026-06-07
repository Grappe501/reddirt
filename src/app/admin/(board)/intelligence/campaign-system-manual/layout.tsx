import type { ReactNode } from "react";
import { buildCampaignSystemNav } from "@/lib/campaign-strategy/campaign-system-nav";
import { CampaignSystemManualExperience } from "@/components/admin/intelligence/campaign-system/CampaignSystemManualExperience";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function CampaignSystemManualLayout({ children }: { children: ReactNode }) {
  let nav: Awaited<ReturnType<typeof buildCampaignSystemNav>> = [];
  try {
    nav = await buildCampaignSystemNav();
  } catch (error) {
    console.error("[campaign-system-manual] nav discovery failed (corpus may be pruned on Netlify)", error);
  }
  return <CampaignSystemManualExperience nav={nav}>{children}</CampaignSystemManualExperience>;
}
